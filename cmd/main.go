package main

import (
	"embed"
	"fmt"
	"io"
	"log"
	"os"
	"runtime"
	"strings"
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
	Version = "1.1.9.34"
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

	// Print diagnostic banner
	printDiagnosticBanner()

	// Initialize services
	log.Println("馃殌 Starting Terraria Panel...")
	log.Printf("馃搶 Version: %s (Build: %s)", Version, Build)
	log.Printf("馃捇 Go Version: %s", runtime.Version())
	log.Printf("馃枼锔? OS/Arch: %s/%s", runtime.GOOS, runtime.GOARCH)
	log.Printf("馃敡 Working Directory: %s", getWorkingDir())

	// Set version information in handlers
	handlers.AppVersion = Version
	handlers.BuildInfo = Build

	// Initialize database and services
	if err := service.InitializeServices(); err != nil {
		log.Fatalf("鉂?Failed to initialize services: %v", err)
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
	embedFS, err := static.EmbedFolder(EmbedFS, "dist")
	if err != nil {
		log.Printf("鈿狅笍  Failed to create embed folder: %v", err)
		log.Println("馃搶 Frontend assets may not be available")
	} else {
		// Only serve static files for non-API requests
		r.Use(func(c *gin.Context) {
			// Skip static file serving for API routes
			if !strings.HasPrefix(c.Request.URL.Path, "/api/") {
				static.Serve("/", embedFS)(c)
			}
		})
	}

	// Fallback for SPA routing (only for non-API routes)
	r.NoRoute(func(c *gin.Context) {
		// If it's an API request, return 404 JSON
		if strings.HasPrefix(c.Request.URL.Path, "/api/") {
			c.JSON(404, gin.H{"error": "API endpoint not found", "path": c.Request.URL.Path})
			return
		}

		// For non-API requests, serve SPA index.html
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

	fmt.Println("\n鈺斺晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晽")
	fmt.Println("鈺?        馃幃 Server is Ready!                    鈺?)
	fmt.Println("鈺氣晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨暆")
	log.Printf("馃寪 Server listening on port: %s", port)
	log.Printf("馃摫 Web interface: http://localhost:%s", port)
	log.Printf("馃敡 API endpoint: http://localhost:%s/api", port)
	log.Printf("鉂わ笍  Health check: http://localhost:%s/api/health", port)
	fmt.Println(strings.Repeat("鈹€", 50))

	if err := r.Run(":" + port); err != nil {
		log.Fatalf("鉂?Failed to start server: %v", err)
	}
}

func printDiagnosticBanner() {
	fmt.Println("\n鈺斺晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晽")
	fmt.Println("鈺?  娉版媺鐟炰簹鏈嶅姟鍣ㄧ鐞嗛潰鏉?- 璇婃柇淇℃伅           鈺?)
	fmt.Println("鈺?  Terraria Server Management Panel            鈺?)
	fmt.Println("鈺氣晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨暆\n")

	fmt.Printf("馃摝 Version: %s (Build: %s)\n", Version, Build)
	fmt.Printf("馃惞 Go Version: %s\n", runtime.Version())
	fmt.Printf("馃捇 OS/Arch: %s/%s\n", runtime.GOOS, runtime.GOARCH)
	fmt.Printf("馃搨 Working Dir: %s\n", getWorkingDir())
	fmt.Printf("馃敡 CPU Cores: %d\n", runtime.NumCPU())

	// Check environment variables
	fmt.Println("\n馃攳 Environment Configuration:")
	printEnvVar("PORT", "8080")
	printEnvVar("GIN_MODE", "release")
	printEnvVar("DB_PATH", "./data/panel.db")
	printEnvVar("DATA_DIR", "./data")

	// Check important paths
	fmt.Println("\n馃搧 Resource Check:")
	checkEmbedFS()
	checkPath("./data", "Data directory")

	fmt.Println("\n" + strings.Repeat("鈹€", 50) + "\n")
}

func printEnvVar(key, defaultValue string) {
	value := os.Getenv(key)
	if value == "" {
		value = defaultValue + " (default)"
	}
	fmt.Printf("  锟?%s: %s\n", key, value)
}

func checkPath(path, description string) {
	if _, err := os.Stat(path); err == nil {
		fmt.Printf("  锟?%s exists at %s\n", description, path)
	} else {
		fmt.Printf("  鈿狅笍  %s NOT FOUND at %s\n", description, path)
	}
}

func checkEmbedFS() {
	// Check if index.html exists in embed
	if data, err := EmbedFS.ReadFile("dist/index.html"); err == nil {
		fmt.Printf("  锟?Frontend assets embedded (index.html: %d bytes)\n", len(data))
	} else {
		fmt.Printf("  锟?Frontend assets NOT embedded: %v\n", err)
	}
}

func getWorkingDir() string {
	dir, err := os.Getwd()
	if err != nil {
		return "unknown"
	}
	return dir
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
				"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://prod.spline.design https://unpkg.com; "+
				"style-src 'self' 'unsafe-inline' https:; "+
				"font-src 'self' data: https:; "+
				"img-src 'self' data: https: blob:; "+
				"connect-src 'self' ws: wss: https://prod.spline.design https://*.spline.design https://unpkg.com; "+
				"worker-src 'self' blob:; "+
				"child-src 'self' blob:")

		c.Next()
	}
}
