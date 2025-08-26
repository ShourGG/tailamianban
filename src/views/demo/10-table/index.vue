<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-13 18:38:58
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-08-26 13:48:06
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
          class="controls-section"
        >
          <div class="controls-row">
            <!-- 编辑模式选择组 -->
            <div class="mode-selection">
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
            </div>

            <div class="elegant-divider"></div>

            <!-- 添加新行按钮 -->
            <NButton
              @click="addNewRow"
              type="primary"
              :disabled="editMode === 'none'"
              class="action-button"
              size="medium"
            >
              <template #icon>
                <C_Icon name="mdi:plus" />
              </template>
              添加新行
            </NButton>

            <div class="elegant-divider"></div>

            <!-- 分页状态信息 -->
            <div class="pagination-status">
              <span class="status-label">分页状态：</span>
              <NSwitch
                v-model:value="paginationEnabled"
                size="medium"
              >
                <template #checked> 开启 </template>
                <template #unchecked> 关闭 </template>
              </NSwitch>
            </div>
          </div>
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
    getTableColumns,
    createNewEmployee,
    type Employee,
  } from './data'
  import { getEmployeesListApi, deleteEmployeeApi } from '@/api/auth'

  // ================= 组合式函数 =================
  const message = useMessage()
  const dialog = useDialog()

  // ================= 响应式状态 =================
  const loading = ref(false)
  const tableRef = ref()
  const editMode = ref<EditMode>('modal')
  const tableData = ref<Employee[]>([])

  // 分页相关状态
  const paginationEnabled = ref(true)
  const defaultPageSize = ref(10)
  const currentPage = ref(1)

  // 新增行ID追踪（用于区分新增和编辑）
  const pendingNewRowId = ref<number | null>(null)

  // ================= 计算属性 =================
  const currentModeConfig = computed(() => MODE_CONFIG[editMode.value])
  const tableColumns = computed(() => getTableColumns())

  // 分页配置
  const paginationConfig = computed((): PaginationConfig | boolean => {
    if (!paginationEnabled.value) return false

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

  // 表格操作配置
  const tableActions = computed(() => ({
    delete: {
      onDelete: handleDelete,
      confirmText: (row: DataRecord) => {
        const employee = row as Employee
        return `确定要删除员工 "${employee.name}" 吗？此操作不可撤销！`
      },
    },
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

  // ================= 事件处理 =================

  /**
   * 处理分页变化事件
   */
  const handlePaginationChange = (...args: unknown[]) => {
    const [page, pageSize] = args as [number, number]

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

  /**
   * 添加新行
   */
  const addNewRow = () => {
    const newRow = createNewEmployee()

    if (editMode.value === 'modal') {
      pendingNewRowId.value = newRow.id
      tableData.value.unshift(newRow)

      // 跳转到第一页
      if (paginationEnabled.value && currentPage.value !== 1) {
        currentPage.value = 1
      }

      // 开始编辑
      nextTick(() => {
        tableRef.value?.startEdit(newRow.id)
      })

      message.info('请填写新员工信息后保存')
    } else {
      // 其他编辑模式
      tableData.value.unshift(newRow)

      if (paginationEnabled.value && currentPage.value !== 1) {
        currentPage.value = 1
      }

      nextTick(() => {
        if (['row', 'both'].includes(editMode.value)) {
          tableRef.value?.startEdit(newRow.id)
        }
      })
    }
  }

  /**
   * 处理删除操作
   */
  const handleDelete = async (row: DataRecord) => {
    const employee = row as Employee

    try {
      loading.value = true
      await deleteEmployeeApi(employee.id)

      // 成功后更新本地列表
      tableData.value = tableData.value.filter(emp => emp.id !== employee.id)
      message.success(`员工 "${employee.name}" 删除成功`)
    } catch (error) {
      console.error('删除失败:', error)
      message.error('删除失败，请重试')
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 复制员工
   */
  const handleCopy = (row: DataRecord, index: number) => {
    const employee = row as Employee
    const newRow: Employee = {
      ...employee,
      id: Date.now(),
      name: `${employee.name}_副本`,
    }

    // 计算实际插入位置
    const actualIndex = paginationEnabled.value
      ? (currentPage.value - 1) * defaultPageSize.value + index + 1
      : index + 1

    tableData.value.splice(actualIndex, 0, newRow)
    message.success('复制成功')
  }

  /**
   * 处理员工授权
   */
  const handleAuthorize = (row: DataRecord) => {
    const employee = row as Employee
    dialog.info({
      title: '员工授权',
      content: `正在为员工 "${employee.name}" 配置系统权限...`,
      positiveText: '确定',
      onPositiveClick: () => {
        message.success('授权配置完成')
      },
    })
  }

  /**
   * 处理数据保存
   */
  const handleSave = async (
    rowData: Record<string, any>,
    rowIndex: number,
    columnKey?: string
  ): Promise<void> => {
    loading.value = true

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))

      // 计算实际索引
      const actualIndex = paginationEnabled.value
        ? (currentPage.value - 1) * defaultPageSize.value + rowIndex
        : rowIndex

      // 更新数据
      tableData.value[actualIndex] = { ...rowData } as Employee

      // 如果是新增的行，清除标记
      if (pendingNewRowId.value && rowData.id === pendingNewRowId.value) {
        pendingNewRowId.value = null
        message.success('新员工信息保存成功')
      } else {
        const columnTitle = columnKey
          ? tableColumns.value.find((c: any) => c.key === columnKey)?.title
          : null
        message.success(
          columnTitle ? `${columnTitle}已更新` : '员工信息保存成功'
        )
      }
    } catch (error) {
      console.error('保存失败:', error)
      message.error('保存失败，请重试')
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 处理编辑取消
   */
  const handleCancel = () => {
    if (pendingNewRowId.value) {
      // 移除临时数据
      const tempIndex = tableData.value.findIndex(
        item => item.id === pendingNewRowId.value
      )
      if (tempIndex !== -1) {
        tableData.value.splice(tempIndex, 1)
      }
      pendingNewRowId.value = null
      message.info('已取消新增')
    } else {
      message.info('已取消编辑')
    }
  }

  /**
   * 加载员工数据
   */
  const loadEmployeesData = async () => {
    try {
      loading.value = true
      const response = await getEmployeesListApi()

      // 直接使用API数据，无需适配
      tableData.value = response.data?.list || []

      message.success(`已加载 ${tableData.value.length} 条员工记录`)
    } catch (error) {
      console.error('加载数据失败:', error)
      message.error('加载数据失败，请重试')
      tableData.value = []
    } finally {
      loading.value = false
    }
  }

  // ================= 生命周期 =================
  onMounted(() => {
    loadEmployeesData()
  })
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
