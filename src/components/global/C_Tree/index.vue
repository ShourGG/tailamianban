<template>
  <div class="c-tree">
    <!-- 工具栏 -->
    <div
      v-if="showToolbar"
      class="c-tree-toolbar"
    >
      <div class="toolbar-left">
        <NInput
          v-if="searchable"
          v-model:value="internalSearchPattern"
          :placeholder="searchPlaceholder"
          clearable
          class="search-input"
        >
          <template #prefix>
            <div class="i-mdi-magnify text-gray-400"></div>
          </template>
        </NInput>
      </div>
      <div class="toolbar-right">
        <slot name="toolbar-actions">
          <NButton
            v-if="addable"
            type="primary"
            @click="handleAdd()"
          >
            <template #icon>
              <div class="i-mdi-plus"></div>
            </template>
            {{ addText }}
          </NButton>
          <NButton @click="toggleExpandAll">
            <template #icon>
              <div class="i-mdi-file-tree"></div>
            </template>
            {{ isAllExpanded ? '收起全部' : '展开全部' }}
          </NButton>
          <NButton
            v-if="refreshable"
            @click="handleRefresh"
          >
            <template #icon>
              <div class="i-mdi-refresh"></div>
            </template>
            刷新
          </NButton>
        </slot>
      </div>
    </div>

    <!-- 树形组件 -->
    <div class="c-tree-container">
      <NTree
        :data="treeData"
        :pattern="currentSearchPattern"
        :expanded-keys="expandedKeys"
        :selected-keys="selectedKeys"
        :draggable="draggable"
        :show-line="showLine"
        :render-prefix="renderPrefix"
        :render-suffix="renderSuffix"
        :render-label="renderLabel"
        :key-field="keyField"
        :label-field="labelField"
        :children-field="childrenField"
        @update:expanded-keys="handleExpandedKeysChange"
        @update:selected-keys="handleSelectedKeysChange"
        @drop="handleDrop"
        class="tree-instance"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  // 手动定义需要的类型，避免导入问题
  interface TreeOption {
    [key: string]: any
    id?: string | number
    key?: string | number
    label?: string
    children?: TreeOption[]
  }

  interface DropInfo {
    node: TreeOption
    dragNode: TreeOption
    dropPosition: 'before' | 'inside' | 'after'
    event: DragEvent
  }

  // 基础树节点数据类型
  interface TreeNodeData {
    [key: string]: any
    id: string | number
    name: string
    children?: TreeNodeData[]
  }

  // 状态配置类型
  interface StatusConfig {
    field: string
    values: Record<
      string | number,
      {
        text: string
        type: 'success' | 'warning' | 'error' | 'info'
      }
    >
  }

  // 操作按钮配置
  interface ActionConfig {
    key: string
    text: string
    icon: string
    type?: 'primary' | 'info' | 'warning' | 'error'
    show?: (node: TreeNodeData) => boolean
    confirm?: string
  }

  // Props定义
  interface Props {
    // 数据相关
    data: TreeNodeData[]
    keyField?: string
    labelField?: string
    childrenField?: string

    // 搜索相关
    searchPattern?: string // 外部传入的搜索模式
    searchable?: boolean
    searchPlaceholder?: string

    // 功能开关
    draggable?: boolean
    showLine?: boolean
    showToolbar?: boolean
    addable?: boolean
    addText?: string
    refreshable?: boolean

    // 自定义配置
    iconField?: string
    statusConfigs?: StatusConfig[]
    actions?: ActionConfig[]

    // 默认状态
    defaultExpandAll?: boolean
    defaultExpandedKeys?: (string | number)[]
    defaultSelectedKeys?: (string | number)[]
  }

  const props = withDefaults(defineProps<Props>(), {
    keyField: 'id',
    labelField: 'name',
    childrenField: 'children',
    searchPattern: '',
    searchable: true,
    searchPlaceholder: '搜索...',
    draggable: false,
    showLine: true,
    showToolbar: true,
    addable: true,
    addText: '新增',
    refreshable: true,
    iconField: 'icon',
    statusConfigs: () => [],
    actions: () => [
      {
        key: 'add',
        text: '新增',
        icon: 'i-mdi-plus',
        type: 'primary',
      },
      {
        key: 'edit',
        text: '编辑',
        icon: 'i-mdi-pencil',
        type: 'info',
      },
      {
        key: 'delete',
        text: '删除',
        icon: 'i-mdi-delete',
        type: 'error',
        confirm: '确认删除吗？',
      },
    ],
    defaultExpandAll: false,
    defaultExpandedKeys: () => [],
    defaultSelectedKeys: () => [],
  })

  // Emits定义
  const emit = defineEmits<{
    'node-select': [
      node: TreeNodeData | null,
      selectedKeys: (string | number)[],
    ]
    'node-action': [action: string, node: TreeNodeData]
    'node-drop': [info: DropInfo]
    add: [parentNode?: TreeNodeData]
    refresh: []
  }>()

  // 响应式数据
  const internalSearchPattern = ref('')
  const expandedKeys = ref<(string | number)[]>(props.defaultExpandedKeys)
  const selectedKeys = ref<(string | number)[]>(props.defaultSelectedKeys)
  const isAllExpanded = ref(props.defaultExpandAll)

  // 计算属性
  const treeData = computed((): TreeOption[] => {
    return props.data as TreeOption[]
  })

  // 搜索模式：优先使用外部传入的，否则使用内部的
  const currentSearchPattern = computed(() => {
    return props.searchPattern || internalSearchPattern.value
  })

  const selectedNode = computed((): TreeNodeData | null => {
    if (selectedKeys.value.length === 0) return null

    const findNode = (
      nodes: TreeNodeData[],
      id: string | number
    ): TreeNodeData | null => {
      for (const node of nodes) {
        if (node[props.keyField] === id) return node
        if (node[props.childrenField]) {
          const found = findNode(node[props.childrenField], id)
          if (found) return found
        }
      }
      return null
    }

    return findNode(props.data, selectedKeys.value[0])
  })

  // 工具函数
  const getAllKeys = (nodes: TreeNodeData[]): (string | number)[] => {
    const keys: (string | number)[] = []
    nodes.forEach(node => {
      keys.push(node[props.keyField])
      if (node[props.childrenField]) {
        keys.push(...getAllKeys(node[props.childrenField]))
      }
    })
    return keys
  }

  // 渲染函数
  const renderPrefix = ({ option }: { option: TreeOption }) => {
    const node = option as TreeNodeData
    const iconClass = node[props.iconField || 'icon'] || getDefaultIcon(node)

    return h('div', {
      class: `${iconClass} mr-3 text-lg flex-shrink-0`,
      style: {
        display: 'flex',
        alignItems: 'center',
        lineHeight: '1',
        color: getIconColor(node),
      },
    })
  }

  const renderLabel = ({ option }: { option: TreeOption }) => {
    const node = option as TreeNodeData
    const statusTags =
      props.statusConfigs
        ?.map(config => {
          const value = node[config.field]
          const statusConfig = config.values[value]

          if (!statusConfig || !statusConfig.text) return null

          return h(
            NTag,
            {
              type: statusConfig.type,
              size: 'small',
              class: 'ml-2',
              style: { fontSize: '12px' },
            },
            { default: () => statusConfig.text }
          )
        })
        .filter(Boolean) || []

    return h(
      'div',
      {
        class: 'flex items-center flex-1 min-w-0 py-1',
        style: { lineHeight: '1.5' },
      },
      [
        h(
          'span',
          {
            class: 'mr-3 font-medium text-sm',
          },
          node[props.labelField || 'name']
        ),
        ...statusTags,
      ]
    )
  }

  const renderSuffix = ({ option }: { option: TreeOption }) => {
    const node = option as TreeNodeData

    const actionButtons = (props.actions || [])
      .filter(action => !action.show || action.show(node))
      .map(action => {
        const buttonProps = {
          size: 'tiny' as const,
          type: action.type || ('default' as const),
          secondary: true,
          style: {
            padding: '4px 6px',
            minWidth: '24px',
            height: '24px',
          },
          onClick: (e: Event) => {
            e.stopPropagation()
            handleNodeAction(action.key, node)
          },
        }

        const iconEl = h('div', {
          class: `${action.icon}`,
          style: { fontSize: '12px' },
        })

        if (action.confirm) {
          return h(
            NPopconfirm,
            {
              onPositiveClick: () => handleNodeAction(action.key, node),
            },
            {
              trigger: () =>
                h(
                  NButton,
                  {
                    ...buttonProps,
                    onClick: (e: Event) => e.stopPropagation(),
                  },
                  {
                    icon: () => iconEl,
                  }
                ),
              default: () => action.confirm,
            }
          )
        }

        const button = h(NButton, buttonProps, {
          icon: () => iconEl,
        })

        return h(
          NTooltip,
          {
            placement: 'top',
            showArrow: false,
          },
          {
            trigger: () => button,
            default: () => action.text,
          }
        )
      })

    return h(
      'div',
      {
        class: 'tree-actions',
        style: {
          display: 'flex',
          alignItems: 'center',
          marginLeft: '8px',
          opacity: '0',
          transition: 'opacity 0.2s ease',
        },
      },
      [
        h(
          NSpace,
          { size: 4 },
          {
            default: () => actionButtons,
          }
        ),
      ]
    )
  }

  // 根据节点类型获取默认图标
  const getDefaultIcon = (node: TreeNodeData) => {
    if (node.type === 'directory') return 'i-mdi-folder'
    if (node.type === 'menu') return 'i-mdi-file-document'
    if (node.type === 'button') return 'i-mdi-button-cursor'
    return 'i-mdi-circle-outline'
  }

  // 根据节点类型获取图标颜色
  const getIconColor = (node: TreeNodeData) => {
    if (node.type === 'directory') return '#1890ff'
    if (node.type === 'menu') return '#52c41a'
    if (node.type === 'button') return '#fa8c16'
    return '#666'
  }

  // 事件处理
  const toggleExpandAll = (): void => {
    if (isAllExpanded.value) {
      expandedKeys.value = []
      isAllExpanded.value = false
    } else {
      expandedKeys.value = getAllKeys(props.data)
      isAllExpanded.value = true
    }
  }

  const handleExpandedKeysChange = (keys: (string | number)[]): void => {
    expandedKeys.value = keys
    isAllExpanded.value = keys.length === getAllKeys(props.data).length
  }

  const handleSelectedKeysChange = (keys: (string | number)[]): void => {
    selectedKeys.value = keys
    emit('node-select', selectedNode.value, keys)
  }

  const handleDrop = (info: DropInfo): void => {
    emit('node-drop', info)
  }

  const handleNodeAction = (action: string, node: TreeNodeData): void => {
    if (action === 'add') {
      emit('add', node)
    } else {
      emit('node-action', action, node)
    }
  }

  const handleAdd = (): void => {
    emit('add')
  }

  const handleRefresh = (): void => {
    emit('refresh')
  }

  // 暴露方法
  defineExpose({
    expandAll: () => {
      expandedKeys.value = getAllKeys(props.data)
      isAllExpanded.value = true
    },
    collapseAll: () => {
      expandedKeys.value = []
      isAllExpanded.value = false
    },
    selectNode: (key: string | number) => {
      selectedKeys.value = [key]
    },
    getSelectedNode: () => selectedNode.value,
    expandedKeys,
    selectedKeys,
  })
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
