<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-19 17:13:42
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-23 16:05:42
 * @FilePath: \Robot_Admin\src\components\global\C_MenuTop\index.vue
 * @Description: 菜单顶部区域
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div
    class="menu-top h-56px shrink-0 flex items-center pl-14px"
    :style="{ backgroundColor: menuBgColor }"
  >
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
    themeStore.isDark ? themeStore.darkModeBgColor : '#0d1425'
  )
</script>
