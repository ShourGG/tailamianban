#!/bin/bash

# ===================================================================
# 🚀 Terraria Panel Ultimate Deploy Script - 终极一键部署
# 老王精心打造的终极部署方案，一键搞定一切！
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

# Default configuration
DEFAULT_PORT=8080
DEFAULT_BACKEND_PATH="./backend"
SERVICE_NAME="terraria-panel"
PID_FILE="/tmp/terraria-panel.pid"

print_banner() {
    echo ""
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║${CYAN}                  🎮 TERRARIA PANEL ULTRA DEPLOY             ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${YELLOW}                    终极一键部署系统 v2.0                      ${PURPLE}║${NC}"
    echo -e "${PURPLE}║                                                              ║${NC}"
    echo -e "${PURPLE}║${GREEN}  ✨ 单端口部署 | 🎯 智能端口管理 | 🔄 自动重启               ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${GREEN}  🛡️  零配置安全 | 📊 实时监控 | 🚀 生产级性能                ${PURPLE}║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_help() {
    echo -e "${BOLD}Usage:${NC}"
    echo "  $0 [COMMAND] [OPTIONS]"
    echo ""
    echo -e "${BOLD}Commands:${NC}"
    echo -e "  ${GREEN}build${NC}     构建项目 (前端+后端)"
    echo -e "  ${GREEN}start${NC}     启动服务 (默认前台运行)"
    echo -e "  ${GREEN}daemon${NC}    后台守护进程模式启动"
    echo -e "  ${GREEN}stop${NC}      停止服务"
    echo -e "  ${GREEN}restart${NC}   重启服务"
    echo -e "  ${GREEN}status${NC}    查看服务状态"
    echo -e "  ${GREEN}logs${NC}      查看服务日志"
    echo -e "  ${GREEN}deploy${NC}    完整部署 (构建+启动)"
    echo -e "  ${GREEN}help${NC}      显示帮助信息"
    echo ""
    echo -e "${BOLD}Options:${NC}"
    echo -e "  ${CYAN}-p, --port${NC}      指定端口 (默认: $DEFAULT_PORT)"
    echo -e "  ${CYAN}-d, --dir${NC}       指定后端目录 (默认: $DEFAULT_BACKEND_PATH)"
    echo -e "  ${CYAN}-f, --foreground${NC} 前台运行 (仅对daemon有效)"
    echo ""
    echo -e "${BOLD}Examples:${NC}"
    echo "  $0 deploy                    # 完整部署到默认端口8080"
    echo "  $0 deploy -p 9090           # 部署到端口9090"
    echo "  $0 start -d ./my-backend    # 从指定目录启动"
    echo "  $0 daemon                   # 后台守护进程模式"
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

# Check if port is available
check_port() {
    local port=$1
    if command -v netstat >/dev/null 2>&1; then
        if netstat -tuln | grep -q ":$port "; then
            return 1
        fi
    elif command -v ss >/dev/null 2>&1; then
        if ss -tuln | grep -q ":$port "; then
            return 1
        fi
    fi
    return 0
}

# Find available port starting from given port
find_available_port() {
    local start_port=$1
    local port=$start_port

    while ! check_port $port; do
        port=$((port + 1))
        if [ $port -gt 65535 ]; then
            log_error "No available ports found!"
            exit 1
        fi
    done

    echo $port
}

# Validate dependencies
check_dependencies() {
    log_step "Checking Dependencies"

    local missing_deps=()

    if ! command -v node >/dev/null 2>&1; then
        missing_deps+=("Node.js")
    fi

    if ! command -v npm >/dev/null 2>&1; then
        missing_deps+=("npm")
    fi

    if ! command -v go >/dev/null 2>&1; then
        missing_deps+=("Go")
    fi

    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "Missing dependencies: ${missing_deps[*]}"
        echo ""
        echo -e "${YELLOW}Please install the missing dependencies:${NC}"
        for dep in "${missing_deps[@]}"; do
            echo "  • $dep"
        done
        exit 1
    fi

    log_success "All dependencies available"
    log_info "Node: $(node --version)"
    log_info "npm: $(npm --version)"
    log_info "Go: $(go version | awk '{print $3}')"
}

# Build project using ultra build script
build_project() {
    log_step "Building Project"

    if [ ! -f "scripts/build-ultra.sh" ]; then
        log_error "Ultra build script not found: scripts/build-ultra.sh"
        exit 1
    fi

    log_info "Executing ultra build script..."
    chmod +x scripts/build-ultra.sh

    if bash scripts/build-ultra.sh; then
        log_success "Build completed successfully!"
    else
        log_error "Build failed!"
        exit 1
    fi
}

# Get binary name based on OS
get_binary_name() {
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        echo "terraria-panel.exe"
    else
        echo "terraria-panel"
    fi
}

# Start service in foreground
start_service() {
    local port=$1
    local backend_dir=$2
    local binary_name=$(get_binary_name)

    log_step "Starting Terraria Panel Service"

    # Validate backend directory and binary
    if [ ! -d "$backend_dir" ]; then
        log_error "Backend directory not found: $backend_dir"
        exit 1
    fi

    if [ ! -f "$backend_dir/$binary_name" ]; then
        log_error "Backend binary not found: $backend_dir/$binary_name"
        log_warning "Please run 'build' command first"
        exit 1
    fi

    # Check if port is available
    if ! check_port $port; then
        log_warning "Port $port is already in use!"
        local new_port=$(find_available_port $port)
        log_info "Using available port: $new_port"
        port=$new_port
    fi

    log_info "Starting server on port $port..."
    log_info "Access panel at: http://localhost:$port"
    log_info "Press Ctrl+C to stop the server"
    echo ""

    cd "$backend_dir"

    # Set environment variables
    export SERVER_PORT=$port

    # Start the server
    exec ./$binary_name
}

# Start service as daemon
start_daemon() {
    local port=$1
    local backend_dir=$2
    local binary_name=$(get_binary_name)

    log_step "Starting Daemon Service"

    # Check if already running
    if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
        log_warning "Service is already running (PID: $(cat "$PID_FILE"))"
        return 0
    fi

    # Validate backend
    if [ ! -f "$backend_dir/$binary_name" ]; then
        log_error "Backend binary not found: $backend_dir/$binary_name"
        exit 1
    fi

    # Find available port
    if ! check_port $port; then
        port=$(find_available_port $port)
        log_info "Using available port: $port"
    fi

    log_info "Starting daemon on port $port..."

    cd "$backend_dir"

    # Start daemon with nohup
    nohup ./$binary_name > terraria-panel.log 2>&1 &
    local pid=$!

    # Save PID
    echo $pid > "$PID_FILE"

    # Wait a moment and check if process is still running
    sleep 2
    if kill -0 $pid 2>/dev/null; then
        log_success "Daemon started successfully (PID: $pid)"
        log_info "Access panel at: http://localhost:$port"
        log_info "Log file: $backend_dir/terraria-panel.log"
    else
        log_error "Failed to start daemon"
        rm -f "$PID_FILE"
        exit 1
    fi
}

# Stop service
stop_service() {
    log_step "Stopping Service"

    if [ ! -f "$PID_FILE" ]; then
        log_warning "PID file not found, service may not be running"
        return 0
    fi

    local pid=$(cat "$PID_FILE")

    if kill -0 "$pid" 2>/dev/null; then
        log_info "Stopping service (PID: $pid)..."
        kill "$pid"

        # Wait for graceful shutdown
        local count=0
        while kill -0 "$pid" 2>/dev/null && [ $count -lt 10 ]; do
            sleep 1
            count=$((count + 1))
        done

        # Force kill if still running
        if kill -0 "$pid" 2>/dev/null; then
            log_warning "Force killing service..."
            kill -9 "$pid"
        fi

        rm -f "$PID_FILE"
        log_success "Service stopped successfully"
    else
        log_warning "Service not running"
        rm -f "$PID_FILE"
    fi
}

# Check service status
check_status() {
    log_step "Service Status"

    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            log_success "Service is running (PID: $pid)"

            # Show port info if possible
            if command -v netstat >/dev/null 2>&1; then
                local port_info=$(netstat -tlnp 2>/dev/null | grep "$pid" | head -1 | awk '{print $4}' | sed 's/.*://')
                if [ -n "$port_info" ]; then
                    log_info "Listening on port: $port_info"
                    log_info "Panel URL: http://localhost:$port_info"
                fi
            fi
            return 0
        else
            log_warning "PID file exists but service not running"
            rm -f "$PID_FILE"
            return 1
        fi
    else
        log_warning "Service is not running"
        return 1
    fi
}

# Show logs
show_logs() {
    local backend_dir=$1
    local log_file="$backend_dir/terraria-panel.log"

    log_step "Service Logs"

    if [ ! -f "$log_file" ]; then
        log_warning "Log file not found: $log_file"
        return 1
    fi

    log_info "Showing last 50 lines of log file:"
    echo ""
    tail -50 "$log_file"
}

# Parse command line arguments
parse_args() {
    COMMAND=""
    PORT=$DEFAULT_PORT
    BACKEND_DIR=$DEFAULT_BACKEND_PATH
    FOREGROUND=false

    while [[ $# -gt 0 ]]; do
        case $1 in
            build|start|daemon|stop|restart|status|logs|deploy|help)
                COMMAND=$1
                shift
                ;;
            -p|--port)
                PORT=$2
                shift 2
                ;;
            -d|--dir)
                BACKEND_DIR=$2
                shift 2
                ;;
            -f|--foreground)
                FOREGROUND=true
                shift
                ;;
            *)
                log_error "Unknown option: $1"
                print_help
                exit 1
                ;;
        esac
    done

    if [ -z "$COMMAND" ]; then
        COMMAND="help"
    fi
}

# Main execution
main() {
    parse_args "$@"

    case $COMMAND in
        build)
            print_banner
            check_dependencies
            build_project
            ;;
        start)
            print_banner
            start_service $PORT $BACKEND_DIR
            ;;
        daemon)
            print_banner
            start_daemon $PORT $BACKEND_DIR
            ;;
        stop)
            print_banner
            stop_service
            ;;
        restart)
            print_banner
            stop_service
            sleep 2
            start_daemon $PORT $BACKEND_DIR
            ;;
        status)
            print_banner
            check_status
            ;;
        logs)
            print_banner
            show_logs $BACKEND_DIR
            ;;
        deploy)
            print_banner
            check_dependencies
            build_project
            echo ""
            log_step "Deployment Complete!"
            log_success "Your Terraria Panel is ready to use!"
            echo ""
            log_info "Next steps:"
            echo "  1. Start the service: $0 daemon -p $PORT"
            echo "  2. Access the panel: http://localhost:$PORT"
            echo "  3. Check status: $0 status"
            echo "  4. View logs: $0 logs"
            echo ""
            ;;
        help|*)
            print_banner
            print_help
            ;;
    esac
}

# Run main function
main "$@"