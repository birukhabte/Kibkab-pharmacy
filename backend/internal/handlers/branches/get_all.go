package branches

import (
	"log"
	"net/http"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
)

// GetAllBranches handles the GET request to retrieve all branches from the database.
// It queries the `branches` table and returns a JSON response containing all branch records.
// In case of an error during the query, it responds with a 500 status code and an error message.
func GetAllBranches(c *gin.Context) {
	var branches []models.Branch

	if err := db.DB.Find(&branches).Error; err != nil {
		log.Printf("GetAllBranches: Failed to fetch branches: %s", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch branches"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"branches": branches,
	})
}

