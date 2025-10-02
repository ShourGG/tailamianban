package main

import (
	"embed"
	"fmt"
	"io"
	"io/fs"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"terraria-panel/internal/api"
	"terraria-panel/internal/api/handlers"
	"terraria-panel/internal/service"

	"github.com/gin-gonic/gin"
)

//go:embed all:dist
var EmbedFS embed.FS

var (
	// Version will be set by ldflags during build
	Version = "1.2.0.14"
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
	log.Println("Starting Terraria Panel...")
	log.Printf("Version: %s (Build: %s)", Version, Build)
	log.Printf("Go Version: %s", runtime.Version())
	log.Printf("OS/Arch: %s/%s", runtime.GOOS, runtime.GOARCH)
	log.Printf("Working Directory: %s", getWorkingDir())

	// Set version information in handlers
	handlers.AppVersion = Version
	handlers.BuildInfo = Build

	// Initialize database and services
	if err := service.InitializeServices(); err != nil {
		log.Fatalf("Failed to initialize services: %v", err)
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

	// Static files (embedded frontend) - serve assets directly from embed.FS
	distFS, err := fs.Sub(EmbedFS, "dist")
	if err != nil {
		log.Printf("Failed to create dist filesystem: %v", err)
		log.Println("Frontend assets may not be available")
	} else {
		// Use NoRoute to handle all unmatched routes (after API routes are registered)
		r.NoRoute(func(c *gin.Context) {
			path := c.Request.URL.Path

			// Remove leading slash for fs.FS compatibility
			path = strings.TrimPrefix(path, "/")

			// Default to index.html for root
			if path == "" {
				path = "index.html"
			}

			// Try to read the file from embed FS
			data, err := fs.ReadFile(distFS, path)
			if err != nil {
				// If file not found, determine if it's a static asset or frontend route
				// Any file with an extension should be treated as a static asset
				// Only pure paths without extensions are SPA routes (e.g., /dashboard, /server)
				hasExtension := strings.Contains(filepath.Base(path), ".")

				if hasExtension {
					// File with extension not found, return 404
					c.Status(http.StatusNotFound)
					return
				}

				// For frontend routes (no extension), serve index.html for SPA routing
				indexData, indexErr := fs.ReadFile(distFS, "index.html")
				if indexErr != nil {
					c.String(http.StatusNotFound, "Page not found")
					return
				}
				// Force no-cache for index.html served as SPA fallback
				c.Header("Cache-Control", "no-cache, no-store, must-revalidate")
				c.Header("Pragma", "no-cache")
				c.Header("Expires", "0")
				c.Data(http.StatusOK, "text/html; charset=utf-8", indexData)
				return
			}

			// Determine MIME type based on file extension
			ext := filepath.Ext(path)
			mimeType := getMimeType(ext)

			// Set cache control headers to prevent caching issues
			// For HTML files, force no-cache to ensure users get the latest version
			if ext == ".html" || path == "index.html" {
				c.Header("Cache-Control", "no-cache, no-store, must-revalidate")
				c.Header("Pragma", "no-cache")
				c.Header("Expires", "0")
			} else {
				// For static assets (JS, CSS, images), allow short-term caching
				c.Header("Cache-Control", "public, max-age=3600")
			}

			c.Data(http.StatusOK, mimeType, data)
		})
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Println("\n================================================")
	fmt.Println("           Server is Ready!                    ")
	fmt.Println("================================================")
	log.Printf("Server listening on port: %s", port)
	log.Printf("Web interface: http://localhost:%s", port)
	log.Printf("API endpoint: http://localhost:%s/api", port)
	log.Printf("Health check: http://localhost:%s/api/health", port)
	fmt.Println(strings.Repeat("-", 50))

	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func printDiagnosticBanner() {
	fmt.Println("\n================================================")
	fmt.Println("   Terraria Server Management Panel            ")
	fmt.Println("   Diagnostic Information                       ")
	fmt.Println("================================================\n")

	fmt.Printf("Version: %s (Build: %s)\n", Version, Build)
	fmt.Printf("Go Version: %s\n", runtime.Version())
	fmt.Printf("OS/Arch: %s/%s\n", runtime.GOOS, runtime.GOARCH)
	fmt.Printf("Working Dir: %s\n", getWorkingDir())
	fmt.Printf("CPU Cores: %d\n", runtime.NumCPU())

	// Check environment variables
	fmt.Println("\nEnvironment Configuration:")
	printEnvVar("PORT", "8080")
	printEnvVar("GIN_MODE", "release")
	printEnvVar("DB_PATH", "./data/panel.db")
	printEnvVar("DATA_DIR", "./data")

	// Check important paths
	fmt.Println("\nResource Check:")
	checkEmbedFS()
	checkPath("./data", "Data directory")

	fmt.Println("\n" + strings.Repeat("-", 50) + "\n")
}

func printEnvVar(key, defaultValue string) {
	value := os.Getenv(key)
	if value == "" {
		value = defaultValue + " (default)"
	}
	fmt.Printf("  %s: %s\n", key, value)
}

func checkPath(path, description string) {
	if _, err := os.Stat(path); err == nil {
		fmt.Printf("  [OK] %s exists at %s\n", description, path)
	} else {
		fmt.Printf("  [WARN] %s NOT FOUND at %s\n", description, path)
	}
}

func checkEmbedFS() {
	// Check if index.html exists in embed
	if data, err := EmbedFS.ReadFile("dist/index.html"); err == nil {
		fmt.Printf("  [OK] Frontend assets embedded (index.html: %d bytes)\n", len(data))
	} else {
		fmt.Printf("  [ERROR] Frontend assets NOT embedded: %v\n", err)
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

// getMimeType returns the MIME type for common file extensions
func getMimeType(ext string) string {
	mimeTypes := map[string]string{
		".html":  "text/html; charset=utf-8",
		".css":   "text/css; charset=utf-8",
		".js":    "application/javascript; charset=utf-8",
		".json":  "application/json; charset=utf-8",
		".png":   "image/png",
		".jpg":   "image/jpeg",
		".jpeg":  "image/jpeg",
		".gif":   "image/gif",
		".svg":   "image/svg+xml",
		".ico":   "image/x-icon",
		".woff":  "font/woff",
		".woff2": "font/woff2",
		".ttf":   "font/ttf",
		".eot":   "application/vnd.ms-fontobject",
		".webp":  "image/webp",
		".webm":  "video/webm",
		".mp4":   "video/mp4",
	}

	if mime, ok := mimeTypes[ext]; ok {
		return mime
	}
	return "application/octet-stream"
}
