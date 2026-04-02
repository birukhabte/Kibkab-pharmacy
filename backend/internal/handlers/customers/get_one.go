package customers

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

// GetCustomerByID handles GET /customers/:id
// Retrieves a specific customer by UUID.
// Returns 404 if not found, 500 on internal errors.
func GetCustomerByID(c *gin.Context) {
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

	var cust models.Customer
	if err := db.DB.First(&cust, "id = ?", customerID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "customer not found"})
			return
		}
		log.Printf("GetCustomerByID: failed to fetch customer %s: %s", id, err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch customer"})
		return
	}

	c.JSON(http.StatusOK, cust)
}
