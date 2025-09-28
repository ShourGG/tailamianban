package handlers

import (
	"net/http"
	"terraria-panel/internal/service"

	"github.com/gin-gonic/gin"
)

// LoginRequest represents the login request payload
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// LoginResponse represents the login response
type LoginResponse struct {
	Token     string `json:"token"`
	ExpiresIn int64  `json:"expires_in"`
	User      UserInfo `json:"user"`
}

// UserInfo represents user information
type UserInfo struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	Role     string `json:"role"`
	Email    string `json:"email,omitempty"`
}

// Login handles user authentication
func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request format",
			"code":  "INVALID_REQUEST",
		})
		return
	}

	// Authenticate user
	user, err := service.AuthenticateUser(req.Username, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid username or password",
			"code":  "INVALID_CREDENTIALS",
		})
		return
	}

	// Generate JWT token
	token, expiresIn, err := service.GenerateJWTToken(user.ID, user.Username, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to generate token",
			"code":  "TOKEN_GENERATION_FAILED",
		})
		return
	}

	// Log successful login
	service.LogAuditEvent(user.ID, "auth.login", "User logged in", c.ClientIP())

	response := LoginResponse{
		Token:     token,
		ExpiresIn: expiresIn,
		User: UserInfo{
			ID:       user.ID,
			Username: user.Username,
			Role:     user.Role,
			Email:    user.Email,
		},
	}

	c.JSON(http.StatusOK, response)
}

// Logout handles user logout
func Logout(c *gin.Context) {
	// Get user info from context (if available)
	if userID, exists := c.Get("user_id"); exists {
		service.LogAuditEvent(userID.(string), "auth.logout", "User logged out", c.ClientIP())
	}

	// In a stateless JWT system, logout is handled client-side
	// The client should remove the token from storage
	c.JSON(http.StatusOK, gin.H{
		"message": "Logged out successfully",
	})
}

// GetCurrentUser returns information about the currently authenticated user
func GetCurrentUser(c *gin.Context) {
	userID, _ := c.Get("user_id")
	username, _ := c.Get("username")
	role, _ := c.Get("role")

	// Get full user details from service
	user, err := service.GetUserByID(userID.(string))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "User not found",
			"code":  "USER_NOT_FOUND",
		})
		return
	}

	userInfo := UserInfo{
		ID:       user.ID,
		Username: username.(string),
		Role:     role.(string),
		Email:    user.Email,
	}

	c.JSON(http.StatusOK, userInfo)
}