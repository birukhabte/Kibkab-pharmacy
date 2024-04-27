package medicines

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/internal/handlers/activity"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
	"github.com/go-sql-driver/mysql"
	"github.com/google/uuid"
)

func CreateMedicine(c *gin.Context) {
	var req struct {
		Name        string `json:"name" binding:"required"`
		Brand       string `json:"brand" binding:"required"`
		Category    string `json:"category" binding:"required"`
		Description string `json:"description" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	medicine := models.Medicine{
		ID:          uuid.New(),
		Name:        req.Name,
		Brand:       req.Brand,
		Category:    req.Category,
		Description: req.Description,
		CreatedAt:   time.Now(),
	}

	if err := db.DB.Create(&medicine).Error; err != nil {
		log.Printf("CreateMedicine: failed to create medicine: %s", err.Error())

		// Check for MySQL duplicate entry error
		if mysqlErr, ok := err.(*mysql.MySQLError); ok && mysqlErr.Number == 1062 {
			c.JSON(http.StatusConflict, gin.H{"error": "medicine with same name, brand and category exists"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create medicine"})
		return
	}

	IemployeeID, ok := c.Get("employee_id")
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to get employee id"})
		return
	}

	employeeID, ok := IemployeeID.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to assert employee if"})
		return
	}

	Iusername, ok := c.Get("username")
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to get employee username"})
		return
	}

	username, ok := Iusername.(string)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to assert employee username"})
	}

	err := activity.LogActivity(
		employeeID,
		"create_medicine",
		"medicine",
		&medicine.ID,
		fmt.Sprintf("%s: Created medicine %s, brand %s, category %s", username, medicine.Name, medicine.Brand, medicine.Category),
	)
	if err != nil {
		log.Printf("Failed to log medicine creation activity: %v", err)
	}

	c.JSON(http.StatusCreated, medicine)
}




