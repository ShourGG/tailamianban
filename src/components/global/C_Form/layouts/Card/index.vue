<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Description: 卡片布局组件 - 支持分组显示的表单布局
 * @FilePath: \Robot_Admin\src\components\global\C_Form\layouts\Card\index.vue
-->

<template>
  <div class="c-form-card">
    <!-- 无分组配置时的单一卡片模式 -->
    <NCard
      hoverable
      v-if="!hasGroups"
      title="表单信息"
      :bordered="true"
      class="single-card"
    >
      <template
        v-for="item in formItems"
        :key="item.key"
      >
        <component :is="item" />
      </template>
    </NCard>

    <!-- 有分组配置时的多卡片模式 -->
    <template v-else>
      <NCard
        hoverable
        v-for="group in groupsWithItems"
        :key="group.config.key"
        :title="group.config.title"
        :bordered="true"
        class="card-item"
      >
        <!-- 分组描述信息 -->
        <template v-if="group.config.description">
          <p class="card-description">{{ group.config.description }}</p>
        </template>

        <!-- 分组内的表单项 -->
        <template
          v-for="item in group.items"
          :key="item.key"
        >
          <component :is="item" />
        </template>
      </NCard>
    </template>
  </div>
</template>

<script setup lang="ts">
  import type { VNode } from 'vue'

  /**
   * * @description: 分组配置接口
   * ! @interface GroupConfig
   */
  interface GroupConfig {
    key: string // 分组唯一标识
    title: string // 分组标题
    description?: string // 分组描述文本
  }

  /**
   * * @description: 分组数据接口
   * ! @interface GroupWithItems
   */
  interface GroupWithItems {
    config: GroupConfig // 分组配置
    items: VNode[] // 分组内的表单项
  }

  /**
   * * @description: 组件属性接口定义
   * ! @interface Props
   */
  interface Props {
    formItems: VNode[] // 表单项VNode数组
    layoutConfig?: {
      // 布局配置对象
      card?: {
        groups?: GroupConfig[] // 分组配置数组
      }
    }
    options?: Array<{
      // 表单项配置数组
      layout?: {
        group?: string // 所属分组标识
      }
    }>
  }

  const props = defineProps<Props>()

  // ================= 计算属性 =================

  /**
   * * @description: 分组配置数组
   * ? @computed 从布局配置中提取分组信息
   * ! @return {GroupConfig[]} 分组配置数组
   */
  const groups = computed((): GroupConfig[] => {
    return props.layoutConfig?.card?.groups || []
  })

  /**
   * * @description: 是否有分组配置
   * ? @computed 判断是否配置了分组
   * ! @return {boolean} 是否有分组配置
   */
  const hasGroups = computed((): boolean => {
    return groups.value.length > 0
  })

  /**
   * * @description: 包含表单项的分组数据
   * ? @computed 将表单项按分组归类，只返回有内容的分组
   * ! @return {GroupWithItems[]} 分组数据数组
   */
  const groupsWithItems = computed((): GroupWithItems[] => {
    if (!hasGroups.value) return []

    const groupMap = new Map<string, VNode[]>()

    // 初始化分组映射
    groups.value.forEach(group => {
      groupMap.set(group.key, [])
    })

    // 将表单项分配到对应分组
    props.formItems.forEach((item, index) => {
      const option = props.options?.[index]
      const groupKey =
        option?.layout?.group || groups.value[0]?.key || 'default'

      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, [])
      }
      groupMap.get(groupKey)!.push(item)
    })

    // 只返回有表单项的分组
    return groups.value
      .map(groupConfig => ({
        config: groupConfig,
        items: groupMap.get(groupConfig.key) || [],
      }))
      .filter(group => group.items.length > 0)
  })
</script>

<style scoped>
  .c-form-card {
    width: 100%;
  }

  .single-card,
  .card-item {
    margin-bottom: 16px;
  }

  .card-item:last-child {
    margin-bottom: 0;
  }

  .card-description {
    margin: 0 0 16px 0;
    color: var(--text-color-2);
    font-size: 14px;
    line-height: 1.5;
  }
</style>
