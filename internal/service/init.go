package service

import (
	"log"
	"os"
	"path/filepath"
	"terraria-panel/internal/repository"
)

// InitializeServices initializes all application services
func InitializeServices() error {
	log.Println("🔧 Initializing services...")

	// Ensure data directory exists
	dataDir := getDataDir()
	if err := os.MkdirAll(dataDir, 0755); err != nil {
		return err
	}

	// Initialize database
	dbPath := filepath.Join(dataDir, "panel.db")
	if err := repository.InitDatabase(dbPath); err != nil {
		return err
	}

	// ⚠️ Default user creation disabled to support web-based first-time registration
	// Users must register the first admin account through the web interface on first access
	// if err := initializeDefaultUser(); err != nil {
	// 	return err
	// }

	// Initialize other services
	if err := initializeSystemMonitoring(); err != nil {
		return err
	}

	log.Println("✅ Services initialized successfully")
	return nil
}

func getDataDir() string {
	if dataDir := os.Getenv("DATA_DIR"); dataDir != "" {
		return dataDir
	}
	return "./data"
}

func initializeDefaultUser() error {
	// Check if any admin user exists
	exists, err := repository.AdminUserExists()
	if err != nil {
		return err
	}

	if !exists {
		log.Println("📝 Creating default admin user...")

		// Create default admin user
		// Username: admin, Password: admin123 (should be changed on first login)
		hashedPassword, err := HashPassword("admin123")
		if err != nil {
			return err
		}

		user := &repository.User{
			Username: "admin",
			Password: hashedPassword,
			Role:     "admin",
			Email:    "admin@terraria-panel.local",
		}

		if err := repository.CreateUser(user); err != nil {
			return err
		}

		log.Println("✅ Default admin user created (username: admin, password: admin123)")
		log.Println("⚠️  Please change the default password after first login!")
	}

	return nil
}

func initializeSystemMonitoring() error {
	log.Println("📊 Initializing system monitoring...")

	// Start background monitoring goroutines
	go startMetricsCollection()

	return nil
}

func startMetricsCollection() {
	// TODO: Implement metrics collection
	// This will run in background and collect system metrics
	log.Println("📈 Metrics collection started")
}
