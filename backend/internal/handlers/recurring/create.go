package recurring

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

type CreateRecurringSaleInput struct {
	CustomerID         uuid.UUID `json:"customer_id" binding:"required"`
	MedicineID         uuid.UUID `json:"medicine_id" binding:"required"`
	IntervalDays       int       `json:"interval_days" binding:"required,gt=0"`
	PrescribedQuantity int       `json:"prescribed_quantity" binding:"required,gte=0"`
	SoldQuantity       int       `json:"sold_quantity" binding:"gte=0"`
	StartDate          time.Time `json:"start_date" binding:"required"`
	Active             *bool     `json:"active,omitempty"`
}

func CreateRecurringSale(c *gin.Context) {
	var input CreateRecurringSaleInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.PrescribedQuantity < input.SoldQuantity {
		c.JSON(http.StatusBadRequest, gin.H{"error": "prescribed_quantity cannot be less than sold_quantity"})
		return
	}

	rec := models.RecurringSale{
		ID:                 uuid.New(),
		CustomerID:         input.CustomerID,
		MedicineID:         input.MedicineID,
		IntervalDays:       input.IntervalDays,
		PrescribedQuantity: input.PrescribedQuantity,
		SoldQuantity:       input.SoldQuantity,
		StartDate:          input.StartDate,
		LastPurchaseDate:   input.StartDate,
		Active:             true,
		CreatedAt:          time.Now(),
	}

	if input.Active != nil {
		rec.Active = *input.Active
	}

	if err := db.DB.Create(&rec).Error; err != nil {
		log.Println(err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create recurring sale"})
		return
	}

	IemployeeID, ok := c.Get("employee_id")
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to get employee id"})
		return
	}

	employeeID, ok := IemployeeID.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to assert employee id"})
		return
	}

	Iusername , ok := c.Get("username")
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error" : "failed to get employee username"})
		return
	}

	username , ok := Iusername.(string)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error" : "failed to assert employee username"})
	}


	err := activity.LogActivity(
		employeeID,
		"create_recurring_sale",
		"recurring_sale",
		&rec.ID,
		fmt.Sprintf("%s: Created recurring sale for customer", username),
	)
	if err != nil {
		log.Printf("Failed to log recurring sale creation activity: %v", err)
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "recurring sale created successfully",
		"data":    rec,
	})
}


