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
