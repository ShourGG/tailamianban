#!/bin/bash

# =============================================================================
# Terraria 服务器管理面板 - 安装/管理脚本
# 
# 版本: v2.6
# 更新日期: 2024-01-22
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
    "https://ghproxy.com/"               # 主力加速器
    "https://mirror.ghproxy.com/"        # 备用镜像
    "https://ghproxy.net/"               # GHProxy 官方镜像
    "https://gh-proxy.com/"              # 公共代理服务
    "https://gh.api.99988866.xyz/"       # 公共加速服务
    "https://github.moeyy.xyz/"          # MoeYY 加速器
    "https://ghps.cc/"                   # GHPS 加速
    "https://gh.con.sh/"                 # CON.SH 镜像
    ""                                    # 直连 GitHub (最后备选)
)

# 配置
GITHUB_REPO="ShourGG/tailamianban"
INSTALL_DIR="/opt/terraria-panel"
SERVICE_NAME="terraria-panel"
DATA_DIR="/opt/terraria-panel/data"

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
║               管理脚本 v2.6                          ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
EOF
}

# 测试并选择最快的代码仓库源
get_repo_source() {
    # 直接使用 GitHub 镜像 (国内已优化)
    # 快速测试每个镜像的连通性
    local mirror_index=0
    for mirror in "${GITHUB_MIRRORS[@]}"; do
        mirror_index=$((mirror_index + 1))
        local test_url="${mirror}https://api.github.com/repos/${GITHUB_REPO}"
        local mirror_name="${mirror:-GitHub直连}"
        
        # 显示测试进度(仅在交互模式下)
        if [ -t 1 ]; then
            echo -ne "\r${BLUE}ℹ${NC} 测试镜像 ${mirror_index}/10: ${mirror_name:0:40}..." >&2
        fi
        
        # 使用更短的超时时间以实现快速失败 (1秒连接+2秒总计)
        if curl -s --connect-timeout 1 --max-time 2 "$test_url" >/dev/null 2>&1; then
            # 清除进度行
            if [ -t 1 ]; then
                echo -ne "\r\033[K" >&2
            fi
            echo "github_mirror|${mirror}"
            return
        fi
    done
    
    # 清除进度行
    if [ -t 1 ]; then
        echo -ne "\r\033[K" >&2
    fi
    
    # 无可用源
    echo ""
}

# 获取脚本更新 URL
get_script_url() {
    local source=$(get_repo_source)
    local source_type="${source%%|*}"
    local mirror="${source#*|}"
    
    case $source_type in
        "github_mirror")
            echo "${mirror}https://raw.githubusercontent.com/${GITHUB_REPO}/main/panel.sh"
            ;;
        *)
            echo ""
            ;;
    esac
}

# 获取下载 URL
get_download_url() {
    local version=$1
    local arch=$2
    
    # releases 文件必须直接从 GitHub 下载
    # 加速镜像不支持 releases 下载，只支持 raw 文件和 git clone
    echo "https://github.com/${GITHUB_REPO}/releases/download/${version}/terraria-panel-linux-${arch}.tar.gz"
}

# 获取 API URL
get_api_url() {
    local source=$(get_repo_source)
    local source_type="${source%%|*}"
    local mirror="${source#*|}"
    
    case $source_type in
        "github_mirror")
            echo "${mirror}https://api.github.com/repos/${GITHUB_REPO}/releases/latest"
            ;;
        *)
            echo ""
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
    # API 请求必须直连 GitHub,不能使用镜像(镜像只支持文件下载)
    local api_url="https://api.github.com/repos/${GITHUB_REPO}/releases/latest"
    
    # 直接从 GitHub API 获取版本信息
    local version=$(curl -s --connect-timeout 5 --max-time 10 "$api_url" 2>/dev/null | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/' | head -1)
    
    if [ -z "$version" ]; then
        print_error "无法获取版本信息,请检查网络或仓库是否已发布 releases" >&2
        return 1
    fi
    
    echo "$version"
}

