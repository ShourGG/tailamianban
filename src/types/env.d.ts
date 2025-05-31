/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-31 11:00:46
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-31 11:05:10
 * @FilePath: \Robot_Admin\src\types\env.d.ts
 * @Description: 环境变量和模块声明
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

/// <reference types="vite/client" />

import type { DefineComponent, App } from 'vue'

// =================== Vite 环境变量扩展 ===================
interface ImportMetaEnv {
  readonly BASE_URL: string
  readonly VITE_ROUTER_MODE: 'hash' | 'history'
  readonly VITE_API_BASE_URL?: string
  readonly VITE_APP_TITLE?: string
  readonly VITE_APP_VERSION?: string
  // 可以根据需要添加更多环境变量
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// =================== Vue 组件模块声明 ===================
declare module '*.vue' {
  const component: DefineComponent<object, object, unknown>
  export default component
}

// =================== 自定义模块声明 ===================
declare module '@/plugins/naive-ui' {
  export function setupNaiveUI(app: App): void
}

declare module '_views/*' {
  const component: DefineComponent
  export default component
}

// 如果有其他插件或模块需要声明，可以在这里添加
declare module '@/utils/*' {
  const utils: any
  export default utils
}

export {}
