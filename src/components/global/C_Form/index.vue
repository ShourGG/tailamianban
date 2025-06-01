<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-23 11:58:59
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-01 21:00:01
 * @FilePath: \Robot_Admin\src\components\global\C_Form\index.vue
 * @Description: 通用表单组件 - 支持多种布局和动态渲染
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <NForm
    ref="formRef"
    :model="formModel"
    :rules="formRules"
    :validate-on-rule-change="false"
    :label-placement="labelPlacement"
    :label-width="labelWidth"
    :show-require-mark="showRequireMark"
    :size="size"
    :disabled="disabled"
    :readonly="readonly"
    v-bind="$attrs"
  >
    <!-- 动态布局组件渲染 -->
    <DynamicComponent
      :name="layoutComponentName"
      :form-items="formItems"
      :layout-config="mergedLayoutConfig"
      :options="visibleOptions"
      @tab-change="handleTabChange"
      @step-change="handleStepChange"
      @step-before-change="handleStepBeforeChange"
      @step-validate="handleStepValidate"
      @field-add="handleFieldAdd"
      @field-remove="handleFieldRemove"
      @field-toggle="handleFieldToggle"
      @fields-clear="handleFieldsClear"
      @render-mode-change="handleRenderModeChange"
      @group-toggle="handleGroupToggle"
      @group-reset="handleGroupReset"
    />

    <!-- 表单操作按钮区域（只在非步骤布局中显示） -->
    <NFormItem
      v-if="!isStepsLayout"
      class="mt-5"
    >
      <slot
        name="action"
        :form="formRef"
        :model="formModel"
        :validate="validate"
        :validateField="validateField"
        :reset="resetFields"
        :setFields="setFields"
        :getModel="getModel"
        :clearValidation="clearValidation"
      >
        <NSpace>
          <NButton
            type="primary"
            @click="handleSubmit"
            >提交</NButton
          >
          <NButton @click="handleReset">重置</NButton>
        </NSpace>
      </slot>
    </NFormItem>
  </NForm>
</template>

