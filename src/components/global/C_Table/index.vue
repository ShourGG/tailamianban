<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-13 18:38:58
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-18 01:40:03
 * @FilePath: \Robot_Admin\src\components\global\C_Table\index.vue
 * @Description: 超级表格组件 - 增强版本（支持展开、选择和动态行操作）
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="c-table-wrapper">
    <!--  动态行工具栏 - 只在启用时显示 -->
    <div
      v-if="dynamicRowsState"
      class="dynamic-rows-toolbar"
    >
      <component :is="dynamicRowsState.renderToolbar()" />
    </div>

    <!-- 表格主体 -->
    <NDataTable
      ref="tableRef"
      v-bind="tableProps"
      :columns="computedColumns"
      :data="data"
      :loading="loading"
      :row-key="rowKey"
      :expanded-row-keys="expandedKeys"
      :checked-row-keys="checkedKeys"
      :render-expand="renderExpandFunction"
      @update:expanded-row-keys="handleExpandedRowKeysChange"
      @update:checked-row-keys="handleCheckedRowKeysChange"
    />

    <!-- 编辑模态框 -->
    <NModal
      v-if="editMode === 'modal'"
      v-model:show="modalEdit.isModalVisible.value"
      :title="modalTitle"
      :width="modalWidth"
      preset="card"
      :mask-closable="false"
      :close-on-esc="false"
      class="w60%"
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
      :width="modalWidth"
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

    <!--  动态行确认删除模态框 -->
    <component
      v-if="dynamicRowsState"
      :is="dynamicRowsState.renderConfirmModal()"
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
    EditType,
    ParentChildLinkMode,
    ChildSelectionState,
    DataRecord,
  } from '@/types/modules/table'
  import { useRowEdit } from '@/composables/Table/useRowEdit'
  import { useCellEdit } from '@/composables/Table/useCellEdit'
  import { useModalEdit } from '@/composables/Table/useModalEdit'
  import { useTableExpand } from '@/composables/Table/useTableExpand'
  import {
    useDynamicRows,
    type DynamicRowsOptions,
  } from '@/composables/Table/useDynamicRow'
  import {
    getDisplayValue,
    generateFormOptions,
    getTableProps,
    processColumnConfig,
  } from './data'

  interface CFormInstance {
    validate: () => Promise<void>
  }

  // 扩展 TableProps 支持展开、选择和动态行功能
  interface EnhancedTableProps<T extends DataRecord = DataRecord>
    extends TableProps<T> {
    //  展开功能配置
    expandable?: boolean
    onLoadExpandData?: (row: T) => Promise<any[]> | any[]
    renderExpandContent?: (
      row: T,
      expandData: any[],
      loading: boolean,
      childSelection?: ChildSelectionState
    ) => VNodeChild
    rowExpandable?: (row: T) => boolean
    defaultExpandedKeys?: DataTableRowKey[]

    //  选择功能配置
    enableSelection?: boolean
    defaultCheckedKeys?: DataTableRowKey[]
    rowCheckable?: (row: T) => boolean
    maxSelection?: number

    //  子表格选择配置
    enableChildSelection?: boolean
    childRowCheckable?: (childRow: any, parentRow: T) => boolean

    //  父子联动配置
    enableParentChildLink?: boolean
    parentChildLinkMode?: ParentChildLinkMode

    //  动态行功能配置 - 简化为单个配置对象
    dynamicRowsOptions?: DynamicRowsOptions<T>
  }

  // 编辑组件映射
  const EDIT_COMPONENTS: Record<EditType, any> = {
    number: NInputNumber,
    switch: NSwitch,
    input: NInput,
    email: NInput,
    mobile: NInput,
    date: (props: any) =>
      h(NDatePicker, { ...props, type: 'date', format: 'yyyy-MM-dd' }),
    select: (props: any) =>
      h(NSelect, { ...props, options: props.options || [] }),
    textarea: (props: any) =>
      h(NInput, { ...props, type: 'textarea', rows: 3 }),
  }

  // Props 定义
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
  })

  //  扩展 Emits - 添加动态行事件
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

  // Refs
  const tableRef = ref<ComponentPublicInstance>()
  const cFormRef = ref<CFormInstance>()
  const viewModalVisible = ref(false)
  const viewingData = ref<DataRecord>({})
  const submitLoading = ref(false)

  // 计算属性
  const editableColumns = computed(() =>
    props.columns.filter((col): col is TableColumn => col.editable !== false)
  )

  const displayColumns = computed(() =>
    processColumnConfig(props.columns).filter(col => col.key !== '_actions')
  )

  const tableProps = computed(() => getTableProps(props))

  const formKey = computed(
    () => `edit-form-${modalEdit.editingRowKey.value || 'new'}`
  )

  const formOptions = computed(() => generateFormOptions(editableColumns.value))

  //  动态行功能初始化 - 只在有配置时启用，使用正确的类型约束
  let dynamicRowsState: ReturnType<typeof useDynamicRows<DataRecord>> | null =
    null

  if (props.dynamicRowsOptions) {
    const dynamicOptions: DynamicRowsOptions<DataRecord> = {
      ...props.dynamicRowsOptions,

      // 事件回调
      onRowChange: data => {
        emit('update:data', data)
        props.dynamicRowsOptions?.onRowChange?.(data)
      },
      onSelectionChange: (selectedKey, selectedRow) => {
        emit('row-selection-change', selectedKey, selectedRow)
        props.dynamicRowsOptions?.onSelectionChange?.(selectedKey, selectedRow)
      },
      onRowAdd: newRow => {
        emit('row-add', newRow)
        props.dynamicRowsOptions?.onRowAdd?.(newRow)
      },
      onRowDelete: (deletedRow, index) => {
        emit('row-delete', deletedRow, index)
        props.dynamicRowsOptions?.onRowDelete?.(deletedRow, index)
      },
      onRowCopy: (originalRow, newRow) => {
        emit('row-copy', originalRow, newRow)
        props.dynamicRowsOptions?.onRowCopy?.(originalRow, newRow)
      },
      onRowMove: (row, fromIndex, toIndex) => {
        emit('row-move', row, fromIndex, toIndex)
        props.dynamicRowsOptions?.onRowMove?.(row, fromIndex, toIndex)
      },
    }

    dynamicRowsState = useDynamicRows(
      computed(() => props.data),
      dynamicOptions
    )
  }

  //  展开和选择功能初始化 - 彻底修复生命周期错误
  let expandState: ReturnType<typeof useTableExpand> | null = null

  // 在 setup 顶层判断是否需要初始化展开功能
  if (props.expandable || props.enableSelection || props.enableChildSelection) {
    expandState = useTableExpand({
      data: computed(() => props.data),
      rowKey: props.rowKey,
      childRowKey: (child: any) => child.id,

      // 展开配置
      defaultExpandedKeys: props.defaultExpandedKeys,
      onLoadData: props.onLoadExpandData,
      renderContent: props.renderExpandContent,
      rowExpandable: props.rowExpandable,

      // 选择配置
      enableSelection: props.enableSelection,
      defaultCheckedKeys: props.defaultCheckedKeys,
      rowCheckable: props.rowCheckable,
      maxSelection: props.maxSelection,

      // 子选择配置
      enableChildSelection: props.enableChildSelection,
      childRowCheckable: props.childRowCheckable,

      // 父子联动配置
      enableParentChildLink: props.enableParentChildLink,
      parentChildLinkMode: props.parentChildLinkMode,

      // 事件回调
      onExpandChange: (keys, row, expanded) => {
        emit('expand-change', keys, row, expanded)
      },
      onSelectionChange: (checkedKeys, checkedRows, childSelections) => {
        emit('selection-change', checkedKeys, checkedRows, childSelections)
      },
      onChildSelectionChange: (parentKey, childKeys, childRows) => {
        emit('child-selection-change', parentKey, childKeys, childRows)
      },
    })
  }

  //  展开和选择状态
  const expandedKeys = computed(() => expandState?.expandedKeys.value ?? [])
  const checkedKeys = computed(() => expandState?.checkedKeys.value ?? [])
  const renderExpandFunction = computed(() => undefined)

  // 编辑功能初始化
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

  /**
   * * @description 处理保存操作
   * ? @param rowData - 行数据对象
   * ? @param rowIndex - 行索引
   * ? @param columnKey - 列键名（可选）
   * ! @return Promise<void>
   */
  async function handleSave(
    rowData: DataRecord,
    rowIndex: number,
    columnKey?: string
  ) {
    if (!isValidSaveParams(rowData, rowIndex)) return

    const newData = [...props.data]
    newData[rowIndex] = { ...newData[rowIndex], ...rowData }

    emit('update:data', newData)
    await nextTick()
    emit('save', newData[rowIndex], rowIndex, columnKey)
  }

  /**
   * * @description 处理取消操作
   * ? @param rowData - 行数据对象
   * ? @param rowIndex - 行索引
   * ! @return void
   */
  function handleCancel(rowData: DataRecord, rowIndex: number) {
    emit('cancel', rowData, rowIndex)
  }

  /**
   * * @description 处理表单更新
   * ? @param value - 表单数据对象
   * ! @return void
   */
  function handleFormUpdate(value: DataRecord) {
    Object.assign(modalEdit.editingData, value)
  }

  /**
   * * @description 处理模态框保存
   * ! @return Promise<void>
   */
  async function handleModalSave() {
    if (!cFormRef.value) return

    submitLoading.value = true
    try {
      await cFormRef.value.validate()
      await modalEdit.saveEdit()
    } finally {
      submitLoading.value = false
    }
  }

  /**
   * * @description 处理展开行键变化
   * ? @param keys - 展开的行键数组
   * ! @return void
   */
  function handleExpandedRowKeysChange(keys: DataTableRowKey[]) {
    if (expandState) {
      expandState.handleExpandChange(keys)
    }
  }

  /**
   * * @description 处理选中行键变化
   * ? @param keys - 选中的行键数组
   * ! @return void
   */
  function handleCheckedRowKeysChange(keys: DataTableRowKey[]) {
    if (expandState) {
      expandState.handleSelectionChange(keys)
    }
  }

  /**
   * * @description 验证保存参数是否有效
   * ? @param rowData - 行数据对象
   * ? @param rowIndex - 行索引
   * ! @return 参数是否有效
   */
  function isValidSaveParams(rowData: DataRecord, rowIndex: number): boolean {
    return !!(rowData && rowIndex >= 0 && rowIndex < props.data.length)
  }

  /**
   * * @description 获取描述项的跨度
   * ? @param column - 表格列配置
   * ! @return 跨度数值
   */
  function getDescriptionSpan(column: TableColumn): number {
    return column.key === 'description' || column.editProps?.type === 'textarea'
      ? 2
      : 1
  }

  /**
   * * @description 获取编辑值
   * ? @param column - 表格列配置
   * ? @param rowData - 行数据对象
   * ? @param rowKey - 行键
   * ! @return 编辑值
   */
  function getEditValue(
    column: TableColumn,
    rowData: DataRecord,
    rowKey: DataTableRowKey
  ): unknown {
    return (
      rowEdit.getEditingRowData(rowKey)?.[column.key] ?? rowData[column.key]
    )
  }

  /**
   * * @description 获取单元格编辑值
   * ? @param column - 表格列配置
   * ? @param rowData - 行数据对象
   * ? @param rowKey - 行键
   * ! @return 单元格编辑值
   */
  function getCellEditValue(
    column: TableColumn,
    rowData: DataRecord,
    rowKey: DataTableRowKey
  ): unknown {
    return (
      cellEdit.getEditingCellValue(rowKey, column.key) ?? rowData[column.key]
    )
  }

  /**
   * * @description 渲染编辑组件
   * ? @param column - 表格列配置
   * ? @param value - 当前值
   * ? @param onUpdate - 更新回调函数
   * ! @return Vue节点子元素
   */
  function renderEditComponent(
    column: TableColumn,
    value: unknown,
    onUpdate: (val: unknown) => void
  ): VNodeChild {
    if (column.editRender) {
      return column.editRender(value, {}, 0)
    }

    const componentProps = {
      value,
      'onUpdate:value': onUpdate,
      placeholder: `请输入${column.title}`,
      style: { width: '100%' },
      ...column.editProps,
    }

    const editType = column.editType || 'input'
    const Component = EDIT_COMPONENTS[editType] || EDIT_COMPONENTS.input

    return h(Component, componentProps)
  }

  /**
   * * @description 渲染单元格编辑操作按钮
   * ? @param rowKey - 行键
   * ! @return Vue节点子元素
   */
  function renderCellEditActions(rowKey: DataTableRowKey): VNodeChild {
    console.log('rowKey', rowKey)
    return h(
      'div',
      {
        class:
          'absolute top-1/2 right-1 -translate-y-1/2 flex items-center gap-1 bg-white/95 backdrop-blur-sm border border-gray-200/80 rounded-md px-2 py-1 shadow-md z-50 opacity-90 hover:opacity-100 hover:bg-white hover:shadow-lg hover:border-gray-300 transition-all duration-200',
      },
      [
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
    )
  }

  /**
   * * @description 渲染单元格
   * ? @param column - 表格列配置
   * ? @param rowData - 行数据对象
   * ? @param rowIndex - 行索引
   * ! @return Vue节点子元素
   */
  function renderCell(
    column: TableColumn,
    rowData: DataRecord,
    rowIndex: number
  ): VNodeChild {
    const value = rowData[column.key]
    const rowKey = props.rowKey(rowData)

    if (
      !props.editable ||
      column.editable === false ||
      props.editMode === 'none'
    ) {
      return renderDisplayCell(column, rowData, rowIndex, value)
    }

    if (isRowEditMode() && rowEdit.isEditingRow(rowKey)) {
      return renderEditComponent(
        column,
        getEditValue(column, rowData, rowKey),
        val => rowEdit.updateEditingRowData(rowKey, column.key, val)
      )
    }

    if (isCellEditMode()) {
      return cellEdit.isEditingCell(rowKey, column.key)
        ? renderEditingCell(column, rowData, rowKey)
        : renderEditableCell(column, rowData, rowIndex, value, rowKey)
    }

    return renderDisplayCell(column, rowData, rowIndex, value)
  }

  /**
   * * @description 渲染显示单元格
   * ? @param column - 表格列配置
   * ? @param rowData - 行数据对象
   * ? @param rowIndex - 行索引
   * ? @param value - 单元格值
   * ! @return Vue节点子元素
   */
  function renderDisplayCell(
    column: TableColumn,
    rowData: DataRecord,
    rowIndex: number,
    value: unknown
  ): VNodeChild {
    if (column.render) {
      const result = column.render(rowData, rowIndex)
      return result ?? String(value ?? '')
    }
    return String(value ?? '')
  }

  /**
   * * @description 渲染编辑中的单元格
   * ? @param column - 表格列配置
   * ? @param rowData - 行数据对象
   * ? @param rowKey - 行键
   * ! @return Vue节点子元素
   */
  function renderEditingCell(
    column: TableColumn,
    rowData: DataRecord,
    rowKey: DataTableRowKey
  ): VNodeChild {
    return h(
      'div',
      {
        class: 'relative w-full min-h-9 flex items-center overflow-visible',
      },
      [
        h('div', { class: 'flex-1 min-w-0 pr-20' }, [
          renderEditComponent(
            column,
            getCellEditValue(column, rowData, rowKey),
            val => cellEdit.updateEditingCellValue(rowKey, column.key, val)
          ),
        ]),
        renderCellEditActions(rowKey),
      ]
    )
  }

  /**
   * * @description 渲染可编辑单元格
   * ? @param column - 表格列配置
   * ? @param rowData - 行数据对象
   * ? @param rowIndex - 行索引
   * ? @param value - 单元格值
   * ? @param rowKey - 行键
   * ! @return Vue节点子元素
   */
  function renderEditableCell(
    column: TableColumn,
    rowData: DataRecord,
    rowIndex: number,
    value: unknown,
    rowKey: DataTableRowKey
  ): VNodeChild {
    return h('div', { class: 'cell-edit-wrapper' }, [
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
    ])
  }

  /**
   * * @description 判断是否为行编辑模式
   * ! @return 是否为行编辑模式
   */
  function isRowEditMode(): boolean {
    return props.editMode === 'row' || props.editMode === 'both'
  }

  /**
   * * @description 判断是否为单元格编辑模式
   * ! @return 是否为单元格编辑模式
   */
  function isCellEditMode(): boolean {
    return props.editMode === 'cell' || props.editMode === 'both'
  }

  /**
   * * @description 渲染操作按钮
   * ? @param rowData - 行数据对象
   * ? @param rowIndex - 行索引
   * ! @return Vue节点子元素
   */
  function renderActions(rowData: DataRecord, rowIndex: number): VNodeChild {
    const rowKey = props.rowKey(rowData)
    const actions: VNodeChild[] = []

    if (isRowEditMode()) {
      actions.push(rowEdit.renderRowActions(rowKey))
    }

    if (props.editMode === 'modal') {
      actions.push(renderModalEditButton(rowKey))
    }

    if (!rowEdit.isEditingRow(rowKey)) {
      addCustomActions(actions, rowData, rowIndex)
    }

    return h(NSpace, { size: 2, wrap: false }, () => actions)
  }

  /**
   * * @description 渲染模态框编辑按钮
   * ? @param rowKey - 行键
   * ! @return Vue节点子元素
   */
  function renderModalEditButton(rowKey: DataTableRowKey): VNodeChild {
    return h(
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
  }

  /**
   * * @description 添加自定义操作按钮
   * ? @param actions - 操作按钮数组
   * ? @param rowData - 行数据对象
   * ? @param rowIndex - 行索引
   * ! @return void
   */
  function addCustomActions(
    actions: VNodeChild[],
    rowData: DataRecord,
    rowIndex: number
  ): void {
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

  //  计算列配置 - 整合展开、选择和动态行功能
  const computedColumns = computed((): DataTableColumn[] => {
    let columns: DataTableColumn[] = props.columns.map(column => ({
      ...column,
      width: column.width || props.columnWidth,
      titleAlign: 'center' as const,
      align: 'center' as const,
      render: (rowData: DataRecord, rowIndex: number) =>
        renderCell(column, rowData, rowIndex),
    }))

    //  使用 dynamicRowsState 的列配置增强（如果启用动态行功能）
    if (dynamicRowsState) {
      columns = dynamicRowsState.enhanceColumns(
        columns as any
      ) as DataTableColumn[]
    }

    //  使用 expandState 的列配置增强
    if (expandState && (props.expandable || props.enableSelection)) {
      columns = expandState.getTableColumns(columns as any) as DataTableColumn[]
    }

    // 添加操作列
    if (shouldShowActionsColumn()) {
      columns.push(createActionsColumn())
    }

    return columns
  })

  /**
   * * @description 判断是否显示操作列
   * ! @return 是否显示操作列
   */
  function shouldShowActionsColumn(): boolean {
    return !!(
      props.showRowActions &&
      (props.editable || props.rowActions?.length)
    )
  }

  /**
   * * @description 创建操作列配置
   * ! @return 操作列配置对象
   */
  function createActionsColumn(): DataTableColumn {
    return {
      key: '_actions',
      title: '操作',
      align: 'center' as const,
      titleAlign: 'center' as const,
      width: 120,
      render: renderActions,
    }
  }

  /**
   * * @description 处理开始编辑
   * ? @param rowKey - 行键
   * ? @param columnKey - 列键（可选）
   * ! @return void
   */
  function handleStartEdit(rowKey: DataTableRowKey, columnKey?: string) {
    if (props.editMode === 'modal') {
      modalEdit.startEdit(rowKey)
    } else if (props.editMode === 'cell' && columnKey) {
      cellEdit.startEditCell(rowKey, columnKey)
    } else if (props.editMode === 'row' || props.editMode === 'both') {
      rowEdit.startEditRow(rowKey)
    }
  }

  //  暴露方法 - 包含展开、选择和动态行功能
  defineExpose<
    TableInstance & {
      //  动态行操作方法
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
    /**
     * * @description 开始编辑
     * ? @param rowKey - 行键
     * ? @param columnKey - 列键（可选）
     * ! @return void
     */
    startEdit: handleStartEdit,

    /**
     * * @description 取消编辑
     * ! @return void
     */
    cancelEdit() {
      if (modalEdit.isModalVisible.value) modalEdit.cancelEdit()
      else if (cellEdit.editingCell.value.rowKey) cellEdit.cancelEditCell()
      else if (rowEdit.editingRowKey.value) rowEdit.cancelEditRow()
    },

    /**
     * * @description 保存编辑
     * ! @return Promise<void>
     */
    async saveEdit() {
      if (modalEdit.isModalVisible.value) await handleModalSave()
      else if (cellEdit.editingCell.value.rowKey) await cellEdit.saveEditCell()
      else if (rowEdit.editingRowKey.value) await rowEdit.saveEditRow()
    },

    /**
     * * @description 判断是否正在编辑
     * ? @param rowKey - 行键
     * ? @param columnKey - 列键（可选）
     * ! @return 是否正在编辑
     */
    isEditing(rowKey: DataTableRowKey, columnKey?: string) {
      if (props.editMode === 'modal') return modalEdit.isEditingRow(rowKey)
      if (columnKey) return cellEdit.isEditingCell(rowKey, columnKey)
      return rowEdit.isEditingRow(rowKey)
    },

    /**
     * * @description 获取编辑中的数据
     * ! @return 编辑中的数据或null
     */
    getEditingData() {
      if (modalEdit.isModalVisible.value) return modalEdit.editingData
      if (rowEdit.editingRowKey.value) {
        return rowEdit.getEditingRowData(rowEdit.editingRowKey.value!)
      }
      return null
    },

    /**
     * * @description 展开行
     * ? @param rowKey - 行键
     * ! @return Promise<void>
     */
    expandRow: async (rowKey: DataTableRowKey) => {
      if (expandState) {
        const currentKeys = [...expandState.expandedKeys.value]
        if (!currentKeys.includes(rowKey)) {
          currentKeys.push(rowKey)
          expandState.handleExpandChange(currentKeys)
        }
      }
    },

    /**
     * * @description 折叠行
     * ? @param rowKey - 行键
     * ! @return void
     */
    collapseRow: (rowKey: DataTableRowKey) => {
      if (expandState) {
        const currentKeys = expandState.expandedKeys.value.filter(
          key => key !== rowKey
        )
        expandState.handleExpandChange(currentKeys)
      }
    },

    /**
     * * @description 切换展开状态
     * ? @param rowKey - 行键
     * ! @return Promise<void>
     */
    toggleExpand: async (rowKey: DataTableRowKey) => {
      if (expandState?.expandedKeys.value.includes(rowKey)) {
        // 如果已展开，则折叠
        const currentKeys = expandState.expandedKeys.value.filter(
          key => key !== rowKey
        )
        expandState.handleExpandChange(currentKeys)
      } else {
        // 如果未展开，则展开
        await expandState?.expandRow?.(rowKey)
      }
    },

    /**
     * * @description 展开所有行
     * ! @return Promise<void>
     */
    expandAll: async () => {
      await expandState?.expandAll()
    },

    /**
     * * @description 折叠所有行
     * ! @return void
     */
    collapseAll: () => {
      expandState?.collapseAll()
    },

    /**
     * * @description 判断行是否已展开
     * ? @param rowKey - 行键
     * ! @return 是否已展开
     */
    isExpanded: (rowKey: DataTableRowKey) => {
      return expandState?.expandedKeys.value.includes(rowKey) ?? false
    },

    /**
     * * @description 选中行
     * ? @param rowKey - 行键
     * ! @return void
     */
    selectRow: (rowKey: DataTableRowKey) => {
      if (
        expandState?.checkedKeys.value &&
        !expandState.checkedKeys.value.includes(rowKey)
      ) {
        const newKeys = [...expandState.checkedKeys.value, rowKey]
        expandState.handleSelectionChange(newKeys)
      }
    },

    /**
     * * @description 取消选中行
     * ? @param rowKey - 行键
     * ! @return void
     */
    unselectRow: (rowKey: DataTableRowKey) => {
      if (expandState?.checkedKeys.value) {
        const newKeys = expandState.checkedKeys.value.filter(
          key => key !== rowKey
        )
        expandState.handleSelectionChange(newKeys)
      }
    },

    /**
     * * @description 选中所有行
     * ! @return void
     */
    selectAll: () => {
      expandState?.selectAll()
    },

    /**
     * * @description 清空选择
     * ! @return void
     */
    clearSelection: () => {
      expandState?.clearSelection()
    },

    /**
     * * @description 判断行是否已选中
     * ? @param rowKey - 行键
     * ! @return 是否已选中
     */
    isRowSelected: (rowKey: DataTableRowKey) => {
      return expandState?.checkedKeys.value.includes(rowKey) ?? false
    },

    /**
     * * @description 获取选中的行数据
     * ! @return 选中的行数据数组
     */
    getSelectedRows: () => {
      if (!expandState?.checkedKeys.value) return []
      return props.data.filter(row =>
        expandState!.checkedKeys.value.includes(props.rowKey(row))
      )
    },

    /**
     * * @description 选中子行
     * ? @param parentKey - 父行键
     * ? @param childKey - 子行键
     * ! @return void
     */
    selectChildRow: (parentKey: DataTableRowKey, childKey: DataTableRowKey) => {
      if (expandState?.childSelections.value) {
        const current = expandState.childSelections.value.get(parentKey) || []
        if (!current.includes(childKey)) {
          const newSelection = [...current, childKey]
          expandState.childSelections.value.set(parentKey, newSelection)
          // 触发子选择变化事件
          emit('child-selection-change', parentKey, newSelection, [])
        }
      }
    },

    /**
     * * @description 取消选中子行
     * ? @param parentKey - 父行键
     * ? @param childKey - 子行键
     * ! @return void
     */
    unselectChildRow: (
      parentKey: DataTableRowKey,
      childKey: DataTableRowKey
    ) => {
      if (expandState?.childSelections.value) {
        const current = expandState.childSelections.value.get(parentKey) || []
        const newSelection = current.filter(k => k !== childKey)
        expandState.childSelections.value.set(parentKey, newSelection)
        // 触发子选择变化事件
        emit('child-selection-change', parentKey, newSelection, [])
      }
    },

    /**
     * * @description 选中所有子行
     * ? @param parentKey - 父行键
     * ! @return void
     */
    selectAllChildren: (parentKey: DataTableRowKey) => {
      if (
        expandState?.childSelections.value &&
        expandState.expandDataMap?.value
      ) {
        const expandData = expandState.expandDataMap.value.get(parentKey) || []
        const allChildKeys = expandData.map((child: any) => child.id)
        expandState.childSelections.value.set(parentKey, allChildKeys)
        // 触发子选择变化事件
        emit('child-selection-change', parentKey, allChildKeys, expandData)
      }
    },

    /**
     * * @description 清空子行选择
     * ? @param parentKey - 父行键
     * ! @return void
     */
    clearChildrenSelection: (parentKey: DataTableRowKey) => {
      if (expandState?.childSelections.value) {
        expandState.childSelections.value.set(parentKey, [])
        // 触发子选择变化事件
        emit('child-selection-change', parentKey, [], [])
      }
    },

    /**
     * * @description 获取子行选中数据
     * ? @param parentKey - 父行键
     * ! @return 选中的子行数据数组
     */
    getChildSelectedRows: (parentKey: DataTableRowKey) => {
      if (
        !expandState?.childSelections.value ||
        !expandState.expandDataMap?.value
      ) {
        return []
      }
      const selectedKeys =
        expandState.childSelections.value.get(parentKey) || []
      const expandData = expandState.expandDataMap.value.get(parentKey) || []
      return expandData.filter((child: any) => selectedKeys.includes(child.id))
    },

    /**
     * * @description 清空所有选择（包括父行和子行）
     * ! @return void
     */
    clearAllSelections: () => {
      expandState?.clearAllSelections()
    },

    //  动态行操作方法
    /**
     * * @description 添加新行
     * ! @return void
     */
    addRow: () => {
      dynamicRowsState?.addRow()
    },

    /**
     * * @description 插入新行
     * ! @return void
     */
    insertRow: () => {
      dynamicRowsState?.insertRow()
    },

    /**
     * * @description 删除选中行
     * ! @return void
     */
    deleteRow: () => {
      dynamicRowsState?.deleteRow()
    },

    /**
     * * @description 复制选中行
     * ! @return void
     */
    copyRow: () => {
      dynamicRowsState?.copyRow()
    },

    /**
     * * @description 上移选中行
     * ! @return void
     */
    moveRowUp: () => {
      dynamicRowsState?.moveRowUp()
    },

    /**
     * * @description 下移选中行
     * ! @return void
     */
    moveRowDown: () => {
      dynamicRowsState?.moveRowDown()
    },

    /**
     * * @description 清空行选择
     * ! @return void
     */
    clearRowSelection: () => {
      dynamicRowsState?.clearSelection()
    },

    /**
     * * @description 获取选中的行数据
     * ! @return 选中的行数据或null
     */
    getSelectedRowData: () => {
      return dynamicRowsState?.selectedRowData.value || null
    },

    /**
     * * @description 打印表格
     * ? @param elementRef - 要打印的元素引用
     * ! @return Promise<void>
     */
    printTable: async (elementRef?: HTMLElement) => {
      if (dynamicRowsState && elementRef) {
        await dynamicRowsState.handlePrint(ref(elementRef))
      }
    },

    /**
     * * @description 下载表格截图
     * ? @param elementRef - 要截图的元素引用
     * ? @param filename - 文件名
     * ! @return Promise<void>
     */
    downloadTableScreenshot: async (
      elementRef?: HTMLElement,
      filename?: string
    ) => {
      if (dynamicRowsState && elementRef) {
        await dynamicRowsState.handleDownload(ref(elementRef), filename)
      }
    },
  })
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
