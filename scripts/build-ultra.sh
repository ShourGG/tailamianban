#!/bin/bash

# ===================================================================
# 🎮 Terraria Panel Ultra Build Script - 单端口部署专用
# 老王精心打造的完美构建脚本，一次构建，完美部署！
# ===================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_header() {
    echo ""
    echo -e "${PURPLE}=======================================================${NC}"
    echo -e "${CYAN}🎮 Terraria Panel Ultra Build System${NC}"
    echo -e "${YELLOW}    单端口部署 - 面板+后端一体化方案${NC}"
    echo -e "${PURPLE}=======================================================${NC}"
    echo ""
}

print_step() {
    echo -e "${BLUE}📋 Step $1: ${GREEN}$2${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

# Check if node is available
check_dependencies() {
    print_step "1" "Checking dependencies"

    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed!"
        exit 1
    fi

    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed!"
        exit 1
    fi

    if ! command -v go &> /dev/null; then
        print_error "Go is not installed!"
        exit 1
    fi

    print_success "All dependencies are available"
    echo "   Node: $(node --version)"
    echo "   npm: $(npm --version)"
    echo "   Go: $(go version | awk '{print $3}')"
    echo ""
}

# Clean previous builds
clean_builds() {
    print_step "2" "Cleaning previous builds"

    if [ -d "dist" ]; then
        rm -rf dist
        print_info "Removed frontend dist directory"
    fi

    if [ -d "backend/dist" ]; then
        rm -rf backend/dist
        print_info "Removed backend dist directory"
    fi

    if [ -f "backend/terraria-panel" ]; then
        rm -f backend/terraria-panel
        print_info "Removed previous backend binary"
    fi

    if [ -f "backend/terraria-panel.exe" ]; then
        rm -f backend/terraria-panel.exe
        print_info "Removed previous backend binary (Windows)"
    fi

    print_success "Cleanup completed"
    echo ""
}

# Build frontend
build_frontend() {
    print_step "3" "Building frontend (Production Mode)"

    print_info "Running frontend build with production optimizations..."

    if npm run build; then
        print_success "Frontend build completed successfully!"

        # Check build size
        if [ -d "dist" ]; then
            local build_size=$(du -sh dist | cut -f1)
            print_info "Build size: $build_size"
        fi
        echo ""
    else
        print_error "Frontend build failed!"
        exit 1
    fi
}

# Copy frontend to backend
copy_frontend() {
    print_step "4" "Copying frontend to backend"

    if [ ! -d "dist" ]; then
        print_error "Frontend dist directory not found!"
        exit 1
    fi

    # Create backend dist directory
    mkdir -p backend/dist

    # Copy all frontend files
    cp -r dist/* backend/dist/

    print_success "Frontend files copied to backend/dist/"

    # List some key files
    print_info "Key files in backend/dist/:"
    ls -la backend/dist/ | head -10
    echo ""
}

# Build backend
build_backend() {
    print_step "5" "Building backend (Go Binary)"

    cd backend

    print_info "Compiling Go backend..."

    # Determine binary name based on OS
    local binary_name="terraria-panel"
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        binary_name="terraria-panel.exe"
    fi

    # Build with optimizations
    if go build -ldflags="-s -w" -o "$binary_name" cmd/main.go; then
        print_success "Backend compiled successfully: $binary_name"

        # Check binary size
        local binary_size=$(du -sh "$binary_name" | cut -f1)
        print_info "Binary size: $binary_size"
        echo ""
    else
        print_error "Backend build failed!"
        exit 1
    fi

    cd ..
}

# Final validation
validate_build() {
    print_step "6" "Validating build results"

    # Check frontend files
    if [ ! -d "backend/dist" ] || [ ! -f "backend/dist/index.html" ]; then
        print_error "Frontend files not found in backend/dist/"
        exit 1
    fi

    # Check backend binary
    local binary_name="terraria-panel"
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        binary_name="terraria-panel.exe"
    fi

    if [ ! -f "backend/$binary_name" ]; then
        print_error "Backend binary not found!"
        exit 1
    fi

    print_success "Build validation passed!"
    echo ""
}

# Print deployment instructions
print_deployment_info() {
    echo -e "${PURPLE}=======================================================${NC}"
    echo -e "${GREEN}🚀 Build Completed Successfully!${NC}"
    echo -e "${PURPLE}=======================================================${NC}"
    echo ""
    echo -e "${YELLOW}📋 Deployment Instructions:${NC}"
    echo ""
    echo -e "${CYAN}1. Single-Port Server:${NC}"
    echo "   cd backend"

    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        echo "   ./terraria-panel.exe"
    else
        echo "   ./terraria-panel"
    fi

    echo ""
    echo -e "${CYAN}2. Access Points:${NC}"
    echo "   🌐 管理面板: http://localhost:8080"
    echo "   🎮 API接口: http://localhost:8080/api/*"
    echo "   🔗 WebSocket: ws://localhost:8080/ws/*"
    echo ""
    echo -e "${CYAN}3. Game Servers:${NC}"
    echo "   🎯 默认端口: 7777 (用户可自定义)"
    echo "   📈 端口范围: 1024-65535"
    echo ""
    echo -e "${YELLOW}💡 Pro Tips:${NC}"
    echo "   • 面板和后端API共享端口8080"
    echo "   • 游戏服务器使用独立端口"
    echo "   • 支持端口冲突自动检测"
    echo "   • 支持一键获取可用端口"
    echo ""
    echo -e "${GREEN}🎉 Enjoy your Terraria Panel!${NC}"
    echo -e "${PURPLE}=======================================================${NC}"
}

# Main execution
main() {
    print_header
    check_dependencies
    clean_builds
    build_frontend
    copy_frontend
    build_backend
    validate_build
    print_deployment_info
}

# Run the main function
main