#!/bin/bash

# ===================================================================
# 🎮 Terraria Panel - Clean Install Script
# 老王制作的彻底清理重装脚本，删除所有相关文件后重新部署！
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
SERVICE_NAME="terraria-panel"
INSTALL_DIR="$HOME/terraria-panel"
BINARY_NAME="terraria-panel"
PID_FILE="/tmp/terraria-panel.pid"

print_banner() {
    echo ""
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║${RED}                🧹 TERRARIA PANEL CLEANER                    ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${YELLOW}                   彻底清理重装脚本                          ${PURPLE}║${NC}"
    echo -e "${PURPLE}║                                                              ║${NC}"
    echo -e "${PURPLE}║${RED}  🗑️ 删除所有 | 🧽 彻底清理 | 🚀 重新部署                   ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${GREEN}  📦 自动下载 | 🔧 自动配置 | 💯 一键搞定                   ${PURPLE}║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

log_info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo ""
    echo -e "${BLUE}[STEP]${NC} ${BOLD}$1${NC}"
    echo -e "${BLUE}────────────────────────────────────────────────${NC}"
}

# Stop any running services
stop_all_services() {
    log_step "停止所有相关服务"
    
    # Stop systemd service if exists
    if systemctl is-active --quiet $SERVICE_NAME 2>/dev/null; then
        log_info "停止systemd服务: $SERVICE_NAME"
        sudo systemctl stop $SERVICE_NAME || true
        sudo systemctl disable $SERVICE_NAME || true
    fi
    
    # Stop process by PID file
    if [[ -f "$PID_FILE" ]]; then
        local pid=$(cat "$PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            log_info "停止进程 (PID: $pid)"
            kill "$pid" 2>/dev/null || true
            sleep 2
            if ps -p "$pid" > /dev/null 2>&1; then
                log_warning "强制停止进程"
                kill -9 "$pid" 2>/dev/null || true
            fi
        fi
        rm -f "$PID_FILE"
    fi
    
    # Kill any terraria-panel processes
    if pgrep -f "terraria-panel" > /dev/null; then
        log_info "强制停止所有terraria-panel进程"
        pkill -f "terraria-panel" || true
        sleep 1
        pkill -9 -f "terraria-panel" || true
    fi
    
    log_success "所有服务已停止"
}

# Remove all files and directories
clean_all_files() {
    log_step "删除所有相关文件"
    
    # Remove systemd service file
    if [[ -f "/etc/systemd/system/${SERVICE_NAME}.service" ]]; then
        log_info "删除systemd服务文件"
        sudo rm -f "/etc/systemd/system/${SERVICE_NAME}.service"
        sudo systemctl daemon-reload
    fi
    
    # Remove installation directory
    if [[ -d "$INSTALL_DIR" ]]; then
        log_info "删除安装目录: $INSTALL_DIR"
        rm -rf "$INSTALL_DIR"
    fi
    
    # Remove current directory files
    local files_to_remove=(
        "$BINARY_NAME"
        "terraria-panel"
        "terraria-panel.exe"
        "terraria-panel.log"
        "terraria-panel-linux.tar.gz"
        "terraria-panel-linux"
        "run.sh"
        "start.sh"
        "config.yaml"
        "data"
        "terraria-servers"
        "worlds"
        "backups"
        "logs"
    )
    
    for file in "${files_to_remove[@]}"; do
        if [[ -e "$file" ]]; then
            log_info "删除: $file"
            rm -rf "$file"
        fi
    done
    
    # Remove PID file
    rm -f "$PID_FILE"
    
    log_success "所有文件已删除"
}

# Download and setup fresh installation
download_and_setup() {
    log_step "下载并设置全新安装"
    
    # Download the management script
    log_info "下载管理脚本..."
    if wget -O run.sh "https://raw.githubusercontent.com/$GITHUB_REPO/main/run.sh"; then
        chmod +x run.sh
        log_success "管理脚本下载完成"
    else
        log_error "管理脚本下载失败"
        return 1
    fi
    
    # Try to download release package directly
    log_info "尝试下载发布包..."
    
    # Method 1: Try GitHub releases API
    local download_url=$(curl -s "https://api.github.com/repos/$GITHUB_REPO/releases/latest" 2>/dev/null | \
                        grep "browser_download_url.*linux.*tar.gz" | \
                        cut -d '"' -f 4)
    
    # Method 2: Direct download from repository
    if [[ -z "$download_url" ]]; then
        log_warning "未找到GitHub Release，使用直接下载"
        download_url="https://raw.githubusercontent.com/$GITHUB_REPO/main/release/terraria-panel-v1.0.0-linux-amd64.tar.gz"
    fi
    
    # Method 3: Download entire repository
    if ! wget -O terraria-panel-linux.tar.gz "$download_url" 2>/dev/null; then
        log_warning "直接下载失败，下载完整仓库"
        if wget -O main.zip "https://github.com/$GITHUB_REPO/archive/refs/heads/main.zip"; then
            unzip -q main.zip
            if [[ -f "tailamianban-main/release/terraria-panel-v1.0.0-linux-amd64.tar.gz" ]]; then
                cp "tailamianban-main/release/terraria-panel-v1.0.0-linux-amd64.tar.gz" terraria-panel-linux.tar.gz
                rm -rf tailamianban-main main.zip
            else
                log_error "在仓库中未找到发布包"
                rm -rf tailamianban-main main.zip
                return 1
            fi
        else
            log_error "下载失败"
            return 1
        fi
    fi
    
    # Extract and setup
    log_info "解压安装包..."
    if tar -xzf terraria-panel-linux.tar.gz; then
        # Find the binary
        if [[ -d "terraria-panel-linux" ]]; then
            cp terraria-panel-linux/terraria-panel ./$BINARY_NAME
            chmod +x $BINARY_NAME
            rm -rf terraria-panel-linux
        elif [[ -f "terraria-panel" ]]; then
            mv terraria-panel $BINARY_NAME
            chmod +x $BINARY_NAME
        else
            log_error "解压后未找到可执行文件"
            return 1
        fi
        
        rm -f terraria-panel-linux.tar.gz
        log_success "安装包解压完成"
    else
        log_error "解压失败"
        return 1
    fi
}

# Start the service
start_service() {
    log_step "启动服务"
    
    if [[ ! -f "$BINARY_NAME" ]]; then
        log_error "未找到可执行文件: $BINARY_NAME"
        return 1
    fi
    
    log_info "启动Terraria Panel..."
    nohup ./$BINARY_NAME > terraria-panel.log 2>&1 &
    echo $! > $PID_FILE
    
    sleep 3
    
    if [[ -f "$PID_FILE" ]]; then
        local pid=$(cat "$PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            log_success "服务启动成功 (PID: $pid)"
            log_info "访问地址: http://$(hostname -I | awk '{print $1}'):8080"
            log_info "日志文件: terraria-panel.log"
            return 0
        fi
    fi
    
    log_error "服务启动失败，请查看日志"
    if [[ -f "terraria-panel.log" ]]; then
        echo "最近的日志:"
        tail -10 terraria-panel.log
    fi
    return 1
}

# Show completion info
show_completion() {
    echo ""
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║${GREEN}                    🎉 重装完成！                             ${PURPLE}║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN}🚀 访问地址:${NC}"
    echo "   🌐 管理面板: http://$(hostname -I | awk '{print $1}'):8080"
    echo ""
    echo -e "${GREEN}🔧 管理命令:${NC}"
    echo "   ./run.sh          # 运行管理脚本"
    echo "   tail -f terraria-panel.log  # 查看实时日志"
    echo ""
    echo -e "${YELLOW}📁 当前目录文件:${NC}"
    ls -la terraria-panel* run.sh 2>/dev/null || true
}

# Main function
main() {
    print_banner
    
    echo -e "${RED}⚠️  警告: 此脚本将删除所有Terraria Panel相关文件！${NC}"
    echo -e "${YELLOW}包括: 服务、配置、数据、日志等所有内容${NC}"
    echo ""
    read -p "确认继续清理重装? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "操作已取消"
        exit 0
    fi
    
    stop_all_services
    clean_all_files
    download_and_setup
    start_service
    show_completion
    
    log_success "清理重装完成！"
}

# Run main function
main "$@"
