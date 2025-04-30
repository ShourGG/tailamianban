<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-30 13:45:01
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-04-30 17:11:53
 * @FilePath: \Robot_Admin\src\components\global\C_Form\index.vue
 * @Description: 表单组件
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
    <!-- 循环渲染表单项 -->
    <template
      v-for="item in processedOptions"
      :key="item.prop"
    >
      <NFormItem
        v-if="item.show !== false"
        :label="item.label ?? undefined"
        :path="item.prop"
        :rule="formRules[item.prop]"
      >
        <!-- 常规表单项 -->
        <template v-if="!specialTypes.includes(item.type)">
          <component
            :is="componentMap[item.type]"
            v-model:value="formModel[item.prop]"
            v-bind="item.attrs"
            @update:value="handleValueChange(item)"
          >
            <!-- 嵌套子项 -->
            <template
              v-for="child in item.children"
              :key="child.value"
            >
              <component
                :is="childComponentMap[child.type]"
                :value="child.value"
                :label="child.label"
                v-bind="child.attrs"
              />
            </template>
          </component>
        </template>

        <!-- 特殊类型处理 -->
        <template v-else>
          <!-- 文件上传 -->
          <NUpload
            v-if="item.type === 'upload'"
            v-model:file-list="
              formModel[item.prop] as UploadFileInfo[] | undefined
            "
            v-bind="item.uploadAttrs"
            @change="({ fileList }) => handleUploadChange(item, fileList)"
          >
            <template #trigger>
              <slot :name="`${item.prop}-upload-trigger`">
                <NButton
                  type="primary"
                  class="mr-4"
                  >选择文件</NButton
                >
              </slot>
            </template>
            <template #tip>
              <slot :name="`${item.prop}-upload-tip`">
                <span class="text-gray-400">{{ item.uploadTip }}</span>
              </slot>
            </template>
          </NUpload>

          <!-- 富文本编辑器 -->
          <div
            v-else-if="item.type === 'editor'"
            :id="`editor-${item.prop}`"
            class="h-96 w-full border rounded"
          />
        </template>
      </NFormItem>
    </template>

    <!-- 表单操作区域 -->
    <NFormItem>
      <slot
        name="actions"
        :form="formRef"
        :model="formModel"
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
  import {
    type FormInst,
    type FormRules,
    type UploadFileInfo,
    type UploadCustomRequestOptions,
  } from 'naive-ui'
  import Editor from 'wangeditor'
  import { resolveComponent } from 'vue'

  // ================= 类型定义 =================
  type FormItemType =
    | 'input'
    | 'select'
    | 'checkbox'
    | 'upload'
    | 'editor'
    | 'daterange'

  interface FormOption {
    type: FormItemType
    prop: string
    label?: string
    value?: unknown
    placeholder?: string
    rules?: FormRules[string]
    attrs?: Record<string, unknown>
    uploadAttrs?: Record<string, unknown>
    uploadTip?: string
    children?: Array<{
      type: 'option' | 'checkboxItem'
      value: unknown
      label: string
      attrs?: Record<string, unknown>
    }>
    show?: boolean
  }

  type FormFieldType =
    | string
    | number
    | boolean
    | Date
    | File[]
    | null
    | undefined

  // ================= 组件配置 =================
  const specialTypes = ['upload', 'editor']
  const componentMap = {
    input: resolveComponent('NInput'),
    select: resolveComponent('NSelect'),
    checkbox: resolveComponent('NCheckboxGroup'),
    upload: resolveComponent('NUpload'),
    editor: 'div',
    daterange: resolveComponent('NDatePicker'),
  } as const

  const childComponentMap = {
    option: 'NOption',
    checkboxItem: 'NCheckbox',
  } as const

  // ================= 组件逻辑 =================
  const props = defineProps<{
    options: FormOption[]
    immediate?: boolean
  }>()

  const emit = defineEmits<{
    (e: 'submit', model: Record<string, unknown>): void
    (e: 'update:model', model: Record<string, unknown>): void
    (e: 'upload-request', options: UploadCustomRequestOptions): void
    (e: 'editor-mounted', editor: Editor, prop: string): void
  }>()

  // 响应式状态
  const formRef = ref<FormInst | null>(null)
  const formModel = reactive<Record<string, FormFieldType>>({})
  const formRules = reactive<FormRules>({})
  const processedOptions = reactive<FormOption[]>([])
  const editorInstances = new Map<string, Editor>()

  // 初始化方法
  const initialize = () => {
    // 处理配置项
    processedOptions.splice(
      0,
      processedOptions.length,
      ...props.options.map(option => ({
        ...option,
        show: option.show ?? true,
        attrs: { clearable: true, ...option.attrs },
        uploadAttrs: {
          multiple: false,
          accept: '*',
          listType: 'text',
          ...option.uploadAttrs,
        },
      }))
    )

    // 初始化表单值
    props.options.forEach(item => {
      if (!(item.prop in formModel)) {
        formModel[item.prop] =
          (item.value as FormFieldType) ?? getDefaultValue(item.type)
      }
      if (item.rules) formRules[item.prop] = item.rules
    })

    // 延迟初始化编辑器
    nextTick(initEditors)
  }

  // 获取类型默认值
  const getDefaultValue = (type: FormItemType) =>
    ({
      input: '',
      select: null,
      checkbox: [],
      upload: [],
      editor: '',
      daterange: null,
    })[type]

  // 编辑器初始化
  const initEditors = () => {
    props.options
      .filter(item => item.type === 'editor')
      .forEach(item => {
        const container = document.getElementById(`editor-${item.prop}`)
        if (container && !editorInstances.has(item.prop)) {
          const editor = new Editor(container)
          editor.config.placeholder = item.placeholder || ''
          editor.config.onchange = (html: string) => {
            formModel[item.prop] = html
          }
          editor.create()
          editor.txt.html(String(formModel[item.prop] || ''))
          editorInstances.set(item.prop, editor)
          emit('editor-mounted', editor, item.prop)
        }
      })
  }

  // ================= 事件处理 =================
  const handleSubmit = (e: Event) => {
    e.preventDefault()
    formRef.value?.validate(errors => {
      if (!errors) emit('submit', formModel)
    })
  }

  const handleReset = () => {
    formRef.value?.restoreValidation()
    props.options.forEach(item => {
      formModel[item.prop] =
        (item.value as FormFieldType) ?? getDefaultValue(item.type)
      const editor = editorInstances.get(item.prop)
      editor?.txt.html(String(formModel[item.prop] || ''))
    })
  }

  const handleValueChange = (item: FormOption) => {
    emit('update:model', formModel)
    const onChange = item.attrs?.onChange as
      | ((value: unknown) => void)
      | undefined
    onChange?.(formModel[item.prop])
  }

  const handleUploadChange = (item: FormOption, fileList: UploadFileInfo[]) => {
    formModel[item.prop] = fileList.map(file => file.file as File)
  }

  // ================= 生命周期 =================
  onMounted(initialize)
  onBeforeUnmount(() => {
    editorInstances.forEach(editor => editor.destroy())
    editorInstances.clear()
  })

  watch(() => props.options, initialize, { deep: true })

  // ================= 暴露方法 =================
  defineExpose({
    validate: () => formRef.value?.validate(),
    reset: handleReset,
    getModel: () => formModel,
    setFields: (fields: Record<string, unknown>) => {
      Object.assign(formModel, fields)
    },
  })
</script>
