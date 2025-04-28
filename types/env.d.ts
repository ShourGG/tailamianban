/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-28 08:52:23
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-04-28 09:44:01
 * @FilePath: \Robot_Admin\types\env.d.ts
 * @Description:
 * @description: 环境变量声明文件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

/// <reference types="vite/client" />

import { DefineComponent } from 'vue'

declare module '_views/*' {
  const component: DefineComponent
  export default component
}

declare module '*.vue' {
  const component: DefineComponent<object, object, unknown>
  export default component
}

declare module 'vite' {
  interface ImportMetaEnv {
    readonly BASE_URL: string
    readonly VITE_ROUTER_MODE: 'hash' | 'history'
  }
}

declare global {
  interface ImportMetaEnv {
    readonly BASE_URL: string
    readonly VITE_ROUTER_MODE: 'hash' | 'history'
  }
}
