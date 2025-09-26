#!/bin/bash
# SSL Certificate Setup Script for Terraria Panel
# Author: AxiomOS
# Version: 1.0.0
# Description: Automated SSL certificate setup and renewal

set -euo pipefail

# Configuration
DOMAIN_NAME="${1:-}"
SSL_EMAIL="${2:-}"
NGINX_SSL_DIR="/etc/nginx/ssl"
CERTBOT_DIR="/etc/letsencrypt"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Check prerequisites
check_prerequisites() {
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root"
    fi

    if [[ -z "$DOMAIN_NAME" || -z "$SSL_EMAIL" ]]; then
        echo "Usage: $0 <domain-name> <email>"
        echo "Example: $0 terraria.example.com admin@example.com"
        exit 1
    fi

    # Check if certbot is installed
    if ! command -v certbot &> /dev/null; then
        log_info "Installing certbot..."
        apt-get update
        apt-get install -y certbot python3-certbot-nginx
    fi

    # Check if nginx is installed and running
    if ! systemctl is-active --quiet nginx; then
        log_error "Nginx is not running. Please ensure Nginx is installed and running."
    fi
}

# Generate self-signed certificate (for testing)
generate_self_signed() {
    log_info "Generating self-signed certificate for $DOMAIN_NAME..."

    mkdir -p $NGINX_SSL_DIR

    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout $NGINX_SSL_DIR/key.pem \
        -out $NGINX_SSL_DIR/cert.pem \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=$DOMAIN_NAME"

    chmod 600 $NGINX_SSL_DIR/key.pem
    chmod 644 $NGINX_SSL_DIR/cert.pem

    log_info "Self-signed certificate generated"
}

# Setup Let's Encrypt certificate
setup_letsencrypt() {
    log_info "Setting up Let's Encrypt certificate for $DOMAIN_NAME..."

    # Check if certificate already exists
    if [[ -f "$CERTBOT_DIR/live/$DOMAIN_NAME/fullchain.pem" ]]; then
        log_warn "Certificate already exists for $DOMAIN_NAME"
        read -p "Do you want to renew it? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            return
        fi
    fi

    # Get certificate
    certbot certonly \
        --nginx \
        --non-interactive \
        --agree-tos \
        --email "$SSL_EMAIL" \
        --no-eff-email \
        -d "$DOMAIN_NAME"

    # Create symbolic links
    mkdir -p $NGINX_SSL_DIR
    ln -sf "$CERTBOT_DIR/live/$DOMAIN_NAME/fullchain.pem" "$NGINX_SSL_DIR/cert.pem"
    ln -sf "$CERTBOT_DIR/live/$DOMAIN_NAME/privkey.pem" "$NGINX_SSL_DIR/key.pem"

    log_info "Let's Encrypt certificate configured"
}

# Setup Nginx SSL configuration
setup_nginx_ssl() {
    log_info "Configuring Nginx for SSL..."

    # Backup current configuration
    cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup.$(date +%Y%m%d_%H%M%S)

    # Generate DH parameters if not exists
    if [[ ! -f "$NGINX_SSL_DIR/dhparam.pem" ]]; then
        log_info "Generating DH parameters (this may take a while)..."
        openssl dhparam -out $NGINX_SSL_DIR/dhparam.pem 2048
    fi

    # Create SSL snippets
    cat > /etc/nginx/snippets/ssl-params.conf <<EOF
# SSL Parameters
ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers off;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;

# SSL session cache
ssl_session_timeout 1d;
ssl_session_cache shared:SSL:10m;
ssl_session_tickets off;

# OCSP stapling
ssl_stapling on;
ssl_stapling_verify on;

# DH parameters
ssl_dhparam $NGINX_SSL_DIR/dhparam.pem;

# Security headers
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
add_header X-Frame-Options DENY always;
add_header X-Content-Type-Options nosniff always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
EOF

    # Test configuration
    nginx -t

    # Reload Nginx
    systemctl reload nginx

    log_info "Nginx SSL configuration complete"
}

