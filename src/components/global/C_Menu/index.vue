<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-11 16:26:10
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-23 15:44:28
 * @FilePath: \Robot_Admin\src\components\global\C_Menu\index.vue
 * @Description: 菜单组件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->
<template>
  <NMenu
    ref="menuRef"
    :options="options"
    :expanded-keys="expandedKeys"
    :value="activeKey"
    :mode="mode"
    :collapsed="collapsed"
    :collapsed-width="collapsedWidth"
    :collapsed-icon-size="collapsedIconSize"
    :inverted="inverted"
    :theme-overrides="menuThemeOverrides"
    :dropdown-props="dropdownProps"
    :indent="24"
    :root-indent="16"
    style="
      --primary-color: var(--n-color-primary);
      --n-item-color-active: var(--primary-color);
    "
    @update:value="handleMenuClick"
    @update:expanded-keys="onExpandedKeysChange"
  />
</template>

<script setup lang="ts">
  import {
    NIcon,
    type MenuOption,
    type MenuInst,
    type DropdownProps,
  } from 'naive-ui'
  import { useThemeStore } from '@/stores/theme'

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

  // 下拉菜单配置 - 用于折叠模式下的子菜单显示
  const dropdownProps: DropdownProps = {
    placement: 'right-start' as const,
    trigger: 'hover' as const,
    arrowStyle: {
      color: 'var(--n-color)',
    },
  }

  const props = withDefaults(defineProps<MenuPropsWithData>(), {
    mode: 'vertical',
    collapsed: false,
    collapsedWidth: 64,
    collapsedIconSize: 22,
    inverted: false,
  })

  // 菜单引用，用于调用showOption方法
  const menuRef = ref<MenuInst | null>(null)

  // 当前激活的菜单项 - 根据当前路由路径动态计算
  const activeKey = computed(() => route.path)

  // 展开的菜单项
  const expandedKeys = ref<string[]>([])

  /**
   * * @description: 将菜单选项格式化为NMenu所需的格式
   * ? @param {*} items 菜单选项数组
   * ! @return {*} MenuOption[] 格式化后的菜单选项数组，用于NMenu组件
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
  const menuThemeOverrides = computed(() => ({
    ...themeStore.themeOverrides.Menu,
    color: themeStore.isDark ? themeStore.darkModeBgColor : undefined,
    groupTextColor: themeStore.isDark ? '#fff' : undefined,
  }))

  /**
   * * @description: 将菜单数据扁平化处理，方便查找
   * ? @param {*} items 菜单选项数组
   * ! @return {*} MenuOptions[] 扁平化后的菜单选项数组
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
   * * @description: 处理菜单项点击事件
   * ? @param {*} key 菜单项key
   * ! @return {*} void
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
    if (menuItem?.path) router.push(menuItem.path)
  }

  /**
   * * @description: 获取父级菜单项的key
   * ! @return {*} string[] 父级菜单项的key数组
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
   * * @description: 初始化展开的菜单项
   * ! @return {*}  void 初始化展开的菜单项
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

  /**
   * * @description: 处理菜单展开状态变化
   * ? @param {*} keys 展开的菜单项key数组
   * ! @return {*} void 更新展开的菜单项
   */
  const onExpandedKeysChange = (keys: string[]) => (expandedKeys.value = keys)

  /**
   * * @description: 使用showOption方法展开当前路径菜单
   * ! @return {*}  void 展开当前路径菜单
   */
  const showCurrentOption = () => {
    // 使用当前路径作为key，确保当前选中菜单项可见
    if (menuRef.value) menuRef.value.showOption(activeKey.value)
  }

  // 监听路由变化，更新展开的菜单项，但不折叠现有展开的菜单
  watch(
    () => route.path,
    () => {
      // 获取当前路径需要展开的菜单项
      const paths = route.path.split('/').filter(Boolean)
      const currentPathKeys = new Set<string>()
      let currentPath = ''

      // 添加路径本身
      paths.forEach(path => {
        currentPath += `/${path}`
        const menuItem = _flattenMenu(props.data).find(item => {
          const itemPath = item.path || ''
          return itemPath === currentPath
        })

        if (menuItem) {
          const itemPath = menuItem.path || ''
          const key = itemPath.startsWith('/') ? itemPath : `/${itemPath}`
          currentPathKeys.add(key)
        }
      })

      // 添加所有父级菜单的key
      const parentKeys = findParentKeys(props.data, route.path)
      parentKeys.forEach(key => currentPathKeys.add(key))

      // 合并现有展开的菜单和新路径需要的菜单
      const newKeys = new Set([
        ...expandedKeys.value,
        ...Array.from(currentPathKeys),
      ])
      expandedKeys.value = Array.from(newKeys)
    },
    { immediate: true }
  )

  // 页面初始化时执行一次
  onMounted(() => {
    nextTick(() => {
      initExpandedKeys()
      showCurrentOption()
    })
  })
</script>
