# 🎮 泰拉瑞亚服务器管理面板 - 重新设计方案

## 🎯 项目目标

创建一个像饥荒面板一样**简单易用**的泰拉瑞亚服务器管理面板，避免复杂配置，实现**一键部署、开箱即用**。

## 📊 技术架构对比分析

### 饥荒面板成功要素
- ✅ **单一二进制** - 一个文件包含所有功能
- ✅ **内置前端** - 无需单独部署前端
- ✅ **自动化脚本** - run.sh一键搞定
- ✅ **内置数据库** - SQLite，无外部依赖
- ✅ **自动安装** - 自动下载游戏服务器

### Robot_Admin优势
- ✅ **现代化UI** - Vue3 + Naive UI，美观易用
- ✅ **极速开发** - Bun + Vite7，毫秒级热更新
- ✅ **丰富组件** - 30+ 业务组件开箱即用
- ✅ **完整权限** - RBAC权限体系
- ✅ **响应式设计** - 完美适配各种设备

## 🏗️ 新架构设计

### 核心理念：**简单 + 现代化**

```
泰拉瑞亚面板 = 饥荒面板的简单性 + Robot_Admin的现代化
```

### 技术栈选择

**后端 (Go)**
- 🚀 **Gin框架** - 轻量级、高性能
- 💾 **SQLite** - 内置数据库，无外部依赖
- 📦 **embed** - 前端资源内嵌到二进制
- 🔧 **自动化** - 泰拉瑞亚服务器管理

**前端 (基于Robot_Admin)**
- ⚡ **Vue3 + TypeScript** - 现代化开发体验
- 🎨 **Naive UI** - 美观的组件库
- 🚀 **Vite7** - 极速构建工具
- 🎯 **专用组件** - 泰拉瑞亚专用管理组件

### 项目结构

```
terraria-panel/
├── 📁 backend/                 # Go后端
│   ├── 📁 api/                 # API接口
│   ├── 📁 models/              # 数据模型
│   ├── 📁 services/            # 业务逻辑
│   ├── 📁 utils/               # 工具函数
│   ├── 📁 embedded/            # 内嵌资源
│   └── 📄 main.go              # 主程序
├── 📁 frontend/                # Vue3前端
│   ├── 📁 src/                 # 源代码
│   │   ├── 📁 views/           # 页面视图
│   │   │   ├── 📁 dashboard/   # 仪表盘
│   │   │   ├── 📁 servers/     # 服务器管理
│   │   │   ├── 📁 players/     # 玩家管理
│   │   │   ├── 📁 worlds/      # 世界管理
│   │   │   ├── 📁 mods/        # 模组管理
│   │   │   └── 📁 settings/    # 系统设置
│   │   ├── 📁 components/      # 组件库
│   │   └── 📁 api/             # API调用
│   └── 📄 package.json         # 依赖配置
├── 📁 scripts/                 # 部署脚本
│   ├── 📄 build.sh             # 构建脚本
│   ├── 📄 run.sh               # 启动脚本
│   └── 📄 install.sh           # 安装脚本
└── 📄 README.md                # 项目说明
```

## 🎮 核心功能设计

### 1. 服务器管理
- 🚀 **一键启动/停止** - 简单的服务器控制
- ⚙️ **配置管理** - 可视化配置编辑
- 📊 **状态监控** - 实时服务器状态
- 📝 **日志查看** - 实时日志显示

### 2. 世界管理
- 🌍 **世界列表** - 所有世界文件管理
- 📥 **世界上传** - 支持世界文件上传
- 💾 **备份还原** - 自动备份和一键还原
- 🗑️ **世界删除** - 安全删除确认

### 3. 玩家管理
- 👥 **在线玩家** - 实时在线玩家列表
- 🔨 **管理员操作** - 踢出、封禁等操作
- 📊 **玩家统计** - 游戏时间、等级统计
- 💬 **聊天记录** - 游戏内聊天记录

### 4. 模组管理
- 📦 **模组列表** - 已安装模组管理
- ⬇️ **模组安装** - 在线模组安装
- 🔄 **模组更新** - 自动检查更新
- ⚙️ **模组配置** - 模组参数配置

