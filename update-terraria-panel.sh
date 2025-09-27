#!/bin/bash

# ===================================================================
# 🎮 Terraria Panel 一条龙更新脚本 - 老王出品
# 专门解决前端缓存和部署问题的完美解决方案！
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

print_banner() {
    clear
    echo ""
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║${CYAN}            🎮 TERRARIA PANEL 一条龙更新脚本                  ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${YELLOW}                   老王出品 - 完美解决方案                      ${PURPLE}║${NC}"
    echo -e "${PURPLE}║                                                              ║${NC}"
    echo -e "${PURPLE}║${GREEN}  🔄 自动更新 | 🚀 后台运行 | 🛡️ 缓存清理                    ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${GREEN}  📦 完整部署 | 💯 生产级别 | 🎯 一键搞定                     ${PURPLE}║${NC}"
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

# Main update process
main() {
    print_banner
    
    log_info "🎮 开始 Terraria Panel 一条龙更新..."
    echo ""
    
    # Step 1: Stop old services
    log_info "⏹️  停止旧服务..."
    pkill -f terraria-panel 2>/dev/null || echo "   没有运行的服务"
    sleep 2
    
    # Step 2: Clean old files
    log_info "🗑️  清理旧文件..."
    rm -rf terraria-panel* *.log run.sh 2>/dev/null || echo "   清理完成"
    
    # Step 3: Download latest management script
    log_info "📥 下载最新管理脚本..."
    if wget -O run.sh "https://raw.githubusercontent.com/ShourGG/tailamianban/main/run-new.sh"; then
        chmod +x run.sh
        log_success "管理脚本下载完成"
    else
        log_error "管理脚本下载失败"
        exit 1
    fi
    
    # Step 4: Download latest program package
    log_info "📦 下载最新程序包..."
    if wget -O terraria-panel-linux.tar.gz "https://raw.githubusercontent.com/ShourGG/tailamianban/main/release/terraria-panel-v1.0.0-linux-amd64.tar.gz"; then
        log_success "程序包下载完成"
    else
        log_error "程序包下载失败"
        exit 1
    fi
    
    # Step 5: Extract program package
    log_info "📂 解压程序包..."
    if tar -xzf terraria-panel-linux.tar.gz; then
        # Find extracted directory and rename if needed
        extracted_dir=$(find . -maxdepth 1 -name "terraria-panel-*" -type d | head -1)
        if [[ -n "$extracted_dir" && "$extracted_dir" != "./terraria-panel-linux" ]]; then
            mv "$extracted_dir" terraria-panel-linux
        fi
        chmod +x terraria-panel-linux/terraria-panel
        log_success "程序包解压完成"
    else
        log_error "程序包解压失败"
        exit 1
    fi
    
    # Step 6: Start service in background
    log_info "🚀 启动 Terraria Panel..."
    cd terraria-panel-linux/
    nohup ./terraria-panel > ../terraria-panel.log 2>&1 &
    cd ..
    
    # Wait and check if service started
    sleep 5
    
    if pgrep -f terraria-panel > /dev/null; then
        local server_ip=$(curl -s ifconfig.me 2>/dev/null || echo "localhost")
        log_success "✅ 一条龙更新完成！"
        echo ""
        echo -e "${CYAN}🌐 访问地址: http://$server_ip:8080${NC}"
        echo -e "${CYAN}📊 仪表盘: http://$server_ip:8080/#/dashboard/overview${NC}"
        echo ""
        echo -e "${YELLOW}重要提示：${NC}"
        echo -e "${YELLOW}1. 如果页面显示空白，请清除浏览器缓存 (Ctrl+Shift+Delete)${NC}"
        echo -e "${YELLOW}2. 或者使用硬刷新 (Ctrl+F5)${NC}"
        echo -e "${YELLOW}3. 服务已在后台运行，SSH断开后仍会继续运行${NC}"
        echo -e "${YELLOW}4. 使用 ./run.sh 可以进入管理菜单${NC}"
        echo ""
        
        # Show service status
        local pid=$(pgrep -f terraria-panel)
        echo -e "${BLUE}📊 服务状态:${NC}"
        echo "   运行状态: ${GREEN}运行中${NC} (PID: $pid)"
        echo "   监听端口: 8080"
        echo "   日志文件: terraria-panel.log"
        echo ""
        
    else
        log_error "❌ 服务启动失败"
        echo ""
        echo -e "${YELLOW}请检查日志文件: terraria-panel.log${NC}"
        echo -e "${YELLOW}或者运行 ./run.sh 进入管理菜单${NC}"
        exit 1
    fi
    
    # Clean up
    rm -f terraria-panel-linux.tar.gz
    
    log_success "🎉 所有操作完成！享受你的 Terraria Panel 吧！"
}

# Run main function
main
