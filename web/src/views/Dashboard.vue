<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>仪表板</h1>
      <p>泰拉瑞亚服务器管理概览</p>
    </div>

    <!-- Server Status Cards -->
    <div class="status-cards">
      <n-card class="status-card" hoverable>
        <div class="card-content">
          <div class="card-icon server-icon">
            <i-carbon-server />
          </div>
          <div class="card-info">
            <h3>服务器状态</h3>
            <p class="status-text" :class="serverStatusClass">
              {{ serverStatusText }}
            </p>
            <small v-if="serverStore.status?.uptime">
              运行时间: {{ formatUptime(serverStore.status.uptime) }}
            </small>
          </div>
        </div>
      </n-card>

      <n-card class="status-card" hoverable>
        <div class="card-content">
          <div class="card-icon players-icon">
            <i-carbon-user-multiple />
          </div>
          <div class="card-info">
            <h3>在线玩家</h3>
            <p class="count-text">
              {{ serverStore.status?.player_count || 0 }} / {{ serverStore.status?.max_players || 0 }}
            </p>
            <small>当前在线人数</small>
          </div>
        </div>
      </n-card>

      <n-card class="status-card" hoverable>
        <div class="card-content">
          <div class="card-icon world-icon">
            <i-carbon-earth />
          </div>
          <div class="card-info">
            <h3>当前世界</h3>
            <p class="world-text">
              {{ serverStore.status?.world_name || '未设置' }}
            </p>
            <small>活跃世界</small>
          </div>
        </div>
      </n-card>

      <n-card class="status-card" hoverable>
        <div class="card-content">
          <div class="card-icon port-icon">
            <i-carbon-network-3 />
          </div>
          <div class="card-info">
            <h3>服务器端口</h3>
            <p class="port-text">
              {{ serverStore.status?.port || 7777 }}
            </p>
            <small>监听端口</small>
          </div>
        </div>
      </n-card>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <n-card title="快速操作" hoverable>
        <n-space>
          <n-button
            type="primary"
            size="large"
            :loading="serverStore.loading"
            :disabled="serverStore.status?.status === 'running'"
            @click="handleStartServer"
          >
            <template #icon>
              <i-carbon-play />
            </template>
            启动服务器
          </n-button>

          <n-button
            type="warning"
            size="large"
            :loading="serverStore.loading"
            :disabled="serverStore.status?.status !== 'running'"
            @click="handleStopServer"
          >
            <template #icon>
              <i-carbon-stop />
            </template>
            停止服务器
          </n-button>

          <n-button
            type="info"
            size="large"
            :loading="serverStore.loading"
            @click="handleRestartServer"
          >
            <template #icon>
              <i-carbon-restart />
            </template>
            重启服务器
          </n-button>

          <n-button
            size="large"
            @click="$router.push('/server')"
          >
            <template #icon>
              <i-carbon-settings />
            </template>
            服务器设置
          </n-button>
        </n-space>
      </n-card>
    </div>

    <!-- System Info -->
    <div class="system-info">
      <n-card title="系统信息" hoverable>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">面板版本:</span>
            <span class="info-value">{{ appVersion }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">泰拉瑞亚版本:</span>
            <span class="info-value">{{ serverStore.status?.version || '未知' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">WebSocket连接:</span>
            <span class="info-value" :class="wsStatusClass">{{ wsStatusText }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">最后更新:</span>
            <span class="info-value">{{ formatTime(lastUpdate) }}</span>
          </div>
        </div>
      </n-card>
    </div>

    <!-- Recent Logs -->
    <div class="recent-logs">
      <n-card title="最近日志" hoverable>
        <template #header-extra>
          <n-button size="small" @click="$router.push('/server')">
            查看全部
          </n-button>
        </template>
        
        <div class="logs-container">
          <div v-if="recentLogs.length === 0" class="no-logs">
            <i-carbon-document />
            <p>暂无日志</p>
          </div>
          <div v-else class="logs-list">
            <div
              v-for="(log, index) in recentLogs"
              :key="index"
              class="log-item"
            >
              <span class="log-time">{{ formatLogTime(log.time) }}</span>
              <span class="log-content">{{ log.content }}</span>
            </div>
          </div>
        </div>
      </n-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useMessage } from 'naive-ui'
import { useServerStore } from '@/stores/server'
import { useWebSocketStore } from '@/stores/websocket'

const message = useMessage()
const serverStore = useServerStore()
const wsStore = useWebSocketStore()

const lastUpdate = ref(new Date())
const recentLogs = ref<Array<{ time: Date; content: string }>>([])

// App version
const appVersion = __APP_VERSION__

// Server status computed properties
const serverStatusText = computed(() => {
  switch (serverStore.status?.status) {
    case 'running':
      return '运行中'
    case 'starting':
      return '启动中'
    case 'stopping':
      return '停止中'
    case 'stopped':
    default:
      return '已停止'
  }
})

const serverStatusClass = computed(() => {
  switch (serverStore.status?.status) {
    case 'running':
      return 'status-running'
    case 'starting':
    case 'stopping':
      return 'status-warning'
    case 'stopped':
    default:
      return 'status-stopped'
  }
})

// WebSocket status
const wsStatusText = computed(() => {
  return wsStore.connected ? '已连接' : '未连接'
})

const wsStatusClass = computed(() => {
  return wsStore.connected ? 'status-connected' : 'status-disconnected'
})

// Server actions
const handleStartServer = async () => {
  try {
    await serverStore.startServer()
    message.success('服务器启动指令已发送')
  } catch (error: any) {
    message.error(error.message || '启动服务器失败')
  }
}

const handleStopServer = async () => {
  try {
    await serverStore.stopServer()
    message.success('服务器停止指令已发送')
  } catch (error: any) {
    message.error(error.message || '停止服务器失败')
  }
}

const handleRestartServer = async () => {
  try {
    await serverStore.restartServer()
    message.success('服务器重启指令已发送')
  } catch (error: any) {
    message.error(error.message || '重启服务器失败')
  }
}

// Utility functions
const formatUptime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  } else if (minutes > 0) {
    return `${minutes}分钟${secs}秒`
  } else {
    return `${secs}秒`
  }
}

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('zh-CN')
}

