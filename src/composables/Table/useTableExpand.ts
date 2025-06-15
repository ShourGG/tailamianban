/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-15 19:30:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-16 00:10:46
 * @FilePath: \Robot_Admin\src\composables\Table\useTableExpand.ts
 * @Description: 极简重构版表格展开功能 - 彻底降低圈复杂度 + 简单联动
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
import type { VNodeChild, Ref } from 'vue'
import { type DataTableRowKey, NSpin, NDataTable, NButton } from 'naive-ui/es'
import type { TableColumn } from '@/types/modules/table'

// ================= 核心类型 =================
export interface ExpandOptions<T = Record<string, any>> {
  data: Ref<T[]> | T[]
  rowKey: (row: T) => DataTableRowKey
  defaultExpandedKeys?: DataTableRowKey[]
  onLoadData?: (row: T) => Promise<any[]>
  renderContent?: (
    row: T,
    expandData: any[],
    loading: boolean,
    childSelection?: any
  ) => VNodeChild
  accordion?: boolean
  rowExpandable?: (row: T) => boolean
  onExpandChange?: (
    expandedKeys: DataTableRowKey[],
    row?: T,
    expanded?: boolean
  ) => void

  enableSelection?: boolean
  defaultCheckedKeys?: DataTableRowKey[]
  onSelectionChange?: (
    checkedKeys: DataTableRowKey[],
    checkedRows: T[],
    childSelections?: Map<DataTableRowKey, any[]>
  ) => void
  rowCheckable?: (row: T) => boolean
  maxSelection?: number

  enableChildSelection?: boolean
  childRowKey?: (childRow: any) => DataTableRowKey
  childRowCheckable?: (childRow: any, parentRow: T) => boolean
  onChildSelectionChange?: (
    parentKey: DataTableRowKey,
    childKeys: DataTableRowKey[],
    childRows: any[]
  ) => void
}

// ================= 纯函数工具 =================
const arrayToggle = <T>(arr: T[], item: T): T[] => {
  const index = arr.indexOf(item)
  return index === -1 ? [...arr, item] : arr.filter((_, i) => i !== index)
}

const arrayAdd = <T>(arr: T[], items: T[]): T[] => [
  ...new Set([...arr, ...items]),
]

const arrayRemove = <T>(arr: T[], items: T[]): T[] => {
  const removeSet = new Set(items)
  return arr.filter(item => !removeSet.has(item))
}

const safeGet = <K, V>(map: Map<K, V>, key: K, defaultValue: V): V =>
  map.get(key) ?? defaultValue

// ================= 基础状态 Hook =================
const useBaseState = <T>(options: ExpandOptions<T>) => {
  const expandedKeys = ref<DataTableRowKey[]>([
    ...(options.defaultExpandedKeys || []),
  ])
  const expandDataMap = ref(new Map<DataTableRowKey, any[]>())
  const loadingMap = ref(new Map<DataTableRowKey, boolean>())
  const errorMap = ref(new Map<DataTableRowKey, string | null>())

  return {
    expandedKeys,
    expandDataMap,
    loadingMap,
    errorMap,
    isExpanded: (key: DataTableRowKey) => expandedKeys.value.includes(key),
    isLoading: (key: DataTableRowKey) => safeGet(loadingMap.value, key, false),
    getExpandData: (key: DataTableRowKey) =>
      safeGet(expandDataMap.value, key, []),
    getError: (key: DataTableRowKey) => errorMap.value.get(key),
  }
}

// ================= 选择状态 Hook =================
const useSelectionState = <T>(options: ExpandOptions<T>) => {
  if (!options.enableSelection) return null

  const checkedKeys = ref<DataTableRowKey[]>([
    ...(options.defaultCheckedKeys || []),
  ])
  const childSelections = options.enableChildSelection
    ? ref(new Map<DataTableRowKey, DataTableRowKey[]>())
    : null

  return {
    checkedKeys,
    childSelections,
    isChecked: (key: DataTableRowKey) => checkedKeys.value.includes(key),
    getChildSelection: (parentKey: DataTableRowKey) =>
      childSelections ? safeGet(childSelections.value, parentKey, []) : [],
  }
}

