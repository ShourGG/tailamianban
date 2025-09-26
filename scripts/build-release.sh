#!/bin/bash

# ===================================================================
# 🎮 Terraria Panel Release Builder - 生产发布专用
# 老王精心打造的生产发布脚本，只打包必要文件，保护源码！
# ===================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

VERSION="1.0.0"
RELEASE_NAME="terraria-panel-v${VERSION}"
RELEASE_DIR="release"

print_banner() {
    echo ""
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║${CYAN}                🎮 TERRARIA PANEL RELEASE BUILDER            ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${YELLOW}                   生产发布打包系统 v${VERSION}                    ${PURPLE}║${NC}"
    echo -e "${PURPLE}║                                                              ║${NC}"
    echo -e "${PURPLE}║${GREEN}  🔒 源码保护 | 📦 精简打包 | 🚀 一键部署                     ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${GREEN}  ⚡ 高性能编译 | 🛡️ 安全发布 | 💯 生产就绪                   ${PURPLE}║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

log_info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_step() {
    echo ""
    echo -e "${BLUE}[STEP]${NC} ${BOLD}$1${NC}"
    echo -e "${BLUE}────────────────────────────────────────────────${NC}"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check dependencies
check_dependencies() {
    log_step "检查构建依赖"

    local missing_deps=()

    if ! command -v node >/dev/null 2>&1; then
        missing_deps+=("Node.js")
    fi

    if ! command -v npm >/dev/null 2>&1; then
        missing_deps+=("npm")
    fi

    if ! command -v go >/dev/null 2>&1; then
        missing_deps+=("Go")
    fi

    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "缺少依赖: ${missing_deps[*]}"
        exit 1
    fi

    log_success "所有依赖检查通过"
    log_info "Node: $(node --version)"
    log_info "npm: $(npm --version)"
    log_info "Go: $(go version | awk '{print $3}')"
}

# Clean and prepare release directory
prepare_release_dir() {
    log_step "准备发布目录"

    # Remove old release
    if [ -d "$RELEASE_DIR" ]; then
        rm -rf "$RELEASE_DIR"
        log_info "清理旧的发布目录"
    fi

    # Create release structure
    mkdir -p "$RELEASE_DIR/$RELEASE_NAME"
    mkdir -p "$RELEASE_DIR/$RELEASE_NAME/backend"
    mkdir -p "$RELEASE_DIR/$RELEASE_NAME/scripts"

    log_success "发布目录创建完成"
}

# Build frontend (production)
build_frontend() {
    log_step "构建前端 (生产模式)"

    log_info "执行前端生产构建..."

    # Set production environment
    export NODE_ENV=production

    if npm run build; then
        log_success "前端构建完成！"

        # Check build size
        if [ -d "dist" ]; then
            local build_size=$(du -sh dist | cut -f1)
            log_info "前端构建大小: $build_size"
        fi
    else
        log_error "前端构建失败！"
        exit 1
    fi
}

# Build backend for multiple platforms
build_backend() {
    log_step "构建后端 (多平台支持)"

    cd backend

    log_info "编译 Linux x64 版本..."
    if GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o terraria-panel-linux cmd/main.go; then
        log_success "Linux 版本编译完成"
        local linux_size=$(du -sh terraria-panel-linux | cut -f1)
        log_info "Linux 二进制大小: $linux_size"
    else
        log_error "Linux 版本编译失败！"
        exit 1
    fi

    log_info "编译 Windows x64 版本..."
    if GOOS=windows GOARCH=amd64 go build -ldflags="-s -w" -o terraria-panel-windows.exe cmd/main.go; then
        log_success "Windows 版本编译完成"
        local windows_size=$(du -sh terraria-panel-windows.exe | cut -f1)
        log_info "Windows 二进制大小: $windows_size"
    else
        log_error "Windows 版本编译失败！"
        exit 1
    fi

    cd ..
}

# Package release files
package_release() {
    log_step "打包发布文件"

    local release_path="$RELEASE_DIR/$RELEASE_NAME"

    # Copy frontend dist
    if [ -d "dist" ]; then
        cp -r dist "$release_path/backend/"
        log_info "前端文件已复制到发布包"
    else
        log_error "前端dist目录不存在！"
        exit 1
    fi

    # Copy backend binaries
    cp backend/terraria-panel-linux "$release_path/backend/"
    cp backend/terraria-panel-windows.exe "$release_path/backend/"
    log_info "后端二进制文件已复制"

    # Copy essential scripts
    cp scripts/deploy-ultra.sh "$release_path/scripts/"
    chmod +x "$release_path/scripts/deploy-ultra.sh"
    log_info "部署脚本已复制"

    # Create production config template
    cat > "$release_path/backend/config.yaml" << 'EOF'
# Terraria Panel Production Configuration
app:
  name: "Terraria Panel"
  environment: "production"
  debug: false

server:
  port: 8080
  read_timeout: 30
  write_timeout: 30
  idle_timeout: 120

database:
  type: "sqlite"
  path: "./data/panel.db"

log:
  level: "info"
  format: "json"
  output: "stdout"

jwt:
  secret: "your-secret-key-change-this"
  expiration: 24

terraria:
  server_path: "./terraria-servers"
  world_path: "./worlds"
  backup_path: "./backups"
  download_url: "https://terraria.org/api/download/pc-dedicated-server/terraria-server-1449.zip"
  max_servers: 10
  port_range: "7777-7800"
  default_world: "world1"
EOF
    log_info "生产配置模板已创建"

    # Create README for release
    cat > "$release_path/README.md" << 'EOF'
# 🎮 Terraria Panel - 生产发布版

## 🚀 快速部署

### Linux 系统
```bash
# 1. 给脚本执行权限
chmod +x scripts/deploy-ultra.sh

# 2. 启动服务
./scripts/deploy-ultra.sh start

# 3. 访问面板
# http://localhost:8080
```

### Windows 系统
```cmd
# 直接运行
cd backend
terraria-panel-windows.exe
```

## 📋 系统要求

- **Linux**: CentOS 7+, Ubuntu 18.04+, Debian 9+
- **Windows**: Windows Server 2016+, Windows 10+
- **内存**: 最低 512MB，推荐 1GB+
- **磁盘**: 最低 100MB，推荐 1GB+

## 🔧 配置

编辑 `backend/config.yaml` 文件进行配置。

## 🎯 功能特性

- ✅ **单端口部署** - 面板+API统一端口
- ✅ **实时监控** - UltraThink监控系统
- ✅ **智能端口管理** - 自动检测和分配
- ✅ **服务器管理** - 一键启停泰拉瑞亚服务器
- ✅ **世界管理** - 上传/下载/备份世界文件
- ✅ **玩家统计** - 实时玩家数据监控

## 📞 技术支持

- 版本: v1.0.0
- 构建时间: $(date)
- 技术支持: GitHub Issues

---
© 2025 Terraria Panel Team. All rights reserved.
EOF
    log_info "README文档已创建"

    log_success "发布包打包完成"
}

# Create compressed archive
create_archive() {
    log_step "创建发布归档"

    cd "$RELEASE_DIR"

    # Create tar.gz for Linux
    if tar -czf "${RELEASE_NAME}-linux.tar.gz" "$RELEASE_NAME"; then
        log_success "Linux 发布包创建完成: ${RELEASE_NAME}-linux.tar.gz"
        local linux_archive_size=$(du -sh "${RELEASE_NAME}-linux.tar.gz" | cut -f1)
        log_info "Linux 归档大小: $linux_archive_size"
    fi

    # Create zip for Windows
    if command -v zip >/dev/null 2>&1; then
        if zip -r "${RELEASE_NAME}-windows.zip" "$RELEASE_NAME" >/dev/null; then
            log_success "Windows 发布包创建完成: ${RELEASE_NAME}-windows.zip"
            local windows_archive_size=$(du -sh "${RELEASE_NAME}-windows.zip" | cut -f1)
            log_info "Windows 归档大小: $windows_archive_size"
        fi
    else
        log_info "zip 命令不可用，跳过 Windows 归档创建"
    fi

    cd ..
}

# Generate deployment instructions
generate_deployment_info() {
    log_step "生成部署指南"

    cat > "$RELEASE_DIR/DEPLOYMENT.md" << 'EOF'
# 🚀 Terraria Panel 一键部署指南

## 📦 快速部署 (Linux)

### 方法1: 直接下载部署
```bash
# 下载发布包
wget https://github.com/ShourGG/tailamianban/releases/latest/download/terraria-panel-v1.0.0-linux.tar.gz

# 解压
tar -xzf terraria-panel-v1.0.0-linux.tar.gz

# 进入目录
cd terraria-panel-v1.0.0

# 启动服务
chmod +x scripts/deploy-ultra.sh
./scripts/deploy-ultra.sh start
```

### 方法2: 一键部署脚本
```bash
# 下载并执行一键部署脚本
curl -fsSL https://raw.githubusercontent.com/ShourGG/tailamianban/main/install.sh | bash
```

## 🎯 访问面板

部署完成后，打开浏览器访问:
- **管理面板**: http://your-server-ip:8080
- **API文档**: http://your-server-ip:8080/api
- **监控页面**: http://your-server-ip:8080/monitor

## 🔧 服务管理

```bash
# 查看状态
./scripts/deploy-ultra.sh status

# 重启服务
./scripts/deploy-ultra.sh restart

# 停止服务
./scripts/deploy-ultra.sh stop

# 查看日志
./scripts/deploy-ultra.sh logs
```

## 🛡️ 安全建议

1. **修改默认配置**: 编辑 `backend/config.yaml`
2. **设置防火墙**: 只开放必要端口
3. **定期备份**: 备份世界文件和配置
4. **监控日志**: 定期检查运行日志

## 📋 故障排除

### 端口被占用
```bash
# 检查端口占用
netstat -tlnp | grep :8080

# 使用其他端口启动
./scripts/deploy-ultra.sh start -p 9090
```

### 权限问题
```bash
# 给予执行权限
chmod +x backend/terraria-panel-linux
chmod +x scripts/*.sh
```

---
🎮 享受你的泰拉瑞亚服务器管理体验！
EOF

    log_success "部署指南已生成"
}

# Main execution
main() {
    print_banner
    check_dependencies
    prepare_release_dir
    build_frontend
    build_backend
    package_release
    create_archive
    generate_deployment_info

    echo ""
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║${GREEN}                    🎉 发布构建完成！                         ${PURPLE}║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}📦 发布文件位置:${NC}"
    echo "   📁 $RELEASE_DIR/$RELEASE_NAME/"
    echo "   📦 $RELEASE_DIR/${RELEASE_NAME}-linux.tar.gz"
    if [ -f "$RELEASE_DIR/${RELEASE_NAME}-windows.zip" ]; then
        echo "   📦 $RELEASE_DIR/${RELEASE_NAME}-windows.zip"
    fi
    echo ""
    echo -e "${CYAN}🚀 下一步操作:${NC}"
    echo "   1. 上传发布包到 GitHub Releases"
    echo "   2. 测试部署脚本"
    echo "   3. 发布到生产环境"
    echo ""
    echo -e "${GREEN}✨ 源码已受保护，只包含编译后的文件！${NC}"
}

# Run the main function
main