package handlers

import (
	"fmt"
	"net/http"
	"terraria-panel/internal/repository"
	"terraria-panel/internal/service"
	"time"

	"github.com/gin-gonic/gin"
)

// PanelSettings represents panel configuration
type PanelSettings struct {
	SiteName           string `json:"site_name"`
	SiteDescription    string `json:"site_description"`
	ServerName         string `json:"server_name"`
	AdminEmail         string `json:"admin_email"`
	EnableRegistration bool   `json:"enable_registration"`
	EnableAutoBackup   bool   `json:"enable_auto_backup"`
	BackupInterval     int    `json:"backup_interval"` // in hours
	MaxBackupCount     int    `json:"max_backup_count"`
	SessionTimeout     int    `json:"session_timeout"` // in minutes
	LogRetention       int    `json:"log_retention"`   // in days
	Theme              string `json:"theme"`
	Language           string `json:"language"`
}

// User represents a panel user
type User struct {
	ID        string    `json:"id"`
	Username  string    `json:"username"`
	Email     string    `json:"email"`
	Role      string    `json:"role"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	LastLogin time.Time `json:"last_login,omitempty"`
}

// UserCreateRequest represents user creation request
type UserCreateRequest struct {
	Username string `json:"username" binding:"required,min=3,max=32"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
	Role     string `json:"role" binding:"required,oneof=admin moderator viewer"`
}

// UserUpdateRequest represents user update request
type UserUpdateRequest struct {
	Email    string `json:"email" binding:"omitempty,email"`
	Password string `json:"password" binding:"omitempty,min=8"`
	Role     string `json:"role" binding:"omitempty,oneof=admin moderator viewer"`
	IsActive *bool  `json:"is_active"`
}

// AuditLog represents an audit log entry
type AuditLog struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	Username  string    `json:"username"`
	Action    string    `json:"action"`
	Details   string    `json:"details"`
	IP        string    `json:"ip"`
	UserAgent string    `json:"user_agent"`
	CreatedAt time.Time `json:"created_at"`
}

// GetPanelSettings returns current panel settings
func GetPanelSettings(c *gin.Context) {
	settings, err := service.GetPanelSettings()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get panel settings",
			"code":  "SETTINGS_GET_ERROR",
		})
		return
	}

	c.JSON(http.StatusOK, settings)
}

// UpdatePanelSettings updates panel settings
func UpdatePanelSettings(c *gin.Context) {
	userID, _ := c.Get("user_id")
	role, _ := c.Get("role")

	// Check if user is admin
	if role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "Admin access required",
			"code":  "ADMIN_REQUIRED",
		})
		return
	}

	var settings PanelSettings
	if err := c.ShouldBindJSON(&settings); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid settings format",
			"code":    "INVALID_SETTINGS",
			"details": err.Error(),
		})
		return
	}

	// Update settings
	err := service.UpdatePanelSettings(&settings)
	if err != nil {
		service.LogAuditEvent(userID.(string), "panel.settings_update_failed",
			fmt.Sprintf("Failed to update settings: %v", err), c.ClientIP())

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to update settings",
			"code":  "SETTINGS_UPDATE_ERROR",
		})
		return
	}

	// Log success
	service.LogAuditEvent(userID.(string), "panel.settings_update",
		"Updated panel settings", c.ClientIP())

	c.JSON(http.StatusOK, gin.H{
		"message":  "Settings updated successfully",
		"settings": settings,
	})
}

// ListUsers returns all panel users
func ListUsers(c *gin.Context) {
	role, _ := c.Get("role")

	// Check if user is admin
	if role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "Admin access required",
			"code":  "ADMIN_REQUIRED",
		})
		return
	}

	users, err := repository.GetAllUsers()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get users list",
			"code":  "USERS_LIST_ERROR",
		})
		return
	}

	// Convert to response format
	var userList []User
	for _, u := range users {
		userList = append(userList, User{
			ID:        u.ID,
			Username:  u.Username,
			Email:     u.Email,
			Role:      u.Role,
			CreatedAt: u.CreatedAt,
			UpdatedAt: u.UpdatedAt,
			LastLogin: u.LastLoginAt,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"users": userList,
		"count": len(userList),
	})
}

// CreateUser creates a new panel user
func CreateUser(c *gin.Context) {
	userID, _ := c.Get("user_id")
	role, _ := c.Get("role")

	// Check if user is admin
	if role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "Admin access required",
			"code":  "ADMIN_REQUIRED",
		})
		return
	}

	var req UserCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request format",
			"code":    "INVALID_REQUEST",
			"details": err.Error(),
		})
		return
	}

	// Check if username already exists
	existingUser, _ := repository.GetUserByUsername(req.Username)
	if existingUser != nil {
		c.JSON(http.StatusConflict, gin.H{
			"error": "Username already exists",
			"code":  "USERNAME_EXISTS",
		})
		return
	}

	// Create the user
	newUser, err := service.CreateUser(req.Username, req.Email, req.Password, req.Role)
	if err != nil {
		service.LogAuditEvent(userID.(string), "panel.user_create_failed",
			fmt.Sprintf("Failed to create user %s: %v", req.Username, err), c.ClientIP())

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create user",
			"code":  "USER_CREATE_ERROR",
		})
		return
	}

	// Log success
	service.LogAuditEvent(userID.(string), "panel.user_create",
		fmt.Sprintf("Created user: %s (role: %s)", req.Username, req.Role), c.ClientIP())

	c.JSON(http.StatusCreated, User{
		ID:        newUser.ID,
		Username:  newUser.Username,
		Email:     newUser.Email,
		Role:      newUser.Role,
		CreatedAt: newUser.CreatedAt,
	})
}

