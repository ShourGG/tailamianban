<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Description: 标签页布局组件 - 支持标签页分组显示的表单布局
 * @FilePath: \Robot_Admin\src\components\global\C_Form\layouts\Tabs\index.vue
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="c-form-tabs">
    <!-- 无标签配置时的单一面板模式 -->
    <div
      v-if="!hasTabs"
      class="single-panel"
    >
      <template
        v-for="item in formItems"
        :key="getItemKey(item, formItems.indexOf(item))"
      >
        <component :is="item" />
      </template>
    </div>

    <!-- 有标签配置时的多标签页模式 -->
    <NTabs
      v-else
      v-model:value="activeTab"
      type="line"
      animated
      :placement="tabsPlacement"
      class="form-tabs"
    >
      <NTabPane
        v-for="tab in tabsWithItems"
        :key="tab.config.key"
        :name="tab.config.key"
        :tab="tab.config.title"
        :disabled="tab.config.disabled"
      >
        <!-- 标签页描述信息 -->
        <div
          v-if="tab.config.description"
          class="tab-description"
        >
          <NText depth="3">{{ tab.config.description }}</NText>
        </div>

        <!-- 标签页内的表单项 -->
        <div class="tab-content">
          <template
            v-for="item in tab.items"
            :key="getItemKey(item, tab.items.indexOf(item))"
          >
            <component :is="item" />
          </template>
        </div>
      </NTabPane>

      <!-- 自定义标签页额外操作区域 -->
      <template #suffix>
        <slot
          name="tabs-suffix"
          :activeTab="activeTab"
          :tabs="tabsWithItems"
        />
      </template>
    </NTabs>
  </div>
</template>

<script setup lang="ts">
  import type { VNode } from 'vue'

  // ================= 类型定义 =================

  /**
   * * @description: 标签页配置接口
   * ! @interface TabConfig
   */
  interface TabConfig {
    key: string // 标签页唯一标识
    title: string // 标签页标题
    description?: string // 标签页描述文本
    disabled?: boolean // 是否禁用标签页
    icon?: string // 标签页图标（可选）
  }

  /**
   * * @description: 标签页数据接口
   * ! @interface TabWithItems
   */
  interface TabWithItems {
    config: TabConfig // 标签页配置
    items: VNode[] // 标签页内的表单项
  }

  /**
   * * @description: 标签页布局配置接口
   * ! @interface TabsLayoutConfig
   */
  interface TabsLayoutConfig {
    tabs?: TabConfig[] // 标签页配置数组
    placement?: 'top' | 'right' | 'bottom' | 'left' // 标签页位置
    defaultTab?: string // 默认激活的标签页
  }

  /**
   * * @description: 组件属性接口定义
   * ! @interface Props
   */
  interface Props {
    formItems: VNode[] // 表单项VNode数组
    layoutConfig?: {
      // 布局配置对象
      tabs?: TabsLayoutConfig
    }
    options?: Array<{
      // 表单项配置数组
      layout?: {
        tab?: string // 所属标签页标识
      }
    }>
  }

  /**
   * * @description: 组件事件定义
   * ? @emits 定义组件对外发送的事件
   */
  interface Emits {
    (e: 'tab-change', tabKey: string): void // 标签页切换事件
  }

  // ================= 组件属性和事件 =================

  const props = withDefaults(defineProps<Props>(), {
    layoutConfig: () => ({}),
    options: () => [],
  })

  const emit = defineEmits<Emits>()

  // ================= 响应式状态 =================

  const activeTab = ref<string>('')

  // ================= 计算属性 =================

  /**
   * * @description: 标签页配置数组
   * ? @computed 从布局配置中提取标签页信息
   * ! @return {TabConfig[]} 标签页配置数组
   */
  const tabs = computed((): TabConfig[] => {
    return props.layoutConfig?.tabs?.tabs || []
  })

  /**
   * * @description: 标签页位置
   * ? @computed 获取标签页的显示位置
   * ! @return {'top' | 'right' | 'bottom' | 'left'} 标签页位置
   */
  const tabsPlacement = computed(() => {
    return props.layoutConfig?.tabs?.placement || 'top'
  })

  /**
   * * @description: 是否有标签页配置
   * ? @computed 判断是否配置了标签页
   * ! @return {boolean} 是否有标签页配置
   */
  const hasTabs = computed((): boolean => {
    return tabs.value.length > 0
  })

  /**
   * * @description: 包含表单项的标签页数据
   * ? @computed 将表单项按标签页归类，只返回有内容的标签页
   * ! @return {TabWithItems[]} 标签页数据数组
   */
  const tabsWithItems = computed((): TabWithItems[] => {
    if (!hasTabs.value) return []

    const tabMap = new Map<string, VNode[]>()

    // 初始化标签页映射
    tabs.value.forEach(tab => {
      tabMap.set(tab.key, [])
    })

    // 将表单项分配到对应标签页
    props.formItems.forEach((item, index) => {
      const option = props.options?.[index]
      const tabKey = option?.layout?.tab || tabs.value[0]?.key || 'default'

      if (!tabMap.has(tabKey)) {
        tabMap.set(tabKey, [])
      }
      tabMap.get(tabKey)!.push(item)
    })

    // 只返回有表单项的标签页
    return tabs.value
      .map(tabConfig => ({
        config: tabConfig,
        items: tabMap.get(tabConfig.key) || [],
      }))
      .filter(tab => tab.items.length > 0)
  })

  // ================= 方法 =================

  /**
   * * @description: 获取表单项的唯一key
   * ? @param {VNode} item VNode实例
   * ? @param {number} index 索引
   * ! @return {string} 唯一标识符
   */
  const getItemKey = (item: VNode, index: number): string => {
    // 处理VNode.key的类型安全转换
    if (item.key != null) {
      return String(item.key)
    }

    // 尝试从props中获取唯一标识
    const itemProps = item.props as any
    if (itemProps?.path) {
      return itemProps.path
    }

    // 最后使用索引作为fallback
    return `tab-item-${index}`
  }

  /**
   * * @description: 初始化默认激活的标签页
   * ? @function 根据配置或第一个可用标签页设置默认激活
   * ! @return {void}
   */
  const initializeActiveTab = (): void => {
    if (!hasTabs.value || tabsWithItems.value.length === 0) return

    const defaultTab = props.layoutConfig?.tabs?.defaultTab
    const availableTabs = tabsWithItems.value.filter(
      tab => !tab.config.disabled
    )

    if (
      defaultTab &&
      availableTabs.find(tab => tab.config.key === defaultTab)
    ) {
      activeTab.value = defaultTab
    } else if (availableTabs.length > 0) {
      activeTab.value = availableTabs[0].config.key
    }
  }

  // ================= 监听器 =================

  /**
   * * @description: 监听标签页切换
   * ? @watch 当标签页切换时触发事件
   */
  watch(activeTab, newTab => {
    if (newTab) {
      emit('tab-change', newTab)
    }
  })

  /**
   * * @description: 监听标签页配置变化
   * ? @watch 当标签页配置变化时重新初始化
   */
  watch(
    () => tabsWithItems.value,
    () => {
      initializeActiveTab()
    },
    { immediate: true }
  )

  // ================= 生命周期 =================

  onMounted(() => {
    initializeActiveTab()
  })

  // ================= 开发环境验证 =================

  if (import.meta.env.DEV) {
    // 验证配置项数量是否匹配
    watchEffect(() => {
      if (props.options && props.options.length !== props.formItems.length) {
        console.warn(
          `[C_Form Tabs Layout] 配置项数量(${props.options.length})与表单项数量(${props.formItems.length})不匹配`
        )
      }
    })

    // 验证标签页配置的合理性
    watchEffect(() => {
      if (hasTabs.value) {
        const tabKeys = tabs.value.map(tab => tab.key)
        const uniqueKeys = new Set(tabKeys)
        if (tabKeys.length !== uniqueKeys.size) {
          console.warn('[C_Form Tabs Layout] 存在重复的标签页key')
        }
      }
    })
  }
