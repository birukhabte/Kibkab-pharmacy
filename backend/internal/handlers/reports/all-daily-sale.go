package reports

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func GetAllEmployeeDailySale(c *gin.Context) {
	// Parse days
	daysStr := c.DefaultQuery("days", "1")
	days, err := strconv.Atoi(daysStr)
	if err != nil || days <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid days value"})
		return
	}

	startDate := time.Now().AddDate(0, 0, -days+1).Truncate(24 * time.Hour)
	startDateStr := startDate.Format("2006-01-02")

	// Step 1: fetch employees
	var employees []struct {
		ID         uuid.UUID
		FirstName  string
		LastName   string
		Commission float64
		Threshold  float64
	}
	if err := db.DB.Model(&models.Employee{}).
		Select("employees.id, employees.first_name, employees.last_name, roles.commission, roles.threshold").
		Joins("JOIN roles ON employees.role_id = roles.id").
		Scan(&employees).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch employees"})
		return
	}

	// Step 2: pre-fill map
	type key struct {
		Date       string
		EmployeeID uuid.UUID
	}
	salesMap := make(map[key]EmployeeDailySales)
	for i := 0; i < days; i++ {
		day := startDate.AddDate(0, 0, i).Format("2006-01-02")
		for _, emp := range employees {
			salesMap[key{Date: day, EmployeeID: emp.ID}] = EmployeeDailySales{
				Date:       day,
				EmployeeID: emp.ID,
				FirstName:  emp.FirstName,
				LastName:   emp.LastName,
				TotalSold:  0,
				SaleCount:  0,
				Commission: emp.Commission,
				Threshold:  emp.Threshold,
			}
		}
	}

	// Step 3: query actual sales
	var rawResults []struct {
		Date       string
		EmployeeID uuid.UUID
		TotalSold  float64
		SaleCount  int64
	}
	query := `
	SELECT DATE(s.sale_date) as date, s.employee_id, SUM(si.total) as total_sold, COUNT(DISTINCT s.id) as sale_count
	FROM sales s
	JOIN sale_items si ON s.id = si.sale_id
	WHERE s.status = 'completed' AND DATE(s.sale_date) BETWEEN ? AND ?
	GROUP BY DATE(s.sale_date), s.employee_id
	`
	if err := db.DB.Raw(query, startDateStr, time.Now().Format("2006-01-02")).Scan(&rawResults).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch sales"})
		return
	}

	// Step 4: overlay sales
	for _, r := range rawResults {
		k := key{Date: r.Date, EmployeeID: r.EmployeeID}
		v := salesMap[k]
		v.TotalSold = r.TotalSold
		v.SaleCount = r.SaleCount
		salesMap[k] = v
	}

	// Step 5: build final
	final := make([]EmployeeDailySales, 0, len(salesMap))
	for _, v := range salesMap {
		final = append(final, v)
	}

	c.JSON(http.StatusOK, final)
}
