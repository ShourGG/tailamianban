<template>
  <div
    v-if="isReady"
    :class="['layout-container', `${themeStore.mode}-mode`]"
  >
    <NLayout has-sider>
      <NLayoutSider
        ref="siderRef"
        bordered
        collapse-mode="width"
        :collapsed-width="64"
        :width="240"
        show-trigger
        :native-scrollbar="false"
        :collapsed="isCollapsed"
        @update:collapsed="handleCollapsedChange"
        :class="[
          'layout-sider',
          'no-horizontal-scroll',
          isLightTheme ? 'light-theme' : 'dark-theme',
        ]"
      >
        <div class="menu-top"> 这个放个导航logo </div>
        <div class="menu-scroll-container">
          <C_Menu
            :data="menuData"
            mode="vertical"
            :collapsed="isCollapsed"
            :inverted="!isLightTheme"
          />
        </div>
      </NLayoutSider>

      <NLayout>
        <NLayoutHeader
          bordered
          position="absolute"
          :class="[
            'layout-header',
            isLightTheme ? 'light-theme' : 'dark-theme',
          ]"
        >
          <div class="header-content">
            <C_Theme />
            我是一些头部其他信息，做尝试
          </div>
        </NLayoutHeader>

        <NLayoutContent class="content-with-header">
          <RouterView class="main-content" />
        </NLayoutContent>

        <NLayoutFooter
          bordered
          :class="[
            'layout-footer',
            isLightTheme ? 'light-theme' : 'dark-theme',
          ]"
        >
          <!-- 底部内容 -->
          Copyright MIT © 2025 by CHENY
        </NLayoutFooter>
      </NLayout>
    </NLayout>
  </div>
</template>
<script setup lang="ts">
  import { type LayoutSiderInst } from 'naive-ui'
  import { s_permissionStore } from '@/stores/permission'
  import { useThemeStore } from '@/stores/theme'

  const permissionStore = s_permissionStore()
  const themeStore = useThemeStore()

  // 控制布局组件是否准备好显示，避免主题闪烁
  const isReady = ref(false)

  const theme = computed(() => themeStore.mode)
  const isLightTheme = computed(() => theme.value === 'light')

  // 在组件挂载后执行初始化
  onMounted(() => {
    // 创建预渲染样式，确保黑色主题下页面初始加载不会出现白闪
    if (
      themeStore.mode === 'dark' ||
      (themeStore.mode === 'system' && themeStore.systemIsDark)
    ) {
      const style = document.createElement('style')
      style.textContent = `
        body, #app {
          background-color: #1c1c21 !important;
        }
      `
      document.head.appendChild(style)

      // 清理临时样式
      nextTick(() => {
        setTimeout(() => {
          document.head.removeChild(style)
          isReady.value = true
        }, 10)
      })
    } else {
      // 对于浅色主题，直接显示
      isReady.value = true
    }
  })

  watch(
    theme,
    newTheme => {
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },
    { immediate: true }
  )
  const menuData = permissionStore.showMenuListGet

  // 侧边栏相关
  const siderRef = ref<LayoutSiderInst | null>(null)
  const isCollapsed = ref(false)

  /**
   * 处理侧边栏折叠状态变化
   */
  const handleCollapsedChange = (collapsed: boolean) => {
    isCollapsed.value = collapsed
  }
</script>

<style scoped>
  @import './index.scss';
</style>
