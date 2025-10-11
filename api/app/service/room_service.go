package service

import (
	"errors"
	"fmt"
	"log"
	"os/exec"
	"runtime"
	"terraria-api/app/model"
	"terraria-api/utils"
)

// RoomService 房间服务
type RoomService struct{}

// NewRoomService 创建房间服务
func NewRoomService() *RoomService {
	return &RoomService{}
}

// GetAllRooms 获取所有房间
func (rs *RoomService) GetAllRooms() ([]model.Room, error) {
	var rooms []model.Room
	result := utils.DB.Preload("WorldConfig").Preload("TShockConfig").Preload("TModLoaderConfig").Find(&rooms)
	return rooms, result.Error
}

// GetRoomByID 根据ID获取房间
func (rs *RoomService) GetRoomByID(id uint) (*model.Room, error) {
	var room model.Room
	result := utils.DB.Preload("WorldConfig").Preload("TShockConfig").Preload("TModLoaderConfig").First(&room, id)
	if result.Error != nil {
		return nil, result.Error
	}
	return &room, nil
}

// CreateRoom 创建房间
func (rs *RoomService) CreateRoom(room *model.Room) (*model.Room, error) {
	// 设置初始状态
	room.Status = model.StatusStopped
	room.CurrentPlayers = 0

	// 创建房间
	if err := utils.DB.Create(room).Error; err != nil {
		return nil, err
	}

	// 创建世界配置
	if room.WorldConfig != nil {
		room.WorldConfig.RoomID = room.ID
		if err := utils.DB.Create(room.WorldConfig).Error; err != nil {
			return nil, err
		}
	}

	// 创建TShock配置
	if room.Type == model.ServerTypeTShock && room.TShockConfig != nil {
		room.TShockConfig.RoomID = room.ID
		if err := utils.DB.Create(room.TShockConfig).Error; err != nil {
			return nil, err
		}
	}

	// 创建TModLoader配置
	if room.Type == model.ServerTypeTModLoader && room.TModLoaderConfig != nil {
		room.TModLoaderConfig.RoomID = room.ID
		if err := utils.DB.Create(room.TModLoaderConfig).Error; err != nil {
			return nil, err
		}
	}

	return room, nil
}

// UpdateRoom 更新房间
func (rs *RoomService) UpdateRoom(room *model.Room) (*model.Room, error) {
	if err := utils.DB.Save(room).Error; err != nil {
		return nil, err
	}
	return room, nil
}

// DeleteRoom 删除房间
func (rs *RoomService) DeleteRoom(id uint) error {
	// 先停止服务器
	room, err := rs.GetRoomByID(id)
	if err != nil {
		return err
	}

	if room.Status == model.StatusRunning {
		if err := rs.StopServer(id); err != nil {
			return errors.New("无法删除运行中的服务器")
		}
	}

	// 删除关联配置
	utils.DB.Where("room_id = ?", id).Delete(&model.WorldConfig{})
	utils.DB.Where("room_id = ?", id).Delete(&model.TShockConfig{})
	utils.DB.Where("room_id = ?", id).Delete(&model.TModLoaderConfig{})
	utils.DB.Where("room_id = ?", id).Delete(&model.Player{})

	// 删除房间
	return utils.DB.Delete(&model.Room{}, id).Error
}

// IsPortInUse 检查端口是否被占用
func (rs *RoomService) IsPortInUse(port int) bool {
	var count int64
	utils.DB.Model(&model.Room{}).Where("port = ?", port).Count(&count)
	return count > 0
}

