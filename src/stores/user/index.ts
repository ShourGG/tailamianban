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

    handleLoginSuccess(token: string) {
      this.setToken(token)
      // 成功后跳转
      router.replace('/home')
      d_setTimeStamp()
    },

    handleLoginError(error: unknown) {
      notification.error({
        content: `登录失败: ${error instanceof Error ? error.message : String(error) || '检查错误'}`,
        duration: 3000,
      })
    },

    setUserInfo(userInfo: UserInfo) {
      this.userInfo = userInfo
    },

    async logout() {
      this.token = ''
      this.userInfo = {}
      removeAllItem()
      s_appStore().$reset()
      router.replace('/login')
    },
  },
})
