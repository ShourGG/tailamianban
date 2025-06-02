/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-24 01:46:23
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-02 22:39:12
 * @FilePath: \Robot_Admin\src\utils\d_menu.ts
 * @Description: 处理菜单的工具函数
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
import type { MenuOptions } from '@/types/modules/menu'
import { NIcon, type MenuOption } from 'naive-ui/es'

/**
 * * @description: 将菜单选项格式化为NMenu所需的格式
 * ? @param {*} items 菜单选项数组
 * ! @return {*} MenuOption[] 格式化后的菜单选项数组，用于NMenu组件
 */

export const normalizeMenuOptions = (items: MenuOptions[]): MenuOption[] => {
  return items.map(item => ({
    key: item.path ? normalizePath(item.path) : '',
    label: item.meta?.title || '',
    disabled: item.disabled || false,
    icon: renderMenuIcon(item),
    ...(item.type && { type: item.type }),
    ...(item.children?.length && {
      children: normalizeMenuOptions(item.children),
    }),
  })) as MenuOption[]
}

const normalizePath = (path: string) =>
  path.startsWith('/') ? path : `/${path}`

const renderMenuIcon = (item: MenuOptions) => {
  const icon = item.meta?.icon || item.icon
  if (!icon) return undefined

  if (typeof icon === 'string') {
    return () => h(NIcon, null, { default: () => h('span', { class: icon }) })
  }
  return typeof icon === 'function' ? icon() : icon
}
