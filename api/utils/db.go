package utils

import (
	"log"
	"path/filepath"
	"terraria-api/app/model"

	sqlite "github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

// InitDB 初始化数据库
func InitDB(dbPath string) {
	dbFile := filepath.Join(dbPath, "terraria.db")

	var err error
	DB, err = gorm.Open(sqlite.Open(dbFile), &gorm.Config{})
	if err != nil {
		log.Fatalf("❌ 数据库连接失败: %v", err)
	}

	log.Println("✅ 数据库连接成功")

	// 自动迁移
	err = DB.AutoMigrate(
		&model.Room{},
		&model.WorldConfig{},
		&model.TShockConfig{},
		&model.TModLoaderConfig{},
		&model.Player{},
	)
	if err != nil{
		log.Fatalf("❌ 数据库迁移失败: %v", err)
	}

	log.Println("✅ 数据库表创建成功")
}

// GetDB 获取数据库实例
func GetDB() *gorm.DB {
	return DB
}
