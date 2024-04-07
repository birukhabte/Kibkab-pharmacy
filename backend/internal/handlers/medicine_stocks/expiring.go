package medicine_stock

import (
	"net/http"
	"time"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ExpiringMedicineResponse struct {
	ID            uuid.UUID `json:"id"`
	BranchID      uuid.UUID `json:"branch_id"`
	BranchName    string    `json:"branch_name"`
	MedicineID    uuid.UUID `json:"medicine_id"`
	MedicineName  string    `json:"medicine_name"`
	ExpiryDate    time.Time `json:"expiry_date"`
	PurchasePrice float64   `json:"purchase_price"`
	SellingPrice  float64   `json:"selling_price"`
	Quantity      float64   `json:"quantity"`
	RemainingDays int       `json:"remaining_days"`
}

func GetExpiringStock(c *gin.Context) {
	var stocks []models.MedicineStock
	now := time.Now()
	threeMonthsLater := now.AddDate(0, 3, 0)

	branchIDStr := c.Query("branch_id")
	query := db.DB.Preload("Branch").Preload("Medicine").
		Where("quantity > 0 AND expiry_date <= ?", threeMonthsLater)

	if branchIDStr != "" {
		branchID, err := uuid.Parse(branchIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid branch_id"})
			return
		}
		query = query.Where("branch_id = ?", branchID)
	}

	err := query.Order("expiry_date ASC").Find(&stocks).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch expiring medicines"})
		return
	}

	var response []ExpiringMedicineResponse
	for _, stock := range stocks {
		remainingDays := int(stock.ExpiryDate.Sub(now).Hours() / 24)
		response = append(response, ExpiringMedicineResponse{
			ID:            stock.ID,
			BranchID:      stock.BranchID,
			BranchName:    stock.Branch.Name,
			MedicineID:    stock.MedicineID,
			MedicineName:  stock.Medicine.Name,
			ExpiryDate:    stock.ExpiryDate,
			PurchasePrice: stock.PurchasePrice,
			SellingPrice:  stock.SellingPrice,
			Quantity:      stock.Quantity,
			RemainingDays: remainingDays,
		})
	}

	c.JSON(http.StatusOK, response)
}

