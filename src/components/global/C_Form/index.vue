<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Description: 表单组件 - 基于优化验证规则的多布局表单组件
 * @FilePath: \Robot_Admin\src\components\global\C_Form\index.vue
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <NForm
    ref="formRef"
    :model="formModel"
    :rules="formRules"
    :validate-on-rule-change="false"
    :label-placement="labelPlacement"
    v-bind="$attrs"
  >
    <!-- 动态布局组件渲染 - 只有布局组件使用动态组件系统 -->
    <DynamicComponent
      :name="layoutComponentName"
      :form-items="formItems"
      :layout-config="mergedLayoutConfig"
      :options="options"
    />

    <!-- 表单操作按钮区域 -->
    <NFormItem class="mt20px">
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
  import { type FormInst, type FormRules, type UploadFileInfo } from 'naive-ui'
  import Editor from 'wangeditor'
  import { _mergeRules, type FieldRule } from '@/utils/v_verify'

  // ================= 类型定义 =================

  /**
   * * @description: 支持的布局类型枚举
   * ? @type {'default' | 'inline' | 'grid' | 'card'}
   */
  type LayoutType = 'default' | 'inline' | 'grid' | 'card'

  /**
   * * @description: 标签位置类型
   * ? @type {'left' | 'top'}
   */
  type LabelPlacement = 'left' | 'top'

  /**
   * * @description: 表单配置项接口
   * ! @interface FormOption
   */
  interface FormOption {
    type: string // 表单控件类型
    prop: string // 字段名（唯一标识）
    label?: string // 字段标签
    value?: any // 默认值
    placeholder?: string // 占位符文本
    rules?: FieldRule[] // 验证规则数组
    attrs?: Record<string, unknown> // 组件额外属性
    children?: Array<{
      // 子选项（select/checkbox/radio用）
      value: string | number | boolean
      label: string
    }>
    show?: boolean // 是否显示（默认true）
    layout?: {
      // 布局相关配置
      span?: number // 网格：占用列数
      offset?: number // 网格：偏移列数
      width?: string | number // 内联：项目宽度
      group?: string // 卡片：所属分组
      class?: string // 自定义CSS类名
      style?: Record<string, any> // 自定义内联样式
    }
  }

  /**
   * * @description: 布局配置接口
   * ! @interface LayoutConfig
   */
  interface LayoutConfig {
    type?: LayoutType
    grid?: {
      cols?: number // 总列数（默认24）
      gutter?: number // 间距（默认16）
    }
    inline?: {
      gap?: number // 项目间距（默认16）
      align?: 'start' | 'center' | 'end' // 对齐方式（默认center）
    }
    card?: {
      groups?: Array<{
        // 分组配置
        key: string // 分组标识
        title: string // 分组标题
        description?: string // 分组描述
      }>
    }
  }

  /**
   * * @description: 组件属性接口
   * ! @interface Props
   */
  interface Props {
    options: FormOption[] // 表单配置项数组
    modelValue?: Record<string, any> // 双向绑定的表单数据
    layoutType?: LayoutType // 布局类型
    layoutConfig?: LayoutConfig // 布局配置
    validateOnValueChange?: boolean // 是否在值改变时触发验证
    labelPlacement?: LabelPlacement // 标签位置：left-左侧（默认），top-顶部
  }

  // ================= 组件属性定义 =================

  const props = withDefaults(defineProps<Props>(), {
    layoutType: 'default',
    layoutConfig: () => ({}),
    validateOnValueChange: false,
    labelPlacement: 'left',
  })

  /**
   * * @description: 组件事件定义
   * ? @emits 定义组件对外发送的事件
   */
  const emit = defineEmits<{
    (e: 'submit', payload: { model: Record<string, any>; form: FormInst }): void
    (e: 'update:modelValue', model: Record<string, any>): void
    (e: 'validate-success', model: Record<string, any>): void
    (e: 'validate-error', errors: any): void
    (e: 'editor-mounted', editor: Editor, prop: string): void
    (e: 'on-preview', file: any): void
    (e: 'on-remove', file: any): void
    (e: 'before-remove', file: any): Promise<boolean>
    (e: 'on-exceed', data: any): void
    (e: 'on-success', data: any): void
  }>()

  // ================= 响应式状态管理 =================

  const formRef = ref<FormInst | null>(null) // Naive UI 表单实例引用
  const formModel = reactive<Record<string, any>>({}) // 表单数据模型
  const formRules = reactive<FormRules>({}) // 表单验证规则
  const editorInstances = new Map<string, Editor>() // 富文本编辑器实例缓存

  // ================= 布局组件动态映射（只优化这部分）=================

  /**
   * * @description: 布局类型到动态组件名称的映射
   * ? @constant 利用动态组件系统加载布局组件
   */
  const layoutComponentMap = {
    default: 'Default',
    inline: 'Inline',
    grid: 'Grid',
    card: 'Card',
  } as const

  // ================= 计算属性 =================

  /**
   * * @description: 当前激活的布局组件名称
   * ? @computed 根据layoutType动态返回对应的组件名称
   * ! @return {string} 布局组件名称
   */
  const layoutComponentName = computed(() => {
    return layoutComponentMap[props.layoutType] || layoutComponentMap.default
  })

  /**
   * * @description: 合并后的布局配置
   * ? @computed 将布局类型和布局配置合并
   * ! @return {LayoutConfig} 完整的布局配置对象
   */
  const mergedLayoutConfig = computed(() => {
    return {
      type: props.layoutType,
      ...props.layoutConfig,
    }
  })

  /**
   * * @description: 生成表单项VNode数组
   * ? @computed 将配置项转换为可渲染的Vue节点
   * ! @return {VNode[]} 表单项Vue节点数组
   */
  const formItems = computed(() => {
    return props.options
      .filter(item => item.show !== false)
      .map(item => {
        return h(
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
      })
  })

  // ================= 组件类型映射（保持原来的方式）=================

  /**
   * * @description: 基础组件映射表
   * ? @constant 映射表单控件类型到Naive UI组件
   */
  const componentMap = {
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

  /**
   * * @description: 需要特殊处理的组件类型
   * ? @constant 这些组件需要额外的渲染逻辑
   */
  const specialTypes = [
    'select',
    'checkbox',
    'radio',
    'upload',
    'editor',
  ] as const

  // ================= 表单项渲染核心逻辑（保持原来的逻辑）=================

  /**
   * * @description: 渲染表单项的主入口函数
   * ? @param {FormOption} item 表单项配置
   * ! @return {VNode | null} 渲染后的Vue节点或null
   */
  const renderFormItem = (item: FormOption) => {
    try {
      // 特殊组件使用专门的渲染函数
      if (specialTypes.includes(item.type as any)) {
        return renderSpecialComponent(item)
      }

      // 基础组件通过映射表渲染
      const Component = componentMap[item.type as keyof typeof componentMap]
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
   * * @description: 渲染需要特殊处理的组件
   * ? @param {FormOption} item 表单项配置
   * ! @return {VNode | null} 渲染后的Vue节点或null
   */
  const renderSpecialComponent = (item: FormOption) => {
    const baseProps = getBaseProps(item)

    switch (item.type) {
      case 'select':
        return h(resolveComponent('NSelect'), {
          ...baseProps,
          options:
            item.children?.map(child => ({
              value: child.value,
              label: child.label,
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
                    item.children?.map(child =>
                      h(resolveComponent('NCheckbox'), {
                        value: child.value,
                        label: child.label,
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
                    item.children?.map(child =>
                      h(
                        resolveComponent('NRadio'),
                        {
                          value: child.value,
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
        return h('div', {
          id: `editor-${item.prop}`,
          class: 'min-h-96 w-full border rounded',
        })

      default:
        return null
    }
  }

  /**
   * * @description: 渲染文件上传组件
   * ? @param {FormOption} item 表单项配置
   * ! @return {VNode} 上传组件的Vue节点
   */
  const renderUploadComponent = (item: FormOption) => {
    const currentInstance = getCurrentInstance()

    return h(
      resolveComponent('NUpload'),
      {
        fileList: formModel[item.prop] || [],
        'onUpdate:fileList': (fileList: UploadFileInfo[]) => {
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
   * * @description: 获取表单项的基础属性
   * ? @param {FormOption} item 表单项配置
   * ! @return {Record<string, any>} 基础属性对象
   */
  const getBaseProps = (item: FormOption): Record<string, any> => {
    const baseProps: Record<string, any> = {
      value: formModel[item.prop],
      'onUpdate:value': (value: any) => {
        formModel[item.prop] = value
        handleFieldChange(item.prop)
      },
    }

    // textarea类型特殊处理
    if (item.type === 'textarea') {
      baseProps.type = 'textarea'
    }

    // 添加占位符
    if (item.placeholder) {
      baseProps.placeholder = item.placeholder
    }

    return baseProps
  }

  // ================= 字段变化处理 =================

  /**
   * * @description: 处理字段值变化
   * ? @param {string} field 字段名
   * ! @return {void}
   */
  const handleFieldChange = (field: string): void => {
    if (props.validateOnValueChange) {
      // 延迟验证，避免输入过程中频繁提示
      nextTick(() => {
        validateField(field).catch(() => {
          // 静默处理验证失败，让用户继续输入
        })
      })
    }
  }

  // ================= 工具函数 =================

  /**
   * * @description: 根据组件类型获取默认值
   * ? @param {string} type 组件类型
   * ! @return {any} 对应类型的默认值
   */
  const getDefaultValue = (type: string): any => {
    const defaultValueMap: Record<string, any> = {
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
    }
    return defaultValueMap[type] ?? null
  }

  /**
   * * @description: 初始化表单数据和验证规则
   * ? @function 根据配置项设置默认值和验证规则
   * ! @return {void}
   */
  const initialize = (): void => {
    try {
      // 清空现有规则
      Object.keys(formRules).forEach(key => delete formRules[key])

      props.options.forEach(item => {
        // 设置表单项的值：优先使用配置的value，否则使用默认值
        formModel[item.prop] =
          item.value !== undefined ? item.value : getDefaultValue(item.type)

        // 设置验证规则 - 使用统一的验证规则系统
        if (item.rules && item.rules.length > 0) {
          formRules[item.prop] = _mergeRules(item.rules)
        }
      })

      // 在下一个tick初始化富文本编辑器
      nextTick(() => initEditors())
    } catch (error) {
      console.error('[C_Form] 初始化失败:', error)
    }
  }

  /**
   * * @description: 初始化富文本编辑器实例
   * ? @function 只处理type为'editor'的表单项
   * ! @return {void}
   */
  const initEditors = (): void => {
    props.options
      .filter(item => item.type === 'editor')
      .forEach(item => {
        const container = document.getElementById(`editor-${item.prop}`)
        if (container && !editorInstances.has(item.prop)) {
          try {
            const editor = new Editor(container)
            editor.config.placeholder = item.placeholder || ''
            editor.config.onchange = (html: string) => {
              formModel[item.prop] = html
              handleFieldChange(item.prop)
            }
            editor.create()
            editor.txt.html(String(formModel[item.prop] ?? ''))
            editorInstances.set(item.prop, editor)
            emit('editor-mounted', editor, item.prop)
          } catch (error) {
            console.error(`[C_Form] 初始化编辑器失败 (${item.prop}):`, error)
          }
        }
      })
  }

  // ================= 验证相关方法 =================

  /**
   * * @description: 验证整个表单
   * ? @async 异步验证所有表单项
   * ! @return {Promise<void>} 验证结果Promise
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
   * * @description: 验证指定字段
   * ? @async 异步验证单个或多个字段
   * @param {string | string[]} field 字段名或字段名数组
   * ! @return {Promise<void>} 验证结果Promise
   */
  const validateField = async (field: string | string[]): Promise<void> => {
    if (!formRef.value) {
      throw new Error('[C_Form] 表单引用不存在')
    }

    const fields = Array.isArray(field) ? field : [field]
    await formRef.value.validate(fields as any)
  }

  /**
   * * @description: 清除验证状态
   * ? @param {string | string[]} field 字段名或字段名数组，不传则清除所有
   * ! @return {void}
   */
  const clearValidation = (field?: string | string[]): void => {
    if (!formRef.value) return

    if (field) {
      // Naive UI 的 restoreValidation 不支持指定字段
      // 作为替代方案，我们可以通过重新设置表单项值来间接清除验证状态
      const fields = Array.isArray(field) ? field : [field]
      fields.forEach(fieldName => {
        if (formModel[fieldName] !== undefined) {
          // 通过重新赋值同样的值来触发清除验证状态
          const currentValue = formModel[fieldName]
          formModel[fieldName] = currentValue
        }
      })
    } else {
      formRef.value.restoreValidation()
    }
  }

  // ================= 事件处理方法 =================

  /**
   * * @description: 处理表单提交事件
   * ? @async 先验证后提交
   * ! @return {Promise<void>}
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
   * * @description: 处理表单重置事件
   * ? @function 清除验证状态并重置所有字段值
   * ! @return {void}
   */
  const handleReset = (): void => {
    try {
      // 清除验证状态
      clearValidation()

      // 重置表单值
      props.options.forEach(item => {
        const defaultValue =
          item.value !== undefined ? item.value : getDefaultValue(item.type)
        formModel[item.prop] = defaultValue

        // 重置富文本编辑器内容
        const editor = editorInstances.get(item.prop)
        if (editor) {
          editor.txt.html(String(defaultValue ?? ''))
        }
      })
    } catch (error) {
      console.error('[C_Form] 重置表单失败:', error)
    }
  }

  // ================= 对外暴露的API方法 =================

  const resetFields = (): void => handleReset()

  /**
   * * @description: 设置多个字段的值
   * ? @param {Record<string, any>} fields 字段值对象
   * ! @return {void}
   */
  const setFields = (fields: Record<string, any>): void => {
    Object.assign(formModel, fields)
  }

  /**
   * * @description: 获取表单数据的副本
   * ? @function 返回当前表单数据的浅拷贝
   * ! @return {Record<string, any>} 表单数据对象
   */
  const getModel = (): Record<string, any> => ({ ...formModel })

  /**
   * * @description: 设置单个字段值并可选择是否立即验证
   * ? @async 支持异步验证
   * @param {string} field 字段名
   * @param {any} value 字段值
   * @param {boolean} shouldValidate 是否立即验证
   * ! @return {Promise<void>}
   */
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

  /**
   * * @description: 获取指定字段的值
   * ? @param {string} field 字段名
   * ! @return {any} 字段值
   */
  const getFieldValue = (field: string): any => {
    return formModel[field]
  }

  /**
   * * @description: 批量设置字段值并可选择是否立即验证
   * ? @async 支持异步验证
   * @param {Record<string, any>} fields 字段值对象
   * @param {boolean} shouldValidate 是否立即验证
   * ! @return {Promise<void>}
   */
  const setFieldsValue = async (
    fields: Record<string, any>,
    shouldValidate: boolean = false
  ): Promise<void> => {
    Object.assign(formModel, fields)

    if (shouldValidate) {
      await validate()
    }
  }

  // ================= 生命周期管理 =================

  onMounted(() => {
    // 初始化表单
    initialize()

    // 监听配置变化，重新初始化
    watch(
      () => props.options,
      () => {
        initialize()
      },
      { deep: true }
    )

    // 监听外部传入的数据变化
    watch(
      () => props.modelValue,
      val => {
        if (val) {
          Object.assign(formModel, val)
        }
      },
      { immediate: true, deep: true }
    )

    // 同步内部数据到外部
    watch(
      formModel,
      val => {
        emit('update:modelValue', { ...val })
      },
      { deep: true }
    )
  })

  onBeforeUnmount(() => {
    // 清理富文本编辑器实例，防止内存泄漏
    editorInstances.forEach(editor => {
      try {
        editor.destroy()
      } catch (error) {
        console.warn('[C_Form] 销毁编辑器失败:', error)
      }
    })
    editorInstances.clear()
  })

  // ================= 组件暴露接口 =================

  /**
   * * @description: 对外暴露的组件方法和属性
   * ? @defineExpose 使父组件可以通过ref访问这些方法
   */
  defineExpose({
    // 验证相关
    validate,
    validateField,
    clearValidation,

    // 数据操作
    getModel,
    setFields,
    resetFields,
    setFieldValue,
    getFieldValue,
    setFieldsValue,

    // 组件实例
    formRef,
    formModel,

    // 初始化
    initialize,
  })
</script>
