<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-31 22:33:52
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-01 18:57:59
 * @FilePath: \Robot_Admin\src\components\global\C_Form\layouts\Custom\index.vue
 * @Description: 表单组件 - 自定义渲染组件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="c-form-custom">
    <!-- 功能介绍区域 -->
    <div
      v-if="displayConfig.showIntro"
      class="intro-section"
    >
      <NAlert
        title="自定义渲染演示"
        type="info"
        :show-icon="false"
        class="intro-alert"
      >
        <template #icon>
          <div class="i-carbon-chemistry"></div>
        </template>
        此布局展示了表单组件的自定义渲染能力，包括高级控件、特殊样式和交互效果。
        <template #action>
          <NButton
            size="small"
            text
            @click="handleToggleRenderMode"
          >
            <template #icon>
              <div class="i-carbon-view-mode-2"></div>
            </template>
            {{ renderState.mode === 'enhanced' ? '简化模式' : '增强模式' }}
          </NButton>
        </template>
      </NAlert>
    </div>

    <!-- 控制面板 -->
    <div
      v-if="displayConfig.showModeSwitch"
      class="control-panel"
    >
      <NCard
        size="small"
        title="渲染设置"
        :bordered="false"
        class="control-card"
      >
        <template #header-extra>
          <NTag :type="renderState.mode === 'enhanced' ? 'success' : 'info'">
            {{ renderState.mode === 'enhanced' ? '增强模式' : '基础模式' }}
          </NTag>
        </template>

        <NSpace class="control-options">
          <NRadioGroup
            v-model:value="renderState.mode"
            size="small"
          >
            <NRadio value="basic">基础渲染</NRadio>
            <NRadio value="enhanced">增强渲染</NRadio>
          </NRadioGroup>

          <NDivider vertical />

          <NSwitch
            v-model:value="renderState.animations"
            size="small"
          >
            <template #checked>动画开启</template>
            <template #unchecked>动画关闭</template>
          </NSwitch>

          <NSwitch
            v-model:value="renderState.tooltips"
            size="small"
          >
            <template #checked>提示开启</template>
            <template #unchecked>提示关闭</template>
          </NSwitch>
        </NSpace>
      </NCard>
    </div>

    <!-- 表单渲染区域 -->
    <div
      class="form-render-area"
      :class="renderAreaClasses"
    >
      <!-- 单一分组渲染 -->
      <div
        v-if="!hasGroups"
        class="single-group"
      >
        <div
          v-for="(item, index) in formItems"
          :key="getItemKey(item, index)"
          :class="getItemClasses(index)"
        >
          <component :is="item" />
        </div>
      </div>

      <!-- 多分组渲染 -->
      <div
        v-else
        class="multi-groups"
      >
        <div
          v-for="group in groupsWithItems"
          :key="group.config.key"
          class="group-container"
          :class="{ 'is-collapsed': isGroupCollapsed(group.config.key) }"
        >
          <!-- 分组头部 -->
          <div class="group-header">
            <div class="header-content">
              <div class="group-info">
                <div class="group-icon">
                  <div :class="getGroupIcon(group.config)"></div>
                </div>
                <h3 class="group-title">{{ group.config.title }}</h3>
                <NBadge
                  :value="group.items.length"
                  :type="getGroupBadgeType(group.config)"
                  class="item-count"
                />
              </div>

              <div
                v-if="displayConfig.showGroupActions"
                class="group-actions"
              >
                <NButton
                  size="tiny"
                  quaternary
                  @click="handleToggleGroupCollapse(group.config.key)"
                >
                  <template #icon>
                    <div :class="getCollapseIcon(group.config.key)"></div>
                  </template>
                </NButton>

                <NButton
                  size="tiny"
                  quaternary
                  @click="handleResetGroup(group.config.key)"
                >
                  <template #icon>
                    <div class="i-carbon-reset"></div>
                  </template>
                </NButton>
              </div>
            </div>

            <div
              v-if="group.config.description"
              class="group-description"
            >
              <NText depth="3">{{ group.config.description }}</NText>
            </div>
          </div>

          <!-- 分组内容 -->
          <NCollapseTransition :show="!isGroupCollapsed(group.config.key)">
            <div class="group-content">
              <div
                v-for="(item, index) in group.items"
                :key="getItemKey(item, index)"
                :class="getItemClasses(index)"
              >
                <component :is="item" />
              </div>
            </div>
          </NCollapseTransition>
        </div>
      </div>
    </div>

    <!-- 统计信息 -->
    <div
      v-if="displayConfig.showStats"
      class="stats-section"
    >
      <NCard
        size="small"
        title="渲染统计"
        :bordered="false"
        class="stats-card"
      >
        <NDescriptions
          :column="3"
          size="small"
        >
          <NDescriptionsItem label="渲染模式">
            <NTag
              :type="renderState.mode === 'enhanced' ? 'success' : 'default'"
            >
              {{ renderState.mode === 'enhanced' ? '增强模式' : '基础模式' }}
            </NTag>
          </NDescriptionsItem>
          <NDescriptionsItem label="自定义控件">
            <NBadge
              :value="customControlsCount"
              type="info"
            />
          </NDescriptionsItem>
          <NDescriptionsItem label="特效状态">
            <NSpace size="small">
              <NTag
                size="small"
                :type="renderState.animations ? 'success' : 'default'"
              >
                动画{{ renderState.animations ? '开启' : '关闭' }}
              </NTag>
              <NTag
                size="small"
                :type="renderState.tooltips ? 'success' : 'default'"
              >
                提示{{ renderState.tooltips ? '开启' : '关闭' }}
              </NTag>
            </NSpace>
          </NDescriptionsItem>
        </NDescriptions>
      </NCard>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { VNode } from 'vue'
  import type {
    LayoutProps,
    GroupConfig,
    FormOption,
    RenderMode,
  } from '@/types/modules/form'

  // ================= 接口定义 =================

  /**
   * * @description 分组与表单项的组合结构
   * ? @interface GroupWithItems
   */
  interface GroupWithItems {
    /** 分组配置信息 */
    config: GroupConfig
    /** 分组包含的表单项 */
    items: VNode[]
  }

  /**
   * * @description 组件属性接口
   * ? @interface Props
   * ! @extends LayoutProps
   */
  interface Props extends LayoutProps {
    /** 表单选项配置数组 */
    options?: FormOption[]
  }

  /**
   * * @description 渲染状态配置
   * ? @interface RenderState
   */
  interface RenderState {
    /** 渲染模式 */
    mode: RenderMode
    /** 是否启用动画 */
    animations: boolean
    /** 是否启用提示 */
    tooltips: boolean
  }

  // ================= 组件配置 =================

  const props = withDefaults(defineProps<Props>(), {
    layoutConfig: () => ({}),
    options: () => [],
  })

  const emit = defineEmits<{
    /**
     * * @description 渲染模式变更事件
     * ? @param mode 新的渲染模式
     */
    'render-mode-change': [mode: RenderMode]
    /**
     * * @description 分组折叠状态变更事件
     * ? @param groupKey 分组标识
     * ? @param collapsed 是否折叠
     */
    'group-toggle': [groupKey: string, collapsed: boolean]
    /**
     * * @description 分组重置事件
     * ? @param groupKey 分组标识
     */
    'group-reset': [groupKey: string]
  }>()

  // ================= 常量映射 =================

  /**
   * * @description 自定义控件类型列表
   * ! @constant CUSTOM_CONTROLS
   */
  const CUSTOM_CONTROLS = [
    'slider',
    'colorPicker',
    'upload',
    'rate',
    'switch',
  ] as const

  /**
   * * @description 分组图标映射表
   * ! @constant ICON_MAP
   */
  const ICON_MAP = {
    basic: 'i-carbon-user-profile',
    advanced: 'i-carbon-settings-adjust',
    upload: 'i-carbon-cloud-upload',
    system: 'i-carbon-settings',
  } as const

  /**
   * * @description 分组徽章类型映射表
   * ! @constant BADGE_MAP
   */
  const BADGE_MAP = {
    basic: 'info',
    advanced: 'warning',
    upload: 'info',
    system: 'success',
  } as const

  // ================= 响应式状态 =================

  /**
   * * @description 渲染状态管理
   * ! @reactive renderState
   */
  const renderState = reactive<RenderState>({
    mode: 'enhanced',
    animations: true,
    tooltips: true,
  })

  /**
   * * @description 折叠分组集合
   * ! @ref collapsedGroups
   */
  const collapsedGroups = ref<Set<string>>(new Set())

  // ================= 计算属性 =================

  /**
   * * @description 获取自定义布局配置
   * ? @computed layoutConfig
   * ! @return 布局配置对象
   */
  const layoutConfig = computed(() => props.layoutConfig?.custom || {})

  /**
   * * @description 获取分组配置列表
   * ? @computed groups
   * ! @return 分组配置数组
   */
  const groups = computed(() => layoutConfig.value.groups || [])

  /**
   * * @description 判断是否存在分组
   * ? @computed hasGroups
   * ! @return 是否有分组
   */
  const hasGroups = computed(() => groups.value.length > 0)

  /**
   * * @description 获取显示配置项
   * ? @computed displayConfig
   * ! @return 显示配置对象
   */
  const displayConfig = computed(() => {
    const { display = {} } = layoutConfig.value
    return {
      showIntro: display.showIntro !== false,
      showModeSwitch: display.showModeSwitch !== false,
      showGroupActions: display.showGroupActions !== false,
      showStats: display.showStats !== false,
    }
  })

  /**
   * * @description 统计自定义控件数量
   * ? @computed customControlsCount
   * ! @return 自定义控件总数
   */
  const customControlsCount = computed(
    () =>
      props.options.filter(option =>
        CUSTOM_CONTROLS.includes(option.type as any)
      ).length
  )

  /**
   * * @description 获取渲染区域CSS类
   * ? @computed renderAreaClasses
   * ! @return CSS类名数组
   */
  const renderAreaClasses = computed(() => [
    `render-mode-${renderState.mode}`,
    { 'animations-enabled': renderState.animations },
  ])

  /**
   * * @description 组装分组与表单项的映射关系
   * ? @computed groupsWithItems
   * ! @return 分组表单项组合数组
   */
  const groupsWithItems = computed((): GroupWithItems[] => {
    if (!hasGroups.value) return []

    // 初始化分组映射表
    const groupMap = new Map<string, VNode[]>()
    groups.value.forEach(group => groupMap.set(group.key, []))

    // 分配表单项到对应分组
    props.formItems.forEach((item, index) => {
      const groupKey =
        props.options?.[index]?.layout?.group ||
        groups.value[0]?.key ||
        'default'

      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, [])
      }
      groupMap.get(groupKey)!.push(item)
    })

    // 过滤出包含表单项的分组
    return groups.value
      .map(config => ({ config, items: groupMap.get(config.key) || [] }))
      .filter(group => group.items.length > 0)
  })

  // ================= 工具函数 =================

  /**
   * * @description 获取表单项唯一标识
   * ? @param item VNode对象
   * ? @param index 索引值
   * ! @return 字段ID
   */
  const getItemKey = (item: VNode, index: number): string => {
    if (item.key != null) {
      return String(item.key)
    }

    const itemProps = item.props as Record<string, any> | null
    if (itemProps?.path) {
      return itemProps.path
    }

    return `item-${index}`
  }

  /**
   * * @description 获取表单项CSS类名
   * ? @param index 表单项索引
   * ! @return CSS类名数组
   */
  const getItemClasses = (index: number): string[] => {
    const classes = ['form-item']
    const option = props.options?.[index]

    // 根据渲染模式添加类名
    if (renderState.mode === 'enhanced') {
      classes.push('enhanced')
    }

    // 根据动画状态添加类名
    if (renderState.animations) {
      classes.push('animated')
    }

    // 根据控件类型添加类名
    if (option?.layout?.enhanced || option?.layout?.customRender) {
      classes.push('custom-control')
    }

    return classes
  }

  /**
   * * @description 获取分组图标类名
   * ? @param config 分组配置对象
   * ! @return 图标CSS类名
   */
  const getGroupIcon = (config: GroupConfig): string => {
    return (
      config.icon ||
      ICON_MAP[config.key as keyof typeof ICON_MAP] ||
      'i-carbon-folder'
    )
  }

  /**
   * * @description 获取分组徽章类型
   * ? @param config 分组配置对象
   * ! @return 徽章类型字符串
   */
  const getGroupBadgeType = (config: GroupConfig) => {
    return BADGE_MAP[config.key as keyof typeof BADGE_MAP] || 'default'
  }

  /**
   * * @description 获取折叠图标类名
   * ? @param groupKey 分组标识
   * ! @return 折叠图标CSS类名
   */
  const getCollapseIcon = (groupKey: string): string => {
    return isGroupCollapsed(groupKey)
      ? 'i-carbon-chevron-down'
      : 'i-carbon-chevron-up'
  }

  // ================= 状态判断 =================

  /**
   * * @description 检查分组是否处于折叠状态
   * ? @param groupKey 分组标识
   * ! @return 是否折叠
   */
  const isGroupCollapsed = (groupKey: string): boolean => {
    return collapsedGroups.value.has(groupKey)
  }

  // ================= 事件处理 =================

  /**
   * * @description 切换渲染模式处理函数
   */
  const handleToggleRenderMode = (): void => {
    renderState.mode = renderState.mode === 'basic' ? 'enhanced' : 'basic'
    emit('render-mode-change', renderState.mode)
  }

  /**
   * * @description 切换分组折叠状态处理函数
   * ? @param groupKey 分组标识
   */
  const handleToggleGroupCollapse = (groupKey: string): void => {
    const willCollapse = !isGroupCollapsed(groupKey)

    if (willCollapse) {
      collapsedGroups.value.add(groupKey)
    } else {
      collapsedGroups.value.delete(groupKey)
    }

    emit('group-toggle', groupKey, willCollapse)
  }

  /**
   * * @description 重置分组处理函数
   * ? @param groupKey 分组标识
   */
  const handleResetGroup = (groupKey: string): void => {
    emit('group-reset', groupKey)
  }

  // ================= 监听器 =================

  /**
   * * @description 监听渲染模式变化并触发事件
   */
  watch(
    () => renderState.mode,
    newMode => {
      emit('render-mode-change', newMode)
    }
  )

  // ================= 生命周期 =================

  /**
   * * @description 组件挂载时初始化配置
   */
  onMounted(() => {
    // 初始化渲染配置
    const { rendering = {} } = layoutConfig.value
    const { mode = 'enhanced', animations = true, tooltips = true } = rendering

    Object.assign(renderState, { mode, animations, tooltips })

    // 初始化折叠状态
    groups.value.forEach(group => {
      if (group.collapsed) {
        collapsedGroups.value.add(group.key)
      }
    })
  })

  // ================= 对外暴露 =================

  /**
   * * @description 暴露组件实例方法和状态
   */
  defineExpose({
    /** 切换渲染模式方法 */
    toggleRenderMode: handleToggleRenderMode,
    /** 切换分组折叠方法 */
    toggleCollapse: handleToggleGroupCollapse,
    /** 重置分组方法 */
    resetGroup: handleResetGroup,
    /** 当前渲染模式（只读） */
    renderMode: readonly(toRef(renderState, 'mode')),
    /** 动画启用状态（只读） */
    enableAnimations: readonly(toRef(renderState, 'animations')),
    /** 提示启用状态（只读） */
    enableTooltips: readonly(toRef(renderState, 'tooltips')),
  })

  // ================= 开发调试 =================

  /**
   * * @description 开发环境下的数据一致性检查
   */
  if (import.meta.env.DEV) {
    watchEffect(() => {
      const optionCount = props.options?.length || 0
      const itemCount = props.formItems.length

      if (optionCount !== itemCount) {
        console.warn(
          `[Custom Layout] 配置项与表单项数量不匹配: options=${optionCount}, items=${itemCount}`
        )
      }
    })
  }
