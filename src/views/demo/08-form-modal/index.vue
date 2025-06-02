<template>
  <div class="demo-container">
    <!-- 头部 -->
    <NCard
      class="header-card"
      :bordered="false"
    >
      <div class="header-content">
        <h1 class="main-title">
          <i class="i-carbon-rocket mr-3 text-4xl"></i>
          表单容器演示中心
        </h1>
        <p class="subtitle"
          >探索4种主要的表单容器场景，了解最佳实践和设计理念</p
        >
        <div class="stats-bar">
          <NBadge
            :value="4"
            type="info"
          >
            <span class="stat-item">
              <i class="i-carbon-container mr-1"></i>
              容器类型
            </span>
          </NBadge>
          <NBadge
            :value="totalFieldsCount"
            type="success"
          >
            <span class="stat-item">
              <i class="i-carbon-form mr-1"></i>
              表单字段
            </span>
          </NBadge>
          <NBadge
            :value="8"
            type="warning"
          >
            <span class="stat-item">
              <i class="i-carbon-layout mr-1"></i>
              布局模式
            </span>
          </NBadge>
        </div>
      </div>
    </NCard>

    <!-- 容器卡片网格 -->
    <NGrid
      :cols="4"
      :x-gap="24"
      :y-gap="24"
      responsive="screen"
      class="cards-section"
    >
      <NGi
        v-for="card in containerCards"
        :key="card.key"
        :span="1"
      >
        <NCard
          hoverable
          class="container-card"
          :class="`${card.key}-card`"
          @click="handleCardAction(card.key)"
        >
          <template #header>
            <div class="card-header">
              <i
                :class="card.icon"
                class="card-icon"
              ></i>
              <div class="card-title-group">
                <h3 class="card-title">{{ card.title }}</h3>
                <NTag
                  :type="card.tagType"
                  size="small"
                  >{{ card.layout }}</NTag
                >
              </div>
            </div>
          </template>

          <div class="card-content">
            <p class="card-description">{{ card.description }}</p>

            <div class="features-section">
              <h4 class="features-title">
                <i class="i-carbon-checkmark-outline mr-1"></i>
                特性标签
              </h4>
              <NSpace wrap>
                <NTag
                  v-for="feature in card.features"
                  :key="feature"
                  type="info"
                  size="small"
                  round
                >
                  {{ feature }}
                </NTag>
              </NSpace>
            </div>

            <div class="stats-section">
              <div class="stat-row">
                <span class="stat-label">字段数量</span>
                <NBadge
                  :value="card.fields"
                  type="success"
                />
              </div>
              <div class="stat-row">
                <span class="stat-label">复杂度</span>
                <NRate
                  :value="card.complexity"
                  readonly
                  size="small"
                />
              </div>
            </div>
          </div>

          <template #action>
            <NButton
              type="primary"
              block
              strong
            >
              <template #icon>
                <i :class="card.actionIcon"></i>
              </template>
              {{ card.actionText }}
            </NButton>
          </template>
        </NCard>
      </NGi>
    </NGrid>

    <!-- 设计原则指南 -->
    <NCard
      class="guide-section"
      title="设计原则与最佳实践"
      :bordered="false"
    >
      <template #header-extra>
        <i class="i-carbon-tool-kit text-xl"></i>
      </template>

      <NGrid
        :cols="3"
        :x-gap="24"
        responsive="screen"
      >
        <NGi
          v-for="principle in principles"
          :key="principle.key"
        >
          <NCard
            embedded
            class="principle-card"
          >
            <template #header>
              <div class="principle-header">
                <i
                  :class="principle.icon"
                  class="principle-icon"
                ></i>
                <h4 class="principle-title">{{ principle.title }}</h4>
              </div>
            </template>

            <NList>
              <NListItem
                v-for="item in principle.items"
                :key="item.label"
              >
                <template #prefix>
                  <i class="i-carbon-arrow-right text-primary"></i>
                </template>
                <strong>{{ item.label }}</strong> → {{ item.desc }}
              </NListItem>
            </NList>
          </NCard>
        </NGi>
      </NGrid>
    </NCard>

    <!-- 性能统计面板 -->
    <NCard
      class="performance-section"
      title="实时性能统计"
      :bordered="false"
    >
      <template #header-extra>
        <NSpace>
          <NTag
            type="success"
            round
          >
            <template #icon>
              <i class="i-carbon-activity"></i>
            </template>
            实时监控
          </NTag>
          <NButton
            size="small"
            quaternary
            @click="refreshStats"
          >
            <template #icon>
              <i class="i-carbon-refresh"></i>
            </template>
            刷新
          </NButton>
        </NSpace>
      </template>

      <NGrid
        :cols="4"
        :x-gap="16"
      >
        <NGi
          v-for="stat in performanceStats"
          :key="stat.key"
        >
          <NStatistic
            :label="stat.label"
            :value="stat.value"
          >
            <template #prefix>
              <i
                :class="stat.icon"
                :style="{ color: stat.color }"
              ></i>
            </template>
            <template #suffix>
              <span class="text-xs opacity-60">{{ stat.unit }}</span>
            </template>
          </NStatistic>
        </NGi>
      </NGrid>
    </NCard>

    <!-- 模态框 -->
    <NModal
      v-model:show="modalVisible"
      preset="card"
      :style="{ width: '600px' }"
      title="用户信息管理"
      size="huge"
      :bordered="false"
      :segmented="true"
    >
      <template #header-extra>
        <i class="i-carbon-user-avatar text-xl"></i>
      </template>

      <C_Form
        ref="modalFormRef"
        :options="formOptions.modal"
        :layout-type="layoutTypes.modal"
        v-model="formData.modal"
        @submit="handleSubmit('modal')"
      />
    </NModal>

    <!-- 抽屉 -->
    <NDrawer
      v-model:show="drawerVisible"
      :width="480"
      placement="right"
    >
      <NDrawerContent
        title="商品详情配置"
        :native-scrollbar="false"
      >
        <template #header-extra>
          <i class="i-carbon-product text-xl"></i>
        </template>

        <C_Form
          ref="drawerFormRef"
          :options="formOptions.drawer"
          :layout-type="layoutTypes.drawer"
          v-model="formData.drawer"
          @submit="handleSubmit('drawer')"
        />
      </NDrawerContent>
    </NDrawer>

    <!-- 侧边栏 -->
    <div
      class="sidebar"
      :class="{ collapsed: sidebarCollapsed }"
    >
      <NCard
        v-if="!sidebarCollapsed"
        class="sidebar-card"
        :bordered="false"
      >
        <template #header>
          <div class="sidebar-header">
            <div class="sidebar-title">
              <i class="i-carbon-filter mr-2"></i>
              筛选条件
            </div>
            <NButton
              quaternary
              circle
              size="small"
              @click="toggleSidebar"
            >
              <template #icon>
                <i class="i-carbon-close"></i>
              </template>
            </NButton>
          </div>
        </template>

        <C_Form
          ref="sidebarFormRef"
          :options="formOptions.sidebar"
          :layout-type="layoutTypes.sidebar"
          v-model="formData.sidebar"
          @submit="handleSubmit('sidebar')"
        >
          <template #action="{ validate }">
            <NSpace justify="space-between">
              <NButton @click="clearFormData('sidebar')">
                <template #icon>
                  <i class="i-carbon-clean"></i>
                </template>
                清空
              </NButton>
              <NButton
                type="primary"
                @click="handleValidateAndSubmit('sidebar', validate)"
              >
                <template #icon>
                  <i class="i-carbon-search"></i>
                </template>
                应用筛选
              </NButton>
            </NSpace>
          </template>
        </C_Form>
      </NCard>
    </div>

    <!-- 浮动按钮 -->
    <div class="float-container">
      <NPopover
        v-model:show="popoverVisible"
        trigger="click"
        placement="top-start"
        :style="{ width: '400px' }"
      >
        <template #trigger>
          <NButton
            type="primary"
            circle
            size="large"
            class="float-btn"
          >
            <template #icon>
              <i class="i-carbon-settings text-xl"></i>
            </template>
          </NButton>
        </template>

        <div class="popover-content">
          <div class="popover-header">
            <h4 class="popover-title">
              <i class="i-carbon-edit mr-2"></i>
              快速编辑
            </h4>
          </div>

          <C_Form
            ref="popoverFormRef"
            :options="formOptions.popover"
            :layout-type="layoutTypes.popover"
            v-model="formData.popover"
            @submit="handleSubmit('popover')"
          >
            <template #action="{ validate }">
              <div class="popover-actions">
                <NSpace justify="end">
                  <NButton
                    size="small"
                    @click="popoverVisible = false"
                    >取消</NButton
                  >
                  <NButton
                    size="small"
                    type="primary"
                    @click="handleValidateAndSubmit('popover', validate)"
                  >
                    保存
                  </NButton>
                </NSpace>
              </div>
            </template>
          </C_Form>
        </div>
      </NPopover>
    </div>

    <!-- 页脚 -->
    <NCard
      class="footer-card"
      :bordered="false"
    >
      <div class="footer-content">
        <div class="footer-info">
          <i class="i-carbon-code mr-2"></i>
          基于 C_Form 组件构建 • 支持多种布局类型 • 完整的 TypeScript 类型系统
        </div>
        <div class="footer-links">
          <NSpace>
            <NButton
              text
              type="primary"
            >
              <template #icon>
                <i class="i-carbon-document"></i>
              </template>
              查看文档
            </NButton>
            <NButton
              text
              type="primary"
            >
              <template #icon>
                <i class="i-carbon-logo-github"></i>
              </template>
              GitHub
            </NButton>
          </NSpace>
        </div>
      </div>
    </NCard>
  </div>
