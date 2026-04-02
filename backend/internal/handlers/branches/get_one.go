package branches

import (
	"errors"
	"log"
	"net/http"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// GetBranchByID handles the GET request to retrieve specific branch by ID  from the database.
// It queries the `branches` table and returns a JSON response containing the branch records.
// In case of an error during the query, it responds with a 500 status code and an error message.
func GetBranchByID(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id is not found"})
		return
	}

	// Validate UUID format
	branchID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid branch ID format"})
		return
	}

	var branch models.Branch

	// find the branch
	if err := db.DB.First(&branch, "id = ?", branchID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "branch not found"})
			return
		}
		log.Printf("GetBranchByID: Failed to fetch branch %s: %s", id, err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch branch"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"branches": branch,
	})
}
