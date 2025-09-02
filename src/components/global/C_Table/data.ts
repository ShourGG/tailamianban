/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-14 22:06:22
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-09-02 12:30:40
 * @FilePath: \Robot_Admin\src\components\global\C_Table\data.ts
 * @Description: 表格数据处理模块 - 重构版本（分页逻辑抽离）
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { DataTableProps, DataTableRowKey } from 'naive-ui/es'
import type {
  TableColumn,
  TableProps,
  EditType,
  DataRecord,
  PaginationConfig,
} from '@/types/modules/table'
import type { FormOption, ComponentType } from '@/types/modules/form'
import type { FieldRule } from '@/utils/v_verify'
import type { DynamicRowsOptions } from '@/composables/Table/useDynamicRow'
import type { VNodeChild } from 'vue'
import C_Icon from '@/components/global/C_Icon/index.vue'

// ================= 类型定义 =================
export interface TablePresetConfig<T extends DataRecord = DataRecord> {
  dynamicRows?: DynamicRowsOptions<T> | boolean
  expandable?: ExpandableConfig<T> | boolean
  selection?: SelectionConfig<T> | boolean
  edit?: EditConfig | boolean
  pagination?: PaginationConfig | boolean
}

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

export interface EditConfig {
  enabled?: boolean
  mode?: 'row' | 'cell' | 'modal' | 'both' | 'none'
  showRowActions?: boolean
  modalTitle?: string
  modalWidth?: number
}

// ================= 编辑组件映射 =================
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

// ================= 配置处理工具 =================

/**
 * * @description 通用配置获取工具
 * ? @param preset - 预设配置值
 * ? @param prop - 属性配置值
 * ? @param fallback - 默认回退值
 * ! @return 最终配置值
 */
const getValue = (preset: any, prop: any, fallback: any) =>
  preset ?? prop ?? fallback

/**
 * * @description 创建配置构建器高阶函数
 * ? @param defaults - 默认配置对象
 * ! @return 配置构建函数
 */
const createConfigBuilder =
  <T extends Record<string, any>>(defaults: T) =>
  (preset: any, props: any, mapping: Record<keyof T, [string, string]>) => {
    const result = { ...defaults }
    Object.entries(mapping).forEach(([key, [presetKey, propKey]]) => {
      const typedKey = key as keyof T
      result[typedKey] = getValue(
        preset[presetKey],
        props[propKey],
        defaults[typedKey]
      )
    })
    return result
  }

/**
 * * @description 构建动态行配置
 * ? @param preset - 预设配置对象
 * ? @param props - 组件属性对象
 * ! @return 处理后的动态行配置对象
 */
const buildDynamicConfig = (preset: any, props: any) => {
  const defaultDynamicRows = {
    enableRadioSelection: true,
    enableAdd: true,
    enableInsert: true,
    enableDelete: true,
    enableCopy: true,
    enableMove: true,
    enablePrint: true,
  }

  return {
    dynamicRows:
      preset.dynamicRows === true
        ? defaultDynamicRows
        : preset.dynamicRows || props.dynamicRowsOptions,
  }
}

/**
 * * @description 构建分页配置 - 简化版本
 * ? @param preset - 预设配置对象
 * ? @param props - 组件属性对象
 * ! @return 处理后的分页配置对象
 */
const buildPaginationConfig = (preset: any, props: any) => {
  // 如果明确设置为 false，则禁用分页
  if (props.pagination === false) {
    return { pagination: null }
  }

  // 默认分页配置
  const defaultPagination: PaginationConfig = {
    enabled: true,
    page: 1,
    pageSize: 10,
    showSizePicker: true,
    showQuickJumper: true,
    pageSizes: [10, 20, 50, 100],
    simple: false,
    size: 'medium',
  }

  // 预设配置优先级最高
  if (preset.pagination) {
    if (preset.pagination === true) {
      return { pagination: defaultPagination }
    }
    if (typeof preset.pagination === 'object') {
      return {
        pagination: {
          ...defaultPagination,
          ...preset.pagination,
        },
      }
    }
  }

  // 组件属性配置
  if (props.pagination === true || !props.pagination) {
    return { pagination: defaultPagination }
  }

  // 如果是对象，则合并配置
  if (typeof props.pagination === 'object') {
    return {
      pagination: {
        ...defaultPagination,
        ...props.pagination,
      },
    }
  }

  return { pagination: defaultPagination }
}

/**
 * * @description 展开配置构建器
 */
const buildExpandConfig = createConfigBuilder({
  expandable: false,
  defaultExpandedKeys: undefined,
  onLoadExpandData: undefined,
  renderExpandContent: undefined,
  rowExpandable: undefined,
})

/**
 * * @description 编辑配置构建器
 */
const buildEditConfig = createConfigBuilder({
  editable: true,
  editMode: 'both',
  showRowActions: true,
  modalTitle: '编辑数据',
  modalWidth: 600,
})

/**
 * * @description 选择配置构建器
 */
