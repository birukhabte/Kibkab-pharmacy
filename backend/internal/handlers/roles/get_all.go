package roles

import (
	"log"
	"net/http"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
)

func GetAllRoles(c *gin.Context) {
	var roles []models.Role
	if err := db.DB.Preload("Permissions").Find(&roles).Error; err != nil {
		log.Printf("GetAllRoles: failed to fetch roles: %s", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to retrieve roles"})
		return
	}
	c.IndentedJSON(http.StatusOK, roles)
}