# 获取本地版本 (通过 API)
get_local_version() {
    if ! check_running; then
        echo "未运行"
        return
    fi
    
    # 尝试从 API 获取版本
    local version=$(curl -s --connect-timeout 2 http://localhost:8080/api/version 2>/dev/null | grep -o '"version":"[^"]*"' | cut -d'"' -f4)
    
    # 如果 API 失败，尝试命令行
    if [ -z "$version" ] && [ -f "$INSTALL_DIR/terraria-panel" ]; then
        version=$($INSTALL_DIR/terraria-panel --version 2>/dev/null | head -1 || echo "未知")
    fi
    
    # 标准化版本号格式，支持 vX.Y.Z 或 vX.Y.Z.W 格式
    version=$(echo "$version" | grep -oP 'v\d+(\.\d+)+' || echo "$version")
    
    echo "${version:-未知}"
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
    if [ -z "$version" ]; then
        print_error "无法获取版本信息"
        read -p "按回车返回..."
        return
    fi
    print_success "最新版本: $version"
    
    local download_url=$(get_download_url "$version" "$arch")
    local temp_file="/tmp/terraria-panel.tar.gz"
    
    print_info "下载中..."
    print_info "从 GitHub 直接下载 releases..."
    print_info "URL: $download_url"
    
    # 使用更长的超时时间用于下载大文件
    # releases 必须直接从 GitHub 下载，不能使用加速镜像
    if ! curl -L -# --connect-timeout 10 --max-time 300 -o "$temp_file" "$download_url"; then
        print_error "下载失败"
        print_info "解决方案:"
        echo "  1. 检查网络连接"
        echo "  2. 配置代理或 VPN"
        echo "  3. 稍后重试"
        echo "  4. 手动下载: https://github.com/${GITHUB_REPO}/releases"
        read -p "按回车返回..."
        return
    fi
    
    # 验证下载的文件
    print_info "验证文件..."
    if [ ! -f "$temp_file" ] || [ ! -s "$temp_file" ]; then
        print_error "下载的文件无效(文件不存在或为空)"
        rm -f "$temp_file"
        read -p "按回车返回..."
        return
    fi
    
    # 检查文件类型(必须是 gzip 格式)
    if ! file "$temp_file" | grep -q "gzip compressed"; then
        print_error "下载的文件格式错误(不是 gzip 压缩文件)"
        print_warning "可能原因: ${source_type} 仓库未发布 releases"
        echo ""
        
        # 如果是 Gitee 源失败,尝试切换到 GitHub
        if [[ "$source_type" == "gitee" ]]; then
            print_info "正在切换到 GitHub 镜像源重试..."
            
            # 强制使用 GitHub 镜像
            local success=false
            for mirror in "${GITHUB_MIRRORS[@]}"; do
                local github_url="${mirror}https://github.com/${GITHUB_REPO}/releases/download/${version}/terraria-panel-linux-${arch}.tar.gz"
                print_info "尝试: ${mirror:-GitHub直连}"
                
                if curl -L -# -o "$temp_file" "$github_url" 2>/dev/null; then
                    if file "$temp_file" | grep -q "gzip compressed"; then
                        print_success "切换成功! 继续安装..."
                        success=true
                        break
                    fi
                fi
            done
            
            # 再次验证
            if [ "$success" = false ]; then
                print_error "所有源均下载失败"
                rm -f "$temp_file"
                echo ""
                print_info "解决方案:"
                echo "  1. 在 Gitee 发布 releases: https://gitee.com/${GITEE_REPO}/releases"
                echo "  2. 或检查 GitHub releases: https://github.com/${
GITHUB_REPO}/releases"
                echo "  3. 配置代理访问 GitHub"
                echo ""
                read -p "按回车返回..."
                return
            fi
        else
            rm -f "$temp_file"
            read -p "按回车返回..."
            return
        fi
    fi
    
    local file_size=$(du -h "$temp_file" | cut -f1)
    print_success "文件验证通过 ($file_size)"
    
    print_info "解压中..."
    mkdir -p "$INSTALL_DIR"
    
    # 使用 --strip-components=1 移除 tar 包中的顶层目录
    # 这样可以直接将文件解压到 INSTALL_DIR 而不是 INSTALL_DIR/terraria-panel/
    if ! tar -xzf "$temp_file" -C "$INSTALL_DIR" --strip-components=1; then
        print_error "解压失败"
        rm -f "$temp_file"
        read -p "按回车返回..."
        return
    fi
    
    rm -f "$temp_file"
    chmod +x "$INSTALL_DIR/terraria-panel"
    
    # 创建数据目录
    mkdir -p "$DATA_DIR"
    
    # 创建 systemd 服务
    print_info "配置系统服务..."
    cat > /etc/systemd/system/${SERVICE_NAME}.service << EOF
[Unit]
Description=Terraria Server Panel
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$INSTALL_DIR
ExecStart=$INSTALL_DIR/terraria-panel
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
EOF
    
    systemctl daemon-reload
    systemctl enable "$SERVICE_NAME"
    
    print_success "安装完成!"
    echo ""
    print_info "下一步操作:"
    echo "  1. 启动面板: sudo bash panel.sh start"
    echo "  2. 访问地址: http://YOUR_SERVER_IP:8080"
    echo "  3. 默认账号: admin / admin123"
    echo ""
    read -p "按回车返回..."
}

