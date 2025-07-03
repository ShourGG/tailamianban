<template>
  <div class="approval-workflow-container">
    <!-- 浮动工具栏 -->
    <div class="floating-toolbar">
      <NButton
        size="small"
        :bordered="false"
        @click="saveWorkflow"
      >
        保存
      </NButton>
      <NButton
        size="small"
        :bordered="false"
        @click="previewWorkflow"
      >
        预览
      </NButton>
    </div>

    <!-- Vue Flow 画布 -->
    <VueFlow
      v-model:nodes="nodes"
      v-model:edges="edges"
      :node-types="nodeTypes"
      class="workflow-canvas"
      :default-viewport="{ zoom: 1 }"
      :min-zoom="0.5"
      :max-zoom="2"
      @node-click="onNodeClick"
      @pane-click="closeAddMenu"
    >
    </VueFlow>

    <!-- 节点添加菜单 -->
    <Teleport to="body">
      <div
        v-show="showAddMenu"
        class="add-node-menu"
        :style="{
          left: menuPosition.x + 'px',
          top: menuPosition.y + 'px',
        }"
      >
        <div class="add-menu-content">
          <div
            class="add-menu-item"
            @click="addNode('approval')"
          >
            <div class="menu-icon approval-icon">👤</div>
            <span class="menu-text">审批人</span>
          </div>

          <div
            class="add-menu-item"
            @click="addNode('copy')"
          >
            <div class="menu-icon copy-icon">📋</div>
            <span class="menu-text">抄送人</span>
          </div>

          <div
            class="add-menu-item"
            @click="addNode('condition')"
          >
            <div class="menu-icon condition-icon">🔀</div>
            <span class="menu-text">条件分支</span>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 节点配置弹窗 -->
    <NModal
      v-model:show="showNodeConfig"
      style="width: 600px"
    >
      <NCard
        :title="(currentNode?.data as any)?.title + ' 设置'"
        :bordered="false"
        role="dialog"
      >
        <template #header-extra>
          <NButton
            size="small"
            @click="showNodeConfig = false"
            >✕</NButton
          >
        </template>

        <!-- 审批人配置 -->
        <div v-if="currentNode?.type === 'approval'">
          <p>选择审批人：</p>
          <div class="user-selection">
            <NCheckboxGroup v-model:value="selectedUsers">
              <NSpace vertical>
                <NCheckbox
                  v-for="user in users"
                  :key="user.id"
                  :value="user.id"
                  :label="user.name + ' (' + user.department + ')'"
                />
              </NSpace>
            </NCheckboxGroup>
          </div>
        </div>

        <!-- 抄送人配置 -->
        <div v-else-if="currentNode?.type === 'copy'">
          <p>选择抄送人：</p>
          <div class="user-selection">
            <NCheckboxGroup v-model:value="selectedCopyUsers">
              <NSpace vertical>
                <NCheckbox
                  v-for="user in users"
                  :key="user.id"
                  :value="user.id"
                  :label="user.name + ' (' + user.department + ')'"
                />
              </NSpace>
            </NCheckboxGroup>
          </div>
        </div>

        <!-- 条件配置 -->
        <div v-else-if="currentNode?.type === 'condition'">
          <p>条件设置：</p>
          <div class="condition-config">
            <p class="text-gray-500">条件节点配置功能开发中...</p>
          </div>
        </div>

        <template #action>
          <NSpace>
            <NButton @click="showNodeConfig = false">取消</NButton>
            <NButton
              type="primary"
              @click="saveNodeConfig"
              >确定</NButton
            >
          </NSpace>
        </template>
      </NCard>
    </NModal>
  </div>
</template>

