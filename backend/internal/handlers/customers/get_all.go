package customers

import (
	"log"
	"net/http"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
)

// GetAllCustomers handles GET /customers.
// It retrieves all customers from the database and returns them as a JSON array.
func GetAllCustomers(c *gin.Context) {
	var customers []models.Customer

	if err := db.DB.Find(&customers).Error; err != nil {
		log.Printf("GetAllCustomer: failed to fetch customers: %s", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to fetch customers",
		})
		return
	}

	c.JSON(http.StatusOK, customers)
}
