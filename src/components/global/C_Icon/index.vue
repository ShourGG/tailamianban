<!--
 * @Author: ChenYu
 * @Date: 2022-03-14 11:20:08
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-28 10:59:51
 * @FilePath: \Robot_Admin\src\components\global\C_Icon\index.vue
 * @Description: 图标组件，支持多种图标使用方式
 * Copyright (c) ${2023} by ChenYu, All Rights Reserved.
-->
<template>
  <div
    class="c-icon"
    :style="{ fontSize: `${size}px`, color }"
  >
    <!-- 方式1：UnoCSS图标（默认方式） -->
    <div
      v-if="type === 'unocss' || !type"
      :class="name"
      :style="iconStyle"
    ></div>

    <!-- 方式2：组件挂载方式 -->
    <component
      v-else-if="type === 'component'"
      :is="resolvedComponent"
      v-bind="$attrs"
    >
    </component>

    <!-- 方式3：SVG路径方式，注意使用时要给路径传入svgPath属性 -->
    <svg
      v-else-if="type === 'svg'"
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      :style="iconStyle"
    >
      <path
        :d="svgPath"
        :fill="color"
      />
    </svg>
  </div>
</template>

<script lang="ts" setup>
  import { computed, onMounted } from 'vue'

  interface Props {
    /** 图标名称 */
    name: string
    /** 图标类型: unocss(默认) | component | svg  */
    type?: 'unocss' | 'component' | 'svg'
    /** 图标颜色 */
    color?: string
    /** 图标大小(px) */
    size?: number
    /** SVG路径数据(仅type=svg时使用) */
    svgPath?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    name: '',
    type: 'unocss',
    color: 'currentColor',
    size: 18,
    svgPath: '',
  })

  // 图标样式
  const iconStyle = computed(() => ({
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
  }))

  // 解析组件名称
  const resolvedComponent = computed(() => {
    if (!props.name) {
      console.warn('[C_Icon] 当type为时 "component"，需要输入组件名 ')
      return null
    }
    return props.name
  })

  // 验证配置
  onMounted(() => {
    // 验证UnoCSS图标
    if ((props.type === 'unocss' || !props.type) && !props.name) {
      console.warn('[C_Icon] 类型为 "unocss" 时需要图标名称')
    }
  })
</script>
