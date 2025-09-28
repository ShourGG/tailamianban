package api

import (
	"terraria-panel/internal/api/handlers"
	"terraria-panel/internal/api/middleware"

	"github.com/gin-gonic/gin"
)

// SetupRoutes configures all API routes
func SetupRoutes(r *gin.Engine) {
	// API group
	api := r.Group("/api")
	{
		// Health check
		api.GET("/health", handlers.HealthCheck)
		
		// Authentication routes (public)
		auth := api.Group("/auth")
		{
			auth.POST("/login", handlers.Login)
			auth.POST("/logout", handlers.Logout)
			auth.GET("/me", middleware.AuthRequired(), handlers.GetCurrentUser)
		}

		// Protected routes
		protected := api.Group("/")
		protected.Use(middleware.AuthRequired())
		{
			// Server management
			server := protected.Group("/server")
			{
				server.GET("/status", handlers.GetServerStatus)
				server.POST("/start", handlers.StartServer)
				server.POST("/stop", handlers.StopServer)
				server.POST("/restart", handlers.RestartServer)
				server.GET("/config", handlers.GetServerConfig)
				server.PUT("/config", handlers.UpdateServerConfig)
				server.GET("/logs", handlers.GetServerLogs)
				server.DELETE("/logs", handlers.ClearServerLogs)
			}

			// World management
			worlds := protected.Group("/worlds")
			{
				worlds.GET("/", handlers.ListWorlds)
				worlds.POST("/", handlers.CreateWorld)
				worlds.GET("/:id", handlers.GetWorld)
				worlds.PUT("/:id", handlers.UpdateWorld)
				worlds.DELETE("/:id", handlers.DeleteWorld)
				worlds.POST("/:id/backup", handlers.BackupWorld)
				worlds.POST("/:id/restore", handlers.RestoreWorld)
				worlds.POST("/upload", handlers.UploadWorld)
				worlds.GET("/:id/download", handlers.DownloadWorld)
			}

			// Player management
			players := protected.Group("/players")
			{
				players.GET("/", handlers.ListPlayers)
				players.GET("/online", handlers.GetOnlinePlayers)
				players.GET("/:id", handlers.GetPlayer)
				players.PUT("/:id", handlers.UpdatePlayer)
				players.POST("/:id/kick", handlers.KickPlayer)
				players.POST("/:id/ban", handlers.BanPlayer)
				players.DELETE("/:id/ban", handlers.UnbanPlayer)
				players.GET("/bans", handlers.ListBannedPlayers)
			}

			// System monitoring
			system := protected.Group("/system")
			{
				system.GET("/metrics", handlers.GetSystemMetrics)
				system.GET("/metrics/history", handlers.GetMetricsHistory)
				system.GET("/info", handlers.GetSystemInfo)
				system.GET("/processes", handlers.GetProcessList)
			}

			// Panel management
			panel := protected.Group("/panel")
			{
				panel.GET("/settings", handlers.GetPanelSettings)
				panel.PUT("/settings", handlers.UpdatePanelSettings)
				panel.GET("/users", handlers.ListUsers)
				panel.POST("/users", handlers.CreateUser)
				panel.PUT("/users/:id", handlers.UpdateUser)
				panel.DELETE("/users/:id", handlers.DeleteUser)
				panel.GET("/audit-logs", handlers.GetAuditLogs)
			}

			// WebSocket for real-time updates
			protected.GET("/ws", handlers.WebSocketHandler)
		}
	}
}