package models

import (
	"time"

	"github.com/google/uuid"
)

type Branch struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	Name      string    `gorm:"type:varchar(100);not null;index:idx_name_location,unique" json:"name"`
	Location  string    `gorm:"type:varchar(100);not null;index:idx_name_location,unique" json:"location"`
	Phone     string    `gorm:"type:varchar(20);not null" json:"phone"`
	CreatedAt time.Time `gorm:"not null" json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
