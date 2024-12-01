package sales

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/internal/handlers/activity"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type SaleItemInput struct {
	MedicineID      uuid.UUID `json:"medicine_id" binding:"required"`
	Quantity        float64   `json:"quantity" binding:"required,gt=0"`
	IndividualPrice float64   `json:"individual_price" binding:"required,gt=0"`
}

type CreateSaleInput struct {
	CustomerID  *uuid.UUID      `json:"customer_id"`
	RecurringID *uuid.UUID      `json:"recurring_id"`
	Items       []SaleItemInput `json:"items" binding:"required,min=1,dive"`
}

func CreateSale(c *gin.Context) {
	// get the employee's id
	empVal, ok := c.Get("employee_id")
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "employee ID is missing"})
		return
	}
	employeeID, ok := empVal.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid employee ID"})
		return
	}

	// get the employee's branch_id
	branchVal, ok := c.Get("branch_id")
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "branch ID is missing"})
		return
	}
	branchID, ok := branchVal.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid branch ID"})
		return
	}

	var body CreateSaleInput
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request", "details": err.Error()})
		return
	}

	for _, item := range body.Items {
		var totalAvailable float64
		err := db.DB.Model(&models.MedicineStock{}).
			Where("branch_id = ? AND medicine_id = ?", branchID, item.MedicineID).
			Select("SUM(quantity)").Scan(&totalAvailable).Error

		if err != nil {
			log.Printf("Failed to check stock: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check stock"})
			return
		}

		if totalAvailable < item.Quantity {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":       "Insufficient stock",
				"medicine_id": item.MedicineID,
				"requested":   item.Quantity,
				"available":   totalAvailable,
			})
			return
		}
	}

	tx := db.DB.Begin()
	defer func() {
		if tx != nil {
			tx.Rollback()
		}
	}()
	var total float64

	for _, item := range body.Items {
		total += float64(item.IndividualPrice) * item.Quantity
	}

	saleID := uuid.New()
	sale := models.Sale{
		ID:          saleID,
		BranchID:    &branchID,
		EmployeeID:  employeeID,
		CustomerID:  body.CustomerID,
		RecurringID: body.RecurringID,
		SaleDate:    time.Now(),
		TotalPrice:  total,
		Status:      "pending",
	}

	if err := tx.Create(&sale).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create sale"})
		return
	}

	for _, item := range body.Items {
		saleItem := models.SaleItem{
			ID:              uuid.New(),
			SaleID:          &saleID,
			MedicineID:      &item.MedicineID,
			IndividualPrice: item.IndividualPrice,
			Quantity:        item.Quantity,
			Total:           item.Quantity * item.IndividualPrice,
		}
		if err := tx.Create(&saleItem).Error; err != nil {
			log.Println(err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create sale item"})
			return
		}
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit sale"})
		return
	}
	tx = nil

	Iusername, ok := c.Get("username")
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to get employee username"})
		return
	}

	username, ok := Iusername.(string)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to assert employee username"})
	}

	// Log activity (pass employeeID explicitly)
	err := activity.LogActivity(
		employeeID,
		"create_sale",
		"sale",
		&saleID,
		fmt.Sprintf("%s: Created a draft sale with %d item(s)", username, len(body.Items)),
	)
	if err != nil {
		log.Printf("Failed to log activity: %v", err)
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Draft sale created", "sale_id": saleID})
}


