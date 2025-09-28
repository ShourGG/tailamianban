import type {
  SelectOption,
  EditType,
  TableColumn,
  DataRecord,
  EditMode,
} from '@/types/modules/table'
import { PRESET_RULES } from '@/utils/v_verify'

// ================= 业务类型定义 =================
export interface Employee extends DataRecord {
  id: number
  name: string
  age: number
  gender: 'male' | 'female'
  email: string
  department: 'tech' | 'hr' | 'market' | 'finance'
  joinDate: number
  status: 'active' | 'inactive' | 'probation'
  description?: string
}

// ================= 编辑模式配置 =================
export const EDIT_MODES: Array<{
  value: EditMode
  label: string
  icon: string
}> = [
  { value: 'row', label: '仅行编辑', icon: 'mdi:table-row' },
  { value: 'cell', label: '仅单元格编辑', icon: 'mdi:table-cell' },
  { value: 'both', label: '混合模式', icon: 'mdi:table-edit' },
  { value: 'modal', label: '模态框编辑', icon: 'mdi:window-maximize' },
  { value: 'none', label: '禁用编辑', icon: 'mdi:lock' },
]

export const MODE_CONFIG: Record<
  EditMode,
  {
    title: string
    description: string
    alertType: 'success' | 'info' | 'warning' | 'error'
  }
> = {
  row: {
    title: '行内编辑模式',
    description:
      '点击右侧操作列的"编辑"按钮，整行进入编辑状态。适合需要同时编辑多个字段的场景。',
    alertType: 'success',
  },
  cell: {
    title: '单元格编辑模式',
    description:
      '鼠标悬停在单元格上会显示编辑图标，点击编辑图标进入编辑状态。适合快速修改单个字段。',
    alertType: 'info',
  },
  both: {
    title: '混合编辑模式',
    description: '同时支持行编辑和单元格编辑两种方式。提供最大的编辑灵活性。',
    alertType: 'warning',
  },
  modal: {
    title: '模态框编辑模式',
    description:
      '使用模态框表单进行编辑，表单验证、防抖、加载状态、错误处理全部自动化。代码简洁，功能强大。',
    alertType: 'success',
  },
  none: {
    title: '只读模式',
    description: '所有编辑功能均被禁用，表格处于只读状态。',
    alertType: 'error',
  },
}

// ================= 选项配置 =================
const departmentOptions: SelectOption[] = [
  { label: '技术部', value: 'tech' },
  { label: '人事部', value: 'hr' },
  { label: '市场部', value: 'market' },
  { label: '财务部', value: 'finance' },
]

const statusOptions: SelectOption[] = [
  { label: '在职', value: 'active' },
  { label: '离职', value: 'inactive' },
  { label: '试用期', value: 'probation' },
]

const genderOptions: SelectOption[] = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
]

// ================= 简化的格式化函数 =================
const formatGender = (gender: string): string =>
  gender === 'male' ? '男' : gender === 'female' ? '女' : gender

const formatDate = (timestamp: number): string =>
  timestamp ? new Date(timestamp).toLocaleDateString() : '-'

const formatDepartment = (department: string): string => {
  const map: Record<string, string> = {
    tech: '技术部',
    hr: '人事部',
    market: '市场部',
    finance: '财务部',
  }
  return map[department] || department
}

const formatStatus = (status: string): string => {
  const map: Record<string, string> = {
    active: '在职',
    inactive: '离职',
    probation: '试用期',
  }
  return map[status] || status
}

const formatDescription = (desc?: string): string =>
  desc ? (desc.length > 30 ? desc.substring(0, 30) + '...' : desc) : '暂无描述'

// ================= 表格列配置 =================
export const getTableColumns = (): TableColumn<Employee>[] => [
  {
    key: 'name',
    title: '姓名',
    width: 120,
    editable: true,
    required: true,
    editType: 'input' as EditType,
    editProps: {
      rules: [PRESET_RULES.length('姓名', 2, 20)],
      placeholder: '请输入姓名',
    },
  },
  {
    key: 'age',
    title: '年龄',
    width: 100,
    editable: true,
    required: true,
    editType: 'number' as EditType,
    editProps: {
      min: 18,
      max: 65,
      step: 1,
      showButton: false,
      placeholder: '请输入年龄',
    },
  },
  {
    key: 'gender',
    title: '性别',
    width: 100,
    editable: true,
    required: true,
    editType: 'select' as EditType,
    editProps: {
      options: genderOptions,
      placeholder: '请选择性别',
    },
    render: (row: Employee) => formatGender(row.gender),
  },
  {
    key: 'email',
    title: '邮箱',
    width: 200,
    editable: true,
    required: true,
    editType: 'email' as EditType,
    editProps: {
      rules: [PRESET_RULES.email('邮箱')],
      placeholder: '请输入邮箱地址',
    },
  },
  {
    key: 'department',
    title: '部门',
    width: 120,
    editable: true,
    required: true,
    editType: 'select' as EditType,
    editProps: {
      options: departmentOptions,
      placeholder: '请选择部门',
    },
    render: (row: Employee) => formatDepartment(row.department),
  },
  {
    key: 'joinDate',
    title: '入职日期',
    width: 140,
    editable: true,
    required: true,
    editType: 'date' as EditType,
    editProps: {
      type: 'date',
      format: 'yyyy-MM-dd',
      valueFormat: 'timestamp',
      placeholder: '请选择入职日期',
    },
    render: (row: Employee) => formatDate(row.joinDate),
  },
  {
    key: 'status',
    title: '状态',
    width: 100,
    editable: true,
    required: false,
    editType: 'select' as EditType,
    editProps: {
      options: statusOptions,
      placeholder: '请选择状态',
    },
    render: (row: Employee) => formatStatus(row.status),
  },
  {
    key: 'description',
    title: '描述',
    width: 200,
    editable: true,
    required: false,
    editType: 'textarea' as EditType,
    editProps: {
      type: 'textarea',
      rows: 3,
      placeholder: '请输入员工描述信息',
      rules: [PRESET_RULES.length('描述', 0, 200)],
    },
    render: (row: Employee) => formatDescription(row.description),
  },
]

// ================= 工具函数 =================
export const createNewEmployee = (): Employee => ({
  id: Date.now(),
  name: `新员工_${Math.floor(Math.random() * 1000)}`,
  age: 25,
  gender: 'male',
  email: `user${Date.now()}@example.com`,
  department: 'tech',
  joinDate: Date.now(),
  status: 'probation',
  description: '新入职员工，待完善信息',
})
