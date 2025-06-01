<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-31 16:58:59
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-01 22:35:45
 * @FilePath: \Robot_Admin\src\components\global\C_Form\layouts\Card\index.vue
 * @Description: 表单组件 - 卡片布局（重构版）- 简洁高效，支持垂直/水平布局
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div
    class="c-form-card"
    :class="layoutClass"
  >
    <!-- 布局切换按钮（仅多卡片时显示） -->
    <div
      v-if="hasGroups"
      class="layout-toggle"
    >
      <NButtonGroup>
        <NButton
          :type="currentDirection === 'vertical' ? 'primary' : 'default'"
          @click="toggleLayout('vertical')"
          size="small"
        >
          <template #icon>
            <i class="i-mdi-view-agenda" />
          </template>
          垂直布局
        </NButton>
        <NButton
          :type="currentDirection === 'horizontal' ? 'primary' : 'default'"
          @click="toggleLayout('horizontal')"
          size="small"
        >
          <template #icon>
            <i class="i-mdi-view-column" />
          </template>
          水平布局
        </NButton>
      </NButtonGroup>
    </div>

    <!-- 表单内容区域 -->
    <div class="form-content">
      <!-- 无分组配置时的单一卡片模式 -->
      <NCard
        hoverable
        v-if="!hasGroups"
        title="表单信息"
        :bordered="true"
        class="single-card"
      >
        <template
          v-for="item in formItems"
          :key="item.key"
        >
          <component :is="item" />
        </template>
      </NCard>

      <!-- 有分组配置时的多卡片模式 -->
      <template v-else>
        <NCard
          hoverable
          v-for="group in groupsWithItems"
          :key="group.config.key"
          :title="group.config.title"
          :bordered="true"
          class="card-item"
        >
          <!-- 分组描述信息 -->
          <template v-if="group.config.description">
            <p class="card-description">{{ group.config.description }}</p>
          </template>

          <!-- 分组内的表单项 -->
          <template
            v-for="item in group.items"
            :key="item.key"
          >
            <component :is="item" />
          </template>
        </NCard>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { VNode } from 'vue'

  /**
   * * @description: 分组配置接口
   * ! @interface GroupConfig
   */
  interface GroupConfig {
    key: string // 分组唯一标识
    title: string // 分组标题
    description?: string // 分组描述文本
  }

  /**
   * * @description: 分组数据接口
   * ! @interface GroupWithItems
   */
  interface GroupWithItems {
    config: GroupConfig // 分组配置
    items: VNode[] // 分组内的表单项
  }

  /**
   * * @description: 组件属性接口定义
   * ! @interface Props
   */
  interface Props {
    formItems: VNode[] // 表单项VNode数组
    layoutConfig?: {
      // 布局配置对象
      card?: {
        groups?: GroupConfig[] // 分组配置数组
        direction?: 'vertical' | 'horizontal' // 布局方向：垂直 | 水平
      }
    }
    options?: Array<{
      // 表单项配置数组
      layout?: {
        group?: string // 所属分组标识
      }
    }>
  }

  const props = defineProps<Props>()

  // ================= 响应式状态 =================

  /**
   * * @description: 当前布局方向
   * ? @ref 可切换的布局方向状态
   * ! @type {'vertical' | 'horizontal'} 布局方向
   */
  const currentDirection = ref<'vertical' | 'horizontal'>('vertical')

  // ================= 计算属性 =================

  /**
   * * @description: 分组配置数组
   * ? @computed 从布局配置中提取分组信息
   * ! @return {GroupConfig[]} 分组配置数组
   */
  const groups = computed((): GroupConfig[] => {
    return props.layoutConfig?.card?.groups || []
  })

  /**
   * * @description: 是否有分组配置
   * ? @computed 判断是否配置了分组
   * ! @return {boolean} 是否有分组配置
   */
  const hasGroups = computed((): boolean => {
    return groups.value.length > 0
  })

  /**
   * * @description: 布局方向
   * ? @computed 获取当前布局方向
   * ! @return {string} 布局方向
   */
  const layoutDirection = computed((): string => {
    return currentDirection.value
  })

  /**
   * * @description: 布局CSS类
   * ? @computed 根据配置生成布局类名
   * ! @return {string} CSS类名
   */
  const layoutClass = computed((): string => {
    if (!hasGroups.value) return 'layout-single'
    return `layout-${layoutDirection.value}`
  })

  /**
   * * @description: 包含表单项的分组数据
   * ? @computed 将表单项按分组归类，只返回有内容的分组
   * ! @return {GroupWithItems[]} 分组数据数组
   */
  const groupsWithItems = computed((): GroupWithItems[] => {
    if (!hasGroups.value) return []

    const groupMap = new Map<string, VNode[]>()

    // 初始化分组映射
    groups.value.forEach(group => {
      groupMap.set(group.key, [])
    })

    // 将表单项分配到对应分组
    props.formItems.forEach((item, index) => {
      const option = props.options?.[index]
      const groupKey =
        option?.layout?.group || groups.value[0]?.key || 'default'

      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, [])
      }
      groupMap.get(groupKey)!.push(item)
    })

    // 只返回有表单项的分组
    return groups.value
      .map(groupConfig => ({
        config: groupConfig,
        items: groupMap.get(groupConfig.key) || [],
      }))
      .filter(group => group.items.length > 0)
  })

  // ================= 方法 =================

  /**
   * * @description: 切换布局方向
   * ? @method 用户点击按钮时切换布局
   * ! @param {'vertical' | 'horizontal'} direction 目标布局方向
   */
  const toggleLayout = (direction: 'vertical' | 'horizontal'): void => {
    currentDirection.value = direction
  }

  // ================= 生命周期 =================

  /**
   * * @description: 组件挂载时初始化
   * ? @lifecycle 根据配置设置初始布局方向
   */
  onMounted(() => {
    // 从配置中获取初始布局方向
    const configDirection = props.layoutConfig?.card?.direction
    if (configDirection) {
      currentDirection.value = configDirection
    }
  })