</template>

<script setup lang="ts">
  import type {
    FormOption,
    LayoutType,
    FormInstance,
  } from '@/types/modules/form'

  // 类型定义
  type ContainerType = 'modal' | 'drawer' | 'sidebar' | 'popover'

  interface ContainerCard {
    key: ContainerType
    title: string
    description: string
    icon: string
    tagType: 'default' | 'error' | 'info' | 'success' | 'warning'
    features: string[]
    actionText: string
    actionIcon: string
    fields: number
    layout: string
    complexity: number
  }

  interface PrincipleItem {
    label: string
    desc: string
  }

  interface Principle {
    key: string
    title: string
    icon: string
    items: PrincipleItem[]
  }

  interface PerformanceStat {
    key: string
    label: string
    value: number
    unit: string
    icon: string
    color: string
  }

  // 布局类型映射
  const layoutTypes: Record<ContainerType, LayoutType> = {
    modal: 'grid',
    drawer: 'default',
    sidebar: 'default',
    popover: 'inline',
  }

  // 消息实例
  const message = useMessage()

  // 响应式状态
  const modalVisible = ref(false)
  const drawerVisible = ref(false)
  const sidebarCollapsed = ref(true)
  const popoverVisible = ref(false)

  // 表单引用
  const modalFormRef = ref<FormInstance>()
  const drawerFormRef = ref<FormInstance>()
  const sidebarFormRef = ref<FormInstance>()
  const popoverFormRef = ref<FormInstance>()

  // 表单数据
  const formData = reactive({
    modal: {} as Record<string, any>,
    drawer: {} as Record<string, any>,
    sidebar: {} as Record<string, any>,
    popover: {} as Record<string, any>,
  })

  // 表单配置
  const formOptions: Record<ContainerType, FormOption[]> = {
    modal: [
      {
        type: 'input',
        prop: 'username',
        label: '用户名',
        placeholder: '请输入用户名',
        // rules: [{ required: true, message: '请输入用户名' }],
      },
      {
        type: 'input',
        prop: 'email',
        label: '邮箱',
        placeholder: '请输入邮箱地址',
        // rules: [
        //   { required: true, message: '请输入邮箱' },
        //   { type: 'email', message: '请输入正确的邮箱格式' },
        // ],
      },
      {
        type: 'select',
        prop: 'role',
        label: '角色',
        placeholder: '请选择角色',
        children: [
          { value: 'admin', label: '管理员' },
          { value: 'user', label: '普通用户' },
          { value: 'guest', label: '访客' },
        ],
        // rules: [{ required: true, message: '请选择角色' }],
      },
      {
        type: 'input',
        prop: 'phone',
        label: '手机号',
        placeholder: '请输入手机号',
        // rules: [
        //   { required: true, message: '请输入手机号' },
        //   { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
        // ],
      },
    ],
    drawer: [
      {
        type: 'input',
        prop: 'productName',
        label: '商品名称',
        placeholder: '请输入商品名称',
        // rules: [{ required: true, message: '请输入商品名称' }],
      },
      {
        type: 'textarea',
        prop: 'description',
        label: '商品描述',
        placeholder: '请输入商品描述',
        attrs: { rows: 4 },
      },
      {
        type: 'inputNumber',
        prop: 'price',
        label: '价格',
        placeholder: '请输入价格',
        attrs: { min: 0, precision: 2 },
        // rules: [{ required: true, message: '请输入价格' }],
      },
      {
        type: 'select',
        prop: 'category',
        label: '分类',
        placeholder: '请选择分类',
        children: [
          { value: 'electronics', label: '电子产品' },
          { value: 'clothing', label: '服装' },
          { value: 'books', label: '图书' },
        ],
        // rules: [{ required: true, message: '请选择分类' }],
      },
      {
        type: 'switch',
        prop: 'isPublished',
        label: '是否发布',
        value: false,
      },
      {
        type: 'switch',
        prop: 'allowReturns',
        label: '允许退货',
        value: true,
      },
    ],
    sidebar: [
      {
        type: 'input',
        prop: 'keyword',
        label: '关键词',
        placeholder: '搜索关键词',
      },
      {
        type: 'select',
        prop: 'status',
        label: '状态',
        placeholder: '选择状态',
        children: [
          { value: 'active', label: '活跃' },
          { value: 'inactive', label: '非活跃' },
          { value: 'pending', label: '待处理' },
        ],
      },
      {
        type: 'select',
        prop: 'type',
        label: '类型',
        placeholder: '选择类型',
        children: [
          { value: 'type1', label: '类型一' },
          { value: 'type2', label: '类型二' },
        ],
      },
    ],
    popover: [
      {
        type: 'input',
        prop: 'title',
        label: '标题',
        placeholder: '请输入标题',
        // rules: [{ required: true, message: '请输入标题' }],
      },
      {
        type: 'select',
        prop: 'priority',
        label: '优先级',
        placeholder: '选择优先级',
        children: [
          { value: 'high', label: '高' },
          { value: 'medium', label: '中' },
          { value: 'low', label: '低' },
        ],
        // rules: [{ required: true, message: '请选择优先级' }],
      },
    ],
  }

  // 容器卡片配置
  const containerCards = computed<ContainerCard[]>(() => [
    {
      key: 'modal',
      title: '模态框表单',
      description:
        '适用于新增/编辑单个实体，快速配置操作，空间有限时的最佳选择',
      icon: 'i-carbon-popup text-3xl',
      tagType: 'info',
      features: ['空间有限', '聚焦操作', '网格布局', '快进快出'],
      actionText: '打开模态框',
      actionIcon: 'i-carbon-launch',
      fields: formOptions.modal.length,
      layout: 'Grid',
      complexity: 3,
    },
    {
      key: 'drawer',
      title: '抽屉表单',
      description: '适用于详情查看+编辑，多步骤数据录入，信息展示更加丰富',
      icon: 'i-carbon-side-panel-open text-3xl',
      tagType: 'success',
      features: ['空间充足', '详情编辑', '默认布局', '信息丰富'],
      actionText: '打开抽屉',
      actionIcon: 'i-carbon-arrow-right',
      fields: formOptions.drawer.length,
      layout: 'Default',
      complexity: 4,
    },
    {
      key: 'sidebar',
      title: '侧边栏表单',
      description: '适用于实时筛选器，快速操作面板，不干扰主要工作流程',
      icon: 'i-carbon-side-panel-close text-3xl',
      tagType: 'warning',
      features: ['紧凑布局', '实时筛选', '辅助操作', '不干扰主流程'],
      actionText: sidebarCollapsed.value ? '展开侧边栏' : '收起侧边栏',
      actionIcon: 'i-carbon-panel-expansion',
      fields: formOptions.sidebar.length,
      layout: 'Compact',
      complexity: 2,
    },
    {
      key: 'popover',
      title: '浮动表单',
      description: '适用于快速编辑单个字段，简单配置项调整，轻量级交互',
      icon: 'i-carbon-floating-ip text-3xl',
      tagType: 'error',
      features: ['轻量级', '内联布局', '快速编辑', '即时反馈'],
      actionText: '切换浮动表单',
      actionIcon: 'i-carbon-cursor-1',
      fields: formOptions.popover.length,
      layout: 'Inline',
      complexity: 1,
    },
  ])

  // 设计原则
  const principles: Principle[] = [
    {
      key: 'space',
      title: '空间维度考量',
      icon: 'i-carbon-grid text-xl',
      items: [
        { label: '窄空间', desc: '垂直布局优先' },
        { label: '宽空间', desc: '网格布局发挥优势' },
        { label: '高空间', desc: '步骤布局适合复杂流程' },
      ],
    },
    {
      key: 'interaction',
      title: '交互复杂度考量',
      icon: 'i-carbon-interactive-segmentation-cursor text-xl',
      items: [
        { label: '简单操作', desc: 'inline 或简洁 default' },
        { label: '标准CRUD', desc: 'grid 或 default' },
        { label: '复杂配置', desc: 'tabs 或 card' },
        { label: '向导流程', desc: 'steps' },
      ],
    },
    {
      key: 'mental',
      title: '用户心智模型',
      icon: 'i-carbon-cognitive text-xl',
      items: [
        { label: '打断式操作', desc: '快进快出' },
        { label: '沉浸式操作', desc: '丰富交互' },
        { label: '辅助性操作', desc: '不干扰主流程' },
        { label: '即时操作', desc: '轻量快捷' },
      ],
    },
  ]

  // 性能统计
  const performanceStats = ref<PerformanceStat[]>([
    {
      key: 'render',
      label: '渲染时间',
      value: 38,
      unit: 'ms',
      icon: 'i-carbon-timer',
      color: '#18a058',
    },
    {
      key: 'memory',
      label: '内存使用',
      value: 2.1,
      unit: 'MB',
      icon: 'i-carbon-data-vis-4',
      color: '#2080f0',
    },
    {
      key: 'components',
      label: '组件数量',
      value: 147,
      unit: '个',
      icon: 'i-carbon-container-services',
      color: '#f0a020',
    },
    {
      key: 'interactions',
      label: '交互次数',
      value: 1203,
      unit: '次',
      icon: 'i-carbon-touch-interaction',
      color: '#d03050',
    },
  ])

  // 计算属性
  const totalFieldsCount = computed(() => {
    return Object.values(formOptions).reduce(
      (total, options) => total + options.length,
      0
    )
  })

  // 获取表单引用
  const getFormRef = (type: ContainerType) => {
    const refs = {
      modal: modalFormRef,
      drawer: drawerFormRef,
      sidebar: sidebarFormRef,
      popover: popoverFormRef,
    }
    return refs[type]
  }

  // 处理卡片操作
  const handleCardAction = (key: ContainerType) => {
    switch (key) {
      case 'modal':
        modalVisible.value = true
        break
      case 'drawer':
        drawerVisible.value = true
        break
      case 'sidebar':
        toggleSidebar()
        break
      case 'popover':
        popoverVisible.value = !popoverVisible.value
        break
    }
  }

  // 切换侧边栏
  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  // 处理表单提交
  const handleSubmit = async (type: ContainerType) => {
    try {
      const formRef = getFormRef(type).value
      if (formRef) {
        await formRef.validate()
        const data = formData[type]
        console.log(`${type} form submitted:`, data)
        message.success('表单提交成功！')

        // 关闭对应容器
        if (type === 'modal') modalVisible.value = false
        if (type === 'drawer') drawerVisible.value = false
        if (type === 'popover') popoverVisible.value = false
      }
    } catch {
      message.error('表单验证失败，请检查输入')
    }
  }

  // 验证并提交
  const handleValidateAndSubmit = async (
    type: ContainerType,
    validate: () => Promise<void>
  ) => {
    try {
      await validate()
      await handleSubmit(type)
    } catch {
      message.error('表单验证失败')
    }
  }

  // 清空表单数据
  const clearFormData = (type: ContainerType) => {
    formData[type] = {}
    message.info('已清空表单数据')
  }

  // 刷新统计数据
  const refreshStats = () => {
    performanceStats.value.forEach(stat => {
      if (stat.key === 'render') {
        stat.value = Math.floor(Math.random() * 20) + 30
      } else if (stat.key === 'memory') {
        stat.value = Number((Math.random() * 1.5 + 1.5).toFixed(1))
      } else if (stat.key === 'interactions') {
        stat.value += Math.floor(Math.random() * 10) + 1
      }
    })
    message.success('统计数据已刷新')
  }

  // 生命周期
  let timer: any = null

  onMounted(() => {
    timer = setInterval(() => {
      performanceStats.value[0].value = Math.floor(Math.random() * 20) + 35
      performanceStats.value[1].value = Number(
        (Math.random() * 1.5 + 1.8).toFixed(1)
      )
    }, 3000)
  })

  onUnmounted(() => {
    if (timer) {
      clearInterval(timer)
    }
  })
