#!/bin/bash

###########################################
# 泰拉瑞亚面板管理脚本 v1.0
# Terraria Panel Management Script
###########################################

# 用户可配置变量
PORT=8080
DATA_DIR="./data"
LOG_DIR="./logs"
PANEL_NAME="terraria-panel"

# 系统变量 (请勿修改)
USER=$(whoami)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BINARY_PATH="$PROJECT_DIR/$PANEL_NAME"
PID_FILE="$DATA_DIR/$PANEL_NAME.pid"
LOG_FILE="$LOG_DIR/$PANEL_NAME.log"

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

# 检查是否为root用户
function check_root() {
    if [[ "${USER}" == "root" ]]; then
        echo_yellow "⚠️  检测到root用户，建议使用普通用户运行面板"
        echo_yellow "⚠️  Running as root detected, recommend using regular user"
        read -p "是否继续? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# 创建必要目录
function create_dirs() {
    mkdir -p "$DATA_DIR" "$LOG_DIR"
}

# 检查二进制文件
function check_binary() {
    if [[ ! -f "$BINARY_PATH" ]]; then
        echo_red "❌ 未找到面板程序: $BINARY_PATH"
        echo_red "❌ Panel binary not found: $BINARY_PATH"
        echo_yellow "请确保已正确下载完整的发布包"
        echo_yellow "Please ensure you have downloaded the complete release package"
        exit 1
    fi
    
    if [[ ! -x "$BINARY_PATH" ]]; then
        echo_yellow "🔧 设置执行权限..."
        chmod +x "$BINARY_PATH"
    fi
}

# 获取进程PID
function get_pid() {
    if [[ -f "$PID_FILE" ]]; then
        local pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            echo "$pid"
        else
            rm -f "$PID_FILE"
            echo ""
        fi
    else
        echo ""
    fi
}

# 检查面板状态
function check_status() {
    local pid=$(get_pid)
    if [[ -n "$pid" ]]; then
        echo_green "✅ 面板正在运行 (PID: $pid)"
        echo_green "✅ Panel is running (PID: $pid)"
        echo_cyan "🌐 访问地址: http://localhost:$PORT"
        echo_cyan "🌐 Access URL: http://localhost:$PORT"
        return 0
    else
        echo_red "❌ 面板未运行"
        echo_red "❌ Panel is not running"
        return 1
    fi
}

# 启动面板
function start_panel() {
    echo_blue "🚀 启动泰拉瑞亚面板..."
    echo_blue "🚀 Starting Terraria Panel..."
    
    local pid=$(get_pid)
    if [[ -n "$pid" ]]; then
        echo_yellow "⚠️  面板已在运行 (PID: $pid)"
        echo_yellow "⚠️  Panel is already running (PID: $pid)"
        return 1
    fi
    
    # 设置环境变量
    export PORT="$PORT"
    export DATA_DIR="$DATA_DIR"
    export GIN_MODE="release"
    
    # 启动面板
    nohup "$BINARY_PATH" > "$LOG_FILE" 2>&1 &
    local new_pid=$!
    
    # 保存PID
    echo "$new_pid" > "$PID_FILE"
    
    # 等待启动
    sleep 2
    
    # 检查是否启动成功
    if kill -0 "$new_pid" 2>/dev/null; then
        echo_green "✅ 面板启动成功!"
        echo_green "✅ Panel started successfully!"
        echo_cyan "🌐 访问地址: http://localhost:$PORT"
        echo_cyan "🌐 Access URL: http://localhost:$PORT"
        echo_yellow "📝 默认账号: admin / admin123"
        echo_yellow "📝 Default account: admin / admin123"
        echo_yellow "⚠️  请及时修改默认密码!"
        echo_yellow "⚠️  Please change the default password!"
    else
        echo_red "❌ 面板启动失败"
        echo_red "❌ Failed to start panel"
        rm -f "$PID_FILE"
        echo_yellow "📋 查看日志: tail -f $LOG_FILE"
        return 1
    fi
}

# 停止面板
function stop_panel() {
    echo_blue "🛑 停止泰拉瑞亚面板..."
    echo_blue "🛑 Stopping Terraria Panel..."
    
    local pid=$(get_pid)
    if [[ -z "$pid" ]]; then
        echo_yellow "⚠️  面板未运行"
        echo_yellow "⚠️  Panel is not running"
        return 1
    fi
    
    # 发送TERM信号
    kill "$pid"
    
    # 等待进程结束
    local count=0
    while kill -0 "$pid" 2>/dev/null && [[ $count -lt 10 ]]; do
        sleep 1
        ((count++))
    done
    
    # 如果进程仍在运行，强制杀死
    if kill -0 "$pid" 2>/dev/null; then
        echo_yellow "⚠️  强制停止进程..."
        echo_yellow "⚠️  Force killing process..."
        kill -9 "$pid"
        sleep 1
    fi
    
    # 清理PID文件
    rm -f "$PID_FILE"
    
    echo_green "✅ 面板已停止"
    echo_green "✅ Panel stopped"
}

# 重启面板
function restart_panel() {
    echo_blue "🔄 重启泰拉瑞亚面板..."
    echo_blue "🔄 Restarting Terraria Panel..."
    
    stop_panel
    sleep 2
    start_panel
}

# 查看日志
function show_logs() {
    if [[ -f "$LOG_FILE" ]]; then
        echo_blue "📋 面板日志 (按 Ctrl+C 退出):"
        echo_blue "📋 Panel logs (Press Ctrl+C to exit):"
        tail -f "$LOG_FILE"
    else
        echo_yellow "⚠️  日志文件不存在: $LOG_FILE"
        echo_yellow "⚠️  Log file not found: $LOG_FILE"
    fi
}

# 清理日志
function clear_logs() {
    if [[ -f "$LOG_FILE" ]]; then
        > "$LOG_FILE"
        echo_green "✅ 日志已清理"
        echo_green "✅ Logs cleared"
    else
        echo_yellow "⚠️  日志文件不存在"
        echo_yellow "⚠️  Log file not found"
    fi
}

# 显示系统信息
function show_info() {
    echo_cyan "📊 系统信息 / System Information"
    echo "=================================="
    echo "面板版本 / Panel Version: $($BINARY_PATH --version 2>/dev/null | head -1 || echo 'Unknown')"
    echo "运行用户 / User: $USER"
    echo "工作目录 / Working Dir: $PROJECT_DIR"
    echo "数据目录 / Data Dir: $DATA_DIR"
    echo "日志目录 / Log Dir: $LOG_DIR"
    echo "监听端口 / Port: $PORT"
    echo "PID文件 / PID File: $PID_FILE"
    echo "日志文件 / Log File: $LOG_FILE"
    echo "=================================="
    
    # 显示运行状态
    check_status
    
    # 显示系统资源
    echo_cyan "💻 系统资源 / System Resources"
    echo "CPU: $(nproc) cores"
    echo "内存 / Memory: $(free -h | awk '/^Mem:/ {print $2}' 2>/dev/null || echo 'Unknown')"
    echo "磁盘 / Disk: $(df -h . | awk 'NR==2 {print $4}' 2>/dev/null || echo 'Unknown') available"
}

# 显示帮助信息
function show_help() {
    echo_cyan "🎮 泰拉瑞亚面板管理脚本"
    echo_cyan "🎮 Terraria Panel Management Script"
    echo
    echo "用法 / Usage: $0 [命令]"
    echo
    echo "可用命令 / Available commands:"
    echo "  start     启动面板 / Start panel"
    echo "  stop      停止面板 / Stop panel"
    echo "  restart   重启面板 / Restart panel"
    echo "  status    查看状态 / Check status"
    echo "  logs      查看日志 / View logs"
    echo "  clear     清理日志 / Clear logs"
    echo "  info      系统信息 / System info"
    echo "  help      显示帮助 / Show help"
    echo
    echo "示例 / Examples:"
    echo "  $0 start    # 启动面板"
    echo "  $0 status   # 查看状态"
    echo "  $0 logs     # 查看实时日志"
    echo
    echo "配置 / Configuration:"
    echo "  端口 / Port: $PORT"
    echo "  数据目录 / Data Dir: $DATA_DIR"
    echo "  日志目录 / Log Dir: $LOG_DIR"
}

# 主函数
function main() {
    # 检查用户权限
    check_root
    
    # 创建必要目录
    create_dirs
    
    # 检查二进制文件
    check_binary
    
    # 处理命令
    case "${1:-help}" in
        "start")
            start_panel
            ;;
        "stop")
            stop_panel
            ;;
        "restart")
            restart_panel
            ;;
        "status")
            check_status
            ;;
        "logs")
            show_logs
            ;;
        "clear")
            clear_logs
            ;;
        "info")
            show_info
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            echo_red "❌ 未知命令: $1"
            echo_red "❌ Unknown command: $1"
            echo
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"