<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-11 14:22:31
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-07-18 14:14:17
 * @FilePath: \Robot_Admin\src\components\global\C_Layout\index.vue
 * @Description: 布局组件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div
    v-if="isReady"
    :class="['layout-container', isDarkMode ? 'dark-mode' : 'light-mode']"
  >
    <NLayout has-sider>
      <NLayoutSidera
        ref="siderRef"
        bordered
        collapse-mode="width"
        :collapsed-width="64"
        :width="240"
        :native-scrollbar="false"
        :collapsed="isCollapsed"
        @update:collapsed="handleCollapsedChange"
        :class="[
          'layout-sider',
          'no-horizontal-scroll',
          isDarkMode ? 'dark-theme' : 'light-theme',
        ]"
      >
        <C_MenuTop id="guide-menu-top" />
        <div
          id="guide-menu"
          class="menu-scroll-container"
        >
          <C_Menu
            :data="menuData"
            mode="vertical"
            :collapsed="isCollapsed"
            :inverted="isDarkMode"
          />
        </div>
      </NLayoutSidera>

      <NLayout>
        <C_Header :isLightTheme="!isDarkMode" />

        <NLayoutContent
          class="content-with-header p16px"
          :style="{ backgroundColor: isDarkMode ? '#1c1c1c' : '#ffffff' }"
        >
          <RouterView class="main-content" />
        </NLayoutContent>
        <C_Footer :isLightTheme="!isDarkMode" />
      </NLayout>
    </NLayout>
  </div>
</template>
<script setup lang="ts">
  import { type LayoutSiderInst } from 'naive-ui/es'
  import { s_permissionStore } from '@/stores/permission'
  import { useThemeStore } from '@/stores/theme'

  const permissionStore = s_permissionStore()
  const themeStore = useThemeStore()

  const isReady = ref(false) // 控制布局组件是否准备好显示，避免主题闪烁

  // 关键修改：使用 themeStore.isDark 来统一判断主题
  const isDarkMode = computed(() => themeStore.isDark)

  /**
   * * @description: 创建预渲染样式，确保黑色主题下页面初始加载不会出现白闪
   * ! @return {*} void
   */
  const _disposeThemeEffect = () => {
    // 使用 isDarkMode 判断
    if (isDarkMode.value) {
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
  }

  // 获取菜单数据
  const menuData = permissionStore.showMenuListGet

  // 侧边栏相关
  const siderRef = ref<LayoutSiderInst | null>(null)
  const isCollapsed = ref(false)

  /**
   * * @description: 处理侧边栏折叠状态变化
   * ? @param {*} collapsed 是否折叠
   * ! @return {*} void
   */
  const handleCollapsedChange = (collapsed: boolean) => {
    isCollapsed.value = collapsed
  }

  // 监听实际的暗色模式状态，而不是 mode
  watch(
    isDarkMode,
    (isDark: boolean) => {
      if (isDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },
    { immediate: true }
  )

  // 在组件挂载后执行初始化
  onMounted(() => _disposeThemeEffect())

  provide('menuCollapse', {
    isCollapsed,
    handleCollapsedChange,
  })
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
