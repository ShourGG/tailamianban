<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-31 22:33:33
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-04 22:56:46
 * @FilePath: \Robot_Admin\src\components\global\C_Form\layouts\Dynamic\index.vue
 * @Description: 表单组件 - 动态布局
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎. 
-->

<template>
  <div class="c-form-dynamic">
    <!-- 动态控制面板 -->
    <div
      v-if="showControls"
      class="dynamic-controls"
    >
      <NCard
        size="small"
        title="动态表单控制"
        :bordered="false"
      >
        <template #header-extra>
          <NBadge
            :value="visibleItemsCount"
            type="success"
          >
            <div class="i-carbon-view text-16px"></div>
          </NBadge>
        </template>

        <NSpace>
          <NButton
            size="small"
            type="primary"
            @click="handleAddField"
          >
            <template #icon>
              <div class="i-mdi:tooltip-add-outline text-14px"></div>
            </template>
            添加字段
          </NButton>

          <NButton
            size="small"
            type="warning"
            :disabled="dynamicFields.length === 0"
            @click="handleRemoveField"
          >
            <template #icon>
              <div class="i-mdi:invoice-text-remove-outline text-14px"></div>
            </template>
            移除字段
          </NButton>

          <NButton
            size="small"
            type="info"
            @click="handleToggleAllVisibility"
          >
            <template #icon>
              <div class="i-mdi:database-view-off-outline text-14px"></div>
            </template>
            {{ allVisible ? '隐藏部分' : '显示全部' }}
          </NButton>

          <NButton
            size="small"
            type="error"
            @click="handleClearAllDynamic"
          >
            <template #icon>
              <div class="i-mdi:vacuum-cleaner text-14px"></div>
            </template>
            清空动态
          </NButton>
        </NSpace>
      </NCard>
    </div>

    <!-- 表单项渲染区域 -->
    <div class="dynamic-form-items">
      <NGrid
        :cols="gridCols"
        :x-gap="gridGutter"
        :y-gap="gridGutter"
      >
        <NGridItem
          v-for="(item, index) in visibleFormItems"
          :key="getItemKey(item, index)"
          :span="getItemSpan(index)"
        >
          <div
            class="dynamic-item-wrapper"
            :class="getDynamicItemClass(item, index)"
          >
            <!-- 字段操作工具栏 -->
            <div
              v-if="isDynamicField(item) && showItemControls"
              class="dynamic-item-toolbar"
            >
              <NSpace size="small">
                <NTag
                  size="small"
                  :type="getFieldTypeTag(item)"
                >
                  {{ getFieldTypeLabel(item) }}
                </NTag>

                <NButton
                  size="tiny"
                  quaternary
                  @click="handleToggleFieldVisibility(item, index)"
                >
                  <template #icon>
                    <div
                      :class="
                        isFieldVisible(item)
                          ? 'i-carbon-view text-12px'
                          : 'i-carbon-view-off text-12px'
                      "
                    ></div>
                  </template>
                </NButton>

                <NButton
                  size="tiny"
                  quaternary
                  type="error"
                  @click="handleRemoveSpecificField(item, index)"
                >
                  <template #icon>
                    <div class="i-carbon-close text-12px"></div>
                  </template>
                </NButton>
              </NSpace>
            </div>

            <!-- 实际的表单项 -->
            <component :is="item" />
          </div>
        </NGridItem>
      </NGrid>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { VNode } from 'vue'
  import type {
    DynamicFieldConfig,
    LayoutConfig,
    FormOption,
    ComponentType,
  } from '@/types/modules/form'

  // ================= 局部类型定义 =================

  /**
   * * @description 组件属性接口
   * ! @interface Props
   */
  interface Props {
    /** 表单项VNode数组 */
    formItems: VNode[]
    /** 布局配置 */
    layoutConfig?: LayoutConfig
    /** 表单选项配置 */
    options?: FormOption[]
  }

  /**
   * * @description NBadge组件支持的类型
   * ! @type BadgeType
   */
  type BadgeType = 'default' | 'info' | 'success' | 'warning' | 'error'

  // ================= 组件属性和事件 =================

  const props = withDefaults(defineProps<Props>(), {
    layoutConfig: () => ({}),
    options: () => [],
  })

  const emit = defineEmits<{
    'field-add': [fieldConfig: DynamicFieldConfig]
    'field-remove': [fieldId: string]
    'field-toggle': [fieldId: string, visible: boolean]
    'fields-clear': []
  }>()

  // ================= 响应式状态 =================

  const dynamicFields = ref<DynamicFieldConfig[]>([])
  const hiddenFieldIds = ref<Set<string>>(new Set())
  const fieldIdCounter = ref<number>(0)

  // ================= 计算属性 =================

  /**
   * * @description 获取网格列数
   * ! @return 网格列数
   */
  const gridCols = computed((): number => {
    return props.layoutConfig?.dynamic?.grid?.cols ?? 24
  })

  /**
   * * @description 获取网格间距
   * ! @return 网格间距
   */
  const gridGutter = computed((): number => {
    return props.layoutConfig?.dynamic?.grid?.gutter ?? 16
  })

  /**
   * * @description 是否显示控制面板
   * ! @return 布尔值
   */
  const showControls = computed((): boolean => {
    return props.layoutConfig?.dynamic?.controls?.showControls !== false
  })

  /**
   * * @description 是否显示字段控制
   * ! @return 布尔值
   */
  const showItemControls = computed((): boolean => {
    return props.layoutConfig?.dynamic?.controls?.showItemControls !== false
  })

  /**
   * * @description 获取最大字段数量
   * ! @return 最大字段数量
   */
  const maxFields = computed((): number => {
    return props.layoutConfig?.dynamic?.dynamic?.maxFields ?? 50
  })

  /**
   * * @description 获取可见的表单项
   * ! @return 可见表单项数组
   */
  const visibleFormItems = computed((): VNode[] => {
    return props.formItems.filter((item, index) => {
      const option = props.options?.[index]
      const fieldId = getFieldId(item, index)

      // 检查字段是否被隐藏
      if (hiddenFieldIds.value.has(fieldId)) {
        return false
      }

      // 检查字段本身的显示设置
      return option?.show !== false
    })
  })

  /**
   * * @description 获取总字段数量
   * ! @return 总字段数量
   */
  const totalFieldsCount = computed((): number => {
    return props.formItems.length
  })

  /**
   * * @description 获取可见字段数量
   * ! @return 可见字段数量
   */
  const visibleItemsCount = computed((): number => {
    return visibleFormItems.value.length
  })

  /**
   * * @description 获取隐藏字段数量
   * ! @return 隐藏字段数量
   */
  const hiddenItemsCount = computed((): number => {
    return totalFieldsCount.value - visibleItemsCount.value
  })

  /**
   * * @description 是否所有字段都可见
   * ! @return 布尔值
   */
  const allVisible = computed((): boolean => {
    return hiddenItemsCount.value === 0
  })

  // ================= 工具方法 =================

  /**
   * * @description 获取表单项的唯一key
   * ? @param item VNode对象
   * ? @param index 索引值
   * ! @return 唯一key字符串
   */
  const getItemKey = (item: VNode, index: number): string => {
    if (item.key != null) {
      return String(item.key)
    }

    const itemProps = item.props as Record<string, any> | null
    if (itemProps?.path) {
      return itemProps.path
    }

    return `dynamic-item-${index}`
  }

  /**
   * * @description 获取字段ID
   * ? @param item VNode对象
   * ? @param index 索引值
   * ! @return 字段ID
   */
  const getFieldId = (item: VNode, index: number): string => {
    const option = props.options?.[index]
    return option?.prop || getItemKey(item, index)
  }

  /**
   * * @description 获取表单项占用的列数
   * ? @param index 索引值
   * ! @return 占用列数
   */
  const getItemSpan = (index: number): number => {
    const option = props.options?.[index]
    const span = option?.layout?.span

    if (typeof span === 'number' && span > 0 && span <= gridCols.value) {
      return span
    }

    // 默认占用12列（24列网格的一半）
    return Math.min(12, gridCols.value)
  }

  /**
   * * @description 判断是否为动态字段
   * ? @param item VNode对象
   * ! @return 是否为动态字段
   */
  const isDynamicField = (item: VNode): boolean => {
    const itemProps = item.props as Record<string, any> | null
    const fieldId = itemProps?.path || String(item.key || '')
    return dynamicFields.value.some(field => field.prop === fieldId)
  }

  /**
   * * @description 检查字段是否可见
   * ? @param item VNode对象
   * ! @return 是否可见
   */
  const isFieldVisible = (item: VNode): boolean => {
    const itemProps = item.props as Record<string, any> | null
    const fieldId = itemProps?.path || String(item.key || '')
    return !hiddenFieldIds.value.has(fieldId)
  }

  /**
   * * @description 获取动态项样式类
   * ? @param item VNode对象
   * ? @param index 索引值
   * ! @return 样式类数组
   */
  const getDynamicItemClass = (item: VNode, index: number): string[] => {
    console.log('index=>', index)
    const classes: string[] = []

    if (isDynamicField(item)) {
      classes.push('is-dynamic-field')
    }

    if (!isFieldVisible(item)) {
      classes.push('is-hidden-field')
    }

    return classes
  }

  /**
   * * @description 获取字段类型标签样式
   * ? @param item VNode对象
   * ! @return 标签类型
   */
  const getFieldTypeTag = (item: VNode): BadgeType => {
    const option = props.options?.find(opt => {
      const itemProps = item.props as Record<string, any> | null
      return opt.prop === itemProps?.path
    })

    const typeMap: Record<string, BadgeType> = {
      input: 'default',
      select: 'info',
      switch: 'success',
      rate: 'warning',
      datePicker: 'error',
      textarea: 'default',
    }

    return typeMap[option?.type || 'input'] || 'default'
  }

  /**
   * * @description 获取字段类型标签文本
   * ? @param item VNode对象
   * ! @return 类型标签文本
   */
  const getFieldTypeLabel = (item: VNode): string => {
    const option = props.options?.find(opt => {
      const itemProps = item.props as Record<string, any> | null
      return opt.prop === itemProps?.path
    })

    const labelMap: Record<ComponentType, string> = {
      input: '输入框',
      textarea: '文本域',
      inputNumber: '数字',
      select: '选择器',
      checkbox: '多选框',
      radio: '单选框',
      switch: '开关',
      slider: '滑块',
      rate: '评分',
      datePicker: '日期',
      daterange: '日期范围',
      timePicker: '时间',
      cascader: '级联选择',
      colorPicker: '颜色',
      upload: '上传',
      editor: '编辑器',
    }

    return labelMap[option?.type as ComponentType] || '未知'
  }

  // ================= 事件处理方法 =================

  /**
   * * @description 添加动态字段
   */
  const handleAddField = (): void => {
    if (dynamicFields.value.length >= maxFields.value) {
      console.warn(
        `[Dynamic Layout] 已达到最大字段数量限制: ${maxFields.value}`
      )
      return
    }

    fieldIdCounter.value++
    const fieldConfig: DynamicFieldConfig = {
      id: `dynamic_field_${fieldIdCounter.value}`,
      type: 'input' as ComponentType,
      prop: `dynamic_${fieldIdCounter.value}`,
      label: `动态字段 ${fieldIdCounter.value}`,
      visible: true,
      removable: true,
      created: Date.now(),
    }

    dynamicFields.value.push(fieldConfig)
    emit('field-add', fieldConfig)
  }

  /**
   * * @description 移除最后一个动态字段
   */
  const handleRemoveField = (): void => {
    if (dynamicFields.value.length === 0) {
      console.warn('[Dynamic Layout] 没有可移除的动态字段')
      return
    }

    const removedField = dynamicFields.value.pop()
    if (removedField) {
      hiddenFieldIds.value.delete(removedField.prop)
      emit('field-remove', removedField.id)
    }
  }

  /**
   * * @description 移除特定字段
   * ? @param item VNode对象
   * ? @param index 索引值
   */
  const handleRemoveSpecificField = (item: VNode, index: number): void => {
    const fieldId = getFieldId(item, index)
    const fieldIndex = dynamicFields.value.findIndex(
      field => field.prop === fieldId
    )

    if (fieldIndex !== -1) {
      const removedField = dynamicFields.value.splice(fieldIndex, 1)[0]
      hiddenFieldIds.value.delete(fieldId)
      emit('field-remove', removedField.id)
    }
  }

  /**
   * * @description 切换字段显示状态
   * ? @param item VNode对象
   * ? @param index 索引值
   */
  const handleToggleFieldVisibility = (item: VNode, index: number): void => {
    const fieldId = getFieldId(item, index)

    if (hiddenFieldIds.value.has(fieldId)) {
      hiddenFieldIds.value.delete(fieldId)
      emit('field-toggle', fieldId, true)
    } else {
      hiddenFieldIds.value.add(fieldId)
      emit('field-toggle', fieldId, false)
    }
  }

  /**
   * * @description 切换所有字段显示状态
   */
  const handleToggleAllVisibility = (): void => {
    if (allVisible.value) {
      // 隐藏部分动态字段
      dynamicFields.value
        .slice(0, Math.ceil(dynamicFields.value.length / 2))
        .forEach(field => {
          hiddenFieldIds.value.add(field.prop)
          emit('field-toggle', field.id, false)
        })
    } else {
      // 显示所有字段
      hiddenFieldIds.value.clear()
      dynamicFields.value.forEach(field => {
        emit('field-toggle', field.id, true)
      })
    }
  }

  /**
   * * @description 清空所有动态字段
   */
  const handleClearAllDynamic = (): void => {
    dynamicFields.value.forEach(field => {
      hiddenFieldIds.value.delete(field.prop)
    })
    dynamicFields.value = []
    emit('fields-clear')
  }

  // ================= 对外暴露方法 =================

  defineExpose({
    addField: handleAddField,
    removeField: handleRemoveField,
    toggleAllVisibility: handleToggleAllVisibility,
    clearAllDynamic: handleClearAllDynamic,
    dynamicFields: readonly(dynamicFields),
    hiddenFieldIds: readonly(hiddenFieldIds),
  })

  // ================= 开发环境验证 =================

  if (import.meta.env.DEV) {
    watchEffect(() => {
      if (props.options && props.options.length !== props.formItems.length) {
        console.warn(
          `[C_Form Dynamic Layout] 配置项数量(${props.options.length})与表单项数量(${props.formItems.length})不匹配`
        )
      }
    })
  }
