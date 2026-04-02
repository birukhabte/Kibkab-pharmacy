package medicine_stock

import (
	"errors"
	"net/http"
	"time"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func TransferMedicineStock(c *gin.Context) {
	var body struct {
		FromBranchID uuid.UUID `json:"from_branch_id" binding:"required"`
		ToBranchID   uuid.UUID `json:"to_branch_id" binding:"required"`
		MedicineID   uuid.UUID `json:"medicine_id" binding:"required"`
		Quantity     float64   `json:"quantity" binding:"required,gt=0"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request payload"})
		return
	}

	if body.FromBranchID == body.ToBranchID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "from_branch_id and to_branch_id must be different"})
		return
	}

	err := db.DB.Transaction(func(tx *gorm.DB) error {
		var fromStock models.MedicineStock
		// Find source stock batch
		if err := tx.Where("branch_id = ? AND medicine_id = ?", body.FromBranchID, body.MedicineID).
			First(&fromStock).Error; err != nil {
			return err
		}

		if fromStock.Quantity < body.Quantity {
			return errors.New("insufficient stock quantity at source branch")
		}

		// Deduct quantity from source
		fromStock.Quantity -= body.Quantity
		if err := tx.Save(&fromStock).Error; err != nil {
			return err
		}

		var toStock models.MedicineStock
		// Try find destination stock batch
		err := tx.Where("branch_id = ? AND medicine_id = ?", body.ToBranchID, body.MedicineID).
			First(&toStock).Error

		if err != nil && errors.Is(err, gorm.ErrRecordNotFound) {
			// Create new stock record at destination with transferred quantity and same expiry, prices
			toStock = models.MedicineStock{
				ID:            uuid.New(),
				BranchID:      body.ToBranchID,
				MedicineID:    body.MedicineID,
				ExpiryDate:    fromStock.ExpiryDate,
				PurchasePrice: fromStock.PurchasePrice,
				SellingPrice:  fromStock.SellingPrice,
				Quantity:      body.Quantity,
				CreatedAt:     time.Now(),
			}
			if err := tx.Create(&toStock).Error; err != nil {
				return err
			}
		} else if err == nil {
			// Increase quantity if exists
			toStock.Quantity += body.Quantity
			if err := tx.Save(&toStock).Error; err != nil {
				return err
			}
		} else {
			return err // some other DB error
		}

		return nil
	})

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "medicine transferred successfully"})
}
