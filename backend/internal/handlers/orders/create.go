package orders

import (
	"net/http"
	"time"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type CreateOrderInput struct {
	SupplierID uuid.UUID `json:"supplier_id" binding:"required"`
	BranchID   uuid.UUID `json:"branch_id" binding:"required"`
	DueDate    string    `json:"due_date" binding:"required,datetime=2006-01-02"`
	Total      float64   `json:"total,omitempty"`
}

func CreateOrder(c *gin.Context) {
	var input CreateOrderInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.Total <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "total must be greater than zero"})
		return
	}

	employeeIDVal, exists := c.Get("employee_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	employeeID, _ := employeeIDVal.(uuid.UUID)

	dueDate, err := time.Parse("2006-01-02", input.DueDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid due_date format"})
		return
	}

	order := models.Order{
		ID:         uuid.New(),
		SupplierID: input.SupplierID,
		BranchID:   input.BranchID,
		EmployeeID: employeeID,
		Total:      input.Total,
		IsPaid:     false,
		Status:     models.OrderStatusPending,
		OrderDate:  time.Now(),
		DueDate:    dueDate,
		CreatedAt:  time.Now(),
	}

	if err := db.DB.Create(&order).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create order"})
		return
	}

	c.JSON(http.StatusCreated, order)
}



