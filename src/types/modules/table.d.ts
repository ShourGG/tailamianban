/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-13 18:38:58
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-15 00:44:19
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

  // 🔥 新增：列宽配置 - 唯一的新增属性
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
