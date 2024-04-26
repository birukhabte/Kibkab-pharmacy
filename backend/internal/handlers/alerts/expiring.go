package alerts

import (
	"fmt"
	"time"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/google/uuid"
)

type ExpiringMedicine struct {
	MedicineName string    `json:"medicine_name"`
	Category     string    `json:"category"`
	ExpiryDate   time.Time `json:"expiry_date"`
	Quantity     float64   `json:"quantity"`
	BranchID     uuid.UUID `json:"branch_id"`
	BranchName   string    `json:"branch_name"`
}

func GetExpiringMedicinesNext60Days() ([]string, error) {
	var results []ExpiringMedicine

	query := `
	SELECT 
		m.name AS medicine_name,
		m.category,
		ms.expiry_date,
		ms.quantity,
		b.id AS branch_id,
		b.name AS branch_name
	FROM medicine_stocks ms
	JOIN medicines m ON ms.medicine_id = m.id
	JOIN branches b ON ms.branch_id = b.id
	WHERE ms.expiry_date <= CURDATE() + INTERVAL 60 DAY
	AND ms.quantity > 0
	ORDER BY ms.expiry_date ASC
	`

	err := db.DB.Raw(query).Scan(&results).Error
	if err != nil {
		return nil, err
	}

	messages := make([]string, 0, len(results))
	if len(results) > 0 {
		for _, med := range results {
			msg := fmt.Sprintf(
				"⚠️ Medicine '%s' (category: %s) is expiring on %s at branch '%s' (ID: %s). Remaining stock: %.2f units.",
				med.MedicineName,
				med.Category,
				med.ExpiryDate.Format("2006-01-02"),
				med.BranchName,
				med.BranchID.String(),
				med.Quantity,
			)
			messages = append(messages, msg)
		}
	}

	return messages, nil
}

