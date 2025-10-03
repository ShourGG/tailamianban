/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-11 01:02:12
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-07-30 16:40:45
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

// 防止重复初始化
let isInitializing = false

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

// 设置页面标题
const setPageTitle = (title?: string): void => {
  document.title = title ? `${title} | ${DEFAULT_TITLE}` : DEFAULT_TITLE
}

// 初始化动态路由
const handleDynamicRouterInit = async (fullPath: string): Promise<string> => {
  // 防止重复初始化
  if (isInitializing) {
    console.log('⏳ 动态路由正在初始化，跳过重复请求')
    return fullPath
  }

  isInitializing = true

  try {
    // console.log('🚀 开始初始化动态路由...')
    const success = await initDynamicRouter()

    if (!success) {
      throw new Error('动态路由初始化失败')
    }

    // 再次检查菜单列表
    const { authMenuList } = s_permissionStore()
    if (!authMenuList.length) {
      throw new Error('菜单数据为空')
    }

    console.log('✅ 动态路由初始化成功')
    return fullPath
  } catch (error) {
    return handleRouteError(error, '动态路由加载失败')
  } finally {
    isInitializing = false
  }
}

// 核心路由守卫 - 简化版本
router.beforeEach(
  async (
    to: RouteLocationNormalized,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    from: RouteLocationNormalized
  ): Promise<string | boolean> => {
    nprogress.start()

    try {
      const userStore = s_userStore()
      const { token } = userStore
      const { authMenuList } = s_permissionStore()
      const meta = to.meta as ExtendedRouteMeta

      // console.log(`🚦 路由导航: ${from.path} -> ${to.path}`)

      // 1. 未登录处理
      if (!token) {
        if (WHITE_LIST.includes(to.path)) {
          setPageTitle(meta.title)
          return true
        }
        return LOGIN_PATH
      }

      // 2. 已登录但访问登录页 - 修复: 跳转到正确的首页路径
      if (to.path === LOGIN_PATH) {
        // console.log('✅ 已登录用户访问登录页，跳转到 /terraria/dashboard')
        return '/terraria/dashboard'
      }

      // 3. 动态路由初始化 - 简化逻辑
      if (!authMenuList.length && !isInitializing) {
        // console.log('🔄 需要初始化动态路由')
        const result = await handleDynamicRouterInit(to.fullPath)

        // 如果返回的是错误路径，直接重定向
        if (result !== to.fullPath) {
          return result
        }

        // 初始化成功，重新访问当前路径
        return to.fullPath
      }

      // 4. 正常访问
      setPageTitle(meta.title)
      return true
    } catch (error) {
      return handleRouteError(error)
    } finally {
      nprogress.done()
    }
  }
)

// 简化的错误处理
router.onError((error: Error) => {
  nprogress.done()
  console.error('🔥 路由错误:', error)

  // 只处理关键的 chunk 加载错误
  if (error.message.includes('Loading chunk')) {
    console.log('🔄 检测到 chunk 加载失败，刷新页面')
    window.location.reload()
    return
  }

  message.error('页面加载失败，请刷新重试')
})

// 后置钩子 - 只记录日志
router.afterEach((to, from, failure) => {
  if (failure) {
    console.error('❌ 路由跳转失败:', failure.message)
  } else {
    // console.log(`✅ 路由跳转成功: ${from.path} -> ${to.path}`)
  }
})
