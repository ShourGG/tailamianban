<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-13 18:38:58
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-09-02 09:47:31
 * @FilePath: \Robot_Admin\src\components\global\C_Table\index.vue
 * @Description: 超级表格组件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 -->

<template>
  <div class="c-table-wrapper">
    <!-- 动态行工具栏 -->
    <component
      v-if="tableManager.dynamicRowsState"
      :is="tableManager.dynamicRowsState.renderToolbar()"
    />

    <!-- 表格主体 -->
    <NDataTable
      ref="tableRef"
      v-bind="tableProps"
      :columns="computedColumns"
      :data="pagination.paginatedData.value"
      :loading="loading"
      :row-key="rowKey"
      :expanded-row-keys="tableManager.expandedKeys.value"
      :checked-row-keys="tableManager.checkedKeys.value"
      :render-expand="renderExpandFunction"
      @update:expanded-row-keys="tableManager.expandState?.handleExpandChange"
      @update:checked-row-keys="tableManager.expandState?.handleSelectionChange"
    />

    <!-- 分页组件 -->
    <NPagination
      v-if="pagination.paginationConfig.value"
      v-bind="pagination.paginationConfig.value"
      class="pagination-wrapper"
    />

    <!-- 编辑模态框 -->
    <NModal
      v-if="config.editMode === 'modal'"
      v-model:show="tableManager.editStates.modalEdit.isModalVisible.value"
      :title="config.modalTitle"
      :width="config.modalWidth"
      preset="card"
      :mask-closable="false"
      :close-on-esc="false"
      class="w60%"
      :closable="false"
    >
      <C_Form
        v-if="
          tableManager.editStates.modalEdit.isModalVisible.value &&
          formOptions.length
        "
        ref="cFormRef"
        :key="formKey"
        :model-value="tableManager.editStates.modalEdit.editingData"
        :options="formOptions"
        layout-type="grid"
        :layout-config="{ grid: { cols: 2, xGap: 16, yGap: 16 } }"
        :show-default-actions="false"
        @update:model-value="handleFormUpdate"
      />

      <template #action>
        <NSpace justify="end">
          <NButton @click="tableManager.editStates.modalEdit.cancelEdit"
            >取消</NButton
          >
          <NButton
            type="primary"
            :loading="submitLoading"
            @click="handleModalSave"
          >
            保存
          </NButton>
        </NSpace>
      </template>
    </NModal>

    <!-- 查看模态框 -->
    <NModal
      v-model:show="viewModalVisible"
      title="查看详情"
      :width="config.modalWidth"
      preset="card"
      class="w60%"
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
          :span="getDescriptionSpan(column)"
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

    <!-- 动态行确认删除模态框 -->
    <component
      v-if="tableManager.dynamicRowsState"
      :is="tableManager.dynamicRowsState.renderConfirmModal()"
    />
  </div>
</template>

