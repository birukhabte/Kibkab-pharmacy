package main

import (
	"fmt"
	"log"
	"time"

	"github.com/gechjs/Pharmacy-App/config"
	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	// Load environment and connect to database
	config.LoadEnvVariable()
	db.ConnectToDb()

	// Create permissions
	permissions := []models.Permission{
		{ID: uuid.New(), Name: "manage_employees", Description: "Can manage employees", CreatedAt: time.Now()},
		{ID: uuid.New(), Name: "manage_branches", Description: "Can manage branches", CreatedAt: time.Now()},
		{ID: uuid.New(), Name: "manage_customers", Description: "Can manage customers", CreatedAt: time.Now()},
		{ID: uuid.New(), Name: "manage_roles", Description: "Can manage roles", CreatedAt: time.Now()},
		{ID: uuid.New(), Name: "manage_inventory", Description: "Can manage inventory", CreatedAt: time.Now()},
		{ID: uuid.New(), Name: "create_sales", Description: "Can create sales", CreatedAt: time.Now()},
		{ID: uuid.New(), Name: "approve_sales", Description: "Can approve sales", CreatedAt: time.Now()},
		{ID: uuid.New(), Name: "view_reports", Description: "Can view reports", CreatedAt: time.Now()},
		{ID: uuid.New(), Name: "manage_suppliers", Description: "Can manage suppliers", CreatedAt: time.Now()},
		{ID: uuid.New(), Name: "adjust_stock", Description: "Can adjust stock", CreatedAt: time.Now()},
		{ID: uuid.New(), Name: "create_orders", Description: "Can create orders", CreatedAt: time.Now()},
		{ID: uuid.New(), Name: "pay_orders", Description: "Can pay orders", CreatedAt: time.Now()},
		{ID: uuid.New(), Name: "pay_commissions", Description: "Can pay commissions", CreatedAt: time.Now()},
		{ID: uuid.New(), Name: "view_alerts", Description: "Can view alerts", CreatedAt: time.Now()},
	}

	for _, perm := range permissions {
		db.DB.FirstOrCreate(&perm, models.Permission{Name: perm.Name})
	}
	log.Println("✓ Permissions created")

	// Create Admin Role
	desc := "Administrator with full access"
	adminRole := models.Role{
		ID:          uuid.New(),
		Name:        "Admin",
		Commission:  0.00,
		Threshold:   0.00,
		Description: &desc,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	
	result := db.DB.FirstOrCreate(&adminRole, models.Role{Name: "Admin"})
	if result.Error != nil {
		log.Fatalf("Failed to create admin role: %v", result.Error)
	}
	log.Println("✓ Admin role created")

	// Assign all permissions to Admin role
	var allPermissions []models.Permission
	db.DB.Find(&allPermissions)
	db.DB.Model(&adminRole).Association("Permissions").Replace(allPermissions)
	log.Println("✓ Permissions assigned to Admin role")

	// Hash password
	password := "admin123"
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Failed to hash password: %v", err)
	}

	// Create Admin User
	adminUser := models.Employee{
		ID:             uuid.New(),
		BranchID:       nil,
		RoleID:         adminRole.ID,
		Email:          "admin@pharmacy.com",
		Username:       "admin",
		FirstName:      "System",
		LastName:       "Administrator",
		Phone:          "1234567890",
		PasswordHashed: string(hashedPassword),
		Active:         true,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	result = db.DB.Where("username = ?", "admin").FirstOrCreate(&adminUser)
	if result.Error != nil {
		log.Fatalf("Failed to create admin user: %v", result.Error)
	}

	// Update password if user already exists
	db.DB.Model(&adminUser).Where("username = ?", "admin").Update("password_hashed", string(hashedPassword))

	fmt.Println("\n✓ Admin user created successfully!")
	fmt.Println("\nLogin credentials:")
	fmt.Println("  Username: admin")
	fmt.Println("  Password: admin123")
	fmt.Println("\nPlease change the password after first login!")
}
