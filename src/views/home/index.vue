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
            完全免费，基于 Vue 3 + TypeScript + Naive UI
            构建的高性能、可扩展的企业级管理平台，
            支持微服务架构、多租户、RBAC权限管理、数据可视化等功能，
            开源不易，若对你有帮助，请给点个Star
          </p>

          <div class="project-stats">
            <div class="stat-item">
              <C_Icon
                name="fluent-color:approvals-app-16"
                size="30"
              />
              <div class="stat-number">当前</div>
              <div class="stat-label">Monomer</div>
            </div>
            <div class="stat-item">
              <C_Icon
                name="fluent-color:animal-paw-print-20"
                size="30"
              />
              <div class="stat-number">接下来</div>
              <div class="stat-label">Monorepo</div>
            </div>
            <div class="stat-item">
              <C_Icon
                name="fluent-color:flag-24"
                size="30"
              />

              <div class="stat-number">计划</div>
              <div class="stat-label">MicroApp</div>
            </div>
            <div class="stat-item">
              <C_Icon
                name="fluent-color:beach-28"
                size="30"
              />

              <div class="stat-number">最后</div>
              <div class="stat-label">NestJS</div>
            </div>
          </div>

          <NSpace
            class="project-actions"
            :size="16"
          >
            <NButton
              type="primary"
              size="large"
              strong
            >
              <template #icon>
                <div class="btn-icon">🐙</div>
              </template>
              GitHub 仓库
            </NButton>
            <NButton
              secondary
              size="large"
            >
              <template #icon>
                <div class="btn-icon">▶️</div>
              </template>
              在线演示
            </NButton>
            <NButton
              tertiary
              size="large"
            >
              <template #icon>
                <div class="btn-icon">📄</div>
              </template>
              查看文档
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
              >
                🤖
              </NAvatar>
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
              <p class="author-bio"> I‘M CHENY，希望可以这个应用可以帮到你 </p>
              <div class="author-stats">
                <div class="author-stat">
                  <div class="stat-number">5+</div>
                  <div class="stat-label">⭐Star</div>
                </div>
                <div class="author-stat">
                  <div class="stat-number">50+</div>
                  <div class="stat-label">🍴Forks</div>
                </div>
                <div class="author-stat">
                  <div class="stat-number">1K+</div>
                  <div class="stat-label">👁️Views</div>
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
              v-for="module in modules"
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
            <div
              v-for="(layer, index) in architecture"
              :key="layer.name"
              class="arch-layer-wrapper"
            >
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

              <div
                v-if="index < architecture.length - 1"
                class="arch-arrow"
              >
                ⬇️
              </div>
            </div>
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
                :value="27"
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
              v-for="demo in demoPages"
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
              <div class="tree-item folder">
                <span class="tree-icon">📁</span>
                <span class="tree-name">Robot_Admin/</span>
              </div>
              <div class="tree-children">
                <div class="tree-item folder">
                  <span class="tree-icon">📁</span>
                  <span class="tree-name">src/</span>
                  <span class="tree-desc">源代码目录</span>
                </div>
                <div class="tree-children">
                  <div class="tree-item folder">
                    <span class="tree-icon">📁</span>
                    <span class="tree-name">api/</span>
                    <span class="tree-desc">接口管理层</span>
                  </div>
                  <div class="tree-item folder">
                    <span class="tree-icon">📁</span>
                    <span class="tree-name">components/</span>
                    <span class="tree-desc">组件库</span>
                  </div>
                  <div class="tree-children">
                    <div class="tree-item folder">
                      <span class="tree-icon">📁</span>
                      <span class="tree-name">global/</span>
                      <span class="tree-desc">全局组件</span>
                    </div>
                    <div class="tree-children">
                      <div class="tree-item folder">
                        <span class="tree-icon">📁</span>
                        <span class="tree-name">C_Form/</span>
                        <span class="tree-desc">表单组件</span>
                      </div>
                      <div class="tree-item folder">
                        <span class="tree-icon">📁</span>
                        <span class="tree-name">C_Table/</span>
                        <span class="tree-desc">表格组件</span>
                      </div>
                      <div class="tree-item folder">
                        <span class="tree-icon">📁</span>
                        <span class="tree-name">C_Header/</span>
                        <span class="tree-desc">头部组件</span>
                      </div>
                      <div class="tree-item folder">
                        <span class="tree-icon">📁</span>
                        <span class="tree-name">C_Menu/</span>
                        <span class="tree-desc">菜单组件</span>
                      </div>
                    </div>
                    <div class="tree-item folder">
                      <span class="tree-icon">📁</span>
                      <span class="tree-name">local/</span>
                      <span class="tree-desc">局部组件</span>
                    </div>
                  </div>
                  <div class="tree-item folder">
                    <span class="tree-icon">📁</span>
                    <span class="tree-name">views/</span>
                    <span class="tree-desc">页面视图</span>
                  </div>
                  <div class="tree-children">
                    <div class="tree-item folder">
                      <span class="tree-icon">📁</span>
                      <span class="tree-name">dashboard/</span>
                      <span class="tree-desc">仪表盘</span>
                    </div>
                    <div class="tree-item folder">
                      <span class="tree-icon">📁</span>
                      <span class="tree-name">demo/</span>
                      <span class="tree-desc">演示页面(27个)</span>
                    </div>
                    <div class="tree-item folder">
                      <span class="tree-icon">📁</span>
                      <span class="tree-name">sys-manage/</span>
                      <span class="tree-desc">系统管理</span>
                    </div>
                    <div class="tree-item folder">
                      <span class="tree-icon">📁</span>
                      <span class="tree-name">login/</span>
                      <span class="tree-desc">登录页面</span>
                    </div>
                  </div>
                  <div class="tree-item folder">
                    <span class="tree-icon">📁</span>
                    <span class="tree-name">stores/</span>
                    <span class="tree-desc">状态管理</span>
                  </div>
                  <div class="tree-children">
                    <div class="tree-item folder">
                      <span class="tree-icon">📁</span>
                      <span class="tree-name">app/</span>
                      <span class="tree-desc">应用状态</span>
                    </div>
                    <div class="tree-item folder">
                      <span class="tree-icon">📁</span>
                      <span class="tree-name">user/</span>
                      <span class="tree-desc">用户状态</span>
                    </div>
                    <div class="tree-item folder">
                      <span class="tree-icon">📁</span>
                      <span class="tree-name">permission/</span>
                      <span class="tree-desc">权限状态</span>
                    </div>
                  </div>
                  <div class="tree-item folder">
                    <span class="tree-icon">📁</span>
                    <span class="tree-name">composables/</span>
                    <span class="tree-desc">组合式API</span>
                  </div>
                  <div class="tree-item folder">
                    <span class="tree-icon">📁</span>
                    <span class="tree-name">hooks/</span>
                    <span class="tree-desc">自定义Hook</span>
                  </div>
                  <div class="tree-item folder">
                    <span class="tree-icon">📁</span>
                    <span class="tree-name">router/</span>
                    <span class="tree-desc">路由配置</span>
                  </div>
                  <div class="tree-item folder">
                    <span class="tree-icon">📁</span>
                    <span class="tree-name">utils/</span>
                    <span class="tree-desc">工具函数</span>
                  </div>
                  <div class="tree-item folder">
                    <span class="tree-icon">📁</span>
                    <span class="tree-name">types/</span>
                    <span class="tree-desc">类型定义</span>
                  </div>
                  <div class="tree-item folder">
                    <span class="tree-icon">📁</span>
                    <span class="tree-name">directives/</span>
                    <span class="tree-desc">自定义指令</span>
                  </div>
                </div>
                <div class="tree-item folder">
                  <span class="tree-icon">📁</span>
                  <span class="tree-name">scripts/</span>
                  <span class="tree-desc">构建脚本</span>
                </div>
                <div class="tree-item folder">
                  <span class="tree-icon">📁</span>
                  <span class="tree-name">public/</span>
                  <span class="tree-desc">静态资源</span>
                </div>
                <div class="tree-item file">
                  <span class="tree-icon">📄</span>
                  <span class="tree-name">vite.config.ts</span>
                  <span class="tree-desc">Vite配置</span>
                </div>
                <div class="tree-item file">
                  <span class="tree-icon">📄</span>
                  <span class="tree-name">unocss.config.ts</span>
                  <span class="tree-desc">UnoCSS配置</span>
                </div>
                <div class="tree-item file">
                  <span class="tree-icon">📄</span>
                  <span class="tree-name">package.json</span>
                  <span class="tree-desc">项目配置</span>
                </div>
                <div class="tree-item file">
                  <span class="tree-icon">📄</span>
                  <span class="tree-name">tsconfig.json</span>
                  <span class="tree-desc">TS配置</span>
                </div>
              </div>
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
              v-for="feature in features"
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
            <div class="tool-category">
              <h4>代码质量</h4>
              <div class="tool-tags">
                <NTag
                  size="small"
                  type="info"
                  >ESLint</NTag
                >
                <NTag
                  size="small"
                  type="info"
                  >Prettier</NTag
                >
                <NTag
                  size="small"
                  type="info"
                  >Oxlint</NTag
                >
                <NTag
                  size="small"
                  type="info"
                  >TypeScript</NTag
                >
              </div>
            </div>
            <div class="tool-category">
              <h4>测试工具</h4>
              <div class="tool-tags">
                <NTag
                  size="small"
                  type="success"
                  >Vitest</NTag
                >
                <NTag
                  size="small"
                  type="success"
                  >@vue/test-utils</NTag
                >
                <NTag
                  size="small"
                  type="success"
                  >jsdom</NTag
                >
              </div>
            </div>
            <div class="tool-category">
              <h4>提交规范</h4>
              <div class="tool-tags">
                <NTag
                  size="small"
                  type="warning"
                  >Husky</NTag
                >
                <NTag
                  size="small"
                  type="warning"
                  >Commitizen</NTag
                >
                <NTag
                  size="small"
                  type="warning"
                  >lint-staged</NTag
                >
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
            <div class="step-item">
              <div class="step-number">1</div>
              <div class="step-content">
                <h4>克隆项目</h4>
                <NCode
                  code="git clone https://github.com/ChenyCHENYU/robot-admin.git"
                  language="bash"
                  class="step-code"
                />
              </div>
            </div>
            <div class="step-item">
              <div class="step-number">2</div>
              <div class="step-content">
                <h4>安装依赖</h4>
                <NCode
                  code="bun install"
                  language="bash"
                  class="step-code"
                />
              </div>
            </div>
            <div class="step-item">
              <div class="step-number">3</div>
              <div class="step-content">
                <h4>启动项目</h4>
                <NCode
                  code="bun run dev"
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
                <p
                  >GitHub:
                  <a
                    href="https://github.com/ChenyCHENYU"
                    target="_blank"
                    >@ChenyCHENYU</a
                  ></p
                >
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

  // 核心功能模块数据
  const modules = [
    {
      name: '权限管理',
      icon: '🔐',
      desc: 'RBAC权限体系，支持角色、菜单、按钮级权限控制',
      tech: 'Vue Router • Pinia',
    },
    {
      name: '数据看板',
      icon: '📊',
      desc: '可视化图表，实时数据监控和业务分析',
      tech: 'ECharts • FullCalendar',
    },
    {
      name: '表单引擎',
      icon: '📝',
      desc: '动态表单生成，支持8种布局模式配置',
      tech: 'Dynamic Form • Validation',
    },
    {
      name: '工作流',
      icon: '🔄',
      desc: '可视化流程设计，支持审批、通知等业务流程',
      tech: 'Driver.js • Motion',
    },
    {
      name: '文件管理',
      icon: '📁',
      desc: '支持多种文件格式上传、预览和管理',
      tech: 'File-saver • JSZip',
    },
    {
      name: '富文本编辑',
      icon: '✏️',
      desc: '集成多种编辑器，支持Markdown和富文本',
      tech: 'WangEditor • V-md-editor',
    },
  ]

  const architecture = [
    {
      name: '前端框架层',
      icon: '🖥️',
      className: 'layer-frontend',
      tagType: 'info',
      techs: ['Vue 3.5.13', 'TypeScript 5.8', 'Naive UI 2.41', 'UnoCSS 66.0'],
    },
    {
      name: '构建工具层',
      icon: '⚡',
      className: 'layer-build',
      tagType: 'success',
      techs: ['Vite 6.2.1', 'Sass 1.87', 'Unplugin', 'Auto Import'],
    },
    {
      name: '状态管理层',
      icon: '🔗',
      className: 'layer-state',
      tagType: 'warning',
      techs: ['Pinia 3.0.1', 'Vue Router 4.5', 'VueUse 13.1', 'Persistedstate'],
    },
    {
      name: '工具集成层',
      icon: '🛠️',
      className: 'layer-tools',
      tagType: 'error',
      techs: ['Axios 1.9', 'ECharts 5.6', 'Highlight.js', 'Html2canvas'],
    },
    {
      name: '开发体验层',
      icon: '🎯',
      className: 'layer-dx',
      tagType: 'default',
      techs: ['ESLint', 'Prettier', 'Vitest', 'Husky'],
    },
  ]

  const demoPages = [
    { name: '图标组件', icon: '🎨' },
    { name: '地区联动', icon: '🏙️' },
    { name: '进度条', icon: '📊' },
    { name: '时间组件', icon: '⏰' },
    { name: '日期选择', icon: '📅' },
    { name: '城市选择', icon: '🌆' },
    { name: '表单布局', icon: '📝' },
    { name: '表单搜索', icon: '🔍' },
    { name: '表格组件', icon: '📋' },
    { name: '日历组件', icon: '📆' },
    { name: '代码编辑器', icon: '💻' },
    { name: 'Markdown', icon: '📖' },
    { name: '富文本编辑', icon: '✏️' },
    { name: '导出ZIP', icon: '📦' },
    { name: '复制文本', icon: '📋' },
    { name: '批量下载', icon: '⬇️' },
    { name: '拖拽排序', icon: '🔄' },
    { name: '复制指令', icon: '📄' },
    { name: '水印指令', icon: '💧' },
    { name: '拖拽指令', icon: '👆' },
    { name: '防抖指令', icon: '⏱️' },
    { name: '节流指令', icon: '🚦' },
    { name: '长按指令', icon: '👆' },
    { name: '权限指令', icon: '🔐' },
  ]

  const features = [
    {
      name: 'RBAC权限系统',
      icon: '🔒',
      desc: '完整的角色权限管理，支持菜单、按钮级别控制',
    },
    {
      name: '主题定制',
      icon: '🎨',
      desc: '支持深色/浅色主题，可自定义品牌色彩',
    },
    {
      name: '响应式设计',
      icon: '📱',
      desc: '完美适配桌面端、平板、手机等设备',
    },
    {
      name: '高性能',
      icon: '⚡',
      desc: '基于Vite构建，支持热更新和代码分割',
    },
    {
      name: '组件化',
      icon: '🧩',
      desc: '30+高质量组件，开箱即用',
    },
    {
      name: 'TypeScript',
      icon: '🔧',
      desc: '完整的类型定义，提升开发体验',
    },
  ]