const buildSelectionConfig = createConfigBuilder({
  enableSelection: false,
  defaultCheckedKeys: undefined,
  rowCheckable: undefined,
  maxSelection: undefined,
  enableChildSelection: false,
  childRowCheckable: undefined,
  enableParentChildLink: false,
  parentChildLinkMode: 'loose',
})

/**
 * * @description 创建统一配置对象
 * ? @param props - 组件属性对象
 * ! @return 统一的配置对象
 */
export function createUnifiedConfig(props: any) {
  const preset = props.preset || {}
  const exp = preset.expandable || {}
  const sel = preset.selection || {}
  const edit = preset.edit || {}
  const child = sel.childSelection || {}
  const link = sel.parentChildLink || {}

  return {
    ...buildDynamicConfig(preset, props),
    ...buildExpandConfig(exp, props, {
      expandable: ['enabled', 'expandable'],
      defaultExpandedKeys: ['defaultExpanded', 'defaultExpandedKeys'],
      onLoadExpandData: ['onLoadData', 'onLoadExpandData'],
      renderExpandContent: ['renderContent', 'renderExpandContent'],
      rowExpandable: ['rowExpandable', 'rowExpandable'],
    }),
    ...buildEditConfig(edit, props, {
      editable: ['enabled', 'editable'],
      editMode: ['mode', 'editMode'],
      showRowActions: ['showRowActions', 'showRowActions'],
      modalTitle: ['modalTitle', 'modalTitle'],
      modalWidth: ['modalWidth', 'modalWidth'],
    }),
    ...buildSelectionConfig({ sel, child, link }, props, {
      enableSelection: ['sel.enabled', 'enableSelection'],
      defaultCheckedKeys: ['sel.defaultChecked', 'defaultCheckedKeys'],
      rowCheckable: ['sel.rowCheckable', 'rowCheckable'],
      maxSelection: ['sel.maxSelection', 'maxSelection'],
      enableChildSelection: ['child.enabled', 'enableChildSelection'],
      childRowCheckable: ['child.childRowCheckable', 'childRowCheckable'],
      enableParentChildLink: ['link.enabled', 'enableParentChildLink'],
      parentChildLinkMode: ['link.mode', 'parentChildLinkMode'],
    }),
    // 分页配置 - 简化处理
    ...buildPaginationConfig(preset, props),
  }
}

// ================= 编辑模式检查器 =================

/**
 * * @description 创建编辑模式检查器
 * ? @param config - 表格配置对象
 * ! @return 编辑模式检查方法集合
 */
export const createEditModeChecker = (config: any) => ({
  /**
   * * @description 检查列是否不可编辑
   * ? @param column - 列配置对象
   * ! @return 是否不可编辑
   */
  isNonEditable: (column: TableColumn) =>
    !config.editable || column.editable === false || config.editMode === 'none',

  /**
   * * @description 检查是否为行编辑模式
   * ! @return 是否为行编辑模式
   */
  isRowEditMode: () => ['row', 'both'].includes(config.editMode),

  /**
   * * @description 检查是否为单元格编辑模式
   * ! @return 是否为单元格编辑模式
   */
  isCellEditMode: () => ['cell', 'both'].includes(config.editMode),
})

// ================= 渲染工具函数 =================

/**
 * * @description 渲染编辑组件
 * ? @param column - 列配置对象
 * ? @param value - 当前值
 * ? @param onUpdate - 更新回调函数
 * ! @return 渲染的编辑组件
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

  const Component =
    EDIT_COMPONENTS[column.editType || 'input'] || EDIT_COMPONENTS.input
  return h(Component, componentProps)
}

/**
 * * @description 渲染显示单元格
 * ? @param column - 列配置对象
 * ? @param rowData - 行数据对象
 * ? @param rowIndex - 行索引
 * ? @param value - 单元格值
 * ! @return 渲染的显示内容
 */
export function renderDisplayCell(
  column: TableColumn,
  rowData: DataRecord,
  rowIndex: number,
  value: unknown
): VNodeChild {
  return column.render
    ? (column.render(rowData, rowIndex) ?? String(value ?? ''))
    : String(value ?? '')
}

/**
 * * @description 创建操作按钮
 * ? @param name - 按钮名称
 * ? @param title - 按钮标题
 * ? @param onClick - 点击回调函数
 * ! @return 渲染的按钮元素
 */
const createActionButton = (
  name: string,
  title: string,
  onClick: (e: Event) => void
) =>
  h(
    'button',
    {
      class: `cell-action-btn cell-action-${name}`,
      title,
      type: 'button',
      onClick: (e: Event) => {
        e.stopPropagation()
        e.preventDefault()
        onClick(e)
      },
    },
    [
      h(C_Icon, {
        name: `mdi:${name === 'save' ? 'check' : 'close'}`,
        title: `${name === 'save' ? '保存' : '取消'}`,
        size: 12,
      }),
    ]
  )

