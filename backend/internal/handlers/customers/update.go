package customers

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

// UpdateCustomer handles PUT /customers/:id
// Updates an existing customer by ID with provided first name, last name, and phone.
// Returns the updated customer or errors (400, 404, 500).
func UpdateCustomer(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "customer ID is required"})
		return
	}

	customerID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid customer ID format"})
		return
	}

	var body struct {
		FirstName string `json:"first_name" binding:"required"`
		LastName  string `json:"last_name" binding:"required"`
		Phone     string `json:"phone" binding:"required"`
		Email     string `json:"email"`
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

	// check for valid email
	if body.Email != "" && !utils.ValidateEmail(body.Email) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid email format"})
		return
	}

	var customer models.Customer
	if err := db.DB.First(&customer, "id = ?", customerID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "customer not found"})
			return
		}
		log.Printf("UpdateCustomer: failed to fetch customer %s: %s", id, err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch customer"})
		return
	}

	original := customer
	// Update fields and updated timestamp
	customer.FirstName = body.FirstName
	customer.LastName = body.LastName
	customer.Phone = body.Phone
	customer.Email = body.Email
	if reflect.DeepEqual(original, customer) {
		c.JSON(http.StatusOK, gin.H{"message": "no new values provided"})
		return
	}
	customer.UpdatedAt = time.Now()

	if err := db.DB.Save(&customer).Error; err != nil {
		log.Printf("UpdateCustomer: failed to update customer %s: %s", id, err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update customer"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":         customer.ID,
		"fist_name":  customer.FirstName,
		"last_name":  customer.LastName,
		"phone":      customer.Phone,
		"created_at": customer.CreatedAt,
		"updated_at": customer.UpdatedAt,
	})
}



