#!/bin/bash

# ===================================================================
# 🎮 Terraria Panel - Linux One-Click Installer
# 老王精心制作的简化一键部署脚本，参考DST风格！
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

# Configuration
GITHUB_REPO="ShourGG/tailamianban"
VERSION="latest"
INSTALL_DIR="$HOME/terraria-panel"
SERVICE_NAME="terraria-panel"

print_banner() {
    echo ""
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║${CYAN}                🎮 TERRARIA PANEL INSTALLER                  ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${YELLOW}                   Linux一键部署安装器                         ${PURPLE}║${NC}"
    echo -e "${PURPLE}║                                                              ║${NC}"
    echo -e "${PURPLE}║${GREEN}  📦 自动下载 | 🚀 快速部署 | 🔧 自动配置                     ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${GREEN}  🛡️ 安全配置 | 📊 监控就绪 | 💯 生产级别                     ${PURPLE}║${NC}"
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

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        log_error "请不要使用root用户运行此脚本！"
        log_info "推荐创建一个专用的用户来运行面板"
        exit 1
    fi
}

# Check system requirements
check_requirements() {
    log_step "检查系统要求"

    # Check OS
    if [[ ! -f /etc/os-release ]]; then
        log_error "无法识别的Linux发行版"
        exit 1
    fi

    source /etc/os-release
    log_info "检测到系统: $PRETTY_NAME"

    # Check dependencies
    local missing_deps=()

    if ! command -v curl >/dev/null 2>&1; then
        missing_deps+=("curl")
    fi

    if ! command -v wget >/dev/null 2>&1; then
        missing_deps+=("wget")
    fi

    if ! command -v unzip >/dev/null 2>&1; then
        missing_deps+=("unzip")
    fi

    if ! command -v tar >/dev/null 2>&1; then
        missing_deps+=("tar")
    fi

    if ! command -v systemctl >/dev/null 2>&1; then
        log_warning "systemctl 不可用，将跳过系统服务配置"
    fi

    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "缺少依赖: ${missing_deps[*]}"

        if command -v apt-get >/dev/null 2>&1; then
            log_info "请运行: sudo apt-get update && sudo apt-get install ${missing_deps[*]}"
        elif command -v yum >/dev/null 2>&1; then
            log_info "请运行: sudo yum install ${missing_deps[*]}"
        elif command -v dnf >/dev/null 2>&1; then
            log_info "请运行: sudo dnf install ${missing_deps[*]}"
        else
            log_info "请手动安装这些依赖"
        fi
        exit 1
    fi

    log_success "系统要求检查通过"
}

