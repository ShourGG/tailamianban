<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-13 18:38:58
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-08-22 14:06:37
 * @FilePath: \Robot_Admin\src\views\demo\10-table\index.vue
 * @Description: 表格组件演示
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="table-demo-page">
    <NH1>表格组件场景示例</NH1>
    <NCard>
      <NSpace
        vertical
        :size="20"
      >
        <!-- 编辑模式切换 -->
        <NCard
          title="编辑模式选择"
          size="small"
        >
          <NSpace>
            <NRadioGroup v-model:value="editMode">
              <NRadioButton
                v-for="mode in EDIT_MODES"
                :key="mode.value"
                :value="mode.value"
              >
                <template #icon>
                  <C_Icon :name="mode.icon" />
                </template>
                {{ mode.label }}
              </NRadioButton>
            </NRadioGroup>

            <NDivider vertical />

            <NButton
              @click="addNewRow"
              type="primary"
              :disabled="editMode === 'none'"
            >
              <template #icon>
                <C_Icon name="mdi:plus" />
              </template>
              添加新行
            </NButton>

            <NDivider vertical />

            <!-- 分页状态信息 -->
            <NSpace class="mt-4px">
              <span>分页状态：</span>
              <NSwitch
                v-model:value="paginationEnabled"
                @update:value="handlePaginationToggle"
              >
                <template #checked> 开启 </template>
                <template #unchecked> 关闭 </template>
              </NSwitch>
            </NSpace>
          </NSpace>
        </NCard>

        <!-- 当前模式说明 -->
        <NAlert
          :type="currentModeConfig.alertType"
          :title="currentModeConfig.title"
        >
          {{ currentModeConfig.description }}
          <template v-if="paginationEnabled">
            <br />
            <strong>分页功能已启用</strong> - 当前显示第
            {{ currentPage }} 页，每页 {{ defaultPageSize }} 条，总共
            {{ tableData.length }} 条记录
          </template>
        </NAlert>

        <!-- 表格组件 -->
        <C_Table
          ref="tableRef"
          v-model:data="tableData"
          :columns="tableColumns"
          :loading="loading"
          :edit-mode="editMode"
          :editable="editMode !== 'none'"
          modal-title="编辑员工信息"
          :modal-width="700"
          :actions="tableActions"
          :pagination="paginationConfig"
          @save="handleSave"
          @cancel="handleCancel"
          @pagination-change="handlePaginationChange"
        />
      </NSpace>
    </NCard>
  </div>
</template>

