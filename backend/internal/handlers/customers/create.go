package customers

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

// CreateCustomer handles POST /customers
// Creates a new customer with first name, last name, and phone.
// Returns the created customer with generated ID and created_at timestamp.
func CreateCustomer(c *gin.Context) {
	// Request payload structure
	var body struct {
		FirstName string `json:"first_name" binding:"required"`
		LastName  string `json:"last_name" binding:"required"`
		Phone     string `json:"phone" binding:"required"`
		Email     string `json:"email"`
	}

	// Bind and validate request body
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

	// Create new customer model instance
	customer := models.Customer{
		ID:        uuid.New(),
		FirstName: body.FirstName,
		LastName:  body.LastName,
		Phone:     body.Phone,
		Email:     body.Email,
		CreatedAt: time.Now(),
	}

	// Save to database
	if err := db.DB.Create(&customer).Error; err != nil {

		// Check for MySQL duplicate entry error
		if mysqlErr, ok := err.(*mysql.MySQLError); ok && mysqlErr.Number == 1062 {
			c.JSON(http.StatusConflict, gin.H{"error": "customer with that phone number already exists"})
			return
		}
		log.Printf("CreateCustomer: failed to create customer: %s", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create customer"})
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
		"create_customer",
		"customers",
		&customer.ID,
		fmt.Sprintf("%s: Created customer with Name %s ", username, customer.FirstName+" "+customer.LastName),
	)
	if err != nil {
		log.Printf("Failed to log create customer activity: %v", err)
	}

	// Respond with created customer formatted per spec
	c.JSON(http.StatusCreated, gin.H{
		"customer_id":         customer.ID,
		"customer_first_name": customer.FirstName,
		"customer_last_name":  customer.LastName,
		"customer_phone":      customer.Phone,
		"created_at":          customer.CreatedAt,
	})
}



