/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-11 01:02:12
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-02 22:40:45
 * @FilePath: \Robot_Admin\src\router\permission.ts
 * @Description: 路由权限控制
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
import router from '@/router'
import { s_userStore } from '@/stores/user'
import { initDynamicRouter } from '@/router/dynamicRouter'
import { s_permissionStore } from '@/stores/permission'
import { createDiscreteApi } from 'naive-ui/es'
import { setupNProgress } from '@/plugins/nprogress'
import type { RouteLocationNormalized } from 'vue-router'

const { message } = createDiscreteApi(['message'])
const nprogress = setupNProgress()
const WHITE_LIST = ['/login', '/404', '/401']
const LOGIN_PATH = '/login'
const DEFAULT_TITLE = 'Robot Admin'

// 扩展 RouteMeta 类型
interface ExtendedRouteMeta {
  title?: string
  [key: string]: any
}

// 统一错误处理
const handleRouteError = (error: unknown, customMsg?: string): string => {
  nprogress.done()
  console.error('路由异常:', error)
  message.error(customMsg || '系统异常，请重新登录')
  s_userStore().$reset()
  return LOGIN_PATH
}

// 外部链接处理已移至组件层面，此处不再需要

// 设置页面标题
const setPageTitle = (title?: string): void => {
  document.title = title ? `${title} | ${DEFAULT_TITLE}` : DEFAULT_TITLE
}

// 处理未登录用户
const handleUnauthenticated = (path: string): string => {
  return WHITE_LIST.includes(path) ? path : LOGIN_PATH
}

// 初始化动态路由
const handleDynamicRouterInit = async (fullPath: string): Promise<string> => {
  try {
    await initDynamicRouter()
    return fullPath
  } catch (error) {
    return handleRouteError(error, '动态路由加载失败')
  }
}

// 核心路由守卫
router.beforeEach(
  async (to: RouteLocationNormalized): Promise<string | boolean> => {
    nprogress.start()

    try {
      const userStore = s_userStore()
      const { token } = userStore
      const { authMenuList } = s_permissionStore()
      const meta = to.meta as ExtendedRouteMeta

      // 未登录处理
      if (!token) {
        return handleUnauthenticated(to.path)
      }

      // 已登录但访问登录页
      if (to.path === LOGIN_PATH) {
        return '/'
      }

      // 动态路由初始化
      if (!authMenuList.length) {
        return await handleDynamicRouterInit(to.fullPath)
      }

      // 外部链接处理已移至组件层面

      // 设置页面标题
      setPageTitle(meta.title)
      return true
    } catch (error) {
      return handleRouteError(error)
    } finally {
      nprogress.done()
    }
  }
)

// 全局错误处理
router.onError((error: Error) => {
  nprogress.done()
  handleRouteError(error, '路由加载失败')
})