// ================= 数据工具 Hook =================
const useDataUtils = <T>(options: ExpandOptions<T>) => {
  const data = computed(() => unref(options.data))

  return {
    data,
    getRowKey: options.rowKey,
    getChildRowKey:
      options.childRowKey || ((child: any) => child.id || child.key),
    findRow: (key: DataTableRowKey) =>
      data.value.find(row => options.rowKey(row) === key),
    isRowExpandable: options.rowExpandable || (() => true),
    isRowCheckable: options.rowCheckable || (() => true),
    isChildRowCheckable: options.childRowCheckable || (() => true),
  }
}

// ================= 展开逻辑 Hook =================
const useExpandLogic = <T>(
  baseState: ReturnType<typeof useBaseState<T>>,
  dataUtils: ReturnType<typeof useDataUtils<T>>,
  selectionState: ReturnType<typeof useSelectionState<T>>,
  options: ExpandOptions<T>
) => {
  const loadData = async (row: T): Promise<any[]> => {
    if (!options.onLoadData) return []

    const key = dataUtils.getRowKey(row)
    if (baseState.expandDataMap.value.has(key)) {
      return baseState.getExpandData(key)
    }

    baseState.loadingMap.value.set(key, true)
    baseState.errorMap.value.delete(key)

    try {
      const data = await options.onLoadData(row)
      baseState.expandDataMap.value.set(key, data || [])

      // 初始化子选择状态
      if (
        selectionState?.childSelections &&
        !selectionState.childSelections.value.has(key)
      ) {
        selectionState.childSelections.value.set(key, [])
      }

      return data || []
    } catch (error) {
      baseState.errorMap.value.set(
        key,
        error instanceof Error ? error.message : '加载失败'
      )
      return []
    } finally {
      baseState.loadingMap.value.set(key, false)
    }
  }

  const expandRow = async (key: DataTableRowKey): Promise<void> => {
    if (baseState.isExpanded(key)) return

    if (options.accordion) {
      baseState.expandedKeys.value.length = 0
    }

    const row = dataUtils.findRow(key)
    if (!row) return

    await loadData(row)
    baseState.expandedKeys.value.push(key)
    options.onExpandChange?.(baseState.expandedKeys.value, row, true)

    // 联动：展开时自动选中
    if (selectionState && !selectionState.isChecked(key)) {
      selectionState.checkedKeys.value.push(key)
    }
  }

  const collapseRow = (key: DataTableRowKey): void => {
    if (!baseState.isExpanded(key)) return

    baseState.expandedKeys.value = baseState.expandedKeys.value.filter(
      k => k !== key
    )
    const row = dataUtils.findRow(key)
    options.onExpandChange?.(baseState.expandedKeys.value, row, false)

    // 联动：折叠时自动取消选中并清空子选择
    if (selectionState) {
      if (selectionState.isChecked(key)) {
        selectionState.checkedKeys.value =
          selectionState.checkedKeys.value.filter(k => k !== key)
      }
      selectionState.childSelections?.value.delete(key)
    }
  }

  const toggleExpand = async (key: DataTableRowKey): Promise<void> => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    baseState.isExpanded(key) ? collapseRow(key) : await expandRow(key)
  }

  const refreshData = async (key: DataTableRowKey): Promise<void> => {
    const row = dataUtils.findRow(key)
    if (!row) return

    baseState.expandDataMap.value.delete(key)
    baseState.errorMap.value.delete(key)
    await loadData(row)
  }

  return {
    loadData,
    expandRow,
    collapseRow,
    toggleExpand,
    refreshData,
    expandAll: async () => {
      const rows = dataUtils.data.value.filter(dataUtils.isRowExpandable)
      await Promise.all(rows.map(loadData))
      baseState.expandedKeys.value = rows.map(dataUtils.getRowKey)
      options.onExpandChange?.(baseState.expandedKeys.value)
    },
    collapseAll: () => {
      baseState.expandedKeys.value.length = 0
      options.onExpandChange?.(baseState.expandedKeys.value)

      // 清空所有子选择状态
      if (selectionState?.childSelections) {
        selectionState.childSelections.value.clear()
      }
    },
  }
}

