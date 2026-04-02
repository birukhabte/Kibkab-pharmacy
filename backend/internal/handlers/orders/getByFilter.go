package orders

import (
	"net/http"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
)

type OrderResponse struct {
	ID           string  `json:"id"`
	SupplierID   string  `json:"supplier_id"`
	SupplierName string  `json:"supplier_name"`
	BranchID     string  `json:"branch_id"`
	BranchName   string  `json:"branch_name"`
	Total        float64 `json:"total"`
	IsPaid       bool    `json:"is_paid"`
	Status       string  `json:"status"`
	OrderDate    string  `json:"purchase_date"`
	DueDate      string  `json:"due_date"`
	CreatedAt    string  `json:"created_at"`
}

func GetOrders(c *gin.Context) {
	var orders []models.Order

	query := db.DB.Model(&models.Order{}).
		Preload("Supplier").
		Preload("Branch")

	// Optional filters
	if id := c.Query("id"); id != "" {
		query = query.Where("id = ?", id)
	}

	// Paid filter — default is unpaid orders
	switch c.Query("paid") {
	case "true":
		query = query.Where("is_paid = ?", true)
	default:
		query = query.Where("is_paid = ?", false)
	}

	status := c.Query("status")
	if status != "" {
		query = query.Where("status = ?", status)
	}

	if err := query.Order("created_at desc").Find(&orders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch orders"})
		return
	}

	var response []OrderResponse
	for _, o := range orders {
		response = append(response, OrderResponse{
			ID:           o.ID.String(),
			SupplierID:   o.SupplierID.String(),
			SupplierName: o.Supplier.Name,
			BranchID:     o.BranchID.String(),
			BranchName:   o.Branch.Name,
			Total:        o.Total,
			IsPaid:       o.IsPaid,
			Status:       string(o.Status),
			OrderDate:    o.OrderDate.Format("2006-01-02"),
			DueDate:      o.DueDate.Format("2006-01-02"),
			CreatedAt:    o.CreatedAt.Format("2006-01-02 15:04"),
		})
	}

	c.JSON(http.StatusOK, response)
}
