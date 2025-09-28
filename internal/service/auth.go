package service

import (
	"errors"
	"os"
	"time"
	"terraria-panel/internal/repository"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// JWTClaims represents the JWT token claims
type JWTClaims struct {
	UserID   string `json:"user_id"`
	Username string `json:"username"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

var jwtSecret = []byte(getJWTSecret())

// AuthenticateUser validates user credentials
func AuthenticateUser(username, password string) (*repository.User, error) {
	user, err := repository.GetUserByUsername(username)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	if !CheckPasswordHash(password, user.Password) {
		return nil, errors.New("invalid credentials")
	}

	// Update last login time
	user.LastLoginAt = time.Now()
	repository.UpdateUserLastLogin(user.ID, user.LastLoginAt)

	return user, nil
}

// GenerateJWTToken creates a new JWT token for the user
func GenerateJWTToken(userID, username, role string) (string, int64, error) {
	expirationTime := time.Now().Add(24 * time.Hour) // 24 hours
	
	claims := &JWTClaims{
		UserID:   userID,
		Username: username,
		Role:     role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "terraria-panel",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		return "", 0, err
	}

	return tokenString, expirationTime.Unix(), nil
}

// ValidateJWTToken validates and parses a JWT token
func ValidateJWTToken(tokenString string) (*JWTClaims, error) {
	claims := &JWTClaims{}
	
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, errors.New("invalid token")
	}

	return claims, nil
}

// HashPassword creates a bcrypt hash of the password
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// CheckPasswordHash compares a password with its hash
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// GetUserByID retrieves a user by ID
func GetUserByID(userID string) (*repository.User, error) {
	return repository.GetUserByID(userID)
}

// LogAuditEvent logs an audit event
func LogAuditEvent(userID, action, description, ipAddress string) {
	auditLog := &repository.AuditLog{
		UserID:      userID,
		Action:      action,
		Description: description,
		IPAddress:   ipAddress,
		Timestamp:   time.Now(),
	}
	
	// Log to database (ignore errors for now)
	repository.CreateAuditLog(auditLog)
}

func getJWTSecret() string {
	if secret := os.Getenv("JWT_SECRET"); secret != "" {
		return secret
	}
	// Default secret (should be changed in production)
	return "terraria-panel-default-secret-change-me-in-production"
}