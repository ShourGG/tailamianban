package repository

import (
	"time"
)

// ServerConfig represents a server configuration entry
type ServerConfig struct {
	ID          int64     `json:"id" db:"id"`
	Key         string    `json:"key" db:"key"`
	Value       string    `json:"value" db:"value"`
	Description string    `json:"description" db:"description"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

// GetServerConfigs retrieves all server configurations
func GetServerConfigs() ([]*ServerConfig, error) {
	query := `
		SELECT id, key, value, description, created_at, updated_at
		FROM server_configs
		ORDER BY key
	`
	
	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var configs []*ServerConfig
	for rows.Next() {
		config := &ServerConfig{}
		err := rows.Scan(
			&config.ID, &config.Key, &config.Value, &config.Description,
			&config.CreatedAt, &config.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		configs = append(configs, config)
	}
	
	return configs, nil
}

// GetServerConfig retrieves a specific server configuration by key
func GetServerConfig(key string) (*ServerConfig, error) {
	config := &ServerConfig{}
	query := `
		SELECT id, key, value, description, created_at, updated_at
		FROM server_configs 
		WHERE key = ?
	`
	
	err := db.QueryRow(query, key).Scan(
		&config.ID, &config.Key, &config.Value, &config.Description,
		&config.CreatedAt, &config.UpdatedAt,
	)
	
	if err != nil {
		return nil, err
	}
	
	return config, nil
}

// SetServerConfig sets or updates a server configuration
func SetServerConfig(key, value, description string) error {
	now := time.Now()
	
	// Try to update existing config first
	updateQuery := `
		UPDATE server_configs 
		SET value = ?, description = ?, updated_at = ?
		WHERE key = ?
	`
	
	result, err := db.Exec(updateQuery, value, description, now, key)
	if err != nil {
		return err
	}
	
	// Check if any rows were affected
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	
	// If no rows were updated, insert new config
	if rowsAffected == 0 {
		insertQuery := `
			INSERT INTO server_configs (key, value, description, created_at, updated_at)
			VALUES (?, ?, ?, ?, ?)
		`
		
		_, err = db.Exec(insertQuery, key, value, description, now, now)
		if err != nil {
			return err
		}
	}
	
	return nil
}

// DeleteServerConfig deletes a server configuration
func DeleteServerConfig(key string) error {
	query := `DELETE FROM server_configs WHERE key = ?`
	_, err := db.Exec(query, key)
	return err
}

// GetServerConfigValue retrieves only the value of a configuration
func GetServerConfigValue(key string) (string, error) {
	var value string
	query := `SELECT value FROM server_configs WHERE key = ?`
	
	err := db.QueryRow(query, key).Scan(&value)
	if err != nil {
		return "", err
	}
	
	return value, nil
}

// SetServerConfigValue sets only the value of a configuration (creates if not exists)
func SetServerConfigValue(key, value string) error {
	return SetServerConfig(key, value, "")
}