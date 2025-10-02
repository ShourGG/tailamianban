# Task List: 泰拉瑞亚面板前端功能整改

## 任务概览

基于 `RFC_terraria_panel_refactor.md` 的方案，将原有 Robot_Admin 面板改造为泰拉瑞亚专用管理面板。

**核心原则**:
- 保持原有界面和样式
- 移除所有 demo 功能
- 所有数据来自真实后端 API
- 严禁使用假数据

---

## 阶段 1: 清理 Demo 功能模块

### Task 1.1: 删除 Demo 页面目录
**目标**: 删除所有示例页面，保留核心框架

**需要删除的目录**:
- [ ] `web/src/views/demo/` - 所有 demo 示例页面（约30个文件）
- [ ] `web/src/views/about/` - 关于页面
- [ ] `web/src/views/dashboard/` - 原有仪表盘示例
- [ ] `web/src/views/iframe/` - iframe 示例页面
- [ ] `web/src/views/home/` - 原有首页（保留目录，替换内容）

**保留的目录**:
- ✅ `web/src/views/login/` - 登录页面
- ✅ `web/src/views/error-page/` - 错误页面
- ✅ `web/src/views/sys-manage/` - 系统管理（用户、角色、菜单）
- ✅ `web/src/views/terraria/` - 泰拉瑞亚管理（新功能）

**验收标准**:
- demo 目录已删除
- 项目可正常编译
- 不影响登录和系统管理功能

---

### Task 1.2: 删除 Demo API 文件
**目标**: 清理所有示例 API 接口定义

**需要删除的文件**:
- [ ] `web/src/api/10-table.ts` - 表格示例 API
- [ ] `web/src/api/11-table-expand.ts` - 扩展表格 API
- [ ] `web/src/api/12-table-dynamic.ts` - 动态表格 API

**需要检查的文件**:
- [ ] `web/src/api/permission-manage.ts` - 检查是否有 demo 数据，保留真实权限 API

**验收标准**:
- demo API 文件已删除
- 保留的 API 文件不含假数据
- TypeScript 编译无错误

---

### Task 1.3: 更新路由配置
**目标**: 移除 demo 路由，添加泰拉瑞亚路由

**需要修改的文件**:
- [ ] `web/src/assets/data/dynamicRouter.json` - 删除 demo 路由配置
- [ ] `web/src/router/dynamicRouter.ts` - 检查动态路由逻辑

**需要保留的路由**:
```json
{
  "routes": [
    { "name": "Login", "path": "/login" },
    { "name": "Error", "path": "/error" },
    { "name": "SysManage", "path": "/sys-manage" },
    { "name": "Terraria", "path": "/terraria" }
  ]
}
```

**验收标准**:
- demo 路由已移除
- 泰拉瑞亚路由已添加
- 路由跳转正常

---

### Task 1.4: 清理静态资源
**目标**: 删除 demo 相关的图片和数据文件

**需要检查的文件**:
- [ ] `web/src/assets/data/` - 删除示例数据 JSON
- [ ] `web/src/assets/images/` - 检查是否有 demo 相关图片

**保留的资源**:
- ✅ 登录背景图
- ✅ Logo 图标
- ✅ 错误页面图片

**验收标准**:
- demo 数据文件已删除
- 必要的静态资源保留
- 构建包体积减小

---

## 阶段 2: 实现泰拉瑞亚核心功能

### Task 2.1: 创建 API 接口定义
**目标**: 定义泰拉瑞亚管理的所有 API 接口（对接真实后端）

**需要创建的文件**:
- [ ] `web/src/api/terraria.ts` - 泰拉瑞亚 API 定义

**接口列表**:
```typescript
// 服务器控制
- getServerStatus()      // GET /api/server/status
- startServer()          // POST /api/server/start
- stopServer()           // POST /api/server/stop
- restartServer()        // POST /api/server/restart

// 玩家管理
- getOnlinePlayers()     // GET /api/players/online
- kickPlayer(id)         // POST /api/players/:id/kick
- banPlayer(id, reason)  // POST /api/players/:id/ban

// 世界管理
- getWorldList()         // GET /api/worlds
- uploadWorld(file)      // POST /api/worlds/upload
- deleteWorld(id)        // DELETE /api/worlds/:id
- backupWorld(id)        // POST /api/worlds/:id/backup

// 系统监控
- getSystemStats()       // GET /api/monitor/stats
- getServerLogs(lines)   // GET /api/server/logs
```

**验收标准**:
- 所有接口定义完整
- TypeScript 类型定义准确
- 与后端 API 路径一致
- 无任何模拟数据

---

### Task 2.2: 实现泰拉瑞亚仪表盘
**目标**: 创建泰拉瑞亚管理的首页仪表盘

**需要创建的文件**:
- [ ] `web/src/views/terraria/dashboard/index.vue`

**页面功能**:
1. 服务器状态卡片（运行状态、运行时间、端口）
2. 在线玩家卡片（当前/最大玩家数）
3. 系统资源卡片（CPU、内存使用率）
4. 在线玩家列表（表格显示）
5. 快捷操作按钮（启动、停止、重启）

**数据来源**:
- ✅ 调用 `getServerStatus()` 获取服务器状态
- ✅ 调用 `getOnlinePlayers()` 获取玩家列表
- ✅ 调用 `getSystemStats()` 获取系统资源
- ❌ 严禁使用任何假数据

**验收标准**:
- 页面正常渲染
- 所有数据来自真实 API
- 加载状态和错误处理完善
- 在 Linux 服务器实测通过

---

