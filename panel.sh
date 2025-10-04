#!/bin/bash

# =============================================================================
# Terraria 服务器管理面板 - 安装/管理脚本
# 
# 版本: v3.1
# 更新日期: 2025-01-04
# 描述: 用于安装、更新、管理泰拉瑞亚服务器面板的一键脚本
# 
# 使用方法:
#   sudo bash panel.sh
# 
# 功能:
#   - 自动安装面板
#   - 启动/停止/重启服务
#   - 查看日志
#   - 卸载面板
# =============================================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# GitHub 加速镜像列表 (优先级从高到低,针对国内网络优化)
GITHUB_MIRRORS=(
    "https://github.akams.cn/"           # AKAMS 公益镜像 (首选)
    "https://gh-proxy.com/"              # 公共代理服务
    "https://gh.llkk.cc/"                # LLKK 加速镜像
    ""                                    # 直连 GitHub (最后备选)
)

# 配置
GITHUB_REPO="ShourGG/tailamianban"
INSTALL_DIR="/opt/terraria-panel"
SERVICE_NAME="terraria-panel"
DATA_DIR="/opt/terraria-panel/data"
CONFIG_FILE="/opt/terraria-panel/data/config.json"

# 打印带颜色的消息
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# 打印 Banner
print_banner() {
    cat << "EOF"
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║      ████████╗███████╗██████╗ ██████╗  █████╗           ║
║      ╚══██╔══╝██╔════╝██╔══██╗██╔══██╗██╔══██╗          ║
║         ██║   █████╗  ██████╔╝██████╔╝███████║          ║
║         ██║   ██╔══╝  ██╔══██╗██╔══██╗██╔══██║          ║
║         ██║   ███████╗██║  ██║██║  ██║██║  ██║          ║
║         ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝          ║
║                                                          ║
║          🎮 泰拉瑞亚服务器管理面板                     ║
║             Terraria Server Panel                     ║
║                                                          ║
║               管理脚本 v3.1                          ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
EOF
}

# 获取面板端口 (从配置文件动态读取)
get_panel_port() {
    if [ -f "$CONFIG_FILE" ]; then
        local port=$(grep -o '"port"[[:space:]]*:[[:space:]]*[0-9]*' "$CONFIG_FILE" | grep -o '[0-9]*' | head -1)
        if [ -n "$port" ]; then
            echo "$port"
            return 0
        fi
    fi
    # 默认端口
    echo "8080"
}

# 测试并选择最快的代码仓库源
get_repo_source() {
    local mirror_count=${#GITHUB_MIRRORS[@]}
    local mirror_index=0
    
    for mirror in "${GITHUB_MIRRORS[@]}"; do
        mirror_index=$((mirror_index + 1))
        local test_url="${mirror}https://api.github.com/repos/${GITHUB_REPO}"
        local mirror_name="${mirror:-GitHub直连}"
        
        # 显示测试进度(仅在交互模式下)
        if [ -t 1 ]; then
            echo -ne "\r${BLUE}ℹ${NC} 测试镜像 ${mirror_index}/${mirror_count}: ${mirror_name:0:40}..." >&2
        fi
        
        # 使用更短的超时时间以实现快速失败 (1秒连接+2秒总计)
        if curl -s --connect-timeout 1 --max-time 2 "$test_url" >/dev/null 2>&1; then
            # 清除进度行
            if [ -t 1 ]; then
                echo -ne "\r\033[K" >&2
            fi
            echo "github_mirror|${mirror}"
            return 0
        fi
    done
    
    # 清除进度行
    if [ -t 1 ]; then
        echo -ne "\r\033[K" >&2
    fi
    
    # 无可用源
    echo ""
    return 1
}

# 获取脚本更新 URL
get_script_url() {
    local source=$(get_repo_source)
    [ $? -ne 0 ] && return 1
    
    local source_type="${source%%|*}"
    local mirror="${source#*|}"
    
    case $source_type in
        "github_mirror")
            echo "${mirror}https://raw.githubusercontent.com/${GITHUB_REPO}/main/panel.sh"
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

# 获取下载 URL
get_download_url() {
    local version=$1
    local arch=$2
    local source=$(get_repo_source)
    [ $? -ne 0 ] && return 1
    
    local source_type="${source%%|*}"
    local mirror="${source#*|}"
    
    case $source_type in
        "github_mirror")
            echo "${mirror}https://github.com/${GITHUB_REPO}/releases/download/${version}/terraria-panel-linux-${arch}.tar.gz"
            return 0
            ;;
        *)
            echo "https://github.com/${GITHUB_REPO}/releases/download/${version}/terraria-panel-linux-${arch}.tar.gz"
            return 0
            ;;
    esac
}

