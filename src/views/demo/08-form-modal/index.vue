<template>
  <div class="demo-container">
    <!-- 头部 -->
    <div class="header">
      <NH1 class="main-title">表单选择器组件场景示例</NH1>
      <div class="panel-title">
        弹出控制中心<span class="subtitle">/ 5种主要的表单容器场景</span>
      </div>
      <div class="stats-overview">
        <NSpace size="large">
          <NStatistic
            v-for="stat in headerStats"
            :key="stat.label"
            :label="stat.label"
            :value="stat.value"
          >
            <template #prefix>
              <i :class="stat.icon"></i>
            </template>
          </NStatistic>
        </NSpace>
      </div>
    </div>

    <!-- 容器卡片网格 -->
    <div class="cards-grid">
      <div
        v-for="card in containerCards"
        :key="card.key"
        class="card-wrapper"
      >
        <NCard
          hoverable
          class="container-card"
          @click="handleCardAction(card.key)"
        >
          <template #header>
            <div class="card-header">
              <div class="icon-wrapper">
                <i
                  :class="card.icon"
                  class="card-icon"
                ></i>
              </div>
              <div class="header-content">
                <h3 class="card-title">{{ card.title }}</h3>
                <NTag
                  :type="card.tagType"
                  size="small"
                  >{{ card.layout }}</NTag
                >
              </div>
            </div>
          </template>

          <div class="card-body">
            <p class="card-description">{{ card.description }}</p>

            <div class="card-features">
              <NSpace
                wrap
                size="small"
              >
                <NTag
                  v-for="feature in card.features"
                  :key="feature"
                  size="small"
                  round
                >
                  {{ feature }}
                </NTag>
              </NSpace>
            </div>

            <div class="card-stats">
              <div class="stat-item">
                <span class="stat-label">字段数量</span>
                <NBadge
                  :value="card.fields"
                  :type="getBadgeType(card.fields)"
                />
              </div>
              <div class="stat-item">
                <span class="stat-label">复杂度</span>
                <NRate
                  :value="card.complexity"
                  readonly
                  size="small"
                />
              </div>
              <div class="stat-item">
                <span class="stat-label">状态</span>
                <NTag
                  :type="getStatusType(card.key)"
                  size="small"
                >
                  {{ getStatusText(card.key) }}
                </NTag>
              </div>
            </div>
          </div>

          <template #action>
            <NButton
              type="primary"
              block
              size="large"
              strong
            >
              <template #icon>
                <i :class="card.actionIcon"></i>
              </template>
              {{ getActionText(card) }}
            </NButton>
          </template>

          <!-- 浮动表单按钮 -->
          <div
            v-if="card.key === 'popover'"
            class="card-float-btn"
            @click.stop
          >
            <NPopover
              v-model:show="containerState.popover"
              trigger="click"
              placement="bottom"
            >
              <template #trigger>
                <NButton
                  circle
                  size="small"
                  type="primary"
                  @click.stop="toggleContainer('popover')"
                >
                  <template #icon>
                    <i class="i-carbon-settings"></i>
                  </template>
                </NButton>
              </template>
              <div class="popover-content">
                <div class="popover-header">
                  <h4>快速编辑</h4>
                  <NTag
                    size="small"
                    type="info"
                    >实时保存</NTag
                  >
                </div>
                <C_Form
                  ref="popoverFormRef"
                  :options="formOptions.popover"
                  :layout-type="layoutTypes.popover"
                  v-model="formData.popover"
                  @submit="submitForm('popover')"
                >
                  <template #action="{ validate }">
                    <NSpace
                      justify="end"
                      class="mt-4"
                    >
                      <NButton
                        size="small"
                        @click="toggleContainer('popover', false)"
                        >取消</NButton
                      >
                      <NButton
                        size="small"
                        type="primary"
                        @click="validateAndSubmit('popover', validate)"
                      >
                        保存
                      </NButton>
                    </NSpace>
                  </template>
                </C_Form>
              </div>
            </NPopover>
          </div>
        </NCard>
      </div>
    </div>

    <!-- 模态框 -->
    <NModal
      v-model:show="containerState.modal"
      preset="card"
      title="用户信息管理"
      :style="{ width: '600px' }"
      size="large"
    >
      <template #header-extra>
        <NTag
          type="info"
          size="small"
          >网格布局</NTag
        >
      </template>
      <C_Form
        ref="modalFormRef"
        :options="formOptions.modal"
        :layout-type="layoutTypes.modal"
        v-model="formData.modal"
        @submit="submitForm('modal')"
      />
      <template #action>
        <NSpace justify="end">
          <NButton @click="toggleContainer('modal', false)">取消</NButton>
          <NButton
            type="primary"
            @click="submitForm('modal')"
            >确认</NButton
          >
        </NSpace>
      </template>
    </NModal>

    <!-- 抽屉 -->
    <NDrawer
      v-model:show="containerState.drawer"
      :width="500"
      placement="right"
    >
      <NDrawerContent title="商品详情配置">
        <template #header-extra>
          <NTag
            type="success"
            size="small"
            >默认布局</NTag
          >
        </template>
        <C_Form
          ref="drawerFormRef"
          :options="formOptions.drawer"
          :layout-type="layoutTypes.drawer"
          v-model="formData.drawer"
          @submit="submitForm('drawer')"
        />
        <template #footer>
          <NSpace justify="end">
            <NButton @click="toggleContainer('drawer', false)">取消</NButton>
            <NButton
              type="primary"
              @click="submitForm('drawer')"
              >保存</NButton
            >
          </NSpace>
        </template>
      </NDrawerContent>
    </NDrawer>

    <!-- 侧边栏 -->
    <div
      class="sidebar"
      :class="{ collapsed: containerState.sidebar }"
    >
      <NCard
        v-if="!containerState.sidebar"
        class="sidebar-card"
      >
        <template #header>
          <div class="sidebar-header">
            <div class="header-info">
              <i class="i-carbon-filter mr-2"></i>
              <span>筛选条件</span>
              <NTag
                type="warning"
                size="small"
                class="ml-2"
                >紧凑布局</NTag
              >
            </div>
            <NButton
              quaternary
              circle
              size="small"
              @click="toggleContainer('sidebar')"
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
          @submit="submitForm('sidebar')"
        >
          <template #action="{ validate }">
            <NSpace
              justify="space-between"
              class="mt-4"
            >
              <NButton @click="clearFormData('sidebar')">
                <template #icon>
                  <i class="i-carbon-clean"></i>
                </template>
                清空
              </NButton>
              <NButton
                type="primary"
                @click="validateAndSubmit('sidebar', validate)"
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

    <!-- 步骤向导 -->
    <NModal
      v-model:show="containerState.wizard"
      preset="card"
      title="项目创建向导"
      :style="{ width: '900px' }"
      size="huge"
      :closable="false"
    >
      <template #header-extra>
        <NTag
          type="success"
          size="small"
          >步骤布局</NTag
        >
      </template>
      <C_Form
        ref="wizardFormRef"
        :options="formOptions.wizard"
        :layout-type="layoutTypes.wizard"
        v-model="formData.wizard"
        @submit="submitForm('wizard')"
      />
      <template #action>
        <NSpace justify="space-between">
          <NButton @click="toggleContainer('wizard', false)">取消</NButton>
          <NSpace>
            <NButton @click="clearFormData('wizard')">重置</NButton>
            <NButton
              type="primary"
              @click="submitForm('wizard')"
              >完成创建</NButton
            >
          </NSpace>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>

