package models

import (
	"time"

	"github.com/google/uuid"
)

type Alert struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	Message   string    `gorm:"type:text;not null" json:"message"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
}
