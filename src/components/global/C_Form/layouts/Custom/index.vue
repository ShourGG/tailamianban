<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-04 19:20:15
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-08 02:22:08
 * @FilePath: \Robot_Admin\src\components\global\C_Form\layouts\Custom\index.vue
 * @Description: 表单组件 - 自定义布局组件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎. 
-->

<template>
  <div class="custom-layout">
    <!-- 顶部工具栏 -->
    <NCard
      :bordered="false"
      class="toolbar-card"
    >
      <div class="toolbar-content">
        <!-- 左侧模式切换 -->
        <div class="mode-section">
          <span class="section-label">自定义模式:</span>
          <NButtonGroup>
            <NButton
              :type="isDesignMode ? 'primary' : 'default'"
              @click="toggleDesignMode"
              size="small"
            >
              🎨 {{ isDesignMode ? '设计中' : '设计模式' }}
            </NButton>
            <NButton
              :type="!isDesignMode ? 'primary' : 'default'"
              @click="isDesignMode = false"
              size="small"
            >
              📝 填写模式
            </NButton>
          </NButtonGroup>
        </div>

        <!-- 中间统计 -->
        <div class="stats-section">
          <div class="stat-item">
            <div class="stat-value">{{ customAreas.length }}</div>
            <div class="stat-label">自定义区域</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ overallProgress }}%</div>
            <div class="stat-label">完成度</div>
          </div>
          <div class="stat-item">
            <div class="stat-value"
              >{{ filledFieldsCount }}/{{ totalFieldsCount }}</div
            >
            <div class="stat-label">字段进度</div>
          </div>
        </div>

        <!-- 右侧操作 -->
        <div class="actions-section">
          <template v-if="isDesignMode">
            <NButton
              secondary
              @click="handleSaveLayout"
              size="small"
            >
              💾 保存布局
            </NButton>
            <NButton
              secondary
              @click="handleResetLayout"
              size="small"
            >
              🔄 重置布局
            </NButton>
          </template>
          <template v-else>
            <NButton
              secondary
              @click="handleExportData"
              size="small"
              v-if="hasFormFields"
            >
              📊 导出布局
            </NButton>
          </template>
        </div>
      </div>
    </NCard>

    <!-- 设计模式工具面板 -->
    <NCard
      v-if="isDesignMode"
      class="design-panel"
      title="🎨 设计工具"
    >
      <div class="design-tools">
        <div class="tool-group">
          <span class="group-label">添加区域:</span>
          <NButton
            @click="addArea('horizontal')"
            size="small"
            >➡️ 水平区域</NButton
          >
          <NButton
            @click="addArea('vertical')"
            size="small"
            >⬇️ 垂直区域</NButton
          >
          <NButton
            @click="addArea('grid')"
            size="small"
            >⚏ 网格区域</NButton
          >
        </div>

        <div class="tool-group">
          <span class="group-label">快速布局:</span>
          <NButton
            v-for="template in LAYOUT_TEMPLATES"
            :key="template.key"
            @click="applyTemplate(template.key)"
            size="small"
          >
            {{ template.icon }} {{ template.name }}
          </NButton>
        </div>
      </div>
    </NCard>

    <!-- 自定义布局画布 -->
    <div
      class="layout-canvas"
      :class="{ 'design-mode': isDesignMode }"
    >
      <!-- 设计模式 -->
      <template v-if="isDesignMode">
        <div
          class="canvas-hint"
          v-if="customAreas.length === 0"
        >
          <div class="hint-content">
            <h3>🎨 开始自定义你的布局</h3>
            <p>点击上方按钮添加区域，或选择快速布局模板</p>
          </div>
        </div>

        <draggable
          v-model="customAreas"
          group="areas"
          class="areas-container"
          :animation="200"
          ghost-class="area-ghost"
          item-key="id"
          v-else
        >
          <template #item="{ element: area, index }">
            <div
              class="custom-area"
              :class="`area-${area.type}`"
              :style="getAreaStyle(area)"
            >
              <div class="area-header">
                <div class="area-info">
                  <NInput
                    v-if="editingTitleId === area.id"
                    v-model:value="area.title"
                    size="small"
                    @blur="editingTitleId = ''"
                    @keyup.enter="editingTitleId = ''"
                    class="title-input"
                  />
                  <span
                    v-else
                    class="area-title"
                    @click="editingTitleId = area.id"
                  >
                    {{ area.title }}
                  </span>
                  <NTag size="small">{{ getAreaFieldCount(area) }} 字段</NTag>
                </div>
                <div class="area-controls">
                  <NButton
                    text
                    @click="editArea(area)"
                    size="tiny"
                    title="设置区域"
                  >
                    ⚙️
                  </NButton>
                  <NButton
                    text
                    @click="deleteArea(index)"
                    size="tiny"
                    type="error"
                    title="删除区域"
                  >
                    🗑️
                  </NButton>
                </div>
              </div>

              <draggable
                v-model="area.fields"
                group="fields"
                class="area-fields"
                :class="`fields-${area.type}`"
                :animation="200"
                ghost-class="field-ghost"
                item-key="prop"
              >
                <template #item="{ element: field }">
                  <div class="field-item">
                    <div class="field-preview">
                      <span class="field-label">{{
                        field.label || field.prop
                      }}</span>
                      <span class="field-type">{{
                        getFieldTypeName(field.type)
                      }}</span>
                    </div>
                  </div>
                </template>
              </draggable>

              <div
                class="area-drop-zone"
                v-if="area.fields.length === 0"
              >
                拖拽字段到这里
              </div>
            </div>
          </template>
        </draggable>

        <!-- 字段池 -->
        <NCard
          class="field-pool"
          title="📦 可用字段"
        >
          <draggable
            v-model="availableFields"
            group="fields"
            class="pool-fields"
            :animation="200"
            :clone="cloneField"
            item-key="prop"
          >
            <template #item="{ element: field }">
              <div class="pool-field">
                <span class="field-name">{{ field.label || field.prop }}</span>
                <span class="field-type-tag">{{
                  getFieldTypeName(field.type)
                }}</span>
              </div>
            </template>
          </draggable>
        </NCard>
      </template>

      <!-- 填写模式 -->
      <template v-else>
        <div
          v-if="customAreas.length === 0"
          class="empty-layout"
        >
          <NEmpty description="尚未设计布局">
            <template #extra>
              <NButton
                @click="isDesignMode = true"
                type="primary"
              >
                🎨 开始设计
              </NButton>
            </template>
          </NEmpty>
        </div>

        <div
          v-else
          class="form-container"
        >
          <div class="form-areas">
            <div
              v-for="area in customAreas"
              :key="area.id"
              class="form-area"
              :class="`area-${area.type}`"
              :style="getAreaStyle(area)"
            >
              <template v-if="area.fields.length > 0">
                <NCard
                  :title="area.title"
                  v-if="area.showTitle"
                >
                  <div
                    class="area-form-items"
                    :class="`layout-${getAreaLayoutType(area.type)}`"
                  >
                    <component
                      v-for="field in area.fields"
                      :key="field.prop"
                      :is="getFormItemForField(field)"
                    />
                  </div>
                </NCard>

                <div
                  v-else
                  class="area-form-items"
                  :class="`layout-${getAreaLayoutType(area.type)}`"
                >
                  <component
                    v-for="field in area.fields"
                    :key="field.prop"
                    :is="getFormItemForField(field)"
                  />
                </div>
              </template>

              <template v-else>
                <NCard
                  :title="area.title"
                  v-if="area.showTitle"
                >
                  <NEmpty
                    description="此区域暂无字段"
                    size="small"
                    class="area-empty"
                  >
                    <template #extra>
                      <NButton
                        @click="isDesignMode = true"
                        size="small"
                        secondary
                      >
                        🎨 添加字段
                      </NButton>
                    </template>
                  </NEmpty>
                </NCard>

                <div
                  v-else
                  class="empty-area-hint"
                >
                  <NAlert
                    type="info"
                    :show-icon="false"
                    class="area-hint-alert"
                  >
                    <template #default>
                      <span class="hint-text">{{ area.title }} - 暂无字段</span>
                    </template>
                  </NAlert>
                </div>
              </template>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- 区域编辑模态框 -->
    <NModal
      v-model:show="showAreaEditor"
      preset="card"
      title="⚙️ 编辑区域"
      style="width: 500px"
    >
      <NForm
        :model="editingArea"
        v-if="editingArea"
      >
        <NFormItem label="区域标题">
          <NInput
            v-model:value="editingArea.title"
            placeholder="输入区域标题"
          />
        </NFormItem>
        <NFormItem label="显示标题">
          <NSwitch v-model:value="editingArea.showTitle" />
        </NFormItem>
        <NFormItem label="区域类型">
          <NSelect
            v-model:value="editingArea.type"
            :options="AREA_TYPE_OPTIONS"
          />
        </NFormItem>
        <NFormItem
          label="宽度比例"
          v-if="editingArea.type === 'horizontal'"
        >
          <NSlider
            v-model:value="editingArea.width"
            :min="10"
            :max="100"
            :step="5"
          />
        </NFormItem>
        <NFormItem
          label="网格列数"
          v-if="editingArea.type === 'grid'"
        >
          <NInputNumber
            v-model:value="editingArea.columns"
            :min="1"
            :max="6"
          />
        </NFormItem>
      </NForm>

      <template #action>
        <NButton @click="showAreaEditor = false">取消</NButton>
        <NButton
          type="primary"
          @click="saveAreaEdit"
          >保存</NButton
        >
      </template>
    </NModal>
  </div>
