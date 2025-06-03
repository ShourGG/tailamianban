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
            v-for="stat in headerStats"
            :key="stat.label"
            :value="stat.value"
            :type="stat.type"
          >
            <span class="stat-item">
              <i :class="stat.icon"></i>
              {{ stat.label }}
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
              {{ getActionText(card) }}
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
              v-for="link in footerLinks"
              :key="link.label"
              text
              type="primary"
            >
              <template #icon>
                <i :class="link.icon"></i>
              </template>
              {{ link.label }}
            </NButton>
          </NSpace>
        </div>
      </div>
    </NCard>
  </div>
</template>

<script setup lang="ts">
  import type { FormInstance } from '@/types/modules/form'
  import {
    type ContainerType,
    layoutTypes,
    formOptions,
    containerCards,
    principles,
    headerStats,
    footerLinks,
    createDefaultFormData,
    createPerformanceStats,
    refreshPerformanceStats,
  } from './data'

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
  const formData = reactive(createDefaultFormData())

  // 性能统计
  const performanceStats = ref(createPerformanceStats())

  // 获取动态操作文本
  const getActionText = (card: any): string => {
    if (card.key === 'sidebar') {
      return sidebarCollapsed.value ? '展开侧边栏' : '收起侧边栏'
    }
    return card.actionText
  }

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
    refreshPerformanceStats(performanceStats.value)
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
  @use './index.scss';
</style>
