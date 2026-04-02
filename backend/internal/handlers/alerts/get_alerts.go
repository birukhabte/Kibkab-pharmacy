package alerts

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
)

func GetAlertsByDate(c *gin.Context) {
	// Parse query params or default to today
	now := time.Now()

	yearStr := c.Query("year")
	monthStr := c.Query("month")
	dayStr := c.Query("day")

	year, err := strconv.Atoi(yearStr)
	if err != nil || yearStr == "" {
		year = now.Year()
	}
	month, err := strconv.Atoi(monthStr)
	if err != nil || monthStr == "" {
		month = int(now.Month())
	}
	day, err := strconv.Atoi(dayStr)
	if err != nil || dayStr == "" {
		day = now.Day()
	}

	// Construct start and end of the given day
	startDate := time.Date(year, time.Month(month), day, 0, 0, 0, 0, now.Location())
	endDate := startDate.AddDate(0, 0, 1)

	var alerts []models.Alert
	err = db.DB.
		Where("created_at >= ? AND created_at < ?", startDate, endDate).
		Order("created_at DESC").
		Find(&alerts).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch alerts"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"date":   startDate.Format("2006-01-02"),
		"alerts": alerts,
	})
}
