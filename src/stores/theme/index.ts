import { darkTheme, lightTheme, type GlobalTheme } from 'naive-ui'
import {
  themeOverrides,
  darkThemeOverrides,
  type GlobalThemeOverrides,
} from '@/config/theme'

export type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeState {
  mode: ThemeMode
  systemIsDark: boolean
  customOverrides: GlobalThemeOverrides
}

export const useThemeStore = defineStore('theme', {
  state: (): ThemeState => ({
    mode: 'system', // 默认跟随系统
    systemIsDark: false,
    customOverrides: themeOverrides, // 使用配置的主题覆盖
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

    // 获取主题覆盖配置
    themeOverrides(): GlobalThemeOverrides {
      // 根据暗色/亮色模式使用不同的主题配置
      const baseOverrides = this.isDark ? darkThemeOverrides : themeOverrides
      return {
        ...baseOverrides,
        ...this.customOverrides,
        common: {
          ...baseOverrides.common,
          ...this.customOverrides.common,
          // 确保主题色变量可用
          primaryColor:
            this.customOverrides.common?.primaryColor ||
            baseOverrides.common?.primaryColor,
          primaryColorHover:
            this.customOverrides.common?.primaryColorHover ||
            baseOverrides.common?.primaryColorHover,
        },
        Menu: {
          ...baseOverrides.Menu,
          ...this.customOverrides.Menu,
        },
      }
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

      // 尝试从本地存储加载自定义主题覆盖
      const savedOverrides = localStorage.getItem('theme-overrides')
      if (savedOverrides) {
        try {
          const parsedOverrides = JSON.parse(savedOverrides)
          this.customOverrides = parsedOverrides
        } catch (e) {
          console.error('Failed to parse saved theme overrides:', e)
          // 如果解析失败，使用默认配置
          this.customOverrides = themeOverrides
        }
      }

      // 监听系统主题变化
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      this.systemIsDark = mediaQuery.matches

      mediaQuery.addEventListener('change', e => {
        this.systemIsDark = e.matches
      })
    },

    // 设置主题模式 - 彻底解决闪烁问题
    async setMode(mode: ThemeMode) {
      // 1. 预加载目标主题样式
      const preloadStyle = document.createElement('style')
      const targetTheme = mode === 'dark' ? darkThemeOverrides : themeOverrides
      preloadStyle.textContent = `
        .layout-sider, .n-menu {
          background-color: ${targetTheme.Menu?.color || targetTheme.common?.bodyColor} !important;
          transition: none !important;
        }
      `
      document.head.appendChild(preloadStyle)

      // 2. 确保样式已应用
      await new Promise(resolve => requestAnimationFrame(resolve))
      void document.documentElement.offsetHeight

      // 3. 执行主题切换
      this.mode = mode
      localStorage.setItem('theme-mode', mode)

      // 4. 等待naive-ui完成主题计算
      await new Promise(resolve => setTimeout(resolve, 0))

      // 5. 恢复过渡效果
      setTimeout(() => {
        document.head.removeChild(preloadStyle)
      }, 300)
    },

    // 更新主题覆盖配置
    updateThemeOverrides(overrides: Partial<GlobalThemeOverrides>) {
      this.customOverrides = {
        ...this.customOverrides,
        ...overrides,
      }
      // 将自定义主题保存到本地存储
      localStorage.setItem(
        'theme-overrides',
        JSON.stringify(this.customOverrides)
      )
    },

    // 重置主题覆盖为默认配置
    resetThemeOverrides() {
      this.customOverrides = themeOverrides
      localStorage.removeItem('theme-overrides')
    },
  },
})
