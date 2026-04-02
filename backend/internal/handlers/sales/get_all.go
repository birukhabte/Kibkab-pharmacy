package sales

import (
	"log"
	"net/http"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func GetAllSales(c *gin.Context) {
	var sales []models.Sale

	// Optional query params
	branchIDStr := c.Query("branch_id")
	customerIDStr := c.Query("customer_id")
	status := c.Query("status")

	query := db.DB.Preload("Items")

	// Apply filters if present
	if branchIDStr != "" {
		branchID, err := uuid.Parse(branchIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid branch_id"})
			return
		}
		query = query.Where("branch_id = ?", branchID)
	}

	if customerIDStr != "" {
		customerID, err := uuid.Parse(customerIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid customer_id"})
			return
		}
		query = query.Where("customer_id = ?", customerID)
	}

	if status != "" {
		switch status {
		case "pending", "completed", "canceled":
			query = query.Where("status = ?", status)
		default:
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status"})
			return
		}
	}

	if err := query.Find(&sales).Error; err != nil {
		log.Printf("GetAllSales: failed to fetch sales: %s", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to retrieve sales"})
		return
	}

	c.IndentedJSON(http.StatusOK, sales)
}