<script setup lang="ts">
  import type {
    EditMode,
    DataRecord,
    PaginationConfig,
  } from '@/types/modules/table'
  import {
    EDIT_MODES,
    MODE_CONFIG,
    extendedTableData,
    getTableColumns,
    createNewEmployee,
    type Employee,
  } from './data'

  // ================= 组合式函数 =================
  const message = useMessage()
  const dialog = useDialog()

  // ================= 响应式状态 =================
  const loading = ref(false)
  const tableRef = ref()
  const editMode = ref<EditMode>('modal')
  const tableData = ref<Employee[]>([...extendedTableData])

  // 分页相关状态
  const paginationEnabled = ref(true)
  const defaultPageSize = ref(10)
  const currentPage = ref(1)

  // 🎯 修复：用于跟踪模态框新增的数据ID，类型与Employee.id保持一致
  const pendingNewRowId = ref<number | null>(null)

  // ================= 计算属性 =================
  const currentModeConfig = computed(() => MODE_CONFIG[editMode.value])
  const tableColumns = computed(() => getTableColumns())

  // 分页配置
  const paginationConfig = computed((): PaginationConfig | boolean => {
    if (!paginationEnabled.value) {
      return false
    }

    return {
      enabled: true,
      page: currentPage.value,
      pageSize: defaultPageSize.value,
      showSizePicker: true,
      showQuickJumper: true,
      pageSizes: [10, 20, 50, 100],
      simple: false,
      size: 'medium',
    }
  })

  // 🎯 表格操作配置 - 添加删除功能
  const tableActions = computed(() => ({
    // ✅ 添加删除配置
    delete: {
      onDelete: handleDelete, // 提供删除处理函数
      confirmText: (row: DataRecord) => {
        const employee = row as Employee
        return `确定要删除员工 "${employee.name}" 吗？此操作不可撤销！`
      }, // 修复类型：参数改为DataRecord
    },
    // 使用默认的编辑、详情按钮
    custom: [
      {
        key: 'copy',
        label: '复制',
        icon: 'mdi:content-copy',
        type: 'default' as const,
        onClick: handleCopy,
      },
      {
        key: 'authorize',
        label: '授权',
        icon: 'mdi:shield-key',
        type: 'warning' as const,
        onClick: handleAuthorize,
      },
    ],
  }))

  // ================= 分页事件处理 =================

  /**
   * @description 处理分页开关切换
   */
  const handlePaginationToggle = (enabled: boolean) => {
    console.log('分页功能:', enabled ? '已开启' : '已关闭')
    if (enabled) {
      message.info(`分页功能已开启，每页显示 ${defaultPageSize.value} 条记录`)
    } else {
      message.info('分页功能已关闭，显示全部记录')
    }
  }

  /**
   * @description 处理分页大小变化
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handlePageSizeChange = (pageSize: number) => {
    console.log('分页大小变更为:', pageSize)
    defaultPageSize.value = pageSize
    currentPage.value = 1 // 重置到第一页
    message.info(`分页大小已调整为每页 ${pageSize} 条记录`)
  }

  /**
   * @description 处理分页变化事件
   */
  const handlePaginationChange = (...args: unknown[]) => {
    const [page, pageSize] = args as [number, number]
    console.log('分页变化:', { page, pageSize, total: tableData.value.length })
    currentPage.value = page

    if (pageSize !== defaultPageSize.value) {
      defaultPageSize.value = pageSize
    }

    const total = tableData.value.length
    const start = (page - 1) * pageSize + 1
    const end = Math.min(page * pageSize, total)

    message.info(
      `已切换到第 ${page} 页，显示第 ${start}-${end} 条记录，共 ${total} 条`
    )
  }

  // ================= 业务逻辑 =================

  /**
   * @description 添加新行到表格顶部，并根据编辑模式自动开始编辑
   */
  const addNewRow = () => {
    const newRow = createNewEmployee()

    if (editMode.value === 'modal') {
      // 🎯 修复：直接使用number类型的ID
      pendingNewRowId.value = newRow.id

      // 临时插入数据（为了让 startEdit 能找到数据）
      tableData.value.unshift(newRow)

      // 如果启用分页且不在第一页，则跳转到第一页
      if (paginationEnabled.value && currentPage.value !== 1) {
        currentPage.value = 1
      }

      // 开始编辑
      setTimeout(() => {
        tableRef.value?.startEdit(newRow.id)
      }, 100)

      message.info('请填写新员工信息后保存')
    } else {
      // 其他编辑模式保持原有逻辑不变
      tableData.value.unshift(newRow)

      // 如果启用分页且不在第一页，则跳转到第一页
      if (paginationEnabled.value && currentPage.value !== 1) {
        currentPage.value = 1
        message.info('新数据已添加到第一页')
      }

      // 根据编辑模式自动开始编辑
      setTimeout(() => {
        if (['row', 'both'].includes(editMode.value)) {
          tableRef.value?.startEdit(newRow.id)
        }
      }, 100)
    }
  }

  /**
   * ✅ 新增：处理删除操作
   * @description 删除员工信息，支持分页场景下的索引计算
   * @param row - 要删除的员工数据
   * @param index - 当前页面中的行索引
   */
  const handleDelete = async (row: DataRecord, index: number) => {
    const employeeRow = row as Employee

    try {
      // 模拟 API 删除请求（比如调用后端删除接口）
      loading.value = true
      await new Promise(resolve => setTimeout(resolve, 500))

      // 计算在完整数据中的实际索引
      const actualIndex = paginationEnabled.value
        ? (currentPage.value - 1) * defaultPageSize.value + index
        : index

      // 从数据源中删除
      tableData.value.splice(actualIndex, 1)

      console.log(`✅ 已删除员工: ${employeeRow.name}`, {
        pageIndex: index,
        actualIndex,
        remainingCount: tableData.value.length,
      })

      // 🎯 移除重复提示：组件内部已有"删除成功"提示，这里只处理业务逻辑

      // 🎯 处理分页边界情况：如果当前页没有数据了，回到上一页
      if (paginationEnabled.value && tableData.value.length > 0) {
        const maxPage = Math.ceil(
          tableData.value.length / defaultPageSize.value
        )
        if (currentPage.value > maxPage) {
          currentPage.value = Math.max(1, maxPage)
          // 延迟显示分页跳转提示，避免与删除成功提示冲突
          setTimeout(() => {
            message.info(`已自动跳转到第 ${currentPage.value} 页`)
          }, 1000)
        }
      }

      // 🎯 如果删除后数据为空，重置到第一页
      if (tableData.value.length === 0) {
        currentPage.value = 1
      }
    } catch (error) {
      console.error('💥 删除失败:', error)
      // 删除失败时的提示保留，因为组件内部只处理成功情况
      message.error('删除失败，请重试')
      throw error // 让组件知道删除失败，避免界面状态错误
    } finally {
      loading.value = false
    }
  }

  /**
   * @description 复制员工信息，在当前行后插入副本
   * @param row - 要复制的员工数据
   * @param index - 当前行索引
   */
  const handleCopy = (row: DataRecord, index: number) => {
    const employeeRow = row as Employee
    const newRow: Employee = {
      ...employeeRow,
      id: Date.now(),
      name: `${employeeRow.name}_副本`,
    }

    // 计算在完整数据中的实际索引
    const actualIndex = paginationEnabled.value
      ? (currentPage.value - 1) * defaultPageSize.value + index + 1
      : index + 1

    tableData.value.splice(actualIndex, 0, newRow)
    message.success('复制成功')
  }

  /**
   * @description 处理员工授权操作，显示授权配置对话框
   * @param row - 要授权的员工数据
   * @param index - 当前行索引
   */
  const handleAuthorize = (row: DataRecord) => {
    const employeeRow = row as Employee
    dialog.info({
      title: '员工授权',
      content: `正在为员工 "${employeeRow.name}" 配置系统权限...`,
      positiveText: '确定',
      onPositiveClick: () => {
        message.success('授权配置完成')
      },
    })
  }

  /**
   * @description 处理数据保存，支持行级和单元格级保存
   * @param rowData - 修改后的行数据
   * @param rowIndex - 行索引
   * @param columnKey - 列键（单元格编辑时有值）
   */
  const handleSave = async (
    rowData: Record<string, any>,
    rowIndex: number,
    columnKey?: string
  ): Promise<void> => {
    console.log('🎯 handleSave被调用:', { rowData, rowIndex, columnKey })
    loading.value = true

    try {
      // 模拟异步保存
      await new Promise(resolve => setTimeout(resolve, 500))

      if (pendingNewRowId.value && rowData.id === pendingNewRowId.value) {
        // 数据已经在列表中了，只需要更新和重置标记
        const actualIndex = paginationEnabled.value
          ? (currentPage.value - 1) * defaultPageSize.value + rowIndex
          : rowIndex

        // 确保ID类型一致
        const finalData = {
          ...rowData,
          id: rowData.id || Date.now(),
        } as Employee
        tableData.value[actualIndex] = finalData

        // 重置新增标记
        pendingNewRowId.value = null

        message.success('新员工信息保存成功')
      } else {
        // 编辑现有数据的逻辑保持不变
        const actualIndex = paginationEnabled.value
          ? (currentPage.value - 1) * defaultPageSize.value + rowIndex
          : rowIndex

        // 更新数据
        tableData.value[actualIndex] = { ...rowData } as Employee

        const columnTitle = tableColumns.value.find(
          (c: any) => c.key === columnKey
        )?.title

        const msg = columnKey ? `${columnTitle}已更新` : '员工信息保存成功'

        message.success(msg)
      }
    } catch (error) {
      console.error('💥 保存失败:', error)
      message.error('保存失败，请重试')
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * @description 处理编辑取消操作
   */
  const handleCancel = () => {
    if (pendingNewRowId.value) {
      // 模式取消：移除临时插入的数据
      const tempIndex = tableData.value.findIndex(
        item => item.id === pendingNewRowId.value
      )
      if (tempIndex !== -1) {
        tableData.value.splice(tempIndex, 1)
      }

      // 重置新增标记
      pendingNewRowId.value = null
      message.info('已取消新增')
    } else {
      // 编辑模式取消
      message.info('已取消编辑')
    }
  }
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
