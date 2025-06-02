<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-03-30 17:45:29
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-02 22:43:22
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
          </NMessageProvider>
        </NNotificationProvider>
      </NDialogProvider>
    </NLoadingBarProvider>
  </NConfigProvider>
</template>

<script setup lang="ts">
  import { zhCN, dateZhCN } from 'naive-ui/es' // 中文语言包
  import { useThemeStore } from '@/stores/theme'
  import { onMounted } from 'vue'

  const themeStore = useThemeStore()

  // 初始化主题
  onMounted(() => {
    themeStore.init()
  })
</script>