</script>

<style scoped>
  /* ================= 基础容器 ================= */
  .c-form-card {
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  /* ================= 布局切换按钮 ================= */
  .layout-toggle {
    display: flex;
    justify-content: center;
    margin-bottom: 24px;
    padding: 8px;
    flex-shrink: 0; /* 防止按钮区域被压缩 */
  }

  /* ================= 表单内容区域 ================= */
  .form-content {
    flex: 1;
  }

  /* ================= 单卡片布局 ================= */
  .layout-single .form-content {
    display: flex;
    flex-direction: column;
  }

  /* ================= 垂直布局（默认） ================= */
  .layout-vertical .form-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  /* ================= 水平布局 - 核心优化 ================= */
  .layout-horizontal .form-content {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 24px;
  }

  /* 水平布局中的卡片 - 平分宽度 */
  .layout-horizontal .card-item {
    flex: 1;
    min-width: 0; /* 允许弹性收缩 */
  }

  /* 2个卡片时 */
  .layout-horizontal:has(.card-item:nth-child(2):last-child) .card-item {
    flex-basis: calc(50% - 12px); /* 50% 减去一半的gap */
  }

  /* 3个卡片时 */
  .layout-horizontal:has(.card-item:nth-child(3):last-child) .card-item {
    flex-basis: calc(33.333% - 16px); /* 33.33% 减去gap的比例 */
  }

  /* 4个卡片时 */
  .layout-horizontal:has(.card-item:nth-child(4):last-child) .card-item {
    flex-basis: calc(25% - 18px); /* 25% 减去gap的比例 */
  }

  /* ================= 卡片基础样式 ================= */
  .single-card,
  .card-item {
    margin-bottom: 0;
    border-radius: 8px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  /* ================= 悬浮效果 ================= */
  .single-card:hover,
  .card-item:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  /* ================= 分组描述样式 ================= */
  .card-description {
    margin: 0 0 16px 0;
    color: var(--text-color-2);
    font-size: 14px;
    line-height: 1.5;
  }

  /* ================= 响应式设计 ================= */

  /* 中等屏幕 - 3个及以上卡片改为2列 */
  @media (max-width: 1200px) {
    .layout-horizontal .form-content {
      gap: 20px;
    }

    .layout-horizontal:has(.card-item:nth-child(3)) .card-item {
      flex-basis: calc(50% - 10px);
    }

    /* 奇数个卡片时，最后一个占满宽度 */
    .layout-horizontal:has(.card-item:nth-child(3):last-child)
      .card-item:last-child,
    .layout-horizontal:has(.card-item:nth-child(5):last-child)
      .card-item:last-child {
      flex-basis: 100%;
    }
  }

  /* 小屏幕 - 改为垂直布局 */
  @media (max-width: 768px) {
    .layout-horizontal .form-content {
      flex-direction: column;
      gap: 16px;
    }

    .layout-horizontal .card-item {
      flex-basis: auto;
    }

    .layout-toggle {
      margin-bottom: 16px;
      padding: 4px;
    }

    .single-card:hover,
    .card-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }

  /* 超小屏幕 - 隐藏布局切换按钮 */
  @media (max-width: 480px) {
    .layout-toggle {
      display: none;
    }
  }
</style>
