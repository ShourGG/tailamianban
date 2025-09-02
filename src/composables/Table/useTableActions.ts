/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-09-02
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-09-02 14:39:52
 * @FilePath: \Robot_Admin\src\composables\Table\useTableActions.ts
 * @Description: 表格操作按钮渲染和处理 Hook - 修复版本
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { VNodeChild, Ref, ComputedRef } from 'vue'
import type {
  DataRecord,
  ApiFunction,
  SimpleTableActions,
} from '@/types/modules/table'
import type { DataTableRowKey } from 'naive-ui/es'
import C_Icon from '@/components/global/C_Icon/index.vue'

// ================= Hook 选项类型 =================
export interface UseTableActionsOptions<T extends DataRecord = DataRecord> {
  /** 操作配置 - 支持简化配置 */
  actions: Ref<SimpleTableActions<T>> | ComputedRef<SimpleTableActions<T>>
  /** 表格配置 */
  config: Ref<any> | ComputedRef<any>
  /** 表格管理器 */
  tableManager: any
  /** 行键获取函数 */
  rowKey: (row: T) => DataTableRowKey
  /** 事件发射器 */
  emit: any
  /** 查看详情回调 */
  onViewDetail?: (data: T) => void
}

export interface UseTableActionsReturn<T extends DataRecord = DataRecord> {
  /** 渲染操作列 */
  renderActions: (rowData: T, rowIndex: number) => VNodeChild
  /** 检查操作是否启用 */
  isActionEnabled: (actionKey: 'edit' | 'delete' | 'detail') => boolean
}

// ================= 类型保护函数 =================
/**
 * 检查是否为有效的API函数
 */
function isValidApiFunction<T extends DataRecord>(
  action: false | ApiFunction<T> | undefined
): action is ApiFunction<T> {
  return action !== false && typeof action === 'function'
}

/**
 * 自动提取API响应数据
 */
function extractApiResponseData<T>(response: any): T {
  // 如果响应有data字段，提取data；否则返回原始响应
  if (response && typeof response === 'object' && 'data' in response) {
    return response.data
  }
  return response
}

// ================= Hook 实现 =================
/**
 * 表格操作Hook
 */
