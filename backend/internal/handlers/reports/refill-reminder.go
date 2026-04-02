package reports

import (
	"log"
	"net/http"
	"time"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gin-gonic/gin"
)

type RefillReminder struct {
	CustomerID   string `json:"customer_id"`
	CustomerName string `json:"customer_name"`
	MedicineID   string `json:"medicine_id"`
	MedicineName string `json:"medicine_name"`
	NextDueDate  string `json:"next_due_date"` // formatted as YYYY-MM-DD
	DaysLeft     int    `json:"days_left"`     // days left until due
}

func GetRefillReminders(c *gin.Context) {
	today := time.Now().Truncate(24 * time.Hour)

	var reminders []RefillReminder

	query := `
		SELECT 
			recurring_sales.customer_id,
			CONCAT(customers.first_name, ' ', customers.last_name) AS customer_name,
			recurring_sales.medicine_id,
			medicines.name AS medicine_name,
			DATE(
				COALESCE(recurring_sales.last_purchase_date, recurring_sales.start_date) + INTERVAL recurring_sales.interval_days DAY
			) AS next_due_date,
			DATEDIFF(
				DATE(
					COALESCE(recurring_sales.last_purchase_date, recurring_sales.start_date) + INTERVAL recurring_sales.interval_days DAY
				), ?
			) AS days_left
		FROM recurring_sales
		JOIN customers ON customers.id = recurring_sales.customer_id
		JOIN medicines ON medicines.id = recurring_sales.medicine_id
		WHERE recurring_sales.active = 1
		HAVING days_left < 2
		ORDER BY next_due_date ASC
	`

	err := db.DB.Raw(query, today.Format("2006-01-02")).Scan(&reminders).Error
	if err != nil {
		log.Printf("Refill reminder query error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch refill reminders"})
		return
	}

	c.JSON(http.StatusOK, reminders)
}
