#!/bin/bash
# Terraria Panel Deployment Script
# Author: AxiomOS
# Version: 1.0.0
# Description: Automated deployment script for Terraria Panel on Linux systems

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
INSTALL_DIR="/opt/terraria-panel"
BACKUP_DIR="/opt/terraria-panel-backup"
WEB_USER="terraria"
WEB_GROUP="terraria"
DOMAIN_NAME=""
SSL_EMAIL=""
DB_PASSWORD="123456"
JWT_SECRET=""
REDIS_PASSWORD=""

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

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root"
    fi
}

# Detect OS
detect_os() {
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        OS=$ID
        VER=$VERSION_ID
    else
        log_error "Cannot detect OS"
    fi
    log_info "Detected OS: $OS $VER"
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."

    case $OS in
        ubuntu|debian)
            apt-get update
            apt-get install -y \
                curl \
                wget \
                git \
                nginx \
                postgresql \
                redis-server \
                certbot \
                python3-certbot-nginx \
                ufw \
                htop \
                net-tools \
                build-essential
            ;;
        centos|rhel|fedora)
            yum install -y epel-release
            yum install -y \
                curl \
                wget \
                git \
                nginx \
                postgresql-server \
                redis \
                certbot \
                python3-certbot-nginx \
                firewalld \
                htop \
                net-tools \
                gcc
            ;;
        *)
            log_error "Unsupported OS: $OS"
            ;;
    esac

    # Install Node.js 20.x (only for Ubuntu/Debian)
    if [[ "$OS" == "ubuntu" || "$OS" == "debian" ]]; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt-get install -y nodejs
    elif [[ "$OS" == "centos" || "$OS" == "rhel" || "$OS" == "fedora" ]]; then
        curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
        yum install -y nodejs
    fi

    # Install Go 1.21 (not needed for binary deployment, but kept for development)
    if ! command -v go &> /dev/null; then
        log_info "Installing Go 1.21..."
        wget -q https://go.dev/dl/go1.21.5.linux-amd64.tar.gz
        rm -rf /usr/local/go
        tar -C /usr/local -xzf go1.21.5.linux-amd64.tar.gz
        rm go1.21.5.linux-amd64.tar.gz
        export PATH=$PATH:/usr/local/go/bin
        echo 'export PATH=$PATH:/usr/local/go/bin' >> /etc/profile
    else
        log_info "Go already installed: $(go version)"
    fi

    log_success "Dependencies installed"
}

# Create system user
create_user() {
    log_info "Creating system user..."

    if id "$WEB_USER" &>/dev/null; then
        log_warn "User $WEB_USER already exists"
    else
        useradd -r -m -d /home/$WEB_USER -s /bin/bash $WEB_USER
        log_success "User $WEB_USER created"
    fi
}

# Setup PostgreSQL
setup_postgresql() {
    log_info "Setting up PostgreSQL..."

    # Initialize PostgreSQL if needed
    if [[ "$OS" == "centos" || "$OS" == "rhel" || "$OS" == "fedora" ]]; then
        postgresql-setup initdb
    fi

    systemctl enable postgresql
    systemctl start postgresql

    # Create database and user
    sudo -u postgres psql <<EOF
CREATE USER terraria WITH PASSWORD '${DB_PASSWORD}';
CREATE DATABASE terraria_panel OWNER terraria;
GRANT ALL PRIVILEGES ON DATABASE terraria_panel TO terraria;
EOF

    log_success "PostgreSQL configured"
}

# Setup Redis
setup_redis() {
    log_info "Setting up Redis..."

    # Configure Redis password
    sed -i "s/^# requirepass .*/requirepass ${REDIS_PASSWORD}/" /etc/redis/redis.conf

    systemctl enable redis
    systemctl restart redis

    log_success "Redis configured"
}

