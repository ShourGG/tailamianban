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
        <C_Table
          ref="tableRef"
          :columns="dataColumns"
          :data="tableData"
          :rowKey="getRowKey"
          size="small"
          striped
          expandable
          :enableSelection="config.enableSelection"
          :enableChildSelection="config.enableChildSelection"
          :enableParentChildLink="
            config.enableSelection && config.enableChildSelection
          "
          :parentChildLinkMode="config.parentChildLinkMode"
          :onLoadExpandData="loadChildData"
          :renderExpandContent="renderExpandContent"
          :rowExpandable="isRowExpandable"
          :rowCheckable="isRowCheckable"
          :showRowActions="false"
        />
      </NCard>
    </NSpace>
  </div>
</template>

<script setup lang="ts">
  import { type DataTableRowKey } from 'naive-ui/es'
  import type { VNodeChild } from 'vue'
  import type {
    DataRecord,
    TableColumn,
    TestRecord,
    ChildData,
    DemoConfig,
  } from '@/types/modules/table'
  import C_Table from '@/components/global/C_Table/index.vue'

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
  const tableRef = ref()

  // ================= 工具函数 =================
  const getRowKey = (row: DataRecord): DataTableRowKey => (row as TestRecord).id
  const isRowExpandable = (row: DataRecord): boolean =>
    (row as TestRecord).hasChildren
  const isRowCheckable = (row: DataRecord): boolean =>
    (row as TestRecord).status === '在职'

  // ================= 数据加载 =================
  const loadChildData = async (row: DataRecord): Promise<ChildData[]> => {
    const testRow = row as TestRecord
    try {
      // 模拟异步加载
      await new Promise(resolve => setTimeout(resolve, 300))
      const data = mockChildData[testRow.id] || []
      return data
    } catch (error) {
      console.error('加载子数据失败:', error)
      return []
    }
  }

  // ================= 展开渲染逻辑 =================
  const renderExpandContent = (
    row: DataRecord,
    expandData: ChildData[], // 使用具体的类型
    loading: boolean
  ): VNodeChild => {
    const testRow = row as TestRecord

    // 加载中状态
    if (loading) {
      return h('div', { class: 'flex justify-center items-center py-4' }, [
        h(NSpin, { size: 'small' }),
        h('span', { class: 'ml-2' }, '加载中...'),
      ])
    }

    // 空数据状态
    if (!expandData || !expandData.length) {
      return h('div', { class: 'text-center py-4 text-gray-400' }, '暂无数据')
    }

    // 构建子表格列配置
    const childColumns: TableColumn<ChildData>[] = [
      {
        title: '序号',
        key: '_index',
        width: 60,
        render: (_: ChildData, index: number) => index + 1,
      },
    ]

    // 动态添加数据列
    const firstItem = expandData[0]
    if (firstItem.project) {
      childColumns.push(
        { key: 'project', title: '项目名称', width: 150 },
        { key: 'progress', title: '进度', width: 100 }
      )
    } else if (firstItem.requirement) {
      childColumns.push(
        { key: 'requirement', title: '需求名称', width: 150 },
        { key: 'priority', title: '优先级', width: 100 }
      )
    } else if (firstItem.service) {
      childColumns.push(
        { key: 'service', title: '服务名称', width: 150 },
        { key: 'version', title: '版本', width: 100 }
      )
    }

    childColumns.push({ key: 'status', title: '状态', width: 100 })

    return h('div', { class: 'p-4 bg-gray-50' }, [
      h(
        'div',
        { class: 'mb-2 text-sm text-gray-600' },
        `${testRow.name} 的详细信息 (${expandData.length} 条)`
      ),
      h(C_Table, {
        data: expandData,
        columns: childColumns as TableColumn<DataRecord>[],
        size: 'small',
        striped: true,
        rowKey: (child: DataRecord) => (child as ChildData).id,
        enableSelection: config.enableChildSelection,
        showRowActions: false,
      }),
    ])
  }

  // ================= 表格列配置 =================
  const dataColumns = computed<TableColumn<DataRecord>[]>(() => [
    {
      title: '序号',
      key: '_index',
      width: 60,
      render: (_: DataRecord, index: number) => index + 1,
    },
    { key: 'name', title: '姓名', width: 120 },
    { key: 'department', title: '部门', width: 120 },
    { key: 'role', title: '角色', width: 150 },
    {
      key: 'status',
      title: '状态',
      width: 100,
      render: (row: DataRecord) => {
        const testRow = row as TestRecord
        return h(
          NTag,
          {
            type: testRow.status === '在职' ? 'success' : 'error',
            size: 'small',
          },
          () => testRow.status
        )
      },
    },
  ])

  // ================= 操作方法 =================
  const handleExpandAll = () => {
    tableRef.value?.expandAll()
  }

  const handleCollapseAll = () => {
    tableRef.value?.collapseAll()
  }

  const handleSelectAll = () => {
    tableRef.value?.selectAll()
  }

  const handleClearSelection = () => {
    tableRef.value?.clearSelection()
  }

  const handleClearAllSelections = () => {
    tableRef.value?.clearAllSelections()
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
