package models

import (
	"time"

	"github.com/google/uuid"
)

type Employee struct {
	ID             uuid.UUID  `gorm:"type:uuid;primaryKey" json:"id"`
	BranchID       *uuid.UUID `gorm:"type:uuid" json:"branch_id"`
	RoleID         uuid.UUID  `gorm:"type:uuid;not null" json:"role_id"`
	Email          string     `gorm:"type:varchar(191);unique;not null" json:"email"`
	Username       string     `gorm:"type:varchar(100);unique;not null" json:"username"`
	FirstName      string     `gorm:"type:varchar(100);not null" json:"first_name"`
	LastName       string     `gorm:"type:varchar(100);not null" json:"last_name"`
	Phone          string     `gorm:"type:varchar(20);not null" json:"phone"`
	PasswordHashed string     `gorm:"not null" json:"-"`
	Active         bool       `gorm:"not null" json:"active"`
	CreatedAt      time.Time  `gorm:"not null" json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`

	Branch Branch `gorm:"foreignKey:BranchID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL" json:"-"`
	Role   Role   `gorm:"foreignKey:RoleID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT" json:"-"`
}
