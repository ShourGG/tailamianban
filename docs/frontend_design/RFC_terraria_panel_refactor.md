# RFC: 泰拉瑞亚面板前端功能整改方案

## Overview

基于现有的 Robot_Admin 前端框架，进行功能整改，移除原有的 demo 功能模块，保留核心框架和样式，实现泰拉瑞亚服务器管理的专属功能。

**核心原则**:
- ✅ 保持原有界面和样式不变
- ✅ 移除/隐藏所有 demo 功能和示例页面
- ✅ 所有数据必须来自真实后端 API
- ✅ 严禁使用任何测试假数据
- ✅ 通过 GitHub + Linux 服务器进行实际测试

## Goals

1. **清理 Demo 模块**: 移除所有示例页面和 API 接口
2. **保留核心框架**: 保持路由、状态管理、布局等基础架构
3. **实现专属功能**: 仅实现泰拉瑞亚服务器管理的5大核心模块
4. **真实数据对接**: 所有功能对接后端真实API，无假数据

## Non-Goals

- 不改动任何 UI 主题和样式
- 不创建任何模拟或测试数据
- 不在本地进行功能测试（必须在 Linux 服务器实测）

## Proposed Solution

### Phase 1: 清理现有 Demo 功能

#### 1.1 移除 Demo 页面
需要移除的页面目录：
```bash
web/src/views/demo/           # 所有 demo 示例页面
web/src/views/dashboard/      # 原有仪表盘（保留目录结构，清空内容）
web/src/views/about/          # 关于页面
web/src/views/iframe/         # iframe 示例
```

#### 1.2 移除 Demo API
需要移除的 API 文件：
```bash
web/src/api/10-table.ts       # 表格示例 API
web/src/api/11-table-expand.ts
web/src/api/12-table-dynamic.ts
web/src/api/permission-manage.ts  # 保留但清理 demo 部分
```

#### 1.3 清理路由配置
需要清理的路由：
```typescript
// web/src/assets/data/dynamicRouter.json
// 移除所有 demo 相关路由，仅保留：
// - 登录
// - 系统管理（用户、角色、菜单）
// - 泰拉瑞亚管理（新增）
```

### Phase 2: 实现泰拉瑞亚核心功能

#### 2.1 文件结构
```
web/src/views/terraria/
├── dashboard/
│   └── index.vue              # 泰拉瑞亚仪表盘
├── server/
│   └── index.vue              # 服务器管理
├── players/
│   └── index.vue              # 玩家管理
├── worlds/
│   └── index.vue              # 世界管理
└── monitor/
    └── index.vue              # 系统监控
```

#### 2.2 API 接口定义
```typescript
// web/src/api/terraria.ts
import { request } from '@/utils/api'

export interface ServerStatus {
  status: 'running' | 'stopped' | 'error'
  uptime: number
  version: string
  port: number
  maxPlayers: number
  currentPlayers: number
}

export interface Player {
  id: string
  name: string
  ip: string
  joinTime: string
  team: number
}

export interface World {
  id: string
  name: string
  size: number
  createdAt: string
  difficulty: string
}

export interface SystemStats {
  cpu: number
  memory: number
  disk: number
  network: {
    in: number
    out: number
  }
}

// 服务器控制
export const getServerStatus = () => 
  request<ServerStatus>({ url: '/api/server/status', method: 'GET' })

export const startServer = () => 
  request({ url: '/api/server/start', method: 'POST' })

export const stopServer = () => 
  request({ url: '/api/server/stop', method: 'POST' })

export const restartServer = () => 
  request({ url: '/api/server/restart', method: 'POST' })

// 玩家管理
export const getOnlinePlayers = () => 
  request<Player[]>({ url: '/api/players/online', method: 'GET' })

export const kickPlayer = (playerId: string) => 
  request({ url: `/api/players/${playerId}/kick`, method: 'POST' })

export const banPlayer = (playerId: string, reason: string) => 
  request({ url: `/api/players/${playerId}/ban`, method: 'POST', data: { reason } })

// 世界管理
export const getWorldList = () => 
  request<World[]>({ url: '/api/worlds', method: 'GET' })

export const uploadWorld = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request({ url: '/api/worlds/upload', method: 'POST', data: formData })
}

export const deleteWorld = (worldId: string) => 
  request({ url: `/api/worlds/${worldId}`, method: 'DELETE' })

export const backupWorld = (worldId: string) => 
  request({ url: `/api/worlds/${worldId}/backup`, method: 'POST' })

// 系统监控
export const getSystemStats = () => 
  request<SystemStats>({ url: '/api/monitor/stats', method: 'GET' })

export const getServerLogs = (lines: number = 100) => 
  request<string[]>({ url: `/api/server/logs?lines=${lines}`, method: 'GET' })
```

#### 2.3 路由配置
```typescript
// web/src/router/modules/terraria.ts
export const terrariaRoutes = {
  name: 'Terraria',
  path: '/terraria',
  component: 'Layout',
  redirect: '/terraria/dashboard',
  meta: {
    title: '泰拉瑞亚管理',
    icon: 'mdi:gamepad-variant',
    sort: 1
  },
  children: [
    {
      name: 'TerrariaDashboard',
      path: 'dashboard',
      component: '/terraria/dashboard/index',
      meta: {
        title: '仪表盘',
        icon: 'mdi:view-dashboard'
      }
    },
    {
      name: 'TerrariaServer',
      path: 'server',
      component: '/terraria/server/index',
      meta: {
        title: '服务器管理',
        icon: 'mdi:server'
      }
    },
    {
      name: 'TerrariaPlayers',
      path: 'players',
      component: '/terraria/players/index',
      meta: {
        title: '玩家管理',
        icon: 'mdi:account-group'
      }
    },
    {
      name: 'TerrariaWorlds',
      path: 'worlds',
      component: '/terraria/worlds/index',
      meta: {
        title: '世界管理',
        icon: 'mdi:earth'
      }
    },
    {
      name: 'TerrariaMonitor',
      path: 'monitor',
      component: '/terraria/monitor/index',
      meta: {
        title: '系统监控',
        icon: 'mdi:monitor-dashboard'
      }
    }
  ]
}
```

