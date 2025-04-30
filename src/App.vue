<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-03-30 17:45:29
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-04-30 11:34:53
 * @FilePath: \Robot_Admin\src\App.vue
 * @Description: 根入口文件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <NConfigProvider
    :theme="theme"
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

  // 主题配置示例
  const theme = ref(null) // 暗黑主题可设置为 darkTheme

  // 主题覆盖示例
  const themeOverrides = {
    common: {
      primaryColor: '#1890ff',
      primaryColorHover: '#40a9ff',
    },
    Button: {
      colorHoverPrimary: '#40a9ff',
      textColorPrimary: '#fff',
    },
  }
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
</style>
