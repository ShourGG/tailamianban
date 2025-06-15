/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-13 18:38:58
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-15 14:03:31
 * @FilePath: \Robot_Admin\src\types\modules\table.d.ts
 * @Description: 表格类型系统
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { DataTableColumns, DataTableRowKey } from 'naive-ui'
import type { VNodeChild } from 'vue'
import type { FormItemRule } from 'naive-ui/es/form'

// ================= 基础类型定义 =================

export type EditMode = 'row' | 'cell' | 'both' | 'modal' | 'none'

export type EditType =
  | 'input'
  | 'textarea'
  | 'select'
  | 'date'
  | 'number'
  | 'switch'
  | 'email'
  | 'mobile'

export type ButtonType =
  | 'default'
  | 'primary'
  | 'info'
  | 'success'
  | 'warning'
  | 'error'

// ================= 数据映射类型 =================

// 通用选项类型
export interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
}

// 预设数据映射类型
export interface DataMapping {
  [key: string]: string
}

// 常用数据映射
export interface CommonMappings {
  gender: DataMapping
  department: DataMapping
  status: DataMapping
}

// ================= 编辑相关类型 =================

// 编辑属性配置
export interface EditProps {
  min?: number
  max?: number
  step?: number
  showButton?: boolean
  type?: string
  rows?: number
  placeholder?: string
  options?: SelectOption[]
  rules?: FormItemRule[]
  format?: string
  valueFormat?: string
  clearable?: boolean
  disabled?: boolean
  readonly?: boolean
}

// 表格列配置
export interface TableColumn<T = Record<string, any>>
  extends Omit<DataTableColumns<T>[number], 'key' | 'render'> {
  key: keyof T | string
  title: string
  editable?: boolean
  required?: boolean
  editType?: EditType
  editProps?: EditProps
  editRender?: (value: any, rowData: T, rowIndex: number) => VNodeChild
  render?: (rowData: T, rowIndex: number) => VNodeChild
}

// 行操作配置
export interface RowAction<T = Record<string, any>> {
  label: string
  icon?: string
  type?: ButtonType
  onClick: (row: T, index: number) => void
  show?: (row: T, index: number) => boolean
  disabled?: (row: T, index: number) => boolean
}

// ================= 表格组件类型 =================

// 表格属性
export interface TableProps<T = Record<string, any>> {
  // 数据相关
  columns: TableColumn<T>[]
  data: T[]
  rowKey?: (row: T) => DataTableRowKey
  loading?: boolean

  // 显示相关
  maxHeight?: number | string
  minHeight?: number | string
  scrollX?: number | string
  striped?: boolean
  bordered?: boolean
  singleLine?: boolean
  size?: 'small' | 'medium' | 'large'

  // 编辑相关
  editable?: boolean
  editMode?: EditMode
  onSave?: (
    rowData: T,
    rowIndex: number,
    columnKey?: string
  ) => void | Promise<void>
  onCancel?: (rowData: T, rowIndex: number) => void

  // 行操作
  showRowActions?: boolean
  rowActions?: RowAction<T>[]

  // 模态框相关
  modalTitle?: string
  modalWidth?: number

  // 列宽配置
  columnWidth?: number
}

// 表格实例方法
export interface TableInstance {
  startEdit: (rowKey: DataTableRowKey, columnKey?: string) => void
  cancelEdit: () => void
  saveEdit: () => Promise<void>
  isEditing: (rowKey: DataTableRowKey, columnKey?: string) => boolean
  getEditingData: () => any
}

// ================= 🔥 展开功能类型定义 =================

// 展开配置选项
export interface ExpandOptions<T = Record<string, any>> {
  // 数据源
  data: Ref<T[]> | ComputedRef<T[]>

  // 行键获取函数
  rowKey: (row: T) => DataTableRowKey

  // 展开数据加载函数
  onLoadData?: (row: T) => Promise<any[]> | any[]

  // 展开内容渲染函数
  renderContent?: (row: T, expandData: any[], isLoading: boolean) => VNodeChild

  // 判断行是否可展开
  rowExpandable?: (row: T) => boolean

  // 展开状态变化回调
  onExpandChange?: (
    expandedKeys: DataTableRowKey[],
    row?: T,
    expanded?: boolean
  ) => void

  // 默认展开的行
  defaultExpandedKeys?: DataTableRowKey[]

