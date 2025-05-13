/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-11 01:02:12
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-13 11:16:41
 * @FilePath: \Robot_Admin\src\router\permission.ts
 * @Description: 路由权限控制
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
import router from '@/router'
import { s_userStore } from '@/stores/user'
import { initDynamicRouter } from '@/router/dynamicRouter'
import { s_permissionStore } from '@/stores/permission'
import { createDiscreteApi } from 'naive-ui'
import { setupNProgress } from '@/plugins/nprogress'

const { message } = createDiscreteApi(['message'])
const nprogress = setupNProgress()
const WHITE_LIST = ['/login', '/404', '/401']
const LOGIN_PATH = '/login'
const DEFAULT_TITLE = 'Robot Admin'

// 统一错误处理
const handleRouteError = (error: unknown, customMsg?: string) => {
  nprogress.done() // 结束进度条
  console.error('路由异常:', error)
  message.error(customMsg || '系统异常，请重新登录')
  s_userStore().$reset()
  return LOGIN_PATH
}

// 核心路由守卫
router.beforeEach(async to => {
  nprogress.start() // 开始进度条

  try {
    const userStore = s_userStore()
    const { token } = userStore
    const { authMenuList } = s_permissionStore()

    // 未登录处理
    if (!token) return WHITE_LIST.includes(to.path) || LOGIN_PATH

    // 已登录逻辑
    if (to.path === LOGIN_PATH) return '/'

    // 动态路由初始化
    if (!authMenuList.length) {
      try {
        await initDynamicRouter()
        return to.fullPath
      } catch (error) {
        return handleRouteError(error, '动态路由加载失败')
      }
    }

    // 外部链接处理
    if (to.path.startsWith('http')) {
      window.open(to.path, '_blank')
      return false
    }

    // 设置页面标题
    document.title = to.meta.title
      ? `${to.meta.title} | ${DEFAULT_TITLE}`
      : DEFAULT_TITLE
    return true
  } catch (error) {
    return handleRouteError(error)
  } finally {
    nprogress.done() // 结束进度条
  }
})

// 全局错误处理
router.onError(error => {
  nprogress.done() // 确保错误时进度条也会结束
  handleRouteError(error, '路由加载失败')
})
