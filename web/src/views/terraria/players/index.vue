<script setup lang="ts">
import { ref, onMounted, onUnmounted, h } from 'vue'
import { NCard, NDataTable, NButton, NSpace, NTag, NModal, NInput, NForm, NFormItem, NSpin, NPopconfirm, NEmpty } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { getOnlinePlayers, kickPlayer, banPlayer, sendMessage, type Player } from '@/api/terraria'

// State
const loading = ref(false)
const players = ref<Player[]>([])
const showKickModal = ref(false)
const showBanModal = ref(false)
const showMessageModal = ref(false)
const selectedPlayer = ref<Player | null>(null)
const kickReason = ref('')
const banReason = ref('')
const messageContent = ref('')
const refreshInterval = ref<number | null>(null)

// Load players
const loadPlayers = async () => {
  try {
    const res = await getOnlinePlayers()
    players.value = res || []
  } catch (error) {
    console.error('Failed to load players:', error)
    window.$message?.error('加载玩家列表失败')
  }
}

// Handle kick player
const handleKick = (player: Player) => {
  selectedPlayer.value = player
  kickReason.value = ''
  showKickModal.value = true
}

const confirmKick = async () => {
  if (!selectedPlayer.value) return
  
  loading.value = true
  try {
    await kickPlayer(selectedPlayer.value.id, kickReason.value)
    window.$message?.success(`已踢出玩家: ${selectedPlayer.value.name}`)
    showKickModal.value = false
    loadPlayers()
  } catch (error) {
    console.error('Failed to kick player:', error)
    window.$message?.error('踢出玩家失败')
  } finally {
    loading.value = false
  }
}

// Handle ban player
const handleBan = (player: Player) => {
  selectedPlayer.value = player
  banReason.value = ''
  showBanModal.value = true
}

const confirmBan = async () => {
  if (!selectedPlayer.value || !banReason.value) {
    window.$message?.warning('请输入封禁原因')
    return
  }
  
  loading.value = true
  try {
    await banPlayer(selectedPlayer.value.id, banReason.value)
    window.$message?.success(`已封禁玩家: ${selectedPlayer.value.name}`)
    showBanModal.value = false
    loadPlayers()
  } catch (error) {
    console.error('Failed to ban player:', error)
    window.$message?.error('封禁玩家失败')
  } finally {
    loading.value = false
  }
}

// Handle send message
const handleMessage = (player: Player) => {
  selectedPlayer.value = player
  messageContent.value = ''
  showMessageModal.value = true
}

const confirmSendMessage = async () => {
  if (!selectedPlayer.value || !messageContent.value) {
    window.$message?.warning('请输入消息内容')
    return
  }
  
  loading.value = true
  try {
    await sendMessage(selectedPlayer.value.id, messageContent.value)
    window.$message?.success('消息已发送')
    showMessageModal.value = false
  } catch (error) {
    console.error('Failed to send message:', error)
    window.$message?.error('发送消息失败')
  } finally {
    loading.value = false
  }
}

// Get team color
const getTeamColor = (team: number): string => {
  const colors: Record<number, string> = {
    0: 'default',
    1: 'error',
    2: 'success',
    3: 'info',
    4: 'warning'
  }
  return colors[team] || 'default'
}

// Get team name
const getTeamName = (team: number): string => {
  const names: Record<number, string> = {
    0: '无队伍',
    1: '红队',
    2: '绿队',
    3: '蓝队',
    4: '黄队'
  }
  return names[team] || '未知'
}

