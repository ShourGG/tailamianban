<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-30 13:45:01
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-01 21:44:44
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
    @submit.prevent="handleSubmit"
  >
    <!-- 循环渲染表单项 -->
    <template
      v-for="item in props.options"
      :key="item.prop"
    >
      <NFormItem
        v-if="item.show !== false"
        :label="item.label ?? undefined"
        :path="item.prop"
      >
        <!-- 常规表单项 -->
        <template v-if="!specialTypes.includes(item.type)">
          <component
            :is="componentMap[item.type as FormItemType]"
            v-model:value="formModel[item.prop]"
            v-bind="item.attrs"
          >
            <!-- 嵌套子项 -->
            <template
              v-for="child in item.children"
              :key="child.value"
            >
              <component
                :is="childComponentMap[child.type as 'option' | 'checkboxItem']"
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

  const props = defineProps<{
    options: FormOption[]
    modelValue?: Record<string, FormFieldType>
  }>()

  const emit = defineEmits<{
    (e: 'submit', model: Record<string, FormFieldType>): void
    (e: 'update:modelValue', model: Record<string, FormFieldType>): void
    (e: 'editor-mounted', editor: Editor, prop: string): void
  }>()

  const formRef = ref<FormInst | null>(null)
  const formModel = reactive<Record<string, any>>({})
  const formRules = reactive<FormRules>({})
  const editorInstances = new Map<string, Editor>()

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

  // 初始化表单
  const initialize = (): void => {
    props.options.forEach(item => {
      formModel[item.prop] = item.value ?? getDefaultValue(item.type)
      if (item.rules) {
        // 这里自动合并校验规则，使其串行单一展示
        formRules[item.prop] = _mergeRules(
          Array.isArray(item.rules) ? item.rules : [item.rules]
        )
      }
    })
    nextTick(initEditors)
  }

  // 生命周期
  onMounted(initialize)
  onBeforeUnmount(() => {
    editorInstances.forEach(editor => editor.destroy())
    editorInstances.clear()
  })

  // 编辑器初始化
  const initEditors = (): void => {
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

  // 事件处理
  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    try {
      await formRef.value?.validate()
      emit('submit', { ...formModel })
    } catch {}
  }

  const handleReset = () => {
    formRef.value?.restoreValidation()
    props.options.forEach(item => {
      formModel[item.prop] = item.value ?? getDefaultValue(item.type)
      const editor = editorInstances.get(item.prop)
      editor?.txt.html(String(formModel[item.prop] ?? ''))
    })
  }

  const handleUploadChange = (item: FormOption, fileList: UploadFileInfo[]) => {
    formModel[item.prop] = fileList.map(file => file.file as File)
  }

  // 生命周期
  onMounted(() => initialize())
  onBeforeUnmount(() => {
    editorInstances.forEach(editor => editor.destroy())
    editorInstances.clear()
  })

  watch(
    () => props.options,
    newOptions => {
      newOptions.forEach(item => {
        // 确保规则更新后重新赋值
        if (item.rules) {
          formRules[item.prop] = item.rules
        }
      })
      initialize()
    },
    { deep: true }
  )
  watch(
    () => props.modelValue,
    val => {
      if (val) {
        for (const key in val) {
          formModel[key] = val[key]
        }
      }
    },
    { immediate: true, deep: true }
  )
  watch(
    formModel,
    val => {
      emit('update:modelValue', { ...val })
    },
    { deep: true }
  )

  defineExpose({
    validate: () => formRef.value?.validate(),
    reset: () => {
      formRef.value?.restoreValidation()
      handleReset()
    },
    getModel: () => formModel,
    setFields: (fields: Record<string, FormFieldType>) => {
      Object.assign(formModel, fields)
    },
    // 添加初始化方法暴露
    initialize,
  })
</script>
