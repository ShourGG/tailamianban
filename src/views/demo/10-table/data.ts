import type {
  SelectOption,
  EditType,
  TableColumn,
  DataRecord,
} from '@/types/modules/table'
import { PRESET_RULES } from '@/utils/v_verify'

// ================= 业务类型定义 =================

/**
 * @description 员工数据接口
 */
export interface Employee extends DataRecord {
  id: number
  name: string
  age: number
  gender: 'male' | 'female'
  email: string
  department: string
  joinDate: number
  status: string
  description?: string
}

// ================= 编辑模式配置 =================

/**
 * @description 表格编辑模式配置数组
 */
export const EDIT_MODES = [
  { value: 'row' as const, label: '仅行编辑', icon: 'mdi:table-row' },
  { value: 'cell' as const, label: '仅单元格编辑', icon: 'mdi:table-cell' },
  { value: 'both' as const, label: '混合模式', icon: 'mdi:table-edit' },
  {
    value: 'modal' as const,
    label: '模态框编辑',
    icon: 'mdi:window-maximize',
  },
  { value: 'none' as const, label: '禁用编辑', icon: 'mdi:lock' },
]

// ================= 模式描述配置 =================

/**
 * @description 不同编辑模式的配置信息
 */
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
    title: '模态框编辑模式',
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

/**
 * @description 部门映射配置
 */
export const DEPARTMENT_MAP = {
  tech: '技术部',
  hr: '人事部',
  market: '市场部',
  finance: '财务部',
} as const

/**
 * @description 员工状态映射配置
 */
export const STATUS_MAP = {
  active: '在职',
  inactive: '离职',
  probation: '试用期',
} as const

// ================= 选项配置 =================

/**
 * @description 部门选择选项
 */
export const departmentOptions: SelectOption[] = Object.entries(
  DEPARTMENT_MAP
).map(([value, label]) => ({ label, value }))

/**
 * @description 员工状态选择选项
 */
export const statusOptions: SelectOption[] = Object.entries(STATUS_MAP).map(
  ([value, label]) => ({ label, value })
)

// ================= 表格列配置 =================

/**
 * @description 获取表格列配置
 */
export const getTableColumns = (): TableColumn<DataRecord>[] => [
  {
    key: 'name',
    title: '姓名',
    width: 120,
    editable: true,
    required: true,
    editType: 'input' as EditType,
    editProps: { rules: [PRESET_RULES.length('姓名', 2, 20)] },
  },
  {
    key: 'age',
    title: '年龄',
    width: 100,
    editable: true,
    editType: 'number' as EditType,
    editProps: { min: 18, max: 65, step: 1, showButton: false },
    required: true,
  },
  {
    key: 'gender',
    title: '性别',
    width: 100,
    editable: true,
    editType: 'select' as EditType,
    editProps: {
      options: [
        { label: '男', value: 'male' },
        { label: '女', value: 'female' },
      ],
    },
    render: (row: DataRecord) => {
      const employee = row as Employee
      return employee.gender === 'male' ? '男' : '女'
    },
    required: true,
  },
  {
    key: 'email',
    title: '邮箱',
    width: 200,
    editable: true,
    required: true,
    editType: 'email' as EditType,
  },
  {
    key: 'department',
    title: '部门',
    width: 120,
    editable: true,
    editType: 'select' as EditType,
    editProps: { options: departmentOptions },
    render: (row: DataRecord) => {
      const employee = row as Employee
      return (
        DEPARTMENT_MAP[employee.department as keyof typeof DEPARTMENT_MAP] ||
        employee.department
      )
    },
    required: true,
  },
  {
    key: 'joinDate',
    title: '入职日期',
    width: 140,
    editable: true,
    editType: 'date' as EditType,
    editProps: {
      type: 'date',
      format: 'yyyy-MM-dd',
      valueFormat: 'timestamp',
    },
    render: (row: DataRecord) => {
      const employee = row as Employee
      return employee.joinDate
        ? new Date(employee.joinDate).toLocaleDateString()
        : '-'
    },
    required: true,
  },
  {
    key: 'status',
    title: '状态',
    width: 100,
    editable: true,
    editType: 'select' as EditType,
    editProps: { options: statusOptions },
    render: (row: DataRecord) => {
      const employee = row as Employee
      return (
        STATUS_MAP[employee.status as keyof typeof STATUS_MAP] ||
        employee.status
      )
    },
    required: false,
  },
  {
    key: 'description',
    title: '描述',
    width: 200,
    editable: true,
    editType: 'textarea' as EditType,
    editProps: {
      type: 'textarea',
      rows: 3,
      placeholder: '请输入员工描述信息',
      rules: [PRESET_RULES.length('描述', 0, 200)],
    },
    render: (row: DataRecord) => {
      const employee = row as Employee
      const desc = employee.description || '暂无描述'
      return desc.length > 30 ? desc.substring(0, 30) + '...' : desc
    },
    required: false,
  },
]

// ================= 工具函数 =================

/**
 * @description 创建新员工数据
 */
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
