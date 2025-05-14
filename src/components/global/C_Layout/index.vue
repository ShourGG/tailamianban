<template>
  <NSpace
    vertical
    class="layout-container"
  >
    <NLayout has-sider>
      <NLayoutSider
        ref="siderRef"
        bordered
        collapse-mode="width"
        :collapsed-width="64"
        :width="240"
        show-trigger
      >
        <C_Menu
          :data="menuData"
          :default-value="activeKey"
          :default-expanded-keys="expandedKeys"
          mode="vertical"
          :collapsed="isCollapsed"
          :inverted="inverted"
          @update:value="handleMenuClick"
        />
      </NLayoutSider>
      <NLayout>
        <RouterView />
      </NLayout>
    </NLayout>
  </NSpace>
</template>
<script setup lang="ts">
  import { type LayoutSiderInst } from 'naive-ui'

  import { s_permissionStore } from '@/stores/permission'

  const permissionStore = s_permissionStore()
  const menuData = permissionStore.showMenuListGet

  // 路由相关
  const route = useRoute()
  const router = useRouter()

  // 侧边栏相关
  const siderRef = ref<LayoutSiderInst | null>(null)
  const isCollapsed = ref(false)
  const inverted = ref(false)

  // 菜单相关
  const activeKey = computed(() => route.path)
  const expandedKeys = ref<string[]>([])

  // 菜单点击处理
  const handleMenuClick = (key: string) => {
    const flattenMenu = (items: MenuOptions[]): MenuOptions[] => {
      return items.reduce(
        (acc, item) => [
          ...acc,
          item,
          ...(item.children ? flattenMenu(item.children) : []),
        ],
        [] as MenuOptions[]
      )
    }

    const menuItem = flattenMenu(menuData).find(item => item.key === key)
    if (menuItem?.path) {
      router.push(menuItem.path)
    }
  }

  // 初始化展开的菜单项
  const initExpandedKeys = () => {
    const flattenMenu = (items: MenuOptions[]): MenuOptions[] => {
      return items.reduce(
        (acc, item) => [
          ...acc,
          item,
          ...(item.children ? flattenMenu(item.children) : []),
        ],
        [] as MenuOptions[]
      )
    }

    const paths = route.path.split('/').filter(Boolean)
    const keys = new Set<string>()
    let currentPath = ''

    paths.forEach(path => {
      currentPath += `/${path}`
      const menuItem = flattenMenu(menuData).find(
        item => item.path === currentPath
      )
      if (menuItem?.key) keys.add(menuItem.key)
    })

    expandedKeys.value = Array.from(keys)
  }

  // 监听路由变化
  watch(() => route.path, initExpandedKeys, { immediate: true })
</script>

<style scoped>
  .layout-container :deep(.n-menu-item-content__icon) {
    display: flex;
    align-items: center;
    margin-top: -8px;
    vertical-align: top;
  }
</style>