### 5. 系统监控
- 💻 **系统状态** - CPU、内存、磁盘使用率
- 📈 **性能图表** - 实时性能监控图表
- 🔔 **告警通知** - 异常情况告警
- 📋 **操作日志** - 管理员操作记录

## 🚀 部署方案

### 一键部署脚本

```bash
# 下载并启动泰拉瑞亚面板
curl -fsSL https://raw.githubusercontent.com/你的用户名/terraria-panel/main/install.sh | bash
```

### 脚本功能
1. **自动检测系统** - Linux/Windows自动适配
2. **下载二进制** - 自动下载最新版本
3. **安装泰拉瑞亚服务器** - 自动下载游戏服务器
4. **配置环境** - 自动配置运行环境
5. **启动服务** - 后台启动面板服务

## 🎯 开发计划

### 第一阶段：基础架构 (1-2天)
- [x] 清空旧项目
- [ ] 搭建Go后端基础框架
- [ ] 集成Robot_Admin前端模板
- [ ] 实现前后端通信

### 第二阶段：核心功能 (3-5天)
- [ ] 服务器管理功能
- [ ] 世界管理功能
- [ ] 基础监控功能
- [ ] 用户认证系统

### 第三阶段：高级功能 (5-7天)
- [ ] 玩家管理功能
- [ ] 模组管理功能
- [ ] 系统监控功能
- [ ] 告警通知功能

### 第四阶段：部署优化 (1-2天)
- [ ] 构建自动化脚本
- [ ] 一键部署脚本
- [ ] 文档完善
- [ ] 测试验证

## 💡 关键设计原则

### 1. 简单至上
- **一个文件部署** - 单一二进制包含所有功能
- **零配置启动** - 默认配置即可运行
- **自动化安装** - 脚本自动处理所有依赖

### 2. 现代化体验
- **美观界面** - 基于Naive UI的现代化设计
- **响应式布局** - 完美适配各种设备
- **实时更新** - WebSocket实时数据推送

### 3. 功能完整
- **全面管理** - 服务器、世界、玩家、模组全覆盖
- **监控告警** - 完整的监控和告警系统
- **权限控制** - 多用户权限管理

### 4. 性能优化
- **内存优化** - 合理的内存使用
- **并发处理** - Go协程处理并发请求
- **缓存机制** - 合理的数据缓存策略

## 🎉 预期效果

### 用户体验
- **30秒部署** - 从下载到启动只需30秒
- **零学习成本** - 直观的界面，无需学习
- **稳定可靠** - 7x24小时稳定运行

### 开发体验
- **快速开发** - 基于成熟框架，开发效率高
- **易于维护** - 清晰的代码结构，易于维护
- **扩展性强** - 模块化设计，易于扩展功能

## 🔥 立即开始

老王我已经清空了旧项目，现在开始按照这个方案重新开发！

**下一步行动：**
1. 搭建Go后端基础框架
2. 集成Robot_Admin前端模板
3. 实现基础的前后端通信
4. 开发核心的服务器管理功能

艹！这次绝对要做一个**简单而强大**的泰拉瑞亚面板！

---

## 🔧 DST项目部署方案深度分析

### DST项目的核心成功要素

#### 1. 一键部署脚本 (run.sh)
```bash
#!/bin/bash
# 核心功能菜单设计
echo "泰拉瑞亚服务器管理面板 (Terraria Panel)"
echo "--- https://github.com/你的用户名/terraria-panel ---"
echo "————————————————————————————————————————————————————————————"
echo "[0]: 下载并启动服务 (Download and start service)"
echo "————————————————————————————————————————————————————————————"
echo "[1]: 启动服务 (Start service)"
echo "[2]: 关闭服务 (Stop service)"
echo "[3]: 重启服务 (Restart service)"
echo "————————————————————————————————————————————————————————————"
echo "[4]: 更新面板 (Update panel)"
echo "[5]: 强制更新 (Force update)"
echo "[6]: 更新脚本 (Update script)"
echo "————————————————————————————————————————————————————————————"
echo "[7]: 备份数据 (Backup data)"
echo "[8]: 恢复数据 (Restore data)"
echo "[9]: 卸载面板 (Uninstall panel)"
echo "————————————————————————————————————————————————————————————"
echo "请输入选择 (Please enter your selection) [0-9]:"
```

