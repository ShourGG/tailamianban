/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-11 22:34:37
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-12 01:11:54
 * @FilePath: \Robot_Admin\src\types\modules\table.d.ts
 * @Description: 
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎. 
 */
// table.d.ts
import type { DataTableColumns, DataTableRowKey } from 'naive-ui'
import type { VNodeChild } from 'vue'

// 编辑模式类型
export type EditMode = 'row' | 'cell' | 'none'

// 编辑状态
export interface EditState {
  rowKey: DataTableRowKey | null
  columnKey: string | null
  mode: EditMode
}

// 表格列配置
export interface TableColumn<T = any> extends Omit<DataTableColumns<T>[number], 'key' | 'render'> {
  key: string
  title: string
  editable?: boolean
  editType?: 'input' | 'select' | 'date' | 'number' | 'custom'
  editProps?: Record<string, any>
  editRender?: (value: any, rowData: T, rowIndex: number) => VNodeChild
  render?: (rowData: T, rowIndex: number) => VNodeChild
  width?: number | string
  align?: 'left' | 'center' | 'right'
}

// 表格属性
export interface TableProps<T = any> {
  columns: TableColumn<T>[]
  data: T[]
  rowKey?: (row: T) => DataTableRowKey
  loading?: boolean
  maxHeight?: number | string
  minHeight?: number | string
  scrollX?: number | string
  striped?: boolean
  bordered?: boolean
  singleLine?: boolean
  size?: 'small' | 'medium' | 'large'
  // 编辑相关
  editable?: boolean
  editMode?: 'row' | 'cell' | 'both'
  onSave?: (rowData: T, rowIndex: number, columnKey?: string) => void | Promise<void>
  onCancel?: (rowData: T, rowIndex: number) => void
  // 行操作
  showRowActions?: boolean
  rowActions?: RowAction<T>[]
}

// 行操作配置
export interface RowAction<T = any> {
  label: string
  icon?: string
  type?: 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error'
  onClick: (row: T, index: number) => void
  show?: (row: T, index: number) => boolean
  disabled?: (row: T, index: number) => boolean
}

// 表格实例方法
export interface TableInstance {
  startEdit: (rowKey: DataTableRowKey, columnKey?: string) => void
  cancelEdit: () => void
  saveEdit: () => Promise<void>
  isEditing: (rowKey: DataTableRowKey, columnKey?: string) => boolean
  getEditingData: () => any
}

// 编辑单元格的值类型
export type CellValue = string | number | boolean | Date | null | undefined

// 验证规则
export interface ValidationRule {
  required?: boolean
  message?: string
  validator?: (value: CellValue) => boolean | Promise<boolean>
  trigger?: 'change' | 'blur' | string[]
}

// 带验证的列配置
export interface TableColumnWithValidation<T = any> extends TableColumn<T> {
  rules?: ValidationRule[]
}