### Phase 3: 实现核心页面（无假数据）

#### 3.1 仪表盘页面骨架
```vue
<!-- web/src/views/terraria/dashboard/index.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getServerStatus, getOnlinePlayers, getSystemStats } from '@/api/terraria'

// 真实数据状态
const serverStatus = ref<any>(null)
const onlinePlayers = ref<any[]>([])
const systemStats = ref<any>(null)
const loading = ref(false)

// 加载真实数据
const loadData = async () => {
  loading.value = true
  try {
    const [status, players, stats] = await Promise.all([
      getServerStatus(),
      getOnlinePlayers(),
      getSystemStats()
    ])
    serverStatus.value = status
    onlinePlayers.value = players
    systemStats.value = stats
  } catch (error) {
    window.$message.error('加载数据失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="terraria-dashboard">
    <NSpin :show="loading">
      <NGrid :x-gap="16" :y-gap="16" :cols="4">
        <!-- 服务器状态 -->
        <NGi>
          <NCard title="服务器状态" :bordered="false">
            <div v-if="serverStatus">
              <p>状态: {{ serverStatus.status }}</p>
              <p>运行时间: {{ serverStatus.uptime }}s</p>
              <p>端口: {{ serverStatus.port }}</p>
            </div>
            <NEmpty v-else description="暂无数据" />
          </NCard>
        </NGi>

        <!-- 在线玩家 -->
        <NGi>
          <NCard title="在线玩家" :bordered="false">
            <div v-if="serverStatus">
              <p>{{ serverStatus.currentPlayers }} / {{ serverStatus.maxPlayers }}</p>
            </div>
            <NEmpty v-else description="暂无数据" />
          </NCard>
        </NGi>

        <!-- 系统资源 -->
        <NGi>
          <NCard title="CPU使用率" :bordered="false">
            <div v-if="systemStats">
              <p>{{ systemStats.cpu.toFixed(2) }}%</p>
            </div>
            <NEmpty v-else description="暂无数据" />
          </NCard>
        </NGi>

        <NGi>
          <NCard title="内存使用率" :bordered="false">
            <div v-if="systemStats">
              <p>{{ systemStats.memory.toFixed(2) }}%</p>
            </div>
            <NEmpty v-else description="暂无数据" />
          </NCard>
        </NGi>
      </NGrid>

      <!-- 在线玩家列表 -->
      <NCard title="在线玩家列表" :bordered="false" style="margin-top: 16px">
        <NDataTable
          v-if="onlinePlayers.length > 0"
          :columns="playerColumns"
          :data="onlinePlayers"
          :pagination="false"
        />
        <NEmpty v-else description="当前无在线玩家" />
      </NCard>
    </NSpin>
  </div>
</template>
```

### Phase 4: 部署和测试流程

#### 4.1 开发流程
```bash
# 1. 修改代码
# 2. 更新版本号
cd web
npm version patch

# 3. 提交到 Git
cd ..
git add .
git commit -m "feat: implement terraria dashboard"

# 4. 打标签并推送
git tag v1.1.9.12
git push origin main
git push origin v1.1.9.12

# 5. GitHub Actions 自动构建
# 6. 在 Linux 服务器下载并测试
```

#### 4.2 服务器测试流程
```bash
# 在 Linux 服务器上
wget https://github.com/ShourGG/tailamianban/releases/latest/download/terraria-panel-linux.tar.gz
tar -xzf terraria-panel-linux.tar.gz
chmod +x terraria-panel
./terraria-panel

# 访问面板测试真实功能
curl http://localhost:8080/api/server/status
```

## Implementation Plan

### 第一批改动（清理 Demo）
1. 删除 `web/src/views/demo/` 目录
2. 删除 demo API 文件
3. 更新路由配置，移除 demo 路由
4. 测试登录和基础框架

### 第二批改动（实现仪表盘）
1. 创建 `/terraria/dashboard` 页面
2. 对接后端真实API
3. 实现数据展示（无假数据）
4. 推送到 GitHub，服务器实测

### 第三批改动（服务器管理）
1. 创建 `/terraria/server` 页面
2. 实现启动/停止/重启功能
3. 实现实时日志查看
4. 推送测试

### 第四批改动（玩家管理）
1. 创建 `/terraria/players` 页面
2. 实现玩家列表和操作
3. 推送测试

### 第五批改动（世界管理）
1. 创建 `/terraria/worlds` 页面
2. 实现文件上传下载
3. 推送测试

### 第六批改动（系统监控）
1. 创建 `/terraria/monitor` 页面
2. 实现监控图表
3. 推送测试

## Acceptance Criteria

- ✅ 所有 demo 功能已移除
- ✅ 原有样式和主题保持不变
- ✅ 所有数据来自真实后端 API
- ✅ 无任何假数据或模拟数据
- ✅ 在 Linux 服务器实际测试通过
- ✅ 所有功能正常运行

## Security & Observability

- 所有 API 调用包含错误处理
- 用户操作记录到后端日志
- 敏感操作需要二次确认
- WebSocket 连接失败自动重连

## Alternatives Considered

N/A - 方案已明确，不需要其他替代方案

## References

- 项目文档: `/泰拉瑞亚面板项目规划文档.md`
- 开发规范