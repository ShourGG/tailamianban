#!/bin/bash

###########################################
# 泰拉瑞亚面板一键管理脚本
# Terraria Panel One-Click Management Script
# Version: 2.4
# 更新日志:
# v2.4 - 新增多源支持（GitHub + Gitee自动切换）
#      - 解决中国大陆服务器GitHub访问问题
# v2.3 - 修复版本号显示bug（支持四段版本号如v1.1.9.29）
#      - 新增端口配置功能（支持动态修改监听端口）
# v2.2 - 限制脚本位置：强制安装到/root目录，仅允许在/root目录运行
# v2.1 - 新增脚本自动更新机制（启动时自动检测并更新脚本）
# v2.0 - 优化更新功能：增强版本检测和自动备份
#      - 优化卸载功能：完全清理所有文件和服务
###########################################

# 脚本版本
SCRIPT_VERSION="2.4"

# 脚本固定安装位置
SCRIPT_HOME="/root"
SCRIPT_NAME="panel.sh"
SCRIPT_PATH="${SCRIPT_HOME}/${SCRIPT_NAME}"

# 仓库信息 - 支持多源
GITHUB_REPO="ShourGG/tailamianban"
GITEE_REPO="cd-writer/tailamianban"  # Gitee镜像仓库

# 自动选择最快的源
get_repo_source() {
    # 测试GitHub连接
    if curl -s --connect-timeout 3 --max-time 5 "https://api.github.com/repos/${GITHUB_REPO}/releases/latest" >/dev/null 2>&1; then
        echo "github"
    # 测试Gitee连接
    elif curl -s --connect-timeout 3 --max-time 5 "https://gitee.com/api/v5/repos/${GITEE_REPO}/releases/latest" >/dev/null 2>&1; then
        echo "gitee"
    else
        echo "none"
    fi
}

# 根据源获取URL
get_script_url() {
    local source=$(get_repo_source)
    case $source in
        "github") echo "https://raw.githubusercontent.com/${GITHUB_REPO}/main/panel.sh" ;;
        "gitee") echo "https://gitee.com/${GITEE_REPO}/raw/main/panel.sh" ;;
        *) echo "" ;;
    esac
}

get_download_url() {
    local version=$1
    local arch=$2
    local source=$(get_repo_source)
    case $source in
        "github") echo "https://github.com/${GITHUB_REPO}/releases/download/${version}/terraria-panel-linux-${arch}.tar.gz" ;;
        "gitee") echo "https://gitee.com/${GITEE_REPO}/releases/download/${version}/terraria-panel-linux-${arch}.tar.gz" ;;
        *) echo "" ;;
    esac
}

get_api_url() {
    local source=$(get_repo_source)
    case $source in
        "github") echo "https://api.github.com/repos/${GITHUB_REPO}/releases/latest" ;;
        "gitee") echo "https://gitee.com/api/v5/repos/${GITEE_REPO}/releases/latest" ;;
        *) echo "" ;;
    esac
}
INSTALL_DIR="/opt/terraria-panel"
SERVICE_NAME="terraria-panel"

# 颜色定义 - 增强版
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
WHITE='\033[1;37m'
GRAY='\033[0;90m'
BOLD='\033[1m'
DIM='\033[2m'
UNDERLINE='\033[4m'
BLINK='\033[5m'
NC='\033[0m'

# 背景色
BG_RED='\033[41m'
BG_GREEN='\033[42m'
BG_YELLOW='\033[43m'
BG_BLUE='\033[44m'
BG_CYAN='\033[46m'

# 组合效果
SUCCESS="${GREEN}${BOLD}"
ERROR="${RED}${BOLD}"
WARNING="${YELLOW}${BOLD}"
INFO="${CYAN}"
HIGHLIGHT="${MAGENTA}${BOLD}"

# 打印函数 - 美化版
print_info() { echo -e "${CYAN}${BOLD}ℹ${NC} ${CYAN}$1${NC}"; }
print_success() { echo -e "${GREEN}${BOLD}✓${NC} ${GREEN}$1${NC}"; }
print_warning() { echo -e "${YELLOW}${BOLD}⚠${NC} ${YELLOW}$1${NC}"; }
print_error() { echo -e "${RED}${BOLD}✗${NC} ${RED}$1${NC}"; }

