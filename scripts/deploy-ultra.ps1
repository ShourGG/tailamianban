# ===================================================================
# 🎮 Terraria Panel Ultra Deploy Script - Windows PowerShell版
# 老王专为Windows用户打造的PowerShell部署脚本
# ===================================================================

param(
    [Parameter(Position=0)]
    [ValidateSet("build", "start", "daemon", "stop", "restart", "status", "logs", "deploy", "help")]
    [string]$Command = "help",

    [Parameter()]
    [int]$Port = 8080,

    [Parameter()]
    [string]$BackendDir = ".\backend"
)

# Colors for output
$Colors = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    Blue = "Blue"
    Cyan = "Cyan"
    Magenta = "Magenta"
}

function Write-Banner {
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
    Write-Host "║                  🎮 TERRARIA PANEL ULTRA DEPLOY             ║" -ForegroundColor Magenta
    Write-Host "║                    Windows PowerShell版 v2.0                ║" -ForegroundColor Magenta
    Write-Host "║                                                              ║" -ForegroundColor Magenta
    Write-Host "║  ✨ 单端口部署 | 🎯 智能端口管理 | 🔄 自动重启               ║" -ForegroundColor Magenta
    Write-Host "║  🛡️  零配置安全 | 📊 实时监控 | 🚀 生产级性能                ║" -ForegroundColor Magenta
    Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
    Write-Host ""
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host "[STEP] $Message" -ForegroundColor Blue
    Write-Host "────────────────────────────────────────────────" -ForegroundColor Blue
}

function Test-Port {
    param([int]$PortNumber)

    try {
        $listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Any, $PortNumber)
        $listener.Start()
        $listener.Stop()
        return $true
    }
    catch {
        return $false
    }
}

function Find-AvailablePort {
    param([int]$StartPort)

    $port = $StartPort
    while (-not (Test-Port $port)) {
        $port++
        if ($port -gt 65535) {
            Write-Error "No available ports found!"
            exit 1
        }
    }
    return $port
}

function Test-Dependencies {
    Write-Step "Checking Dependencies"

    $missingDeps = @()

    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        $missingDeps += "Node.js"
    }

    if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
        $missingDeps += "npm"
    }

    if (-not (Get-Command go -ErrorAction SilentlyContinue)) {
        $missingDeps += "Go"
    }

    if ($missingDeps.Count -gt 0) {
        Write-Error "Missing dependencies: $($missingDeps -join ', ')"
        Write-Host ""
        Write-Warning "Please install the missing dependencies:"
        foreach ($dep in $missingDeps) {
            Write-Host "  • $dep"
        }
        exit 1
    }

    Write-Success "All dependencies available"
    Write-Info "Node: $(node --version)"
    Write-Info "npm: $(npm --version)"
    Write-Info "Go: $((go version) -replace '^go version ', '')"
    Write-Host ""
}

function Invoke-BuildProject {
    Write-Step "Building Project"

    # Clean previous builds
    Write-Info "Cleaning previous builds..."
    if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" }
    if (Test-Path "backend\dist") { Remove-Item -Recurse -Force "backend\dist" }
    if (Test-Path "backend\terraria-panel.exe") { Remove-Item -Force "backend\terraria-panel.exe" }

    # Build frontend
    Write-Info "Building frontend..."
    $result = & npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Frontend build failed!"
        exit 1
    }

    # Copy frontend to backend
    Write-Info "Copying frontend to backend..."
    if (-not (Test-Path "dist")) {
        Write-Error "Frontend dist directory not found!"
        exit 1
    }

    New-Item -ItemType Directory -Force -Path "backend\dist" | Out-Null
    Copy-Item -Recurse -Force "dist\*" "backend\dist\"

    # Build backend
    Write-Info "Building backend..."
    Push-Location "backend"

    $result = & go build -ldflags="-s -w" -o "terraria-panel.exe" "cmd\main.go"
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Backend build failed!"
        Pop-Location
        exit 1
    }

    Pop-Location

    Write-Success "Build completed successfully!"

    # Check file sizes
    if (Test-Path "backend\dist\index.html") {
        $frontendSize = (Get-ChildItem -Recurse "backend\dist" | Measure-Object -Property Length -Sum).Sum
        Write-Info "Frontend size: $([math]::Round($frontendSize/1MB, 2)) MB"
    }

    if (Test-Path "backend\terraria-panel.exe") {
        $backendSize = (Get-Item "backend\terraria-panel.exe").Length
        Write-Info "Backend size: $([math]::Round($backendSize/1MB, 2)) MB"
    }

    Write-Host ""
}

function Start-Service {
    param([int]$PortNumber, [string]$Directory)

    Write-Step "Starting Terraria Panel Service"

    # Validate backend
    if (-not (Test-Path "$Directory\terraria-panel.exe")) {
        Write-Error "Backend binary not found: $Directory\terraria-panel.exe"
        Write-Warning "Please run 'deploy' or 'build' command first"
        exit 1
    }

    # Check port availability
    if (-not (Test-Port $PortNumber)) {
        Write-Warning "Port $PortNumber is already in use!"
        $newPort = Find-AvailablePort $PortNumber
        Write-Info "Using available port: $newPort"
        $PortNumber = $newPort
    }

    Write-Info "Starting server on port $PortNumber..."
    Write-Info "Access panel at: http://localhost:$PortNumber"
    Write-Info "Press Ctrl+C to stop the server"
    Write-Host ""

    # Set environment and start
    $env:SERVER_PORT = $PortNumber
    Push-Location $Directory

    try {
        & ".\terraria-panel.exe"
    }
    finally {
        Pop-Location
    }
}

