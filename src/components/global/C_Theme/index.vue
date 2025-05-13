<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-13 14:22:46
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-13 14:23:20
 * @FilePath: \Robot_Admin\src\components\global\C_Theme\index.vue
 * @Description:  
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎. 
-->
<template>
  <NDropdown
    trigger="click"
    :options="options"
    @select="handleSelect"
  >
    <NButton text>
      <template #icon>
        <NIcon size="18">
          <span
            :class="currentIcon"
            class="text-current"
          />
        </NIcon>
      </template>
      主题模式
    </NButton>
  </NDropdown>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useThemeStore, type ThemeMode } from '@/stores/theme'

  const themeStore = useThemeStore()

  // 使用 UnoCSS 图标类名
  const currentIcon = computed(() => {
    switch (themeStore.mode) {
      case 'light':
        return 'i-ion:sunny-sharp'
      case 'dark':
        return 'i-ion:moon-sharp'
      default:
        return 'i-ion:desktop-outline'
    }
  })

  // 下拉选项
  const options = [
    {
      label: '浅色模式',
      key: 'light',
      icon: () => h('span', { class: 'i-ion:sunny-sharp text-4' }),
    },
    {
      label: '深色模式',
      key: 'dark',
      icon: () => h('span', { class: 'i-ion:moon-sharp text-4' }),
    },
    {
      label: '跟随系统',
      key: 'system',
      icon: () => h('span', { class: 'i-ion:desktop-outline text-4' }),
    },
  ]

  // 选择处理
  const handleSelect = (key: string) => {
    themeStore.setMode(key as ThemeMode)
  }
</script>
