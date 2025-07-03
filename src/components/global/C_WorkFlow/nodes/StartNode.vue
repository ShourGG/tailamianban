<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-07-03 09:14:16
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-07-03 13:50:06
 * @FilePath: \Robot_Admin\src\components\global\C_WorkFlow\nodes\StartNode.vue
 * @Description: 开始节点组件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎. 
-->

<template>
  <div class="start-node">
    <div class="node-content">
      <div class="node-icon">🚀</div>
      <div class="node-text">{{ data.title }}</div>
    </div>

    <div
      class="add-node-btn"
      @click="showAddMenu"
      >+</div
    >
  </div>
</template>

<script setup lang="ts">
  import { inject } from 'vue'

  interface Props {
    data: {
      title: string
      status?: string
    }
  }

  defineProps<Props>()

  // 🔧 修复3：在 setup() 中调用 inject
  const showAddMenuFn = inject('showAddMenu') as
    | ((position: { x: number; y: number }) => void)
    | undefined

  const showAddMenu = (event: MouseEvent) => {
    event.stopPropagation()
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()

    // 使用已经注入的函数
    if (showAddMenuFn) {
      showAddMenuFn({
        x: rect.left + rect.width / 2,
        y: rect.bottom + 10,
      })
    }
  }
</script>

<style scoped lang="scss">
  .start-node {
    position: relative;
  }

  .node-content {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 16px 20px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-width: 120px;
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(102, 126, 234, 0.4);
    }
  }

  .node-icon {
    font-size: 16px;
  }

  .node-text {
    font-weight: 600;
    font-size: 14px;
  }

  .add-node-btn {
    position: absolute;
    left: 50%;
    bottom: -20px;
    transform: translateX(-50%);
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #1890ff, #722ed1);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 16px;
    font-weight: bold;

    &:hover {
      transform: translateX(-50%) scale(1.1);
      box-shadow: 0 6px 20px rgba(24, 144, 255, 0.4);
    }
  }
</style>
