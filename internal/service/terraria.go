package service

import (
	"bufio"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"syscall"
	"time"
	"terraria-panel/internal/repository"
)

// TerrariaServerStatus represents the server status
type TerrariaServerStatus struct {
	Status      string `json:"status"`       // running, stopped, starting, stopping
	PID         int    `json:"pid"`          // Process ID
	Uptime      int64  `json:"uptime"`       // Uptime in seconds
	PlayerCount int    `json:"player_count"` // Current player count
	MaxPlayers  int    `json:"max_players"`  // Maximum players
	WorldName   string `json:"world_name"`   // Current world name
	Port        int    `json:"port"`         // Server port
	Version     string `json:"version"`      // Terraria version
	StartTime   time.Time `json:"start_time"` // Server start time
}

// TerrariaServerConfig represents server configuration
type TerrariaServerConfig struct {
	WorldName    string `json:"world_name"`
	MaxPlayers   int    `json:"max_players"`
	Port         int    `json:"port"`
	Password     string `json:"password"`
	Difficulty   string `json:"difficulty"`
	AutoSave     bool   `json:"auto_save"`
	AutoSaveTime int    `json:"auto_save_time"`
	WorldPath    string `json:"world_path"`
	ServerPath   string `json:"server_path"`
}

var (
	serverProcess *exec.Cmd
	serverMutex   sync.RWMutex
	serverStatus  = &TerrariaServerStatus{
		Status: "stopped",
	}
)

// GetTerrariaServerStatus returns the current server status
func GetTerrariaServerStatus() (*TerrariaServerStatus, error) {
	serverMutex.RLock()
	defer serverMutex.RUnlock()

	// Update status based on process state
	if serverProcess != nil {
		// Check if process is still running
		if serverProcess.Process != nil {
			err := serverProcess.Process.Signal(syscall.Signal(0))
			if err == nil {
				// Process is running
				if serverStatus.Status != "running" {
					serverStatus.Status = "running"
				}
				// Update uptime
				if !serverStatus.StartTime.IsZero() {
					serverStatus.Uptime = int64(time.Since(serverStatus.StartTime).Seconds())
				}
			} else {
				// Process is not running
				serverStatus.Status = "stopped"
				serverStatus.PID = 0
				serverStatus.Uptime = 0
				serverProcess = nil
			}
		}
	} else {
		serverStatus.Status = "stopped"
		serverStatus.PID = 0
		serverStatus.Uptime = 0
	}

	// Create a copy to return
	status := *serverStatus
	return &status, nil
}

// StartTerrariaServer starts the Terraria server
func StartTerrariaServer() error {
	serverMutex.Lock()
	defer serverMutex.Unlock()

	// Check if already running
	if serverProcess != nil && serverProcess.Process != nil {
		err := serverProcess.Process.Signal(syscall.Signal(0))
		if err == nil {
			return errors.New("server is already running")
		}
	}

	// Get server configuration
	config, err := GetTerrariaServerConfig()
	if err != nil {
		return fmt.Errorf("failed to get server config: %v", err)
	}

	// Check if server executable exists
	if config.ServerPath == "" {
		config.ServerPath = getDefaultServerPath()
	}

	if !fileExists(config.ServerPath) {
		return fmt.Errorf("terraria server executable not found: %s", config.ServerPath)
	}

	// Prepare server arguments
	args := []string{
		"-server",
		"-port", strconv.Itoa(config.Port),
		"-maxplayers", strconv.Itoa(config.MaxPlayers),
		"-world", config.WorldPath,
		"-autocreate", "2", // Medium world
		"-difficulty", getDifficultyNumber(config.Difficulty),
	}

	if config.Password != "" {
		args = append(args, "-password", config.Password)
	}

	if config.AutoSave {
		args = append(args, "-autosave")
	}

	// Create the command
	serverProcess = exec.Command(config.ServerPath, args...)
	
	// Set working directory
	serverProcess.Dir = filepath.Dir(config.ServerPath)
	
	// Create log file
	logFile, err := createServerLogFile()
	if err != nil {
		return fmt.Errorf("failed to create log file: %v", err)
	}
	
	serverProcess.Stdout = logFile
	serverProcess.Stderr = logFile

	// Start the process
	err = serverProcess.Start()
	if err != nil {
		return fmt.Errorf("failed to start server process: %v", err)
	}

	// Update status
	serverStatus.Status = "starting"
	serverStatus.PID = serverProcess.Process.Pid
	serverStatus.StartTime = time.Now()
	serverStatus.WorldName = config.WorldName
	serverStatus.Port = config.Port
	serverStatus.MaxPlayers = config.MaxPlayers

	// Start monitoring goroutine
	go monitorServerProcess()

	return nil
}

