import router from './index'
import { createDiscreteApi } from 'naive-ui'
import type { RouteRecordRaw, RouteComponent } from 'vue-router'
import { getFlatArr } from '@/utils/d_route'
import { s_permissionStore } from '@/stores/permission'

const LAYOUT_NAME = 'C_Layout'
const modules = import.meta.glob('@/views/**/*.vue')

// 动态路由类型
interface DynamicRouteItem
  extends Omit<RouteRecordRaw, 'component' | 'children'> {
  component?: string
  children?: DynamicRouteItem[]
  redirect?: string
}

/**
 * @description: 处理路由组件路径
 * @param {string} path 组件路径
 * 1. 以 / 开头的路径直接使用
 * 2. 其他路径添加前缀 /src/views
 * 3. 如果路径以 .vue 结尾，则去掉 .vue 后缀
 * 4. 如果路径不存在，则返回 404 组件
 * 5. 如果路径存在，则返回对应的组件
 * @return {*} {RouteComponent | undefined}
 */
const resolveComponent = (path?: string): RouteComponent | undefined => {
  if (!path) return

  const normalized = path.startsWith('/') ? path : `/${path}`
  const viewPath = `/src/views${normalized.replace(/\.vue$/, '')}.vue`
  return modules[viewPath] || (() => import('@/views/error-page/404.vue'))
}

/**
 * @description: 处理路由项
 * @param {DynamicRouteItem} item 路由项
 * 1. 将路由项中的 component 属性转换为组件对象
 * 2. 如果路由项中有 redirect 属性，则将其转换为重定向路由
 * 3. 返回处理后的路由项
 * @return {*} {RouteRecordRaw} 处理后的路由项
 */
const processRouteItem = (item: DynamicRouteItem): RouteRecordRaw => {
  const { component, redirect, ...rest } = item
  return {
    ...rest,
    ...(redirect ? { redirect } : { component: resolveComponent(component) }),
  } as RouteRecordRaw
}

/**
 * @description: 处理路由错误
 * @param {unknown} error 错误对象
 * @return {*} {Promise<never>} 返回一个拒绝的 Promise
 */

const { notification } = createDiscreteApi(['notification'])

const handleError = (error: unknown) => {
  router.replace('/login')
  const msg = error instanceof Error ? error : new Error('路由初始化失败')
  notification.error({
    content: '路由初始化失败，检查dynamicRouter',
    meta: msg.message,
    duration: 3000,
  })
  return Promise.reject(msg)
}

/**
 * @description: 初始化动态路由
 * 1. 获取权限菜单列表和按钮列表
 * 2. 如果没有权限菜单列表，则返回错误
 * 3. 处理权限菜单列表和按钮列表
 * 4. 遍历权限菜单列表和按钮列表，将路由项添加到路由表中
 * 5. 返回路由表
 * @return {*} {Promise<boolean>} 返回一个 Promise，表示路由初始化是否成功
 */
export const initDynamicRouter = async () => {
  try {
    const permissionStore = s_permissionStore()
    await Promise.all([
      permissionStore.getAuthMenuList(),
      permissionStore.getAuthButtonList(),
    ])

    if (!permissionStore.authMenuListGet.length) {
      return handleError(
        new Error('当前账号无任何菜单权限，请联系系统管理员！')
      )
    }

    /**
     * @description: 扁平化路由数组
     * @return {*} {RouteRecordRaw[]} 扁平化后的路由数组
     */
    getFlatArr(structuredClone(permissionStore.authMenuListGet))
      .map(processRouteItem)
      .forEach((item: RouteRecordRaw) => {
        if (!item.name || router.hasRoute(item.name)) return

        if (item.meta?.full) {
          router.addRoute(item) // 独立路由
        } else {
          router.addRoute(LAYOUT_NAME, item) // 嵌套路由
        }
      })

    return true
  } catch (error) {
    return handleError(error)
  }
}
