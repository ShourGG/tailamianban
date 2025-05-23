<template>
  <NLayoutFooter
    bordered
    :class="[
      'layout-footer',
      isLightTheme ? 'light-theme' : 'dark-theme',
      'h-50px px-20px flex items-center justify-center',
    ]"
  >
    <!-- 底部内容 -->
    Copyright MIT © 2025 by CHENY
  </NLayoutFooter>
</template>

<script setup lang="ts">
  // Composition API 自动导入已配置
  defineOptions({ name: 'C_Footer' })

  defineProps({
    isLightTheme: {
      type: Boolean,
      default: true,
    },
  })
</script>
