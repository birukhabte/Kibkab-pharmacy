package permissions

import (
	"net/http"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func HasPermission(c *gin.Context) {
	permission := c.Param("permission")
	if permission == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "permission is required"})
		return
	}

	Irole_id, ok := c.Get("role_id")
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to fetch employee role"})
		return
	}

	role_id, ok := (Irole_id).(uuid.UUID)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to assert employee role"})
		return
	}
	var count int64
	err := db.DB.
		Table("role_permissions").
		Joins("JOIN permissions ON role_permissions.permission_id = permissions.id").
		Where("role_permissions.role_id = ? AND permissions.name = ?", role_id, permission).
		Count(&count).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error", "details": err.Error()})
		return
	}

	if count == 0 {
		c.JSON(http.StatusForbidden, gin.H{"error": "permission denied"})
		return
	}

	// Proceed if permission exists
	c.JSON(http.StatusOK, gin.H{"message": "permission granted"})

}
