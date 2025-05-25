/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-16 15:19:02
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-25 02:20:00
 * @FilePath: \Robot_Admin\src\config\theme.ts
 * @Description: 主题配置
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

// 自定义主题覆盖类型，兼容naive-ui
/*!
 * 主题配置系统
 * 提供亮色和暗色两种主题配置，支持Naive UI组件库的主题覆盖
 *
 * 主题系统分为以下几部分：
 * 1. 类型定义 - 定义所有可配置的主题属性
 * 2. 主题常量 - 基础颜色、尺寸等常量
 * 3. 主题配置 - 亮色和暗色主题的具体配置
 * 4. 导出内容 - 导出的主题配置和常量
 */

/* =================
   1. 类型定义
   ======================== */

/**
 * 全局主题覆盖类型
 * 定义了所有可配置的主题属性，包括：
 * - 通用属性(common): 基础颜色、字体等
 * - 组件属性: 特定组件的样式配置(Menu, Button等)
 */
export interface GlobalThemeOverrides {
  /* 通用主题属性 */
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

  /* 菜单组件主题属性 */
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

  /* 按钮组件主题属性 */
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

/* =================/
   2. 主题常量
   ======================== */

/**
 * 主色系配置
 * 定义应用的主色调及其状态变化颜色
 */
const primaryColor = '#2080f0' // 主色 - 默认蓝色
const primaryColorHover = '#4098fc' // 主色悬停状态 - 稍亮的蓝色
const primaryColorPressed = '#1060c9' // 主色按下状态 - 稍暗的蓝色
const primaryColorSuppl = '#4098fc' // 主色补充色 - 同悬停状态

/* =================
   3. 主题配置
   ======================== */

/**
 * 亮色模式菜单配置
 * 定义亮色主题下菜单组件的各种状态颜色
 */
const lightMenuConfig: GlobalThemeOverrides['Menu'] = {
  color: '#0d1425', // 菜单背景色
  scrollbarColor: '#0d1425', // 滚动条颜色
  scrollbarColorHover: '#0d1425', // 滚动条悬停颜色
  itemTextColor: '#e5e7eb', // 菜单项文本颜色
  itemTextColorHover: '#f8fafc', // 菜单项悬停文本颜色
  itemTextColorActive: '#e5e7eb', // 菜单项激活文本颜色
  itemTextColorActiveHover: '#ffffff', // 菜单项激活悬停文本颜色
  itemTextColorChildActive: '#e5e7eb', // 子菜单激活文本颜色
  itemIconColor: '#e5e7eb', // 菜单项图标颜色
  itemIconColorHover: '#f8fafc', // 菜单项悬停图标颜色
  itemIconColorActive: '#e5e7eb', // 菜单项激活图标颜色
  itemIconColorActiveHover: '#ffffff', // 菜单项激活悬停图标颜色
  itemIconColorChildActive: '#e5e7eb', // 子菜单激活图标颜色
  arrowColor: '#e5e7eb', // 菜单箭头颜色
  arrowColorHover: '#f8fafc', // 菜单箭头悬停颜色
  arrowColorActive: '#e5e7eb', // 菜单箭头激活颜色
  arrowColorChildActive: '#e5e7eb', // 子菜单箭头激活颜色
  itemColorActive: '#2080F0', // 菜单项激活背景色
  itemColorActiveHover: '#2080F0', // 菜单项激活悬停背景色
  itemColorActiveCollapsed: '#2080F0', // 折叠菜单项激活背景色
  itemColorHover: 'rgba(255, 255, 255, 0.1)', // 菜单项悬停背景色
  itemPadding: '0 16px', // 菜单项内边距
  itemHeight: '44px', // 菜单项高度
  itemBorderRadius: '0', // 菜单项圆角
}

/**
 * 暗色模式菜单配置
 * 定义暗色主题下菜单组件的各种状态颜色
 */
const darkMenuConfig: GlobalThemeOverrides['Menu'] = {
  itemTextColor: '#e5e7eb', // 菜单项文本颜色
  itemTextColorHover: '#f8fafc', // 菜单项悬停文本颜色
  itemTextColorActive: '#e5e7eb', // 菜单项激活文本颜色
  itemTextColorActiveHover: '#ffffff', // 菜单项激活悬停文本颜色
  itemTextColorChildActive: '#e5e7eb', // 子菜单激活文本颜色
  itemIconColor: '#9ca3af', // 菜单项图标颜色 - 浅灰色
  itemIconColorHover: '#d1d5db', // 菜单项悬停图标颜色 - 更亮的灰色
  itemIconColorActive: '#9ca3af', // 菜单项激活图标颜色
  itemIconColorActiveHover: '#d1d5db', // 菜单项激活悬停图标颜色
  itemIconColorChildActive: '#9ca3af', // 子菜单激活图标颜色
  arrowColor: '#9ca3af', // 菜单箭头颜色
  arrowColorHover: '#d1d5db', // 菜单箭头悬停颜色
  arrowColorActive: '#9ca3af', // 菜单箭头激活颜色
  arrowColorChildActive: '#9ca3af', // 子菜单箭头激活颜色
  itemColorActive: 'rgba(32, 128, 240, 0.2)', // 菜单项激活背景色 - 半透明蓝色
  itemColorActiveHover: 'rgba(32, 128, 240, 0.3)', // 菜单项激活悬停背景色
  itemColorActiveCollapsed: 'rgba(32, 128, 240, 0.2)', // 折叠菜单项激活背景色
  itemColorHover: 'rgba(255, 255, 255, 0.08)', // 菜单项悬停背景色 - 半透明白色
  itemPadding: '0 16px', // 菜单项内边距
  itemHeight: '44px', // 菜单项高度
  itemBorderRadius: '0', // 菜单项圆角
}

/* =================
   4. 主题导出
   ======================== */

/**
 * 亮色主题全局配置
 * 包含通用属性和各组件在亮色模式下的配置
 */
export const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor,
    primaryColorHover,
    primaryColorPressed,
    primaryColorSuppl,
    infoColor: primaryColor, // 信息色使用主色
    infoColorHover: primaryColorHover,
    infoColorPressed: primaryColorPressed,
    infoColorSuppl: primaryColorSuppl,
    bodyColor: '#0d1425', // 亮色主题背景色
  },
  Menu: lightMenuConfig, // 亮色菜单配置
}

/**
 * 暗色主题全局配置
 * 包含通用属性和各组件在暗色模式下的配置
 */
export const darkThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor,
    primaryColorHover,
    primaryColorPressed,
    primaryColorSuppl,
    infoColor: primaryColor, // 信息色使用主色
    infoColorHover: primaryColorHover,
    infoColorPressed: primaryColorPressed,
    infoColorSuppl: primaryColorSuppl,
  },
  Menu: darkMenuConfig, // 暗色菜单配置
}

/**
 * 主题常量导出
 * 包含应用中使用的主要颜色常量
 */
export const themeConstants = {
  primaryColor,
  primaryColorHover,
  primaryColorPressed,
  primaryColorSuppl,
}
