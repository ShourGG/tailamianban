package handlers

import (
	"net/http"
	"terraria-panel/internal/service"

	"github.com/gin-gonic/gin"
)

// ServerStatusResponse represents server status
type ServerStatusResponse struct {
	Status      string `json:"status"`       // running, stopped, starting, stopping
	PID         int    `json:"pid"`          // Process ID
	Uptime      int64  `json:"uptime"`       // Uptime in seconds
	PlayerCount int    `json:"player_count"` // Current player count
	MaxPlayers  int    `json:"max_players"`  // Maximum players
	WorldName   string `json:"world_name"`   // Current world name
	Port        int    `json:"port"`         // Server port
	Version     string `json:"version"`      // Terraria version
}

// ServerConfigRequest represents server configuration
type ServerConfigRequest struct {
	WorldName    string `json:"world_name" binding:"required"`
	MaxPlayers   int    `json:"max_players" binding:"required,min=1,max=255"`
	Port         int    `json:"port" binding:"required,min=1024,max=65535"`
	Password     string `json:"password"`
	Difficulty   string `json:"difficulty" binding:"required,oneof=classic expert master"`
	AutoSave     bool   `json:"auto_save"`
	AutoSaveTime int    `json:"auto_save_time" binding:"min=1,max=60"`
}

// GetServerStatus returns the current server status
func GetServerStatus(c *gin.Context) {
	status, err := service.GetTerrariaServerStatus()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get server status",
			"code":  "SERVER_STATUS_ERROR",
		})
		return
	}

	response := ServerStatusResponse{
		Status:      status.Status,
		PID:         status.PID,
		Uptime:      status.Uptime,
		PlayerCount: status.PlayerCount,
		MaxPlayers:  status.MaxPlayers,
		WorldName:   status.WorldName,
		Port:        status.Port,
		Version:     status.Version,
	}

	c.JSON(http.StatusOK, response)
}

// StartServer starts the Terraria server
func StartServer(c *gin.Context) {
	userID, _ := c.Get("user_id")

	// Check if server is already running
	status, err := service.GetTerrariaServerStatus()
	if err == nil && status.Status == "running" {
		c.JSON(http.StatusConflict, gin.H{
			"error": "Server is already running",
			"code":  "SERVER_ALREADY_RUNNING",
		})
		return
	}

	// Start the server
	err = service.StartTerrariaServer()
	if err != nil {
		service.LogAuditEvent(userID.(string), "server.start_failed",
			"Failed to start server: "+err.Error(), c.ClientIP())

		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to start server",
			"code":    "SERVER_START_FAILED",
			"details": err.Error(),
		})
		return
	}

	// Log successful start
	service.LogAuditEvent(userID.(string), "server.start",
		"Terraria server started", c.ClientIP())

	c.JSON(http.StatusOK, gin.H{
		"message": "Server start initiated",
		"status":  "starting",
	})
}

// StopServer stops the Terraria server
func StopServer(c *gin.Context) {
	userID, _ := c.Get("user_id")

	// Check if server is running
	status, err := service.GetTerrariaServerStatus()
	if err != nil || status.Status != "running" {
		c.JSON(http.StatusConflict, gin.H{
			"error": "Server is not running",
			"code":  "SERVER_NOT_RUNNING",
		})
		return
	}

	// Stop the server
	err = service.StopTerrariaServer()
	if err != nil {
		service.LogAuditEvent(userID.(string), "server.stop_failed",
			"Failed to stop server: "+err.Error(), c.ClientIP())

		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to stop server",
			"code":    "SERVER_STOP_FAILED",
			"details": err.Error(),
		})
		return
	}

	// Log successful stop
	service.LogAuditEvent(userID.(string), "server.stop",
		"Terraria server stopped", c.ClientIP())

	c.JSON(http.StatusOK, gin.H{
		"message": "Server stop initiated",
		"status":  "stopping",
	})
}

// RestartServer restarts the Terraria server
func RestartServer(c *gin.Context) {
	userID, _ := c.Get("user_id")

	// Stop first if running
	status, err := service.GetTerrariaServerStatus()
	if err == nil && status.Status == "running" {
		err = service.StopTerrariaServer()
		if err != nil {
			service.LogAuditEvent(userID.(string), "server.restart_failed",
				"Failed to stop server during restart: "+err.Error(), c.ClientIP())

			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to stop server for restart",
				"code":  "SERVER_RESTART_STOP_FAILED",
			})
			return
		}
	}

	// Start the server
	err = service.StartTerrariaServer()
	if err != nil {
		service.LogAuditEvent(userID.(string), "server.restart_failed",
			"Failed to start server during restart: "+err.Error(), c.ClientIP())

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to start server for restart",
			"code":  "SERVER_RESTART_START_FAILED",
		})
		return
	}

	// Log successful restart
	service.LogAuditEvent(userID.(string), "server.restart",
		"Terraria server restarted", c.ClientIP())

	c.JSON(http.StatusOK, gin.H{
		"message": "Server restart initiated",
		"status":  "restarting",
	})
}

// GetServerConfig returns the current server configuration
func GetServerConfig(c *gin.Context) {
	config, err := service.GetTerrariaServerConfig()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get server configuration",
			"code":  "CONFIG_GET_FAILED",
		})
		return
	}

	c.JSON(http.StatusOK, config)
}

// UpdateServerConfig updates the server configuration
func UpdateServerConfig(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var req ServerConfigRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid configuration format",
			"code":    "INVALID_CONFIG",
			"details": err.Error(),
		})
		return
	}

	// Update configuration
	config := &service.TerrariaServerConfig{
		WorldName:    req.WorldName,
		MaxPlayers:   req.MaxPlayers,
		Port:         req.Port,
		Password:     req.Password,
		Difficulty:   req.Difficulty,
		AutoSave:     req.AutoSave,
		AutoSaveTime: req.AutoSaveTime,
	}

	err := service.UpdateTerrariaServerConfig(config)
	if err != nil {
		service.LogAuditEvent(userID.(string), "server.config_update_failed",
			"Failed to update server config: "+err.Error(), c.ClientIP())

		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to update server configuration",
			"code":    "CONFIG_UPDATE_FAILED",
			"details": err.Error(),
		})
		return
	}

	// Log successful update
	service.LogAuditEvent(userID.(string), "server.config_update",
		"Server configuration updated", c.ClientIP())

	c.JSON(http.StatusOK, gin.H{
		"message": "Configuration updated successfully",
		"config":  config,
	})
}