# Setup automatic renewal
setup_auto_renewal() {
    log_info "Setting up automatic certificate renewal..."

    # Create renewal script
    cat > /usr/local/bin/renew-ssl.sh <<'EOF'
#!/bin/bash
# SSL Certificate Renewal Script

# Renew certificates
certbot renew --quiet

# Check if renewal was successful
if [ $? -eq 0 ]; then
    # Reload Nginx
    systemctl reload nginx

    # Log success
    echo "$(date): SSL certificates renewed successfully" >> /var/log/ssl-renewal.log
else
    # Log failure
    echo "$(date): SSL certificate renewal failed" >> /var/log/ssl-renewal.log

    # Send alert (implement your alerting mechanism here)
    # mail -s "SSL Renewal Failed" admin@example.com < /var/log/ssl-renewal.log
fi
EOF

    chmod +x /usr/local/bin/renew-ssl.sh

    # Setup cron job
    cat > /etc/cron.d/certbot-renewal <<EOF
# Certbot renewal cron job
# Run twice daily at 2:30 AM and 2:30 PM
30 2,14 * * * root /usr/local/bin/renew-ssl.sh
EOF

    # Setup systemd timer (alternative to cron)
    cat > /etc/systemd/system/certbot-renewal.service <<EOF
[Unit]
Description=Certbot Renewal
After=network.target

[Service]
Type=oneshot
ExecStart=/usr/local/bin/renew-ssl.sh
User=root
EOF

    cat > /etc/systemd/system/certbot-renewal.timer <<EOF
[Unit]
Description=Run certbot renewal twice daily
Requires=certbot-renewal.service

[Timer]
OnCalendar=*-*-* 02:30:00
OnCalendar=*-*-* 14:30:00
Persistent=true

[Install]
WantedBy=timers.target
EOF

    systemctl daemon-reload
    systemctl enable certbot-renewal.timer
    systemctl start certbot-renewal.timer

    log_info "Automatic renewal configured"
}

# Test SSL configuration
test_ssl() {
    log_info "Testing SSL configuration..."

    # Check certificate expiry
    expiry_date=$(openssl x509 -in $NGINX_SSL_DIR/cert.pem -noout -enddate | cut -d= -f2)
    log_info "Certificate expires on: $expiry_date"

    # Test HTTPS connection
    if curl -sSf https://$DOMAIN_NAME > /dev/null 2>&1; then
        log_info "HTTPS connection successful"
    else
        log_warn "HTTPS connection test failed - this might be normal if DNS is not configured yet"
    fi

    # Check SSL grade (optional - requires external tool)
    echo
    log_info "You can test your SSL configuration at:"
    echo "  https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN_NAME"
}

# Main function
main() {
    echo -e "${BLUE}======================================${NC}"
    echo -e "${BLUE}     SSL Certificate Setup Script      ${NC}"
    echo -e "${BLUE}======================================${NC}"
    echo

    check_prerequisites

    echo "Choose certificate type:"
    echo "1) Let's Encrypt (Production)"
    echo "2) Self-signed (Testing/Development)"
    read -p "Enter choice [1-2]: " choice

    case $choice in
        1)
            setup_letsencrypt
            ;;
        2)
            generate_self_signed
            ;;
        *)
            log_error "Invalid choice"
            ;;
    esac

    setup_nginx_ssl
    setup_auto_renewal
    test_ssl

    echo
    log_info "========================================"
    log_info "SSL setup completed successfully!"
    log_info "========================================"
    echo
    echo "Your site is now accessible at:"
    echo "  https://$DOMAIN_NAME"
    echo
    echo "Certificate location:"
    echo "  Certificate: $NGINX_SSL_DIR/cert.pem"
    echo "  Private key: $NGINX_SSL_DIR/key.pem"
    echo
    echo "Renewal status:"
    echo "  Check timer: systemctl status certbot-renewal.timer"
    echo "  Manual renewal: certbot renew"
    echo
}

# Run main function
main