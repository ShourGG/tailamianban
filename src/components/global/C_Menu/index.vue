<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2023-06-09 16:26:10
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-18 16:38:38
 * @FilePath: \Robot_Admin\src\components\global\C_Menu\index.vue
 * @Description: 菜单组件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->
<template>
  <NMenu
    :options="options"
    :default-expanded-keys="expandedKeys"
    :default-value="activeKey"
    :mode="mode"
    :collapsed="collapsed"
    :collapsed-width="collapsedWidth"
    :collapsed-icon-size="collapsedIconSize"
    :inverted="inverted"
    :theme-overrides="menuThemeOverrides"
    style="
      --primary-color: var(--n-color-primary);
      --n-item-color-active: var(--primary-color);
    "
    @update:value="handleMenuClick"
  />
</template>

<script setup lang="ts">
  import { NIcon, type MenuOption } from 'naive-ui'
  import { useThemeStore } from '@/stores/theme'
  import { computed, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'

  const route = useRoute()
  const router = useRouter()
  const themeStore = useThemeStore()

  type MenuPropsWithData = {
    data: MenuOptions[]
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
  })

  // 当前激活的菜单项
  const activeKey = computed(() => route.path)

  // 展开的菜单项
  const expandedKeys = ref<string[]>([])

  /**
   * 将菜单选项格式化为NMenu所需的格式
   */
  const normalizeOptions = (items: MenuOptions[]): MenuOption[] => {
    return items.map(item => ({
      // 确保key与路由path格式一致，以支持正确的选中状态
      // 如果path已经包含/则直接使用，否则添加/前缀
      key: item.path
        ? item.path.startsWith('/')
          ? item.path
          : `/${item.path}`
        : '',
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
    })) as MenuOption[]
  }

  const options = computed<MenuOption[]>(() => normalizeOptions(props.data))

  // 菜单主题样式
  const menuThemeOverrides = computed(() => {
    return themeStore.themeOverrides.Menu || {}
  })

  /**
   * 将菜单数据扁平化处理，方便查找
   */
  const _flattenMenu = (items: MenuOptions[]): MenuOptions[] => {
    return items.reduce(
      (acc, item) => [
        ...acc,
        item,
        ...(item.children ? _flattenMenu(item.children) : []),
      ],
      [] as MenuOptions[]
    )
  }

  /**
   * 处理菜单项点击事件
   */
  const handleMenuClick = (key: string) => {
    const menuItem = _flattenMenu(props.data).find(item => {
      // 适配key的格式变化，同时处理path可能未定义的情况
      const itemPath = item.path || '/home'
      const normalizedPath = itemPath.startsWith('/')
        ? itemPath
        : `/${itemPath}`
      return normalizedPath === key
    })

    if (menuItem?.path) {
      router.push(menuItem.path)
    }
  }

  /**
   * 获取父级菜单项的key
   */
  const findParentKeys = (
    items: MenuOptions[],
    targetPath: string,
    parentKeys: string[] = []
  ): string[] => {
    for (const item of items) {
      if (item.children?.length) {
        const currentKeys = [...parentKeys]
        // 添加当前父级菜单的key
        if (item.path) {
          const key = item.path.startsWith('/') ? item.path : `/${item.path}`
          currentKeys.push(key)
        }

        // 检查子菜单中是否包含目标路径
        const found = item.children.some(child => {
          const childPath = child.path || ''
          return (
            childPath === targetPath ||
            (child.children?.length &&
              findParentKeys(child.children, targetPath, currentKeys).length >
                0)
          )
        })

        if (found) {
          return currentKeys
        }

        // 递归查找
        const result = findParentKeys(item.children, targetPath, currentKeys)
        if (result.length > 0) {
          return result
        }
      }
    }
    return []
  }

  /**
   * 初始化展开的菜单项
   */
  const initExpandedKeys = () => {
    const paths = route.path.split('/').filter(Boolean)
    const keys = new Set<string>()
    let currentPath = ''

    // 添加路径本身
    paths.forEach(path => {
      currentPath += `/${path}`
      const menuItem = _flattenMenu(props.data).find(item => {
        // 适配路径格式变化，同时处理path可能未定义的情况
        const itemPath = item.path || ''
        return itemPath === currentPath
      })

      if (menuItem) {
        // 使用与normalizeOptions相同的key计算逻辑
        const itemPath = menuItem.path || ''
        const key = itemPath.startsWith('/') ? itemPath : `/${itemPath}`
        keys.add(key)
      }
    })

    // 添加所有父级菜单的key
    const parentKeys = findParentKeys(props.data, route.path)
    parentKeys.forEach(key => keys.add(key))

    expandedKeys.value = Array.from(keys)
  }

  // 监听路由变化，更新展开的菜单项
  watch(() => route.path, initExpandedKeys, { immediate: true })
</script>
