<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-13 18:38:58
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-18 11:01:28
 * @FilePath: \Robot_Admin\src\components\global\C_Table\index.vue
 * @Description: 超级表格组件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="c-table-wrapper">
    <!-- 动态行工具栏 -->
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
      v-if="config.editMode === 'modal'"
      v-model:show="modalEdit.isModalVisible.value"
      :title="config.modalTitle"
      :width="config.modalWidth"
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

  // ================= 类型定义 =================

  interface TablePresetConfig<T extends DataRecord = DataRecord> {
    dynamicRows?: DynamicRowsOptions<T> | boolean
    expandable?: ExpandableConfig<T> | boolean
    selection?: SelectionConfig<T> | boolean
    edit?: EditConfig | boolean
  }

  interface ExpandableConfig<T extends DataRecord = DataRecord> {
    enabled?: boolean
    defaultExpanded?: DataTableRowKey[]
    onLoadData?: (row: T) => Promise<any[]> | any[]
    renderContent?: (
      row: T,
      expandData: any[],
      loading: boolean,
      childSelection?: ChildSelectionState
    ) => VNodeChild
    rowExpandable?: (row: T) => boolean
  }

  interface SelectionConfig<T extends DataRecord = DataRecord> {
    enabled?: boolean
    defaultChecked?: DataTableRowKey[]
    rowCheckable?: (row: T) => boolean
    maxSelection?: number
    childSelection?: {
      enabled?: boolean
      childRowCheckable?: (childRow: any, parentRow: T) => boolean
    }
    parentChildLink?: {
      enabled?: boolean
      mode?: ParentChildLinkMode
    }
  }

  interface EditConfig {
    enabled?: boolean
    mode?: 'row' | 'cell' | 'modal' | 'both' | 'none'
    showRowActions?: boolean
    modalTitle?: string
    modalWidth?: number
  }

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
      childSelection?: ChildSelectionState
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

  // ================= 配置合并工具函数 =================

  /**
   * @description: 处理动态行配置
   * @param preset - 预设配置对象
   * @param props - 组件属性
   * @return 处理后的动态行配置
   */
  function processDynamicRowsConfig<T extends DataRecord>(
    preset: TablePresetConfig<T>,
    props: EnhancedTableProps<T>
  ) {
    return preset.dynamicRows
      ? typeof preset.dynamicRows === 'boolean'
        ? ({
            enableRadioSelection: true,
            enableAdd: true,
            enableInsert: true,
            enableDelete: true,
            enableCopy: true,
            enableMove: true,
            enablePrint: true,
          } as DynamicRowsOptions<T>)
        : preset.dynamicRows
      : props.dynamicRowsOptions
  }

  /**
   * @description: 处理展开功能配置
   * @param preset - 预设配置对象
   * @param props - 组件属性
   * @return 处理后的展开配置
   */
  function processExpandConfig<T extends DataRecord>(
    preset: TablePresetConfig<T>,
    props: EnhancedTableProps<T>
  ) {
    const expandConfig = preset.expandable
      ? typeof preset.expandable === 'boolean'
        ? { enabled: true }
        : preset.expandable
      : {}

    return {
      expandable: expandConfig.enabled ?? props.expandable,
      defaultExpandedKeys:
        expandConfig.defaultExpanded ?? props.defaultExpandedKeys,
      onLoadExpandData: expandConfig.onLoadData ?? props.onLoadExpandData,
      renderExpandContent:
        expandConfig.renderContent ?? props.renderExpandContent,
      rowExpandable: expandConfig.rowExpandable ?? props.rowExpandable,
    }
  }

  /**
   * @description: 处理基础选择配置
   * @param selectionConfig - 选择配置对象
   * @param props - 组件属性
   * @return 处理后的基础选择配置
   */
  function processBasicSelectionConfig<T extends DataRecord>(
    selectionConfig: any,
    props: EnhancedTableProps<T>
  ) {
    return {
      enableSelection: selectionConfig.enabled ?? props.enableSelection,
      defaultCheckedKeys:
        selectionConfig.defaultChecked ?? props.defaultCheckedKeys,
      rowCheckable: selectionConfig.rowCheckable ?? props.rowCheckable,
      maxSelection: selectionConfig.maxSelection ?? props.maxSelection,
    }
  }

  /**
   * @description: 处理子选择配置
   * @param selectionConfig - 选择配置对象
   * @param props - 组件属性
   * @return 处理后的子选择配置
   */
  function processChildSelectionConfig<T extends DataRecord>(
    selectionConfig: any,
    props: EnhancedTableProps<T>
  ) {
    return {
      enableChildSelection:
        selectionConfig.childSelection?.enabled ?? props.enableChildSelection,
      childRowCheckable:
        selectionConfig.childSelection?.childRowCheckable ??
        props.childRowCheckable,
    }
  }

  /**
   * @description: 处理父子联动配置
   * @param selectionConfig - 选择配置对象
   * @param props - 组件属性
   * @return 处理后的父子联动配置
   */
  function processParentChildLinkConfig<T extends DataRecord>(
    selectionConfig: any,
    props: EnhancedTableProps<T>
  ) {
    return {
      enableParentChildLink:
        selectionConfig.parentChildLink?.enabled ?? props.enableParentChildLink,
      parentChildLinkMode:
        selectionConfig.parentChildLink?.mode ?? props.parentChildLinkMode,
    }
  }

  /**
   * @description: 处理选择功能配置
   * @param preset - 预设配置对象
   * @param props - 组件属性
   * @return 处理后的选择配置
   */
  function processSelectionConfig<T extends DataRecord>(
    preset: TablePresetConfig<T>,
    props: EnhancedTableProps<T>
  ) {
    const selectionConfig = preset.selection
      ? typeof preset.selection === 'boolean'
        ? { enabled: true }
        : preset.selection
      : {}

    return {
      ...processBasicSelectionConfig(selectionConfig, props),
      ...processChildSelectionConfig(selectionConfig, props),
      ...processParentChildLinkConfig(selectionConfig, props),
    }
  }

  /**
   * @description: 处理编辑功能配置
   * @param preset - 预设配置对象
   * @param props - 组件属性
   * @return 处理后的编辑配置
   */
  function processEditConfig<T extends DataRecord>(
    preset: TablePresetConfig<T>,
    props: EnhancedTableProps<T>
  ) {
    const editConfig = preset.edit
      ? typeof preset.edit === 'boolean'
        ? { enabled: true }
        : preset.edit
      : {}

    return {
      editable: editConfig.enabled ?? props.editable,
      editMode: editConfig.mode ?? props.editMode,
      showRowActions: editConfig.showRowActions ?? props.showRowActions,
      modalTitle: editConfig.modalTitle ?? props.modalTitle,
      modalWidth: editConfig.modalWidth ?? props.modalWidth,
    }
  }

  /**
   * @description: 创建统一配置对象
   * @param props - 组件属性
   * @return 合并后的统一配置
   */
  function createUnifiedConfig<T extends DataRecord>(
    props: EnhancedTableProps<T>
  ) {
    const preset = props.preset || {}

    return {
      dynamicRows: processDynamicRowsConfig(preset, props),
      ...processExpandConfig(preset, props),
      ...processSelectionConfig(preset, props),
      ...processEditConfig(preset, props),
    }
  }

  // ================= 编辑组件映射 =================

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

  // ================= 事件处理器工厂 =================

  const createEventHandlers = () => ({
    // 通用事件
    onSave: handleSave,
    onCancel: handleCancel,

    // 展开选择事件
    onExpandChange: (
      keys: DataTableRowKey[],
      row?: DataRecord,
      expanded?: boolean
    ) => {
      emit('expand-change', keys, row, expanded)
    },
    onSelectionChange: (
      checkedKeys: DataTableRowKey[],
      checkedRows: DataRecord[],
      childSelections: any
    ) => {
      emit('selection-change', checkedKeys, checkedRows, childSelections)
    },
    onChildSelectionChange: (
      parentKey: DataTableRowKey,
      childKeys: DataTableRowKey[],
      childRows: any[]
    ) => {
      emit('child-selection-change', parentKey, childKeys, childRows)
    },

    // 动态行事件
    onRowChange: (data: DataRecord[]) => {
      emit('update:data', data)
      config.value.dynamicRows?.onRowChange?.(data)
    },
    onRowSelectionChange: (
      selectedKey: DataTableRowKey | null,
      selectedRow: DataRecord | null
    ) => {
      emit('row-selection-change', selectedKey, selectedRow)
      config.value.dynamicRows?.onSelectionChange?.(selectedKey, selectedRow)
    },
    onRowAdd: (newRow: DataRecord) => {
      emit('row-add', newRow)
      config.value.dynamicRows?.onRowAdd?.(newRow)
    },
    onRowDelete: (deletedRow: DataRecord, index: number) => {
      emit('row-delete', deletedRow, index)
      config.value.dynamicRows?.onRowDelete?.(deletedRow, index)
    },
    onRowCopy: (originalRow: DataRecord, newRow: DataRecord) => {
      emit('row-copy', originalRow, newRow)
      config.value.dynamicRows?.onRowCopy?.(originalRow, newRow)
    },
    onRowMove: (row: DataRecord, fromIndex: number, toIndex: number) => {
      emit('row-move', row, fromIndex, toIndex)
      config.value.dynamicRows?.onRowMove?.(row, fromIndex, toIndex)
    },
  })

  const eventHandlers = createEventHandlers()

  // ================= 功能状态初始化 =================

  // 编辑功能
  const rowEdit = useRowEdit({
    data: () => props.data,
    rowKey: props.rowKey,
    onSave: eventHandlers.onSave,
    onCancel: eventHandlers.onCancel,
  })

  const cellEdit = useCellEdit({
    data: () => props.data,
    rowKey: props.rowKey,
    onSave: eventHandlers.onSave,
  })

  const modalEdit = useModalEdit({
    data: () => props.data,
    rowKey: props.rowKey,
    onSave: eventHandlers.onSave,
    onCancel: eventHandlers.onCancel,
  })

  // 展开功能
  const expandState = (() => {
    const needsExpand =
      config.value.expandable ||
      config.value.enableSelection ||
      config.value.enableChildSelection

    if (!needsExpand) return null

    return useTableExpand({
      data: computed(() => props.data),
      rowKey: props.rowKey,
      childRowKey: (child: any) => child.id,

      // 配置
      defaultExpandedKeys: config.value.defaultExpandedKeys,
      onLoadData: config.value.onLoadExpandData,
      renderContent: config.value.renderExpandContent,
      rowExpandable: config.value.rowExpandable,
      enableSelection: config.value.enableSelection,
      defaultCheckedKeys: config.value.defaultCheckedKeys,
      rowCheckable: config.value.rowCheckable,
      maxSelection: config.value.maxSelection,
      enableChildSelection: config.value.enableChildSelection,
      childRowCheckable: config.value.childRowCheckable,
      enableParentChildLink: config.value.enableParentChildLink,
      parentChildLinkMode: config.value.parentChildLinkMode,

      // 事件
      onExpandChange: eventHandlers.onExpandChange,
      onSelectionChange: eventHandlers.onSelectionChange,
      onChildSelectionChange: eventHandlers.onChildSelectionChange,
    })
  })()

  // 动态行功能
  const dynamicRowsState = (() => {
    if (!config.value.dynamicRows) return null

    const dynamicOptions: DynamicRowsOptions<DataRecord> = {
      ...config.value.dynamicRows,
      onRowChange: eventHandlers.onRowChange,
      onSelectionChange: eventHandlers.onRowSelectionChange,
      onRowAdd: eventHandlers.onRowAdd,
      onRowDelete: eventHandlers.onRowDelete,
      onRowCopy: eventHandlers.onRowCopy,
      onRowMove: eventHandlers.onRowMove,
    }

    return useDynamicRows(
      computed(() => props.data),
      dynamicOptions
    )
  })()

  // 状态计算
  const expandedKeys = computed(() => expandState?.expandedKeys.value ?? [])
  const checkedKeys = computed(() => expandState?.checkedKeys.value ?? [])
  const renderExpandFunction = computed(() => undefined)

  // ================= 事件处理函数 =================

  /**
   * @description: 处理保存操作
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
   * @description: 处理取消操作
   */
  function handleCancel(rowData: DataRecord, rowIndex: number) {
    emit('cancel', rowData, rowIndex)
  }

  /**
   * @description: 处理模态框编辑数据更新
   */
  function handleFormUpdate(value: DataRecord) {
    Object.assign(modalEdit.editingData, value)
  }

  /**
   * @description: 处理模态框保存操作
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
   * @description: 处理展开行键变化
   */
  function handleExpandedRowKeysChange(keys: DataTableRowKey[]) {
    expandState?.handleExpandChange(keys)
  }

  /**
   * @description: 处理选中行键变化
   */
  function handleCheckedRowKeysChange(keys: DataTableRowKey[]) {
    expandState?.handleSelectionChange(keys)
  }

  // ================= 工具函数 =================

  /**
   * @description:  检查保存参数是否有效
   */
  function isValidSaveParams(rowData: DataRecord, rowIndex: number): boolean {
    return !!(rowData && rowIndex >= 0 && rowIndex < props.data.length)
  }

  /**
   * @description: 获取描述信息的跨度
   */
  function getDescriptionSpan(column: TableColumn): number {
    return column.key === 'description' || column.editProps?.type === 'textarea'
      ? 2
      : 1
  }

  // ================= 渲染工具函数 =================

  /**
   * 渲染编辑组件
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
   * 渲染单元格编辑操作按钮
   */
  function renderCellEditActions(rowKey: DataTableRowKey): VNodeChild {
    console.log('🚀 ~ renderCellEditActions ~ rowKey:', rowKey)

    const buttonClass =
      'flex items-center justify-center w-6 h-6 rounded-md hover:scale-110 active:scale-95 transition-all duration-200 flex-shrink-0'

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
            class: `${buttonClass} text-green-600 hover:text-green-700 hover:bg-green-50`,
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
            class: `${buttonClass} text-red-600 hover:text-red-700 hover:bg-red-50`,
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
   * 编辑模式检查器
   */
  const editModeChecker = {
    isNonEditable: (column: TableColumn) =>
      !config.value.editable ||
      column.editable === false ||
      config.value.editMode === 'none',

    isRowEditMode: () =>
      config.value.editMode === 'row' || config.value.editMode === 'both',

    isCellEditMode: () =>
      config.value.editMode === 'cell' || config.value.editMode === 'both',
  }

  /**
   * 渲染单元格
   */
  function renderCell(
    column: TableColumn,
    rowData: DataRecord,
    rowIndex: number
  ): VNodeChild {
    const value = rowData[column.key]
    const rowKey = props.rowKey(rowData)

    // 不可编辑
    if (editModeChecker.isNonEditable(column)) {
      return renderDisplayCell(column, rowData, rowIndex, value)
    }

    // 行编辑模式
    if (editModeChecker.isRowEditMode() && rowEdit.isEditingRow(rowKey)) {
      return renderEditComponent(
        column,
        rowEdit.getEditingRowData(rowKey)?.[column.key] ?? value,
        val => rowEdit.updateEditingRowData(rowKey, column.key, val)
      )
    }

    // 单元格编辑模式
    if (editModeChecker.isCellEditMode()) {
      return cellEdit.isEditingCell(rowKey, column.key)
        ? renderEditingCell(column, rowData, rowKey)
        : renderEditableCell(column, rowData, rowIndex, value, rowKey)
    }

    return renderDisplayCell(column, rowData, rowIndex, value)
  }

  /**
   * @description: 渲染单元格显示内容
   */
  function renderDisplayCell(
    column: TableColumn,
    rowData: DataRecord,
    rowIndex: number,
    value: unknown
  ): VNodeChild {
    if (column.render) {
      return column.render(rowData, rowIndex) ?? String(value ?? '')
    }
    return String(value ?? '')
  }

  /**
   * @description: 渲染单元格编辑内容
   */
  function renderEditingCell(
    column: TableColumn,
    rowData: DataRecord,
    rowKey: DataTableRowKey
  ): VNodeChild {
    return h(
      'div',
      { class: 'relative w-full min-h-9 flex items-center overflow-visible' },
      [
        h('div', { class: 'flex-1 min-w-0 pr-20' }, [
          renderEditComponent(
            column,
            cellEdit.getEditingCellValue(rowKey, column.key) ??
              rowData[column.key],
            val => cellEdit.updateEditingCellValue(rowKey, column.key, val)
          ),
        ]),
        renderCellEditActions(rowKey),
      ]
    )
  }

  /**
   * @description: 渲染可编辑单元格
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
   * 渲染操作按钮
   */
  function renderActions(rowData: DataRecord, rowIndex: number): VNodeChild {
    const rowKey = props.rowKey(rowData)
    const actions: VNodeChild[] = []

    // 行编辑按钮
    if (editModeChecker.isRowEditMode()) {
      actions.push(rowEdit.renderRowActions(rowKey))
    }

    // 模态框编辑按钮
    if (config.value.editMode === 'modal') {
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

    // 自定义操作按钮
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
    if (dynamicRowsState) {
      columns = dynamicRowsState.enhanceColumns(
        columns as any
      ) as DataTableColumn[]
    }

    if (
      expandState &&
      (config.value.expandable || config.value.enableSelection)
    ) {
      columns = expandState.getTableColumns(columns as any) as DataTableColumn[]
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

  // ================= 统一的状态管理器 =================

  const stateManager = {
    // 编辑控制
    edit: {
      /**
       * @description: 开始编辑
       */
      start(rowKey: DataTableRowKey, columnKey?: string) {
        const mode = config.value.editMode
        if (mode === 'modal') modalEdit.startEdit(rowKey)
        else if (mode === 'cell' && columnKey)
          cellEdit.startEditCell(rowKey, columnKey)
        else if (mode === 'row' || mode === 'both') rowEdit.startEditRow(rowKey)
      },

      /**
       * @description: 取消编辑
       */
      cancel() {
        if (modalEdit.isModalVisible.value) modalEdit.cancelEdit()
        else if (cellEdit.editingCell.value.rowKey) cellEdit.cancelEditCell()
        else if (rowEdit.editingRowKey.value) rowEdit.cancelEditRow()
      },

      /**
       * @description: 保存编辑
       */
      async save() {
        if (modalEdit.isModalVisible.value) await handleModalSave()
        else if (cellEdit.editingCell.value.rowKey)
          await cellEdit.saveEditCell()
        else if (rowEdit.editingRowKey.value) await rowEdit.saveEditRow()
      },

      /**
       * @description: 是否正在编辑
       */
      isEditing(rowKey: DataTableRowKey, columnKey?: string) {
        if (config.value.editMode === 'modal')
          return modalEdit.isEditingRow(rowKey)
        if (columnKey) return cellEdit.isEditingCell(rowKey, columnKey)
        return rowEdit.isEditingRow(rowKey)
      },

      /**
       * @description: 获取当前编辑数据
       */
      getEditingData() {
        if (modalEdit.isModalVisible.value) return modalEdit.editingData
        if (rowEdit.editingRowKey.value) {
          return rowEdit.getEditingRowData(rowEdit.editingRowKey.value!)
        }
        return null
      },
    },

    // 展开控制
    expand: {
      /**
       * @description: 展开行
       */
      async row(rowKey: DataTableRowKey) {
        if (expandState) {
          const currentKeys = [...expandState.expandedKeys.value]
          if (!currentKeys.includes(rowKey)) {
            currentKeys.push(rowKey)
            expandState.handleExpandChange(currentKeys)
          }
        }
      },

      /**
       * @description: 折叠行
       */
      collapse(rowKey: DataTableRowKey) {
        if (expandState) {
          const currentKeys = expandState.expandedKeys.value.filter(
            key => key !== rowKey
          )
          expandState.handleExpandChange(currentKeys)
        }
      },

      /**
       * @description: 展开折叠切换
       */
      async toggle(rowKey: DataTableRowKey) {
        if (expandState?.expandedKeys.value.includes(rowKey)) {
          this.collapse(rowKey)
        } else {
          await this.row(rowKey)
        }
      },

      /**
       * @description: 展开所有行
       */
      async all() {
        await expandState?.expandAll()
      },
      /**
       * @description: 折叠所有行
       */
      collapseAll() {
        expandState?.collapseAll()
      },
      /**
       * @description: 检查行是否已展开
       */
      isExpanded(rowKey: DataTableRowKey) {
        return expandState?.expandedKeys.value.includes(rowKey) ?? false
      },
    },

    // 选择控制
    selection: {
      /**
       * @description: 选择指定行
       */
      select(rowKey: DataTableRowKey) {
        if (
          expandState?.checkedKeys.value &&
          !expandState.checkedKeys.value.includes(rowKey)
        ) {
          const newKeys = [...expandState.checkedKeys.value, rowKey]
          expandState.handleSelectionChange(newKeys)
        }
      },

      /**
       * @description: 取消选择指定行
       */
      unselect(rowKey: DataTableRowKey) {
        if (expandState?.checkedKeys.value) {
          const newKeys = expandState.checkedKeys.value.filter(
            key => key !== rowKey
          )
          expandState.handleSelectionChange(newKeys)
        }
      },

      /**
       * @description: 选择所有行
       */
      all() {
        expandState?.selectAll()
      },

      /**
       * @description: 清除所有行选择
       */
      clear() {
        expandState?.clearSelection()
      },

      /**
       * @description: 检查行是否已选择
       */
      isSelected(rowKey: DataTableRowKey) {
        return expandState?.checkedKeys.value.includes(rowKey) ?? false
      },

      /**
       * @description: 获取所有已选择的行数据
       */
      getSelected() {
        if (!expandState?.checkedKeys.value) return []
        return props.data.filter(row =>
          expandState!.checkedKeys.value.includes(props.rowKey(row))
        )
      },
    },

    // 子选择控制
    childSelection: {
      /**
       * @description: 选择指定父行下的子行
       */
      select(parentKey: DataTableRowKey, childKey: DataTableRowKey) {
        if (expandState?.childSelections.value) {
          const current = expandState.childSelections.value.get(parentKey) || []
          if (!current.includes(childKey)) {
            const newSelection = [...current, childKey]
            expandState.childSelections.value.set(parentKey, newSelection)
            emit('child-selection-change', parentKey, newSelection, [])
          }
        }
      },

      /**
       * @description: 取消选择指定父行下的子行
       */
      unselect(parentKey: DataTableRowKey, childKey: DataTableRowKey) {
        if (expandState?.childSelections.value) {
          const current = expandState.childSelections.value.get(parentKey) || []
          const newSelection = current.filter(k => k !== childKey)
          expandState.childSelections.value.set(parentKey, newSelection)
          emit('child-selection-change', parentKey, newSelection, [])
        }
      },

      /**
       * @description: 选择指定父行下的所有子行
       */
      selectAll(parentKey: DataTableRowKey) {
        if (
          expandState?.childSelections.value &&
          expandState.expandDataMap?.value
        ) {
          const expandData =
            expandState.expandDataMap.value.get(parentKey) || []
          const allChildKeys = expandData.map((child: any) => child.id)
          expandState.childSelections.value.set(parentKey, allChildKeys)
          emit('child-selection-change', parentKey, allChildKeys, expandData)
        }
      },

      /**
       * @description: 清除指定父行下的所有子行选择
       */
      clear(parentKey: DataTableRowKey) {
        if (expandState?.childSelections.value) {
          expandState.childSelections.value.set(parentKey, [])
          emit('child-selection-change', parentKey, [], [])
        }
      },

      /**
       * @description: 获取指定父行下所有已选择的子行数据
       */
      getSelected(parentKey: DataTableRowKey) {
        if (
          !expandState?.childSelections.value ||
          !expandState.expandDataMap?.value
        ) {
          return []
        }
        const selectedKeys =
          expandState.childSelections.value.get(parentKey) || []
        const expandData = expandState.expandDataMap.value.get(parentKey) || []
        return expandData.filter((child: any) =>
          selectedKeys.includes(child.id)
        )
      },
    },

    // 动态行控制
    dynamicRows: {
      /**
       * @description: 添加行
       */
      add() {
        dynamicRowsState?.addRow()
      },
      /**
       * @description: 插入行
       */
      insert() {
        dynamicRowsState?.insertRow()
      },

      /**
       * @description: 删除行
       */
      delete() {
        dynamicRowsState?.deleteRow()
      },
      /**
       * @description: 复制行
       */
      copy() {
        dynamicRowsState?.copyRow()
      },
      /**
       * @description:  上移动态行
       */
      moveUp() {
        dynamicRowsState?.moveRowUp()
      },
      /**
       * @description: 下移动态行
       */
      moveDown() {
        dynamicRowsState?.moveRowDown()
      },
      /**
       * @description: 清空动态行数据
       */
      clearSelection() {
        dynamicRowsState?.clearSelection()
      },
      /**
       * @description: 获取当前选中的动态行数据
       */
      getSelected() {
        return dynamicRowsState?.selectedRowData.value || null
      },

      /**
       * @description: 打印表格
       */
      async print(elementRef?: HTMLElement) {
        if (dynamicRowsState && elementRef) {
          await dynamicRowsState.handlePrint(ref(elementRef))
        }
      },

      /**
       * @description: 导出表格数据
       */
      async download(elementRef?: HTMLElement, filename?: string) {
        if (dynamicRowsState && elementRef) {
          await dynamicRowsState.handleDownload(ref(elementRef), filename)
        }
      },
    },

    //
    /**
     * @description: 清除所有选择
     */
    clearAllSelections() {
      expandState?.clearAllSelections()
    },
  }

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
    startEdit: stateManager.edit.start,
    cancelEdit: stateManager.edit.cancel,
    saveEdit: stateManager.edit.save,
    isEditing: stateManager.edit.isEditing,
    getEditingData: stateManager.edit.getEditingData,

    // 展开相关
    expandRow: stateManager.expand.row,
    collapseRow: stateManager.expand.collapse,
    toggleExpand: stateManager.expand.toggle,
    expandAll: stateManager.expand.all,
    collapseAll: stateManager.expand.collapseAll,
    isExpanded: stateManager.expand.isExpanded,

    // 选择相关
    selectRow: stateManager.selection.select,
    unselectRow: stateManager.selection.unselect,
    selectAll: stateManager.selection.all,
    clearSelection: stateManager.selection.clear,
    isRowSelected: stateManager.selection.isSelected,
    getSelectedRows: stateManager.selection.getSelected,

    // 子选择相关
    selectChildRow: stateManager.childSelection.select,
    unselectChildRow: stateManager.childSelection.unselect,
    selectAllChildren: stateManager.childSelection.selectAll,
    clearChildrenSelection: stateManager.childSelection.clear,
    getChildSelectedRows: stateManager.childSelection.getSelected,
    clearAllSelections: stateManager.clearAllSelections,

    // 动态行相关
    addRow: stateManager.dynamicRows.add,
    insertRow: stateManager.dynamicRows.insert,
    deleteRow: stateManager.dynamicRows.delete,
    copyRow: stateManager.dynamicRows.copy,
    moveRowUp: stateManager.dynamicRows.moveUp,
    moveRowDown: stateManager.dynamicRows.moveDown,
    clearRowSelection: stateManager.dynamicRows.clearSelection,
    getSelectedRowData: stateManager.dynamicRows.getSelected,
    printTable: stateManager.dynamicRows.print,
    downloadTableScreenshot: stateManager.dynamicRows.download,
  })
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
