<template>
  <div
    class="project-homepage"
    :class="{ 'dark-theme': isDarkTheme }"
  >
    <!-- 顶部横幅 -->
    <section class="hero-banner">
      <div class="hero-content">
        <!-- 左侧：项目信息 -->
        <div class="project-intro">
          <NTag
            class="project-badge"
            type="success"
            round
          >
            <template #icon>
              <div class="badge-dot"></div>
            </template>
            开源项目 · MIT License
          </NTag>

          <h1 class="project-title">
            <span
              class="title-main"
              @mouseenter="startAnimation"
              @mouseleave="stopAnimation"
            >
              <span
                v-for="(char, index) in titleChars"
                :key="index"
                class="title-char"
                :style="{ animationDelay: `${index * 0.1}s` }"
                :class="{ animate: isAnimating }"
              >
                {{ char === ' ' ? '&nbsp;' : char }}
              </span>
            </span>
            <span class="title-desc">现代化企业级后台管理系统</span>
          </h1>

          <p class="project-description">
            基于业务驱动，开箱即用的需求，也基于项目产品化，起步通用设计，亦或计划构建业务场景模板。
            逐步完善一个的高性能、可扩展的企业级管理平台，
            能支持单体、单一、微服务等架构方式，满足多租户、RBAC权限管理、工作流、数据可视化等功能的通用平台。
            也基于项目作为一个基点，引导团队伙伴相对标准化、工程化的的方式解构业务。
            最后，开源不易，若这个项目对你有所帮助，请点个Star予以支持。
          </p>

          <!-- 项目状态 - 数据驱动 -->
          <div class="project-stats">
            <div
              v-for="stat in projectStats"
              :key="stat.label"
              class="stat-item"
            >
              <C_Icon
                :name="stat.icon"
                size="30"
              />
              <div class="stat-number">{{ stat.number }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>

          <!-- 操作按钮 - 数据驱动 -->
          <NSpace
            class="project-actions"
            :size="16"
          >
            <NButton
              v-for="action in actionButtons"
              :key="action.text"
              :type="action.type"
              :secondary="action.secondary"
              :tertiary="action.tertiary"
              size="large"
              :strong="action.strong"
            >
              <template #icon>
                <div class="btn-icon">{{ action.icon }}</div>
              </template>
              {{ action.text }}
            </NButton>
          </NSpace>
        </div>

        <!-- 右侧：个人简介卡片 -->
        <NCard
          class="author-card"
          :bordered="false"
        >
          <div class="author-content">
            <div class="author-avatar">
              <div class="avatar-glow"></div>
              <NAvatar
                size="large"
                class="avatar-main"
                >🤖</NAvatar
              >
              <NTag
                size="small"
                type="info"
                round
                class="author-status"
              >
                <template #icon>
                  <div class="status-dot"></div>
                </template>
                Available for collaboration
              </NTag>
            </div>

            <div class="author-info">
              <h3 class="author-name">前端咔啦咪 & 敏捷追光者</h3>
              <p class="author-bio">I'M CHENY，希望可以这个应用可以帮到你</p>
              <div class="author-stats">
                <div
                  v-for="stat in authorStats"
                  :key="stat.label"
                  class="author-stat"
                >
                  <div class="stat-number">{{ stat.number }}</div>
                  <div class="stat-label">{{ stat.label }}</div>
                </div>
              </div>
            </div>
          </div>
        </NCard>
      </div>
    </section>

    <!-- 主要内容区域 -->
    <div class="main-container">
      <!-- 左侧内容区 -->
      <div class="content-left">
        <!-- 核心功能模块 -->
        <NCard
          class="feature-modules"
          title="核心功能模块"
          :bordered="false"
        >
          <template #header-extra>
            <NTag
              type="info"
              size="small"
              >完整的企业级功能生态</NTag
            >
          </template>
          <div class="modules-grid">
            <NCard
              v-for="module in coreModules"
              :key="module.name"
              size="small"
              class="module-card"
              hoverable
            >
              <div class="module-content">
                <div class="module-icon">{{ module.icon }}</div>
                <h3>{{ module.name }}</h3>
                <p>{{ module.desc }}</p>
                <NTag
                  size="small"
                  type="default"
                  class="module-tech"
                >
                  {{ module.tech }}
                </NTag>
              </div>
            </NCard>
          </div>
        </NCard>

        <!-- 技术架构 -->
        <NCard
          class="tech-architecture"
          title="技术架构"
          :bordered="false"
        >
          <template #header-extra>
            <NTag
              type="info"
              size="small"
              >现代化技术栈，性能与开发体验并重</NTag
            >
          </template>
          <div class="architecture-flow">
            <template
              v-for="(layer, index) in techLayers"
              :key="layer.name"
            >
              <div class="arch-layer-wrapper">
                <div :class="['arch-layer', layer.className]">
                  <div class="layer-header">
                    <h4 class="layer-title">{{ layer.name }}</h4>
                    <div class="layer-icon">{{ layer.icon }}</div>
                  </div>
                  <div class="layer-techs">
                    <NTag
                      v-for="tech in layer.techs"
                      :key="tech"
                      size="small"
                      :type="layer.tagType"
                      round
                    >
                      {{ tech }}
                    </NTag>
                  </div>
                </div>
              </div>
              <div
                v-if="index < techLayers.length - 1"
                class="arch-arrow"
                >⬇️</div
              >
            </template>
          </div>
        </NCard>

        <!-- 演示页面展示 -->
        <NCard
          class="demo-showcase"
          :bordered="false"
        >
          <template #header>
            <div class="demo-header">
              <span class="demo-title">演示页面</span>
              <NBadge
                :value="demoList.length"
                type="info"
              />
            </div>
          </template>
          <template #header-extra>
            <NTag
              type="info"
              size="small"
              >涵盖各种常用组件和功能展示</NTag
            >
          </template>
          <div class="demo-grid">
            <div
              v-for="demo in demoList"
              :key="demo.name"
              class="demo-item"
            >
              <div class="demo-icon">{{ demo.icon }}</div>
              <div class="demo-name">{{ demo.name }}</div>
            </div>
          </div>
        </NCard>
      </div>

      <!-- 右侧内容区 -->
      <div class="content-right">
        <!-- 项目结构 -->
        <NCard
          class="project-structure"
          title="项目结构"
          :bordered="false"
        >
          <template #header-extra>
            <NTag
              type="info"
              size="small"
              >完整的企业级项目架构</NTag
            >
          </template>
          <div class="file-tree-container">
            <div class="file-tree">
              <TreeNode :node="projectStructure" />
            </div>
          </div>
        </NCard>

        <!-- 核心特性 -->
        <NCard
          class="core-features"
          title="核心特性"
          :bordered="false"
        >
          <NList class="features-list">
            <NListItem
              v-for="feature in coreFeatures"
              :key="feature.name"
            >
              <template #prefix>
                <div class="feature-icon">{{ feature.icon }}</div>
              </template>
              <NThing
                :title="feature.name"
                :description="feature.desc"
              />
            </NListItem>
          </NList>
        </NCard>

        <!-- 开发工具链 -->
        <NCard
          class="dev-tools"
          title="开发工具链"
          :bordered="false"
        >
          <template #header-extra>
            <NTag
              type="success"
              size="small"
              >现代化开发体验</NTag
            >
          </template>
          <div class="tools-grid">
            <div
              v-for="category in toolCategories"
              :key="category.name"
              class="tool-category"
            >
              <h4>{{ category.name }}</h4>
              <div class="tool-tags">
                <NTag
                  v-for="tool in category.tools"
                  :key="tool"
                  size="small"
                  :type="category.type"
                >
                  {{ tool }}
                </NTag>
              </div>
            </div>
          </div>
        </NCard>

        <!-- 快速开始 -->
        <NCard
          class="quick-start"
          title="快速开始"
          :bordered="false"
        >
          <div class="start-steps">
            <div
              v-for="(step, index) in quickSteps"
              :key="step.title"
              class="step-item"
            >
              <div class="step-number">{{ index + 1 }}</div>
              <div class="step-content">
                <h4>{{ step.title }}</h4>
                <NCode
                  :code="step.code"
                  language="bash"
                  class="step-code"
                />
              </div>
            </div>
          </div>
        </NCard>

        <!-- 开源许可和贡献 -->
        <NCard
          class="license-card"
          title="开源许可"
          :bordered="false"
        >
          <div class="license-content">
            <div class="license-info">
              <div class="license-badge">
                <div class="license-icon">⚖️</div>
                <div class="license-text">
                  <h4>MIT License</h4>
                  <p>自由使用、修改和分发</p>
                </div>
              </div>
              <div class="author-info-card">
                <h4>作者信息</h4>
                <p><strong>ChenY</strong> - ycyplus@gmail.com</p>
                <p>
                  GitHub:
                  <a
                    href="https://github.com/ChenyCHENYU"
                    target="_blank"
                  >
                    @ChenyCHENYU
                  </a>
                </p>
              </div>
            </div>
          </div>
        </NCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useThemeVars } from 'naive-ui/es'
  import { defineComponent, h, type PropType, type VNode } from 'vue'
  import {
    projectStats,
    actionButtons,
    authorStats,
    coreModules,
    techLayers,
    demoList,
    coreFeatures,
    toolCategories,
    quickSteps,
    projectStructure,
    type TreeNode as TreeNodeType,
  } from './data'

  // 主题检测
  const themeVars = useThemeVars()
  const isDarkTheme = computed(() => {
    return (
      themeVars.value.bodyColor === '#101014' ||
      themeVars.value.bodyColor.includes('18') ||
      themeVars.value.bodyColor.includes('1f')
    )
  })

  // 标题动画相关
  const isAnimating = ref(false)
  const titleChars = ref('Robot Admin'.split(''))

  const startAnimation = () => {
    isAnimating.value = true
  }

  const stopAnimation = () => {
    isAnimating.value = false
  }

  // 递归文件树组件 - 解决重复代码问题
  const TreeNode = defineComponent({
    name: 'TreeNode',
    props: {
      node: {
        type: Object as PropType<TreeNodeType>,
        required: true,
      },
    },
    /**
     * * @description: 递归渲染文件树节点
     */
    setup(props) {
      const renderNode = (node: TreeNodeType): VNode => {
        return h('div', {}, [
          // 当前节点
          h('div', { class: ['tree-item', node.type] }, [
            h('span', { class: 'tree-icon' }, node.icon),
            h('span', { class: 'tree-name' }, node.name),
            node.desc && h('span', { class: 'tree-desc' }, node.desc),
          ]),
          // 子节点
          node.children &&
            h(
              'div',
              { class: 'tree-children' },
              node.children.map(child => renderNode(child))
            ),
        ])
      }

      return () => renderNode(props.node)
    },
  })
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
