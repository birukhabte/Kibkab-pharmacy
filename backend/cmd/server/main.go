package main

import (
	"github.com/gechjs/Pharmacy-App/config"
	"github.com/gechjs/Pharmacy-App/db"
	// "github.com/gechjs/Pharmacy-App/internal/handlers/alerts"
	// commissions "github.com/gechjs/Pharmacy-App/internal/handlers/commissions"
	"github.com/gechjs/Pharmacy-App/router"
)

func init() {
	config.LoadEnvVariable()
	db.ConnectToDb()
	db.MigrateTables()
}

func main() {
	// commissions.StartDailyCommissionJob()
	// alerts.StartDailyAlertJob()
	router.RunServer()
}
