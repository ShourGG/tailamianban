package main

import (
	"embed"
	"encoding/json"
	"fmt"
	"io"
	"io/fs"
	"log"
	"net/http"
	"os"
	"terraria-panel/internal/api"
	"terraria-panel/internal/service"

	"github.com/gin-gonic/gin"
)

// Version info
const Version = "v1.2.1.4"

//go:embed web/dist
var EmbedFS embed.FS

// Config represents the application configuration
type Config struct {
	Port int `json:"port"`
}

// loadConfig loads configuration from file or returns default
func loadConfig() int {
	configPath := "data/config.json"

	// Try to read config file
	data, err := os.ReadFile(configPath)
	if err != nil {
		// Config file doesn't exist, use default
		return 8080
	}

	var config Config
	if err := json.Unmarshal(data, &config); err != nil {
		log.Printf("Warning: Failed to parse config file, using default port 8080")
		return 8080
	}

	if config.Port <= 0 || config.Port > 65535 {
		log.Printf("Warning: Invalid port in config (%d), using default port 8080", config.Port)
		return 8080
	}

	return config.Port
}

func main() {
	// Print version information
	fmt.Printf("==============================================\n")
	fmt.Printf("  Terraria Panel %s\n", Version)
	fmt.Printf("  Starting backend server...\n")
	fmt.Printf("==============================================\n")

	// Initialize all services (including database)
	if err := service.InitializeServices(); err != nil {
		log.Fatalf("Failed to initialize services: %v", err)
	}

	// Load configuration
	port := loadConfig()

	// Create Gin router
	gin.SetMode(gin.ReleaseMode)
	gin.DefaultWriter = io.Discard

	r := gin.New()
	r.Use(gin.Recovery())

	// Setup API routes FIRST
	api.SetupRoutes(r)

	// Extract web/dist from embed.FS for correct serving
	distFS, err := fs.Sub(EmbedFS, "web/dist")
	if err != nil {
		log.Fatalf("Failed to extract dist folder: %v", err)
	}

	// Serve static files (HTML, CSS, JS, images, etc.)
	r.NoRoute(func(c *gin.Context) {
		path := c.Request.URL.Path

		// Try to open the file
		file, err := distFS.Open(path[1:]) // Remove leading "/"
		if err != nil {
			// File not found, serve index.html for SPA routing
			indexFile, err := distFS.Open("index.html")
			if err != nil {
				c.String(http.StatusNotFound, "404 page not found")
				return
			}
			defer indexFile.Close()

			indexData, err := io.ReadAll(indexFile)
			if err != nil {
				c.String(http.StatusInternalServerError, "Failed to read index.html")
				return
			}

			c.Data(http.StatusOK, "text/html; charset=utf-8", indexData)
			return
		}
		defer file.Close()

		// Get file info for content type detection
		stat, err := file.Stat()
		if err != nil || stat.IsDir() {
			// If it's a directory, serve index.html
			indexFile, err := distFS.Open("index.html")
			if err != nil {
				c.String(http.StatusNotFound, "404 page not found")
				return
			}
			defer indexFile.Close()

			indexData, err := io.ReadAll(indexFile)
			if err != nil {
				c.String(http.StatusInternalServerError, "Failed to read index.html")
				return
			}

			c.Data(http.StatusOK, "text/html; charset=utf-8", indexData)
			return
		}

		// Serve the file with proper content type
		http.ServeContent(c.Writer, c.Request, path, stat.ModTime(), file.(io.ReadSeeker))
	})

	// Start server
	fmt.Printf("Server listening on port %d\n", port)
	fmt.Printf("Open http://localhost:%d in your browser\n", port)
	fmt.Printf("First-time access will guide you to create an admin account\n")
	fmt.Printf("==============================================\n")
	if err := r.Run(fmt.Sprintf(":%d", port)); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
