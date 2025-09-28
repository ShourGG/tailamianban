package repository

import (
	"database/sql"
	"time"

	"github.com/google/uuid"
)

// User represents a user in the system
type User struct {
	ID          string    `json:"id" db:"id"`
	Username    string    `json:"username" db:"username"`
	Password    string    `json:"-" db:"password"` // Never expose password in JSON
	Role        string    `json:"role" db:"role"`
	Email       string    `json:"email" db:"email"`
	IsActive    bool      `json:"is_active" db:"is_active"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
	LastLoginAt time.Time `json:"last_login_at" db:"last_login_at"`
	LastLogin   time.Time `json:"last_login" db:"last_login_at"`
}

// CreateUser creates a new user
func CreateUser(user *User) error {
	if user.ID == "" {
		user.ID = uuid.New().String()
	}
	
	now := time.Now()
	user.CreatedAt = now
	user.UpdatedAt = now

	query := `
		INSERT INTO users (id, username, password, role, email, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?)
	`
	
	_, err := db.Exec(query, user.ID, user.Username, user.Password, user.Role, user.Email, user.CreatedAt, user.UpdatedAt)
	return err
}

// GetUserByUsername retrieves a user by username
func GetUserByUsername(username string) (*User, error) {
	user := &User{}
	query := `
		SELECT id, username, password, role, email, created_at, updated_at, last_login_at
		FROM users WHERE username = ?
	`
	
	err := db.QueryRow(query, username).Scan(
		&user.ID, &user.Username, &user.Password, &user.Role, &user.Email,
		&user.CreatedAt, &user.UpdatedAt, &user.LastLoginAt,
	)
	
	if err != nil {
		return nil, err
	}
	
	return user, nil
}

// GetUserByID retrieves a user by ID
func GetUserByID(id string) (*User, error) {
	user := &User{}
	query := `
		SELECT id, username, password, role, email, created_at, updated_at, last_login_at
		FROM users WHERE id = ?
	`
	
	err := db.QueryRow(query, id).Scan(
		&user.ID, &user.Username, &user.Password, &user.Role, &user.Email,
		&user.CreatedAt, &user.UpdatedAt, &user.LastLoginAt,
	)
	
	if err != nil {
		return nil, err
	}
	
	return user, nil
}

// UpdateUserLastLogin updates the user's last login time
func UpdateUserLastLogin(userID string, lastLogin time.Time) error {
	query := `UPDATE users SET last_login_at = ? WHERE id = ?`
	_, err := db.Exec(query, lastLogin, userID)
	return err
}

// AdminUserExists checks if any admin user exists
func AdminUserExists() (bool, error) {
	var count int
	query := `SELECT COUNT(*) FROM users WHERE role = 'admin'`
	err := db.QueryRow(query).Scan(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

// ListUsers retrieves all users (excluding passwords)
func ListUsers() ([]*User, error) {
	query := `
		SELECT id, username, role, email, created_at, updated_at, last_login_at
		FROM users ORDER BY created_at DESC
	`
	
	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []*User
	for rows.Next() {
		user := &User{}
		var lastLoginAt sql.NullTime
		
		err := rows.Scan(
			&user.ID, &user.Username, &user.Role, &user.Email,
			&user.CreatedAt, &user.UpdatedAt, &lastLoginAt,
		)
		if err != nil {
			return nil, err
		}
		
		if lastLoginAt.Valid {
			user.LastLoginAt = lastLoginAt.Time
		}
		
		users = append(users, user)
	}
	
	return users, nil
}

// UpdateUser updates user information
func UpdateUser(user *User) error {
	user.UpdatedAt = time.Now()
	
	query := `
		UPDATE users 
		SET username = ?, role = ?, email = ?, updated_at = ?
		WHERE id = ?
	`
	
	_, err := db.Exec(query, user.Username, user.Role, user.Email, user.UpdatedAt, user.ID)
	return err
}

// DeleteUser deletes a user
func DeleteUser(userID string) error {
	query := `DELETE FROM users WHERE id = ?`
	_, err := db.Exec(query, userID)
	return err
}

// GetAllUsers retrieves all users
func GetAllUsers() ([]*User, error) {
	return ListUsers()
}
