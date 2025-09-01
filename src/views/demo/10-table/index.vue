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

    <!-- 使用 c_detail 详情组件 -->
    <c_detail
      v-model:visible="detailModalVisible"
      :data="currentEmployee || {}"
      :config="detailConfig"
      :title="detailModalTitle"
      :loading="loading"
      @close="handleDetailClose"
    />
  </div>
</template>

<script setup lang="ts">
  import type {
    EditMode,
    DataRecord,
    PaginationConfig,
  } from '@/types/modules/table'
  import type { DetailConfig } from '@/components/local/c_detail/data'
  import {
    EDIT_MODES,
    MODE_CONFIG,
    getTableColumns,
    createNewEmployee,
    DEPARTMENT_MAP,
    STATUS_MAP,
    type Employee,
  } from './data'
  import {
    getEmployeesListApi,
    deleteEmployeeApi,
    updateEmployeeApi,
    getEmployeeByIdApi,
  } from '@/api/10-table'

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

  // 新增行ID追踪
  const pendingNewRowId = ref<number | null>(null)

  // 详情弹框状态
  const detailModalVisible = ref(false)
  const detailModalTitle = ref('')
  const currentEmployee = ref<Employee | null>(null)

  // ================= 工具函数 =================
  const getDepartmentName = (department: string): string => {
    return (
      DEPARTMENT_MAP[department as keyof typeof DEPARTMENT_MAP] || department
    )
  }

  const getStatusName = (status: string): string => {
    return STATUS_MAP[status as keyof typeof STATUS_MAP] || status
  }

  const getGenderDisplay = (gender: string): string => {
    return gender === 'male' ? '男' : gender === 'female' ? '女' : gender
  }

  // ================= 详情配置 =================
  const detailConfig: DetailConfig = {
    sections: [
      {
        title: '基本信息',
        columns: 2,
        items: [
          { label: '员工ID', key: 'id', type: 'number' },
          { label: '姓名', key: 'name', type: 'text' },
          {
            label: '年龄',
            key: 'age',
            type: 'number',
            formatter: (val: number): string => `${val}岁`,
          },
          {
            label: '性别',
            key: 'gender',
            type: 'tag',
            tagType: 'info',
            formatter: (val: string): string => getGenderDisplay(val),
          },
        ],
      },
      {
        title: '工作信息',
        columns: 2,
        items: [
          {
            label: '部门',
            key: 'department',
            type: 'tag',
            tagType: 'success',
            formatter: (val: string): string => getDepartmentName(val),
          },
          {
            label: '状态',
            key: 'status',
            type: 'tag',
            tagType: 'success',
            formatter: (val: string): string => getStatusName(val),
          },
          { label: '入职日期', key: 'joinDate', type: 'date' },
          { label: '邮箱', key: 'email', type: 'email' },
        ],
      },
      {
        title: '其他信息',
        columns: 1,
        items: [
          {
            label: '描述',
            key: 'description',
            type: 'text',
            span: 2,
            formatter: (val: string | undefined): string =>
              val || '暂无描述信息',
          },
        ],
      },
    ],
  }

  // ================= 计算属性 =================
  const currentModeConfig = computed(() => MODE_CONFIG[editMode.value])
  const tableColumns = computed(() => getTableColumns())

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

  const tableActions = computed(() => ({
    detail: {
      onView: async (row: DataRecord): Promise<void> => {
        const employee = row as Employee
        try {
          loading.value = true
          const response = await getEmployeeByIdApi(employee.id)
          currentEmployee.value = response.data as Employee
          detailModalTitle.value = `员工详情 - ${response.data.name}`
          detailModalVisible.value = true
        } catch (error) {
          console.error('获取员工详情失败:', error)
          message.error('获取员工详情失败，请重试')
        } finally {
          loading.value = false
        }
      },
    },
    delete: {
      onDelete: handleDelete,
      confirmText: (row: DataRecord): string => {
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
  // 修正分页处理函数，使其兼容未知参数
  const handlePaginationChange = (...args: unknown[]): void => {
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

  const addNewRow = (): void => {
    const newRow = createNewEmployee()
    if (editMode.value === 'modal') {
      pendingNewRowId.value = newRow.id
      tableData.value.unshift(newRow)
      if (paginationEnabled.value && currentPage.value !== 1) {
        currentPage.value = 1
      }
      nextTick(() => {
        tableRef.value?.startEdit(newRow.id)
      })
      message.info('请填写新员工信息后保存')
    } else {
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

  const handleDelete = async (row: DataRecord): Promise<void> => {
    const employee = row as Employee
    try {
      loading.value = true
      await deleteEmployeeApi(employee.id)
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

  const handleCopy = (row: DataRecord, index: number): void => {
    const employee = row as Employee
    const newRow: Employee = {
      ...employee,
      id: Date.now(),
      name: `${employee.name}_副本`,
    }
    const actualIndex = paginationEnabled.value
      ? (currentPage.value - 1) * defaultPageSize.value + index + 1
      : index + 1
    tableData.value.splice(actualIndex, 0, newRow)
    message.success('复制成功')
  }

  const handleAuthorize = (row: DataRecord): void => {
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

  const handleSave = async (
    rowData: Record<string, unknown>,
    rowIndex: number,
    columnKey?: string
  ): Promise<void> => {
    loading.value = true
    try {
      const actualIndex = paginationEnabled.value
        ? (currentPage.value - 1) * defaultPageSize.value + rowIndex
        : rowIndex

      if (
        pendingNewRowId.value &&
        (rowData as Employee).id === pendingNewRowId.value
      ) {
        tableData.value[actualIndex] = { ...rowData } as Employee
        pendingNewRowId.value = null
        message.success('新员工信息保存成功')
      } else {
        const employee = rowData as Employee
        await updateEmployeeApi(employee.id, employee)
        tableData.value[actualIndex] = { ...rowData } as Employee
        const column = tableColumns.value.find(
          (c: { key: string; title: string }) => c.key === columnKey
        )
        const columnTitle = column?.title
        message.success(
          columnTitle ? `${columnTitle}已更新` : '员工信息更新成功'
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

  const handleCancel = (): void => {
    if (pendingNewRowId.value) {
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

  const handleDetailClose = (): void => {
    currentEmployee.value = null
    detailModalTitle.value = ''
  }

  const loadEmployeesData = async (): Promise<void> => {
    try {
      loading.value = true
      const response = await getEmployeesListApi()
      tableData.value = (response.data?.list || []) as Employee[]
      message.success(`已加载 ${tableData.value.length} 条员工记录`)
    } catch (error) {
      console.error('加载数据失败:', error)
      message.error('加载数据失败，请重试')
      tableData.value = []
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    loadEmployeesData()
  })
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
