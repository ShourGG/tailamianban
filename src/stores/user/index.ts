import { defineStore } from 'pinia'
import { TOKEN } from '@/constant'
import { setItem, getItem, removeAllItem } from '@/hooks/useStorage'
import router from '@/router'
import { d_setTimeStamp } from '@/utils/d_auth'
import { createDiscreteApi } from 'naive-ui'
import { s_appStore } from '@/stores/app/index'
const { notification } = createDiscreteApi(['notification'])

interface UserInfo {
  [key: string]: unknown
  // TODO: 根据实际接口响应补充具体类型
}

export const s_userStore = defineStore('user', {
  state: () => ({
    token: getItem<string>(TOKEN) ?? '',
    userInfo: {} as UserInfo,
  }),

  getters: {
    hasUserInfo: state => Object.keys(state.userInfo).length > 0,
  },

  actions: {
    setToken(token: string) {
      this.token = token
      setItem(TOKEN, token)
    },

    setUserInfo(userInfo: UserInfo) {
      this.userInfo = userInfo
    },

    async logout() {
      try {
        // 1. 清除用户状态
        this.token = ''
        this.userInfo = {}

        // 2. 重置页面标题（关键修复点）
        document.title = import.meta.env.VITE_APP_TITLE

        // 3. 清除存储的数据,重置其他store状态
        removeAllItem()
        s_appStore().$reset()

        // 4. 清理动态路由
        const { clearExistingRoutes } = await import('@/router/dynamicRouter')
        clearExistingRoutes()

        // 5. 确保Vue响应式更新后导航
        router.replace('/login')
        notification.success({
          content: '已退出登录',
          duration: 3000,
        })
      } catch (error) {
        console.error('退出登录失败:', error)
        // 如果出错，仍然尝试跳转到登录页
        router.replace('/login')
      }
    },

    handleLoginSuccess(token: string) {
      this.setToken(token)
      router.replace('/home')
      d_setTimeStamp()
    },

    handleLoginError(error: unknown) {
      notification.error({
        content: `登录失败: ${error instanceof Error ? error.message : String(error) || '检查错误'}`,
        duration: 3000,
      })
    },
  },
})