const formatLogTime = (date: Date): string => {
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// Initialize
onMounted(() => {
  // Fetch initial data
  serverStore.fetchStatus()
  
  // Connect WebSocket
  wsStore.connect()
  
  // Update last update time periodically
  setInterval(() => {
    lastUpdate.value = new Date()
  }, 1000)
  
  // Mock recent logs (replace with actual log fetching)
  recentLogs.value = [
    { time: new Date(), content: '服务器启动完成' },
    { time: new Date(Date.now() - 60000), content: '世界加载完成' },
    { time: new Date(Date.now() - 120000), content: '配置文件已加载' }
  ]
})

onUnmounted(() => {
  wsStore.disconnect()
})
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  margin-bottom: 24px;
}

.dashboard-header h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
}

.dashboard-header p {
  margin: 0;
  color: var(--n-text-color-2);
  font-size: 16px;
}

.status-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.status-card {
  transition: transform 0.2s ease;
}

.status-card:hover {
  transform: translateY(-2px);
}

.card-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.server-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.players-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.world-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.port-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.card-info h3 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--n-text-color-2);
}

.status-text,
.count-text,
.world-text,
.port-text {
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 600;
}

.status-running {
  color: #18a058;
}

.status-warning {
  color: #f0a020;
}

.status-stopped {
  color: #d03050;
}

.card-info small {
  color: var(--n-text-color-3);
  font-size: 12px;
}

.quick-actions,
.system-info,
.recent-logs {
  margin-bottom: 24px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.info-label {
  color: var(--n-text-color-2);
  font-size: 14px;
}

.info-value {
  font-weight: 500;
}

.status-connected {
  color: #18a058;
}

.status-disconnected {
  color: #d03050;
}

.logs-container {
  min-height: 120px;
}

.no-logs {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 120px;
  color: var(--n-text-color-3);
}

.no-logs i {
  font-size: 32px;
  margin-bottom: 8px;
}

.logs-list {
  max-height: 200px;
  overflow-y: auto;
}

.log-item {
  display: flex;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid var(--n-border-color);
}

.log-item:last-child {
  border-bottom: none;
}

.log-time {
  color: var(--n-text-color-3);
  font-size: 12px;
  white-space: nowrap;
  min-width: 60px;
}

.log-content {
  flex: 1;
  font-size: 14px;
}

@media (max-width: 768px) {
  .status-cards {
    grid-template-columns: 1fr;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .card-content {
    gap: 12px;
  }
  
  .card-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }
}
</style>