package models

import (
	"time"

	"github.com/google/uuid"
)

type ActivityLog struct {
	ID         uuid.UUID  `gorm:"type:uuid;primaryKey" json:"id"`
	EmployeeID uuid.UUID  `gorm:"type:uuid" json:"employee_id"`
	Action     string     `gorm:"type:varchar(100);not null" json:"action"` // e.g. "create_order", "approve_sale"
	EntityID   *uuid.UUID `gorm:"type:uuid" json:"entity_id"`           // optional: ID of order, sale, etc.
	EntityType string     `gorm:"type:varchar(100)" json:"entity_type"`     // e.g. "sale", "purchase", "order"
	Message    string     `gorm:"type:text;not null" json:"message"`        // human-readable: "Employee X approved Sale Y"
	CreatedAt  time.Time  `gorm:"not null;autoCreateTime" json:"created_at"`

	Employee Employee `gorm:"foreignKey:EmployeeID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL" json:"-"`
}