# 进度条函数
print_progress() {
    local current=$1
    local total=$2
    local desc=$3
    local percent=$((current * 100 / total))
    local filled=$((percent / 2))
    local empty=$((50 - filled))
    
    printf "\r${CYAN}${BOLD}[${NC}"
    printf "${GREEN}%0.s█${NC}" $(seq 1 $filled)
    printf "${GRAY}%0.s░${NC}" $(seq 1 $empty)
    printf "${CYAN}${BOLD}]${NC} ${WHITE}${percent}%%${NC} ${GRAY}${desc}${NC}"
}

# 步骤提示函数
print_step() {
    local step=$1
    local total=$2
    local desc=$3
    echo -e "${MAGENTA}${BOLD}[${step}/${total}]${NC} ${WHITE}${desc}${NC}"
}

# 打印横幅 - 炫酷版
print_banner() {
    clear
    echo -e "${CYAN}${BOLD}"
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║                                                          ║"
    echo "║      ████████╗███████╗██████╗ ██████╗  █████╗           ║"
    echo "║      ╚══██╔══╝██╔════╝██╔══██╗██╔══██╗██╔══██╗          ║"
    echo "║         ██║   █████╗  ██████╔╝██████╔╝███████║          ║"
    echo "║         ██║   ██╔══╝  ██╔══██╗██╔══██╗██╔══██║          ║"
    echo "║         ██║   ███████╗██║  ██║██║  ██║██║  ██║          ║"
    echo "║         ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝          ║"
    echo "║                                                          ║"
    echo -e "║          ${MAGENTA}🎮 泰拉瑞亚服务器管理面板${CYAN}${BOLD}                     ║"
    echo -e "║             ${WHITE}Terraria Server Panel${CYAN}${BOLD}                     ║"
    echo -e "║                                                          ║"
    echo -e "║               ${GRAY}管理脚本 ${GREEN}v${SCRIPT_VERSION}${CYAN}${BOLD}                          ║"
    echo "║                                                          ║"
    echo "╚══════════════════════════════════════════════════════════╝"
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

# 获取最新版本 - 支持多源
get_latest_version() {
    local api_url=$(get_api_url)
    if [ -z "$api_url" ]; then
        print_error "无法连接到任何代码仓库"
        return 1
    fi
    
    local source=$(get_repo_source)
    local version=""
    
    case $source in
        "github")
            print_info "使用 GitHub 源获取版本..."
            version=$(curl -s "$api_url" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
            ;;
        "gitee")
            print_info "使用 Gitee 源获取版本..."
            version=$(curl -s "$api_url" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
            ;;
        *)
            print_error "无可用的代码仓库源"
            return 1
            ;;
    esac
    
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
    [ -z "$version" ] && { print_error "无法获取版本信息"; read -p "按回车返回..."; return; }
    print_success "最新版本: $version"
    
    local download_url=$(get_download_url "$version" "$arch")
    if [ -z "$download_url" ]; then
        print_error "无法获取下载链接，请检查网络连接"
        read -p "按回车返回..."
        return
    fi
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
    echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║              更新泰拉瑞亚面板                  ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
    echo ""
    
    if ! check_installed; then
        print_error "未检测到已安装的面板"
        read -p "按回车返回..."
        return
    fi
    
    # 获取版本信息
    print_info "检查版本信息..."
    local current=$(get_local_version)
    local latest=$(get_latest_version)
    
    if [ -z "$latest" ]; then
        print_error "无法获取最新版本信息"
        print_warning "请检查网络连接或稍后重试"
        read -p "按回车返回..."
        return
    fi
    
    echo ""
    print_info "当前版本: ${BLUE}$current${NC}"
    print_info "最新版本: ${GREEN}$latest${NC}"
    echo ""
    
    # 标准化版本号进行比较
    local current_num=$(echo "$current" | sed 's/^v//')
    local latest_num=$(echo "$latest" | sed 's/^v//')
    
    if [ "$current_num" = "$latest_num" ] || [ "$current" = "$latest" ]; then
        print_success "✓ 当前已是最新版本!"
        echo ""
        read -p "是否强制重新安装? (y/N): " -n 1 -r
        echo
        [[ ! $REPLY =~ ^[Yy]$ ]] && return
        print_warning "将重新安装当前版本"
    else
        print_warning "发现新版本可用!"
    fi
    
    echo ""
    read -p "继续更新? (Y/n): " -n 1 -r
    echo
    [[ $REPLY =~ ^[Nn]$ ]] && return
    
    echo ""
    print_info "===== 开始更新流程 ====="
    echo ""
    
    # 1. 自动备份数据
    local backup_success=false
    if [ -d "$INSTALL_DIR/data" ] || [ -d "$INSTALL_DIR/worlds" ]; then
        print_step 1 6 "备份数据..."
        local backup_dir="$INSTALL_DIR/backup-$(date +%Y%m%d-%H%M%S)"
        mkdir -p "$backup_dir"
        
        [ -d "$INSTALL_DIR/data" ] && cp -r "$INSTALL_DIR/data" "$backup_dir/" 2>/dev/null
        [ -d "$INSTALL_DIR/worlds" ] && cp -r "$INSTALL_DIR/worlds" "$backup_dir/" 2>/dev/null
        [ -d "$INSTALL_DIR/logs" ] && cp -r "$INSTALL_DIR/logs" "$backup_dir/" 2>/dev/null
        
        if [ -d "$backup_dir/data" ] || [ -d "$backup_dir/worlds" ]; then
            local backup_size=$(du -sh "$backup_dir" 2>/dev/null | cut -f1)
            print_success "备份完成: $backup_dir ($backup_size)"
            backup_success=true
        else
            print_warning "备份失败，但继续更新"
            rm -rf "$backup_dir" 2>/dev/null
        fi
    else
        print_step 1 6 "跳过备份 ${GRAY}(无数据)${NC}"
    fi
    
    # 2. 停止服务
    print_step 2 6 "停止服务..."
    stop_panel
    sleep 1
    
    # 3. 下载新版本
    local arch=$(detect_arch)
    local url=$(get_download_url "$latest" "$arch")
    if [ -z "$url" ]; then
        print_error "无法获取下载链接"
        read -p "按回车返回..."
        return
    fi
    local temp="/tmp/terraria-panel-update-$(date +%s).tar.gz"
    
    print_step 3 6 "下载新版本..."
    print_info "URL: $url"
    
    if ! curl -L --progress-bar -o "$temp" "$url"; then
        print_error "下载失败"
        print_warning "请检查网络连接或 GitHub 访问"
        read -p "按回车返回..."
        return
    fi
    
    # 验证下载文件
    if [ ! -f "$temp" ] || [ ! -s "$temp" ]; then
        print_error "下载文件无效"
        rm -f "$temp"
        read -p "按回车返回..."
        return
    fi
    
    local file_size=$(du -h "$temp" | cut -f1)
    print_success "下载完成 ($file_size)"
    
    # 4. 备份旧程序
    print_step 4 6 "备份旧程序..."
    if [ -f "$INSTALL_DIR/terraria-panel" ]; then
        cp "$INSTALL_DIR/terraria-panel" "$INSTALL_DIR/terraria-panel.old" 2>/dev/null
    fi
    
    # 5. 解压更新
    print_step 5 6 "安装新版本..."
    if ! tar -xzf "$temp" -C "$INSTALL_DIR" --strip-components=1 2>/dev/null; then
        print_error "解压失败"
        
        # 尝试恢复
        if [ -f "$INSTALL_DIR/terraria-panel.old" ]; then
            print_warning "尝试恢复旧版本..."
            mv "$INSTALL_DIR/terraria-panel.old" "$INSTALL_DIR/terraria-panel"
        fi
        
        rm -f "$temp"
        read -p "按回车返回..."
        return
    fi
    
    chmod +x "$INSTALL_DIR/terraria-panel"
    rm -f "$temp"
    rm -f "$INSTALL_DIR/terraria-panel.old" 2>/dev/null
    
    print_success "安装完成"
    
    # 6. 重载 systemd
    print_step 6 6 "重载系统服务..."
    systemctl daemon-reload
    
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║              更新完成！                        ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
    echo ""
    
    if [ "$backup_success" = true ]; then
        print_info "数据备份: $backup_dir"
        print_warning "确认更新正常后可删除备份"
    fi
    
    echo ""
    read -p "立即启动面板? (Y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        echo ""
        start_panel
        
        if check_running; then
            echo ""
            print_success "面板已启动"
            local new_version=$(get_local_version)
            print_info "当前运行版本: $new_version"
        fi
    fi
    
    echo ""
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

# 查看状态 - 美化版
view_status() {
    print_banner
    echo -e "${BOLD}${WHITE}━━━━━━━━━━━━━━━━ 📊 系统状态 ━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # 安装信息
    echo -e "${CYAN}${BOLD}╔═══ 安装信息 ═══╗${NC}"
    if check_installed; then
        local ver=$(get_local_version)
        echo -e "  ${GREEN}✓${NC} 状态: ${SUCCESS}已安装${NC}"
        echo -e "  ${GREEN}✓${NC} 版本: ${HIGHLIGHT}${ver}${NC}"
        echo -e "  ${GREEN}✓${NC} 路径: ${INFO}$INSTALL_DIR${NC}"
    else
        echo -e "  ${RED}✗${NC} 状态: ${ERROR}未安装${NC}"
        echo -e "  ${GRAY}ℹ${NC} 请选择菜单 ${HIGHLIGHT}1${NC} 进行安装"
    fi
    echo -e "${CYAN}${BOLD}╚══════════════════╝${NC}"
    
    echo ""
    
    # 运行状态
    echo -e "${CYAN}${BOLD}╔═══ 运行状态 ═══╗${NC}"
    if check_running; then
        local pid=$(pgrep -f "terraria-panel" | head -1)
        local port=$(systemctl show "$SERVICE_NAME" --property=Environment 2>/dev/null | grep -oP 'PORT=\K\d+' || echo "8080")
        local uptime=$(ps -p "$pid" -o etime= 2>/dev/null | tr -d ' ' || echo "未知")
        
        echo -e "  ${GREEN}●${NC} 状态: ${SUCCESS}运行中${NC}"
        echo -e "  ${GREEN}✓${NC} 进程: ${INFO}PID ${pid}${NC}  运行时间: ${GRAY}${uptime}${NC}"
        echo -e "  ${GREEN}✓${NC} 端口: ${HIGHLIGHT}${port}${NC}"
        echo -e "  ${GREEN}✓${NC} 访问: ${UNDERLINE}${BLUE}http://$(hostname -I | awk '{print $1}'):${port}${NC}"
    else
        echo -e "  ${YELLOW}●${NC} 状态: ${WARNING}未运行${NC}"
        echo -e "  ${GRAY}ℹ${NC} 请选择菜单 ${HIGHLIGHT}3${NC} 启动服务"
    fi
    echo -e "${CYAN}${BOLD}╚══════════════════╝${NC}"
    
    echo ""
    
    # 系统信息
    echo -e "${CYAN}${BOLD}╔═══ 系统信息 ═══╗${NC}"
    echo -e "  ${BLUE}◆${NC} 架构: ${INFO}$(uname -m) ($(detect_arch))${NC}"
    echo -e "  ${BLUE}◆${NC} CPU: ${INFO}$(nproc) 核心${NC}"
    
    # 内存信息
    local mem_info=$(free -h | awk '/^Mem:/ {printf "%s / %s (使用率: %.1f%%)", $3, $2, ($3/$2)*100}')
    echo -e "  ${BLUE}◆${NC} 内存: ${INFO}${mem_info}${NC}"
    
    # 磁盘信息
    local disk_info=$(df -h "$INSTALL_DIR" 2>/dev/null | awk 'NR==2 {printf "%s / %s (使用率: %s)", $3, $2, $5}' || echo "未知")
    echo -e "  ${BLUE}◆${NC} 磁盘: ${INFO}${disk_info}${NC}"
    
    # Swap信息
    local swap_info=$(free -h | awk '/^Swap:/ {if ($2 == "0B") print "未配置"; else printf "%s / %s", $3, $2}')
    echo -e "  ${BLUE}◆${NC} Swap: ${INFO}${swap_info}${NC}"
    
    echo -e "${CYAN}${BOLD}╚══════════════════╝${NC}"
    
    echo ""
    echo -e "${BOLD}${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
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

# 完全卸载面板
uninstall_panel() {
    print_banner
    echo -e "${RED}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║            完全卸载泰拉瑞亚面板                ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════╝${NC}"
    echo ""
    
    if ! check_installed; then
        print_warning "面板未安装"
        read -p "按回车返回..."
        return
    fi
    
    # 显示将要删除的内容
    echo -e "${YELLOW}此操作将删除以下内容:${NC}"
    echo "  • 面板程序文件"
    echo "  • 数据库文件 (data/)"
    echo "  • 日志文件 (logs/)"
    echo "  • 世界文件 (worlds/)"
    echo "  • systemd 服务配置"
    echo "  • 所有配置文件"
    echo ""
    
    # 显示当前数据统计
    if [ -d "$INSTALL_DIR" ]; then
        local total_size=$(du -sh "$INSTALL_DIR" 2>/dev/null | cut -f1)
        print_info "安装目录大小: $total_size"
        
        if [ -d "$INSTALL_DIR/worlds" ]; then
            local world_count=$(ls -1 "$INSTALL_DIR/worlds"/*.wld 2>/dev/null | wc -l)
            [ "$world_count" -gt 0 ] && print_warning "检测到 $world_count 个世界文件"
        fi
    fi
    
    echo ""
    print_warning "⚠️  此操作不可恢复！请务必确认！"
    echo ""
    read -p "确认完全卸载? 输入 'YES' 继续 (大写): " -r confirm
    
    if [ "$confirm" != "YES" ]; then
        print_info "取消卸载"
        read -p "按回车返回..."
        return
    fi
    
    echo ""
    print_info "开始卸载流程..."
    echo ""
    
    # 1. 备份数据 (可选)
    local backup_path=""
    read -p "是否备份数据? (Y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        backup_path="/tmp/terraria-backup-$(date +%Y%m%d-%H%M%S).tar.gz"
        print_info "正在备份数据..."
        
        if tar -czf "$backup_path" -C "$INSTALL_DIR" data worlds logs 2>/dev/null; then
            local backup_size=$(du -h "$backup_path" | cut -f1)
            print_success "备份完成: $backup_path ($backup_size)"
        else
            print_warning "备份失败，但继续卸载流程"
            backup_path=""
        fi
        echo ""
    fi
    
    # 2. 停止服务
    print_info "停止面板服务..."
    if check_running; then
        systemctl stop ${SERVICE_NAME} 2>/dev/null
        pkill -9 -f "terraria-panel" 2>/dev/null
        sleep 1
        
        if check_running; then
            print_warning "无法正常停止，强制结束进程"
            pkill -9 -f "terraria-panel"
        fi
    fi
    print_success "服务已停止"
    
    # 3. 禁用并删除 systemd 服务
    print_info "删除系统服务..."
    systemctl disable ${SERVICE_NAME} 2>/dev/null
    systemctl stop ${SERVICE_NAME} 2>/dev/null
    rm -f /etc/systemd/system/${SERVICE_NAME}.service
    systemctl daemon-reload
    systemctl reset-failed 2>/dev/null
    print_success "系统服务已删除"
    
    # 4. 删除安装目录
    print_info "删除安装目录..."
    if [ -d "$INSTALL_DIR" ]; then
        rm -rf "$INSTALL_DIR"
        print_success "安装目录已删除: $INSTALL_DIR"
    else
        print_warning "安装目录不存在"
    fi
    
    # 5. 清理可能的临时文件
    print_info "清理临时文件..."
    rm -f /tmp/terraria-panel*.tar.gz 2>/dev/null
    rm -f /tmp/terraria-panel-update*.tar.gz 2>/dev/null
    print_success "临时文件已清理"
    
    # 6. 清理日志 (可选)
    read -p "是否清理系统日志中的面板记录? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        journalctl --rotate 2>/dev/null
        journalctl --vacuum-time=1s 2>/dev/null
        print_success "系统日志已清理"
    fi
    
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║              卸载完成！                        ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
    echo ""
    
    if [ -n "$backup_path" ] && [ -f "$backup_path" ]; then
        print_info "数据备份位置: $backup_path"
        print_warning "备份文件请自行妥善保管或删除"
    fi
    
    echo ""
    read -p "按回车返回..."
}

# 修改端口配置
change_port() {
    print_banner
    echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║              修改面板端口                      ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
    echo ""
    
    if ! check_installed; then
        print_error "面板未安装"
        read -p "按回车返回..."
        return
    fi
    
    # 获取当前端口
    local current_port="8080"
    if systemctl is-active --quiet "$SERVICE_NAME" 2>/dev/null; then
        current_port=$(systemctl show "$SERVICE_NAME" --property=Environment 2>/dev/null | grep -oP 'PORT=\K\d+' || echo "8080")
    fi
    
    print_info "当前端口: $current_port"
    echo ""
    
    # 输入新端口
    local new_port=""
    while true; do
        read -p "请输入新端口号 (1024-65535, 0取消): " new_port
        
        # 取消
        if [ "$new_port" = "0" ]; then
            print_info "取消修改"
            read -p "按回车返回..."
            return
        fi
        
        # 验证端口号
        if ! [[ "$new_port" =~ ^[0-9]+$ ]]; then
            print_error "端口必须是数字"
            continue
        fi
        
        if [ "$new_port" -lt 1024 ] || [ "$new_port" -gt 65535 ]; then
            print_error "端口范围必须在 1024-65535 之间"
            continue
        fi
        
        # 检查端口是否被占用
        if netstat -tuln 2>/dev/null | grep -q ":$new_port " || ss -tuln 2>/dev/null | grep -q ":$new_port "; then
            if [ "$new_port" != "$current_port" ]; then
                print_error "端口 $new_port 已被占用"
                continue
            fi
        fi
        
        break
    done
    
    # 确认修改
    echo ""
    print_warning "将修改端口: $current_port → $new_port"
    read -p "确认修改? (Y/n): " -n 1 -r
    echo
    [[ $REPLY =~ ^[Nn]$ ]] && return
    
    echo ""
    echo -e "${BOLD}${WHITE}━━━━━━━━━━━ 开始修改端口 ━━━━━━━━━━━${NC}"
    echo ""
    
    # 1. 停止服务
    print_step 1 4 "停止服务..."
    if check_running; then
        systemctl stop "$SERVICE_NAME" 2>/dev/null
        sleep 1
    fi
    
    # 2. 更新 systemd 服务配置
    print_step 2 4 "更新服务配置..."
    if [ -f "/etc/systemd/system/${SERVICE_NAME}.service" ]; then
        sed -i "s/Environment=PORT=.*/Environment=PORT=$new_port/" "/etc/systemd/system/${SERVICE_NAME}.service"
        print_success "服务配置已更新"
    fi
    
    # 3. 重载 systemd
    print_step 3 4 "重载系统服务..."
    systemctl daemon-reload
    
    # 4. 配置防火墙
    print_step 4 4 "配置防火墙..."
    
    # UFW
    if command -v ufw >/dev/null 2>&1; then
        ufw allow "$new_port/tcp" 2>/dev/null
        [ "$new_port" != "$current_port" ] && ufw delete allow "$current_port/tcp" 2>/dev/null
        print_success "UFW防火墙已更新"
    # firewalld
    elif command -v firewall-cmd >/dev/null 2>&1; then
        firewall-cmd --permanent --add-port="$new_port/tcp" 2>/dev/null
        [ "$new_port" != "$current_port" ] && firewall-cmd --permanent --remove-port="$current_port/tcp" 2>/dev/null
        firewall-cmd --reload 2>/dev/null
        print_success "firewalld防火墙已更新"
    # iptables
    elif command -v iptables >/dev/null 2>&1; then
        iptables -A INPUT -p tcp --dport "$new_port" -j ACCEPT 2>/dev/null
        [ "$new_port" != "$current_port" ] && iptables -D INPUT -p tcp --dport "$current_port" -j ACCEPT 2>/dev/null
        # 保存规则
        if command -v iptables-save >/dev/null 2>&1; then
            iptables-save > /etc/iptables/rules.v4 2>/dev/null || true
        fi
        print_success "iptables防火墙已更新"
    else
        print_warning "未检测到防火墙，请手动开放端口 $new_port"
    fi
    
    echo ""
    print_success "端口修改完成: $new_port"
    echo ""
    
    read -p "立即启动面板? (Y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        echo ""
        start_panel
        
        if check_running; then
            echo ""
            print_success "面板已在新端口 $new_port 上运行"
            print_info "访问地址: http://您的IP:$new_port"
        fi
    fi
    
    echo ""
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

# 主菜单 - 美化版
show_menu() {
    print_banner
    
    # 状态栏 - 炫酷显示
    echo -e "${BOLD}┌────────────────────────────────────────────────────────┐${NC}"
    if check_installed; then
        local version=$(get_local_version)
        if check_running; then
            echo -e "${BOLD}│${NC}  ${BG_GREEN}${WHITE} ● 运行中 ${NC}  ${GREEN}版本: ${version}${NC}  ${GRAY}[$(date '+%Y-%m-%d %H:%M:%S')]${NC}"
        else
            echo -e "${BOLD}│${NC}  ${BG_YELLOW}${WHITE} ● 已停止 ${NC}  ${YELLOW}版本: ${version}${NC}  ${GRAY}[$(date '+%Y-%m-%d %H:%M:%S')]${NC}"
        fi
    else
        echo -e "${BOLD}│${NC}  ${BG_RED}${WHITE} ● 未安装 ${NC}  ${RED}请先安装面板${NC}  ${GRAY}[$(date '+%Y-%m-%d %H:%M:%S')]${NC}"
    fi
    echo -e "${BOLD}└────────────────────────────────────────────────────────┘${NC}"
    
    echo ""
    echo -e "${BOLD}${WHITE}━━━━━━━━━━━━━━━━ 📋 功能菜单 ━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "  ${CYAN}╭─ 安装与更新${NC}"
    echo -e "  ${CYAN}│${NC}  ${HIGHLIGHT}1.${NC} 📦 下载并安装面板"
    echo -e "  ${CYAN}│${NC}  ${HIGHLIGHT}2.${NC} 🔄 更新面板 ${GRAY}(自动备份、版本检测)${NC}"
    echo -e "  ${CYAN}╰${NC}"
    echo ""
    echo -e "  ${GREEN}╭─ 服务管理${NC}"
    echo -e "  ${GREEN}│${NC}  ${HIGHLIGHT}3.${NC} ▶️  启动面板"
    echo -e "  ${GREEN}│${NC}  ${HIGHLIGHT}4.${NC} ⏸️  停止面板"
    echo -e "  ${GREEN}│${NC}  ${HIGHLIGHT}5.${NC} 🔁 重启面板"
    echo -e "  ${GREEN}╰${NC}"
    echo ""
    echo -e "  ${BLUE}╭─ 监控与日志${NC}"
    echo -e "  ${BLUE}│${NC}  ${HIGHLIGHT}6.${NC} 📊 查看状态"
    echo -e "  ${BLUE}│${NC}  ${HIGHLIGHT}7.${NC} 📜 查看日志"
    echo -e "  ${BLUE}╰${NC}"
    echo ""
    echo -e "  ${MAGENTA}╭─ 高级配置${NC}"
    echo -e "  ${MAGENTA}│${NC}  ${HIGHLIGHT}8.${NC} 🔧 修改端口"
    echo -e "  ${MAGENTA}│${NC}  ${HIGHLIGHT}9.${NC} 💾 设置虚拟内存"
    echo -e "  ${MAGENTA}╰${NC}"
    echo ""
    echo -e "  ${RED}╭─ 系统操作${NC}"
    echo -e "  ${RED}│${NC}  ${HIGHLIGHT}10.${NC} 🗑️  完全卸载 ${GRAY}(清理所有数据)${NC}"
    echo -e "  ${RED}╰${NC}"
    echo ""
    echo -e "  ${GRAY}╭─ 其他${NC}"
    echo -e "  ${GRAY}│${NC}  ${HIGHLIGHT}0.${NC} 🚪 退出"
    echo -e "  ${GRAY}╰${NC}"
    echo ""
    echo -e "${BOLD}${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -ne "${BOLD}${CYAN}➜${NC} 请输入选项 ${GRAY}[0-10]${NC}: "
    read choice
    
    case $choice in
        1) install_panel ;;
        2) update_panel ;;
        3) print_banner; start_panel; read -p "按回车返回..." ;;
        4) print_banner; stop_panel; read -p "按回车返回..." ;;
        5) restart_panel ;;
        6) view_status ;;
        7) view_logs ;;
        8) change_port ;;
        9) setup_swap ;;
        10) uninstall_panel ;;
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

