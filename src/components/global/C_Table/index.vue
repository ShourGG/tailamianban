<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-13 18:38:58
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-18 14:06:17
 * @FilePath: \Robot_Admin\src\components\global\C_Table\index.vue
 * @Description: 超级表格组件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 -->

<template>
  <div class="c-table-wrapper">
    <!-- 动态行工具栏 -->
    <div
      v-if="tableManager.dynamicRowsState"
      class="dynamic-rows-toolbar"
    >
      <component :is="tableManager.dynamicRowsState.renderToolbar()" />
    </div>

    <!-- 表格主体 -->
    <NDataTable
      ref="tableRef"
      v-bind="tableProps"
      :columns="computedColumns"
      :data="data"
      :loading="loading"
      :row-key="rowKey"
      :expanded-row-keys="tableManager.expandedKeys.value"
      :checked-row-keys="tableManager.checkedKeys.value"
      :render-expand="renderExpandFunction"
      @update:expanded-row-keys="handleExpandedRowKeysChange"
      @update:checked-row-keys="handleCheckedRowKeysChange"
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
    >
      <C_Form
        v-if="
          tableManager.editStates.modalEdit.isModalVisible.value &&
          formOptions.length > 0
        "
        ref="cFormRef"
        :key="formKey"
        :model-value="tableManager.editStates.modalEdit.editingData"
        :options="formOptions"
        :layout-type="'grid'"
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
    renderRowEditButtons,
    renderModalEditButton,
    renderCustomActionButtons,
    renderActionButtons,
    type TablePresetConfig,
  } from './data'

  interface CFormInstance {
    validate: () => Promise<void>
  }

  // ================= 类型定义 =================

  interface EnhancedTableProps<T extends DataRecord = DataRecord>
    extends TableProps<T> {
    preset?: TablePresetConfig<T>

    // 保留原有配置方式（向下兼容）
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

  // ================= Props 定义 =================

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
    }
  >()

  // ================= 核心状态 =================

  const tableRef = ref<ComponentPublicInstance>()
  const cFormRef = ref<CFormInstance>()
  const viewModalVisible = ref(false)
  const viewingData = ref<DataRecord>({})
  const submitLoading = ref(false)

  // ================= 配置和计算属性 =================

  const config = computed(() => createUnifiedConfig(props))

  // ================= 表格管理器初始化 =================

  const tableManager = useTableManager({
    config: config.value,
    data: () => props.data,
    rowKey: props.rowKey,
    emit,
  })

  // ================= 计算属性 =================

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

  // ================= 事件处理函数 =================

  /**
   * @description: 处理模态框编辑数据更新
   */
  function handleFormUpdate(value: DataRecord) {
    Object.assign(tableManager.editStates.modalEdit.editingData, value)
  }

  /**
   * @description: 处理模态框保存操作
   */
  async function handleModalSave() {
    if (!cFormRef.value) return

    submitLoading.value = true
    try {
      await cFormRef.value.validate()
      await tableManager.editStates.modalEdit.saveEdit()
    } finally {
      submitLoading.value = false
    }
  }

  /**
   * @description: 处理展开行键变化
   */
  function handleExpandedRowKeysChange(keys: DataTableRowKey[]) {
    tableManager.expandState?.handleExpandChange(keys)
  }

  /**
   * @description: 处理选中行键变化
   */
  function handleCheckedRowKeysChange(keys: DataTableRowKey[]) {
    tableManager.expandState?.handleSelectionChange(keys)
  }

  // ================= 渲染函数 =================

  const editModeChecker = computed(() => createEditModeChecker(config.value))

  /**
   * @description: 渲染单元格
   */
  function renderCell(
    column: TableColumn,
    rowData: DataRecord,
    rowIndex: number
  ): VNodeChild {
    const value = rowData[column.key]
    const rowKey = props.rowKey(rowData)

    // 不可编辑
    if (editModeChecker.value.isNonEditable(column)) {
      return renderDisplayCell(column, rowData, rowIndex, value)
    }

    // 行编辑模式
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

    // 单元格编辑模式
    if (editModeChecker.value.isCellEditMode()) {
      return tableManager.editStates.cellEdit.isEditingCell(rowKey, column.key)
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

  /**
   * @description: 渲染操作按钮
   */
  function renderActions(rowData: DataRecord, rowIndex: number): VNodeChild {
    const rowKey = props.rowKey(rowData)
    const actions: VNodeChild[] = []

    // 行编辑按钮
    if (editModeChecker.value.isRowEditMode()) {
      actions.push(
        ...renderRowEditButtons(
          tableManager.editStates.rowEdit.isEditingRow(rowKey),
          () => tableManager.editStates.rowEdit.startEditRow(rowKey),
          () => tableManager.editStates.rowEdit.saveEditRow(),
          () => tableManager.editStates.rowEdit.cancelEditRow()
        )
      )
    }

    // 模态框编辑按钮
    if (config.value.editMode === 'modal') {
      actions.push(
        renderModalEditButton(() =>
          tableManager.editStates.modalEdit.startEdit(rowKey)
        )
      )
    }

    // 自定义操作按钮
    if (
      !tableManager.editStates.rowEdit.isEditingRow(rowKey) &&
      props.rowActions?.length
    ) {
      actions.push(
        ...renderCustomActionButtons(
          props.rowActions,
          rowData,
          rowIndex,
          (data: DataRecord) => {
            viewingData.value = { ...data }
            viewModalVisible.value = true
          }
        )
      )
    }

    return renderActionButtons(actions)
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
    if (
      config.value.showRowActions &&
      (config.value.editable || props.rowActions?.length)
    ) {
      columns.push({
        key: '_actions',
        title: '操作',
        align: 'center' as const,
        titleAlign: 'center' as const,
        width: 120,
        render: renderActions,
      })
    }

    return columns
  })

  // ================= 暴露方法 =================

  defineExpose<
    TableInstance & {
      // 动态行操作方法
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
  })
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