// ================= 选择逻辑 Hook =================
const useSelectionLogic = <T>(
  selectionState: ReturnType<typeof useSelectionState<T>>,
  dataUtils: ReturnType<typeof useDataUtils<T>>,
  baseState: ReturnType<typeof useBaseState<T>>,
  expandLogic: ReturnType<typeof useExpandLogic<T>>,
  options: ExpandOptions<T>
) => {
  if (!selectionState) return null

  const { checkedKeys } = selectionState

  const selectableRows = computed(() =>
    dataUtils.data.value.filter(dataUtils.isRowCheckable)
  )

  const checkedRows = computed(() =>
    dataUtils.data.value.filter(row =>
      checkedKeys.value.includes(dataUtils.getRowKey(row))
    )
  )

  const toggleSelection = async (key: DataTableRowKey): Promise<void> => {
    const canSelect =
      !selectionState.isChecked(key) &&
      (!options.maxSelection || checkedKeys.value.length < options.maxSelection)

    if (canSelect || selectionState.isChecked(key)) {
      checkedKeys.value = arrayToggle(checkedKeys.value, key)

      // 联动：选中时自动展开
      if (selectionState.isChecked(key) && !baseState.isExpanded(key)) {
        await expandLogic.expandRow(key)
      }
    }
  }

  return {
    selectableRows,
    checkedRows,
    isAllChecked: computed(() => {
      const selectableKeys = selectableRows.value.map(dataUtils.getRowKey)
      return (
        selectableKeys.length > 0 &&
        selectableKeys.every(selectionState.isChecked)
      )
    }),
    isIndeterminate: computed(() => {
      const total = selectableRows.value.length
      const checked = checkedKeys.value.length
      return checked > 0 && checked < total
    }),
    toggleSelection,
    selectAll: () => {
      const keys = selectableRows.value.map(dataUtils.getRowKey)
      checkedKeys.value = options.maxSelection
        ? keys.slice(0, options.maxSelection)
        : keys
    },
    clearSelection: () => {
      checkedKeys.value.length = 0
    },
    selectRows: (keys: DataTableRowKey[]) => {
      const available = options.maxSelection
        ? options.maxSelection - checkedKeys.value.length
        : Infinity
      const validKeys = keys.slice(0, available)
      checkedKeys.value = arrayAdd(checkedKeys.value, validKeys)
    },
    unselectRows: (keys: DataTableRowKey[]) => {
      checkedKeys.value = arrayRemove(checkedKeys.value, keys)
    },
    invertSelection: () => {
      const selectableKeys = selectableRows.value.map(dataUtils.getRowKey)
      const newKeys = selectableKeys.filter(
        key => !checkedKeys.value.includes(key)
      )
      checkedKeys.value = options.maxSelection
        ? newKeys.slice(0, options.maxSelection)
        : newKeys
    },
  }
}

