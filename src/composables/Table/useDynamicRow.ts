/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-17 10:52:35
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-17 20:00:34
 * @FilePath: \Robot_Admin\src\composables\Table\useDynamicRow.ts
 * @Description: 表格动态行操作 Hooks -  增行、插行、删除行、复制行、调整行、单选功能、打印功能
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import { type Ref, type VNodeChild } from 'vue'
import {
  type DataTableRowKey,
  NButton,
  NButtonGroup,
  NSpace,
  NIcon,
  NModal,
  NTooltip,
} from 'naive-ui/es'
import {
  usePrintWatermark,
  printPresets,
  type PrintWatermarkOptions,
} from '@/hooks/usePrintWatermark'
import type { TableColumn, DataRecord } from '@/types/modules/table'

// ================= 类型定义 =================
export interface DynamicRowsOptions<T extends DataRecord = DataRecord> {
  // 基础配置
  rowKey?: string | ((row: T) => DataTableRowKey)
  defaultRowData?: () => T

  // 功能开关
  enableRadioSelection?: boolean
  enableAdd?: boolean
  enableInsert?: boolean
  enableDelete?: boolean
  enableCopy?: boolean
  enableMove?: boolean
  enablePrint?: boolean

  // 打印配置
  printOptions?: PrintWatermarkOptions
  printPreset?: 'table' | 'form' | 'report'
  printWatermarkText?: string

  // 交互配置
  confirmDelete?: boolean
  deleteConfirmText?: string

  // 事件回调
  onRowChange?: (data: T[]) => void
  onSelectionChange?: (
    selectedKey: DataTableRowKey | null,
    selectedRow: T | null
  ) => void
  onRowAdd?: (newRow: T) => void
  onRowDelete?: (deletedRow: T, index: number) => void
  onRowCopy?: (originalRow: T, newRow: T) => void
  onRowMove?: (row: T, fromIndex: number, toIndex: number) => void
}

export interface DynamicRowsReturn<T extends DataRecord = DataRecord> {
  // 状态
  selectedRowKey: Ref<DataTableRowKey | null>
  selectedRowData: Ref<T | null>
  selectedRowIndex: Ref<number>
  canMoveUp: Ref<boolean>
  canMoveDown: Ref<boolean>
  deleteConfirmVisible: Ref<boolean>
  printLoading: Ref<boolean>
  printProgress: Ref<number>

  // 行操作方法
  addRow: () => void
  insertRow: () => void
  deleteRow: () => void
  confirmDelete: () => void
  copyRow: () => void
  moveRowUp: () => void
  moveRowDown: () => void

  // 选择方法
  selectRow: (key: DataTableRowKey) => void
  clearSelection: () => void

  // 打印方法
  handlePrint: (elementRef: Ref<HTMLElement | undefined>) => Promise<void>
  handleDownload: (
    elementRef: Ref<HTMLElement | undefined>,
    filename?: string
  ) => Promise<void>
  handleQuickPrint: (elementRef: Ref<HTMLElement | undefined>) => Promise<void>

  // 列增强方法
  enhanceColumns: (columns: TableColumn<T>[]) => TableColumn<T>[]

  // 工具栏渲染
  renderToolbar: () => VNodeChild
  renderConfirmModal: () => VNodeChild
}

// ================= 辅助函数 =================

/**
 * * @description 生成唯一ID
 * ! @return 唯一字符串ID
 */