export function useTableActions<T extends DataRecord = DataRecord>(
  options: UseTableActionsOptions<T>
): UseTableActionsReturn<T> {
  const { actions, config, tableManager, rowKey, emit, onViewDetail } = options

  const message = useMessage()
  const dialog = useDialog()

  // ================= 工具函数 =================

  /**
   * 检查操作是否启用
   */
  const isActionEnabled = (
    actionKey: 'edit' | 'delete' | 'detail'
  ): boolean => {
    return actions.value?.[actionKey] !== false
  }

  /**
   * 创建操作按钮
   */
  const createActionButton = (buttonConfig: {
    icon: string
    type?: string
    title?: string
    onClick: () => void
  }) => {
    return h(
      NButton,
      {
        size: 'small',
        type: buttonConfig.type || 'primary',
        quaternary: true,
        onClick: buttonConfig.onClick,
      },
      () => [
        h(C_Icon, {
          name: buttonConfig.icon,
          size: 14,
          title: buttonConfig.title,
        }),
      ]
    )
  }

  // ================= 智能操作处理 =================

  /**
   * 智能处理编辑操作 - 修复版本
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSmartEdit = async (row: T, index: number) => {
    const editAction = actions.value?.edit
    const rowKeyValue = rowKey(row)

    // 始终打开编辑界面（模态框或行编辑）
    if (config.value.editMode === 'modal') {
      // 模态框编辑：将编辑API传递给模态框保存逻辑
      tableManager.editStates.modalEdit.startEdit(
        rowKeyValue,
        { ...row },
        editAction
      )
    } else {
      // 行编辑：启动行编辑状态
      tableManager.editStates.rowEdit.startEditRow(rowKeyValue, editAction)
    }
  }

  /**
   * 智能处理删除操作
   */
  const handleSmartDelete = async (row: T, index: number) => {
    const deleteAction = actions.value?.delete

    if (!isValidApiFunction(deleteAction)) {
      return
    }

    const executeDelete = async () => {
      try {
        await deleteAction(row, index)
        message.success('删除成功')
        emit('row-delete', row, index)
      } catch (error) {
        console.error('删除失败:', error)
        message.error('删除失败')
        throw error
      }
    }

    dialog.warning({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: executeDelete,
    })
  }

  /**
   * 智能处理详情操作 - 修复版本
   */
  const handleSmartDetail = async (row: T, index: number) => {
    const detailAction = actions.value?.detail

    if (!isValidApiFunction(detailAction)) {
      // 默认行为：直接显示当前行数据
      onViewDetail?.(row)
      return
    }

    // 调用API获取详情数据
    try {
      const apiResponse = await detailAction(row, index)
      // 自动提取API响应数据
      const detailData = extractApiResponseData<T>(apiResponse)
      onViewDetail?.(detailData || row)
    } catch (error) {
      console.error('获取详情失败:', error)
      message.error('获取详情失败')
      // 发生错误时仍然显示原始数据
      onViewDetail?.(row)
    }
  }

  // ================= 渲染函数 =================

  /**
   * 渲染行编辑操作按钮
   */
  const renderRowEditActions = (rowKey: DataTableRowKey): VNodeChild[] => {
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

  /**
   * 渲染内置操作按钮 - 修复版本
   */
  const renderBuiltinActions = (rowData: T, rowIndex: number): VNodeChild[] => {
    const builtinActions: VNodeChild[] = []

    // 编辑按钮：只在模态框模式显示，其他模式使用行编辑按钮
    if (
      config.value.editMode === 'modal' &&
      (isActionEnabled('edit') || config.value.editable)
    ) {
      builtinActions.push(
        createActionButton({
          icon: 'mdi:pencil',
          title: '编辑',
          onClick: () => handleSmartEdit(rowData, rowIndex),
        })
      )
    }

    // 删除按钮：根据是否有删除API来显示
    if (isActionEnabled('delete')) {
      builtinActions.push(
        createActionButton({
          icon: 'mdi:delete',
          type: 'error',
          title: '删除',
          onClick: () => handleSmartDelete(rowData, rowIndex),
        })
      )
    }

    // 详情按钮：根据是否有详情API来显示
    if (isActionEnabled('detail')) {
      builtinActions.push(
        createActionButton({
          icon: 'mdi:eye',
          type: 'info',
          title: '详情',
          onClick: () => handleSmartDetail(rowData, rowIndex),
        })
      )
    }

    return builtinActions
  }

  /**
   * 主渲染函数 - 组合所有操作按钮
   */
  const renderActions = (rowData: T, rowIndex: number): VNodeChild => {
    // 如果配置了完全自定义渲染，直接使用
    if (actions.value?.render) {
      return actions.value.render(rowData, rowIndex)
    }

    const rowKeyValue = rowKey(rowData)
    const editModeChecker = {
      isRowEditMode: () => ['row', 'both'].includes(config.value.editMode),
    }

    // 如果是行编辑模式且正在编辑，优先显示编辑操作
    if (editModeChecker.isRowEditMode()) {
      const isEditing =
        tableManager.editStates.rowEdit.isEditingRow(rowKeyValue)
      if (isEditing) {
        return h(NSpace, { size: 2, wrap: false }, () =>
          renderRowEditActions(rowKeyValue)
        )
      }
    }

    // 组合所有操作按钮
    const allActions: VNodeChild[] = [
      ...(editModeChecker.isRowEditMode()
        ? renderRowEditActions(rowKeyValue)
        : []),
      ...renderBuiltinActions(rowData, rowIndex),
    ]

    return h(NSpace, { size: 2, wrap: false }, () => allActions)
  }

  // ================= 返回接口 =================
  return {
    renderActions,
    isActionEnabled,
  }
}
