<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-09-02
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-09-02 09:54:04
 * @FilePath: \Robot_Admin\src\components\global\C_Table\TableEditModal.vue
 * @Description: 表格编辑模态框组件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 -->

<template>
  <NModal
    v-model:show="visible"
    :title="title"
    :width="width"
    preset="card"
    :mask-closable="false"
    :close-on-esc="false"
    class="w60%"
    :closable="false"
  >
    <C_Form
      v-if="visible && formOptions.length"
      ref="cFormRef"
      :key="formKey"
      :model-value="editingData"
      :options="formOptions"
      layout-type="grid"
      :layout-config="{ grid: { cols: 2, xGap: 16, yGap: 16 } }"
      :show-default-actions="false"
      @update:model-value="handleFormUpdate"
    />

    <template #action>
      <NSpace justify="end">
        <NButton @click="handleCancel">取消</NButton>
        <NButton
          type="primary"
          :loading="submitLoading"
          @click="handleSave"
        >
          保存
        </NButton>
      </NSpace>
    </template>
  </NModal>
</template>

<script setup lang="ts">
  import type { FormOption } from '@/types/modules/form'
  import type { DataRecord } from '@/types/modules/table'

  // ================= 类型定义 =================
  interface CFormInstance {
    validate: () => Promise<void>
  }

  interface EditModalProps {
    /** 模态框显示状态 */
    visible: boolean
    /** 模态框标题 */
    title?: string
    /** 模态框宽度 */
    width?: number
    /** 表单选项配置 */
    formOptions: FormOption[]
    /** 编辑数据 */
    editingData: DataRecord
    /** 表单唯一键 */
    formKey: string
  }

  interface EditModalEmits {
    'update:visible': [visible: boolean]
    'update:editingData': [data: DataRecord]
    save: []
    cancel: []
  }

  // ================= Props & Emit =================
  const props = withDefaults(defineProps<EditModalProps>(), {
    title: '编辑数据',
    width: 600,
  })

  const emit = defineEmits<EditModalEmits>()

  // ================= 响应式状态 =================
  const cFormRef = ref<CFormInstance>()
  const submitLoading = ref(false)

  // ================= 计算属性 =================
  const visible = computed({
    get: () => props.visible,
    set: (value: boolean) => emit('update:visible', value),
  })

  // ================= 事件处理 =================

  /**
   * 表单数据更新处理
   */
  const handleFormUpdate = (value: DataRecord) => {
    emit('update:editingData', { ...props.editingData, ...value })
  }

  /**
   * 保存处理
   */
  const handleSave = async () => {
    if (!cFormRef.value) return

    submitLoading.value = true
    try {
      await cFormRef.value.validate()
      emit('save')
    } catch (error) {
      console.error('表单验证失败:', error)
    } finally {
      submitLoading.value = false
    }
  }

  /**
   * 取消处理
   */
  const handleCancel = () => {
    emit('cancel')
  }

  // ================= 组件暴露 =================
  defineExpose({
    /** 表单引用 */
    formRef: cFormRef,
    /** 提交状态 */
    submitLoading: readonly(submitLoading),
    /** 手动保存 */
    save: handleSave,
    /** 手动取消 */
    cancel: handleCancel,
  })
</script>

<style scoped lang="scss">
  // 可以添加模态框特定的样式
</style>
