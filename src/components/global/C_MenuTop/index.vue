<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-19 17:13:42
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-19 23:14:24
 * @FilePath: \Robot_Admin\src\components\global\C_MenuTop\index.vue
 * @Description: 菜单顶部区域
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="menu-top">
    <img
      src="@/assets/images/menu-top-logo.gif"
      w40px
    />
    <span class="mt-[6px] ml-[10px] text-base font-semibold text-[#646cff]">
      Robot Admin
    </span>
  </div>
</template>

<script setup lang="ts">
  import { useThemeStore } from '@/stores/theme'
  import { computed } from 'vue'
  defineOptions({ name: 'C_MenuTop' })

  const themeStore = useThemeStore()
  const menuBgColor = computed(() =>
    themeStore.isDark ? '#18181c' : '#0d1425'
  )
</script>

<style scoped lang="scss">
  /* 菜单顶部区域 */
  .menu-top {
    height: 56px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    padding-left: 12px;
    background-color: v-bind('menuBgColor');
  }
</style>
