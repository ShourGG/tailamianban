<template>
  <div class="nested-demo-page">
    <NH1>嵌套表格选择场景示例</NH1>

    <NSpace
      vertical
      size="large"
    >
      <!-- 功能配置 -->
      <NCard
        title="功能配置"
        size="small"
      >
        <NSpace>
          <NCheckbox
            v-model:checked="config.enableSelection"
            @update:checked="reinitialize"
          >
            启用父表格选择
          </NCheckbox>
          <NCheckbox
            v-model:checked="config.enableChildSelection"
            @update:checked="reinitialize"
          >
            启用子表格选择
          </NCheckbox>
          <NRadioGroup
            v-model:value="config.parentChildLinkMode"
            @update:value="onModeChange"
            :disabled="!config.enableSelection || !config.enableChildSelection"
          >
            <NSpace>
              <NRadio value="strict">严格模式（子表格全选才选中父行）</NRadio>
              <NRadio value="loose">宽松模式（子表格有选中就选中父行）</NRadio>
            </NSpace>
          </NRadioGroup>
        </NSpace>
      </NCard>

      <!-- 操作工具栏 -->
      <NCard
        title="批量操作"
        size="small"
      >
        <NSpace>
          <NButtonGroup>
            <NButton
              @click="expandAll"
              type="primary"
              size="small"
              >全部展开</NButton
            >
            <NButton
              @click="collapseAll"
              size="small"
              >全部折叠</NButton
            >
          </NButtonGroup>
          <NButtonGroup v-if="config.enableSelection">
            <NButton
              @click="selectAll"
              type="success"
              size="small"
              >父表格全选</NButton
            >
            <NButton
              @click="clearSelection"
              size="small"
              >父表格清空</NButton
            >
          </NButtonGroup>
          <NButton
            v-if="config.enableSelection || config.enableChildSelection"
            @click="clearAllSelections"
            type="error"
            size="small"
          >
            清空所有选择
          </NButton>
        </NSpace>
      </NCard>

      <!-- 统计信息 -->
      <NCard
        title="实时统计"
        size="small"
      >
        <NGrid
          cols="2 s:3 m:6"
          responsive="screen"
        >
          <NGridItem>
            <NStatistic
              label="总行数"
              :value="tableData.length"
            />
          </NGridItem>
          <NGridItem>
            <NStatistic
              label="已展开行"
              :value="expandedKeys.length"
            />
          </NGridItem>
          <NGridItem v-if="config.enableSelection">
            <NStatistic
              label="父表格已选"
              :value="selectedRowsCount || 0"
            />
          </NGridItem>
          <NGridItem v-if="config.enableChildSelection">
            <NStatistic
              label="子表格已选"
              :value="totalChildSelections"
            />
          </NGridItem>
        </NGrid>
      </NCard>

      <!-- 主表格 -->
      <NCard title="主数据表格">
        <NDataTable
          :columns="tableColumns"
          :data="tableData"
          :row-key="getRowKey"
          :checked-row-keys="checkedKeys"
          :expanded-row-keys="expandedKeys"
          @update:checked-row-keys="handleSelectionChange"
          @update:expanded-row-keys="handleExpandChange"
          size="small"
          striped
        />
      </NCard>

      <!-- 选中数据汇总 -->
      <NCard
        v-if="hasAnySelection"
        title="选中数据汇总"
        size="small"
      >
        <NSpace vertical>
          <!-- 父表格选中数据 -->
          <div v-if="config.enableSelection && selectedParentRows.length > 0">
            <h4 class="text-sm font-medium mb-2 text-green-600">
              父表格选中 ({{ selectedParentRows.length }} 项)
            </h4>
            <NSpace>
              <NTag
                v-for="row in selectedParentRows"
                :key="row.id"
                type="success"
                closable
                @close="removeParentSelection(row.id)"
              >
                {{ row.name }} - {{ row.department }}
                <template v-if="expandedKeys.includes(row.id)"> ✓</template>
              </NTag>
            </NSpace>
          </div>

          <!-- 子表格选中数据 -->
          <div
            v-if="
              config.enableChildSelection && selectedChildRowsData.length > 0
            "
          >
            <h4 class="text-sm font-medium mb-2 text-blue-600">
              子表格选中 ({{ totalChildSelections }} 项)
            </h4>
            <NSpace
              vertical
              size="small"
            >
              <div
                v-for="group in selectedChildRowsData"
                :key="group.parentKey"
                class="p-3 bg-blue-50 rounded border border-blue-200"
              >
                <div class="text-xs text-blue-600 mb-2">
                  {{ group.parentName }} 的子数据 ({{ group.children.length }}
                  项):
                </div>
                <NSpace size="small">
                  <NTag
                    v-for="child in group.children"
                    :key="child.id"
                    type="info"
                    size="small"
                    closable
                    @close="removeChildSelection(group.parentKey, child.id)"
                  >
                    {{ getChildDisplayName(child) }}
                  </NTag>
                </NSpace>
              </div>
            </NSpace>
          </div>

          <!-- 操作统计 -->
          <div
            class="flex justify-between items-center pt-3 border-t border-gray-200"
          >
            <NTag type="warning">
              总计: {{ getTotalSelectionCount() }} 项数据
            </NTag>
          </div>
        </NSpace>
      </NCard>
    </NSpace>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, h, reactive } from 'vue'
  import type { DataTableRowKey } from 'naive-ui'
  import {
    NSpace,
    NCard,
    NCheckbox,
    NRadioGroup,
    NRadio,
    NButtonGroup,
    NButton,
    NGrid,
    NGridItem,
    NStatistic,
    NTag,
    NDataTable,
    NSpin,
    NH1,
  } from 'naive-ui'
  import type { TableColumn } from '@/types/modules/table'
  import { useTableExpand } from '@/composables/Table/useTableExpand'

  // ================= 类型定义 =================
  interface TestRecord {
    id: number
    name: string
    department: string
    role: string
    status: string
    hasChildren: boolean
  }

  interface ChildData {
    id: number
    project?: string
    requirement?: string
    service?: string
    progress?: string
    status: string
    priority?: string
    version?: string
  }

  interface SelectedChildGroup {
    parentKey: number
    parentName: string
    children: ChildData[]
  }

  type LinkMode = 'strict' | 'loose'

  // ================= 配置状态 =================
  const config = reactive({
    enableSelection: true,
    enableChildSelection: true,
    parentChildLinkMode: 'loose' as LinkMode,
  })

  // ================= 测试数据 =================
  const tableData = ref<TestRecord[]>([
    {
      id: 1,
      name: '张三',
      department: '技术部',
      role: '前端工程师',
      status: '在职',
      hasChildren: true,
    },
    {
      id: 2,
      name: '李四',
      department: '产品部',
      role: '产品经理',
      status: '在职',
      hasChildren: true,
    },
    {
      id: 3,
      name: '王五',
      department: '设计部',
      role: 'UI设计师',
      status: '离职',
      hasChildren: false,
    },
    {
      id: 4,
      name: '赵六',
      department: '技术部',
      role: '后端工程师',
      status: '在职',
      hasChildren: true,
    },
  ])

  const mockChildData: Record<number, ChildData[]> = {
    1: [
      { id: 101, project: '管理系统前端', progress: '80%', status: '进行中' },
      { id: 102, project: '移动应用开发', progress: '60%', status: '设计中' },
      { id: 103, project: '组件库建设', progress: '90%', status: '测试中' },
    ],
    2: [
      {
        id: 201,
        requirement: '用户需求调研',
        status: '已完成',
        priority: '高',
      },
      {
        id: 202,
        requirement: '竞品分析报告',
        status: '进行中',
        priority: '中',
      },
      {
        id: 203,
        requirement: '原型设计评审',
        status: '待开始',
        priority: '高',
      },
    ],
    4: [
      { id: 401, service: 'API接口开发', version: 'v2.1', status: '已部署' },
      { id: 402, service: '数据库优化', version: 'v1.3', status: '测试中' },
    ],
  }

  // ================= 工具函数 =================
  const getRowKey = (row: TestRecord): DataTableRowKey => row.id

  const getChildDisplayName = (child: ChildData): string => {
    return (
      child.project || child.requirement || child.service || `项目-${child.id}`
    )
  }

  // ================= 父子联动逻辑 =================
  const handleParentChildLink = (
    parentId: number,
    selectedChildKeys: DataTableRowKey[],
    totalChildren: number
  ) => {
    if (!config.enableSelection || !tableFeatures.checkedKeys) return

    const shouldSelectParent =
      config.parentChildLinkMode === 'strict'
        ? selectedChildKeys.length === totalChildren && totalChildren > 0
        : selectedChildKeys.length > 0

    const currentKeys = tableFeatures.checkedKeys.value
    const isParentSelected = currentKeys.includes(parentId)

    if (shouldSelectParent && !isParentSelected) {
      tableFeatures.checkedKeys.value = [...currentKeys, parentId]
    } else if (!shouldSelectParent && isParentSelected) {
      tableFeatures.checkedKeys.value = currentKeys.filter(k => k !== parentId)
    }
  }

  // ================= 子表格渲染器 =================
  const createChildTableRenderer = (
    row: TestRecord,
    expandData: ChildData[],
    loading: boolean,
    childSelection: { selectedKeys: DataTableRowKey[] }
  ) => {
    if (loading) {
      return h('div', { class: 'flex justify-center items-center py-4' }, [
        h(NSpin, { size: 'small' }),
        h('span', { class: 'ml-2' }, '加载中...'),
      ])
    }

    if (!expandData.length) {
      return h('div', { class: 'text-center py-4 text-gray-400' }, '暂无数据')
    }

    const columns = [
      ...(config.enableChildSelection
        ? [{ type: 'selection' as const, multiple: true }]
        : []),
      {
        title: '序号',
        key: '_index',
        width: 60,
        render: (_: ChildData, index: number) => index + 1,
      },
      {
        key: expandData[0].project
          ? 'project'
          : expandData[0].requirement
            ? 'requirement'
            : 'service',
        title: '名称',
        width: 150,
      },
      { key: 'status', title: '状态', width: 100 },
    ]

    return h('div', { class: 'p-4 bg-gray-50' }, [
      h(
        'div',
        { class: 'mb-2 text-sm text-gray-600' },
        `${row.name} 的详细信息 (${expandData.length} 条)`
      ),
      h(NDataTable, {
        data: expandData,
        columns,
        size: 'small',
        striped: true,
        checkedRowKeys: childSelection?.selectedKeys || [],
        rowKey: (child: ChildData) => child.id,
        onUpdateCheckedRowKeys: config.enableChildSelection
          ? (keys: DataTableRowKey[]) => {
              tableFeatures.childSelections?.value.set(row.id, keys)

              const selectedRows = expandData.filter(child =>
                keys.includes(child.id)
              )
              tableFeatures.onChildSelectionChange?.(row.id, keys, selectedRows)
              handleParentChildLink(row.id, keys, expandData.length)
            }
          : undefined,
      }),
    ])
  }

  // ================= 表格功能初始化 =================
  let tableFeatures = useTableExpand({
    data: tableData,
    rowKey: getRowKey,
    childRowKey: (child: ChildData) => child.id,
    defaultExpandedKeys: [1],
    enableSelection: config.enableSelection,
    enableChildSelection: config.enableChildSelection,

    onLoadData: async (row: TestRecord): Promise<ChildData[]> => {
      await new Promise(resolve => setTimeout(resolve, 500))
      return mockChildData[row.id] || []
    },

    onSelectionChange: (keys: DataTableRowKey[]) => {
      console.log('父表格选择变更:', keys.length, '行')
    },

    onChildSelectionChange: (
      parentKey: DataTableRowKey,
      childKeys: DataTableRowKey[]
    ) => {
      console.log('子表格选择变更:', childKeys.length, '项')
    },

    rowCheckable: (row: TestRecord) => row.status === '在职',
    childRowCheckable: () => true,
    maxSelection: 4,
    renderContent: createChildTableRenderer,
  })

  // ================= 响应式解构 =================
  const {
    expandedKeys,
    expandAll,
    collapseAll,
    checkedKeys,
    selectedRowsCount,
    selectAll,
    clearSelection,
    clearAllSelections,
    childSelections,
    getTableColumns,
    handleSelectionChange,
    handleExpandChange,
  } = tableFeatures

  // ================= 计算属性 =================
  const totalChildSelections = computed(() => {
    if (!config.enableChildSelection || !childSelections) return 0
    return Array.from(childSelections.value.values()).reduce(
      (total, keys) => total + keys.length,
      0
    )
  })

  const selectedParentRows = computed(() => {
    if (!config.enableSelection || !checkedKeys) return []
    return tableData.value.filter(row => checkedKeys.value.includes(row.id))
  })

  const selectedChildRowsData = computed((): SelectedChildGroup[] => {
    if (!config.enableChildSelection || !childSelections) return []

    return Array.from(childSelections.value.entries())
      .filter(([_, selectedKeys]) => selectedKeys.length > 0)
      .map(([parentKey, selectedKeys]) => {
        const parentRow = tableData.value.find(row => row.id === parentKey)
        const childData = mockChildData[parentKey] || []
        const selectedChildren = childData.filter(child =>
          selectedKeys.includes(child.id)
        )

        return {
          parentKey: parentKey as number,
          parentName: parentRow?.name || `ID:${parentKey}`,
          children: selectedChildren,
        }
      })
      .filter(group => group.children.length > 0)
  })

  const hasAnySelection = computed(() => {
    return (
      (config.enableSelection && selectedParentRows.value.length > 0) ||
      (config.enableChildSelection && totalChildSelections.value > 0)
    )
  })

  // ================= 操作方法 =================
  const removeParentSelection = (parentId: number) => {
    if (tableFeatures.checkedKeys) {
      tableFeatures.checkedKeys.value = tableFeatures.checkedKeys.value.filter(
        k => k !== parentId
      )
    }
  }

  const removeChildSelection = (parentKey: number, childId: number) => {
    if (tableFeatures.childSelections) {
      const currentSelection =
        tableFeatures.childSelections.value.get(parentKey) || []
      const newSelection = currentSelection.filter(k => k !== childId)
      tableFeatures.childSelections.value.set(parentKey, newSelection)

      const totalChildren = mockChildData[parentKey]?.length || 0
      handleParentChildLink(parentKey, newSelection, totalChildren)
    }
  }

  const getTotalSelectionCount = (): number => {
    const parentCount = config.enableSelection
      ? selectedParentRows.value.length
      : 0
    const childCount = config.enableChildSelection
      ? totalChildSelections.value
      : 0
    return parentCount + childCount
  }

  const onModeChange = (newMode: LinkMode) => {
    config.parentChildLinkMode = newMode

    if (
      config.enableSelection &&
      config.enableChildSelection &&
      tableFeatures.childSelections
    ) {
      tableFeatures.childSelections.value.forEach(
        (selectedChildKeys, parentKey) => {
          const parentRow = tableData.value.find(row => row.id === parentKey)
          if (
            parentRow &&
            tableFeatures.expandedKeys.value.includes(parentKey)
          ) {
            const totalChildren =
              mockChildData[parentKey as number]?.length || 0
            handleParentChildLink(
              parentKey as number,
              selectedChildKeys,
              totalChildren
            )
          }
        }
      )
    }
  }

  const reinitialize = () => {
    const currentExpanded = tableFeatures.expandedKeys?.value || []
    const currentSelected = tableFeatures.checkedKeys?.value || []

    tableFeatures = useTableExpand({
      data: tableData,
      rowKey: getRowKey,
      childRowKey: (child: ChildData) => child.id,
      defaultExpandedKeys: currentExpanded,
      enableSelection: config.enableSelection,
      enableChildSelection: config.enableChildSelection,
      defaultCheckedKeys: config.enableSelection ? currentSelected : [],

      onLoadData: async (row: TestRecord): Promise<ChildData[]> => {
        await new Promise(resolve => setTimeout(resolve, 500))
        return mockChildData[row.id] || []
      },

      rowCheckable: (row: TestRecord) => row.status === '在职',
      childRowCheckable: () => true,
      maxSelection: 4,
      renderContent: createChildTableRenderer,
    })
  }

  // ================= 表格列配置 =================
  const baseColumns: TableColumn<TestRecord>[] = [
    {
      title: '序号',
      key: '_index',
      width: 60,
      render: (_, index) => index + 1,
    },
    { key: 'name', title: '姓名', width: 120 },
    { key: 'department', title: '部门', width: 120 },
    { key: 'role', title: '角色', width: 150 },
    {
      key: 'status',
      title: '状态',
      width: 100,
      render: row =>
        h(
          NTag,
          {
            type: row.status === '在职' ? 'success' : 'error',
            size: 'small',
          },
          () => row.status
        ),
    },
  ]

  const tableColumns = computed(() => getTableColumns(baseColumns))
</script>

<style scoped>
  .nested-demo-page {
    padding: 24px;
    background: #f5f5f5;
    min-height: 100vh;
  }

  :deep(.n-card) {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  h4 {
    margin: 0;
    padding: 0;
  }
</style>
