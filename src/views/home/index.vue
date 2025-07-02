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
        <!-- 核心功能模块 - 精简为数据驱动 -->
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

        <!-- 技术架构 - 精简为数据驱动 -->
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

        <!-- 演示页面展示 - 精简为数据驱动 -->
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
        <!-- 项目结构 - 完整的目录树 -->
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
                      <div class="tree-item folder">
                        <span class="tree-icon">📁</span>
                        <span class="tree-name">C_Icon/</span>
                        <span class="tree-desc">图标组件</span>
                      </div>
                      <div class="tree-item folder">
                        <span class="tree-icon">📁</span>
                        <span class="tree-name">C_Code/</span>
                        <span class="tree-desc">代码编辑器</span>
                      </div>
                      <div class="tree-item folder">
                        <span class="tree-icon">📁</span>
                        <span class="tree-name">C_Markdown/</span>
                        <span class="tree-desc">Markdown编辑器</span>
                      </div>
                      <div class="tree-item folder">
                        <span class="tree-icon">📁</span>
                        <span class="tree-name">C_Theme/</span>
                        <span class="tree-desc">主题组件</span>
                      </div>
                      <div class="tree-item folder">
                        <span class="tree-icon">📁</span>
                        <span class="tree-name">C_Time/</span>
                        <span class="tree-desc">时间组件</span>
                      </div>
                      <div class="tree-item folder">
                        <span class="tree-icon">📁</span>
                        <span class="tree-name">C_Progress/</span>
                        <span class="tree-desc">进度条组件</span>
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
                    <div class="tree-children">
                      <div class="tree-item folder">
                        <span class="tree-icon">📁</span>
                        <span class="tree-name">analysis/</span>
                        <span class="tree-desc">数据分析</span>
                      </div>
                      <div class="tree-item folder">
                        <span class="tree-icon">📁</span>
                        <span class="tree-name">statistics/</span>
                        <span class="tree-desc">统计报表</span>
                      </div>
                    </div>
                    <div class="tree-item folder">
                      <span class="tree-icon">📁</span>
                      <span class="tree-name">demo/</span>
                      <span class="tree-desc">演示页面(27个)</span>
                    </div>
                    <div class="tree-children">
                      <div class="tree-item folder">
                        <span class="tree-icon">📁</span>
                        <span class="tree-name">01-icon/</span>
                        <span class="tree-desc">图标组件</span>
                      </div>
                      <div class="tree-item folder">
                        <span class="tree-icon">📁</span>
                        <span class="tree-name">02-area-cascade/</span>
                        <span class="tree-desc">地区联动</span>
                      </div>
                      <div class="tree-item folder">
                        <span class="tree-icon">📁</span>
                        <span class="tree-name">07-form/</span>
                        <span class="tree-desc">表单布局</span>
                      </div>
                      <div class="tree-item folder">
                        <span class="tree-icon">📁</span>
                        <span class="tree-name">10-table/</span>
                        <span class="tree-desc">表格组件</span>
                      </div>
                      <div class="tree-item folder">
                        <span class="tree-icon">📁</span>
                        <span class="tree-name">14-code-editor/</span>
                        <span class="tree-desc">代码编辑器</span>
                      </div>
                      <div class="tree-item folder">
                        <span class="tree-icon">📁</span>
                        <span class="tree-name">15-markdown-editor/</span>
                        <span class="tree-desc">Markdown编辑器</span>
                      </div>
                      <div class="tree-item folder">
                        <span class="tree-icon">📁</span>
                        <span class="tree-name">27-permission-direct/</span>
                        <span class="tree-desc">权限指令</span>
                      </div>
                    </div>
                    <div class="tree-item folder">
                      <span class="tree-icon">📁</span>
                      <span class="tree-name">sys-manage/</span>
                      <span class="tree-desc">系统管理</span>
                    </div>
                    <div class="tree-children">
                      <div class="tree-item folder">
                        <span class="tree-icon">📁</span>
                        <span class="tree-name">user-manage/</span>
                        <span class="tree-desc">用户管理</span>
                      </div>
                      <div class="tree-item folder">
                        <span class="tree-icon">📁</span>
                        <span class="tree-name">role-manage/</span>
                        <span class="tree-desc">角色管理</span>
                      </div>
                      <div class="tree-item folder">
                        <span class="tree-icon">📁</span>
                        <span class="tree-name">permission-manage/</span>
                        <span class="tree-desc">权限管理</span>
                      </div>
                      <div class="tree-item folder">
                        <span class="tree-icon">📁</span>
                        <span class="tree-name">menu-manage/</span>
                        <span class="tree-desc">菜单管理</span>
                      </div>
                    </div>
                    <div class="tree-item folder">
                      <span class="tree-icon">📁</span>
                      <span class="tree-name">login/</span>
                      <span class="tree-desc">登录页面</span>
                    </div>
                    <div class="tree-item folder">
                      <span class="tree-icon">📁</span>
                      <span class="tree-name">home/</span>
                      <span class="tree-desc">项目主页</span>
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
                    <div class="tree-item folder">
                      <span class="tree-icon">📁</span>
                      <span class="tree-name">theme/</span>
                      <span class="tree-desc">主题状态</span>
                    </div>
                  </div>
                  <div class="tree-item folder">
                    <span class="tree-icon">📁</span>
                    <span class="tree-name">composables/</span>
                    <span class="tree-desc">组合式API</span>
                  </div>
                  <div class="tree-children">
                    <div class="tree-item folder">
                      <span class="tree-icon">📁</span>
                      <span class="tree-name">Form/</span>
                      <span class="tree-desc">表单组合</span>
                    </div>
                    <div class="tree-item folder">
                      <span class="tree-icon">📁</span>
                      <span class="tree-name">Table/</span>
                      <span class="tree-desc">表格组合</span>
                    </div>
                  </div>
                  <div class="tree-item folder">
                    <span class="tree-icon">📁</span>
                    <span class="tree-name">hooks/</span>
                    <span class="tree-desc">自定义Hook</span>
                  </div>
                  <div class="tree-children">
                    <div class="tree-item folder">
                      <span class="tree-icon">📁</span>
                      <span class="tree-name">useCopy/</span>
                      <span class="tree-desc">复制功能</span>
                    </div>
                    <div class="tree-item folder">
                      <span class="tree-icon">📁</span>
                      <span class="tree-name">useDownload/</span>
                      <span class="tree-desc">下载功能</span>
                    </div>
                    <div class="tree-item folder">
                      <span class="tree-icon">📁</span>
                      <span class="tree-name">useJsZip/</span>
                      <span class="tree-desc">压缩功能</span>
                    </div>
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
                  <div class="tree-children">
                    <div class="tree-item folder">
                      <span class="tree-icon">📁</span>
                      <span class="tree-name">modules/</span>
                      <span class="tree-desc">模块类型</span>
                    </div>
                  </div>
                  <div class="tree-item folder">
                    <span class="tree-icon">📁</span>
                    <span class="tree-name">directives/</span>
                    <span class="tree-desc">自定义指令</span>
                  </div>
                  <div class="tree-children">
                    <div class="tree-item folder">
                      <span class="tree-icon">📁</span>
                      <span class="tree-name">modules/</span>
                      <span class="tree-desc">指令模块</span>
                    </div>
                  </div>
                  <div class="tree-item folder">
                    <span class="tree-icon">📁</span>
                    <span class="tree-name">assets/</span>
                    <span class="tree-desc">静态资源</span>
                  </div>
                  <div class="tree-children">
                    <div class="tree-item folder">
                      <span class="tree-icon">📁</span>
                      <span class="tree-name">css/</span>
                      <span class="tree-desc">样式文件</span>
                    </div>
                    <div class="tree-item folder">
                      <span class="tree-icon">📁</span>
                      <span class="tree-name">images/</span>
                      <span class="tree-desc">图片资源</span>
                    </div>
                    <div class="tree-item folder">
                      <span class="tree-icon">📁</span>
                      <span class="tree-name">data/</span>
                      <span class="tree-desc">数据文件</span>
                    </div>
                  </div>
                  <div class="tree-item folder">
                    <span class="tree-icon">📁</span>
                    <span class="tree-name">plugins/</span>
                    <span class="tree-desc">插件配置</span>
                  </div>
                  <div class="tree-item file">
                    <span class="tree-icon">📄</span>
                    <span class="tree-name">main.ts</span>
                    <span class="tree-desc">应用入口</span>
                  </div>
                  <div class="tree-item file">
                    <span class="tree-icon">📄</span>
                    <span class="tree-name">App.vue</span>
                    <span class="tree-desc">根组件</span>
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
                <div class="tree-item file">
                  <span class="tree-icon">📄</span>
                  <span class="tree-name">eslint.config.ts</span>
                  <span class="tree-desc">ESLint配置</span>
                </div>
                <div class="tree-item file">
                  <span class="tree-icon">📄</span>
                  <span class="tree-name">README.md</span>
                  <span class="tree-desc">项目说明</span>
                </div>
              </div>
            </div>
          </div>
        </NCard>

        <!-- 核心特性 - 精简为数据驱动 -->
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

        <!-- 开发工具链 - 精简为数据驱动 -->
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

        <!-- 快速开始 - 精简为数据驱动 -->
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

  // ============ 数据定义区域 ============

  // 项目统计数据
  const projectStats = [
    { icon: 'fluent-color:approvals-app-16', number: '当前', label: 'Monomer' },
    {
      icon: 'fluent-color:animal-paw-print-20',
      number: '接下来',
      label: 'Monorepo',
    },
    { icon: 'fluent-color:flag-24', number: '计划', label: 'MicroApp' },
    { icon: 'fluent-color:beach-28', number: '最后', label: 'NestJS' },
  ]

  // 操作按钮
  const actionButtons = [
    { text: 'GitHub 仓库', icon: '🐙', type: 'primary', strong: true },
    { text: '在线演示', icon: '▶️', secondary: true },
    { text: '查看文档', icon: '📄', tertiary: true },
  ]

  // 作者统计
  const authorStats = [
    { number: '9+', label: '⭐Star' },
    { number: '11+', label: '🍴Forks' },
    { number: '1K+', label: '👁️Views' },
  ]

  // 核心功能模块
  const coreModules = [
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

  // 技术架构层级
  const techLayers = [
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

  // 演示页面列表
  const demoList = [
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

  // 核心特性
  const coreFeatures = [
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
    { name: '高性能', icon: '⚡', desc: '基于Vite构建，支持热更新和代码分割' },
    { name: '组件化', icon: '🧩', desc: '30+高质量组件，开箱即用' },
    { name: 'TypeScript', icon: '🔧', desc: '完整的类型定义，提升开发体验' },
  ]

  // 开发工具分类
  const toolCategories = [
    {
      name: '代码质量',
      type: 'info',
      tools: ['ESLint', 'Prettier', 'Oxlint', 'TypeScript'],
    },
    {
      name: '测试工具',
      type: 'success',
      tools: ['Vitest', '@vue/test-utils', 'jsdom'],
    },
    {
      name: '提交规范',
      type: 'warning',
      tools: ['Husky', 'Commitizen', 'lint-staged'],
    },
  ]

  // 快速开始步骤
  const quickSteps = [
    {
      title: '克隆项目',
      code: 'git clone https://github.com/ChenyCHENYU/robot-admin.git',
    },
    { title: '安装依赖', code: 'bun install' },
    { title: '启动项目', code: 'bun run dev' },
  ]
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
