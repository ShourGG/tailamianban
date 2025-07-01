import type { FormRules } from 'naive-ui/es'

// ==================== 类型定义 ====================
export type PermissionType = 'module' | 'function' | 'button' | 'api'

export interface PermissionData {
  id: string
  name: string // 权限名称
  code: string // 权限编码 (system:user:add)
  type: PermissionType // 权限类型
  module: string // 所属模块
  description?: string // 权限描述
  resources?: string[] // 关联资源 (API路径、按钮标识等)
  status: number // 1-启用 0-禁用
  sort: number // 排序
  createTime: string // 创建时间
  updateTime?: string // 更新时间
  remark?: string // 备注
}

export interface PermissionFormData {
  id?: string
  name: string
  code: string
  type: PermissionType
  module: string
  description: string
  resources: string
  status: number
  sort: number
  remark: string
}

export interface SearchForm {
  keyword: string
  type: PermissionType | null
  module: string | null
  status: number | null
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
export const ICONS = {
  search: 'mdi:magnify',
  plus: 'mdi:plus',
  refresh: 'mdi:refresh',
  edit: 'mdi:pencil',
  delete: 'mdi:delete',
  eye: 'mdi:eye',
  copy: 'mdi:content-copy',
  export: 'mdi:download',
  import: 'mdi:upload',
  filter: 'mdi:filter',
} as const

export const PERMISSION_TYPE_CONFIG = {
  module: {
    text: '模块权限',
    type: 'info' as const,
    icon: 'mdi:view-dashboard',
    color: '#1890ff',
    description: '系统功能模块访问权限',
  },
  function: {
    text: '功能权限',
    type: 'success' as const,
    icon: 'mdi:cog',
    color: '#52c41a',
    description: '具体功能操作权限',
  },
  button: {
    text: '按钮权限',
    type: 'warning' as const,
    icon: 'mdi:cursor-pointer',
    color: '#fa8c16',
    description: '页面按钮操作权限',
  },
  api: {
    text: 'API权限',
    type: 'error' as const,
    icon: 'mdi:api',
    color: '#f5222d',
    description: '接口访问权限',
  },
} as const

export const STATUS_CONFIG = {
  1: { text: '启用', type: 'success' as const, icon: 'mdi:check-circle' },
  0: { text: '禁用', type: 'error' as const, icon: 'mdi:pause-circle' },
} as const

export const UI_CONFIG = {
  permissionType: [
    { label: '模块权限', value: 'module' },
    { label: '功能权限', value: 'function' },
    { label: '按钮权限', value: 'button' },
    { label: 'API权限', value: 'api' },
  ],
  permissionStatus: [
    { label: '启用', value: 1 },
    { label: '禁用', value: 0 },
  ],
} as const

// ==================== 系统模块配置 ====================
export const SYSTEM_MODULES = [
  { label: '系统管理', value: 'system' },
  { label: '用户管理', value: 'user' },
  { label: '角色管理', value: 'role' },
  { label: '权限管理', value: 'permission' },
  { label: '菜单管理', value: 'menu' },
  { label: '字典管理', value: 'dict' },
  { label: '配置管理', value: 'config' },
  { label: '日志管理', value: 'log' },
  { label: '监控管理', value: 'monitor' },
  { label: '文件管理', value: 'file' },
] as const

// ==================== 表单验证规则 ====================
export const PERMISSION_FORM_RULES: FormRules = {
  name: [
    { required: true, message: '请输入权限名称', trigger: ['input', 'blur'] },
    {
      min: 2,
      max: 50,
      message: '权限名称长度在 2 到 50 个字符',
      trigger: ['input', 'blur'],
    },
  ],
  code: [
    { required: true, message: '请输入权限编码', trigger: ['input', 'blur'] },
    {
      min: 2,
      max: 100,
      message: '权限编码长度在 2 到 100 个字符',
      trigger: ['input', 'blur'],
    },
    {
      pattern: /^[a-zA-Z][a-zA-Z0-9_:]*$/,
      message: '权限编码必须以字母开头，只能包含字母、数字、下划线和冒号',
      trigger: ['input', 'blur'],
    },
  ],
  type: [
    { required: true, message: '请选择权限类型', trigger: ['change', 'blur'] },
  ],
  module: [
    { required: true, message: '请选择所属模块', trigger: ['change', 'blur'] },
  ],
  sort: [
    { required: true, message: '请输入排序值', trigger: ['input', 'blur'] },
    {
      type: 'number',
      min: 0,
      max: 9999,
      message: '排序值必须在 0 到 9999 之间',
      trigger: ['input', 'blur'],
    },
  ],
}

// ==================== 默认数据 ====================
export const DEFAULT_PERMISSION_FORM_DATA: PermissionFormData = {
  name: '',
  code: '',
  type: 'button',
  module: 'system',
  description: '',
  resources: '',
  status: 1,
  sort: 0,
  remark: '',
}

// ==================== 模拟数据 ====================
export const MOCK_PERMISSION_DATA: PermissionData[] = [
  // 系统管理模块
  {
    id: 'perm_1',
    name: '系统管理模块',
    code: 'system',
    type: 'module',
    module: 'system',
    description: '系统管理功能模块访问权限',
    resources: ['/system'],
    sort: 1,
    status: 1,
    createTime: '2024-01-01 09:00:00',
  },
  {
    id: 'perm_2',
    name: '系统监控',
    code: 'system:monitor',
    type: 'function',
    module: 'system',
    description: '系统监控功能访问权限',
    resources: ['/system/monitor'],
    sort: 2,
    status: 1,
    createTime: '2024-01-01 09:05:00',
  },
  {
    id: 'perm_3',
    name: '刷新监控数据',
    code: 'system:monitor:refresh',
    type: 'button',
    module: 'system',
    description: '刷新系统监控数据的按钮权限',
    resources: ['refresh-btn'],
    sort: 3,
    status: 1,
    createTime: '2024-01-01 09:10:00',
  },
  {
    id: 'perm_4',
    name: '监控数据API',
    code: 'system:monitor:data',
    type: 'api',
    module: 'system',
    description: '获取系统监控数据的API权限',
    resources: ['/api/system/monitor/data'],
    sort: 4,
    status: 1,
    createTime: '2024-01-01 09:15:00',
  },

  // 用户管理模块
  {
    id: 'perm_5',
    name: '用户管理模块',
    code: 'user',
    type: 'module',
    module: 'user',
    description: '用户管理功能模块访问权限',
    resources: ['/user'],
    sort: 10,
    status: 1,
    createTime: '2024-01-01 10:00:00',
  },
  {
    id: 'perm_6',
    name: '用户列表查看',
    code: 'user:list',
    type: 'function',
    module: 'user',
    description: '查看用户列表功能权限',
    resources: ['/user/list'],
    sort: 11,
    status: 1,
    createTime: '2024-01-01 10:05:00',
  },
  {
    id: 'perm_7',
    name: '新增用户',
    code: 'user:add',
    type: 'button',
    module: 'user',
    description: '新增用户按钮权限',
    resources: ['add-user-btn'],
    sort: 12,
    status: 1,
    createTime: '2024-01-01 10:10:00',
  },
  {
    id: 'perm_8',
    name: '编辑用户',
    code: 'user:edit',
    type: 'button',
    module: 'user',
    description: '编辑用户按钮权限',
    resources: ['edit-user-btn'],
    sort: 13,
    status: 1,
    createTime: '2024-01-01 10:15:00',
  },
  {
    id: 'perm_9',
    name: '删除用户',
    code: 'user:delete',
    type: 'button',
    module: 'user',
    description: '删除用户按钮权限',
    resources: ['delete-user-btn'],
    sort: 14,
    status: 1,
    createTime: '2024-01-01 10:20:00',
  },
  {
    id: 'perm_10',
    name: '用户详情API',
    code: 'user:detail',
    type: 'api',
    module: 'user',
    description: '获取用户详情的API权限',
    resources: ['/api/user/{id}'],
    sort: 15,
    status: 1,
    createTime: '2024-01-01 10:25:00',
  },
  {
    id: 'perm_11',
    name: '创建用户API',
    code: 'user:create',
    type: 'api',
    module: 'user',
    description: '创建用户的API权限',
    resources: ['/api/user'],
    sort: 16,
    status: 1,
    createTime: '2024-01-01 10:30:00',
  },

  // 角色管理模块
  {
    id: 'perm_12',
    name: '角色管理模块',
    code: 'role',
    type: 'module',
    module: 'role',
    description: '角色管理功能模块访问权限',
    resources: ['/role'],
    sort: 20,
    status: 1,
    createTime: '2024-01-01 11:00:00',
  },
  {
    id: 'perm_13',
    name: '角色列表查看',
    code: 'role:list',
    type: 'function',
    module: 'role',
    description: '查看角色列表功能权限',
    resources: ['/role/list'],
    sort: 21,
    status: 1,
    createTime: '2024-01-01 11:05:00',
  },
  {
    id: 'perm_14',
    name: '分配权限',
    code: 'role:assign',
    type: 'button',
    module: 'role',
    description: '为角色分配权限的按钮权限',
    resources: ['assign-permission-btn'],
    sort: 22,
    status: 1,
    createTime: '2024-01-01 11:10:00',
  },

  // 权限管理模块
  {
    id: 'perm_15',
    name: '权限管理模块',
    code: 'permission',
    type: 'module',
    module: 'permission',
    description: '权限管理功能模块访问权限',
    resources: ['/permission'],
    sort: 30,
    status: 1,
    createTime: '2024-01-01 12:00:00',
  },
  {
    id: 'perm_16',
    name: '权限列表查看',
    code: 'permission:list',
    type: 'function',
    module: 'permission',
    description: '查看权限列表功能权限',
    resources: ['/permission/list'],
    sort: 31,
    status: 1,
    createTime: '2024-01-01 12:05:00',
  },
  {
    id: 'perm_17',
    name: '导出权限',
    code: 'permission:export',
    type: 'button',
    module: 'permission',
    description: '导出权限数据的按钮权限',
    resources: ['export-permission-btn'],
    sort: 32,
    status: 1,
    createTime: '2024-01-01 12:10:00',
  },

  // 菜单管理模块
  {
    id: 'perm_18',
    name: '菜单管理模块',
    code: 'menu',
    type: 'module',
    module: 'menu',
    description: '菜单管理功能模块访问权限',
    resources: ['/menu'],
    sort: 40,
    status: 1,
    createTime: '2024-01-01 13:00:00',
  },
  {
    id: 'perm_19',
    name: '菜单排序',
    code: 'menu:sort',
    type: 'button',
    module: 'menu',
    description: '菜单排序的按钮权限',
    resources: ['sort-menu-btn'],
    sort: 41,
    status: 1,
    createTime: '2024-01-01 13:05:00',
  },

  // 日志管理模块
  {
    id: 'perm_20',
    name: '操作日志查看',
    code: 'log:operation:view',
    type: 'function',
    module: 'log',
    description: '查看操作日志功能权限',
    resources: ['/log/operation'],
    sort: 50,
    status: 0,
    createTime: '2024-01-01 14:00:00',
    remark: '暂时禁用，等待安全审核',
  },
]

// ==================== 工具函数 ====================
export const updatePermissionInList = (
  permissionId: string,
  updates: Partial<PermissionData>
) => {
  const index = MOCK_PERMISSION_DATA.findIndex(item => item.id === permissionId)
  if (index !== -1) {
    MOCK_PERMISSION_DATA[index] = { ...MOCK_PERMISSION_DATA[index], ...updates }
  }
}

export const removePermissionFromList = (permissionId: string) => {
  const index = MOCK_PERMISSION_DATA.findIndex(item => item.id === permissionId)
  if (index !== -1) {
    MOCK_PERMISSION_DATA.splice(index, 1)
  }
}

export const addPermissionToList = (permission: PermissionData) => {
  MOCK_PERMISSION_DATA.push(permission)
}

export const findPermissionById = (id: string): PermissionData | null => {
  return MOCK_PERMISSION_DATA.find(item => item.id === id) || null
}

export const generatePermissionCode = (
  module: string,
  type: PermissionType,
  action?: string
): string => {
  const parts = [module]
  if (action) parts.push(action)
  if (type === 'api') parts.push('api')
  return parts.join(':')
}

// ==================== API 工具函数 ====================
const createMockApi = <T>(data: T, delay = 500): Promise<ApiResponse<T>> =>
  new Promise(resolve => {
    setTimeout(() => resolve({ code: '0', data, msg: '成功' }), delay)
  })

const filterPermissions = (
  permissions: PermissionData[],
  params: SearchForm
): PermissionData[] => {
  let filtered = [...permissions]

  if (params.keyword) {
    const keyword = params.keyword.toLowerCase()
    filtered = filtered.filter(
      perm =>
        perm.name.toLowerCase().includes(keyword) ||
        perm.code.toLowerCase().includes(keyword) ||
        (perm.description && perm.description.toLowerCase().includes(keyword))
    )
  }

  if (params.type) {
    filtered = filtered.filter(perm => perm.type === params.type)
  }

  if (params.module) {
    filtered = filtered.filter(perm => perm.module === params.module)
  }

  if (params.status !== null && params.status !== undefined) {
    filtered = filtered.filter(perm => perm.status === params.status)
  }

  return filtered
}

const paginateData = <T>(
  data: T[],
  page: number,
  pageSize: number
): PageResult<T> => {
  const total = data.length
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const list = data.slice(start, end)
  return { list, total, page, pageSize }
}

// ==================== API 方法 ====================
export const getPermissionListApi = async (
  params: SearchForm & { page: number; pageSize: number }
): Promise<ApiResponse<PageResult<PermissionData>>> => {
  const filteredPermissions = filterPermissions(MOCK_PERMISSION_DATA, params)
  const paginatedData = paginateData(
    filteredPermissions,
    params.page,
    params.pageSize
  )
  return createMockApi(paginatedData)
}

export const getPermissionDetailApi = async (
  id: string
): Promise<ApiResponse<PermissionData>> => {
  const permission = findPermissionById(id)
  if (!permission) {
    return Promise.reject(new Error('权限不存在'))
  }
  return createMockApi(permission, 300)
}

export const createPermissionApi = async (
  data: PermissionFormData
): Promise<ApiResponse<void>> => {
  console.log('创建权限:', data)
  return createMockApi(undefined, 500)
}

export const updatePermissionApi = async (
  data: PermissionFormData
): Promise<ApiResponse<void>> => {
  console.log('更新权限:', data)
  return createMockApi(undefined, 500)
}

export const deletePermissionApi = async (
  id: string
): Promise<ApiResponse<void>> => {
  console.log('删除权限:', id)
  return createMockApi(undefined, 300)
}

export const batchDeletePermissionApi = async (
  ids: string[]
): Promise<ApiResponse<void>> => {
  console.log('批量删除权限:', ids)
  return createMockApi(undefined, 800)
}

export const exportPermissionApi = async (
  params: SearchForm
): Promise<ApiResponse<void>> => {
  console.log('导出权限:', params)
  return createMockApi(undefined, 1000)
}