# 检查并确保脚本在正确位置
check_script_location() {
    local current_script=$(readlink -f "$0")
    local current_dir=$(dirname "$current_script")
    
    # 如果当前不在 /root 目录
    if [ "$current_dir" != "$SCRIPT_HOME" ]; then
        clear
        echo -e "${YELLOW}╔════════════════════════════════════════════════╗${NC}"
        echo -e "${YELLOW}║            检测到脚本位置不正确                ║${NC}"
        echo -e "${YELLOW}╚════════════════════════════════════════════════╝${NC}"
        echo ""
        print_warning "当前位置: $current_dir"
        print_info "要求位置: $SCRIPT_HOME"
        echo ""
        print_info "正在自动修正脚本位置..."
        echo ""
        
        # 删除 /root 下的旧脚本（如果存在）
        if [ -f "$SCRIPT_PATH" ]; then
            print_info "[1/3] 删除旧脚本"
            rm -f "$SCRIPT_PATH"
        else
            print_info "[1/3] 无需删除旧脚本"
        fi
        
        # 复制当前脚本到 /root
        print_info "[2/3] 复制脚本到 $SCRIPT_HOME"
        if cp "$current_script" "$SCRIPT_PATH" 2>/dev/null; then
            chmod +x "$SCRIPT_PATH"
            print_success "脚本已复制到正确位置"
        else
            print_error "复制失败，请手动执行:"
            echo "  cp $current_script $SCRIPT_PATH"
            echo "  chmod +x $SCRIPT_PATH"
            exit 1
        fi
        
        # 重新执行正确位置的脚本
        print_info "[3/3] 重新启动脚本"
        echo ""
        print_success "位置修正完成，正在重新启动..."
        sleep 2
        exec "$SCRIPT_PATH" "$@"
    fi
}