// RestartTerrariaServer restarts the Terraria server
func RestartTerrariaServer() error {
	// Stop the server first
	err := StopTerrariaServer()
	if err != nil && err.Error() != "server is not running" {
		return err
	}

	// Wait a moment before starting
	time.Sleep(2 * time.Second)

	// Start the server
	return StartTerrariaServer()
}

// StopTerrariaServer stops the Terraria server
func StopTerrariaServer() error {
	serverMutex.Lock()
	defer serverMutex.Unlock()

	if serverProcess == nil || serverProcess.Process == nil {
		return errors.New("server is not running")
	}

	serverStatus.Status = "stopping"

	// Try graceful shutdown first
	err := serverProcess.Process.Signal(syscall.SIGTERM)
	if err != nil {
		// Force kill if graceful shutdown fails
		err = serverProcess.Process.Kill()
		if err != nil {
			return fmt.Errorf("failed to kill server process: %v", err)
		}
	}

	// Wait for process to exit
	go func() {
		serverProcess.Wait()
		serverMutex.Lock()
		serverStatus.Status = "stopped"
		serverStatus.PID = 0
		serverStatus.Uptime = 0
		serverProcess = nil
		serverMutex.Unlock()
	}()

	return nil
}

// GetTerrariaServerConfig returns the server configuration
func GetTerrariaServerConfig() (*TerrariaServerConfig, error) {
	// Default configuration
	config := &TerrariaServerConfig{
		WorldName:    "Terraria World",
		MaxPlayers:   8,
		Port:         7777,
		Password:     "",
		Difficulty:   "classic",
		AutoSave:     true,
		AutoSaveTime: 10,
		WorldPath:    getDefaultWorldPath(),
		ServerPath:   getDefaultServerPath(),
	}

	// Try to load from database
	configs, err := repository.GetServerConfigs()
	if err == nil {
		for _, cfg := range configs {
			switch cfg.Key {
			case "world_name":
				config.WorldName = cfg.Value
			case "max_players":
				if val, err := strconv.Atoi(cfg.Value); err == nil {
					config.MaxPlayers = val
				}
			case "port":
				if val, err := strconv.Atoi(cfg.Value); err == nil {
					config.Port = val
				}
			case "password":
				config.Password = cfg.Value
			case "difficulty":
				config.Difficulty = cfg.Value
			case "auto_save":
				config.AutoSave = cfg.Value == "true"
			case "auto_save_time":
				if val, err := strconv.Atoi(cfg.Value); err == nil {
					config.AutoSaveTime = val
				}
			case "world_path":
				config.WorldPath = cfg.Value
			case "server_path":
				config.ServerPath = cfg.Value
			}
		}
	}

	return config, nil
}

// UpdateTerrariaServerConfig updates the server configuration
func UpdateTerrariaServerConfig(config *TerrariaServerConfig) error {
	// Validate configuration
	if config.MaxPlayers < 1 || config.MaxPlayers > 255 {
		return errors.New("max players must be between 1 and 255")
	}
	if config.Port < 1024 || config.Port > 65535 {
		return errors.New("port must be between 1024 and 65535")
	}
	if config.Difficulty != "classic" && config.Difficulty != "expert" && config.Difficulty != "master" {
		return errors.New("difficulty must be classic, expert, or master")
	}

	// Save to database
	configs := map[string]string{
		"world_name":     config.WorldName,
		"max_players":    strconv.Itoa(config.MaxPlayers),
		"port":           strconv.Itoa(config.Port),
		"password":       config.Password,
		"difficulty":     config.Difficulty,
		"auto_save":      strconv.FormatBool(config.AutoSave),
		"auto_save_time": strconv.Itoa(config.AutoSaveTime),
		"world_path":     config.WorldPath,
		"server_path":    config.ServerPath,
	}

	for key, value := range configs {
		err := repository.SetServerConfig(key, value, "")
		if err != nil {
			return fmt.Errorf("failed to save config %s: %v", key, err)
		}
	}

	return nil
}

// GetTerrariaServerLogs returns server logs
func GetTerrariaServerLogs(lines string, follow bool) ([]string, error) {
	logPath := getServerLogPath()
	
	if !fileExists(logPath) {
		return []string{}, nil
	}

	var result []string
	
	if follow {
		// For real-time logs, return last few lines
		// This is a simplified implementation
		file, err := os.Open(logPath)
		if err != nil {
			return nil, err
		}
		defer file.Close()

		scanner := bufio.NewScanner(file)
		for scanner.Scan() {
			result = append(result, scanner.Text())
		}

		// Return last N lines
		n := 100
		if lines != "" {
			if num, err := strconv.Atoi(lines); err == nil {
				n = num
			}
		}
		if len(result) > n {
			result = result[len(result)-n:]
		}
	}

	return result, nil
}

