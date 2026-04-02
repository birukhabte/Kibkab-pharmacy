package models

import (
	"time"

	"github.com/google/uuid"
)

type RecurringSale struct {
	ID                 uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	CustomerID         uuid.UUID `gorm:"type:uuid;not null" json:"customer_id"`
	MedicineID         uuid.UUID `gorm:"type:uuid;not null" json:"medicine_id"`
	IntervalDays       int       `gorm:"not null" json:"interval_days"`
	PrescribedQuantity int       `gorm:"not null" json:"prescribed_quantity"`
	SoldQuantity       int       `gorm:"not null" json:"sold_quantity"`
	StartDate          time.Time `gorm:"type:date;not null" json:"start_date"`
	LastPurchaseDate   time.Time `gorm:"type:date" json:"last_purchase_date"`
	Active             bool      `gorm:"default:1;not null" json:"active"`
	CreatedAt          time.Time `gorm:"not null" json:"created_at"`

	Customer Customer `gorm:"foreignKey:CustomerID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT" json:"-"`
	Medicine Medicine `gorm:"foreignKey:MedicineID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT" json:"-"`
}
