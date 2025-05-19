<template>
  <div class="menu-top"> 这个放个导航logo </div>
</template>

<script setup lang="ts">
  // Composition API 自动导入已配置
  defineOptions({ name: 'C_MenuTop' })
</script>

<style scoped lang="scss">
  /* 菜单顶部区域 */
  .menu-top {
    height: 100px; /* 固定高度 */
    flex-shrink: 0;
    display: flex;
    align-items: center;
    padding: 0 20px;
  }
</style>
