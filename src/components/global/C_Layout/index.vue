<template>
  <NSpace
    vertical
    class="layout-container"
  >
    <NSpace>
      <NSwitch v-model:value="inverted" />
      <span>AGILE | TEAM</span>
    </NSpace>
    <NLayout has-sider>
      <NLayoutSider
        ref="siderRef"
        bordered
        collapse-mode="width"
        :collapsed-width="64"
        :width="240"
        show-trigger
        :inverted="inverted"
        @on-collapse="() => handleCollapseChange(true)"
        @on-expand="() => handleCollapseChange(false)"
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

  // 菜单数据 - 先定义确保后续函数可以访问
  const menuData: MenuOptions[] = [
    {
      label: '且听风吟',
      key: 'hear-the-wind-sing',
      path: '/hear-the-wind-sing',
      icon: 'i-mdi:robot-love-outline',
    },
    {
      label: '1973年的弹珠玩具',
      key: 'pinball-1973',
      path: '/pinball-1973',
      icon: 'i-mdi:robot-love-outline',
      children: [
        {
          label: '鼠',
          key: 'rat',
          path: '/pinball-1973/rat',
        },
      ],
    },
    {
      label: '寻羊冒险记',
      key: 'a-wild-sheep-chase',
      path: '/a-wild-sheep-chase',
      icon: () => h('i', { class: 'i-carbon-book' }),
    },
    {
      label: '舞，舞，舞',
      key: 'dance-dance-dance',
      path: '/dance-dance-dance',
      icon: () => h('i', { class: 'i-carbon-book' }),
      children: [
        {
          type: 'group',
          label: '人物',
          key: 'people',
          path: '/dance-dance-dance/people',
          children: [
            {
              label: '叙事者',
              key: 'narrator',
              path: '/dance-dance-dance/people/narrator',
              icon: () => h('i', { class: 'i-carbon-user' }),
            },
            {
              label: '羊男',
              key: 'sheep-man',
              path: '/dance-dance-dance/people/sheep-man',
              icon: () => h('i', { class: 'i-carbon-user' }),
            },
          ],
        },
        {
          label: '饮品',
          key: 'beverage',
          path: '/dance-dance-dance/beverage',
          icon: () => h('i', { class: 'i-carbon-wine' }),
          children: [
            {
              label: '威士忌',
              key: 'whisky',
              path: '/dance-dance-dance/beverage/whisky',
            },
          ],
        },
        {
          label: '食物',
          key: 'food',
          path: '/dance-dance-dance/food',
          children: [
            {
              label: '三明治',
              key: 'sandwich',
              path: '/dance-dance-dance/food/sandwich',
            },
          ],
        },
        {
          label: '过去增多，未来减少',
          key: 'the-past-increases-the-future-recedes',
          path: '/dance-dance-dance/the-past-increases-the-future-recedes',
        },
      ],
    },
  ]

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

  // 监听折叠状态变化
  const handleCollapseChange = (collapsed: boolean) => {
    isCollapsed.value = collapsed
  }

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
