package models

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type EmployeePayment struct {
	ID            uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	EmployeeID    uuid.UUID `gorm:"type:uuid;not null" json:"employee_id"`
	BranchID      uuid.UUID `gorm:"type:uuid;not null" json:"branch_id"`
	PaymentAmount float64   `gorm:"type:decimal(10,2);not null" json:"payment_amount"`
	PaymentType   string    `gorm:"not null" json:"payment_type"`
	PaymentDate   time.Time `gorm:"not null" json:"payment_date"`
	Description   string    `gorm:"" json:"description"`
	CreatedAt     time.Time `gorm:"not null" json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`

	Employee Employee `gorm:"foreignKey:EmployeeID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"-"`
	Branch   Branch   `gorm:"foreignKey:BranchID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"-"`
}

// BeforeSave enforces the check constraint for payment_amount > 0
func (ep *EmployeePayment) BeforeSave(tx *gorm.DB) error {
	if ep.PaymentAmount <= 0 {
		return errors.New("payment_amount must be greater than 0")
	}
	return nil
}