#### 2. GitHub Actions自动构建
```yaml
name: Build and Release
on:
  push:
    tags: ['v*']
jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        os: [linux, windows, darwin]
        arch: [amd64, arm64]
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-go@v4
      with:
        go-version: '1.23'
    - uses: oven-sh/setup-bun@v1
      with:
        bun-version: latest

    - name: Build Frontend
      run: |
        cd frontend
        bun install
        bun run build

    - name: Embed Frontend
      run: |
        go generate ./...

    - name: Build Backend
      run: |
        GOOS=${{ matrix.os }} GOARCH=${{ matrix.arch }} \
        go build -ldflags="-s -w" -o terraria-panel-${{ matrix.os }}-${{ matrix.arch }} main.go

    - name: Create Release
      uses: softprops/action-gh-release@v1
      with:
        files: terraria-panel-*
```

#### 3. Docker多阶段构建
```dockerfile
# 第1阶段: 前端构建 (使用Bun提升速度)
FROM oven/bun:1 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/bun.lockb ./
RUN bun install --frozen-lockfile
COPY frontend/ ./
RUN bun run build

# 第2阶段: 后端构建
FROM golang:1.23-alpine AS backend-build
WORKDIR /app
COPY backend/ ./
COPY --from=frontend-build /app/frontend/dist ./static
RUN go generate ./...
RUN CGO_ENABLED=0 go build -ldflags="-s -w" -o terraria-panel main.go

# 第3阶段: 运行时环境
FROM alpine:latest
WORKDIR /root
RUN apk --no-cache add ca-certificates tzdata curl unzip
COPY --from=backend-build /app/terraria-panel ./
COPY docker/entry-point.sh ./
RUN chmod +x terraria-panel entry-point.sh

# 环境变量
ENV PANEL_PORT=8080
ENV GIN_MODE=release
ENV TZ=Asia/Shanghai

# 端口暴露
EXPOSE 8080
EXPOSE 7777

ENTRYPOINT ["./entry-point.sh"]
```

## 🎨 Robot_Admin集成方案

### 核心组件适配

#### 1. 仪表盘组件
```typescript
// src/views/dashboard/index.vue
<template>
  <div class="dashboard-container">
    <!-- 服务器状态卡片 -->
    <n-grid :cols="4" :x-gap="16" :y-gap="16">
      <n-grid-item>
        <ServerStatusCard />
      </n-grid-item>
      <n-grid-item>
        <PlayerCountCard />
      </n-grid-item>
      <n-grid-item>
        <SystemResourceCard />
      </n-grid-item>
      <n-grid-item>
        <WorldInfoCard />
      </n-grid-item>
    </n-grid>

    <!-- 实时监控图表 -->
    <n-card title="系统监控" class="mt-4">
      <SystemMonitorChart />
    </n-card>

    <!-- 在线玩家列表 -->
    <n-card title="在线玩家" class="mt-4">
      <OnlinePlayersTable />
    </n-card>
  </div>
</template>
```

#### 2. 服务器管理组件
```typescript
// src/views/server/index.vue
<template>
  <div class="server-management">
    <!-- 服务器控制面板 -->
    <n-card title="服务器控制">
      <n-space>
        <n-button
          type="success"
          size="large"
          :loading="starting"
          @click="startServer"
        >
          <template #icon>
            <n-icon><PlayIcon /></n-icon>
          </template>
          启动服务器
        </n-button>

        <n-button
          type="error"
          size="large"
          :loading="stopping"
          @click="stopServer"
        >
          <template #icon>
            <n-icon><StopIcon /></n-icon>
          </template>
          停止服务器
        </n-button>

        <n-button
          type="warning"
          size="large"
          :loading="restarting"
          @click="restartServer"
        >
          <template #icon>
            <n-icon><RefreshIcon /></n-icon>
          </template>
          重启服务器
        </n-button>
      </n-space>
    </n-card>

    <!-- 服务器配置 -->
    <n-card title="服务器配置" class="mt-4">
      <ServerConfigForm />
    </n-card>

    <!-- 实时日志 -->
    <n-card title="服务器日志" class="mt-4">
      <ServerLogViewer />
    </n-card>
  </div>
</template>
```

