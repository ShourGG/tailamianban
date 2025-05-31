<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Description: 默认布局组件 - 垂直排列
-->

<template>
  <div class="c-form-default">
    <template
      v-for="item in formItems"
      :key="item.key"
    >
      <component :is="item" />
    </template>
  </div>
</template>

<script setup lang="ts">
  import type { VNode } from 'vue'

  interface Props {
    formItems: VNode[]
    layoutConfig?: any
    options?: any[]
  }

  defineProps<Props>()
</script>

<style scoped>
  .c-form-default {
    width: 100%;
  }
</style>
