/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-07-10 08:49:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-07-11 23:26:10
 * @FilePath: \Robot_Admin\src\lib\version.ts
 * @Description: 版本信息管理工具(配合release-please)
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

// x-release-please-start-version
export const VERSION = '1.0.0'
// x-release-please-end-version

export const BUILD_TIME = new Date().toISOString()

/**
 * 获取完整版本信息
 */
export const getVersionInfo = () => {
  return {
    version: VERSION,
    buildTime: BUILD_TIME,
    environment: import.meta.env.MODE,
    author: 'CHENY',
    description: 'Robot Admin 后台管理系统',
  }
}

/**
 * 在控制台显示版本信息
 */
export const showVersionInfo = () => {
  const info = getVersionInfo()
  console.log(`
🚀 ${info.description}
📦 版本: v${info.version}
🕐 构建时间: ${info.buildTime}
🌍 运行环境: ${info.environment}
👨‍💻 作者: ${info.author}
  `)
}

// 自动显示版本信息（开发环境）
if (import.meta.env.DEV) {
  showVersionInfo()
}
