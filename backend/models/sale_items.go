package models

import "github.com/google/uuid"

// SaleItem represents the sale_items table in the database
type SaleItem struct {
	ID              uuid.UUID  `gorm:"type:uuid;primaryKey" json:"id"`
	SaleID          *uuid.UUID `gorm:"type:uuid" json:"sale_id"`
	MedicineID      *uuid.UUID `gorm:"type:uuid" json:"medicine_id"`
	Quantity        float64    `gorm:"not null" json:"quantity"`
	IndividualPrice float64    `gorm:"not null;type:decimal(10,2);not null" json:"individual_price"`
	Total           float64    `gorm:"not null;type:decimal(10,2);not null" json:"total"`

	Sale     Sale     `gorm:"foreignKey:SaleID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL" json:"-"`
	Medicine Medicine `gorm:"foreignKey:MedicineID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL" json:"-"`
}
