package analytics

import (
	"log"
	"net/http"
	"time"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gin-gonic/gin"
)

type RevenueRow struct {
	BranchName    string  `json:"branch_name"`
	TotalSales    int     `json:"total_sales"`
	BranchRevenue float64 `json:"branch_revenue"`
}

type TotalRevenue struct {
	TotalSales    int     `json:"total_sales"`
	BranchRevenue float64 `json:"branch_revenue"`
}

func RevenueGenerator(c *gin.Context) {
	startStr := c.Query("start_date")
	endStr := c.Query("end_date")

	if startStr == "" || endStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "start_date and end_date are required query parameters"})
		return
	}

	startDate, err := time.Parse(time.RFC3339, startStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid start_date format. Use RFC3339 timestamp"})
		return
	}

	endDate, err := time.Parse(time.RFC3339, endStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid end_date format. Use RFC3339 timestamp"})
		return
	}

	// Get per-branch revenue
	query := `
		SELECT
			b.name AS branch_name,
			COUNT(s.id) AS total_sales,
			SUM(s.total_price) AS branch_revenue
		FROM
			sales s
		JOIN
			branches b ON s.branch_id = b.id
		WHERE
			s.status = 'completed'
			AND DATE(s.sale_date) BETWEEN DATE(?) AND DATE(?)
		GROUP BY
			b.id, b.name
	`

	var branches []RevenueRow
	if err := db.DB.Raw(query, startDate.Format("2006-01-02"), endDate.Format("2006-01-02")).Scan(&branches).Error; err != nil {
		log.Printf("RevenueGenerator: failed to fetch branch revenues: %s", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate branch revenue report"})
		return
	}

	// Sum totals in Go
	var total TotalRevenue
	for _, b := range branches {
		total.TotalSales += b.TotalSales
		total.BranchRevenue += b.BranchRevenue
	}

	// Final response
	c.JSON(http.StatusOK, gin.H{
		"branches": branches,
		"total":    total,
	})
}




