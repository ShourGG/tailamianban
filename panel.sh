#!/bin/bash

###########################################
# 泰拉瑞亚面板一键管理脚本
# Terraria Panel One-Click Management Script
# Version: 1.0
###########################################

# GitHub 仓库信息
GITHUB_REPO="ShourGG/tailamianban"
INSTALL_DIR="/opt/terraria-panel"
SERVICE_NAME="terraria-panel"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# 打印函数
print_info() { echo -e "${CYAN}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 打印横幅
print_banner() {
    clear
    echo -e "${CYAN}"
    echo "╔════════════════════════════════════════════════╗"
    echo "║       泰拉瑞亚服务器管理面板                   ║"
    echo "║    Terraria Server Management Panel           ║"
    echo "║                  Version 1.1.2                 ║"
    echo "╚════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# 检测系统架构
detect_arch() {
    local arch=$(uname -m)
    case $arch in
        x86_64) echo "amd64" ;;
        aarch64|arm64) echo "arm64" ;;
        *) print_error "不支持的架构: $arch"; exit 1 ;;
    esac
}

# 获取最新版本
get_latest_version() {
    local version=$(curl -s "https://api.github.com/repos/${GITHUB_REPO}/releases/latest" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
    echo "$version"
}

# 检查面板是否已安装
check_installed() {
    [ -d "$INSTALL_DIR" ] && [ -f "$INSTALL_DIR/terraria-panel" ]
}

# 检查面板运行状态
check_running() {
    systemctl is-active --quiet "$SERVICE_NAME" 2>/dev/null || pgrep -f "terraria-panel" > /dev/null
}

# 下载并安装面板
install_panel() {
    print_banner
    echo -e "${GREEN}开始安装泰拉瑞亚面板...${NC}\n"
    
    if check_installed; then
        print_warning "检测到面板已安装"
        read -p "是否覆盖安装? (y/N): " -n 1 -r
        echo
        [[ ! $REPLY =~ ^[Yy]$ ]] && return
        stop_panel
    fi
    
    local arch=$(detect_arch)
    print_info "系统架构: $arch"
    
    print_info "获取最新版本..."
    local version=$(get_latest_version)
    [ -z "$version" ] && { print_error "无法获取版本信息"; read -p "按回车返回..."; return; }
    print_success "最新版本: $version"
    
    local download_url="https://github.com/${GITHUB_REPO}/releases/download/${version}/terraria-panel-linux-${arch}.tar.gz"
    local temp_file="/tmp/terraria-panel.tar.gz"
    
    print_info "下载中..."
    curl -L -# -o "$temp_file" "$download_url" || { print_error "下载失败"; read -p "按回车返回..."; return; }
    
    print_info "安装中..."
    mkdir -p "$INSTALL_DIR"
    tar -xzf "$temp_file" -C "$INSTALL_DIR" --strip-components=1
    chmod +x "$INSTALL_DIR/terraria-panel"
    mkdir -p "$INSTALL_DIR"/{data,logs,worlds}
    
    print_info "创建系统服务..."
    cat > /etc/systemd/system/${SERVICE_NAME}.service << EOF
[Unit]
Description=Terraria Server Management Panel
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=${INSTALL_DIR}
ExecStart=${INSTALL_DIR}/terraria-panel
Restart=on-failure
RestartSec=10
StandardOutput=append:${INSTALL_DIR}/logs/panel.log
StandardError=append:${INSTALL_DIR}/logs/panel_error.log

[Install]
WantedBy=multi-user.target
EOF
    
    systemctl daemon-reload
    systemctl enable ${SERVICE_NAME}
    rm -f "$temp_file"
    
    print_success "安装完成!"
    echo ""
    print_info "访问地址: http://您的IP:8080"
    print_info "默认账号: admin / admin123"
    print_warning "请立即修改密码!"
    echo ""
    
    read -p "立即启动? (Y/n): " -n 1 -r
    echo
    [[ ! $REPLY =~ ^[Nn]$ ]] && start_panel
    read -p "按回车返回..."
}

# 更新面板
update_panel() {
    print_banner
    echo -e "${GREEN}更新面板...${NC}\n"
    
    if ! check_installed; then
        print_error "未检测到已安装的面板"
        read -p "按回车返回..."
        return
    fi
    
    local current=$($INSTALL_DIR/terraria-panel --version 2>/dev/null | head -1 || echo "未知")
    print_info "当前版本: $current"
    
    local latest=$(get_latest_version)
    [ -z "$latest" ] && { print_error "无法获取版本信息"; read -p "按回车返回..."; return; }
    print_info "最新版本: $latest"
    
    if [ "$current" = "$latest" ]; then
        print_success "已是最新版本!"
        read -p "按回车返回..."
        return
    fi
    
    print_warning "发现新版本!"
    read -p "继续更新? (Y/n): " -n 1 -r
    echo
    [[ $REPLY =~ ^[Nn]$ ]] && return
    
    print_info "停止服务..."
    stop_panel
    
    if [ -d "$INSTALL_DIR/data" ]; then
        print_info "备份数据..."
        cp -r "$INSTALL_DIR/data" "$INSTALL_DIR/data.bak.$(date +%s)"
    fi
    
    local arch=$(detect_arch)
    local url="https://github.com/${GITHUB_REPO}/releases/download/${latest}/terraria-panel-linux-${arch}.tar.gz"
    local temp="/tmp/terraria-panel-update.tar.gz"
    
    print_info "下载新版本..."
    curl -L -# -o "$temp" "$url" || { print_error "下载失败"; read -p "按回车返回..."; return; }
    
    print_info "更新中..."
    tar -xzf "$temp" -C "$INSTALL_DIR" --strip-components=1
    chmod +x "$INSTALL_DIR/terraria-panel"
    rm -f "$temp"
    
    print_success "更新完成!"
    read -p "立即启动? (Y/n): " -n 1 -r
    echo
    [[ ! $REPLY =~ ^[Nn]$ ]] && start_panel
    read -p "按回车返回..."
}

# 启动面板
start_panel() {
    print_info "启动面板..."
    if check_running; then
        print_warning "面板已在运行"
        return
    fi
    
    if systemctl start ${SERVICE_NAME} 2>/dev/null; then
        sleep 2
        check_running && print_success "启动成功! 访问 http://您的IP:8080" || print_error "启动失败"
    else
        print_error "启动失败"
    fi
}

# 停止面板
stop_panel() {
    print_info "停止面板..."
    if ! check_running; then
        print_warning "面板未运行"
        return
    fi
    systemctl stop ${SERVICE_NAME} 2>/dev/null || pkill -f "terraria-panel"
    print_success "已停止"
}

# 重启面板
restart_panel() {
    print_banner
    echo -e "${GREEN}重启面板...${NC}\n"
    stop_panel
    sleep 2
    start_panel
    read -p "按回车返回..."
}

# 查看状态
view_status() {
    print_banner
    echo -e "${GREEN}面板状态${NC}\n"
    
    if check_installed; then
        print_success "安装状态: 已安装 ($INSTALL_DIR)"
        local ver=$($INSTALL_DIR/terraria-panel --version 2>/dev/null | head -1 || echo "未知")
        print_info "当前版本: $ver"
    else
        print_warning "安装状态: 未安装"
    fi
    
    echo ""
    
    if check_running; then
        print_success "运行状态: 运行中"
        local pid=$(pgrep -f "terraria-panel" | head -1)
        [ -n "$pid" ] && print_info "进程 PID: $pid"
        print_info "访问地址: http://您的IP:8080"
    else
        print_warning "运行状态: 未运行"
    fi
    
    echo ""
    print_info "系统架构: $(detect_arch)"
    print_info "CPU 核心: $(nproc)"
    echo ""
    read -p "按回车返回..."
}

# 查看日志
view_logs() {
    print_banner
    if ! check_installed; then
        print_error "面板未安装"
        read -p "按回车返回..."
        return
    fi
    
    local log="$INSTALL_DIR/logs/panel.log"
    [ ! -f "$log" ] && { print_warning "日志文件不存在"; read -p "按回车返回..."; return; }
    
    echo -e "${GREEN}实时日志 (Ctrl+C 退出)${NC}\n"
    tail -f "$log"
}

# 卸载面板
uninstall_panel() {
    print_banner
    echo -e "${RED}卸载面板${NC}\n"
    
    if ! check_installed; then
        print_warning "面板未安装"
        read -p "按回车返回..."
        return
    fi
    
    print_warning "此操作将删除所有数据!"
    read -p "确认卸载? 输入 yes 继续: " -r
    [ "$REPLY" != "yes" ] && return
    
    stop_panel
    systemctl disable ${SERVICE_NAME} 2>/dev/null
    rm -f /etc/systemd/system/${SERVICE_NAME}.service
    systemctl daemon-reload
    
    read -p "备份数据? (Y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        local backup="/tmp/terraria-backup-$(date +%s).tar.gz"
        tar -czf "$backup" -C "$INSTALL_DIR" data worlds 2>/dev/null
        print_success "备份到: $backup"
    fi
    
    rm -rf "$INSTALL_DIR"
    print_success "卸载完成"
    read -p "按回车返回..."
}

# 设置虚拟内存
setup_swap() {
    print_banner
    echo -e "${GREEN}设置虚拟内存 (Swap)${NC}\n"
    
    # 检查现有 swap
    local existing_swap=$(swapon --show 2>/dev/null | grep -v "^NAME" | wc -l)
    if [ "$existing_swap" -gt 0 ]; then
        print_warning "检测到已配置的虚拟内存:"
        swapon --show
        echo ""
        read -p "是否重新配置? (y/N): " -n 1 -r
        echo
        [[ ! $REPLY =~ ^[Yy]$ ]] && return
        
        print_info "移除现有虚拟内存..."
        swapoff -a
        sed -i '/swap/d' /etc/fstab
        rm -f /swapfile
    fi
    
    # 显示当前内存信息
    local total_mem=$(free -h | awk '/^Mem:/ {print $2}')
    print_info "当前物理内存: $total_mem"
    
    echo ""
    echo "推荐虚拟内存大小:"
    echo "  1. 1GB  (适合 512MB-1GB 内存)"
    echo "  2. 2GB  (适合 1GB-2GB 内存，推荐)"
    echo "  3. 4GB  (适合 2GB-4GB 内存)"
    echo "  4. 8GB  (适合 4GB+ 内存)"
    echo "  5. 自定义大小"
    echo "  0. 取消"
    echo ""
    read -p "请选择 [0-5]: " swap_choice
    
    local swap_size=""
    case $swap_choice in
        1) swap_size="1G" ;;
        2) swap_size="2G" ;;
        3) swap_size="4G" ;;
        4) swap_size="8G" ;;
        5)
            read -p "请输入大小 (例如: 2G, 4096M): " swap_size
            [[ ! $swap_size =~ ^[0-9]+[MG]$ ]] && { print_error "无效格式"; read -p "按回车返回..."; return; }
            ;;
        0) return ;;
        *) print_error "无效选项"; read -p "按回车返回..."; return ;;
    esac
    
    print_info "创建 ${swap_size} 虚拟内存文件..."
    
    # 创建 swap 文件
    dd if=/dev/zero of=/swapfile bs=1M count=$(echo $swap_size | sed 's/G/*1024/;s/M//' | bc) status=progress 2>&1 | grep --line-buffered -o '[0-9]* bytes' | tail -1
    
    if [ ! -f /swapfile ]; then
        print_error "创建失败"
        read -p "按回车返回..."
        return
    fi
    
    print_info "设置权限..."
    chmod 600 /swapfile
    
    print_info "格式化为 swap..."
    mkswap /swapfile >/dev/null 2>&1
    
    print_info "启用虚拟内存..."
    swapon /swapfile
    
    print_info "设置开机自动挂载..."
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    
    # 优化 swap 使用策略
    print_info "优化虚拟内存参数..."
    sysctl vm.swappiness=10 >/dev/null 2>&1
    sysctl vm.vfs_cache_pressure=50 >/dev/null 2>&1
    
    # 永久保存配置
    grep -q "vm.swappiness" /etc/sysctl.conf || echo "vm.swappiness=10" >> /etc/sysctl.conf
    grep -q "vm.vfs_cache_pressure" /etc/sysctl.conf || echo "vm.vfs_cache_pressure=50" >> /etc/sysctl.conf
    
    echo ""
    print_success "虚拟内存配置完成!"
    echo ""
    print_info "当前内存状态:"
    free -h
    echo ""
    print_info "虚拟内存详情:"
    swapon --show
    echo ""
    read -p "按回车返回..."
}

