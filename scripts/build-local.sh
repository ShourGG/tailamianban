#!/bin/bash
set -e

echo "================================"
echo "  泰拉瑞亚面板本地构建脚本"
echo "================================"

# Get version from cmd/main.go
VERSION=$(grep 'Version = ' cmd/main.go | sed 's/.*"\(.*\)".*/\1/')
echo "Version: $VERSION"

# Step 1: Build Frontend
echo ""
echo "[1/4] Building frontend..."
cd web
npm ci --legacy-peer-deps
npm run build
cd ..
echo "✓ Frontend build completed"

# Step 2: Copy frontend to cmd/dist (Critical!)
echo ""
echo "[2/4] Copying frontend to cmd/dist..."
rm -rf cmd/dist
cp -r web/dist cmd/dist
echo "✓ Frontend copied to cmd/dist"

# Step 3: Build Go binary
echo ""
echo "[3/4] Building Go binary..."
go build -ldflags "-s -w \
  -X main.Version=${VERSION} \
  -X main.Build=local \
  -X terraria-panel/internal/api/handlers.AppVersion=${VERSION} \
  -X terraria-panel/internal/api/handlers.BuildInfo=local" \
  -o terraria-panel-local cmd/main.go

chmod +x terraria-panel-local
echo "✓ Go binary built"

# Step 4: Verify embed
echo ""
echo "[4/4] Verifying embedded assets..."
if ./terraria-panel-local --version; then
  echo "✓ Binary verification passed"
else
  echo "✗ Binary verification failed"
  exit 1
fi

echo ""
echo "================================"
echo "  Build completed successfully!"
echo "================================"
echo "Binary: ./terraria-panel-local"
echo ""
echo "To run:"
echo "  ./terraria-panel-local"
echo ""