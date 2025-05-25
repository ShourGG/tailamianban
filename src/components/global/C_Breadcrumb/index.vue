<template>
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
</template>

<script setup lang="ts">
  defineOptions({ name: 'C_Breadcrumb' })
  const route = useRoute()
  const router = useRouter()

  // 当前路径对应的面包屑
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