</script>

<style lang="scss" scoped>
  // 基础主题变量
  .project-homepage {
    min-height: 100vh;
    background: var(--n-body-color);
    color: var(--n-text-color);
    font-family:
      -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    transition: all 0.3s ease;
  }

  // 顶部横幅 - 保持炫酷
  .hero-banner {
    background: linear-gradient(
      135deg,
      var(--n-primary-color) 0%,
      var(--n-primary-color-hover) 100%
    );
    padding: 4rem 2rem;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -20%;
      width: 100%;
      height: 200%;
      background: radial-gradient(
        circle,
        rgba(255, 255, 255, 0.1) 0%,
        transparent 70%
      );
      animation: float 20s linear infinite;
    }

    .hero-content {
      max-width: 1400px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 2fr 400px;
      gap: 4rem;
      align-items: start;
      position: relative;
      z-index: 2;

      @media (max-width: 1200px) {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
    }
  }

  .project-intro {
    .project-badge {
      margin-bottom: 2rem;
      background: rgba(255, 255, 255, 0.15) !important;
      border: 1px solid rgba(255, 255, 255, 0.2) !important;

      .badge-dot {
        width: 8px;
        height: 8px;
        background: #00ff88;
        border-radius: 50%;
        animation: pulse 2s infinite;
        box-shadow: 0 0 10px #00ff88;
      }
    }

    .project-title {
      margin-bottom: 2rem;

      .title-main {
        display: block;
        font-size: 3.5rem;
        font-weight: 800;
        line-height: 1.1;
        margin-bottom: 0.5rem;
        cursor: pointer;
        position: relative;
        // 将所有基础样式放在前面
        background: linear-gradient(
          45deg,
          #ff6b6b,
          #4ecdc4,
          #45b7d1,
          #96ceb4,
          #ffeaa7
        );
        background-clip: text;
        -webkit-text-fill-color: transparent;
        background-size: 300% 300%;
        animation: gentleColorFlow 6s ease-in-out infinite;

        // 媒体查询放在最后
        @media (max-width: 768px) {
          font-size: 2.5rem;
        }

        // 超酷标题动画
        .title-char {
          display: inline-block;
          transition: all 0.3s ease;
          transform-origin: center;

          &.animate {
            animation: charBounceRainbow 0.6s ease-in-out;
            background: linear-gradient(
              45deg,
              #ff6b6b,
              #4ecdc4,
              #45b7d1,
              #96ceb4,
              #ffeaa7,
              #fd79a8,
              #fdcb6e,
              #6c5ce7,
              #a29bfe,
              #fd79a8
            ) !important;
            background-size: 400% 400% !important;
            background-clip: text !important;
            -webkit-text-fill-color: transparent !important;
            animation:
              charBounceRainbow 0.6s ease-in-out,
              rainbowShift 1.5s ease-in-out infinite;
          }
        }
      }

      .title-desc {
        display: block;
        font-size: 1.25rem;
        opacity: 0.9;
        font-weight: 400;
      }
    }

    .project-description {
      font-size: 1.125rem;
      line-height: 1.7;
      opacity: 0.9;
      margin-bottom: 2.5rem;
      max-width: 800px;
    }

    .project-stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
      margin-bottom: 2.5rem;

      @media (max-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
      }

      .stat-item {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 1.5rem;
        text-align: center;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.15);
        transition: all 0.4s ease;
        cursor: pointer;

        &:hover {
          transform: translateY(-6px) scale(1.05);
          background: rgba(255, 255, 255, 0.15);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .stat-icon {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.3));
        }

        .stat-number {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.875rem;
          opacity: 0.8;
        }
      }
    }

    .project-actions {
      .btn-icon {
        font-size: 1.125rem;
      }
    }
  }

  // 作者卡片 - 修复亮色模式背景
  .author-card {
    border-radius: 24px !important;
    transition: all 0.4s ease;

    &:hover {
      transform: translateY(-6px) scale(1.02);
    }

    // 暗色模式
    .dark-theme & {
      background: rgba(255, 255, 255, 0.1) !important;
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
    }

    // 亮色模式
    .project-homepage:not(.dark-theme) & {
      background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%) !important;
      border: 1px solid rgba(59, 130, 246, 0.2) !important;
      box-shadow: 0 8px 32px rgba(59, 130, 246, 0.1);
    }

    .author-content {
      text-align: center;
      padding: 1rem;
    }

    .author-avatar {
      position: relative;
      margin-bottom: 1.5rem;

      .avatar-glow {
        position: absolute;
        inset: -10px;
        background: radial-gradient(
          circle,
          rgba(255, 255, 255, 0.3) 0%,
          transparent 70%
        );
        border-radius: 50%;
        animation: pulse-glow 3s ease-in-out infinite;

        .project-homepage:not(.dark-theme) & {
          background: radial-gradient(
            circle,
            rgba(59, 130, 246, 0.3) 0%,
            transparent 70%
          );
        }
      }

      .avatar-main {
        position: relative;
        margin: 0 auto 1rem;
        font-size: 2rem;
        transition: all 0.3s ease;
        animation: gentleFloat 4s ease-in-out infinite;
        cursor: pointer;

        &:hover {
          transform: scale(1.1) rotate(10deg);
          animation: none;
        }

        .dark-theme & {
          background: rgba(255, 255, 255, 0.2) !important;
        }

        .project-homepage:not(.dark-theme) & {
          background: rgba(59, 130, 246, 0.1) !important;
        }
      }

      .author-status {
        .dark-theme & {
          background: rgba(79, 172, 254, 0.2) !important;
          border: 1px solid rgba(79, 172, 254, 0.4) !important;
          color: #4facfe !important;
        }

        .project-homepage:not(.dark-theme) & {
          background: rgba(59, 130, 246, 0.15) !important;
          border: 1px solid rgba(59, 130, 246, 0.3) !important;
          color: #3b82f6 !important;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          background: #00ff88;
          border-radius: 50%;
          animation: pulse 2s infinite;
          box-shadow: 0 0 6px #00ff88;

          .project-homepage:not(.dark-theme) & {
            background: #3b82f6;
            box-shadow: 0 0 6px #3b82f6;
          }
        }
      }
    }

    .author-info {
      .author-name {
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 0.75rem;

        .dark-theme & {
          color: #f8fafc;
        }

        .project-homepage:not(.dark-theme) & {
          color: #1e40af;
        }
      }

      .author-bio {
        font-size: 0.875rem;
        opacity: 0.9;
        line-height: 1.6;
        margin-bottom: 1.5rem;

        .dark-theme & {
          color: #e2e8f0;
        }

        .project-homepage:not(.dark-theme) & {
          color: #374151;
        }
      }

      .author-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;

        .author-stat {
          text-align: center;

          .stat-number {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 0.25rem;

            .dark-theme & {
              color: #f8fafc;
            }

            .project-homepage:not(.dark-theme) & {
              color: #1e40af;
            }
          }

          .stat-label {
            font-size: 0.75rem;
            opacity: 0.8;

            .dark-theme & {
              color: #cbd5e1;
            }

            .project-homepage:not(.dark-theme) & {
              color: #6b7280;
            }
          }
        }
      }
    }
  }

  // 主要内容区域 - 简洁设计
  .main-container {
    padding: 4rem 2rem;
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 3rem;
    align-items: start;

    @media (max-width: 1200px) {
      grid-template-columns: 1fr;
      gap: 2rem;
      padding: 3rem 1rem;
    }
  }

  .content-left,
  .content-right {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  // 通用卡片样式 - 简洁
  .n-card {
    border-radius: 20px !important;
    transition: all 0.4s ease;

    &:hover {
      transform: translateY(-6px);
    }

    .dark-theme & {
      box-shadow:
        0 4px 6px -1px rgba(0, 0, 0, 0.3),
        0 2px 4px -2px rgba(0, 0, 0, 0.2) !important;

      &:hover {
        box-shadow:
          0 20px 25px -5px rgba(0, 0, 0, 0.4),
          0 8px 10px -6px rgba(0, 0, 0, 0.3) !important;
      }
    }

    .project-homepage:not(.dark-theme) & {
      box-shadow:
        0 4px 6px -1px rgb(0 0 0 / 0.08),
        0 2px 4px -2px rgb(0 0 0 / 0.06) !important;
      border: 1px solid #e5e7eb !important;

      &:hover {
        box-shadow:
          0 20px 25px -5px rgb(0 0 0 / 0.15),
          0 8px 10px -6px rgb(0 0 0 / 0.1) !important;
      }
    }
  }

  // 功能模块 - 简洁
  .feature-modules {
    .modules-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;

      @media (max-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
      }

      @media (max-width: 480px) {
        grid-template-columns: 1fr;
      }
    }

    .module-card {
      border-radius: 16px !important;
      transition: all 0.4s ease;

      &:hover {
        transform: translateY(-6px) scale(1.02);
      }

      .module-content {
        text-align: center;
        padding: 0.5rem;

        .module-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        h3 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--n-text-color);
          margin-bottom: 0.75rem;
        }

        p {
          font-size: 0.875rem;
          color: var(--n-text-color-depth-2);
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .module-tech {
          font-size: 0.75rem;
        }
      }
    }
  }

  // 技术架构 - 恢复左侧边框颜色
  .tech-architecture {
    .architecture-flow {
      display: flex;
      flex-direction: column;
      gap: 1rem;

      .arch-layer-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .arch-layer {
        width: 100%;
        border-radius: 16px;
        padding: 1.5rem;
        transition: all 0.3s ease;
        background: var(--n-card-color);
        border: 1px solid var(--n-border-color);

        &.layer-frontend {
          border-left: 4px solid #6366f1;
        }

        &.layer-build {
          border-left: 4px solid #10b981;
        }

        &.layer-state {
          border-left: 4px solid #f59e0b;
        }

        &.layer-tools {
          border-left: 4px solid #ef4444;
        }

        &.layer-dx {
          border-left: 4px solid #8b5cf6;
        }

        .layer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;

          .layer-title {
            font-weight: 600;
            color: var(--n-text-color);
            margin: 0;
            font-size: 1rem;
          }

          .layer-icon {
            font-size: 1.5rem;
            opacity: 0.7;
          }
        }

        .layer-techs {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          justify-content: center;
        }
      }

      .arch-arrow {
        color: var(--n-text-color-depth-3);
        font-size: 1.5rem;
        margin: 0.5rem 0;
      }
    }
  }

  // 项目结构 - 优化滚动条
  .project-structure {
    .file-tree-container {
      max-height: 600px;
      overflow-y: auto;
      padding-right: 12px;
      margin-right: -4px;

      &::-webkit-scrollbar {
        width: 8px;
      }

      &::-webkit-scrollbar-track {
        background: var(--n-scrollbar-track-color);
        border-radius: 4px;
        margin: 4px 0;
      }

      &::-webkit-scrollbar-thumb {
        background: var(--n-scrollbar-color);
        border-radius: 4px;
        border: 1px solid var(--n-scrollbar-track-color);

        &:hover {
          background: var(--n-scrollbar-color-hover);
        }
      }
    }

    .file-tree {
      font-family: 'JetBrains Mono', 'Monaco', 'Menlo', monospace;
      font-size: 0.875rem;

      .tree-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.25rem 0;
        color: var(--n-text-color);

        &.folder {
          font-weight: 500;
        }

        .tree-icon {
          font-size: 1rem;
          flex-shrink: 0;
        }

        .tree-name {
          flex: 1;
          min-width: 0;
        }

        .tree-desc {
          font-size: 0.75rem;
          color: var(--n-text-color-depth-3);
          font-style: italic;
          flex-shrink: 0;
          margin-left: 0.5rem;
        }
      }

      .tree-children {
        margin-left: 1.5rem;
        border-left: 1px solid var(--n-border-color);
        padding-left: 1rem;
      }
    }
  }

  // 演示页面展示 - 简洁
  .demo-showcase {
    .demo-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      .demo-title {
        font-size: 1.125rem;
        font-weight: 600;
      }
    }

    .demo-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;

      @media (max-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
      }

      .demo-item {
        background: var(--n-card-color);
        border-radius: 12px;
        padding: 1rem;
        text-align: center;
        border: 1px solid var(--n-border-color);
        transition: all 0.4s ease;
        cursor: pointer;

        &:hover {
          transform: translateY(-4px) scale(1.05);
          box-shadow: var(--n-box-shadow-2);
        }

        .demo-icon {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .demo-name {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--n-text-color);
        }
      }
    }
  }

  // 核心特性 - 简洁
  .core-features {
    .features-list {
      .feature-icon {
        font-size: 1.5rem;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--n-action-color);
        border-radius: 50%;
      }
    }
  }

  // 开发工具链
  .dev-tools {
    .tools-grid {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;

      .tool-category {
        h4 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--n-text-color);
          margin-bottom: 0.75rem;
        }

        .tool-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
      }
    }
  }

  // 许可证卡片
  .license-card {
    .license-content {
      .license-info {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;

        .license-badge {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: var(--n-action-color);
          border-radius: 12px;
          border: 1px solid var(--n-border-color);

          .license-icon {
            font-size: 2rem;
          }

          .license-text {
            h4 {
              font-size: 1rem;
              font-weight: 600;
              color: var(--n-text-color);
              margin-bottom: 0.25rem;
            }

            p {
              font-size: 0.875rem;
              color: var(--n-text-color-depth-2);
              margin: 0;
            }
          }
        }

        .author-info-card {
          padding: 1rem;
          background: var(--n-action-color);
          border-radius: 12px;
          border: 1px solid var(--n-border-color);

          h4 {
            font-size: 1rem;
            font-weight: 600;
            color: var(--n-text-color);
            margin-bottom: 0.75rem;
          }

          p {
            font-size: 0.875rem;
            color: var(--n-text-color-depth-2);
            margin-bottom: 0.5rem;

            &:last-child {
              margin-bottom: 0;
            }

            a {
              color: var(--n-primary-color);
              text-decoration: none;

              &:hover {
                text-decoration: underline;
              }
            }
          }
        }
      }
    }
  }

  // 快速开始 - 修复代码块样式
  .quick-start {
    .start-steps {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .step-item {
      display: flex;
      gap: 1rem;
      align-items: flex-start;

      .step-number {
        width: 32px;
        height: 32px;
        background: var(--n-primary-color);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 0.875rem;
        flex-shrink: 0;
      }

      .step-content {
        flex: 1;

        h4 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--n-text-color);
          margin-bottom: 0.75rem;
        }

        :deep(.step-code) {
          margin-top: 0.75rem;
          background: #1e1e1e !important;
          border-radius: 8px !important;
          font-family:
            'JetBrains Mono', 'Monaco', 'Menlo', monospace !important;
          font-size: 0.875rem !important;
          border: 1px solid #333 !important;
          overflow: hidden;

          .n-code {
            background: #1e1e1e !important;

            .hljs {
              background: #1e1e1e !important;
              color: #d4d4d4 !important;
              padding: 14px 18px !important;
              margin: 0 !important;
              line-height: 1.5;
            }

            .hljs-built_in {
              color: #569cd6 !important;
            }

            .hljs-string {
              color: #ce9178 !important;
            }

            .hljs-keyword {
              color: #c586c0 !important;
            }

            .hljs-comment {
              color: #6a9955 !important;
            }

            code {
              background: #1e1e1e !important;
              color: #d4d4d4 !important;
              font-family: inherit !important;
            }
          }

          // 直接针对 code 元素
          code {
            background: #1e1e1e !important;
            color: #d4d4d4 !important;
            font-family:
              'JetBrains Mono', 'Monaco', 'Menlo', monospace !important;
            padding: 14px 18px !important;
            display: block !important;
            line-height: 1.5 !important;
          }

          // 针对pre元素
          pre {
            background: #1e1e1e !important;
            color: #d4d4d4 !important;
            margin: 0 !important;
            padding: 14px 18px !important;

            code {
              background: transparent !important;
              padding: 0 !important;
            }
          }
        }
      }
    }
  }

  // 关键帧动画
  @keyframes gentleColorFlow {
    0% {
      background-position: 0% 50%;
    }
    25% {
      background-position: 100% 50%;
    }
    50% {
      background-position: 50% 100%;
    }
    75% {
      background-position: 0% 50%;
    }
    100% {
      background-position: 50% 0%;
    }
  }

  @keyframes gentleFloat {
    0%,
    100% {
      transform: translateY(0px) rotate(0deg);
    }
    25% {
      transform: translateY(-3px) rotate(1deg);
    }
    50% {
      transform: translateY(-6px) rotate(0deg);
    }
    75% {
      transform: translateY(-3px) rotate(-1deg);
    }
  }

  @keyframes charBounceRainbow {
    0%,
    20%,
    50%,
    80%,
    100% {
      transform: translateY(0) scale(1) rotateZ(0deg);
    }
    40% {
      transform: translateY(-20px) scale(1.3) rotateZ(10deg);
    }
    60% {
      transform: translateY(-10px) scale(1.15) rotateZ(-5deg);
    }
  }

  @keyframes rainbowShift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  @keyframes float {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.7;
      transform: scale(1.1);
    }
  }

  @keyframes pulse-glow {
    0%,
    100% {
      transform: scale(1);
      opacity: 0.4;
    }
    50% {
      transform: scale(1.15);
      opacity: 0.6;
    }
  }

  // 响应式设计
  @media (max-width: 768px) {
    .project-stats {
      grid-template-columns: repeat(2, 1fr) !important;
    }

    .modules-grid {
      grid-template-columns: 1fr !important;
    }

    .hero-banner {
      padding: 2rem 1rem;
    }

    .project-intro .title-main {
      font-size: 2.5rem !important;
    }
  }
</style>
