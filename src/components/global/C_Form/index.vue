<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-30 13:45:01
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-30 15:42:58
 * @FilePath: \Robot_Admin\src\components\global\C_Form\index.vue
 * @Description: 表单组件 - 精简优雅版本，支持动态渲染多种表单控件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <NForm
    ref="formRef"
    :model="formModel"
    :rules="formRules"
    :validate-on-rule-change="false"
    v-bind="$attrs"
  >
    <!-- 表单项循环渲染 -->
    <template
      v-for="item in props.options"
      :key="item.prop"
    >
      <NFormItem
        v-if="item.show !== false"
        :label="item.label"
        :path="item.prop"
      >
        <!-- 动态渲染表单项，根据类型自动选择组件 -->
        <component :is="renderFormItem(item)" />
      </NFormItem>
    </template>

    <!-- 表单操作区域，支持自定义插槽 -->
    <NFormItem>
      <slot
        name="action"
        :form="formRef"
        :model="formModel"
      >
        <NSpace>
          <NButton
            type="primary"
            native-type="submit"
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
  import { _mergeRules } from '@/utils/v_verify'

  // ================= 类型定义 =================

  /**
   * * @description 支持的表单组件类型枚举
   * ! @note 新增组件类型时需要同步更新 componentMap 或 specialTypes
   */
  type FormItemType =
    | 'input' // 输入框
    | 'textarea' // 文本域
    | 'inputNumber' // 数字输入框
    | 'select' // 下拉选择
    | 'checkbox' // 复选框组
    | 'radio' // 单选框组
    | 'switch' // 开关
    | 'slider' // 滑块
    | 'rate' // 评分
    | 'datePicker' // 日期选择
    | 'daterange' // 日期范围选择
    | 'timePicker' // 时间选择
    | 'cascader' // 级联选择
    | 'colorPicker' // 颜色选择
    | 'upload' // 文件上传
    | 'editor' // 富文本编辑器

  /**
   * * @description 子选项配置接口，用于 select、checkbox、radio 等组件
   */
  interface ChildOption {
    value: string | number | boolean // 选项值
    label: string // 选项显示文本
    attrs?: Record<string, unknown> // 选项额外属性
  }

  /**
   * * @description 表单项配置接口
   */
  interface FormOption {
    type: FormItemType // 组件类型
    prop: string // 表单字段名，作为 key 使用
    label?: string // 表单项标签
    value?: any // 默认值
    placeholder?: string // 占位符文本
    rules?: FormRules[string] // 验证规则
    attrs?: Record<string, unknown> // 组件属性
    uploadAttrs?: Record<string, unknown> // 上传组件专用属性
    uploadTip?: string // 上传提示文本
    children?: ChildOption[] // 子选项配置
    show?: boolean // 是否显示，默认 true
  }

  /**
   * * @description 表单字段值类型，支持各种数据类型
   */
  type FormFieldType = any

  // ================= 组件配置映射 =================

  /**
   * * @description 简单组件映射表，使用 resolveComponent 适配自动导入
   * ? @note 这些组件可以直接通过 h() 函数渲染，无需特殊处理
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
   * * @description 需要特殊处理的组件类型列表
   * ? @note 这些组件需要额外的子组件渲染或特殊逻辑处理
   */
  const specialTypes: FormItemType[] = [
    'select', // 需要渲染 options
    'checkbox', // 需要渲染子复选框
    'radio', // 需要渲染子单选框
    'upload', // 需要处理文件上传和插槽
    'editor', // 需要初始化富文本编辑器
  ]

  // ================= 组件属性定义 =================

  const props = defineProps<{
    options: FormOption[] // 表单配置项数组
    modelValue?: Record<string, FormFieldType> // 双向绑定的表单数据
  }>()

  const emit = defineEmits<{
    // 表单提交事件
    (
      e: 'submit',
      payload: { model: Record<string, FormFieldType>; form: FormInst }
    ): void
    // 表单数据更新事件
    (e: 'update:modelValue', model: Record<string, FormFieldType>): void
    // 富文本编辑器挂载完成事件
    (e: 'editor-mounted', editor: Editor, prop: string): void
    // 文件上传相关事件
    (e: 'on-preview', file: any): void
    (e: 'on-remove', file: any): void
    (e: 'before-remove', file: any): Promise<boolean>
    (e: 'on-exceed', data: any): void
    (e: 'on-success', data: any): void
  }>()

  // ================= 响应式数据 =================

  const formRef = ref<FormInst | null>(null) // 表单实例引用
  const formModel = reactive<Record<string, any>>({}) // 表单数据模型
  const formRules = reactive<FormRules>({}) // 表单验证规则
  const editorInstances = new Map<string, Editor>() // 富文本编辑器实例缓存

  // ================= 核心渲染函数 =================

  /**
   * * @description 渲染表单项的主入口函数
   * ? @param item - 表单项配置
   * ! @return 渲染的 VNode 或 null
   */
  const renderFormItem = (item: FormOption) => {
    try {
      // 特殊组件使用专门的渲染函数
      if (specialTypes.includes(item.type)) {
        return renderSpecialComponent(item)
      }

      // 常规组件通过映射表渲染
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
   * * @description 渲染需要特殊处理的组件
   * ? @param item - 表单项配置
   * ! @return 渲染的 VNode 或 null
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
              ...child.attrs,
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
                        ...child.attrs,
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
                          ...child.attrs,
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
          class: 'h-96 w-full border rounded',
        })

      default:
        console.warn(`[C_Form] 未处理的特殊组件类型: ${item.type}`)
        return null
    }
  }

  /**
   * * @description 渲染上传组件，单独提取以减少复杂度
   * ? @param item - 表单项配置
   * ! @return 上传组件的 VNode
   */
  const renderUploadComponent = (item: FormOption) => {
    const currentInstance = getCurrentInstance()

    return h(
      resolveComponent('NUpload'),
      {
        fileList: formModel[item.prop] || [],
        'onUpdate:fileList': (fileList: UploadFileInfo[]) =>
          handleUploadChange(item, fileList),
        onChange: ({ fileList }: { fileList: UploadFileInfo[] }) =>
          handleUploadChange(item, fileList),
        onPreview: (file: any) => emit('on-preview', file),
        onRemove: (file: any) => emit('on-remove', file),
        onBeforeRemove: (file: any) => emit('before-remove', file),
        onExceed: (data: any) => emit('on-exceed', data),
        onSuccess: (data: any) => emit('on-success', data),
        ...item.uploadAttrs,
      },
      {
        // 上传触发器插槽
        trigger: () =>
          currentInstance?.slots['uploadClick']?.() ||
          currentInstance?.slots[`${item.prop}-upload-trigger`]?.() ||
          h(
            resolveComponent('NButton'),
            { type: 'primary', class: 'mr-4' },
            { default: () => '选择文件' }
          ),
        // 上传提示插槽
        tip: () =>
          currentInstance?.slots['uploadTip']?.() ||
          currentInstance?.slots[`${item.prop}-upload-tip`]?.() ||
          (item.uploadTip
            ? h('span', { class: 'text-gray-400' }, item.uploadTip)
            : null),
      }
    )
  }

  /**
   * * @description 获取表单项的基础属性
   * ? @param item - 表单项配置
   * ! @return 基础属性对象
   */
  const getBaseProps = (item: FormOption): Record<string, any> => {
    const baseProps: Record<string, any> = {
      value: formModel[item.prop],
      'onUpdate:value': (value: any) => {
        formModel[item.prop] = value
      },
    }

    // textarea 类型特殊处理
    if (item.type === 'textarea') {
      baseProps.type = 'textarea'
    }

    // 添加占位符
    if (item.placeholder) {
      baseProps.placeholder = item.placeholder
    }

    return baseProps
  }

  // ================= 工具方法 =================

  /**
   * * @description 根据组件类型获取默认值
   * ? @param type - 表单组件类型
   * ! @return 对应类型的默认值
   */
  const getDefaultValue = (type: FormItemType): FormFieldType => {
    const defaultValueMap: Record<FormItemType, FormFieldType> = {
      // 文本类型默认为空字符串
      input: '',
      textarea: '',
      editor: '',
      // 选择类型默认为 null
      select: null,
      datePicker: null,
      daterange: null,
      timePicker: null,
      cascader: null,
      colorPicker: null,
      // 数组类型默认为空数组
      checkbox: [],
      upload: [],
      // 单选类型默认为空字符串
      radio: '',
      // 数字类型默认为 0
      inputNumber: 0,
      slider: 0,
      rate: 0,
      // 布尔类型默认为 false
      switch: false,
    }

    return defaultValueMap[type] ?? null
  }

  /**
   * * @description 初始化表单数据和验证规则
   * ! @note 会根据配置项设置默认值和验证规则
   */
  const initialize = (): void => {
    try {
      props.options.forEach(item => {
        // 设置表单项的值：优先使用配置的 value，否则使用默认值
        formModel[item.prop] =
          item.value !== undefined ? item.value : getDefaultValue(item.type)

        // 设置验证规则
        if (item.rules) {
          formRules[item.prop] = _mergeRules(
            Array.isArray(item.rules) ? item.rules : [item.rules]
          )
        }
      })

      // 在下一个 tick 初始化富文本编辑器
      nextTick(() => initEditors())
    } catch (error) {
      console.error('[C_Form] 初始化失败:', error)
    }
  }

  /**
   * * @description 初始化富文本编辑器实例
   * ? @note 只处理 type 为 'editor' 的表单项
   */
  const initEditors = (): void => {
    props.options
      .filter(item => item.type === 'editor')
      .forEach(item => {
        const container = document.getElementById(`editor-${item.prop}`)

        if (container && !editorInstances.has(item.prop)) {
          try {
            const editor = new Editor(container)

            // 配置编辑器
            editor.config.placeholder = item.placeholder || ''
            editor.config.onchange = (html: string) => {
              formModel[item.prop] = html
            }

            // 创建编辑器实例
            editor.create()
            editor.txt.html(String(formModel[item.prop] ?? ''))

            // 缓存实例并触发挂载事件
            editorInstances.set(item.prop, editor)
            emit('editor-mounted', editor, item.prop)
          } catch (error) {
            console.error(`[C_Form] 初始化编辑器失败 (${item.prop}):`, error)
          }
        }
      })
  }

  /**
   * * @description 重置表单到初始状态
   * ! @note 会清除验证状态并重置所有字段值
   */
  const handleReset = (): void => {
    try {
      // 清除验证状态
      formRef.value?.restoreValidation()

      // 重置所有字段值
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

  /**
   * * @description 处理文件上传变化
   * ? @param item - 表单项配置
   * ? @param fileList - 文件列表
   */
  const handleUploadChange = (
    item: FormOption,
    fileList: UploadFileInfo[]
  ): void => {
    formModel[item.prop] = fileList
  }

  // ================= 暴露的方法 =================

  /**
   * * @description 验证表单
   * ! @return Promise<void> 验证结果，成功时 resolve，失败时 reject
   */
  const validate = async (): Promise<void> => {
    if (!formRef.value) {
      throw new Error('[C_Form] 表单引用不存在')
    }
    await formRef.value.validate()
  }

  /**
   * * @description 重置表单字段
   */
  const resetFields = (): void => handleReset()

  /**
   * * @description 设置表单字段值
   * ? @param fields - 要设置的字段对象
   */
  const setFields = (fields: Record<string, FormFieldType>): void => {
    Object.assign(formModel, fields)
  }

  /**
   * * @description 获取表单数据的副本
   * ! @return 表单数据对象
   */
  const getModel = (): Record<string, FormFieldType> => ({ ...formModel })

  // ================= 生命周期管理 =================

  onMounted(() => {
    // 初始化表单
    initialize()

    // 监听配置变化，重新初始化
    watch(() => props.options, initialize, { deep: true })

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
    watch(formModel, val => emit('update:modelValue', { ...val }), {
      deep: true,
    })
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

  defineExpose({
    validate, // 验证表单
    resetFields, // 重置表单
    getModel, // 获取表单数据
    setFields, // 设置表单字段
    initialize, // 初始化表单
    formRef, // 表单实例引用
    formModel, // 表单数据模型
  })
</script>
