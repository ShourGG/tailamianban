#!/bin/bash

# ===================================================================
# 🎮 Terraria Panel - 老王完美部署脚本 v3.0
# 专门解决前端缓存和后台运行问题！
# ===================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
SERVICE_NAME="terraria-panel"
DEFAULT_PORT=8080
BINARY_NAME="terraria-panel"
LOG_FILE="terraria-panel.log"
DOWNLOAD_URL="https://raw.githubusercontent.com/ShourGG/tailamianban/main/release/terraria-panel-v1.0.0-linux-amd64.tar.gz"

print_banner() {
    clear
    echo ""
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║${CYAN}                🎮 TERRARIA PANEL MANAGER v3.0               ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${YELLOW}                   老王出品 - 完美部署脚本                      ${PURPLE}║${NC}"
    echo -e "${PURPLE}║                                                              ║${NC}"
    echo -e "${PURPLE}║${GREEN}  📦 自动下载 | 🚀 后台运行 | 🔧 完美更新                     ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${GREEN}  🛡️ 缓存清理 | 📊 日志查看 | 💯 生产级别                     ${PURPLE}║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_menu() {
    echo -e "${CYAN}泰拉瑞亚面板管理系统 - 老王v3.0${NC}"
    echo -e "${CYAN}--- https://github.com/ShourGG/tailamianban ---${NC}"
    echo "————————————————————————————————————————————————————————————"
    echo -e "${GREEN}[0]: 🚀 完美启动服务(Perfect Start - 推荐)${NC}"
    echo "————————————————————————————————————————————————————————————"
    echo -e "${GREEN}[1]: 启动服务(Start Service)${NC}"
    echo -e "${GREEN}[2]: 关闭服务(Stop Service)${NC}"
    echo -e "${GREEN}[3]: 重启服务(Restart Service)${NC}"
    echo "————————————————————————————————————————————————————————————"
    echo -e "${GREEN}[4]: 🔄 智能更新(Smart Update)${NC}"
    echo -e "${GREEN}[5]: 💪 强制更新(Force Update)${NC}"
    echo -e "${GREEN}[6]: 更新脚本(Update Script)${NC}"
    echo "————————————————————————————————————————————————————————————"
    echo -e "${GREEN}[7]: 📊 查看状态(Check Status)${NC}"
    echo -e "${GREEN}[8]: 📋 查看日志(View Logs)${NC}"
    echo -e "${GREEN}[9]: 🚪 退出(Exit)${NC}"
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
    if pgrep -f "$BINARY_NAME" > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Get service status
get_status() {
    if is_running; then
        local pid=$(pgrep -f "$BINARY_NAME")
        echo -e "${GREEN}运行中${NC} (PID: $pid)"
    else
        echo -e "${RED}已停止${NC}"
    fi
}

# Stop service completely
stop_service() {
    log_info "正在停止服务..."
    
    # Kill all terraria-panel processes
    pkill -f "$BINARY_NAME" 2>/dev/null || true
    
    # Wait for processes to stop
    sleep 2
    
    # Force kill if still running
    if is_running; then
        log_warning "强制终止残留进程..."
        pkill -9 -f "$BINARY_NAME" 2>/dev/null || true
        sleep 1
    fi
    
    if is_running; then
        log_error "服务停止失败"
        return 1
    else
        log_success "服务已停止"
        return 0
    fi
}

# Download and extract latest version
download_and_extract() {
    log_info "正在下载最新版本..."
    
    # Remove old files
    rm -rf terraria-panel-linux* terraria-panel-v*.tar.gz 2>/dev/null || true
    
    # Download latest version
    if ! wget -O terraria-panel-latest.tar.gz "$DOWNLOAD_URL"; then
        log_error "下载失败，请检查网络连接"
        return 1
    fi
    
    log_info "正在解压文件..."
    if ! tar -xzf terraria-panel-latest.tar.gz; then
        log_error "解压失败"
        return 1
    fi
    
    # Find extracted directory
    local extracted_dir=$(find . -maxdepth 1 -name "terraria-panel-*" -type d | head -1)
    if [[ -z "$extracted_dir" ]]; then
        log_error "找不到解压后的目录"
        return 1
    fi
    
    # Rename to standard name
    if [[ "$extracted_dir" != "./terraria-panel-linux" ]]; then
        mv "$extracted_dir" terraria-panel-linux
    fi
    
    # Make binary executable
    chmod +x terraria-panel-linux/$BINARY_NAME
    
    log_success "文件下载和解压完成"
    return 0
}

# Start service in background
start_service() {
    log_info "正在启动服务..."
    
    if is_running; then
        log_warning "服务已在运行中"
        return 0
    fi
    
    # Check if binary exists
    if [[ ! -f "terraria-panel-linux/$BINARY_NAME" ]]; then
        log_error "找不到程序文件，请先下载"
        return 1
    fi
    
    # Start service in background with nohup
    cd terraria-panel-linux
    nohup ./$BINARY_NAME > ../$LOG_FILE 2>&1 &
    cd ..
    
    # Wait a moment and check if service started successfully
    sleep 3
    
    if is_running; then
        local server_ip=$(curl -s ifconfig.me 2>/dev/null || echo "localhost")
        log_success "服务启动成功！"
        echo -e "${CYAN}访问地址: http://$server_ip:$DEFAULT_PORT${NC}"
        echo -e "${CYAN}仪表盘: http://$server_ip:$DEFAULT_PORT/#/dashboard/overview${NC}"
        return 0
    else
        log_error "服务启动失败，请查看日志"
        return 1
    fi
}

# Perfect start - download, stop, start
perfect_start() {
    log_info "🚀 开始完美启动流程..."
    
    # Stop existing service
    stop_service
    
    # Download latest version
    if ! download_and_extract; then
        log_error "下载失败，启动中止"
        return 1
    fi
    
    # Start service
    if start_service; then
        log_success "🎉 完美启动完成！"
        echo ""
        echo -e "${YELLOW}重要提示：${NC}"
        echo -e "${YELLOW}1. 如果页面显示空白，请清除浏览器缓存 (Ctrl+Shift+Delete)${NC}"
        echo -e "${YELLOW}2. 或者使用硬刷新 (Ctrl+F5)${NC}"
        echo -e "${YELLOW}3. 服务已在后台运行，SSH断开后仍会继续运行${NC}"
        return 0
    else
        log_error "启动失败"
        return 1
    fi
}

# Smart update
smart_update() {
    log_info "🔄 开始智能更新..."
    
    if is_running; then
        log_info "检测到服务运行中，将进行热更新"
        stop_service
    fi
    
    download_and_extract
    start_service
    
    log_success "🎉 智能更新完成！"
}

# Force update
force_update() {
    log_info "💪 开始强制更新..."
    
    # Force stop all processes
    pkill -9 -f "$BINARY_NAME" 2>/dev/null || true
    
    # Clean all files
    rm -rf terraria-panel-* *.tar.gz *.log 2>/dev/null || true
    
    # Download and start
    download_and_extract
    start_service
    
    log_success "🎉 强制更新完成！"
}

# Show service status
show_status() {
    echo ""
    echo -e "${BLUE}📊 服务状态信息:${NC}"
    echo "   服务名称: $SERVICE_NAME"
    echo "   监听端口: $DEFAULT_PORT"
    echo -e "   运行状态: $(get_status)"
    
    if is_running; then
        local server_ip=$(curl -s ifconfig.me 2>/dev/null || echo "localhost")
        echo -e "   访问地址: ${CYAN}http://$server_ip:$DEFAULT_PORT${NC}"
        echo -e "   仪表盘: ${CYAN}http://$server_ip:$DEFAULT_PORT/#/dashboard/overview${NC}"
    fi
    
    if [[ -f "$LOG_FILE" ]]; then
        local log_size=$(du -h "$LOG_FILE" 2>/dev/null | cut -f1 || echo "0")
        echo "   日志文件: $LOG_FILE ($log_size)"
    fi
    echo ""
}

# View logs
view_logs() {
    if [[ -f "$LOG_FILE" ]]; then
        echo -e "${BLUE}📋 最近50行日志:${NC}"
        echo "————————————————————————————————————————————————————————————"
        tail -n 50 "$LOG_FILE"
        echo "————————————————————————————————————————————————————————————"
    else
        log_warning "日志文件不存在"
    fi
}

# Update script
update_script() {
    log_info "正在更新启动脚本..."
    
    local script_url="https://raw.githubusercontent.com/ShourGG/tailamianban/main/run.sh"
    local backup_file="run.sh.backup.$(date +%Y%m%d_%H%M%S)"
    
    # Backup current script
    cp "$0" "$backup_file"
    
    # Download new script
    if wget -O run.sh.new "$script_url"; then
        chmod +x run.sh.new
        mv run.sh.new run.sh
        log_success "脚本更新完成，备份文件: $backup_file"
        log_info "请重新运行脚本: ./run.sh"
        exit 0
    else
        log_error "脚本更新失败"
        return 1
    fi
}

# Main menu loop
main() {
    while true; do
        print_banner
        show_status
        print_menu
        
        echo -n -e "${YELLOW}请选择操作 [0-9]: ${NC}"
        read -r choice
        
        case $choice in
            0)
                perfect_start
                ;;
            1)
                start_service
                ;;
            2)
                stop_service
                ;;
            3)
                stop_service && start_service
                ;;
            4)
                smart_update
                ;;
            5)
                force_update
                ;;
            6)
                update_script
                ;;
            7)
                show_status
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
        echo -n -e "${YELLOW}按回车键继续...${NC}"
        read -r
    done
}

# Run main function
main
