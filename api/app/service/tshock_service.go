package service

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"terraria-api/app/model"
	"terraria-api/utils"
)

// TShockService TShock配置服务
type TShockService struct{}

// NewTShockService 创建TShock服务
func NewTShockService() *TShockService {
	return &TShockService{}
}

// GetTShockConfig 获取TShock配置
func (s *TShockService) GetTShockConfig(roomId uint) (map[string]interface{}, error) {
	// 获取房间信息
	var room model.Room
	if err := utils.DB.Preload("TShockConfig").First(&room, roomId).Error; err != nil {
		return nil, errors.New("房间不存在")
	}

	// 检查是否是TShock服务器
	if room.Type != model.ServerTypeTShock {
		return nil, errors.New("此房间不是TShock服务器")
	}

	// 读取配置文件
	configPath := filepath.Join("./servers", fmt.Sprintf("room_%d", roomId), "tshock", "config.json")
	content, err := os.ReadFile(configPath)
	if err != nil {
		// 如果文件不存在，返回默认配置
		return s.getDefaultTShockConfig(), nil
	}

	var config map[string]interface{}
	if err := json.Unmarshal(content, &config); err != nil {
		return nil, errors.New("配置文件格式错误")
	}

	return config, nil
}

// UpdateTShockConfig 更新TShock配置
func (s *TShockService) UpdateTShockConfig(roomId uint, config map[string]interface{}) error {
	// 获取房间信息
	var room model.Room
	if err := utils.DB.First(&room, roomId).Error; err != nil {
		return errors.New("房间不存在")
	}

	// 检查是否是TShock服务器
	if room.Type != model.ServerTypeTShock {
		return errors.New("此房间不是TShock服务器")
	}

	// 确保目录存在
	configDir := filepath.Join("./servers", fmt.Sprintf("room_%d", roomId), "tshock")
	if err := os.MkdirAll(configDir, 0755); err != nil {
		return err
	}

	// 写入配置文件
	configPath := filepath.Join(configDir, "config.json")
	content, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(configPath, content, 0644)
}

// GetSSCConfig 获取SSC配置
func (s *TShockService) GetSSCConfig(roomId uint) (map[string]interface{}, error) {
	// 获取房间信息
	var room model.Room
	if err := utils.DB.First(&room, roomId).Error; err != nil {
		return nil, errors.New("房间不存在")
	}

	// 检查是否是TShock服务器
	if room.Type != model.ServerTypeTShock {
		return nil, errors.New("此房间不是TShock服务器")
	}

	// 读取SSC配置文件
	configPath := filepath.Join("./servers", fmt.Sprintf("room_%d", roomId), "tshock", "sscconfig.json")
	content, err := os.ReadFile(configPath)
	if err != nil {
		// 如果文件不存在，返回默认配置
		return s.getDefaultSSCConfig(), nil
	}

	var config map[string]interface{}
	if err := json.Unmarshal(content, &config); err != nil {
		return nil, errors.New("配置文件格式错误")
	}

	return config, nil
}

// UpdateSSCConfig 更新SSC配置
func (s *TShockService) UpdateSSCConfig(roomId uint, config map[string]interface{}) error {
	// 获取房间信息
	var room model.Room
	if err := utils.DB.First(&room, roomId).Error; err != nil {
		return errors.New("房间不存在")
	}

	// 检查是否是TShock服务器
	if room.Type != model.ServerTypeTShock {
		return errors.New("此房间不是TShock服务器")
	}

	// 确保目录存在
	configDir := filepath.Join("./servers", fmt.Sprintf("room_%d", roomId), "tshock")
	if err := os.MkdirAll(configDir, 0755); err != nil {
		return err
	}

	// 写入配置文件
	configPath := filepath.Join(configDir, "sscconfig.json")
	content, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(configPath, content, 0644)
}

// getDefaultTShockConfig 获取默认TShock配置
func (s *TShockService) getDefaultTShockConfig() map[string]interface{} {
	return map[string]interface{}{
		"ServerName":               "TShock Server",
		"ServerPort":               7777,
		"MaxSlots":                 8,
		"ServerPassword":           "",
		"RestApiEnabled":           true,
		"RestApiPort":              7878,
		"ApplicationRestTokens":    map[string]interface{}{},
		"EnableWhitelist":          false,
		"AnnounceSave":             true,
		"ShowBackupAutosaveMessages": true,
		"BackupInterval":           10,
		"BackupKeepFor":            60,
		"BufferPackets":            false,
		"DefaultRegistrationGroupName": "default",
		"DisableBuild":             false,
		"DisableClownBombs":        false,
		"DisableDungeonGuardian":   false,
		"DisableInvisPvP":          false,
		"DisableSnowBalls":         false,
		"DisableTombstones":        true,
		"EnableDNSHostResolution":  false,
		"EnableIPBans":             true,
		"EnableUUIDAuth":           false,
		"EnableWhispers":           true,
		"ForceTime":                "normal",
		"HardcorOnly":              false,
		"InvasionMultiplier":       1,
		"KickOnMediumcoreDeath":    false,
		"KickOnMediumcoreKick":     false,
		"KickOnHardcoreDeath":      false,
		"LogPath":                  "tshock",
	}
}

// getDefaultSSCConfig 获取默认SSC配置
func (s *TShockService) getDefaultSSCConfig() map[string]interface{} {
	return map[string]interface{}{
		"Enabled":             false,
		"ServerSideCharacter": false,
		"StartingHealth":      100,
		"StartingMana":        20,
		"StartingInventory": []map[string]interface{}{
			{"netId": 3509, "stack": 1, "prefix": 0}, // 铜镐
			{"netId": 3506, "stack": 1, "prefix": 0}, // 铜斧
			{"netId": 3507, "stack": 1, "prefix": 0}, // 铜锤
		},
	}
}
