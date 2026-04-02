package models

import (
	"time"

	"github.com/google/uuid"
)

type OrderPayment struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	OrderID     uuid.UUID `gorm:"type:uuid;not null;unique" json:"order_id"`
	PaymentDate time.Time `gorm:"not null" json:"payment_date"`
	CreatedAt   time.Time `gorm:"not null" json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	PaymentAmount float64   `gorm:"type:decimal(10,2);not null"`
	
	Order Order `gorm:"foreignKey:OrderID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT" json:"-"`
}