// UpdateUser updates a panel user
func UpdateUser(c *gin.Context) {
	userID, _ := c.Get("user_id")
	role, _ := c.Get("role")
	targetUserID := c.Param("id")

	// Check if user is admin or updating own account
	if role != "admin" && userID != targetUserID {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "Insufficient permissions",
			"code":  "PERMISSION_DENIED",
		})
		return
	}

	var req UserUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request format",
			"code":    "INVALID_REQUEST",
			"details": err.Error(),
		})
		return
	}

	// Get target user
	targetUser, err := service.GetUserByID(targetUserID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "User not found",
			"code":  "USER_NOT_FOUND",
		})
		return
	}

	// Non-admins can't change roles or active status
	if role != "admin" {
		req.Role = ""
		req.IsActive = nil
	}

	// Update the user
	err = service.UpdateUser(targetUserID, req)
	if err != nil {
		service.LogAuditEvent(userID.(string), "panel.user_update_failed",
			fmt.Sprintf("Failed to update user %s: %v", targetUser.Username, err), c.ClientIP())

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to update user",
			"code":  "USER_UPDATE_ERROR",
		})
		return
	}

	// Log success
	service.LogAuditEvent(userID.(string), "panel.user_update",
		fmt.Sprintf("Updated user: %s", targetUser.Username), c.ClientIP())

	c.JSON(http.StatusOK, gin.H{
		"message": "User updated successfully",
	})
}

// DeleteUser deletes a panel user
func DeleteUser(c *gin.Context) {
	userID, _ := c.Get("user_id")
	role, _ := c.Get("role")
	targetUserID := c.Param("id")

	// Check if user is admin
	if role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "Admin access required",
			"code":  "ADMIN_REQUIRED",
		})
		return
	}

	// Prevent self-deletion
	if userID == targetUserID {
		c.JSON(http.StatusConflict, gin.H{
			"error": "Cannot delete your own account",
			"code":  "SELF_DELETE_PREVENTED",
		})
		return
	}

	// Get target user
	targetUser, err := service.GetUserByID(targetUserID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "User not found",
			"code":  "USER_NOT_FOUND",
		})
		return
	}

	// Delete the user
	err = repository.DeleteUser(targetUserID)
	if err != nil {
		service.LogAuditEvent(userID.(string), "panel.user_delete_failed",
			fmt.Sprintf("Failed to delete user %s: %v", targetUser.Username, err), c.ClientIP())

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to delete user",
			"code":  "USER_DELETE_ERROR",
		})
		return
	}

	// Log success
	service.LogAuditEvent(userID.(string), "panel.user_delete",
		fmt.Sprintf("Deleted user: %s", targetUser.Username), c.ClientIP())

	c.JSON(http.StatusOK, gin.H{
		"message": "User deleted successfully",
	})
}

// GetAuditLogs returns audit logs
func GetAuditLogs(c *gin.Context) {
	role, _ := c.Get("role")

	// Check if user is admin or moderator
	if role != "admin" && role != "moderator" {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "Insufficient permissions",
			"code":  "PERMISSION_DENIED",
		})
		return
	}

	// Get query parameters
	limit := 100
	offset := 0
	userFilter := c.Query("user_id")
	actionFilter := c.Query("action")

	// Get audit logs
	logs, err := repository.GetAuditLogs(limit, offset, userFilter, actionFilter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get audit logs",
			"code":  "AUDIT_LOGS_ERROR",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"logs":   logs,
		"count":  len(logs),
		"limit":  limit,
		"offset": offset,
	})
}

// GetServerLogs returns server logs
func GetServerLogs(c *gin.Context) {
	// Get query parameters
	lines := 100
	if l := c.Query("lines"); l != "" {
		fmt.Sscanf(l, "%d", &lines)
	}

	// Get server logs
	logs, err := service.GetServerLogs(lines)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get server logs",
			"code":  "SERVER_LOGS_ERROR",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"logs":  logs,
		"lines": len(logs),
	})
}

// ClearServerLogs clears server logs
func ClearServerLogs(c *gin.Context) {
	userID, _ := c.Get("user_id")
	role, _ := c.Get("role")

	// Check if user is admin
	if role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "Admin access required",
			"code":  "ADMIN_REQUIRED",
		})
		return
	}

	// Clear logs
	err := service.ClearServerLogs()
	if err != nil {
		service.LogAuditEvent(userID.(string), "server.logs_clear_failed",
			fmt.Sprintf("Failed to clear logs: %v", err), c.ClientIP())

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to clear logs",
			"code":  "LOGS_CLEAR_ERROR",
		})
		return
	}

	// Log success
	service.LogAuditEvent(userID.(string), "server.logs_clear",
		"Cleared server logs", c.ClientIP())

	c.JSON(http.StatusOK, gin.H{
		"message": "Logs cleared successfully",
	})
}
