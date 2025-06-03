import type { FormOption, LayoutType } from '@/types/modules/form'
import { PRESET_RULES, RULE_COMBOS } from '@/utils/v_verify'

// 类型定义
export type ContainerType = 'modal' | 'drawer' | 'sidebar' | 'popover'

export interface ContainerCard {
  key: ContainerType
  title: string
  description: string
  icon: string
  tagType: 'default' | 'error' | 'info' | 'success' | 'warning'
  features: string[]
  actionText: string
  actionIcon: string
  fields: number
  layout: string
  complexity: number
}

export interface PrincipleItem {
  label: string
  desc: string
}

export interface Principle {
  key: string
  title: string
  icon: string
  items: PrincipleItem[]
}

export interface PerformanceStat {
  key: string
  label: string
  value: number
  unit: string
  icon: string
  color: string
}

// 布局类型映射
export const layoutTypes: Record<ContainerType, LayoutType> = {
  modal: 'grid',
  drawer: 'default',
  sidebar: 'default',
  popover: 'inline',
}

// 表单配置
export const formOptions: Record<ContainerType, FormOption[]> = {
  modal: [
    {
      type: 'input',
      prop: 'username',
      label: '用户名',
      placeholder: '请输入用户名',
      rules: RULE_COMBOS.username('用户名'),
    },
    {
      type: 'input',
      prop: 'email',
      label: '邮箱',
      placeholder: '请输入邮箱地址',
      rules: RULE_COMBOS.email('邮箱'),
    },
    {
      type: 'select',
      prop: 'role',
      label: '角色',
      placeholder: '请选择角色',
      children: [
        { value: 'admin', label: '管理员' },
        { value: 'user', label: '普通用户' },
        { value: 'guest', label: '访客' },
      ],
      rules: [PRESET_RULES.required('角色')],
    },
    {
      type: 'input',
      prop: 'phone',
      label: '手机号',
      placeholder: '请输入手机号',
      rules: RULE_COMBOS.mobile('手机号'),
    },
  ],
  drawer: [
    {
      type: 'input',
      prop: 'productName',
      label: '商品名称',
      placeholder: '请输入商品名称',
      rules: [PRESET_RULES.required('商品名称')],
    },
    {
      type: 'textarea',
      prop: 'description',
      label: '商品描述',
      placeholder: '请输入商品描述',
      attrs: { rows: 4 },
    },
    {
      type: 'inputNumber',
      prop: 'price',
      label: '价格',
      placeholder: '请输入价格',
      attrs: { min: 0, precision: 2 },
      rules: [
        PRESET_RULES.required('价格'),
        PRESET_RULES.range('价格', 0.01, 999999.99),
      ],
    },
    {
      type: 'select',
      prop: 'category',
      label: '分类',
      placeholder: '请选择分类',
      children: [
        { value: 'electronics', label: '电子产品' },
        { value: 'clothing', label: '服装' },
        { value: 'books', label: '图书' },
      ],
      rules: [PRESET_RULES.required('分类')],
    },
    {
      type: 'switch',
      prop: 'isPublished',
      label: '是否发布',
      value: false,
    },
    {
      type: 'switch',
      prop: 'allowReturns',
      label: '允许退货',
      value: true,
    },
  ],
  sidebar: [
    {
      type: 'input',
      prop: 'keyword',
      label: '关键词',
      placeholder: '搜索关键词',
    },
    {
      type: 'select',
      prop: 'status',
      label: '状态',
      placeholder: '选择状态',
      children: [
        { value: 'active', label: '活跃' },
        { value: 'inactive', label: '非活跃' },
        { value: 'pending', label: '待处理' },
      ],
    },
    {
      type: 'select',
      prop: 'type',
      label: '类型',
      placeholder: '选择类型',
      children: [
        { value: 'type1', label: '类型一' },
        { value: 'type2', label: '类型二' },
      ],
    },
  ],
  popover: [
    {
      type: 'input',
      prop: 'title',
      label: '标题',
      placeholder: '请输入标题',
      rules: [PRESET_RULES.required('标题')],
    },
    {
      type: 'select',
      prop: 'priority',
      label: '优先级',
      placeholder: '选择优先级',
      children: [
        { value: 'high', label: '高' },
        { value: 'medium', label: '中' },
        { value: 'low', label: '低' },
      ],
      rules: [PRESET_RULES.required('优先级')],
    },
  ],
}

