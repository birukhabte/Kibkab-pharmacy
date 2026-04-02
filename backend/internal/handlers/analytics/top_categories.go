package analytics

import (
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gin-gonic/gin"
)

type CategorySalesRow struct {
	Category   string  `json:"category"`
	TotalSold  float64 `json:"total_sold"`
	Percentage float64 `json:"percentage"`
}

func TopSoldCategories(c *gin.Context) {
	// Required query params
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

	// Optional limit param
	limitParam := c.DefaultQuery("limit", "3")
	limit, err := strconv.Atoi(limitParam)
	if err != nil || limit <= 0 {
		limit = 3
	}

	type rawResult struct {
		Category  string  `json:"category"`
		TotalSold float64 `json:"total_sold"`
	}

	var rows []rawResult
	query := `
		SELECT
			m.category AS category,
			SUM(si.quantity) AS total_sold
		FROM
			sale_items si
		JOIN
			sales s ON s.id = si.sale_id
		JOIN
			medicines m ON m.id = si.medicine_id
		WHERE
			s.status = 'completed'
			AND DATE(s.sale_date) BETWEEN DATE(?) AND DATE(?)
		GROUP BY
			m.category
		ORDER BY
			total_sold DESC
		LIMIT ?
	`

	if err := db.DB.Raw(query, startDate.Format("2006-01-02"), endDate.Format("2006-01-02"), limit).Scan(&rows).Error; err != nil {
		log.Printf("TopSoldCategories: failed to fetch data: %s", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate category sales report"})
		return
	}

	var total float64
	for _, r := range rows {
		total += r.TotalSold
	}

	var result []CategorySalesRow
	for _, r := range rows {
		percentage := 0.0
		if total > 0 {
			percentage = (r.TotalSold / total) * 100
		}
		result = append(result, CategorySalesRow{
			Category:   r.Category,
			TotalSold:  r.TotalSold,
			Percentage: percentage,
		})
	}

	c.JSON(http.StatusOK, result)
}
