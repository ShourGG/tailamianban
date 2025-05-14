<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2023-06-09 16:26:10
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-14 14:22:46
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
    items.map(
      item =>
        ({
          key: item.path || '',
          label: item.meta?.title || '',
          disabled: item.disabled || false,
          icon: (() => {
            const icon = item.meta?.icon || item.icon
            if (!icon) return undefined

            if (typeof icon === 'string') {
              return () =>
                h(NIcon, null, { default: () => h('span', { class: icon }) })
            }
            return typeof icon === 'function' ? icon() : icon
          })(),
          ...(item.type && { type: item.type }),
          ...(item.children?.length && {
            children: normalizeOptions(item.children),
          }),
        }) as MenuOption
    )

  const options = computed<MenuOption[]>(() => normalizeOptions(props.data))
</script>
