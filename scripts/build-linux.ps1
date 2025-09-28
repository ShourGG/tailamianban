# 泰拉瑞亚面板 Linux 构建脚本 (Windows PowerShell)
# 使用 Docker 或 WSL2 构建 Linux 二进制文件

param(
    [string]$Method = "docker",  # 构建方法: docker 或 wsl
    [string]$Arch = "amd64"      # 目标架构: amd64 或 arm64
)

$ErrorActionPreference = "Stop"

# 颜色输出函数
function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

Write-ColorOutput "🎮 泰拉瑞亚面板 Linux 构建脚本" "Cyan"
Write-ColorOutput "========================================" "DarkGray"

# 检查当前目录
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot
Write-ColorOutput "📂 项目目录: $ProjectRoot" "Yellow"

# 方法1: 使用 Docker 构建
if ($Method -eq "docker") {
    Write-ColorOutput "`n📦 使用 Docker 构建..." "Green"
    
    # 检查 Docker 是否安装
    try {
        docker --version | Out-Null
    } catch {
        Write-ColorOutput "❌ Docker 未安装或未运行!" "Red"
        Write-ColorOutput "请安装 Docker Desktop: https://www.docker.com/products/docker-desktop" "Yellow"
        exit 1
    }
    
    # 创建 Dockerfile
    $dockerfileContent = @"
FROM golang:1.23-alpine AS builder

# 安装构建依赖
RUN apk add --no-cache gcc musl-dev nodejs npm git

# 设置工作目录
WORKDIR /app

# 复制项目文件
COPY . .

# 构建前端
RUN cd web && npm ci && npm run build && cd ..

# 构建后端
ENV CGO_ENABLED=1
ENV GOOS=linux
ENV GOARCH=$Arch

RUN go mod download
RUN go build -ldflags "-s -w" -o terraria-panel cmd/main.go

# 创建最终镜像
FROM alpine:latest

RUN apk add --no-cache ca-certificates

WORKDIR /app

# 复制构建产物
COPY --from=builder /app/terraria-panel .
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/configs ./configs
COPY --from=builder /app/dist ./dist

RUN chmod +x terraria-panel
RUN chmod +x scripts/*.sh

CMD ["./terraria-panel"]
"@
    
    # 保存 Dockerfile
    $dockerfileContent | Out-File -FilePath "Dockerfile.build" -Encoding UTF8
    
    # 构建 Docker 镜像
    Write-ColorOutput "🔨 构建 Docker 镜像..." "Cyan"
    docker build -f Dockerfile.build -t terraria-panel-build .
    
    # 从容器中提取二进制文件
    Write-ColorOutput "📤 提取构建产物..." "Cyan"
    $ContainerId = docker create terraria-panel-build
    
    # 创建输出目录
    $OutputDir = "build/linux-$Arch"
    New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
    
    # 复制文件
    docker cp "${ContainerId}:/app/terraria-panel" "$OutputDir/terraria-panel"
    docker cp "${ContainerId}:/app/scripts" "$OutputDir/"
    docker cp "${ContainerId}:/app/configs" "$OutputDir/" 2>$null
    docker cp "${ContainerId}:/app/dist" "$OutputDir/" 2>$null
    
    # 清理
    docker rm $ContainerId | Out-Null
    
    Write-ColorOutput "✅ 构建完成! 输出目录: $OutputDir" "Green"
    
    # 清理临时文件
    Remove-Item "Dockerfile.build" -ErrorAction SilentlyContinue
}
# 方法2: 使用 WSL2 构建
elseif ($Method -eq "wsl") {
    Write-ColorOutput "`n🐧 使用 WSL2 构建..." "Green"
    
    # 检查 WSL 是否可用
    try {
        wsl --version | Out-Null
    } catch {
        Write-ColorOutput "❌ WSL2 未安装!" "Red"
        Write-ColorOutput "请安装 WSL2: wsl --install" "Yellow"
        exit 1
    }
    
    # 创建构建脚本
    $wslBuildScript = @"
#!/bin/bash
set -e

echo "🔨 开始在 WSL2 中构建..."

# 安装依赖（如果需要）
if ! command -v go &> /dev/null; then
    echo "📦 安装 Go..."
    wget -q https://go.dev/dl/go1.23.0.linux-amd64.tar.gz
    sudo tar -C /usr/local -xzf go1.23.0.linux-amd64.tar.gz
    export PATH=\$PATH:/usr/local/go/bin
    rm go1.23.0.linux-amd64.tar.gz
fi

if ! command -v node &> /dev/null; then
    echo "📦 安装 Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# 构建前端
echo "🎨 构建前端..."
cd web
npm ci
npm run build
cd ..

# 构建后端
echo "🚀 构建后端..."
export CGO_ENABLED=1
export GOOS=linux
export GOARCH=$Arch

go mod download
go build -ldflags "-s -w" -o terraria-panel cmd/main.go

echo "✅ 构建完成!"
"@
    
    # 保存 WSL 构建脚本
    $wslBuildScript | Out-File -FilePath "wsl-build.sh" -Encoding UTF8 -NoNewline
    
    # 转换行尾（Windows -> Unix）
    (Get-Content "wsl-build.sh" -Raw) -replace "`r`n", "`n" | Set-Content "wsl-build.sh" -NoNewline
    
    # 在 WSL 中执行构建
    Write-ColorOutput "🔨 在 WSL2 中执行构建..." "Cyan"
    
    # 获取 Windows 路径对应的 WSL 路径
    $wslPath = wsl wslpath -a "$ProjectRoot"
    
    # 执行构建
    wsl bash -c "cd '$wslPath' && chmod +x wsl-build.sh && ./wsl-build.sh"
    
    # 创建输出目录
    $OutputDir = "build/linux-$Arch"
    New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
    
    # 复制构建产物
    Copy-Item "terraria-panel" "$OutputDir/" -Force
    Copy-Item -Recurse "scripts" "$OutputDir/" -Force
    Copy-Item -Recurse "configs" "$OutputDir/" -Force -ErrorAction SilentlyContinue
    Copy-Item -Recurse "dist" "$OutputDir/" -Force -ErrorAction SilentlyContinue
    
    Write-ColorOutput "✅ 构建完成! 输出目录: $OutputDir" "Green"
    
    # 清理临时文件
    Remove-Item "wsl-build.sh" -ErrorAction SilentlyContinue
    Remove-Item "terraria-panel" -ErrorAction SilentlyContinue
}
else {
    Write-ColorOutput "❌ 无效的构建方法: $Method" "Red"
    Write-ColorOutput "请使用 'docker' 或 'wsl'" "Yellow"
    exit 1
}

# 创建发布包
Write-ColorOutput "`n📦 创建发布包..." "Cyan"

$OutputDir = "build/linux-$Arch"
$ReleaseDir = "release"
New-Item -ItemType Directory -Force -Path $ReleaseDir | Out-Null

# 打包
$TarName = "terraria-panel-linux-$Arch.tar.gz"
Set-Location $OutputDir
tar -czf "../../$ReleaseDir/$TarName" *
Set-Location $ProjectRoot

Write-ColorOutput "✅ 发布包创建成功: $ReleaseDir/$TarName" "Green"

# 显示使用说明
Write-ColorOutput "`n📝 使用说明:" "Yellow"
Write-ColorOutput "1. 将 $ReleaseDir/$TarName 上传到 Linux 服务器" "White"
Write-ColorOutput "2. 在服务器上解压: tar -xzf $TarName" "White"
Write-ColorOutput "3. 运行安装脚本: ./scripts/install.sh" "White"
Write-ColorOutput "4. 或直接启动: ./scripts/run.sh" "White"

Write-ColorOutput "`n🎉 构建完成!" "Green"