# 检测系统架构
detect_arch() {
    local arch=$(uname -m)
    case $arch in
        x86_64)
            echo "amd64"
            ;;
        aarch64)
            echo "arm64"
            ;;
        armv7l)
            echo "armv7"
            ;;
        *)
            print_error "不支持的架构: $arch"
            exit 1
            ;;
    esac
}

# 检查必要的工具
check_requirements() {
    local missing_tools=()
    
    for tool in curl tar systemctl file; do
        if ! command -v $tool &> /dev/null; then
            missing_tools+=($tool)
        fi
    done
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        print_error "缺少必要工具: ${missing_tools[*]}"
        print_info "请先安装: apt install ${missing_tools[*]} 或 yum install ${missing_tools[*]}"
        exit 1
    fi
}

# 获取最新版本号
get_latest_version() {
    local api_url="https://api.github.com/repos/${GITHUB_REPO}/releases/latest"
    
    # 直接从 GitHub API 获取版本信息
    local version=$(curl -s --connect-timeout 5 --max-time 10 "$api_url" 2>/dev/null | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/' | head -1)
    
    if [ -z "$version" ]; then
        print_error "无法获取版本信息,请检查网络或仓库是否已发布 releases" >&2
        return 1
    fi
    
    echo "$version"
    return 0
}

# 获取本地版本 (通过 API)
get_local_version() {
    if ! check_running; then
        echo "未运行"
        return 0
    fi
    
    # 动态获取端口
    local port=$(get_panel_port)
    
    # 尝试从 API 获取版本
    local version=$(curl -s --connect-timeout 2 http://localhost:${port}/api/version 2>/dev/null | grep -o '"version":"[^"]*"' | cut -d'"' -f4)
    
    # 如果 API 失败，尝试命令行
    if [ -z "$version" ] && [ -f "$INSTALL_DIR/terraria-panel" ]; then
        version=$($INSTALL_DIR/terraria-panel --version 2>/dev/null | head -1 || echo "未知")
    fi
    
    # 标准化版本号格式，支持 vX.Y.Z 或 vX.Y.Z.W 格式
    version=$(echo "$version" | grep -oP 'v\d+(\.\d+)+' || echo "$version")
    
    echo "${version:-未知}"
    return 0
}

# 比较版本号 (返回: 0=相等, 1=v1>v2, 2=v1<v2)
compare_versions() {
    local v1=$1
    local v2=$2
    
    # 移除 'v' 前缀
    v1=${v1#v}
    v2=${v2#v}
    
    # 处理特殊情况
    [ "$v1" = "$v2" ] && return 0
    [ "$v1" = "未知" ] && return 2
    [ "$v2" = "未知" ] && return 1
    
    # 分割版本号
    IFS='.' read -ra ver1 <<< "$v1"
    IFS='.' read -ra ver2 <<< "$v2"
    
    # 逐段比较
    local max_len=$((${#ver1[@]} > ${#ver2[@]} ? ${#ver1[@]} : ${#ver2[@]}))
    for ((i=0; i<max_len; i++)); do
        local num1=${ver1[i]:-0}
        local num2=${ver2[i]:-0}
        
        if [ "$num1" -gt "$num2" ]; then
            return 1
        elif [ "$num1" -lt "$num2" ]; then
            return 2
        fi
    done
    
    return 0
}

# 检查面板是否已安装
check_installed() {
    [ -d "$INSTALL_DIR" ] && [ -f "$INSTALL_DIR/terraria-panel" ]
}

# 检查面板运行状态
check_running() {
    systemctl is-active --quiet "$SERVICE_NAME" 2>/dev/null || pgrep -f "terraria-panel" > /dev/null 2>&1
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
        stop_panel silent
    fi
    
    local arch=$(detect_arch)
    print_info "系统架构: $arch"
    
    # 测试并选择最快的镜像源
    local source=$(get_repo_source)
    if [ $? -ne 0 ]; then
        print_error "无法连接到任何 GitHub 镜像源"
        print_info "解决方案:"
        echo "  1. 检查网络连接"
        echo "  2. 配置代理或 VPN"
        echo "  3. 稍后重试"
        echo "  4. 手动下载: https://github.com/${GITHUB_REPO}/releases"
        read -p "按回车返回..."
        return 1
    fi
    
    local mirror="${source#*|}"
    print_info "使用 GitHub 加速镜像"
    [ -n "$mirror" ] && print_info "镜像地址: ${mirror:-GitHub直连}"
    
    print_info "获取最新版本..."
    local version=$(get_latest_version)
    if [ $? -ne 0 ] || [ -z "$version" ]; then
        print_error "无法获取版本信息"
        read -p "按回车返回..."
        return 1
    fi
    print_success "最新版本: $version"
    
    local download_url=$(get_download_url "$version" "$arch")
    if [ $? -ne 0 ] || [ -z "$download_url" ]; then
        print_error "无法获取下载链接"
        read -p "按回车返回..."
        return 1
    fi
    
    local temp_file="/tmp/terraria-panel.tar.gz"
    
    print_info "下载中..."
    print_info "URL: $download_url"
    
    if ! curl -L -# --connect-timeout 10 --max-time 300 -o "$temp_file" "$download_url"; then
        print_error "下载失败"
        read -p "按回车返回..."
        return 1
    fi
    
    # 验证下载的文件
    print_info "验证文件..."
    if [ ! -f "$temp_file" ] || [ ! -s "$temp_file" ]; then
        print_error "下载的文件无效"
        rm -f "$temp_file"
        read -p "按回车返回..."
        return 1
    fi
    
    # 检查文件类型
    if ! file "$temp_file" | grep -q "gzip compressed"; then
        print_warning "镜像下载的文件格式错误，尝试直连 GitHub..."
        rm -f "$temp_file"
        
        local direct_url="https://github.com/${GITHUB_REPO}/releases/download/${version}/terraria-panel-linux-${arch}.tar.gz"
        print_info "直连下载: $direct_url"
        
        if ! curl -L -# --connect-timeout 10 --max-time
 300 -o "$temp_file" "$direct_url"; then
            print_error "直连下载也失败"
            rm -f "$temp_file"
            read -p "按回车返回..."
            return 1
        fi
        
        # 再次验证文件
        if ! file "$temp_file" | grep -q "gzip compressed"; then
            print_error "下载的文件格式错误,可能是网络问题"
            rm -f "$temp_file"
            read -p "按回车返回..."
            return 1
        fi
    fi
    
    print_success "文件下载成功"
    
    # 停止旧服务
    if check_running; then
        print_info "停止旧版本..."
        stop_panel silent
    fi
    
    # 备份旧版本
    if [ -d "$INSTALL_DIR" ]; then
        print_info "备份旧版本..."
        mv "$INSTALL_DIR" "${INSTALL_DIR}.bak.$(date +%Y%m%d%H%M%S)"
    fi
    
    # 创建安装目录
    print_info "创建安装目录..."
    mkdir -p "$INSTALL_DIR"
    
    # 解压文件
    print_info "解压文件..."
    if ! tar -xzf "$temp_file" -C "$INSTALL_DIR"; then
        print_error "解压失败"
        rm -f "$temp_file"
        read -p "按回车返回..."
        return 1
    fi
    
    # 清理临时文件
    rm -f "$temp_file"
    
    # 设置权限
    print_info "设置权限..."
    chmod +x "$INSTALL_DIR/terraria-panel" 2>/dev/null || true
    
    # 创建数据目录
    mkdir -p "$DATA_DIR"
    
    # 创建systemd服务
    print_info "配置系统服务..."
    cat > "/etc/systemd/system/${SERVICE_NAME}.service" << EOF
[Unit]
Description=Terraria Panel Server
After=network.target

[Service]
Type=simple
WorkingDirectory=$INSTALL_DIR
ExecStart=$INSTALL_DIR/terraria-panel
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
    
    systemctl daemon-reload
    systemctl enable "$SERVICE_NAME" >/dev/null 2>&1
    
    print_success "安装完成!"
    
    # Bug修复2: 安装后自动启动,不需要用户再次确认
    print_info "正在启动面板..."
    start_panel
    
    # Bug修复1: 动态读取端口
    local panel_port=$(get_panel_port)
    
    echo
    print_success "=========================================="
    print_success "泰拉瑞亚面板安装成功!"
    print_success "=========================================="
    echo
    print_info "访问地址: http://YOUR_SERVER_IP:${panel_port}"
    print_info "本地访问: http://localhost:${panel_port}"
    echo
    # Bug修复3: 不显示默认账户密码,首次访问会引导注册
    print_warning "首次访问将引导您创建管理员账户"
    echo
    print_info "管理命令:"
    echo "  启动: systemctl start $SERVICE_NAME"
    echo "  停止: systemctl stop $SERVICE_NAME"
    echo "  重启: systemctl restart $SERVICE_NAME"
    echo "  状态: systemctl status $SERVICE_NAME"
    echo "  日志: journalctl -u $SERVICE_NAME -f"
    echo
}

# 启动面板
start_panel() {
    local mode=${1:-normal}
    
    if [ "$mode" != "silent" ]; then
        print_info "启动面板..."
    fi
    
    if check_running; then
        if [ "$mode" != "silent" ]; then
            print_warning "面板已在运行中"
        fi
        return 0
    fi
    
    if ! check_installed; then
        print_error "面板未安装"
        read -p "按回车返回..."
        return 1
    fi
    
    systemctl start "$SERVICE_NAME"
    sleep 2
    
    if check_running; then
        if [ "$mode" != "silent" ]; then
            local panel_port=$(get_panel_port)
            print_success "面板启动成功"
            print_info "访问地址: http://localhost:${panel_port}"
            read -p "按回车返回..."
        fi
    else
        print_error "启动失败"
        print_info "查看日志: journalctl -u $SERVICE_NAME -n 50"
        read -p "按回车返回..."
        return 1
    fi
}

# 停止面板
stop_panel() {
    local mode=${1:-normal}
    
    if [ "$mode" != "silent" ]; then
        print_info "停止面板..."
    fi
    
    if ! check_running; then
        if [ "$mode" != "silent" ]; then
            print_warning "面板未运行"
        fi
        return 0
    fi
    
    systemctl stop "$SERVICE_NAME"
    sleep 2
    
    if ! check_running; then
        if [ "$mode" != "silent" ]; then
            print_success "面板已停止"
            read -p "按回车返回..."
        fi
    else
        print_error "停止失败"
        read -p "按回车返回..."
        return 1
    fi
}

# 重启面板
restart_panel() {
    print_info "重启面板..."
    
    stop_panel silent
    sleep 1
    start_panel silent
    
    if check_running; then
        local panel_port=$(get_panel_port)
        print_success "面板重启成功"
        print_info "访问地址: http://localhost:${panel_port}"
    else
        print_error "重启失败"
    fi
    
    read -p "按回车返回..."
}

# 查看状态
show_status() {
    print_banner
    echo -e "${BLUE}面板状态信息${NC}\n"
    
    # 运行状态
    if check_running; then
        print_success "运行状态: 运行中"
    else
        print_error "运行状态: 已停止"
    fi
    
    # 版本信息
    local local_version=$(get_local_version)
    print_info "当前版本: $local_version"
    
    # 安装目录
    if check_installed; then
        print_info "安装目录: $INSTALL_DIR"
        local size=$(du -sh "$INSTALL_DIR" 2>/dev/null | cut -f1)
        print_info "占用空间: ${size:-未知}"
    else
        print_warning "面板未安装"
    fi
    
    # 端口信息
    local panel_port=$(get_panel_port)
    print_info "监听端口: $panel_port"
    
    # 检查更新
    print_info "检查更新中..."
    local latest_version=$(get_latest_version 2>/dev/null)
    if [ -n "$latest_version" ] && [ "$latest_version" != "未知" ]; then
        print_info "最新版本: $latest_version"
        
        if [ "$local_version" != "未运行" ] && [ "$local_version" != "未知" ]; then
            compare_versions "$local_version" "$latest_version"
            case $? in
                0)
                    print_success "已是最新版本"
                    ;;
                2)
                    print_warning "发现新版本,建议更新"
                    ;;
            esac
        fi
    else
        print_warning "无法检查更新"
    fi
    
    echo
    read -p "按回车返回..."
}

# 查看日志
show_logs() {
    print_info "显示最近50条日志 (Ctrl+C 退出)..."
    sleep 1
    journalctl -u "$SERVICE_NAME" -n 50 --no-pager
    echo
    read -p "按回车返回..."
}

# 更新面板
update_panel() {
    print_banner
    echo -e "${GREEN}检查更新...${NC}\n"
    
    if ! check_installed; then
        print_error "面板未安装,请先安装"
        read -p "按回车返回..."
        return 1
    fi
    
    local local_version=$(get_local_version)
    print_info "当前版本: $local_version"
    
    local latest_version=$(get_latest_version)
    if [ $? -ne 0 ]; then
        print_error "无法获取最新版本"
        read -p "按回车返回..."
        return 1
    fi
    
    print_info "最新版本: $latest_version"
    
    if [ "$local_version" != "未运行" ] && [ "$local_version" != "未知" ]; then
        compare_versions "$local_version" "$latest_version"
        case $? in
            0)
                print_success "已是最新版本,无需更新"
                read -p "按回车返回..."
                return 0
                ;;
            1)
                print_warning "本地版本高于远程版本"
                ;;
        esac
    fi
    
    echo
    read -p "确认更新到 $latest_version? (y/N): " -n 1 -r
    echo
    [[ ! $REPLY =~ ^[Yy]$ ]] && return
    
    install_panel
}

# 卸载面板
uninstall_panel() {
    print_banner
    echo -e "${RED}卸载泰拉瑞亚面板${NC}\n"
    
    if ! check_installed; then
        print_warning "面板未安装"
        read -p "按回车返回..."
        return 0
    fi
    
    print_warning "此操作将删除所有面板文件和数据!"
    read -p "确认卸载? (输入 yes 确认): " confirm
    
    if [ "$confirm" != "yes" ]; then
        print_info "已取消"
        read -p "按回车返回..."
        return 0
    fi
    
    print_info "停止服务..."
    systemctl stop "$SERVICE_NAME" 2>/dev/null || true
    systemctl disable "$SERVICE_NAME" 2>/dev/null || true
    
    print_info "删除服务文件..."
    rm -f "/etc/systemd/system/${SERVICE_NAME}.service"
    systemctl daemon-reload
    
    print_info "删除安装文件..."
    rm -rf "$INSTALL_DIR"
    
    print_success "卸载完成"
    read -p "按回车返回..."
}

# 更新脚本
update_script() {
    print_info "更新管理脚本..."
    
    local script_url=$(get_script_url)
    if [ $? -ne 0 ]; then
        print_error "无法获取更新源"
        return 1
    fi
    
    local temp_script="/tmp/panel.sh.new"
    
    if ! curl -sL --connect-timeout 10 --max-time 30 "$script_url" -o "$temp_script"; then
        print_error "下载脚本失败"
        rm -f "$temp_script"
        return 1
    fi
    
    # 验证脚本
    if [ ! -f "$temp_script" ] || [ ! -s "$temp_script" ]; then
        print_error "下载的脚本无效"
        rm -f "$temp_script"
        return 1
    fi
    
    # 备份当前脚本
    cp "$0" "$0.bak"
    
    # 替换脚本
    mv "$temp_script" "$0"
    chmod +x "$0"
    
    print_success "脚本更新成功"
    print_info "重启脚本中..."
    sleep 1
    exec "$0"
}

# 主菜单
show_menu() {
    clear
    print_banner
    echo
    
    # 显示状态
    if check_installed; then
        if check_running; then
            echo -e "${GREEN}● 面板状态: 运行中${NC}"
        else
            echo -e "${RED}● 面板状态: 已停止${NC}"
        fi
        
        local local_version=$(get_local_version)
        echo -e "${BLUE}● 当前版本: $local_version${NC}"
        
        local panel_port=$(get_panel_port)
        echo -e "${BLUE}● 访问端口: $panel_port${NC}"
    else
        echo -e "${YELLOW}● 面板状态: 未安装${NC}"
    fi
    
    echo
    echo -e "${BLUE}请选择操作:${NC}"
    echo
    echo "  1. 安装面板"
    echo "  2. 启动面板"
    echo "  3. 停止面板"
    echo "  4. 重启面板"
    echo "  5. 查看状态"
    echo "  6. 查看日志"
    echo "  7. 更新面板"
    echo "  8. 卸载面板"
    echo "  9. 更新脚本"
    echo "  0. 退出"
    echo
}

# 主函数
main() {
    # 检查root权限
    if [ $EUID -ne 0 ]; then
        print_error "此脚本需要root权限运行"
        echo "请使用: sudo bash $0"
        exit 1
    fi
    
    # 检查必要工具
    check_requirements
    
    # 主循环
    while true; do
        show_menu
        read -p "请输入选项 [0-9]: " choice
        echo
        
        case $choice in
            1)
                install_panel
                ;;
            2)
                start_panel
                ;;
            3)
                stop_panel
                ;;
            4)
                restart_panel
                ;;
            5)
                show_status
                ;;
            6)
                show_logs
                ;;
            7)
                update_panel
                ;;
            8)
                uninstall_panel
                ;;
            9)
                update_script
                ;;
            0)
                print_info "退出脚本"
                exit 0
                ;;
            *)
                print_error "无效选项"
                sleep 1
                ;;
        esac
    done
}

# 执行主函数
main "$@"