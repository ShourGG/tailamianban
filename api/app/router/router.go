package router

import (
	"os"
	"path/filepath"
	"terraria-api/app/controller"

	"github.com/gin-gonic/gin"
)

// SetupRouter 设置路由
func SetupRouter(r *gin.Engine, staticPath string, enableStatic bool) {
	// 创建控制器
	authController := controller.NewAuthController()
	roomController := controller.NewRoomController()
	tshockController := controller.NewTShockController()
	fileController := controller.NewFileController()
	modController := controller.NewModController()
	installController := controller.NewInstallController()

	// API分组
	api := r.Group("/api")
	{
		// 认证接口
		auth := api.Group("/auth")
		{
			auth.POST("/login", authController.Login)
		}
		// 房间管理
		rooms := api.Group("/terraria/rooms")
		{
			rooms.GET("", roomController.GetRoomList)                   // 获取房间列表
			rooms.GET("/:id", roomController.GetRoomDetail)             // 获取房间详情
			rooms.POST("", roomController.CreateRoom)                   // 创建房间
			rooms.PUT("/:id", roomController.UpdateRoom)                // 更新房间
			rooms.DELETE("/:id", roomController.DeleteRoom)             // 删除房间

			rooms.POST("/:id/start", roomController.StartServer)        // 启动服务器
			rooms.POST("/:id/stop", roomController.StopServer)          // 停止服务器
			rooms.POST("/:id/restart", roomController.RestartServer)    // 重启服务器
			rooms.GET("/:id/status", roomController.GetServerStatus)    // 获取服务器状态

			// TShock配置管理
			rooms.GET("/:id/tshock/config", tshockController.GetTShockConfig)       // 获取TShock配置
			rooms.PUT("/:id/tshock/config", tshockController.UpdateTShockConfig)    // 更新TShock配置
			rooms.GET("/:id/tshock/ssc-config", tshockController.GetSSCConfig)      // 获取SSC配置
			rooms.PUT("/:id/tshock/ssc-config", tshockController.UpdateSSCConfig)   // 更新SSC配置

			// 文件管理
			rooms.GET("/:id/files/browse", fileController.BrowseDirectory)  // 浏览目录
			rooms.GET("/:id/files/read", fileController.ReadFile)          // 读取文件
			rooms.POST("/:id/files/save", fileController.SaveFile)          // 保存文件
			rooms.DELETE("/:id/files", fileController.DeleteFile)           // 删除文件
			rooms.POST("/:id/files/upload", fileController.UploadFile)      // 上传文件
		}

		// Mod市场
		mods := api.Group("/terraria/mods")
		{
			mods.GET("/workshop/search", modController.SearchWorkshopMods)  // 搜索Workshop模组
			mods.GET("/popular", modController.GetPopularMods)              // 获取热门模组
		}

		// TShock插件库
		api.GET("/terraria/plugins", modController.GetTShockPlugins)  // 获取插件库

		// 游戏安装管理
		install := api.Group("/terraria/install")
		{
			install.GET("/versions", installController.GetVersions)       // 获取可用版本列表
			install.POST("/game", installController.InstallGame)          // 安装游戏
			install.GET("/status", installController.GetInstallStatus)    // 获取安装状态
			install.DELETE("/game", installController.UninstallGame)      // 卸载游戏
		}

		// TODO: 插件管理 (TShock) - 需要实现具体房间的插件安装
		// plugins := api.Group("/terraria/rooms/:roomId/plugins")
		// {
		//     plugins.GET("", pluginController.GetPlugins)
		//     plugins.POST("", pluginController.InstallPlugin)
		//     plugins.PUT("/:id", pluginController.TogglePlugin)
		//     plugins.DELETE("/:id", pluginController.DeletePlugin)
		// }

		// TODO: Mod管理 (TModLoader) - 需要实现具体房间的Mod安装
		// roomMods := api.Group("/terraria/rooms/:roomId/mods")
		// {
		//     roomMods.GET("", modController.GetMods)
		//     roomMods.POST("", modController.InstallMod)
		//     roomMods.PUT("/:id", modController.ToggleMod)
		//     roomMods.DELETE("/:id", modController.DeleteMod)
		// }

		// TODO: 玩家管理
		// players := api.Group("/terraria/rooms/:roomId/players")
		// {
		//     players.GET("", playerController.GetPlayers)
		//     players.POST("/:id/kick", playerController.KickPlayer)
		//     players.POST("/:id/ban", playerController.BanPlayer)
		// }

		// TODO: 世界管理
		// worlds := api.Group("/terraria/rooms/:roomId/worlds")
		// {
		//     worlds.GET("", worldController.GetWorlds)
		//     worlds.POST("", worldController.UploadWorld)
		//     worlds.GET("/:name/download", worldController.DownloadWorld)
		//     worlds.DELETE("/:name", worldController.DeleteWorld)
		// }

		// TODO: 控制台
		// console := api.Group("/terraria/rooms/:roomId/console")
		// {
		//     console.POST("/execute", consoleController.ExecuteCommand)
		// }

		// TODO: 日志
		// api.GET("/terraria/rooms/:roomId/logs", logController.GetLogs)
	}

	// 健康检查
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "Terraria Management API is running",
		})
	})

	// 生产模式：托管前端静态文件
	if enableStatic {
		// 检查静态文件目录是否存在
		if _, err := os.Stat(staticPath); os.IsNotExist(err) {
			r.GET("/*path", func(c *gin.Context) {
				c.JSON(404, gin.H{
					"code":    "404",
					"message": "前端静态文件未找到，请先构建前端: cd terraria-admin && npm run build",
					"data":    nil,
				})
			})
			return
		}

		// 托管静态文件
		r.Static("/assets", filepath.Join(staticPath, "assets"))
		r.StaticFile("/favicon.ico", filepath.Join(staticPath, "favicon.ico"))

		// SPA路由回退：所有非API请求都返回index.html
		r.NoRoute(func(c *gin.Context) {
			// API请求返回404
			if len(c.Request.URL.Path) >= 4 && c.Request.URL.Path[:4] == "/api" {
				c.JSON(404, gin.H{
					"code":    "404",
					"message": "接口不存在",
					"data":    nil,
				})
				return
			}

			// 其他请求返回index.html（SPA路由）
			c.File(filepath.Join(staticPath, "index.html"))
		})
	}
}