</script>

<style scoped>
  .c-form-dynamic {
    width: 100%;
  }

  .dynamic-controls {
    margin-bottom: 16px;
  }

  .dynamic-form-items {
    width: 100%;
  }

  .dynamic-stats {
    margin-top: 16px;
  }

  .dynamic-item-wrapper {
    position: relative;
    transition: all 0.3s ease;
  }

  .dynamic-item-wrapper.is-dynamic-field {
    border: 1px dashed var(--color-primary);
    border-radius: 6px;
    padding: 8px;
    background-color: var(--color-primary-suppl);
  }

  .dynamic-item-wrapper.is-hidden-field {
    opacity: 0.5;
    filter: grayscale(0.3);
  }

  .dynamic-item-toolbar {
    position: absolute;
    top: -8px;
    right: -8px;
    z-index: 10;
    background: var(--color-base-color);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    padding: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  /* ================= 响应式设计 ================= */

  @media (max-width: 768px) {
    .dynamic-controls {
      margin-bottom: 12px;
    }

    .dynamic-stats {
      margin-top: 12px;
    }

    .dynamic-item-toolbar {
      position: static;
      margin-bottom: 8px;
      border-radius: 2px;
    }

    .dynamic-item-wrapper.is-dynamic-field {
      padding: 6px;
    }
  }

  /* ================= 动画效果 ================= */

  .dynamic-item-wrapper {
    animation: fadeInUp 0.3s ease-out;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* ================= 辅助功能 ================= */

  @media (prefers-reduced-motion: reduce) {
    .dynamic-item-wrapper {
      animation: none !important;
      transition: none !important;
    }
  }

  @media (prefers-contrast: high) {
    .dynamic-item-wrapper.is-dynamic-field {
      border-width: 2px;
      border-color: currentColor;
    }
  }
</style>
