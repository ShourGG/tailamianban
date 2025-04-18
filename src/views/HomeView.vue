<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-18 08:21:48
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-04-18 17:14:28
 * @FilePath: \bun_vite_uno_naive\src\views\HomeView.vue
 * @Description: 测试调试文件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<script setup lang="ts">
  import TheWelcome from '../components/TheWelcome.vue'
</script>
<template>
  <main>
    <TheWelcome />
    <!-- <C_Demo /> -->
    <NButton type="primary"> Primary </NButton>
    <!-- <c_dgg /> -->
    <div class="text-red-500 flex-center fs-4">测试文字</div>
    <div class="i-mdi:account-cowboy-hat-outline w-2em h-2em color-amber"></div>
    <IconMdiAlphaICircleOutline />
  </main>
</template>
