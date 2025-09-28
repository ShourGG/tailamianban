<template>
  <div class="dashboard-container">
    <!-- 状态卡片 -->
    <n-grid :x-gap="16" :y-gap="16" :cols="24">
      <n-gi :span="6">
        <n-card>
          <n-statistic label="服务器状态">
            <template #prefix>
              <n-icon :color="serverStatusColor">
                <i-mdi-server />
              </n-icon>
            </template>
            {{ serverStatusText }}
          </n-statistic>
        </n-card>
      </n-gi>
      
      <n-gi :span="6">
        <n-card>
          <n-statistic label="在线玩家" :value="onlinePlayers">
            <template #prefix>
              <n-icon color="#18a058">
                <i-mdi-account-group />
              </n-icon>
            </template>
            <template #suffix>
              / {{ maxPlayers }}
            </template>
          </n-statistic>
        </n-card>
      </n-gi>
      
      <n-gi :span="6">
        <n-card>
          <n-statistic label="CPU使用率" :value="cpuUsage">
            <template #prefix>
              <n-icon :color="cpuColor">
                <i-mdi-cpu-64-bit />
              </n-icon>
            </template>
            <template #suffix>%</template>
          </n-statistic>
        </n-card>
      </n-gi>
      
      <n-gi :span="6">
        <n-card>
          <n-statistic label="内存使用" :value="memoryUsage">
            <template #prefix>
              <n-icon :color="memoryColor">
                <i-mdi-memory />
              </n-icon>
            </template>
            <template #suffix>%</template>
          </n-statistic>
        </n-card>
      </n-gi>
    </n-grid>

    <!-- 快捷操作 -->
    <n-card title="快捷操作" class="mt-4">
      <n-space>
        <n-button 
          type="success" 
          :loading="starting"
          :disabled="serverStatus === 'running'"
          @click="startServer"
        >
          <template #icon>
            <n-icon><i-mdi-play /></n-icon>
          </template>
          启动服务器
        </n-button>
        
        <n-button 
          type="error" 
          :loading="stopping"
          :disabled="serverStatus !== 'running'"
          @click="stopServer"
        >
          <template #icon>
            <n-icon><i-mdi-stop /></n-icon>
          </template>
          停止服务器
        </n-button>
        
        <n-button 
          type="warning"
          :loading="restarting"
          :disabled="serverStatus !== 'running'"
          @click="restartServer"
        >
          <template #icon>
            <n-icon><i-mdi-restart /></n-icon>
          </template>
          重启服务器
        </n-button>
        
        <n-button type="info" @click="backupWorld">
          <template #icon>
            <n-icon><i-mdi-content-save /></n-icon>
          </template>
          备份世界
        </n-button>
      </n-space>
    </n-card>

    <!-- 服务器信息和系统监控 -->
    <n-grid :x-gap="16" :y-gap="16" :cols="24" class="mt-4">
      <n-gi :span="12">
        <n-card title="服务器信息">
          <n-descriptions :column="1" label-placement="left">
            <n-descriptions-item label="世界名称">
              {{ worldName || '-' }}
            </n-descriptions-item>
            <n-descriptions-item label="游戏版本">
              {{ gameVersion || '-' }}
            </n-descriptions-item>
            <n-descriptions-item label="服务器端口">
              {{ serverPort || '-' }}
            </n-descriptions-item>
            <n-descriptions-item label="运行时间">
              {{ uptimeText }}
            </n-descriptions-item>
            <n-descriptions-item label="难度模式">
              <n-tag :type="difficultyType">{{ difficultyText }}</n-tag>
            </n-descriptions-item>
          </n-descriptions>
        </n-card>
      </n-gi>
      
      <n-gi :span="12">
        <n-card title="系统资源">
          <div ref="chartContainer" style="height: 250px"></div>
        </n-card>
      </n-gi>
    </n-grid>

    <!-- 最近日志 -->
    <n-card title="最近日志" class="mt-4">
      <n-scrollbar style="max-height: 300px">
        <n-log :lines="recentLogs" :font-size="12" />
      </n-scrollbar>
      <template #header-extra>
        <n-button text @click="refreshLogs">
          <template #icon>
            <n-icon><i-mdi-refresh /></n-icon>
          </template>
          刷新
        </n-button>
      </template>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useMessage } from 'naive-ui'
import { terrariaApi } from '@/api/terraria'
import * as echarts from 'echarts'

const message = useMessage()

// 服务器状态
const serverStatus = ref<string>('stopped')
const onlinePlayers = ref(0)
const maxPlayers = ref(8)
const worldName = ref('')
const gameVersion = ref('1.4.4.9')
const serverPort = ref(7777)
const uptime = ref(0)
const difficulty = ref('classic')

// 系统资源
const cpuUsage = ref(0)
const memoryUsage = ref(0)

// 操作状态
const starting = ref(false)
const stopping = ref(false)
const restarting = ref(false)

// 日志
const recentLogs = ref<string[]>([])

// 图表
const chartContainer = ref<HTMLElement>()
let chart: echarts.ECharts | null = null
let refreshTimer: number | null = null

