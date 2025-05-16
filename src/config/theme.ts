/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-16 15:19:02
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-16 18:06:28
 * @FilePath: \Robot_Admin\src\config\theme.ts
 * @Description:
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
// 自定义主题覆盖类型，兼容旧版本naive-ui
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
    color?: string // 菜单背景色
    scrollbarColor?: string // 滚动条颜色
    scrollbarColorHover?: string // 滚动条悬停颜色
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

// 主题色配置
const primaryColor = '#2080f0'
const primaryColorHover = '#4098fc'
const primaryColorPressed = '#1060c9'
const primaryColorSuppl = '#4098fc'

// 菜单主题色配置 (固定样式，不随主题变化)
const menuThemeColors = {
  // 固定菜单背景色
  color: 'rgb(8 20 38)',
  scrollbarColor: 'rgb(8 20 38)',
  scrollbarColorHover: 'rgb(8 20 38)',

  // 文字颜色
  itemTextColor: '#e5e7eb', // 默认文字颜色
  itemTextColorHover: '#f8fafc', // 普通悬停文字颜色
  itemTextColorActive: '#e5e7eb', // 选中项文字颜色
  itemTextColorActiveHover: '#ffffff', // 选中项悬停文字变白
  itemTextColorChildActive: '#e5e7eb',

  // 图标颜色
  itemIconColor: '#e5e7eb', // 默认图标颜色
  itemIconColorHover: '#f8fafc', // 普通悬停图标颜色
  itemIconColorActive: '#e5e7eb', // 选中项图标颜色
  itemIconColorActiveHover: '#ffffff', // 选中项悬停图标变白
  itemIconColorChildActive: '#e5e7eb',

  // 箭头颜色
  arrowColor: '#e5e7eb',
  arrowColorHover: '#f8fafc',
  arrowColorActive: '#e5e7eb',
  arrowColorChildActive: '#e5e7eb',

  // 背景色状态
  itemColorActive: '#2080F0', // 选中项蓝色背景
  itemColorActiveHover: '#2080F0', // 选中项悬停保持蓝色背景
  itemColorActiveCollapsed: '#2080F0', // 折叠状态
  itemColorHover: 'rgba(255, 255, 255, 0.1)', // 普通悬停背景

  // 确保菜单项撑满
  itemPadding: '0 16px',
  itemHeight: '44px',
  itemBorderRadius: '0',
}

// 暗色模式使用同样的菜单配置
const darkMenuThemeColors = menuThemeColors

// 全局主题变量覆盖
export const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: primaryColor,
    primaryColorHover: primaryColorHover,
    primaryColorPressed: primaryColorPressed,
    primaryColorSuppl: primaryColorSuppl,

    // 其他全局颜色变量
    infoColor: primaryColor,
    infoColorHover: primaryColorHover,
    infoColorPressed: primaryColorPressed,
    infoColorSuppl: primaryColorSuppl,
  },

  // 菜单组件主题覆盖
  Menu: menuThemeColors,

  // 按钮组件主题覆盖
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

  // 其他组件主题覆盖...可以根据需要添加
}

// 暗色主题变量覆盖
export const darkThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: primaryColor,
    primaryColorHover: primaryColorHover,
    primaryColorPressed: primaryColorPressed,
    primaryColorSuppl: primaryColorSuppl,

    // 其他全局颜色变量
    infoColor: primaryColor,
    infoColorHover: primaryColorHover,
    infoColorPressed: primaryColorPressed,
    infoColorSuppl: primaryColorSuppl,
  },

  // 菜单组件主题覆盖 - 暗色模式
  Menu: darkMenuThemeColors,

  // 按钮组件主题覆盖
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

// 导出主题相关的常量
export const themeConstants = {
  primaryColor,
  primaryColorHover,
  primaryColorPressed,
  primaryColorSuppl,
}
