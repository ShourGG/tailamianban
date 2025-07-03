<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-07-03 09:35:46
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-07-03 13:49:43
 * @FilePath: \Robot_Admin\src\components\global\C_WorkFlow\nodes\CopyNode.vue
 * @Description: 复制节点组件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎. 
-->

<template>
  <div class="copy-node">
    <div
      class="status-indicator"
      :class="data.status"
    ></div>

    <div class="node-card">
      <div class="node-header">
        <div class="node-icon">📋</div>
        <span class="node-title">{{ data.title }}</span>
        <div
          class="node-badge"
          v-if="copyCount > 0"
          >{{ copyCount }}</div
        >
      </div>

      <div class="node-content">
        <div
          v-if="copyCount > 0"
          class="copy-users-list"
        >
          <div
            v-for="user in displayCopyUsers"
            :key="user.id"
            class="copy-user-tag"
          >
            {{ user.name }}
          </div>
          <div
            v-if="moreCount > 0"
            class="more-count"
            >+{{ moreCount }}</div
          >
        </div>
        <div
          v-else
          class="placeholder"
          >请设置抄送人</div
        >
      </div>
    </div>

    <div
      class="add-node-btn"
      @click="showAddMenu"
      >+</div
    >
  </div>
</template>

<script setup lang="ts">
  interface User {
    id: string
    name: string
    department: string
    role: string
  }

  interface Props {
    data: {
      title: string
      copyUsers?: User[]
      status?: string
    }
  }

  const props = defineProps<Props>()

  const showAddMenuFn = inject('showAddMenu') as
    | ((position: { x: number; y: number }) => void)
    | undefined

  // 统一使用安全的访问方式
  const copyUsers = computed(() => props.data.copyUsers ?? [])
  const copyCount = computed(() => copyUsers.value.length)
  const displayCopyUsers = computed(() => copyUsers.value.slice(0, 3))
  const moreCount = computed(() => Math.max(0, copyCount.value - 3))

  const showAddMenu = (event: MouseEvent) => {
    event.stopPropagation()
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()

    if (showAddMenuFn) {
      showAddMenuFn({
        x: rect.left + rect.width / 2,
        y: rect.bottom + 10,
      })
    }
  }
</script>

<style scoped lang="scss">
  .copy-node {
    position: relative;
  }

  .status-indicator {
    position: absolute;
    top: -4px;
    right: -4px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid white;
    z-index: 2;
    background: #faad14;

    &.completed {
      background: #52c41a;
    }
    &.active {
      background: #1890ff;
    }
  }

  .node-card {
    background: white;
    border-radius: 12px;
    min-width: 200px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 2px solid transparent;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
      border-color: #52c41a;
    }
  }

  .node-header {
    padding: 12px 16px;
    background: #f6ffed;
    border-bottom: 1px solid #d9f7be;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .node-icon {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #52c41a;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
  }

  .node-title {
    font-weight: 600;
    color: #262626;
    font-size: 14px;
    flex: 1;
  }

  .node-badge {
    background: #52c41a;
    color: white;
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 600;
    min-width: 16px;
    text-align: center;
  }

  .node-content {
    padding: 16px;
  }

  .copy-users-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
  }

  .copy-user-tag {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #f6ffed;
    color: #52c41a;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    border: 1px solid #b7eb8f;
  }

  .more-count {
    background: #f0f0f0;
    color: #8c8c8c;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
  }

  .placeholder {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #8c8c8c;
    font-size: 12px;
    padding: 8px 0;
  }

  .add-node-btn {
    position: absolute;
    left: 50%;
    bottom: -20px;
    transform: translateX(-50%);
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #52c41a, #389e0d);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(82, 196, 26, 0.3);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 16px;
    font-weight: bold;

    &:hover {
      transform: translateX(-50%) scale(1.1);
      box-shadow: 0 6px 20px rgba(82, 196, 26, 0.4);
    }
  }
</style>
