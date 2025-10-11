package controller

import (
	"terraria-api/app/service"
	"terraria-api/utils"

	"github.com/gin-gonic/gin"
)

// ModController Mod市场控制器
type ModController struct {
	modService *service.ModService
}

// NewModController 创建Mod控制器
func NewModController() *ModController {
	return &ModController{
		modService: service.NewModService(),
	}
}

// SearchWorkshopMods 搜索Workshop模组
func (mc *ModController) SearchWorkshopMods(c *gin.Context) {
	query := c.Query("q")
	page := c.DefaultQuery("page", "1")

	mods, err := mc.modService.SearchWorkshopMods(query, page)
	if err != nil {
		utils.ResponseError(c, "搜索模组失败: "+err.Error())
		return
	}

	utils.ResponseSuccess(c, mods)
}

// GetPopularMods 获取热门模组
func (mc *ModController) GetPopularMods(c *gin.Context) {
	limit := c.DefaultQuery("limit", "20")

	mods := mc.modService.GetPopularMods(limit)
	utils.ResponseSuccess(c, mods)
}

// GetTShockPlugins 获取TShock插件库
func (mc *ModController) GetTShockPlugins(c *gin.Context) {
	category := c.Query("category")

	plugins := mc.modService.GetTShockPlugins(category)
	utils.ResponseSuccess(c, plugins)
}
