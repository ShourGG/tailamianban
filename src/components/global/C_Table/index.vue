<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-13 18:38:58
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-15 13:18:30
 * @FilePath: \Robot_Admin\src\components\global\C_Table\index.vue
 * @Description: 超级表格组件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="c-table-wrapper">
    <!-- 表格主体 -->
    <NDataTable
      ref="tableRef"
      v-bind="tableProps"
      :columns="computedColumns"
      :data="data"
      :loading="loading"
      :row-key="rowKey"
    />

    <!-- 编辑模态框 -->
    <NModal
      class="w60%"
      v-if="editMode === 'modal'"
      v-model:show="modalEdit.isModalVisible.value"
      :title="modalTitle"
      :width="modalWidth"
      preset="card"
      :mask-closable="false"
      :close-on-esc="false"
    >
      <C_Form
        v-if="modalEdit.isModalVisible.value && formOptions.length > 0"
        ref="cFormRef"
        :key="formKey"
        :model-value="modalEdit.editingData"
        :options="formOptions"
        :layout-type="'grid'"
        :layout-config="{ grid: { cols: 2, xGap: 16, yGap: 16 } }"
        :show-default-actions="false"
        @update:model-value="handleFormUpdate"
      />

      <template #action>
        <NSpace justify="end">
          <NButton @click="modalEdit.cancelEdit">取消</NButton>
          <NButton
            type="primary"
            :loading="submitLoading"
            @click="handleModalSave"
            >保存</NButton
          >
        </NSpace>
      </template>
    </NModal>

    <!-- 查看模态框 -->
    <NModal
      class="w60%"
      v-model:show="viewModalVisible"
      title="查看详情"
      :width="modalWidth"
      preset="card"
    >
      <NDescriptions
        v-if="viewModalVisible"
        :column="2"
        label-placement="left"
      >
        <NDescriptionsItem
          v-for="column in displayColumns"
          :key="column.key"
          :label="column.title"
          :span="
            column.key === 'description' ||
            column.editProps?.type === 'textarea'
              ? 2
              : 1
          "
        >
          {{ getDisplayValue(column, viewingData) }}
        </NDescriptionsItem>
      </NDescriptions>
      <template #action>
        <NSpace justify="end">
          <NButton @click="viewModalVisible = false">关闭</NButton>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>

