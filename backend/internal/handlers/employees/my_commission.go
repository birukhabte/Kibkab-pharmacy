package employees

import (
	"net/http"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func GetMyCommissions(c *gin.Context) {
	employeeIDVal, exists := c.Get("employee_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "employee_id not found in context"})
		return
	}

	employeeID, ok := employeeIDVal.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid employee_id type"})
		return
	}

	var commissions []models.Commission

	// Query parameters
	paidQuery := c.Query("paid") // "true" or "false" or empty
	sortQuery := c.Query("sort") // "date_asc" or "date_desc"

	dbQuery := db.DB.Preload("Employee").Where("employee_id = ?", employeeID)

	// Optional paid filter
	if paidQuery != "" {
		if paidQuery == "true" {
			dbQuery = dbQuery.Where("paid = ?", true)
		} else if paidQuery == "false" {
			dbQuery = dbQuery.Where("paid = ?", false)
		}
	}

	// Sorting
	switch sortQuery {
	case "date_asc":
		dbQuery = dbQuery.Order("date ASC")
	case "date_desc":
		dbQuery = dbQuery.Order("date DESC")
	default:
		// default: unpaid first, latest date first
		dbQuery = dbQuery.Order("paid ASC").Order("date DESC")
	}

	if err := dbQuery.Find(&commissions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch commissions"})
		return
	}

	type responseItem struct {
		ID         string  `json:"id"`
		EmployeeID string  `json:"employee_id"`
		Employee   string  `json:"employee_name"`
		Date       string  `json:"date"`
		TotalSold  float64 `json:"total_sold"`
		Amount     float64 `json:"amount"`
		Threshold  float64 `json:"threshold"`
		Commission float64 `json:"percent"`
		Paid       bool    `json:"paid"`
	}

	resp := make([]responseItem, len(commissions))
	for i, cm := range commissions {
		if cm.Commission == 0 {
			continue
		}
		resp[i] = responseItem{
			ID:         cm.ID.String(),
			EmployeeID: cm.EmployeeID.String(),
			Employee:   cm.Employee.FirstName + " " + cm.Employee.LastName,
			Date:       cm.Date.Format("2006-01-02"),
			TotalSold:  cm.TotalSold,
			Amount:     cm.Amount,
			Commission: cm.Commission,
			Threshold:  cm.Threshold,
			Paid:       cm.Paid,
		}
	}

	c.JSON(http.StatusOK, resp)
}