// 容器卡片配置
export const containerCards: ContainerCard[] = [
  {
    key: 'modal',
    title: '模态框表单',
    description: '适用于新增/编辑单个实体，快速配置操作，空间有限时的最佳选择',
    icon: 'i-carbon-popup text-3xl',
    tagType: 'info',
    features: ['空间有限', '聚焦操作', '网格布局', '快进快出'],
    actionText: '打开模态框',
    actionIcon: 'i-carbon-launch',
    fields: formOptions.modal.length,
    layout: 'Grid',
    complexity: 3,
  },
  {
    key: 'drawer',
    title: '抽屉表单',
    description: '适用于详情查看+编辑，多步骤数据录入，信息展示更加丰富',
    icon: 'i-carbon-side-panel-open text-3xl',
    tagType: 'success',
    features: ['空间充足', '详情编辑', '默认布局', '信息丰富'],
    actionText: '打开抽屉',
    actionIcon: 'i-carbon-arrow-right',
    fields: formOptions.drawer.length,
    layout: 'Default',
    complexity: 4,
  },
  {
    key: 'sidebar',
    title: '侧边栏表单',
    description: '适用于实时筛选器，快速操作面板，不干扰主要工作流程',
    icon: 'i-carbon-side-panel-close text-3xl',
    tagType: 'warning',
    features: ['紧凑布局', '实时筛选', '辅助操作', '不干扰主流程'],
    actionText: '侧边栏',
    actionIcon: 'i-carbon-panel-expansion',
    fields: formOptions.sidebar.length,
    layout: 'Compact',
    complexity: 2,
  },
  {
    key: 'popover',
    title: '浮动表单',
    description: '适用于快速编辑单个字段，简单配置项调整，轻量级交互',
    icon: 'i-carbon-floating-ip text-3xl',
    tagType: 'error',
    features: ['轻量级', '内联布局', '快速编辑', '即时反馈'],
    actionText: '切换浮动表单',
    actionIcon: 'i-carbon-cursor-1',
    fields: formOptions.popover.length,
    layout: 'Inline',
    complexity: 1,
  },
]

// 设计原则
export const principles: Principle[] = [
  {
    key: 'space',
    title: '空间维度考量',
    icon: 'i-carbon-grid text-xl',
    items: [
      { label: '窄空间', desc: '垂直布局优先' },
      { label: '宽空间', desc: '网格布局发挥优势' },
      { label: '高空间', desc: '步骤布局适合复杂流程' },
    ],
  },
  {
    key: 'interaction',
    title: '交互复杂度考量',
    icon: 'i-carbon-interactive-segmentation-cursor text-xl',
    items: [
      { label: '简单操作', desc: 'inline 或简洁 default' },
      { label: '标准CRUD', desc: 'grid 或 default' },
      { label: '复杂配置', desc: 'tabs 或 card' },
      { label: '向导流程', desc: 'steps' },
    ],
  },
  {
    key: 'mental',
    title: '用户心智模型',
    icon: 'i-carbon-cognitive text-xl',
    items: [
      { label: '打断式操作', desc: '快进快出' },
      { label: '沉浸式操作', desc: '丰富交互' },
      { label: '辅助性操作', desc: '不干扰主流程' },
      { label: '即时操作', desc: '轻量快捷' },
    ],
  },
]

// 头部统计
export const headerStats = [
  {
    label: '容器类型',
    value: 4,
    type: 'info' as const,
    icon: 'i-carbon-container mr-1',
  },
  {
    label: '表单字段',
    value: Object.values(formOptions).reduce(
      (total, options) => total + options.length,
      0
    ),
    type: 'success' as const,
    icon: 'i-carbon-form mr-1',
  },
  {
    label: '布局模式',
    value: 8,
    type: 'warning' as const,
    icon: 'i-carbon-layout mr-1',
  },
]

// 页脚链接
export const footerLinks = [
  {
    label: '查看文档',
    icon: 'i-carbon-document',
  },
  {
    label: 'GitHub',
    icon: 'i-carbon-logo-github',
  },
]

// 工具函数
export const createDefaultFormData = (): Record<
  ContainerType,
  Record<string, any>
> => ({
  modal: {},
  drawer: {},
  sidebar: {},
  popover: {},
})

export const createPerformanceStats = (): PerformanceStat[] => [
  {
    key: 'render',
    label: '渲染时间',
    value: 38,
    unit: 'ms',
    icon: 'i-carbon-timer',
    color: '#18a058',
  },
  {
    key: 'memory',
    label: '内存使用',
    value: 2.1,
    unit: 'MB',
    icon: 'i-carbon-data-vis-4',
    color: '#2080f0',
  },
  {
    key: 'components',
    label: '组件数量',
    value: 147,
    unit: '个',
    icon: 'i-carbon-container-services',
    color: '#f0a020',
  },
  {
    key: 'interactions',
    label: '交互次数',
    value: 1203,
    unit: '次',
    icon: 'i-carbon-touch-interaction',
    color: '#d03050',
  },
]

export const refreshPerformanceStats = (stats: PerformanceStat[]): void => {
  stats.forEach(stat => {
    if (stat.key === 'render') {
      stat.value = Math.floor(Math.random() * 20) + 30
    } else if (stat.key === 'memory') {
      stat.value = Number((Math.random() * 1.5 + 1.5).toFixed(1))
    } else if (stat.key === 'interactions') {
      stat.value += Math.floor(Math.random() * 10) + 1
    }
  })
}