</script>

<style lang="scss" scoped>
  // ================= SCSS 变量定义 =================

  /**
   * * @description 设计令牌 - 统一的设计规范
   */
  $border-radius: 12px; // 圆角半径
  $border-radius-sm: 8px; // 小圆角半径
  $shadow-light: 0 2px 8px rgba(0, 0, 0, 0.06); // 轻阴影
  $shadow-medium: 0 4px 16px rgba(0, 0, 0, 0.12); // 中等阴影
  $shadow-heavy: 0 8px 32px rgba(0, 0, 0, 0.16); // 重阴影
  $transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); // 过渡动画
  $spacing: 16px; // 基础间距
  $spacing-sm: 8px; // 小间距
  $spacing-lg: 24px; // 大间距

  // ================= SCSS 混合宏定义 =================

  /**
   * * @description 卡片样式混合宏
   * ? @mixin card-style
   */
  @mixin card-style {
    border-radius: $border-radius;
    box-shadow: $shadow-light;
    transition: $transition;

    &:hover {
      box-shadow: $shadow-medium;
      transform: translateY(-2px);
    }
  }

  /**
   * * @description 玻璃态效果混合宏
   * ? @mixin glass-effect
   */
  @mixin glass-effect {
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  /**
   * * @description 响应式网格布局混合宏
   * ? @mixin responsive-grid
   * ? @param $min-width 最小宽度
   */
  @mixin responsive-grid($min-width: 300px) {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax($min-width, 1fr));
    gap: $spacing;
  }

  // ================= 主容器样式 =================

  /**
   * * @description 自定义表单布局主容器
   */
  .c-form-custom {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: $spacing-lg;
  }

  // ================= 功能区域样式 =================

  /**
   * * @description 介绍区域样式
   */
  .intro-section {
    .intro-alert {
      @include card-style;
      border: none;

      // 深度选择器：自定义图标大小
      :deep(.n-alert__icon) {
        font-size: 18px;
      }
    }
  }

  /**
   * * @description 控制面板样式
   */
  .control-panel {
    .control-card {
      @include card-style;
      @include glass-effect;

      .control-options {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: $spacing;
      }
    }
  }

  /**
   * * @description 统计信息区域样式
   */
  .stats-section {
    .stats-card {
      @include card-style;
      margin-top: $spacing;
    }
  }

  // ================= 表单渲染区域样式 =================

  /**
   * * @description 表单渲染主容器
   */
  .form-render-area {
    width: 100%;

    // 单一分组布局
    .single-group {
      @include responsive-grid(320px);
    }

    // 多分组布局
    .multi-groups {
      display: flex;
      flex-direction: column;
      gap: $spacing-lg;
    }
  }

  // ================= 分组容器样式 =================

  /**
   * * @description 分组容器主体样式
   */
  .group-container {
    @include card-style;
    overflow: hidden;
    border: 1px solid transparent;

    // 悬停状态
    &:hover {
      border-color: var(--n-border-color);
    }

    // 折叠状态
    &.is-collapsed {
      .group-header {
        border-bottom: none;
      }
    }
  }

  /**
   * * @description 分组头部样式
   */
  .group-header {
    padding: $spacing * 1.25;
    border-bottom: 1px solid var(--n-divider-color);
    transition: $transition;

    // 头部内容布局
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: $spacing * 0.75;
    }

    // 分组信息区域
    .group-info {
      display: flex;
      align-items: center;
      gap: $spacing * 0.75;
    }

    // 分组图标样式
    .group-icon {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      box-shadow: $shadow-light;
      font-size: 16px;
      transition: $transition;

      // 图标悬停效果
      &:hover {
        transform: scale(1.1);
        box-shadow: $shadow-medium;
      }
    }

    // 分组标题样式
    .group-title {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      flex: 1;
    }

    // 项目计数徽章
    .item-count {
      margin-left: auto;
    }

    // 分组操作按钮
    .group-actions {
      display: flex;
      gap: $spacing * 0.5;
    }

    // 分组描述文字
    .group-description {
      font-size: 13px;
      line-height: 1.6;
      opacity: 0.8;
    }
  }

  /**
   * * @description 分组内容样式
   */
  .group-content {
    padding: $spacing * 1.25;
    @include responsive-grid(300px);
  }

  // ================= 表单项样式 =================

  /**
   * * @description 表单项基础样式
   */
  .form-item {
    transition: $transition;
    border-radius: $border-radius-sm;
    padding: $spacing-sm;

    // 基础模式下的样式重置
    .render-mode-basic & {
      padding: 0;
    }

    // 增强模式样式
    &.enhanced {
      position: relative;

      // 伪元素创建渐变边框效果
      &::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        padding: 1px;
        background: linear-gradient(
          135deg,
          transparent,
          rgba(var(--n-primary-color-rgb), 0.1)
        );
        mask:
          linear-gradient(#fff 0 0) content-box,
          linear-gradient(#fff 0 0);
        mask-composite: xor;
        opacity: 0;
        transition: $transition;
      }

      // 悬停时显示边框效果
      &:hover::before {
        opacity: 1;
      }
    }

    // 自定义控件样式
    &.custom-control {
      border: 1px dashed var(--n-border-color);
      box-shadow: $shadow-light;

      &:hover {
        border-style: solid;
        box-shadow: $shadow-medium;
      }
    }

    // 动画效果
    &.animated {
      animation: fadeInUp 0.6s ease-out;

      &:hover {
        transform: translateY(-4px);
        box-shadow: $shadow-medium;
      }
    }
  }

  // ================= 动画关键帧 =================

  /**
   * * @description 淡入上升动画
   * ? @keyframes fadeInUp
   */
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  // ================= 响应式设计 =================

  /**
   * * @description 大屏幕设备适配 (1200px+)
   */
  @media (max-width: 1200px) {
    .group-content {
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    }
  }

  /**
   * * @description 平板设备适配 (768px+)
   */
  @media (max-width: 768px) {
    .c-form-custom {
      gap: $spacing;
    }

    .single-group {
      grid-template-columns: 1fr;
    }

    .group-content {
      grid-template-columns: 1fr;
      gap: $spacing * 0.75;
    }

    .group-header {
      padding: $spacing;

      .header-content {
        flex-direction: column;
        gap: $spacing * 0.5;
      }

      .group-info {
        width: 100%;
      }

      .group-actions {
        align-self: flex-end;
      }
    }

    .control-panel .control-options {
      flex-direction: column;
      align-items: stretch;
    }
  }

  // ================= 无障碍支持 =================

  /**
   * * @description 减少动画偏好设置支持
   */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }

    .form-item.animated:hover {
      transform: none !important;
    }
  }

  // ================= 深色模式适配 =================

  /**
   * * @description 深色模式下的特殊样式调整
   */
  @media (prefers-color-scheme: dark) {
    .group-icon {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }
  }
</style>
