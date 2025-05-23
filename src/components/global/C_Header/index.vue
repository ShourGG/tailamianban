<template>
  <NLayoutHeader
    bordered
    position="absolute"
    :class="[
      'layout-header',
      isLightTheme ? 'light-theme' : 'dark-theme',
      'h-100px px-20px flex items-center top-0 left-0 right-0 z-1000',
    ]"
  >
    <div class="header-content w-full h-full flex items-center">
      <C_Theme />
      我是一些头部其他信息，做尝试
    </div>
  </NLayoutHeader>
</template>

<script setup lang="ts">
  defineOptions({ name: 'C_Header' })
  defineProps({
    isLightTheme: {
      type: Boolean,
      default: true,
    },
  })
</script>
