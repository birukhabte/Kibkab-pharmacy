package roles

import (
	"log"
	"net/http"
	"time"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
	"github.com/go-sql-driver/mysql"
	"github.com/google/uuid"
)

func CreateRole(c *gin.Context) {
	var body struct {
		Name          string      `json:"name" binding:"required"`
		Description   string      `json:"description"`
		Commission    float64     `json:"commission"`
		Threshold     float64     `json:"threshold"`
		PermissionIDs []uuid.UUID `json:"permission_ids"` // accept list of permission UUIDs
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		log.Println(err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
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

	// Fetch permissions by ID
	var permissions []models.Permission
	if len(body.PermissionIDs) > 0 {
		if err := db.DB.Where("id IN ?", body.PermissionIDs).Find(&permissions).Error; err != nil {
			log.Println("CreateRole: failed to load permissions:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch permissions"})
			return
		}
	}

	role := models.Role{
		ID:          uuid.New(),
		Name:        body.Name,
		Description: &body.Description,
		Commission:  body.Commission,
		Threshold:   body.Threshold,
		CreatedAt:   time.Now(),
		Permissions: permissions, // link them directly
	}

	if err := db.DB.Create(&role).Error; err != nil {
		if mysqlErr, ok := err.(*mysql.MySQLError); ok && mysqlErr.Number == 1062 {
			c.JSON(http.StatusConflict, gin.H{"error": "role already exists"})
			return
		}
		log.Printf("CreateRole: failed to create role: %s", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create role"})
		return
	}

	c.IndentedJSON(http.StatusCreated, role)
}
