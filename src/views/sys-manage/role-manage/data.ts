import type { FormRules } from 'naive-ui/es'

// ==================== 类型定义 ====================
export type RoleType = 'system' | 'custom' | 'temp'
export type PermissionType = 'menu' | 'button' | 'api'

export interface RoleData {
  id: string
  name: string
  code: string
  type: RoleType
  status: number // 1-正常 0-禁用
  description?: string
  permissionIds?: string[]
  permissionNames?: string[]
  userCount?: number
  sort: number
  createTime: string
  updateTime?: string
  remark?: string
}

export interface RoleFormData {
  id?: string
  name: string
  code: string
  type: RoleType
  status: number
  description: string
  permissionIds: string[]
  sort: number
  remark: string
}

export interface PermissionData {
  id: string
  name: string
  code: string
  type: PermissionType
  parentId?: string | null
  path?: string
  icon?: string
  sort: number
  status: number
  children?: PermissionData[]
}

export interface SearchForm {
  keyword: string
  status: number | null
  type: RoleType | null
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
  roleType: [
    { label: '系统角色', value: 'system' },
    { label: '自定义角色', value: 'custom' },
    { label: '临时角色', value: 'temp' },
  ],
  roleStatus: [
    { label: '正常', value: 1 },
    { label: '禁用', value: 0 },
  ],
  permissionType: [
    { label: '菜单权限', value: 'menu' },
    { label: '按钮权限', value: 'button' },
    { label: 'API权限', value: 'api' },
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

export const ROLE_FORM_RULES: FormRules = {
  name: createValidationRule(
    true,
    '请输入角色名称',
    ['input', 'blur'],
    [
      {
        min: 2,
        max: 50,
        message: '角色名称长度在 2 到 50 个字符',
        trigger: ['input', 'blur'],
      },
    ]
  ),
  code: createValidationRule(
    true,
    '请输入角色编码',
    ['input', 'blur'],
    [
      {
        min: 2,
        max: 50,
        message: '角色编码长度在 2 到 50 个字符',
        trigger: ['input', 'blur'],
      },
      {
        pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
        message: '角色编码必须以字母开头，只能包含字母、数字和下划线',
        trigger: ['input', 'blur'],
      },
    ]
  ),
  type: createValidationRule(true, '请选择角色类型', ['change', 'blur']),
  sort: createValidationRule(
    true,
    '请输入排序值',
    ['input', 'blur'],
    [
      {
        type: 'number',
        min: 0,
        max: 9999,
        message: '排序值必须在 0 到 9999 之间',
        trigger: ['input', 'blur'],
      },
    ]
  ),
}

// ==================== 默认数据 ====================
export const DEFAULT_ROLE_FORM_DATA: RoleFormData = {
  name: '',
  code: '',
  type: 'custom',
  status: 1,
  description: '',
  permissionIds: [],
  sort: 0,
  remark: '',
}

// ==================== 模拟数据 ====================
export const MOCK_PERMISSION_DATA: PermissionData[] = [
  {
    id: 'perm_1',
    name: '系统管理',
    code: 'system',
    type: 'menu',
    parentId: null,
    path: '/system',
    icon: 'mdi:cog',
    sort: 1,
    status: 1,
    children: [
      {
        id: 'perm_1_1',
        name: '用户管理',
        code: 'system:user',
        type: 'menu',
        parentId: 'perm_1',
        path: '/system/user',
        icon: 'mdi:account',
        sort: 1,
        status: 1,
      },
      {
        id: 'perm_1_2',
        name: '角色管理',
        code: 'system:role',
        type: 'menu',
        parentId: 'perm_1',
        path: '/system/role',
        icon: 'mdi:account-key',
        sort: 2,
        status: 1,
      },
      {
        id: 'perm_1_3',
        name: '权限管理',
        code: 'system:permission',
        type: 'menu',
        parentId: 'perm_1',
        path: '/system/permission',
        icon: 'mdi:shield-account',
        sort: 3,
        status: 1,
      },
    ],
  },
  {
    id: 'perm_2',
    name: '内容管理',
    code: 'content',
    type: 'menu',
    parentId: null,
    path: '/content',
    icon: 'mdi:file-document',
    sort: 2,
    status: 1,
    children: [
      {
        id: 'perm_2_1',
        name: '文章管理',
        code: 'content:article',
        type: 'menu',
        parentId: 'perm_2',
        path: '/content/article',
        icon: 'mdi:file-document-edit',
        sort: 1,
        status: 1,
      },
      {
        id: 'perm_2_2',
        name: '分类管理',
        code: 'content:category',
        type: 'menu',
        parentId: 'perm_2',
        path: '/content/category',
        icon: 'mdi:folder',
        sort: 2,
        status: 1,
      },
    ],
  },
  {
    id: 'perm_3',
    name: '数据统计',
    code: 'analytics',
    type: 'menu',
    parentId: null,
    path: '/analytics',
    icon: 'mdi:chart-line',
    sort: 3,
    status: 1,
  },
]

export const MOCK_ROLE_DATA: RoleData[] = [
  {
    id: 'role_1',
    name: '超级管理员',
    code: 'super_admin',
    type: 'system',
    status: 1,
    description: '系统超级管理员，拥有所有权限',
    permissionIds: [
      'perm_1',
      'perm_1_1',
      'perm_1_2',
      'perm_1_3',
      'perm_2',
      'perm_2_1',
      'perm_2_2',
      'perm_3',
    ],
    permissionNames: [
      '系统管理',
      '用户管理',
      '角色管理',
      '权限管理',
      '内容管理',
      '文章管理',
      '分类管理',
      '数据统计',
    ],
    userCount: 1,
    sort: 1,
    createTime: '2024-01-01 09:00:00',
    updateTime: '2024-01-15 14:30:00',
    remark: '系统内置角色，不可删除',
  },
  {
    id: 'role_2',
    name: '管理员',
    code: 'admin',
    type: 'system',
    status: 1,
    description: '系统管理员，拥有大部分管理权限',
    permissionIds: ['perm_1', 'perm_1_1', 'perm_2', 'perm_2_1', 'perm_2_2'],
    permissionNames: [
      '系统管理',
      '用户管理',
      '内容管理',
      '文章管理',
      '分类管理',
    ],
    userCount: 3,
    sort: 2,
    createTime: '2024-01-02 09:00:00',
    updateTime: '2024-01-10 16:20:00',
    remark: '普通管理员角色',
  },
  {
    id: 'role_3',
    name: '编辑员',
    code: 'editor',
    type: 'custom',
    status: 1,
    description: '内容编辑员，负责内容管理',
    permissionIds: ['perm_2', 'perm_2_1', 'perm_2_2'],
    permissionNames: ['内容管理', '文章管理', '分类管理'],
    userCount: 5,
    sort: 3,
    createTime: '2024-01-03 09:00:00',
    updateTime: '2024-01-12 11:10:00',
  },
  {
    id: 'role_4',
    name: '普通用户',
    code: 'user',
    type: 'custom',
    status: 1,
    description: '普通用户，基础查看权限',
    permissionIds: ['perm_3'],
    permissionNames: ['数据统计'],
    userCount: 15,
    sort: 4,
    createTime: '2024-01-04 09:00:00',
    updateTime: '2024-01-08 13:45:00',
  },
  {
    id: 'role_5',
    name: '测试角色',
    code: 'test_role',
    type: 'temp',
    status: 0,
    description: '临时测试角色',
    permissionIds: [],
    permissionNames: [],
    userCount: 0,
    sort: 5,
    createTime: '2024-01-05 09:00:00',
    remark: '测试用角色，已禁用',
  },
]

// ==================== 工具函数 ====================
const createMockApi = <T>(data: T, delay = 500) =>
  new Promise<ApiResponse<T>>(resolve => {
    setTimeout(() => {
      resolve({ code: '0', data, msg: '成功' })
    }, delay)
  })

const filterRoles = (roles: RoleData[], params: any): RoleData[] => {
  let filtered = [...roles]

  // 关键词搜索
  if (params.keyword) {
    const keyword = params.keyword.toLowerCase()
    filtered = filtered.filter(
      role =>
        role.name.toLowerCase().includes(keyword) ||
        role.code.toLowerCase().includes(keyword) ||
        (role.description && role.description.toLowerCase().includes(keyword))
    )
  }

  // 状态筛选
  if (params.status !== null && params.status !== undefined) {
    filtered = filtered.filter(role => role.status === params.status)
  }

  // 类型筛选
  if (params.type) {
    filtered = filtered.filter(role => role.type === params.type)
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
export const getRoleListApi = async (
  params: any
): Promise<ApiResponse<PageResult<RoleData>>> => {
  const filteredRoles = filterRoles(MOCK_ROLE_DATA, params)
  const paginatedData = paginateData(
    filteredRoles,
    params.page,
    params.pageSize
  )
  return createMockApi(paginatedData)
}

export const getPermissionListApi = async (): Promise<
  ApiResponse<PermissionData[]>
> => createMockApi(MOCK_PERMISSION_DATA, 300)

export const getRoleDetailApi = async (
  id: string
): Promise<ApiResponse<RoleData>> => {
  const role = MOCK_ROLE_DATA.find(r => r.id === id)
  if (!role) {
    return Promise.reject(new Error('角色不存在'))
  }
  return createMockApi(role, 300)
}

// 简化的CRUD操作
const createRoleCRUDApi =
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

export const addRoleApi = createRoleCRUDApi('添加角色')
export const updateRoleApi = createRoleCRUDApi('更新角色')
export const deleteRoleApi = createRoleCRUDApi('删除角色')
export const batchDeleteRolesApi = createRoleCRUDApi('批量删除角色', 800)
export const batchToggleRolesStatusApi = createRoleCRUDApi(
  '批量切换角色状态',
  800
)

// 状态切换API
export const toggleRoleStatusApi = async (
  id: string,
  status: number
): Promise<void> => {
  console.log('切换角色状态:', id, status)
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const role = MOCK_ROLE_DATA.find(r => r.id === id)
      if (role) {
        role.status = status
        role.updateTime = new Date().toLocaleString()
        console.log('状态已更新:', role.name, '新状态:', status)
        resolve()
      } else {
        reject(new Error('角色不存在'))
      }
    }, 300)
  })
}

// 工具函数：更新角色列表中的角色状态
export const updateRoleStatus = (
  roleList: RoleData[],
  id: string,
  status: number
): boolean => {
  const roleIndex = roleList.findIndex(role => role.id === id)
  if (roleIndex !== -1) {
    roleList[roleIndex].status = status
    roleList[roleIndex].updateTime = new Date().toLocaleString()
    return true
  }
  return false
}