</script>

<style scoped>
  .c-form-tabs {
    width: 100%;
  }

  .single-panel {
    width: 100%;
  }

  .form-tabs {
    width: 100%;
  }

  .tab-description {
    margin-bottom: 16px;
    padding: 8px 12px;
    background-color: var(--color-info-suppl);
    border-left: 3px solid var(--color-info);
    border-radius: 4px;
  }

  .tab-content {
    width: 100%;
    min-height: 200px; /* 确保内容区域有最小高度 */
  }

  /* ================= 标签页位置样式调整 ================= */

  /* 右侧标签页时的内容区域调整 */
  .form-tabs:deep(.n-tabs--right-placement .n-tab-pane) {
    padding-left: 16px;
  }

  /* 左侧标签页时的内容区域调整 */
  .form-tabs:deep(.n-tabs--left-placement .n-tab-pane) {
    padding-right: 16px;
  }

  /* 底部标签页时的内容区域调整 */
  .form-tabs:deep(.n-tabs--bottom-placement .n-tab-pane) {
    padding-top: 16px;
  }

  /* ================= 响应式设计 ================= */

  /* 平板设备 */
  @media (max-width: 1024px) {
    .tab-content {
      min-height: 150px;
    }
  }

  /* 移动设备 - 强制标签页位置为顶部 */
  @media (max-width: 768px) {
    .form-tabs:deep(.n-tabs) {
      --n-tab-placement: top !important;
    }

    .tab-description {
      margin-bottom: 12px;
      padding: 6px 10px;
      font-size: 13px;
    }

    .tab-content {
      min-height: 120px;
    }
  }

  /* 小屏手机 */
  @media (max-width: 480px) {
    .tab-description {
      margin-bottom: 8px;
      padding: 4px 8px;
      font-size: 12px;
    }

    .tab-content {
      min-height: 100px;
    }
  }

  /* ================= 辅助功能 ================= */

  /* 减少动画的用户偏好 */
  @media (prefers-reduced-motion: reduce) {
    .form-tabs:deep(.n-tabs) {
      --n-tab-animation-duration: 0s !important;
    }
  }

  /* 高对比度模式支持 */
  @media (prefers-contrast: high) {
    .tab-description {
      border-width: 2px;
      font-weight: 500;
    }
  }
</style>
