<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { NGrid, NGi, NCard, NStatistic, NSpin, NDataTable, NEmpty, NProgress, NSpace, NTag } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { getSystemStats, getServerLogs, type SystemStats, type ServerLog } from '@/api/terraria'

// State
const loading = ref(true)
const systemStats = ref<SystemStats | null>(null)
const serverLogs = ref<ServerLog[]>([])
const refreshInterval = ref<number | null>(null)

// Load system stats
const loadSystemStats = async () => {
  try {
    const res = await getSystemStats()
    systemStats.value = res
  } catch (error) {
    console.error('Failed to load system stats:', error)
  }
}

// Load server logs
const loadServerLogs = async () => {
  try {
    const res = await getServerLogs(50)
    serverLogs.value = res || []
  } catch (error) {
    console.error('Failed to load server logs:', error)
  }
}

// Load all data
const loadData = async () => {
  loading.value = true
  try {
    await Promise.all([
      loadSystemStats(),
      loadServerLogs()
    ])
  } catch (error) {
    console.error('Failed to load monitor data:', error)
    window.$message?.error('加载监控数据失败')
  } finally {
    loading.value = false
  }
}

// Get status color based on value
const getStatusColor = (value: number, type: 'cpu' | 'memory' | 'disk'): string => {
  if (type === 'disk') {
    if (value > 90) return '#d03050'
    if (value > 80) return '#f0a020'
    return '#18a058'
  }
  
  if (value > 80) return '#d03050'
  if (value > 60) return '#f0a020'
  return '#18a058'
}

// Get log level color
const getLogLevelColor = (level: string): string => {
  const colors: Record<string, string> = {
    ERROR: 'error',
    WARN: 'warning',
    INFO: 'success',
    DEBUG: 'default'
  }
  return colors[level] || 'default'
}

// Format timestamp
const formatTime = (timestamp: string): string => {
  try {
    const date = new Date(timestamp)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch {
    return timestamp
  }
}

// Log table columns
const logColumns: DataTableColumns<ServerLog> = [
  {
    title: '时间',
    key: 'timestamp',
    width: 180,
    render: (row) => formatTime(row.timestamp)
  },
  {
    title: '级别',
    key: 'level',
    width: 100,
    render: (row) => {
      return h(
        NTag,
        { type: getLogLevelColor(row.level) as any, size: 'small' },
        { default: () => row.level }
      )
    }
  },
  {
    title: '消息',
    key: 'message',
    ellipsis: {
      tooltip: true
    }
  }
]

// Lifecycle
onMounted(() => {
  loadData()
  // Auto refresh every 3 seconds
  refreshInterval.value = window.setInterval(loadData, 3000)
})

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }
})
</script>

