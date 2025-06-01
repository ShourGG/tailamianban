<template>
  <div class="form-demo-container">
    <!-- 页面标题 -->
    <header class="demo-header">
      <h1>C_Form 完整布局演示</h1>
      <p
        >展示所有8种布局类型：默认、内联、网格、卡片、标签页、步骤、动态、自定义渲染</p
      >
    </header>

    <!-- 布局控制面板 -->
    <NCard
      title="布局控制面板"
      class="mb-4"
    >
      <NSpace
        vertical
        :size="16"
      >
        <!-- 基础控制 -->
        <NSpace :size="12">
          <span>布局:</span>
          <NSelect
            v-model:value="currentLayout"
            :options="layoutOptions"
            style="width: 150px"
          />
          <span>标签:</span>
          <NSelect
            v-model:value="labelPlacement"
            :options="labelPlacementOptions"
            style="width: 120px"
          />
          <span>验证:</span>
          <NSwitch v-model:value="validateOnChange" />
        </NSpace>

        <!-- 操作按钮 -->
        <NSpace :size="8">
          <NButton
            type="primary"
            size="small"
            @click="fillTestData"
            >填充测试</NButton
          >
          <NButton
            type="info"
            size="small"
            @click="previewData"
            >预览数据</NButton
          >
          <NButton
            type="warning"
            size="small"
            @click="clearAllData"
            >清空数据</NButton
          >
          <NButton
            type="success"
            size="small"
            @click="validateForm"
            >验证表单</NButton
          >
        </NSpace>

        <!-- 布局特定控制 -->
        <NSpace
          v-if="hasLayoutSpecificConfig"
          :size="12"
        >
          <NDivider vertical />
          <span>布局配置:</span>

          <!-- 网格布局 -->
          <template v-if="currentLayout === 'grid'">
            <span>列数:</span>
            <NInputNumber
              v-model:value="gridCols"
              :min="12"
              :max="24"
              :step="6"
              style="width: 80px"
            />
            <span>间距:</span>
            <NInputNumber
              v-model:value="gridGutter"
              :min="8"
              :max="32"
              :step="4"
              style="width: 80px"
            />
          </template>

          <!-- 内联布局 -->
          <template v-if="currentLayout === 'inline'">
            <span>间距:</span>
            <NInputNumber
              v-model:value="inlineGap"
              :min="8"
              :max="32"
              :step="4"
              style="width: 80px"
            />
          </template>

          <!-- 动态布局 -->
          <template v-if="currentLayout === 'dynamic'">
            <span>最大字段:</span>
            <NInputNumber
              v-model:value="dynamicMaxFields"
              :min="10"
              :max="50"
              style="width: 80px"
            />
            <span>字段数:</span>
            <NBadge
              :value="dynamicFields.length"
              type="primary"
            />

            <NDivider vertical />
            <NButton
              type="primary"
              size="small"
              @click="addDynamicField"
            >
              <template #icon><div class="i-carbon-add" /></template>
              添加字段
            </NButton>
            <NButton
              type="warning"
              size="small"
              @click="removeDynamicField"
              :disabled="dynamicFields.length === 0"
            >
              <template #icon><div class="i-carbon-subtract" /></template>
              移除字段
            </NButton>
            <NButton
              type="error"
              size="small"
              @click="clearDynamicFields"
              >清空字段</NButton
            >
          </template>
        </NSpace>
      </NSpace>
    </NCard>

    <!-- 表单主体 -->
    <NCard :title="getLayoutTitle()">
      <template #header-extra>
        <NBadge
          :value="formOptions.length"
          type="info"
        >
          <div class="i-carbon-form text-16px" />
        </NBadge>
      </template>

      <!-- 布局说明 -->
      <NAlert
        :title="currentLayoutDescription.title"
        :type="currentLayoutDescription.type"
        class="mb-4"
        show-icon
      >
        {{ currentLayoutDescription.content }}
      </NAlert>

      <!-- 表单组件 -->
      <C_Form
        ref="formRef"
        :options="formOptions"
        :layout-type="currentLayout"
        :layout-config="currentLayoutConfig"
        :validate-on-value-change="validateOnChange"
        :label-placement="labelPlacement"
        v-model="formData"
        @submit="handleSubmit"
        @validate-success="handleValidateSuccess"
        @validate-error="handleValidateError"
      >
        <!-- 操作按钮 -->
        <template #action="{ validate, reset }">
          <NSpace>
            <NButton
              type="primary"
              @click="submitForm(validate)"
              :loading="submitLoading"
              >提交表单</NButton
            >
            <NButton @click="resetForm(reset)">重置表单</NButton>
          </NSpace>
        </template>
      </C_Form>
    </NCard>

    <!-- 表单状态信息 -->
    <NCard
      title="表单状态"
      class="mt-4"
    >
      <NDescriptions
        :column="2"
        bordered
        size="small"
      >
        <NDescriptionsItem label="当前布局">
          <NTag :type="getLayoutTagType()">{{ getLayoutName() }}</NTag>
        </NDescriptionsItem>
        <NDescriptionsItem label="字段数量">
          <NBadge :value="formOptions.length" />
        </NDescriptionsItem>
        <NDescriptionsItem label="已填字段">
          <NBadge
            :value="filledFieldsCount"
            type="success"
          />
        </NDescriptionsItem>
        <NDescriptionsItem label="验证状态">
          <NTag :type="lastValidateResult ? 'success' : 'error'">
            {{ lastValidateResult ? '通过' : '失败' }}
          </NTag>
        </NDescriptionsItem>
        <NDescriptionsItem
          v-if="currentLayout === 'dynamic'"
          label="动态字段"
        >
          <NTag type="primary">{{ dynamicFields.length }}</NTag>
        </NDescriptionsItem>
      </NDescriptions>
    </NCard>

    <!-- 数据预览弹窗 -->
    <NModal
      v-model:show="showPreview"
      preset="card"
      title="表单数据预览"
      class="w50%"
    >
      <template #header-extra>
        <NSpace>
          <NButton
            size="small"
            @click="copyData"
            >复制数据</NButton
          >
          <NButton
            size="small"
            @click="downloadData"
            >下载JSON</NButton
          >
        </NSpace>
      </template>

      <NTabs
        type="line"
        animated
      >
        <NTabPane
          name="formatted"
          tab="格式化显示"
        >
          <NCode
            :code="JSON.stringify(formData, null, 2)"
            language="json"
            show-line-numbers
          />
        </NTabPane>
        <NTabPane
          name="table"
          tab="表格显示"
        >
          <NTable striped>
            <thead>
              <tr>
                <th>字段名</th>
                <th>字段值</th>
                <th>类型</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="[key, value] in Object.entries(formData)"
                :key="key"
              >
                <td
                  ><NTag size="small">{{ key }}</NTag></td
                >
                <td>{{ formatValue(value) }}</td>
                <td
                  ><NTag
                    type="info"
                    size="small"
                    >{{ getValueType(value) }}</NTag
                  ></td
                >
              </tr>
            </tbody>
          </NTable>
        </NTabPane>
      </NTabs>
    </NModal>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import type {
    LayoutType,
    FormInstance,
    FormOption,
  } from '@/types/modules/form'
  import {
    layoutOptions,
    labelPlacementOptions,
    layoutDescriptions,
    layoutTagTypes,
    createBaseFields,
    createExtendedFields,
    testData,
    dynamicFieldTypes,
    createLayoutConfig,
  } from './data'

  const message = useMessage()

  // ================= 响应式状态 =================
  const formRef = ref<FormInstance | null>(null)
  const formData = ref<Record<string, any>>({})
  const showPreview = ref(false)
  const submitLoading = ref(false)
  const lastValidateResult = ref(true)

  // 布局控制状态
  const currentLayout = ref<LayoutType>('default')
  const labelPlacement = ref<'left' | 'top'>('left')
  const validateOnChange = ref(false)

  // 布局特定配置
  const gridCols = ref(24)
  const gridGutter = ref(16)
  const inlineGap = ref(16)
  const dynamicMaxFields = ref(20)

  // 动态字段状态
  const dynamicFields = ref<any[]>([])
  const dynamicFieldCounter = ref(0)

  // ================= 计算属性 =================
  const hasLayoutSpecificConfig = computed(() =>
    ['grid', 'inline', 'dynamic'].includes(currentLayout.value)
  )

  const currentLayoutConfig = computed(() =>
    createLayoutConfig(currentLayout.value, {
      grid: { cols: gridCols.value, gutter: gridGutter.value },
      inline: { gap: inlineGap.value, align: 'center' },
      dynamic: { maxFields: dynamicMaxFields.value, useExternalControl: true },
    })
  )

  const currentLayoutDescription = computed(
    () => layoutDescriptions[currentLayout.value]
  )

  const formOptions = computed<FormOption[]>(() => {
    let baseFields = createBaseFields()

    // 为某些布局添加额外字段
    if (['card', 'tabs', 'dynamic', 'custom'].includes(currentLayout.value)) {
      baseFields.push(...createExtendedFields())
    }

    // 添加动态字段
    if (currentLayout.value === 'dynamic' && dynamicFields.value.length > 0) {
      baseFields.push(...dynamicFields.value)
    }

    // 根据布局类型过滤字段
    if (currentLayout.value === 'inline') {
      baseFields = baseFields.filter(
        field => !['editor', 'textarea', 'upload'].includes(field.type)
      )
    }

    return baseFields.map(field => ({
      ...field,
      layout: { ...field.layout, ...getFieldLayout(field.prop) },
    }))
  })

  const filledFieldsCount = computed(
    () =>
      Object.values(formData.value).filter(value => {
        if (Array.isArray(value)) return value.length > 0
        if (typeof value === 'string') return value.trim() !== ''
        if (typeof value === 'number') return value !== 0
        if (typeof value === 'boolean') return true
        return value != null
      }).length
  )

  // ================= 工具方法 =================
  const getFieldLayout = (fieldName: string) => {
    const layoutConfigs = {
      grid: () => ({ span: fieldName === 'address' ? 24 : 12 }),
      card: () => ({ group: getFieldGroup(fieldName) }),
      tabs: () => ({ tab: getFieldTab(fieldName) }),
      steps: () => ({ step: getFieldStep(fieldName) }),
      custom: () => ({ group: getFieldGroup(fieldName) }),
    }
    return (
      layoutConfigs[currentLayout.value as keyof typeof layoutConfigs]?.() || {}
    )
  }

  const getFieldGroup = (field: string) => {
    if (
      [
        'username',
        'realName',
        'age',
        'gender',
        'email',
        'phone',
        'address',
      ].includes(field)
    )
      return 'basic'
    if (['password', 'confirmPassword'].includes(field)) return 'advanced'
    return 'preferences'
  }

  const getFieldTab = (field: string) => {
    if (['username', 'realName', 'age', 'gender'].includes(field))
      return 'personal'
    if (['email', 'phone', 'address'].includes(field)) return 'contact'
    if (['password', 'confirmPassword'].includes(field)) return 'security'
    return 'preferences'
  }

  const getFieldStep = (field: string) => {
    if (['username', 'realName', 'age', 'gender'].includes(field))
      return 'step1'
    if (['email', 'phone', 'address'].includes(field)) return 'step2'
    if (['password', 'confirmPassword'].includes(field)) return 'step3'
    return 'step4'
  }

  const getLayoutName = () =>
    layoutOptions.find(opt => opt.value === currentLayout.value)?.label ||
    '未知'
  const getLayoutTitle = () => `${getLayoutName()} - 演示`
  const getLayoutTagType = () => layoutTagTypes[currentLayout.value]

  const formatValue = (value: any): string => {
    if (Array.isArray(value)) return `[${value.join(', ')}]`
    if (typeof value === 'object' && value !== null)
      return JSON.stringify(value)
    if (typeof value === 'string') return `"${value}"`
    return String(value)
  }

  const getValueType = (value: any): string => {
    if (Array.isArray(value)) return 'Array'
    if (value === null) return 'null'
    return typeof value
  }

  // ================= 数据操作方法 =================
  const fillTestData = () => {
    let data = { ...testData.base }
    if (['card', 'tabs', 'dynamic', 'custom'].includes(currentLayout.value)) {
      data = { ...data, ...testData.extended }
    }
    Object.assign(formData.value, data)
    message.success('已填充测试数据')
  }

  const clearAllData = () => {
    formData.value = {}
    formRef.value?.resetFields()
    if (currentLayout.value === 'dynamic') resetDynamicFields()
    message.info('已清空所有数据')
  }

  const previewData = () => {
    showPreview.value = true
  }

  const copyData = async () => {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(formData.value, null, 2)
      )
      message.success('数据已复制到剪贴板')
    } catch {
      message.error('复制失败，请手动复制')
    }
  }

  const downloadData = () => {
    const dataStr = JSON.stringify(formData.value, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `form-data-${currentLayout.value}-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    message.success('数据文件已下载')
  }

  // ================= 表单操作方法 =================
  const validateForm = async () => {
    try {
      await formRef.value?.validate()
      lastValidateResult.value = true
      message.success('表单验证通过')
    } catch {
      lastValidateResult.value = false
      message.error('表单验证失败')
    }
  }

  const submitForm = async (validate: () => Promise<void>) => {
    try {
      submitLoading.value = true
      await validate()
      lastValidateResult.value = true
      message.success('表单提交成功！')
    } catch {
      lastValidateResult.value = false
      message.error('表单验证失败，请检查输入')
    } finally {
      submitLoading.value = false
    }
  }

  const resetForm = (reset: () => void) => {
    reset()
    lastValidateResult.value = true
    if (currentLayout.value === 'dynamic') resetDynamicFields()
    message.info('表单已重置')
  }

  // ================= 动态字段管理 =================
  const createDynamicField = (counter: number) => {
    const randomType =
      dynamicFieldTypes[Math.floor(Math.random() * dynamicFieldTypes.length)]
    return {
      type: randomType,
      prop: `dynamic_field_${counter}`,
      label: `动态字段 ${counter}`,
      placeholder: `请输入动态字段 ${counter}`,
      layout: { span: 12, dynamic: true },
      id: `dynamic_${counter}`,
      created: Date.now(),
    }
  }

  const addDynamicField = () => {
    if (dynamicFields.value.length >= dynamicMaxFields.value) {
      message.warning(`已达到最大字段数量限制: ${dynamicMaxFields.value}`)
      return
    }

    dynamicFieldCounter.value++
    const newField = createDynamicField(dynamicFieldCounter.value)
    dynamicFields.value.push(newField)

    const defaultValues: Record<string, any> = {
      switch: false,
      rate: 0,
      inputNumber: 0,
    }
    formData.value[newField.prop] = defaultValues[newField.type] || ''

    message.success(`已添加动态字段: ${newField.label}`)
  }

  const removeDynamicField = () => {
    const removedField = dynamicFields.value.pop()
    if (removedField) {
      delete formData.value[removedField.prop]
      message.warning(`已移除动态字段: ${removedField.label}`)
    }
  }

  // 静默重置动态字段（切换布局时使用）
  const resetDynamicFields = () => {
    dynamicFields.value.forEach(field => delete formData.value[field.prop])
    dynamicFields.value = []
    dynamicFieldCounter.value = 0
  }

  // 主动清空动态字段（用户点击按钮时使用）
  const clearDynamicFields = () => {
    resetDynamicFields()
    message.error('已清空所有动态字段')
  }

  // ================= 事件处理 =================
  const handleSubmit = (payload: any) => {
    console.log('表单提交事件:', payload)
    message.success('表单提交成功（事件回调）')
  }

  const handleValidateSuccess = (model: Record<string, any>) => {
    lastValidateResult.value = true
    console.log('验证成功:', model)
  }

  const handleValidateError = (errors: any) => {
    lastValidateResult.value = false
    console.error('验证失败:', errors)
  }

  // ================= 监听器 =================
  watch(currentLayout, () => {
    formData.value = {}
    lastValidateResult.value = true
    resetDynamicFields() // 静默重置，不显示提示
    message.info(`已切换到${getLayoutName()}`)
  })
</script>

<style scoped>
  .form-demo-container {
    margin: 0 auto;
    padding: 20px;
  }

  .demo-header {
    text-align: center;
    margin-bottom: 32px;
  }

  .demo-header h1 {
    margin: 0 0 8px 0;
    color: var(--text-color-1);
    font-size: 28px;
    font-weight: 600;
  }

  .demo-header p {
    margin: 0;
    color: var(--text-color-2);
    font-size: 16px;
  }

  .mb-4 {
    margin-bottom: 16px;
  }
  .mt-4 {
    margin-top: 16px;
  }

  @media (max-width: 768px) {
    .form-demo-container {
      padding: 12px;
    }
    .demo-header h1 {
      font-size: 20px;
    }
    .demo-header p {
      font-size: 14px;
    }
  }
</style>
