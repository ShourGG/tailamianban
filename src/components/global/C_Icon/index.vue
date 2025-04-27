<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-27 10:43:21
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-04-27 16:22:26
 * @FilePath: \Robot_Admin\src\components\global\C_Icon\index.vue
 * @Description: icon 组件，iconify / unocss / icons svg 三种模式，按需直接推荐第二种
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<!-- MARK: 第一种方式组件挂载，<icon-mdi-ab-testing> 类似这样去使用即可 -->

<!-- MARK: 第二种方式css挂载，静态类似这样 <div class="i-mdi-ab-testing"> 👍 推荐 -->

<!-- MARK: 第三种方式不推荐，需要在本地维护svg path, 然后通过组件使用 -->

<template>
  <div class="icon-container">
    <div
      class="icon-container-item"
      v-for="iconClassName in iconSafelist"
      :key="iconClassName"
      @click="clickSelectIcon(iconClassName || '')"
    >
      <div :class="iconClassName"></div>
      <div class="icon-container-item-info">{{ iconClassName }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { iconSafelist } from '@/utils/unocss/icon-safelist'

  const { copy } = useClipboard()
  const message = useMessage()

  const clickSelectIcon = async (iconClassName: string) => {
    try {
      await copy(iconClassName)
      message.success('复制成功 ' + iconClassName)
    } catch {
      message.error('复制失败')
    }
  }
</script>
