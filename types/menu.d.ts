/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-06 08:58:59
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-06 15:19:32
 * @FilePath: \Robot_Admin\types\menu.d.ts
 * @Description: 菜单类型
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
namespace Menu {
  interface MenuOptions {
    path: string
    name?: string
    component?: string
    redirect?: string
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
