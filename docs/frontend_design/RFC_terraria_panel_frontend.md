# RFC: 泰拉瑞亚服务器管理面板前端设计方案

## Overview

基于现有的 Robot_Admin 开源前端框架（Vue3 + TypeScript + Naive UI），改造为专属的泰拉瑞亚服务器管理面板。保留现有优秀的组件和架构，替换和定制核心业务页面。

**设计理念**: 泰拉瑞亚面板 = Robot_Admin的现代化 + 游戏风格主题 + 专属功能定制

## Goals

1. **快速改造**: 复用现有80%的基础代码，仅改造核心业务页面
2. **泰拉瑞亚主题化**: 使用游戏风格的配色和视觉元素
3. **功能专属化**: 实现泰拉瑞亚服务器管理的5大核心模块
4. **保持现代化**: 继承 Robot_Admin 的优秀架构和组件设计
5. **生产就绪**: 确保所有代码符合生产环境标准

## Non-Goals

- 不重写整个前端框架
- 不改变现有的路由、状态管理等基础架构
- 不支持多游戏服务器管理（专注泰拉瑞亚）
- 第一阶段不实现移动端 APP

## Proposed Solution

### 1. 技术栈确认

**保持不变的技术栈**:
- Vue 3.5+ with Composition API
- TypeScript 5.0+
- Naive UI 2.40+ (组件库)
- Vite 7.0+ (构建工具)
- UnoCSS (原子化CSS)
- Pinia (状态管理)
- Vue Router (路由管理)

**新增/增强**:
- ECharts 5.5+ (数据可视化)
- WebSocket (实时通信)
- 泰拉瑞亚主题色系

### 2. 主题设计方案

#### 2.1 配色方案 - 现代暗色主题 + 泰拉瑞亚元素

```typescript
// 泰拉瑞亚主题色系
export const terrariaTheme = {
  // 主色调：森林绿（泰拉瑞亚标志性颜色）
  primary: '#4CAF50',
  primaryHover: '#66BB6A',
  primaryPressed: '#388E3C',
  
  // 辅助色：天空蓝（泰拉瑞亚天空）
  info: '#42A5F5',
  infoHover: '#64B5F6',
  infoPressed: '#1976D2',
  
  // 成功色：生命水晶绿
  success: '#66BB6A',
  successHover: '#81C784',
  successPressed: '#388E3C',
  
  // 警告色：熔岩橙
  warning: '#FFA726',
  warningHover: '#FFB74D',
  warningPressed: '#F57C00',
  
  // 错误色：血月红
  error: '#EF5350',
  errorHover: '#E57373',
  errorPressed: '#C62828',
  
  // 背景色：暗夜基调
  bgBase: '#1a1a1a',
  bgCard: '#242424',
  bgHover: '#2a2a2a',
  
  // 边框色
  border: '#333333',
  borderHover: '#404040',
  
  // 文字色
  textPrimary: '#e0e0e0',
  textSecondary: '#b0b0b0',
  textDisabled: '#666666',
}
```

#### 2.2 视觉元素

- **图标系统**: 使用 Iconify 图标库，选择像素风格图标集
- **动画效果**: 平滑的过渡动画，服务器启动时的加载动画
- **卡片设计**: 带有轻微阴影和边框的卡片，体现层次感
- **数据图表**: 使用 ECharts 深色主题，配合泰拉瑞亚配色

### 3. 核心页面架构

#### 3.1 页面结构规划

