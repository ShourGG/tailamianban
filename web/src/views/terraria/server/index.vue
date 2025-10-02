<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { NCard, NGrid, NGi, NButton, NSpace, NTag, NSpin, NAlert, NInput, NInputNumber, NForm, NFormItem, NSwitch, NModal, NScrollbar } from 'naive-ui'
import { getServerStatus, startServer, stopServer, restartServer, getServerConfig, updateServerConfig, getServerLogs, type ServerStatus, type ServerConfig, type ServerLog } from '@/api/terraria'

// State
const loading = ref(false)
const serverStatus = ref<ServerStatus | null>(null)
const serverConfig = ref<ServerConfig | null>(null)
const serverLogs = ref<ServerLog[]>([])
const showConfigModal = ref(false)
const configForm = ref<ServerConfig | null>(null)
const refreshInterval = ref<number | null>(null)
const autoScroll = ref(true)

// Load server status
const loadServerStatus = async () => {
  try {
    const res = await getServerStatus()
    serverStatus.value = res
  } catch (error) {
    console.error('Failed to load server status:', error)
  }
}

// Load server config
const loadServerConfig = async () => {
  try {
    const res = await getServerConfig()
    serverConfig.value = res
    configForm.value = { ...res }
  } catch (error) {
    console.error('Failed to load server config:', error)
    window.$message?.error('加载配置失败')
  }
}

// Load server logs
const loadServerLogs = async () => {
  try {
    const res = await getServerLogs(100)
    serverLogs.value = res || []
    if (autoScroll.value) {
      scrollToBottom()
    }
  } catch (error) {
    console.error('Failed to load server logs:', error)
  }
}

// Server control actions
const handleStartServer = async () => {
  loading.value = true
  try {
    await startServer()
    window.$message?.success('服务器启动命令已发送')
    setTimeout(loadServerStatus, 2000)
  } catch (error) {
    console.error('Failed to start server:', error)
    window.$message?.error('启动服务器失败')
  } finally {
    loading.value = false
  }
}

const handleStopServer = async () => {
  loading.value = true
  try {
    await stopServer()
    window.$message?.success('服务器停止命令已发送')
    setTimeout(loadServerStatus, 2000)
  } catch (error) {
    console.error('Failed to stop server:', error)
    window.$message?.error('停止服务器失败')
  } finally {
    loading.value = false
  }
}

const handleRestartServer = async () => {
  loading.value = true
  try {
    await restartServer()
    window.$message?.success('服务器重启命令已发送')
    setTimeout(loadServerStatus, 2000)
  } catch (error) {
    console.error('Failed to restart server:', error)
    window.$message?.error('重启服务器失败')
  } finally {
    loading.value = false
  }
}

// Update server config
const handleUpdateConfig = async () => {
  if (!configForm.value) return
  
  loading.value = true
  try {
    await updateServerConfig(configForm.value)
    window.$message?.success('配置已保存，重启服务器后生效')
    showConfigModal.value = false
    loadServerConfig()
  } catch (error) {
    console.error('Failed to update config:', error)
    window.$message?.error('保存配置失败')
  } finally {
    loading.value = false
  }
}

// Scroll to bottom of logs
const scrollToBottom = () => {
  setTimeout(() => {
    const logContainer = document.querySelector('.log-container')
    if (logContainer) {
      logContainer.scrollTop = logContainer.scrollHeight
    }
  }, 100)
}

// Get status color
const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    running: 'success',
    stopped: 'error',
    starting: 'warning',
    stopping: 'warning',
    error: 'error'
  }
  return colors[status] || 'default'
}

// Get status text
const getStatusText = (status: string): string => {
  const texts: Record<string, string> = {
    running: '运行中',
    stopped: '已停止',
    starting: '启动中',
    stopping: '停止中',
    error: '错误'
  }
  return texts[status] || '未知'
}

// Get log level color
const getLogLevelColor = (level: string): string => {
  const colors: Record<string, string> = {
    ERROR: '#d03050',
    WARN: '#f0a020',
    INFO: '#18a058',
    DEBUG: '#666666'
  }
  return colors[level] || '#666666'
}

// Lifecycle
onMounted(() => {
  loadServerStatus()
  loadServerConfig()
  loadServerLogs()
  
  // Auto refresh
  refreshInterval.value = window.setInterval(() => {
    loadServerStatus()
    loadServerLogs()
  }, 3000)
})

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }
})
</script>

