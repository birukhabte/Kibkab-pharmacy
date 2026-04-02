package orders

import (
	"net/http"
	"time"
	"fmt"
	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CreateOrderPaymentInput struct {
	OrderID       uuid.UUID `json:"order_id" binding:"required"`
	PaymentAmount float64   `json:"payment_amount" binding:"required"`
}


func CreateOrderPayment(c *gin.Context) {
	var input CreateOrderPaymentInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check that the order exists
	var order models.Order
	if err := db.DB.First(&order, "id = ?", input.OrderID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "order not found"})
		return
	}

	// Create the payment
	payment := models.OrderPayment{
		ID:            uuid.New(),
		OrderID:       input.OrderID,
		PaymentAmount: input.PaymentAmount,
		PaymentDate:   time.Now(),
		CreatedAt:     time.Now(),
	}	

	if order.Status != models.OrderStatusApproved {
		c.JSON(http.StatusBadRequest, gin.H{"error": "order must be approved before payment"})
		return
	}

	// Use transaction: create payment, then update order status
	err := db.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&payment).Error; err != nil {
			return err
		}

		// Set IsPaid to true
		if err := tx.Model(&models.Order{}).
			Where("id = ?", input.OrderID).
			Updates(map[string]any{"is_paid": true, "updated_at": time.Now()}).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to process payment"})
		fmt.Println(err)
		return
	}

	c.JSON(http.StatusCreated, payment)
}
