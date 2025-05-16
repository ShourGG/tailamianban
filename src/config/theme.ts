/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-16 15:19:02
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-16 19:42:58
 * @FilePath: \Robot_Admin\src\config\theme.ts
 * @Description: 主题配置
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

// 自定义主题覆盖类型，兼容naive-ui
export interface GlobalThemeOverrides {
  common?: {
    primaryColor?: string
    primaryColorHover?: string
    primaryColorPressed?: string
    primaryColorSuppl?: string
    infoColor?: string
    infoColorHover?: string
    infoColorPressed?: string
    infoColorSuppl?: string
    bodyColor?: string
    [key: string]: string | undefined
  }
  Menu?: {
    itemTextColor?: string
    itemTextColorHover?: string
    itemTextColorActive?: string
    itemTextColorChildActive?: string
    itemColorActive?: string
    itemColorActiveHover?: string
    itemColorActiveCollapsed?: string
    arrowColor?: string
    arrowColorHover?: string
    arrowColorActive?: string
    arrowColorChildActive?: string
    itemIconColor?: string
    itemIconColorHover?: string
    itemIconColorActive?: string
    itemIconColorChildActive?: string
    itemColorHover?: string
    color?: string
    scrollbarColor?: string
    scrollbarColorHover?: string
    [key: string]: string | undefined
  }
  Button?: {
    textColor?: string
    textColorHover?: string
    textColorPressed?: string
    textColorFocus?: string
    borderColor?: string
    borderColorHover?: string
    borderColorPressed?: string
    borderColorFocus?: string
    [key: string]: string | undefined
  }
  [key: string]: Record<string, string | undefined> | undefined
}

// 主题色常量
const primaryColor = '#2080f0'
const primaryColorHover = '#4098fc'
const primaryColorPressed = '#1060c9'
const primaryColorSuppl = '#4098fc'

// 亮色模式菜单配置
const lightMenuConfig: GlobalThemeOverrides['Menu'] = {
  color: '#0d1425',
  scrollbarColor: '#0d1425',
  scrollbarColorHover: '#0d1425',
  itemTextColor: '#e5e7eb',
  itemTextColorHover: '#f8fafc',
  itemTextColorActive: '#e5e7eb',
  itemTextColorActiveHover: '#ffffff',
  itemTextColorChildActive: '#e5e7eb',
  itemIconColor: '#e5e7eb',
  itemIconColorHover: '#f8fafc',
  itemIconColorActive: '#e5e7eb',
  itemIconColorActiveHover: '#ffffff',
  itemIconColorChildActive: '#e5e7eb',
  arrowColor: '#e5e7eb',
  arrowColorHover: '#f8fafc',
  arrowColorActive: '#e5e7eb',
  arrowColorChildActive: '#e5e7eb',
  itemColorActive: '#2080F0',
  itemColorActiveHover: '#2080F0',
  itemColorActiveCollapsed: '#2080F0',
  itemColorHover: 'rgba(255, 255, 255, 0.1)',
  itemPadding: '0 16px',
  itemHeight: '44px',
  itemBorderRadius: '0',
}

// 暗色模式菜单配置
const darkMenuConfig: GlobalThemeOverrides['Menu'] = {
  color: 'rgb(16, 16, 20)',
  scrollbarColor: 'rgb(16, 16, 20)',
  scrollbarColorHover: 'rgb(24, 24, 28)',
  itemTextColor: '#e5e7eb',
  itemTextColorHover: '#f8fafc',
  itemTextColorActive: '#e5e7eb',
  itemTextColorActiveHover: '#ffffff',
  itemTextColorChildActive: '#e5e7eb',
  itemIconColor: '#9ca3af',
  itemIconColorHover: '#d1d5db',
  itemIconColorActive: '#9ca3af',
  itemIconColorActiveHover: '#d1d5db',
  itemIconColorChildActive: '#9ca3af',
  arrowColor: '#9ca3af',
  arrowColorHover: '#d1d5db',
  arrowColorActive: '#9ca3af',
  arrowColorChildActive: '#9ca3af',
  itemColorActive: 'rgba(32, 128, 240, 0.2)',
  itemColorActiveHover: 'rgba(32, 128, 240, 0.3)',
  itemColorActiveCollapsed: 'rgba(32, 128, 240, 0.2)',
  itemColorHover: 'rgba(255, 255, 255, 0.08)',
  itemPadding: '0 16px',
  itemHeight: '44px',
  itemBorderRadius: '0',
}

// 亮色主题全局配置
export const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor,
    primaryColorHover,
    primaryColorPressed,
    primaryColorSuppl,
    infoColor: primaryColor,
    infoColorHover: primaryColorHover,
    infoColorPressed: primaryColorPressed,
    infoColorSuppl: primaryColorSuppl,
    bodyColor: '#0d1425',
  },
  Menu: lightMenuConfig,
  Button: {
    textColor: primaryColor,
    textColorHover: primaryColorHover,
    textColorPressed: primaryColorPressed,
    textColorFocus: primaryColor,
    borderColor: primaryColor,
    borderColorHover: primaryColorHover,
    borderColorPressed: primaryColorPressed,
    borderColorFocus: primaryColor,
  },
}

// 暗色主题全局配置
export const darkThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor,
    primaryColorHover,
    primaryColorPressed,
    primaryColorSuppl,
    infoColor: primaryColor,
    infoColorHover: primaryColorHover,
    infoColorPressed: primaryColorPressed,
    infoColorSuppl: primaryColorSuppl,
    bodyColor: 'rgb(16, 16, 20)',
  },
  Menu: darkMenuConfig,
  Button: {
    textColor: primaryColor,
    textColorHover: primaryColorHover,
    textColorPressed: primaryColorPressed,
    textColorFocus: primaryColor,
    borderColor: primaryColor,
    borderColorHover: primaryColorHover,
    borderColorPressed: primaryColorPressed,
    borderColorFocus: primaryColor,
  },
}

// 导出主题常量
export const themeConstants = {
  primaryColor,
  primaryColorHover,
  primaryColorPressed,
  primaryColorSuppl,
}
