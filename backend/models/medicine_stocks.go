package models

import (
	"time"

	"github.com/google/uuid"
)

type MedicineStock struct {
	ID            uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	BranchID      uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:idx_branch_medicine_expiry" json:"branch_id"`
	MedicineID    uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:idx_branch_medicine_expiry" json:"medicine_id"`
	ExpiryDate    time.Time `gorm:"type:date;not null" json:"expiry_date"`
	PurchasePrice float64   `gorm:"type:decimal(10,2);not null" json:"purchase_price"`
	SellingPrice  float64   `gorm:"type:decimal(10,2);not null" json:"selling_price"`
	Quantity      float64   `gorm:"not null" json:"quantity"`
	CreatedAt     time.Time `gorm:"not null" json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`

	Branch   Branch   `gorm:"foreignKey:BranchID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT" json:"-"`
	Medicine Medicine `gorm:"foreignKey:MedicineID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT" json:"-"`
}
