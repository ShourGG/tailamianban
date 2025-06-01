<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-31 09:51:23
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-02 01:29:26
 * @FilePath: \Robot_Admin\src\components\global\C_Form\layouts\Inline\index.vue
 * @Description: 内联布局组件 - 统一宽度的水平表单布局
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
  import type {
    LayoutProps,
    FormOption,
    ItemLayoutConfig,
  } from '@/types/modules/form'

  // ================= 组件属性 =================

  const props = withDefaults(defineProps<LayoutProps>(), {
    layoutConfig: () => ({}),
    options: () => [],
  })

  // ================= 计算属性 =================

  /**
   * * @description 获取统一项目宽度
   * ? @function itemWidth 固定240px宽度，保证所有表单项统一视觉效果
   * ! @return 项目宽度数值240
   */
  const itemWidth = computed((): number => 280)

  /**
   * * @description 获取项目间距
   * ? @function gap 从内联布局配置中获取水平间距
   * ! @return 间距数值，默认16px
   */
  const gap = computed((): number => {
    return props.layoutConfig?.inline?.gap ?? 16
  })

  /**
   * * @description 获取行间距
   * ? @function rowGap 固定16px行间距
   * ! @return 行间距数值16
   */
  const rowGap = computed((): number => 16)

  /**
   * * @description 获取垂直对齐方式
   * ? @function align 从内联布局配置中获取对齐方式
   * ! @return 对齐方式字符串，默认'center'
   */
  const align = computed((): 'start' | 'center' | 'end' => {
    const alignValue = props.layoutConfig?.inline?.align
    return alignValue === 'start' ||
      alignValue === 'end' ||
      alignValue === 'baseline' ||
      alignValue === 'stretch'
      ? alignValue === 'baseline' || alignValue === 'stretch'
        ? 'center'
        : alignValue
      : 'center'
  })

  /**
   * * @description 容器样式计算
   * ? @function containerStyle 根据配置生成flex容器的CSS样式
   * ! @return CSSProperties对象，包含display、flexWrap、alignItems、gap、width属性
   */
  const containerStyle = computed((): CSSProperties => {
    return {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems:
        align.value === 'start'
          ? 'flex-start'
          : align.value === 'end'
            ? 'flex-end'
            : 'center',
      gap: `${rowGap.value}px ${gap.value}px`,
      width: '100%',
    }
  })

  // ================= 方法 =================

  /**
   * * @description 获取表单项的唯一key
   * ? @function getItemKey 为每个表单项生成唯一标识符，用于Vue的列表渲染
   * ? @param item VNode实例
   * ? @param index 表单项在数组中的索引
   * ! @return 唯一标识符字符串
   */
  const getItemKey = (item: VNode, index: number): string => {
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
   * * @description 获取表单项样式
   * ? @function getItemStyle 根据表单项配置和全局配置生成单个表单项的CSS样式
   * ? @param index 表单项在数组中的索引
   * ! @return CSSProperties对象，包含宽度、布局、显示等样式属性
   */
  const getItemStyle = (index: number): CSSProperties => {
    const option: FormOption | undefined = props.options?.[index]
    const layoutConfig: ItemLayoutConfig | undefined = option?.layout

    // 基础样式，统一宽度
    const baseStyle: CSSProperties = {
      width: `${itemWidth.value}px`,
      flexShrink: 0, // 防止被压缩
      display: 'flex',
      flexDirection: 'column',
    }

    // 如果单独设置了宽度，则覆盖统一宽度
    if (layoutConfig?.width !== undefined) {
      baseStyle.width =
        typeof layoutConfig.width === 'number'
          ? `${layoutConfig.width}px`
          : layoutConfig.width
    }

    // 合并自定义样式
    if (layoutConfig?.style) {
      Object.assign(baseStyle, layoutConfig.style)
    }

    return baseStyle
  }
</script>

<style scoped>
  .c-form-inline {
    width: 100%;
    min-height: 0;
  }

  .c-form-inline-item {
    min-width: 0;
  }

  /* 确保内部所有表单组件都占满容器宽度 */
  .c-form-inline-item :deep(.n-form-item) {
    width: 100%;
    margin-bottom: 0;
  }

  .c-form-inline-item :deep(.n-form-item-blank) {
    width: 100%;
  }

  .c-form-inline-item :deep(.n-input),
  .c-form-inline-item :deep(.n-select),
  .c-form-inline-item :deep(.n-date-picker),
  .c-form-inline-item :deep(.n-time-picker),
  .c-form-inline-item :deep(.n-input-number),
  .c-form-inline-item :deep(.n-cascader),
  .c-form-inline-item :deep(.n-color-picker),
  .c-form-inline-item :deep(.n-auto-complete),
  .c-form-inline-item :deep(.n-tree-select) {
    width: 100% !important;
  }

  /* 单选框和复选框组保持自然宽度 */
  .c-form-inline-item :deep(.n-radio-group),
  .c-form-inline-item :deep(.n-checkbox-group) {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  /* 开关组件居左对齐 */
  .c-form-inline-item :deep(.n-switch) {
    width: auto;
  }

  /* ================= 响应式设计 ================= */

  /* 移动设备 - 改为垂直布局 */
  @media (max-width: 768px) {
    .c-form-inline {
      flex-direction: column !important;
      gap: 12px !important;
    }

    .c-form-inline-item {
      width: 100% !important;
    }
  }

  /* 小屏手机 */
  @media (max-width: 480px) {
    .c-form-inline {
      gap: 8px !important;
    }
  }
</style>