# 启动面板
start_panel() {
    if ! check_installed; then
        print_error "面板未安装,请先安装"
        read -p "按回车返回..."
        return
    fi
    
    if check_running; then
        print_warning "面板已在运行中"
        read -p "按回车返回..."
        return
    fi
    
    print_info "正在启动面板..."
    if systemctl start "$SERVICE_NAME"; then
        sleep 2
        if check_running; then
            print_success "面板已启动"
            local version=$(get_local_version)
            print_info "当前版本: $version"
            print_info "访问地址: http://$(hostname -I | awk '{print $1}'):8080"
        else
            print_error "启动失败,请查看日志"
        fi
    else
        print_error "启动失败"
    fi
    
    read -p "按回车返回..."
}

# 停止面板
stop_panel() {
    if ! check_running; then
        print_warning "面板未运行"
        return
    fi
    
    print_info "正在停止面板..."
    if systemctl stop "$SERVICE_NAME" 2>/dev/null || pkill -f "terraria-panel"; then
        sleep 1
        if ! check_running; then
            print_success "面板已停止"
        else
            print_error "停止失败"
        fi
    else
        print_error "停止失败"
    fi
}

# 重启面板
restart_panel() {
    stop_panel
    sleep 1
    start_panel
}

# 查看日志
view_logs() {
    if ! check_installed; then
        print_error "面板未安装"
        read -p "按回车返回..."
        return
    fi
    
    print_info "正在查看日志 (Ctrl+C 退出)..."
    sleep 1
    journalctl -u "$SERVICE_NAME" -f
}

# 检查状态
check_status() {
    print_banner
    echo ""
    
    if ! check_installed; then
        print_error "面板状态: 未安装"
        echo ""
        return
    fi
    
    local version=$(get_local_version)
    local status_text="已停止"
    local status_color="${RED}"
    
    if check_running; then
        status_text="运行中"
        status_color="${GREEN}"
    fi
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}面板状态:${NC} ${status_color}${status_text}${NC}"
    echo -e "${BLUE}当前版本:${NC} ${version}"
    echo -e "${BLUE}安装路径:${NC} ${INSTALL_DIR}"
    echo -e "${BLUE}数据目录:${NC} ${DATA_DIR}"
    
    if check_running; then
        local ip=$(hostname -I | awk '{print $1}')
        echo -e "${BLUE}访问地址:${NC} http://${ip}:8080"
    fi
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # 检查更新
    print_info "检查更新..."
    local latest_version=$(get_latest_version 2>/dev/null)
    if [ -n "$latest_version" ] && [ "$version" != "$latest_version" ] && [ "$version" != "未知" ]; then
        print_warning "发现新版本: $latest_version"
        echo "  当前版本: $version"
        echo "  运行 'sudo bash panel.sh' 选择安装来更新"
    else
        print_success "已是最新版本"
    fi
    
    echo ""
    read -p "按回车返回..."
}

