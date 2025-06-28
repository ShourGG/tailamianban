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
            <C_Icon
              name="mdi:magnify"
              :size="16"
              color="#9CA3AF"
            />
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
              <C_Icon
                name="mdi:plus"
                :size="16"
              />
            </template>
            {{ addText }}
          </NButton>
          <NButton @click="toggleExpandAll">
            <template #icon>
              <C_Icon
                name="mdi:file-tree"
                :size="16"
              />
            </template>
            {{ isAllExpanded ? '收起全部' : '展开全部' }}
          </NButton>
          <NButton
            v-if="refreshable"
            @click="handleRefresh"
          >
            <template #icon>
              <C_Icon
                name="mdi:refresh"
                :size="16"
              />
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
  import C_Icon from '@/components/global/C_Icon/index.vue'

  // 预设模式类型
  type TreeMode = 'menu' | 'file' | 'org' | 'custom'

  // 树节点状态类型
  type StatusType = 'success' | 'warning' | 'error' | 'info'

  // 按钮类型
  type ButtonType = 'primary' | 'info' | 'warning' | 'error' | 'default'

  // 基础树选项类型
  interface TreeOption {
    [key: string]: any
    id?: string | number
    key?: string | number
    label?: string
    children?: TreeOption[]
  }

  // 拖拽信息类型
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
    type?: string
    children?: TreeNodeData[]
  }

  // 状态配置类型 - 修复语法错误
  interface StatusConfig {
    field: string
    values: Record<
      string | number,
      {
        text: string
        type: StatusType
      }
    >
  }

  // 操作按钮配置
  interface ActionConfig {
    key: string
    text: string
    icon: string
    type?: ButtonType
    show?: (node: TreeNodeData) => boolean
    confirm?: string
  }

  // 图标配置类型
  interface IconConfig {
    default?: string
    typeMap?: Record<string, string>
    colorMap?: Record<string, string>
  }

  // Props定义
  interface Props {
    // 数据相关
    data: TreeNodeData[]
    mode?: TreeMode
    keyField?: string
    labelField?: string
    childrenField?: string

    // 搜索相关
    searchPattern?: string
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
    iconConfig?: IconConfig
    statusConfigs?: StatusConfig[]
    actions?: ActionConfig[]

    // 默认状态
    defaultExpandAll?: boolean
    defaultExpandedKeys?: (string | number)[]
    defaultSelectedKeys?: (string | number)[]
  }

  // 预设配置
  const presetConfigs: Record<TreeMode, Partial<Props>> = {
    menu: {
      draggable: true,
      showLine: true,
      iconConfig: {
        typeMap: {
          directory: 'mdi:folder',
          menu: 'mdi:file-document',
          button: 'mdi:button-cursor',
        },
        colorMap: {
          directory: '#1890ff',
          menu: '#52c41a',
          button: '#fa8c16',
        },
      },
      actions: [
        {
          key: 'add',
          text: '新增子菜单',
          icon: 'mdi:plus',
          type: 'primary',
        },
        {
          key: 'edit',
          text: '编辑',
          icon: 'mdi:pencil',
          type: 'info',
        },
        {
          key: 'delete',
          text: '删除',
          icon: 'mdi:delete',
          type: 'error',
          confirm: '确认删除该菜单吗？',
        },
      ],
    },
    file: {
      draggable: false,
      showLine: false,
      iconConfig: {
        typeMap: {
          folder: 'mdi:folder',
          file: 'mdi:file-document',
          image: 'mdi:file-image',
          video: 'mdi:file-video',
          audio: 'mdi:file-music',
        },
        colorMap: {
          folder: '#FFB020',
          file: '#666',
          image: '#52c41a',
          video: '#1890ff',
          audio: '#722ed1',
        },
      },
      actions: [
        {
          key: 'open',
          text: '打开',
          icon: 'mdi:folder-open',
          type: 'primary',
        },
        {
          key: 'rename',
          text: '重命名',
          icon: 'mdi:rename-box',
          type: 'info',
        },
        {
          key: 'delete',
          text: '删除',
          icon: 'mdi:delete',
          type: 'error',
          confirm: '确认删除该文件吗？',
        },
      ],
    },
    org: {
      draggable: false,
      showLine: true,
      iconConfig: {
        typeMap: {
          department: 'mdi:domain',
          user: 'mdi:account',
          manager: 'mdi:account-tie',
        },
        colorMap: {
          department: '#1890ff',
          user: '#52c41a',
          manager: '#fa8c16',
        },
      },
      actions: [
        {
          key: 'add',
          text: '新增下级',
          icon: 'mdi:plus',
          type: 'primary',
        },
        {
          key: 'edit',
          text: '编辑',
          icon: 'mdi:pencil',
          type: 'info',
        },
      ],
    },
    custom: {},
  }

  const props = withDefaults(defineProps<Props>(), {
    mode: 'custom',
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
    iconConfig: () => ({
      default: 'mdi:circle-outline',
      typeMap: {},
      colorMap: {},
    }),
    statusConfigs: () => [],
    actions: () => [],
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

  // 合并配置
  const mergedConfig = computed(() => {
    const preset = presetConfigs[props.mode] || {}
    return {
      ...preset,
      ...props,
      iconConfig: {
        ...preset.iconConfig,
        ...props.iconConfig,
      },
      actions: props.actions?.length ? props.actions : preset.actions || [],
    }
  })

  // 计算属性
  const treeData = computed((): TreeOption[] => {
    return props.data as TreeOption[]
  })

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

  // 获取节点图标
  const getNodeIcon = (node: TreeNodeData): string => {
    const config = mergedConfig.value.iconConfig!

    if (node[props.iconField || 'icon']) {
      return node[props.iconField || 'icon']
    }

    if (node.type && config.typeMap?.[node.type]) {
      return config.typeMap[node.type]
    }

    return config.default || 'mdi:circle-outline'
  }

  // 获取节点图标颜色
  const getNodeIconColor = (node: TreeNodeData): string => {
    const config = mergedConfig.value.iconConfig!

    if (node.type && config.colorMap?.[node.type]) {
      return config.colorMap[node.type]
    }

    return '#666'
  }

  // 渲染函数
  const renderPrefix = ({ option }: { option: TreeOption }) => {
    const node = option as TreeNodeData
    const iconName = getNodeIcon(node)
    const iconColor = getNodeIconColor(node)

    return h(C_Icon, {
      name: iconName,
      size: 18,
      color: iconColor,
      class: 'mr-3 flex-shrink-0',
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
    const actions = mergedConfig.value.actions || []

    const actionButtons = actions
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

        const iconEl = h(C_Icon, {
          name: action.icon,
          size: 12,
          title: action.text, // 直接使用 action.text 作为 tooltip
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
        } else {
          return h(NButton, buttonProps, {
            icon: () => iconEl,
          })
        }
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
