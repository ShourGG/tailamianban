<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-18 08:21:48
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-04-25 10:13:05
 * @FilePath: \Robot_Admin\src\views\HomeView.vue
 * @Description: 测试调试文件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<script setup lang="ts">
  import TheWelcome from '../components/TheWelcome.vue'
</script>
<template>
  <main>
    <TheWelcome />
    <NButton type="primary"> Primary </NButton>
    <!-- <c_dgg /> -->
    <div class="text-red-500 flex-center fs-4">unocss测试</div>
    <div class="i-mdi:account-cowboy-hat-outline w-2em h-2em color-amber"></div>
    <icon-mdi:currency-twd style="font-size: 2em; color: red" />
    <!-- <C_DemoTwo /> -->
  </main>
</template>