// ================= 子选择逻辑 Hook =================
const useChildSelectionLogic = <T>(
  selectionState: ReturnType<typeof useSelectionState<T>>,
  baseState: ReturnType<typeof useBaseState<T>>,
  dataUtils: ReturnType<typeof useDataUtils<T>>,
  options: ExpandOptions<T>
) => {
  if (!selectionState?.childSelections || !options.enableChildSelection)
    return null

  const { childSelections } = selectionState

  const toggleChildSelection = (
    parentKey: DataTableRowKey,
    childKey: DataTableRowKey
  ): void => {
    const current = selectionState.getChildSelection(parentKey)
    const newSelection = arrayToggle(current, childKey)

    childSelections.value.set(parentKey, newSelection)

    const expandData = baseState.getExpandData(parentKey)
    const selectedRows = expandData.filter(c =>
      newSelection.includes(dataUtils.getChildRowKey(c))
    )

    options.onChildSelectionChange?.(parentKey, newSelection, selectedRows)

    // 联动：子选择变化影响父选择
    if (options.enableSelection && selectionState.checkedKeys) {
      const hasSelected = newSelection.length > 0
      const isParentSelected = selectionState.isChecked(parentKey)

      if (hasSelected && !isParentSelected) {
        selectionState.checkedKeys.value.push(parentKey)
      } else if (!hasSelected && isParentSelected) {
        selectionState.checkedKeys.value =
          selectionState.checkedKeys.value.filter(k => k !== parentKey)
      }
    }
  }

  const selectAllChildren = (parentKey: DataTableRowKey): void => {
    const expandData = baseState.getExpandData(parentKey)
    const parent = dataUtils.findRow(parentKey)

    if (!parent) return

    const checkableKeys = expandData
      .filter(c => dataUtils.isChildRowCheckable(c, parent))
      .map(dataUtils.getChildRowKey)

    childSelections.value.set(parentKey, checkableKeys)
    options.onChildSelectionChange?.(parentKey, checkableKeys, expandData)

    // 联动：全选子项时自动选中父项
    if (
      options.enableSelection &&
      selectionState.checkedKeys &&
      !selectionState.isChecked(parentKey)
    ) {
      selectionState.checkedKeys.value.push(parentKey)
    }
  }

  const clearChildrenSelection = (parentKey: DataTableRowKey): void => {
    childSelections.value.set(parentKey, [])
    options.onChildSelectionChange?.(parentKey, [], [])

    // 联动：清空子项时自动取消选中父项
    if (
      options.enableSelection &&
      selectionState.checkedKeys &&
      selectionState.isChecked(parentKey)
    ) {
      selectionState.checkedKeys.value =
        selectionState.checkedKeys.value.filter(k => k !== parentKey)
    }
  }

  const isAllChildrenChecked = (parentKey: DataTableRowKey): boolean => {
    const expandData = baseState.getExpandData(parentKey)
    if (!expandData.length) return false

    const selectedChildren = selectionState.getChildSelection(parentKey)
    const parent = dataUtils.findRow(parentKey)
    if (!parent) return false

    const checkableChildren = expandData.filter(child =>
      dataUtils.isChildRowCheckable(child, parent)
    )

    return (
      checkableChildren.length > 0 &&
      checkableChildren.every(child =>
        selectedChildren.includes(dataUtils.getChildRowKey(child))
      )
    )
  }

  return {
    toggleChildSelection,
    selectAllChildren,
    clearChildrenSelection,
    isAllChildrenChecked,
    isChildChecked: (parentKey: DataTableRowKey, childKey: DataTableRowKey) =>
      selectionState.getChildSelection(parentKey).includes(childKey),
    getChildSelectedData: (parentKey: DataTableRowKey) => {
      const selected = selectionState.getChildSelection(parentKey)
      const expandData = baseState.getExpandData(parentKey)
      return expandData.filter(c =>
        selected.includes(dataUtils.getChildRowKey(c))
      )
    },
    getAllSelectedData: () => {
      const parentRows = dataUtils.data.value.filter(row =>
        selectionState.isChecked(dataUtils.getRowKey(row))
      )
      const childSelectionsMap = new Map<DataTableRowKey, any[]>()

      childSelections.value.forEach((selectedKeys, parentKey) => {
        if (selectedKeys.length > 0) {
          const expandData = baseState.getExpandData(parentKey)
          const selectedChildren = expandData.filter(c =>
            selectedKeys.includes(dataUtils.getChildRowKey(c))
          )
          childSelectionsMap.set(parentKey, selectedChildren)
        }
      })

      return { parentRows, childSelections: childSelectionsMap }
    },
  }
}