/**
 * * @description 渲染编辑状态单元格
 * ? @param column - 列配置对象
 * ? @param value - 当前值
 * ? @param onUpdate - 更新回调函数
 * ? @param onSave - 保存回调函数
 * ? @param onCancel - 取消回调函数
 * ! @return 渲染的编辑状态单元格
 */
export function renderEditingCell(
  column: TableColumn,
  value: unknown,
  onUpdate: (val: unknown) => void,
  onSave: () => void,
  onCancel: () => void
): VNodeChild {
  return h('div', { class: 'cell-editing-container' }, [
    h('div', { class: 'cell-editing-input' }, [
      renderEditComponent(column, value, onUpdate),
    ]),
    h('div', { class: 'cell-editing-actions' }, [
      createActionButton('save', '保存', onSave),
      createActionButton('cancel', '取消', onCancel),
    ]),
  ])
}

/**
 * * @description 渲染可编辑单元格
 * ? @param column - 列配置对象
 * ? @param rowData - 行数据对象
 * ? @param rowIndex - 行索引
 * ? @param value - 单元格值
 * ? @param onStartEdit - 开始编辑回调函数
 * ! @return 渲染的可编辑单元格
 */
export function renderEditableCell(
  column: TableColumn,
  rowData: DataRecord,
  rowIndex: number,
  value: unknown,
  onStartEdit: () => void
): VNodeChild {
  const displayValue = column.render
    ? (column.render(rowData, rowIndex) ?? String(value ?? ''))
    : String(value ?? '')

  return h('div', { class: 'cell-edit-wrapper' }, [
    h('span', { class: 'cell-value' }, displayValue),
    h(C_Icon, {
      name: 'mdi:square-edit-outline',
      title: '编辑',
      class: 'cell-edit-icon',
      size: 14,
      clickable: true,
      onClick: (e: Event) => {
        e.stopPropagation()
        onStartEdit()
      },
    }),
  ])
}

// ================= 显示值处理器 =================

/**
 * * @description 显示值处理器映射表
 */
const VALUE_HANDLERS = {
  switch: (value: any): string => (value ? '是' : '否'),
  select: (value: any, column: TableColumn): string => {
    const options = column.editProps?.options || []
    const option = options.find((opt: any) => opt.value === value)
    return option?.label || String(value)
  },
  date: (value: any): string =>
    value instanceof Date ? value.toLocaleDateString('zh-CN') : String(value),
} as const

/**
 * * @description 获取显示值
 * ? @param column - 列配置对象
 * ? @param data - 数据对象
 * ! @return 格式化后的显示值
 */
export const getDisplayValue = (
  column: TableColumn,
  data: Record<string, any>
): string => {
  const value = data[column.key]
  if (value === null || value === undefined) return '-'

  const handler = VALUE_HANDLERS[column.editType as keyof typeof VALUE_HANDLERS]
  return handler ? handler(value, column) : String(value)
}

// ================= 表单和工具函数 =================

/**
 * * @description 生成表单选项配置
 * ? @param columns - 列配置数组
 * ! @return 表单选项配置数组
 */
export const generateFormOptions = (columns: TableColumn[]): FormOption[] => {
  const typeMap: Record<string, ComponentType> = {
    number: 'inputNumber',
    date: 'datePicker',
    textarea: 'textarea',
    select: 'select',
    switch: 'switch',
  }

  return columns.map(column => {
    const rules: FieldRule[] = column.required
      ? [
          {
            required: true,
            message: `请输入${column.title}`,
            trigger: ['blur', 'input'],
            validator: async (rule: any, value: any) => {
              if (!value && value !== 0 && value !== false) {
                throw new Error(`请输入${column.title}`)
              }
            },
          },
        ]
      : []

    return {
      prop: column.key,
      label: column.title || column.key,
      type: typeMap[column.editType || 'input'] || 'input',
      placeholder: `请输入${column.title}`,
      rules,
      attrs: column.editProps || {},
      layout: { span: 1 },
      show: true,
    }
  })
}

/**
 * * @description 获取表格属性配置
 * ? @param props - 组件属性对象
 * ! @return 表格属性配置
 */
export const getTableProps = (props: TableProps): Partial<DataTableProps> => ({
  striped: props.striped,
  bordered: props.bordered,
  singleLine: props.singleLine,
  size: props.size,
  loading: props.loading,
  scrollX: props.scrollX,
  maxHeight: props.maxHeight,
})

/**
 * * @description 处理列配置
 * ? @param columns - 原始列配置数组
 * ! @return 处理后的列配置数组
 */
export const processColumnConfig = (columns: TableColumn[]): TableColumn[] =>
  columns.map(column => ({
    ...column,
    title: column.title || column.key,
    key: column.key,
    width: column.width || 180,
    align: column.align || 'center',
    titleAlign: column.titleAlign || 'center',
  }))

/**
 * * @description 获取描述项跨度
 * ? @param column - 列配置对象
 * ! @return 描述项跨度值
 */
export const getDescriptionSpan = (column: TableColumn): number =>
  column.key === 'description' || column.editProps?.type === 'textarea' ? 2 : 1
