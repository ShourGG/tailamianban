<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-01 13:27:49
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-02 21:44:26
 * @FilePath: \Robot_Admin\src\components\global\C_Editor\index.vue
 * @Description: 富文本编辑器组件（修复版）
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎. 
-->

<template>
  <!-- 编辑器容器 -->
  <div
    ref="editorContainer"
    :id="editorId"
    v-show="isInitialized"
    class="w-full"
  ></div>
</template>

<script setup lang="ts">
  import E from 'wangeditor'
  /**
   * * @description 编辑器组件属性接口
   * ! @interface Props
   */
  interface Props {
    /** 编辑器唯一标识 */
    editorId: string
    /** 编辑器初始值 */
    modelValue?: string
    /** 占位符 */
    placeholder?: string
    /** 是否禁用 */
    disabled?: boolean
    /** 是否只读 */
    readonly?: boolean
    /** 编辑器高度 */
    height?: number
  }

  /**
   * * @description 编辑器组件事件接口
   * ! @interface Emits
   */
  interface Emits {
    (e: 'update:modelValue', value: string): void
    (e: 'editor-mounted', editor: any): void
    (e: 'editor-change', html: string): void
  }

  // ================= 组件属性和事件 =================

  const props = withDefaults(defineProps<Props>(), {
    modelValue: '',
    placeholder: '',
    disabled: false,
    readonly: false,
    height: 240, // 🎯 默认高度240px
  })

  const emit = defineEmits<Emits>()

  // ================= 响应式状态 =================

  const editorContainer = ref<HTMLElement | null>(null)
  const editorInstance = ref<any>(null)
  const isInitialized = ref<boolean>(false)

  // ================= 编辑器初始化 =================

  /**
   * * @description 初始化编辑器
   */
  const initializeEditor = (): void => {
    if (!editorContainer.value || isInitialized.value) return

    try {
      const editor = new E(editorContainer.value)

      // 配置编辑器 - 使用类型断言避免TypeScript错误
      const editorConfig = editor.config as any
      editorConfig.placeholder = props.placeholder

      // 🎯 设置编辑器高度限制
      editorConfig.height = props.height - 50 // 减去工具栏高度

      // 监听内容变化
      editorConfig.onchange = (html: string) => {
        emit('update:modelValue', html)
        emit('editor-change', html)
      }

      // 创建编辑器
      editor.create()

      // 🎯 编辑器创建后立即稳定化
      nextTick(() => {
        // 设置初始内容
        if (props.modelValue) {
          editor.txt.html(props.modelValue)
        }

        // 设置只读状态
        if (props.readonly) {
          editor.disable()
        }

        // 保存实例并标记为已初始化
        editorInstance.value = editor
        isInitialized.value = true

        // 触发挂载事件
        emit('editor-mounted', editor)

        console.log(`[EditorComponent] 编辑器初始化成功: ${props.editorId}`)
      })
    } catch (error) {
      console.error(
        `[EditorComponent] 编辑器初始化失败: ${props.editorId}`,
        error
      )
    }
  }

  /**
   * * @description 销毁编辑器
   */
  const destroyEditor = (): void => {
    if (editorInstance.value && isInitialized.value) {
      try {
        editorInstance.value.destroy()
        editorInstance.value = null
        isInitialized.value = false
        console.log(`[EditorComponent] 编辑器销毁成功: ${props.editorId}`)
      } catch (error) {
        console.error(
          `[EditorComponent] 编辑器销毁失败: ${props.editorId}`,
          error
        )
      }
    }
  }

  /**
   * * @description 设置编辑器内容
   * ? @param html HTML内容
   */
  const setContent = (html: string): void => {
    if (editorInstance.value && isInitialized.value) {
      try {
        editorInstance.value.txt.html(html)
      } catch (error) {
        console.warn(
          `[EditorComponent] 设置编辑器内容失败: ${props.editorId}`,
          error
        )
      }
    }
  }

  /**
   * * @description 获取编辑器内容
   * ! @return HTML内容
   */
  const getContent = (): string => {
    if (editorInstance.value && isInitialized.value) {
      try {
        return editorInstance.value.txt.html()
      } catch (error) {
        console.warn(
          `[EditorComponent] 获取编辑器内容失败: ${props.editorId}`,
          error
        )
        return ''
      }
    }
    return ''
  }

  // ================= 监听器 =================

  // 监听modelValue变化
  watch(
    () => props.modelValue,
    newValue => {
      if (editorInstance.value && isInitialized.value) {
        const currentContent = editorInstance.value.txt.html()
        if (currentContent !== newValue) {
          editorInstance.value.txt.html(newValue || '')
        }
      }
    }
  )

  // 监听禁用状态
  watch(
    () => props.disabled,
    disabled => {
      if (editorInstance.value && isInitialized.value) {
        try {
          if (disabled) {
            editorInstance.value.disable()
          } else {
            editorInstance.value.enable()
          }
        } catch (error) {
          console.warn(
            `[EditorComponent] 设置编辑器状态失败: ${props.editorId}`,
            error
          )
        }
      }
    }
  )

  // 监听只读状态
  watch(
    () => props.readonly,
    readonly => {
      if (editorInstance.value && isInitialized.value) {
        try {
          if (readonly) {
            editorInstance.value.disable()
          } else {
            editorInstance.value.enable()
          }
        } catch (error) {
          console.warn(
            `[EditorComponent] 设置编辑器只读状态失败: ${props.editorId}`,
            error
          )
        }
      }
    }
  )

  // ================= 生命周期 =================

  onMounted(() => {
    // 🎯 延迟初始化，确保页面布局稳定
    nextTick(() => {
      setTimeout(() => {
        initializeEditor()
      }, 200) // 增加延迟时间
    })
  })

  onBeforeUnmount(() => {
    destroyEditor()
  })

  // ================= 对外暴露 =================

  defineExpose({
    initializeEditor,
    destroyEditor,
    setContent,
    getContent,
    editorInstance: readonly(editorInstance),
    isInitialized: readonly(isInitialized),
  })
</script>
