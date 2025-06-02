import { darkTheme, lightTheme, type GlobalTheme } from 'naive-ui/es'
import {
  themeOverrides,
  darkThemeOverrides,
  type GlobalThemeOverrides,
} from '@/config/theme'

// 本地存储键名常量
const THEME_MODE_KEY = 'theme-mode'
const THEME_OVERRIDES_KEY = 'theme-overrides'

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

    // 暗色模式背景色
    darkModeBgColor(): string {
      return '#1c1c1c'
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
      const savedMode = localStorage.getItem(THEME_MODE_KEY) as ThemeMode
      if (savedMode) {
        this.mode = savedMode
      }

      // 尝试从本地存储加载自定义主题覆盖
      const savedOverrides = localStorage.getItem(THEME_OVERRIDES_KEY)
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

    // 设置主题模式 - 丝滑过渡
    async setMode(mode: ThemeMode) {
      // 预先创建丝滑过渡的style
      const transitionStyle = document.createElement('style')
      transitionStyle.textContent = `
        /* 添加全局过渡效果 */
        .layout-container :deep(.n-layout .n-layout-scroll-container),
        .layout-sider,
        .n-menu,
        .layout-header,
        .layout-footer,
        .light-theme,
        .dark-theme {
          transition: background-color 0.35s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        /* 减少内容闪烁 */
        .layout-container {
          opacity: 0.95;
          transition: opacity 0.35s ease-in-out;
        }
      `
      document.head.appendChild(transitionStyle)

      // 应用主题前等待DOM更新
      await new Promise(resolve => setTimeout(resolve, 10))

      // 增加透明度过渡
      document
        .querySelector('.layout-container')
        ?.classList.add('theme-transitioning')

      // 设置主题
      this.mode = mode
      localStorage.setItem(THEME_MODE_KEY, mode)

      // 确保DOM更新
      await new Promise(resolve => requestAnimationFrame(resolve))

      // 等待过渡完成后清理
      setTimeout(() => {
        // 恢复透明度
        document
          .querySelector('.layout-container')
          ?.classList.remove('theme-transitioning')

        // 移除临时样式
        setTimeout(() => {
          document.head.removeChild(transitionStyle)
        }, 400)
      }, 350)
    },

    // 更新主题覆盖配置
    updateThemeOverrides(overrides: Partial<GlobalThemeOverrides>) {
      this.customOverrides = {
        ...this.customOverrides,
        ...overrides,
      }
      // 将自定义主题保存到本地存储
      localStorage.setItem(
        THEME_OVERRIDES_KEY,
        JSON.stringify(this.customOverrides)
      )
    },

    // 重置主题覆盖为默认配置
    resetThemeOverrides() {
      this.customOverrides = themeOverrides
      localStorage.removeItem(THEME_OVERRIDES_KEY)
    },
  },
})
