import type {
  SelectOption,
  EditType,
  ButtonType,
  TableColumn,
  RowAction,
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
  description?: string // 改为可选，与API保持一致
}

// ================= 编辑模式配置 - 使用C_Icon组件 =================

/**
 * @description 表格编辑模式配置数组
 * @constant {Array} EDIT_MODES - 支持的编辑模式列表
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
 * @constant {Object} MODE_CONFIG - 编辑模式配置映射
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
 * @constant {Object} DEPARTMENT_MAP - 部门代码到中文名称的映射
 */
export const DEPARTMENT_MAP = {
  tech: '技术部',
  hr: '人事部',
  market: '市场部',
  finance: '财务部',
} as const

/**
 * @description 员工状态映射配置
 * @constant {Object} STATUS_MAP - 状态代码到中文名称的映射
 */
export const STATUS_MAP = {
  active: '在职',
  inactive: '离职',
  probation: '试用期',
} as const

// ================= 选项配置 =================

/**
 * @description 部门选择选项
 * @constant {SelectOption[]} departmentOptions - 部门下拉选项数组
 */
export const departmentOptions: SelectOption[] = Object.entries(
  DEPARTMENT_MAP
).map(([value, label]) => ({ label, value }))

/**
 * @description 员工状态选择选项
 * @constant {SelectOption[]} statusOptions - 状态下拉选项数组
 */
export const statusOptions: SelectOption[] = Object.entries(STATUS_MAP).map(
  ([value, label]) => ({ label, value })
)

// ================= 表格列配置 =================

/**
 * @description 获取表格列配置
 * @returns {TableColumn<DataRecord>[]} 表格列配置数组
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

// ================= 原有的表格行操作配置（保留向下兼容） =================

/**
 * @description 获取表格行操作配置（向下兼容）
 * @param message - 消息提示实例
 * @param dialog - 对话框实例
 * @param tableData - 表格数据引用
 * @returns {RowAction<DataRecord>[]} 行操作配置数组
 */
export const getTableRowActions = (
  message: any,
  dialog: any,
  tableData: any
): RowAction<DataRecord>[] => [
  {
    label: '查看',
    icon: 'mdi:eye',
    type: 'info' as ButtonType,
    onClick: () => {}, // 由表格组件内部处理
  },
  {
    label: '复制',
    icon: 'mdi:content-copy',
    type: 'default' as ButtonType,
    onClick: (row: DataRecord, index: number) => {
      const employee = row as Employee
      const newRow: Employee = {
        ...employee,
        id: Date.now(),
        name: `${employee.name}_副本`,
      }
      tableData.value.splice(index + 1, 0, newRow)
      message.success('复制成功')
    },
  },
  {
    label: '删除',
    icon: 'mdi:delete',
    type: 'error' as ButtonType,
    onClick: (row: DataRecord, index: number) => {
      const employee = row as Employee
      dialog.warning({
        title: '确认删除',
        content: `确定要删除员工"${employee.name}"吗？`,
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

/**
 * @description 创建新员工数据
 * @returns {Employee} 新员工对象
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

// ================= 操作配置工厂函数 =================

/**
 * @description 创建标准的操作配置
 * @param tableData - 表格数据引用
 * @param message - 消息提示实例
 * @param dialog - 对话框实例
 * @returns 标准操作配置对象
 */
export const createStandardActions = (
  tableData: any,
  message: any,
  dialog: any
) => ({
  // 内置操作使用默认配置
  edit: {},
  delete: {
    confirmText: (row: DataRecord) => {
      const employee = row as Employee
      return `确定要删除员工"${employee.name}"吗？`
    },
  },
  detail: {},

  // 自定义操作
  custom: [
    {
      key: 'copy',
      label: '复制',
      icon: 'mdi:content-copy',
      type: 'default' as ButtonType,
      onClick: (row: DataRecord, index: number) => {
        const employee = row as Employee
        const newRow: Employee = {
          ...employee,
          id: Date.now(),
          name: `${employee.name}_副本`,
        }
        tableData.value.splice(index + 1, 0, newRow)
        message.success('复制成功')
      },
      show: (row: DataRecord) => {
        const employee = row as Employee
        return employee.status === 'active'
      }, // 只有在职员工显示复制按钮
    },
    {
      key: 'authorize',
      label: '授权',
      icon: 'mdi:shield-key',
      type: 'warning' as ButtonType,
      onClick: (row: DataRecord) => {
        const employee = row as Employee
        dialog.info({
          title: '员工授权',
          content: `正在为员工 "${employee.name}" 配置系统权限...`,
          positiveText: '确定',
          onPositiveClick: () => {
            message.success('授权配置完成')
          },
        })
      },
    },
  ],
})

/**
 * @description 创建API模式的操作配置（简化版）
 * @returns API操作配置对象
 */
export const createApiActions = () => ({
  delete: {
    confirmText: (row: DataRecord) => {
      const employee = row as Employee
      return `确定要删除员工"${employee.name}"吗？此操作不可撤销！`
    },
  },
  custom: [
    {
      key: 'export',
      label: '导出',
      icon: 'mdi:download',
      type: 'success' as ButtonType,
      onClick: (row: DataRecord) => {
        const employee = row as Employee
        console.log('导出员工信息:', employee.name)
      },
    },
  ],
})

/**
 * @description 创建自定义逻辑的操作配置
 * @param onEdit - 自定义编辑处理函数
 * @param onDelete - 自定义删除处理函数
 * @param onView - 自定义查看处理函数
 * @returns 自定义操作配置对象
 */
export const createCustomActions = (
  onEdit: (row: Employee) => void,
  onDelete: (row: Employee, index: number) => void,
  onView: (row: Employee) => void
) => ({
  edit: {
    onEdit: (row: DataRecord) => {
      const employee = row as Employee
      console.log('自定义编辑逻辑:', employee)
      onEdit(employee)
    },
  },
  delete: {
    onDelete: async (row: DataRecord, index: number) => {
      const employee = row as Employee
      console.log('自定义删除逻辑:', employee)
      await onDelete(employee, index)
    },
  },
  detail: {
    onView: (row: DataRecord) => {
      const employee = row as Employee
      console.log('自定义查看逻辑:', employee)
      onView(employee)
    },
  },
})
