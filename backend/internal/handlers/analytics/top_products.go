package analytics

import (
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gin-gonic/gin"
)

type TopMedicineRow struct {
	MedicineID   string  `json:"medicine_id"`
	MedicineName string  `json:"medicine_name"`
	TotalSold    float64 `json:"total_sold"`
}

func TopSoldMedicines(c *gin.Context) {
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

	// Optional limit query param
	limitParam := c.DefaultQuery("limit", "3")
	limit, err := strconv.Atoi(limitParam)
	if err != nil || limit <= 0 {
		limit = 3
	}

	query := `
		SELECT
			m.id AS medicine_id,
			m.name AS medicine_name,
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
			m.id, m.name
		ORDER BY
			total_sold DESC
		LIMIT ?
	`

	var result []TopMedicineRow
	if err := db.DB.Raw(query, startDate.Format("2006-01-02"), endDate.Format("2006-01-02"), limit).Scan(&result).Error; err != nil {
		log.Printf("TopSoldMedicines: query failed: %s", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch top sold medicines"})
		return
	}

	c.JSON(http.StatusOK, result)
}


