/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-31 14:04:47
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-01 14:05:15
 * @FilePath: \Robot_Admin\src\types\modules\plugin.d.ts
 * @Description: 插件模块声明
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

// =================== Vue 组件模块声明 ===================
declare module '*.vue' {
  const component: DefineComponent<object, object, unknown>
  export default component
}

// =================== 自定义模块声明 ===================
declare module '@/plugins/naive-ui' {
  export function setupNaiveUI(app: App): void
}

declare module 'naive-ui' {
  interface NAlertSlots {
    action?: () => VNode[]
  }
}
