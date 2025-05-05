import { createDiscreteApi } from 'naive-ui'
import { hashSync, genSaltSync } from 'bcryptjs'
import { getUserInfo, login } from '@/api/sys'
import { TOKEN } from '@/constant'
import router from '@/router'
import { d_setTimeStamp } from '@/utils/d_auth'
import { getItem, removeAllItem, setItem } from '@/hooks/useStorage'
import { s_appStore } from '@/stores/app/index'

const { notification } = createDiscreteApi(['notification'])

interface UserInfo {
  [key: string]: unknown
  //FIXME： 后续根据实际接口响应补充具体类型
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
    async getLoginInfo({
      username,
      password,
    }: {
      username: string
      password: string
    }) {
      try {
        // 增强密码哈希处理
        const hashedPassword = this._generatePasswordHash(password)
        const { data } = await login({ username, password: hashedPassword })
        if (data.code === '0') {
          this.handleLoginSuccess(data.token)
        }
      } catch {
        this.handleLoginError('登录失败，请检查登录接口数据')
      }
    },

    // 私有方法封装
    _generatePasswordHash(password: string): string {
      const salt = genSaltSync(10)
      return hashSync(password, salt)
    },

    handleLoginSuccess(token: string) {
      this.setToken(token)
      notification.success({ content: '登录成功', duration: 2000 })
      router.replace('/home')
      d_setTimeStamp()
    },

    handleLoginError(error: unknown) {
      notification.error({
        content: `登录失败: ${error instanceof Error ? error.message : '检查错误'}`,
        duration: 3000,
      })
    },

    setToken(token: string) {
      this.token = token
      setItem(TOKEN, token)
    },

    async getUserInfo() {
      const { data } = await getUserInfo()
      if (data.code === '0') {
        this.userInfo = data.data
      }
      return data
    },

    logout() {
      const resetState = () => {
        this.token = ''
        this.userInfo = {}
        removeAllItem()
        s_appStore().$reset()
      }

      resetState()
      router.replace('/login')
    },
  },
})
