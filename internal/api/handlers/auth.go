package handlers

import (
	"net/http"
	"terraria-panel/internal/service"

	"github.com/gin-gonic/gin"
)

// RegisterRequest represents the registration request payload
type RegisterRequest struct {
	Username string `json:"username" binding:"required,min=3,max=20"`
	Password string `json:"password" binding:"required,min=6,max=30"`
	Email    string `json:"email" binding:"omitempty,email"`
}

// LoginRequest represents the login request payload
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// LoginResponse represents the login response
type LoginResponse struct {
	Token     string   `json:"token"`
	ExpiresIn int64    `json:"expires_in"`
	User      UserInfo `json:"user"`
}

// UserInfo represents user information
type UserInfo struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	Role     string `json:"role"`
	Email    string `json:"email,omitempty"`
}

// CheckInitResponse represents the initialization check response
type CheckInitResponse struct {
	Initialized bool   `json:"initialized"`
	Message     string `json:"message"`
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

	c.JSON(http.StatusOK, gin.H{
		"code":    "0",
		"data":    response,
		"message": "Login successful",
	})
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

// CheckInit checks if the system has been initialized (has at least one user)
func CheckInit(c *gin.Context) {
	hasUser, err := service.HasAnyUser()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    "1",
			"message": "Failed to check initialization status",
		})
		return
	}

	response := CheckInitResponse{
		Initialized: hasUser,
		Message:     "",
	}

	if !hasUser {
		response.Message = "System not initialized. Please register the first admin account."
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    "0",
		"data":    response,
		"message": "Success",
	})
}

// Register handles user registration (only allowed when no users exist)
func Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    "1",
			"message": "Invalid request format: " + err.Error(),
		})
		return
	}

	// Check if any user already exists
	hasUser, err := service.HasAnyUser()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    "1",
			"message": "Failed to check system status",
		})
		return
	}

	if hasUser {
		c.JSON(http.StatusForbidden, gin.H{
			"code":    "1",
			"message": "Registration is disabled. System already has an admin account.",
		})
		return
	}

	// Create the first admin user
	user, err := service.RegisterFirstAdmin(req.Username, req.Password, req.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    "1",
			"message": "Failed to create user: " + err.Error(),
		})
		return
	}

	// Generate JWT token
	token, expiresIn, err := service.GenerateJWTToken(user.ID, user.Username, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    "1",
			"message": "User created but failed to generate token",
		})
		return
	}

	// Log registration
	service.LogAuditEvent(user.ID, "auth.register", "First admin user registered", c.ClientIP())

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

	c.JSON(http.StatusOK, gin.H{
		"code":    "0",
		"data":    response,
		"message": "Registration successful",
	})
}