<script setup lang="ts">
  import type { Ref } from 'vue'
  import type { FormInstance } from '@/types/modules/form'
  import {
    type ContainerType,
    type ContainerCard,
    layoutTypes,
    formOptions,
    containerCards,
    containerConfig,
    createDefaultFormData,
    headerStats,
  } from './data'

  const message = useMessage()

  // 统一状态管理
  const containerState = reactive({
    modal: false,
    drawer: false,
    sidebar: true, // collapsed状态
    popover: false,
    wizard: false,
  })

  // 表单引用
  const modalFormRef = ref<FormInstance>()
  const drawerFormRef = ref<FormInstance>()
  const sidebarFormRef = ref<FormInstance>()
  const popoverFormRef = ref<FormInstance>()
  const wizardFormRef = ref<FormInstance>()

  // 表单数据
  const formData = reactive(createDefaultFormData())

  // 工具函数
  const getBadgeType = (fields: number): 'default' | 'success' | 'warning' => {
    if (fields <= 2) return 'default'
    if (fields <= 4) return 'success'
    return 'warning'
  }

  const getStatusType = (key: ContainerType) => containerConfig[key].statusType

  const getStatusText = (key: ContainerType): string => {
    const config = containerConfig[key]
    const state =
      key === 'sidebar' ? containerState.sidebar : containerState[key]
    return config.getStatusText(state)
  }

  const getActionText = (card: ContainerCard): string => {
    if (card.key === 'sidebar') {
      return containerState.sidebar ? '展开侧边栏' : '收起侧边栏'
    }
    return card.actionText
  }

  // 处理卡片点击事件
  const handleCardAction = (key: ContainerType): void => {
    if (key === 'sidebar') {
      toggleContainer('sidebar') // 侧边栏需要切换状态
    } else {
      toggleContainer(key, true) // 其他容器打开
    }
  }

  // 统一容器控制
  const toggleContainer = (type: ContainerType, state?: boolean): void => {
    if (type === 'sidebar') {
      containerState.sidebar = state ?? !containerState.sidebar
    } else {
      containerState[type] = state ?? !containerState[type]
    }
  }

  // 统一表单提交
  const submitForm = async (type: ContainerType): Promise<void> => {
    const formRefMap: Record<ContainerType, Ref<FormInstance | undefined>> = {
      modal: modalFormRef,
      drawer: drawerFormRef,
      sidebar: sidebarFormRef,
      popover: popoverFormRef,
      wizard: wizardFormRef,
    }

    const formRef = formRefMap[type].value
    if (!formRef) return

    try {
      await formRef.validate()
      console.log(`${type} form submitted:`, formData[type])
      message.success('表单提交成功！')

      // 自动关闭容器（sidebar除外）
      if (type !== 'sidebar') {
        toggleContainer(type, false)
      }
    } catch {
      message.error('表单验证失败，请检查输入')
    }
  }

  // 验证并提交
  const validateAndSubmit = async (
    type: ContainerType,
    validate: () => Promise<void>
  ): Promise<void> => {
    try {
      await validate()
      await submitForm(type)
    } catch {
      message.error('表单验证失败')
    }
  }

  // 清空表单数据
  const clearFormData = (type: ContainerType): void => {
    formData[type] = {}
    message.info('已清空表单数据')
  }
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
