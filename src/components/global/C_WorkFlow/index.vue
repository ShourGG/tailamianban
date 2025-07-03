<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-07-03 09:13:12
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-07-03 18:27:14
 * @FilePath: \Robot_Admin\src\components\global\C_WorkFlow\index.vue
 * @Description: 工作（审批流）流组件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎. 
-->

<template>
  <div class="approval-workflow-container">
    <!-- 浮动工具栏 -->
    <div class="floating-toolbar">
      <NButton
        size="small"
        type="primary"
        @click="saveWorkflow"
      >
        <template #icon
          ><div class="i-mdi:content-save w-4 h-4"></div
        ></template>
        保存
      </NButton>
      <NButton
        size="small"
        @click="previewWorkflow"
      >
        <template #icon><div class="i-mdi:eye w-4 h-4"></div></template>
        预览
      </NButton>
      <NButton
        size="small"
        @click="validateCurrentWorkflow"
        title="检查工作流配置是否正确"
      >
        <template #icon
          ><div class="i-mdi:check-circle w-4 h-4"></div
        ></template>
        验证流程
      </NButton>
      <div class="toolbar-divider"></div>
      <NButton
        size="small"
        @click="fitView"
        title="适应窗口"
      >
        <template #icon
          ><div class="i-mdi:fit-to-screen w-4 h-4"></div
        ></template>
      </NButton>
      <NButton
        size="small"
        type="error"
        @click="clearWorkflow"
        title="清空画布"
      >
        <template #icon
          ><div class="i-mdi:delete-sweep w-4 h-4"></div
        ></template>
      </NButton>
    </div>

    <!-- Vue Flow 画布 -->
    <VueFlow
      ref="vueFlowRef"
      v-model:nodes="nodes"
      v-model:edges="edges"
      :node-types="nodeTypes"
      class="workflow-canvas"
      :default-viewport="{ zoom: 1, x: 0, y: 0 }"
      :min-zoom="0.5"
      :max-zoom="2"
      :fit-view-on-init="true"
      :nodes-draggable="true"
      :elements-selectable="true"
      @node-click="onNodeClick"
      @pane-click="closeAddMenu"
    />

    <!-- 节点添加菜单 -->
    <Teleport to="body">
      <div
        v-show="showAddMenu"
        class="add-node-menu"
        :style="{ left: menuPosition.x + 'px', top: menuPosition.y + 'px' }"
      >
        <div class="add-menu-content">
          <div
            v-for="nodeType in NODE_TYPE_OPTIONS"
            :key="nodeType.type"
            class="add-menu-item"
            @click="addNode(nodeType.type)"
          >
            <div
              class="menu-icon"
              :class="nodeType.iconClass"
            >
              <div :class="nodeType.icon"></div>
            </div>
            <span class="menu-text">{{ nodeType.label }}</span>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 节点配置弹窗 -->
    <NModal
      v-model:show="showNodeConfig"
      style="width: 900px"
      :mask-closable="false"
      preset="dialog"
      :title="configTitle"
      positive-text="确定"
      negative-text="取消"
      :loading="configLoading"
      @positive-click="saveNodeConfig"
      @negative-click="showNodeConfig = false"
    >
      <!-- 发起人配置 -->
      <div
        v-if="currentNode?.type === 'start'"
        class="config-content"
      >
        <div class="config-section">
          <h4 class="section-title">
            <div class="i-mdi:account-star w-4 h-4"></div>
            选择发起人
          </h4>

          <NInput
            v-model:value="searchKeyword"
            placeholder="搜索用户姓名或部门"
            clearable
            class="search-input"
          >
            <template #prefix
              ><div class="i-mdi:magnify w-4 h-4"></div
            ></template>
          </NInput>

          <div class="user-tree-container">
            <NTree
              :data="departmentUserTree"
              :checked-keys="selectedUsers"
              :selectable="false"
              checkable
              :cascade="false"
              :virtual-scroll="true"
              style="max-height: 300px"
              @update:checked-keys="handleUserSelect"
            />
          </div>

          <div
            v-if="selectedUsers.length > 0"
            class="selected-users"
          >
            <h5>已选择发起人</h5>
            <div class="selected-user-tags">
              <NTag
                v-for="user in selectedInitiators"
                :key="user.id"
                closable
                type="primary"
                @close="selectedUsers = []"
              >
                <div class="user-tag-content">
                  <NAvatar
                    :src="user.avatar"
                    :fallback-src="getDefaultAvatar(user.name)"
                    size="small"
                  />
                  <span class="user-name">{{ user.name }}</span>
                  <span class="user-dept">{{ user.department }}</span>
                </div>
              </NTag>
            </div>
          </div>
        </div>
      </div>

      <!-- 审批人配置 -->
      <div
        v-else-if="currentNode?.type === 'approval'"
        class="config-content"
      >
        <div class="config-section">
          <h4 class="section-title">
            <div class="i-mdi:account-check w-4 h-4"></div>
            选择审批人
          </h4>

          <NInput
            v-model:value="searchKeyword"
            placeholder="搜索用户姓名或部门"
            clearable
            class="search-input"
          >
            <template #prefix
              ><div class="i-mdi:magnify w-4 h-4"></div
            ></template>
          </NInput>

          <div class="user-tree-container">
            <NTree
              :data="departmentUserTree"
              :checked-keys="selectedUsers"
              :selectable="false"
              checkable
              cascade
              :virtual-scroll="true"
              style="max-height: 300px"
              @update:checked-keys="handleUserSelect"
            />
          </div>

          <div
            v-if="selectedApprovers.length > 0"
            class="selected-users"
          >
            <h5>已选择审批人 ({{ selectedApprovers.length }})</h5>
            <div class="selected-user-tags">
              <NTag
                v-for="user in selectedApprovers"
                :key="user.id"
                closable
                type="info"
                @close="removeApprover(user.id)"
              >
                <div class="user-tag-content">
                  <NAvatar
                    :src="user.avatar"
                    :fallback-src="getDefaultAvatar(user.name)"
                    size="small"
                  />
                  <span class="user-name">{{ user.name }}</span>
                  <span class="user-dept">{{ user.department }}</span>
                </div>
              </NTag>
            </div>
          </div>

          <div class="approval-mode-section">
            <h5>审批模式</h5>
            <NRadioGroup v-model:value="approvalMode">
              <NSpace vertical>
                <NRadio
                  v-for="mode in APPROVAL_MODES"
                  :key="mode.value"
                  :value="mode.value"
                >
                  <div class="mode-option">
                    <strong>{{ mode.label }}</strong>
                    <span class="mode-desc">{{ mode.desc }}</span>
                  </div>
                </NRadio>
              </NSpace>
            </NRadioGroup>
          </div>
        </div>
      </div>

      <!-- 抄送人配置 -->
      <div
        v-else-if="currentNode?.type === 'copy'"
        class="config-content"
      >
        <div class="config-section">
          <h4 class="section-title">
            <div class="i-mdi:email-outline w-4 h-4"></div>
            选择抄送人
          </h4>

          <NInput
            v-model:value="searchKeyword"
            placeholder="搜索用户姓名或部门"
            clearable
            class="search-input"
          >
            <template #prefix
              ><div class="i-mdi:magnify w-4 h-4"></div
            ></template>
          </NInput>

          <div class="user-tree-container">
            <NTree
              :data="departmentUserTree"
              :checked-keys="selectedCopyUsers"
              :selectable="false"
              checkable
              cascade
              :virtual-scroll="true"
              style="max-height: 300px"
              @update:checked-keys="handleCopyUserSelect"
            />
          </div>

          <div
            v-if="selectedCopyUserList.length > 0"
            class="selected-users"
          >
            <h5>已选择抄送人 ({{ selectedCopyUserList.length }})</h5>
            <div class="selected-user-tags">
              <NTag
                v-for="user in selectedCopyUserList"
                :key="user.id"
                closable
                type="success"
                @close="removeCopyUser(user.id)"
              >
                <div class="user-tag-content">
                  <NAvatar
                    :src="user.avatar"
                    :fallback-src="getDefaultAvatar(user.name)"
                    size="small"
                  />
                  <span class="user-name">{{ user.name }}</span>
                  <span class="user-dept">{{ user.department }}</span>
                </div>
              </NTag>
            </div>
          </div>
        </div>
      </div>

      <!-- 条件配置 -->
      <div
        v-else-if="currentNode?.type === 'condition'"
        class="config-content"
      >
        <div class="config-section">
          <h4 class="section-title">
            <div class="i-mdi:source-branch w-4 h-4"></div>
            条件分支设置
          </h4>

          <div class="condition-builder">
            <div
              v-for="(condition, index) in conditions"
              :key="condition.id"
              class="condition-item"
            >
              <NCard
                size="small"
                class="condition-card"
              >
                <div class="condition-content">
                  <NInput
                    v-model:value="condition.name"
                    placeholder="分支名称"
                    style="width: 150px"
                  />
                  <NSelect
                    v-model:value="condition.field"
                    placeholder="选择字段"
                    :options="FIELD_OPTIONS"
                    style="width: 120px"
                  />
                  <NSelect
                    v-model:value="condition.operator"
                    placeholder="操作符"
                    :options="OPERATOR_OPTIONS"
                    style="width: 100px"
                  />
                  <NInput
                    v-model:value="condition.value"
                    placeholder="值"
                    style="width: 120px"
                  />
                  <NButton
                    quaternary
                    type="error"
                    @click="removeCondition(index)"
                  >
                    <template #icon
                      ><div class="i-mdi:delete w-4 h-4"></div
                    ></template>
                  </NButton>
                </div>
              </NCard>
            </div>

            <NButton
              dashed
              block
              @click="addCondition"
            >
              <template #icon><div class="i-mdi:plus w-4 h-4"></div></template>
              添加条件
            </NButton>
          </div>
        </div>
      </div>
    </NModal>

    <!-- 验证错误日志抽屉 -->
    <NDrawer
      v-model:show="showValidationErrors"
      :width="450"
      placement="right"
    >
      <NDrawerContent
        title="流程验证结果"
        closable
      >
        <div
          v-if="validationErrors.length === 0"
          class="validation-success"
        >
          <div class="success-icon">
            <div class="i-mdi:check-circle text-32px text-green-500"></div>
          </div>
          <h3>✅ 验证通过</h3>
          <p>工作流配置正确，所有节点都已正确设置！</p>
        </div>

        <div
          v-else
          class="validation-errors"
        >
          <div class="error-summary">
            <div class="error-icon">
              <div class="i-mdi:alert-circle text-24px text-red-500"></div>
            </div>
            <h3>❌ 发现 {{ validationErrors.length }} 个问题</h3>
            <p>请修复以下问题后重新验证：</p>
          </div>

          <div class="error-list">
            <div
              v-for="(error, index) in validationErrors"
              :key="error.nodeId"
              class="error-item"
            >
              <div class="error-header">
                <span class="error-number">{{ index + 1 }}</span>
                <div class="error-info">
                  <strong class="error-node">{{ error.nodeName }}</strong>
                  <span class="error-field">{{
                    getFieldDisplayName(error.field)
                  }}</span>
                </div>
                <div
                  class="error-type"
                  :class="error.type"
                  >{{ getErrorTypeText(error.type) }}</div
                >
              </div>
              <div class="error-message">{{ error.message }}</div>
              <div class="error-actions">
                <NButton
                  size="small"
                  type="primary"
                  @click="jumpToErrorNode(error.nodeId)"
                >
                  <template #icon
                    ><div class="i-mdi:target w-4 h-4"></div
                  ></template>
                  定位节点
                </NButton>
              </div>
            </div>
          </div>

          <div class="validation-tips">
            <h4>💡 常见问题解决方案：</h4>
            <ul>
              <li
                ><strong>审批人未设置：</strong
                >点击审批节点，在弹窗中选择审批人员</li
              >
              <li
                ><strong>条件分支未配置：</strong
                >点击条件节点，添加至少一个条件分支</li
              >
              <li
                ><strong>节点连接断开：</strong> 检查节点之间的连线是否正确</li
              >
            </ul>
          </div>
        </div>

        <template #footer>
          <div class="validation-footer">
            <NButton @click="showValidationErrors = false">关闭</NButton>
            <NButton
              type="primary"
              @click="validateCurrentWorkflow"
            >
              <template #icon
                ><div class="i-mdi:refresh w-4 h-4"></div
              ></template>
              重新验证
            </NButton>
          </div>
        </template>
      </NDrawerContent>
    </NDrawer>
  </div>
