<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-07-03 09:13:12
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-07-04 16:34:56
 * @FilePath: \Robot_Admin\src\components\global\C_WorkFlow\NodeConfigModal.vue
 * @Description: 节点配置弹窗组件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎. 
-->

<template>
  <NModal
    v-model:show="visible"
    style="width: 900px"
    :mask-closable="false"
    preset="dialog"
    :title="configTitle"
    positive-text="确定"
    negative-text="取消"
    :loading="configLoading"
    @positive-click="saveNodeConfig"
    @negative-click="handleCancel"
  >
    <!-- 发起人配置 - 统一为数组处理 -->
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
          <template #prefix><div class="i-mdi:magnify w-4 h-4"></div></template>
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
          v-if="selectedInitiators.length > 0"
          class="selected-users"
        >
          <h5>已选择发起人 ({{ selectedInitiators.length }})</h5>
          <div class="selected-user-tags">
            <NTag
              v-for="user in selectedInitiators"
              :key="user.id"
              closable
              type="primary"
              @close="removeInitiator(user.id)"
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
          <template #prefix><div class="i-mdi:magnify w-4 h-4"></div></template>
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
          <template #prefix><div class="i-mdi:magnify w-4 h-4"></div></template>
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
</template>

<script setup lang="ts">
  // 导入类型定义
  import type {
    WorkflowNode,
    User,
    Department,
    Condition,
  } from '@/types/work-flow'

  // 导入数据常量
  import {
    APPROVAL_MODES,
    FIELD_OPTIONS,
    OPERATOR_OPTIONS,
    CONFIG_TITLES,
    getDefaultAvatar,
    createDefaultCondition,
  } from './data'

  // Props 定义
  interface Props {
    show: boolean
    currentNode: WorkflowNode | null
    users: User[]
    departments: Department[]
  }

  const props = withDefaults(defineProps<Props>(), {
    show: false,
    currentNode: null,
    users: () => [],
    departments: () => [],
  })

  // Emits 定义
  interface Emits {
    (e: 'update:show', value: boolean): void
    (e: 'save', configData: any): void
    (e: 'cancel'): void
  }

  const emit = defineEmits<Emits>()

  // 响应式数据
  const message = useMessage()
  const searchKeyword = ref('')
  const selectedUsers = ref<string[]>([])
  const selectedCopyUsers = ref<string[]>([])
  const approvalMode = ref<'any' | 'all' | 'sequence'>('any')
  const configLoading = ref(false)
  const conditions = ref<Condition[]>([])

  // 计算属性
  const visible = computed({
    get: () => props.show,
    set: (value: boolean) => emit('update:show', value),
  })

  const configTitle = computed(() => {
    if (props.currentNode?.type === 'start') return '发起人设置'
    const type = props.currentNode?.type as keyof typeof CONFIG_TITLES
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

  // 方法定义 - 统一处理，移除对开始节点的特殊处理
  const handleUserSelect = (keys: string[]) => {
    const userKeys = keys.filter(key => !key.startsWith('dept-'))
    selectedUsers.value = userKeys
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

  // 新增：移除发起人方法
  const removeInitiator = (userId: string) => {
    selectedUsers.value = selectedUsers.value.filter(id => id !== userId)
  }

  const addCondition = () => conditions.value.push(createDefaultCondition())
  const removeCondition = (index: number) => conditions.value.splice(index, 1)

  // 节点配置初始化 - 修改发起人处理为数组
  const configureStartNode = (node: WorkflowNode) => {
    const { initiators } = node.data as any
    selectedUsers.value = initiators ? initiators.map((u: User) => u.id) : []
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

  // 配置保存逻辑 - 修改发起人保存为数组
  const saveStartNodeConfig = async (): Promise<boolean> => {
    if (selectedUsers.value.length === 0) {
      message.error('请选择发起人')
      return false
    }

    const selectedUserObjs = selectedInitiators.value
    emit('save', { initiators: selectedUserObjs })
    message.success(`已设置 ${selectedUserObjs.length} 个发起人`)
    return true
  }

  const saveApprovalNodeConfig = async (): Promise<boolean> => {
    if (selectedUsers.value.length === 0) {
      message.error('请至少选择一个审批人')
      return false
    }

    const selectedUserObjs = selectedApprovers.value
    emit('save', {
      approvers: selectedUserObjs,
      approvalMode: approvalMode.value,
    })
    message.success(`已设置 ${selectedUserObjs.length} 个审批人`)
    return true
  }

  const saveCopyNodeConfig = async (): Promise<boolean> => {
    const selectedUserObjs = selectedCopyUserList.value
    emit('save', { copyUsers: selectedUserObjs })
    message.success(`已设置 ${selectedUserObjs.length} 个抄送人`)
    return true
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

    emit('save', { conditions: validConditions })
    message.success(`已设置 ${validConditions.length} 个条件分支`)
    return true
  }

  const saveNodeConfig = async (): Promise<boolean> => {
    if (!props.currentNode) return false

    configLoading.value = true

    try {
      const nodeSavers = {
        start: saveStartNodeConfig,
        approval: saveApprovalNodeConfig,
        copy: saveCopyNodeConfig,
        condition: saveConditionNodeConfig,
      }

      const saver =
        nodeSavers[props.currentNode.type as keyof typeof nodeSavers]
      const success = saver ? await saver() : false

      return success
    } catch (error) {
      message.error('保存配置失败')
      console.error('Save node config error:', error)
      return false
    } finally {
      configLoading.value = false
    }
  }

  const handleCancel = () => {
    emit('cancel')
  }

  // 监听节点变化，重新初始化配置
  watch(
    () => props.currentNode,
    newNode => {
      if (newNode) {
        searchKeyword.value = ''

        const nodeConfigurators = {
          start: configureStartNode,
          approval: configureApprovalNode,
          copy: configureCopyNode,
          condition: configureConditionNode,
        }

        const configurator =
          nodeConfigurators[newNode.type as keyof typeof nodeConfigurators]
        if (configurator) {
          configurator(newNode)
        }
      }
    },
    { immediate: true }
  )
</script>