function generateUniqueId(): string {
  return `row_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * * @description 获取行键值
 * ? @param row - 行数据
 * ? @param rowKey - 行键配置
 * ! @return 行键值
 */
function getRowKey<T extends DataRecord>(
  row: T,
  rowKey: string | ((row: T) => DataTableRowKey)
): DataTableRowKey {
  return typeof rowKey === 'function' ? rowKey(row) : (row as any)[rowKey]
}

/**
 * * @description 创建新行数据
 * ? @param defaultRowData - 默认行数据生成函数
 * ? @param rowKey - 行键配置
 * ! @return 新行数据
 */
function createNewRow<T extends DataRecord>(
  defaultRowData: (() => T) | undefined,
  rowKey: string | ((row: T) => DataTableRowKey)
): T {
  const newRow = defaultRowData?.() || ({} as T)
  const keyField = typeof rowKey === 'string' ? rowKey : 'id'
  return {
    ...newRow,
    [keyField]: generateUniqueId(),
  } as T
}

// ================= 核心状态管理 =================

/**
 * * @description 创建动态行状态管理
 * ? @param data - 表格数据引用
 * ? @param options - 配置选项
 * ! @return 状态管理对象
 */
function useDynamicRowsState<T extends DataRecord>(
  data: Ref<T[]>,
  options: DynamicRowsOptions<T>
) {
  const selectedRowKey = ref<DataTableRowKey | null>(null)
  const deleteConfirmVisible = ref(false)

  const selectedRowData = computed(() => {
    if (selectedRowKey.value === null) return null
    return (
      data.value.find(
        row => getRowKey(row, options.rowKey || 'id') === selectedRowKey.value
      ) || null
    )
  })

  const selectedRowIndex = computed(() => {
    if (!selectedRowData.value) return -1
    return data.value.findIndex(row => row === selectedRowData.value)
  })

  const canMoveUp = computed(() => selectedRowIndex.value > 0)
  const canMoveDown = computed(
    () =>
      selectedRowIndex.value >= 0 &&
      selectedRowIndex.value < data.value.length - 1
  )

  return {
    selectedRowKey,
    selectedRowData,
    selectedRowIndex,
    canMoveUp,
    canMoveDown,
    deleteConfirmVisible,
  }
}

// ================= 行操作逻辑 =================

/**
 * * @description 创建行操作方法
 * ? @param data - 表格数据引用
 * ? @param state - 状态管理对象
 * ? @param options - 配置选项
 * ! @return 行操作方法集合
 */
function useRowOperations<T extends DataRecord>(
  data: Ref<T[]>,
  state: ReturnType<typeof useDynamicRowsState<T>>,
  options: DynamicRowsOptions<T>
) {
  const message = useMessage()

  const updateData = (newData: T[]) => {
    data.value = newData
    options.onRowChange?.(newData)
  }

  const addRow = () => {
    if (!options.enableAdd) return

    const newRow = createNewRow(options.defaultRowData, options.rowKey || 'id')
    const newData = [...data.value, newRow]
    updateData(newData)
    options.onRowAdd?.(newRow)
    message.success('添加行成功')
  }

  const insertRow = () => {
    if (!options.enableInsert || !state.selectedRowData.value) {
      message.warning('请先选择一行数据')
      return
    }

    const newRow = createNewRow(options.defaultRowData, options.rowKey || 'id')
    const newData = [...data.value]
    newData.splice(state.selectedRowIndex.value + 1, 0, newRow)
    updateData(newData)
    options.onRowAdd?.(newRow)
    message.success('插入行成功')
  }

  const deleteRow = () => {
    if (!options.enableDelete || !state.selectedRowData.value) {
      message.warning('请先选择要删除的行')
      return
    }

    if (options.confirmDelete) {
      state.deleteConfirmVisible.value = true
    } else {
      confirmDelete()
    }
  }

  const confirmDelete = () => {
    if (!state.selectedRowData.value) return

    const deletedRow = state.selectedRowData.value
    const deletedIndex = state.selectedRowIndex.value

    const newData = data.value.filter((_, index) => index !== deletedIndex)
    updateData(newData)

    state.selectedRowKey.value = null
    options.onSelectionChange?.(null, null)
    options.onRowDelete?.(deletedRow, deletedIndex)

    message.success('删除行成功')
    state.deleteConfirmVisible.value = false
  }

  const copyRow = () => {
    if (!options.enableCopy || !state.selectedRowData.value) {
      message.warning('请先选择要复制的行')
      return
    }

    const originalRow = state.selectedRowData.value
    const keyField = typeof options.rowKey === 'string' ? options.rowKey : 'id'
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [keyField]: _originalKey, ...rowData } = originalRow as any

    const newRow = {
      ...rowData,
      [keyField]: generateUniqueId(),
    } as T

    const newData = [...data.value, newRow]
    updateData(newData)
    options.onRowCopy?.(originalRow, newRow)
    message.success('复制行成功')
  }

  const moveRowUp = () => {
    if (!options.enableMove || !state.canMoveUp.value) return

    const currentIndex = state.selectedRowIndex.value
    const newData = [...data.value]
    const movingRow = newData[currentIndex]

    ;[newData[currentIndex], newData[currentIndex - 1]] = [
      newData[currentIndex - 1],
      newData[currentIndex],
    ]

    updateData(newData)
    options.onRowMove?.(movingRow, currentIndex, currentIndex - 1)
    message.success('行已上移')
  }

  const moveRowDown = () => {
    if (!options.enableMove || !state.canMoveDown.value) return

    const currentIndex = state.selectedRowIndex.value
    const newData = [...data.value]
    const movingRow = newData[currentIndex]

    ;[newData[currentIndex], newData[currentIndex + 1]] = [
      newData[currentIndex + 1],
      newData[currentIndex],
    ]

    updateData(newData)
    options.onRowMove?.(movingRow, currentIndex, currentIndex + 1)
    message.success('行已下移')
  }

  return {
    addRow,
    insertRow,
    deleteRow,
    confirmDelete,
    copyRow,
    moveRowUp,
    moveRowDown,
  }
}

// ================= 选择逻辑 =================

/**
 * * @description 创建选择操作方法
 * ? @param data - 表格数据引用
 * ? @param state - 状态管理对象
 * ? @param options - 配置选项
 * ! @return 选择操作方法集合
 */
function useSelectionLogic<T extends DataRecord>(
  data: Ref<T[]>,
  state: ReturnType<typeof useDynamicRowsState<T>>,
  options: DynamicRowsOptions<T>
) {
  const selectRow = (key: DataTableRowKey) => {
    const row = data.value.find(
      row => getRowKey(row, options.rowKey || 'id') === key
    )
    if (row) {
      state.selectedRowKey.value = key
      options.onSelectionChange?.(key, row)
    }
  }

  const clearSelection = () => {
    state.selectedRowKey.value = null
    options.onSelectionChange?.(null, null)
  }

  return {
    selectRow,
    clearSelection,
  }
}

// ================= 打印逻辑 =================

/**
 * * @description 创建打印操作方法
 * ? @param options - 配置选项
 * ! @return 打印操作方法集合
 */
function usePrintLogic<T extends DataRecord>(options: DynamicRowsOptions<T>) {
  const {
    loading: printLoading,
    progress: printProgress,
    printWithWatermark,
    downloadScreenshot,
    quickPrint,
  } = usePrintWatermark()

  const getPrintOptions = (): PrintWatermarkOptions => {
    if (options.printOptions) {
      return options.printOptions
    }

    const preset = options.printPreset || 'table'
    const baseConfig = printPresets[preset]

    if (options.printWatermarkText && baseConfig.watermark) {
      return {
        ...baseConfig,
        watermark: {
          ...baseConfig.watermark,
          text: options.printWatermarkText,
        },
      }
    }

    return baseConfig
  }

  const handlePrint = async (elementRef: Ref<HTMLElement | undefined>) => {
    if (!elementRef.value) {
      useMessage().error('打印元素未找到')
      return
    }

    const printOptions = getPrintOptions()
    await printWithWatermark(elementRef.value, printOptions)
  }

  const handleDownload = async (
    elementRef: Ref<HTMLElement | undefined>,
    filename?: string
  ) => {
    if (!elementRef.value) {
      useMessage().error('下载元素未找到')
      return
    }

    const printOptions = getPrintOptions()
    await downloadScreenshot(elementRef.value, filename, printOptions)
  }

  const handleQuickPrint = async (elementRef: Ref<HTMLElement | undefined>) => {
    if (!elementRef.value) {
      useMessage().error('打印元素未找到')
      return
    }

    const watermarkText = options.printWatermarkText || 'Robot Admin'
    await quickPrint(elementRef.value, watermarkText)
  }

  return {
    printLoading,
    printProgress,
    handlePrint,
    handleDownload,
    handleQuickPrint,
  }
}

// ================= 列增强逻辑 =================

/**
 * * @description 创建列增强方法
 * ? @param state - 状态管理对象
 * ? @param selection - 选择操作对象
 * ? @param options - 配置选项
 * ! @return 列增强方法
 */
function useColumnEnhancement<T extends DataRecord>(
  state: ReturnType<typeof useDynamicRowsState<T>>,
  selection: ReturnType<typeof useSelectionLogic<T>>,
  options: DynamicRowsOptions<T>
) {
  const enhanceColumns = (columns: TableColumn<T>[]): TableColumn<T>[] => {
    const enhancedColumns = [...columns]

    if (options.enableRadioSelection) {
      enhancedColumns.unshift({
        key: '_radio_selection',
        title: '选择',
        width: 80,
        align: 'center',
        editable: false,
        render: (rowData: T) => {
          const rowKeyVal = getRowKey(rowData, options.rowKey || 'id')
          return h('div', { class: 'flex justify-center' }, [
            h('input', {
              type: 'radio',
              name: 'table-radio-selection',
              checked: state.selectedRowKey.value === rowKeyVal,
              class: 'cursor-pointer accent-blue-500 scale-110',
              onChange: (e: Event) => {
                if ((e.target as HTMLInputElement).checked) {
                  selection.selectRow(rowKeyVal)
                }
              },
            }),
          ])
        },
      } as TableColumn<T>)
    }

    return enhancedColumns
  }

  return {
    enhanceColumns,
  }
}

// ================= 渲染逻辑 =================

/**
 * * @description 创建渲染方法
 * ? @param state - 状态管理对象
 * ? @param operations - 行操作对象
 * ? @param print - 打印操作对象
 * ? @param options - 配置选项
 * ! @return 渲染方法集合
 */
function useRenderer<T extends DataRecord>(
  state: ReturnType<typeof useDynamicRowsState<T>>,
  operations: ReturnType<typeof useRowOperations<T>>,
  print: ReturnType<typeof usePrintLogic<T>>,
  options: DynamicRowsOptions<T>
) {
  const renderToolbar = (): VNodeChild => {
    const buttons = []

    if (options.enablePrint) {
      buttons.push(
        h(
          NButton,
          {
            loading: print.printLoading.value,
            type: 'primary',
            ghost: true,
            onClick: async () => {
              try {
                // 获取表格容器元素
                const tableElement = document.querySelector('.c-table-wrapper')
                if (tableElement) {
                  await print.handlePrint(ref(tableElement as HTMLElement))
                } else {
                  console.warn('未找到表格容器元素')
                }
              } catch (error) {
                console.error('打印失败:', error)
              }
            },
          },
          {
            icon: () => h(NIcon, () => h('i', { class: 'i-mdi:printer' })),
            default: () => '打印',
          }
        )
      )
    }

    const rowButtons = []

    if (options.enableAdd) {
      rowButtons.push(
        h(
          NButton,
          {
            onClick: operations.addRow,
            type: 'primary',
          },
          {
            icon: () => h(NIcon, () => h('i', { class: 'i-mdi:plus' })),
            default: () => '增行',
          }
        )
      )
    }

    if (options.enableInsert) {
      rowButtons.push(
        h(
          NTooltip,
          {
            disabled: !!state.selectedRowData.value,
          },
          {
            trigger: () =>
              h(
                NButton,
                {
                  onClick: operations.insertRow,
                  disabled: !state.selectedRowData.value,
                  type: 'primary',
                  ghost: true,
                },
                {
                  icon: () =>
                    h(NIcon, () =>
                      h('i', { class: 'i-mdi:table-row-plus-after' })
                    ),
                  default: () => '插行',
                }
              ),
            default: () => '请先选择一行数据',
          }
        )
      )
    }

    if (options.enableDelete) {
      rowButtons.push(
        h(
          NTooltip,
          {
            disabled: !!state.selectedRowData.value,
          },
          {
            trigger: () =>
              h(
                NButton,
                {
                  onClick: operations.deleteRow,
                  disabled: !state.selectedRowData.value,
                  type: 'error',
                  ghost: true,
                },
                {
                  icon: () => h(NIcon, () => h('i', { class: 'i-mdi:delete' })),
                  default: () => '删除行',
                }
              ),
            default: () => '请先选择要删除的行',
          }
        )
      )
    }

    if (options.enableCopy) {
      rowButtons.push(
        h(
          NTooltip,
          {
            disabled: !!state.selectedRowData.value,
          },
          {
            trigger: () =>
              h(
                NButton,
                {
                  onClick: operations.copyRow,
                  disabled: !state.selectedRowData.value,
                  type: 'info',
                  ghost: true,
                },
                {
                  icon: () =>
                    h(NIcon, () => h('i', { class: 'i-mdi:content-copy' })),
                  default: () => '复制行',
                }
              ),
            default: () => '请先选择要复制的行',
          }
        )
      )
    }

    if (options.enableMove) {
      rowButtons.push(
        h(
          NTooltip,
          {
            disabled: state.canMoveUp.value,
          },
          {
            trigger: () =>
              h(
                NButton,
                {
                  onClick: operations.moveRowUp,
                  disabled: !state.canMoveUp.value,
                  type: 'warning',
                  ghost: true,
                },
                {
                  icon: () =>
                    h(NIcon, () => h('i', { class: 'i-mdi:arrow-up' })),
                  default: () => '上移',
                }
              ),
            default: () =>
              !state.selectedRowData.value ? '请先选择数据' : '已经是第一行',
          }
        ),
        h(
          NTooltip,
          {
            disabled: state.canMoveDown.value,
          },
          {
            trigger: () =>
              h(
                NButton,
                {
                  onClick: operations.moveRowDown,
                  disabled: !state.canMoveDown.value,
                  type: 'warning',
                  ghost: true,
                },
                {
                  icon: () =>
                    h(NIcon, () => h('i', { class: 'i-mdi:arrow-down' })),
                  default: () => '下移',
                }
              ),
            default: () =>
              !state.selectedRowData.value ? '请先选择数据' : '已经是最后一行',
          }
        )
      )
    }

    if (rowButtons.length > 0) {
      // 修复 NButtonGroup 的插槽问题
      buttons.push(h(NButtonGroup, {}, () => rowButtons))
    }

    // 修复 NSpace 的插槽问题
    return h('div', { class: 'dynamic-rows-toolbar mb-4 flex justify-end' }, [
      h(NSpace, {}, () => buttons),
    ])
  }

  const renderConfirmModal = (): VNodeChild => {
    return h(NModal, {
      show: state.deleteConfirmVisible.value,
      'onUpdate:show': (show: boolean) => {
        state.deleteConfirmVisible.value = show
      },
      preset: 'dialog',
      title: '确认删除',
      content:
        options.deleteConfirmText || '确定要删除选中的行吗？此操作不可撤销。',
      positiveText: '确认删除',
      negativeText: '取消',
      onPositiveClick: operations.confirmDelete,
    })
  }

  return {
    renderToolbar,
    renderConfirmModal,
  }
}

// ================= 主函数 =================

/**
 * * @description 表格动态行操作功能组合
 * ? @param data - 表格数据响应式引用
 * ? @param options - 配置选项
 * ! @return 动态行操作的所有功能
 */
export function useDynamicRows<T extends DataRecord = DataRecord>(
  data: Ref<T[]>,
  options: DynamicRowsOptions<T> = {}
): DynamicRowsReturn<T> {
  const defaultOptions: DynamicRowsOptions<T> = {
    rowKey: 'id',
    enableRadioSelection: true,
    enableAdd: true,
    enableInsert: true,
    enableDelete: true,
    enableCopy: true,
    enableMove: true,
    enablePrint: true,
    confirmDelete: true,
    deleteConfirmText: '确定要删除选中的行吗？此操作不可撤销。',
    printPreset: 'table',
    defaultRowData: () => ({}) as T,
    ...options,
  }

  const state = useDynamicRowsState(data, defaultOptions)
  const operations = useRowOperations(data, state, defaultOptions)
  const selection = useSelectionLogic(data, state, defaultOptions)
  const print = usePrintLogic(defaultOptions)
  const columnEnhancement = useColumnEnhancement(
    state,
    selection,
    defaultOptions
  )
  const renderer = useRenderer(state, operations, print, defaultOptions)

  return {
    // 状态
    selectedRowKey: state.selectedRowKey,
    selectedRowData: state.selectedRowData,
    selectedRowIndex: state.selectedRowIndex,
    canMoveUp: state.canMoveUp,
    canMoveDown: state.canMoveDown,
    deleteConfirmVisible: state.deleteConfirmVisible,
    printLoading: print.printLoading,
    printProgress: print.printProgress,

    // 行操作方法
    addRow: operations.addRow,
    insertRow: operations.insertRow,
    deleteRow: operations.deleteRow,
    confirmDelete: operations.confirmDelete,
    copyRow: operations.copyRow,
    moveRowUp: operations.moveRowUp,
    moveRowDown: operations.moveRowDown,

    // 选择方法
    selectRow: selection.selectRow,
    clearSelection: selection.clearSelection,

    // 打印方法
    handlePrint: print.handlePrint,
    handleDownload: print.handleDownload,
    handleQuickPrint: print.handleQuickPrint,

    // 列增强方法
    enhanceColumns: columnEnhancement.enhanceColumns,

    // 渲染方法
    renderToolbar: renderer.renderToolbar,
    renderConfirmModal: renderer.renderConfirmModal,
  }
}