// ================= 渲染策略 =================
const createRenderStrategies = () => ({
  loading: () =>
    h('div', { class: 'flex justify-center items-center py-8' }, [
      h(NSpin, { size: 'small' }),
      h('span', { class: 'ml-2 text-gray-500' }, '加载中...'),
    ]),

  error: (error: string, onRetry: () => void) =>
    h('div', { class: 'flex justify-center items-center py-6 text-red-500' }, [
      h('span', error),
      h(
        NButton,
        { class: 'ml-4', size: 'small', type: 'primary', onClick: onRetry },
        () => '重试'
      ),
    ]),

  empty: () =>
    h(
      'div',
      {
        class: 'flex flex-col justify-center items-center py-12 text-gray-400',
      },
      [h('div', { class: 'text-sm' }, '暂无相关数据')]
    ),

  childTable: (
    data: any[],
    columns: any[],
    selectedKeys: DataTableRowKey[],
    onSelectionChange: any,
    childRowKey: any
  ) =>
    h(NDataTable, {
      data,
      columns,
      size: 'small',
      striped: true,
      scrollX: 600,
      checkedRowKeys: selectedKeys,
      rowKey: childRowKey,
      onUpdateCheckedRowKeys: onSelectionChange,
    }),
})

// ================= 渲染器 Hook =================
const useRenderer = <T>(
  baseState: ReturnType<typeof useBaseState<T>>,
  dataUtils: ReturnType<typeof useDataUtils<T>>,
  expandLogic: ReturnType<typeof useExpandLogic<T>>,
  selectionState: ReturnType<typeof useSelectionState<T>>,
  childSelectionLogic: ReturnType<typeof useChildSelectionLogic<T>>,
  options: ExpandOptions<T>
) => {
  const strategies = createRenderStrategies()

  const buildChildColumns = (data: any[], hasSelection: boolean) => {
    const columns = []

    if (hasSelection) columns.push({ type: 'selection', multiple: true })

    columns.push({
      title: '序号',
      key: '_index',
      width: 60,
      render: (_: any, index: number) => index + 1,
    })

    if (data.length > 0) {
      Object.keys(data[0])
        .filter(key => !['id', 'key'].includes(key))
        .forEach(key =>
          columns.push({
            key,
            title: key.charAt(0).toUpperCase() + key.slice(1),
            width: 120,
            ellipsis: { tooltip: true },
          })
        )
    }

    return columns
  }

  // 拆分渲染逻辑为多个小函数
  const prepareExpandData = (row: T, key: DataTableRowKey) => {
    if (options.onLoadData && !baseState.expandDataMap.value.has(key)) {
      expandLogic.loadData(row)
    }
    return {
      expandData: baseState.getExpandData(key),
      loading: baseState.isLoading(key),
      error: baseState.getError(key),
    }
  }

  const createChildSelectionState = (key: DataTableRowKey) => {
    if (!childSelectionLogic || !selectionState?.childSelections)
      return undefined

    return {
      selectedKeys: selectionState.getChildSelection(key),
      isAllChecked: childSelectionLogic.isAllChildrenChecked(key),
      selectAll: () => childSelectionLogic.selectAllChildren(key),
      clearAll: () => childSelectionLogic.clearChildrenSelection(key),
    }
  }

  const createChildSelectionHandler = (
    key: DataTableRowKey,
    expandData: any[]
  ) => {
    if (!childSelectionLogic || !selectionState?.childSelections)
      return undefined

    return (keys: DataTableRowKey[]) => {
      selectionState.childSelections!.value.set(key, keys)
      const selectedRows = expandData.filter(c =>
        keys.includes(dataUtils.getChildRowKey(c))
      )
      options.onChildSelectionChange?.(key, keys, selectedRows)

      // 联动：子选择变化影响父选择
      if (options.enableSelection && selectionState.checkedKeys) {
        const hasSelected = keys.length > 0
        const isParentSelected = selectionState.isChecked(key)

        if (hasSelected && !isParentSelected) {
          selectionState.checkedKeys.value.push(key)
        } else if (!hasSelected && isParentSelected) {
          selectionState.checkedKeys.value =
            selectionState.checkedKeys.value.filter(k => k !== key)
        }
      }
    }
  }

  const renderExpandHeader = (
    row: T,
    expandData: any[],
    childSelectionState: any
  ) =>
    h(
      'div',
      {
        class:
          'px-4 py-3 bg-blue-50 border-b border-blue-100 flex items-center justify-between',
      },
      [
        h(
          'span',
          { class: 'text-sm font-medium text-blue-700' },
          `${(row as any).name || '数据'} 的子数据 (${expandData.length} 条)`
        ),
        childSelectionState &&
          h('div', { class: 'flex gap-2' }, [
            h(
              NButton,
              {
                size: 'tiny',
                type: 'primary',
                onClick: childSelectionState.selectAll,
              },
              () => '全选'
            ),
            h(
              NButton,
              {
                size: 'tiny',
                type: 'warning',
                onClick: childSelectionState.clearAll,
              },
              () => '清空'
            ),
          ]),
      ]
    )

  const renderExpandTable = (
    expandData: any[],
    childSelectionState: any,
    selectionHandler: any
  ) => {
    const columns = buildChildColumns(expandData, !!childSelectionState)
    return strategies.childTable(
      expandData,
      columns,
      childSelectionState?.selectedKeys || [],
      selectionHandler,
      dataUtils.getChildRowKey
    )
  }

  const createExpandContent = (row: T): VNodeChild => {
    const key = dataUtils.getRowKey(row)
    const { expandData, loading, error } = prepareExpandData(row, key)
    const childSelectionState = createChildSelectionState(key)

    // 自定义渲染 - 复杂度: 1
    if (options.renderContent) {
      return options.renderContent(
        row,
        expandData,
        loading,
        childSelectionState
      )
    }

    // 状态渲染 - 复杂度: 3
    if (loading) return strategies.loading()
    if (error)
      return strategies.error(error, () => expandLogic.refreshData(key))
    if (!expandData.length) return strategies.empty()

    // 子表格渲染 - 复杂度: 1
    const selectionHandler = createChildSelectionHandler(key, expandData)

    return h(
      'div',
      {
        class:
          'expand-content bg-gray-50/50 border-l-4 border-blue-200 ml-8 mr-4 rounded-r-lg overflow-hidden',
      },
      [
        renderExpandHeader(row, expandData, childSelectionState),
        h('div', { class: 'p-4' }, [
          renderExpandTable(expandData, childSelectionState, selectionHandler),
        ]),
      ]
    )
  }

  const getTableColumns = (originalColumns: TableColumn[]): any[] => {
    const columns = [...originalColumns]

    if (options.enableSelection) {
      columns.unshift({
        type: 'selection',
        disabled: (row: T) => !dataUtils.isRowCheckable(row),
        multiple: !options.maxSelection || options.maxSelection > 1,
        key: '',
        title: '',
      })
    }

    const expandIndex = options.enableSelection ? 1 : 0
    columns.splice(expandIndex, 0, {
      type: 'expand',
      expandable: dataUtils.isRowExpandable,
      renderExpand: createExpandContent,
      key: '',
      title: '',
    })

    return columns
  }

  return { getTableColumns }
}

