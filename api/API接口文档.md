# 🎮 泰拉瑞亚管理平台 API 接口文档

## 📋 已实现接口清单

### ✅ 房间管理 (Room Management)

#### 1. 获取房间列表
```
GET /api/terraria/rooms
```

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "生存服",
      "type": "tshock",
      "status": "running",
      "port": 7777,
      "maxPlayers": 8,
      "currentPlayers": 3,
      "worldName": "World1",
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ]
}
```

#### 2. 获取房间详情
```
GET /api/terraria/rooms/:id
```

#### 3. 创建房间
```
POST /api/terraria/rooms
```

**请求体：**
```json
{
  "name": "我的服务器",
  "type": "tshock",
  "port": 7777,
  "maxPlayers": 8,
  "worldName": "World1",
  "worldConfig": {
    "size": "2",
    "difficulty": "1",
    "autoSave": true,
    "pvp": false
  },
  "tshockConfig": {
    "restApiPort": 7878,
    "restApiToken": "token123",
    "superAdminPassword": "admin123",
    "enableWhitelist": false
  }
}
```

#### 4. 更新房间
```
PUT /api/terraria/rooms/:id
```

#### 5. 删除房间
```
DELETE /api/terraria/rooms/:id
```

#### 6. 启动服务器
```
POST /api/terraria/rooms/:id/start
```

#### 7. 停止服务器
```
POST /api/terraria/rooms/:id/stop
```

#### 8. 重启服务器
```
POST /api/terraria/rooms/:id/restart
```

#### 9. 获取服务器状态
```
GET /api/terraria/rooms/:id/status
```

---

### ✅ TShock配置管理

#### 1. 获取TShock配置
```
GET /api/terraria/rooms/:roomId/tshock/config
```

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "ServerName": "TShock Server",
    "ServerPort": 7777,
    "MaxSlots": 8,
    "RestApiEnabled": true,
    "RestApiPort": 7878,
    "EnableWhitelist": false,
    "AnnounceSave": true,
    "BackupInterval": 10
  }
}
```

#### 2. 更新TShock配置
```
PUT /api/terraria/rooms/:roomId/tshock/config
```

**请求体：**
```json
{
  "ServerName": "我的服务器",
  "MaxSlots": 16,
  "RestApiEnabled": true,
  "RestApiPort": 7878,
  "EnableWhitelist": true
}
```

#### 3. 获取SSC配置
```
GET /api/terraria/rooms/:roomId/tshock/ssc-config
```

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "Enabled": true,
    "ServerSideCharacter": true,
    "StartingHealth": 100,
    "StartingMana": 20,
    "StartingInventory": [
      {"netId": 3509, "stack": 1, "prefix": 0},
      {"netId": 3506, "stack": 1, "prefix": 0}
    ]
  }
}
```

#### 4. 更新SSC配置
```
PUT /api/terraria/rooms/:roomId/tshock/ssc-config
```

**请求体：**
```json
{
  "Enabled": true,
  "StartingHealth": 200,
  "StartingMana": 40,
  "StartingInventory": [
    {"netId": 3509, "stack": 1, "prefix": 0},
    {"netId": 3506, "stack": 1, "prefix": 0},
    {"netId": 3507, "stack": 1, "prefix": 0}
  ]
}
```

---

### ✅ 文件管理

#### 1. 浏览目录
```
GET /api/terraria/rooms/:roomId/files/browse?path=/worlds
```

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "name": "World1.wld",
      "path": "/worlds/World1.wld",
      "size": 1048576,
      "isDir": false,
      "modified": "2024-01-01T10:00:00Z"
    },
    {
      "name": "tshock",
      "path": "/tshock",
      "size": 0,
      "isDir": true,
      "modified": "2024-01-01T10:00:00Z"
    }
  ]
}
```

#### 2. 读取文件
```
GET /api/terraria/rooms/:roomId/files/read?path=/tshock/config.json
```

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "content": "{...文件内容...}"
  }
}
```

#### 3. 保存文件
```
POST /api/terraria/rooms/:roomId/files/save
```

**请求体：**
```json
{
  "path": "/tshock/config.json",
  "content": "{...文件内容...}"
}
```

#### 4. 删除文件
```
DELETE /api/terraria/rooms/:roomId/files?path=/backup/old.wld
```

#### 5. 上传文件
```
POST /api/terraria/rooms/:roomId/files/upload
Content-Type: multipart/form-data
```

**表单数据：**
- `path`: 目标路径（如 `/worlds`）
- `file`: 文件对象

---

### ✅ Mod市场

#### 1. 搜索Workshop模组
```
GET /api/terraria/mods/workshop/search?q=calamity&page=1
```

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "2563784257",
      "name": "Calamity Mod",
      "author": "Fabsol",
      "description": "灾厄模组，添加大量新内容",
      "downloads": 5000000,
      "rating": 4.9,
      "thumbnail": "https://example.com/calamity.jpg"
    }
  ]
}
```

