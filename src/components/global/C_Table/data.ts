/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-14 22:06:22
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-15 01:17:37
 * @FilePath: \Robot_Admin\src\components\global\C_Table\data.ts
 * @Description:  表格数据处理模块
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { DataTableProps } from 'naive-ui/es'
import type { TableColumn, TableProps } from '@/types/modules/table'
import type { FormOption, ComponentType } from '@/types/modules/form'
import type { FieldRule } from '@/utils/v_verify'

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
