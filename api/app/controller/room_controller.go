package controller

import (
	"strconv"
	"terraria-api/app/model"
	"terraria-api/app/service"
	"terraria-api/utils"

	"github.com/gin-gonic/gin"
)

// RoomController 房间控制器
type RoomController struct {
	roomService *service.RoomService
}

// NewRoomController 创建房间控制器
func NewRoomController() *RoomController {
	return &RoomController{
		roomService: service.NewRoomService(),
	}
}

// GetRoomList 获取房间列表
func (rc *RoomController) GetRoomList(c *gin.Context) {
	rooms, err := rc.roomService.GetAllRooms()
	if err != nil {
		utils.ResponseError(c, "获取房间列表失败: "+err.Error())
		return
	}

	utils.ResponseSuccess(c, rooms)
}

// GetRoomDetail 获取房间详情
func (rc *RoomController) GetRoomDetail(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		utils.ResponseError(c, "无效的房间ID")
		return
	}

	room, err := rc.roomService.GetRoomByID(uint(id))
	if err != nil {
		utils.ResponseError(c, "获取房间详情失败: "+err.Error())
		return
	}

	utils.ResponseSuccess(c, room)
}

// CreateRoom 创建房间
func (rc *RoomController) CreateRoom(c *gin.Context) {
	var req model.Room
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ResponseError(c, "参数错误: "+err.Error())
		return
	}

	// 检查端口是否被占用
	if rc.roomService.IsPortInUse(req.Port) {
		utils.ResponseError(c, "端口已被占用")
		return
	}

	room, err := rc.roomService.CreateRoom(&req)
	if err != nil {
		utils.ResponseError(c, "创建房间失败: "+err.Error())
		return
	}

	utils.ResponseSuccess(c, room)
}

// UpdateRoom 更新房间
func (rc *RoomController) UpdateRoom(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		utils.ResponseError(c, "无效的房间ID")
		return
	}

	var req model.Room
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ResponseError(c, "参数错误: "+err.Error())
		return
	}

	req.ID = uint(id)
	room, err := rc.roomService.UpdateRoom(&req)
	if err != nil {
		utils.ResponseError(c, "更新房间失败: "+err.Error())
		return
	}

	utils.ResponseSuccess(c, room)
}

// DeleteRoom 删除房间
func (rc *RoomController) DeleteRoom(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		utils.ResponseError(c, "无效的房间ID")
		return
	}

	if err := rc.roomService.DeleteRoom(uint(id)); err != nil {
		utils.ResponseError(c, "删除房间失败: "+err.Error())
		return
	}

	utils.ResponseSuccess(c, nil)
}

// StartServer 启动服务器
func (rc *RoomController) StartServer(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		utils.ResponseError(c, "无效的房间ID")
		return
	}

	if err := rc.roomService.StartServer(uint(id)); err != nil {
		utils.ResponseError(c, "启动服务器失败: "+err.Error())
		return
	}

	utils.ResponseSuccess(c, gin.H{"message": "服务器启动成功"})
}

// StopServer 停止服务器
func (rc *RoomController) StopServer(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		utils.ResponseError(c, "无效的房间ID")
		return
	}

	if err := rc.roomService.StopServer(uint(id)); err != nil {
		utils.ResponseError(c, "停止服务器失败: "+err.Error())
		return
	}

	utils.ResponseSuccess(c, gin.H{"message": "服务器已停止"})
}

// RestartServer 重启服务器
func (rc *RoomController) RestartServer(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		utils.ResponseError(c, "无效的房间ID")
		return
	}

	if err := rc.roomService.RestartServer(uint(id)); err != nil {
		utils.ResponseError(c, "重启服务器失败: "+err.Error())
		return
	}

	utils.ResponseSuccess(c, gin.H{"message": "服务器重启成功"})
}

// GetServerStatus 获取服务器状态
func (rc *RoomController) GetServerStatus(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		utils.ResponseError(c, "无效的房间ID")
		return
	}

	status, err := rc.roomService.GetServerStatus(uint(id))
	if err != nil {
		utils.ResponseError(c, "获取服务器状态失败: "+err.Error())
		return
	}

	utils.ResponseSuccess(c, status)
}
