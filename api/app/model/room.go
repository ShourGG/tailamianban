package model

import (
	"time"
)

// ServerType 服务器类型
type ServerType string

const (
	ServerTypeVanilla    ServerType = "vanilla"
	ServerTypeTShock     ServerType = "tshock"
	ServerTypeTModLoader ServerType = "tmodloader"
)

// ServerStatus 服务器状态
type ServerStatus string

const (
	StatusStopped  ServerStatus = "stopped"
	StatusStarting ServerStatus = "starting"
	StatusRunning  ServerStatus = "running"
	StatusStopping ServerStatus = "stopping"
	StatusError    ServerStatus = "error"
)

// Room 房间（服务器实例）
type Room struct {
	ID             uint         `json:"id" gorm:"primaryKey"`
	Name           string       `json:"name" gorm:"not null"`
	Type           ServerType   `json:"type" gorm:"not null"`
	Status         ServerStatus `json:"status" gorm:"default:'stopped'"`
	Port           int          `json:"port" gorm:"not null;unique"`
	Password       string       `json:"password"`
	MaxPlayers     int          `json:"maxPlayers" gorm:"default:8"`
	CurrentPlayers int          `json:"currentPlayers" gorm:"default:0"`
	WorldName      string       `json:"worldName" gorm:"not null"`
	ProcessPID     int          `json:"processPID" gorm:"default:0"`
	CreatedAt      time.Time    `json:"createdAt"`
	UpdatedAt      time.Time    `json:"updatedAt"`

	// 关联配置
	WorldConfig       *WorldConfig       `json:"worldConfig" gorm:"foreignKey:RoomID"`
	TShockConfig      *TShockConfig      `json:"tshockConfig" gorm:"foreignKey:RoomID"`
	TModLoaderConfig  *TModLoaderConfig  `json:"tmodloaderConfig" gorm:"foreignKey:RoomID"`
}

// WorldConfig 世界配置
type WorldConfig struct {
	ID         uint   `json:"id" gorm:"primaryKey"`
	RoomID     uint   `json:"roomId" gorm:"not null;unique"`
	Seed       string `json:"seed"`
	Size       string `json:"size" gorm:"default:'2'"` // 1=小型, 2=中型, 3=大型
	Difficulty string `json:"difficulty" gorm:"default:'0'"` // 0=普通, 1=专家, 2=大师, 3=旅途
	AutoSave   bool   `json:"autoSave" gorm:"default:true"`
	PVP        bool   `json:"pvp" gorm:"default:false"`
	Hardcore   bool   `json:"hardcore" gorm:"default:false"`
	Language   string `json:"language" gorm:"default:'zh-CN'"`
	MOTD       string `json:"motd"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

// TShockConfig TShock配置
type TShockConfig struct {
	ID                 uint   `json:"id" gorm:"primaryKey"`
	RoomID             uint   `json:"roomId" gorm:"not null;unique"`
	RestAPIPort        int    `json:"restApiPort" gorm:"default:7878"`
	RestAPIToken       string `json:"restApiToken"`
	SuperAdminPassword string `json:"superAdminPassword"`
	EnableWhitelist    bool   `json:"enableWhitelist" gorm:"default:false"`
	CreatedAt          time.Time `json:"createdAt"`
	UpdatedAt          time.Time `json:"updatedAt"`
}

// TModLoaderConfig TModLoader配置
type TModLoaderConfig struct {
	ID          uint   `json:"id" gorm:"primaryKey"`
	RoomID      uint   `json:"roomId" gorm:"not null;unique"`
	EnabledMods string `json:"enabledMods"` // JSON数组
	ModPackURL  string `json:"modPackUrl"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// Player 玩家信息
type Player struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	RoomID    uint      `json:"roomId" gorm:"not null"`
	Name      string    `json:"name" gorm:"not null"`
	IP        string    `json:"ip"`
	Team      int       `json:"team" gorm:"default:0"`
	Group     string    `json:"group"` // TShock专属
	JoinTime  time.Time `json:"joinTime"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// TableName 指定表名
func (Room) TableName() string {
	return "rooms"
}

func (WorldConfig) TableName() string {
	return "world_configs"
}

func (TShockConfig) TableName() string {
	return "tshock_configs"
}

func (TModLoaderConfig) TableName() string {
	return "tmodloader_configs"
}

func (Player) TableName() string {
	return "players"
}