</template>

<script setup lang="ts">
  import type { VNode } from 'vue'
  import type {
    LabelPlacement,
    LayoutProps,
    FormOption,
  } from '@/types/modules/form'
  import draggable from 'vuedraggable'
  import { useDebounceFn } from '@vueuse/core'
  import {
    type CustomArea,
    type AreaType,
    AREA_TYPE_OPTIONS,
    LAYOUT_TEMPLATES,
    getFieldTypeName,
    getAreaLayoutType,
    getAreaStyle,
    getAreaFieldCount,
    generateUniqueId,
    cloneField,
    createNewArea,
    applyLayoutTemplate,
    exportLayoutConfig,
  } from './data'

  interface FormItemProps {
    path?: string
    modelValue?: unknown
    label?: string
    [key: string]: unknown
  }

  interface Props extends LayoutProps {
    options?: FormOption[]
    labelPlacement?: LabelPlacement
    validateOnChange?: boolean
    showDefaultActions?: boolean
    formData?: Record<string, any>
  }

  interface FormOptionWithId extends FormOption {
    id?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    labelPlacement: 'left',
    validateOnChange: false,
    showDefaultActions: false,
    options: () => [],
    formData: () => ({}),
  })

  const emit = defineEmits<{
    'fields-change': [fields: FormOption[]]
    'export-data': [
      data: { layout: CustomArea[]; formData: Record<string, unknown> },
    ]
  }>()

  // 响应式状态
  const isDesignMode = ref(true)
  const customAreas = ref<CustomArea[]>([])
  const availableFields = ref<FormOptionWithId[]>([])
  const showAreaEditor = ref(false)
  const editingArea = ref<CustomArea | null>(null)
  const editingTitleId = ref('')

  // 工具函数
  const isValidFormValue = (value: unknown): boolean => {
    if (value === undefined || value === null || value === '') return false
    if (Array.isArray(value) && value.length === 0) return false
    return true
  }

  const getFormItemForField = (field: FormOption): VNode | null => {
    return (
      props.formItems?.find((item: VNode) => {
        const itemProps = item.props as FormItemProps | null
        return itemProps?.path === field.prop
      }) || null
    )
  }

  const debouncedNotifyFieldsChange = useDebounceFn(() => {
    const allFields = layoutFieldOptions.value
    emit('fields-change', allFields)
  }, 200)

  // 计算属性
  const allFormOptions = computed((): FormOption[] => {
    const { options, formItems } = props

    if (options && options.length > 0) {
      return options
    }

    if (formItems && formItems.length > 0) {
      const derivedOptions: FormOption[] = formItems
        .map((item: VNode) => {
          const itemProps = item.props as FormItemProps | null
          return {
            prop: itemProps?.path || '',
            label: itemProps?.label || itemProps?.path || '',
            type: 'input',
            show: true,
          } as FormOption
        })
        .filter(option => option.prop)

      return derivedOptions
    }

    return []
  })

  const totalFieldsCount = computed(() =>
    customAreas.value.reduce((total, area) => total + area.fields.length, 0)
  )

  const layoutFieldOptions = computed(() => {
    const layoutFields: FormOption[] = []
    customAreas.value.forEach(area => {
      area.fields.forEach(field => layoutFields.push(field))
    })
    return layoutFields
  })

  const filledFieldsCount = computed(() => {
    if (totalFieldsCount.value === 0) return 0

    const currentFormData = props.formData || {}
    let filledCount = 0
    layoutFieldOptions.value.forEach(field => {
      const value = currentFormData[field.prop]
      if (isValidFormValue(value)) {
        filledCount++
      }
    })

    return filledCount
  })

  const overallProgress = computed(() => {
    const total = totalFieldsCount.value
    const filled = filledFieldsCount.value
    return total > 0 ? Math.round((filled / total) * 100) : 0
  })

  const hasFormFields = computed(() => totalFieldsCount.value > 0)

  // 监听器
  watchEffect(() => {
    const fields = allFormOptions.value
    const usedFieldProps = new Set(
      customAreas.value.flatMap(area => area.fields.map(field => field.prop))
    )

    availableFields.value = fields
      .filter(field => !usedFieldProps.has(field.prop))
      .map((field: FormOption) => ({
        ...field,
        id: field.prop || generateUniqueId('field'),
      }))
  })

  watch(
    () => layoutFieldOptions.value,
    () => debouncedNotifyFieldsChange(),
    { deep: true, immediate: true }
  )

  // 布局操作函数
  const toggleDesignMode = (): void => {
    isDesignMode.value = !isDesignMode.value
    if (!isDesignMode.value) {
      nextTick(() => debouncedNotifyFieldsChange())
    }
  }

  const addArea = (type: AreaType): void => {
    const area = createNewArea(type, customAreas.value.length)
    customAreas.value.push(area)
  }

  const deleteArea = (index: number): void => {
    const [area] = customAreas.value.splice(index, 1)
    area.fields.forEach((field: FormOption) => {
      if (!availableFields.value.find(f => f.prop === field.prop)) {
        availableFields.value.push({
          ...field,
          id: field.prop || generateUniqueId('field'),
        })
      }
    })
  }

  const editArea = (area: CustomArea): void => {
    editingArea.value = { ...area }
    showAreaEditor.value = true
  }

  const saveAreaEdit = (): void => {
    if (!editingArea.value) return

    const index = customAreas.value.findIndex(
      a => a.id === editingArea.value!.id
    )
    if (index !== -1) {
      customAreas.value[index] = { ...editingArea.value }
    }
    showAreaEditor.value = false
    editingArea.value = null
  }

  const applyTemplate = (templateKey: string): void => {
    customAreas.value = applyLayoutTemplate(templateKey)
  }

  const handleSaveLayout = (): void => {
    exportLayoutConfig(customAreas.value)
  }

  const handleResetLayout = (): void => {
    customAreas.value = []
    const fields = allFormOptions.value
    availableFields.value = fields.map(field => ({
      ...field,
      id: field.prop || generateUniqueId('field'),
    }))
  }

  const handleExportData = (): void => {
    const exportData = {
      layout: customAreas.value,
      formData: {},
      timestamp: new Date().toISOString(),
      summary: {
        totalAreas: customAreas.value.length,
        totalFields: totalFieldsCount.value,
        filledFields: filledFieldsCount.value,
        completionRate: overallProgress.value,
      },
    }

    emit('export-data', exportData)

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `custom-layout-config-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // 组件暴露
  defineExpose({
    validate: () => Promise.resolve(),
    getModel: () => ({}),
    setFieldsValue: () => {},
    resetFields: () => {},
    toggleDesignMode,
    customAreas: readonly(customAreas),
    isDesignMode: readonly(isDesignMode),
    formStats: computed(() => ({
      totalAreas: customAreas.value.length,
      totalFields: totalFieldsCount.value,
      filledFields: filledFieldsCount.value,
      completionRate: overallProgress.value,
    })),
  })
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
