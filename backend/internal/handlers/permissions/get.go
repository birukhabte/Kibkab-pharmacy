package permissions

import (
	"net/http"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
)

func GetAllPermission(c *gin.Context) {
	var permission []models.Permission

	err := db.DB.Find(&permission).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch permission"})
		return
	}
	c.JSON(http.StatusOK, permission)

}
