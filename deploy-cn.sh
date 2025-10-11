#!/bin/bash

# 泰拉瑞亚管理平台 - 一键部署脚本（中国大陆版）
# 使用国内镜像站点加速下载

set -e

# 配置
INSTALL_DIR="/opt/terraria-admin"
SERVICE_NAME="terraria-admin"
GITHUB_REPO="ShourGG/tailamianban"
GITHUB_MIRROR="https://github.akams.cn"
GITHUB_RAW="${GITHUB_MIRROR}/https://raw.githubusercontent.com/${GITHUB_REPO}/main/deploy.sh"
CLI_PATH="/usr/local/bin/terraria-admin"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "\n${BLUE}==>${NC} $1"
}

# 检测系统架构
detect_arch() {
    local arch=$(uname -m)
    case $arch in
        x86_64)
            echo "amd64"
            ;;
        aarch64|arm64)
            echo "arm64"
            ;;
        *)
            log_error "不支持的架构: $arch"
            exit 1
            ;;
    esac
}

# 检查root权限
check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "请使用root权限运行: sudo $0"
        exit 1
    fi
}

# 检查依赖
check_dependencies() {
    log_step "检查系统依赖..."
    
    local missing_deps=()
    
    for cmd in curl tar systemctl; do
        if ! command -v $cmd &> /dev/null; then
            missing_deps+=($cmd)
        fi
    done
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "缺少依赖: ${missing_deps[*]}"
        log_info "尝试自动安装..."
        
        if command -v apt-get &> /dev/null; then
            apt-get update
            apt-get install -y curl tar systemd
        elif command -v yum &> /dev/null; then
            yum install -y curl tar systemd
        else
            log_error "无法自动安装依赖，请手动安装: ${missing_deps[*]}"
            exit 1
        fi
    fi
    
    log_info "依赖检查完成"
}

# 停止现有服务
stop_service() {
    if systemctl is-active --quiet $SERVICE_NAME; then
        log_step "停止现有服务..."
        systemctl stop $SERVICE_NAME
        log_info "服务已停止"
    fi
}

# 下载最新版本（使用国内镜像）
download_release() {
    local arch=$1
    log_step "从GitHub镜像站下载最新版本..."
    log_info "使用镜像: ${GITHUB_MIRROR}"
    
    # 获取最新release信息（通过镜像）
    local api_url="${GITHUB_MIRROR}/https://api.github.com/repos/${GITHUB_REPO}/releases/latest"
    log_info "API地址: $api_url"
    
    local release_info=$(curl -s "$api_url")
    local download_url=$(echo "$release_info" | grep "browser_download_url.*linux-${arch}.tar.gz" | cut -d '"' -f 4)
    
    if [ -z "$download_url" ]; then
        log_error "无法获取下载链接"
        log_info "尝试使用备用方案..."
        # 备用：直接构造下载链接
        download_url="https://github.com/${GITHUB_REPO}/releases/latest/download/terraria-admin-linux-${arch}.tar.gz"
    fi
    
    # 替换为镜像链接
    download_url=$(echo "$download_url" | sed "s|https://github.com|${GITHUB_MIRROR}/https://github.com|")
    
    log_info "下载地址: $download_url"
    
    # 下载
    local temp_dir=$(mktemp -d)
    cd $temp_dir
    
    log_info "开始下载，请稍候..."
    if ! curl -L --progress-bar -o terraria-admin.tar.gz "$download_url"; then
        log_error "下载失败，请检查网络连接"
        rm -rf $temp_dir
        exit 1
    fi
    
    log_info "下载完成，开始解压..."
    tar -xzf terraria-admin.tar.gz
    
    echo $temp_dir
}

# 安装文件
install_files() {
    local temp_dir=$1
    log_step "安装文件到 $INSTALL_DIR..."
    
    # 创建安装目录
    mkdir -p $INSTALL_DIR
    
    # 复制文件
    cp -r $temp_dir/web $INSTALL_DIR/
    cp $temp_dir/terraria-server $INSTALL_DIR/terraria-server
    cp $temp_dir/config.json $INSTALL_DIR/ 2>/dev/null || echo '{"port":8080}' > $INSTALL_DIR/config.json
    
    # 设置权限
    chmod +x $INSTALL_DIR/terraria-server
    
    # 创建必要的目录
    mkdir -p $INSTALL_DIR/config
    mkdir -p $INSTALL_DIR/logs
    mkdir -p $INSTALL_DIR/terraria_servers
    
    log_info "文件安装完成"
}

# 创建systemd服务
create_service() {
    log_step "创建systemd服务..."
    
    # 读取配置端口
    local port=$(grep -o '"port"[[:space:]]*:[[:space:]]*[0-9]*' $INSTALL_DIR/config.json | grep -o '[0-9]*' || echo "8080")
    
    cat > /etc/systemd/system/${SERVICE_NAME}.service <<EOF
[Unit]
Description=Terraria Server Admin Panel
Documentation=https://github.com/${GITHUB_REPO}
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=${INSTALL_DIR}
ExecStart=${INSTALL_DIR}/terraria-server -p ${port} -static ./web -d ./config
Restart=on-failure
RestartSec=10

# 安全选项
NoNewPrivileges=true
PrivateTmp=true

# 日志
StandardOutput=append:${INSTALL_DIR}/logs/server.log
StandardError=append:${INSTALL_DIR}/logs/server.log

[Install]
WantedBy=multi-user.target
EOF
    
    systemctl daemon-reload
    log_info "服务创建完成"
}

