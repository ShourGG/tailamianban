<template>
  <div class="table-demo-page">
    <NH1>表格选择器组件场景示例</NH1>
    <NCard>
      <NSpace
        vertical
        :size="20"
      >
        <!-- 功能说明 -->
        <NAlert
          type="success"
          title="功能说明"
        >
          <ul class="list-disc list-inside space-y-1">
            <li
              ><strong>行内编辑：</strong
              >点击右侧"编辑"按钮，整行变为可编辑状态</li
            >
            <li
              ><strong>单元格编辑：</strong
              >悬停单元格显示编辑图标，点击编辑单个字段</li
            >
            <li><strong>混合模式：</strong>同时支持行内编辑和单元格编辑</li>
            <li
              ><strong>模态框编辑：</strong>🎯
              使用模态框表单，完整的验证系统</li
            >
            <li><strong>禁用编辑：</strong>完全禁用所有编辑功能，表格只读</li>
            <li><strong>查看功能：</strong>查看模态框展示详细信息</li>
            <li
              ><strong>🎯 验证系统：</strong>完整的 v_verify
              验证，包括必填、长度、格式等验证</li
            >
          </ul>
        </NAlert>

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
                  <NIcon><i :class="mode.icon" /></NIcon>
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
                <NIcon><i class="i-mdi:plus" /></NIcon>
              </template>
              添加新行
            </NButton>
          </NSpace>
        </NCard>

        <!-- 当前模式说明 -->
        <NAlert
          :type="currentModeConfig.alertType"
          :title="currentModeConfig.title"
        >
          {{ currentModeConfig.description }}
        </NAlert>

        <!-- 验证规则说明 -->
        <NCard
          v-if="editMode === 'modal'"
          title="验证规则说明"
          size="small"
        >
          <NSpace
            vertical
            :size="8"
          >
            <div
              v-for="rule in VALIDATION_RULES"
              :key="rule.field"
            >
              <strong>{{ rule.field }}：</strong>{{ rule.description }}
            </div>
            <div class="text-sm text-blue-500 mt-2">
              ✨ 使用 v_verify 验证系统，自动处理表单验证、防抖、加载状态
            </div>
          </NSpace>
        </NCard>

        <!-- 表格组件 -->
        <C_Table
          ref="tableRef"
          v-model:data="tableData"
          :columns="tableColumns"
          :loading="loading"
          :row-actions="tableRowActions"
          :edit-mode="editMode"
          :editable="editMode !== 'none'"
          modal-title="编辑员工信息"
          :modal-width="700"
          @save="onSaveHandler"
          @cancel="handleCancel"
        />
      </NSpace>
    </NCard>
  </div>
</template>

