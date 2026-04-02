package models

import (
	"time"

	"github.com/google/uuid"
)

type OrderStatus string

const (
	OrderStatusPending  OrderStatus = "PENDING"
	OrderStatusApproved OrderStatus = "APPROVED"
	OrderStatusCanceled OrderStatus = "CANCELED"
)

type Order struct {
	ID         uuid.UUID   `gorm:"type:uuid;primaryKey" json:"id"`
	SupplierID uuid.UUID   `gorm:"type:uuid;not null" json:"supplier_id"`
	BranchID   uuid.UUID   `gorm:"type:uuid;not null" json:"branch_id"`
	EmployeeID uuid.UUID   `gorm:"type:uuid;not null" json:"employee_id"`
	Total      float64     `gorm:"type:decimal(10,2);default:0.00;not null" json:"total"`
	IsPaid     bool        `gorm:"default:false"`
	Status     OrderStatus `gorm:"type:varchar(20);default:'PENDING';check:status IN ('PENDING','APPROVED','CANCELED')" json:"status"`
	OrderDate  time.Time   `gorm:"not null" json:"purchase_date"`
	DueDate    time.Time   `gorm:"not null" json:"due_date"`

	CreatedAt time.Time `gorm:"not null" json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	Supplier Supplier `gorm:"foreignKey:SupplierID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT" json:"-"`
	Branch   Branch   `gorm:"foreignKey:BranchID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT" json:"-"`
	Employee Employee `gorm:"foreignKey:EmployeeID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT" json:"-"`
}
