// ==================== 权限抽屉相关类型定义 ====================
export type PermissionType = 'menu' | 'button' | 'api'

export interface PermissionData {
  id: string
  name: string
  code: string
  type: PermissionType
  parentId?: string | null
  path?: string
  icon?: string
  description?: string
  sort: number
  status: number
  children?: PermissionData[]
}

export interface RoleData {
  id: string
  name: string
  code: string
  description?: string
  permissionIds?: string[]
  permissionNames?: string[]
}

// ==================== 权限模板接口 ====================
export interface PermissionTemplate {
  id: string
  name: string
  description: string
  icon: string
  permissions: string[]
}

// ==================== 组件配置 ====================
export const PERMISSION_CONFIG = {
  icons: {
    search: 'mdi:magnify',
    plus: 'mdi:plus',
    refresh: 'mdi:refresh',
    toggle: 'mdi:toggle-switch',
    delete: 'mdi:delete',
    edit: 'mdi:pencil',
    eye: 'mdi:eye',
    pause: 'mdi:pause',
    play: 'mdi:play',
    permission: 'mdi:shield-account',
    check: 'mdi:check-circle',
    info: 'mdi:information',
    users: 'mdi:account-group',
  },
  permissionTypeOptions: [
    { label: '菜单权限', value: 'menu' },
    { label: '按钮权限', value: 'button' },
    { label: '接口权限', value: 'api' },
  ],
} as const

// ==================== 工具函数 ====================
export const usePermissionUtils = () => {
  // 查找权限
  const findPermissionById = (
    permissions: PermissionData[],
    id: string
  ): PermissionData | null => {
    for (const permission of permissions) {
      if (permission.id === id) return permission
      if (permission.children) {
        const found = findPermissionById(permission.children, id)
        if (found) return found
      }
    }
    return null
  }

  // 查找顶级权限模块
  const findTopLevelPermission = (
    permissions: PermissionData[],
    targetId: string
  ): PermissionData | null => {
    for (const perm of permissions) {
      if (perm.id === targetId) return perm
      if (perm.children) {
        const found = findPermissionById(perm.children, targetId)
        if (found) return perm
      }
    }
    return null
  }

  // 获取所有权限ID
  const getAllPermissionIds = (permissions: PermissionData[]): string[] => {
    const ids: string[] = []
    const collect = (perms: PermissionData[]) => {
      perms.forEach(perm => {
        ids.push(perm.id)
        if (perm.children) {
          collect(perm.children)
        }
      })
    }
    collect(permissions)
    return ids
  }

  // 检查是否有匹配的权限（用于搜索）
  const hasMatchingPermissionInTree = (
    permissions: PermissionData[],
    keyword: string
  ): boolean => {
    return permissions.some(perm => {
      const matches =
        perm.name.toLowerCase().includes(keyword) ||
        perm.code.toLowerCase().includes(keyword) ||
        (perm.description && perm.description.toLowerCase().includes(keyword))

      if (matches) return true

      if (perm.children) {
        return hasMatchingPermissionInTree(perm.children, keyword)
      }

      return false
    })
  }

  // 检查权限树中是否有指定类型
  const hasPermissionTypeInTree = (
    permissions: PermissionData[],
    type: string
  ): boolean => {
    return permissions.some(perm => {
      if (perm.type === type) return true
      if (perm.children) return hasPermissionTypeInTree(perm.children, type)
      return false
    })
  }

  // 获取模块的所有权限
  const getModulePermissions = (module: PermissionData): PermissionData[] => {
    const allPermissions: PermissionData[] = []

    const collectPermissions = (perms: PermissionData[]) => {
      perms.forEach(perm => {
        allPermissions.push(perm)
        if (perm.children) {
          collectPermissions(perm.children)
        }
      })
    }

    if (module.children) {
      collectPermissions(module.children)
    }

    return allPermissions
  }

  // 修复：为数据统计等非菜单模块也能显示权限
  const getModuleDisplayPermissions = (module: PermissionData) => {
    if (!module.children) return []

    // 先获取菜单类型的权限
    const menuPermissions = module.children.filter(perm => perm.type === 'menu')

    // 如果没有菜单权限，但有其他类型权限，则显示所有权限
    if (menuPermissions.length === 0 && module.children.length > 0) {
      return module.children
    }

    return menuPermissions
  }

  // 获取权限图标
  const getPermissionIcon = (type: PermissionType): string => {
    const iconMap = {
      menu: 'mdi:menu',
      button: 'mdi:gesture-tap-button',
      api: 'mdi:api',
    }
    return iconMap[type] || 'mdi:circle'
  }

  // 获取权限类型颜色
  const getPermissionTypeColor = (type: PermissionType) => {
    const colorMap = {
      menu: 'info',
      button: 'success',
      api: 'warning',
    }
    return colorMap[type] || 'default'
  }

  // 获取权限类型名称
  const getPermissionTypeName = (type: PermissionType) => {
    const nameMap = {
      menu: '菜单',
      button: '按钮',
      api: '接口',
    }
    return nameMap[type] || type
  }

  return {
    findPermissionById,
    findTopLevelPermission,
    getAllPermissionIds,
    hasMatchingPermissionInTree,
    hasPermissionTypeInTree,
    getModulePermissions,
    getModuleDisplayPermissions,
    getPermissionIcon,
    getPermissionTypeColor,
    getPermissionTypeName,
  }
}
