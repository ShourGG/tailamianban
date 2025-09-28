package service

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"time"
	"terraria-panel/internal/repository"
)

// World represents a Terraria world
type World struct {
	ID         string    `json:"id"`
	Name       string    `json:"name"`
	FileName   string    `json:"file_name"`
	Size       int64     `json:"size"`
	CreatedAt  time.Time `json:"created_at"`
	ModifiedAt time.Time `json:"modified_at"`
	IsActive   bool      `json:"is_active"`
	BackupCount int      `json:"backup_count"`
}

var worldsDirectory = "./data/worlds"
var backupsDirectory = "./data/backups"

// GetWorldsDirectory returns the worlds directory path
func GetWorldsDirectory() string {
	if dir := os.Getenv("WORLDS_PATH"); dir != "" {
		return dir
	}
	return worldsDirectory
}

// GetAllWorlds returns all available worlds
func GetAllWorlds() ([]World, error) {
	worldsDir := GetWorldsDirectory()
	
	// Ensure worlds directory exists
	os.MkdirAll(worldsDir, 0755)
	
	entries, err := os.ReadDir(worldsDir)
	if err != nil {
		return nil, err
	}

	var worlds []World
	for _, entry := range entries {
		if entry.IsDir() || filepath.Ext(entry.Name()) != ".wld" {
			continue
		}

		info, err := entry.Info()
		if err != nil {
			continue
		}

		world := World{
			ID:         entry.Name(),
			Name:       entry.Name(),
			FileName:   entry.Name(),
			Size:       info.Size(),
			ModifiedAt: info.ModTime(),
			IsActive:   false, // TODO: Check if this is the active world
		}

		worlds = append(worlds, world)
	}

	return worlds, nil
}

// CreateWorld creates a new Terraria world
func CreateWorld(name, size, difficulty, seed string) (*World, error) {
	// This would typically call the Terraria server to generate a new world
	// For now, we'll just create a placeholder
	
	worldPath := filepath.Join(GetWorldsDirectory(), name + ".wld")
	
	// Check if world already exists
	if _, err := os.Stat(worldPath); err == nil {
		return nil, fmt.Errorf("world with name %s already exists", name)
	}

	// In a real implementation, we'd call the Terraria server here
	// to generate the world with the specified parameters
	
	world := &World{
		ID:         name,
		Name:       name,
		FileName:   name + ".wld",
		Size:       0,
		CreatedAt:  time.Now(),
		ModifiedAt: time.Now(),
		IsActive:   false,
	}

	return world, nil
}

// GetWorldByID returns a world by its ID
func GetWorldByID(worldID string) (*World, error) {
	worldPath := filepath.Join(GetWorldsDirectory(), worldID)
	
	info, err := os.Stat(worldPath)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, fmt.Errorf("world not found: %s", worldID)
		}
		return nil, err
	}

	world := &World{
		ID:         worldID,
		Name:       worldID,
		FileName:   worldID,
		Size:       info.Size(),
		ModifiedAt: info.ModTime(),
		IsActive:   false, // TODO: Check if this is the active world
	}

	return world, nil
}

// UpdateWorld updates world information
func UpdateWorld(worldID string, updates map[string]interface{}) error {
	// In a real implementation, we'd update world metadata here
	// This might involve updating a database record or metadata file
	return nil
}

// DeleteWorld deletes a world file
func DeleteWorld(worldID string) error {
	worldPath := filepath.Join(GetWorldsDirectory(), worldID)
	
	// Check if world exists
	if _, err := os.Stat(worldPath); os.IsNotExist(err) {
		return fmt.Errorf("world not found: %s", worldID)
	}

	// Delete the world file
	return os.Remove(worldPath)
}

// BackupWorld creates a backup of a world
func BackupWorld(worldID string) (string, error) {
	worldPath := filepath.Join(GetWorldsDirectory(), worldID)
	
	// Check if world exists
	if _, err := os.Stat(worldPath); os.IsNotExist(err) {
		return "", fmt.Errorf("world not found: %s", worldID)
	}

	// Create backups directory if it doesn't exist
	os.MkdirAll(backupsDirectory, 0755)

	// Generate backup filename with timestamp
	timestamp := time.Now().Format("20060102_150405")
	backupName := fmt.Sprintf("%s_backup_%s.wld", worldID, timestamp)
	backupPath := filepath.Join(backupsDirectory, backupName)

	// Copy world file to backup
	source, err := os.Open(worldPath)
	if err != nil {
		return "", err
	}
	defer source.Close()

	dest, err := os.Create(backupPath)
	if err != nil {
		return "", err
	}
	defer dest.Close()

	_, err = io.Copy(dest, source)
	if err != nil {
		return "", err
	}

	return backupPath, nil
}

// RestoreWorld restores a world from backup
func RestoreWorld(worldID, backupPath string) error {
	worldPath := filepath.Join(GetWorldsDirectory(), worldID)
	
	// Check if backup exists
	if _, err := os.Stat(backupPath); os.IsNotExist(err) {
		return fmt.Errorf("backup not found: %s", backupPath)
	}

	// Copy backup to world file
	source, err := os.Open(backupPath)
	if err != nil {
		return err
	}
	defer source.Close()

	dest, err := os.Create(worldPath)
	if err != nil {
		return err
	}
	defer dest.Close()

	_, err = io.Copy(dest, source)
	return err
}

// RegisterWorld registers a newly uploaded world in the system
func RegisterWorld(filename string) (*World, error) {
	worldPath := filepath.Join(GetWorldsDirectory(), filename)
	
	info, err := os.Stat(worldPath)
	if err != nil {
		return nil, err
	}

	world := &World{
		ID:         filename,
		Name:       filename,
		FileName:   filename,
		Size:       info.Size(),
		CreatedAt:  time.Now(),
		ModifiedAt: info.ModTime(),
		IsActive:   false,
	}

	// In a real implementation, we'd save this to a database
	return world, nil
}