# Get latest release info
get_latest_release() {
    log_step "获取最新发布版本"

    local api_url="https://api.github.com/repos/${GITHUB_REPO}/releases/latest"

    log_info "查询最新版本: $api_url"

    local release_info
    if command -v curl >/dev/null 2>&1; then
        release_info=$(curl -s "$api_url")
    else
        release_info=$(wget -qO- "$api_url")
    fi

    if [ $? -ne 0 ] || [ -z "$release_info" ]; then
        log_error "无法获取发布信息，请检查网络连接"
        exit 1
    fi

    # Extract version and download URL
    VERSION=$(echo "$release_info" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
    DOWNLOAD_URL=$(echo "$release_info" | grep '"browser_download_url":.*linux.*tar\.gz"' | sed -E 's/.*"([^"]+)".*/\1/')

    if [ -z "$VERSION" ] || [ -z "$DOWNLOAD_URL" ]; then
        log_error "无法解析发布信息"
        echo "Debug: Release info:"
        echo "$release_info"
        exit 1
    fi

    log_success "找到版本: $VERSION"
    log_info "下载地址: $DOWNLOAD_URL"
}

# Create installation directory
create_install_dir() {
    log_step "准备安装目录"

    if [ -d "$INSTALL_DIR" ]; then
        log_warning "安装目录已存在: $INSTALL_DIR"
        read -p "是否覆盖安装？(y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "安装被取消"
            exit 0
        fi

        # Backup existing installation
        if [ -d "${INSTALL_DIR}.backup" ]; then
            sudo rm -rf "${INSTALL_DIR}.backup"
        fi
        sudo mv "$INSTALL_DIR" "${INSTALL_DIR}.backup"
        log_info "原安装已备份到: ${INSTALL_DIR}.backup"
    fi

    sudo mkdir -p "$INSTALL_DIR"
    sudo chown $USER:$USER "$INSTALL_DIR"

    log_success "安装目录已创建: $INSTALL_DIR"
}

# Download and extract release
download_and_extract() {
    log_step "下载并解压发布包"

    local temp_dir="/tmp/terraria-panel-install"
    rm -rf "$temp_dir"
    mkdir -p "$temp_dir"
    cd "$temp_dir"

    local filename="terraria-panel-${VERSION}-linux.tar.gz"
    log_info "下载文件: $filename"

    # Download with progress
    if command -v curl >/dev/null 2>&1; then
        curl -L -o "$filename" "$DOWNLOAD_URL" --progress-bar
    else
        wget --progress=bar "$DOWNLOAD_URL" -O "$filename"
    fi

    if [ $? -ne 0 ]; then
        log_error "下载失败"
        exit 1
    fi

    log_info "验证下载文件..."
    if [ ! -f "$filename" ]; then
        log_error "下载的文件不存在"
        exit 1
    fi

    local file_size=$(stat -f%z "$filename" 2>/dev/null || stat -c%s "$filename" 2>/dev/null)
    if [ "$file_size" -lt 1000000 ]; then  # Less than 1MB
        log_error "下载的文件太小，可能下载失败"
        exit 1
    fi

    log_info "解压安装包..."
    tar -xzf "$filename"

    # Find extracted directory
    local extracted_dir=""
    for dir in */; do
        if [ -d "$dir" ] && [ -f "${dir}backend/terraria-panel-linux" ]; then
            extracted_dir="$dir"
            break
        fi
    done

    if [ -z "$extracted_dir" ]; then
        log_error "无法找到有效的解压目录"
        exit 1
    fi

    log_info "复制文件到安装目录..."
    cp -r "${extracted_dir}"* "$INSTALL_DIR/"

    # Set executable permissions
    chmod +x "$INSTALL_DIR/backend/terraria-panel-linux"
    chmod +x "$INSTALL_DIR/scripts/"*.sh

    log_success "文件解压完成"

    # Cleanup
    cd /
    rm -rf "$temp_dir"
}

# Configure system service
configure_service() {
    log_step "配置系统服务"

    if ! command -v systemctl >/dev/null 2>&1; then
        log_warning "systemctl 不可用，跳过服务配置"
        return
    fi

    # Create systemd service file
    sudo tee /etc/systemd/system/${SERVICE_NAME}.service > /dev/null <<EOF
[Unit]
Description=Terraria Panel Server
After=network.target
Wants=network.target

[Service]
Type=simple
User=$USER
Group=$USER
WorkingDirectory=$INSTALL_DIR/backend
ExecStart=$INSTALL_DIR/backend/terraria-panel-linux
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal
SyslogIdentifier=terraria-panel

# Security settings
NoNewPrivileges=yes
PrivateTmp=yes
ProtectSystem=strict
ProtectHome=yes
ReadWritePaths=$INSTALL_DIR

# Environment
Environment=GIN_MODE=release
Environment=PORT=8080

[Install]
WantedBy=multi-user.target
EOF

    # Reload systemd and enable service
    sudo systemctl daemon-reload
    sudo systemctl enable ${SERVICE_NAME}

    log_success "系统服务已配置"
}

# Create configuration file
create_config() {
    log_step "创建配置文件"

    local config_file="$INSTALL_DIR/backend/config.yaml"

    if [ -f "$config_file" ]; then
        log_info "配置文件已存在，跳过创建"
        return
    fi

    cat > "$config_file" << 'EOF'
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
  secret: "change-this-secret-key-in-production"
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

    log_success "配置文件已创建: $config_file"
    log_warning "请修改配置文件中的 JWT secret key!"
}

# Setup directories
setup_directories() {
    log_step "设置工作目录"

    local dirs=(
        "$INSTALL_DIR/backend/data"
        "$INSTALL_DIR/backend/terraria-servers"
        "$INSTALL_DIR/backend/worlds"
        "$INSTALL_DIR/backend/backups"
        "$INSTALL_DIR/logs"
    )

    for dir in "${dirs[@]}"; do
        mkdir -p "$dir"
        chown $USER:$USER "$dir"
    done

    log_success "工作目录已设置"
}

# Configure firewall
configure_firewall() {
    log_step "配置防火墙"

    if command -v ufw >/dev/null 2>&1; then
        sudo ufw allow 8080/tcp comment "Terraria Panel"
        sudo ufw allow 7777:7800/tcp comment "Terraria Game Servers"
        log_success "UFW防火墙规则已添加"
    elif command -v firewall-cmd >/dev/null 2>&1; then
        sudo firewall-cmd --permanent --add-port=8080/tcp
        sudo firewall-cmd --permanent --add-port=7777-7800/tcp
        sudo firewall-cmd --reload
        log_success "firewalld防火墙规则已添加"
    else
        log_warning "未检测到防火墙，请手动开放端口 8080 和 7777-7800"
    fi
}

# Start service
start_service() {
    log_step "启动服务"

    if command -v systemctl >/dev/null 2>&1; then
        sudo systemctl start ${SERVICE_NAME}
        sleep 3

        if sudo systemctl is-active --quiet ${SERVICE_NAME}; then
            log_success "服务启动成功"
        else
            log_error "服务启动失败"
            log_info "查看日志: sudo journalctl -u ${SERVICE_NAME} -f"
            exit 1
        fi
    else
        log_info "手动启动服务: cd $INSTALL_DIR/backend && ./terraria-panel-linux"
    fi
}

# Display completion info
show_completion() {
    echo ""
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║${GREEN}                    🎉 安装完成！                             ${PURPLE}║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}📋 安装信息:${NC}"
    echo "   📁 安装目录: $INSTALL_DIR"
    echo "   🔧 配置文件: $INSTALL_DIR/backend/config.yaml"
    echo "   📊 服务名称: $SERVICE_NAME"
    echo ""
    echo -e "${CYAN}🚀 访问地址:${NC}"
    echo "   🌐 管理面板: http://$(hostname -I | awk '{print $1}'):8080"
    echo "   📊 监控页面: http://$(hostname -I | awk '{print $1}'):8080/monitor"
    echo ""
    echo -e "${GREEN}🔧 常用命令:${NC}"
    echo "   启动服务: sudo systemctl start $SERVICE_NAME"
    echo "   停止服务: sudo systemctl stop $SERVICE_NAME"
    echo "   重启服务: sudo systemctl restart $SERVICE_NAME"
    echo "   查看状态: sudo systemctl status $SERVICE_NAME"
    echo "   查看日志: sudo journalctl -u $SERVICE_NAME -f"
    echo ""
    echo -e "${RED}⚠️  重要提醒:${NC}"
    echo "   1. 请修改配置文件中的JWT密钥: $INSTALL_DIR/backend/config.yaml"
    echo "   2. 确保防火墙已开放端口 8080 和 7777-7800"
    echo "   3. 建议定期备份数据目录: $INSTALL_DIR/backend/data"
    echo ""
    echo -e "${GREEN}✨ 享受你的泰拉瑞亚服务器管理体验！${NC}"
}

# Main installation process
main() {
    print_banner

    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --install-dir=*)
                INSTALL_DIR="${1#*=}"
                shift
                ;;
            --user=*)
                USER="${1#*=}"
                shift
                ;;
            --version=*)
                VERSION="${1#*=}"
                shift
                ;;
            -h|--help)
                echo "用法: $0 [选项]"
                echo "选项:"
                echo "  --install-dir=DIR    指定安装目录 (默认: /opt/terraria-panel)"
                echo "  --user=USER          指定运行用户 (默认: terraria)"
                echo "  --version=VERSION    指定版本 (默认: latest)"
                echo "  -h, --help           显示帮助信息"
                exit 0
                ;;
            *)
                log_error "未知选项: $1"
                echo "使用 -h 或 --help 查看帮助"
                exit 1
                ;;
        esac
    done

    check_root
    check_requirements
    get_latest_release
    create_install_dir
    download_and_extract
    setup_directories
    create_config
    configure_service
    configure_firewall
    start_service
    show_completion
}

# Run main function
main "$@"