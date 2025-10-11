package main

import (
	"flag"
	"fmt"
	"log"
	"terraria-api/app/router"
	"terraria-api/config"
	"terraria-api/utils"

	"github.com/gin-gonic/gin"
)

var (
	port       = flag.Int("p", 8080, "监听端口")
	dbPath     = flag.String("d", "./config", "数据库文件路径")
	enableCORS = flag.Bool("cors", true, "是否启用CORS（开发模式）")
	staticPath = flag.String("static", "../terraria-admin/dist", "前端静态文件路径（生产模式）")
	devMode    = flag.Bool("dev", false, "开发模式（启用CORS，不托管静态文件）")
)

func main() {
	flag.Parse()

	// 打印启动信息
	printBanner()

	// 初始化配置
	config.Init(*dbPath)

	// 初始化数据库
	utils.InitDB(*dbPath)

	// 设置Gin模式
	gin.SetMode(gin.ReleaseMode)

	// 创建Gin引擎
	r := gin.Default()

	// 开发模式：启用CORS
	// 生产模式：托管静态文件
	if *devMode || *enableCORS {
		r.Use(corsMiddleware())
		log.Printf("🔧 开发模式: 启用CORS")
	}

	// 注册路由
	router.SetupRouter(r, *staticPath, !*devMode)

	// 启动服务器
	addr := fmt.Sprintf(":%d", *port)
	log.Printf("🚀 泰拉瑞亚管理平台启动成功！")
	log.Printf("📡 访问地址: http://localhost%s", addr)
	log.Printf("📂 数据库路径: %s", *dbPath)
	if *devMode || *enableCORS {
		log.Printf("🔧 模式: 开发模式 (CORS已启用)")
	} else {
		log.Printf("🚀 模式: 生产模式 (托管静态文件: %s)", *staticPath)
	}
	log.Printf("==========================================")

	if err := r.Run(addr); err != nil {
		log.Fatalf("❌ 启动失败: %v", err)
	}
}

// CORS中间件
func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

// 打印Banner
func printBanner() {
	banner := `
	╔════════════════════════════════════════════════╗
	║                                                ║
	║     🎮 泰拉瑞亚服务器管理平台 API 🎮           ║
	║                                                ║
	║     Terraria Server Management Platform       ║
	║                                                ║
	║     Version: 1.0.0                            ║
	║     Author: Terraria Admin Team               ║
	║                                                ║
	╚════════════════════════════════════════════════╝
	`
	fmt.Println(banner)
}