// Helper functions

func getDefaultServerPath() string {
	if path := os.Getenv("TERRARIA_SERVER_PATH"); path != "" {
		return path
	}
	return "./terraria-server/TerrariaServer"
}

func getDefaultWorldPath() string {
	if path := os.Getenv("TERRARIA_WORLD_PATH"); path != "" {
		return path
	}
	return "./data/worlds/default.wld"
}

func getDifficultyNumber(difficulty string) string {
	switch difficulty {
	case "expert":
		return "1"
	case "master":
		return "2"
	case "journey":
		return "3"
	default:
		return "0" // classic
	}
}

func fileExists(path string) bool {
	_, err := os.Stat(path)
	return !os.IsNotExist(err)
}

func createServerLogFile() (*os.File, error) {
	logDir := "./logs"
	os.MkdirAll(logDir, 0755)
	
	logPath := filepath.Join(logDir, fmt.Sprintf("terraria-server-%s.log", time.Now().Format("2006-01-02")))
	return os.OpenFile(logPath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
}

func getServerLogPath() string {
	return filepath.Join("./logs", fmt.Sprintf("terraria-server-%s.log", time.Now().Format("2006-01-02")))
}

func monitorServerProcess() {
	if serverProcess == nil {
		return
	}

	// Wait for process to exit
	err := serverProcess.Wait()
	
	serverMutex.Lock()
	defer serverMutex.Unlock()
	
	if err != nil {
		// Server crashed or was killed
		serverStatus.Status = "crashed"
	} else {
		// Server exited normally
		serverStatus.Status = "stopped"
	}
	
	serverStatus.PID = 0
	serverStatus.Uptime = 0
	serverProcess = nil
}
		
		// Return last N lines
		lineCount, _ := strconv.Atoi(lines)
		if lineCount > 0 && len(result) > lineCount {
			result = result[len(result)-lineCount:]
		}
	} else {
		// Read specified number of lines
		file, err := os.Open(logPath)
		if err != nil {
			return nil, err
		}
		defer file.Close()

		scanner := bufio.NewScanner(file)
		for scanner.Scan() {
			result = append(result, scanner.Text())
		}
		
		// Return last N lines
		lineCount, _ := strconv.Atoi(lines)
		if lineCount > 0 && len(result) > lineCount {
			result = result[len(result)-lineCount:]
		}
	}

	return result, nil
}

// ClearTerrariaServerLogs clears server logs
func ClearTerrariaServerLogs() error {
	logPath := getServerLogPath()
	
	// Truncate the log file
	file, err := os.OpenFile(logPath, os.O_WRONLY|os.O_TRUNC, 0644)
	if err != nil {
		return err
	}
	defer file.Close()

	return nil
}

// Helper functions

func monitorServerProcess() {
	if serverProcess == nil {
		return
	}

	// Wait for process to complete
	err := serverProcess.Wait()
	
	serverMutex.Lock()
	defer serverMutex.Unlock()

	if err != nil {
		serverStatus.Status = "stopped"
	} else {
		serverStatus.Status = "stopped"
	}
	
	serverStatus.PID = 0
	serverStatus.Uptime = 0
	serverProcess = nil
}

func getDefaultServerPath() string {
	// Try common Terraria server paths
	paths := []string{
		"/opt/terraria/TerrariaServer.bin.x86_64",
		"/usr/local/bin/TerrariaServer",
		"./TerrariaServer.bin.x86_64",
		"./TerrariaServer",
	}

	for _, path := range paths {
		if fileExists(path) {
			return path
		}
	}

	return "/opt/terraria/TerrariaServer.bin.x86_64"
}

func getDefaultWorldPath() string {
	dataDir := os.Getenv("DATA_DIR")
	if dataDir == "" {
		dataDir = "./data"
	}
	return filepath.Join(dataDir, "worlds", "world.wld")
}

func getServerLogPath() string {
	logDir := "./logs"
	if dir := os.Getenv("LOG_DIR"); dir != "" {
		logDir = dir
	}
	return filepath.Join(logDir, "terraria-server.log")
}

func createServerLogFile() (*os.File, error) {
	logPath := getServerLogPath()
	
	// Ensure log directory exists
	err := os.MkdirAll(filepath.Dir(logPath), 0755)
	if err != nil {
		return nil, err
	}

	// Create or append to log file
	return os.OpenFile(logPath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
}

func getDifficultyNumber(difficulty string) string {
	switch strings.ToLower(difficulty) {
	case "classic":
		return "0"
	case "expert":
		return "1"
	case "master":
		return "2"
	default:
		return "0"
	}
}

func fileExists(path string) bool {
	_, err := os.Stat(path)
	return !os.IsNotExist(err)
}