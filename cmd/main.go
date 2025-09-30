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
	Version = "1.1.9.4"
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
	log.Println("🚀 Starting Terraria Panel...")
	log.Printf("📌 Version: %s (Build: %s)", Version, Build)
	log.Printf("💻 Go Version: %s", runtime.Version())
	log.Printf("🖥️  OS/Arch: %s/%s", runtime.GOOS, runtime.GOARCH)
	log.Printf("🔧 Working Directory: %s", getWorkingDir())

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

	fmt.Println("\n╔════════════════════════════════════════════════╗")
	fmt.Println("║         🎮 Server is Ready!                    ║")
	fmt.Println("╚════════════════════════════════════════════════╝")
	log.Printf("🌐 Server listening on port: %s", port)
	log.Printf("📱 Web interface: http://localhost:%s", port)
	log.Printf("🔧 API endpoint: http://localhost:%s/api", port)
	log.Printf("❤️  Health check: http://localhost:%s/api/health", port)
	fmt.Println(strings.Repeat("─", 50))

	if err := r.Run(":" + port); err != nil {
		log.Fatalf("❌ Failed to start server: %v", err)
	}
}

func printDiagnosticBanner() {
	fmt.Println("\n╔════════════════════════════════════════════════╗")
	fmt.Println("║   泰拉瑞亚服务器管理面板 - 诊断信息           ║")
	fmt.Println("║   Terraria Server Management Panel            ║")
	fmt.Println("╚════════════════════════════════════════════════╝\n")

	fmt.Printf("📦 Version: %s (Build: %s)\n", Version, Build)
	fmt.Printf("🐹 Go Version: %s\n", runtime.Version())
	fmt.Printf("💻 OS/Arch: %s/%s\n", runtime.GOOS, runtime.GOARCH)
	fmt.Printf("📂 Working Dir: %s\n", getWorkingDir())
	fmt.Printf("🔧 CPU Cores: %d\n", runtime.NumCPU())

	// Check environment variables
	fmt.Println("\n🔍 Environment Configuration:")
	printEnvVar("PORT", "8080")
	printEnvVar("GIN_MODE", "release")
	printEnvVar("DB_PATH", "./data/panel.db")
	printEnvVar("DATA_DIR", "./data")

	// Check important paths
	fmt.Println("\n📁 Path Check:")
	checkPath("./dist", "Frontend assets")
	checkPath("./data", "Data directory")

	fmt.Println("\n" + strings.Repeat("─", 50) + "\n")
}

func printEnvVar(key, defaultValue string) {
	value := os.Getenv(key)
	if value == "" {
		value = defaultValue + " (default)"
	}
	fmt.Printf("  • %s: %s\n", key, value)
}

func checkPath(path, description string) {
	if _, err := os.Stat(path); err == nil {
		fmt.Printf("  ✅ %s exists at %s\n", description, path)
	} else {
		fmt.Printf("  ⚠️  %s NOT FOUND at %s\n", description, path)
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
