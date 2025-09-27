#!/bin/bash

# ===================================================================
# 🎮 Terraria Panel - Linux One-Click Manager
# 老王精心打造的简单部署脚本，参考DST管理平台风格！
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
SERVICE_NAME="terraria-panel"
DEFAULT_PORT=8080
BINARY_NAME="terraria-panel"
PID_FILE="/tmp/terraria-panel.pid"
LOG_FILE="terraria-panel.log"

print_banner() {
    echo ""
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║${CYAN}                🎮 TERRARIA PANEL MANAGER                    ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${YELLOW}                   Linux一键管理脚本                          ${PURPLE}║${NC}"
    echo -e "${PURPLE}║                                                              ║${NC}"
    echo -e "${PURPLE}║${GREEN}  📦 自动下载 | 🚀 快速部署 | 🔧 服务管理                     ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${GREEN}  🛡️ 简单配置 | 📊 日志查看 | 💯 生产级别                     ${PURPLE}║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_menu() {
    echo -e "${CYAN}泰拉瑞亚面板管理系统(Terraria Panel)${NC}"
    echo -e "${CYAN}--- https://github.com/ShourGG/tailamianban ---${NC}"
    echo "————————————————————————————————————————————————————————————"
    echo -e "${GREEN}[0]: 下载并启动服务(Download and start the service)${NC}"
    echo "————————————————————————————————————————————————————————————"
    echo -e "${GREEN}[1]: 启动服务(Start the service)${NC}"
    echo -e "${GREEN}[2]: 关闭服务(Stop the service)${NC}"
    echo -e "${GREEN}[3]: 重启服务(Restart the service)${NC}"
    echo "————————————————————————————————————————————————————————————"
    echo -e "${GREEN}[4]: 更新管理平台(Update management platform)${NC}"
    echo -e "${GREEN}[5]: 强制更新平台(Force update platform)${NC}"
    echo -e "${GREEN}[6]: 更新启动脚本(Update startup script)${NC}"
    echo "————————————————————————————————————————————————————————————"
    echo -e "${GREEN}[7]: 查看服务状态(Check service status)${NC}"
    echo -e "${GREEN}[8]: 查看日志(View logs)${NC}"
    echo -e "${GREEN}[9]: 退出脚本(Exit script)${NC}"
    echo "————————————————————————————————————————————————————————————"
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

# Check if service is running
is_running() {
    if [[ -f "$PID_FILE" ]]; then
        local pid=$(cat "$PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            return 0
        else
            rm -f "$PID_FILE"
            return 1
        fi
    fi
    return 1
}

# Get service status
get_status() {
    if is_running; then
        local pid=$(cat "$PID_FILE")
        echo -e "${GREEN}运行中${NC} (PID: $pid)"
    else
        echo -e "${RED}已停止${NC}"
    fi
}

# Download latest release
download_service() {
    log_info "正在下载最新版本..."

    # Try to get latest release URL first
    local download_url=$(curl -s "https://api.github.com/repos/$GITHUB_REPO/releases/latest" 2>/dev/null | \
                        grep "browser_download_url.*linux.*tar.gz" | \
                        cut -d '"' -f 4)

    # If no release found, use direct download from main branch
    if [[ -z "$download_url" ]]; then
        log_warning "未找到GitHub Release，使用直接下载方式"
        download_url="https://raw.githubusercontent.com/$GITHUB_REPO/main/release/terraria-panel-v1.0.0-linux-amd64.tar.gz"
    fi

    log_info "下载地址: $download_url"

    # Download and extract
    if wget -O terraria-panel-linux.tar.gz "$download_url"; then
        tar -xzf terraria-panel-linux.tar.gz

        # Move binary to current directory
        if [[ -d "terraria-panel-linux" ]]; then
            cp terraria-panel-linux/terraria-panel ./$BINARY_NAME
            chmod +x $BINARY_NAME
            rm -rf terraria-panel-linux terraria-panel-linux.tar.gz
        elif [[ -f "terraria-panel" ]]; then
            mv terraria-panel $BINARY_NAME
            chmod +x $BINARY_NAME
            rm -f terraria-panel-linux.tar.gz
        else
            log_error "解压后未找到可执行文件"
            return 1
        fi

        log_success "下载完成"
    else
        log_error "下载失败，请检查网络连接"
        return 1
    fi
}

# Start service
start_service() {
    if is_running; then
        log_warning "服务已在运行中"
        return 0
    fi
    
    if [[ ! -f "$BINARY_NAME" ]]; then
        log_error "未找到可执行文件，请先下载服务"
        return 1
    fi
    
    log_info "正在启动服务..."
    nohup ./$BINARY_NAME > $LOG_FILE 2>&1 &
    echo $! > $PID_FILE
    
    sleep 2
    if is_running; then
        log_success "服务启动成功，端口: $DEFAULT_PORT"
        log_info "访问地址: http://$(hostname -I | awk '{print $1}'):$DEFAULT_PORT"
    else
        log_error "服务启动失败，请查看日志"
        return 1
    fi
}

# Stop service
stop_service() {
    if ! is_running; then
        log_warning "服务未运行"
        return 0
    fi
    
    local pid=$(cat "$PID_FILE")
    log_info "正在停止服务 (PID: $pid)..."
    
    kill "$pid"
    sleep 2
    
    if ! is_running; then
        log_success "服务已停止"
        rm -f "$PID_FILE"
    else
        log_warning "强制停止服务..."
        kill -9 "$pid"
        rm -f "$PID_FILE"
        log_success "服务已强制停止"
    fi
}

# Restart service
restart_service() {
    log_info "正在重启服务..."
    stop_service
    sleep 1
    start_service
}

# Update service
update_service() {
    log_info "正在更新服务..."
    stop_service
    download_service
    start_service
}

# Force update
force_update() {
    log_warning "强制更新将删除所有本地文件"
    read -p "确认继续? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        stop_service
        rm -f $BINARY_NAME $LOG_FILE
        download_service
        start_service
    fi
}

# Update script
update_script() {
    log_info "正在更新启动脚本..."
    wget -O run.sh.new "https://raw.githubusercontent.com/$GITHUB_REPO/main/run.sh"
    if [[ -f "run.sh.new" ]]; then
        mv run.sh.new run.sh
        chmod +x run.sh
        log_success "脚本更新完成，请重新运行"
        exit 0
    else
        log_error "脚本更新失败"
    fi
}

# View logs
view_logs() {
    if [[ -f "$LOG_FILE" ]]; then
        echo -e "${CYAN}=== 最近50行日志 ===${NC}"
        tail -50 "$LOG_FILE"
        echo ""
        echo -e "${CYAN}实时日志 (Ctrl+C 退出):${NC}"
        tail -f "$LOG_FILE"
    else
        log_warning "日志文件不存在"
    fi
}

# Main function
main() {
    print_banner
    
    while true; do
        print_menu
        echo -n "请输入选择(Please enter your selection) [0-9]: "
        read choice
        
        case $choice in
            0)
                download_service && start_service
                ;;
            1)
                start_service
                ;;
            2)
                stop_service
                ;;
            3)
                restart_service
                ;;
            4)
                update_service
                ;;
            5)
                force_update
                ;;
            6)
                update_script
                ;;
            7)
                echo -e "服务状态: $(get_status)"
                ;;
            8)
                view_logs
                ;;
            9)
                log_info "退出脚本"
                exit 0
                ;;
            *)
                log_error "无效选择，请输入 0-9"
                ;;
        esac
        
        echo ""
        read -p "按回车键继续..."
        clear
    done
}

# Run main function
main
