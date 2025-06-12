<!-- src/views/demo/10-table/index.vue -->
<template>
  <div class="table-demo-page">
    <n-card title="C_Table 组件演示">
      <n-space
        vertical
        :size="20"
      >
        <!-- 功能说明 -->
        <n-alert
          type="info"
          title="功能说明"
        >
          <ul class="list-disc list-inside">
            <li>行内编辑：点击"编辑"按钮，整行变为可编辑状态</li>
            <li
              >单元格编辑：点击单元格右侧的编辑图标，单个单元格变为可编辑状态</li
            >
            <li>支持不同的输入类型：文本、数字、日期、下拉选择等</li>
          </ul>
        </n-alert>

        <!-- 表格组件 -->
        <C_Table
          ref="tableRef"
          v-model:data="tableData"
          :columns="columns"
          :loading="loading"
          :row-actions="rowActions"
          edit-mode="both"
          @save="handleSave"
          @cancel="handleCancel"
        />
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
  // 正确的导入路径 - 使用别名或相对路径
  // 或者使用相对路径：
  // import CTable from '../../../components/global/C_table/index.vue'
  import type {
    TableColumn,
    RowAction,
  } from '@/components/global/C_table/types/table'

  const message = useMessage()
  const loading = ref(false)
  const tableRef = ref()

  // 模拟数据
  const tableData = ref([
    {
      id: 1,
      name: '张三',
      age: 28,
      gender: 'male',
      email: 'zhangsan@example.com',
      department: 'tech',
      joinDate: new Date('2022-01-15').getTime(),
      status: 'active',
    },
    {
      id: 2,
      name: '李四',
      age: 32,
      gender: 'female',
      email: 'lisi@example.com',
      department: 'hr',
      joinDate: new Date('2021-06-20').getTime(),
      status: 'active',
    },
  ])

  // 列配置
  const columns: TableColumn[] = [
    {
      key: 'name',
      title: '姓名',
      width: 120,
      editable: true,
      editType: 'input',
    },
    {
      key: 'age',
      title: '年龄',
      width: 100,
      editable: true,
      editType: 'number',
      editProps: {
        min: 18,
        max: 65,
      },
    },
    {
      key: 'gender',
      title: '性别',
      width: 100,
      editable: true,
      editType: 'select',
      editProps: {
        options: [
          { label: '男', value: 'male' },
          { label: '女', value: 'female' },
        ],
      },
      render: row => (row.gender === 'male' ? '男' : '女'),
    },
    {
      key: 'email',
      title: '邮箱',
      width: 200,
      editable: true,
      editType: 'input',
    },
    {
      key: 'department',
      title: '部门',
      width: 120,
      editable: true,
      editType: 'select',
      editProps: {
        options: [
          { label: '技术部', value: 'tech' },
          { label: '人事部', value: 'hr' },
        ],
      },
    },
    {
      key: 'joinDate',
      title: '入职日期',
      width: 140,
      editable: true,
      editType: 'date',
      render: row => {
        return row.joinDate ? new Date(row.joinDate).toLocaleDateString() : '-'
      },
    },
    {
      key: 'status',
      title: '状态',
      width: 100,
      editable: false,
      render: row => (row.status === 'active' ? '在职' : '离职'),
    },
  ]

  // 行操作
  const rowActions: RowAction[] = [
    {
      label: '查看',
      icon: 'i-carbon-view',
      type: 'info',
      onClick: row => {
        message.info(`查看员工：${row.name}`)
      },
    },
    {
      label: '删除',
      icon: 'i-carbon-trash-can',
      type: 'error',
      onClick: (row, index) => {
        tableData.value.splice(index, 1)
        message.success('删除成功')
      },
    },
  ]

  // 保存处理
  const handleSave = async (
    rowData: any,
    rowIndex: number,
    columnKey?: string
  ) => {
    loading.value = true
    // 模拟异步保存
    await new Promise(resolve => setTimeout(resolve, 1000))
    loading.value = false

    if (columnKey) {
      message.success(
        `已保存字段：${columns.find(c => c.key === columnKey)?.title}`
      )
    } else {
      message.success('已保存整行数据')
    }
  }

  // 取消处理
  const handleCancel = () => {
    message.info('已取消编辑')
  }
</script>

<style scoped>
  .table-demo-page {
    padding: 20px;
  }
</style>
