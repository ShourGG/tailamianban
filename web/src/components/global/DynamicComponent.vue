<template>
  <component
    :is="componentInstance"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'

interface Props {
  name: string
}

const props = defineProps<Props>()

const componentInstance = computed(() => {
  // 根据name动态加载对应的布局组件
  const layoutComponents: Record<string, any> = {
    Default: defineAsyncComponent(() => import('../global/C_Form/layouts/Default/index.vue')),
    Inline: defineAsyncComponent(() => import('../global/C_Form/layouts/Inline/index.vue')),
    Grid: defineAsyncComponent(() => import('../global/C_Form/layouts/Grid/index.vue')),
    Card: defineAsyncComponent(() => import('../global/C_Form/layouts/Card/index.vue')),
    Tabs: defineAsyncComponent(() => import('../global/C_Form/layouts/Tabs/index.vue')),
    Steps: defineAsyncComponent(() => import('../global/C_Form/layouts/Steps/index.vue')),
    Dynamic: defineAsyncComponent(() => import('../global/C_Form/layouts/Dynamic/index.vue')),
    Custom: defineAsyncComponent(() => import('../global/C_Form/layouts/Custom/index.vue')),
  }
  
  return layoutComponents[props.name] || layoutComponents.Default
})
</script>
