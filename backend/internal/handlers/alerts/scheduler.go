package alerts

import (
	"log"

	"github.com/robfig/cron/v3"
)

func StartDailyAlertJob() {
	c := cron.New()

	// Schedule at midnight every day
	_, err := c.AddFunc("0 0 * * *", func() {
		log.Println("⏰ Running midnight alert job...")
		if err := RunAllAlerts(); err != nil {
			log.Printf("❌ Failed to run alerts: %v", err)
		}
	})
	if err != nil {
		log.Fatalf("❌ Failed to schedule alert job: %v", err)
	}

	c.Start()
}
