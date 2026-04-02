package db

import (
	"log"

	"github.com/gechjs/Pharmacy-App/models"
)

func MigrateTables() {
	var tables = []any{
		models.Customer{},
		models.Role{},
		models.Employee{},
		models.Branch{},
		models.Medicine{},
		models.MedicineStock{},
		models.RecurringSale{},
		models.Order{},
		models.OrderPayment{},
		models.Permission{},
		models.RolePermission{},
		models.Supplier{},
		models.Sale{},
		models.SaleItem{},
		models.Commission{},
		models.Alert{},
		models.ActivityLog{},
	}
	for _, table := range tables {
		if err := DB.AutoMigrate(table); err != nil {
			log.Fatalf("Error migrating %T: %v\n", table, err)
		} else {
			log.Printf("Successfully migrated model:%T\n", table)
		}
	}
}
