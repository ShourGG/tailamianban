<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-31 09:51:46
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-31 13:07:37
 * @FilePath: \Robot_Admin\src\components\global\C_Form\layouts\Grid\index.vue
 * @Description: 网格布局组件 - 使用 NGrid 和 NGridItem 实现响应式网格布局
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <NGrid
    :cols="cols"
    :x-gap="gutter"
    :y-gap="gutter"
    class="c-form-grid"
  >
    <NGridItem
      v-for="(item, index) in formItems"
      :key="getItemKey(item, index)"
      :span="getSpan(index)"
      :offset="getOffset(index)"
    >
      <component :is="item" />
    </NGridItem>
  </NGrid>
</template>

<script setup lang="ts">
  import type { VNode } from 'vue'

  // ================= 类型定义 =================

  /**
   * 网格布局配置接口
   */
  interface GridLayoutConfig {
    cols?: number // 网格总列数，默认24
    gutter?: number // 网格间距，默认16px
  }

  /**
   * 网格项布局配置接口
   */
  interface GridItemLayoutConfig {
    span?: number // 占用列数，默认12
    offset?: number // 偏移列数，默认0
  }

  /**
   * 表单选项接口
   */
  interface FormOption {
    type: string
    prop: string
    label?: string
    layout?: GridItemLayoutConfig
    [key: string]: any // 允许其他属性
  }

  /**
   * 布局配置接口
   */
  interface LayoutConfig {
    type?: string
    grid?: GridLayoutConfig
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
   * 网格总列数
   */
  const cols = computed((): number => {
    return props.layoutConfig?.grid?.cols ?? 24
  })

  /**
   * 网格间距
   */
  const gutter = computed((): number => {
    return props.layoutConfig?.grid?.gutter ?? 16
  })

  // ================= 方法 =================

  /**
   * 获取表单项的唯一key（解决类型错误的核心方法）
   * @param item VNode实例
   * @param index 索引
   * @returns 字符串类型的唯一标识符
   */
  const getItemKey = (item: VNode, index: number): string => {
    // 处理VNode.key的类型安全转换
    if (item.key != null) {
      // 将 PropertyKey | null 安全转换为 string
      return String(item.key)
    }

    // 尝试从props中获取唯一标识
    const itemProps = item.props as any
    if (itemProps?.path) {
      return itemProps.path
    }

    // 最后使用索引作为fallback
    return `grid-item-${index}`
  }

  /**
   * 获取网格项占用的列数
   * @param index 表单项索引
   * @returns 占用列数
   */
  const getSpan = (index: number): number => {
    const option = props.options?.[index]
    const span = option?.layout?.span

    // 验证span值的有效性
    if (typeof span === 'number' && span > 0 && span <= cols.value) {
      return span
    }

    // 默认占用12列（24列网格的一半）
    return Math.min(12, cols.value)
  }

  /**
   * 获取网格项的偏移列数
   * @param index 表单项索引
   * @returns 偏移列数
   */
  const getOffset = (index: number): number => {
    const option = props.options?.[index]
    const offset = option?.layout?.offset

    // 验证offset值的有效性
    if (typeof offset === 'number' && offset >= 0 && offset < cols.value) {
      return offset
    }

    return 0
  }

  // ================= 开发环境验证 =================

  if (import.meta.env.DEV) {
    // 验证配置项数量是否匹配
    watchEffect(() => {
      if (props.options && props.options.length !== props.formItems.length) {
        console.warn(
          `[C_Form Grid Layout] 配置项数量(${props.options.length})与表单项数量(${props.formItems.length})不匹配`
        )
      }
    })
  }
</script>

<style scoped>
  .c-form-grid {
    width: 100%;
  }

  /* 移动端优化 */
  @media (max-width: 768px) {
    .c-form-grid :deep(.n-grid-item) {
      margin-bottom: 8px;
    }
  }
</style>
