package handlers

import (
	"fmt"
	"net/http"
	"terraria-panel/internal/service"
	"time"

	"github.com/gin-gonic/gin"
)

// Player represents a Terraria player
type Player struct {
	ID         string    `json:"id"`
	Name       string    `json:"name"`
	SteamID    string    `json:"steam_id,omitempty"`
	IP         string    `json:"ip"`
	IsOnline   bool      `json:"is_online"`
	IsBanned   bool      `json:"is_banned"`
	PlayTime   int64     `json:"play_time"` // in seconds
	LastSeen   time.Time `json:"last_seen"`
	JoinedAt   time.Time `json:"joined_at"`
	Character  string    `json:"character,omitempty"`
}

// BanRequest represents a ban request
type BanRequest struct {
	Reason   string    `json:"reason" binding:"required"`
	Duration int       `json:"duration"` // in hours, 0 for permanent
	IP       bool      `json:"ip_ban"`   // whether to ban by IP
}

// KickRequest represents a kick request
type KickRequest struct {
	Reason string `json:"reason" binding:"required"`
}

// ListPlayers returns all registered players
func ListPlayers(c *gin.Context) {
	// Get query parameters for filtering
	onlineOnly := c.Query("online") == "true"
	bannedOnly := c.Query("banned") == "true"
	
	players, err := service.GetAllPlayers(onlineOnly, bannedOnly)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get players list",
			"code":  "PLAYERS_LIST_ERROR",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"players": players,
		"count":   len(players),
	})
}

// GetOnlinePlayers returns currently online players
func GetOnlinePlayers(c *gin.Context) {
	players, err := service.GetOnlinePlayers()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get online players",
			"code":  "ONLINE_PLAYERS_ERROR",
		})
		return
	}

	// Get server status to include player count
	serverStatus, _ := service.GetTerrariaServerStatus()
	
	c.JSON(http.StatusOK, gin.H{
		"players":      players,
		"online_count": len(players),
		"max_players":  serverStatus.MaxPlayers,
	})
}

// GetPlayer returns information about a specific player
func GetPlayer(c *gin.Context) {
	playerID := c.Param("id")
	
	player, err := service.GetPlayerByID(playerID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Player not found",
			"code":  "PLAYER_NOT_FOUND",
		})
		return
	}

	// Get additional player statistics
	stats, _ := service.GetPlayerStatistics(playerID)
	
	c.JSON(http.StatusOK, gin.H{
		"player": player,
		"stats":  stats,
	})
}

// UpdatePlayer updates player information
func UpdatePlayer(c *gin.Context) {
	userID, _ := c.Get("user_id")
	playerID := c.Param("id")
	
	var req map[string]interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request format",
			"code":  "INVALID_REQUEST",
		})
		return
	}

	// Update player
	err := service.UpdatePlayer(playerID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to update player",
			"code":  "PLAYER_UPDATE_FAILED",
		})
		return
	}

	// Log update
	service.LogAuditEvent(userID.(string), "player.update", 
		fmt.Sprintf("Updated player: %s", playerID), c.ClientIP())

	c.JSON(http.StatusOK, gin.H{
		"message": "Player updated successfully",
	})
}

// KickPlayer kicks a player from the server
func KickPlayer(c *gin.Context) {
	userID, _ := c.Get("user_id")
	playerID := c.Param("id")
	
	var req KickRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request format",
			"code":  "INVALID_REQUEST",
		})
		return
	}

	// Get player information
	player, err := service.GetPlayerByID(playerID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Player not found",
			"code":  "PLAYER_NOT_FOUND",
		})
		return
	}

	// Check if player is online
	if !player.IsOnline {
		c.JSON(http.StatusConflict, gin.H{
			"error": "Player is not online",
			"code":  "PLAYER_NOT_ONLINE",
		})
		return
	}

	// Kick the player
	err = service.KickPlayer(playerID, req.Reason)
	if err != nil {
		service.LogAuditEvent(userID.(string), "player.kick_failed", 
			fmt.Sprintf("Failed to kick player %s: %v", player.Name, err), c.ClientIP())
		
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to kick player",
			"code":  "PLAYER_KICK_FAILED",
			"details": err.Error(),
		})
		return
	}

	// Log success
	service.LogAuditEvent(userID.(string), "player.kick", 
		fmt.Sprintf("Kicked player: %s (Reason: %s)", player.Name, req.Reason), c.ClientIP())

	c.JSON(http.StatusOK, gin.H{
		"message": fmt.Sprintf("Player %s has been kicked", player.Name),
	})
}