// 计算属性
const serverStatusText = computed(() => {
  const statusMap: Record<string, string> = {
    running: '运行中',
    stopped: '已停止',
    starting: '启动中',
    stopping: '停止中'
  }
  return statusMap[serverStatus.value] || '未知'
})

const serverStatusColor = computed(() => {
  const colorMap: Record<string, string> = {
    running: '#18a058',
    stopped: '#d03050',
    starting: '#f0a020',
    stopping: '#f0a020'
  }
  return colorMap[serverStatus.value] || '#999'
})

const cpuColor = computed(() => {
  if (cpuUsage.value >= 80) return '#d03050'
  if (cpuUsage.value >= 60) return '#f0a020'
  return '#18a058'
})

const memoryColor = computed(() => {
  if (memoryUsage.value >= 80) return '#d03050'
  if (memoryUsage.value >= 60) return '#f0a020'
  return '#18a058'
})

const uptimeText = computed(() => {
  const hours = Math.floor(uptime.value / 3600)
  const minutes = Math.floor((uptime.value % 3600) / 60)
  const seconds = uptime.value % 60
  return `${hours}小时 ${minutes}分钟 ${seconds}秒`
})

const difficultyText = computed(() => {
  const difficultyMap: Record<string, string> = {
    classic: '经典',
    expert: '专家',
    master: '大师',
    journey: '旅程'
  }
  return difficultyMap[difficulty.value] || '经典'
})

const difficultyType = computed(() => {
  const typeMap: Record<string, any> = {
    classic: 'default',
    expert: 'warning',
    master: 'error',
    journey: 'info'
  }
  return typeMap[difficulty.value] || 'default'
})

// 方法
const fetchServerStatus = async () => {
  try {
    const res = await terrariaApi.server.getStatus()
    const data = res.data.data
    serverStatus.value = data.status
    onlinePlayers.value = data.player_count
    maxPlayers.value = data.max_players
    worldName.value = data.world_name
    serverPort.value = data.port
    uptime.value = data.uptime
  } catch (error) {
    console.error('获取服务器状态失败:', error)
  }
}

const fetchSystemMetrics = async () => {
  try {
    const res = await terrariaApi.system.getMetrics()
    const data = res.data.data
    cpuUsage.value = Math.round(data.cpu.usage_percent)
    memoryUsage.value = Math.round(data.memory.used_percent)
    
    // 更新图表
    updateChart(data)
  } catch (error) {
    console.error('获取系统指标失败:', error)
  }
}

const fetchLogs = async () => {
  try {
    const res = await terrariaApi.server.getLogs(20)
    recentLogs.value = res.data.data
  } catch (error) {
    console.error('获取日志失败:', error)
  }
}

const startServer = async () => {
  starting.value = true
  try {
    await terrariaApi.server.start()
    message.success('服务器启动成功')
    await fetchServerStatus()
  } catch (error) {
    message.error('服务器启动失败')
  } finally {
    starting.value = false
  }
}

const stopServer = async () => {
  stopping.value = true
  try {
    await terrariaApi.server.stop()
    message.success('服务器停止成功')
    await fetchServerStatus()
  } catch (error) {
    message.error('服务器停止失败')
  } finally {
    stopping.value = false
  }
}

const restartServer = async () => {
  restarting.value = true
  try {
    await terrariaApi.server.restart()
    message.success('服务器重启成功')
    await fetchServerStatus()
  } catch (error) {
    message.error('服务器重启失败')
  } finally {
    restarting.value = false
  }
}

const backupWorld = async () => {
  message.info('备份功能开发中...')
}

const refreshLogs = () => {
  fetchLogs()
}

const initChart = () => {
  if (!chartContainer.value) return
  
  chart = echarts.init(chartContainer.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['CPU', '内存', '磁盘']
    },
    xAxis: {
      type: 'category',
      data: []
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: 'CPU',
        type: 'line',
        smooth: true,
        data: []
      },
      {
        name: '内存',
        type: 'line',
        smooth: true,
        data: []
      },
      {
        name: '磁盘',
        type: 'line',
        smooth: true,
        data: []
      }
    ]
  }
  
  chart.setOption(option)
}

const updateChart = (metrics: any) => {
  if (!chart) return
  
  const option = chart.getOption() as any
  const time = new Date().toLocaleTimeString()
  
  // 保持最近30个数据点
  if (option.xAxis[0].data.length >= 30) {
    option.xAxis[0].data.shift()
    option.series[0].data.shift()
    option.series[1].data.shift()
    option.series[2].data.shift()
  }
  
  option.xAxis[0].data.push(time)
  option.series[0].data.push(Math.round(metrics.cpu.usage_percent))
  option.series[1].data.push(Math.round(metrics.memory.used_percent))
  option.series[2].data.push(Math.round(metrics.disk.used_percent))
  
  chart.setOption(option)
}

// 生命周期
onMounted(() => {
  fetchServerStatus()
  fetchSystemMetrics()
  fetchLogs()
  initChart()
  
  // 定时刷新
  refreshTimer = setInterval(() => {
    fetchServerStatus()
    fetchSystemMetrics()
  }, 5000)
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
  if (chart) {
    chart.dispose()
  }
})
</script>

<style scoped>
.dashboard-container {
  padding: 16px;
}

.mt-4 {
  margin-top: 16px;
}
</style>