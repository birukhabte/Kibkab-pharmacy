package models

import (
	"time"

	"github.com/google/uuid"
)

type Commission struct {
	ID         uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	EmployeeID uuid.UUID `gorm:"type:uuid;not null;index:idx_employee_date,unique" json:"employee_id"`
	Date       time.Time `gorm:"type:date;not null;index:idx_employee_date,unique" json:"date"` // sales date
	TotalSold  float64   `gorm:"type:decimal(10,2);not null" json:"total_sold"`
	Commission float64   `gorm:"type:decimal(5,2);default:0;check:commission >= 0 AND commission <= 100" json:"commission"`
	Threshold  float64   `gorm:"type:decimal(10,2);default:0;check:threshold >= 0" json:"threshold"`
	Amount     float64   `gorm:"type:decimal(10,2);not null" json:"amount"`
	Paid       bool      `gorm:"default:false;not null" json:"paid"`
	CreatedAt  time.Time `gorm:"not null" json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`

	Employee Employee `gorm:"foreignKey:EmployeeID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"employee"`
}
