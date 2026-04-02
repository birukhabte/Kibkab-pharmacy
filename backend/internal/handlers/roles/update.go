package roles

import (
	"log"
	"net/http"
	"time"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func UpdateRole(c *gin.Context) {
	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid role ID"})
		return
	}

	var body struct {
		Name          string      `json:"name" binding:"required"`
		Description   string      `json:"description"`
		Commission    float64     `json:"commission"`
		Threshold     float64     `json:"threshold"`
		PermissionIDs []uuid.UUID `json:"permission_ids"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if body.Commission < 0 || body.Commission >= 100 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "commission percent must be between 0 and 100"})
		return
	}
	if body.Threshold < 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "commission capital must be above 0"})
		return
	}

	// Start transaction
	tx := db.DB.Begin()
	if tx.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to start transaction"})
		return
	}

	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
		}
	}()

	var role models.Role
	if err := tx.Preload("Permissions").First(&role, "id = ?", id).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusNotFound, gin.H{"error": "role not found"})
		return
	}

	role.Name = body.Name
	role.Description = &body.Description
	role.Commission = body.Commission
	role.Threshold = body.Threshold
	role.UpdatedAt = time.Now()

	// Update role basic fields
	if err := tx.Save(&role).Error; err != nil {
		tx.Rollback()
		log.Printf("UpdateRole: failed to update role: %s", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update role"})
		return
	}

	var newPermissions []models.Permission
	if len(body.PermissionIDs) > 0 {
		if err := tx.Where("id IN ?", body.PermissionIDs).Find(&newPermissions).Error; err != nil {
			tx.Rollback()
			log.Printf("UpdateRole: failed to fetch permissions: %s", err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch permissions"})
			return
		}
	} else {
		// empty permission list means remove all permissions
		newPermissions = []models.Permission{}
	}

	// Ensure all provided IDs matched real permissions
	if len(newPermissions) != len(body.PermissionIDs) {
		tx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{"error": "one or more permission_ids are invalid"})
		return
	}

	// Replace permissions association
	if err := tx.Model(&role).Association("Permissions").Replace(newPermissions); err != nil {
		tx.Rollback()
		log.Printf("UpdateRole: failed to update permissions: %s", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update role permissions"})
		return
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		log.Printf("UpdateRole: failed to commit transaction: %s", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to commit transaction"})
		return
	}

	// Reload updated role with permissions for response
	if err := db.DB.Preload("Permissions").First(&role, "id = ?", id).Error; err != nil {
		// Log error but still return success response
		log.Printf("UpdateRole: failed to reload role after update: %s", err.Error())
	}

	c.IndentedJSON(http.StatusOK, role)
}
