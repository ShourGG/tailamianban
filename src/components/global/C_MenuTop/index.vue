<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-19 17:13:42
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-07-30 15:56:30
 * @FilePath: \Robot_Admin\src\components\global\C_MenuTop\index.vue
 * @Description: 菜单顶部区域
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div
    class="menu-top h-56px shrink-0 flex items-center pl-14px relative overflow-hidden"
    :style="{ backgroundColor: menuBgColor }"
  >
    <!-- 背景装饰 -->
    <div
      class="absolute inset-0 bg-gradient-to-r from-transparent via-[#646cff]/5 to-transparent animate-shimmer"
    ></div>
    <div
      class="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#646cff]/30 to-transparent"
    ></div>

    <!-- Logo容器 -->
    <div class="relative">
      <!-- Logo光晕背景 -->
      <div
        class="absolute inset-0 bg-[#646cff]/20 rounded-lg blur-md scale-110 animate-pulse-slow"
      ></div>

      <!-- 使用 video 标签嵌入小视频 -->
      <video
        src="/menu-too-logo.webm"
        width="40"
        height="40"
        autoplay
        loop
        muted
        playsinline
        class="relative z-10 rounded-md shadow-lg transition-transform duration-300 hover:scale-105"
        style="filter: drop-shadow(0 4px 12px rgba(100, 108, 255, 0.3))"
      >
        您的浏览器不支持 video 标签。
      </video>
    </div>

    <!-- 分隔线 -->
    <div
      class="w-[1px] h-6 mx-4 bg-gradient-to-b from-transparent via-[#646cff]/40 to-transparent"
    ></div>

    <!-- 文字内容 -->
    <div class="mt-[6px] text-base font-semibold flex flex-col">
      <span class="text-title">Robot Admin</span>
      <span class="text-subtitle">机 器 人 管 理 系 统</span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useThemeStore } from '@/stores/theme'

  defineOptions({ name: 'C_MenuTop' })

  const themeStore = useThemeStore()
  const menuBgColor = computed(() =>
    themeStore.isDark ? themeStore.darkModeBgColor : '#0d1425'
  )
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
