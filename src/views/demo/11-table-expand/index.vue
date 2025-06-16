<template>
  <div class="nested-demo-page">
    <NH1>嵌套表格场景示例</NH1>

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
          <NCheckbox v-model:checked="config.enableSelection">
            启用父表格选择
          </NCheckbox>
          <NCheckbox v-model:checked="config.enableChildSelection">
            启用子表格选择
          </NCheckbox>
          <NRadioGroup
            v-model:value="config.parentChildLinkMode"
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
              @click="handleExpandAll"
              type="primary"
              size="small"
            >
              全部展开
            </NButton>
            <NButton
              @click="handleCollapseAll"
              size="small"
            >
              全部折叠
            </NButton>
          </NButtonGroup>
          <NButtonGroup v-if="config.enableSelection">
            <NButton
              @click="handleSelectAll"
              type="success"
              size="small"
            >
              父表格全选
            </NButton>
            <NButton
              @click="handleClearSelection"
              size="small"
            >
              父表格清空
            </NButton>
          </NButtonGroup>
          <NButton
            v-if="config.enableSelection || config.enableChildSelection"
            @click="handleClearAllSelections"
            type="error"
            size="small"
          >
            清空所有选择
          </NButton>
        </NSpace>
      </NCard>

      <!-- 主表格 -->
      <NCard title="主数据表格">
        <NDataTable
          :columns="tableColumns"
          :data="tableData"
          :row-key="getRowKey"
          :expanded-row-keys="expandedKeys"
          :checked-row-keys="checkedKeys"
          size="small"
          striped
          @update:expanded-row-keys="handleExpandChange"
          @update:checked-row-keys="handleSelectionChange"
        />
      </NCard>
    </NSpace>
  </div>
</template>

