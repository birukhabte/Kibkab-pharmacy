package alerts

import (
	"log"
	"time"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/google/uuid"
)

func RunAllAlerts() error {
	var allMessages []string

	// Run individual alerts
	unsold, err := GetUnsoldMedicinesLast30Days()
	if err != nil {
		log.Printf("unsold error: %v", err)
	}
	allMessages = append(allMessages, unsold...)

	expiring, err := GetExpiringMedicinesNext60Days()
	if err != nil {
		log.Printf("expiring error: %v", err)
	}
	allMessages = append(allMessages, expiring...)

	lowStock, err := GetLowStockMedicines(10.0) // you can change threshold
	if err != nil {
		log.Printf("low stock error: %v", err)
	}
	allMessages = append(allMessages, lowStock...)

	// Insert into alerts table
	for _, msg := range allMessages {
		alert := models.Alert{
			ID:        uuid.New(),
			Message:   msg,
			CreatedAt: time.Now(),
		}
		if err := db.DB.Create(&alert).Error; err != nil {
			log.Printf("failed to insert alert: %v", err)
		}
	}

	log.Printf("Inserted %d alerts", len(allMessages))
	return nil
}
