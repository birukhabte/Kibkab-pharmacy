package branches

import (
	"errors"
	"log"
	"net/http"
	"reflect"
	"time"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/internal/utils"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// UpdateBranch handles the PUT /branches/:id request.
// It updates an existing branch's name, location, and phone based on the JSON payload.
// Returns the updated branch if successful, or appropriate errors otherwise.
func UpdateBranch(c *gin.Context) {
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

	// Bind request body
	var body struct {
		Name     string `json:"name" binding:"required"`
		Location string `json:"location" binding:"required"`
		Phone    string `json:"phone" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	// check for phone number validity
	if body.Phone != "" && !utils.IsPhoneValid(body.Phone) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid phone number format"})
		return
	}

	// Find the branch
	var branch models.Branch
	if err := db.DB.First(&branch, "id = ?", branchID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "branch not found"})
			return
		}
		log.Printf("UpdateBranch: Failed to fetch branches: %s", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch branch"})
		return
	}


	original := branch
	// Update fields
	branch.Name = body.Name
	branch.Location = body.Location
	branch.Phone = body.Phone
	// Check if all fields are the same
	if reflect.DeepEqual(original, branch) {
		c.JSON(http.StatusOK, gin.H{"message": "no new values provided"})
		return
	}
	branch.UpdatedAt = time.Now()

	// Save the update
	if err := db.DB.Save(&branch).Error; err != nil {
		log.Printf("UpdateBranch: Failed to update branches: %s", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update branch"})
		return
	}

	// Return updated branch
	c.JSON(http.StatusOK, gin.H{
		"id":         branch.ID,
		"name":       branch.Name,
		"location":   branch.Location,
		"phone":      branch.Phone,
		"created_at": branch.CreatedAt,
		"updated_at": branch.UpdatedAt,
	})
}