# 卸载面板
uninstall_panel() {
    if ! check_installed; then
        print_error "面板未安装"
        read -p "按回车返回..."
        return
    fi
    
    print_warning "确认要卸载面板吗?"
    read -p "此操作将删除所有数据! 输入 'yes' 确认: " confirm
    
    if [ "$confirm" != "yes" ]; then
        print_info "已取消"
        read -p "按回车返回..."
        return
    fi
    
    print_info "正在卸载面板..."
    
    # 停止服务
    stop_panel
    
    # 删除服务
    systemctl disable "$SERVICE_NAME" 2>/dev/null
    rm -f "/etc/systemd/system/${SERVICE_NAME}.service"
    systemctl daemon-reload
    
    # 删除文件
    rm -rf "$INSTALL_DIR"
    
    print_success "卸载完成"
    read -p "按回车返回..."
}

# 更新面板
update_panel() {
    if ! check_installed; then
        print_error "面板未安装,请先安装"
        read -p "按回车返回..."
        return
    fi
    
    print_info "检查更新..."
    local current_version=$(get_local_version)
    local latest_version=$(get_latest_version 2>/dev/null)
    
    if [ -z "$latest_version" ]; then
        print_error "无法获取最新版本信息"
        read -p "按回车返回..."
        return
    fi
    
    echo ""
    print_info "当前版本: $current_version"
    print_info "最新版本: $latest_version"
    echo ""
    
    if [ "$current_version" = "$latest_version" ]; then
        print_success "已是最新版本,无需更新"
        read -p "按回车返回..."
        return
    fi
    
    print_warning "发现新版本!"
    read -p "是否更新到 $latest_version? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "已取消更新"
        read -p "按回车返回..."
        return
    fi
    
    # 停止服务
    if check_running; then
        print_info "停止当前服务..."
        stop_panel
        sleep 2
    fi
    
    # 备份当前版本
    print_info "备份当前版本..."
    local backup_dir="${INSTALL_DIR}_backup_$(date +%Y%m%d_%H%M%S)"
    cp -r "$INSTALL_DIR" "$backup_dir"
    print_success "备份完成: $backup_dir"
    
    # 执行安装(会覆盖现有文件)
    local arch=$(detect_arch)
    local download_url=$(get_download_url "$latest_version" "$arch")
    local temp_file="/tmp/terraria-panel-update.tar.gz"
    
    print_info "下载更新..."
    print_info "从 GitHub 直接下载 releases..."
    if ! curl -L -# --connect-timeout 10 --max-time 300 -o "$temp_file" "$download_url"; then
        print_error "下载失败"
        print_info "解决方案:"
        echo "  1. 检查网络连接"
        echo "  2. 配置代理或 VPN"
        echo "  3. 稍后重试"
        print_info "恢复备份..."
        rm -rf "$INSTALL_DIR"
        mv "$backup_dir" "$INSTALL_DIR"
        read -p "按回车返回..."
        return
    fi
    
    # 验证文件
    if ! file "$temp_file" | grep -q "gzip compressed"; then
        print_error "下载的文件格式错误"
        rm -f "$temp_file"
        print_info "恢复备份..."
        rm -rf "$INSTALL_DIR"
        mv "$backup_dir" "$INSTALL_DIR"
        read -p "按回车返回..."
        return
    fi
    
    print_info "解压更新..."
    if ! tar -xzf "$temp_file" -C "$INSTALL_DIR" --strip-components=1; then
        print_error "解压失败"
        rm -f "$temp_file"
        print_info "恢复备份..."
        rm -rf "$INSTALL_DIR"
        mv "$backup_dir" "$INSTALL_DIR"
        read -p "按回车返回..."
        return
    fi
    
    rm -f "$temp_file"
    chmod +x "$INSTALL_DIR/terraria-panel"
    
    print_success "更新完成!"
    print_info "备份保留在: $backup_dir"
    
    # 启动服务
    print_info "启动面板..."
    start_panel
}

