/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-31 11:02:15
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-31 11:28:48
 * @FilePath: \Robot_Admin\src\types\modules\menu.d.ts
 * @Description: 菜单路由相关类型
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { VNode } from 'vue'

declare global {
  namespace Menu {
    /** 菜单项类型 */
    type ItemType = 'group' | 'divider' | 'item'

    interface MenuOptions {
      type?: 'group' | 'divider'
      key?: string
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

    interface Tag {
      path: string
      title: string
      icon?: string
      meta?: {
        affix?: boolean
      }
    }
  }
}

export {}
