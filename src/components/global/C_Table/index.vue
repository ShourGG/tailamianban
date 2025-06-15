<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-13 18:38:58
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-15 19:04:09
 * @FilePath: \Robot_Admin\src\components\global\C_Table\index.vue
 * @Description: 超级表格组件 - 优化版本
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
      :expanded-row-keys="expandedKeys"
      :render-expand="renderExpandFunction"
      @update:expanded-row-keys="handleExpandedRowKeysChange"
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
  </div>
</template>

<script setup lang="ts">
  import type { VNodeChild, ComponentPublicInstance } from 'vue'

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
    EditType,
  } from '@/types/modules/table'
  import { useRowEdit } from '@/composables/Table/useRowEdit'
  import { useCellEdit } from '@/composables/Table/useCellEdit'
  import { useModalEdit } from '@/composables/Table/useModalEdit'
  import { useTableExpand } from '@/composables/Table/useTableExpand'
  import {
    getDisplayValue,
    generateFormOptions,
    getTableProps,
    processColumnConfig,
  } from './data'

  interface CFormInstance {
    validate: () => Promise<void>
  }

  // 扩展 TableProps 支持展开功能
  interface EnhancedTableProps<T = Record<string, any>> extends TableProps<T> {
    expandable?: boolean
    onLoadExpandData?: (row: T) => Promise<any[]> | any[]
    renderExpandContent?: (
      row: T,
      expandData: any[],
      loading: boolean
    ) => VNodeChild
    rowExpandable?: (row: T) => boolean
  }

  type DataRecord = Record<string, unknown>

  // 编辑组件映射 - 优化类型安全
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
  })

  // Emits 定义
  const emit = defineEmits<{
    'update:data': [data: DataRecord[]]
    save: [rowData: DataRecord, rowIndex: number, columnKey?: string]
    cancel: [rowData: DataRecord, rowIndex: number]
  }>()

  // Refs
  const tableRef = ref<ComponentPublicInstance>()
  const cFormRef = ref<CFormInstance>()
  const viewModalVisible = ref(false)
  const viewingData = ref<DataRecord>({})
  const submitLoading = ref(false)

  // 计算属性 - 使用类型安全的过滤
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

  // 展开功能 - 简化空值检查
  const expandState = computed(() => {
    if (!props.expandable) return null

    return useTableExpand({
      data: computed(() => props.data),
      rowKey: props.rowKey,
      rowExpandable: props.rowExpandable,
      onLoadData: props.onLoadExpandData,
      renderContent: props.renderExpandContent,
      onExpandChange: (keys: DataTableRowKey[]) => {
        console.log('🔥 C_Table - 展开状态变化:', keys)
      },
    })
  })

  const expandedKeys = computed(
    () => expandState.value?.expandedKeys.value ?? []
  )

  const renderExpandFunction = computed(() =>
    expandState.value?.getRenderExpand()
  )

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

  // 核心处理函数
  /**
   * @description 处理数据保存操作
   * ? @param rowData - 行数据对象
   * ? @param rowIndex - 行索引
   * ? @param columnKey - 列键值(可选)
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
   * @description 处理取消编辑操作
   * ? @param rowData - 行数据对象
   * ? @param rowIndex - 行索引
   * ! @return void
   */
  function handleCancel(rowData: DataRecord, rowIndex: number) {
    emit('cancel', rowData, rowIndex)
  }

  /**
   * @description 处理表单数据更新
   * ? @param value - 更新的表单数据
   * ! @return void
   */
  function handleFormUpdate(value: DataRecord) {
    Object.assign(modalEdit.editingData, value)
  }

  /**
   * @description 处理模态框保存操作
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
   * @description 处理展开行键值变化
   * ? @param keys - 展开的行键值数组
   * ! @return void
   */
  function handleExpandedRowKeysChange(keys: DataTableRowKey[]) {
    console.log('🔥 C_Table - handleExpandedRowKeysChange:', keys)
    if (expandState.value) {
      expandState.value.expandedKeys.value = keys
    }
  }

  // 工具函数
  /**
   * @description 验证保存参数的有效性
   * ? @param rowData - 行数据对象
   * ? @param rowIndex - 行索引
   * ! @return 参数是否有效
   */
  function isValidSaveParams(rowData: DataRecord, rowIndex: number): boolean {
    return !!(rowData && rowIndex >= 0 && rowIndex < props.data.length)
  }

  /**
   * @description 获取描述项的跨度
   * ? @param column - 列配置对象
   * ! @return 跨度数值
   */
  function getDescriptionSpan(column: TableColumn): number {
    return column.key === 'description' || column.editProps?.type === 'textarea'
      ? 2
      : 1
  }

  /**
   * @description 获取编辑模式下的单元格值
   * ? @param column - 列配置对象
   * ? @param rowData - 行数据对象
   * ? @param rowKey - 行键值
   * ! @return 单元格值
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
   * @description 获取单元格编辑模式下的值
   * ? @param column - 列配置对象
   * ? @param rowData - 行数据对象
   * ? @param rowKey - 行键值
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
   * @description 渲染编辑组件
   * ? @param column - 列配置对象
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
   * @description 渲染单元格编辑操作按钮
   * ? @param rowKey - 行键值
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
    )
  }

  /**
   * @description 渲染表格单元格
   * ? @param column - 列配置对象
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

    // 不可编辑状态
    if (
      !props.editable ||
      column.editable === false ||
      props.editMode === 'none'
    ) {
      return renderDisplayCell(column, rowData, rowIndex, value)
    }

    // 行编辑模式
    if (isRowEditMode() && rowEdit.isEditingRow(rowKey)) {
      return renderEditComponent(
        column,
        getEditValue(column, rowData, rowKey),
        val => rowEdit.updateEditingRowData(rowKey, column.key, val)
      )
    }

    // 单元格编辑模式
    if (isCellEditMode()) {
      return cellEdit.isEditingCell(rowKey, column.key)
        ? renderEditingCell(column, rowData, rowKey)
        : renderEditableCell(column, rowData, rowIndex, value, rowKey)
    }

    return renderDisplayCell(column, rowData, rowIndex, value)
  }

  /**
   * @description 渲染显示模式的单元格
   * ? @param column - 列配置对象
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
   * @description 渲染编辑中的单元格
   * ? @param column - 列配置对象
   * ? @param rowData - 行数据对象
   * ? @param rowKey - 行键值
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
   * @description 渲染可编辑的单元格
   * ? @param column - 列配置对象
   * ? @param rowData - 行数据对象
   * ? @param rowIndex - 行索引
   * ? @param value - 单元格值
   * ? @param rowKey - 行键值
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
   * @description 判断是否为行编辑模式
   * ! @return 是否为行编辑模式
   */
  function isRowEditMode(): boolean {
    return props.editMode === 'row' || props.editMode === 'both'
  }

  /**
   * @description 判断是否为单元格编辑模式
   * ! @return 是否为单元格编辑模式
   */
  function isCellEditMode(): boolean {
    return props.editMode === 'cell' || props.editMode === 'both'
  }

  /**
   * @description 渲染操作列
   * ? @param rowData - 行数据对象
   * ? @param rowIndex - 行索引
   * ! @return Vue节点子元素
   */
  function renderActions(rowData: DataRecord, rowIndex: number): VNodeChild {
    const rowKey = props.rowKey(rowData)
    const actions: VNodeChild[] = []

    // 编辑相关操作
    if (isRowEditMode()) {
      actions.push(rowEdit.renderRowActions(rowKey))
    }

    if (props.editMode === 'modal') {
      actions.push(renderModalEditButton(rowKey))
    }

    // 自定义操作
    if (!rowEdit.isEditingRow(rowKey)) {
      addCustomActions(actions, rowData, rowIndex)
    }

    return h(NSpace, { size: 2, wrap: false }, () => actions)
  }

  /**
   * @description 渲染模态框编辑按钮
   * ? @param rowKey - 行键值
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
   * @description 添加自定义操作按钮
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

  // 计算列配置
  const computedColumns = computed((): DataTableColumn[] => {
    console.log('🔥 C_Table - 计算列配置, expandable:', props.expandable)

    // 基础列配置
    let columns: DataTableColumn[] = props.columns.map(column => ({
      ...column,
      width: column.width || props.columnWidth,
      titleAlign: 'center' as const,
      align: 'center' as const,
      render: (rowData: DataRecord, rowIndex: number) =>
        renderCell(column, rowData, rowIndex),
    }))

    // 展开功能增强
    if (props.expandable && expandState.value) {
      console.log('🔥 C_Table - 使用 expandState.getColumnsWithExpand')
      columns = expandState.value.getColumnsWithExpand(
        columns as any
      ) as DataTableColumn[]
    }

    // 添加操作列
    if (shouldShowActionsColumn()) {
      columns.push(createActionsColumn())
    }

    return columns
  })

  /**
   * @description 判断是否应该显示操作列
   * ! @return 是否显示操作列
   */
  function shouldShowActionsColumn(): boolean {
    return !!(
      props.showRowActions &&
      (props.editable || props.rowActions?.length)
    )
  }

  /**
   * @description 创建操作列配置
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

  // 编辑模式处理 - 使用映射减少圈复杂度
  const editModeHandlers = {
    modal: (rowKey: DataTableRowKey) => modalEdit.startEdit(rowKey),
    cell: (rowKey: DataTableRowKey, columnKey?: string) =>
      columnKey && cellEdit.startEditCell(rowKey, columnKey),
    row: (rowKey: DataTableRowKey) => rowEdit.startEditRow(rowKey),
    both: (rowKey: DataTableRowKey) => rowEdit.startEditRow(rowKey),
    none: () => {},
  } as const

  /**
   * @description 处理开始编辑操作
   * ? @param rowKey - 行键值
   * ? @param columnKey - 列键值(可选)
   * ! @return void
   */
  function handleStartEdit(rowKey: DataTableRowKey, columnKey?: string) {
    const handler = editModeHandlers[props.editMode]
    handler?.(rowKey, columnKey)
  }

  // 编辑状态管理
  const editStateManagers = {
    isModalEditing: () => modalEdit.isModalVisible.value,
    isCellEditing: () => !!cellEdit.editingCell.value.rowKey,
    isRowEditing: () => !!rowEdit.editingRowKey.value,

    cancelModal: () => modalEdit.cancelEdit(),
    cancelCell: () => cellEdit.cancelEditCell(),
    cancelRow: () => rowEdit.cancelEditRow(),

    saveModal: () => handleModalSave(),
    saveCell: () => cellEdit.saveEditCell(),
    saveRow: () => rowEdit.saveEditRow(),
  }

  // 暴露方法
  defineExpose<
    TableInstance & {
      expandAll: () => void
      collapseAll: () => void
    }
  >({
    startEdit: handleStartEdit,

    /**
     * @description: 取消当前的编辑操作，根据当前编辑模式自动选择对应的取消方法
     * 支持三种编辑模式：模态框编辑、单元格编辑、行编辑
     * @return {void} 无返回值
     */
    cancelEdit() {
      if (editStateManagers.isModalEditing()) editStateManagers.cancelModal()
      else if (editStateManagers.isCellEditing()) editStateManagers.cancelCell()
      else if (editStateManagers.isRowEditing()) editStateManagers.cancelRow()
    },

    /**
     * @description: 保存当前的编辑操作，根据当前编辑模式自动选择对应的保存方法
     * 支持三种编辑模式：模态框编辑、单元格编辑、行编辑
     * @return {Promise<void>} 返回保存操作的Promise对象
     */
    async saveEdit() {
      if (editStateManagers.isModalEditing())
        await editStateManagers.saveModal()
      else if (editStateManagers.isCellEditing())
        await editStateManagers.saveCell()
      else if (editStateManagers.isRowEditing())
        await editStateManagers.saveRow()
    },

    /**
     * @description: 判断指定行或单元格是否处于编辑状态
     * 根据editMode配置和参数来确定检查范围：
     * - 模态框模式：检查指定行是否在模态框中编辑
     * - 提供columnKey时：检查指定单元格是否在编辑
     * - 仅提供rowKey时：检查指定行是否在编辑
     * @param {DataTableRowKey} rowKey 行的唯一标识键值
     * @param {string} [columnKey] 列的标识键值，可选参数
     * @return {boolean} 返回true表示正在编辑，false表示未编辑
     */
    isEditing(rowKey: DataTableRowKey, columnKey?: string) {
      if (props.editMode === 'modal') return modalEdit.isEditingRow(rowKey)
      if (columnKey) return cellEdit.isEditingCell(rowKey, columnKey)
      return rowEdit.isEditingRow(rowKey)
    },

    /**
     * @description: 获取当前正在编辑的数据
     * 根据当前编辑模式返回对应的编辑数据：
     * - 模态框编辑：返回模态框中的编辑数据
     * - 行编辑：返回正在编辑行的数据
     * - 单元格编辑或无编辑状态：返回null
     * @return {Object|null} 返回编辑数据对象，无编辑时返回null
     */
    getEditingData() {
      if (editStateManagers.isModalEditing()) return modalEdit.editingData
      if (editStateManagers.isRowEditing()) {
        return rowEdit.getEditingRowData(rowEdit.editingRowKey.value!)
      }
      return null
    },

    /**
     * @description: 展开表格中所有可展开的行
     * 适用于树形表格或分组表格，将所有折叠的行展开显示
     */
    expandAll() {
      console.log('🔥 C_Table - expandAll 被调用')
      expandState.value?.expandAll()
    },

    /**
     * @description: 折叠表格中所有已展开的行
     * 适用于树形表格或分组表格，将所有展开的行折叠隐藏
     */
    collapseAll() {
      console.log('🔥 C_Table - collapseAll 被调用')
      expandState.value?.collapseAll()
    },
  })
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
