#!/bin/bash

# GitHub Release Automation Script
# 自动提交代码并创建 GitHub Release

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
VERSION="${1:-v1.0.0}"
RELEASE_DIR="$PROJECT_ROOT/release"

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

# Check if git is configured
check_git_config() {
    log_info "Checking Git configuration..."
    
    if ! git config user.name &>/dev/null; then
        log_error "Git user.name not configured. Run: git config --global user.name 'Your Name'"
    fi
    
    if ! git config user.email &>/dev/null; then
        log_error "Git user.email not configured. Run: git config --global user.email 'your@email.com'"
    fi
    
    log_success "Git configuration OK"
}

# Check if we're in a git repository
check_git_repo() {
    log_info "Checking Git repository..."
    
    if ! git rev-parse --git-dir &>/dev/null; then
        log_error "Not in a Git repository"
    fi
    
    # Check if remote origin exists
    if ! git remote get-url origin &>/dev/null; then
        log_error "No 'origin' remote configured"
    fi
    
    local remote_url=$(git remote get-url origin)
    log_info "Remote origin: $remote_url"
    
    log_success "Git repository OK"
}

# Check if release packages exist
check_release_packages() {
    log_info "Checking release packages..."
    
    if [[ ! -d "$RELEASE_DIR" ]]; then
        log_error "Release directory not found. Run: bash scripts/create-release.sh $VERSION"
    fi
    
    local linux_package="$RELEASE_DIR/terraria-panel-${VERSION}-linux-amd64.tar.gz"
    if [[ ! -f "$linux_package" ]]; then
        log_error "Linux package not found: $linux_package"
    fi
    
    log_success "Release packages OK"
}

# Add and commit changes
commit_changes() {
    log_info "Committing changes..."
    
    cd "$PROJECT_ROOT"
    
    # Add important files
    git add .gitignore
    git add RELEASE.md
    git add scripts/
    git add deploy/
    git add backend/terraria-panel
    git add backend/terraria-panel.exe
    git add backend/dist/
    
    # Check if there are changes to commit
    if git diff --staged --quiet; then
        log_warn "No changes to commit"
    else
        git commit -m "🚀 Release $VERSION

- Add production-ready binaries (Linux/Windows)
- Update deployment scripts with pre-built binary support
- Add comprehensive release documentation
- Include frontend dist files for deployment
- Optimize install.sh for server deployment

Ready for one-click Linux server deployment!"
        
        log_success "Changes committed"
    fi
}

# Create and push tag
create_tag() {
    log_info "Creating Git tag..."
    
    cd "$PROJECT_ROOT"
    
    # Check if tag already exists
    if git tag -l | grep -q "^${VERSION}$"; then
        log_warn "Tag $VERSION already exists"
        read -p "Delete existing tag and recreate? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git tag -d "$VERSION"
            git push origin --delete "$VERSION" 2>/dev/null || true
        else
            log_error "Tag creation cancelled"
        fi
    fi
    
    # Create annotated tag
    git tag -a "$VERSION" -m "Terraria Panel $VERSION

🎮 Production-Ready Terraria Server Management Panel

✨ Features:
- One-click Linux server deployment
- Real-time monitoring and management
- Multi-server support with auto-restart
- Web-based administration interface
- SSL/HTTPS support with Let's Encrypt
- PostgreSQL + Redis backend
- Systemd service integration

🚀 Quick Install:
curl -fsSL https://raw.githubusercontent.com/ShourGG/tailamianban/main/deploy/scripts/install.sh | bash

📦 Packages:
- Linux server deployment (recommended)
- Windows development/testing
- Source code and deployment scripts

🔧 System Requirements:
- Ubuntu 18.04+ / Debian 9+ / CentOS 7+
- 1GB+ RAM, 2GB+ storage
- Public IP for SSL (optional)

Ready for production deployment!"
    
    log_success "Tag $VERSION created"
}

# Push to GitHub
push_to_github() {
    log_info "Pushing to GitHub..."
    
    cd "$PROJECT_ROOT"
    
    # Push commits
    git push origin main || git push origin master || {
        log_error "Failed to push commits. Check your branch name and permissions."
    }
    
    # Push tags
    git push origin "$VERSION"
    
    log_success "Pushed to GitHub"
}

# Show GitHub release instructions
show_github_instructions() {
    local remote_url=$(git remote get-url origin)
    local repo_url=${remote_url%.git}
    repo_url=${repo_url/git@github.com:/https://github.com/}
    
    echo
    log_success "=========================================="
    log_success "GitHub Release Ready!"
    log_success "=========================================="
    echo
    echo "🔗 Repository: $repo_url"
    echo "🏷️  Tag: $VERSION"
    echo
    echo "📋 Next Steps:"
    echo "1. Go to: $repo_url/releases/new"
    echo "2. Select tag: $VERSION"
    echo "3. Title: Terraria Panel $VERSION"
    echo "4. Upload these files:"
    echo "   - $RELEASE_DIR/terraria-panel-${VERSION}-linux-amd64.tar.gz"
    echo "   - $RELEASE_DIR/terraria-panel-${VERSION}-windows-amd64.tar.gz"
    echo "   - $RELEASE_DIR/terraria-panel-${VERSION}-source.tar.gz"
    echo "   - $RELEASE_DIR/terraria-panel-${VERSION}-checksums.txt"
    echo "5. Copy release notes from: $RELEASE_DIR/RELEASE_NOTES.md"
    echo "6. Mark as 'Latest release'"
    echo "7. Publish release"
    echo
    echo "🚀 One-line install command:"
    echo "curl -fsSL https://raw.githubusercontent.com/ShourGG/tailamianban/main/deploy/scripts/install.sh | bash"
    echo
}

# Main execution
main() {
    log_info "GitHub Release Automation for Terraria Panel $VERSION"
    
    check_git_config
    check_git_repo
    check_release_packages
    
    echo
    log_info "Ready to create GitHub release. This will:"
    echo "1. Commit current changes"
    echo "2. Create Git tag $VERSION"
    echo "3. Push to GitHub"
    echo "4. Show instructions for creating GitHub release"
    echo
    read -p "Continue? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_error "Release cancelled"
    fi
    
    commit_changes
    create_tag
    push_to_github
    show_github_instructions
}

# Run main function
main "$@"
