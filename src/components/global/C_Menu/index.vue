<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2023-06-09 16:26:10
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-13 23:07:00
 * @FilePath: \Robot_Admin\src\components\global\C_Menu\index.vue
 * @Description: 菜单组件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->
<template>
  <NMenu
    :options="options"
    :default-expanded-keys="defaultExpandedKeys"
    :default-value="defaultValue"
    :mode="mode"
    :collapsed="collapsed"
    :collapsed-width="collapsedWidth"
    :collapsed-icon-size="collapsedIconSize"
    :inverted="inverted"
  />
</template>

<script setup lang="ts">
  import { NIcon, type MenuOption } from 'naive-ui'

  type MenuPropsWithData = {
    data: MenuOptions[]
    defaultExpandedKeys?: string[]
    defaultValue?: string
    mode?: 'vertical' | 'horizontal'
    collapsed?: boolean
    collapsedWidth?: number
    collapsedIconSize?: number
    inverted?: boolean
  }

  const props = withDefaults(defineProps<MenuPropsWithData>(), {
    mode: 'vertical',
    collapsed: false,
    collapsedWidth: 64,
    collapsedIconSize: 22,
    inverted: false,
    defaultExpandedKeys: () => [],
    defaultValue: '',
  })

  const normalizeOptions = (items: MenuOptions[]): MenuOption[] =>
    items.map(item => {
      const normalizedItem: MenuOption = {
        key: item.key,
        label: item.label || item.name || '',
        disabled: item.disabled,
        icon: item.icon
          ? typeof item.icon === 'string'
            ? () =>
                h(NIcon, null, {
                  default: () => h('i', { class: item.icon as string }),
                })
            : () => (typeof item.icon === 'function' ? item.icon() : item.icon)
          : undefined,
      }

      if (item.type === 'divider') {
        normalizedItem.type = 'divider'
      } else if (item.type === 'group') {
        normalizedItem.type = 'group'
      }

      if (item.children?.length) {
        normalizedItem.children = normalizeOptions(item.children)
      }

      return normalizedItem
    })

  const options = computed<MenuOption[]>(() => normalizeOptions(props.data))
</script>
