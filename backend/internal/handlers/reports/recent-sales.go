package reports

import (
	"log"
	"net/http"
	"strconv"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gin-gonic/gin"
)

// RecentSaleItem represents each sold item in a sale
type RecentSaleItem struct {
	MedicineName string  `json:"medicine_name"`
	Quantity     float64 `json:"quantity"`
	TotalPrice   float64 `json:"total_price"`
}

// RecentSale represents a completed sale entry with rich info
type RecentSale struct {
	ID           string           `json:"id"`
	SaleDate     string           `json:"sale_date"`
	TotalPrice   float64          `json:"total_price"`
	BranchName   string           `json:"branch_name"`
	EmployeeName string           `json:"employee_name"`
	CustomerName *string          `json:"customer_name,omitempty"`
	Items        []RecentSaleItem `json:"items" gorm:"-"` // prevent GORM from trying to map this field
}

func GetRecentSales(c *gin.Context) {
	// Read limit from query param, default to 10
	limitStr := c.DefaultQuery("limit", "10")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 10
	}

	var sales []RecentSale

	// Fetch completed sales joined with employee, branch, and customer
	query := `
		SELECT 
			sales.id,
			sales.sale_date,
			sales.total_price,
			branches.name AS branch_name,
			CONCAT(employees.first_name, ' ', employees.last_name) AS employee_name,
			CASE 
				WHEN customers.id IS NOT NULL THEN CONCAT(customers.first_name, ' ', customers.last_name)
				ELSE NULL
			END AS customer_name
		FROM sales
		JOIN branches ON branches.id = sales.branch_id
		JOIN employees ON employees.id = sales.employee_id
		LEFT JOIN customers ON customers.id = sales.customer_id
		WHERE sales.status = 'completed'
		ORDER BY sales.sale_date DESC
		LIMIT ?
	`

	if err := db.DB.Raw(query, limit).Scan(&sales).Error; err != nil {
		log.Printf("Failed to query recent sales: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch recent sales"})
		return
	}

	// For each sale, fetch sale items
	for i := range sales {
		var items []RecentSaleItem

		itemQuery := `
			SELECT medicines.name AS medicine_name, sale_items.quantity, sale_items.total
			FROM sale_items
			JOIN medicines ON medicines.id = sale_items.medicine_id
			WHERE sale_items.sale_id = ?
		`

		if err := db.DB.Raw(itemQuery, sales[i].ID).Scan(&items).Error; err != nil {
			log.Printf("Failed to fetch sale items for sale %s: %v", sales[i].ID, err)
			continue
		}

		sales[i].Items = items
	}

	c.JSON(http.StatusOK, sales)
}
