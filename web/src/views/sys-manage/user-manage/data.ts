import type { FormRules } from 'naive-ui/es'

// ==================== 类型定义 ====================
export type UserType = 'internal' | 'external' | 'partner' | 'guest'

export interface UserData {
  id: string
  username: string
  nickname: string
  email?: string
  phone?: string
  userType: UserType
  deptId?: string
  deptName?: string
  roleIds?: string[]
  roleNames?: string[]
  status: number
  avatar?: string
  remark?: string
  createTime: string
  updateTime?: string
  lastLoginTime?: string
  companyName?: string
  contactPerson?: string
}

export interface UserFormData {
  id?: string
  username: string
  nickname: string
  email: string
  phone: string
  userType: UserType
  deptId: string | null
  roleIds: string[]
  password: string
  status: number
  remark: string
  companyName: string
  contactPerson: string
}

export interface DeptData {
  id: string
  name: string
  parentId?: string | null
  sort: number
  status: number
  type: string
  children?: DeptData[]
}

export interface DeptTreeOption {
  id: string
  name: string
  children?: DeptTreeOption[]
}

export interface RoleData {
  id: string
  name: string
  code: string
  status: number
}

export interface SearchForm {
  keyword: string
  status: number | null
  roleId: string | null
  deptId: string | null
  userType: UserType | null
}

export interface ResetPasswordForm {
  newPassword: string
  confirmPassword: string
}

