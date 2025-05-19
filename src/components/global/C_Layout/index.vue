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
  /* ==== 基础布局样式 ==== */

  .layout-container {
    height: 100vh;
    overflow: hidden;
  }

  /* ==== 头部区域样式 ==== */

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

  .layout-container :deep(.header-content) {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
  }

  /* ==== 内容区域样式 ==== */

  .layout-container :deep(.content-with-header) {
    margin-top: 100px;
    height: calc(100vh - 150px); /* 100px header + 50px footer */
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

  /* ==== 底部区域样式 ==== */

  .layout-container :deep(.n-layout-footer) {
    height: 50px;
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* ==== 主题相关样式 ==== */

  .layout-container :deep(.light-theme) {
    background-color: #ffffff !important;
  }

  .layout-container :deep(.dark-theme) {
    /* 使用naive-ui的默认暗色主题背景色 */
    background-color: var(--n-color) !important;
  }

  .layout-container.light-mode :deep(.n-layout .n-layout-scroll-container) {
    background-color: #e4e7ed !important;
  }

  .layout-container.dark-mode :deep(.n-layout .n-layout-scroll-container),
  .layout-container.system-mode :deep(.n-layout .n-layout-scroll-container) {
    background-color: #1c1c21 !important;
  }

  /* 主题切换时的透明度过渡 */
  .layout-container.theme-transitioning {
    opacity: 0.95;
  }

  /* ==== 侧边栏和菜单样式 ==== */

  /* 侧边栏基础样式 */
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

  /* 侧边栏滚动条优化 */
  .layout-sider :deep(.n-scrollbar-rail) {
    width: 0 !important; /* 隐藏滚动条轨道 */
  }
  .layout-sider :deep(.n-scrollbar-content) {
    padding-right: 0 !important; /* 移除滚动条内容的右侧padding */
  }

  /* 菜单容器样式 */
  .layout-container :deep(.n-layout-sider) {
    flex-shrink: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .layout-container :deep(.n-menu.n-menu--vertical) {
    flex: 1;
    min-height: 100vh;
    overflow-y: auto;
  }

  /* 菜单图标样式 */
  .layout-container :deep(.n-menu-item-content__icon) {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: -8px;
    vertical-align: top;
    width: 24px;
    height: 24px;
    margin-right: 8px;
  }

  /* ==== 折叠菜单样式 ==== */

  .layout-container :deep(.n-menu.n-menu--collapsed) {
    width: 64px !important;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .layout-container :deep(.n-menu.n-menu--collapsed .n-menu-item-content) {
    justify-content: center !important;
    padding: 0 !important;
    display: flex;
    align-items: center;
    width: 64px;
  }

  /* 折叠菜单图标定位 */
  .layout-container :deep(.n-menu.n-menu--collapsed .n-icon) {
    margin-left: 38px !important; /* 精确调整位置以确保图标居中 */
    margin-top: 4px !important; /* 精确调整位置以确保图标居中 */
  }

  .layout-container :deep(.n-menu.n-menu--collapsed .n-menu-item) {
    padding: 0 !important;
    display: flex;
    justify-content: center;
    width: 100%;
  }

  .layout-container
    :deep(.n-menu.n-menu--collapsed .n-menu-item-content-header) {
    margin: 0 auto;
    padding: 0;
  }

  /* 折叠菜单图标间距调整 */
  .layout-container
    :deep(.n-menu.n-menu--collapsed .n-menu-item-content__icon) {
    margin-right: 0;
  }

  /* 折叠菜单选中状态 */
  .layout-container
    :deep(
      .n-menu.n-menu--collapsed
        .n-menu-item-content--child-active
        .n-menu-item-content__icon
    ) {
    color: var(--n-item-color-active) !important;
  }

  .layout-container
    :deep(.n-menu.n-menu--collapsed .n-menu-item-content--child-active) {
    opacity: 0.85;
    &::before {
      background: rgba(251, 255, 253, 0.15); /* 半透明背景色 */
      border-radius: 6px;
    }
  }

  /* 折叠菜单图标颜色 */
  :deep(.n-menu--collapsed .n-menu-item-content__icon) {
    color: rgba(229, 231, 235, 0.9) !important;
  }

  /* ==== 其他辅助样式 ==== */

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

  /* 彻底移除横向滚动条 */
  .no-horizontal-scroll {
    overflow-x: hidden !important;
  }
</style>
