<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-26 13:38:13
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-26 22:27:59
 * @FilePath: \Robot_Admin\src\components\global\C_TagsView\index.vue
 * @Description: 标签页组件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div
    id="guide-tags-view"
    class="tags-view-container"
  >
    <NScrollbar x-scrollable>
      <NSpace>
        <NTag
          v-for="(tag, index) in appStore.tagsViewList"
          :key="tag.path"
          :type="isActive(tag) ? 'primary' : 'default'"
          :closable="!isAffix(tag)"
          @close.stop="handleClose(tag, index)"
          @click="navigateToTag(tag)"
          @contextmenu.prevent="e => showContextMenu(e, tag, index)"
        >
          <template #icon>
            <i :class="[tag.icon, 'w12px h12px']"></i>
          </template>
          {{ tag.title }}
        </NTag>
      </NSpace>
    </NScrollbar>
    <NDropdown
      v-if="contextMenuVisible"
      :show="contextMenuVisible"
      :options="contextMenuOptions"
      :x="contextMenuX"
      :y="contextMenuY"
      @clickoutside="closeContextMenu"
      @select="handleContextMenuSelect"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { s_appStore } from '@/stores/app'

  // 初始化 store、路由和路由器
  const appStore = s_appStore()
  const route = useRoute()
  const router = useRouter()

  // 上下文菜单相关的响应式变量
  const contextMenuVisible = ref(false)
  const contextMenuX = ref(0)
  const contextMenuY = ref(0)
  const selectedTag = ref<Tag | null>(null)
  const selectedIndex = ref<number>(-1)

  /**
   * 检查标签是否为当前活动路由
   * @param {Tag} tag - 要检查的标签
   * @returns {boolean} 如果标签是当前活动路由则返回 true，否则返回 false
   */
  const isActive = (tag: Tag) => tag.path === route.path

  /**
   * * @description: 检查标签是否为固定标签
   * ? @param {Tag} tag - 要检查的标签
   * ! @returns {boolean} 如果标签是固定标签则返回 true，否则返回 false
   */
  const isAffix = (tag: Tag) => tag.meta?.affix

  /**
   * * @description: 导航到指定的标签
   * ? @param {Tag} tag - 要导航到的标签
   * ! @return {void}
   */
  const navigateToTag = (tag: Tag) => {
    if (tag.path !== route.path) {
      router.push(tag.path)
    }
  }

  /**
   * * @description: 关闭指定的标签
   * ? @param {number} index - 要关闭的标签索引
   * ! @return {void}
   */
  const handleClose = (tag: Tag, index: number) => {
    if (isAffix(tag)) return

    const wasActive = isActive(tag)
    const removedPath = appStore.removeTag(index)

    if (wasActive && removedPath) {
      router.push('/')
    }
  }

  /**
   * * @description: 显示上下文菜单
   * ? @param {MouseEvent} event - 鼠标事件
   * ? @param {Tag} tag - 右键点击的标签
   * ? @param {number} index - 标签的索引
   * ! @return {void}
   */
  const showContextMenu = (event: MouseEvent, tag: Tag, index: number) => {
    event.preventDefault()
    selectedTag.value = tag
    selectedIndex.value = index
    contextMenuVisible.value = true
    contextMenuX.value = event.clientX
    contextMenuY.value = event.clientY
  }

  /**
   * 关闭上下文菜单
   */
  const closeContextMenu = () => (contextMenuVisible.value = false)

  /**
   * 计算上下文菜单选项
   */
  const contextMenuOptions = computed(() => [
    {
      type: 'option',
      label: '关闭',
      key: 'close',
      disabled: isAffix(selectedTag.value as Tag),
      icon: () => h('span', { class: 'i-mdi:close' }),
    },
    {
      type: 'option',
      label: '关闭其他',
      key: 'closeOthers',
      icon: () => h('span', { class: 'i-mdi:arrow-left-right-bold' }),
    },
    {
      type: 'option',
      label: '关闭左侧',
      key: 'closeLeft',
      icon: () => h('span', { class: 'i-mdi:align-horizontal-left' }),
    },
    {
      type: 'option',
      label: '关闭右侧',
      key: 'closeRight',
      icon: () => h('span', { class: 'i-mdi:align-horizontal-right' }),
    },
    {
      type: 'option',
      label: '关闭所有',
      key: 'closeAll',
      icon: () => h('span', { class: 'i-mdi:tally-mark-5' }),
    },
  ])

  /**
   * * @description: 处理上下文菜单的选项选择
   * ? @param {string} key - 选中的菜单项的 key
   * ! @return {void}
   */
  const handleContextMenuSelect = (key: string) => {
    if (!selectedTag.value || selectedIndex.value === -1) return

    switch (key) {
      case 'close':
        handleClose(selectedTag.value, selectedIndex.value)
        break
      case 'closeOthers':
        appStore.removeOtherTags(selectedIndex.value)
        break
      case 'closeLeft':
        appStore.removeLeftTags(selectedIndex.value)
        break
      case 'closeRight':
        appStore.removeRightTags(selectedIndex.value)
        break
      case 'closeAll':
        appStore.removeAllTags()
        router.push('/')
        break
    }
    closeContextMenu()
  }
  // 初始化标签
  onMounted(() => {
    // 从持久化存储初始化标签
    const savedTags = localStorage.getItem('tagsViewList')
    if (savedTags) {
      appStore.initTags(JSON.parse(savedTags))
    }

    // 添加当前路由标签（包括首页）
    appStore.addTag({
      path: route.path,
      title:
        route.path === '/'
          ? '首页'
          : (route.meta.title as string) || 'Unnamed Page',
      icon: route.path === '/' ? 'mdi:home' : (route.meta.icon as string),
      meta: { affix: route.path === '/' },
    })
  })

  // 监听路由变化更新标签
  watch(
    () => route.path,
    newPath => {
      // 添加或更新当前路由标签
      appStore.addTag({
        path: newPath,
        title:
          newPath === '/'
            ? '首页'
            : (route.meta.title as string) || 'Unnamed Page',
        icon: newPath === '/' ? 'mdi:home' : (route.meta.icon as string),
        meta: { affix: newPath === '/' },
      })

      // 更新选中状态
      appStore.setActiveTag(newPath)
    },
    { immediate: true }
  )

  // 监听标签列表变化并保存到localStorage
  watch(
    () => appStore.tagsViewList,
    tags => {
      localStorage.setItem('tagsViewList', JSON.stringify(tags))
    },
    { deep: true }
  )

  // 监听选中标签变化并保存
  watch(
    () => appStore.activeTag,
    activeTag => {
      localStorage.setItem('activeTag', activeTag)
    }
  )
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
