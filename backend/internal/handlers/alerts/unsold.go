package alerts

import (
	"fmt"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/google/uuid"
)

type UnsoldMedicine struct {
	MedicineName string    `json:"medicine_name"`
	Category     string    `json:"category"`
	Quantity     float64   `json:"quantity"`
	BranchID     uuid.UUID `json:"branch_id"`
	BranchName   string    `json:"branch_name"`
}

func GetUnsoldMedicinesLast30Days() ([]string, error) {
	var results []UnsoldMedicine

	query := `
	SELECT 
		m.name AS medicine_name,
		m.category,
		ms.quantity,
		b.id AS branch_id,
		b.name AS branch_name
	FROM medicine_stocks ms
	JOIN medicines m ON ms.medicine_id = m.id
	JOIN branches b ON ms.branch_id = b.id
	WHERE NOT EXISTS (
		SELECT 1
		FROM sale_items si
		JOIN sales s ON si.sale_id = s.id
		WHERE 
			si.medicine_id = ms.medicine_id
			AND s.branch_id = ms.branch_id
			AND s.sale_date >= NOW() - INTERVAL 30 DAY
			AND s.status = 'completed'
	)
	`

	err := db.DB.Raw(query).Scan(&results).Error
	if err != nil {
		return nil, err
	}

	message := make([]string, 0, 0)

	if len(results) > 0 {
		for _, med := range results {
			msg := fmt.Sprintf(
				"⚠️ Medicine '%s' (category: %s) has been unsold for more than a month at branch '%s' (ID: %s). Current stock: %.2f units.",
				med.MedicineName,
				med.Category,
				med.BranchName,
				med.BranchID.String(),
				med.Quantity,
			)
			message = append(message, msg)
		}
	}
	return message, nil
}