#### 2. 获取热门模组
```
GET /api/terraria/mods/popular?limit=20
```

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "calamity",
      "name": "Calamity Mod",
      "author": "Fabsol",
      "description": "灾厄模组，添加大量新内容",
      "version": "2.0.3.8",
      "downloads": 5000000,
      "icon": "https://example.com/calamity.png",
      "category": "content"
    },
    {
      "id": "thorium",
      "name": "Thorium Mod",
      "author": "DivermanSam",
      "description": "钍模组，添加新职业和BOSS",
      "version": "1.7.3.2",
      "downloads": 3000000,
      "icon": "https://example.com/thorium.png",
      "category": "content"
    }
  ]
}
```

#### 3. 获取TShock插件库
```
GET /api/terraria/plugins?category=essential
```

**可选分类：**
- `essential` - 必备插件
- `gameplay` - 游戏玩法
- `protection` - 保护类
- `utility` - 实用工具

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "ssc",
      "name": "ServerSideCharacter (SSC)",
      "description": "服务器端人物存档，防止物品作弊",
      "version": "1.2.0",
      "author": "TShock Team",
      "category": "essential",
      "downloads": 100000
    },
    {
      "id": "economics",
      "name": "Economics",
      "description": "经济系统插件，支持货币、商店等功能",
      "version": "1.5.2",
      "author": "MistZZT",
      "category": "gameplay",
      "downloads": 50000
    }
  ]
}
```

---

## 📊 响应格式

### 成功响应
```json
{
  "code": 200,
  "message": "success",
  "data": {...}
}
```

### 错误响应
```json
{
  "code": 400,
  "message": "错误信息",
  "data": null
}
```

---

## 🔧 测试方法

### 1. 使用curl测试

```bash
# 获取房间列表
curl http://localhost:8080/api/terraria/rooms

# 创建房间
curl -X POST http://localhost:8080/api/terraria/rooms \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试服务器",
    "type": "tshock",
    "port": 7777,
    "maxPlayers": 8,
    "worldName": "TestWorld"
  }'

# 获取TShock配置
curl http://localhost:8080/api/terraria/rooms/1/tshock/config

# 获取热门模组
curl http://localhost:8080/api/terraria/mods/popular

# 浏览文件
curl "http://localhost:8080/api/terraria/rooms/1/files/browse?path=/"
```

### 2. 使用Postman测试

1. 导入以下环境变量：
   - `baseUrl`: `http://localhost:8080/api`
   
2. 创建请求集合：
   - 房间管理
   - TShock配置
   - 文件管理
   - Mod市场

---

## 🚧 待实现接口

以下接口尚未实现，在TODO列表中：

### 插件管理（具体房间）
- 安装插件到指定房间
- 启用/禁用房间插件
- 删除房间插件

### Mod管理（具体房间）
- 安装Mod到指定房间
- 启用/禁用房间Mod
- 从Workshop安装Mod

### 玩家管理
- 获取玩家列表
- 踢出玩家
- 封禁玩家
- 设置玩家权限组

### 世界管理
- 上传世界文件
- 下载世界文件
- 删除世界文件

### 控制台
- 执行控制台命令
- 获取日志

### 备份管理
- 创建备份
- 恢复备份
- 删除备份

---

## 💡 前端对接说明

### 1. 配置API地址

编辑前端项目 `.env.development`：

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### 2. 启动后端服务

```bash
cd terraria-api
go run main.go -p 8080
```

### 3. 启动前端服务

```bash
cd terraria-admin
npm run dev
```

### 4. 访问前端

打开浏览器访问：`http://localhost:1989`

---

## 📝 注意事项

1. **端口占用**：确保8080端口未被占用
2. **CORS配置**：已启用CORS，前端可直接调用
3. **文件路径**：所有文件操作都限制在房间目录内，防止路径穿越
4. **配置文件**：TShock和SSC配置文件存储在 `./servers/room_{id}/tshock/` 目录
5. **数据库**：SQLite数据库文件位于 `./config/terraria.db`

---

## 🐛 调试技巧

### 查看日志
后端启动后会在控制台输出详细日志

### 数据库查看
```bash
# 安装SQLite工具
# Windows: https://www.sqlite.org/download.html
# Linux: apt-get install sqlite3

# 查看数据库
sqlite3 ./config/terraria.db

# 查看表结构
.schema rooms

# 查询数据
SELECT * FROM rooms;
```

### 测试文件操作
```bash
# 创建测试房间目录
mkdir -p ./servers/room_1/tshock

# 创建测试配置文件
echo '{"test": "value"}' > ./servers/room_1/tshock/config.json
```

---

**更新时间**: 2025-10-11  
**API版本**: v1.0  
**状态**: 开发中 🚧
