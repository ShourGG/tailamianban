import { h } from 'vue'
import { NTag } from 'naive-ui/es'
import type {
  DataRecord,
  TableColumn,
  TestRecord,
  DemoConfig,
} from '@/types/modules/table'

// ================= 配置相关 =================
export const defaultConfig: DemoConfig = {
  enableSelection: true,
  enableChildSelection: true,
  parentChildLinkMode: 'loose',
}

// ================= 子表数据类型 =================
export interface ProjectChild {
  id: number
  project: string
  progress: string
  status: string
}

export interface RequirementChild {
  id: number
  requirement: string
  status: string
  priority: string
}

export interface ServiceChild {
  id: number
  service: string
  version: string
  status: string
}

// 联合类型，方便类型推断
export type ChildDataType = ProjectChild | RequirementChild | ServiceChild

// ================= 增强的测试记录类型 =================
export interface EnhancedTestRecord extends TestRecord {
  childData?: ChildDataType[] // 🔥 使用 childData 避免 NaiveUI 自动树形检测
}

// ================= 合并后的完整数据源 =================
export const tableData: EnhancedTestRecord[] = [
  {
    id: 1,
    name: '张三',
    department: '技术部',
    role: '前端工程师',
    status: '在职',
    hasChildren: true,
    childData: [
      { id: 101, project: '管理系统前端', progress: '80%', status: '进行中' },
      { id: 102, project: '移动应用开发', progress: '60%', status: '设计中' },
      { id: 103, project: '组件库建设', progress: '90%', status: '测试中' },
    ] as ProjectChild[],
  },
  {
    id: 2,
    name: '李四',
    department: '产品部',
    role: '产品经理',
    status: '在职',
    hasChildren: true,
    childData: [
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
    ] as RequirementChild[],
  },
  {
    id: 3,
    name: '王五',
    department: '设计部',
    role: 'UI设计师',
    status: '离职',
    hasChildren: false,
    childData: [], // 空数组表示无子数据
  },
  {
    id: 4,
    name: '赵六',
    department: '技术部',
    role: '后端工程师',
    status: '在职',
    hasChildren: true,
    childData: [
      { id: 401, service: 'API接口开发', version: 'v2.1', status: '已部署' },
      { id: 402, service: '数据库优化', version: 'v1.3', status: '测试中' },
    ] as ServiceChild[],
  },
]

// ================= 子表格列配置 =================
export const childColumnsConfig = {
  // 项目子表列
  project: [
    { type: 'index', title: '序号', width: 50 },
    { key: 'project', title: '项目名称', width: 150 },
    { key: 'progress', title: '进度', width: 100 },
    { key: 'status', title: '状态', width: 100 },
  ] as TableColumn[],

  // 需求子表列
  requirement: [
    { type: 'index', title: '序号', width: 50 },
    { key: 'requirement', title: '需求名称', width: 150 },
    { key: 'priority', title: '优先级', width: 100 },
    { key: 'status', title: '状态', width: 100 },
  ] as TableColumn[],

  // 服务子表列
  service: [
    { type: 'index', title: '序号', width: 50 },
    { key: 'service', title: '服务名称', width: 150 },
    { key: 'version', title: '版本', width: 100 },
    { key: 'status', title: '状态', width: 100 },
  ] as TableColumn[],
}

// ================= 子表格列配置获取函数 =================
/**
 * 根据子数据类型获取对应的列配置
 * @param childData 子数据项
 * @returns 对应的表格列配置
 */
export const getChildColumns = (
  childData: ChildDataType
): TableColumn<DataRecord>[] => {
  // 通过检查数据对象的属性来判断类型
  if ('project' in childData) {
    return childColumnsConfig.project as TableColumn<DataRecord>[]
  }
  if ('requirement' in childData) {
    return childColumnsConfig.requirement as TableColumn<DataRecord>[]
  }
  if ('service' in childData) {
    return childColumnsConfig.service as TableColumn<DataRecord>[]
  }

  // 默认返回项目列配置
  console.warn('无法识别子数据类型，使用默认项目列配置')
  return childColumnsConfig.project as TableColumn<DataRecord>[]
}

// ================= 主表格列配置 - 保持原样 =================
export const dataColumns: TableColumn[] = [
  // 序号列 - 直接定义，简单明了
  {
    type: 'index',
    title: '序号',
    width: 50,
  },
  // 选择列 - 由组件自动添加
  {
    type: 'selection',
  },
  // 展开列 - 由组件自动添加
  {
    type: 'expand',
  },
  // 数据列
  {
    key: 'name',
    title: '姓名',
    width: 120,
  },
  {
    key: 'department',
    title: '部门',
    width: 120,
  },
  {
    key: 'role',
    title: '角色',
    width: 150,
  },
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
