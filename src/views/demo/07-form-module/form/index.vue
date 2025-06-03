<template>
  <div class="form-demo">
    <NH1>表单选择器组件场景示例 - 展示所有8种布局类型的完整功能和配置选项</NH1>
    <!-- 控制面板 -->
    <div class="control-panel">
      <div class="panel-title">
        布局控制中心 <span class="subtitle">/ 实时配置表单布局和行为</span>
      </div>

      <!-- 控制卡片网格 -->
      <div class="control-grid">
        <!-- 布局类型 -->
        <NCard
          hoverable
          class="control-card"
          :bordered="false"
        >
          <div class="card-title">布局类型</div>
          <div class="layout-buttons">
            <button
              v-for="layout in layoutOptions"
              :key="layout.value"
              :class="[
                'layout-btn',
                { active: currentLayout === layout.value },
              ]"
              @click="currentLayout = layout.value"
            >
              {{ layout.label }}
            </button>
          </div>
        </NCard>

        <!-- 表单配置 -->
        <NCard
          hoverable
          class="control-card"
          :bordered="false"
        >
          <div class="card-title">表单配置</div>
          <div class="config-section">
            <div class="section-label">基础配置</div>
            <div class="config-item">
              <span>标签位置</span>
              <div class="button-group">
                <button
                  :class="{ active: labelPlacement === 'left' }"
                  @click="labelPlacement = 'left'"
                  >左侧</button
                >
                <button
                  :class="{ active: labelPlacement === 'top' }"
                  @click="labelPlacement = 'top'"
                  >顶部</button
                >
              </div>
            </div>
            <div class="config-item">
              <span>实时验证</span>
              <div
                :class="['switch', { active: validateOnChange }]"
                @click="validateOnChange = !validateOnChange"
              ></div>
            </div>
          </div>
          <div class="config-section">
            <div class="section-label">快速操作</div>
            <div class="action-buttons">
              <button
                class="action-btn fill"
                @click="fillTestData"
                >填充测试</button
              >
              <button
                class="action-btn preview"
                @click="previewData"
                >预览数据</button
              >
              <button
                class="action-btn clear"
                @click="clearAllData"
                >清空数据</button
              >
              <button
                class="action-btn validate"
                @click="validateForm"
                >验证表单</button
              >
            </div>
          </div>
        </NCard>

        <!-- 网格配置 -->
        <NCard
          hoverable
          class="control-card"
          :bordered="false"
        >
          <div class="card-title">网格配置</div>
          <div class="config-item">
            <span>栅格列数</span>
            <select v-model="gridCols">
              <option :value="12">12列</option>
              <option :value="18">18列</option>
              <option :value="24">24列</option>
            </select>
          </div>
          <div class="config-item">
            <span>间距大小</span>
            <div class="range-group">
              <input
                v-model="gridGutter"
                type="range"
                min="8"
                max="32"
              />
              <span>{{ gridGutter }}px</span>
            </div>
          </div>
        </NCard>

        <!-- 实时统计 -->
        <NCard
          hoverable
          class="control-card"
          :bordered="false"
        >
          <div class="card-title">实时统计</div>
          <div class="stat-display">
            <div class="stat-number">{{ formOptions.length }}</div>
            <div class="stat-label">当前布局包含的字段总数</div>
          </div>
        </NCard>

        <!-- 内联配置 -->
        <NCard
          hoverable
          class="control-card"
          :bordered="false"
        >
          <div class="card-title">内联配置</div>
          <div class="config-item">
            <span>元素间距</span>
            <div class="range-group">
              <input
                v-model="inlineGap"
                type="range"
                min="8"
                max="32"
              />
              <span>{{ inlineGap }}px</span>
            </div>
          </div>
          <div class="config-item">
            <span>对齐方式</span>
            <div class="button-group">
              <button class="active">居中</button>
              <button>左对齐</button>
            </div>
          </div>
        </NCard>

        <!-- 动态字段 -->
        <NCard
          hoverable
          class="control-card"
          :bordered="false"
        >
          <div class="card-title">动态字段</div>
          <div class="config-item">
            <span>当前字段</span>
            <span class="field-count">{{ dynamicFields.length }}</span>
          </div>
          <div class="field-actions">
            <button
              @click="addDynamicField"
              :disabled="dynamicFields.length >= dynamicMaxFields"
            >
              添加 ({{ dynamicFields.length }}/{{ dynamicMaxFields }})
            </button>
            <button
              @click="removeDynamicField"
              :disabled="dynamicFields.length === 0"
              >移除</button
            >
          </div>
        </NCard>

        <!-- 验证规则 -->
        <NCard
          hoverable
          class="control-card"
          :bordered="false"
        >
          <div class="card-title">验证规则</div>
          <div class="config-item">
            <span>必填字段</span>
            <span class="required-count">{{ requiredFieldsCount }}</span>
          </div>
          <div class="config-item">
            <span>验证状态</span>
            <span
              :class="[
                'status-badge',
                lastValidateResult ? 'success' : 'error',
              ]"
            >
              {{ lastValidateResult ? '通过' : '失败' }}
            </span>
          </div>
        </NCard>

        <!-- 性能监控 -->
        <NCard
          hoverable
          class="control-card"
          :bordered="false"
        >
          <div class="card-title">性能监控</div>
          <div class="config-item">
            <span>渲染时间</span>
            <span class="perf-value success">{{ renderTime }}ms</span>
          </div>
          <div class="config-item">
            <span>内存使用</span>
            <span class="perf-value">{{ memoryUsage }}MB</span>
          </div>
        </NCard>
      </div>

      <!-- 布局特定配置 -->
      <div
        v-if="hasLayoutSpecificConfig"
        class="layout-specific-config"
      >
        <NCard
          class="control-card full-width"
          :bordered="false"
        >
          <div class="card-title">{{ getLayoutName() }}专属配置</div>
          <div class="layout-config-content">
            <!-- 网格配置 -->
            <template v-if="currentLayout === 'grid'">
              <div class="config-item">
                <span>栅格列数</span>
                <div class="input-with-badge">
                  <select
                    v-model="gridCols"
                    class="number-input"
                  >
                    <option :value="12">12列</option>
                    <option :value="18">18列</option>
                    <option :value="24">24列</option>
                  </select>
                </div>
              </div>
              <div class="config-item">
                <span>网格间距</span>
                <div class="input-with-badge">
                  <input
                    v-model="gridGutter"
                    type="number"
                    min="8"
                    max="32"
                    class="number-input"
                  />
                  <span class="badge primary">{{ gridGutter }}px</span>
                </div>
              </div>
            </template>

            <!-- 内联配置 -->
            <template v-if="currentLayout === 'inline'">
              <div class="config-item">
                <span>元素间距</span>
                <div class="input-with-badge">
                  <input
                    v-model="inlineGap"
                    type="number"
                    min="8"
                    max="32"
                    class="number-input"
                  />
                  <span class="badge primary">{{ inlineGap }}px</span>
                </div>
              </div>
            </template>

            <!-- 动态配置 -->
            <template v-if="currentLayout === 'dynamic'">
              <div class="config-item">
                <span>字段限制</span>
                <div class="input-with-badge">
                  <input
                    v-model="dynamicMaxFields"
                    type="number"
                    min="10"
                    max="50"
                    class="number-input"
                  />
                  <span class="badge primary">{{ dynamicFields.length }}</span>
                </div>
              </div>
              <div class="config-item">
                <span>字段操作</span>
                <div class="field-actions">
                  <button
                    @click="addDynamicField"
                    :disabled="dynamicFields.length >= dynamicMaxFields"
                    class="action-btn fill"
                  >
                    添加字段
                  </button>
                  <button
                    @click="removeDynamicField"
                    :disabled="dynamicFields.length === 0"
                    class="action-btn clear"
                  >
                    移除字段
                  </button>
                  <button
                    @click="clearDynamicFields"
                    :disabled="dynamicFields.length === 0"
                    class="action-btn validate"
                  >
                    清空字段
                  </button>
                </div>
              </div>
            </template>
          </div>
        </NCard>
      </div>
    </div>

    <!-- 表单区域 -->
    <NCard
      class="form-section"
      :bordered="false"
    >
      <div class="form-header">
        <h3>{{ getLayoutTitle() }}</h3>
        <span class="field-badge">{{ formOptions.length }} 字段</span>
      </div>
      <div class="layout-info">
        <strong>{{ currentLayoutDescription.title }}</strong> -
        {{ currentLayoutDescription.content }}
      </div>

      <!-- C_Form 组件区域 -->
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
        <template #action="{ validate, reset }">
          <div class="form-actions">
            <button
              class="submit-btn"
              @click="submitForm(validate)"
              :disabled="submitLoading"
            >
              <span
                v-if="submitLoading"
                class="loading"
              ></span>
              {{ submitLoading ? '提交中...' : '提交表单' }}
            </button>
            <button
              class="reset-btn"
              @click="resetForm(reset)"
            >
              重置表单
            </button>
          </div>
        </template>
      </C_Form>
    </NCard>

    <!-- 状态监控 -->
    <div class="status-section">
      <div class="panel-title">状态监控面板</div>
      <div class="status-cards">
        <NCard
          class="status-card completed"
          :bordered="false"
        >
          <div class="number">{{ filledFieldsCount }}</div>
          <div class="label">已填写字段</div>
        </NCard>
        <NCard
          class="status-card pending"
          :bordered="false"
        >
          <div class="number">{{ pendingFieldsCount }}</div>
          <div class="label">待填写字段</div>
        </NCard>
        <NCard
          class="status-card completion"
          :bordered="false"
        >
          <div class="number">{{ dataCompletionPercentage }}%</div>
          <div class="label">完成率</div>
        </NCard>
        <NCard
          class="status-card errors"
          :bordered="false"
        >
          <div class="number">{{ errorCount }}</div>
          <div class="label">验证错误</div>
        </NCard>
      </div>

      <!-- 详细统计 -->
      <div class="status-details">
        <NCard
          class="validation-detail"
          :bordered="false"
        >
          <div class="validation-header">
            <h3 class="validation-title">表单验证详情</h3>
            <span
              :class="[
                'validation-status',
                lastValidateResult ? 'success' : 'error',
              ]"
            >
              {{ lastValidateResult ? '验证通过' : '验证失败' }}
            </span>
          </div>
          <div class="validation-message">
            {{
              lastValidateResult
                ? '所有必填字段已正确填写，数据格式符合要求。表单可以安全提交。'
                : '存在不符合规则的字段，请检查输入内容并重新验证。'
            }}
          </div>
          <button
            class="validate-btn"
            @click="validateForm"
            :disabled="submitLoading"
          >
            重新验证
          </button>
        </NCard>

        <NCard
          class="quick-stats"
          :bordered="false"
        >
          <h3 class="stats-title">快速统计</h3>
          <div class="stat-row">
            <span class="stat-label">字符串字段</span>
            <span class="stat-value">{{ stringFieldsCount }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">数字字段</span>
            <span class="stat-value">{{ numberFieldsCount }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">选择字段</span>
            <span class="stat-value">{{ selectFieldsCount }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">布尔字段</span>
            <span class="stat-value">{{ booleanFieldsCount }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">动态字段</span>
            <span class="stat-value">{{ dynamicFields.length }}</span>
          </div>
        </NCard>
      </div>
    </div>

    <!-- 数据预览弹窗 -->
    <div
      v-if="showPreview"
      class="modal-overlay"
      @click="showPreview = false"
    >
      <NCard
        class="modal-content"
        :bordered="false"
        @click.stop
      >
        <div class="modal-header">
          <h3>表单数据预览</h3>
          <div class="modal-actions">
            <button
              class="modal-btn"
              @click="copyData"
              >复制数据</button
            >
            <button
              class="modal-btn"
              @click="downloadData"
              >下载JSON</button
            >
            <button
              class="modal-btn close"
              @click="showPreview = false"
              >关闭</button
            >
          </div>
        </div>

        <div class="modal-tabs">
          <div class="tab-content">
            <h4>格式化显示</h4>
            <pre class="json-display">{{
              JSON.stringify(formData, null, 2)
            }}</pre>
          </div>

          <div class="tab-content">
            <h4>表格显示</h4>
            <table class="data-table">
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
                    ><span class="field-tag">{{ key }}</span></td
                  >
                  <td>{{ formatValue(value) }}</td>
                  <td
                    ><span class="type-tag">{{ getValueType(value) }}</span></td
                  >
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </NCard>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type {
    LayoutType,
    LabelPlacement,
    FormInstance,
    FormOption,
    LayoutConfig,
    ComponentType,
    ItemLayoutConfig,
    FormModel,
  } from '@/types/modules/form'

  // 引入数据配置
  import {
    layoutOptions,
    layoutDescriptions,
    createBaseFields,
    createExtendedFields,
    testData,
    dynamicFieldTypes,
    createLayoutConfig,
    getFieldCreator,
  } from './data'

  // 接口定义
  interface LayoutOption {
    value: LayoutType
    label: string
  }

  interface LayoutDescription {
    title: string
    content: string
  }

  interface DynamicField extends FormOption {
    id: string
    created: number
  }

  // 消息实例
  const message = useMessage()

  // ================= 响应式状态 =================
  const formRef = ref<FormInstance | null>(null)
  const formData = ref<FormModel>({})
  const showPreview = ref<boolean>(false)
  const currentLayout = ref<LayoutType>('default')
  const labelPlacement = ref<LabelPlacement>('left')
  const validateOnChange = ref<boolean>(false)
  const gridCols = ref<number>(24)
  const gridGutter = ref<number>(16)
  const inlineGap = ref<number>(16)
  const dynamicMaxFields = ref<number>(20)
  const dynamicFields = ref<DynamicField[]>([])
  const dynamicFieldCounter = ref<number>(0)
  const renderTime = ref<number>(38)
  const memoryUsage = ref<string>('2.0')
  const errorCount = ref<number>(0)
  const lastValidateResult = ref<boolean>(true)
  const submitLoading = ref<boolean>(false)

  // ================= 计算属性 =================
  const currentLayoutDescription = computed(
    (): LayoutDescription =>
      layoutDescriptions[currentLayout.value] || { title: '', content: '' }
  )

  const hasLayoutSpecificConfig = computed((): boolean =>
    ['grid', 'inline', 'dynamic'].includes(currentLayout.value)
  )

  const currentLayoutConfig = computed(
    (): LayoutConfig =>
      createLayoutConfig(currentLayout.value, {
        grid: { cols: gridCols.value, gutter: gridGutter.value },
        inline: { gap: inlineGap.value, align: 'center' },
        dynamic: {
          maxFields: dynamicMaxFields.value,
          useExternalControl: true,
        },
      })
  )

  // 优化后的 formOptions 计算属性 - 降低复杂度
  const formOptions = computed((): FormOption[] => {
    const fields = getFormFields()
    const processedFields = processFieldsForLayout(fields)
    return addDynamicFieldsIfNeeded(processedFields)
  })

  // 提取表单字段获取逻辑
  const getFormFields = (): FormOption[] => {
    const creator = getFieldCreator?.(currentLayout.value)
    let fields = creator ? creator() : createBaseFields()

    // 为扩展布局添加额外字段
    if (isExtendedLayout(currentLayout.value)) {
      const extendedFields = createExtendedFields?.() || []
      fields = [...fields, ...extendedFields]
    }

    return fields
  }

  // 检查是否为扩展布局
  const isExtendedLayout = (layout: string): boolean =>
    ['card', 'tabs', 'dynamic', 'custom'].includes(layout)

  // 处理字段以适应布局
  const processFieldsForLayout = (fields: FormOption[]): FormOption[] => {
    // 修复密码字段类型
    const fixedFields = fields.map(field => {
      if (field.prop?.includes('password')) {
        return {
          ...field,
          type: 'input',
          attrs: {
            ...field.attrs,
            type: 'password',
            showPasswordOn: 'mousedown',
          },
        }
      }
      return field
    })

    // 内联布局过滤复杂组件
    if (currentLayout.value === 'inline') {
      return fixedFields.filter(
        field => !['textarea', 'upload', 'editor'].includes(field.type)
      )
    }

    return fixedFields
  }

  // 添加动态字段
  const addDynamicFieldsIfNeeded = (fields: FormOption[]): FormOption[] => {
    if (currentLayout.value === 'dynamic' && dynamicFields.value.length > 0) {
      const dynamicFieldsWithLayout = dynamicFields.value.map(field => ({
        ...field,
        layout: { ...field.layout, ...getFieldLayout(field.prop), span: 12 },
      }))
      fields.push(...dynamicFieldsWithLayout)
    }

    // 为字段添加布局信息
    return fields.map(field => ({
      ...field,
      layout: { ...field.layout, ...getFieldLayout(field.prop) },
    }))
  }

  // 统计计算属性 - 修复完成率计算逻辑
  const filledFieldsCount = computed((): number => {
    // 只统计当前布局中实际存在的字段
    const formDataValue = formData.value as Record<string, any>

    return formOptions.value.filter(field => {
      const value = formDataValue[field.prop]
      return isFieldFilled(value)
    }).length
  })

  // 判断字段是否已填写的辅助函数
  const isFieldFilled = (value: any): boolean => {
    if (value === null || value === undefined) return false
    if (Array.isArray(value)) return value.length > 0
    if (typeof value === 'string') return value.trim() !== ''
    if (typeof value === 'number') return true // 数字类型只要有值就算填写
    if (typeof value === 'boolean') return true // 布尔类型只要有值就算填写
    return true
  }

  const pendingFieldsCount = computed((): number =>
    Math.max(0, formOptions.value.length - filledFieldsCount.value)
  )

  const dataCompletionPercentage = computed((): number => {
    if (formOptions.value.length === 0) return 0
    const percentage =
      (filledFieldsCount.value / formOptions.value.length) * 100
    // 确保完成率不超过100%
    return Math.min(Math.round(percentage), 100)
  })

  const requiredFieldsCount = computed(
    (): number =>
      formOptions.value.filter(
        field =>
          field.required ||
          (field.rules && field.rules.some(rule => rule.required))
      ).length
  )

  // 字段类型统计
  const getFieldCountByTypes = (types: string[]) =>
    formOptions.value.filter(field => types.includes(field.type)).length

  const stringFieldsCount = computed(() =>
    getFieldCountByTypes(['input', 'textarea'])
  )
  const numberFieldsCount = computed(() =>
    getFieldCountByTypes(['inputNumber', 'slider'])
  )
  const selectFieldsCount = computed(() =>
    getFieldCountByTypes(['select', 'radio', 'checkbox'])
  )
  const booleanFieldsCount = computed(() => getFieldCountByTypes(['switch']))

  // ================= 工具方法 =================
  // 优化后的字段布局获取方法
  const getFieldLayout = (fieldName: string): ItemLayoutConfig => {
    const layoutMap: Record<string, () => ItemLayoutConfig> = {
      grid: () => ({ span: fieldName === 'address' ? 24 : 12 }),
      card: () => ({ group: getFieldGroup(fieldName) }),
      tabs: () => ({ tab: getFieldTab(fieldName) }),
      steps: () => ({ step: getFieldStep(fieldName) }),
      custom: () => ({ group: getFieldGroup(fieldName) }),
    }
    const layoutFn = layoutMap[currentLayout.value]
    return layoutFn ? layoutFn() : {}
  }

  // 字段分组映射
  const fieldGroupMap: Record<string, string[]> = {
    basic: [
      'username',
      'realName',
      'age',
      'gender',
      'email',
      'phone',
      'address',
    ],
    advanced: ['password', 'confirmPassword'],
  }

  const getFieldGroup = (field: string): string => {
    for (const [group, fields] of Object.entries(fieldGroupMap)) {
      if (fields.includes(field)) return group
    }
    return 'preferences'
  }

  // 字段标签页映射
  const fieldTabMap: Record<string, string[]> = {
    personal: ['username', 'realName', 'age', 'gender'],
    contact: ['email', 'phone', 'address'],
    security: ['password', 'confirmPassword'],
  }

  const getFieldTab = (field: string): string => {
    for (const [tab, fields] of Object.entries(fieldTabMap)) {
      if (fields.includes(field)) return tab
    }
    return 'preferences'
  }

  // 字段步骤映射
  const fieldStepMap: Record<string, string[]> = {
    step1: ['username', 'realName', 'age', 'gender'],
    step2: ['email', 'phone', 'address'],
    step3: ['password', 'confirmPassword'],
  }

  const getFieldStep = (field: string): string => {
    for (const [step, fields] of Object.entries(fieldStepMap)) {
      if (fields.includes(field)) return step
    }
    return 'step4'
  }

  const getLayoutName = (): string =>
    layoutOptions.find((opt: LayoutOption) => opt.value === currentLayout.value)
      ?.label || '未知'

  const getLayoutTitle = (): string => `${getLayoutName()} - 演示`

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
  // 优化后的填充测试数据方法
  const fillTestData = (): void => {
    const data = buildTestData()
    const formDataValue = formData.value as Record<string, any>
    Object.assign(formDataValue, data)
    message.success('已填充测试数据')
  }

  const buildTestData = (): Record<string, any> => {
    let data: Record<string, any> = { ...testData.base }

    if (isExtendedLayout(currentLayout.value)) {
      data = { ...data, ...testData.extended }
    }

    // 为动态字段填充测试数据
    if (currentLayout.value === 'dynamic' && dynamicFields.value.length > 0) {
      dynamicFields.value.forEach((field, index) => {
        const testValue = getTestValueForField(field.type, index)
        if (testValue !== undefined) {
          data[field.prop] = testValue
        }
      })
    }

    return data
  }

  // 字段测试值映射
  const fieldTestValues: Record<string, (index?: number) => any> = {
    input: (index: number = 0) => `动态数据${index + 1}`,
    textarea: (index: number = 0) => `动态数据${index + 1}`,
    inputNumber: () => Math.floor(Math.random() * 100),
    switch: () => Math.random() > 0.5,
    select: () => 'option1',
    radio: () => 'option1',
    checkbox: () => ['option1', 'option2'],
    rate: () => Math.floor(Math.random() * 5) + 1,
  }

  const getTestValueForField = (
    type: ComponentType | string,
    index: number
  ): any => {
    const generator = fieldTestValues[type as string]
    return generator ? generator(index) : undefined
  }

  const clearAllData = (): void => {
    const emptyData: Record<string, any> = {}
    formData.value = emptyData as FormModel
    formRef.value?.resetFields()
    message.info('已清空所有数据')
  }

  const previewData = (): void => {
    showPreview.value = true
  }

  const copyData = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(formData.value, null, 2)
      )
      message.success('数据已复制到剪贴板')
    } catch {
      message.error('复制失败，请手动复制')
    }
  }

  const downloadData = (): void => {
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

  const validateForm = async (): Promise<void> => {
    try {
      await formRef.value?.validate()
      lastValidateResult.value = true
      errorCount.value = 0
      message.success('表单验证通过')
    } catch (errors) {
      lastValidateResult.value = false
      errorCount.value = Array.isArray(errors) ? errors.length : 1
      message.error('表单验证失败')
    }
  }

  // ================= 动态字段管理 =================
  // 优化后的动态字段创建方法
  const createDynamicField = (counter: number): DynamicField => {
    const randomType = dynamicFieldTypes[
      Math.floor(Math.random() * dynamicFieldTypes.length)
    ] as ComponentType
    const baseField: DynamicField = {
      type: randomType,
      prop: `dynamic_field_${counter}`,
      label: `动态字段 ${counter}`,
      placeholder: `请输入动态字段 ${counter}`,
      layout: { span: 12, dynamic: true },
      id: `dynamic_${counter}`,
      created: Date.now(),
    }

    // 添加字段特定配置
    return addFieldSpecificConfig(baseField, randomType)
  }

  // 字段特定配置
  const fieldConfigs: Record<string, Partial<FormOption>> = {
    select: {
      children: [
        { value: 'option1', label: '选项1' },
        { value: 'option2', label: '选项2' },
        { value: 'option3', label: '选项3' },
      ],
    },
    radio: {
      children: [
        { value: 'option1', label: '选项1' },
        { value: 'option2', label: '选项2' },
      ],
    },
    checkbox: {
      children: [
        { value: 'option1', label: '选项1' },
        { value: 'option2', label: '选项2' },
        { value: 'option3', label: '选项3' },
      ],
    },
    inputNumber: { attrs: { min: 0, max: 100 } },
    textarea: { attrs: { rows: 3 } },
    rate: { attrs: { allowHalf: true } },
  }

  const addFieldSpecificConfig = (
    field: DynamicField,
    type: ComponentType
  ): DynamicField => {
    const config = fieldConfigs[type as string]
    return config ? { ...field, ...config } : field
  }

  const addDynamicField = (): void => {
    if (dynamicFields.value.length >= dynamicMaxFields.value) {
      message.warning(`已达到最大字段数量限制: ${dynamicMaxFields.value}`)
      return
    }

    dynamicFieldCounter.value++
    const newField = createDynamicField(dynamicFieldCounter.value)
    dynamicFields.value.push(newField)

    // 设置默认值
    const defaultValue = getDefaultValueForFieldType(newField.type)
    const formDataValue = formData.value as Record<string, any>
    if (formDataValue[newField.prop] === undefined) {
      formDataValue[newField.prop] = defaultValue
    }

    message.success(`已添加动态字段: ${newField.label}`)
  }

  // 字段默认值映射
  const defaultValues: Record<string, any> = {
    switch: false,
    rate: 0,
    inputNumber: 0,
    select: '',
    textarea: '',
    input: '',
    radio: '',
    checkbox: [],
  }

  const getDefaultValueForFieldType = (type: string): any =>
    defaultValues[type] || ''

  const removeDynamicField = (): void => {
    if (dynamicFields.value.length === 0) {
      message.warning('没有可移除的动态字段')
      return
    }

    const removedField = dynamicFields.value.pop()
    if (removedField) {
      const formDataValue = formData.value as Record<string, any>
      delete formDataValue[removedField.prop]
      message.warning(`已移除动态字段: ${removedField.label}`)
    }
  }

  const clearDynamicFields = (): void => {
    const formDataValue = formData.value as Record<string, any>
    dynamicFields.value.forEach(field => delete formDataValue[field.prop])
    dynamicFields.value = []
    dynamicFieldCounter.value = 0
    message.error('已清空所有动态字段')
  }

  const resetDynamicFields = (): void => {
    const formDataValue = formData.value as Record<string, any>
    dynamicFields.value.forEach(field => delete formDataValue[field.prop])
    dynamicFields.value = []
    dynamicFieldCounter.value = 0
  }

  // ================= 表单操作方法 =================
  const submitForm = async (validate: () => Promise<void>): Promise<void> => {
    try {
      submitLoading.value = true
      await validate()
      lastValidateResult.value = true
      errorCount.value = 0
      message.success('表单提交成功！')
    } catch {
      lastValidateResult.value = false
      errorCount.value = Math.floor(Math.random() * 3) + 1
      message.error('表单验证失败，请检查输入')
    } finally {
      submitLoading.value = false
    }
  }

  const resetForm = (reset: () => void): void => {
    reset()
    lastValidateResult.value = true
    errorCount.value = 0
    message.info('表单已重置')
  }

  // ================= 事件处理 =================
  const handleSubmit = (payload: any): void => {
    console.log('表单提交事件:', payload)
    message.success('表单提交成功（事件回调）')
  }

  const handleValidateSuccess = (model: FormModel): void => {
    lastValidateResult.value = true
    errorCount.value = 0
    console.log('验证成功:', model)
  }

  const handleValidateError = (errors: any): void => {
    lastValidateResult.value = false
    errorCount.value = Array.isArray(errors) ? errors.length : 1
    console.error('验证失败:', errors)
  }

  // ================= 监听器 =================
  watch(currentLayout, (newLayout: LayoutType, oldLayout: LayoutType) => {
    // 清空表单数据
    formData.value = {}
    lastValidateResult.value = true
    errorCount.value = 0

    // 只有在切换离开dynamic布局时才清理动态字段
    if (oldLayout === 'dynamic' && newLayout !== 'dynamic') {
      resetDynamicFields()
    }

    const layoutName = getLayoutName()
    message.info(`已切换到${layoutName}`)
    console.log(`布局切换: ${oldLayout} -> ${newLayout}`)
  })

  // ================= 生命周期 =================
  onMounted(() => {
    // 模拟性能监控数据更新
    setInterval(() => {
      renderTime.value = Math.floor(Math.random() * 20) + 35
      memoryUsage.value = (Math.random() * 1.5 + 1.8).toFixed(1)
    }, 3000)
  })
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