```
web/src/views/terraria/
├── dashboard/              # 仪表盘
│   ├── index.vue          # 总览页面
│   ├── components/        # 仪表盘组件
│   │   ├── ServerStatus.vue      # 服务器状态卡片
│   │   ├── OnlinePlayers.vue     # 在线玩家列表
│   │   ├── SystemMonitor.vue     # 系统监控图表
│   │   └── QuickActions.vue      # 快捷操作按钮
│   └── index.scss         # 样式文件
│
├── server/                 # 服务器管理
│   ├── index.vue          # 服务器管理主页
│   ├── components/        
│   │   ├── ServerControl.vue     # 启动/停止控制
│   │   ├── ServerConfig.vue      # 配置编辑器
│   │   ├── ServerLogs.vue        # 实时日志查看
│   │   └── ServerInfo.vue        # 服务器信息
│   └── index.scss
│
├── players/                # 玩家管理
│   ├── index.vue          # 玩家管理主页
│   ├── components/
│   │   ├── PlayerList.vue        # 在线玩家列表
│   │   ├── PlayerStats.vue       # 玩家统计
│   │   ├── PlayerActions.vue     # 玩家操作(踢出/封禁)
│   │   └── ChatHistory.vue       # 聊天记录
│   └── index.scss
│
├── worlds/                 # 世界管理
│   ├── index.vue          # 世界管理主页
│   ├── components/
│   │   ├── WorldList.vue         # 世界列表
│   │   ├── WorldUpload.vue       # 世界上传
│   │   ├── WorldBackup.vue       # 备份管理
│   │   └── WorldInfo.vue         # 世界信息
│   └── index.scss
│
└── monitor/                # 系统监控
    ├── index.vue          # 系统监控主页
    ├── components/
    │   ├── SystemStats.vue       # 系统状态
    │   ├── PerformanceCharts.vue # 性能图表
    │   ├── AlertsList.vue        # 告警列表
    │   └── OperationLogs.vue     # 操作日志
    └── index.scss
```

#### 3.2 布局设计

**顶部导航栏**:
```vue
<!-- 保留 Robot_Admin 的顶部导航，调整颜色和logo -->
<template>
  <NLayoutHeader bordered class="terraria-header">
    <div class="header-left">
      <img src="@/assets/images/terraria-logo.png" alt="Logo" class="logo" />
      <span class="title">泰拉瑞亚服务器管理面板</span>
      <span class="version">v{{ VERSION }}</span>
    </div>
    <div class="header-right">
      <ServerStatusBadge />  <!-- 服务器状态徽章 -->
      <OnlinePlayersCount /> <!-- 在线玩家数 -->
      <UserMenu />           <!-- 用户菜单 -->
    </div>
  </NLayoutHeader>
</template>
```

**侧边菜单**:
```typescript
// 泰拉瑞亚专属菜单配置
export const terrariaMenus = [
  {
    label: '仪表盘',
    key: 'dashboard',
    icon: 'mdi:view-dashboard',
    path: '/terraria/dashboard'
  },
  {
    label: '服务器管理',
    key: 'server',
    icon: 'mdi:server',
    path: '/terraria/server',
    children: [
      { label: '服务器控制', key: 'server-control', path: '/terraria/server/control' },
      { label: '服务器配置', key: 'server-config', path: '/terraria/server/config' },
      { label: '实时日志', key: 'server-logs', path: '/terraria/server/logs' }
    ]
  },
  {
    label: '玩家管理',
    key: 'players',
    icon: 'mdi:account-group',
    path: '/terraria/players'
  },
  {
    label: '世界管理',
    key: 'worlds',
    icon: 'mdi:earth',
    path: '/terraria/worlds'
  },
  {
    label: '系统监控',
    key: 'monitor',
    icon: 'mdi:monitor-dashboard',
    path: '/terraria/monitor'
  }
]
```

### 4. 核心功能模块详细设计

#### 4.1 仪表盘 (Dashboard)

**功能需求**:
- 服务器运行状态一览（运行/停止/错误）
- 在线玩家数量和列表预览
- 系统资源使用情况（CPU/内存/磁盘）
- 快捷操作按钮（启动/停止/重启服务器）
- 最近操作日志

**组件设计**:

