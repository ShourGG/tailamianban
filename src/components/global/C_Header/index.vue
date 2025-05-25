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
    <!-- 顶部 - 上方 -->
    <div class="header-top h56px w-full">
      <div
        class="header-content w-full h-full flex items-center justify-between"
      >
        <!-- 左侧：折叠菜单 -->
        <div class="flex items-center">
          <NTooltip>
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
        <C_Breadcrumb />

        <!-- 右侧：用户信息 -->
        <div class="w-350px flex items-center justify-end gap-4">
          <NTooltip
            placement="bottom"
            trigger="hover"
          >
            <template #trigger>
              <NButton text>
                <span class="i-mdi:search"></span>
              </NButton>
            </template>
            <span> 搜索 </span>
          </NTooltip>

          <NTooltip
            placement="bottom"
            trigger="hover"
          >
            <template #trigger>
              <NButton text>
                <span class="i-mdi:fullscreen"></span>
              </NButton>
            </template>
            <span> 全屏 </span>
          </NTooltip>

          <NTooltip
            placement="bottom"
            trigger="hover"
          >
            <template #trigger>
              <NButton text>
                <span class="i-mdi:language"></span>
              </NButton>
            </template>
            <span> 切换语言 </span>
          </NTooltip>

          <NTooltip
            placement="bottom"
            trigger="hover"
          >
            <template #trigger>
              <NButton text>
                <span class="i-mdi:white-balance-sunny"></span>
              </NButton>
            </template>
            <span> 主题模式 </span>
          </NTooltip>

          <NTooltip
            placement="bottom"
            trigger="hover"
          >
            <template #trigger>
              <NButton text>
                <span class="i-mdi:settings-transfer-outline"></span>
              </NButton>
            </template>
            <span> 布局配置 </span>
          </NTooltip>
        </div>
        <C_Theme />
        <div class="flex items-center gap-2">
          <NAvatar
            round
            size="small"
            src="@/assets/images/avatar.jpg"
          />
          <span>CHENY</span>
        </div>
      </div>
    </div>
    <!-- 头部 - 下方 -->
    <div class="header-bottom h44px bg-fuchsia w-full">111</div>
  </NLayoutHeader>
</template>

<script setup lang="ts">
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
</script>
