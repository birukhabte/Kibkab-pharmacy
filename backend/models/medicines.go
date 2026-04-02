package models

import (
	"time"

	"github.com/google/uuid"
)

type Medicine struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	Name        string    `gorm:"type:varchar(100);not null;uniqueIndex:uni_medicine_triplet" json:"name"`
	Brand       string    `gorm:"type:varchar(100);not null;uniqueIndex:uni_medicine_triplet" json:"brand"`
	Category    string    `gorm:"type:varchar(100);not null;uniqueIndex:uni_medicine_triplet" json:"category"`
	Description string    `gorm:"not null" json:"description"`
	CreatedAt   time.Time `gorm:"not null" json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
