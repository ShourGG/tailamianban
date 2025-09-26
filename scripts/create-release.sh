#!/bin/bash

# Terraria Panel Release Package Creator
# 创建 GitHub Release 发布包

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
RELEASE_DIR="$PROJECT_ROOT/release"
VERSION="${1:-v1.0.0}"

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

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if we're in the right directory
    if [[ ! -f "$PROJECT_ROOT/package.json" ]]; then
        log_error "Not in project root directory"
    fi
    
    # Check if binaries exist
    if [[ ! -f "$PROJECT_ROOT/backend/terraria-panel" ]]; then
        log_error "Linux binary not found: backend/terraria-panel"
    fi
    
    if [[ ! -f "$PROJECT_ROOT/backend/terraria-panel.exe" ]]; then
        log_warn "Windows binary not found: backend/terraria-panel.exe"
    fi
    
    # Check if frontend dist exists
    if [[ ! -d "$PROJECT_ROOT/backend/dist" ]]; then
        log_error "Frontend dist not found: backend/dist/"
    fi
    
    log_success "Prerequisites check passed"
}

# Create release directory structure
create_release_structure() {
    log_info "Creating release structure..."
    
    # Clean and create release directory
    rm -rf "$RELEASE_DIR"
    mkdir -p "$RELEASE_DIR"
    
    # Create package directories
    mkdir -p "$RELEASE_DIR/terraria-panel-linux"
    mkdir -p "$RELEASE_DIR/terraria-panel-windows"
    mkdir -p "$RELEASE_DIR/terraria-panel-source"
    
    log_success "Release structure created"
}

# Package Linux version
package_linux() {
    log_info "Packaging Linux version..."
    
    local linux_dir="$RELEASE_DIR/terraria-panel-linux"
    
    # Copy binary
    cp "$PROJECT_ROOT/backend/terraria-panel" "$linux_dir/"
    chmod +x "$linux_dir/terraria-panel"
    
    # Copy frontend
    cp -r "$PROJECT_ROOT/backend/dist" "$linux_dir/"
    
    # Copy deployment files
    cp -r "$PROJECT_ROOT/deploy" "$linux_dir/"
    
    # Copy documentation
    cp "$PROJECT_ROOT/README.md" "$linux_dir/"
    cp "$PROJECT_ROOT/DEPLOYMENT.md" "$linux_dir/"
    cp "$PROJECT_ROOT/RELEASE.md" "$linux_dir/"
    
    # Create startup script
    cat > "$linux_dir/start.sh" << 'EOF'
#!/bin/bash
# Terraria Panel Startup Script

cd "$(dirname "$0")"

# Check if running as root
if [[ $EUID -eq 0 ]]; then
    echo "Warning: Running as root is not recommended"
fi

# Set environment variables
export GIN_MODE=release
export TERRARIA_ENV=production

# Start the application
echo "Starting Terraria Panel..."
./terraria-panel
EOF
    chmod +x "$linux_dir/start.sh"
    
    # Create archive
    cd "$RELEASE_DIR"
    tar -czf "terraria-panel-${VERSION}-linux-amd64.tar.gz" terraria-panel-linux/
    
    log_success "Linux package created: terraria-panel-${VERSION}-linux-amd64.tar.gz"
}

# Package Windows version
package_windows() {
    if [[ ! -f "$PROJECT_ROOT/backend/terraria-panel.exe" ]]; then
        log_warn "Skipping Windows package (binary not found)"
        return
    fi
    
    log_info "Packaging Windows version..."
    
    local windows_dir="$RELEASE_DIR/terraria-panel-windows"
    
    # Copy binary
    cp "$PROJECT_ROOT/backend/terraria-panel.exe" "$windows_dir/"
    
    # Copy frontend
    cp -r "$PROJECT_ROOT/backend/dist" "$windows_dir/"
    
    # Copy deployment files (Windows compatible)
    mkdir -p "$windows_dir/deploy"
    cp -r "$PROJECT_ROOT/deploy/configs" "$windows_dir/deploy/" 2>/dev/null || true
    cp -r "$PROJECT_ROOT/deploy/docs" "$windows_dir/deploy/" 2>/dev/null || true
    
    # Copy documentation
    cp "$PROJECT_ROOT/README.md" "$windows_dir/"
    cp "$PROJECT_ROOT/DEPLOYMENT.md" "$windows_dir/"
    cp "$PROJECT_ROOT/RELEASE.md" "$windows_dir/"
    
    # Create startup script
    cat > "$windows_dir/start.bat" << 'EOF'
@echo off
cd /d "%~dp0"

echo Starting Terraria Panel...
set GIN_MODE=release
set TERRARIA_ENV=production

terraria-panel.exe
pause
EOF
    
    # Create archive
    cd "$RELEASE_DIR"
    if command -v zip &> /dev/null; then
        zip -r "terraria-panel-${VERSION}-windows-amd64.zip" terraria-panel-windows/
        log_success "Windows package created: terraria-panel-${VERSION}-windows-amd64.zip"
    else
        tar -czf "terraria-panel-${VERSION}-windows-amd64.tar.gz" terraria-panel-windows/
        log_success "Windows package created: terraria-panel-${VERSION}-windows-amd64.tar.gz"
    fi
}

