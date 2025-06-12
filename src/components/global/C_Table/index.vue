<!-- src/components/global/C_Table/index.vue -->
<template>
  <div class="c-table-wrapper">
    <n-data-table
      ref="tableRef"
      v-bind="tableProps"
      :columns="computedColumns"
      :data="data"
      :loading="loading"
      :row-key="rowKey"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, h, ref, reactive } from 'vue'
  import type { DataTableRowKey, DataTableColumns } from 'naive-ui'
  import type { VNodeChild } from 'vue'
  import {
    NDataTable,
    NInput,
    NButton,
    NSpace,
    NInputNumber,
    NDatePicker,
    NSelect,
  } from 'naive-ui'

  // ========== 类型定义（内联） ==========
  // 编辑模式类型
  type EditMode = 'row' | 'cell' | 'none'

  // 编辑状态
  interface EditState {
    rowKey: DataTableRowKey | null
    columnKey: string | null
    mode: EditMode
  }

  // 表格列配置
  interface TableColumn<T = any>
    extends Omit<DataTableColumns<T>[number], 'key' | 'render'> {
    key: string
    title: string
    editable?: boolean
    editType?: 'input' | 'select' | 'date' | 'number' | 'custom'
    editProps?: Record<string, any>
    editRender?: (value: any, rowData: T, rowIndex: number) => VNodeChild
    render?: (rowData: T, rowIndex: number) => VNodeChild
    width?: number | string
    align?: 'left' | 'center' | 'right'
  }

  // 表格属性
  interface TableProps<T = any> {
    columns: TableColumn<T>[]
    data: T[]
    rowKey?: (row: T) => DataTableRowKey
    loading?: boolean
    maxHeight?: number | string
    minHeight?: number | string
    scrollX?: number | string
    striped?: boolean
    bordered?: boolean
    singleLine?: boolean
    size?: 'small' | 'medium' | 'large'
    // 编辑相关
    editable?: boolean
    editMode?: 'row' | 'cell' | 'both'
    onSave?: (
      rowData: T,
      rowIndex: number,
      columnKey?: string
    ) => void | Promise<void>
    onCancel?: (rowData: T, rowIndex: number) => void
    // 行操作
    showRowActions?: boolean
    rowActions?: RowAction<T>[]
  }

  // 行操作配置
  interface RowAction<T = any> {
    label: string
    icon?: string
    type?: 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error'
    onClick: (row: T, index: number) => void
    show?: (row: T, index: number) => boolean
    disabled?: (row: T, index: number) => boolean
  }

  // 表格实例方法
  interface TableInstance {
    startEdit: (rowKey: DataTableRowKey, columnKey?: string) => void
    cancelEdit: () => void
    saveEdit: () => Promise<void>
    isEditing: (rowKey: DataTableRowKey, columnKey?: string) => boolean
    getEditingData: () => any
  }

  // 编辑单元格的值类型
  type CellValue = string | number | boolean | Date | null | undefined

  // ========== 组件逻辑 ==========
  // Props
  const props = withDefaults(defineProps<TableProps>(), {
    rowKey: (row: any) => row.id,
    loading: false,
    striped: true,
    bordered: true,
    singleLine: true,
    size: 'medium',
    editable: true,
    editMode: 'both',
    showRowActions: true,
  })

  // Emits
  const emit = defineEmits<{
    'update:data': [data: any[]]
    save: [rowData: any, rowIndex: number, columnKey?: string]
    cancel: [rowData: any, rowIndex: number]
  }>()

  // Refs
  const tableRef = ref()
  const editingData = ref<Record<string, any>>({})
  const editState = reactive<EditState>({
    rowKey: null,
    columnKey: null,
    mode: 'none',
  })

  // 是否正在编辑
  const isEditing = (rowKey: DataTableRowKey, columnKey?: string): boolean => {
    if (!editState.rowKey) return false

    if (editState.mode === 'row') {
      return editState.rowKey === rowKey
    }

    if (editState.mode === 'cell' && columnKey) {
      return editState.rowKey === rowKey && editState.columnKey === columnKey
    }

    return false
  }

  // 开始编辑
  const startEdit = (rowKey: DataTableRowKey, columnKey?: string) => {
    const rowData = props.data.find(row => props.rowKey(row) === rowKey)
    if (!rowData) return

    editState.rowKey = rowKey
    editState.columnKey = columnKey || null
    editState.mode = columnKey ? 'cell' : 'row'

    // 复制当前行数据用于编辑
    editingData.value[rowKey as string] = { ...rowData }
  }

  // 取消编辑
  const cancelEdit = () => {
    const rowIndex = props.data.findIndex(
      row => props.rowKey(row) === editState.rowKey
    )
    if (rowIndex > -1) {
      props.onCancel?.(props.data[rowIndex], rowIndex)
      emit('cancel', props.data[rowIndex], rowIndex)
    }

    editState.rowKey = null
    editState.columnKey = null
    editState.mode = 'none'
    editingData.value = {}
  }

  // 保存编辑
  const saveEdit = async () => {
    if (!editState.rowKey) return

    const rowKey = editState.rowKey
    const columnKey = editState.columnKey
    const rowIndex = props.data.findIndex(row => props.rowKey(row) === rowKey)

    if (rowIndex === -1) return

    const updatedData = editingData.value[rowKey as string]
    if (!updatedData) return

    try {
      // 调用保存回调
      await props.onSave?.(updatedData, rowIndex, columnKey || undefined)

      // 更新数据
      const newData = [...props.data]
      if (editState.mode === 'row') {
        newData[rowIndex] = updatedData
      } else if (editState.mode === 'cell' && columnKey) {
        newData[rowIndex] = {
          ...newData[rowIndex],
          [columnKey]: updatedData[columnKey],
        }
      }

      emit('update:data', newData)
      emit('save', updatedData, rowIndex, columnKey || undefined)

      // 清除编辑状态
      editState.rowKey = null
      editState.columnKey = null
      editState.mode = 'none'
      editingData.value = {}
    } catch (error) {
      console.error('Save failed:', error)
    }
  }

  // 获取编辑数据
  const getEditingData = () => {
    if (!editState.rowKey) return null
    return editingData.value[editState.rowKey as string]
  }

  // 渲染编辑组件
  const renderEditComponent = (
    column: TableColumn,
    value: CellValue,
    rowData: any
  ) => {
    const rowKey = props.rowKey(rowData)
    const editData = editingData.value[rowKey as string] || {}

    const updateValue = (val: CellValue) => {
      if (!editingData.value[rowKey as string]) {
        editingData.value[rowKey as string] = { ...rowData }
      }
      editingData.value[rowKey as string][column.key] = val
    }

    // 自定义编辑渲染
    if (column.editRender) {
      return column.editRender(value, rowData, props.data.indexOf(rowData))
    }

    // 根据编辑类型渲染不同组件
    switch (column.editType) {
      case 'number':
        return h(NInputNumber, {
          value: editData[column.key] ?? value,
          onUpdateValue: updateValue,
          placeholder: `请输入${column.title}`,
          ...column.editProps,
        })

      case 'date':
        return h(NDatePicker, {
          value: editData[column.key] ?? value,
          onUpdateValue: updateValue,
          placeholder: `请选择${column.title}`,
          ...column.editProps,
        })

      case 'select':
        return h(NSelect, {
          value: editData[column.key] ?? value,
          onUpdateValue: updateValue,
          placeholder: `请选择${column.title}`,
          ...column.editProps,
        })

      case 'input':
      default:
        return h(NInput, {
          value: editData[column.key] ?? value,
          onUpdateValue: updateValue,
          placeholder: `请输入${column.title}`,
          ...column.editProps,
        })
    }
  }

  // 渲染单元格
  const renderCell = (column: TableColumn, rowData: any, rowIndex: number) => {
    const value = rowData[column.key]
    const rowKey = props.rowKey(rowData)
    const isEditingCell = isEditing(rowKey, column.key)
    const isEditingRow = isEditing(rowKey)

    // 如果正在编辑（单元格或行编辑模式）
    if (isEditingCell || (isEditingRow && column.editable !== false)) {
      return renderEditComponent(column, value, rowData)
    }

    // 单元格编辑模式 - 显示值和编辑按钮
    if (props.editMode === 'cell' || props.editMode === 'both') {
      if (column.editable !== false) {
        return h(
          'div',
          {
            class: 'cell-edit-wrapper',
          },
          [
            h(
              'span',
              { class: 'cell-value' },
              column.render ? column.render(rowData, rowIndex) : value
            ),
            h('i', {
              class: 'i-mdi:edit cell-edit-icon',
              onClick: (e: Event) => {
                e.stopPropagation()
                startEdit(rowKey, column.key)
              },
            }),
          ]
        )
      }
    }

    // 默认渲染
    return column.render ? column.render(rowData, rowIndex) : value
  }

  // 操作列
  const createActionColumn = (): TableColumn => {
    return {
      key: '_actions',
      title: '操作',
      width: 150,
      align: 'center',
      render: (rowData: any, rowIndex: number) => {
        const rowKey = props.rowKey(rowData)
        const isEditingRow = isEditing(rowKey)

        if (isEditingRow && editState.mode === 'row') {
          return h(
            NSpace,
            {},
            {
              default: () => [
                h(
                  NButton,
                  {
                    size: 'small',
                    type: 'primary',
                    onClick: () => saveEdit(),
                  },
                  { default: () => '保存' }
                ),
                h(
                  NButton,
                  {
                    size: 'small',
                    onClick: () => cancelEdit(),
                  },
                  { default: () => '取消' }
                ),
              ],
            }
          )
        }

        if (editState.mode === 'cell' && editState.rowKey === rowKey) {
          return h(
            NSpace,
            {},
            {
              default: () => [
                h(
                  NButton,
                  {
                    size: 'small',
                    type: 'primary',
                    onClick: () => saveEdit(),
                  },
                  { default: () => '保存' }
                ),
                h(
                  NButton,
                  {
                    size: 'small',
                    onClick: () => cancelEdit(),
                  },
                  { default: () => '取消' }
                ),
              ],
            }
          )
        }

        const actions = []

        // 行编辑按钮
        if (props.editMode === 'row' || props.editMode === 'both') {
          actions.push(
            h(
              NButton,
              {
                size: 'small',
                type: 'primary',
                quaternary: true,
                onClick: () => startEdit(rowKey),
              },
              {
                default: () => [
                  h('i', { class: 'i-carbon-edit mr-1' }),
                  '编辑',
                ],
              }
            )
          )
        }

        // 自定义行操作
        if (props.rowActions) {
          props.rowActions.forEach(action => {
            if (action.show && !action.show(rowData, rowIndex)) return

            actions.push(
              h(
                NButton,
                {
                  size: 'small',
                  type: action.type || 'default',
                  quaternary: true,
                  disabled: action.disabled?.(rowData, rowIndex),
                  onClick: () => action.onClick(rowData, rowIndex),
                },
                {
                  default: () => [
                    action.icon && h('i', { class: `${action.icon} mr-1` }),
                    action.label,
                  ],
                }
              )
            )
          })
        }

        return h(NSpace, {}, { default: () => actions })
      },
    }
  }

  // 计算后的列配置
  const computedColumns = computed(() => {
    const columns = props.columns.map(column => ({
      ...column,
      render: (rowData: any, rowIndex: number) =>
        renderCell(column, rowData, rowIndex),
    }))

    // 添加操作列
    if (props.showRowActions && props.editable) {
      columns.push(createActionColumn())
    }

    return columns
  })

  // 表格属性
  const tableProps = computed(() => {
    const {
      columns,
      data,
      editable,
      editMode,
      onSave,
      onCancel,
      showRowActions,
      rowActions,
      ...rest
    } = props
    return rest
  })

  // 暴露实例方法
  defineExpose<TableInstance>({
    startEdit,
    cancelEdit,
    saveEdit,
    isEditing,
    getEditingData,
  })

  // 导出类型供外部使用
  export type { TableColumn, TableProps, RowAction, TableInstance, CellValue }
</script>

<style scoped>
  .c-table-wrapper {
    width: 100%;
  }

  .cell-edit-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .cell-value {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cell-edit-icon {
    flex-shrink: 0;
    margin-left: 8px;
    font-size: 16px;
    color: var(--n-text-color-3);
    cursor: pointer;
    opacity: 0;
    transition: all 0.3s;
  }

  .cell-edit-wrapper:hover .cell-edit-icon {
    opacity: 1;
    color: var(--n-primary-color);
  }

  .cell-edit-icon:hover {
    transform: scale(1.1);
  }
</style>
