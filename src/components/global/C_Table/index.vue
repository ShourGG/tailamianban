<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-13 18:38:58
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-08-22 11:26:25
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
      :data="paginatedData"
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
      v-if="paginationConfig"
      v-bind="paginationConfig"
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
  import C_Icon from '@/components/global/C_Icon/index.vue'
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
    pagination: () => true, // 默认开启分页
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
  const message = useMessage()
  const dialog = useDialog()

  // ================= 分页相关响应式状态 =================
  const currentPage = ref(1)
  const currentPageSize = ref(10)

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

  // ================= 分页计算属性 =================
  const paginatedData = computed(() => {
    if (!config.value.pagination?.enabled) {
      return props.data
    }

    const start = (currentPage.value - 1) * currentPageSize.value
    const end = start + currentPageSize.value
    return props.data.slice(start, end)
  })

  const paginationConfig = computed(() => {
    if (!config.value.pagination?.enabled) return null

    return {
      page: currentPage.value,
      pageSize: currentPageSize.value,
      itemCount: props.data.length, // 使用 itemCount 而不是 total
      showSizePicker: config.value.pagination.showSizePicker ?? true,
      showQuickJumper: config.value.pagination.showQuickJumper ?? true,
      pageSizes: config.value.pagination.pageSizes ?? [10, 20, 50, 100],
      simple: config.value.pagination.simple ?? false,
      size: config.value.pagination.size ?? 'medium',
      prefix: (info: any) => `共 ${info.itemCount} 条`,
      suffix: (info: any) => `第 ${info.startIndex + 1}-${info.endIndex} 条`,
      'onUpdate:page': handlePageChange,
      'onUpdate:pageSize': handlePageSizeChange,
    }
  })

  // ================= 表格管理器 =================
  const tableManager = useTableManager({
    config: config.value,
    data: () => props.data,
    rowKey: props.rowKey,
    emit,
  })

  // ================= 工具函数 =================
  const isActionEnabled = (
    actionKey: 'edit' | 'delete' | 'detail'
  ): boolean => {
    return props.actions?.[actionKey] !== false
  }

  // ================= 分页事件处理 =================
  const handlePageChange = (page: number) => {
    currentPage.value = page
    emit('pagination-change', page, currentPageSize.value)
  }

  const handlePageSizeChange = (pageSize: number) => {
    currentPageSize.value = pageSize
    currentPage.value = 1 // 重置到第一页
    emit('pagination-change', 1, pageSize)
  }

  // ================= 初始化分页配置 =================
  watchEffect(() => {
    if (config.value.pagination?.enabled) {
      currentPage.value = config.value.pagination.page ?? 1
      currentPageSize.value = config.value.pagination.pageSize ?? 10
    }
  })

  // 监听数据变化，确保分页状态正确
  watch(
    () => props.data.length,
    newLength => {
      if (config.value.pagination?.enabled && currentPage.value > 1) {
        const maxPage = Math.ceil(newLength / currentPageSize.value)
        if (currentPage.value > maxPage) {
          currentPage.value = Math.max(1, maxPage)
        }
      }
    }
  )

  // ================= 事件处理 =================
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

  // ================= 内置操作处理 =================
  const handleBuiltinEdit = async (row: DataRecord, index: number) => {
    const editConfig = props.actions?.edit

    if (editConfig && typeof editConfig === 'object') {
      if (editConfig.onEdit) {
        try {
          await editConfig.onEdit(row, index)
        } catch (error) {
          console.error('编辑失败:', error)
          message.error('编辑失败')
        }
      } else if (editConfig.api) {
        try {
          console.log(`调用编辑API: ${editConfig.api}/${row.id}`, row)
          message.success('编辑成功')
        } catch (error) {
          console.error('编辑失败:', error)
          message.error('编辑失败')
        }
      }
    } else {
      tableManager.editStates.modalEdit.startEdit(props.rowKey(row))
    }
  }

  const handleBuiltinDelete = async (row: DataRecord, index: number) => {
    const deleteConfig = props.actions?.delete
    const confirmText =
      deleteConfig &&
      typeof deleteConfig === 'object' &&
      deleteConfig.confirmText
        ? typeof deleteConfig.confirmText === 'function'
          ? deleteConfig.confirmText(row)
          : deleteConfig.confirmText
        : '确定要删除这条记录吗？'

    dialog.warning({
      title: '确认删除',
      content: confirmText,
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        try {
          if (deleteConfig && typeof deleteConfig === 'object') {
            if (deleteConfig.onDelete) {
              await deleteConfig.onDelete(row, index)
            } else if (deleteConfig.api) {
              console.log(`调用删除API: ${deleteConfig.api}/${row.id}`)
            }
          } else {
            console.log('默认删除行为:', row)
          }

          message.success('删除成功')
          emit('row-delete', row, index)
        } catch (error) {
          console.error('删除失败:', error)
          message.error('删除失败')
        }
      },
    })
  }

  const handleBuiltinDetail = (row: DataRecord, index: number) => {
    const detailConfig = props.actions?.detail

    if (
      detailConfig &&
      typeof detailConfig === 'object' &&
      detailConfig.onView
    ) {
      detailConfig.onView(row, index)
    } else {
      viewingData.value = { ...row }
      viewModalVisible.value = true
    }
  }

  // ================= 渲染函数 =================
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

  const createActionButton = (config: {
    icon: string
    type?: string
    title?: string
    onClick: () => void
  }) => {
    return h(
      NButton,
      {
        size: 'small',
        type: config.type || 'primary',
        quaternary: true,
        onClick: config.onClick,
      },
      () => [h(C_Icon, { name: config.icon, size: 14, title: config.title })]
    )
  }

  const renderRowEditActions = (rowKey: any): VNodeChild[] => {
    const isEditing = tableManager.editStates.rowEdit.isEditingRow(rowKey)

    return isEditing
      ? [
          createActionButton({
            icon: 'mdi:check',
            title: '保存',
            onClick: () => tableManager.editStates.rowEdit.saveEditRow(),
          }),
          createActionButton({
            icon: 'mdi:close',
            title: '取消',
            type: 'default',
            onClick: () => tableManager.editStates.rowEdit.cancelEditRow(),
          }),
        ]
      : [
          createActionButton({
            icon: 'mdi:pencil',
            title: '编辑',
            onClick: () => tableManager.editStates.rowEdit.startEditRow(rowKey),
          }),
        ]
  }

  const renderBuiltinActions = (
    rowData: DataRecord,
    rowIndex: number
  ): VNodeChild[] => {
    const actions: VNodeChild[] = []

    if (config.value.editMode === 'modal') {
      actions.push(
        createActionButton({
          icon: 'mdi:pencil',
          title: '编辑',
          onClick: () => handleBuiltinEdit(rowData, rowIndex),
        })
      )
    }

    if (isActionEnabled('delete')) {
      actions.push(
        createActionButton({
          icon: 'mdi:delete',
          type: 'error',
          title: '删除',
          onClick: () => handleBuiltinDelete(rowData, rowIndex),
        })
      )
    }

    if (isActionEnabled('detail')) {
      actions.push(
        createActionButton({
          icon: 'mdi:eye',
          type: 'info',
          title: '详情',
          onClick: () => handleBuiltinDetail(rowData, rowIndex),
        })
      )
    }

    return actions
  }

  const renderMoreActions = (
    rowData: DataRecord,
    rowIndex: number
  ): VNodeChild | null => {
    const customActions =
      props.actions?.custom?.filter(
        action => action.show?.(rowData, rowIndex) !== false
      ) || []

    const legacyActions =
      !Object.keys(props.actions || {}).length && props.rowActions?.length
        ? props.rowActions.filter(
            action => action.show?.(rowData, rowIndex) !== false
          )
        : []

    const moreActions = [...customActions, ...legacyActions]

    if (!moreActions.length) return null

    const dropdownOptions = moreActions.map(action => ({
      key: action.key || action.label,
      label: action.label,
      icon: () =>
        action.icon
          ? h(C_Icon, { name: action.icon.replace('i-', ''), size: 14 })
          : null,
      props: {
        onClick: () => {
          if (action.label === '查看') {
            viewingData.value = { ...rowData }
            viewModalVisible.value = true
          } else {
            action.onClick(rowData, rowIndex)
          }
        },
      },
    }))

    return h(
      NDropdown,
      { options: dropdownOptions, trigger: 'click' },
      {
        default: () =>
          createActionButton({
            icon: 'mdi:dots-horizontal',
            type: 'default',
            title: '更多',
            onClick: () => {},
          }),
      }
    )
  }

  const renderActions = (rowData: DataRecord, rowIndex: number): VNodeChild => {
    const rowKey = props.rowKey(rowData)

    if (editModeChecker.value.isRowEditMode()) {
      const isEditing = tableManager.editStates.rowEdit.isEditingRow(rowKey)
      if (isEditing) {
        return h(NSpace, { size: 2, wrap: false }, () =>
          renderRowEditActions(rowKey)
        )
      }
    }

    const actions: VNodeChild[] = [
      ...(editModeChecker.value.isRowEditMode()
        ? renderRowEditActions(rowKey)
        : []),
      ...renderBuiltinActions(rowData, rowIndex),
    ]

    const moreAction = renderMoreActions(rowData, rowIndex)
    if (moreAction) actions.push(moreAction)

    return h(NSpace, { size: 2, wrap: false }, () => actions)
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
        render: renderActions,
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

  .pagination-wrapper {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }
</style>