</template>

<script setup lang="ts">
  import { VueFlow, type NodeMouseEvent } from '@vue-flow/core'
  import type { Component } from 'vue'

  // 导入类型定义
  import type {
    WorkflowNode,
    WorkflowEdge,
    WorkflowData,
    WorkflowProps,
    WorkflowEmits,
    NodeType,
    MenuPosition,
    User,
    ValidationError,
    Condition,
  } from '@/types/work-flow'

  // 导入数据常量
  import {
    NODE_TYPE_OPTIONS,
    APPROVAL_MODES,
    FIELD_OPTIONS,
    OPERATOR_OPTIONS,
    NODE_TITLES,
    CONFIG_TITLES,
    FIELD_DISPLAY_NAMES,
    ERROR_TYPE_TEXTS,
    INITIAL_NODE,
    getDefaultAvatar,
    createDefaultCondition,
    generateEdgeId,
  } from './data'

  // 导入节点组件
  import StartNode from './nodes/StartNode.vue'
  import ApprovalNode from './nodes/ApprovalNode.vue'
  import CopyNode from './nodes/CopyNode.vue'
  import ConditionNode from './nodes/ConditionNode.vue'

  // 节点组件映射
  const NODE_TYPES: Record<string, Component> = {
    start: markRaw(StartNode),
    approval: markRaw(ApprovalNode),
    copy: markRaw(CopyNode),
    condition: markRaw(ConditionNode),
  }

  // Props & Emits
  const props = withDefaults(defineProps<WorkflowProps>(), {
    users: () => [],
    roles: () => [],
    departments: () => [],
    readonly: false,
    theme: 'light',
  })

  const emit = defineEmits<WorkflowEmits>()

  // 响应式数据
  const message = useMessage()
  const vueFlowRef = ref()

  const nodes = ref<WorkflowNode[]>([{ ...INITIAL_NODE }])
  const edges = ref<WorkflowEdge[]>([])
  const showAddMenu = ref(false)
  const menuPosition = ref<MenuPosition>({ x: 0, y: 0 })
  const showNodeConfig = ref(false)
  const currentNode = ref<WorkflowNode | null>(null)
  const selectedUsers = ref<string[]>([])
  const selectedCopyUsers = ref<string[]>([])
  const searchKeyword = ref('')
  const approvalMode = ref<'any' | 'all' | 'sequence'>('any')
  const configLoading = ref(false)
  const conditions = ref<Condition[]>([])
  const validationErrors = ref<ValidationError[]>([])
  const showValidationErrors = ref(false)
  const currentAddNodeId = ref<string | null>(null)

  // 计算属性
  const nodeTypes = computed(() => NODE_TYPES)
  const configTitle = computed(() => {
    if (currentNode.value?.type === 'start') return '发起人设置'
    const type = currentNode.value?.type as keyof typeof CONFIG_TITLES
    return CONFIG_TITLES[type] || '节点设置'
  })

  const departmentUserTree = computed(() => {
    const tree: any[] = []
    const deptMap = new Map()

    props.departments?.forEach(dept => {
      if (!deptMap.has(dept.id)) {
        deptMap.set(dept.id, {
          key: `dept-${dept.id}`,
          label: `${dept.name} ${dept.manager ? `(负责人: ${dept.manager})` : ''}`,
          children: [],
          isLeaf: false,
          disabled: true,
        })
      }
    })

    const filteredUsers =
      props.users?.filter(
        user =>
          !searchKeyword.value ||
          user.name.includes(searchKeyword.value) ||
          user.department.includes(searchKeyword.value)
      ) || []

    filteredUsers.forEach(user => {
      const dept = props.departments?.find(d => d.name === user.department)
      if (dept && deptMap.has(dept.id)) {
        deptMap.get(dept.id).children.push({
          key: user.id,
          label: `${user.name} (${user.role})`,
          isLeaf: true,
          user,
        })
      }
    })

    deptMap.forEach(dept => {
      if (dept.children.length > 0) {
        tree.push(dept)
      }
    })

    return tree
  })

  const selectedApprovers = computed(
    () => props.users?.filter(u => selectedUsers.value.includes(u.id)) || []
  )
  const selectedCopyUserList = computed(
    () => props.users?.filter(u => selectedCopyUsers.value.includes(u.id)) || []
  )
  const selectedInitiators = computed(
    () => props.users?.filter(u => selectedUsers.value.includes(u.id)) || []
  )

  const workflowStats = computed(() => {
    const stats = {
      totalNodes: nodes.value.length,
      approvalNodes: 0,
      copyNodes: 0,
      conditionNodes: 0,
    }
    nodes.value.forEach(n => {
      if (n.type === 'approval') stats.approvalNodes++
      else if (n.type === 'copy') stats.copyNodes++
      else if (n.type === 'condition') stats.conditionNodes++
    })
    return stats
  })

  // 方法定义
  const handleShowAddMenu = (position: MenuPosition, nodeId?: string): void => {
    try {
      menuPosition.value = {
        x: typeof position.x === 'number' ? position.x : 0,
        y: typeof position.y === 'number' ? position.y : 0,
      }
      currentAddNodeId.value = nodeId || null
      showAddMenu.value = true
    } catch (error) {
      console.error('Error showing add menu:', error)
    }
  }

  const deleteNode = (nodeId: string): void => {
    if (nodeId === 'start-1') {
      message?.warning?.('不能删除开始节点')
      return
    }

    const nodeIndex = nodes.value.findIndex(n => n.id === nodeId)
    if (nodeIndex === -1) return

    const incomingEdges = edges.value.filter(edge => edge.target === nodeId)
    const outgoingEdges = edges.value.filter(edge => edge.source === nodeId)

    nodes.value.splice(nodeIndex, 1)
    edges.value = edges.value.filter(
      edge => edge.source !== nodeId && edge.target !== nodeId
    )

    incomingEdges.forEach(inEdge => {
      outgoingEdges.forEach(outEdge => {
        edges.value.push({
          id: generateEdgeId(inEdge.source, outEdge.target),
          source: inEdge.source,
          target: outEdge.target,
          animated: true,
          type: 'default',
        })
      })
    })

    nodes.value.forEach((node, index) => {
      if (index >= nodeIndex) {
        node.position.y -= 120
      }
    })

    emitChange()
    message?.success?.('节点已删除')

    nextTick(() => {
      setTimeout(() => {
        vueFlowRef.value?.fitView?.({ padding: 60, duration: 400 })
      }, 100)
    })
  }

  provide('showAddMenu', handleShowAddMenu)
  provide('deleteNode', deleteNode)

  const handleUserSelect = (keys: string[]) => {
    const userKeys = keys.filter(key => !key.startsWith('dept-'))
    selectedUsers.value =
      currentNode.value?.type === 'start'
        ? userKeys.length > 0
          ? [userKeys[userKeys.length - 1]]
          : []
        : userKeys
  }

  const handleCopyUserSelect = (keys: string[]) => {
    selectedCopyUsers.value = keys.filter(key => !key.startsWith('dept-'))
  }

  const removeApprover = (userId: string) => {
    selectedUsers.value = selectedUsers.value.filter(id => id !== userId)
  }

  const removeCopyUser = (userId: string) => {
    selectedCopyUsers.value = selectedCopyUsers.value.filter(
      id => id !== userId
    )
  }

  const addCondition = () => conditions.value.push(createDefaultCondition())
  const removeCondition = (index: number) => conditions.value.splice(index, 1)

  // 拆分节点添加逻辑
  const getTargetNodeInfo = () => {
    let targetNodeIndex = nodes.value.length - 1
    let targetNode = nodes.value[targetNodeIndex]

    if (currentAddNodeId.value) {
      const foundIndex = nodes.value.findIndex(
        n => n.id === currentAddNodeId.value
      )
      if (foundIndex !== -1) {
        targetNodeIndex = foundIndex
        targetNode = nodes.value[targetNodeIndex]
      }
    }
    return { targetNodeIndex, targetNode }
  }

  const createNewNode = (
    type: NodeType,
    targetNode: WorkflowNode | null
  ): WorkflowNode => ({
    id: `${type}-${Date.now()}`,
    type,
    position: {
      x: targetNode?.position.x || 150,
      y: (targetNode?.position.y || 130) + 120,
    },
    data: {
      title: NODE_TITLES[type],
      status: 'pending',
      ...(type === 'approval' && { approvers: [], approvalMode: 'any' }),
      ...(type === 'copy' && { copyUsers: [] }),
      ...(type === 'condition' && { conditions: [] }),
    },
  })

  const handleEdgeReconnection = (
    targetNode: WorkflowNode,
    newNode: WorkflowNode
  ) => {
    const targetOutgoingEdges = edges.value.filter(
      edge => edge.source === targetNode.id
    )
    edges.value = edges.value.filter(edge => edge.source !== targetNode.id)

    edges.value.push({
      id: generateEdgeId(targetNode.id, newNode.id),
      source: targetNode.id,
      target: newNode.id,
      animated: true,
      type: 'default',
    })

    targetOutgoingEdges.forEach(edge => {
      edges.value.push({
        id: generateEdgeId(newNode.id, edge.target),
        source: newNode.id,
        target: edge.target,
        animated: true,
        type: 'default',
      })
    })
  }

  const addNode = (type: NodeType): void => {
    try {
      const { targetNodeIndex, targetNode } = getTargetNodeInfo()
      const newNode = createNewNode(type, targetNode)

      nodes.value.splice(targetNodeIndex + 1, 0, newNode)

      for (let i = targetNodeIndex + 2; i < nodes.value.length; i++) {
        nodes.value[i].position.y += 120
      }

      if (targetNode) {
        handleEdgeReconnection(targetNode, newNode)
      }

      showAddMenu.value = false
      currentAddNodeId.value = null
      emitChange()

      nextTick(() => {
        setTimeout(() => {
          vueFlowRef.value?.fitView?.({ padding: 60, duration: 400 })
        }, 100)
      })
    } catch (error) {
      console.error('Error adding node:', error)
      message?.error?.('添加节点失败，请重试')
    }
  }

  // 拆分节点点击处理逻辑
  const configureStartNode = (node: WorkflowNode) => {
    const { initiator } = node.data as any
    selectedUsers.value = initiator ? [initiator.id] : []
  }

  const configureApprovalNode = (node: WorkflowNode) => {
    const approvers = (node.data as any).approvers || []
    selectedUsers.value = approvers.map((u: User) => u.id)
    approvalMode.value = (node.data as any).approvalMode || 'any'
  }

  const configureCopyNode = (node: WorkflowNode) => {
    const copyUsers = (node.data as any).copyUsers || []
    selectedCopyUsers.value = copyUsers.map((u: User) => u.id)
  }

  const configureConditionNode = (node: WorkflowNode) => {
    conditions.value = (node.data as any).conditions || []
  }

  const onNodeClick = (event: NodeMouseEvent): void => {
    try {
      const node = event.node as WorkflowNode
      currentNode.value = node
      searchKeyword.value = ''

      const nodeConfigurators = {
        start: configureStartNode,
        approval: configureApprovalNode,
        copy: configureCopyNode,
        condition: configureConditionNode,
      }

      const configurator =
        nodeConfigurators[node.type as keyof typeof nodeConfigurators]
      if (configurator) {
        configurator(node)
      }

      showNodeConfig.value = true
      emit('node-click', node)
    } catch (error) {
      console.error('Error handling node click:', error)
    }
  }

  const closeAddMenu = (): void => {
    showAddMenu.value = false
  }

  // 拆分配置保存逻辑
  const saveStartNodeConfig = async (): Promise<boolean> => {
    if (selectedUsers.value.length === 0) {
      message.error('请选择发起人')
      return false
    }

    const selectedUser = props.users?.find(u => u.id === selectedUsers.value[0])
    if (selectedUser && currentNode.value) {
      ;(currentNode.value.data as any).initiator = selectedUser
      message.success(`已设置发起人：${selectedUser.name}`)
      return true
    }
    return false
  }

  const saveApprovalNodeConfig = async (): Promise<boolean> => {
    if (selectedUsers.value.length === 0) {
      message.error('请至少选择一个审批人')
      return false
    }

    const selectedUserObjs = selectedApprovers.value
    if (currentNode.value) {
      ;(currentNode.value.data as any).approvers = selectedUserObjs
      ;(currentNode.value.data as any).approvalMode = approvalMode.value
      message.success(`已设置 ${selectedUserObjs.length} 个审批人`)
      return true
    }
    return false
  }

  const saveCopyNodeConfig = async (): Promise<boolean> => {
    const selectedUserObjs = selectedCopyUserList.value
    if (currentNode.value) {
      ;(currentNode.value.data as any).copyUsers = selectedUserObjs
      message.success(`已设置 ${selectedUserObjs.length} 个抄送人`)
      return true
    }
    return false
  }

  const saveConditionNodeConfig = async (): Promise<boolean> => {
    if (conditions.value.length === 0) {
      message.error('请至少添加一个条件分支')
      return false
    }

    const validConditions = conditions.value.filter(
      c => c.name && c.field && c.operator && c.value
    )
    if (validConditions.length === 0) {
      message.error('请完善条件配置')
      return false
    }

    if (currentNode.value) {
      ;(currentNode.value.data as any).conditions = validConditions
      message.success(`已设置 ${validConditions.length} 个条件分支`)
      return true
    }
    return false
  }

  const saveNodeConfig = async (): Promise<boolean> => {
    if (!currentNode.value) return false

    configLoading.value = true

    try {
      const nodeSavers = {
        start: saveStartNodeConfig,
        approval: saveApprovalNodeConfig,
        copy: saveCopyNodeConfig,
        condition: saveConditionNodeConfig,
      }

      const saver =
        nodeSavers[currentNode.value.type as keyof typeof nodeSavers]
      const success = saver ? await saver() : false

      if (success) {
        showNodeConfig.value = false
        emitChange()
      }
      return success
    } catch (error) {
      message.error('保存配置失败')
      console.error('Save node config error:', error)
      return false
    } finally {
      configLoading.value = false
    }
  }

  const saveWorkflow = (): void => {
    const errors = validateWorkflow()
    if (errors.length > 0) {
      message?.error?.(`工作流验证失败: ${errors[0].message}`)
      showValidationErrors.value = true
      return
    }

    const data = getCurrentWorkflowData()
    emit('save', data)
    message?.success?.('工作流保存成功')
  }

  const previewWorkflow = (): void => {
    const data = getCurrentWorkflowData()
    console.log('预览工作流', data)
    message?.info?.('预览功能开发中...')
  }

  const validateCurrentWorkflow = (): void => {
    const errors = validateWorkflow()
    validationErrors.value = errors

    if (errors.length === 0) {
      message?.success?.('✅ 工作流验证通过！所有节点配置正确')
      showValidationErrors.value = false
    } else {
      message?.error?.(`❌ 发现 ${errors.length} 个问题，请查看详细错误`)
      showValidationErrors.value = true
      emit('validate-error', errors)
    }
  }

  const fitView = (): void => {
    try {
      if (vueFlowRef.value?.fitView) {
        nextTick(() => {
          vueFlowRef.value.fitView({
            padding: 50,
            includeHiddenNodes: false,
            minZoom: 0.5,
            maxZoom: 1.5,
            duration: 800,
          })
        })
        message?.success?.('已适应窗口大小')
      } else {
        message?.warning?.('画布未准备就绪，请稍后重试')
      }
    } catch (error) {
      console.error('FitView error:', error)
      message?.error?.('适应窗口失败')
    }
  }

  const clearWorkflow = (): void => {
    nodes.value = [{ ...INITIAL_NODE }]
    edges.value = []
    validationErrors.value = []
    showValidationErrors.value = false
    emitChange()

    nextTick(() => {
      setTimeout(() => {
        vueFlowRef.value?.fitView?.({ padding: 80, duration: 600 })
      }, 100)
    })

    message?.success?.('画布已清空')
  }

  const validateWorkflow = (): ValidationError[] => {
    const errors: ValidationError[] = []

    nodes.value.forEach(node => {
      if (node.type === 'approval') {
        const approvers = (node.data as any).approvers || []
        if (approvers.length === 0) {
          errors.push({
            nodeId: node.id,
            nodeName: node.data.title,
            field: 'approvers',
            message: '审批节点必须设置至少一个审批人，否则流程无法正常运行',
            type: 'required',
          })
        }
      }

      if (node.type === 'condition') {
        const conditions = (node.data as any).conditions || []
        if (conditions.length === 0) {
          errors.push({
            nodeId: node.id,
            nodeName: node.data.title,
            field: 'conditions',
            message:
              '条件分支节点必须配置至少一个分支条件，否则无法进行条件判断',
            type: 'required',
          })
        } else {
          const incompleteConditions = conditions.filter(
            (c: any) => !c.name || !c.field || !c.operator || !c.value
          )
          if (incompleteConditions.length > 0) {
            errors.push({
              nodeId: node.id,
              nodeName: node.data.title,
              field: 'conditions',
              message: `有 ${incompleteConditions.length} 个条件分支配置不完整，请完善所有必填字段`,
              type: 'incomplete',
            })
          }
        }
      }
    })

    const connectedNodes = new Set<string>()
    edges.value.forEach(edge => {
      connectedNodes.add(edge.source)
      connectedNodes.add(edge.target)
    })

    nodes.value.forEach(node => {
      if (node.type !== 'start' && !connectedNodes.has(node.id)) {
        errors.push({
          nodeId: node.id,
          nodeName: node.data.title,
          field: 'connection',
          message: '此节点未与其他节点连接，可能导致流程中断',
          type: 'warning',
        })
      }
    })

    return errors
  }

  const getFieldDisplayName = (field: string): string =>
    FIELD_DISPLAY_NAMES[field] || field
  const getErrorTypeText = (type: string): string =>
    ERROR_TYPE_TEXTS[type] || type

  const jumpToErrorNode = (nodeId: string): void => {
    const node = nodes.value.find(n => n.id === nodeId)
    if (node && vueFlowRef.value) {
      vueFlowRef.value.setCenter(node.position.x, node.position.y, {
        zoom: 1.2,
        duration: 800,
      })

      setTimeout(() => {
        currentNode.value = node
        showNodeConfig.value = true
        showValidationErrors.value = false
      }, 900)

      message?.info?.(`已定位到节点：${node.data.title}`)
    }
  }

  const getCurrentWorkflowData = (): WorkflowData => ({
    nodes: nodes.value,
    edges: edges.value,
    config: {
      version: '1.0',
      createdAt: new Date().toISOString(),
    },
  })

  const emitChange = (): void => {
    const data = getCurrentWorkflowData()
    emit('update:modelValue', data)
    emit('change', data)
  }

  watch(
    () => props.modelValue,
    newValue => {
      if (newValue && newValue !== getCurrentWorkflowData()) {
        nodes.value = newValue.nodes || []
        edges.value = newValue.edges || []
      }
    },
    { deep: true }
  )

  onMounted(() => {
    nextTick(() => {
      setTimeout(() => {
        vueFlowRef.value?.fitView?.({
          padding: 80,
          includeHiddenNodes: false,
          minZoom: 0.8,
          maxZoom: 1.2,
          duration: 600,
        })
      }, 300)
    })
  })

  defineExpose({
    validateWorkflow,
    getCurrentWorkflowData,
    saveWorkflow,
    previewWorkflow,
    deleteNode,
    stats: workflowStats,
  })
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
