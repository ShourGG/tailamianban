<template>
  <div class="approval-node">
    <div
      class="status-indicator"
      :class="data.status"
    ></div>

    <div class="node-card">
      <div class="node-header">
        <div class="node-icon">👤</div>
        <span class="node-title">{{ data.title }}</span>
        <div
          class="node-badge"
          v-if="approverCount > 0"
          >{{ approverCount }}</div
        >
      </div>

      <div class="node-content">
        <div
          v-if="approverCount > 0"
          class="approvers-list"
        >
          <div
            v-for="approver in displayApprovers"
            :key="approver.id"
            class="approver-tag"
          >
            {{ approver.name }}
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
          >请设置审批人</div
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
  import { computed, inject } from 'vue'

  // 定义审批人类型
  interface Approver {
    id: string
    name: string
    avatar?: string
    department: string
    role: string
    email?: string
    phone?: string
  }

  interface Props {
    data: {
      title: string
      approvers?: Approver[] // 更精确的类型定义
      status?: string
    }
  }

  const props = defineProps<Props>()

  const showAddMenuFn = inject('showAddMenu') as
    | ((position: { x: number; y: number }) => void)
    | undefined

  // 使用安全的访问方式和默认值
  const approvers = computed(() => props.data.approvers ?? [])
  const approverCount = computed(() => approvers.value.length)
  const displayApprovers = computed(() => approvers.value.slice(0, 3))
  const moreCount = computed(() => Math.max(0, approverCount.value - 3))

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
  .approval-node {
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

    &.approved {
      background: #52c41a;
    }
    &.rejected {
      background: #ff4d4f;
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
      border-color: #1890ff;
    }
  }

  .node-header {
    padding: 12px 16px;
    background: #fafafa;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .node-icon {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #1890ff;
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
    background: #1890ff;
    color: white;
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 600;
  }

  .node-content {
    padding: 16px;
  }

  .approvers-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
  }

  .approver-tag {
    background: #e6f7ff;
    color: #1890ff;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    border: 1px solid #91d5ff;
  }

  .more-count {
    background: #f0f0f0;
    color: #8c8c8c;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
  }

  .placeholder {
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