# Build frontend
build_frontend() {
    log_info "Setting up frontend..."

    cd $INSTALL_DIR

    # Check if pre-built dist directory exists
    if [[ -d "backend/dist" && -f "backend/dist/index.html" ]]; then
        log_info "Using pre-built frontend files"
        # Copy to nginx directory
        rm -rf $INSTALL_DIR/dist.old
        [[ -d $INSTALL_DIR/dist ]] && mv $INSTALL_DIR/dist $INSTALL_DIR/dist.old
        cp -r backend/dist $INSTALL_DIR/
    else
        log_info "Pre-built frontend not found, building from source..."

        # Check if Node.js is available
        if ! command -v npm &> /dev/null; then
            log_error "Node.js/npm is not installed and no pre-built frontend found. Please install Node.js or use a release with pre-built files."
        fi

        npm install
        npm run build

        # Move dist to nginx directory
        rm -rf $INSTALL_DIR/dist.old
        [[ -d $INSTALL_DIR/dist ]] && mv $INSTALL_DIR/dist $INSTALL_DIR/dist.old
        mv dist $INSTALL_DIR/

        # Also copy to backend/dist for serving
        mkdir -p backend/dist
        cp -r $INSTALL_DIR/dist/* backend/dist/
    fi

    log_success "Frontend ready"
}

# Build backend
build_backend() {
    log_info "Setting up backend..."

    cd $INSTALL_DIR/backend

    # Check if pre-built binary exists
    if [[ -f "terraria-panel" ]]; then
        log_info "Using pre-built binary"
        chmod +x terraria-panel
    else
        log_info "Pre-built binary not found, building from source..."

        # Check if Go is available
        if ! command -v go &> /dev/null; then
            log_error "Go is not installed and no pre-built binary found. Please install Go or use a release with pre-built binaries."
        fi

        go mod download
        CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
            -ldflags="-s -w -X main.Version=$(git describe --tags --always) -X main.BuildTime=$(date -u '+%Y-%m-%d_%H:%M:%S')" \
            -o terraria-panel \
            cmd/main.go

        chmod +x terraria-panel
    fi

    log_success "Backend ready"
}

# Setup Nginx
setup_nginx() {
    log_info "Setting up Nginx..."

    # Copy Nginx configuration
    cp $INSTALL_DIR/deploy/nginx/nginx.conf /etc/nginx/nginx.conf

    # Update domain name in config
    sed -i "s/terraria-panel.example.com/${DOMAIN_NAME}/g" /etc/nginx/nginx.conf

    # Create directories
    mkdir -p /var/www/terraria-panel
    ln -sf $INSTALL_DIR/dist /var/www/terraria-panel/dist

    # Test configuration
    nginx -t

    systemctl enable nginx
    systemctl restart nginx

    log_success "Nginx configured"
}

# Setup SSL with Let's Encrypt
setup_ssl() {
    log_info "Setting up SSL certificate..."

    if [[ -z "$DOMAIN_NAME" || -z "$SSL_EMAIL" ]]; then
        log_warn "Skipping SSL setup - domain name or email not provided"
        return
    fi

    # Create SSL directory
    mkdir -p /etc/nginx/ssl

    # Get certificate
    certbot certonly \
        --nginx \
        --non-interactive \
        --agree-tos \
        --email "$SSL_EMAIL" \
        -d "$DOMAIN_NAME"

    # Link certificates
    ln -sf /etc/letsencrypt/live/${DOMAIN_NAME}/fullchain.pem /etc/nginx/ssl/cert.pem
    ln -sf /etc/letsencrypt/live/${DOMAIN_NAME}/privkey.pem /etc/nginx/ssl/key.pem

    # Setup auto-renewal
    cat > /etc/cron.d/certbot <<EOF
0 2 * * * root certbot renew --quiet && systemctl reload nginx
EOF

    systemctl reload nginx

    log_success "SSL certificate configured"
}

# Setup firewall
setup_firewall() {
    log_info "Setting up firewall..."

    case $OS in
        ubuntu|debian)
            ufw --force enable
            ufw default deny incoming
            ufw default allow outgoing
            ufw allow ssh
            ufw allow 80/tcp
            ufw allow 443/tcp
            ufw allow 7777:7800/tcp  # Terraria game ports
            ufw reload
            ;;
        centos|rhel|fedora)
            systemctl enable firewalld
            systemctl start firewalld
            firewall-cmd --permanent --zone=public --add-service=ssh
            firewall-cmd --permanent --zone=public --add-service=http
            firewall-cmd --permanent --zone=public --add-service=https
            firewall-cmd --permanent --zone=public --add-port=7777-7800/tcp
            firewall-cmd --reload
            ;;
    esac

    log_success "Firewall configured"
}

# Setup systemd service
setup_systemd() {
    log_info "Setting up systemd service..."

    cp $INSTALL_DIR/deploy/systemd/terraria-panel.service /etc/systemd/system/

    # Create environment file
    cat > $INSTALL_DIR/backend/.env <<EOF
# Database Configuration
DATABASE_TYPE=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=terraria_panel
DATABASE_USER=terraria
DATABASE_PASSWORD=${DB_PASSWORD}

# Security
JWT_SECRET=${JWT_SECRET}

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=${REDIS_PASSWORD}

# Server
SERVER_PORT=8080

# Terraria
TERRARIA_SERVER_PATH=/opt/terraria-panel/terraria-servers
TERRARIA_WORLD_PATH=/opt/terraria-panel/worlds
TERRARIA_BACKUP_PATH=/opt/terraria-panel/backups
EOF

    chmod 600 $INSTALL_DIR/backend/.env
    chown $WEB_USER:$WEB_GROUP $INSTALL_DIR/backend/.env

    systemctl daemon-reload
    systemctl enable terraria-panel
    systemctl start terraria-panel

    log_success "Systemd service configured"
}

# Create directory structure
create_directories() {
    log_info "Creating directory structure..."

    mkdir -p $INSTALL_DIR/{backend,dist,terraria-servers,worlds,backups,logs}
    mkdir -p $INSTALL_DIR/backend/{config,logs}

    chown -R $WEB_USER:$WEB_GROUP $INSTALL_DIR

    log_success "Directories created"
}

# Download and setup application
download_app() {
    log_info "Downloading Terraria Panel..."

    cd /opt

    # Download the latest release or clone repository
    if curl -s https://api.github.com/repos/ShourGG/tailamianban/releases/latest | grep -q "tag_name"; then
        log_info "Downloading latest release..."
        LATEST_VERSION=$(curl -s https://api.github.com/repos/ShourGG/tailamianban/releases/latest | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
        wget -q "https://github.com/ShourGG/tailamianban/archive/refs/tags/${LATEST_VERSION}.tar.gz" -O terraria-panel.tar.gz
        tar -xzf terraria-panel.tar.gz
        mv "tailamianban-${LATEST_VERSION#v}" terraria-panel
        rm terraria-panel.tar.gz
    else
        log_info "No releases found, cloning repository..."
        git clone https://github.com/ShourGG/tailamianban.git terraria-panel
    fi

    cd terraria-panel

    log_success "Application downloaded"
}

# Backup existing installation
backup_existing() {
    if [[ -d "$INSTALL_DIR" ]]; then
        log_info "Backing up existing installation..."

        timestamp=$(date +%Y%m%d_%H%M%S)
        mkdir -p $BACKUP_DIR

        tar -czf "$BACKUP_DIR/terraria-panel-backup-$timestamp.tar.gz" \
            --exclude='node_modules' \
            --exclude='terraria-servers' \
            --exclude='worlds' \
            -C $(dirname $INSTALL_DIR) \
            $(basename $INSTALL_DIR)

        log_success "Backup created: $BACKUP_DIR/terraria-panel-backup-$timestamp.tar.gz"
    fi
}

# Interactive setup with auto-detection
interactive_setup() {
    echo -e "${BLUE}======================================${NC}"
    echo -e "${BLUE}   Terraria Panel Deployment Setup    ${NC}"
    echo -e "${BLUE}======================================${NC}"
    echo

    # Check if running in non-interactive mode (CI/automated)
    if [[ ! -t 0 ]] || [[ -n "${TERRARIA_AUTO_INSTALL:-}" ]]; then
        log_info "Auto-installation mode detected"
        DOMAIN_NAME=""
        DB_PASSWORD="123456"
        log_info "Using defaults: IP access, password=123456"
    else
        # Interactive mode with smart defaults
        echo "Quick Setup Options:"
        echo "  1) Auto setup (IP access, password=123456) - RECOMMENDED"
        echo "  2) Custom setup (domain, custom password)"
        echo
        read -p "Choose option (1/2) [default: 1]: " -t 10 SETUP_CHOICE
        echo

        # Default to option 1 if no input or timeout
        if [[ -z "$SETUP_CHOICE" ]] || [[ "$SETUP_CHOICE" == "1" ]]; then
            log_info "Using auto setup with defaults"
            DOMAIN_NAME=""
            DB_PASSWORD="123456"
        else
            # Custom setup
            echo "Domain Configuration:"
            read -p "Domain name (leave empty for IP): " DOMAIN_NAME
            if [[ -n "$DOMAIN_NAME" ]]; then
                read -p "Enter email for SSL certificate: " SSL_EMAIL
            fi

            echo
            read -p "Database password [default: 123456]: " DB_PASSWORD
            if [[ -z "$DB_PASSWORD" ]]; then
                DB_PASSWORD="123456"
            fi
        fi
    fi

    # Generate secure tokens
    JWT_SECRET=$(openssl rand -base64 32)
    REDIS_PASSWORD=$(openssl rand -base64 24)

    echo
    log_info "Installation Summary:"
    echo "  Access: ${DOMAIN_NAME:-Server IP (HTTP only)}"
    echo "  SSL Email: ${SSL_EMAIL:-Not configured}"
    echo "  Database User: terraria"
    echo "  Database Password: $DB_PASSWORD"
    echo "  Install Directory: $INSTALL_DIR"
    echo

    # Auto-confirm in non-interactive mode
    if [[ ! -t 0 ]] || [[ -n "${TERRARIA_AUTO_INSTALL:-}" ]]; then
        log_info "Auto-confirming installation..."
        sleep 2
    else
        read -p "Continue with installation? [Y/n]: " -t 10 -r
        echo
        # Default to Yes if no input or timeout
        if [[ -n "$REPLY" ]] && [[ ! $REPLY =~ ^[Yy]$ ]] && [[ ! -z "$REPLY" ]]; then
            log_error "Installation cancelled"
        fi
    fi
}

# Main installation flow
main() {
    log_info "Starting Terraria Panel installation..."

    check_root
    detect_os
    interactive_setup

    backup_existing
    install_dependencies
    create_user
    download_app
    create_directories

    setup_postgresql
    setup_redis
    build_frontend
    build_backend
    setup_nginx
    setup_ssl
    setup_firewall
    setup_systemd

    echo
    log_success "========================================"
    log_success "Terraria Panel installation completed!"
    log_success "========================================"
    echo
    echo "Access your panel at:"
    if [[ -n "$DOMAIN_NAME" ]]; then
        echo "  https://${DOMAIN_NAME}"
    else
        echo "  http://$(curl -s ifconfig.me)"
    fi
    echo
    echo "Login credentials:"
    echo "  Username: admin"
    echo "  Password: 123456"
    echo
    echo "Database info:"
    echo "  Database: terraria_panel"
    echo "  Username: terraria"
    echo "  Password: $DB_PASSWORD"
    echo
    echo "Important files:"
    echo "  Config: $INSTALL_DIR/.env"
    echo "  Logs: journalctl -u terraria-panel -f"
    echo "  Service: /etc/systemd/system/terraria-panel.service"
    echo
    echo "Commands:"
    echo "  Start:   systemctl start terraria-panel"
    echo "  Stop:    systemctl stop terraria-panel"
    echo "  Status:  systemctl status terraria-panel"
    echo "  Restart: systemctl restart terraria-panel"
    echo
    log_warn "Remember: Username=admin, Password=123456"
}

# Auto-install mode support
# Set TERRARIA_AUTO_INSTALL=1 to skip all prompts
# Example: TERRARIA_AUTO_INSTALL=1 curl -fsSL ... | bash

# Run main function
main "$@"