```vue
<!-- web/src/views/terraria/dashboard/index.vue -->
<template>
  <div class="terraria-dashboard">
    <!-- 状态概览卡片区 -->
    <NGrid :x-gap="16" :y-gap="16" :cols="4">
      <NGi>
        <ServerStatusCard :status="serverStatus" />
      </NGi>
      <NGi>
        <OnlinePlayersCard :count="onlinePlayers.length" />
      </NGi>
      <NGi>
        <SystemResourceCard :cpu="systemStats.cpu" :memory="systemStats.memory" />
      </NGi>
      <NGi>
        <UptimeCard :uptime="serverUptime" />
      </NGi>
    </NGrid>

    <!-- 主要内容区 -->
    <NGrid :x-gap="16" :y-gap="16" :cols="3" style="margin-top: 16px">
      <!-- 左侧：服务器控制 + 在线玩家 -->
      <NGi :span="2">
        <NSpace vertical :size="16">
          <NCard title="服务器控制" :bordered="false">
            <QuickActionsPanel 
              :status="serverStatus"
              @start="handleStartServer"
              @stop="handleStopServer"
              @restart="handleRestartServer"
            />
          </NCard>
          
          <NCard title="在线玩家" :bordered="false">
            <OnlinePlayersList 
              :players="onlinePlayers"
              :max-display="5"
            />
          </NCard>
        </NSpace>
      </NGi>

      <!-- 右侧：系统监控图表 -->
      <NGi>
        <NCard title="系统监控" :bordered="false">
          <SystemMonitorCharts 
            :cpu-data="cpuHistory"
            :memory-data="memoryHistory"
          />
        </NCard>
      </NGi>
    </NGrid>

    <!-- 最近操作日志 -->
    <NCard title="最近操作" :bordered="false" style="margin-top: 16px">
      <RecentOperationsTable :logs="recentLogs" />
    </NCard>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useWebSocket } from '@/composables/useWebSocket'
import { terrariaApi } from '@/api/terraria'

// WebSocket 实时数据
const { data: wsData, connect, disconnect } = useWebSocket('/api/ws/server-status')

// 服务器状态
const serverStatus = ref<'running' | 'stopped' | 'error'>('stopped')
const onlinePlayers = ref<Player[]>([])
const systemStats = ref({ cpu: 0, memory: 0, disk: 0 })
const serverUptime = ref(0)

// 历史数据（用于图表）
const cpuHistory = ref<number[]>([])
const memoryHistory = ref<number[]>([])
const recentLogs = ref<OperationLog[]>([])

// 服务器操作
const handleStartServer = async () => {
  try {
    await terrariaApi.startServer()
    window.$message.success('服务器启动命令已发送')
  } catch (error) {
    window.$message.error('服务器启动失败')
  }
}

const handleStopServer = async () => {
  window.$dialog.warning({
    title: '确认停止',
    content: '确定要停止泰拉瑞亚服务器吗？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await terrariaApi.stopServer()
        window.$message.success('服务器已停止')
      } catch (error) {
        window.$message.error('服务器停止失败')
      }
    }
  })
}

const handleRestartServer = async () => {
  try {
    await terrariaApi.restartServer()
    window.$message.success('服务器重启命令已发送')
  } catch (error) {
    window.$message.error('服务器重启失败')
  }
}

onMounted(() => {
  // 连接 WebSocket
  connect()
  
  // 加载初始数据
  loadDashboardData()
})

onUnmounted(() => {
  disconnect()
})

const loadDashboardData = async () => {
  // 加载服务器状态和统计数据
  const [status, players, stats, logs] = await Promise.all([
    terrariaApi.getServerStatus(),
    terrariaApi.getOnlinePlayers(),
    terrariaApi.getSystemStats(),
    terrariaApi.getRecentLogs()
  ])
  
  serverStatus.value = status.status
  onlinePlayers.value = players
  systemStats.value = stats
  recentLogs.value = logs
}
</script>
```

#### 4.2 服务器管理 (Server Management)

**功能需求**:
- 服务器启动/停止/重启控制
- 实时日志查看（支持自动滚动和搜索）
- 服务器配置可视化编辑
- 端口、最大玩家