<template>
  <div class="terraria-server">
    <NGrid :x-gap="16" :y-gap="16" :cols="1">
      <!-- Server Control Card -->
      <NGi>
        <NCard title="服务器控制" :bordered="false">
          <NSpin :show="loading">
            <NSpace vertical size="large">
              <!-- Status Display -->
              <div v-if="serverStatus" class="status-section">
                <NSpace align="center">
                  <span style="font-weight: 600;">当前状态:</span>
                  <NTag :type="getStatusColor(serverStatus.status)" size="medium">
                    {{ getStatusText(serverStatus.status) }}
                  </NTag>
                  <span style="color: #666;">端口: {{ serverStatus.port }}</span>
                  <span style="color: #666;">版本: {{ serverStatus.version }}</span>
                  <span style="color: #666;">在线: {{ serverStatus.currentPlayers }}/{{ serverStatus.maxPlayers }}</span>
                </NSpace>
              </div>

              <!-- Control Buttons -->
              <NSpace>
                <NButton
                  type="success"
                  :disabled="serverStatus?.status === 'running' || loading"
                  @click="handleStartServer"
                >
                  启动服务器
                </NButton>
                <NButton
                  type="error"
                  :disabled="serverStatus?.status === 'stopped' || loading"
                  @click="handleStopServer"
                >
                  停止服务器
                </NButton>
                <NButton
                  type="warning"
                  :disabled="serverStatus?.status !== 'running' || loading"
                  @click="handleRestartServer"
                >
                  重启服务器
                </NButton>
                <NButton
                  type="primary"
                  @click="showConfigModal = true"
                >
                  编辑配置
                </NButton>
              </NSpace>

              <!-- Status Alert -->
              <NAlert
                v-if="serverStatus?.status === 'error'"
                type="error"
                title="服务器错误"
              >
                服务器遇到错误，请查看日志了解详情
              </NAlert>
            </NSpace>
          </NSpin>
        </NCard>
      </NGi>

      <!-- Server Logs Card -->
      <NGi>
        <NCard title="服务器日志" :bordered="false">
          <template #header-extra>
            <NSpace>
              <NSwitch v-model:value="autoScroll" size="small">
                <template #checked>自动滚动</template>
                <template #unchecked>手动滚动</template>
              </NSwitch>
              <NButton size="small" @click="loadServerLogs">刷新</NButton>
            </NSpace>
          </template>
          <NScrollbar style="max-height: 500px" trigger="none">
            <div class="log-container">
              <div
                v-for="(log, index) in serverLogs"
                :key="index"
                class="log-line"
              >
                <span class="log-time">{{ log.timestamp }}</span>
                <span
                  class="log-level"
                  :style="{ color: getLogLevelColor(log.level) }"
                >
                  [{{ log.level }}]
                </span>
                <span class="log-message">{{ log.message }}</span>
              </div>
              <div v-if="serverLogs.length === 0" class="log-empty">
                暂无日志数据
              </div>
            </div>
          </NScrollbar>
        </NCard>
      </NGi>
    </NGrid>

    <!-- Config Modal -->
    <NModal
      v-model:show="showConfigModal"
      preset="card"
      title="服务器配置"
      style="width: 600px"
      :bordered="false"
      :segmented="{ content: true }"
    >
      <NForm v-if="configForm" :model="configForm" label-placement="left" label-width="120">
        <NFormItem label="服务器名称">
          <NInput v-model:value="configForm.serverName" placeholder="请输入服务器名称" />
        </NFormItem>
        <NFormItem label="服务器端口">
          <NInputNumber v-model:value="configForm.port" :min="1024" :max="65535" style="width: 100%" />
        </NFormItem>
        <NFormItem label="最大玩家数">
          <NInputNumber v-model:value="configForm.maxPlayers" :min="1" :max="255" style="width: 100%" />
        </NFormItem>
        <NFormItem label="服务器密码">
          <NInput v-model:value="configForm.password" type="password" placeholder="留空表示无密码" />
        </NFormItem>
        <NFormItem label="世界名称">
          <NInput v-model:value="configForm.worldName" placeholder="请输入世界名称" />
        </NFormItem>
        <NFormItem label="自动保存">
          <NSwitch v-model:value="configForm.autoSave" />
        </NFormItem>
        <NFormItem label="PvP模式">
          <NSwitch v-model:value="configForm.pvp" />
        </NFormItem>
        <NFormItem label="旅程模式">
          <NSwitch v-model:value="configForm.journey" />
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace justify="end">
          <NButton @click="showConfigModal = false">取消</NButton>
          <NButton type="primary" :loading="loading" @click="handleUpdateConfig">
            保存配置
          </NButton>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>

<style scoped lang="scss">
.terraria-server {
  padding: 16px;

  .status-section {
    padding: 12px;
    background-color: rgba(0, 0, 0, 0.02);
    border-radius: 4px;
  }

  .log-container {
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 13px;
    line-height: 1.6;
    background-color: #1e1e1e;
    color: #d4d4d4;
    padding: 12px;
    border-radius: 4px;

    .log-line {
      margin-bottom: 4px;
      white-space: pre-wrap;
      word-break: break-all;
    }

    .log-time {
      color: #858585;
      margin-right: 8px;
    }

    .log-level {
      font-weight: 600;
      margin-right: 8px;
    }

    .log-message {
      color: #d4d4d4;
    }

    .log-empty {
      text-align: center;
      color: #858585;
      padding: 20px;
    }
  }
}
</style>