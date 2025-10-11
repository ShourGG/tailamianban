package config

import (
	"log"
	"os"
	"path/filepath"
)

// Config 全局配置
type Config struct {
	DBPath     string
	ServerPath string
}

var GlobalConfig *Config

// Init 初始化配置
func Init(dbPath string) {
	GlobalConfig = &Config{
		DBPath:     dbPath,
		ServerPath: "./terraria_servers",
	}

	// 确保目录存在
	ensureDir(dbPath)
	ensureDir(GlobalConfig.ServerPath)

	log.Println("✅ 配置初始化成功")
}

// ensureDir 确保目录存在
func ensureDir(dir string) {
	if _, err := os.Stat(dir); os.IsNotExist(err) {
		if err := os.MkdirAll(dir, 0755); err != nil {
			log.Fatalf("❌ 创建目录失败: %v", err)
		}
	}
}

// GetServerPath 获取服务器路径
func GetServerPath(roomID uint, serverType string) string {
	return filepath.Join(GlobalConfig.ServerPath, serverType, string(rune(roomID)))
}
