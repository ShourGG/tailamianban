#!/bin/bash

###########################################
# 泰拉瑞亚面板一键安装脚本 v1.0
# Terraria Panel One-Click Install Script
###########################################

set -e

# 配置变量
GITHUB_REPO="ShourGG/tailamianban"
INSTALL_DIR="/opt/terraria-panel"
SERVICE_NAME="terraria-panel"
SERVICE_USER="terraria"

# 颜色输出函数
function echo_red() {
    echo -e "\033[0;31m$*\033[0m"
}

function echo_green() {
    echo -e "\033[0;32m$*\033[0m"
}

function echo_yellow() {
    echo -e "\033[0;33m$*\033[0m"
}

function echo_cyan() {
    echo -e "\033[0;36m$*\033[0m"
}

function echo_blue() {
    echo -e "\033[0;34m$*\033[0m"
}

# 检查系统
function check_system() {
    echo_blue "🔍 检查系统环境..."
    echo_blue "🔍 Checking system environment..."
    
    # 检查操作系统
    if [[ ! -f /etc/os-release ]]; then
        echo_red "❌ 不支持的操作系统"
        echo_red "❌ Unsupported operating system"
        exit 1
    fi
    
    source /etc/os-release
    echo_green "✅ 操作系统: $PRETTY_NAME"
    echo_green "✅ Operating System: $PRETTY_NAME"
    
    # 检查架构
    local arch=$(uname -m)
    case $arch in
        x86_64)
            ARCH="amd64"
            ;;
        aarch64|arm64)
            ARCH="arm64"
            ;;
        *)
            echo_red "❌ 不支持的架构: $arch"
            echo_red "❌ Unsupported architecture: $arch"
            exit 1
            ;;
    esac
    
    echo_green "✅ 系统架构: $arch ($ARCH)"
    echo_green "✅ System Architecture: $arch ($ARCH)"
}

# 检查权限
function check_permissions() {
    if [[ $EUID -ne 0 ]]; then
        echo_red "❌ 此脚本需要root权限运行"
        echo_red "❌ This script must be run as root"
        echo_yellow "请使用: sudo $0"
        echo_yellow "Please use: sudo $0"
        exit 1
    fi
}

# 安装依赖
function install_dependencies() {
    echo_blue "📦 安装系统依赖..."
    echo_blue "📦 Installing system dependencies..."
    
    # 更新包管理器
    if command -v apt-get >/dev/null 2>&1; then
        apt-get update
        apt-get install -y curl wget unzip systemd
    elif command -v yum >/dev/null 2>&1; then
        yum update -y
        yum install -y curl wget unzip systemd
    elif command -v dnf >/dev/null 2>&1; then
        dnf update -y
        dnf install -y curl wget unzip systemd
    else
        echo_red "❌ 不支持的包管理器"
        echo_red "❌ Unsupported package manager"
        exit 1
    fi
    
    echo_green "✅ 依赖安装完成"
    echo_green "✅ Dependencies installed"
}

# 创建用户
function create_user() {
    echo_blue "👤 创建服务用户..."
    echo_blue "👤 Creating service user..."
    
    if ! id "$SERVICE_USER" >/dev/null 2>&1; then
        useradd --system --shell /bin/false --home-dir "$INSTALL_DIR" --create-home "$SERVICE_USER"
        echo_green "✅ 用户创建成功: $SERVICE_USER"
        echo_green "✅ User created: $SERVICE_USER"
    else
        echo_yellow "⚠️  用户已存在: $SERVICE_USER"
        echo_yellow "⚠️  User already exists: $SERVICE_USER"
    fi
}

