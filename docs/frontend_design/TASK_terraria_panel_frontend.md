# 泰拉瑞亚面板前端改造任务清单

## 任务分解

基于 RFC 设计方案，将前端改造工作分解为以下原子任务：

---

## Phase 1: 基础架构准备 (Foundation)

### Task 1.1: 主题配置系统
**目标**: 创建泰拉瑞亚主题配置
**文件**: 
- `web/src/config/theme.ts`
- `web/src/assets/css/terraria-theme.css`

**接口定义**:
```typescript
export interface TerrariaTheme {
  primary: string
  info: string
  success: string
  warning: string
  error: string
  bgBase: string
  bgCard: string
  textPrimary: string
  // ...
}

export const terrariaTheme: TerrariaTheme
export const applyTerrariaTheme: () => void
```

**验收标准**:
- ✅ 主题配置文件完整
- ✅ 颜色变量可全局访问
- ✅ 支持动态切换主题

**依赖**: 无

---

### Task 1.2: API 接口定义
**目标**: 定义泰拉瑞亚服务器 API 接口
**文件**: `web/src/api/terraria.ts`

**接口定义**:
```typescript
export interface ServerStatus {
  status: 'running' | 'stopped' | 'error'
  uptime: number
  version: string
  port: number
  maxPlayers: number
}

export interface Player {
  id: string
  name: string
  ip: string
  joinTime: number
  level: number
  team: number
}

export interface SystemStats {
  cpu: number
  memory: number
  disk: number
  network: { in: number; out: number }
}

export const terrariaApi = {
  // 服务器控制
  getServerStatus: (): Promise<ServerStatus>
  startServer: (): Promise<void>
  stopServer: (): Promise<void>
  restartServer: (): Promise<void>
  
  // 玩家管理
  getOnlinePlayers: (): Promise<Player[]>
  kickPlayer: (playerId: string): Promise<void>
  banPlayer: (playerId: string, reason: string): Promise<void>
  
  // 世界管理
  getWorldList: (): Promise<World[]>
  uploadWorld: (file: File): Promise<void>
  deleteWorld: (worldId: string): Promise<void>
  backupWorld: (worldId: string): Promise<void>
  
  // 系统监控
  getSystemStats: (): Promise<SystemStats>
  getRecentLogs: (): Promise<OperationLog[]>
}
```

**验收标准**:
- ✅ 所有 API 接口类型定义完整
- ✅ 接口与后端 API 对应
- ✅ 包含错误处理机制

**依赖**: 后端 API 已实现

---

### Task 1.3: WebSocket 实时通信
**目标**: 实现 WebSocket 连接和数据更新
**文件**: `web/src/composables/useWebSocket.ts`

**接口定义**:
```typescript
export interface UseWebSocketOptions {
  url: string
  autoConnect?: boolean
  reconnect?: boolean
  reconnectInterval?: number
}

export interface UseWebSocketReturn<T> {
  data: Ref<T | null>
  status: Ref<'connecting' | 'connected' | 'disconnected' | 'error'>
  connect: () => void
  disconnect: () => void
  send: (data: any) => void
}

export function useWebSocket<T = any>(
  options: UseWebSocketOptions
): UseWebSocketReturn<T>
```

**验收标准**:
- ✅ WebSocket 连接稳定
- ✅ 支持自动重连
- ✅ 实时数据更新正常
- ✅ 错误处理完善

**依赖**: Task 1.2

---

### Task 1.4: 路由配置
**目标**: 配置泰拉瑞亚专属路由
**文件**: `web/src/router/modules/terraria.ts`

**接口定义**:
```typescript
export const terrariaRoutes = [
  {
    path: '/terraria',
    name: 'Terraria',
    redirect: '/terraria/dashboard',
    component: Layout,
    meta: { title: '泰拉瑞亚管理', icon: 'mdi:gamepad-variant' },
    children: [
      {
        path: 'dashboard',
        name: 'TerrariaDashboard',
        component: () => import('@/views/terraria/dashboard/index.vue'),
        meta: { title: '仪表盘', icon: 'mdi:view-dashboard' }
      },
      // ... 其他路由
    ]
  }
]
```

**验收标准**:
- ✅ 路由配置完整
- ✅ 路由懒加载
- ✅ 面包屑导航正确

**依赖**: 无

---

## Phase 2: 核心页面实现 (Core Pages)

### Task 2.1: 仪表盘页面
**目标**: 实现服务器状态总览页面
**文件**: 
- `web/src/views/terraria/dashboard/index.vue`
- `web/src/views/terraria/dashboard/components/ServerStatusCard.vue`
- `web/src/views/terraria/dashboard/components/OnlinePlayersCard.vue`
- `web/src/views/terraria/dashboard/components/SystemMonitorCharts.vue`
- `web/src/views/terraria/dashboard/components/QuickActionsPanel.vue`

**功能需求**:
- 服务器运行状态显示（运行/停止/错误）
- 在线玩家数量和列表预览
- 系统资源使用情况（CPU/内存/磁盘）
- 快捷操作按钮（启动/停止/重启）
- 实时数据更新（WebSocket）

**验收标准**:
- ✅ 所有状态卡片正常显示
- ✅ 实时数据更新正常
- ✅ 操作按钮功能正常
- ✅ 响应式布局适配

**依赖**: Task 1.1, 1.2, 1.3

---

### Task 2.2: 服务器管理页面
**目标**: 实现服务器控制和配置页面
**文件**:
- `web/src/views/terraria/server/index.vue`
- `web/src/views/terraria/server/components/ServerControl.vue`
- `web/src/views/terraria/server/components/ServerConfig.vue`
- `web/src/views/terraria/server/components/ServerLogs.vue`

