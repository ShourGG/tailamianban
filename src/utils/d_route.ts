/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-28 15:55:55
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-04-28 17:25:12
 * @FilePath: \Robot_Admin\src\utils\unocss\d_route.ts
 * @Description: 路由相关工具函数
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

type MenuItem = Menu.MenuOptions

// 通用递归处理器类型
type RecursiveHandler<T extends unknown[]> = (item: MenuItem, acc: T) => T

/**
 * @description: 递归处理函数
 * @param {MenuItem} item 当前菜单项
 * @param {T} acc 累加器
 * @return {*} {T} 处理后的累加器
 */
const flattenHandler = (item: MenuItem, acc: MenuItem[]): MenuItem[] => {
  acc.push(item)
  item.children?.forEach(child => flattenHandler(child, acc))
  return acc
}

/**
 * @description:  递归处理器
 * @return {*} {T} 处理后的累加器
 */
const recursiveProcessor = <T extends unknown[]>(
  list: MenuItem[],
  handler: RecursiveHandler<T>,
  initial: T
): T => {
  return list.reduce((acc, item) => handler(item, acc), initial)
}

/**
 * @description: 使用递归，扁平化菜单列表
 * @param {MenuItem} menuList 所有菜单列表
 * @return {*} {MenuItem[]} 扁平化后的菜单列表
 */
export const getFlatArr = (menuList: MenuItem[]): MenuItem[] =>
  recursiveProcessor(menuList, flattenHandler, [])

/**
 * @description: 使用递归，过滤需要显示的菜单
 * @param {MenuItem} menuList 所有菜单列表
 * @return {*} {MenuItem[]} 过滤后的菜单列表
 */
export const getShowMenuList = (menuList: MenuItem[]): MenuItem[] =>
  menuList.reduce((acc, item) => {
    if (item.meta?.hidden) return acc

    const newItem = { ...item }
    if (newItem.children) {
      newItem.children = getShowMenuList(newItem.children)
    }
    return [...acc, newItem]
  }, [] as MenuItem[])

/**
 * @description:
 * @param {MenuItem} menuList
 * @return {*}
 */
export const getKeepAliveRouterName = (menuList: MenuItem[]): string[] => {
  /**
   * @description: 递归处理器 - 处理需要缓存的路由名称
   * @param {MenuItem} item 当前菜单项
   * @param {string} acc 累加器
   * @return {*} {string[]} 处理后的累加器 - 缓存的路由名称数组
   */
  const processor = (item: MenuItem, acc: string[]): string[] => {
    if (item.meta?.keepAlive && item.name) acc.push(item.name)
    item.children?.forEach(child => processor(child, acc))
    return acc
  }
  return recursiveProcessor(menuList, processor, [])
}
