package models

import (
	"time"

	"github.com/google/uuid"
)

type Sale struct {
	ID          uuid.UUID  `gorm:"type:uuid;primaryKey" json:"id"`
	BranchID    *uuid.UUID `gorm:"type:uuid" json:"branch_id"`
	EmployeeID  uuid.UUID  `gorm:"not null;type:uuid" json:"employee_id"`
	ApprovedBy  *uuid.UUID `gorm:"type:uuid" json:"approved_by"`
	CustomerID  *uuid.UUID `gorm:"type:uuid" json:"customer_id"`
	RecurringID *uuid.UUID `gorm:"type:uuid" json:"recurring_id"`
	SaleDate    time.Time  `gorm:"not null" json:"sale_date"`
	Status      string     `gorm:"not null;check:status IN ('pending', 'completed', 'canceled');default:'pending'"`
	TotalPrice  float64    `gorm:"type:decimal(10,2);not null" json:"total_price"`

	Branch   Branch   `gorm:"foreignKey:BranchID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL" json:"-"`
	Employee Employee `gorm:"foreignKey:EmployeeID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL" json:"-"`
	Customer Customer `gorm:"foreignKey:CustomerID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL" json:"-"`

	Items []SaleItem `gorm:"foreignKey:SaleID" json:"items"`
}
