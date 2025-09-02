/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-09-02
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-09-02 09:42:11
 * @FilePath: \Robot_Admin\src\composables\Table\useTableActions.ts
 * @Description: 表格操作按钮渲染和处理 Hook
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { VNodeChild, Ref, ComputedRef } from 'vue'
import type { DataRecord } from '@/types/modules/table'
import type { DataTableRowKey } from 'naive-ui/es'
import C_Icon from '@/components/global/C_Icon/index.vue'

// ================= 类型定义 =================
export interface TableActions<T extends DataRecord = DataRecord> {
  edit?:
    | false
    | {
        api?: string
        onEdit?: (row: T, index: number) => void | Promise<void>
      }
  delete?:
    | false
    | {
        api?: string
        onDelete?: (row: T, index: number) => void | Promise<void>
        confirmText?: string | ((row: T) => string)
      }
  detail?:
    | false
    | {
        onView?: (row: T, index: number) => void
      }
  custom?: Array<{
    key: string
    label: string
    icon?: string
    type?: 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error'
    onClick: (row: T, index: number) => void | Promise<void>
    show?: (row: T, index: number) => boolean
  }>
}

export interface UseTableActionsOptions<T extends DataRecord = DataRecord> {
  /** 操作配置 */
  actions: Ref<TableActions<T>> | ComputedRef<TableActions<T>>
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
  /** 旧版行操作（向下兼容） */
  rowActions?: any[]
}

export interface UseTableActionsReturn<T extends DataRecord = DataRecord> {
  /** 渲染操作列 */
  renderActions: (rowData: T, rowIndex: number) => VNodeChild
  /** 检查操作是否启用 */
  isActionEnabled: (actionKey: 'edit' | 'delete' | 'detail') => boolean
}

// ================= Hook 实现 =================
/**
 *
 */
export function useTableActions<T extends DataRecord = DataRecord>(
  options: UseTableActionsOptions<T>
): UseTableActionsReturn<T> {
  const {
    actions,
    config,
    tableManager,
    rowKey,
    emit,
    onViewDetail,
    rowActions,
  } = options

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

  // ================= 内置操作处理 =================

  /**
   * 处理内置编辑操作
   */
  const handleBuiltinEdit = async (row: T, index: number) => {
    const editConfig = actions.value?.edit

    if (editConfig && typeof editConfig === 'object') {
      if (editConfig.onEdit) {
        try {
          await editConfig.onEdit(row, index)
        } catch (error) {
          console.error('编辑失败:', error)
          message.error('编辑失败')
        }
      } else if (editConfig.api) {
        try {
          console.log(`调用编辑API: ${editConfig.api}/${row.id}`, row)
          message.success('编辑成功')
        } catch (error) {
          console.error('编辑失败:', error)
          message.error('编辑失败')
        }
      }
    } else {
      tableManager.editStates.modalEdit.startEdit(rowKey(row))
    }
  }

  /**
   * 处理内置删除操作
   */
  const handleBuiltinDelete = async (row: T, index: number) => {
    const deleteConfig = actions.value?.delete
    const confirmText =
      deleteConfig &&
      typeof deleteConfig === 'object' &&
      deleteConfig.confirmText
        ? typeof deleteConfig.confirmText === 'function'
          ? deleteConfig.confirmText(row)
          : deleteConfig.confirmText
        : '确定要删除这条记录吗？'

    dialog.warning({
      title: '确认删除',
      content: confirmText,
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        try {
          if (deleteConfig && typeof deleteConfig === 'object') {
            if (deleteConfig.onDelete) {
              await deleteConfig.onDelete(row, index)
            } else if (deleteConfig.api) {
              console.log(`调用删除API: ${deleteConfig.api}/${row.id}`)
            }
          } else {
            console.log('默认删除行为:', row)
          }

          message.success('删除成功')
          emit('row-delete', row, index)
        } catch (error) {
          console.error('删除失败:', error)
          message.error('删除失败')
        }
      },
    })
  }

  /**
   * 处理内置详情操作
   */
  const handleBuiltinDetail = (row: T, index: number) => {
    const detailConfig = actions.value?.detail

    if (
      detailConfig &&
      typeof detailConfig === 'object' &&
      detailConfig.onView
    ) {
      detailConfig.onView(row, index)
    } else {
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
   * 渲染内置操作按钮
   */
  const renderBuiltinActions = (rowData: T, rowIndex: number): VNodeChild[] => {
    const builtinActions: VNodeChild[] = []

    if (config.value.editMode === 'modal') {
      builtinActions.push(
        createActionButton({
          icon: 'mdi:pencil',
          title: '编辑',
          onClick: () => handleBuiltinEdit(rowData, rowIndex),
        })
      )
    }

    if (isActionEnabled('delete')) {
      builtinActions.push(
        createActionButton({
          icon: 'mdi:delete',
          type: 'error',
          title: '删除',
          onClick: () => handleBuiltinDelete(rowData, rowIndex),
        })
      )
    }

    if (isActionEnabled('detail')) {
      builtinActions.push(
        createActionButton({
          icon: 'mdi:eye',
          type: 'info',
          title: '详情',
          onClick: () => handleBuiltinDetail(rowData, rowIndex),
        })
      )
    }

    return builtinActions
  }

  /**
   * 渲染更多操作（自定义操作下拉菜单）
   */
  const renderMoreActions = (
    rowData: T,
    rowIndex: number
  ): VNodeChild | null => {
    const customActions =
      actions.value?.custom?.filter(
        action => action.show?.(rowData, rowIndex) !== false
      ) || []

    const legacyActions =
      !Object.keys(actions.value || {}).length && rowActions?.length
        ? rowActions.filter(
            action => action.show?.(rowData, rowIndex) !== false
          )
        : []

    const moreActions = [...customActions, ...legacyActions]

    if (!moreActions.length) return null

    const dropdownOptions = moreActions.map(action => ({
      key: action.key || action.label,
      label: action.label,
      icon: () =>
        action.icon
          ? h(C_Icon, { name: action.icon.replace('i-', ''), size: 14 })
          : null,
      props: {
        onClick: () => {
          if (action.label === '查看') {
            onViewDetail?.(rowData)
          } else {
            action.onClick(rowData, rowIndex)
          }
        },
      },
    }))

    return h(
      NDropdown,
      { options: dropdownOptions, trigger: 'click' },
      {
        default: () =>
          createActionButton({
            icon: 'mdi:dots-horizontal',
            type: 'default',
            title: '更多',
            onClick: () => {},
          }),
      }
    )
  }

  /**
   * 主渲染函数 - 组合所有操作按钮
   */
  const renderActions = (rowData: T, rowIndex: number): VNodeChild => {
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

    const moreAction = renderMoreActions(rowData, rowIndex)
    if (moreAction) allActions.push(moreAction)

    return h(NSpace, { size: 2, wrap: false }, () => allActions)
  }

  // ================= 返回接口 =================
  return {
    renderActions,
    isActionEnabled,
  }
}
