<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-07-03 09:23:53
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-07-03 19:41:22
 * @FilePath: \Robot_Admin\src\views\demo\28-work-flow-editor\index.vue
 * @Description: 审批流演示页面
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎. 
-->

<template>
  <div class="workflow-demo-page">
    <!-- 页面头部 -->
    <header class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1>🚀 工作流设计器演示</h1>
          <p>拖拽构建审批流程，支持多种场景模板，实时预览工作流数据</p>
        </div>
        <div class="header-actions">
          <NButton
            type="primary"
            @click="saveAllWorkflows"
          >
            <template #icon><div class="i-mdi:content-save"></div></template>
            保存所有流程
          </NButton>
          <NButton @click="exportAllWorkflows">
            <template #icon><div class="i-mdi:download"></div></template>
            批量导出
          </NButton>
        </div>
      </div>
    </header>

    <!-- 场景选择标签 -->
    <section class="scenario-section">
      <div class="container">
        <NTabs
          v-model:value="currentScenario"
          type="card"
          size="large"
          @update:value="handleScenarioChange"
        >
          <NTabPane
            v-for="scenario in workflowScenarios"
            :key="scenario.id"
            :name="scenario.id"
            :tab="scenario.name"
          >
            <template #tab>
              <div class="scenario-tab">
                <div :class="scenario.icon"></div>
                <span>{{ scenario.name }}</span>
              </div>
            </template>
          </NTabPane>
        </NTabs>
      </div>
    </section>

    <!-- 主要内容区 -->
    <main class="main-content">
      <div class="container">
        <div class="content-layout">
          <!-- 工作流设计器 -->
          <div class="workflow-designer">
            <div class="designer-header">
              <div class="designer-title">
                <div
                  :class="currentScenarioData?.icon"
                  class="title-icon"
                ></div>
                <div>
                  <h3>{{ currentScenarioData?.name }}</h3>
                  <p>{{ currentScenarioData?.description }}</p>
                </div>
              </div>
              <div class="designer-actions">
                <NButton
                  size="small"
                  @click="resetWorkflow"
                  quaternary
                >
                  <template #icon><div class="i-mdi:refresh"></div></template>
                  重置
                </NButton>
                <NButton
                  size="small"
                  type="primary"
                  @click="loadTemplate"
                >
                  <template #icon
                    ><div class="i-mdi:magic-staff"></div
                  ></template>
                  加载模板
                </NButton>
              </div>
            </div>

            <div class="workflow-container">
              <C_WorkFlow
                v-model="workflowData"
                :users="userList"
                :roles="roleList"
                :departments="deptList"
                @change="handleWorkflowChange"
                @node-click="handleNodeClick"
              />
            </div>
          </div>

          <!-- 侧边面板 -->
          <aside class="sidebar">
            <!-- 流程统计 -->
            <div class="sidebar-section stats-section">
              <div class="section-header">
                <div class="i-mdi:chart-bar"></div>
                <h4>流程统计</h4>
              </div>
              <div class="stats-grid">
                <div class="stat-item">
                  <div class="stat-value">{{ workflowStats.totalNodes }}</div>
                  <div class="stat-label">总节点</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{
                    workflowStats.approvalNodes
                  }}</div>
                  <div class="stat-label">审批</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ workflowStats.copyNodes }}</div>
                  <div class="stat-label">抄送</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{
                    workflowStats.conditionNodes
                  }}</div>
                  <div class="stat-label">条件</div>
                </div>
              </div>
            </div>

            <!-- 流程预览 - 优化版 -->
            <div class="sidebar-section preview-section">
              <div class="section-header">
                <div class="i-mdi:eye"></div>
                <h4>流程预览</h4>
                <div class="preview-controls">
                  <NButton
                    size="tiny"
                    :type="previewExpanded ? 'primary' : 'default'"
                    @click="togglePreviewExpanded"
                    quaternary
                  >
                    <template #icon>
                      <div
                        :class="
                          previewExpanded
                            ? 'i-mdi:chevron-up'
                            : 'i-mdi:chevron-down'
                        "
                      ></div>
                    </template>
                  </NButton>
                </div>
              </div>

              <div
                class="preview-content"
                :class="{ expanded: previewExpanded }"
              >
                <div
                  v-if="workflowData?.nodes?.length > 0"
                  class="flow-timeline"
                >
                  <!-- 紧凑模式 -->
                  <div
                    v-if="!previewExpanded"
                    class="flow-compact"
                  >
                    <div class="flow-steps">
                      <div
                        v-for="(node, index) in workflowData.nodes"
                        :key="node.id"
                        class="step-compact"
                        :class="getNodeTypeClass(node.type)"
                        @click="selectPreviewNode(node)"
                        :title="`${node.data?.title} - ${getNodeDescription(node)}`"
                      >
                        <div class="step-icon">
                          <div :class="getNodeIcon(node.type)"></div>
                        </div>
                        <div
                          v-if="index < workflowData.nodes.length - 1"
                          class="step-arrow"
                        >
                          <div class="i-mdi:chevron-right"></div>
                        </div>
                      </div>
                    </div>

                    <!-- 选中节点的详细信息 -->
                    <div
                      v-if="selectedPreviewNode"
                      class="selected-node-info"
                    >
                      <div class="node-title">{{
                        selectedPreviewNode.data?.title
                      }}</div>
                      <div class="node-details">
                        <div
                          v-if="selectedPreviewNode.data?.approvers?.length"
                          class="detail-item"
                        >
                          <span class="detail-label"
                            >审批人：{{
                              getUserNames(selectedPreviewNode.data.approvers)
                            }}</span
                          >
                          <div class="user-list">
                            <NAvatar
                              v-for="user in selectedPreviewNode.data.approvers.slice(
                                0,
                                2
                              )"
                              :key="user.id"
                              v-bind="createAvatarProps(user, 'tiny')"
                            />
                            <span
                              v-if="
                                selectedPreviewNode.data.approvers.length > 2
                              "
                              class="more-count"
                            >
                              +{{
                                selectedPreviewNode.data.approvers.length - 2
                              }}
                            </span>
                          </div>
                        </div>
                        <div
                          v-if="selectedPreviewNode.data?.copyUsers?.length"
                          class="detail-item"
                        >
                          <span class="detail-label"
                            >抄送：{{
                              getUserNames(selectedPreviewNode.data.copyUsers)
                            }}</span
                          >
                          <div class="user-list">
                            <NAvatar
                              v-for="user in selectedPreviewNode.data.copyUsers.slice(
                                0,
                                2
                              )"
                              :key="user.id"
                              v-bind="createAvatarProps(user, 'tiny')"
                            />
                            <span
                              v-if="
                                selectedPreviewNode.data.copyUsers.length > 2
                              "
                              class="more-count"
                            >
                              +{{
                                selectedPreviewNode.data.copyUsers.length - 2
                              }}
                            </span>
                          </div>
                        </div>
                        <div
                          v-if="selectedPreviewNode.data?.conditions?.length"
                          class="detail-item"
                        >
                          <span class="detail-label">条件:</span>
                          <span class="condition-count"
                            >{{
                              selectedPreviewNode.data.conditions.length
                            }}
                            个分支</span
                          >
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 展开模式 -->
                  <div
                    v-else
                    class="flow-expanded"
                  >
                    <div
                      v-for="(node, index) in workflowData.nodes"
                      :key="node.id"
                      class="step-expanded"
                    >
                      <div
                        class="step-connector"
                        v-if="index > 0"
                      ></div>
                      <div
                        class="step-node"
                        :class="getNodeTypeClass(node.type)"
                      >
                        <div class="node-header">
                          <div class="node-icon">
                            <div :class="getNodeIcon(node.type)"></div>
                          </div>
                          <div class="node-title">{{ node.data?.title }}</div>
                          <div>{{ node.data?.name }}</div>
                        </div>
                        <div
                          v-if="hasNodeContent(node)"
                          class="node-content"
                        >
                          <div
                            v-if="node.data?.approvers?.length"
                            class="content-item"
                          >
                            <span class="content-label"
                              >审批人：{{
                                getUserNames(node.data.approvers)
                              }}</span
                            >
                            <div class="user-avatars">
                              <NAvatar
                                v-for="user in node.data.approvers.slice(0, 3)"
                                :key="user.id"
                                v-bind="createAvatarProps(user, 'small')"
                              />
                              <span
                                v-if="node.data.approvers.length > 3"
                                class="more-users"
                              >
                                +{{ node.data.approvers.length - 3 }}
                              </span>
                            </div>
                          </div>
                          <div
                            v-if="node.data?.copyUsers?.length"
                            class="content-item"
                          >
                            <span class="content-label"
                              >抄送人：{{
                                getUserNames(node.data.copyUsers)
                              }}</span
                            >
                            <div class="user-avatars">
                              <NAvatar
                                v-for="user in node.data.copyUsers.slice(0, 3)"
                                :key="user.id"
                                v-bind="createAvatarProps(user, 'small')"
                              />
                              <span
                                v-if="node.data.copyUsers.length > 3"
                                class="more-users"
                              >
                                +{{ node.data.copyUsers.length - 3 }}
                              </span>
                            </div>
                          </div>
                          <div
                            v-if="node.data?.conditions?.length"
                            class="content-item"
                          >
                            <span class="content-label">分支条件</span>
                            <span class="condition-text"
                              >{{ node.data.conditions.length }} 个分支</span
                            >
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <NEmpty
                  v-else
                  description="暂无流程数据"
                  size="small"
                />
              </div>
            </div>

            <!-- 数据详情 -->
            <div class="sidebar-section data-section">
              <NTabs
                type="line"
                size="small"
              >
                <NTabPane
                  name="json"
                  tab="JSON 数据"
                >
                  <C_Code
                    :code="workflowJsonData"
                    language="json"
                    title="工作流数据"
                    :show-header="true"
                    :show-line-numbers="true"
                    :word-wrap="true"
                    :show-fullscreen="true"
                    :max-height="300"
                    @copy="handleCodeCopy"
                  />
                </NTabPane>
                <NTabPane
                  name="config"
                  tab="配置详情"
                >
                  <div class="config-details">
                    <div
                      v-if="workflowData?.config"
                      class="config-item"
                    >
                      <span class="label">版本：</span>
                      <span class="value">{{
                        workflowData.config.version
                      }}</span>
                    </div>
                    <div
                      v-if="workflowData?.config?.createdAt"
                      class="config-item"
                    >
                      <span class="label">创建时间：</span>
                      <span class="value">{{
                        formatDate(workflowData.config.createdAt)
                      }}</span>
                    </div>
                    <div class="config-item">
                      <span class="label">节点总数：</span>
                      <span class="value">{{
                        workflowData?.nodes?.length || 0
                      }}</span>
                    </div>
                    <div class="config-item">
                      <span class="label">连接数：</span>
                      <span class="value">{{
                        workflowData?.edges?.length || 0
                      }}</span>
                    </div>
                    <div
                      v-if="currentScenarioData"
                      class="config-item"
                    >
                      <span class="label">场景类型：</span>
                      <span class="value">{{ currentScenarioData.name }}</span>
                    </div>
                  </div>
                </NTabPane>
                <NTabPane
                  name="validation"
                  tab="验证结果"
                >
                  <div class="validation-results">
                    <div
                      v-if="validationResults.length === 0"
                      class="validation-success"
                    >
                      <div class="i-mdi:check-circle"></div>
                      <span>流程配置正确</span>
                    </div>
                    <div
                      v-else
                      class="validation-errors"
                    >
                      <div
                        v-for="(error, index) in validationResults"
                        :key="index"
                        class="error-item"
                      >
                        <div class="i-mdi:alert-circle"></div>
                        <div class="error-content">
                          <div class="error-message">{{ error.message }}</div>
                          <div class="error-node"
                            >节点：{{ error.nodeName }}</div
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                </NTabPane>
              </NTabs>
            </div>
          </aside>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
  // 从 data.ts 导入数据和类型
  import {
    type User,
    type ValidationError,
    workflowScenarios,
    userList,
    roleList,
    deptList,
    NODE_DESCRIPTION_GENERATORS,
    NODE_MAPS,
    VALIDATION_RULES,
  } from './data'

  const message = useMessage()
  const currentScenario = ref('default-designer')
  const workflowData = ref<any>(null)
  const validationResults = ref<ValidationError[]>([])

  // 新增预览相关的状态
  const previewExpanded = ref(false)
  const selectedPreviewNode = ref<any>(null)

  // 计算属性
  const currentScenarioData = computed(() =>
    workflowScenarios.find(s => s.id === currentScenario.value)
  )

  const workflowJsonData = computed(() =>
    workflowData.value ? JSON.stringify(workflowData.value, null, 2) : '{}'
  )

  const workflowStats = computed(() => {
    if (!workflowData.value?.nodes) {
      return {
        totalNodes: 0,
        approvalNodes: 0,
        copyNodes: 0,
        conditionNodes: 0,
      }
    }

    const { nodes } = workflowData.value
    return {
      totalNodes: nodes.length,
      approvalNodes: nodes.filter((n: any) => n.type === 'approval').length,
      copyNodes: nodes.filter((n: any) => n.type === 'copy').length,
      conditionNodes: nodes.filter((n: any) => n.type === 'condition').length,
    }
  })

  // ============ 工具函数 ============

  // 生成默认头像URL
  const generateDefaultAvatar = (name?: string): string => {
    const safeName = name || '未知'
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(safeName)}&background=random`
  }

  // 创建默认用户信息
  const createDefaultUser = (user: any): User => {
    const userId = user?.id || ''
    const userName = user?.name || '未知用户'
    const userDepartment = user?.department || ''
    const userRole = user?.role || ''
    const userAvatar = generateDefaultAvatar(userName)

    return {
      id: userId,
      name: userName,
      avatar: userAvatar,
      department: userDepartment,
      role: userRole,
    }
  }

  // 从用户列表中查找用户
  const findUserById = (userId: string): User | null => {
    return userList.find(u => u.id === userId) || null
  }

  // 获取完整用户信息
  const getFullUserInfo = (user: any): User => {
    if (user?.avatar) return user

    const fullUser = findUserById(user?.id)
    return fullUser || createDefaultUser(user)
  }

  // 获取用户名列表的辅助函数
  const getUserNames = (users: any[]): string => {
    return users.map(user => getFullUserInfo(user).name).join('、')
  }

  // 创建头像组件的辅助函数
  const createAvatarProps = (user: any, size: 'tiny' | 'small' = 'small') => {
    const fullUser = getFullUserInfo(user)
    return {
      size,
      src: fullUser.avatar,
      title: fullUser.name,
    }
  }

  // 获取节点描述
  const getNodeDescription = (node: any): string => {
    const parts: string[] = []

    Object.entries(NODE_DESCRIPTION_GENERATORS).forEach(([key, generator]) => {
      const count = node.data?.[key]?.length
      if (count) parts.push(generator(count))
    })

    return parts.length > 0 ? parts.join(', ') : '无配置'
  }

  // 节点映射函数
  const getNodeTypeClass = (type: string): string =>
    NODE_MAPS.typeClass[type as keyof typeof NODE_MAPS.typeClass] ||
    'node-default'
  const getNodeIcon = (type: string): string =>
    NODE_MAPS.icon[type as keyof typeof NODE_MAPS.icon] || 'i-mdi:circle'

  // 验证错误创建器
  const createValidationError = (
    node: any,
    field: string,
    message: string
  ): ValidationError => ({
    nodeId: node.id,
    nodeName: node.data?.title || '未知节点',
    field,
    message,
    type: 'required' as const,
  })

  // 验证单个节点
  const validateSingleNode = (node: any): ValidationError[] => {
    const rule = VALIDATION_RULES[node.type as keyof typeof VALIDATION_RULES]
    const errorMessage = rule?.(node)

    return errorMessage
      ? [createValidationError(node, node.type, errorMessage)]
      : []
  }

  // 验证工作流
  const validateWorkflow = (): void => {
    const errors = workflowData.value?.nodes?.flatMap(validateSingleNode) || []
    validationResults.value = errors
  }

  // 辅助函数：检查节点是否有内容
  const hasNodeContent = (node: any): boolean =>
    !!(
      node.data?.approvers?.length ||
      node.data?.copyUsers?.length ||
      node.data?.conditions?.length
    )

  // ============ 预览相关方法 ============
  const togglePreviewExpanded = (): void => {
    previewExpanded.value = !previewExpanded.value
    if (!previewExpanded.value) {
      selectedPreviewNode.value = null
    }
  }

  const selectPreviewNode = (node: any): void => {
    selectedPreviewNode.value =
      selectedPreviewNode.value?.id === node.id ? null : node
  }

  // ============ 业务逻辑方法 ============
  const handleScenarioChange = (scenarioId: string): void => {
    currentScenario.value = scenarioId
    loadTemplate()
  }

  const loadTemplate = (): void => {
    const scenario = workflowScenarios.find(s => s.id === currentScenario.value)
    if (scenario?.template) {
      workflowData.value = {
        ...scenario.template,
        config: {
          version: '1.0',
          createdAt: new Date().toISOString(),
        },
      }
      message.success(`已加载 ${scenario.name} 模板`)
      selectedPreviewNode.value = null
    }
  }

  const resetWorkflow = (): void => {
    workflowData.value = {
      nodes: [
        {
          id: 'start-1',
          type: 'start',
          position: { x: 150, y: 100 },
          data: { title: '发起人', status: 'active' },
        },
      ],
      edges: [],
      config: {
        version: '1.0',
        createdAt: new Date().toISOString(),
      },
    }
    selectedPreviewNode.value = null
    message.info('工作流已重置')
  }

  const handleWorkflowChange = (data: any): void => {
    workflowData.value = data
    validateWorkflow()

    if (
      selectedPreviewNode.value &&
      !data?.nodes?.find((n: any) => n.id === selectedPreviewNode.value.id)
    ) {
      selectedPreviewNode.value = null
    }
  }

  const handleNodeClick = (nodeData: any): void => {
    message.info(`点击了节点: ${nodeData.data?.title}`)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCodeCopy = (code: string): void => {
    message.success('JSON 数据已复制到剪贴板')
  }

  const saveAllWorkflows = (): void => {
    if (!workflowData.value) {
      message.warning('暂无工作流数据')
      return
    }
    message.success('所有工作流保存成功')
  }

  const exportAllWorkflows = (): void => {
    if (!workflowData.value) {
      message.warning('暂无工作流数据')
      return
    }

    const dataStr = JSON.stringify(workflowData.value, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${currentScenario.value}-workflow-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)

    message.success('工作流导出成功')
  }

  const formatDate = (dateStr: string): string =>
    new Date(dateStr).toLocaleString('zh-CN')

  // 初始化
  onMounted(() => {
    loadTemplate()
  })
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
