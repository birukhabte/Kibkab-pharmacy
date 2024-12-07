package activity

import (
	"time"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/google/uuid"
)

// LogActivity logs an activity for a given employee without relying on gin.Context.
func LogActivity(employeeID uuid.UUID, action, entityType string, entityID *uuid.UUID, message string) error {
	logEntry := models.ActivityLog{
		ID:         uuid.New(),
		EmployeeID: employeeID,
		Action:     action,
		EntityType: entityType,
		EntityID:   entityID,
		Message:    message,
		CreatedAt:  time.Now(),
	}

	return db.DB.Create(&logEntry).Error
}