<script setup lang="ts">
  import { VueFlow, type NodeMouseEvent } from '@vue-flow/core'

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
  } from '@/types/work-flow'

  // 导入节点组件
  import StartNode from './nodes/StartNode.vue'
  import ApprovalNode from './nodes/ApprovalNode.vue'
  import CopyNode from './nodes/CopyNode.vue'
  import ConditionNode from './nodes/ConditionNode.vue'

  // 使用 markRaw 包装组件，避免响应式警告
  const nodeTypes: Record<string, Component> = {
    start: markRaw(StartNode),
    approval: markRaw(ApprovalNode),
    copy: markRaw(CopyNode),
    condition: markRaw(ConditionNode),
  }

  // Props 定义
  const props = withDefaults(defineProps<WorkflowProps>(), {
    users: () => [],
    roles: () => [],
    departments: () => [],
    readonly: false,
    theme: 'light',
  })

  // Emits 定义
  const emit = defineEmits<WorkflowEmits>()

  // 消息提示
  const message = useMessage()

  // 状态管理 - 正确的类型定义
  const nodes = ref<WorkflowNode[]>([
    {
      id: 'start-1',
      type: 'start',
      position: { x: 250, y: 50 },
      data: {
        title: '发起人',
        status: 'active',
      },
    },
  ])

  const edges = ref<WorkflowEdge[]>([])
  const showAddMenu = ref<boolean>(false)
  const menuPosition = ref<MenuPosition>({ x: 0, y: 0 })
  const showNodeConfig = ref<boolean>(false)
  const currentNode = ref<WorkflowNode | null>(null)
  const selectedUsers = ref<string[]>([])
  const selectedCopyUsers = ref<string[]>([])

  // 向子组件提供 showAddMenu 方法
  const handleShowAddMenu = (position: MenuPosition): void => {
    menuPosition.value = position
    showAddMenu.value = true
  }

  // 使用 provide 向子组件提供方法
  provide('showAddMenu', handleShowAddMenu)

  // 节点操作
  const addNode = (type: NodeType): void => {
    const newNode: WorkflowNode = {
      id: `${type}-${Date.now()}`,
      type,
      position: {
        x: menuPosition.value.x - 100,
        y: menuPosition.value.y + 80,
      },
      data: {
        title: getNodeTitle(type),
        status: 'pending',
        ...(type === 'approval' && { approvers: [] }),
        ...(type === 'copy' && { copyUsers: [] }),
        ...(type === 'condition' && { conditions: [] }),
      },
    }

    nodes.value.push(newNode)

    // 自动连接到上一个节点
    if (nodes.value.length > 1) {
      const lastNode = nodes.value[nodes.value.length - 2]
      const newEdge: WorkflowEdge = {
        id: `edge-${lastNode.id}-${newNode.id}`,
        source: lastNode.id,
        target: newNode.id,
        animated: true,
      }
      edges.value.push(newEdge)
    }

    showAddMenu.value = false
    emitChange()
  }

  const getNodeTitle = (type: NodeType): string => {
    const titles: Record<NodeType, string> = {
      start: '发起人',
      approval: '审批人',
      copy: '抄送人',
      condition: '条件分支',
    }
    return titles[type]
  }

  // 删除节点
  const removeNode = (nodeId: string): void => {
    nodes.value = nodes.value.filter(node => node.id !== nodeId)
    edges.value = edges.value.filter(
      edge => edge.source !== nodeId && edge.target !== nodeId
    )
    emitChange()
  }

  // 事件处理 - 正确的类型定义
  const onNodeClick = (event: NodeMouseEvent): void => {
    const node = event.node as WorkflowNode // 类型断言
    if (node.type !== 'start') {
      currentNode.value = node

      // 根据节点类型初始化选中用户
      if (node.type === 'approval') {
        const approvers = (node.data as any).approvers || []
        selectedUsers.value = approvers.map((u: User) => u.id)
      } else if (node.type === 'copy') {
        const copyUsers = (node.data as any).copyUsers || []
        selectedCopyUsers.value = copyUsers.map((u: User) => u.id)
      }

      showNodeConfig.value = true
      emit('node-click', node)
    }
  }

  const closeAddMenu = (): void => {
    showAddMenu.value = false
  }

  const saveNodeConfig = (): void => {
    if (!currentNode.value) return

    try {
      if (currentNode.value.type === 'approval') {
        const selectedUserObjs =
          props.users?.filter(u => selectedUsers.value.includes(u.id)) || []
        ;(currentNode.value.data as any).approvers = selectedUserObjs
        message.success(`已设置 ${selectedUserObjs.length} 个审批人`)
      } else if (currentNode.value.type === 'copy') {
        const selectedUserObjs =
          props.users?.filter(u => selectedCopyUsers.value.includes(u.id)) || []
        ;(currentNode.value.data as any).copyUsers = selectedUserObjs
        message.success(`已设置 ${selectedUserObjs.length} 个抄送人`)
      }

      showNodeConfig.value = false
      emitChange()
    } catch (error) {
      message.error('保存配置失败')
      console.error('Save node config error:', error)
    }
  }

  // 工具栏操作
  const saveWorkflow = (): void => {
    const data = getCurrentWorkflowData()
    emit('save', data)
    message.success('工作流保存成功')
    console.log('保存工作流', data)
  }

  const previewWorkflow = (): void => {
    const data = getCurrentWorkflowData()
    console.log('预览工作流', data)
    message.info('预览功能开发中...')
  }

  // 验证工作流
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
            message: '请设置审批人',
            type: 'required',
          })
        }
      }
    })

    return errors
  }

  // 获取当前工作流数据
  const getCurrentWorkflowData = (): WorkflowData => {
    return {
      nodes: nodes.value,
      edges: edges.value,
      config: {
        version: '1.0',
        createdAt: new Date().toISOString(),
      },
    }
  }

  // 数据更新
  const emitChange = (): void => {
    const data = getCurrentWorkflowData()
    emit('update:modelValue', data)
    emit('change', data)
  }

  // 监听外部数据变化
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

  // 计算属性
  const workflowStats = computed(() => {
    const totalNodes = nodes.value.length
    const approvalNodes = nodes.value.filter(n => n.type === 'approval').length
    const copyNodes = nodes.value.filter(n => n.type === 'copy').length
    const conditionNodes = nodes.value.filter(
      n => n.type === 'condition'
    ).length

    return {
      totalNodes,
      approvalNodes,
      copyNodes,
      conditionNodes,
    }
  })

  // 对外暴露的方法
  defineExpose({
    validateWorkflow,
    getCurrentWorkflowData,
    removeNode,
    saveWorkflow,
    previewWorkflow,
    stats: workflowStats,
  })
