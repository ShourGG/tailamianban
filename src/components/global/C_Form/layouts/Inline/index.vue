<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-31 09:51:23
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-31 13:01:12
 * @FilePath: \Robot_Admin\src\components\global\C_Form\layouts\Inline\index.vue
 * @Description: 内联布局组件 - 水平排列的表单布局
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div
    class="c-form-inline"
    :style="containerStyle"
  >
    <div
      v-for="(item, index) in formItems"
      :key="getItemKey(item, index)"
      class="c-form-inline-item"
      :style="getItemStyle(index)"
    >
      <component :is="item" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { VNode, CSSProperties } from 'vue'

  // ================= 类型定义 =================

  /**
   * 内联布局配置接口
   */
  interface InlineLayoutConfig {
    gap?: number // 项目间距，默认16px
    align?: 'start' | 'center' | 'end' // 垂直对齐方式，默认center
  }

  /**
   * 表单项布局配置接口
   */
  interface FormItemLayoutConfig {
    width?: string | number // 项目宽度
    span?: number // 网格占用列数（内联布局中不使用，但保持接口一致性）
    offset?: number // 网格偏移列数（内联布局中不使用）
    group?: string // 分组标识（内联布局中不使用）
    class?: string // 自定义CSS类名
    style?: CSSProperties // 自定义内联样式
  }

  /**
   * 表单选项接口
   */
  interface FormOption {
    type: string
    prop: string
    label?: string
    layout?: FormItemLayoutConfig
    [key: string]: any // 允许其他属性
  }

  /**
   * 布局配置接口
   */
  interface LayoutConfig {
    type?: string
    inline?: InlineLayoutConfig
    [key: string]: any // 允许其他布局类型的配置
  }

  /**
   * 组件属性接口
   */
  interface Props {
    formItems: VNode[] // 表单项VNode数组
    layoutConfig?: LayoutConfig // 布局配置
    options?: FormOption[] // 表单选项配置数组
  }

  // ================= 组件属性 =================

  const props = withDefaults(defineProps<Props>(), {
    layoutConfig: () => ({}),
    options: () => [],
  })

  // ================= 计算属性 =================

  /**
   * 获取项目间距
   */
  const gap = computed((): number => {
    return props.layoutConfig?.inline?.gap ?? 16
  })

  /**
   * 获取垂直对齐方式
   */
  const align = computed((): 'start' | 'center' | 'end' => {
    return props.layoutConfig?.inline?.align ?? 'center'
  })

  /**
   * 容器样式
   */
  const containerStyle = computed((): CSSProperties => {
    const gapValue = gap.value

    return {
      display: 'flex',
      alignItems: align.value,
      flexWrap: 'wrap',
      gap: `${gapValue}px`, // 使用现代CSS gap属性，更简洁
      width: '100%',
    }
  })

  // ================= 方法 =================

  /**
   * 获取表单项的唯一key
   * @param item VNode实例
   * @param index 索引
   * @returns 唯一标识符
   */
  const getItemKey = (item: VNode, index: number): string => {
    // 优先使用VNode的key，其次使用props中的prop，最后使用索引
    if (item.key != null) {
      return String(item.key)
    }

    const itemProps = item.props as any
    if (itemProps?.path) {
      return itemProps.path
    }

    return `form-item-${index}`
  }

  /**
   * 获取表单项样式
   * @param index 表单项索引
   * @returns CSS样式对象
   */
  const getItemStyle = (index: number): CSSProperties => {
    const option = props.options?.[index]
    const layoutConfig = option?.layout

    if (!layoutConfig) {
      return {
        display: 'inline-block',
        verticalAlign: 'top',
      }
    }

    const baseStyle: CSSProperties = {
      display: 'inline-block',
      verticalAlign: 'top',
    }

    // 处理宽度设置
    if (layoutConfig.width !== undefined) {
      baseStyle.width =
        typeof layoutConfig.width === 'number'
          ? `${layoutConfig.width}px`
          : layoutConfig.width
    }

    // 合并自定义样式
    if (layoutConfig.style) {
      Object.assign(baseStyle, layoutConfig.style)
    }

    return baseStyle
  }
</script>

<style scoped>
  .c-form-inline {
    width: 100%;
    min-height: 0; /* 防止flex容器在某些情况下的最小高度问题 */
  }

  .c-form-inline-item {
    /* 基础项目样式 */
    flex-shrink: 0; /* 防止项目被压缩 */
    min-width: 0; /* 允许项目缩小到内容宽度以下 */
  }

  /* ================= 响应式设计 ================= */

  /* 平板设备 */
  @media (max-width: 1024px) {
    .c-form-inline-item {
      min-width: 200px; /* 确保在平板上有合理的最小宽度 */
    }
  }

  /* 移动设备 */
  @media (max-width: 768px) {
    .c-form-inline {
      flex-direction: column !important;
      gap: 12px !important; /* 移动端使用更小的间距 */
    }

    .c-form-inline-item {
      width: 100% !important;
      min-width: auto !important;
      max-width: none !important;
    }
  }

  /* 小屏手机 */
  @media (max-width: 480px) {
    .c-form-inline {
      gap: 8px !important; /* 更小的间距 */
    }
  }

  /* ================= 辅助功能 ================= */

  /* 减少动画的用户偏好 */
  @media (prefers-reduced-motion: reduce) {
    .c-form-inline,
    .c-form-inline-item {
      transition: none !important;
    }
  }

  /* 高对比度模式支持 */
  @media (prefers-contrast: high) {
    .c-form-inline-item {
      border: 1px solid currentColor;
      padding: 4px;
    }
  }
</style>
