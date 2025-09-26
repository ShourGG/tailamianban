#!/bin/bash

# Enhanced Terraria Panel Deployment Script
# 支持多种部署模式和高级功能

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT"
DIST_DIR="$PROJECT_ROOT/dist"

# Deployment modes
MODE="help"
ENVIRONMENT="development"
BUILD_ONLY=false
DEPLOY_ONLY=false
SKIP_TESTS=false
VERBOSE=false

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_debug() {
    if [[ "$VERBOSE" == "true" ]]; then
        echo -e "${BLUE}[DEBUG]${NC} $1"
    fi
}

# Show help
show_help() {
    cat << EOF
Enhanced Terraria Panel Deployment Script

Usage: $0 [OPTIONS] MODE

MODES:
    build           Build frontend and backend
    deploy          Deploy to production server
    dev             Start development environment
    test            Run tests
    clean           Clean build artifacts
    package         Create deployment package
    docker          Build and run Docker containers
    help            Show this help message

OPTIONS:
    -e, --env ENV           Set environment (development|staging|production)
    -b, --build-only        Only build, don't deploy
    -d, --deploy-only       Only deploy, don't build
    -s, --skip-tests        Skip running tests
    -v, --verbose           Enable verbose output
    -h, --help              Show this help message

EXAMPLES:
    $0 build                        # Build for development
    $0 build -e production          # Build for production
    $0 deploy -e staging            # Deploy to staging
    $0 dev                          # Start development server
    $0 test                         # Run all tests
    $0 package -e production        # Create production package
    $0 docker                       # Build and run with Docker

ENVIRONMENT VARIABLES:
    TERRARIA_ENV               Environment name
    TERRARIA_BUILD_VERSION     Build version override
    TERRARIA_SKIP_FRONTEND     Skip frontend build (true/false)
    TERRARIA_SKIP_BACKEND      Skip backend build (true/false)

EOF
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -e|--env)
                ENVIRONMENT="$2"
                shift 2
                ;;
            -b|--build-only)
                BUILD_ONLY=true
                shift
                ;;
            -d|--deploy-only)
                DEPLOY_ONLY=true
                shift
                ;;
            -s|--skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            build|deploy|dev|test|clean|package|docker|help)
                MODE="$1"
                shift
                ;;
            *)
                log_error "Unknown option: $1"
                ;;
        esac
    done
}

# Check prerequisites
check_prerequisites() {
    log_debug "Checking prerequisites..."
    
    # Check if we're in the right directory
    if [[ ! -f "$PROJECT_ROOT/package.json" ]]; then
        log_error "Not in project root directory. Please run from project root."
    fi
    
    # Check required tools based on mode
    case $MODE in
        build|dev|package)
            if [[ "${TERRARIA_SKIP_FRONTEND:-false}" != "true" ]] && ! command -v npm &> /dev/null; then
                log_warn "npm is not found in PATH, will skip frontend build"
                export TERRARIA_SKIP_FRONTEND=true
            fi

            if [[ "${TERRARIA_SKIP_BACKEND:-false}" != "true" ]] && ! command -v go &> /dev/null; then
                log_warn "Go is not found in PATH, will skip backend build"
                export TERRARIA_SKIP_BACKEND=true
            fi
            ;;
        docker)
            if ! command -v docker &> /dev/null; then
                log_error "Docker is required but not installed"
            fi
            ;;
    esac
    
    log_debug "Prerequisites check passed"
}

