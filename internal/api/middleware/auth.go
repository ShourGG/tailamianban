package middleware

import (
	"net/http"
	"strings"
	"terraria-panel/internal/service"

	"github.com/gin-gonic/gin"
)

// AuthRequired middleware validates JWT tokens
func AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get token from Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Authorization header required",
				"code":  "AUTH_HEADER_MISSING",
			})
			c.Abort()
			return
		}

		// Check Bearer token format
		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid authorization header format",
				"code":  "AUTH_HEADER_INVALID",
			})
			c.Abort()
			return
		}

		token := tokenParts[1]

		// Validate token
		claims, err := service.ValidateJWTToken(token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid or expired token",
				"code":  "TOKEN_INVALID",
			})
			c.Abort()
			return
		}

		// Store user info in context
		c.Set("user_id", claims.UserID)
		c.Set("username", claims.Username)
		c.Set("role", claims.Role)

		c.Next()
	}
}

// AdminRequired middleware ensures user has admin role
func AdminRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "User role not found",
				"code":  "ROLE_MISSING",
			})
			c.Abort()
			return
		}

		if role != "admin" {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Admin privileges required",
				"code":  "INSUFFICIENT_PRIVILEGES",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// RateLimiter middleware implements basic rate limiting
func RateLimiter() gin.HandlerFunc {
	// TODO: Implement proper rate limiting with Redis or in-memory store
	return func(c *gin.Context) {
		// For now, just pass through
		// In production, implement rate limiting based on IP or user
		c.Next()
	}
}