<script lang="ts" setup>
  import type { FormInst, FormRules } from 'naive-ui/es/form'
  import { _mergeRules } from '@/utils/v_verify'
  import type {
    FormProps,
    FormOption,
    LayoutType,
    LayoutConfig,
    OptionItem,
    ComponentType,
    SubmitEventPayload,
    EditorEventPayload,
    DynamicFieldConfig,
    RenderMode,
    FormModel,
  } from '@/types/modules/form'

  // ================= 组件属性定义 =================

  const props = withDefaults(defineProps<FormProps>(), {
    layoutType: 'default',
    layoutConfig: () => ({}),
    validateOnValueChange: false,
    labelPlacement: 'left',
    labelWidth: 'auto',
    showRequireMark: true,
    size: 'medium',
    disabled: false,
    readonly: false,
  })

  // ================= 组件事件定义 =================

  const emit = defineEmits<{
    submit: [payload: SubmitEventPayload]
    'update:modelValue': [model: FormModel]
    'validate-success': [model: FormModel]
    'validate-error': [errors: any]
    'editor-mounted': [payload: EditorEventPayload]
    'on-preview': [file: any]
    'on-remove': [file: any]
    'before-remove': [file: any]
    'on-exceed': [data: any]
    'on-success': [data: any]
    'tab-change': [tabKey: string]
    'step-change': [stepIndex: number, stepKey: string]
    'step-before-change': [currentStep: number, targetStep: number]
    'step-validate': [stepIndex: number]
    'field-add': [fieldConfig: DynamicFieldConfig]
    'field-remove': [fieldId: string]
    'field-toggle': [fieldId: string, visible: boolean]
    'fields-clear': []
    'render-mode-change': [mode: RenderMode]
    'group-toggle': [groupKey: string, collapsed: boolean]
    'group-reset': [groupKey: string]
  }>()

  // ================= 响应式状态管理 =================

  const formRef = ref<FormInst | null>(null)
  const formModel = reactive<FormModel>({})
  const formRules = reactive<FormRules>({})

  // ================= 常量映射 =================

  const LAYOUT_COMPONENT_MAP: Record<LayoutType, string> = {
    default: 'Default',
    inline: 'Inline',
    grid: 'Grid',
    card: 'Card',
    tabs: 'Tabs',
    steps: 'Steps',
    dynamic: 'Dynamic',
    custom: 'Custom',
  } as const

  const COMPONENT_MAP: Partial<Record<ComponentType, any>> = {
    input: resolveComponent('NInput'),
    textarea: resolveComponent('NInput'),
    inputNumber: resolveComponent('NInputNumber'),
    switch: resolveComponent('NSwitch'),
    slider: resolveComponent('NSlider'),
    rate: resolveComponent('NRate'),
    datePicker: resolveComponent('NDatePicker'),
    daterange: resolveComponent('NDatePicker'),
    timePicker: resolveComponent('NTimePicker'),
    cascader: resolveComponent('NCascader'),
    colorPicker: resolveComponent('NColorPicker'),
  } as const

  const SPECIAL_TYPES: readonly ComponentType[] = [
    'select',
    'checkbox',
    'radio',
    'upload',
    'editor',
  ] as const

  const DEFAULT_VALUES: Record<ComponentType, any> = {
    input: '',
    textarea: '',
    editor: '',
    select: null,
    datePicker: null,
    daterange: null,
    timePicker: null,
    cascader: null,
    colorPicker: null,
    checkbox: [],
    upload: [],
    radio: '',
    inputNumber: 0,
    slider: 0,
    rate: 0,
    switch: false,
  } as const

  // ================= 计算属性 =================

  const layoutComponentName = computed(
    () => LAYOUT_COMPONENT_MAP[props.layoutType] || LAYOUT_COMPONENT_MAP.default
  )

  const mergedLayoutConfig = computed<LayoutConfig>(() => ({
    type: props.layoutType,
    ...props.layoutConfig,
  }))

  const isStepsLayout = computed(() => props.layoutType === 'steps')

  const visibleOptions = computed(() =>
    props.options.filter(item => item.show !== false)
  )

  const formItems = computed(() =>
    visibleOptions.value.map(item =>
      h(
        resolveComponent('NFormItem'),
        {
          label: item.label,
          path: item.prop,
          key: item.prop,
        },
        {
          default: () => renderFormItem(item),
        }
      )
    )
  )

  // ================= 核心渲染逻辑 =================

  /**
   * * @description 渲染表单项主函数
   * ? @param item 表单项配置
   * ! @return 渲染的VNode或null
   */
  const renderFormItem = (item: FormOption): VNode | null => {
    try {
      if (SPECIAL_TYPES.includes(item.type as ComponentType)) {
        return renderSpecialComponent(item)
      }

      const Component = COMPONENT_MAP[item.type as ComponentType]
      if (!Component) {
        console.warn(`[C_Form] 未支持的组件类型: ${item.type}`)
        return null
      }

      return h(Component, {
        ...getBaseProps(item),
        ...item.attrs,
      })
    } catch (error) {
      console.error(`[C_Form] 渲染表单项失败:`, error, item)
      return null
    }
  }

  /**
   * * @description 渲染特殊组件
   * ? @param item 表单项配置
   * ! @return 渲染的VNode或null
   */
  const renderSpecialComponent = (item: FormOption): VNode | null => {
    const baseProps = getBaseProps(item)

    switch (item.type) {
      case 'select':
        return h(resolveComponent('NSelect'), {
          ...baseProps,
          options:
            item.children?.map((child: OptionItem) => ({
              value: child.value,
              label: child.label,
              disabled: child.disabled,
            })) || [],
          ...item.attrs,
        })

      case 'checkbox':
        return h(
          resolveComponent('NCheckboxGroup'),
          { ...baseProps, ...item.attrs },
          {
            default: () =>
              h(
                resolveComponent('NSpace'),
                {},
                {
                  default: () =>
                    item.children?.map((child: OptionItem) =>
                      h(resolveComponent('NCheckbox'), {
                        value: child.value,
                        label: child.label,
                        disabled: child.disabled,
                        key: String(child.value),
                      })
                    ) || [],
                }
              ),
          }
        )

      case 'radio':
        return h(
          resolveComponent('NRadioGroup'),
          { ...baseProps, ...item.attrs },
          {
            default: () =>
              h(
                resolveComponent('NSpace'),
                {},
                {
                  default: () =>
                    item.children?.map((child: OptionItem) =>
                      h(
                        resolveComponent('NRadio'),
                        {
                          value: child.value,
                          disabled: child.disabled,
                          key: String(child.value),
                        },
                        { default: () => child.label }
                      )
                    ) || [],
                }
              ),
          }
        )

      case 'upload':
        return renderUploadComponent(item)

      case 'editor':
        return renderEditorComponent(item)

      default:
        return null
    }
  }

  /**
   * * @description 渲染富文本编辑器组件
   * ? @param item 表单项配置
   * ! @return 编辑器组件VNode
   */
  const renderEditorComponent = (item: FormOption): VNode => {
    return h(resolveComponent('C_Editor'), {
      editorId: `editor-${item.prop}`, // 添加必需的editorId属性
      modelValue: formModel[item.prop] || '',
      placeholder: item.placeholder,
      disabled: props.disabled,
      readonly: props.readonly,
      'onUpdate:modelValue': (value: string) => {
        formModel[item.prop] = value
        handleFieldChange(item.prop)
      },
      'onEditor-mounted': (editor: any) => {
        emit('editor-mounted', {
          editor,
          prop: item.prop,
          html: formModel[item.prop] || '',
        })
      },
      ...item.attrs,
    })
  }

  /**
   * * @description 渲染文件上传组件
   * ? @param item 表单项配置
   * ! @return 上传组件VNode
   */
  const renderUploadComponent = (item: FormOption): VNode => {
    const currentInstance = getCurrentInstance()

    return h(
      resolveComponent('NUpload'),
      {
        fileList: formModel[item.prop] || [],
        'onUpdate:fileList': (fileList: any[]) => {
          formModel[item.prop] = fileList
          handleFieldChange(item.prop)
        },
        onPreview: (file: any) => emit('on-preview', file),
        onRemove: (file: any) => emit('on-remove', file),
        onBeforeRemove: (file: any) => emit('before-remove', file),
        onExceed: (data: any) => emit('on-exceed', data),
        onSuccess: (data: any) => emit('on-success', data),
        ...item.attrs,
      },
      {
        trigger: () =>
          currentInstance?.slots['uploadClick']?.() ||
          h(
            resolveComponent('NButton'),
            { type: 'primary' },
            { default: () => '选择文件' }
          ),
        tip: () => currentInstance?.slots['uploadTip']?.() || null,
      }
    )
  }

  /**
   * * @description 获取表单项基础属性
   * ? @param item 表单项配置
   * ! @return 基础属性对象
   */
  const getBaseProps = (item: FormOption): Record<string, any> => {
    const baseProps: Record<string, any> = {
      value: formModel[item.prop],
      'onUpdate:value': (value: any) => {
        formModel[item.prop] = value
        handleFieldChange(item.prop)
      },
    }

    if (item.type === 'textarea') {
      baseProps.type = 'textarea'
    }

    if (item.placeholder) {
      baseProps.placeholder = item.placeholder
    }

    return baseProps
  }

  // ================= 工具函数 =================

  /**
   * * @description 获取组件类型的默认值
   * ? @param type 组件类型
   * ! @return 默认值
   */
  const getDefaultValue = (type: ComponentType): any => {
    return DEFAULT_VALUES[type] ?? null
  }

  /**
   * * @description 处理字段值变化
   * ? @param field 字段名
   */
  const handleFieldChange = (field: string): void => {
    if (props.validateOnValueChange) {
      nextTick(() => {
        validateField(field).catch(() => {})
      })
    }
  }

  // ================= 初始化逻辑 =================

  /**
   * * @description 初始化表单数据和验证规则
   */
  const initialize = (): void => {
    try {
      // 清空现有规则
      Object.keys(formRules).forEach(key => delete formRules[key])

      // 初始化表单数据和验证规则
      props.options.forEach(item => {
        formModel[item.prop] =
          item.value !== undefined
            ? item.value
            : getDefaultValue(item.type as ComponentType)

        if (item.rules?.length) {
          formRules[item.prop] = _mergeRules(item.rules)
        }
      })
    } catch (error) {
      console.error('[C_Form] 初始化失败:', error)
    }
  }

  // ================= 验证相关方法 =================

  /**
   * * @description 验证整个表单
   * ! @return Promise<void>
   */
  const validate = async (): Promise<void> => {
    if (!formRef.value) {
      throw new Error('[C_Form] 表单引用不存在')
    }

    try {
      await formRef.value.validate()
      emit('validate-success', getModel())
    } catch (errors) {
      emit('validate-error', errors)
      throw errors
    }
  }

  /**
   * * @description 验证指定字段
   * ? @param field 字段名或字段名数组
   * ! @return Promise<void>
   */
  const validateField = async (field: string | string[]): Promise<void> => {
    if (!formRef.value) {
      throw new Error('[C_Form] 表单引用不存在')
    }

    const fields = Array.isArray(field) ? field : [field]
    await formRef.value.validate(fields as any)
  }

  /**
   * * @description 清除验证状态
   * ? @param field 字段名或字段名数组，不传则清除所有
   */
  const clearValidation = (field?: string | string[]): void => {
    if (!formRef.value) return

    if (field) {
      const fields = Array.isArray(field) ? field : [field]
      fields.forEach(fieldName => {
        if (formModel[fieldName] !== undefined) {
          const currentValue = formModel[fieldName]
          formModel[fieldName] = currentValue
        }
      })
    } else {
      formRef.value.restoreValidation()
    }
  }

  /**
   * * @description 通用字段验证方法
   * ? @param filterFn 字段过滤函数
   * ? @param context 错误上下文
   * ! @return 验证结果
   */
  const validateByFilter = async (
    filterFn: (option: FormOption) => boolean,
    context: string
  ): Promise<boolean> => {
    try {
      const fields = props.options.filter(filterFn).map(option => option.prop)

      if (fields.length === 0) return true
      await validateField(fields)
      return true
    } catch (error) {
      console.warn(`[C_Form] ${context}验证失败:`, error)
      return false
    }
  }

  /**
   * * @description 验证指定步骤
   * ? @param stepIndex 步骤索引
   * ! @return 验证结果
   */
  const validateStep = async (stepIndex: number): Promise<boolean> => {
    const stepKey = props.layoutConfig?.steps?.steps?.[stepIndex]?.key
    if (!stepKey) return true

    return validateByFilter(
      option => option.layout?.step === stepKey,
      `步骤 ${stepIndex} `
    )
  }

  /**
   * * @description 验证指定标签页
   * ? @param tabKey 标签页标识
   * ! @return 验证结果
   */
  const validateTab = async (tabKey: string): Promise<boolean> => {
    return validateByFilter(
      option => option.layout?.tab === tabKey,
      `标签页 ${tabKey} `
    )
  }

  /**
   * * @description 验证动态字段
   * ! @return 验证结果
   */
  const validateDynamicFields = async (): Promise<boolean> => {
    return validateByFilter(
      option => Boolean(option.layout?.dynamic),
      '动态字段 '
    )
  }

  /**
   * * @description 验证自定义分组
   * ? @param groupKey 分组标识
   * ! @return 验证结果
   */
  const validateCustomGroup = async (groupKey: string): Promise<boolean> => {
    return validateByFilter(
      option => option.layout?.group === groupKey,
      `自定义分组 ${groupKey} `
    )
  }

  // ================= 事件处理方法 =================

  const handleTabChange = (tabKey: string): void => emit('tab-change', tabKey)
  const handleStepChange = (stepIndex: number, stepKey: string): void =>
    emit('step-change', stepIndex, stepKey)
  const handleStepBeforeChange = async (
    currentStep: number,
    targetStep: number
  ): Promise<boolean> => {
    emit('step-before-change', currentStep, targetStep)
    return true
  }

  const handleStepValidate = async (stepIndex: number): Promise<boolean> => {
    try {
      const currentStepKey = props.layoutConfig?.steps?.steps?.[stepIndex]?.key
      if (!currentStepKey) return true

      const stepFields = props.options
        .filter(option => option.layout?.step === currentStepKey)
        .map(option => option.prop)

      if (stepFields.length === 0) return true

      await validateField(stepFields)
      emit('step-validate', stepIndex)
      return true
    } catch (error) {
      console.warn(`[C_Form] 步骤 ${stepIndex} 验证失败:`, error)
      return false
    }
  }

  const handleFieldAdd = (fieldConfig: DynamicFieldConfig): void =>
    emit('field-add', fieldConfig)
  const handleFieldRemove = (fieldId: string): void =>
    emit('field-remove', fieldId)
  const handleFieldToggle = (fieldId: string, visible: boolean): void =>
    emit('field-toggle', fieldId, visible)
  const handleFieldsClear = (): void => emit('fields-clear')
  const handleRenderModeChange = (mode: RenderMode): void =>
    emit('render-mode-change', mode)
  const handleGroupToggle = (groupKey: string, collapsed: boolean): void =>
    emit('group-toggle', groupKey, collapsed)
  const handleGroupReset = (groupKey: string): void =>
    emit('group-reset', groupKey)

  /**
   * * @description 处理表单提交
   */
  const handleSubmit = async (): Promise<void> => {
    try {
      await validate()
      emit('submit', { model: getModel(), form: formRef.value! })
    } catch (error) {
      console.warn('[C_Form] 表单验证失败:', error)
    }
  }

  /**
   * * @description 处理表单重置
   */
  const handleReset = (): void => {
    try {
      clearValidation()

      props.options.forEach(item => {
        const defaultValue =
          item.value !== undefined
            ? item.value
            : getDefaultValue(item.type as ComponentType)

        formModel[item.prop] = defaultValue
      })
    } catch (error) {
      console.error('[C_Form] 重置表单失败:', error)
    }
  }

  // ================= 对外API =================

  const resetFields = (): void => handleReset()
  const setFields = (fields: FormModel): void => {
    Object.assign(formModel, fields)
  }
  const getModel = (): FormModel => ({ ...formModel })

  const setFieldValue = async (
    field: string,
    value: any,
    shouldValidate: boolean = false
  ): Promise<void> => {
    formModel[field] = value
    if (shouldValidate) {
      await validateField(field)
    }
  }

  const getFieldValue = (field: string): any => formModel[field]

  const setFieldsValue = async (
    fields: FormModel,
    shouldValidate: boolean = false
  ): Promise<void> => {
    Object.assign(formModel, fields)
    if (shouldValidate) {
      await validate()
    }
  }

  // ================= 生命周期 =================

  onMounted(() => {
    initialize()

    watch(
      () => props.options,
      () => initialize(),
      { deep: true }
    )

    watch(
      () => props.modelValue,
      val => {
        if (val) Object.assign(formModel, val)
      },
      { immediate: true, deep: true }
    )

    watch(formModel, val => emit('update:modelValue', { ...val }), {
      deep: true,
    })
  })

  // ================= 组件暴露 =================

  defineExpose({
    validate,
    validateField,
    validateStep,
    validateTab,
    validateDynamicFields,
    validateCustomGroup,
    clearValidation,
    getModel,
    setFields,
    resetFields,
    setFieldValue,
    getFieldValue,
    setFieldsValue,
    formRef,
    formModel,
    initialize,
    layoutType: toRef(props, 'layoutType'),
    isStepsLayout: isStepsLayout,
  })
</script>

<style scoped>
  .mt-5 {
    margin-top: 1.25rem;
  }

  @media (max-width: 768px) {
    .mt-5 {
      margin-top: 1rem;
    }
  }
</style>
