<template>
  <NLayoutHeader
    bordered
    position="absolute"
    :class="[
      'layout-header',
      isLightTheme ? 'light-theme' : 'dark-theme',
      'h-100px px-20px flex flex-col items-center top-0 left-0 right-0 z-1000',
    ]"
  >
    <div class="header-top h56px w-full">
      <div
        class="header-content w-full h-full flex items-center justify-between"
      >
        <!-- 左侧：折叠菜单 -->
        <div class="flex items-center">
          <NTooltip placement="bottom-start">
            <template #trigger>
              <NButton
                text
                @click="handleCollapsedChange(!isCollapsed)"
              >
                <i
                  :class="[
                    'transition-all duration-300 ease-in-out',
                    isCollapsed
                      ? 'i-ri:menu-fold-4-fill rotate-0'
                      : 'i-ri:menu-fold-3-fill rotate-360',
                  ]"
                ></i>
              </NButton>
            </template>
            折叠菜单
          </NTooltip>
        </div>

        <!-- 中间：面包屑导航 -->
        <div class="flex-1 min-w-0 mx-4">
          <NBreadcrumb>
            <NBreadcrumbItem
              v-for="(item, index) in currentBreadcrumb"
              :key="index"
            >
              <NDropdown
                v-if="item.children?.length"
                :options="item.children"
                @select="router.push"
              >
                <div class="trigger">
                  <span :class="[item.icon, 'vertical-top']"></span>
                  {{ item.label }}
                </div>
              </NDropdown>
              <RouterLink
                v-else
                :to="item.key"
              >
                <span :class="[item.icon, 'vertical-top mr-1']"></span
                >{{ item.label }}
              </RouterLink>
            </NBreadcrumbItem>
          </NBreadcrumb>
        </div>

        <!-- 右侧：用户信息 -->
        <div class="w-350px flex items-center justify-end gap-4">
          <C_Theme />
          <div class="flex items-center gap-2">
            <NAvatar
              round
              size="small"
              src="/avatar.png"
            />
            <span>管理员</span>
          </div>
        </div>
      </div>
    </div>
    <div class="header-bottom h44px bg-fuchsia w-full">111</div>
  </NLayoutHeader>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'

  defineOptions({ name: 'C_Header' })

  defineProps({
    isLightTheme: {
      type: Boolean,
      default: true,
    },
  })

  interface MenuCollapse {
    isCollapsed: Ref<boolean>
    handleCollapsedChange: (collapsed: boolean) => void
  }

  const { isCollapsed, handleCollapsedChange } =
    inject<MenuCollapse>('menuCollapse')!

  const route = useRoute()
  const router = useRouter()

  // 当前路径对应的面包屑
  // const currentBreadcrumb = computed(() => {
  //   return route.matched
  //     .filter(record => record.meta?.title)
  //     .map(record => ({
  //       key: record.path,
  //       label: record.meta.title,
  //       icon: record.meta.icon,
  //       children: record.children?.length
  //         ? record.children.map(child => ({
  //             key: child.path,
  //             label: child.meta?.title,
  //           }))
  //         : [],
  //     }))
  // })
  const currentBreadcrumb = computed(() => {
    return route.matched
      .filter(record => record.meta?.title)
      .map(record => ({
        key: record.path,
        label: record.meta.title,
        icon: record.meta.icon,
        children: record.children?.length
          ? record.children.map(child => ({
              key: child.path,
              label: child.meta?.title,
              // 仅当存在孙子菜单时添加 children 属性
              ...(child.children?.length && {
                children: child.children.map(grandChild => ({
                  key: grandChild.path,
                  label: grandChild.meta?.title,
                })),
              }),
            }))
          : [],
      }))
  })
</script>
