package reports

import (
	"log"
	"net/http"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type LowStockItem struct {
	BranchID     uuid.UUID `json:"branch_id"`
	BranchName   string    `json:"branch_name"`
	MedicineID   uuid.UUID `json:"medicine_id"`
	MedicineName string    `json:"medicine_name"`
	Quantity     float64   `json:"quantity"`
}

func GetLowStockReport(c *gin.Context) {
	const threshold = 50.0

	var lowStock []LowStockItem

	err := db.DB.Table("medicine_stocks").
		Select(`medicine_stocks.branch_id, branches.name as branch_name,
		        medicine_stocks.medicine_id, medicines.name as medicine_name,
		        medicine_stocks.quantity`).
		Joins("JOIN medicines ON medicine_stocks.medicine_id = medicines.id").
		Joins("JOIN branches ON medicine_stocks.branch_id = branches.id").
		Where("medicine_stocks.quantity < ?", threshold).
		Order("branches.name, medicines.name").
		Scan(&lowStock).Error

	if err != nil {
		log.Printf("Low stock query error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch low stock items"})
		return
	}

	c.JSON(http.StatusOK, lowStock)
}

