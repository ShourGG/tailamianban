# 🚀 泰拉瑞亚面板 - 构建和部署指南

## 🎯 目标：实现像DMP项目一样的部署体验

用户不需要安装Go语言，只需运行脚本即可使用！

---

## 📦 构建方案（适用于Windows开发环境）

### 方案1：GitHub Actions 自动构建（推荐）

1. **推送代码到GitHub**
```bash
git add .
git commit -m "Release v1.0.0"
git tag v1.0.0
git push origin main --tags
```

2. **自动构建**
   - GitHub Actions 会自动构建Linux版本
   - 自动创建Release并上传二进制文件
   - 用户可以直接下载使用

### 方案2：本地Docker构建

```powershell
# 在项目根目录执行
.\scripts\build-linux.ps1 -Method docker -Arch amd64
```

### 方案3：本地WSL2构建

```powershell
# 需要先安装WSL2
wsl --install

# 构建
.\scripts\build-linux.ps1 -Method wsl -Arch amd64
```

---

## 🎮 用户部署体验（像DMP一样简单）

### 一键安装（最终效果）

用户只需执行一条命令：

```bash
# 下载并运行安装脚本
curl -fsSL https://raw.githubusercontent.com/你的用户名/terraria-panel/main/scripts/install.sh | sudo bash
```

脚本会自动：
1. ✅ 检测系统环境
2. ✅ 下载对应架构的二进制文件
3. ✅ 创建系统服务
4. ✅ 配置防火墙
5. ✅ 启动面板服务

### 手动安装

```bash
# 1. 下载发布包
wget https://github.com/你的用户名/terraria-panel/releases/latest/download/terraria-panel-linux-amd64.tar.gz

# 2. 解压
tar -xzf terraria-panel-linux-amd64.tar.gz
cd terraria-panel

# 3. 启动
./scripts/run.sh
```

选择菜单选项：
```
[0]: 下载并启动服务
[1]: 启动服务
[2]: 停止服务
[3]: 重启服务
[4]: 更新面板
```

---

## 🔧 实现原理

### 1. **预编译策略**
- 开发者编译好各平台二进制文件
- 上传到GitHub Releases
- 用户下载即可运行，无需Go环境

### 2. **嵌入式前端**
- 前端资源打包到dist目录
- Go使用embed包嵌入到二进制文件
- 单一文件包含所有功能

### 3. **智能脚本**
- `install.sh` - 自动安装脚本
- `run.sh` - 管理脚本（启动/停止/更新）
- 自动检测系统架构，下载对应版本

---

## 📝 开发流程

### 第一步：开发功能
```bash
# 后端开发
go run cmd/main.go

# 前端开发
cd web
npm run dev
```

### 第二步：构建测试
```powershell
# Windows上构建Linux版本
.\scripts\build-linux.ps1
```

### 第三步：发布版本
```bash
# 创建tag并推送
git tag v1.0.0
git push origin v1.0.0

# GitHub Actions自动构建并发布
```

### 第四步：用户使用
```bash
# 用户只需一条命令
curl -fsSL https://raw.githubusercontent.com/xxx/terraria-panel/main/scripts/install.sh | bash
```

---

## 🎨 与DMP项目对比

| 特性 | DMP项目 | 我们的项目 |
|------|---------|-----------|
| 安装方式 | ✅ 一键脚本 | ✅ 一键脚本 |
| Go环境 | ❌ 不需要 | ❌ 不需要 |
| 前端部署 | ✅ 内嵌 | ✅ 内嵌 |
| 数据库 | ✅ SQLite内置 | ✅ SQLite内置 |
| 更新方式 | ✅ 脚本更新 | ✅ 脚本更新 |
| 多架构 | ✅ amd64/arm64 | ✅ amd64/arm64 |

---

## 🚦 快速开始

### 对于开发者

1. **克隆项目**
```bash
git clone https://github.com/你的用户名/terraria-panel.git
cd terraria-panel
```

2. **本地开发**
```bash
# 安装依赖
go mod download
cd web && npm install

# 开发模式
go run cmd/main.go
```

3. **构建发布**
```powershell
# Windows上构建Linux版本
.\scripts\build-linux.ps1

# 或使用GitHub Actions
git tag v1.0.0 && git push origin v1.0.0
```

### 对于用户

就一条命令：
```bash
curl -fsSL https://your-install-url.com/install.sh | bash
```

---

## 💡 关键技术点

### 1. Go embed 嵌入前端
```go
//go:embed dist
var distFS embed.FS

// 在Gin中使用
r.StaticFS("/", http.FS(distFS))
```

### 2. 自动下载最新版本
```bash
# 获取最新版本
LATEST=$(curl -s https://api.github.com/repos/user/repo/releases/latest | grep tag_name | cut -d '"' -f 4)

# 下载对应架构
ARCH=$(uname -m)
wget https://github.com/user/repo/releases/download/$LATEST/terraria-panel-linux-$ARCH.tar.gz
```

### 3. 系统服务管理
```bash
# systemd service
sudo systemctl start terraria-panel
sudo systemctl enable terraria-panel
```

---

## ✅ 检查清单

开发完成前确保：
- [ ] Go代码可以正常编译
- [ ] 前端可以正常构建
- [ ] GitHub Actions配置正确
- [ ] install.sh脚本测试通过
- [ ] run.sh脚本功能完整
- [ ] README文档清晰
- [ ] 默认配置合理
- [ ] 错误处理完善

---

## 🎉 最终效果

用户体验流程：
1. 看到项目README
2. 复制一行安装命令
3. 等待30秒安装完成
4. 打开浏览器访问
5. 开始使用面板

**就这么简单！**