# 主菜单
show_menu() {
    print_banner
    
    if check_installed; then
        check_running && echo -e "${GREEN}● 状态: 运行中${NC}" || echo -e "${YELLOW}● 状态: 已安装未运行${NC}"
    else
        echo -e "${RED}● 状态: 未安装${NC}"
    fi
    
    echo ""
    echo "请选择操作:"
    echo ""
    echo "  1. 下载并安装面板"
    echo "  2. 更新面板"
    echo "  3. 启动面板"
    echo "  4. 停止面板"
    echo "  5. 重启面板"
    echo "  6. 查看状态"
    echo "  7. 查看日志"
    echo "  8. 设置虚拟内存"
    echo "  9. 卸载面板"
    echo "  0. 退出"
    echo ""
    read -p "请输入 [0-9]: " choice
    
    case $choice in
        1) install_panel ;;
        2) update_panel ;;
        3) print_banner; start_panel; read -p "按回车返回..." ;;
        4) print_banner; stop_panel; read -p "按回车返回..." ;;
        5) restart_panel ;;
        6) view_status ;;
        7) view_logs ;;
        8) setup_swap ;;
        9) uninstall_panel ;;
        0) print_info "再见!"; exit 0 ;;
        *) print_error "无效选项"; sleep 1 ;;
    esac
}

# 检查root权限
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "请使用 root 权限运行"
        print_info "命令: sudo bash $0"
        exit 1
    fi
}

# 主函数
main() {
    check_root
    while true; do
        show_menu
    done
}

main