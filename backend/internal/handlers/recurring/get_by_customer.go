package recurring

import (
	"net/http"
	"time"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type RecurringSaleResponse struct {
	ID               uuid.UUID `json:"id"`
	MedicineID       uuid.UUID `json:"medicine_id"`
	MedicineName     string    `json:"medicine_name"`
	Brand            string    `json:"brand"`
	Category         string    `json:"category"`
	IntervalDays     int       `json:"interval_days"`
	PrescribedQty    int       `json:"prescribed_quantity"`
	SoldQty          int       `json:"sold_quantity"`
	RemainingQty     int       `json:"remaining_quantity"`
	StartDate        string    `json:"start_date"`
	LastPurchaseDate *string   `json:"last_purchase_date,omitempty"`
	Active           bool      `json:"active"`
	CreatedAt        string    `json:"created_at"`
}

type CustomerRecurringSalesResponse struct {
	CustomerID   uuid.UUID               `json:"customer_id"`
	CustomerName string                  `json:"customer_name"`
	Phone        string                  `json:"phone"`
	Email        string                  `json:"email,omitempty"`
	Recurring    []RecurringSaleResponse `json:"recurring_sales"`
}

func GetCustomerRecurringSales(c *gin.Context) {
	customerIDStr := c.Param("id")
	customerID, err := uuid.Parse(customerIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid id"})
		return
	}

	// Default filter: only active records
	activeOnly := true
	if c.Query("active") == "false" {
		activeOnly = false
	}

	var customer models.Customer
	if err := db.DB.First(&customer, "id = ?", customerID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Customer not found"})
		return
	}

	var recurring []models.RecurringSale
	query := db.DB.Preload("Medicine").Where("customer_id = ?", customerID)
	if activeOnly {
		query = query.Where("active = ?", true)
	}

	if err := query.Find(&recurring).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch recurring sales"})
		return
	}

	var respList []RecurringSaleResponse
	for _, r := range recurring {
		var lastPurchaseDate *string
		if !r.LastPurchaseDate.IsZero() {
			formatted := r.LastPurchaseDate.Format("2006-01-02")
			lastPurchaseDate = &formatted
		}

		respList = append(respList, RecurringSaleResponse{
			ID:               r.ID,
			MedicineID:       r.MedicineID,
			MedicineName:     r.Medicine.Name,
			Brand:            r.Medicine.Brand,
			Category:         r.Medicine.Category,
			IntervalDays:     r.IntervalDays,
			PrescribedQty:    r.PrescribedQuantity,
			SoldQty:          r.SoldQuantity,
			RemainingQty:     r.PrescribedQuantity - r.SoldQuantity,
			StartDate:        r.StartDate.Format("2006-01-02"),
			LastPurchaseDate: lastPurchaseDate,
			Active:           r.Active,
			CreatedAt:        r.CreatedAt.Format(time.RFC3339),
		})
	}

	resp := CustomerRecurringSalesResponse{
		CustomerID:   customer.ID,
		CustomerName: customer.FirstName + " " + customer.LastName,
		Phone:        customer.Phone,
		Email:        customer.Email,
		Recurring:    respList,
	}

	c.JSON(http.StatusOK, resp)
}
