import { h } from 'vue'
import { NTag } from 'naive-ui/es'
import type {
  DataRecord,
  TableColumn,
  TestRecord,
  ChildData,
  DemoConfig,
} from '@/types/modules/table'

// ================= 配置相关 =================
export const defaultConfig: DemoConfig = {
  enableSelection: true,
  enableChildSelection: true,
  parentChildLinkMode: 'loose',
}

// ================= 测试数据 =================
export const tableData: TestRecord[] = [
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
]

export const mockChildData: Record<number, ChildData[]> = {
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

// ================= 表格列配置 =================
export const dataColumns: TableColumn<DataRecord>[] = [
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
]