// BanPlayer bans a player from the server
func BanPlayer(c *gin.Context) {
	userID, _ := c.Get("user_id")
	playerID := c.Param("id")
	
	var req BanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request format",
			"code":  "INVALID_REQUEST",
		})
		return
	}

	// Get player information
	player, err := service.GetPlayerByID(playerID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Player not found",
			"code":  "PLAYER_NOT_FOUND",
		})
		return
	}

	// Check if already banned
	if player.IsBanned {
		c.JSON(http.StatusConflict, gin.H{
			"error": "Player is already banned",
			"code":  "PLAYER_ALREADY_BANNED",
		})
		return
	}

	// Calculate ban expiry
	var expiresAt *time.Time
	if req.Duration > 0 {
		expiry := time.Now().Add(time.Duration(req.Duration) * time.Hour)
		expiresAt = &expiry
	}

	// Ban the player
	err = service.BanPlayer(playerID, req.Reason, expiresAt, req.IP)
	if err != nil {
		service.LogAuditEvent(userID.(string), "player.ban_failed", 
			fmt.Sprintf("Failed to ban player %s: %v", player.Name, err), c.ClientIP())
		
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to ban player",
			"code":  "PLAYER_BAN_FAILED",
			"details": err.Error(),
		})
		return
	}

	// Kick if online
	if player.IsOnline {
		service.KickPlayer(playerID, "Banned: " + req.Reason)
	}

	// Log success
	banType := "temporary"
	if req.Duration == 0 {
		banType = "permanent"
	}
	service.LogAuditEvent(userID.(string), "player.ban", 
		fmt.Sprintf("Banned player: %s (%s, Reason: %s)", player.Name, banType, req.Reason), c.ClientIP())

	c.JSON(http.StatusOK, gin.H{
		"message": fmt.Sprintf("Player %s has been banned", player.Name),
		"expires_at": expiresAt,
	})
}

// UnbanPlayer unbans a player
func UnbanPlayer(c *gin.Context) {
	userID, _ := c.Get("user_id")
	playerID := c.Param("id")
	
	// Get player information
	player, err := service.GetPlayerByID(playerID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Player not found",
			"code":  "PLAYER_NOT_FOUND",
		})
		return
	}

	// Check if banned
	if !player.IsBanned {
		c.JSON(http.StatusConflict, gin.H{
			"error": "Player is not banned",
			"code":  "PLAYER_NOT_BANNED",
		})
		return
	}

	// Unban the player
	err = service.UnbanPlayer(playerID)
	if err != nil {
		service.LogAuditEvent(userID.(string), "player.unban_failed", 
			fmt.Sprintf("Failed to unban player %s: %v", player.Name, err), c.ClientIP())
		
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to unban player",
			"code":  "PLAYER_UNBAN_FAILED",
			"details": err.Error(),
		})
		return
	}

	// Log success
	service.LogAuditEvent(userID.(string), "player.unban", 
		fmt.Sprintf("Unbanned player: %s", player.Name), c.ClientIP())

	c.JSON(http.StatusOK, gin.H{
		"message": fmt.Sprintf("Player %s has been unbanned", player.Name),
	})
}

// ListBannedPlayers returns all banned players
func ListBannedPlayers(c *gin.Context) {
	bans, err := service.GetBannedPlayers()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get banned players list",
			"code":  "BANNED_LIST_ERROR",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"bans":  bans,
		"count": len(bans),
	})
}