function Start-Daemon {
    param([int]$PortNumber, [string]$Directory)

    Write-Step "Starting Daemon Service"

    # Check if already running
    $existingProcess = Get-Process -Name "terraria-panel" -ErrorAction SilentlyContinue
    if ($existingProcess) {
        Write-Warning "Service is already running (PID: $($existingProcess.Id))"
        return
    }

    # Validate backend
    if (-not (Test-Path "$Directory\terraria-panel.exe")) {
        Write-Error "Backend binary not found: $Directory\terraria-panel.exe"
        exit 1
    }

    # Find available port
    if (-not (Test-Port $PortNumber)) {
        $PortNumber = Find-AvailablePort $PortNumber
        Write-Info "Using available port: $PortNumber"
    }

    Write-Info "Starting daemon on port $PortNumber..."

    # Start as background process
    $env:SERVER_PORT = $PortNumber
    $startInfo = New-Object System.Diagnostics.ProcessStartInfo
    $startInfo.FileName = "$Directory\terraria-panel.exe"
    $startInfo.WorkingDirectory = $Directory
    $startInfo.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden
    $startInfo.CreateNoWindow = $true
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true
    $startInfo.UseShellExecute = $false

    $process = [System.Diagnostics.Process]::Start($startInfo)

    # Wait a moment and check if still running
    Start-Sleep -Seconds 2
    if (-not $process.HasExited) {
        Write-Success "Daemon started successfully (PID: $($process.Id))"
        Write-Info "Access panel at: http://localhost:$PortNumber"
        Write-Info "Log file: $Directory\terraria-panel.log"
    } else {
        Write-Error "Failed to start daemon"
        exit 1
    }
}

function Stop-Service {
    Write-Step "Stopping Service"

    $processes = Get-Process -Name "terraria-panel" -ErrorAction SilentlyContinue
    if ($processes) {
        foreach ($process in $processes) {
            Write-Info "Stopping service (PID: $($process.Id))..."
            $process.CloseMainWindow() | Out-Null

            # Wait for graceful shutdown
            if (-not $process.WaitForExit(10000)) {
                Write-Warning "Force killing service..."
                $process.Kill()
            }
        }
        Write-Success "Service stopped successfully"
    } else {
        Write-Warning "Service is not running"
    }
}

function Get-ServiceStatus {
    Write-Step "Service Status"

    $processes = Get-Process -Name "terraria-panel" -ErrorAction SilentlyContinue
    if ($processes) {
        foreach ($process in $processes) {
            Write-Success "Service is running (PID: $($process.Id))"
            Write-Info "Started: $($process.StartTime)"
            Write-Info "CPU Time: $($process.TotalProcessorTime)"
            Write-Info "Memory: $([math]::Round($process.WorkingSet64/1MB, 2)) MB"
        }
        return $true
    } else {
        Write-Warning "Service is not running"
        return $false
    }
}

function Show-Help {
    Write-Host "Usage:" -ForegroundColor White
    Write-Host "  .\deploy-ultra.ps1 [COMMAND] [-Port <PORT>] [-BackendDir <DIR>]"
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor White
    Write-Host "  build     构建项目 (前端+后端)" -ForegroundColor Green
    Write-Host "  start     启动服务 (前台运行)" -ForegroundColor Green
    Write-Host "  daemon    后台服务模式启动" -ForegroundColor Green
    Write-Host "  stop      停止服务" -ForegroundColor Green
    Write-Host "  restart   重启服务" -ForegroundColor Green
    Write-Host "  status    查看服务状态" -ForegroundColor Green
    Write-Host "  deploy    完整部署 (构建+准备启动)" -ForegroundColor Green
    Write-Host "  help      显示帮助信息" -ForegroundColor Green
    Write-Host ""
    Write-Host "Parameters:" -ForegroundColor White
    Write-Host "  -Port       指定端口 (默认: 8080)" -ForegroundColor Cyan
    Write-Host "  -BackendDir 指定后端目录 (默认: .\backend)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor White
    Write-Host "  .\deploy-ultra.ps1 deploy                 # 完整部署到默认端口8080"
    Write-Host "  .\deploy-ultra.ps1 deploy -Port 9090      # 部署到端口9090"
    Write-Host "  .\deploy-ultra.ps1 start -BackendDir .\my-backend # 从指定目录启动"
    Write-Host "  .\deploy-ultra.ps1 daemon                 # 后台服务模式"
    Write-Host ""
}

# Main execution
Write-Banner

switch ($Command) {
    "build" {
        Test-Dependencies
        Invoke-BuildProject
    }
    "start" {
        Start-Service -PortNumber $Port -Directory $BackendDir
    }
    "daemon" {
        Start-Daemon -PortNumber $Port -Directory $BackendDir
    }
    "stop" {
        Stop-Service
    }
    "restart" {
        Stop-Service
        Start-Sleep -Seconds 2
        Start-Daemon -PortNumber $Port -Directory $BackendDir
    }
    "status" {
        Get-ServiceStatus
    }
    "deploy" {
        Test-Dependencies
        Invoke-BuildProject
        Write-Host ""
        Write-Step "Deployment Complete!"
        Write-Success "Your Terraria Panel is ready to use!"
        Write-Host ""
        Write-Info "Next steps:"
        Write-Host "  1. Start the service: .\deploy-ultra.ps1 daemon -Port $Port"
        Write-Host "  2. Access the panel: http://localhost:$Port"
        Write-Host "  3. Check status: .\deploy-ultra.ps1 status"
        Write-Host ""
    }
    default {
        Show-Help
    }
}