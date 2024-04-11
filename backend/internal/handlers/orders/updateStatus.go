package orders

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type UpdateOrderStatusInput struct {
	OrderID uuid.UUID          `json:"order_id" binding:"required"`
	Status  models.OrderStatus `json:"status" binding:"required,oneof=APPROVED CANCELED"`
}

func UpdateOrderStatus(c *gin.Context) {
	var input UpdateOrderStatusInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var order models.Order
	if err := db.DB.First(&order, "id = ?", input.OrderID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "order not found"})
		return
	}

	if order.Status != models.OrderStatusPending {
		c.JSON(http.StatusBadRequest, gin.H{"error": "only pending orders can be updated"})
		return
	}

	updates := map[string]interface{}{
		"status":     input.Status,
		"updated_at": time.Now(),
	}

	if err := db.DB.Model(&order).Updates(updates).Error; err != nil {
		fmt.Println(err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update order"})
		return
	}

	order.Status = input.Status

	c.JSON(http.StatusOK, gin.H{"message": "order status updated", "order": order})
}

