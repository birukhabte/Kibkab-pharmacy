package branches

import (
	"log"
	"net/http"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// DeleteBranch handles the DELETE /branches/:id request.
// It deletes a branch by ID. Returns a success message or 404 if not found.
func DeleteBranch(c *gin.Context) {
	// Get the branch ID from the path
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "branch ID is required"})
		return
	}

	// Validate UUID format
	branchID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid branch ID format"})
		return
	}

	// Try to delete the branch
	result := db.DB.Delete(&models.Branch{}, "id = ?", branchID)

	// Check if any row was affected
	if result.Error != nil {
		log.Printf("DeleteBranch: failed to create branch: %s", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete branch"})
		return
	}

	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "branch not found"})
		return
	}

	// Return success message
	c.JSON(http.StatusOK, gin.H{
		"message": "Branch deleted successfully",
	})
}
