package recurring

import (
	"net/http"
	"time"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type UpdateRecurringSaleInput struct {
	IntervalDays       *int       `json:"interval_days,omitempty" binding:"omitempty,gt=0"`
	PrescribedQuantity *int       `json:"prescribed_quantity,omitempty" binding:"omitempty,gte=0"`
	SoldQuantity       *int       `json:"sold_quantity,omitempty" binding:"omitempty,gte=0"`
	StartDate          *time.Time `json:"start_date,omitempty"`
	LastPurchaseDate   *time.Time `json:"last_purchase_date,omitempty"`
	Active             *bool      `json:"active,omitempty"`
}

func UpdateRecurringSale(c *gin.Context) {
	idStr := c.Param("id")
	recurringID, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid recurring sale ID"})
		return
	}

	var input UpdateRecurringSaleInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var recurring models.RecurringSale
	if err := db.DB.First(&recurring, "id = ?", recurringID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "recurring sale not found"})
		return
	}

	// Validate prescribed >= sold if either is being updated
	prescribed := recurring.PrescribedQuantity
	sold := recurring.SoldQuantity

	if input.PrescribedQuantity != nil {
		prescribed = *input.PrescribedQuantity
	}
	if input.SoldQuantity != nil {
		sold = *input.SoldQuantity
	}

	if prescribed < sold {
		c.JSON(http.StatusBadRequest, gin.H{"error": "prescribed_quantity cannot be less than sold_quantity"})
		return
	}

	// Apply updates
	if input.IntervalDays != nil {
		recurring.IntervalDays = *input.IntervalDays
	}
	if input.PrescribedQuantity != nil {
		recurring.PrescribedQuantity = *input.PrescribedQuantity
	}
	if input.SoldQuantity != nil {
		recurring.SoldQuantity = *input.SoldQuantity
	}
	if input.StartDate != nil {
		recurring.StartDate = *input.StartDate
	}
	if input.LastPurchaseDate != nil {
		recurring.LastPurchaseDate = *input.LastPurchaseDate
	}
	if input.Active != nil {
		recurring.Active = *input.Active
	}

	if err := db.DB.Save(&recurring).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update recurring sale"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "recurring sale updated successfully",
		"data":    recurring,
	})
}
