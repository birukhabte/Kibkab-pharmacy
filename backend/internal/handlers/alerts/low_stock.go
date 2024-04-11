package alerts

import (
	"fmt"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/google/uuid"
)

type LowStockMedicine struct {
	MedicineName string    `json:"medicine_name"`
	Category     string    `json:"category"`
	Quantity     float64   `json:"quantity"`
	BranchID     uuid.UUID `json:"branch_id"`
	BranchName   string    `json:"branch_name"`
}

func GetLowStockMedicines(threshold float64) ([]string, error) {
	var results []LowStockMedicine

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
	WHERE ms.quantity < ?
	ORDER BY ms.quantity ASC
	`

	err := db.DB.Raw(query, threshold).Scan(&results).Error
	if err != nil {
		return nil, err
	}

	messages := make([]string, 0, len(results))
	if len(results) > 0 {
		for _, med := range results {
			msg := fmt.Sprintf(
				"⚠️ Low stock alert: Medicine '%s' (category: %s) has only %.2f units left at branch '%s' (ID: %s).",
				med.MedicineName,
				med.Category,
				med.Quantity,
				med.BranchName,
				med.BranchID.String(),
			)
			messages = append(messages, msg)
		}
	}

	return messages, nil
}


