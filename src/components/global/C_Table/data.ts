/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-14 22:06:22
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-18 14:14:23
 * @FilePath: \Robot_Admin\src\components\global\C_Table\data.ts
 * @Description: 表格数据处理模块
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { DataTableProps, DataTableRowKey } from 'naive-ui/es'
import type {
  TableColumn,
  TableProps,
  EditType,
  DataRecord,
} from '@/types/modules/table'
import type { FormOption, ComponentType } from '@/types/modules/form'
import type { FieldRule } from '@/utils/v_verify'
import type { DynamicRowsOptions } from '@/composables/Table/useDynamicRow'
import type { VNodeChild } from 'vue'

// ================= 类型定义 =================

/**
 * @description: 表格预设配置接口
 */
export interface TablePresetConfig<T extends DataRecord = DataRecord> {
  dynamicRows?: DynamicRowsOptions<T> | boolean
  expandable?: ExpandableConfig<T> | boolean
  selection?: SelectionConfig<T> | boolean
  edit?: EditConfig | boolean
}

/**
 * @description: 展开功能配置接口
 */
export interface ExpandableConfig<T extends DataRecord = DataRecord> {
  enabled?: boolean
  defaultExpanded?: DataTableRowKey[]
  onLoadData?: (row: T) => Promise<any[]> | any[]
  renderContent?: (
    row: T,
    expandData: any[],
    loading: boolean,
    childSelection?: any
  ) => VNodeChild
  rowExpandable?: (row: T) => boolean
}

/**
 * @description: 选择功能配置接口
 */
export interface SelectionConfig<T extends DataRecord = DataRecord> {
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
    mode?: 'loose' | 'strict'
  }
}

/**
 * @description: 编辑功能配置接口
 */
export interface EditConfig {
  enabled?: boolean
  mode?: 'row' | 'cell' | 'modal' | 'both' | 'none'
  showRowActions?: boolean
  modalTitle?: string
  modalWidth?: number
}

// ================= 编辑组件映射 =================

/**
 * @description: 编辑组件映射表
 */
export const EDIT_COMPONENTS: Record<EditType, any> = {
  number: NInputNumber,
  switch: NSwitch,
  input: NInput,
  email: NInput,
  mobile: NInput,
  date: (props: any) =>
    h(NDatePicker, { ...props, type: 'date', format: 'yyyy-MM-dd' }),
  select: (props: any) =>
    h(NSelect, { ...props, options: props.options || [] }),
  textarea: (props: any) => h(NInput, { ...props, type: 'textarea', rows: 3 }),
}

// ================= 配置处理工具函数 =================

/**
 * @description: 处理动态行配置
 * @param preset - 预设配置对象
 * @param props - 组件属性
 * @return 处理后的动态行配置
 */
export function processDynamicRowsConfig<T extends DataRecord>(
  preset: TablePresetConfig<T>,
  props: any
): DynamicRowsOptions<T> | undefined {
  if (!preset.dynamicRows && !props.dynamicRowsOptions) return undefined

  if (preset.dynamicRows) {
    return typeof preset.dynamicRows === 'boolean'
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
  }

  return props.dynamicRowsOptions
}

/**
 * @description: 处理展开功能配置
 * @param preset - 预设配置对象
 * @param props - 组件属性
 * @return 处理后的展开配置
 */
