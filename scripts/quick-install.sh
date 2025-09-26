#!/bin/bash
# Terraria Panel Quick Install Script (Non-Interactive)
# Author: AxiomOS
# Version: 1.0.0

set -euo pipefail

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration (modify these as needed)
INSTALL_DIR="/opt/terraria-panel"
WEB_USER="terraria"
WEB_GROUP="terraria"
DOMAIN_NAME=""  # Leave empty for HTTP only
SSL_EMAIL=""    # Only needed if DOMAIN_NAME is set
DB_PASSWORD="123456"  # Simple default password
JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "default-jwt-secret-change-me")
REDIS_PASSWORD=$(openssl rand -base64 24 2>/dev/null || echo "default-redis-password")

# GitHub release info
GITHUB_REPO="ShourGG/tailamianban"
RELEASE_TAG="v1.0.0"
BINARY_NAME="terraria-panel"

# Functions
log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }

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
        log_info "Detected OS: $OS $VER"
    else
        log_error "Cannot detect OS"
    fi
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    
    case $OS in
        ubuntu|debian)
            apt-get update
            apt-get install -y curl wget unzip postgresql postgresql-contrib redis-server nginx openssl
            ;;
        centos|rhel|fedora)
            if command -v dnf &> /dev/null; then
                dnf install -y curl wget unzip postgresql postgresql-server redis nginx openssl
            else
                yum install -y curl wget unzip postgresql postgresql-server redis nginx openssl
            fi
            ;;
        *)
            log_error "Unsupported OS: $OS"
            ;;
    esac
}

# Create user
create_user() {
    log_info "Creating user: $WEB_USER"
    if ! id "$WEB_USER" &>/dev/null; then
        useradd -r -s /bin/false -d "$INSTALL_DIR" "$WEB_USER"
    fi
}

# Download and install binary
download_app() {
    log_info "Downloading Terraria Panel..."
    
    # Create install directory
    mkdir -p "$INSTALL_DIR"
    cd "$INSTALL_DIR"
    
    # Download Linux binary from GitHub release
    DOWNLOAD_URL="https://github.com/$GITHUB_REPO/releases/download/$RELEASE_TAG/terraria-panel-$RELEASE_TAG-linux-amd64.tar.gz"
    
    log_info "Downloading from: $DOWNLOAD_URL"
    curl -L -o "terraria-panel.tar.gz" "$DOWNLOAD_URL"
    
    # Extract
    tar -xzf "terraria-panel.tar.gz"
    rm "terraria-panel.tar.gz"
    
    # Make binary executable
    chmod +x "$BINARY_NAME"
    
    # Set ownership
    chown -R "$WEB_USER:$WEB_GROUP" "$INSTALL_DIR"
}

# Setup PostgreSQL
setup_postgresql() {
    log_info "Setting up PostgreSQL..."
    
    # Start PostgreSQL
    systemctl enable postgresql
    systemctl start postgresql
    
    # Create database and user
    sudo -u postgres psql -c "CREATE USER terraria WITH PASSWORD '$DB_PASSWORD';" || true
    sudo -u postgres psql -c "CREATE DATABASE terraria_panel OWNER terraria;" || true
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE terraria_panel TO terraria;" || true
}

# Setup Redis
setup_redis() {
    log_info "Setting up Redis..."
    
    # Configure Redis password
    echo "requirepass $REDIS_PASSWORD" >> /etc/redis/redis.conf
    
    systemctl enable redis
    systemctl restart redis
}

# Create environment file
create_env() {
    log_info "Creating environment configuration..."
    
    cat > "$INSTALL_DIR/.env" << EOF
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=terraria_panel
DB_USER=terraria
DB_PASSWORD=$DB_PASSWORD

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=$REDIS_PASSWORD

# JWT Configuration
JWT_SECRET=$JWT_SECRET

# Server Configuration
PORT=8080
HOST=0.0.0.0

# Environment
NODE_ENV=production
EOF

    chown "$WEB_USER:$WEB_GROUP" "$INSTALL_DIR/.env"
    chmod 600 "$INSTALL_DIR/.env"
}

# Setup systemd service
setup_systemd() {
    log_info "Setting up systemd service..."
    
    cat > /etc/systemd/system/terraria-panel.service << EOF
[Unit]
Description=Terraria Panel
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=$WEB_USER
Group=$WEB_GROUP
WorkingDirectory=$INSTALL_DIR
ExecStart=$INSTALL_DIR/$BINARY_NAME
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable terraria-panel
}

# Setup Nginx
setup_nginx() {
    log_info "Setting up Nginx..."
    
    cat > /etc/nginx/sites-available/terraria-panel << EOF
server {
    listen 80;
    server_name ${DOMAIN_NAME:-_};
    
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

    # Enable site
    ln -sf /etc/nginx/sites-available/terraria-panel /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    # Test and reload nginx
    nginx -t
    systemctl enable nginx
    systemctl restart nginx
}

# Setup firewall
setup_firewall() {
    log_info "Configuring firewall..."
    
    if command -v ufw &> /dev/null; then
        ufw allow 22/tcp
        ufw allow 80/tcp
        ufw allow 443/tcp
        ufw --force enable
    elif command -v firewall-cmd &> /dev/null; then
        firewall-cmd --permanent --add-service=ssh
        firewall-cmd --permanent --add-service=http
        firewall-cmd --permanent --add-service=https
        firewall-cmd --reload
    fi
}

# Main installation
main() {
    log_info "Starting Terraria Panel Quick Installation..."
    echo -e "${BLUE}======================================${NC}"
    echo -e "${BLUE}   Terraria Panel Quick Install       ${NC}"
    echo -e "${BLUE}======================================${NC}"
    echo
    
    check_root
    detect_os
    install_dependencies
    create_user
    download_app
    create_env
    setup_postgresql
    setup_redis
    setup_systemd
    setup_nginx
    setup_firewall
    
    # Start the service
    systemctl start terraria-panel
    
    echo
    log_success "========================================"
    log_success "Terraria Panel installation completed!"
    log_success "========================================"
    echo
    echo "Access your panel at:"
    echo "  http://$(curl -s ifconfig.me 2>/dev/null || echo 'YOUR_SERVER_IP')"
    echo
    echo "Login credentials:"
    echo "  Username: admin"
    echo "  Password: 123456"
    echo
    echo "Database info:"
    echo "  Username: terraria"
    echo "  Password: $DB_PASSWORD"
    echo
    echo "Service commands:"
    echo "  Status:  systemctl status terraria-panel"
    echo "  Logs:    journalctl -u terraria-panel -f"
    echo "  Restart: systemctl restart terraria-panel"
    echo
    log_warn "Remember: admin/123456 for panel login"
}

# Run main function
main "$@"