### 状态管理 (Pinia)
```typescript
// src/stores/server.ts
import { defineStore } from 'pinia'

export const useServerStore = defineStore('server', {
  state: () => ({
    status: 'stopped', // stopped, starting, running, stopping
    players: [],
    config: {},
    logs: [],
    systemInfo: {}
  }),

  actions: {
    async startServer() {
      this.status = 'starting'
      try {
        await api.server.start()
        this.status = 'running'
      } catch (error) {
        this.status = 'stopped'
        throw error
      }
    },

    async stopServer() {
      this.status = 'stopping'
      try {
        await api.server.stop()
        this.status = 'stopped'
      } catch (error) {
        this.status = 'running'
        throw error
      }
    },

    async fetchServerStatus() {
      const data = await api.server.getStatus()
      this.status = data.status
      this.players = data.players
      this.systemInfo = data.systemInfo
    }
  }
})
```

## 🚀 部署自动化完整方案

### 1. 构建脚本 (build.sh)
```bash
#!/bin/bash
set -e

echo "🚀 开始构建泰拉瑞亚面板..."

# 检查依赖
command -v go >/dev/null 2>&1 || { echo "❌ Go未安装"; exit 1; }
command -v bun >/dev/null 2>&1 || { echo "❌ Bun未安装"; exit 1; }

# 构建前端
echo "📦 构建前端..."
cd frontend
bun install
bun run build
cd ..

# 生成嵌入文件
echo "📁 生成嵌入文件..."
go generate ./...

# 构建后端
echo "🔨 构建后端..."
CGO_ENABLED=0 go build -ldflags="-s -w -X main.version=$(git describe --tags --always)" -o terraria-panel main.go

echo "✅ 构建完成！"
echo "📄 可执行文件: ./terraria-panel"
```

### 2. 安装脚本 (install.sh)
```bash
#!/bin/bash
# 泰拉瑞亚面板一键安装脚本

set -e

# 配置变量
REPO="你的用户名/terraria-panel"
INSTALL_DIR="/opt/terraria-panel"
SERVICE_NAME="terraria-panel"
DEFAULT_PORT=8080

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 检查系统
check_system() {
    info "检查系统环境..."

    # 检查操作系统
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="darwin"
    else
        error "不支持的操作系统: $OSTYPE"
        exit 1
    fi

    # 检查架构
    ARCH=$(uname -m)
    case $ARCH in
        x86_64) ARCH="amd64" ;;
        aarch64|arm64) ARCH="arm64" ;;
        *) error "不支持的架构: $ARCH"; exit 1 ;;
    esac

    info "系统: $OS, 架构: $ARCH"
}

# 下载最新版本
download_latest() {
    info "获取最新版本..."

    LATEST_VERSION=$(curl -s "https://api.github.com/repos/$REPO/releases/latest" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
    if [ -z "$LATEST_VERSION" ]; then
        error "无法获取最新版本"
        exit 1
    fi

    info "最新版本: $LATEST_VERSION"

    DOWNLOAD_URL="https://github.com/$REPO/releases/download/$LATEST_VERSION/terraria-panel-$OS-$ARCH"

    info "下载中..."
    curl -L -o terraria-panel "$DOWNLOAD_URL"
    chmod +x terraria-panel

    info "下载完成"
}

# 安装服务
install_service() {
    info "安装系统服务..."

    # 创建安装目录
    sudo mkdir -p "$INSTALL_DIR"
    sudo cp terraria-panel "$INSTALL_DIR/"

    # 创建systemd服务文件
    sudo tee /etc/systemd/system/$SERVICE_NAME.service > /dev/null <<EOF
[Unit]
Description=Terraria Panel
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$INSTALL_DIR
ExecStart=$INSTALL_DIR/terraria-panel -port $DEFAULT_PORT
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

    # 启用并启动服务
    sudo systemctl daemon-reload
    sudo systemctl enable $SERVICE_NAME
    sudo systemctl start $SERVICE_NAME

    info "服务安装完成"
}

# 主函数
main() {
    info "🎮 泰拉瑞亚面板一键安装脚本"
    info "================================"

    check_system
    download_latest
    install_service

    info "🎉 安装完成！"
    info "访问地址: http://localhost:$DEFAULT_PORT"
    info "默认账号: admin"
    info "默认密码: admin123"
    info ""
    info "管理命令:"
    info "  启动: sudo systemctl start $SERVICE_NAME"
    info "  停止: sudo systemctl stop $SERVICE_NAME"
    info "  重启: sudo systemctl restart $SERVICE_NAME"
    info "  状态: sudo systemctl status $SERVICE_NAME"
}

main "$@"
```