// Table columns
const columns: DataTableColumns<Player> = [
  {
    title: 'ID',
    key: 'id',
    width: 80
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
    width: 100,
    render: (row) => {
      return h(
        NTag,
        { type: getTeamColor(row.team) as any, size: 'small' },
        { default: () => getTeamName(row.team) }
      )
    }
  },
  {
    title: '生命值',
    key: 'health',
    width: 100,
    render: (row) => `${row.health}/${row.maxHealth || 400}`
  },
  {
    title: '魔力值',
    key: 'mana',
    width: 100,
    render: (row) => `${row.mana}/${row.maxMana || 200}`
  },
  {
    title: '操作',
    key: 'actions',
    width: 220,
    render: (row) => {
      return h(
        NSpace,
        { size: 'small' },
        {
          default: () => [
            h(
              NButton,
              {
                size: 'small',
                type: 'info',
                onClick: () => handleMessage(row)
              },
              { default: () => '发消息' }
            ),
            h(
              NButton,
              {
                size: 'small',
                type: 'warning',
                onClick: () => handleKick(row)
              },
              { default: () => '踢出' }
            ),
            h(
              NButton,
              {
                size: 'small',
                type: 'error',
                onClick: () => handleBan(row)
              },
              { default: () => '封禁' }
            )
          ]
        }
      )
    }
  }
]

// Lifecycle
onMounted(() => {
  loadPlayers()
  // Auto refresh every 5 seconds
  refreshInterval.value = window.setInterval(loadPlayers, 5000)
})

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }
})
</script>

<template>
  <div class="terraria-players">
    <NCard title="在线玩家管理" :bordered="false">
      <template #header-extra>
        <NSpace>
          <NButton size="small" @click="loadPlayers">刷新</NButton>
        </NSpace>
      </template>
      
      <NSpin :show="loading">
        <NDataTable
          v-if="players.length > 0"
          :columns="columns"
          :data="players"
          :pagination="false"
          :bordered="false"
          size="small"
        />
        <NEmpty v-else description="当前无在线玩家" />
      </NSpin>
    </NCard>

    <!-- Kick Player Modal -->
    <NModal
      v-model:show="showKickModal"
      preset="card"
      title="踢出玩家"
      style="width: 500px"
      :bordered="false"
    >
      <NForm label-placement="left" label-width="100">
        <NFormItem label="玩家名称">
          <NInput :value="selectedPlayer?.name" disabled />
        </NFormItem>
        <NFormItem label="踢出原因">
          <NInput
            v-model:value="kickReason"
            type="textarea"
            placeholder="请输入踢出原因（可选）"
            :rows="3"
          />
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace justify="end">
          <NButton @click="showKickModal = false">取消</NButton>
          <NButton type="warning" :loading="loading" @click="confirmKick">
            确认踢出
          </NButton>
        </NSpace>
      </template>
    </NModal>

    <!-- Ban Player Modal -->
    <NModal
      v-model:show="showBanModal"
      preset="card"
      title="封禁玩家"
      style="width: 500px"
      :bordered="false"
    >
      <NForm label-placement="left" label-width="100">
        <NFormItem label="玩家名称">
          <NInput :value="selectedPlayer?.name" disabled />
        </NFormItem>
        <NFormItem label="封禁原因" required>
          <NInput
            v-model:value="banReason"
            type="textarea"
            placeholder="请输入封禁原因（必填）"
            :rows="3"
          />
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace justify="end">
          <NButton @click="showBanModal = false">取消</NButton>
          <NButton type="error" :loading="loading" @click="confirmBan">
            确认封禁
          </NButton>
        </NSpace>
      </template>
    </NModal>

    <!-- Send Message Modal -->
    <NModal
      v-model:show="showMessageModal"
      preset="card"
      title="发送消息"
      style="width: 500px"
      :bordered="false"
    >
      <NForm label-placement="left" label-width="100">
        <NFormItem label="接收玩家">
          <NInput :value="selectedPlayer?.name" disabled />
        </NFormItem>
        <NFormItem label="消息内容" required>
          <NInput
            v-model:value="messageContent"
            type="textarea"
            placeholder="请输入要发送的消息"
            :rows="4"
          />
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace justify="end">
          <NButton @click="showMessageModal = false">取消</NButton>
          <NButton type="primary" :loading="loading" @click="confirmSendMessage">
            发送
          </NButton>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>

<style scoped lang="scss">
.terraria-players {
  padding: 16px;
}
</style>