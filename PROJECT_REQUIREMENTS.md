# 泰拉瑞亚管理面板 - 项目需求与配置文档

## 📋 项目概述

这是一个基于 Go + Vue 3 的泰拉瑞亚游戏服务器管理面板,提供服务器管理、玩家管理、世界管理等功能。

- **项目名称**: Terraria Panel (泰拉瑞亚管理面板)
- **当前版本**: v1.2.0.17
- **仓库地址**: https://github.com/ShourGG/tailamianban
- **原项目参考**: https://github.com/ChenyCHENYU/Robot_Admin

## 🏗️ 技术栈

### 后端
- **语言**: Go 1.23.5
- **框架**: Gin
- **数据库**: SQLite (通过 GORM)
- **嵌入式前端**: embed.FS

### 前端
- **框架**: Vue 3 + TypeScript
- **构建工具**: Vite 5.4.20
- **UI框架**: Naive UI
- **路由**: Vue Router (History模式)
- **状态管理**: Pinia
- **CSS**: UnoCSS + SCSS

## ⚙️ 关键配置要求

### 1. 环境变量配置 (Critical)

所有环境配置文件**必须**包含以下变量:

```env
# 应用基础配置
VITE_APP_TITLE=泰拉瑞亚管理面板
VITE_API_BASE_URL=/api
VITE_PUBLIC_PATH=/
VITE_ENV=production

# 🔴 关键配置 - 必须添加!
VITE_ROUTER_MODE=history
```

**配置文件位置:**
- `web/.env` - 主环境配置
- `web/envs/.env.production` - 生产环境
- `web/envs/.env.development` - 开发环境

**⚠️ 重要提示**: 
- `VITE_ROUTER_MODE` 是**必需的**环境变量
- 缺少此变量会导致页面空白(路由无法初始化)
- 该变量在 `web/src/router/index.ts` 中被引用

### 2. 路由配置

```typescript
// web/src/router/index.ts
const mode = import.meta.env.VITE_ROUTER_MODE as 'hash' | 'history'

const routerMode = {
  hash: () => createWebHashHistory(),
  history: () => createWebHistory(),
}

const historyCreator = routerMode[mode] || createWebHashHistory
```

### 3. 构建配置

**前端构建:**
```bash
cd web && npm run build
```
- 输出目录: `web/dist/`
- 嵌入目标: `cmd/dist/` (手动复制)

**后端构建:**
```bash
cd cmd && go build -ldflags="-s -w -X main.Version=<版本号> -X main.Build=release" -o terraria-panel-linux
```

**嵌入式前端:**
```go
//go:embed all:dist
var EmbedFS embed.FS
```

## 🐛 已知问题与修复历史

### Issue #1: 页面空白问题 (v1.2.0.17 已修复)

**问题描述:**
- 生产环境部署后页面完全空白
- 所有静态资源(JS/CSS)正常加载
- 浏览器控制台无错误信息

**根本原因:**
缺少关键环境变量 `VITE_ROUTER_MODE`,导致 Vue Router 初始化失败:
```typescript
// mode 为 undefined 时,路由无法正确初始化
const mode = import.meta.env.VITE_ROUTER_MODE // undefined!
```

**解决方案:**
在所有环境配置文件中添加:
```env
VITE_ROUTER_MODE=history
```

**修复版本**: v1.2.0.17  
**提交记录**: `e74fbdf` - fix: resolve blank page issue by adding missing VITE_ROUTER_MODE

## 🚀 部署流程

### 自动化部署 (推荐)

1. **提交代码到main分支**
   ```bash
   git add -A
   git commit -m "feat: your feature description"
   git push origin main
   ```

2. **创建并推送版本标签**
   ```bash
   git tag -a v1.2.0.x -m "release: version description"
   git push origin v1.2.0.x
   ```

3. **GitHub Actions自动构建**
   - 触发条件: 推送以 `v` 开头的tag
   - 工作流文件: `.github/workflows/release.yml`
   - 构建产物: `terraria-panel-linux`
   - 自动发布到: GitHub Releases

### 手动部署

1. **构建前端**
   ```bash
   cd web
   npm install
   npm run build
   ```

2. **复制前端资源**
   ```bash
   cp -r web/dist/* cmd/dist/
   ```

3. **构建后端**
   ```bash
   cd cmd
   go build -ldflags="-s -w -X main.Version=1.2.0.x -X main.Build=release" -o terraria-panel-linux
   ```

4. **部署到服务器**
   ```bash
   scp cmd/terraria-panel-linux user@server:/path/to/deploy/
   ssh user@server "chmod +x /path/to/deploy/terraria-panel-linux"
   ```

## 📁 项目结构

```
.
├── cmd/
│   ├── main.go           # 主程序入口
│   └── dist/             # 嵌入式前端资源(手动复制)
├── internal/
│   ├── api/              # API路由与处理器
│   ├── service/          # 业务逻辑层
│   └── repository/       # 数据访问层
├── web/
│   ├── src/              # Vue源代码
│   ├── dist/             # 构建输出(自动生成)
│   ├── .env              # 环境配置(主)
│   └── envs/             # 各环境配置文件
├── .github/workflows/    # GitHub Actions配置
└── docs/                 # 项目文档
```

## 🔧 开发指南

### 环境准备
```bash
# 后端依赖
go mod download

# 前端依赖
cd web && npm install
```

### 本地开发
```bash
# 启动后端 (开发模式)
go run cmd/main.go

# 启动前端 (开发模式,另一个终端)
cd web && npm run dev
```

### 版本发布检查清单

- [ ] 更新版本号
  - [ ] `web/src/config/version.ts`
  - [ ] `cmd/main.go`
- [ ] 确认环境配置文件包含 `VITE_ROUTER_MODE`
- [ ] 前端构建成功
- [ ] 后端编译成功
- [ ] 提交代码到 main 分支
- [ ] 创建并推送版本 tag
- [ ] 等待 GitHub Actions 构建完成
- [ ] 在 Releases 页面验证发布

## 📞 故障排查

### 页面空白
1. 检查 `VITE_ROUTER_MODE` 是否已配置
2. 检查浏览器控制台是否有路由错误
3. 验证 `cmd/dist/` 是否包含最新的前端资源

### 构建失败
1. 检查 Go 版本 (需要 1.23+)
2. 检查 Node.js 版本 (需要 18+)
3. 清理并重新构建:
   ```bash
   cd web && rm -rf node_modules dist && npm install && npm run build
   ```

### GitHub Actions失败
1. 检查是否推送了tag (而不仅仅是commit)
2. 检查tag格式 (必须以 `v` 开头,如 `v1.2.0.17`)
3. 查看Actions日志获取详细错误信息

## 📚 参考资源

- [原项目 Robot_Admin](https://github.com/ChenyCHENYU/Robot_Admin)
- [Vue Router 文档](https://router.vuejs.org/)
- [Gin 框架文档](https://gin-gonic.com/)
- [Vite 构建工具](https://vitejs.dev/)

## 📝 更新日志

### v1.2.0.17 (2025-01-04)
- **修复**: 添加缺失的 `VITE_ROUTER_MODE` 环境变量
- **修复**: 解决生产环境页面空白问题
- **优化**: 完善环境配置文件

### v1.2.0.16 及更早版本
- (之前的版本历史)

---

**维护者**: ShourGG  
**最后更新**: 2025-01-04