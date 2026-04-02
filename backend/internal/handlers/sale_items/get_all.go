package sale_items

import (
	"log"
	"net/http"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func GetAllSaleItems(c *gin.Context) {
	status := c.Query("status")
	branchIDStr := c.Query("branch_id")

	// Validate status
	if status != "" {
		switch status {
		case "pending", "completed", "canceled":
		default:
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status filter"})
			return
		}
	}

	// Validate branch_id as UUID
	var branchID uuid.UUID
	var err error
	if branchIDStr != "" {
		branchID, err = uuid.Parse(branchIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid branch_id"})
			return
		}
	}

	var saleItems []models.SaleItem

	query := db.DB.Model(&models.SaleItem{}).
		Joins("JOIN sales ON sales.id = sale_items.sale_id").
		Preload("Medicine").
		Preload("Sale")

	if status != "" {
		query = query.Where("sales.status = ?", status)
	}
	if branchIDStr != "" {
		query = query.Where("sales.branch_id = ?", branchID)
	}

	if err := query.Find(&saleItems).Error; err != nil {
		log.Printf("GetAllSaleItems: failed to fetch sale items: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve sale items"})
		return
	}

	c.IndentedJSON(http.StatusOK, saleItems)
}
