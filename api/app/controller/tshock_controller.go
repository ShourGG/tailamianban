package controller

import (
	"strconv"
	"terraria-api/app/service"
	"terraria-api/utils"

	"github.com/gin-gonic/gin"
)

// TShockController TShock配置控制器
type TShockController struct {
	tshockService *service.TShockService
}

// NewTShockController 创建TShock控制器
func NewTShockController() *TShockController {
	return &TShockController{
		tshockService: service.NewTShockService(),
	}
}

// GetTShockConfig 获取TShock配置
func (tc *TShockController) GetTShockConfig(c *gin.Context) {
	roomIdStr := c.Param("id")
	roomId, err := strconv.ParseUint(roomIdStr, 10, 32)
	if err != nil {
		utils.ResponseError(c, "无效的房间ID")
		return
	}

	config, err := tc.tshockService.GetTShockConfig(uint(roomId))
	if err != nil {
		utils.ResponseError(c, "获取TShock配置失败: "+err.Error())
		return
	}

	utils.ResponseSuccess(c, config)
}

// UpdateTShockConfig 更新TShock配置
func (tc *TShockController) UpdateTShockConfig(c *gin.Context) {
	roomIdStr := c.Param("id")
	roomId, err := strconv.ParseUint(roomIdStr, 10, 32)
	if err != nil {
		utils.ResponseError(c, "无效的房间ID")
		return
	}

	var config map[string]interface{}
	if err := c.ShouldBindJSON(&config); err != nil {
		utils.ResponseError(c, "参数错误: "+err.Error())
		return
	}

	if err := tc.tshockService.UpdateTShockConfig(uint(roomId), config); err != nil {
		utils.ResponseError(c, "更新TShock配置失败: "+err.Error())
		return
	}

	utils.ResponseSuccess(c, gin.H{"message": "配置更新成功"})
}

// GetSSCConfig 获取SSC配置
func (tc *TShockController) GetSSCConfig(c *gin.Context) {
	roomIdStr := c.Param("id")
	roomId, err := strconv.ParseUint(roomIdStr, 10, 32)
	if err != nil {
		utils.ResponseError(c, "无效的房间ID")
		return
	}

	config, err := tc.tshockService.GetSSCConfig(uint(roomId))
	if err != nil {
		utils.ResponseError(c, "获取SSC配置失败: "+err.Error())
		return
	}

	utils.ResponseSuccess(c, config)
}

// UpdateSSCConfig 更新SSC配置
func (tc *TShockController) UpdateSSCConfig(c *gin.Context) {
	roomIdStr := c.Param("id")
	roomId, err := strconv.ParseUint(roomIdStr, 10, 32)
	if err != nil {
		utils.ResponseError(c, "无效的房间ID")
		return
	}

	var config map[string]interface{}
	if err := c.ShouldBindJSON(&config); err != nil {
		utils.ResponseError(c, "参数错误: "+err.Error())
		return
	}

	if err := tc.tshockService.UpdateSSCConfig(uint(roomId), config); err != nil {
		utils.ResponseError(c, "更新SSC配置失败: "+err.Error())
		return
	}

	utils.ResponseSuccess(c, gin.H{"message": "SSC配置更新成功"})
}
