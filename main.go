package main

import (
	"embed"
	"fmt"
	"io"
	"log"
	"terraria-panel/internal/api"
	"terraria-panel/internal/service"

	"github.com/gin-gonic/gin"
	static "github.com/soulteary/gin-static"
)

// Version info
const Version = "v1.2.1.4"

//go:embed web/dist
var EmbedFS embed.FS

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

	// Create Gin router
	gin.SetMode(gin.ReleaseMode)
	gin.DefaultWriter = io.Discard

	r := gin.New()        // Use gin.New() instead of Default() to avoid interference
	r.Use(gin.Recovery()) // Only add Recovery middleware

	// Setup API routes FIRST
	api.SetupRoutes(r)

	// Serve static files from embedded FS as fallback (MUST be last)
	// CRITICAL: First parameter must be EMPTY for root-level serving
	// Because EmbedFS already contains "web/dist/*", we don't add prefix
	// Request "/js/file.js" → EmbedFS.Open("web/dist/js/file.js") ✅
	r.NoRoute(static.ServeEmbed("", EmbedFS))

	// Start server
	port := 8080
	fmt.Printf("Server listening on port %d\n", port)
	fmt.Printf("Open http://localhost:%d in your browser\n", port)
	if err := r.Run(fmt.Sprintf(":%d", port)); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
