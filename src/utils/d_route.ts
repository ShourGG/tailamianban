/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-28 15:55:55
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-06 15:30:55
 * @FilePath: \Robot_Admin\src\utils\d_route.ts
 * @Description: 路由相关工具函数
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { DynamicRoute } from '@/router/dynamicRouter'

/**
 * @description: 使用递归，过滤需要显示的菜单
 * @param {MenuItem} menuList 所有菜单列表
 * @return {*} {MenuItem[]} 过滤后的菜单列表
 */
export const getShowMenuList = (menus: DynamicRoute[]): Menu.MenuOptions[] => {
  return menus
    .filter(menu => {
      // 添加 name 属性存在性检查
      if (!menu.name) {
        console.warn(`路由 ${menu.path} 缺少 name 属性，已过滤`)
        return false
      }
      return menu.meta?.hidden !== true
    })
    .map(menu => ({
      ...menu,
      name: menu.name!, // 非空断言
      children: menu.children?.length ? getShowMenuList(menu.children) : [],
    }))
}

// 优化后的缓存路由名称函数
export const getKeepAliveRouterName = (
  menuList: Menu.MenuOptions[]
): string[] => {
  const result: string[] = []

  const processor = (items: Menu.MenuOptions[]) => {
    items.forEach(item => {
      if (item.meta?.keepAlive && item.name) result.push(item.name)
      if (item.children?.length) processor(item.children)
    })
  }

  processor(menuList)
  return result
}
