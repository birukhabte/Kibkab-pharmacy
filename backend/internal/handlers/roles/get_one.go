package roles

import (
	"log"
	"net/http"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func GetRoleByID(c *gin.Context) {
	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid role ID"})
		return
	}

	var role models.Role
	if err := db.DB.Preload("Permissions").First(&role, "id = ?", id).Error; err != nil {
		log.Printf("GetRoleByID: failed to find role with ID %s: %s", idParam, err.Error())
		c.JSON(http.StatusNotFound, gin.H{"error": "role not found"})
		return
	}

	c.IndentedJSON(http.StatusOK, role)
}