# 安装CLI工具
install_cli() {
    log_step "安装管理命令..."
    
    cat > $CLI_PATH <<'EOFCLI'
#!/bin/bash

SERVICE_NAME="terraria-admin"
INSTALL_DIR="/opt/terraria-admin"
CONFIG_FILE="${INSTALL_DIR}/config.json"
GITHUB_MIRROR="https://github.akams.cn"

case "$1" in
    start)
        echo "启动泰拉瑞亚管理平台..."
        sudo systemctl start $SERVICE_NAME
        sudo systemctl status $SERVICE_NAME --no-pager
        ;;
    stop)
        echo "停止泰拉瑞亚管理平台..."
        sudo systemctl stop $SERVICE_NAME
        ;;
    restart)
        echo "重启泰拉瑞亚管理平台..."
        sudo systemctl restart $SERVICE_NAME
        sudo systemctl status $SERVICE_NAME --no-pager
        ;;
    status)
        sudo systemctl status $SERVICE_NAME --no-pager
        ;;
    logs)
        sudo journalctl -u $SERVICE_NAME -f
        ;;
    port)
        if [ -z "$2" ]; then
            echo "当前端口: $(grep -o '"port"[[:space:]]*:[[:space:]]*[0-9]*' $CONFIG_FILE | grep -o '[0-9]*')"
            echo "用法: terraria-admin port <新端口>"
        else
            echo "修改端口为: $2"
            sudo sed -i "s/\"port\"[[:space:]]*:[[:space:]]*[0-9]*/\"port\": $2/" $CONFIG_FILE
            sudo sed -i "s/-p [0-9]*/-p $2/" /etc/systemd/system/${SERVICE_NAME}.service
            sudo systemctl daemon-reload
            sudo systemctl restart $SERVICE_NAME
            echo "端口修改完成，服务已重启"
        fi
        ;;
    update)
        echo "更新泰拉瑞亚管理平台（使用国内镜像）..."
        curl -fsSL ${GITHUB_MIRROR}/https://raw.githubusercontent.com/ShourGG/tailamianban/main/deploy-cn.sh | sudo bash
        ;;
    uninstall)
        echo "卸载泰拉瑞亚管理平台..."
        sudo systemctl stop $SERVICE_NAME
        sudo systemctl disable $SERVICE_NAME
        sudo rm -f /etc/systemd/system/${SERVICE_NAME}.service
        sudo rm -rf $INSTALL_DIR
        sudo rm -f $0
        echo "卸载完成"
        ;;
    *)
        echo "泰拉瑞亚服务器管理平台 - 管理工具（中国大陆版）"
        echo ""
        echo "用法: terraria-admin <命令> [参数]"
        echo ""
        echo "命令:"
        echo "  start      启动服务"
        echo "  stop       停止服务"
        echo "  restart    重启服务"
        echo "  status     查看状态"
        echo "  logs       查看日志"
        echo "  port       查看/修改端口"
        echo "  update     更新到最新版本（镜像加速）"
        echo "  uninstall  卸载服务"
        echo ""
        echo "示例:"
        echo "  terraria-admin start"
        echo "  terraria-admin port 3000"
        echo "  terraria-admin logs"
        exit 1
        ;;
esac
EOFCLI
    
    chmod +x $CLI_PATH
    log_info "管理命令安装完成"
}

# 启动服务
start_service() {
    log_step "启动服务..."
    
    systemctl enable $SERVICE_NAME
    systemctl start $SERVICE_NAME
    
    sleep 2
    
    if systemctl is-active --quiet $SERVICE_NAME; then
        log_info "服务启动成功！"
    else
        log_error "服务启动失败，请查看日志: journalctl -u $SERVICE_NAME"
        exit 1
    fi
}

# 显示安装信息
show_info() {
    local port=$(grep -o '"port"[[:space:]]*:[[:space:]]*[0-9]*' $INSTALL_DIR/config.json | grep -o '[0-9]*' || echo "8080")
    local ip=$(hostname -I | awk '{print $1}')
    
    echo ""
    echo "========================================"
    echo -e "${GREEN}✅ 安装完成！${NC}"
    echo "========================================"
    echo ""
    echo "📍 访问地址: http://${ip}:${port}"
    echo "📁 安装目录: $INSTALL_DIR"
    echo "📝 配置文件: $INSTALL_DIR/config.json"
    echo "📋 日志目录: $INSTALL_DIR/logs"
    echo ""
    echo "🔧 管理命令:"
    echo "  terraria-admin start    - 启动服务"
    echo "  terraria-admin stop     - 停止服务"
    echo "  terraria-admin restart  - 重启服务"
    echo "  terraria-admin status   - 查看状态"
    echo "  terraria-admin logs     - 查看日志"
    echo "  terraria-admin port     - 修改端口"
    echo "  terraria-admin update   - 更新版本（镜像加速）"
    echo ""
    echo "🔐 默认账号:"
    echo "  用户名: CHENY 或 admin"
    echo "  密码: 123456 或 admin"
    echo ""
    echo "⚠️  首次登录后请立即修改密码！"
    echo ""
    echo "🌟 提示: 本脚本使用国内镜像站加速下载"
    echo "   镜像站点: ${GITHUB_MIRROR}"
    echo "========================================"
}

# 主函数
main() {
    echo "========================================"
    echo "  泰拉瑞亚服务器管理平台 - 自动部署"
    echo "       （中国大陆镜像加速版）"
    echo "========================================"
    echo ""
    
    check_root
    check_dependencies
    
    local arch=$(detect_arch)
    log_info "检测到架构: $arch"
    
    stop_service
    
    local temp_dir=$(download_release $arch)
    install_files $temp_dir
    
    # 清理临时文件
    rm -rf $temp_dir
    
    create_service
    install_cli
    start_service
    show_info
}

# 运行主函数
main "$@"
