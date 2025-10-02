<script setup lang="ts">
import { ref, onMounted, onUnmounted, h } from 'vue'
import { NGrid, NGi, NCard, NStatistic, NSpin, NDataTable, NButton, NSpace, NTag, NEmpty } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { getServerStatus, getOnlinePlayers, getSystemStats, type ServerStatus, type Player, type SystemStats } from '@/api/terraria'

// State
const loading = ref(true)
const serverStatus = ref<ServerStatus | null>(null)
const onlinePlayers = ref<Player[]>([])
const systemStats = ref<SystemStats | null>(null)
const refreshInterval = ref<number | null>(null)

// Table columns
const playerColumns: DataTableColumns<Player> = [
  {
    title: '玩家ID',
    key: 'id',
    width: 100
  },
  {
    title: '玩家名称',
    key: 'name',
    width: 150
  },
  {
    title: 'IP地址',
    key: 'ip',
    width: 150
  },
  {
    title: '加入时间',
    key: 'joinTime',
    width: 180
  },
  {
    title: '队伍',
    key: 'team',
    width: 80,
    render: (row) => {
      const teamColors: Record<number, string> = {
        0: 'default',
        1: 'error',
        2: 'success',
        3: 'warning',
        4: 'info'
      }
      const teamNames: Record<number, string> = {
        0: '无',
        1: '红队',
        2: '绿队',
        3: '蓝队',
        4: '黄队'
      }
      return h(NTag, { type: teamColors[row.team] || 'default' }, { default: () => teamNames[row.team] || '未知' })
    }
  },
  {
    title: '生命值',
    key: 'health',
    width: 100
  },
  {
    title: '魔力值',
    key: 'mana',
    width: 100
  }
]

// Load data from real API
const loadData = async () => {
  loading.value = true
  try {
    const [statusRes, playersRes, statsRes] = await Promise.all([
      getServerStatus().catch(() => null),
      getOnlinePlayers().catch(() => []),
      getSystemStats().catch(() => null)
    ])
    
    serverStatus.value = statusRes
    onlinePlayers.value = playersRes || []
    systemStats.value = statsRes
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
    window.$message?.error('加载数据失败，请检查服务器连接')
  } finally {
    loading.value = false
  }
}

// Format uptime
const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (days > 0) {
    return `${days}天 ${hours}小时`
  } else if (hours > 0) {
    return `${hours}小时 ${minutes}分钟`
  } else if (minutes > 0) {
    return `${minutes}分钟 ${secs}秒`
  } else {
    return `${secs}秒`
  }
}

// Get status color
const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    running: '#18a058',
    stopped: '#d03050',
    starting: '#f0a020',
    stopping: '#f0a020',
    error: '#d03050'
  }
  return colors[status] || '#666666'
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

// Lifecycle
onMounted(() => {
  loadData()
  // Auto refresh every 5 seconds
  refreshInterval.value = window.setInterval(loadData, 5000)
})

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }
})
</script>

<template>
  <div class="terraria-dashboard">
    <NSpin :show="loading">
      <!-- Status Cards -->
      <NGrid :x-gap="16" :y-gap="16" :cols="4" responsive="screen">
        <!-- Server Status -->
        <NGi>
          <NCard title="服务器状态" :bordered="false" size="small">
            <template v-if="serverStatus">
              <NStatistic 
                :value="getStatusText(serverStatus.status)"
                :value-style="{ color: getStatusColor(serverStatus.status) }"
              />
              <div style="margin-top: 12px; font-size: 13px; color: #666;">
                <div>运行时间: {{ formatUptime(serverStatus.uptime) }}</div>
                <div>端口: {{ serverStatus.port }}</div>
                <div>版本: {{ serverStatus.version }}</div>
              </div>
            </template>
            <NEmpty v-else description="无法获取服务器状态" size="small" />
          </NCard>
        </NGi>

        <!-- Online Players -->
        <NGi>
          <NCard title="在线玩家" :bordered="false" size="small">
            <template v-if="serverStatus">
              <NStatistic :value="serverStatus.currentPlayers">
                <template #suffix>
                  / {{ serverStatus.maxPlayers }}
                </template>
              </NStatistic>
              <div style="margin-top: 12px; font-size: 13px; color: #666;">
                <div>世界: {{ serverStatus.worldName || '未加载' }}</div>
                <div>难度: {{ serverStatus.difficulty || '普通' }}</div>
              </div>
            </template>
            <NEmpty v-else description="无数据" size="small" />
          </NCard>
        </NGi>

        <!-- CPU Usage -->
        <NGi>
          <NCard title="CPU使用率" :bordered="false" size="small">
            <template v-if="systemStats">
              <NStatistic :value="systemStats.cpu.toFixed(2)">
                <template #suffix>%</template>
              </NStatistic>
              <div style="margin-top: 12px; font-size: 13px; color: #666;">
                <div>更新时间: {{ new Date(systemStats.timestamp).toLocaleTimeString() }}</div>
              </div>
            </template>
            <NEmpty v-else description="无数据" size="small" />
          </NCard>
        </NGi>

        <!-- Memory Usage -->
        <NGi>
          <NCard title="内存使用率" :bordered="false" size="small">
            <template v-if="systemStats">
              <NStatistic :value="systemStats.memory.toFixed(2)">
                <template #suffix>%</template>
              </NStatistic>
              <div style="margin-top: 12px; font-size: 13px; color: #666;">
                <div>磁盘: {{ systemStats.disk.toFixed(2) }}%</div>
              </div>
            </template>
            <NEmpty v-else description="无数据" size="small" />
          </NCard>
        </NGi>
      </NGrid>

      <!-- Online Players Table -->
      <NCard title="在线玩家列表" :bordered="false" style="margin-top: 16px">
        <template #header-extra>
          <NSpace>
            <NButton size="small" @click="loadData">刷新</NButton>
          </NSpace>
        </template>
        <NDataTable
          v-if="onlinePlayers.length > 0"
          :columns="playerColumns"
          :data="onlinePlayers"
          :pagination="false"
          :bordered="false"
          size="small"
        />
        <NEmpty v-else description="当前无在线玩家" />
      </NCard>
    </NSpin>
  </div>
</template>

<style scoped lang="scss">
.terraria-dashboard {
  padding: 16px;
  
  :deep(.n-statistic) {
    .n-statistic-value {
      font-size: 28px;
      font-weight: 600;
    }
  }
}
</style>