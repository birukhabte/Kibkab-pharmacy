package models

import (
	"time"

	"github.com/google/uuid"
)

type Supplier struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	Name      string    `gorm:"not null;index:idx_name_phone,unique" json:"name"`
	Phone     string    `gorm:"not null;index:idx_name_phone,unique" json:"phone"`
	Email     string    `gorm:"" json:"email"`
	Address   string    `gorm:"" json:"address"`
	CreatedAt time.Time `gorm:"not null" json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