// ================= 主入口函数 =================
/**
 * @description: 表格扩展功能
 */
export function useTableExpand<T = Record<string, any>>(
  options: ExpandOptions<T>
) {
  // 创建各个 Hook
  const baseState = useBaseState(options)
  const selectionState = useSelectionState(options)
  const dataUtils = useDataUtils(options)
  const expandLogic = useExpandLogic(
    baseState,
    dataUtils,
    selectionState,
    options
  )
  const selectionLogic = useSelectionLogic(
    selectionState,
    dataUtils,
    baseState,
    expandLogic,
    options
  )
  const childSelectionLogic = useChildSelectionLogic(
    selectionState,
    baseState,
    dataUtils,
    options
  )
  const renderer = useRenderer(
    baseState,
    dataUtils,
    expandLogic,
    selectionState,
    childSelectionLogic,
    options
  )

  // 监听选择变化
  if (selectionState && options.onSelectionChange) {
    watch(
      [selectionState.checkedKeys, dataUtils.data],
      () => {
        options.onSelectionChange!(
          selectionState.checkedKeys.value,
          selectionLogic!.checkedRows.value,
          selectionState.childSelections?.value
        )
      },
      { deep: true }
    )
  }

  // 组合返回对象
  const result = {
    // 基础展开功能
    ...baseState,
    ...expandLogic,
    ...renderer,
    handleExpandChange: (keys: DataTableRowKey[]) => {
      baseState.expandedKeys.value = keys
    },
  }

  // 添加选择功能
  if (selectionLogic) {
    Object.assign(result, {
      checkedKeys: selectionState!.checkedKeys,
      checkedRows: selectionLogic.checkedRows,
      isAllChecked: selectionLogic.isAllChecked,
      isIndeterminate: selectionLogic.isIndeterminate,
      selectableRowsCount: computed(
        () => selectionLogic.selectableRows.value.length
      ),
      selectedRowsCount: computed(
        () => selectionState!.checkedKeys.value.length
      ),
      toggleRowSelection: selectionLogic.toggleSelection,
      selectRows: selectionLogic.selectRows,
      unselectRows: selectionLogic.unselectRows,
      selectAll: selectionLogic.selectAll,
      clearSelection: selectionLogic.clearSelection,
      invertSelection: selectionLogic.invertSelection,
      isRowChecked: selectionState!.isChecked,
      handleSelectionChange: (keys: DataTableRowKey[]) => {
        selectionState!.checkedKeys.value = keys
      },
    })
  }

  // 添加子选择功能
  if (childSelectionLogic) {
    Object.assign(result, {
      childSelections: selectionState!.childSelections,
      toggleChildSelection: childSelectionLogic.toggleChildSelection,
      selectAllChildren: childSelectionLogic.selectAllChildren,
      clearChildrenSelection: childSelectionLogic.clearChildrenSelection,
      isChildChecked: childSelectionLogic.isChildChecked,
      isAllChildrenChecked: childSelectionLogic.isAllChildrenChecked,
      getChildSelectedData: childSelectionLogic.getChildSelectedData,
      getAllSelectedData: childSelectionLogic.getAllSelectedData,
    })
  }

  // 添加批量操作
  if (selectionLogic) {
    Object.assign(result, {
      expandSelected: async () => {
        await Promise.all(
          selectionState!.checkedKeys.value.map(async (key: any) => {
            if (!baseState.isExpanded(key)) {
              await expandLogic.expandRow(key)
            }
          })
        )
      },
      collapseSelected: () => {
        selectionState!.checkedKeys.value.forEach((key: any) => {
          if (baseState.isExpanded(key)) expandLogic.collapseRow(key)
        })
      },
      selectExpanded: () => {
        const toAdd = baseState.expandedKeys.value.filter(
          (k: any) => !selectionState!.isChecked(k)
        )
        selectionLogic.selectRows(toAdd)
      },
      clearAllSelections: () => {
        selectionLogic.clearSelection()
        selectionState!.childSelections?.value.clear()
      },
    })
  }

  return result
}