<script setup lang="ts">
  import type { VNodeChild, ComponentPublicInstance } from 'vue'
  import { type DataTableRowKey, type DataTableColumn } from 'naive-ui/es'
  import type {
    TableColumn,
    TableProps,
    TableInstance,
    TableEmits,
    DataRecord,
    ParentChildLinkMode,
  } from '@/types/modules/table'
  import type { DynamicRowsOptions } from '@/composables/Table/useDynamicRow'
  import { useTableManager } from '@/composables/Table/useTableManager'
  import { usePagination } from '@/composables/Table/usePagination'
  import { useTableActions } from '@/composables/Table/useTableActions'
  import {
    getDisplayValue,
    generateFormOptions,
    getTableProps,
    processColumnConfig,
    getDescriptionSpan,
    createUnifiedConfig,
    createEditModeChecker,
    renderEditComponent,
    renderDisplayCell,
    renderEditingCell,
    renderEditableCell,
    type TablePresetConfig,
  } from './data'

  // ================= 类型定义 =================
  interface CFormInstance {
    validate: () => Promise<void>
  }

  export interface TableActions<T extends DataRecord = DataRecord> {
    edit?:
      | false
      | {
          api?: string
          onEdit?: (row: T, index: number) => void | Promise<void>
        }
    delete?:
      | false
      | {
          api?: string
          onDelete?: (row: T, index: number) => void | Promise<void>
          confirmText?: string | ((row: T) => string)
        }
    detail?:
      | false
      | {
          onView?: (row: T, index: number) => void
        }
    custom?: Array<{
      key: string
      label: string
      icon?: string
      type?: 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error'
      onClick: (row: T, index: number) => void | Promise<void>
      show?: (row: T, index: number) => boolean
    }>
  }

  interface EnhancedTableProps<T extends DataRecord = DataRecord>
    extends TableProps<T> {
    preset?: TablePresetConfig<T>
    actions?: TableActions<T>
    expandable?: boolean
    onLoadExpandData?: (row: T) => Promise<any[]> | any[]
    renderExpandContent?: (
      row: T,
      expandData: any[],
      loading: boolean,
      childSelection?: any
    ) => VNodeChild
    rowExpandable?: (row: T) => boolean
    defaultExpandedKeys?: DataTableRowKey[]
    enableSelection?: boolean
    defaultCheckedKeys?: DataTableRowKey[]
    rowCheckable?: (row: T) => boolean
    maxSelection?: number
    enableChildSelection?: boolean
    childRowCheckable?: (childRow: any, parentRow: T) => boolean
    enableParentChildLink?: boolean
    parentChildLinkMode?: ParentChildLinkMode
    dynamicRowsOptions?: DynamicRowsOptions<T>
  }

  // ================= Props & Emit =================
  const props = withDefaults(defineProps<EnhancedTableProps>(), {
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
    expandable: false,
    enableSelection: false,
    enableChildSelection: false,
    enableParentChildLink: false,
    parentChildLinkMode: 'loose',
    dynamicRowsOptions: undefined,
    preset: undefined,
    actions: () => ({}),
    pagination: () => true,
  })

  const emit = defineEmits<
    TableEmits & {
      'row-add': [newRow: DataRecord]
      'row-delete': [deletedRow: DataRecord, index: number]
      'row-copy': [originalRow: DataRecord, newRow: DataRecord]
      'row-move': [row: DataRecord, fromIndex: number, toIndex: number]
      'row-selection-change': [
        selectedKey: DataTableRowKey | null,
        selectedRow: DataRecord | null,
      ]
      'pagination-change': [page: number, pageSize: number]
    }
  >()

  // ================= 响应式状态 =================
  const tableRef = ref<ComponentPublicInstance>()
  const cFormRef = ref<CFormInstance>()
  const viewModalVisible = ref(false)
  const viewingData = ref<DataRecord>({})
  const submitLoading = ref(false)

  // ================= 计算属性 =================
  const config = computed(() => ({
    ...createUnifiedConfig(props),
    parentChildLinkMode: props.parentChildLinkMode as ParentChildLinkMode,
  }))

  const editableColumns = computed(() =>
    props.columns.filter((col): col is TableColumn => col.editable !== false)
  )
  const displayColumns = computed(() =>
    processColumnConfig(props.columns).filter(col => col.key !== '_actions')
  )
  const tableProps = computed(() => getTableProps(props))
  const formKey = computed(
    () =>
      `edit-form-${tableManager.editStates.modalEdit.editingRowKey.value || 'new'}`
  )
  const formOptions = computed(() => generateFormOptions(editableColumns.value))
  const renderExpandFunction = computed(() => undefined)
  const editModeChecker = computed(() => createEditModeChecker(config.value))

  // ================= Hooks 初始化 =================

  // 分页 Hook
  const pagination = usePagination({
    data: toRef(props, 'data'),
    config: computed(() => config.value.pagination),
    emit,
  })

  // 表格管理器
  const tableManager = useTableManager({
    config: config.value,
    data: () => props.data,
    rowKey: props.rowKey,
    emit,
  })

  // 操作按钮 Hook
  const tableActions = useTableActions({
    actions: computed(() => props.actions || {}),
    config,
    tableManager,
    rowKey: props.rowKey,
    emit,
    onViewDetail: (data: DataRecord) => {
      viewingData.value = { ...data }
      viewModalVisible.value = true
    },
    rowActions: props.rowActions,
  })

  // ================= 模态框事件处理 =================
  const handleFormUpdate = (value: DataRecord) => {
    Object.assign(tableManager.editStates.modalEdit.editingData, value)
  }

  const handleModalSave = async () => {
    if (!cFormRef.value) return

    submitLoading.value = true
    try {
      await cFormRef.value.validate()
      await tableManager.editStates.modalEdit.saveEdit()
    } finally {
      submitLoading.value = false
    }
  }

  // ================= 单元格渲染函数 =================
  const renderCell = (
    column: TableColumn,
    rowData: DataRecord,
    rowIndex: number
  ): VNodeChild => {
    const value = rowData[column.key]
    const rowKey = props.rowKey(rowData)

    if (editModeChecker.value.isNonEditable(column)) {
      return renderDisplayCell(column, rowData, rowIndex, value)
    }

    if (
      editModeChecker.value.isRowEditMode() &&
      tableManager.editStates.rowEdit.isEditingRow(rowKey)
    ) {
      return renderEditComponent(
        column,
        tableManager.editStates.rowEdit.getEditingRowData(rowKey)?.[
          column.key
        ] ?? value,
        val =>
          tableManager.editStates.rowEdit.updateEditingRowData(
            rowKey,
            column.key,
            val
          )
      )
    }

    if (editModeChecker.value.isCellEditMode()) {
      const isEditingCell = tableManager.editStates.cellEdit.isEditingCell(
        rowKey,
        column.key
      )

      return isEditingCell
        ? renderEditingCell(
            column,
            tableManager.editStates.cellEdit.getEditingCellValue(
              rowKey,
              column.key
            ) ?? rowData[column.key],
            val =>
              tableManager.editStates.cellEdit.updateEditingCellValue(
                rowKey,
                column.key,
                val
              ),
            () => tableManager.editStates.cellEdit.saveEditCell(),
            () => tableManager.editStates.cellEdit.cancelEditCell()
          )
        : renderEditableCell(column, rowData, rowIndex, value, () =>
            tableManager.editStates.cellEdit.startEditCell(rowKey, column.key)
          )
    }

    return renderDisplayCell(column, rowData, rowIndex, value)
  }

  // ================= 计算列配置 =================
  const computedColumns = computed((): DataTableColumn[] => {
    let columns: DataTableColumn[] = props.columns.map(column => ({
      ...column,
      width: column.width || props.columnWidth,
      titleAlign: 'center' as const,
      align: 'center' as const,
      render: (rowData: DataRecord, rowIndex: number) =>
        renderCell(column, rowData, rowIndex),
    }))

    // 功能列增强
    if (tableManager.dynamicRowsState) {
      columns = tableManager.dynamicRowsState.enhanceColumns(
        columns as any
      ) as DataTableColumn[]
    }

    if (
      tableManager.expandState &&
      (config.value.expandable || config.value.enableSelection)
    ) {
      columns = tableManager.expandState.getTableColumns(
        columns as any
      ) as DataTableColumn[]
    }

    // 操作列
    if (config.value.showRowActions) {
      columns.push({
        key: '_actions',
        title: '操作',
        align: 'center' as const,
        titleAlign: 'center' as const,
        width: 200,
        render: tableActions.renderActions,
      })
    }

    return columns
  })

  // ================= 组件暴露 =================
  defineExpose<
    TableInstance & {
      addRow: () => void
      insertRow: () => void
      deleteRow: () => void
      copyRow: () => void
      moveRowUp: () => void
      moveRowDown: () => void
      clearRowSelection: () => void
      getSelectedRowData: () => DataRecord | null
      printTable: (elementRef?: HTMLElement) => Promise<void>
      downloadTableScreenshot: (
        elementRef?: HTMLElement,
        filename?: string
      ) => Promise<void>
      // 分页相关方法
      resetToFirstPage: () => void
      getTotalPages: () => number
    }
  >({
    // 编辑相关
    startEdit: tableManager.stateManager.edit.start,
    cancelEdit: tableManager.stateManager.edit.cancel,
    saveEdit: tableManager.stateManager.edit.save,
    isEditing: tableManager.stateManager.edit.isEditing,
    getEditingData: tableManager.stateManager.edit.getEditingData,

    // 展开相关
    expandRow: tableManager.stateManager.expand.row,
    collapseRow: tableManager.stateManager.expand.collapse,
    toggleExpand: tableManager.stateManager.expand.toggle,
    expandAll: tableManager.stateManager.expand.all,
    collapseAll: tableManager.stateManager.expand.collapseAll,
    isExpanded: tableManager.stateManager.expand.isExpanded,

    // 选择相关
    selectRow: tableManager.stateManager.selection.select,
    unselectRow: tableManager.stateManager.selection.unselect,
    selectAll: tableManager.stateManager.selection.all,
    clearSelection: tableManager.stateManager.selection.clear,
    isRowSelected: tableManager.stateManager.selection.isSelected,
    getSelectedRows: tableManager.stateManager.selection.getSelected,

    // 子选择相关
    selectChildRow: tableManager.stateManager.childSelection.select,
    unselectChildRow: tableManager.stateManager.childSelection.unselect,
    selectAllChildren: tableManager.stateManager.childSelection.selectAll,
    clearChildrenSelection: tableManager.stateManager.childSelection.clear,
    getChildSelectedRows: tableManager.stateManager.childSelection.getSelected,
    clearAllSelections: tableManager.stateManager.clearAllSelections,

    // 动态行相关
    addRow: tableManager.stateManager.dynamicRows.add,
    insertRow: tableManager.stateManager.dynamicRows.insert,
    deleteRow: tableManager.stateManager.dynamicRows.delete,
    copyRow: tableManager.stateManager.dynamicRows.copy,
    moveRowUp: tableManager.stateManager.dynamicRows.moveUp,
    moveRowDown: tableManager.stateManager.dynamicRows.moveDown,
    clearRowSelection: tableManager.stateManager.dynamicRows.clearSelection,
    getSelectedRowData: tableManager.stateManager.dynamicRows.getSelected,
    printTable: tableManager.stateManager.dynamicRows.print,
    downloadTableScreenshot: tableManager.stateManager.dynamicRows.download,

    // 分页相关方法
    resetToFirstPage: pagination.resetToFirstPage,
    getTotalPages: pagination.getTotalPages,
  })
</script>

<style scoped lang="scss">
  @use './index.scss';

  .pagination-wrapper {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }
</style>
