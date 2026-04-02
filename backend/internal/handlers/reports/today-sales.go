package reports

import (
	"net/http"
	"time"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func ReportTodaySales(c *gin.Context) {
	var saleCount int64
	var itemCount int64
	var totalRevenue float64

	today := time.Now().Format("2006-01-02")

	// Count completed sales today
	if err := db.DB.Model(&models.Sale{}).
		Where("DATE(sale_date) = ? AND status = ?", today, "completed").
		Count(&saleCount).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to count today's completed sales"})
		return
	}

	// Get IDs of completed sales
	var saleIDs []uuid.UUID
	if err := db.DB.Model(&models.Sale{}).
		Where("DATE(sale_date) = ? AND status = ?", today, "completed").
		Pluck("id", &saleIDs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch sale IDs"})
		return
	}

	// Count sale items + total revenue
	if len(saleIDs) > 0 {
		if err := db.DB.Model(&models.SaleItem{}).
			Where("sale_id IN ?", saleIDs).
			Count(&itemCount).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to count sale items"})
			return
		}

		if err := db.DB.Model(&models.SaleItem{}).
			Select("COALESCE(SUM(selling_price * quantity), 0)").
			Where("sale_id IN ?", saleIDs).
			Scan(&totalRevenue).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to calculate revenue"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"completed_sales_today": saleCount,
		"total_sale_items":      itemCount,
		"total_revenue":         totalRevenue,
	})
}