### Task 2.3: 实现服务器管理页面
**目标**: 创建服务器控制和日志查看页面

**需要创建的文件**:
- [ ] `web/src/views/terraria/server/index.vue`

**页面功能**:
1. 服务器控制面板（启动、停止、重启按钮）
2. 服务器配置信息（端口、密码、最大玩家数）
3. 实时日志查看器（支持滚动、搜索、筛选）
4. 日志导出功能

**数据来源**:
- ✅ 调用 `startServer()` / `stopServer()` / `restartServer()`
- ✅ 调用 `getServerLogs()` 获取日志
- ✅ WebSocket 实时推送日志更新
- ❌ 严禁使用假日志数据

**验收标准**:
- 服务器控制功能正常
- 日志实时更新
- 操作有二次确认
- 在 Linux 服务器实测通过

---

### Task 2.4: 实现玩家管理页面
**目标**: 创建玩家列表和操作页面

**需要创建的文件**:
- [ ] `web/src/views/terraria/players/index.vue`

**页面功能**:
1. 在线玩家列表（ID、昵称、IP、加入时间、队伍）
2. 玩家操作按钮（踢出、封禁）
3. 封禁记录查看
4. 白名单管理

**数据来源**:
- ✅ 调用 `getOnlinePlayers()` 获取玩家列表
- ✅ 调用 `kickPlayer()` 踢出玩家
- ✅ 调用 `banPlayer()` 封禁玩家
- ❌ 严禁使用假玩家数据

**验收标准**:
- 玩家列表实时更新
- 操作功能正常
- 有操作确认和日志记录
- 在 Linux 服务器实测通过

---

### Task 2.5: 实现世界管理页面
**目标**: 创建世界文件管理页面

**需要创建的文件**:
- [ ] `web/src/views/terraria/worlds/index.vue`

**页面功能**:
1. 世界列表（名称、大小、难度、创建时间）
2. 世界上传功能（支持 .wld 文件）
3. 世界下载功能
4. 世界备份/恢复功能
5. 世界删除功能

**数据来源**:
- ✅ 调用 `getWorldList()` 获取世界列表
- ✅ 调用 `uploadWorld()` 上传世界文件
- ✅ 调用 `deleteWorld()` 删除世界
- ✅ 调用 `backupWorld()` 备份世界
- ❌ 严禁使用假世界数据

**验收标准**:
- 世界列表正常显示
- 文件上传下载功能正常
- 删除操作有二次确认
- 在 Linux 服务器实测通过

---

### Task 2.6: 实现系统监控页面
**目标**: 创建系统资源监控页面

**需要创建的文件**:
- [ ] `web/src/views/terraria/monitor/index.vue`

**页面功能**:
1. CPU 使用率图表（实时折线图）
2. 内存使用率图表（实时折线图）
3. 磁盘使用情况
4. 网络流量统计（入站/出站）
5. 历史数据查看

**数据来源**:
- ✅ 调用 `getSystemStats()` 获取系统资源
- ✅ WebSocket 实时推送监控数据
- ❌ 严禁使用假监控数据

**验收标准**:
- 监控图表实时更新
- 数据展示准确
- 性能优化良好
- 在 Linux 服务器实测通过

---

## 阶段 3: 路由和菜单配置

### Task 3.1: 创建泰拉瑞亚路由模块
**目标**: 定义泰拉瑞亚管理的路由配置

**需要创建的文件**:
- [ ] `web/src/router/modules/terraria.ts`

**路由结构**:
```typescript
/terraria
  ├── /dashboard      # 仪表盘
  ├── /server         # 服务器管理
  ├── /players        # 玩家管理
  ├── /worlds         # 世界管理
  └── /monitor        # 系统监控
```

**验收标准**:
- 路由配置完整
- 路由跳转正常
- 面包屑导航正确

---

### Task 3.2: 更新菜单配置
**目标**: 更新侧边栏菜单，移除 demo 菜单

**需要修改的文件**:
- [ ] `web/src/assets/data/dynamicRouter.json`

**菜单结构**:
```
泰拉瑞亚管理
├── 仪表盘
├── 服务器管理
├── 玩家管理
├── 世界管理
└── 系统监控

系统管理
├── 用户管理
├── 角色管理
└── 菜单管理
```

**验收标准**:
- demo 菜单已移除
- 泰拉瑞亚菜单已添加
- 菜单图标正确显示

---

## 阶段 4: 测试和部署

### Task 4.1: 本地编译测试
**目标**: 确保代码可正常编译

**测试步骤**:
```bash
cd web
npm install
npm run build
```

**验收标准**:
- 编译无错误
- 无 TypeScript 类型错误
- 无 ESLint 警告

---

### Task 4.2: 提交到 GitHub
**目标**: 推送代码并触发自动构建

**操作步骤**:
```bash
# 1. 更新版本号
cd web
npm version patch

# 2. 提交代码
cd ..
git add .
git commit -m "feat: refactor frontend to terraria panel"

# 3. 打标签并推送
git tag v1.1.9.13
git push origin main
git push origin v1.1.9.13
```

**验收标准**:
- GitHub Actions 构建成功
- Release 已自动发布

---

### Task 4.3: Linux 服务器实测
**目标**: 在真实环境测试所有功能

**测试步骤**:
```bash
# 1. 下载最新版本
wget https://github.com/ShourGG/tailamianban/releases/latest/download/terraria-panel-linux.tar.gz
tar -xzf terraria-panel-linux.tar.gz

# 2. 运行面板
chmod +x terraria-panel
./terraria-panel

# 3. 测试功能
# - 登