# 下载面板
function download_panel() {
    echo_blue "⬇️  下载泰拉瑞亚面板..."
    echo_blue "⬇️  Downloading Terraria Panel..."
    
    # 获取最新版本
    local latest_version=$(curl -s "https://api.github.com/repos/$GITHUB_REPO/releases/latest" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
    
    if [[ -z "$latest_version" ]]; then
        echo_red "❌ 无法获取最新版本信息"
        echo_red "❌ Failed to get latest version"
        exit 1
    fi
    
    echo_green "📋 最新版本: $latest_version"
    echo_green "📋 Latest version: $latest_version"
    
    # 构建下载URL
    local download_url="https://github.com/$GITHUB_REPO/releases/download/$latest_version/terraria-panel-linux-$ARCH.tar.gz"
    
    # 创建临时目录
    local temp_dir=$(mktemp -d)
    cd "$temp_dir"
    
    # 下载文件
    echo_blue "📥 下载中..."
    echo_blue "📥 Downloading..."
    
    if ! wget -q --show-progress "$download_url" -O "terraria-panel.tar.gz"; then
        echo_red "❌ 下载失败"
        echo_red "❌ Download failed"
        rm -rf "$temp_dir"
        exit 1
    fi
    
    # 解压文件
    echo_blue "📂 解压中..."
    echo_blue "📂 Extracting..."
    
    tar -xzf "terraria-panel.tar.gz"
    
    # 创建安装目录
    mkdir -p "$INSTALL_DIR"
    
    # 复制文件
    cp -r terraria-panel/* "$INSTALL_DIR/"
    
    # 设置权限
    chown -R "$SERVICE_USER:$SERVICE_USER" "$INSTALL_DIR"
    chmod +x "$INSTALL_DIR/terraria-panel"
    chmod +x "$INSTALL_DIR/scripts/run.sh"
    
    # 清理临时文件
    rm -rf "$temp_dir"
    
    echo_green "✅ 面板下载完成"
    echo_green "✅ Panel downloaded"
}

# 配置防火墙
function configure_firewall() {
    echo_blue "🔥 配置防火墙..."
    echo_blue "🔥 Configuring firewall..."
    
    # UFW
    if command -v ufw >/dev/null 2>&1; then
        ufw --force enable
        ufw allow 8080/tcp
        echo_green "✅ UFW防火墙已配置"
        echo_green "✅ UFW firewall configured"
    # firewalld
    elif command -v firewall-cmd >/dev/null 2>&1; then
        systemctl enable firewalld
        systemctl start firewalld
        firewall-cmd --permanent --add-port=8080/tcp
        firewall-cmd --reload
        echo_green "✅ firewalld防火墙已配置"
        echo_green "✅ firewalld firewall configured"
    # iptables
    elif command -v iptables >/dev/null 2>&1; then
        iptables -A INPUT -p tcp --dport 8080 -j ACCEPT
        # 尝试保存规则
        if command -v iptables-save >/dev/null 2>&1; then
            iptables-save > /etc/iptables/rules.v4 2>/dev/null || true
        fi
        echo_green "✅ iptables防火墙已配置"
        echo_green "✅ iptables firewall configured"
    else
        echo_yellow "⚠️  未检测到防火墙，请手动开放8080端口"
        echo_yellow "⚠️  No firewall detected, please manually open port 8080"
    fi
}

# 创建systemd服务
function create_service() {
    echo_blue "🔧 创建系统服务..."
    echo_blue "🔧 Creating system service..."
    
    cat > "/etc/systemd/system/$SERVICE_NAME.service" << EOF
[Unit]
Description=Terraria Panel Server
Documentation=https://github.com/$GITHUB_REPO
After=network.target

[Service]
Type=simple
User=$SERVICE_USER
Group=$SERVICE_USER
WorkingDirectory=$INSTALL_DIR
ExecStart=$INSTALL_DIR/terraria-panel
ExecReload=/bin/kill -HUP \$MAINPID
KillMode=mixed
KillSignal=SIGTERM
TimeoutStopSec=30
Restart=always
RestartSec=5
StartLimitInterval=60
StartLimitBurst=3

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$INSTALL_DIR

# Environment
Environment=PORT=8080
Environment=GIN_MODE=release
Environment=DATA_DIR=$INSTALL_DIR/data

[Install]
WantedBy=multi-user.target
EOF

    # 重载systemd
    systemctl daemon-reload
    systemctl enable "$SERVICE_NAME"
    
    echo_green "✅ 系统服务已创建"
    echo_green "✅ System service created"
}

# 启动服务
function start_service() {
    echo_blue "🚀 启动泰拉瑞亚面板..."
    echo_blue "🚀 Starting Terraria Panel..."
    
    systemctl start "$SERVICE_NAME"
    
    # 等待启动
    sleep 3
    
    # 检查状态
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        echo_green "✅ 面板启动成功!"
        echo_green "✅ Panel started successfully!"
    else
        echo_red "❌ 面板启动失败"
        echo_red "❌ Failed to start panel"
        echo_yellow "📋 查看日志: journalctl -u $SERVICE_NAME -f"
        echo_yellow "📋 View logs: journalctl -u $SERVICE_NAME -f"
        exit 1
    fi
}

# 显示完成信息
function show_completion() {
    local server_ip=$(curl -s ifconfig.me 2>/dev/null || echo "YOUR_SERVER_IP")
    
    echo
    echo_green "🎉 泰拉瑞亚面板安装完成!"
    echo_green "🎉 Terraria Panel installation completed!"
    echo
    echo_cyan "📋 安装信息 / Installation Info:"
    echo "=================================="
    echo "安装目录 / Install Dir: $INSTALL_DIR"
    echo "服务用户 / Service User: $SERVICE_USER"
    echo "系统服务 / System Service: $SERVICE_NAME"
    echo "监听端口 / Port: 8080"
    echo
    echo_cyan "🌐 访问地址 / Access URLs:"
    echo "本地访问 / Local: http://localhost:8080"
    echo "远程访问 / Remote: http://$server_ip:8080"
    echo
    echo_cyan "🔑 默认账号 / Default Account:"
    echo "用户名 / Username: admin"
    echo "密码 / Password: admin123"
    echo
    echo_yellow "⚠️  重要提醒 / Important Notes:"
    echo "1. 请立即修改默认密码!"
    echo "1. Please change the default password immediately!"
    echo "2. 确保防火墙已开放8080端口"
    echo "2. Ensure firewall allows port 8080"
    echo "3. 建议配置SSL证书以启用HTTPS"
    echo "3. Recommend configuring SSL certificate for HTTPS"
    echo
    echo_cyan "🔧 管理命令 / Management Commands:"
    echo "启动服务 / Start: systemctl start $SERVICE_NAME"
    echo "停止服务 / Stop: systemctl stop $SERVICE_NAME"
    echo "重启服务 / Restart: systemctl restart $SERVICE_NAME"
    echo "查看状态 / Status: systemctl status $SERVICE_NAME"
    echo "查看日志 / Logs: journalctl -u $SERVICE_NAME -f"
    echo "手动管理 / Manual: $INSTALL_DIR/scripts/run.sh"
    echo
    echo_green "✨ 享受你的泰拉瑞亚服务器管理体验!"
    echo_green "✨ Enjoy your Terraria server management experience!"
}

# 主函数
function main() {
    echo_cyan "🎮 泰拉瑞亚面板一键安装脚本"
    echo_cyan "🎮 Terraria Panel One-Click Install Script"
    echo
    
    # 检查权限
    check_permissions
    
    # 检查系统
    check_system
    
    # 安装依赖
    install_dependencies
    
    # 创建用户
    create_user
    
    # 下载面板
    download_panel
    
    # 配置防火墙
    configure_firewall
    
    # 创建服务
    create_service
    
    # 启动服务
    start_service
    
    # 显示完成信息
    show_completion
}

# 执行主函数
main "$@"