# 脚本自动更新功能
check_script_update() {
    echo -e "${BLUE}[检查]${NC} 检测脚本版本..."
    
    # 临时文件
    local temp_script="/tmp/panel_new_$(date +%s).sh"
    
    # 获取脚本更新URL
    local script_url=$(get_script_url)
    if [ -z "$script_url" ]; then
        echo -e "${YELLOW}[提示]${NC} 无法连接到任何代码仓库，继续使用当前版本"
        return 0
    fi
    
    # 下载最新脚本（静默模式，3秒超时）
    if ! curl -sSL --connect-timeout 3 --max-time 5 -o "$temp_script" "$script_url" 2>/dev/null; then
        echo -e "${YELLOW}[提示]${NC} 无法检查脚本更新（网络问题或GitHub访问受限），继续使用当前版本"
        return 0
    fi
    
    # 检查下载的文件是否有效
    if [[ ! -s "$temp_script" ]]; then
        rm -f "$temp_script"
        return 0
    fi
    
    # 获取远程脚本版本号
    local remote_version=$(grep '^SCRIPT_VERSION=' "$temp_script" | head -1 | cut -d'"' -f2)
    
    if [[ -z "$remote_version" ]]; then
        rm -f "$temp_script"
        return 0
    fi
    
    # 比较版本号（使用字符串比较）
    if [[ "$remote_version" != "$SCRIPT_VERSION" ]]; then
        clear
        echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║           发现脚本新版本，自动更新中           ║${NC}"
        echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
        echo ""
        echo -e "${BLUE}当前版本:${NC} ${RED}v$SCRIPT_VERSION${NC}"
        echo -e "${BLUE}最新版本:${NC} ${GREEN}v$remote_version${NC}"
        echo ""
        print_warning "脚本将在 3 秒后自动更新..."
        sleep 3
        
        # 备份当前脚本
        local backup_script="${SCRIPT_PATH}.bak.$(date +%Y%m%d_%H%M%S)"
        if cp "$SCRIPT_PATH" "$backup_script" 2>/dev/null; then
            print_success "[1/3] 已备份当前脚本"
        else
            print_warning "[1/3] 无法备份脚本，但继续更新"
        fi
        
        # 替换脚本到 /root 目录
        if cp "$temp_script" "$SCRIPT_PATH" 2>/dev/null; then
            chmod +x "$SCRIPT_PATH"
            print_success "[2/3] 脚本已更新到 v$remote_version"
            print_success "[3/3] 正在重新启动脚本..."
            echo ""
            rm -f "$temp_script"
            
            # 清理超过7天的备份文件
            find "$SCRIPT_HOME" -name "${SCRIPT_NAME}.bak.*" -mtime +7 -delete 2>/dev/null
            
            # 重新执行新脚本
            exec "$SCRIPT_PATH" "$@"
        else
            print_error "脚本更新失败"
            rm -f "$temp_script"
            [ -f "$backup_script" ] && rm -f "$backup_script"
            return 1
        fi
    else
        echo -e "${GREEN}[✓]${NC} 脚本已是最新版本 (v$SCRIPT_VERSION)"
        rm -f "$temp_script"
    fi
    
    echo ""
}

# 主函数
main() {
    check_root
    
    # 确保脚本在正确位置 (/root)
    check_script_location "$@"
    
    # 在首次显示菜单前自动检查脚本更新
    check_script_update "$@"
    
    while true; do
        show_menu
    done
}

main