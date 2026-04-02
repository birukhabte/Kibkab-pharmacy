package reports

import (
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type EmployeeDailySales struct {
	Date       string    `json:"date"`
	EmployeeID uuid.UUID `json:"employee_id"`
	FirstName  string    `json:"first_name"`
	LastName   string    `json:"last_name"`
	TotalSold  float64   `json:"total_sold"`
	SaleCount  int64     `json:"sale_count"`
	Commission float64   `json:"commission"`
	Threshold  float64   `json:"threshold"`
}

func GetEmployeeSalesReport(c *gin.Context) {
	employeeIDStr := c.Query("employee_id")
	branchIDStr := c.Query("branch_id")

	daysStr := c.DefaultQuery("days", "1")
	days, err := strconv.Atoi(daysStr)
	if err != nil || days <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("invalid days value: %v", err)})
		return
	}

	// Calculate start date as YYYY-MM-DD string
	startDate := time.Now().AddDate(0, 0, -days+1).Truncate(24 * time.Hour)
	startDateStr := startDate.Format("2006-01-02")

	// Raw struct to read SQL results
	type employeeDailySalesRaw struct {
		Date       string    `json:"date"`
		EmployeeID uuid.UUID `json:"employee_id"`
		FirstName  string    `json:"first_name"`
		LastName   string    `json:"last_name"`
		TotalSold  float64   `json:"total_sold"`
		SaleCount  int64     `json:"sale_count"`
		Commission float64   `json:"commission"`
		Threshold  float64   `json:"Threshold"`
	}

	var rawResults []employeeDailySalesRaw

	// Dynamic WHERE conditions and params
	whereClauses := []string{
		"DATE(sales.sale_date) >= ?",
		"sales.status = 'completed'",
	}
	params := []interface{}{startDateStr}

	if employeeIDStr != "" {
		employeeID, err := uuid.Parse(employeeIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("invalid employee_id: %v", err)})
			return
		}
		whereClauses = append(whereClauses, "sales.employee_id = ?")
		params = append(params, employeeID)
	} else if branchIDStr != "" {
		branchID, err := uuid.Parse(branchIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("invalid branch_id: %v", err)})
			return
		}
		whereClauses = append(whereClauses, "sales.branch_id = ?")
		params = append(params, branchID)
	}

	// Build SQL query
	query := fmt.Sprintf(`
		SELECT 
			DATE(sales.sale_date) as date,
			employees.id as employee_id,
			employees.first_name,
			employees.last_name,
			SUM(sale_items.total) as total_sold,
			COUNT(DISTINCT sales.id) as sale_count,
			roles.commission,
			roles.threshold
		FROM sales
		JOIN sale_items ON sales.id = sale_items.sale_id
		JOIN employees ON sales.employee_id = employees.id
		JOIN roles ON employees.role_id = roles.id
		WHERE %s
		GROUP BY DATE(sales.sale_date), employees.id, employees.first_name, employees.last_name, roles.commission, roles.threshold
		ORDER BY date ASC
	`, strings.Join(whereClauses, " AND "))

	// Execute query
	err = db.DB.Raw(query, params...).Scan(&rawResults).Error
	if err != nil {
		log.Printf("Query error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to fetch report: %v", err)})
		return
	}

	// Create map with date + employee as key
	type key struct {
		Date       string
		EmployeeID uuid.UUID
	}
	salesMap := make(map[key]EmployeeDailySales)

	for _, r := range rawResults {
		// Handle date format from query (e.g., 2025-07-26T00:00:00+03:00)
		// do not think this is useless, don't remove it
		dateStr := r.Date
		if t, err := time.Parse("2006-01-02T15:04:05Z07:00", r.Date); err == nil {
			dateStr = t.Format("2006-01-02")
		} else if t, err := time.Parse("2006-01-02", r.Date); err == nil {
			dateStr = t.Format("2006-01-02")
		}

		salesMap[key{Date: dateStr, EmployeeID: r.EmployeeID}] = EmployeeDailySales{
			Date:       dateStr,
			EmployeeID: r.EmployeeID,
			FirstName:  r.FirstName,
			LastName:   r.LastName,
			TotalSold:  r.TotalSold,
			SaleCount:  r.SaleCount,
			Commission: r.Commission,
			Threshold:  r.Threshold,
		}
	}

	// Generate final result list
	var final []EmployeeDailySales
	for i := 0; i < days; i++ {
		day := startDate.AddDate(0, 0, i).Format("2006-01-02")
		for k, v := range salesMap {
			if k.Date == day {
				final = append(final, v)
			}
		}
	}

	if len(final) == 0 {
		c.JSON(http.StatusNoContent, nil)
		return
	}

	c.JSON(http.StatusOK, final)
}