export function processExpandConfig<T extends DataRecord>(
  preset: TablePresetConfig<T>,
  props: any
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
export function processBasicSelectionConfig(selectionConfig: any, props: any) {
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
export function processChildSelectionConfig(selectionConfig: any, props: any) {
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
export function processParentChildLinkConfig(selectionConfig: any, props: any) {
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
export function processSelectionConfig<T extends DataRecord>(
  preset: TablePresetConfig<T>,
  props: any
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
export function processEditConfig<T extends DataRecord>(
  preset: TablePresetConfig<T>,
  props: any
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
export function createUnifiedConfig(props: any) {
  const preset = props.preset || {}

  return {
    dynamicRows: processDynamicRowsConfig(preset, props),
    ...processExpandConfig(preset, props),
    ...processSelectionConfig(preset, props),
    ...processEditConfig(preset, props),
  }
}

// ================= 编辑模式检查器 =================

/**
 * @description: 编辑模式检查器工厂函数
 * @param config - 统一配置对象
 * @return 编辑模式检查器
 */
export const createEditModeChecker = (config: any) => ({
  /**
   * @description: 检查是否为不可编辑模式
   */
  isNonEditable: (column: TableColumn) =>
    !config.editable || column.editable === false || config.editMode === 'none',

  /**
   * @description: 检查是否为行编辑模式
   */
  isRowEditMode: () => config.editMode === 'row' || config.editMode === 'both',

  /**
   * @description: 检查是否为单元格编辑模式
   */
  isCellEditMode: () =>
    config.editMode === 'cell' || config.editMode === 'both',
})

// ================= 渲染工具函数 =================

/**
 * @description: 渲染编辑组件
 * @param column - 列配置
 * @param value - 当前值
 * @param onUpdate - 更新回调
 * @return 渲染的编辑组件
 */
export function renderEditComponent(
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
 * @description: 渲染单元格编辑操作按钮
 * @param onSave - 保存回调
 * @param onCancel - 取消回调
 * @return 渲染的操作按钮组
 */
export function renderCellEditActions(
  onSave: () => void,
  onCancel: () => void
): VNodeChild {
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
            onSave()
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
            onCancel()
          },
        },
        [h('i', { class: 'i-mdi:close w-4 h-4' })]
      ),
    ]
  )
}

/**
 * @description: 渲染单元格显示内容
 * @param column - 列配置
 * @param rowData - 行数据
 * @param rowIndex - 行索引
 * @param value - 单元格值
 * @return 渲染的显示内容
 */
export function renderDisplayCell(
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
 * @param column - 列配置
 * @param value - 当前值
 * @param onUpdate - 更新回调
 * @param onSave - 保存回调
 * @param onCancel - 取消回调
 * @return 渲染的编辑内容
 */
export function renderEditingCell(
  column: TableColumn,
  value: unknown,
  onUpdate: (val: unknown) => void,
  onSave: () => void,
  onCancel: () => void
): VNodeChild {
  return h(
    'div',
    { class: 'relative w-full min-h-9 flex items-center overflow-visible' },
    [
      h('div', { class: 'flex-1 min-w-0 pr-20' }, [
        renderEditComponent(column, value, onUpdate),
      ]),
      renderCellEditActions(onSave, onCancel),
    ]
  )
}

/**
 * @description: 渲染可编辑单元格
 * @param column - 列配置
 * @param rowData - 行数据
 * @param rowIndex - 行索引
 * @param value - 单元格值
 * @param onStartEdit - 开始编辑回调
 * @return 渲染的可编辑单元格
 */
export function renderEditableCell(
  column: TableColumn,
  rowData: DataRecord,
  rowIndex: number,
  value: unknown,
  onStartEdit: () => void
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
        onStartEdit()
      },
    }),
  ])
}

// ================= 操作按钮渲染 =================

/**
 * @description: 渲染行编辑按钮
 * @param isEditing - 是否正在编辑
 * @param onEdit - 开始编辑回调
 * @param onSave - 保存回调
 * @param onCancel - 取消回调
 * @return 渲染的行编辑按钮组
 */
export function renderRowEditButtons(
  isEditing: boolean,
  onEdit: () => void,
  onSave: () => void,
  onCancel: () => void
): VNodeChild[] {
  if (isEditing) {
    return [
      h(
        NButton,
        {
          size: 'small',
          type: 'primary',
          quaternary: true,
          onClick: onSave,
        },
        () => [
          h(NIcon, { size: 14 }, () => h('i', { class: 'i-mdi:check' })),
          '保存',
        ]
      ),
      h(
        NButton,
        {
          size: 'small',
          quaternary: true,
          onClick: onCancel,
        },
        () => [
          h(NIcon, { size: 14 }, () => h('i', { class: 'i-mdi:close' })),
          '取消',
        ]
      ),
    ]
  }

  return [
    h(
      NButton,
      {
        size: 'small',
        type: 'primary',
        quaternary: true,
        onClick: onEdit,
      },
      () => [
        h(NIcon, { size: 14 }, () => h('i', { class: 'i-mdi:pencil' })),
        '编辑',
      ]
    ),
  ]
}

/**
 * @description: 渲染模态框编辑按钮
 * @param onEdit - 开始编辑回调
 * @return 渲染的模态框编辑按钮
 */
export function renderModalEditButton(onEdit: () => void): VNodeChild {
  return h(
    NButton,
    {
      size: 'small',
      type: 'primary',
      quaternary: true,
      onClick: onEdit,
    },
    () => [
      h(NIcon, { size: 14 }, () => h('i', { class: 'i-mdi:pencil' })),
      '编辑',
    ]
  )
}

/**
 * @description: 渲染自定义操作按钮
 * @param rowActions - 行操作配置数组
 * @param rowData - 行数据
 * @param rowIndex - 行索引
 * @param onViewDetail - 查看详情回调
 * @return 渲染的自定义操作按钮组
 */
