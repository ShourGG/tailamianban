import { darkTheme, lightTheme, type GlobalTheme } from 'naive-ui'

export type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeState {
  mode: ThemeMode
  systemIsDark: boolean
}

export const useThemeStore = defineStore('theme', {
  state: (): ThemeState => ({
    mode: 'system', // 默认跟随系统
    systemIsDark: false,
  }),

  getters: {
    // 当前主题
    currentTheme(): GlobalTheme {
      if (this.mode === 'system') {
        return this.systemIsDark ? darkTheme : lightTheme
      }
      return this.mode === 'dark' ? darkTheme : lightTheme
    },

    // 是否暗色模式
    isDark(): boolean {
      return (
        this.mode === 'dark' || (this.mode === 'system' && this.systemIsDark)
      )
    },
  },

  actions: {
    // 初始化主题
    init() {
      // 从localStorage读取主题设置
      const savedMode = localStorage.getItem('theme-mode') as ThemeMode
      if (savedMode) {
        this.mode = savedMode
      }

      // 监听系统主题变化
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      this.systemIsDark = mediaQuery.matches

      mediaQuery.addEventListener('change', e => {
        this.systemIsDark = e.matches
      })
    },

    // 设置主题模式
    setMode(mode: ThemeMode) {
      this.mode = mode
      localStorage.setItem('theme-mode', mode)
    },
  },
})