# Create source package (deployment only)
package_source() {
    log_info "Creating source package..."
    
    local source_dir="$RELEASE_DIR/terraria-panel-source"
    
    # Copy deployment files
    cp -r "$PROJECT_ROOT/deploy" "$source_dir/"
    cp -r "$PROJECT_ROOT/scripts" "$source_dir/"
    
    # Copy documentation
    cp "$PROJECT_ROOT/README.md" "$source_dir/"
    cp "$PROJECT_ROOT/DEPLOYMENT.md" "$source_dir/"
    cp "$PROJECT_ROOT/RELEASE.md" "$source_dir/"
    cp "$PROJECT_ROOT/CHANGELOG.md" "$source_dir/" 2>/dev/null || true
    
    # Copy configuration examples
    cp "$PROJECT_ROOT/.gitignore" "$source_dir/gitignore.example" 2>/dev/null || true
    
    # Create archive
    cd "$RELEASE_DIR"
    tar -czf "terraria-panel-${VERSION}-source.tar.gz" terraria-panel-source/
    
    log_success "Source package created: terraria-panel-${VERSION}-source.tar.gz"
}

# Generate checksums
generate_checksums() {
    log_info "Generating checksums..."
    
    cd "$RELEASE_DIR"
    
    # Generate SHA256 checksums
    if command -v sha256sum &> /dev/null; then
        sha256sum *.tar.gz *.zip 2>/dev/null > "terraria-panel-${VERSION}-checksums.txt" || true
    elif command -v shasum &> /dev/null; then
        shasum -a 256 *.tar.gz *.zip 2>/dev/null > "terraria-panel-${VERSION}-checksums.txt" || true
    fi
    
    log_success "Checksums generated"
}

# Create release notes
create_release_notes() {
    log_info "Creating release notes..."
    
    cat > "$RELEASE_DIR/RELEASE_NOTES.md" << EOF
# Terraria Panel ${VERSION} Release Notes

## 📦 Download Links

### Linux (Recommended)
- **Full Package**: \`terraria-panel-${VERSION}-linux-amd64.tar.gz\`
- **One-line Install**: 
  \`\`\`bash
  curl -fsSL https://raw.githubusercontent.com/ShourGG/tailamianban/main/deploy/scripts/install.sh | bash
  \`\`\`

### Windows
- **Full Package**: \`terraria-panel-${VERSION}-windows-amd64.zip\`

### Source/Deployment Only
- **Deployment Scripts**: \`terraria-panel-${VERSION}-source.tar.gz\`

## 🚀 Quick Start

### Linux Server (Recommended)
1. Download and extract the Linux package
2. Run: \`sudo ./deploy/scripts/install.sh\`
3. Access: \`http://your-server-ip\`

### Manual Installation
1. Download the appropriate package for your OS
2. Extract to \`/opt/terraria-panel\` (Linux) or \`C:\terraria-panel\` (Windows)
3. Run \`./start.sh\` (Linux) or \`start.bat\` (Windows)

## 📋 System Requirements

- **Linux**: Ubuntu 18.04+, Debian 9+, CentOS 7+, RHEL 7+, Fedora 30+
- **Windows**: Windows 10+ (for development/testing)
- **Memory**: 1GB+ RAM
- **Storage**: 2GB+ available space

## 🔐 Security Notes

- Change default passwords after installation
- Configure firewall rules appropriately
- Use HTTPS in production environments
- Regular security updates recommended

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/ShourGG/tailamianban/issues)
- **Documentation**: [Deployment Guide](./DEPLOYMENT.md)

---
**Generated on $(date)**
EOF
    
    log_success "Release notes created"
}

# Main execution
main() {
    log_info "Creating Terraria Panel ${VERSION} release packages..."
    
    check_prerequisites
    create_release_structure
    package_linux
    package_windows
    package_source
    generate_checksums
    create_release_notes
    
    echo
    log_success "=========================================="
    log_success "Release packages created successfully!"
    log_success "=========================================="
    echo
    echo "📦 Release files:"
    ls -la "$RELEASE_DIR"/*.tar.gz "$RELEASE_DIR"/*.zip 2>/dev/null || true
    echo
    echo "📁 Release directory: $RELEASE_DIR"
    echo "🏷️  Version: $VERSION"
    echo
    echo "Next steps:"
    echo "1. Test the packages on target systems"
    echo "2. Create GitHub release with these files"
    echo "3. Update documentation if needed"
}

# Run main function
main "$@"
