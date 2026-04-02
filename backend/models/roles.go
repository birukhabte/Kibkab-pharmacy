package models

import (
	"time"

	"github.com/google/uuid"
)

type Role struct {
	ID          uuid.UUID    `gorm:"type:uuid;primaryKey" json:"id"`
	Name        string       `gorm:"type:varchar(100);not null;unique" json:"name"`
	Commission  float64      `gorm:"type:decimal(5,2);default:0;check:commission >= 0 AND commission <= 100" json:"commission"`
	Threshold   float64      `gorm:"type:decimal(10,2);default:0;check:threshold >= 0" json:"threshold"`
	Permissions []Permission `gorm:"many2many:role_permissions;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"permissions"`
	Description *string      `gorm:"" json:"description"`

	CreatedAt time.Time `gorm:"not null" json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