// StartServer 启动服务器
func (rs *RoomService) StartServer(id uint) error {
	room, err := rs.GetRoomByID(id)
	if err != nil {
		return err
	}

	if room.Status == model.StatusRunning {
		return errors.New("服务器已在运行中")
	}

	// 更新状态为启动中
	room.Status = model.StatusStarting
	utils.DB.Save(room)

	// 根据服务器类型启动
	go func() {
		var cmd *exec.Cmd
		switch room.Type {
		case model.ServerTypeVanilla:
			cmd = rs.startVanillaServer(room)
		case model.ServerTypeTShock:
			cmd = rs.startTShockServer(room)
		case model.ServerTypeTModLoader:
			cmd = rs.startTModLoaderServer(room)
		}

		if cmd != nil {
			// 启动进程
			if err := cmd.Start(); err != nil {
				log.Printf("❌ 启动服务器失败: %v", err)
				room.Status = model.StatusError
				utils.DB.Save(room)
				return
			}

			// 保存进程PID
			room.ProcessPID = cmd.Process.Pid
			room.Status = model.StatusRunning
			utils.DB.Save(room)

			log.Printf("✅ 房间 %s (ID:%d) 启动成功, PID: %d", room.Name, room.ID, cmd.Process.Pid)

			// 等待进程结束
			cmd.Wait()

			// 进程结束后更新状态
			room.Status = model.StatusStopped
			room.ProcessPID = 0
			room.CurrentPlayers = 0
			utils.DB.Save(room)
			log.Printf("⚠️ 房间 %s (ID:%d) 已停止", room.Name, room.ID)
		}
	}()

	return nil
}

// StopServer 停止服务器
func (rs *RoomService) StopServer(id uint) error {
	room, err := rs.GetRoomByID(id)
	if err != nil {
		return err
	}

	if room.Status != model.StatusRunning {
		return errors.New("服务器未在运行中")
	}

	// 更新状态为停止中
	room.Status = model.StatusStopping
	utils.DB.Save(room)

	// 杀死进程
	if room.ProcessPID > 0 {
		var cmd *exec.Cmd
		if runtime.GOOS == "windows" {
			cmd = exec.Command("taskkill", "/F", "/PID", fmt.Sprintf("%d", room.ProcessPID))
		} else {
			cmd = exec.Command("kill", "-9", fmt.Sprintf("%d", room.ProcessPID))
		}

		if err := cmd.Run(); err != nil {
			log.Printf("❌ 停止服务器失败: %v", err)
			room.Status = model.StatusError
			utils.DB.Save(room)
			return err
		}
	}

	// 更新状态
	room.Status = model.StatusStopped
	room.ProcessPID = 0
	room.CurrentPlayers = 0
	utils.DB.Save(room)

	return nil
}

// RestartServer 重启服务器
func (rs *RoomService) RestartServer(id uint) error {
	if err := rs.StopServer(id); err != nil {
		return err
	}
	return rs.StartServer(id)
}

// GetServerStatus 获取服务器状态
func (rs *RoomService) GetServerStatus(id uint) (map[string]interface{}, error) {
	room, err := rs.GetRoomByID(id)
	if err != nil {
		return nil, err
	}

	status := map[string]interface{}{
		"status":         room.Status,
		"currentPlayers": room.CurrentPlayers,
		"maxPlayers":     room.MaxPlayers,
		"pid":            room.ProcessPID,
		"port":           room.Port,
	}

	return status, nil
}

// startVanillaServer 启动原版服务器
func (rs *RoomService) startVanillaServer(room *model.Room) *exec.Cmd {
	// TODO: 实现原版服务器启动逻辑
	// 示例: ./TerrariaServer.exe -port 7777 -world World.wld -players 8
	log.Printf("🚀 准备启动原版服务器: %s", room.Name)
	return nil
}

// startTShockServer 启动TShock服务器
func (rs *RoomService) startTShockServer(room *model.Room) *exec.Cmd {
	// TODO: 实现TShock服务器启动逻辑
	// 示例: ./TShock.Server.exe -port 7777 -world World.wld -players 8
	log.Printf("🚀 准备启动TShock服务器: %s", room.Name)
	return nil
}

// startTModLoaderServer 启动TModLoader服务器
func (rs *RoomService) startTModLoaderServer(room *model.Room) *exec.Cmd {
	// TODO: 实现TModLoader服务器启动逻辑
	// 示例: ./tModLoaderServer.exe -port 7777 -world World.wld -players 8
	log.Printf("🚀 准备启动TModLoader服务器: %s", room.Name)
	return nil
}
