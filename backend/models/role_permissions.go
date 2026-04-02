package models

import (
	"time"

	"github.com/google/uuid"
)

type RolePermission struct {
	RoleID       uuid.UUID `gorm:"type:uuid;not null;primaryKey" json:"role_id"`
	PermissionID uuid.UUID `gorm:"type:uuid;not null;primaryKey" json:"permission_id"`
	CreatedAt    time.Time `gorm:"type:timestamp;not null" json:"created_at"`

	Role       Role       `gorm:"foreignKey:RoleID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"-"`
	Permission Permission `gorm:"foreignKey:PermissionID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"-"`
}