</script>

<style scoped lang="scss">
  .approval-workflow-container {
    width: 100%;
    height: 600px;
    position: relative;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }

  .floating-toolbar {
    position: absolute;
    top: 16px;
    left: 16px;
    z-index: 10;
    display: flex;
    gap: 8px;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    padding: 8px 12px;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }

  .workflow-canvas {
    width: 100%;
    height: 100%;
  }

  .add-node-menu {
    position: fixed;
    z-index: 1000;
    pointer-events: none;

    .add-menu-content {
      background: white;
      border-radius: 12px;
      padding: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
      display: flex;
      gap: 8px;
      pointer-events: auto;
      animation: menuSlideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
  }

  .add-menu-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px 8px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    min-width: 70px;
    background: #fafafa;

    &:hover {
      background: #e6f7ff;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);
    }
  }

  .menu-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 6px;
    font-size: 16px;

    &.approval-icon {
      background: linear-gradient(135deg, #1890ff, #722ed1);
    }

    &.copy-icon {
      background: linear-gradient(135deg, #52c41a, #389e0d);
    }

    &.condition-icon {
      background: linear-gradient(135deg, #fa8c16, #d48806);
    }
  }

  .menu-text {
    font-size: 12px;
    color: #262626;
    font-weight: 500;
  }

  .user-selection {
    max-height: 300px;
    overflow-y: auto;
    padding: 16px;
    background: #fafafa;
    border-radius: 8px;
    margin: 12px 0;
  }

  .condition-config {
    padding: 20px;
    text-align: center;
    color: #8c8c8c;
  }

  @keyframes menuSlideUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
