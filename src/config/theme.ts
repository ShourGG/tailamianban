/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-13 16:05:31
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-13 16:05:55
 * @FilePath: \Robot_Admin\src\config\theme.ts
 * @Description: 主题配置文件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { GlobalThemeOverrides } from 'naive-ui'

// 主题色配置
const primaryColor = '#1677ff'
const primaryHover = '#4096ff'

// 主题配置
export const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: primaryColor,
    primaryColorHover: primaryHover,
    primaryColorPressed: primaryHover,
    primaryColorSuppl: primaryColor,
  },
  Button: {
    textColor: '#fff',
    borderRadius: '4px',
  },
  Card: {
    borderRadius: '8px',
  },
  Menu: {
    borderRadius: '4px',
  },
  Input: {
    borderRadius: '4px',
  },
  // 可以继续添加其他组件的主题配置...
}
