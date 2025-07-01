<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-13 18:38:58
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-07-01 15:55:35
 * @FilePath: \Robot_Admin\src\views\demo\10-table\index.vue
 * @Description: 表格组件演示
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="table-demo-page">
    <NH1>表格组件场景示例</NH1>
    <NCard>
      <NSpace
        vertical
        :size="20"
      >
        <!-- 编辑模式切换 -->
        <NCard
          title="编辑模式选择"
          size="small"
        >
          <NSpace>
            <NRadioGroup v-model:value="editMode">
              <NRadioButton
                v-for="mode in EDIT_MODES"
                :key="mode.value"
                :value="mode.value"
              >
                <template #icon>
                  <C_Icon :name="mode.icon" />
                </template>
                {{ mode.label }}
              </NRadioButton>
            </NRadioGroup>

            <NDivider vertical />

            <NButton
              @click="addNewRow"
              type="primary"
              :disabled="editMode === 'none'"
            >
              <template #icon>
                <C_Icon name="mdi:plus" />
              </template>
              添加新行
            </NButton>
          </NSpace>
        </NCard>

        <!-- 当前模式说明 -->
        <NAlert
          :type="currentModeConfig.alertType"
          :title="currentModeConfig.title"
        >
          {{ currentModeConfig.description }}
        </NAlert>

        <!-- 表格组件 -->
        <C_Table
          ref="tableRef"
          v-model:data="tableData"
          :columns="tableColumns"
          :loading="loading"
          :edit-mode="editMode"
          :editable="editMode !== 'none'"
          modal-title="编辑员工信息"
          :modal-width="700"
          :actions="tableActions"
          @save="handleSave"
          @cancel="handleCancel"
        />
      </NSpace>
    </NCard>
  </div>
</template>

<script setup lang="ts">
  import type { EditMode, DataRecord } from '@/types/modules/table'
  import {
    EDIT_MODES,
    MODE_CONFIG,
    initialTableData,
    getTableColumns,
    createNewEmployee,
    type Employee,
  } from './data'

  // ================= 组合式函数 =================
  const message = useMessage()
  const dialog = useDialog()

  // ================= 响应式状态 =================
  const loading = ref(false)
  const tableRef = ref()
  const editMode = ref<EditMode>('modal')
  const tableData = ref<Employee[]>([...initialTableData])

  // ================= 计算属性 =================
  const currentModeConfig = computed(() => MODE_CONFIG[editMode.value])
  const tableColumns = computed(() => getTableColumns())

  // 🎯 表格操作配置 - 使用新的内置操作方式
  const tableActions = computed(() => ({
    // 使用默认的编辑、删除、详情按钮
    custom: [
      {
        key: 'copy',
        label: '复制',
        icon: 'mdi:content-copy',
        type: 'default' as const,
        onClick: handleCopy,
      },
      {
        key: 'authorize',
        label: '授权',
        icon: 'mdi:shield-key',
        type: 'warning' as const,
        onClick: handleAuthorize,
      },
    ],
  }))

  // ================= 业务逻辑 =================

  /**
   * @description 添加新行到表格顶部，并根据编辑模式自动开始编辑
   */
  const addNewRow = () => {
    const newRow = createNewEmployee()
    tableData.value.unshift(newRow)

    // 根据编辑模式自动开始编辑
    setTimeout(() => {
      if (['modal', 'row', 'both'].includes(editMode.value)) {
        tableRef.value?.startEdit(newRow.id)
      }
    }, 100)
  }

  /**
   * @description 复制员工信息，在当前行后插入副本
   * @param row - 要复制的员工数据
   * @param index - 当前行索引
   */
  const handleCopy = (row: DataRecord, index: number) => {
    const employeeRow = row as Employee
    const newRow: Employee = {
      ...employeeRow,
      id: Date.now(),
      name: `${employeeRow.name}_副本`,
    }
    tableData.value.splice(index + 1, 0, newRow)
    message.success('复制成功')
  }

  /**
   * @description 处理员工授权操作，显示授权配置对话框
   * @param row - 要授权的员工数据
   * @param index - 当前行索引
   */
  const handleAuthorize = (row: DataRecord) => {
    const employeeRow = row as Employee
    dialog.info({
      title: '员工授权',
      content: `正在为员工 "${employeeRow.name}" 配置系统权限...`,
      positiveText: '确定',
      onPositiveClick: () => {
        message.success('授权配置完成')
      },
    })
  }

  /**
   * @description 处理数据保存，支持行级和单元格级保存
   * @param rowData - 修改后的行数据
   * @param rowIndex - 行索引
   * @param columnKey - 列键（单元格编辑时有值）
   */
  const handleSave = async (
    rowData: Record<string, any>,
    rowIndex: number,
    columnKey?: string
  ): Promise<void> => {
    console.log('🎯 handleSave被调用:', { rowData, rowIndex, columnKey })
    loading.value = true

    try {
      // 模拟异步保存
      await new Promise(resolve => setTimeout(resolve, 500))

      // 更新数据
      tableData.value[rowIndex] = { ...rowData } as Employee

      const columnTitle = tableColumns.value.find(
        (c: any) => c.key === columnKey
      )?.title

      const msg = columnKey ? `${columnTitle}已更新` : '员工信息保存成功'

      message.success(msg)
    } catch (error) {
      console.error('💥 保存失败:', error)
      message.error('保存失败，请重试')
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * @description 处理编辑取消操作
   */
  const handleCancel = () => {
    message.info('已取消编辑')
  }
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
