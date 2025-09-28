package handlers

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"terraria-panel/internal/service"
	"time"

	"github.com/gin-gonic/gin"
)

// World represents a Terraria world
type World struct {
	ID         string    `json:"id"`
	Name       string    `json:"name"`
	Size       int64     `json:"size"`
	CreatedAt  time.Time `json:"created_at"`
	ModifiedAt time.Time `json:"modified_at"`
	IsActive   bool      `json:"is_active"`
	BackupCount int      `json:"backup_count"`
}

// WorldCreateRequest represents world creation request
type WorldCreateRequest struct {
	Name       string `json:"name" binding:"required"`
	Size       string `json:"size" binding:"required,oneof=small medium large"`
	Difficulty string `json:"difficulty" binding:"required,oneof=classic expert master journey"`
	Seed       string `json:"seed"`
}

// ListWorlds returns all available worlds
func ListWorlds(c *gin.Context) {
	worlds, err := service.GetAllWorlds()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get worlds list",
			"code":  "WORLDS_LIST_ERROR",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"worlds": worlds,
		"count":  len(worlds),
	})
}

// CreateWorld creates a new world
func CreateWorld(c *gin.Context) {
	userID, _ := c.Get("user_id")
	
	var req WorldCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request format",
			"code":  "INVALID_REQUEST",
			"details": err.Error(),
		})
		return
	}

	// Create the world
	world, err := service.CreateWorld(req.Name, req.Size, req.Difficulty, req.Seed)
	if err != nil {
		service.LogAuditEvent(userID.(string), "world.create_failed", 
			fmt.Sprintf("Failed to create world %s: %v", req.Name, err), c.ClientIP())
		
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create world",
			"code":  "WORLD_CREATE_FAILED",
			"details": err.Error(),
		})
		return
	}

	// Log success
	service.LogAuditEvent(userID.(string), "world.create", 
		fmt.Sprintf("Created world: %s", req.Name), c.ClientIP())

	c.JSON(http.StatusCreated, world)
}

// GetWorld returns information about a specific world
func GetWorld(c *gin.Context) {
	worldID := c.Param("id")
	
	world, err := service.GetWorldByID(worldID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "World not found",
			"code":  "WORLD_NOT_FOUND",
		})
		return
	}

	c.JSON(http.StatusOK, world)
}

// UpdateWorld updates world information
func UpdateWorld(c *gin.Context) {
	userID, _ := c.Get("user_id")
	worldID := c.Param("id")
	
	var req map[string]interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request format",
			"code":  "INVALID_REQUEST",
		})
		return
	}

	// Update the world
	err := service.UpdateWorld(worldID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to update world",
			"code":  "WORLD_UPDATE_FAILED",
		})
		return
	}

	// Log update
	service.LogAuditEvent(userID.(string), "world.update", 
		fmt.Sprintf("Updated world: %s", worldID), c.ClientIP())

	c.JSON(http.StatusOK, gin.H{
		"message": "World updated successfully",
	})
}

// DeleteWorld deletes a world file
func DeleteWorld(c *gin.Context) {
	userID, _ := c.Get("user_id")
	worldID := c.Param("id")
	
	// Check if world exists
	world, err := service.GetWorldByID(worldID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "World not found",
			"code":  "WORLD_NOT_FOUND",
		})
		return
	}

	// Check if world is currently active
	if world.IsActive {
		c.JSON(http.StatusConflict, gin.H{
			"error": "Cannot delete active world",
			"code":  "WORLD_IS_ACTIVE",
		})
		return
	}

	// Delete the world
	err = service.DeleteWorld(worldID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to delete world",
			"code":  "WORLD_DELETE_FAILED",
		})
		return
	}

	// Log deletion
	service.LogAuditEvent(userID.(string), "world.delete", 
		fmt.Sprintf("Deleted world: %s", world.Name), c.ClientIP())

	c.JSON(http.StatusOK, gin.H{
		"message": "World deleted successfully",
	})
}

