import router from './index'
import { createDiscreteApi } from 'naive-ui/es'
import type { RouteRecordRaw } from 'vue-router'
import { s_permissionStore } from '@/stores/permission'

const { message: messageApi } = createDiscreteApi(['message'])

export interface RouteMeta extends Record<string, any> {
  title?: string
  icon?: string
  hidden?: boolean
  affix?: boolean
  keepAlive?: boolean
  full?: boolean
  link?: string
}

export interface DynamicRoute {
  path: string
  name?: string
  component?: string
  redirect?: string
  meta?: RouteMeta
  children?: DynamicRoute[]
}

// 预定义组件（使用对象字面量）
const COMPONENTS = {
  layout: () => import('@/components/global/C_Layout/index.vue'),
  '404': () => import('@/views/error-page/404.vue'),
} as const

/**
 * 路径规范化处理
 */
const normalizePath = (path: string, isChild: boolean): string => {
  if (import.meta.env.DEV && isChild && path.startsWith('/')) {
    console.warn(
      `[路由警告] 子路由path "${path}" 已包含前导/，请确认数据源是否需要修改`
    )
  }
  return isChild && !path.startsWith('/') ? `/${path}` : path
}

/**
 * 组件解析
 */
const resolveComponent = (path?: string) => {
  if (!path) return undefined

  // 检查预定义组件
  if (path in COMPONENTS) {
    return COMPONENTS[path as keyof typeof COMPONENTS]
  }

  try {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    const viewPath = `/src/views${normalizedPath}.vue`
    const modules = import.meta.glob('@/views/**/*.vue')

    // 开发环境下打印所有可用模块用于调试
    if (import.meta.env.DEV) {
      console.debug('[动态路由] 查找组件:', viewPath)
      console.debug('[动态路由] 可用组件:', Object.keys(modules))
    }

    // 直接查找精确匹配
    if (modules[viewPath]) {
      return modules[viewPath]
    }

    // 尝试模糊匹配，处理路径格式不一致问题
    const possiblePaths = [
      `/src/views${normalizedPath}.vue`,
      `/src/views${normalizedPath}/index.vue`,
      normalizedPath.endsWith('/index')
        ? `/src/views${normalizedPath}.vue`
        : `/src/views${normalizedPath}/index.vue`
    ]

    for (const possiblePath of possiblePaths) {
      if (modules[possiblePath]) {
        console.log(`[动态路由] 路径匹配成功: ${possiblePath}`)
        return modules[possiblePath]
      }
    }

    // 更详细的错误日志
    console.warn(
      `[动态路由] 组件不存在，请检查路径:\n` +
      `  期望路径: ${viewPath}\n` +
      `  尝试路径: ${possiblePaths.join(', ')}\n` +
      `  可用组件: ${Object.keys(modules).filter(key => key.includes(normalizedPath.split('/').pop() || '')).join(', ')}`
    )
    return COMPONENTS['404']
  } catch (error) {
    console.error('[动态路由] 组件解析失败:', error)
    return COMPONENTS['404']
  }
}

/**
 * 路由处理中间件
 */
const processRoute = (route: DynamicRoute, isChild = false): RouteRecordRaw => {
  return {
    ...route,
    path: normalizePath(route.path, isChild),
    component: resolveComponent(route.component),
    children: route.children?.map(child => processRoute(child, true)),
    meta: {
      ...route.meta,
      isLayout: route.component === 'layout',
    },
  } as RouteRecordRaw
}

/**
 * 清理现有路由
 */
export const clearExistingRoutes = (protectedNames = ['login']) => {
  router
    .getRoutes()
    .filter(r => r.name && !protectedNames.includes(r.name.toString()))
    .forEach(r => router.removeRoute(r.name!))
}

/**
 * 统一错误处理
 */
const handleRouteError = (error: unknown): string => {
  const message = error instanceof Error ? error.message : '路由初始化失败'
  console.error('[动态路由] 初始化失败:', error)
  messageApi.error(message)
  return message
}

/**
 * 初始化动态路由
 */
export const initDynamicRouter = async (): Promise<boolean> => {
  try {
    const permissionStore = s_permissionStore()
    const { code, data: routes, msg } = await permissionStore.getAuthMenuList()

    if (code !== '0' || !Array.isArray(routes)) {
      throw new Error(msg || '无效的路由数据格式')
    }

    clearExistingRoutes(['login', '404', '401'])

    routes
      .map(route => processRoute(route as DynamicRoute))
      .forEach(route => router.addRoute(route))

    if (import.meta.env.DEV) {
      console.debug('[动态路由] 初始化完成:', router.getRoutes())
    }

    return true
  } catch (error) {
    handleRouteError(error)
    return false
  }
}

// 开发环境调试工具
if (import.meta.env.DEV)
  router.afterEach(to => console.debug('[动态路由] 导航至:', to.path))