# Build frontend
build_frontend() {
    if [[ "${TERRARIA_SKIP_FRONTEND:-false}" == "true" ]]; then
        log_info "Skipping frontend build (TERRARIA_SKIP_FRONTEND=true)"
        return
    fi
    
    log_info "Building frontend for $ENVIRONMENT..."
    
    cd "$FRONTEND_DIR"
    
    # Install dependencies
    log_debug "Installing frontend dependencies..."
    npm ci
    
    # Run tests if not skipped
    if [[ "$SKIP_TESTS" != "true" ]]; then
        log_debug "Running frontend tests..."
        npm run test:unit || log_warn "Frontend tests failed"
    fi
    
    # Build
    if [[ "$ENVIRONMENT" == "production" ]]; then
        npm run build:prod
    else
        npm run build
    fi
    
    # Copy to backend dist directory
    mkdir -p "$BACKEND_DIR/dist"
    cp -r "$DIST_DIR"/* "$BACKEND_DIR/dist/"
    
    log_success "Frontend built successfully"
}

# Build backend
build_backend() {
    if [[ "${TERRARIA_SKIP_BACKEND:-false}" == "true" ]]; then
        log_info "Skipping backend build (TERRARIA_SKIP_BACKEND=true)"
        return
    fi
    
    log_info "Building backend for $ENVIRONMENT..."
    
    cd "$BACKEND_DIR"
    
    # Download dependencies
    log_debug "Downloading Go dependencies..."
    go mod download
    go mod tidy
    
    # Run tests if not skipped
    if [[ "$SKIP_TESTS" != "true" ]]; then
        log_debug "Running backend tests..."
        go test ./... || log_warn "Backend tests failed"
    fi
    
    # Set build variables
    VERSION="${TERRARIA_BUILD_VERSION:-$(git describe --tags --always 2>/dev/null || echo 'dev')}"
    BUILD_TIME="$(date -u '+%Y-%m-%d_%H:%M:%S')"
    
    # Build binary
    log_debug "Building binary..."
    if [[ "$ENVIRONMENT" == "production" ]]; then
        CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
            -ldflags="-s -w -X main.Version=$VERSION -X main.BuildTime=$BUILD_TIME" \
            -o terraria-panel \
            cmd/main.go
    else
        go build \
            -ldflags="-X main.Version=$VERSION -X main.BuildTime=$BUILD_TIME" \
            -o terraria-panel \
            cmd/main.go
    fi
    
    chmod +x terraria-panel
    
    log_success "Backend built successfully"
}

# Clean build artifacts
clean_build() {
    log_info "Cleaning build artifacts..."

    # Clean frontend
    rm -rf "$DIST_DIR"
    rm -rf "$FRONTEND_DIR/node_modules/.cache"

    # Clean backend
    rm -f "$BACKEND_DIR/terraria-panel"
    rm -f "$BACKEND_DIR/terraria-panel.exe"
    rm -rf "$BACKEND_DIR/dist"

    log_success "Build artifacts cleaned"
}

# Create deployment package
create_package() {
    log_info "Creating deployment package..."

    # Build first if not deploy-only
    if [[ "$DEPLOY_ONLY" != "true" ]]; then
        build_frontend
        build_backend
    fi

    # Create package directory
    PACKAGE_DIR="$PROJECT_ROOT/package"
    rm -rf "$PACKAGE_DIR"
    mkdir -p "$PACKAGE_DIR"

    # Copy necessary files
    cp -r "$BACKEND_DIR/dist" "$PACKAGE_DIR/"
    cp "$BACKEND_DIR/terraria-panel" "$PACKAGE_DIR/"
    cp -r "$PROJECT_ROOT/deploy" "$PACKAGE_DIR/"
    cp "$PROJECT_ROOT/README.md" "$PACKAGE_DIR/"

    # Create archive
    cd "$PROJECT_ROOT"
    tar -czf "terraria-panel-${ENVIRONMENT}-$(date +%Y%m%d-%H%M%S).tar.gz" -C package .

    log_success "Package created: terraria-panel-${ENVIRONMENT}-$(date +%Y%m%d-%H%M%S).tar.gz"
}

# Start development environment
start_dev() {
    log_info "Starting development environment..."

    # Build if needed
    if [[ ! -f "$BACKEND_DIR/terraria-panel" ]]; then
        build_backend
    fi

    if [[ ! -d "$BACKEND_DIR/dist" ]]; then
        build_frontend
    fi

    # Start backend
    cd "$BACKEND_DIR"
    export GIN_MODE=debug
    export TERRARIA_ENV=development

    log_info "Starting backend server on :8080..."
    ./terraria-panel
}

# Run tests
run_tests() {
    log_info "Running tests..."

    # Frontend tests
    if [[ "${TERRARIA_SKIP_FRONTEND:-false}" != "true" ]]; then
        log_info "Running frontend tests..."
        cd "$FRONTEND_DIR"
        npm ci
        npm run test:unit
    fi

    # Backend tests
    if [[ "${TERRARIA_SKIP_BACKEND:-false}" != "true" ]]; then
        log_info "Running backend tests..."
        cd "$BACKEND_DIR"
        go test -v ./...
    fi

    log_success "All tests completed"
}

# Main execution
main() {
    log_info "Enhanced Terraria Panel Deployment Script"
    log_info "Mode: $MODE | Environment: $ENVIRONMENT"

    case $MODE in
        help)
            show_help
            ;;
        build)
            check_prerequisites
            build_frontend
            build_backend
            log_success "Build completed successfully!"
            ;;
        clean)
            clean_build
            ;;
        package)
            check_prerequisites
            create_package
            ;;
        dev)
            check_prerequisites
            start_dev
            ;;
        test)
            check_prerequisites
            run_tests
            ;;
        *)
            log_error "Mode '$MODE' not implemented yet. Use 'help' for available modes."
            ;;
    esac
}

# Parse arguments and run
parse_args "$@"
main
