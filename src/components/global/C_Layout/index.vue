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
        :class="[
          'layout-sider',
          'no-horizontal-scroll',
          isLightTheme ? 'light-theme' : 'dark-theme',
        ]"
      >
        <C_Menu
          :data="menuData"
          mode="vertical"
          :collapsed="isCollapsed"
          :inverted="!isLightTheme"
        />
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
  import { computed, ref, watch, onMounted, nextTick } from 'vue'
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
</script>

<style scoped>
  .layout-container {
    height: 100vh;
    overflow: hidden;
  }

  .layout-container :deep(.n-menu-item-content__icon) {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: -8px;
    vertical-align: top;
    width: 24px;
    height: 24px;
  }

  .layout-container :deep(.layout-header) {
    height: 100px;
    padding: 0 20px;
    display: flex;
    align-items: center;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
  }

  .layout-container :deep(.light-theme) {
    background-color: #ffffff !important;
  }

  .layout-container :deep(.dark-theme) {
    /* 使用naive-ui的默认暗色主题背景色 */
    background-color: var(--n-color) !important;
  }

  /* 内容区域背景色设置 */
  .layout-container :deep(.n-layout .n-layout-scroll-container) {
    /* 过渡效果由主题切换时动态添加 */
    transition: none;
  }

  /* 主题切换时的透明度过渡 */
  .layout-container.theme-transitioning {
    opacity: 0.95;
  }

  /* 根据主题设置不同的背景色 */
  .layout-container.light-mode :deep(.n-layout .n-layout-scroll-container) {
    background-color: #e4e7ed !important;
  }

  .layout-container.dark-mode :deep(.n-layout .n-layout-scroll-container),
  .layout-container.system-mode :deep(.n-layout .n-layout-scroll-container) {
    background-color: #1c1c21 !important;
  }

  .layout-container :deep(.header-content) {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
  }

  .layout-container :deep(.content-with-header) {
    margin-top: 100px;
    height: calc(100vh - 150px); /* 100px header + 50px footer */
  }

  .layout-container :deep(.n-layout-footer) {
    height: 50px;
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .layout-container :deep(.n-layout-content) {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow-x: hidden; /* 移除内容区域的横向滚动条 */
  }

  .main-content {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    overflow-x: hidden; /* 移除内容区域的横向滚动条 */
    width: 100%; /* 确保内容区域宽度自适应 */
  }

  /* 彻底移除横向滚动条 */
  .no-horizontal-scroll {
    overflow-x: hidden !important;
  }

  /* 菜单区域优化 - 解决主题切换闪烁 */
  .layout-sider {
    transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform: translateZ(0);
    backface-visibility: hidden;
    perspective: 1000px;
    contain: strict;
  }

  /* 预加载主题样式 */
  .layout-sider.light-theme {
    background-color: #081426;
  }

  .layout-sider.dark-theme {
    background-color: rgb(16, 16, 20);
  }
  .layout-sider :deep(.n-scrollbar-rail) {
    width: 0 !important; /* 隐藏滚动条轨道 */
  }
  .layout-sider :deep(.n-scrollbar-content) {
    padding-right: 0 !important; /* 移除滚动条内容的右侧padding */
  }

  /* 确保内容区域自适应 */
  .layout-container :deep(.n-layout) {
    width: 100%;
    min-width: 0; /* 确保flex子项可以缩小到比内容更小 */
  }

  /* 确保布局容器撑满高度 */
  .layout-container {
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* 精确控制菜单容器 */
  .layout-container :deep(.n-layout-sider) {
    flex-shrink: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  /* 精确覆盖Naive UI菜单样式 */
  .layout-container :deep(.n-menu.n-menu--vertical) {
    flex: 1;
    min-height: 100vh;
    overflow-y: auto;
  }
</style>