<script setup lang="ts">
  import type {
    TableColumn,
    RowAction,
    EditMode,
    Employee,
    SelectOption,
  } from '@/types/modules/table'
  import { PRESET_RULES } from '@/utils/v_verify'

  // ================= 组合式函数 =================

  const message = useMessage()
  const dialog = useDialog()

  // ================= 响应式状态 =================

  const loading = ref(false)
  const tableRef = ref()
  const editMode = ref<EditMode>('modal')

  // ================= 常量配置 =================

  // 编辑模式配置
  const EDIT_MODES = [
    { value: 'row' as const, label: '仅行编辑', icon: 'i-mdi:table-row' },
    { value: 'cell' as const, label: '仅单元格编辑', icon: 'i-mdi:table-cell' },
    { value: 'both' as const, label: '混合模式', icon: 'i-mdi:table-edit' },
    {
      value: 'modal' as const,
      label: '模态框编辑 🎯',
      icon: 'i-mdi:window-maximize',
    },
    { value: 'none' as const, label: '禁用编辑', icon: 'i-mdi:lock' },
  ]

  // 模式描述配置
  const MODE_CONFIG = {
    row: {
      title: '行内编辑模式',
      description:
        '点击右侧操作列的"编辑"按钮，整行进入编辑状态。适合需要同时编辑多个字段的场景。',
      alertType: 'success' as const,
    },
    cell: {
      title: '单元格编辑模式',
      description:
        '鼠标悬停在单元格上会显示编辑图标，点击编辑图标进入编辑状态。适合快速修改单个字段。',
      alertType: 'info' as const,
    },
    both: {
      title: '混合编辑模式',
      description: '同时支持行编辑和单元格编辑两种方式。提供最大的编辑灵活性。',
      alertType: 'warning' as const,
    },
    modal: {
      title: '模态框编辑模式 🎯',
      description:
        '使用模态框表单进行编辑，表单验证、防抖、加载状态、错误处理全部自动化。代码简洁，功能强大。',
      alertType: 'success' as const,
    },
    none: {
      title: '只读模式',
      description: '所有编辑功能均被禁用，表格处于只读状态。',
      alertType: 'error' as const,
    },
  }

  // 验证规则说明
  const VALIDATION_RULES = [
    { field: '姓名', description: '必填，长度2-20位' },
    { field: '年龄', description: '必填，范围18-65' },
    { field: '性别', description: '必填' },
    { field: '邮箱', description: '必填，邮箱格式验证' },
    { field: '部门', description: '必填' },
    { field: '入职日期', description: '必填' },
    { field: '状态', description: '可选' },
    { field: '描述', description: '可选，最大长度200字符' },
  ]

  // 数据映射
  const DEPARTMENT_MAP = {
    tech: '技术部',
    hr: '人事部',
    market: '市场部',
    finance: '财务部',
  } as const

  const STATUS_MAP = {
    active: '在职',
    inactive: '离职',
    probation: '试用期',
  } as const

  // ================= 计算属性 =================

  const currentModeConfig = computed(() => MODE_CONFIG[editMode.value])

  // 选项配置
  const departmentOptions: SelectOption[] = Object.entries(DEPARTMENT_MAP).map(
    ([value, label]) => ({
      label,
      value,
    })
  )

  const statusOptions: SelectOption[] = Object.entries(STATUS_MAP).map(
    ([value, label]) => ({
      label,
      value,
    })
  )

  // ================= 数据定义 =================

  // 模拟员工数据
  const tableData = ref<Employee[]>([
    {
      id: 1,
      name: '张三',
      age: 28,
      gender: 'male',
      email: 'zhangsan@example.com',
      department: 'tech',
      joinDate: new Date('2022-01-15').getTime(),
      status: 'active',
      description: '优秀的前端开发工程师，擅长Vue.js和React开发',
    },
    {
      id: 2,
      name: '李四',
      age: 32,
      gender: 'female',
      email: 'lisi@example.com',
      department: 'hr',
      joinDate: new Date('2021-06-20').getTime(),
      status: 'active',
      description: '资深人力资源专员，负责员工招聘和培训工作',
    },
    {
      id: 3,
      name: '王五',
      age: 25,
      gender: 'male',
      email: 'wangwu@example.com',
      department: 'tech',
      joinDate: new Date('2023-03-10').getTime(),
      status: 'active',
      description: '后端开发工程师，精通Java和Spring框架',
    },
  ])

  // 列配置 - 使用computed来确保类型正确
  const tableColumns = computed(() => {
    const cols: TableColumn<Employee>[] = [
      {
        key: 'name',
        title: '姓名',
        width: 120,
        editable: true,
        required: true,
        editProps: { rules: [PRESET_RULES.length('姓名', 2, 20)] },
      },
      {
        key: 'age',
        title: '年龄',
        width: 100,
        editable: true,
        editType: 'number',
        editProps: { min: 18, max: 65, step: 1, showButton: false },
        required: true,
      },
      {
        key: 'gender',
        title: '性别',
        width: 100,
        editable: true,
        editType: 'select',
        editProps: {
          options: [
            { label: '男', value: 'male' },
            { label: '女', value: 'female' },
          ],
        },
        render: (row: Employee) => (row.gender === 'male' ? '男' : '女'),
        required: true,
      },
      {
        key: 'email',
        title: '邮箱',
        width: 200,
        editable: true,
        required: true,
      },
      {
        key: 'department',
        title: '部门',
        width: 120,
        editable: true,
        editType: 'select',
        editProps: { options: departmentOptions },
        render: (row: Employee) =>
          DEPARTMENT_MAP[row.department as keyof typeof DEPARTMENT_MAP] ||
          row.department,
        required: true,
      },
      {
        key: 'joinDate',
        title: '入职日期',
        width: 140,
        editable: true,
        editType: 'date',
        editProps: {
          type: 'date',
          format: 'yyyy-MM-dd',
          valueFormat: 'timestamp',
        },
        render: (row: Employee) =>
          row.joinDate ? new Date(row.joinDate).toLocaleDateString() : '-',
        required: true,
      },
      {
        key: 'status',
        title: '状态',
        width: 100,
        editable: true,
        editType: 'select',
        editProps: { options: statusOptions },
        render: (row: Employee) =>
          STATUS_MAP[row.status as keyof typeof STATUS_MAP] || row.status,
        required: false,
      },
      {
        key: 'description',
        title: '描述',
        width: 200,
        editable: true,
        editProps: {
          type: 'textarea',
          rows: 3,
          placeholder: '请输入员工描述信息',
          rules: [PRESET_RULES.length('描述', 0, 200)],
        },
        render: (row: Employee) => {
          const desc = row.description || ''
          return desc.length > 30 ? desc.substring(0, 30) + '...' : desc
        },
        required: false,
      },
    ]
    return cols as any
  })

  // 行操作配置 - 使用computed来确保类型正确
  const tableRowActions = computed(() => {
    const actions: RowAction<Employee>[] = [
      {
        label: '查看',
        icon: 'i-mdi:eye',
        type: 'info',
        onClick: () => {}, // 由表格组件内部处理
      },
      {
        label: '复制',
        icon: 'i-mdi:content-copy',
        type: 'default',
        onClick: (row: Employee, index: number) => {
          const newRow: Employee = {
            ...row,
            id: Date.now(),
            name: `${row.name}_副本`,
          }
          tableData.value.splice(index + 1, 0, newRow)
          message.success('复制成功')
        },
      },
      {
        label: '删除',
        icon: 'i-mdi:delete',
        type: 'error',
        onClick: (row: Employee, index: number) => {
          dialog.warning({
            title: '确认删除',
            content: `确定要删除员工"${row.name}"吗？`,
            positiveText: '确定',
            negativeText: '取消',
            onPositiveClick: () => {
              tableData.value.splice(index, 1)
              message.success('删除成功')
            },
          })
        },
      },
    ]
    return actions as any
  })

  // ================= 业务逻辑 =================

  // 添加新行
  const addNewRow = () => {
    const newRow: Employee = {
      id: Date.now(),
      name: '',
      age: 25,
      gender: 'male',
      email: '',
      department: 'tech',
      joinDate: Date.now(),
      status: 'probation',
      description: '',
    }
    tableData.value.unshift(newRow)

    // 根据编辑模式自动开始编辑
    setTimeout(() => {
      if (['modal', 'row', 'both'].includes(editMode.value)) {
        tableRef.value?.startEdit(newRow.id)
      }
    }, 100)
  }

  // 保存处理 - 使用中间函数处理类型
  const onSaveHandler = async (
    rowData: any,
    rowIndex: number,
    columnKey?: string
  ) => {
    return handleSave(rowData, rowIndex, columnKey)
  }

  // 实际的保存逻辑
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

      // 更新数据
      tableData.value[rowIndex] = { ...rowData } as Employee

      const columnTitle = tableColumns.value.find(
        (c: TableColumn) => c.key === columnKey
      )?.title

      const msg = columnKey ? `${columnTitle}已更新` : '员工信息保存成功'

      message.success(msg)
    } catch (error) {
      console.error('💥 保存失败:', error)
      message.error('保存失败，请重试')
      throw error
    } finally {
      loading.value = false
    }
  }

  // 取消处理
  const handleCancel = () => {
    message.info('已取消编辑')
  }
</script>

<style scoped>
  .table-demo-page {
    padding: 20px;
  }

  .list-disc {
    list-style-type: disc;
  }

  .list-inside {
    list-style-position: inside;
  }

  .space-y-1 > * + * {
    margin-top: 0.25rem;
  }

  :deep(.n-radio-button__label) {
    display: flex;
    align-items: center;
    gap: 4px;
  }
</style>
