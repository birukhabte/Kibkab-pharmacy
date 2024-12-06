package db

import (
	"context"
	"fmt"
	"log"
	"net"
	"os"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/stdlib"
)

var DB *gorm.DB

func ConnectToDb() {
	newLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags),
		logger.Config{
			SlowThreshold:             time.Second,
			LogLevel:                  logger.Silent,
			IgnoreRecordNotFoundError: true,
			ParameterizedQueries:      true,
			Colorful:                  false,
		},
	)

	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	name := os.Getenv("DB_NAME")
	sslmode := os.Getenv("DB_SSLMODE")
	
	if sslmode == "" {
		sslmode = "require"
	}

	log.Printf("Attempting to connect to database at %s:%s", host, port)

	// Create a custom dialer that only uses IPv4
	dialer := &net.Dialer{
		Timeout:   30 * time.Second,
		KeepAlive: 30 * time.Second,
	}
	
	// Custom dial function that forces IPv4
	dialFunc := func(ctx context.Context, network, addr string) (net.Conn, error) {
		// Force tcp4 instead of tcp to avoid IPv6
		return dialer.DialContext(ctx, "tcp4", addr)
	}

	// Build connection string
	dsn := fmt.Sprintf("postgresql://%s:%s@%s:%s/%s?sslmode=%s",
		user, password, host, port, name, sslmode)
	
	log.Println("Connecting with IPv4-only dialer...")

	// Parse config and set custom dialer
	config, err := pgx.ParseConfig(dsn)
	if err != nil {
		log.Fatalf("Failed to parse database config: %v", err)
	}
	
	config.DialFunc = dialFunc
	
	// Register the driver with custom config
	connStr := stdlib.RegisterConnConfig(config)
	
	// Open connection with GORM
	DB, err = gorm.Open(postgres.New(postgres.Config{
		DriverName: "pgx",
		DSN:        connStr,
	}), &gorm.Config{Logger: newLogger})
	
	if err != nil {
		log.Fatalf("Unable to connect to DB: %v", err)
	}
	
	// Configure connection pool
	sqlDB, err := DB.DB()
	if err != nil {
		log.Fatalf("Failed to get database instance: %v", err)
	}
	
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)
	
	log.Println("Successfully connected to PostgreSQL DB")
}