<script setup lang="ts">
  import type { VNodeChild } from 'vue'
  import {
    NInputNumber,
    NDatePicker,
    NSelect,
    NInput,
    NSwitch,
    NIcon,
    NSpace,
    NButton,
    type DataTableRowKey,
    type DataTableColumn,
  } from 'naive-ui/es'
  import type {
    TableColumn,
    TableProps,
    TableInstance,
  } from '@/types/modules/table'
  import { useRowEdit } from '../../../composables/Table/useRowEdit'
  import { useCellEdit } from '../../../composables/Table/useCellEdit'
  import { useModalEdit } from '../../../composables/Table/useModalEdit'
  import {
    getDisplayValue,
    generateFormOptions,
    getTableProps,
    processColumnConfig,
  } from './data'

  type DataRecord = Record<string, unknown>

  const props = withDefaults(defineProps<TableProps>(), {
    rowKey: (row: DataRecord) => row.id,
    loading: false,
    striped: true,
    bordered: true,
    singleLine: true,
    size: 'medium',
    editable: true,
    editMode: 'both',
    showRowActions: true,
    modalTitle: '编辑数据',
    modalWidth: 600,
    columnWidth: 180,
  })

  const emit = defineEmits<{
    'update:data': [data: DataRecord[]]
    save: [rowData: DataRecord, rowIndex: number, columnKey?: string]
    cancel: [rowData: DataRecord, rowIndex: number]
  }>()

  // Refs
  const tableRef = ref()
  const cFormRef = ref()
  const viewModalVisible = ref(false)
  const viewingData = ref<DataRecord>({})
  const submitLoading = ref(false)

  // 计算属性
  const editableColumns = computed(() =>
    props.columns.filter(col => col.editable !== false)
  )
  const displayColumns = computed(() =>
    processColumnConfig(props.columns).filter(col => col.key !== '_actions')
  )
  const tableProps = computed(() => getTableProps(props))
  const formKey = computed(
    () => `edit-form-${modalEdit.editingRowKey.value || 'new'}`
  )
  const formOptions = computed(() => generateFormOptions(editableColumns.value))

  // 🔥 完全修复：正确的编辑组件映射
  const EDIT_COMPONENTS = {
    // Vue 组件 - 需要用 h() 函数渲染
    number: NInputNumber,
    switch: NSwitch,
    input: NInput,

    // 自定义渲染函数 - 可以直接调用
    date: (componentProps: any) =>
      h(NDatePicker, { ...componentProps, type: 'date', format: 'yyyy-MM-dd' }),
    select: (componentProps: any) =>
      h(NSelect, { ...componentProps, options: componentProps.options || [] }),
    textarea: (componentProps: any) =>
      h(NInput, { ...componentProps, type: 'textarea', rows: 3 }),
  } as const

  // 核心处理函数
  const handleSave = async (
    rowData: DataRecord,
    rowIndex: number,
    columnKey?: string
  ) => {
    if (!rowData || rowIndex < 0 || rowIndex >= props.data.length) return

    const newData = [...props.data]
    newData[rowIndex] = { ...newData[rowIndex], ...rowData }

    emit('update:data', newData)
    await nextTick()
    emit('save', newData[rowIndex], rowIndex, columnKey)
  }

  const handleCancel = (rowData: DataRecord, rowIndex: number) => {
    emit('cancel', rowData, rowIndex)
  }

  const handleFormUpdate = (value: DataRecord) => {
    Object.assign(modalEdit.editingData, value)
  }

  const handleModalSave = async () => {
    if (!cFormRef.value) return
    submitLoading.value = true
    try {
      await cFormRef.value.validate()
      await modalEdit.saveEdit()
    } finally {
      submitLoading.value = false
    }
  }

  const renderEditComponent = (
    column: TableColumn,
    value: unknown,
    onUpdate: (val: unknown) => void
  ): VNodeChild => {
    if (column.editRender) return column.editRender(value, {}, 0)

    const componentProps = {
      value,
      'onUpdate:value': onUpdate,
      placeholder: `请输入${column.title}`,
      style: { width: '100%' },
      ...column.editProps,
    }

    const editType = column.editType || 'input'
    const Component =
      EDIT_COMPONENTS[editType as keyof typeof EDIT_COMPONENTS] ||
      EDIT_COMPONENTS.input

    return h(Component as Component, componentProps)
  }

  // renderCell 函数
  const renderCell = (
    column: TableColumn,
    rowData: DataRecord,
    rowIndex: number
  ): VNodeChild => {
    const value = rowData[column.key]
    const rowKey = props.rowKey(rowData)

    // 基础渲染策略
    const strategies = [
      // 非编辑模式
      () =>
        !props.editable ||
        column.editable === false ||
        props.editMode === 'none',
      // 行编辑模式
      () =>
        (props.editMode === 'row' || props.editMode === 'both') &&
        rowEdit.isEditingRow(rowKey),
      // 单元格编辑模式
      () =>
        (props.editMode === 'cell' || props.editMode === 'both') &&
        cellEdit.isEditingCell(rowKey, column.key),
      // 可编辑单元格
      () =>
        (props.editMode === 'cell' || props.editMode === 'both') &&
        !rowEdit.isEditingRow(rowKey),
    ]

    const renders = [
      // 基础渲染 - 确保返回值类型安全
      (): VNodeChild => {
        if (column.render) {
          const result = column.render(rowData, rowIndex)
          return result !== null && result !== undefined
            ? result
            : String(value ?? '')
        }
        return String(value ?? '')
      },

      // 行编辑渲染
      (): VNodeChild =>
        renderEditComponent(
          column,
          rowEdit.getEditingRowData(rowKey)?.[column.key] ?? value,
          val => rowEdit.updateEditingRowData(rowKey, column.key, val)
        ),

      // 单元格编辑渲染
      (): VNodeChild =>
        h(
          'div',
          {
            class: 'relative w-full min-h-9 flex items-center overflow-visible',
          },
          [
            // 输入框容器
            h(
              'div',
              {
                class: 'flex-1 min-w-0 pr-20',
              },
              [
                renderEditComponent(
                  column,
                  cellEdit.getEditingCellValue(rowKey, column.key) ?? value,
                  val =>
                    cellEdit.updateEditingCellValue(rowKey, column.key, val)
                ),
              ]
            ),

            // 操作按钮
            h(
              'div',
              {
                class:
                  'absolute top-1/2 right-1 -translate-y-1/2 flex items-center gap-1 bg-white/95 backdrop-blur-sm border border-gray-200/80 rounded-md px-2 py-1 shadow-md z-50 opacity-90 hover:opacity-100 hover:bg-white hover:shadow-lg hover:border-gray-300 transition-all duration-200',
              },
              [
                // 保存按钮
                h(
                  'button',
                  {
                    class:
                      'flex items-center justify-center w-6 h-6 rounded-md text-green-600 hover:text-green-700 hover:bg-green-50 hover:scale-110 active:scale-95 transition-all duration-200 flex-shrink-0',
                    title: '保存',
                    type: 'button',
                    onClick: (e: Event) => {
                      e.stopPropagation()
                      e.preventDefault()
                      cellEdit.saveEditCell()
                    },
                  },
                  [h('i', { class: 'i-mdi:check w-4 h-4' })]
                ),

                // 取消按钮
                h(
                  'button',
                  {
                    class:
                      'flex items-center justify-center w-6 h-6 rounded-md text-red-600 hover:text-red-700 hover:bg-red-50 hover:scale-110 active:scale-95 transition-all duration-200 flex-shrink-0',
                    title: '取消',
                    type: 'button',
                    onClick: (e: Event) => {
                      e.stopPropagation()
                      e.preventDefault()
                      cellEdit.cancelEditCell()
                    },
                  },
                  [h('i', { class: 'i-mdi:close w-4 h-4' })]
                ),
              ]
            ),
          ]
        ),

      // 可编辑单元格渲染
      (): VNodeChild =>
        h('div', { class: 'cell-edit-wrapper' }, [
          h(
            'span',
            { class: 'cell-value' },
            column.render
              ? (column.render(rowData, rowIndex) ?? String(value ?? ''))
              : String(value ?? '')
          ),
          h('i', {
            class: 'i-mdi:square-edit-outline cell-edit-icon ml-4px',
            onClick: (e: Event) => {
              e.stopPropagation()
              cellEdit.startEditCell(rowKey, column.key)
            },
          }),
        ]),
    ]

    const strategyIndex = strategies.findIndex(strategy => strategy())
    return renders[strategyIndex] ? renders[strategyIndex]() : renders[0]()
  }

  const renderActions = (rowData: DataRecord, rowIndex: number): VNodeChild => {
    const rowKey = props.rowKey(rowData)
    const actions: VNodeChild[] = []

    // 编辑相关操作
    if (props.editMode === 'row' || props.editMode === 'both') {
      actions.push(rowEdit.renderRowActions(rowKey))
    }

    if (props.editMode === 'modal') {
      actions.push(
        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            quaternary: true,
            onClick: () => modalEdit.startEdit(rowKey),
          },
          () => [
            h(NIcon, { size: 14 }, () => h('i', { class: 'i-mdi:pencil' })),
            '编辑',
          ]
        )
      )
    }

    // 自定义操作
    if (!rowEdit.isEditingRow(rowKey)) {
      props.rowActions?.forEach(action => {
        if (action.show?.(rowData, rowIndex) === false) return

        const onClick =
          action.label === '查看'
            ? () => {
                viewingData.value = { ...rowData }
                viewModalVisible.value = true
              }
            : () => action.onClick(rowData, rowIndex)

        actions.push(
          h(
            NButton,
            {
              size: 'small',
              type: action.type || 'default',
              quaternary: true,
              onClick,
            },
            () => [
              action.icon &&
                h(NIcon, { size: 14 }, () => h('i', { class: action.icon })),
              action.label,
            ]
          )
        )
      })
    }

    return h(NSpace, { size: 2, wrap: false }, () => actions)
  }

  // 计算列配置
  const computedColumns = computed((): DataTableColumn[] => {
    const columns: DataTableColumn[] = props.columns.map(column => ({
      ...column,
      width: column.width || props.columnWidth,
      titleAlign: 'center' as const,
      align: 'center' as const,
      render: (rowData: DataRecord, rowIndex: number) =>
        renderCell(column, rowData, rowIndex),
    }))

    if (props.showRowActions && (props.editable || props.rowActions?.length)) {
      columns.push({
        key: '_actions',
        title: '操作',
        align: 'center' as const,
        titleAlign: 'center' as const,
        render: renderActions,
      })
    }

    return columns
  })

  // 组合式函数初始化
  const rowEdit = useRowEdit({
    data: () => props.data,
    rowKey: props.rowKey,
    onSave: handleSave,
    onCancel: handleCancel,
  })

  const cellEdit = useCellEdit({
    data: () => props.data,
    rowKey: props.rowKey,
    onSave: handleSave,
  })

  const modalEdit = useModalEdit({
    data: () => props.data,
    rowKey: props.rowKey,
    onSave: handleSave,
    onCancel: handleCancel,
  })

  // 编辑模式处理
  const handleStartEdit = (rowKey: DataTableRowKey, columnKey?: string) => {
    switch (props.editMode) {
      case 'modal':
        modalEdit.startEdit(rowKey)
        break
      case 'cell':
        if (columnKey) {
          cellEdit.startEditCell(rowKey, columnKey)
        }
        break
      case 'row':
      case 'both':
        rowEdit.startEditRow(rowKey)
        break
      case 'none':
      default:
        // 不执行任何操作
        break
    }
  }

  // 暴露方法
  defineExpose<TableInstance>({
    startEdit: handleStartEdit,

    /**
     * @description: 取消编辑操作
     */
    cancelEdit() {
      if (modalEdit.isModalVisible.value) modalEdit.cancelEdit()
      else if (cellEdit.editingCell.value.rowKey) cellEdit.cancelEditCell()
      else if (rowEdit.editingRowKey.value) rowEdit.cancelEditRow()
    },

    /**
     * @description:  保存编辑操作
     */
    async saveEdit() {
      if (modalEdit.isModalVisible.value) await handleModalSave()
      else if (cellEdit.editingCell.value.rowKey) await cellEdit.saveEditCell()
      else if (rowEdit.editingRowKey.value) await rowEdit.saveEditRow()
    },

    /**
     * * @description: 检查是否正在编辑
     * ? @param {*} rowKey  行号
     * ? @param {*} columnKey  列号
     * ! @return {*}
     */
    isEditing(rowKey: DataTableRowKey, columnKey?: string) {
      if (props.editMode === 'modal') return modalEdit.isEditingRow(rowKey)
      if (columnKey) return cellEdit.isEditingCell(rowKey, columnKey)
      return rowEdit.isEditingRow(rowKey)
    },

    /**
     * @description: 获取正在编辑的数据
     */
    getEditingData() {
      if (modalEdit.isModalVisible.value) return modalEdit.editingData
      if (rowEdit.editingRowKey.value)
        return rowEdit.getEditingRowData(rowEdit.editingRowKey.value)
      return null
    },
  })
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
