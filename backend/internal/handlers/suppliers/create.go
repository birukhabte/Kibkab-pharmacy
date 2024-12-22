package suppliers

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/internal/handlers/activity"
	"github.com/gechjs/Pharmacy-App/internal/utils"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
	"github.com/go-sql-driver/mysql"
	"github.com/google/uuid"
)

func CreateSupplier(c *gin.Context) {
	var body struct {
		Name    string `gorm:"not null" json:"name" binding:"required"`
		Phone   string `gorm:"not null" json:"phone" binding:"required"`
		Email   string `gorm:"" json:"email"`
		Address string `gorm:"" json:"address"`
	}
	// read the body
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	// check for phone number validity
	if body.Phone != "" && !utils.IsPhoneValid(body.Phone) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid phone number format"})
		return
	}

	// check for valid email
	if body.Email != "" && !utils.ValidateEmail(body.Email) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid email format"})
		return
	}

	supplier := models.Supplier{
		ID:        uuid.New(),
		Name:      body.Name,
		Phone:     body.Phone,
		Address:   body.Address,
		CreatedAt: time.Now(),
	}

	if err := db.DB.Create(&supplier).Error; err != nil {

		// Check for MySQL duplicate entry error
		if mysqlErr, ok := err.(*mysql.MySQLError); ok && mysqlErr.Number == 1062 {
			c.JSON(http.StatusConflict, gin.H{"error": "supplier with that phone number already exists"})
			return
		}

		log.Printf("CreateSupplier: failed to create supplier: %s", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create supplier"})
	}

	IemployeeID, ok := c.Get("employee_id")
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to get employee id"})
		return
	}

	employeeID, ok := IemployeeID.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to assert employee id"})
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

	// After successful creation
	err := activity.LogActivity(
		employeeID,
		"create_supplier",
		"supplier",
		&supplier.ID,
		fmt.Sprintf("%s Created supplier with name %s ", username, supplier.Name),
	)
	if err != nil {
		log.Printf("Failed to log supplier creation activity: %v", err)
	}

	c.IndentedJSON(http.StatusCreated, supplier)
}





