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

	r := gin.Default()

	// Setup API routes
	api.SetupRoutes(r)

	// Serve static files from embedded FS (MUST be last)
	r.Use(static.ServeEmbed("web/dist", EmbedFS))

	// Start server
	port := 8080
	fmt.Printf("Server starting on port %d...\n", port)
	if err := r.Run(fmt.Sprintf(":%d", port)); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
