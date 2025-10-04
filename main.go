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

//go:embed web/dist
var EmbedFS embed.FS

func main() {
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
	// Use NoRoute to handle 404s with static files
	r.NoRoute(static.ServeEmbed("web/dist", EmbedFS))

	// Start server
	port := 8080
	fmt.Printf("Server starting on port %d...\n", port)
	if err := r.Run(fmt.Sprintf(":%d", port)); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
