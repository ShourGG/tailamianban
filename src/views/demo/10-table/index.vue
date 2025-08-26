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

    <!-- 员工详情弹框 -->
    <NModal
      v-model:show="detailModalVisible"
      :mask-closable="true"
      preset="card"
      :title="detailModalTitle"
      class="detail-modal"
      :style="{ width: '600px' }"
    >
      <div
        class="employee-detail"
        v-if="currentEmployee"
      >
        <!-- 左右布局：基本信息 + 工作信息 -->
        <div class="detail-row">
          <div class="detail-column">
            <h4 class="section-title">基本信息</h4>
            <div class="info-item">
              <span class="label">员工ID:</span>
              <span class="value">{{ currentEmployee.id }}</span>
            </div>
            <div class="info-item">
              <span class="label">姓名:</span>
              <span class="value">{{ currentEmployee.name }}</span>
            </div>
            <div class="info-item">
              <span class="label">年龄:</span>
              <span class="value">{{ currentEmployee.age }}岁</span>
            </div>
            <div class="info-item">
              <span class="label">性别:</span>
              <NTag
                :type="currentEmployee.gender === 'male' ? 'info' : 'warning'"
                size="small"
              >
                {{ getGenderDisplay(currentEmployee.gender) }}
              </NTag>
            </div>
          </div>

          <div class="detail-column">
            <h4 class="section-title">工作信息</h4>
            <div class="info-item">
              <span class="label">部门:</span>
              <NTag
                type="success"
                size="small"
              >
                {{ getDepartmentName(currentEmployee.department) }}
              </NTag>
            </div>
            <div class="info-item">
              <span class="label">状态:</span>
              <NTag
                :type="
                  currentEmployee.status === 'active' ? 'success' : 'error'
                "
                size="small"
              >
                {{ getStatusName(currentEmployee.status) }}
              </NTag>
            </div>
            <div class="info-item">
              <span class="label">入职日期:</span>
              <span class="value">{{
                formatDate(currentEmployee.joinDate)
              }}</span>
            </div>
            <div class="info-item">
              <span class="label">邮箱:</span>
              <span class="value email">{{ currentEmployee.email }}</span>
            </div>
          </div>
        </div>

        <!-- 描述信息（全宽） -->
        <div class="description-section">
          <h4 class="section-title">描述信息</h4>
          <div class="description-content">
            {{ currentEmployee.description || '暂无描述信息' }}
          </div>
        </div>
      </div>

      <template #action>
        <NButton
          @click="detailModalVisible = false"
          type="primary"
        >
          关闭
        </NButton>
      </template>
    </NModal>
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
    DEPARTMENT_MAP,
    STATUS_MAP,
    type Employee,
  } from './data'
  import {
    getEmployeesListApi,
    deleteEmployeeApi,
    updateEmployeeApi,
    getEmployeeByIdApi,
  } from '@/api/auth'

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
  // 统一的日期格式化函数，支持 string 和 number 类型
  const formatDate = (date: string | number) => {
    const dateObj = typeof date === 'string' ? new Date(date) : new Date(date)
    return dateObj.toLocaleDateString('zh-CN')
  }

  // 获取部门名称
  const getDepartmentName = (department: string) => {
    return (
      DEPARTMENT_MAP[department as keyof typeof DEPARTMENT_MAP] || department
    )
  }

  // 获取状态名称
  const getStatusName = (status: string) => {
    return STATUS_MAP[status as keyof typeof STATUS_MAP] || status
  }

  // 获取性别显示文本
  const getGenderDisplay = (gender: string) => {
    return gender === 'male' ? '男' : gender === 'female' ? '女' : gender
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
      onView: async (row: DataRecord) => {
        const employee = row as Employee
        try {
          loading.value = true
          const response = await getEmployeeByIdApi(employee.id)
          // 确保类型一致
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

  const addNewRow = () => {
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

  const handleDelete = async (row: DataRecord) => {
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

  const handleCopy = (row: DataRecord, index: number) => {
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

  const handleSave = async (
    rowData: Record<string, any>,
    rowIndex: number,
    columnKey?: string
  ): Promise<void> => {
    loading.value = true
    try {
      const actualIndex = paginationEnabled.value
        ? (currentPage.value - 1) * defaultPageSize.value + rowIndex
        : rowIndex

      if (pendingNewRowId.value && rowData.id === pendingNewRowId.value) {
        tableData.value[actualIndex] = { ...rowData } as Employee
        pendingNewRowId.value = null
        message.success('新员工信息保存成功')
      } else {
        const employee = rowData as Employee
        await updateEmployeeApi(employee.id, employee)
        tableData.value[actualIndex] = { ...rowData } as Employee
        const columnTitle = columnKey
          ? tableColumns.value.find((c: any) => c.key === columnKey)?.title
          : null
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

  const handleCancel = () => {
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

  const loadEmployeesData = async () => {
    try {
      loading.value = true
      const response = await getEmployeesListApi()
      // 确保类型一致
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
