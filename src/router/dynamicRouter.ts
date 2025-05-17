import router from './index'
import { createDiscreteApi } from 'naive-ui'
import type { RouteRecordRaw } from 'vue-router'
import { s_permissionStore } from '@/stores/permission'

const { message: messageApi } = createDiscreteApi(['message'])

// 类型定义保持不变
export interface DynamicRoute {
  path: string
  name?: string
  component?: string
  redirect?: string
  meta?: {
    title?: string
    icon?: string
    hidden?: boolean
    affix?: boolean
    keepAlive?: boolean
    full?: boolean
    link?: string
    [key: string]: any
  }
  children?: DynamicRoute[]
}

// 预定义的组件映射
const componentMap = new Map([
  ['layout', () => import('@/components/global/C_Layout/index.vue')],
  ['404', () => import('@/views/error-page/404.vue')],
])

/**
 * 增强版组件解析
 */
const resolveComponent = (path?: string) => {
  if (!path) return undefined

  // 检查预定义组件
  if (componentMap.has(path)) {
    return componentMap.get(path)
  }

  try {
    // 动态加载业务组件
    const viewPath = `/src/views${path.startsWith('/') ? path : `/${path}`}.vue`
    const modules = import.meta.glob('@/views/**/*.vue')

    if (modules[viewPath]) {
      return modules[viewPath]
    }

    console.warn(`[动态路由] 组件不存在: ${viewPath}`)
    return componentMap.get('404')
  } catch (error) {
    console.error('[动态路由] 组件解析失败:', error)
    return componentMap.get('404')
  }
}

/**
 * 路由处理中间件（核心修改）
 */
const processRoute = (route: DynamicRoute, isChild = false): RouteRecordRaw => {
  // 开发环境下检查子路由path是否已包含/
  if (import.meta.env.DEV && isChild && route.path.startsWith('/')) {
    console.warn(
      `[路由警告] 子路由path "${route.path}" 已包含前导/，请确认数据源是否需要修改`,
      route
    )
  }

  // 自动处理子路由path（不修改原始数据）
  const processedPath =
    isChild && !route.path.startsWith('/') ? `/${route.path}` : route.path

  return {
    ...route,
    path: processedPath,
    component: resolveComponent(route.component),
    children: route.children?.map(child => processRoute(child, true)), // 标记为子路由
    meta: {
      ...route.meta,
      isLayout: route.component === 'layout',
    },
  } as RouteRecordRaw
}

/**
 * 清理现有路由
 */
export const clearExistingRoutes = () => {
  router
    .getRoutes()
    .filter(r => r.name && r.name !== 'login')
    .forEach(r => router.removeRoute(r.name!))
}

/**
 * 初始化动态路由
 */
export const initDynamicRouter = async (): Promise<boolean> => {
  try {
    const permissionStore = s_permissionStore()

    // 获取路由数据
    const { code, data: routes, msg } = await permissionStore.getAuthMenuList()

    // 验证数据
    if (code !== '0' || !Array.isArray(routes)) {
      throw new Error(msg || '无效的路由数据格式')
    }

    // 清理旧路由
    clearExistingRoutes()

    // 处理并添加新路由（修改调用方式）
    routes
      .map(route => processRoute(route))
      .forEach(route => router.addRoute(route))

    // 开发环境日志
    if (import.meta.env.DEV) {
      console.debug('[动态路由] 初始化完成:', router.getRoutes())
    }

    return true
  } catch (error) {
    const message = error instanceof Error ? error.message : '路由初始化失败'
    console.error('[动态路由] 初始化失败:', error)
    messageApi.error(message)
    return false
  }
}

// 开发环境路由变化监听
if (import.meta.env.DEV) {
  router.afterEach(to => {
    console.debug('[动态路由] 导航至:', to.path)
  })
}