  // 是否支持同时展开多行
  accordion?: boolean
}

// 展开状态管理
export interface ExpandState {
  // 当前展开的行键
  expandedKeys: Ref<DataTableRowKey[]>

  // 展开数据映射
  expandDataMap: Ref<Map<DataTableRowKey, any[]>>

  // 加载状态映射
  expandLoadingMap: Ref<Map<DataTableRowKey, boolean>>

  // 错误状态映射
  expandErrorMap: Ref<Map<DataTableRowKey, string | null>>
}

// 展开操作方法
export interface ExpandMethods {
  // 展开指定行
  expandRow: (rowKey: DataTableRowKey) => Promise<void>

  // 收起指定行
  collapseRow: (rowKey: DataTableRowKey) => void

  // 切换展开状态
  toggleExpand: (rowKey: DataTableRowKey) => Promise<void>

  // 展开所有行
  expandAll: () => Promise<void>

  // 收起所有行
  collapseAll: () => void

  // 刷新展开数据
  refreshExpandData: (rowKey: DataTableRowKey) => Promise<void>

  // 获取展开数据
  getExpandData: (rowKey: DataTableRowKey) => any[]

  // 判断行是否展开
  isExpanded: (rowKey: DataTableRowKey) => boolean

  // 判断行是否正在加载
  isLoading: (rowKey: DataTableRowKey) => boolean
}

// 展开渲染配置
export interface ExpandRenderConfig {
  // 展开按钮渲染
  renderExpandIcon?: (
    expanded: boolean,
    loading: boolean,
    rowData: any
  ) => VNodeChild

  // 展开内容渲染
  renderExpandContent?: (
    rowData: any,
    expandData: any[],
    loading: boolean,
    error: string | null
  ) => VNodeChild

  // 空状态渲染
  renderEmpty?: () => VNodeChild

  // 加载状态渲染
  renderLoading?: () => VNodeChild

  // 错误状态渲染
  renderError?: (error: string) => VNodeChild
}

// useTableExpand 返回类型
export interface UseTableExpandReturn extends ExpandState, ExpandMethods {
  // 生成展开列配置
  getExpandColumn: () => TableColumn

  // 生成带展开功能的列配置
  getColumnsWithExpand: (originalColumns: TableColumn[]) => TableColumn[]

  // 获取 NDataTable 的 expandedRowKeys 属性
  getExpandedRowKeys: ComputedRef<DataTableRowKey[]>

  // 获取 NDataTable 的 renderExpand 函数
  getRenderExpand: () => (rowData: any) => VNodeChild
}

// ================= 编辑相关组合式函数类型 =================

// 编辑选项
export interface EditOptions<T = Record<string, any>> {
  data: T[]
  rowKey: (row: T) => DataTableRowKey
  onSave?: (
    rowData: T,
    rowIndex: number,
    columnKey?: string
  ) => void | Promise<void>
  onCancel?: (rowData: T, rowIndex: number) => void
}

// 模态框编辑状态
export interface ModalEditState {
  isModalVisible: Ref<boolean>
  editingRowIndex: Ref<number>
  editingRowKey: Ref<DataTableRowKey | null>
  editingData: Record<string, any>
}

// ================= 演示页面专用类型 =================

// 员工数据类型
export interface Employee {
  id: number
  name: string
  age: number
  gender: 'male' | 'female'
  email: string
  department: 'tech' | 'hr' | 'market' | 'finance'
  joinDate: number
  status: 'active' | 'inactive' | 'probation'
  description: string
}

// 🔥 新增：嵌套表格演示数据类型
export interface MainRecord {
  id: number
  sequence: string
  name: string
  location: string
  description: string
  hasChildren?: boolean
}

export interface ChildRecord {
  id: string | number
  parentId: number
  childSequence: string
  childName: string
  childLocation: string
  status: 'active' | 'inactive' | 'pending'
  createTime?: string
}

// 表单组件映射类型
export interface FormTypeMapping {
  [key in EditType]?: string
}

// ================= 工具类型 =================

// 提取对象值类型
export type ValueOf<T> = T[keyof T]

// 可选键类型
export type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never
}[keyof T]

// 必需键类型
export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K
}[keyof T]

// 安全的键值对类型
export type SafeRecord<K extends string | number | symbol, V> = {
  [P in K]: V
}