<template>
  <div class="terraria-monitor">
    <NSpin :show="loading">
      <!-- System Stats Cards -->
      <NGrid :x-gap="16" :y-gap="16" :cols="3" responsive="screen">
        <!-- CPU Usage -->
        <NGi>
          <NCard title="CPU使用率" :bordered="false" size="small">
            <template v-if="systemStats">
              <NSpace vertical>
                <NStatistic
                  :value="systemStats.cpu.toFixed(2)"
                  :value-style="{ color: getStatusColor(systemStats.cpu, 'cpu') }"
                >
                  <template #suffix>%</template>
                </NStatistic>
                <NProgress
                  type="line"
                  :percentage="systemStats.cpu"
                  :color="getStatusColor(systemStats.cpu, 'cpu')"
                  :show-indicator="false"
                />
                <div style="font-size: 12px; color: #666;">
                  更新时间: {{ new Date(systemStats.timestamp).toLocaleTimeString() }}
                </div>
              </NSpace>
            </template>
            <NEmpty v-else description="无数据" size="small" />
          </NCard>
        </NGi>

        <!-- Memory Usage -->
        <NGi>
          <NCard title="内存使用率" :bordered="false" size="small">
            <template v-if="systemStats">
              <NSpace vertical>
                <NStatistic
                  :value="systemStats.memory.toFixed(2)"
                  :value-style="{ color: getStatusColor(systemStats.memory, 'memory') }"
                >
                  <template #suffix>%</template>
                </NStatistic>
                <NProgress
                  type="line"
                  :percentage="systemStats.memory"
                  :color="getStatusColor(systemStats.memory, 'memory')"
                  :show-indicator="false"
                />
                <div style="font-size: 12px; color: #666;">
                  {{ (systemStats.memoryUsed / 1024 / 1024 / 1024).toFixed(2) }} GB / 
                  {{ (systemStats.memoryTotal / 1024 / 1024 / 1024).toFixed(2) }} GB
                </div>
              </NSpace>
            </template>
            <NEmpty v-else description="无数据" size="small" />
          </NCard>
        </NGi>

        <!-- Disk Usage -->
        <NGi>
          <NCard title="磁盘使用率" :bordered="false" size="small">
            <template v-if="systemStats">
              <NSpace vertical>
                <NStatistic
                  :value="systemStats.disk.toFixed(2)"
                  :value-style="{ color: getStatusColor(systemStats.disk, 'disk') }"
                >
                  <template #suffix>%</template>
                </NStatistic>
                <NProgress
                  type="line"
                  :percentage="systemStats.disk"
                  :color="getStatusColor(systemStats.disk, 'disk')"
                  :show-indicator="false"
                />
                <div style="font-size: 12px; color: #666;">
                  {{ (systemStats.diskUsed / 1024 / 1024 / 1024).toFixed(2) }} GB / 
                  {{ (systemStats.diskTotal / 1024 / 1024 / 1024).toFixed(2) }} GB
                </div>
              </NSpace>
            </template>
            <NEmpty v-else description="无数据" size="small" />
          </NCard>
        </NGi>
      </NGrid>

      <!-- Additional Stats -->
      <NGrid :x-gap="16" :y-gap="16" :cols="4" responsive="screen" style="margin-top: 16px">
        <NGi>
          <NCard title="网络IO" :bordered="false" size="small">
            <template v-if="systemStats">
              <div style="font-size: 13px;">
                <div style="margin-bottom: 8px;">
                  <span style="color: #666;">接收:</span>
                  <span style="font-weight: 600; margin-left: 8px;">
                    {{ (systemStats.networkIn / 1024 / 1024).toFixed(2) }} MB
                  </span>
                </div>
                <div>
                  <span style="color: #666;">发送:</span>
                  <span style="font-weight: 600; margin-left: 8px;">
                    {{ (systemStats.networkOut / 1024 / 1024).toFixed(2) }} MB
                  </span>
                </div>
              </div>
            </template>
            <NEmpty v-else description="无数据" size="small" />
          </NCard>
        </NGi>

        <NGi>
          <NCard title="进程数" :bordered="false" size="small">
            <template v-if="systemStats">
              <NStatistic :value="systemStats.processes || 0" />
            </template>
            <NEmpty v-else description="无数据" size="small" />
          </NCard>
        </NGi>

        <NGi>
          <NCard title="系统负载" :bordered="false" size="small">
            <template v-if="systemStats">
              <div style="font-size: 13px;">
                <div>1分钟: {{ systemStats.load1?.toFixed(2) || 'N/A' }}</div>
                <div>5分钟: {{ systemStats.load5?.toFixed(2) || 'N/A' }}</div>
                <div>15分钟: {{ systemStats.load15?.toFixed(2) || 'N/A' }}</div>
              </div>
            </template>
            <NEmpty v-else description="无数据" size="small" />
          </NCard>
        </NGi>

        <NGi>
          <NCard title="运行时间" :bordered="false" size="small">
            <template v-if="systemStats">
              <NStatistic :value="Math.floor(systemStats.uptime / 3600)">
                <template #suffix>小时</template>
              </NStatistic>
            </template>
            <NEmpty v-else description="无数据" size="small" />
          </NCard>
        </NGi>
      </NGrid>

      <!-- Recent Logs -->
      <NCard title="最近日志" :bordered="false" style="margin-top: 16px">
        <NDataTable
          v-if="serverLogs.length > 0"
          :columns="logColumns"
          :data="serverLogs"
          :pagination="{ pageSize: 10 }"
          :bordered="false"
          size="small"
          max-height="400"
        />
        <NEmpty v-else description="暂无日志" />
      </NCard>
    </NSpin>
  </div>
</template>

<style scoped lang="scss">
.terraria-monitor {
  padding: 16px;

  :deep(.n-statistic) {
    .n-statistic-value {
      font-size: 32px;
      font-weight: 600;
    }
  }
}
</style>