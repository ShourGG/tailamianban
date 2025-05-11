<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-30 13:45:01
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-12 00:54:39
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
    <template
      v-for="item in props.options"
      :key="item.prop"
    >
      <NFormItem
        v-if="item.show !== false"
        :label="item.label"
        :path="item.prop"
      >
        <!-- 常规表单项 -->
        <component
          v-if="!specialTypes.includes(item.type)"
          :is="componentMap[item.type]"
          v-model:value="formModel[item.prop]"
          v-bind="item.attrs"
        >
          <component
            v-for="child in item.children"
            :key="child.value"
            :is="childComponentMap[child.type]"
            :value="child.value"
            :label="child.label"
            v-bind="child.attrs"
          />
        </component>

        <!-- 文件上传 -->
        <NUpload
          v-else-if="item.type === 'upload'"
          v-model:file-list="formModel[item.prop]"
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
      </NFormItem>
    </template>

    <!-- 表单操作区域 -->
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

  // ================= 类型定义 ==========// ...省略其他代码...

  // ==== 修改后代码 ====
  type FormItemType =
    | 'input'
    | 'select'
    | 'checkbox'
    | 'upload'
    | 'editor'
    | 'daterange'

  interface ChildOption {
    type: 'option' | 'checkboxItem'
    value: string | number | boolean
    label: string
    attrs?: Record<string, unknown>
  }

  interface FormOption {
    type: FormItemType
    prop: string
    label?: string
    value?: string | number | boolean | Date | File[] | null
    placeholder?: string
    rules?: FormRules[string]
    attrs?: Record<string, unknown>
    uploadAttrs?: Record<string, unknown>
    uploadTip?: string
    children?: ChildOption[]
    show?: boolean
  }

  type FormFieldType = string | number | boolean | Date | File[] | null

  // ================= 组件配置 ==========// ...省略其他代码...

  // ==== 修改后代码 ====
  const specialTypes: FormItemType[] = ['upload', 'editor']
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

  // ================= 组件属性 ==========// ...省略其他代码...

  // ==== 修改后代码 ====
  const props = defineProps<{
    options: FormOption[]
    modelValue?: Record<string, FormFieldType>
  }>()

  const emit = defineEmits<{
    (
      e: 'submit',
      payload: { model: Record<string, FormFieldType>; form: FormInst }
    ): void
    (e: 'update:modelValue', model: Record<string, FormFieldType>): void
    (e: 'editor-mounted', editor: Editor, prop: string): void
  }>()

  // ================= 响应式数据 ==========// ...省略其他代码...

  // ==== 修改后代码 ====
  const formRef = ref<FormInst | null>(null)
  const formModel = reactive<Record<string, any>>({})
  const formRules = reactive<FormRules>({})
  const editorInstances = new Map<string, Editor>()

  // ================= 工具方法 ==========// ...省略其他代码...

  // ==== 修改后代码 ====
  const getDefaultValue = (type: FormItemType): FormFieldType => {
    switch (type) {
      case 'input':
        return ''
      case 'select':
        return null
      case 'checkbox':
        return []
      case 'upload':
        return []
      case 'editor':
        return ''
      case 'daterange':
        return null
      default:
        return ''
    }
  }

  // ================= 核心方法 ==========// ...省略其他代码...

  // ==== 修改后代码 ====
  const initialize = () => {
    props.options.forEach(item => {
      formModel[item.prop] = item.value ?? getDefaultValue(item.type)
      if (item.rules) {
        formRules[item.prop] = _mergeRules(
          Array.isArray(item.rules) ? item.rules : [item.rules]
        )
      }
    })
    initEditors()
  }

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
          editor.txt.html(String(formModel[item.prop] ?? ''))
          editorInstances.set(item.prop, editor)
          emit('editor-mounted', editor, item.prop)
        }
      })
  }

  const handleReset = () => {
    formRef.value?.restoreValidation()
    props.options.forEach(item => {
      formModel[item.prop] = item.value ?? getDefaultValue(item.type)
      editorInstances
        .get(item.prop)
        ?.txt.html(String(formModel[item.prop] ?? ''))
    })
  }

  const handleUploadChange = (item: FormOption, fileList: UploadFileInfo[]) => {
    formModel[item.prop] = fileList.map(file => file.file as File)
  }

  // ================= 生命周期 ==========// ...省略其他代码...

  // ==== 修改后代码 ====
  onMounted(() => {
    initialize()
    watch(() => props.options, initialize, { deep: true })
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

  onBeforeUnmount(() => {
    editorInstances.forEach(editor => editor.destroy())
    editorInstances.clear()
  })

  // ================= 组件暴露 ==========// ...省略其他代码...

  // ==== 修改后代码 ====
  defineExpose({
    validate: () => formRef.value?.validate(),
    reset: handleReset,
    getModel: () => formModel,
    setFields: (fields: Record<string, FormFieldType>) =>
      Object.assign(formModel, fields),
    initialize,
  })
</script>