# 修改端口
change_port() {
    if ! check_installed; then
        print_error "面板未安装"
        read -p "按回车返回..."
        return
    fi
    
    local config_file="$INSTALL_DIR/config.yaml"
    local current_port="8080"
    
    # 尝试从配置文件读取当前端口
    if [ -f "$config_file" ]; then
        current_port=$(grep -oP '(?<=port: )\d+' "$config_file" 2>/dev/null || echo "8080")
    fi
    
    echo ""
    print_info "当前端口: $current_port"
    echo ""
    read -p "请输入新端口 (1024-65535): " new_port
    
    # 验证端口号
    if ! [[ "$new_port" =~ ^[0-9]+$ ]] || [ "$new_port" -lt 1024 ] || [ "$new_port" -gt 65535 ]; then
        print_error "无效的端口号"
        read -p "按回车返回..."
        return
    fi
    
    # 检查端口是否被占用
    if netstat -tuln 2>/dev/null | grep -q ":$new_port " || ss -tuln 2>/dev/null | grep -q ":$new_port "; then
        print_error "端口 $new_port 已被占用"
        read -p "按回车返回..."
        return
    fi
    
    print_info "修改端口为: $new_port"
    
    # 创建或更新配置文件
    if [ ! -f "$config_file" ]; then
        cat > "$config_file" << EOF
server:
  port: $new_port
  mode: release

database:
  path: $DATA_DIR/terraria.db

log:
  level: info
  path: $DATA_DIR/logs
EOF
    else
        # 使用 sed 修改端口
        sed -i "s/port: [0-9]*/port: $new_port/" "$config_file"
    fi
    
    print_success "端口已修改"
    
    # 如果服务正在运行,需要重启
    if check_running; then
        print_info "重启面板以应用更改..."
        restart_panel
    else
        print_info "请启动面板以应用更改"
    fi
    
    print_success "新访问地址: http://$(hostname -I | awk '{print $1}'):$new_port"
    echo ""
    read -p "按回车返回..."
}

# 主菜单
show_menu() {
    clear
    print_banner
    echo ""
    
    if check_installed; then
        local version=$(get_local_version)
        local status="已停止"
        local status_color="${RED}"
        
        if check_running; then
            status="运行中"
            status_color="${GREEN}"
        fi
        
        echo -e "当前版本: ${BLUE}${version}${NC}  |  状态: ${status_color}${status}${NC}"
    else
        echo -e "状态: ${RED}未安装${NC}"
    fi
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  1. 安装面板"
    echo "  2. 更新面板"
    echo "  3. 更新脚本"
    echo "  4. 启动面板"
    echo "  5. 停止面板"
    echo "  6. 重启面板"
    echo "  7. 查看日志"
    echo "  8. 查看状态"
    echo "  9. 修改端口"
    echo "  10. 卸载面板"
    echo "  0. 退出"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
}

# 主函数
main() {
    # 检查 root 权限
    if [ "$EUID" -ne 0 ]; then
        print_error "请使用 root 权限运行此脚本"
        print_info "使用方法: sudo bash $0"
        exit 1
    fi
    
    # 检查依赖
    check_requirements
    
    # 处理命令行参数
    case "${1:-}" in
        install)
            install_panel
            exit 0
            ;;
        update)
            update_panel
            exit 0
            ;;
        start)
            start_panel
            exit 0
            ;;
        stop)
            stop_panel
            exit 0
            ;;
        restart)
            restart_panel
            exit 0
            ;;
        status)
            check_status
            exit 0
            ;;
        logs)
            view_logs
            exit 0
            ;;
        uninstall)
            uninstall_panel
            exit 0
            ;;
        port)
            change_port
            exit 0
            ;;
        script)
            update_script
            exit 0
            ;;
    esac
    
    # 交互式菜单
    while true; do
        show_menu
        read -p "请选择操作 [0-10]: " choice
        
        case $choice in
            1)
                install_panel
                ;;
            2)
                update_panel
                ;;
            3)
                update_script
                ;;
            4)
                start_panel
                ;;
            5)
                stop_panel
                ;;
            6)
                restart_panel
                ;;
            7)
                view_logs
                ;;
            8)
                check_status
                ;;
            9)
                change_port
                ;;
            10)
                uninstall_panel
                ;;
            0)
                print_info "再见!"
                exit 0
                ;;
            *)
                print_error "无效选择"
                sleep 1
                ;;
        esac
    done
}

# 运行主函数
main "$@"