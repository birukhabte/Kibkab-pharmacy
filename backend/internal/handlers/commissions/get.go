package commissions

import (
	"net/http"
	"strconv"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func GetUnpaidCommissions(c *gin.Context) {
	var commissions []models.Commission
	// Get role_id from context
	roleIDVal, exists := c.Get("role_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "role_id not found in context"})
		return
	}

	roleID, ok := roleIDVal.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid role_id type"})
		return
	}

	// Load role with commission cap + percent
	var role models.Role
	if err := db.DB.First(&role, "id = ?", roleID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch role"})
		return
	}

	// Get query param "paid", if empty fetch all, else filter by paid status
	query := db.DB.Preload("Employee").Where("total_sold >= ?", role.Threshold)

	paidStr := c.Query("paid")
	if paidStr != "" {
		paid, err := strconv.ParseBool(paidStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid paid query parameter"})
			return
		}
		query = query.Where("paid = ?", paid)
	}

	// Order by date descending
	if err := query.Order("date DESC").Find(&commissions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch commissions"})
		return
	}

	// Format the date as YYYY-MM-DD string for client friendliness
	type responseItem struct {
		ID         string  `json:"id"`
		EmployeeID string  `json:"employee_id"`
		Employee   string  `json:"employee_name"`
		Date       string  `json:"date"`
		TotalSold  float64 `json:"total_sold"`
		Threshold  float64 `json:"threshold"`
		Percent    float64 `json:"percent"`
		Amount     float64 `json:"amount"`
		Paid       bool    `json:"paid"`
	}

	resp := make([]responseItem, len(commissions))
	for i, cm := range commissions {
		resp[i] = responseItem{
			ID:         cm.ID.String(),
			EmployeeID: cm.EmployeeID.String(),
			Employee:   cm.Employee.FirstName + " " + cm.Employee.LastName,
			Date:       cm.Date.Format("2006-01-02"),
			TotalSold:  cm.TotalSold,
			Percent:    role.Commission,
			Threshold:  role.Threshold,
			Amount:     cm.Amount,
			Paid:       cm.Paid,
		}
	}

	c.JSON(http.StatusOK, resp)
}




