# 🎮 泰拉瑞亚服务器管理平台 API

基于 Go + Gin 框架的泰拉瑞亚服务器管理后端 API

参考项目：[饥荒管理平台 DMP](https://github.com/miracleEverywhere/dst-management-platform-api)

---

## 📋 技术栈

- **Go 1.23** - 编程语言
- **Gin 1.10** - Web框架
- **GORM** - ORM框架
- **SQLite** - 数据库
- **WebSocket** - 实时通信
- **Gocron** - 定时任务
- **Gopsutil** - 系统监控

---

## 📁 项目结构

```
terraria-api/
├── main.go                 # 入口文件
├── go.mod                  # Go模块依赖
├── config/                 # 配置
│   └── config.go
├── app/                    # 应用层
│   ├── controller/         # 控制器
│   │   └── room_controller.go
│   ├── service/            # 服务层
│   │   └── room_service.go
│   ├── model/              # 数据模型
│   │   └── room.go
│   ├── router/             # 路由
│   │   └── router.go
│   └── middleware/         # 中间件
├── utils/                  # 工具函数
│   ├── db.go
│   └── response.go
└── scheduler/              # 定时任务
```

---

## 🚀 快速开始

### 1. 安装 Go

下载并安装 Go 1.23+：https://golang.org/dl/

验证安装：
```bash
go version
```

### 2. 下载依赖

```bash
cd terraria-api
go mod download
```

### 3. 运行项目

```bash
# 使用默认配置启动（端口8080）
go run main.go

# 指定端口启动
go run main.go -p 8000

# 指定数据库路径
go run main.go -d ./data

# 禁用CORS
go run main.go -cors=false
```

### 4. 编译

```bash
# Windows
go build -o terraria-api.exe

# Linux/Mac
go build -o terraria-api

# 交叉编译 Linux版本（在Windows上）
set GOOS=linux
set GOARCH=amd64
go build -o terraria-api-linux
```

### 5. 运行编译后的程序

```bash
# Windows
./terraria-api.exe -p 8080

# Linux
./terraria-api -p 8080
```

---

## 📡 API接口

### 基础URL
```
http://localhost:8080/api
```

### 房间管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/terraria/rooms` | 获取房间列表 |
| GET | `/terraria/rooms/:id` | 获取房间详情 |
| POST | `/terraria/rooms` | 创建房间 |
| PUT | `/terraria/rooms/:id` | 更新房间 |
| DELETE | `/terraria/rooms/:id` | 删除房间 |

### 服务器控制

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/terraria/rooms/:id/start` | 启动服务器 |
| POST | `/terraria/rooms/:id/stop` | 停止服务器 |
| POST | `/terraria/rooms/:id/restart` | 重启服务器 |
| GET | `/terraria/rooms/:id/status` | 获取服务器状态 |

### 健康检查

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/health` | 健康检查 |

---

## 📦 数据结构

### 房间（Room）

```json
{
  "id": 1,
  "name": "生存服",
  "type": "tshock",
  "status": "running",
  "port": 7777,
  "password": "",
  "maxPlayers": 8,
  "currentPlayers": 3,
  "worldName": "World",
  "processPID": 12345,
  "createdAt": "2024-01-01T10:00:00Z",
  "updatedAt": "2024-01-01T10:00:00Z",
  "worldConfig": {...},
  "tshockConfig": {...}
}
```

### 服务器类型

- `vanilla` - 原版服务器
- `tshock` - TShock插件服
- `tmodloader` - TModLoader Mod服

### 服务器状态

- `stopped` - 已停止
- `starting` - 启动中
- `running` - 运行中
- `stopping` - 停止中
- `error` - 错误

---

## 🔧 配置说明

### 命令行参数

```bash
-p int        # 监听端口（默认：8080）
-d string     # 数据库文件路径（默认：./config）
-cors bool    # 是否启用CORS（默认：true）
```

### 数据库

默认使用 SQLite，数据库文件位于：`./config/terraria.db`

自动创建以下表：
- `rooms` - 房间表
- `world_configs` - 世界配置表
- `tshock_configs` - TShock配置表
- `tmodloader_configs` - TModLoader配置表
- `players` - 玩家表

---

## 🎯 核心功能

### ✅ 已实现

- [x] 房间CRUD操作
- [x] 服务器启动/停止/重启
- [x] 服务器状态查询
- [x] 数据库自动迁移
- [x] CORS跨域支持
- [x] 统一响应格式
- [x] 端口冲突检测

### 🚧 待实现

- [ ] 插件管理（TShock）
- [ ] Mod管理（TModLoader）
- [ ] 玩家管理
- [ ] 世界文件管理
- [ ] 控制台命令执行
- [ ] 日志查看
- [ ] WebSocket实时通信
- [ ] JWT用户认证
- [ ] 定时任务（备份、重启）
- [ ] 系统监控（CPU、内存）

---

## 🔗 前端对接

前端项目位于：`../terraria-admin`

### 修改前端API地址

编辑 `terraria-admin/.env.development`：

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

---

## 📝 API示例

### 创建房间

```bash
curl -X POST http://localhost:8080/api/terraria/rooms \
  -H "Content-Type: application/json" \
  -d '{
    "name": "我的服务器",
    "type": "tshock",
    "port": 7777,
    "maxPlayers": 8,
    "worldName": "World1",
    "worldConfig": {
      "size": "2",
      "difficulty": "1",
      "autoSave": true,
      "pvp": false,
      "hardcore": false,
      "language": "zh-CN",
      "motd": "欢迎！"
    },
    "tshockConfig": {
      "restApiPort": 7878,
      "restApiToken": "token123",
      "superAdminPassword": "admin123",
      "enableWhitelist": false
    }
  }'
```

### 获取房间列表

```bash
curl http://localhost:8080/api/terraria/rooms
```

### 启动服务器

```bash
curl -X POST http://localhost:8080/api/terraria/rooms/1/start
```

---

## 🐛 调试

### 查看日志

程序启动后会在控制台输出日志：

```
✅ 数据库连接成功
✅ 数据库表创建成功
✅ 配置初始化成功
🚀 泰拉瑞亚管理平台 API 启动成功！
📡 监听地址: http://localhost:8080
```

### 常见问题

**Q: 端口被占用？**
```bash
# 更换端口
go run main.go -p 8081
```

**Q: 数据库文件在哪？**
```bash
# 默认位置
./config/terraria.db

# 自定义位置
go run main.go -d /path/to/data
```

---

## 📚 参考资料

- [Gin框架文档](https://gin-gonic.com/zh-cn/docs/)
- [GORM文档](https://gorm.io/zh_CN/docs/)
- [Go语言官方文档](https://golang.org/doc/)
- [TShock官方文档](https://tshock.readme.io/)
- [饥荒管理平台 DMP](https://github.com/miracleEverywhere/dst-management-platform-api)

---

## 📄 许可证

MIT License

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**祝你开发顺利！🚀**
