package branches

import (
	"log"
	"net/http"
	"time"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/internal/utils"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
	"github.com/go-sql-driver/mysql"
	"github.com/google/uuid"
)

// CreateBranch handles the POST request to create a new branch.
// It reads and validates the JSON payload, creates a new Branch record,
// and returns the created branch as a JSON response.
//
// Request Body:
//
//	{
//	  "name": "Main Branch",
//	  "location": "Addis Ababa",
//	  "phone": "+251900000000"
//	}
//
// Response (201):
//
//	{
//	  "branch": { ... }
//	}
//
// On error, returns 400 for bad request or 500 for DB failure.
func CreateBranch(c *gin.Context) {
	// Input struct for binding request body
	var body struct {
		Name     string `json:"name" binding:"required"`
		Location string `json:"location" binding:"required"`
		Phone    string `json:"phone" binding:"required"`
	}

	// Bind and validate the JSON request body
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	// check for phone number validity
	if body.Phone != "" && !utils.IsPhoneValid(body.Phone) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid phone number format"})
		return
	}

	// Construct the Branch model
	branch := models.Branch{
		ID:        uuid.New(),
		Name:      body.Name,
		Location:  body.Location,
		Phone:     body.Phone,
		CreatedAt: time.Now(),
	}

	// Save to DB
	if err := db.DB.Create(&branch).Error; err != nil {
		// Check for MySQL duplicate entry error
		if mysqlErr, ok := err.(*mysql.MySQLError); ok && mysqlErr.Number == 1062 {
			c.JSON(http.StatusConflict, gin.H{"error": "branch with that name and location already exists"})
			return
		}

		log.Printf("CreateBrach: failed to create branch: %s", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create branch"})
		return
	}

	// Return the created branch
	c.JSON(http.StatusCreated, gin.H{
		"branch": branch,
	})
}



