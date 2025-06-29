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
  status: number // 1-正常 0-禁用（简化，只保留两个状态）
  avatar?: string
  remark?: string
  createTime: string
  updateTime?: string
  lastLoginTime?: string
  // 外部用户相关字段
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

// ==================== 常量配置 ====================
export const USER_FORM_RULES: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: ['input', 'blur'] },
    {
      min: 3,
      max: 20,
      message: '用户名长度在 3 到 20 个字符',
      trigger: ['input', 'blur'],
    },
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: ['input', 'blur'] },
  ],
  userType: [
    { required: true, message: '请选择用户类型', trigger: ['change', 'blur'] },
  ],
  email: [
    { required: false },
    {
      type: 'email',
      message: '请输入正确的邮箱格式',
      trigger: ['input', 'blur'],
    },
  ],
  phone: [
    { required: false },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号',
      trigger: ['input', 'blur'],
    },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: ['input', 'blur'] },
    {
      min: 6,
      max: 20,
      message: '密码长度在 6 到 20 个字符',
      trigger: ['input', 'blur'],
    },
  ],
}

export const RESET_PASSWORD_RULES: FormRules = {
  newPassword: [
    { required: true, message: '请输入新密码', trigger: ['input', 'blur'] },
    {
      min: 6,
      max: 20,
      message: '密码长度在 6 到 20 个字符',
      trigger: ['input', 'blur'],
    },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: ['input', 'blur'] },
    {
      validator: (rule: any, value: string) => {
        const form = rule.form as ResetPasswordForm
        if (value !== form.newPassword) {
          return Promise.reject('两次密码输入不一致')
        }
        return Promise.resolve()
      },
      trigger: ['input', 'blur'],
    },
  ],
}

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
    status: 0, // 设置为禁用状态用于测试
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

// ==================== API 方法 ====================
export const getUserListApi = async (
  params: any
): Promise<ApiResponse<PageResult<UserData>>> => {
  return new Promise(resolve => {
    setTimeout(() => {
      let filteredUsers = [...MOCK_USER_DATA]

      // 模拟搜索
      if (params.keyword) {
        filteredUsers = filteredUsers.filter(
          user =>
            user.username.includes(params.keyword) ||
            user.nickname.includes(params.keyword) ||
            (user.email && user.email.includes(params.keyword))
        )
      }

      // 模拟状态筛选
      if (params.status !== null && params.status !== undefined) {
        filteredUsers = filteredUsers.filter(
          user => user.status === params.status
        )
      }

      // 模拟用户类型筛选
      if (params.userType) {
        filteredUsers = filteredUsers.filter(
          user => user.userType === params.userType
        )
      }

      // 模拟部门筛选
      if (params.deptId) {
        filteredUsers = filteredUsers.filter(
          user => user.deptId === params.deptId
        )
      }

      // 模拟角色筛选
      if (params.roleId) {
        filteredUsers = filteredUsers.filter(
          user => user.roleIds && user.roleIds.includes(params.roleId)
        )
      }

      // 模拟分页
      const total = filteredUsers.length
      const start = (params.page - 1) * params.pageSize
      const end = start + params.pageSize
      const list = filteredUsers.slice(start, end)

      resolve({
        code: '0',
        data: { list, total, page: params.page, pageSize: params.pageSize },
        msg: '成功',
      })
    }, 500)
  })
}

export const getDeptListApi = async (): Promise<ApiResponse<DeptData[]>> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: '0', data: MOCK_DEPT_DATA, msg: '成功' })
    }, 300)
  })
}

export const getUserRolesApi = async (): Promise<ApiResponse<RoleData[]>> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: '0', data: MOCK_ROLE_DATA, msg: '成功' })
    }, 300)
  })
}

export const addUserApi = async (data: UserFormData): Promise<void> => {
  console.log('添加用户:', data)
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 检查用户名是否已存在
      const existingUser = MOCK_USER_DATA.find(
        user => user.username === data.username
      )
      if (existingUser) {
        reject(new Error('用户名已存在'))
        return
      }

      // 模拟添加到数据中
      const newUser: UserData = {
        id: `user_${Date.now()}`,
        username: data.username,
        nickname: data.nickname,
        email: data.email || undefined,
        phone: data.phone || undefined,
        userType: data.userType,
        deptId: data.deptId || undefined,
        deptName: data.deptId ? '模拟部门名称' : undefined,
        roleIds: data.roleIds,
        roleNames: data.roleIds.map(
          id => MOCK_ROLE_DATA.find(r => r.id === id)?.name || ''
        ),
        status: data.status,
        remark: data.remark || undefined,
        companyName: data.companyName || undefined,
        contactPerson: data.contactPerson || undefined,
        createTime: new Date().toLocaleString(),
      }

      MOCK_USER_DATA.push(newUser)
      resolve()
    }, 500)
  })
}

export const updateUserApi = async (data: UserFormData): Promise<void> => {
  console.log('更新用户:', data)
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const userIndex = MOCK_USER_DATA.findIndex(user => user.id === data.id)
      if (userIndex === -1) {
        reject(new Error('用户不存在'))
        return
      }

      // 更新用户数据
      const user = MOCK_USER_DATA[userIndex]
      MOCK_USER_DATA[userIndex] = {
        ...user,
        nickname: data.nickname,
        email: data.email || undefined,
        phone: data.phone || undefined,
        userType: data.userType,
        deptId: data.deptId || undefined,
        roleIds: data.roleIds,
        roleNames: data.roleIds.map(
          id => MOCK_ROLE_DATA.find(r => r.id === id)?.name || ''
        ),
        status: data.status,
        remark: data.remark || undefined,
        companyName: data.companyName || undefined,
        contactPerson: data.contactPerson || undefined,
        updateTime: new Date().toLocaleString(),
      }

      resolve()
    }, 500)
  })
}

export const deleteUserApi = async (id: string): Promise<void> => {
  console.log('删除用户:', id)
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const userIndex = MOCK_USER_DATA.findIndex(user => user.id === id)
      if (userIndex === -1) {
        reject(new Error('用户不存在'))
        return
      }

      MOCK_USER_DATA.splice(userIndex, 1)
      resolve()
    }, 500)
  })
}

// 修复状态切换API - 立即更新模拟数据
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

export const resetPasswordApi = async (
  id: string,
  password: string
): Promise<void> => {
  console.log('重置密码:', id, password)
  return new Promise(resolve => setTimeout(resolve, 500))
}

export const batchDeleteUsersApi = async (ids: string[]): Promise<void> => {
  console.log('批量删除用户:', ids)
  return new Promise(resolve => {
    setTimeout(() => {
      ids.forEach(id => {
        const userIndex = MOCK_USER_DATA.findIndex(user => user.id === id)
        if (userIndex !== -1) {
          MOCK_USER_DATA.splice(userIndex, 1)
        }
      })
      resolve()
    }, 800)
  })
}

export const batchToggleUsersStatusApi = async (
  ids: string[]
): Promise<void> => {
  console.log('批量切换用户状态:', ids)

  return new Promise(resolve => {
    setTimeout(() => {
      ids.forEach(id => {
        const user = MOCK_USER_DATA.find(u => u.id === id)
        if (user) {
          user.status = user.status === 1 ? 0 : 1
          user.updateTime = new Date().toLocaleString()
        }
      })
      resolve()
    }, 800)
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