### 3. 更新脚本 (update.sh)
```bash
#!/bin/bash
# 泰拉瑞亚面板更新脚本

set -e

SERVICE_NAME="terraria-panel"
INSTALL_DIR="/opt/terraria-panel"

info() { echo -e "\033[0;32m[INFO]\033[0m $1"; }
warn() { echo -e "\033[1;33m[WARN]\033[0m $1"; }

info "🔄 更新泰拉瑞亚面板..."

# 停止服务
info "停止服务..."
sudo systemctl stop $SERVICE_NAME

# 备份当前版本
info "备份当前版本..."
sudo cp "$INSTALL_DIR/terraria-panel" "$INSTALL_DIR/terraria-panel.backup"

# 下载新版本
info "下载最新版本..."
bash <(curl -fsSL https://raw.githubusercontent.com/你的用户名/terraria-panel/main/install.sh) --update-only

# 启动服务
info "启动服务..."
sudo systemctl start $SERVICE_NAME

info "✅ 更新完成！"
```

## 📊 性能优化策略

### 1. 前端优化
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'pinia'],
          'ui': ['naive-ui'],
          'charts': ['echarts']
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
```

### 2. 后端优化
```go
// main.go
package main

import (
    "embed"
    "net/http"
    "github.com/gin-gonic/gin"
    "github.com/gin-contrib/gzip"
    "github.com/gin-contrib/cors"
)

//go:embed frontend/dist/*
var staticFiles embed.FS

func main() {
    // 生产模式
    gin.SetMode(gin.ReleaseMode)

    r := gin.New()

    // 中间件
    r.Use(gin.Logger())
    r.Use(gin.Recovery())
    r.Use(gzip.Gzip(gzip.DefaultCompression))
    r.Use(cors.Default())

    // 静态文件服务
    r.StaticFS("/static", http.FS(staticFiles))

    // API路由
    api := r.Group("/api/v1")
    {
        api.GET("/status", getServerStatus)
        api.POST("/server/start", startServer)
        api.POST("/server/stop", stopServer)
        // ... 更多API
    }

    // SPA路由
    r.NoRoute(func(c *gin.Context) {
        c.FileFromFS("/", http.FS(staticFiles))
    })

    r.Run(":8080")
}
```

## 🎯 下一步具体行动计划

### 立即开始 (今天)
1. **创建项目结构**
   ```bash
   mkdir terraria-panel
   cd terraria-panel
   mkdir -p {backend,frontend,scripts,docker,docs}
   ```

2. **初始化Go模块**
   ```bash
   cd backend
   go mod init terraria-panel
   go get github.com/gin-gonic/gin
   go get gorm.io/gorm
   go get gorm.io/driver/sqlite
   ```

3. **克隆Robot_Admin模板**
   ```bash
   cd frontend
   git clone https://github.com/ChenyCHENYU/Robot_Admin.git .
   bun install
   ```

### 明天完成
1. **搭建基础API框架**
2. **实现前后端通信**
3. **完成登录认证功能**
4. **实现服务器状态监控**

### 本周完成
1. **服务器管理功能**
2. **世界管理功能**
3. **玩家管理功能**
4. **基础监控功能**

艹！这个方案绝对能让你的泰拉瑞亚面板像DST项目一样简单部署，同时拥有Robot_Admin的现代化界面！
