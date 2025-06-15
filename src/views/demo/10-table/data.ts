import type { Employee, SelectOption } from '@/types/modules/table'
import { PRESET_RULES } from '@/utils/v_verify'

// ================= 编辑模式配置 =================
export const EDIT_MODES = [
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

// ================= 模式描述配置 =================
export const MODE_CONFIG = {
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

// ================= 数据映射 =================
export const DEPARTMENT_MAP = {
  tech: '技术部',
  hr: '人事部',
  market: '市场部',
  finance: '财务部',
} as const

export const STATUS_MAP = {
  active: '在职',
  inactive: '离职',
  probation: '试用期',
} as const

// ================= 选项配置 =================
export const departmentOptions: SelectOption[] = Object.entries(
  DEPARTMENT_MAP
).map(([value, label]) => ({ label, value }))

export const statusOptions: SelectOption[] = Object.entries(STATUS_MAP).map(
  ([value, label]) => ({ label, value })
)

// ================= 初始数据 =================
export const initialTableData: Employee[] = [
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
]

// ================= 表格列配置 =================
export const getTableColumns = () => [
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
    render: (row: any) => (row.gender === 'male' ? '男' : '女'),
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
    render: (row: any) =>
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
    render: (row: any) =>
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
    render: (row: any) =>
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
    render: (row: any) => {
      const desc = row.description || ''
      return desc.length > 30 ? desc.substring(0, 30) + '...' : desc
    },
    required: false,
  },
]

// ================= 表格行操作配置 =================
export const getTableRowActions = (
  message: any,
  dialog: any,
  tableData: any
) => [
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
    onClick: (row: any, index: number) => {
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
    onClick: (row: any, index: number) => {
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

// ================= 工具函数 =================
export const createNewEmployee = (): Employee => ({
  id: Date.now(),
  name: '',
  age: 25,
  gender: 'male',
  email: '',
  department: 'tech',
  joinDate: Date.now(),
  status: 'probation',
  description: '',
})
