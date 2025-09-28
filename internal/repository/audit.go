package repository

import (
	"time"
)

// AuditLog represents an audit log entry
type AuditLog struct {
	ID          int64     `json:"id" db:"id"`
	UserID      string    `json:"user_id" db:"user_id"`
	Action      string    `json:"action" db:"action"`
	Description string    `json:"description" db:"description"`
	IPAddress   string    `json:"ip_address" db:"ip_address"`
	Timestamp   time.Time `json:"timestamp" db:"timestamp"`
}

// CreateAuditLog creates a new audit log entry
func CreateAuditLog(log *AuditLog) error {
	query := `
		INSERT INTO audit_logs (user_id, action, description, ip_address, timestamp)
		VALUES (?, ?, ?, ?, ?)
	`
	
	_, err := db.Exec(query, log.UserID, log.Action, log.Description, log.IPAddress, log.Timestamp)
	return err
}

// GetAuditLogs retrieves audit logs with pagination and filtering
func GetAuditLogs(limit, offset int, userFilter, actionFilter string) ([]*AuditLog, error) {
	query := `
		SELECT id, user_id, action, description, ip_address, timestamp
		FROM audit_logs 
		WHERE 1=1
	`
	args := []interface{}{}
	
	if userFilter != "" {
		query += " AND user_id = ?"
		args = append(args, userFilter)
	}
	
	if actionFilter != "" {
		query += " AND action LIKE ?"
		args = append(args, "%"+actionFilter+"%")
	}
	
	query += " ORDER BY timestamp DESC LIMIT ? OFFSET ?"
	args = append(args, limit, offset)
	
	rows, err := db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var logs []*AuditLog
	for rows.Next() {
		log := &AuditLog{}
		err := rows.Scan(
			&log.ID, &log.UserID, &log.Action, &log.Description,
			&log.IPAddress, &log.Timestamp,
		)
		if err != nil {
			return nil, err
		}
		logs = append(logs, log)
	}
	
	return logs, nil
}

// GetAuditLogsByUser retrieves audit logs for a specific user
func GetAuditLogsByUser(userID string, limit, offset int) ([]*AuditLog, error) {
	query := `
		SELECT id, user_id, action, description, ip_address, timestamp
		FROM audit_logs 
		WHERE user_id = ?
		ORDER BY timestamp DESC
		LIMIT ? OFFSET ?
	`
	
	rows, err := db.Query(query, userID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var logs []*AuditLog
	for rows.Next() {
		log := &AuditLog{}
		err := rows.Scan(
			&log.ID, &log.UserID, &log.Action, &log.Description,
			&log.IPAddress, &log.Timestamp,
		)
		if err != nil {
			return nil, err
		}
		logs = append(logs, log)
	}
	
	return logs, nil
}