<template>
  <n-layout class="layout-container">
    <n-layout-header class="header" bordered>
      <div class="header-content">
        <div class="header-left">
          <div class="logo">
            <i-carbon-game-console class="logo-icon" />
            <span class="logo-text">泰拉瑞亚面板</span>
          </div>
        </div>

        <div class="header-right">
          <n-space>
            <!-- Server Status Indicator -->
            <div class="server-status">
              <n-tag
                :type="serverStatusType"
                size="small"
                round
              >
                <template #icon>
                  <i-carbon-circle-filled />
                </template>
                {{ serverStatusText }}
              </n-tag>
            </div>

            <!-- Theme Toggle -->
            <n-button
              quaternary
              circle
              @click="toggleTheme"
            >
              <template #icon>
                <i-carbon-sun v-if="themeStore.isDark" />
                <i-carbon-moon v-else />
              </template>
            </n-button>

            <!-- User Menu -->
            <n-dropdown
              :options="userMenuOptions"
              @select="handleUserMenuSelect"
            >
              <n-button quaternary circle>
                <template #icon>
                  <i-carbon-user-avatar />
                </template>
              </n-button>
            </n-dropdown>
          </n-space>
        </div>
      </div>
    </n-layout-header>

    <n-layout has-sider class="content-layout">
      <n-layout-sider
        bordered
        collapse-mode="width"
        :collapsed-width="64"
        :width="240"
        :collapsed="collapsed"
        show-trigger
        @collapse="collapsed = true"
        @expand="collapsed = false"
      >
        <div class="sidebar-content">
          <n-menu
            :collapsed="collapsed"
            :collapsed-width="64"
            :collapsed-icon-size="20"
            :options="menuOptions"
            :value="currentRoute"
            @update:value="handleMenuSelect"
          />
        </div>
      </n-layout-sider>

      <n-layout-content class="main-content">
        <div class="content-wrapper">
          <router-view />
        </div>
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<script setup lang="ts">
import { computed, h, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMessage, useDialog } from 'naive-ui'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { useServerStore } from '@/stores/server'

const router = useRouter()
const route = useRoute()
const message = useMessage()
const dialog = useDialog()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const serverStore = useServerStore()

const collapsed = ref(false)

// Current route for menu highlighting
const currentRoute = computed(() => route.name as string)

// Server status
const serverStatusType = computed(() => {
  switch (serverStore.status?.status) {
    case 'running':
      return 'success'
    case 'starting':
    case 'stopping':
      return 'warning'
    case 'stopped':
    default:
      return 'error'
  }
})

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

// Menu options
const menuOptions = [
  {
    label: '仪表板',
    key: 'Dashboard',
    icon: () => h('i', { class: 'i-carbon-dashboard' })
  },
  {
    label: '服务器管理',
    key: 'Server',
    icon: () => h('i', { class: 'i-carbon-server' })
  },
  {
    label: '世界管理',
    key: 'Worlds',
    icon: () => h('i', { class: 'i-carbon-earth' })
  },
  {
    label: '玩家管理',
    key: 'Players',
    icon: () => h('i', { class: 'i-carbon-user-multiple' })
  },
  {
    label: '系统监控',
    key: 'System',
    icon: () => h('i', { class: 'i-carbon-analytics' })
  },
  {
    label: '面板设置',
    key: 'Settings',
    icon: () => h('i', { class: 'i-carbon-settings' })
  }
]

// User menu options
const userMenuOptions = [
  {
    label: '个人资料',
    key: 'profile',
    icon: () => h('i', { class: 'i-carbon-user' })
  },
  {
    label: '修改密码',
    key: 'change-password',
    icon: () => h('i', { class: 'i-carbon-password' })
  },
  {
    type: 'divider',
    key: 'divider'
  },
  {
    label: '退出登录',
    key: 'logout',
    icon: () => h('i', { class: 'i-carbon-logout' })
  }
]

// Handle menu selection
const handleMenuSelect = (key: string) => {
  router.push({ name: key })
}

// Handle user menu selection
const handleUserMenuSelect = (key: string) => {
  switch (key) {
    case 'profile':
      message.info('个人资料功能开发中...')
      break
    case 'change-password':
      message.info('修改密码功能开发中...')
      break
    case 'logout':
      handleLogout()
      break
  }
}

// Handle logout
const handleLogout = () => {
  dialog.warning({
    title: '确认退出',
    content: '确定要退出登录吗？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await authStore.logout()
        message.success('已退出登录')
        router.push('/login')
      } catch (error) {
        console.error('Logout error:', error)
        message.error('退出登录失败')
      }
    }
  })
}

// Toggle theme
const toggleTheme = () => {
  themeStore.toggleTheme()
}

// Initialize server status
onMounted(() => {
  serverStore.fetchStatus()
  // Start periodic status updates
  setInterval(() => {
    serverStore.fetchStatus()
  }, 5000)
})
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.header {
  height: 64px;
  padding: 0;
}

.header-content {
  height: 100%;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  font-size: 24px;
  color: #3b82f6;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: var(--n-text-color);
}

.header-right {
  display: flex;
  align-items: center;
}

.server-status {
  display: flex;
  align-items: center;
}

.content-layout {
  height: calc(100vh - 64px);
}

.sidebar-content {
  height: 100%;
  padding-top: 16px;
}

.main-content {
  height: 100%;
  overflow: auto;
}

.content-wrapper {
  padding: 24px;
  min-height: 100%;
}

@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
  }
  
  .content-wrapper {
    padding: 16px;
  }
  
  .logo-text {
    display: none;
  }
}
</style>