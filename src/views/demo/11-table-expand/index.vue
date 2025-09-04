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
          :scrollX="600"
        />
      </NCard>
    </NSpace>
  </div>
</template>

<script setup lang="ts">
  import { type DataTableRowKey, NSpin } from 'naive-ui/es'
  import type { VNodeChild } from 'vue'
  import type {
    DataRecord,
    TableColumn,
    TestRecord,
    ChildData,
    DemoConfig,
  } from '@/types/modules/table'
  import C_Table from '@/components/global/C_Table/index.vue'

  // 从 data.ts 导入数据
  import {
    defaultConfig,
    tableData,
    mockChildData,
    dataColumns,
    PROJECT_COLUMNS,
    REQUIREMENT_COLUMNS,
    SERVICE_COLUMNS,
  } from './data'

  // ================= 配置状态 =================
  const config = reactive<DemoConfig>({ ...defaultConfig })

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
    expandData: ChildData[],
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

    // 根据数据类型选择对应的列配置
    const firstItem = expandData[0]
    let childColumns: TableColumn<any>[]

    if (firstItem.project) {
      childColumns = PROJECT_COLUMNS
    } else if (firstItem.requirement) {
      childColumns = REQUIREMENT_COLUMNS
    } else if (firstItem.service) {
      childColumns = SERVICE_COLUMNS
    } else {
      // 默认列配置
      childColumns = [
        {
          title: '序号',
          key: '_index',
          width: 50,
          render: (_: any, index: number) => index + 1,
        },
        { key: 'status', title: '状态', width: 100 },
      ]
    }

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
        pagination: false,
        scrollX: 400,
      }),
    ])
  }

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