</script>

<style lang="scss" scoped>
  .demo-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;

    .header-card {
      margin-bottom: 32px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 16px;

      .header-content {
        text-align: center;

        .main-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0 0 16px 0;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-text-fill-color: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .subtitle {
          font-size: 1.1rem;
          color: #666;
          margin: 0 0 24px 0;
          line-height: 1.6;
        }

        .stats-bar {
          display: flex;
          justify-content: center;
          gap: 32px;

          .stat-item {
            display: flex;
            align-items: center;
            font-weight: 500;
            color: #333;
          }
        }
      }
    }

    .cards-section {
      margin-bottom: 32px;

      .container-card {
        height: 100%;
        transition: all 0.3s ease;
        cursor: pointer;

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 12px;

          .card-icon {
            font-size: 1.5rem;
          }

          .card-title-group {
            flex: 1;
            display: flex;
            justify-content: space-between;
            align-items: center;

            .card-title {
              margin: 0;
              font-size: 1.1rem;
              font-weight: 600;
            }
          }
        }

        .card-content {
          .card-description {
            color: #666;
            line-height: 1.6;
            margin-bottom: 20px;
          }

          .features-section {
            margin-bottom: 20px;

            .features-title {
              font-size: 0.9rem;
              font-weight: 600;
              color: #333;
              margin: 0 0 12px 0;
              display: flex;
              align-items: center;
            }
          }

          .stats-section {
            padding: 16px;
            background: #f8f9fa;
            border-radius: 8px;

            .stat-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 8px;

              &:last-child {
                margin-bottom: 0;
              }

              .stat-label {
                font-size: 0.9rem;
                color: #666;
              }
            }
          }
        }

        &.modal-card .card-icon {
          color: #2080f0;
        }
        &.drawer-card .card-icon {
          color: #18a058;
        }
        &.sidebar-card .card-icon {
          color: #f0a020;
        }
        &.popover-card .card-icon {
          color: #d03050;
        }
      }
    }

    .guide-section {
      margin-bottom: 32px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);

      .principle-card {
        height: 100%;

        .principle-header {
          display: flex;
          align-items: center;
          gap: 8px;

          .principle-icon {
            color: #2080f0;
          }

          .principle-title {
            margin: 0;
            font-size: 1rem;
            font-weight: 600;
          }
        }
      }
    }

    .performance-section {
      margin-bottom: 32px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
    }

    .sidebar {
      position: fixed;
      right: 0;
      top: 80px;
      height: calc(100vh - 80px);
      width: 320px;
      transition: all 0.3s ease;
      z-index: 1000;

      &.collapsed {
        width: 0;
        overflow: hidden;
      }

      .sidebar-card {
        height: 100%;
        border-radius: 0;
        box-shadow: -4px 0 16px rgba(0, 0, 0, 0.1);

        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .sidebar-title {
            font-weight: 600;
            display: flex;
            align-items: center;
          }
        }
      }
    }

    .float-container {
      position: fixed;
      bottom: 30px;
      left: 30px;
      z-index: 1050;

      .float-btn {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        box-shadow: 0 6px 20px rgba(32, 128, 240, 0.4);
        transition: all 0.3s ease;

        &:hover {
          transform: scale(1.1);
          box-shadow: 0 8px 25px rgba(32, 128, 240, 0.6);
        }
      }

      .popover-content {
        .popover-header {
          margin-bottom: 16px;

          .popover-title {
            margin: 0;
            font-size: 1rem;
            font-weight: 600;
            display: flex;
            align-items: center;
          }
        }

        .popover-actions {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #e8e8e8;
        }
      }
    }

    .footer-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);

      .footer-content {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .footer-info {
          color: #666;
          display: flex;
          align-items: center;
        }
      }
    }
  }

  @media (max-width: 768px) {
    .demo-container {
      padding: 16px;

      .sidebar {
        width: 100vw;
        top: 60px;
      }

      .float-container {
        bottom: 20px;
        left: 20px;

        .popover-content {
          width: calc(100vw - 60px);
        }
      }
    }
  }
</style>