// BackupWorld creates a backup of a world
func BackupWorld(c *gin.Context) {
	userID, _ := c.Get("user_id")
	worldID := c.Param("id")
	
	// Get world information
	world, err := service.GetWorldByID(worldID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "World not found",
			"code":  "WORLD_NOT_FOUND",
		})
		return
	}

	// Create backup
	backupPath, err := service.BackupWorld(worldID)
	if err != nil {
		service.LogAuditEvent(userID.(string), "world.backup_failed", 
			fmt.Sprintf("Failed to backup world %s: %v", world.Name, err), c.ClientIP())
		
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to backup world",
			"code":  "WORLD_BACKUP_FAILED",
			"details": err.Error(),
		})
		return
	}

	// Log success
	service.LogAuditEvent(userID.(string), "world.backup", 
		fmt.Sprintf("Created backup for world: %s", world.Name), c.ClientIP())

	c.JSON(http.StatusOK, gin.H{
		"message": "World backed up successfully",
		"backup_path": backupPath,
	})
}

// RestoreWorld restores a world from backup
func RestoreWorld(c *gin.Context) {
	userID, _ := c.Get("user_id")
	worldID := c.Param("id")
	
	var req struct {
		BackupPath string `json:"backup_path" binding:"required"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request format",
			"code":  "INVALID_REQUEST",
		})
		return
	}

	// Restore the world
	err := service.RestoreWorld(worldID, req.BackupPath)
	if err != nil {
		service.LogAuditEvent(userID.(string), "world.restore_failed", 
			fmt.Sprintf("Failed to restore world %s: %v", worldID, err), c.ClientIP())
		
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to restore world",
			"code":  "WORLD_RESTORE_FAILED",
			"details": err.Error(),
		})
		return
	}

	// Log success
	service.LogAuditEvent(userID.(string), "world.restore", 
		fmt.Sprintf("Restored world: %s from %s", worldID, req.BackupPath), c.ClientIP())

	c.JSON(http.StatusOK, gin.H{
		"message": "World restored successfully",
	})
}

// UploadWorld handles world file upload
func UploadWorld(c *gin.Context) {
	userID, _ := c.Get("user_id")
	
	// Parse multipart form
	file, header, err := c.Request.FormFile("world")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "No file provided",
			"code":  "NO_FILE",
		})
		return
	}
	defer file.Close()

	// Validate file extension
	ext := filepath.Ext(header.Filename)
	if ext != ".wld" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid file format. Only .wld files are allowed",
			"code":  "INVALID_FILE_FORMAT",
		})
		return
	}

	// Save uploaded file
	worldPath := filepath.Join(service.GetWorldsDirectory(), header.Filename)
	out, err := os.Create(worldPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to save uploaded file",
			"code":  "FILE_SAVE_FAILED",
		})
		return
	}
	defer out.Close()

	_, err = io.Copy(out, file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to save uploaded file",
			"code":  "FILE_SAVE_FAILED",
		})
		return
	}

	// Register world in database
	world, err := service.RegisterWorld(header.Filename)
	if err != nil {
		// Clean up uploaded file if registration fails
		os.Remove(worldPath)
		
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to register world",
			"code":  "WORLD_REGISTER_FAILED",
		})
		return
	}

	// Log upload
	service.LogAuditEvent(userID.(string), "world.upload", 
		fmt.Sprintf("Uploaded world: %s", header.Filename), c.ClientIP())

	c.JSON(http.StatusCreated, gin.H{
		"message": "World uploaded successfully",
		"world":   world,
	})
}

// DownloadWorld handles world file download
func DownloadWorld(c *gin.Context) {
	userID, _ := c.Get("user_id")
	worldID := c.Param("id")
	
	// Get world information
	world, err := service.GetWorldByID(worldID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "World not found",
			"code":  "WORLD_NOT_FOUND",
		})
		return
	}

	// Get world file path
	worldPath := filepath.Join(service.GetWorldsDirectory(), world.FileName)
	
	// Check if file exists
	if _, err := os.Stat(worldPath); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "World file not found",
			"code":  "FILE_NOT_FOUND",
		})
		return
	}

	// Log download
	service.LogAuditEvent(userID.(string), "world.download", 
		fmt.Sprintf("Downloaded world: %s", world.Name), c.ClientIP())

	// Send file
	c.Header("Content-Description", "File Transfer")
	c.Header("Content-Transfer-Encoding", "binary")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", world.FileName))
	c.Header("Content-Type", "application/octet-stream")
	c.File(worldPath)
}