**功能需求**:
- 服务器启动/停止/重启控制
- 实时日志查看（支持自动滚动、搜索、过滤）
- 服务器配置编辑（端口、最大玩家数、难度等）
- 配置保存和验证

**验收标准**:
- ✅ 服务器控制按钮功能正常
- ✅ 实时日志流式显示
- ✅ 配置编辑和保存正常
- ✅ 表单验证完善

**依赖**: Task 1.2, 1.3

---

### Task 2.3: 玩家管理页面
**目标**: 实现在线玩家管理功能
**文件**:
- `web/src/views/terraria/players/index.vue`
- `web/src/views/terraria/players/components/PlayerList.vue`
- `web/src/views/terraria/players/components/PlayerStats.vue`
- `web/src/views/terraria/players/components/PlayerActions.vue`

**功能需求**:
- 在线玩家实时列表
- 玩家详细信息（等级、装备、位置）
- 管理员操作（踢出、封禁、发送消息）
- 玩家统计数据

**验收标准**:
- ✅ 玩家列表实时更新
- ✅ 玩家操作功能正常
- ✅ 操作确认对话框
- ✅ 操作日志记录

**依赖**: Task 1.2, 1.3

---

### Task 2.4: 世界管理页面
**目标**: 实现世界文件管理功能
**文件**:
- `web/src/views/terraria/worlds/index.vue`
- `web/src/views/terraria/worlds/components/WorldList.vue`
- `web/src/views/terraria/worlds/components/WorldUpload.vue`
- `web/src/views/terraria/worlds/components/WorldBackup.vue`

**功能需求**:
- 世界文件列表显示
- 世界文件上传（支持拖拽）
- 世界删除（安全确认）
- 世界备份和还原

**验收标准**:
- ✅ 世界列表正常显示
- ✅ 文件上传功能正常
- ✅ 备份还原功能正常
- ✅ 删除操作安全确认

**依赖**: Task 1.2

---

### Task 2.5: 系统监控页面
**目标**: 实现系统监控和日志查看
**文件**:
- `web/src/views/terraria/monitor/index.vue`
- `web/src/views/terraria/monitor/components/SystemStats.vue`
- `web/src/views/terraria/monitor/components/PerformanceCharts.vue`
- `web/src/views/terraria/monitor/components/OperationLogs.vue`

**功能需求**:
- 系统资源实时监控（CPU/内存/磁盘/网络）
- 性能图表展示（历史数据）
- 操作日志查看（支持搜索和过滤）
- 告警通知列表

**验收标准**:
- ✅ 系统状态实时更新
- ✅ 图表正常显示
- ✅ 日志查看功能完善
- ✅ 性能优化（大数据量）

**依赖**: Task 1.2, 1.3

---

## Phase 3: 视觉优化 (Visual Enhancement)

### Task 3.1: 顶部导航栏定制
**目标**: 定制泰拉瑞亚风格的顶部导航
**文件**: `web/src/layouts/components/Header.vue`

**功能需求**:
- 泰拉瑞亚 logo 和标题
- 服务器状态徽章
- 在线玩家数显示
- 用户菜单

**验收标准**:
- ✅ Logo 和标题显示正确
- ✅ 状态徽章实时更新
- ✅ 样式符合主题

**依赖**: Task 1.1

---

### Task 3.2: 侧边菜单定制
**目标**: 定制泰拉瑞亚专属菜单
**文件**: `web/src/layouts/components/Sidebar.vue`

**功能需求**:
- 泰拉瑞亚功能菜单
- 图标和文字配色
- 激活状态样式

**验收标准**:
- ✅ 菜单项显示正确
- ✅ 路由跳转正常
- ✅ 激活状态明显

**依赖**: Task 1.1, 1.4

---

### Task 3.3: 加载动画和过渡效果
**目标**: 添加流畅的动画效果
**文件**: 
- `web/src/components/Loading/ServerLoading.vue`
- `web/src/assets/css/animations.css`

**功能需求**:
- 服务器启动加载动画
- 页面切换过渡效果
- 数据加载骨架屏

**验收标准**:
- ✅ 动画流畅自然
- ✅ 不影响性能
- ✅ 可配置开关

**依赖**: Task 1.1

---

### Task 3.4: 响应式布局优化
**目标**: 优化桌面端和移动端显示
**文件**: 各页面的 SCSS 文件

**功能需求**:
- 桌面端大屏优化
- 平板端布局适配
- 移动端基础功能

**验收标准**:
- ✅ 桌面端(>1200px)完美显示
- ✅ 平板端(768-1200px)正常使用
- ✅ 移动端(<768px)基础功能可用

**依赖**: 所有页面实现完成

---

## Phase 4: 测试和优化 (Testing & Optimization)

### Task 4.1: 功能测试
**目标**: 测试所有功能正常运行
**测试清单**:
- [ ] 服务器启动/停止/重启
- [ ] 实时日志显示
- [ ] 玩家管理操作
- [ ] 世界文件上传下载
- [ ] 系统监控数据更新
- [ ] WebSocket 连接稳定性
- [ ] 错误处理和提示

**验收标准**:
- ✅ 所有功能正常运行
- ✅ 边界条件处理正确
- ✅ 错误提示清晰

**依赖**: 所有功能实现完成

---

### Task 4.2: 性能优化
**目标**: 优化页面性能和加载速度
**优化项**:
- 组件懒加载
- 图片压缩和懒加载
- 大数据量虚拟滚动
- API 请求缓存
- WebSocket 消息节流

**验收标准**:
- ✅ 首屏加载时间 < 2s
- ✅ 页面切换流畅
- ✅ 内存占用合理

**依赖**: 