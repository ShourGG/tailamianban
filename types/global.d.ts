/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-13 08:08:58
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-13 21:50:00
 * @FilePath: \Robot_Admin\types\global.d.ts
 * @Description:
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
import type { VNode } from 'vue'

declare global {
  interface ImportMetaEnv {
    readonly BASE_URL: string
    readonly VITE_ROUTER_MODE: 'hash' | 'history'
  }

  interface MenuOptions {
    type?: 'group' | 'divider'
    key: string
    path?: string
    name?: string
    component?: string
    redirect?: string
    label?: string
    icon?: string | (() => VNode) | VNode
    disabled?: boolean
    meta?: {
      title?: string
      icon?: string
      hidden?: boolean
      affix?: boolean
      keepAlive?: boolean
      full?: boolean
      link?: string
      [key: string]: any
    }
    children?: MenuOptions[]
  }
}

export {}
