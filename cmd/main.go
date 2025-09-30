package main

import (
	"embed"
	"fmt"
	"io"
	"log"
	"os"
	"runtime"
	"terraria-panel/internal/api"
	"terraria-panel/internal/api/handlers"
	"terraria-panel/internal/service"

	"github.com/gin-gonic/gin"
	static "github.com/soulteary/gin-static"
)

//go:embed all:dist
var EmbedFS embed.FS

var (
	// Version will be set by ldflags during build
	Version = "1.0.0"
	Build   = "dev"
)

func main() {
	// Parse command line arguments
	if len(os.Args) > 1 {
		switch os.Args[1] {
		case "--version", "-v":
			fmt.Printf("Terraria Panel %s (Build: %s)\n", Version, Build)
			fmt.Printf("Go Version: %s\n", runtime.Version())
			fmt.Printf("OS/Arch: %s/%s\n", runtime.GOOS, runtime.GOARCH)
			return
		case "--help", "-h":
			printHelp()
			return
		}
	}

	// Initialize services
	log.Println("🚀 Starting Terraria Panel...")
	log.Printf("📌 Version: %s (Build: %s)", Version, Build)

	// Set version information in handlers
	handlers.AppVersion = Version
	handlers.BuildInfo = Build

	// Initialize database and services
	if err := service.InitializeServices(); err != nil {
		log.Fatalf("❌ Failed to initialize services: %v", err)
	}

	// Setup Gin
	if os.Getenv("GIN_MODE") == "" {
		gin.SetMode(gin.ReleaseMode)
		gin.DefaultWriter = io.Discard
	}

	r := gin.Default()

	// Global middleware
	r.Use(corsMiddleware())
	r.Use(securityMiddleware())

	// API routes
	api.SetupRoutes(r)

	// Static files (embedded frontend)
	// Static files (embedded frontend)
	embedFS, err := static.EmbedFolder(EmbedFS, "dist")
	if err != nil {
		log.Printf("⚠️  Failed to create embed folder: %v", err)
		log.Println("📌 Frontend assets may not be available")
	} else {
		r.Use(static.Serve("/", embedFS))
	}

	// Fallback for SPA routing
	r.NoRoute(func(c *gin.Context) {
		data, err := EmbedFS.ReadFile("dist/index.html")
		if err != nil {
			c.String(404, "Page not found")
			return
		}
		c.Data(200, "text/html; charset=utf-8", data)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🌐 Server starting on port %s", port)
	log.Printf("📱 Web interface: http://localhost:%s", port)
	log.Printf("🔧 API endpoint: http://localhost:%s/api", port)

	if err := r.Run(":" + port); err != nil {
		log.Fatalf("❌ Failed to start server: %v", err)
	}
}

func printHelp() {
	fmt.Printf(`Terraria Panel %s - Game Server Management Panel

Usage:
  terraria-panel [options]

Options:
  -v, --version    Show version information
  -h, --help       Show this help message

Environment Variables:
  PORT             Server port (default: 8080)
  GIN_MODE         Gin mode (debug/release, default: release)
  DB_PATH          Database file path (default: ./data/panel.db)
  TERRARIA_PATH    Terraria server executable path
  WORLDS_PATH      Terraria worlds directory path

Examples:
  terraria-panel                    # Start with default settings
  PORT=9000 terraria-panel          # Start on port 9000
  GIN_MODE=debug terraria-panel     # Start in debug mode

For more information, visit: https://github.com/ShourGG/tailamianban
`, Version)
}

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

func securityMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Security headers
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("X-Frame-Options", "SAMEORIGIN")
		c.Header("X-XSS-Protection", "1; mode=block")
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")
		// Relaxed CSP for Vue application, Monaco Editor, and Spline 3D compatibility
		c.Header("Content-Security-Policy",
			"default-src 'self'; "+
				"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://prod.spline.design; "+
				"style-src 'self' 'unsafe-inline' https:; "+
				"font-src 'self' data: https:; "+
				"img-src 'self' data: https: blob:; "+
				"connect-src 'self' ws: wss: https://prod.spline.design https://*.spline.design; "+
				"worker-src 'self' blob:; "+
				"child-src 'self' blob:")

		c.Next()
	}
}