export function renderCustomActionButtons(
  rowActions: any[],
  rowData: DataRecord,
  rowIndex: number,
  onViewDetail: (data: DataRecord) => void
): VNodeChild[] {
  return rowActions
    .filter(action => action.show?.(rowData, rowIndex) !== false)
    .map(action => {
      const onClick =
        action.label === '查看'
          ? () => onViewDetail(rowData)
          : () => action.onClick(rowData, rowIndex)

      return h(
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
    })
}

/**
 * @description: 渲染操作按钮组
 * @param buttons - 按钮数组
 * @return 渲染的按钮组
 */
export function renderActionButtons(buttons: VNodeChild[]): VNodeChild {
  return h(NSpace, { size: 2, wrap: false }, () => buttons)
}

// ================= 工具函数 =================

/**
 * @description: 检查保存参数是否有效
 * @param rowData - 行数据
 * @param rowIndex - 行索引
 * @param dataLength - 数据长度
 * @return 是否有效
 */
export function isValidSaveParams(
  rowData: DataRecord,
  rowIndex: number,
  dataLength: number
): boolean {
  return !!(rowData && rowIndex >= 0 && rowIndex < dataLength)
}

/**
 * @description: 获取描述信息的跨度
 * @param column - 列配置
 * @return 跨度值
 */
export function getDescriptionSpan(column: TableColumn): number {
  return column.key === 'description' || column.editProps?.type === 'textarea'
    ? 2
    : 1
}

// ================= 原有功能保持不变 =================

/**
 * 生成表单选项配置
 */
export const generateFormOptions = (columns: TableColumn[]): FormOption[] => {
  return columns.map(column => {
    // 确保 rules 类型与 FieldRule[] 兼容
    const rules: FieldRule[] = []

    // 如果字段是必需的，添加必填规则
    if (column.required) {
      rules.push({
        required: true,
        message: `请输入${column.title}`,
        trigger: ['blur', 'input'],
        // 关键：确保 validator 属性存在且类型正确
        validator: async (rule: any, value: any) => {
          if (!value && value !== 0 && value !== false) {
            throw new Error(`请输入${column.title}`)
          }
        },
      })
    }

    // 正确的组件类型映射
    const getComponentType = (editType?: string): ComponentType => {
      switch (editType) {
        case 'number':
          return 'inputNumber'
        case 'date':
          return 'datePicker'
        case 'textarea':
          return 'textarea'
        case 'select':
          return 'select'
        case 'switch':
          return 'switch'
        case 'input':
        default:
          return 'input'
      }
    }

    const formOption: FormOption = {
      prop: column.key,
      label: column.title || column.key,
      type: getComponentType(column.editType),
      placeholder: `请输入${column.title}`,
      rules, // 现在类型完全兼容
      attrs: column.editProps || {},
      layout: { span: 1 },
      show: true,
    }

    return formOption
  })
}

/**
 * 显示值处理器映射表 - 修复参数问题
 */
const displayValueHandlers = {
  switch: (value: any) => (value ? '是' : '否'),

  select: (value: any, column: TableColumn) => {
    const options = column.editProps?.options || []
    const option = options.find((opt: any) => opt.value === value)
    return option?.label || String(value)
  },

  date: (value: any) => {
    if (value instanceof Date) {
      return value.toLocaleDateString('zh-CN')
    }
    return String(value)
  },
}

/**
 * 获取显示值 - 修复 select 处理器调用
 */
export const getDisplayValue = (
  column: TableColumn,
  data: Record<string, any>
): string => {
  const value = data[column.key]

  // 处理空值
  if (value === null || value === undefined) {
    return '-'
  }

  // 根据类型进行处理
  if (column.editType === 'select') {
    return displayValueHandlers.select(value, column)
  }

  // 获取其他类型的处理器
  const handler =
    displayValueHandlers[column.editType as keyof typeof displayValueHandlers]

  // 使用处理器或默认转换
  return handler ? handler(value, column) : String(value)
}

/**
 * 获取表格 Props - 移除不存在的属性
 */
export const getTableProps = (props: TableProps): Partial<DataTableProps> => {
  return {
    striped: props.striped,
    bordered: props.bordered,
    singleLine: props.singleLine,
    size: props.size,
    loading: props.loading,
    scrollX: props.scrollX,
    maxHeight: props.maxHeight,
  }
}

/**
 * 处理列配置
 */
export const processColumnConfig = (columns: TableColumn[]): TableColumn[] => {
  return columns.map(column => ({
    ...column,
    title: column.title || column.key,
    key: column.key,
    width: column.width || 180,
    align: column.align || 'center',
    titleAlign: column.titleAlign || 'center',
  }))
}
