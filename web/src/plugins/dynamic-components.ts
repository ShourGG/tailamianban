/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-25 14:11:31
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-09-29 16:38:00
 * @FilePath: \Robot_Admin\src\plugins\dynamic-components.ts
 * @Description: 动态组件加载插件(处理:is 动态组件加载)
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
import {
  type App,
  type Component,
  defineAsyncComponent,
} from 'vue'

/**
 * * @description 组件路径映射表，键为组件名称，值为异步导入组件的函数
 */
const componentPaths: Record<string, () => Promise<unknown>> = {}

/**
 * * @description 这里使用 `import.meta.glob` 异步导入 `@/components` 目录下及其子目录下的所有 `.vue` 文件
 * ? @param path - 文件的完整路径
 * ! 修复 Windows 构建路径问题
 */
const modules = import.meta.glob('../components/**/*.vue')

/**
 * * @description 提取文件路径中的文件名和目录名
 * ? @param path - 文件的完整路径
 * ! @returns 包含文件名和目录名的对象
 */
const extractFileAndDirName = (path: string) => {
  const parts = path.split('/')
  // 提取文件名并去除 `.vue` 后缀
  const fileName = parts.pop()?.replace('.vue', '') || ''
  // 提取目录名
  const dirName = parts[parts.length - 1]
  return { fileName, dirName }
}

/**
 * * @description 处理不同类型组件的映射
 * ? @param componentPaths - 组件路径映射表
 * ? @param fileName - 文件名
 * ? @param parentDir - 父目录名
 * ? @param importFn - 异步导入组件的函数
 * ! @returns void
 */
const handleComponentMapping = (
  componentPaths: Record<string, () => Promise<unknown>>,
  fileName: string,
  parentDir: string,
  importFn: () => Promise<unknown>
) => {
  // 如果文件名是 index，则使用父目录名作为键
  if (fileName === 'index') {
    componentPaths[parentDir] = importFn
  }
}

/**
 * * @description 处理全局组件的映射
 * ? @param componentPaths - 组件路径映射表
 * ? @param fileName - 文件名
 * ? @param importFn - 异步导入组件的函数
 * ! @returns void
 */
const handleGlobalComponent = (
  componentPaths: Record<string, () => Promise<unknown>>,
  fileName: string,
  importFn: () => Promise<unknown>
) => {
  if (fileName.startsWith('C_')) {
    // 如果文件名以 C_ 开头，直接使用文件名作为键
    componentPaths[fileName] = importFn
  } else if (fileName !== 'index') {
    // 如果文件名不是 index，添加 C_ 前缀作为键
    componentPaths[`C_${fileName}`] = importFn
  }
}

/**
 * * @description 处理局部组件的映射
 * ? @param componentPaths - 组件路径映射表
 * ? @param fileName - 文件名
 * ? @param importFn - 异步导入组件的函数
 * ! @returns void
 */
const handleLocalComponent = (
  componentPaths: Record<string, () => Promise<unknown>>,
  fileName: string,
  importFn: () => Promise<unknown>
) => {
  if (fileName.startsWith('c_')) {
    // 如果文件名以 c_ 开头，直接使用文件名作为键
    componentPaths[fileName] = importFn
  } else if (fileName !== 'index') {
    // 如果文件名不是 index，添加 c_ 前缀作为键
    componentPaths[`c_${fileName}`] = importFn
  }
}

/**
 * * @description 处理组件路径和名称，将组件信息添加到映射表中
 * ! @returns void
 */
Object.entries(modules).forEach(([path, importFn]) => {
  // 规范化路径，确保使用正斜杠
  const normalizedPath = path.replace(/\\/g, '/')
  const { fileName, dirName } = extractFileAndDirName(normalizedPath)
  const parentDir = normalizedPath.split('/').slice(-2, -1)[0]

  // 创建简化的路径键（去除 ../components/ 前缀）
  const simplifiedPath = normalizedPath.replace(/^\.\.\/components\//, '')
  
  // 使用简化路径作为键
  componentPaths[simplifiedPath] = importFn
  // 使用文件名作为键
  componentPaths[fileName] = importFn

  handleComponentMapping(componentPaths, fileName, parentDir, importFn)

  if (dirName === 'global' || normalizedPath.includes('/global/')) {
    // 处理全局组件
    handleGlobalComponent(componentPaths, fileName, importFn)
  } else if (dirName === 'local' || normalizedPath.includes('/local/')) {
    // 处理局部组件
    handleLocalComponent(componentPaths, fileName, importFn)
  }
})

/**
 * * @description 动态注册组件到 Vue 应用实例
 * ? @param app - Vue 应用实例
 * ! @returns void
 */
export function setupDynamicComponents(app: App) {
  /**
   * * @description 按需注册组件
   * ? @param name - 组件名称
   * ! @returns 注册成功返回 true，否则返回 false
   */
  const registerComponent = (name: string) => {
    // console.log('尝试注册组件:', name, '是否存在路径:', !!componentPaths[name])

    if (!app.component(name) && componentPaths[name]) {
      // console.log('注册组件:', name)
      // 进行类型断言，确保异步导入的是组件
      const asyncComponent = defineAsyncComponent(
        () => componentPaths[name]() as Promise<Component>
      )
      app.component(name, asyncComponent)
      return true
    }
    return false
  }

  // 全局注册获取组件方法
  /**
   * * @description 全局注册获取组件方法
   * ? @param name - 组件名称
   * ! @returns 组件实例或 undefined
   */
  app.config.globalProperties.$getComponent = (name: string) => {
    registerComponent(name)
    return app.component(name)
  }

  // 提供注入，方便在组件中使用
  /**
   * * @description 提供注入，方便在组件中使用
   * ? @param name - 组件名称
   * ! @returns 组件实例或 undefined
   */
  app.provide('getComponent', (name: string) => {
    registerComponent(name)
    return app.component(name)
  })
}