export interface ApiResponse<T = unknown> {
  code: string
  data: T
  msg: string
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// ==================== UI 配置常量 ====================
export const UI_CONFIG = {
  userType: [
    { label: '内部员工', value: 'internal' },
    { label: '外部客户', value: 'external' },
    { label: '合作伙伴', value: 'partner' },
    { label: '访客', value: 'guest' },
  ],
  userStatus: [
    { label: '正常', value: 1 },
    { label: '禁用', value: 0 },
  ],
  pagination: {
    defaultPage: 1,
    defaultPageSize: 20,
    pageSizes: [10, 20, 50, 100],
  },
} as const

// ==================== 表单验证规则 ====================
const createValidationRule = (
  required: boolean,
  message: string,
  trigger = ['input', 'blur'],
  extraRules: any[] = []
) => [
  ...(required
    ? [{ required: true, message, trigger }]
    : [{ required: false }]),
  ...extraRules,
]

export const USER_FORM_RULES: FormRules = {
  username: createValidationRule(
    true,
    '请输入用户名',
    ['input', 'blur'],
    [
      {
        min: 3,
        max: 20,
        message: '用户名长度在 3 到 20 个字符',
        trigger: ['input', 'blur'],
      },
    ]
  ),
  nickname: createValidationRule(true, '请输入昵称'),
  userType: createValidationRule(true, '请选择用户类型', ['change', 'blur']),
  email: createValidationRule(
    false,
    '',
    ['input', 'blur'],
    [
      {
        type: 'email',
        message: '请输入正确的邮箱格式',
        trigger: ['input', 'blur'],
      },
    ]
  ),
  phone: createValidationRule(
    false,
    '',
    ['input', 'blur'],
    [
      {
        pattern: /^1[3-9]\d{9}$/,
        message: '请输入正确的手机号',
        trigger: ['input', 'blur'],
      },
    ]
  ),
  password: createValidationRule(
    true,
    '请输入密码',
    ['input', 'blur'],
    [
      {
        min: 6,
        max: 20,
        message: '密码长度在 6 到 20 个字符',
        trigger: ['input', 'blur'],
      },
    ]
  ),
}

export const RESET_PASSWORD_RULES: FormRules = {
  newPassword: createValidationRule(
    true,
    '请输入新密码',
    ['input', 'blur'],
    [
      {
        min: 6,
        max: 20,
        message: '密码长度在 6 到 20 个字符',
        trigger: ['input', 'blur'],
      },
    ]
  ),
  confirmPassword: createValidationRule(
    true,
    '请再次输入新密码',
    ['input', 'blur'],
    [
      {
        validator: (rule: any, value: string) => {
          const form = rule.form as ResetPasswordForm
          return value !== form.newPassword
            ? Promise.reject('两次密码输入不一致')
            : Promise.resolve()
        },
        trigger: ['input', 'blur'],
      },
    ]
  ),
}

// ==================== 默认数据 ====================
export const DEFAULT_USER_FORM_DATA: UserFormData = {
  username: '',
  nickname: '',
  email: '',
  phone: '',
  userType: 'internal',
  deptId: null,
  roleIds: [],
  password: '123456',
  status: 1,
  remark: '',
  companyName: '',
  contactPerson: '',
}

export const DEFAULT_RESET_PASSWORD_FORM: ResetPasswordForm = {
  newPassword: '',
  confirmPassword: '',
}

// ==================== 模拟数据 ====================
export const MOCK_DEPT_DATA: DeptData[] = [
  {
    id: 'dept_1',
    name: '总公司',
    parentId: null,
    sort: 1,
    status: 1,
    type: 'dept',
    children: [
      {
        id: 'dept_2',
        name: '技术部',
        parentId: 'dept_1',
        sort: 1,
        status: 1,
        type: 'dept',
        children: [
          {
            id: 'dept_3',
            name: '前端组',
            parentId: 'dept_2',
            sort: 1,
            status: 1,
            type: 'dept',
          },
          {
            id: 'dept_4',
            name: '后端组',
            parentId: 'dept_2',
            sort: 2,
            status: 1,
            type: 'dept',
          },
        ],
      },
      {
        id: 'dept_5',
        name: '市场部',
        parentId: 'dept_1',
        sort: 2,
        status: 1,
        type: 'dept',
      },
      {
        id: 'dept_6',
        name: '人事部',
        parentId: 'dept_1',
        sort: 3,
        status: 1,
        type: 'dept',
      },
    ],
  },
  {
    id: 'dept_external',
    name: '外部客户',
    parentId: null,
    sort: 2,
    status: 1,
    type: 'external',
  },
]

export const MOCK_ROLE_DATA: RoleData[] = [
  { id: 'role_1', name: '超级管理员', code: 'admin', status: 1 },
  { id: 'role_2', name: '部门经理', code: 'manager', status: 1 },
  { id: 'role_3', name: '普通员工', code: 'user', status: 1 },
  { id: 'role_4', name: '客户', code: 'customer', status: 1 },
  { id: 'role_5', name: '访客', code: 'guest', status: 1 },
]

export const MOCK_USER_DATA: UserData[] = [
  {
    id: 'user_1',
    username: 'admin',
    nickname: '超级管理员',
    email: 'admin@example.com',
    phone: '13800138001',
    userType: 'internal',
    deptId: 'dept_1',
    deptName: '总公司',
    roleIds: ['role_1'],
    roleNames: ['超级管理员'],
    status: 1,
    avatar: '',
    remark: '系统超级管理员',
    createTime: '2024-01-01 09:00:00',
    updateTime: '2024-01-15 14:30:00',
    lastLoginTime: '2024-01-15 09:15:00',
  },
  {
    id: 'user_2',
    username: 'zhangsan',
    nickname: '张三',
    email: 'zhangsan@example.com',
    phone: '13800138002',
    userType: 'internal',
    deptId: 'dept_3',
    deptName: '前端组',
    roleIds: ['role_3'],
    roleNames: ['普通员工'],
    status: 1,
    remark: '前端开发工程师',
    createTime: '2024-01-02 09:00:00',
    updateTime: '2024-01-10 16:20:00',
    lastLoginTime: '2024-01-15 08:45:00',
  },
  {
    id: 'user_3',
    username: 'lisi',
    nickname: '李四',
    email: 'lisi@example.com',
    phone: '13800138003',
    userType: 'internal',
    deptId: 'dept_4',
    deptName: '后端组',
    roleIds: ['role_2', 'role_3'],
    roleNames: ['部门经理', '普通员工'],
    status: 0,
    remark: '后端开发工程师',
    createTime: '2024-01-03 09:00:00',
    updateTime: '2024-01-12 11:10:00',
    lastLoginTime: '2024-01-14 17:30:00',
  },
  {
    id: 'user_4',
    username: 'wangwu',
    nickname: '王五',
    email: 'wangwu@example.com',
    phone: '13800138004',
    userType: 'internal',
    deptId: 'dept_5',
    deptName: '市场部',
    roleIds: ['role_3'],
    roleNames: ['普通员工'],
    status: 1,
    remark: '市场专员',
    createTime: '2024-01-04 09:00:00',
    updateTime: '2024-01-08 13:45:00',
    lastLoginTime: '2024-01-13 10:20:00',
  },
  {
    id: 'user_5',
    username: 'customer001',
    nickname: 'ABC公司',
    email: 'contact@abc.com',
    phone: '13800138005',
    userType: 'external',
    deptId: 'dept_external',
    deptName: '外部客户',
    roleIds: ['role_4'],
    roleNames: ['客户'],
    status: 1,
    remark: 'ABC科技有限公司',
    companyName: 'ABC科技有限公司',
    contactPerson: '刘总',
    createTime: '2024-01-05 09:00:00',
    updateTime: '2024-01-12 15:20:00',
    lastLoginTime: '2024-01-14 10:30:00',
  },
]

// ==================== 工具函数 ====================
const createMockApi = <T>(data: T, delay = 500) =>
  new Promise<ApiResponse<T>>(resolve => {
    setTimeout(() => {
      resolve({ code: '0', data, msg: '成功' })
    }, delay)
  })

const filterUsers = (users: UserData[], params: any): UserData[] => {
  let filtered = [...users]

  // 关键词搜索
  if (params.keyword) {
    const keyword = params.keyword.toLowerCase()
    filtered = filtered.filter(
      user =>
        user.username.toLowerCase().includes(keyword) ||
        user.nickname.toLowerCase().includes(keyword) ||
        (user.email && user.email.toLowerCase().includes(keyword))
    )
  }

  // 状态筛选
  if (params.status !== null && params.status !== undefined) {
    filtered = filtered.filter(user => user.status === params.status)
  }

  // 用户类型筛选
  if (params.userType) {
    filtered = filtered.filter(user => user.userType === params.userType)
  }

  // 部门筛选
  if (params.deptId) {
    filtered = filtered.filter(user => user.deptId === params.deptId)
  }

  // 角色筛选
  if (params.roleId) {
    filtered = filtered.filter(
      user => user.roleIds && user.roleIds.includes(params.roleId)
    )
  }

  return filtered
}

const paginateData = <T>(data: T[], page: number, pageSize: number) => {
  const total = data.length
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const list = data.slice(start, end)
  return { list, total, page, pageSize }
}

// ==================== API 方法 ====================
export const getUserListApi = async (
  params: any
): Promise<ApiResponse<PageResult<UserData>>> => {
  const filteredUsers = filterUsers(MOCK_USER_DATA, params)
  const paginatedData = paginateData(
    filteredUsers,
    params.page,
    params.pageSize
  )
  return createMockApi(paginatedData)
}

export const getDeptListApi = async (): Promise<ApiResponse<DeptData[]>> =>
  createMockApi(MOCK_DEPT_DATA, 300)

export const getUserRolesApi = async (): Promise<ApiResponse<RoleData[]>> =>
  createMockApi(MOCK_ROLE_DATA, 300)

// 简化的CRUD操作
const createUserCRUDApi =
  (operation: string, delay = 500) =>
  (...args: any[]) => {
    console.log(`${operation}:`, ...args)
    return new Promise<void>(resolve => {
      setTimeout(() => {
        // 这里可以添加具体的业务逻辑
        resolve()
      }, delay)
    })
  }

export const addUserApi = createUserCRUDApi('添加用户')
export const updateUserApi = createUserCRUDApi('更新用户')
export const deleteUserApi = createUserCRUDApi('删除用户')
export const resetPasswordApi = createUserCRUDApi('重置密码')
export const batchDeleteUsersApi = createUserCRUDApi('批量删除用户', 800)
export const batchToggleUsersStatusApi = createUserCRUDApi(
  '批量切换用户状态',
  800
)

// 状态切换API
export const toggleUserStatusApi = async (
  id: string,
  status: number
): Promise<void> => {
  console.log('切换用户状态:', id, status)
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = MOCK_USER_DATA.find(u => u.id === id)
      if (user) {
        user.status = status
        user.updateTime = new Date().toLocaleString()
        console.log('状态已更新:', user.username, '新状态:', status)
        resolve()
      } else {
        reject(new Error('用户不存在'))
      }
    }, 300)
  })
}

// 工具函数：更新用户列表中的用户状态
export const updateUserStatus = (
  userList: UserData[],
  id: string,
  status: number
): boolean => {
  const userIndex = userList.findIndex(user => user.id === id)
  if (userIndex !== -1) {
    userList[userIndex].status = status
    userList[userIndex].updateTime = new Date().toLocaleString()
    return true
  }
  return false
}
