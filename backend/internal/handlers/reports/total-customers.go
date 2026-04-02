package reports

import (
	"net/http"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
)

func TotalCustomers(c *gin.Context) {
	var counts int64

	if err := db.DB.Model(&models.Customer{}).Count(&counts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to count customers"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"total_customers": counts})

}
