<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-03-30 17:45:29
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-08-06 14:07:01
 * @FilePath: \Robot_Admin\src\App.vue
 * @Description: 根入口文件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <NConfigProvider
    :theme="themeStore.currentTheme"
    :theme-overrides="themeStore.themeOverrides"
    :locale="zhCN"
    :date-locale="dateZhCN"
    class="global-config-provider"
  >
    <NLoadingBarProvider>
      <NDialogProvider>
        <NNotificationProvider>
          <NMessageProvider>
            <RouterView />

            <!-- 开发环境预加载状态 -->
            <div
              v-if="isPreloading && isDev"
              class="preload-status"
            >
              🔄 正在优化页面... {{ stats.completed }}/{{ stats.total }}
            </div>
          </NMessageProvider>
        </NNotificationProvider>
      </NDialogProvider>
    </NLoadingBarProvider>
  </NConfigProvider>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue'
  import { zhCN, dateZhCN } from 'naive-ui/es' // 中文语言包
  import { useThemeStore } from '@/stores/theme'
  import { usePreloader } from '@/composables/usePreloader'
  import '@/lib/version'

  const themeStore = useThemeStore()
  const { startPreload, isPreloading, stats } = usePreloader()

  // 开发环境判断
  const isDev = import.meta.env.DEV

  // 初始化
  onMounted(() => {
    // 初始化主题
    themeStore.init()

    // 页面加载完成2秒后开始预加载
    setTimeout(() => {
      startPreload()
    }, 2000)
  })
</script>

<style>
  .preload-status {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 12px;
    z-index: 9999;
    pointer-events: none;
  }
</style>
