Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   泰拉瑞亚面板 - 前端构建脚本" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 进入web目录
Set-Location web

# 检查是否有 package.json
if (-not (Test-Path "package.json")) {
    Write-Host "错误：找不到 package.json 文件" -ForegroundColor Red
    exit 1
}

# 安装依赖
Write-Host "📦 安装前端依赖..." -ForegroundColor Green
npm install --registry=https://registry.npmmirror.com

if ($LASTEXITCODE -ne 0) {
    Write-Host "依赖安装失败！" -ForegroundColor Red
    exit 1
}

# 构建前端
Write-Host "🔨 构建前端资源..." -ForegroundColor Green
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "前端构建失败！" -ForegroundColor Red
    exit 1
}

# 返回项目根目录
Set-Location ..

# 清理旧的dist目录
Write-Host "📁 清理旧文件..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Path "dist" -Recurse -Force
}

# 复制新的dist目录
Write-Host "📁 复制构建产物..." -ForegroundColor Green
Copy-Item -Path "web\dist" -Destination "." -Recurse

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ 前端构建完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "下一步：" -ForegroundColor Yellow
Write-Host "1. git add ." -ForegroundColor White
Write-Host "2. git commit -m 'Build frontend'" -ForegroundColor White
Write-Host "3. git push" -ForegroundColor White
Write-Host ""
Write-Host "在Linux上执行：" -ForegroundColor Yellow
Write-Host "git clone https://github.com/你的用户名/terraria-panel" -ForegroundColor White
Write-Host "cd terraria-panel" -ForegroundColor White
Write-Host "chmod +x run-linux.sh" -ForegroundColor White
Write-Host "./run-linux.sh" -ForegroundColor White