<script setup lang="ts">
  import {
    type DataTableRowKey,
    NSpace,
    NCard,
    NCheckbox,
    NRadioGroup,
    NRadio,
    NButtonGroup,
    NButton,
    NTag,
    NDataTable,
    NH1,
    NSpin,
  } from 'naive-ui/es'

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

  interface DemoConfig {
    enableSelection: boolean
    enableChildSelection: boolean
    parentChildLinkMode: 'strict' | 'loose'
  }

  // ================= 配置状态 =================
  const config = reactive<DemoConfig>({
    enableSelection: true,
    enableChildSelection: true,
    parentChildLinkMode: 'loose',
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

  // ================= 状态管理 =================
  const expandedKeys = ref<DataTableRowKey[]>([])
  const checkedKeys = ref<DataTableRowKey[]>([])
  const childSelections = ref(new Map<DataTableRowKey, DataTableRowKey[]>())
  const expandDataMap = ref(new Map<DataTableRowKey, ChildData[]>())
  const loadingMap = ref(new Map<DataTableRowKey, boolean>())

  // ================= 工具函数 =================
  const getRowKey = (row: TestRecord): DataTableRowKey => row.id

  const getChildRowKey = (child: ChildData): DataTableRowKey => child.id

  // ================= 父子联动逻辑 =================
  const updateParentSelection = (
    parentKey: DataTableRowKey,
    childKeys: DataTableRowKey[],
    totalChildren: number
  ) => {
    if (!config.enableSelection || !config.enableChildSelection) return

    const shouldSelect =
      config.parentChildLinkMode === 'strict'
        ? childKeys.length === totalChildren && totalChildren > 0
        : childKeys.length > 0

    const currentKeys = checkedKeys.value
    const isSelected = currentKeys.includes(parentKey)

    if (shouldSelect && !isSelected) {
      checkedKeys.value = [...currentKeys, parentKey]
    } else if (!shouldSelect && isSelected) {
      checkedKeys.value = currentKeys.filter((k: any) => k !== parentKey)
    }
  }

  const handleChildSelectionChange = (
    parentKey: DataTableRowKey,
    keys: DataTableRowKey[]
  ) => {
    childSelections.value.set(parentKey, keys)
    const expandData = expandDataMap.value.get(parentKey) || []
    updateParentSelection(parentKey, keys, expandData.length)
  }

  // ================= 数据加载 =================
  const loadChildData = async (row: TestRecord): Promise<ChildData[]> => {
    const key = row.id

    if (expandDataMap.value.has(key)) {
      return expandDataMap.value.get(key)!
    }

    loadingMap.value.set(key, true)

    try {
      // 模拟异步加载
      await new Promise(resolve => setTimeout(resolve, 300))
      const data = mockChildData[row.id] || []
      expandDataMap.value.set(key, data)

      // 初始化子选择状态
      if (config.enableChildSelection && !childSelections.value.has(key)) {
        childSelections.value.set(key, [])
      }

      return data
    } catch (error) {
      console.error('加载子数据失败:', error)
      return []
    } finally {
      loadingMap.value.set(key, false)
    }
  }

  // ================= 展开渲染逻辑 =================
  const createSpinView = () => {
    return h('div', { class: 'flex justify-center items-center py-4' }, [
      h(NSpin, { size: 'small' }),
      h('span', { class: 'ml-2' }, '加载中...'),
    ])
  }

  const createEmptyView = () => {
    return h('div', { class: 'text-center py-4 text-gray-400' }, '暂无数据')
  }

  const createChildTable = (
    key: DataTableRowKey,
    row: TestRecord,
    expandData: ChildData[]
  ) => {
    const selectedChildKeys = childSelections.value.get(key) || []
    const columns: any[] = []

    if (config.enableChildSelection) {
      columns.push({ type: 'selection', multiple: true })
    }

    columns.push(
      {
        title: '序号',
        key: '_index',
        width: 60,
        render: (_: any, index: number) => index + 1,
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
      { key: 'status', title: '状态', width: 100 }
    )

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
        checkedRowKeys: selectedChildKeys,
        rowKey: getChildRowKey,
        onUpdateCheckedRowKeys: config.enableChildSelection
          ? (keys: DataTableRowKey[]) => handleChildSelectionChange(key, keys)
          : undefined,
      }),
    ])
  }

  const renderExpand = (row: TestRecord) => {
    const key = row.id
    const expandData = expandDataMap.value.get(key) || []
    const loading = loadingMap.value.get(key) || false

    // 确保数据已加载
    if (!expandDataMap.value.has(key) && !loading) {
      loadChildData(row)
    }

    if (loading) return createSpinView()
    if (!expandData.length) return createEmptyView()
    return createChildTable(key, row, expandData)
  }

  // ================= 表格列配置 =================
  const tableColumns = computed(() => {
    const columns: any[] = []

    // 选择列
    if (config.enableSelection) {
      columns.push({
        type: 'selection',
        disabled: (row: TestRecord) => row.status !== '在职',
        multiple: true,
      })
    }

    // 展开列
    columns.push({
      type: 'expand',
      expandable: (row: TestRecord) => row.hasChildren,
      renderExpand,
    })

    // 数据列
    columns.push(
      {
        title: '序号',
        key: '_index',
        width: 60,
        render: (_: any, index: number) => index + 1,
      },
      { key: 'name', title: '姓名', width: 120 },
      { key: 'department', title: '部门', width: 120 },
      { key: 'role', title: '角色', width: 150 },
      {
        key: 'status',
        title: '状态',
        width: 100,
        render: (row: TestRecord) =>
          h(
            NTag,
            {
              type: row.status === '在职' ? 'success' : 'error',
              size: 'small',
            },
            () => row.status
          ),
      }
    )

    return columns
  })

  // ================= 事件处理 =================
  const handleExpandChange = (keys: DataTableRowKey[]) => {
    expandedKeys.value = keys
  }

  const handleSelectionChange = (keys: DataTableRowKey[]) => {
    checkedKeys.value = keys
  }

  // ================= 操作方法 =================
  const handleExpandAll = async () => {
    const expandableRows = tableData.value.filter(row => row.hasChildren)
    await Promise.allSettled(expandableRows.map(loadChildData))
    expandedKeys.value = expandableRows.map(row => row.id)
  }

  const handleCollapseAll = () => {
    expandedKeys.value = []
    childSelections.value.clear()
  }

  const handleSelectAll = () => {
    const selectableRows = tableData.value.filter(row => row.status === '在职')
    checkedKeys.value = selectableRows.map(row => row.id)
  }

  const handleClearSelection = () => {
    checkedKeys.value = []
  }

  const handleClearAllSelections = () => {
    checkedKeys.value = []
    childSelections.value.clear()
  }
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
</style>
