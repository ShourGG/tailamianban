/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-13 20:09:41
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-14 19:56:25
 * @FilePath: \Robot_Admin\src\components\global\C_Table\composables\useModalEdit.ts
 * @Description: 模态框编辑组合函数，提供弹窗形式的数据编辑功能
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { DataTableRowKey } from 'naive-ui/es'
import { ref, reactive } from 'vue'

/**
 * * @description 模态框编辑配置选项
 * ? @property data - 获取表格数据的函数
 * ? @property rowKey - 获取行唯一标识的函数
 * ? @property onSave - 保存回调函数，接收编辑数据和行索引
 * ? @property onCancel - 取消回调函数，接收原始数据和行索引
 */
export interface ModalEditOptions<T = Record<string, any>> {
  data: () => T[] // 🔥 简化：使用函数获取最新数据
  rowKey: (row: T) => DataTableRowKey
  onSave?: (
    editingData: Record<string, any>,
    rowIndex: number
  ) => void | Promise<void>
  onCancel?: (originalData: T, rowIndex: number) => void | Promise<void>
}

/**
 * * @description 模态框编辑组合函数，提供弹窗形式的数据编辑功能
 * ? @param options - 模态框编辑配置选项
 * ! @return 返回编辑状态、数据操作和控制方法的对象
 */
export function useModalEdit<T = Record<string, any>>(
  options: ModalEditOptions<T>
) {
  const isModalVisible = ref(false)
  const editingRowIndex = ref(-1)
  const editingRowKey = ref<DataTableRowKey | null>(null)
  const editingData = reactive<Record<string, any>>({})

  /**
   * * @description 重置所有编辑状态到初始值
   * ! @return 无返回值
   */
  const resetEditingState = () => {
    editingRowIndex.value = -1
    editingRowKey.value = null
    Object.keys(editingData).forEach(key => delete editingData[key])
  }

  /**
   * * @description 根据rowKey实时查找最新的行数据和索引
   * ? @param rowKey - 行唯一标识
   * ! @return { data: 行数据, index: 行索引 } 或 null
   */
  const findLatestRowData = (rowKey: DataTableRowKey) => {
    const currentData = options.data()
    if (!currentData || !Array.isArray(currentData)) {
      return null
    }

    const rowIndex = currentData.findIndex(
      row => options.rowKey(row) === rowKey
    )
    if (rowIndex === -1) return null

    return {
      data: currentData[rowIndex],
      index: rowIndex,
    }
  }

  /**
   * * @description 开始编辑指定行，将数据复制到编辑缓存并显示模态框
   * ? @param rowKey - 行唯一标识
   * ! @return 无返回值
   */
  const startEdit = (rowKey: DataTableRowKey) => {
    console.log('🎯 startEdit 开始:', { rowKey })

    // 🔥 关键修复：每次都获取最新数据
    const latestRowInfo = findLatestRowData(rowKey)
    if (!latestRowInfo) {
      console.warn('🎯 未找到对应的行数据:', rowKey)
      return
    }

    const { data: rowData, index: rowIndex } = latestRowInfo

    console.log('🎯 找到最新行数据:', { rowIndex, rowData })

    editingRowIndex.value = rowIndex
    editingRowKey.value = rowKey

    // 🔥 关键修复：确保获取最新数据，完全清空旧数据
    Object.keys(editingData).forEach(key => delete editingData[key])

    // 🔥 深拷贝最新数据，避免引用问题
    const latestRowData = JSON.parse(JSON.stringify(rowData))
    Object.assign(editingData, latestRowData)

    console.log('🎯 编辑数据已设置:', { ...editingData })

    isModalVisible.value = true
  }

  /**
   * * @description 取消编辑，调用取消回调并关闭模态框
   * ! @return Promise<void>
   */
  const cancelEdit = async () => {
    try {
      if (editingRowKey.value && editingRowIndex.value > -1) {
        const latestRowInfo = findLatestRowData(editingRowKey.value)
        if (latestRowInfo) {
          await options.onCancel?.(latestRowInfo.data, latestRowInfo.index)
        }
      }
    } finally {
      isModalVisible.value = false
      resetEditingState()
    }
  }

  /**
   * * @description 保存编辑，调用保存回调并关闭模态框
   * ! @return Promise<void>
   */
  const saveEdit = async () => {
    if (editingRowIndex.value === -1) return

    try {
      console.log('🎯 saveEdit 开始:', {
        editingRowIndex: editingRowIndex.value,
        editingData: { ...editingData },
      })

      // 🔥 修复：确保使用最新的行索引
      let currentRowIndex = editingRowIndex.value

      // 如果有rowKey，重新查找最新索引（防止数据重排后索引变化）
      if (editingRowKey.value) {
        const latestRowInfo = findLatestRowData(editingRowKey.value)
        if (latestRowInfo) {
          currentRowIndex = latestRowInfo.index
          console.log('🎯 更新行索引:', {
            old: editingRowIndex.value,
            new: currentRowIndex,
          })
        }
      }

      // 🔥 传递编辑数据给 handleSave
      await options.onSave?.(editingData, currentRowIndex)

      isModalVisible.value = false
      resetEditingState()

      console.log('🎯 saveEdit 完成')
    } catch (error) {
      console.error('🎯 保存失败:', error)
      throw error
    }
  }

  /**
   * * @description 检查指定行是否正在编辑状态
   * ? @param rowKey - 行唯一标识
   * ! @return 是否正在编辑该行
   */
  const isEditingRow = (rowKey: DataTableRowKey) => {
    return editingRowKey.value === rowKey && isModalVisible.value
  }

  return {
    // 响应式状态
    isModalVisible,
    editingData,
    editingRowKey,
    editingRowIndex,

    // 核心方法
    startEdit,
    cancelEdit,
    saveEdit,
    resetEditingState,

    // 查询方法
    isEditingRow,
    findLatestRowData,
  }
}
