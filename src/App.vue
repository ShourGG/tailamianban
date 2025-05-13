<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-03-30 17:45:29
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-13 16:06:34
 * @FilePath: \Robot_Admin\src\App.vue
 * @Description: 根入口文件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <NConfigProvider
    :theme="themeStore.currentTheme"
    :theme-overrides="themeOverrides"
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
  import { zhCN, dateZhCN } from 'naive-ui' // 中文语言包
  import { useThemeStore } from '@/stores/theme'
  import { themeOverrides } from '@/config/theme'

  const themeStore = useThemeStore()
</script>

<style>
  .global-config-provider {
    /* 更改为块级布局 */
    display: block;
    /* 确保撑满整个视口 */
    width: 100vw;
    height: 100vh;
    /* 重置内部容器 */
    > div {
      height: 100%;
    }
  }

  /* 添加全局样式重置 */
  html,
  body {
    margin: 0;
    padding: 0;
    overflow: hidden; /* 防止滚动条出现 */
  }
  html {
    transition: color-scheme 0.3s ease;
  }

  html.dark {
    color-scheme: dark;
  }
</style>
