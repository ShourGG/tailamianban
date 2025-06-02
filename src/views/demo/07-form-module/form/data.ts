import type { LayoutType, FormOption, LayoutConfig } from '@/types/modules/form'
import { PRESET_RULES, RULE_COMBOS } from '@/utils/v_verify'

/**
 * * @description 布局选项配置
 * ? @constant layoutOptions 所有可用的布局类型选项
 */
export const layoutOptions = [
  { label: '默认布局', value: 'default' as const },
  { label: '内联布局', value: 'inline' as const },
  { label: '网格布局', value: 'grid' as const },
  { label: '卡片布局', value: 'card' as const },
  { label: '标签页布局', value: 'tabs' as const },
  { label: '步骤布局', value: 'steps' as const },
  { label: '动态布局', value: 'dynamic' as const },
  { label: '自定义渲染', value: 'custom' as const },
] as const

/**
 * * @description 标签位置选项配置
 * ? @constant labelPlacementOptions 表单标签的显示位置选项
 */
export const labelPlacementOptions = [
  { label: '左侧', value: 'left' as const },
  { label: '顶部', value: 'top' as const },
] as const

/**
 * * @description 布局描述信息映射表
 * ? @constant layoutDescriptions 每种布局的详细说明
 */
export const layoutDescriptions: Record<
  LayoutType,
  { title: string; type: string; content: string }
> = {
  default: {
    title: '默认布局',
    type: 'default',
    content: '标准的垂直表单布局，适用于大多数场景。',
  },
  inline: {
    title: '内联布局',
    type: 'info',
    content: '水平排列的表单布局，适用于简单表单或搜索条件。',
  },
  grid: {
    title: '网格布局',
    type: 'success',
    content: '基于栅格系统的响应式布局，可以灵活控制每个表单项的宽度和位置。',
  },
  card: {
    title: '卡片布局',
    type: 'warning',
    content: '将表单项按功能分组，每个分组显示在独立的卡片中。',
  },
  tabs: {
    title: '标签页布局',
    type: 'error',
    content: '将表单项分散到不同的标签页中，适用于内容较多的表单。',
  },
  steps: {
    title: '步骤布局',
    type: 'success',
    content: '引导用户按步骤填写表单，适用于注册、向导等场景。',
  },
  dynamic: {
    title: '动态布局',
    type: 'info',
    content: '支持动态添加、删除、显示/隐藏字段的表单布局。',
  },
  custom: {
    title: '自定义渲染',
    type: 'success',
    content: '支持自定义渲染效果和高级控件的表单布局。',
  },
}

/**
 * * @description 布局标签类型映射表
 * ? @constant layoutTagTypes 每种布局对应的标签类型
 */
export const layoutTagTypes: Record<LayoutType, string> = {
  default: 'default',
  inline: 'info',
  grid: 'success',
  card: 'warning',
  tabs: 'error',
  steps: 'primary',
  dynamic: 'info',
  custom: 'success',
}

/**
 * * @description 基础表单字段配置
 * ? @constant baseFields 通用的基础字段配置数组
 */
const baseFields: FormOption[] = [
  {
    type: 'input',
    prop: 'username',
    label: '用户名',
    placeholder: '请输入用户名',
    rules: RULE_COMBOS.username('用户名'),
  },
  {
    type: 'input',
    prop: 'realName',
    label: '真实姓名',
    placeholder: '请输入真实姓名',
    rules: [
      PRESET_RULES.required('真实姓名'),
      PRESET_RULES.length('真实姓名', 2, 20),
    ],
  },
  {
    type: 'inputNumber',
    prop: 'age',
    label: '年龄',
    rules: [PRESET_RULES.required('年龄'), PRESET_RULES.range('年龄', 1, 120)],
    attrs: { min: 1, max: 120 },
  },
  {
    type: 'select',
    prop: 'gender',
    label: '性别',
    placeholder: '请选择性别',
    rules: [PRESET_RULES.required('性别')],
    children: [
      { value: 'male', label: '男' },
      { value: 'female', label: '女' },
    ],
  },
  {
    type: 'input',
    prop: 'email',
    label: '邮箱',
    placeholder: '请输入邮箱地址',
    rules: RULE_COMBOS.email('邮箱'),
  },
  {
    type: 'input',
    prop: 'phone',
    label: '手机号',
    placeholder: '请输入手机号',
    rules: RULE_COMBOS.mobile('手机号'),
  },
  {
    type: 'input',
    prop: 'password',
    label: '密码',
    placeholder: '请输入密码',
    rules: RULE_COMBOS.password('密码'),
    attrs: { type: 'password', showPasswordOn: 'mousedown' },
  },
  {
    type: 'textarea',
    prop: 'address',
    label: '地址',
    placeholder: '请输入详细地址',
    rules: [PRESET_RULES.required('地址'), PRESET_RULES.length('地址', 5, 200)],
    attrs: { rows: 3 },
  },
]

/**
 * * @description 扩展表单字段配置
 * ? @constant extendedFields 额外的扩展字段配置数组
 */
const extendedFields: FormOption[] = [
  {
    type: 'checkbox',
    prop: 'hobbies',
    label: '兴趣爱好',
    rules: [PRESET_RULES.required('兴趣爱好')],
    children: [
      { value: 'reading', label: '阅读' },
      { value: 'music', label: '音乐' },
      { value: 'sports', label: '运动' },
      { value: 'travel', label: '旅行' },
    ],
    value: [],
  },
  { type: 'switch', prop: 'newsletter', label: '订阅邮件', value: false },
  {
    type: 'rate',
    prop: 'satisfaction',
    label: '满意度评分',
    rules: [
      PRESET_RULES.required('满意度评分'),
      PRESET_RULES.range('满意度评分', 1, 5),
    ],
    attrs: { allowHalf: true },
    value: 0,
  },
]

/**
 * * @description 字段布局映射配置
 * ? @constant fieldMapping 字段与布局分组的映射关系
 */
const fieldMapping = {
  basic: ['username', 'realName', 'age', 'gender'],
  contact: ['email', 'phone', 'address'],
  preferences: ['password', 'hobbies', 'newsletter', 'satisfaction'],
  personal: ['username', 'realName', 'age', 'gender'],
  security: ['password'],
  step1: ['username', 'realName', 'age', 'gender'],
  step2: ['email', 'phone', 'address'],
  step3: ['password'],
  step4: ['hobbies', 'newsletter', 'satisfaction'],
}

/**
 * * @description 获取网格布局配置
 * ? @param fieldProp 字段属性名
 * ! @return 网格布局配置对象
 */
const getGridLayout = (fieldProp: string) => ({
  span: fieldProp === 'address' ? 24 : 12,
})

/**
 * * @description 获取卡片/自定义布局分组
 * ? @param fieldProp 字段属性名
 * ! @return 分组名称
 */
const getCardGroup = (fieldProp: string): string => {
  if (fieldMapping.basic.includes(fieldProp)) return 'basic'
  if (fieldMapping.contact.includes(fieldProp)) return 'contact'
  return 'preferences'
}

/**
 * * @description 获取标签页布局配置
 * ? @param fieldProp 字段属性名
 * ! @return 标签页名称
 */
const getTabLayout = (fieldProp: string): string => {
  if (fieldMapping.personal.includes(fieldProp)) return 'personal'
  if (fieldMapping.contact.includes(fieldProp)) return 'contact'
  if (fieldMapping.security.includes(fieldProp)) return 'security'
  return 'preferences'
}

/**
 * * @description 获取步骤布局配置
 * ? @param fieldProp 字段属性名
 * ! @return 步骤名称
 */
const getStepLayout = (fieldProp: string): string => {
  if (fieldMapping.step1.includes(fieldProp)) return 'step1'
  if (fieldMapping.step2.includes(fieldProp)) return 'step2'
  if (fieldMapping.step3.includes(fieldProp)) return 'step3'
  return 'step4'
}

/**
 * * @description 为字段添加布局信息
 * ? @param fields 表单字段数组
 * ? @param layoutType 布局类型
 * ! @return 添加了布局信息的字段数组
 */
const addLayout = (
  fields: FormOption[],
  layoutType: LayoutType
): FormOption[] => {
  return fields.map(field => {
    let layout: any = {}

    switch (layoutType) {
      case 'grid':
        layout = getGridLayout(field.prop)
        break
      case 'card':
      case 'custom':
        layout.group = getCardGroup(field.prop)
        break
      case 'tabs':
        layout.tab = getTabLayout(field.prop)
        break
      case 'steps':
        layout.step = getStepLayout(field.prop)
        break
    }

    return { ...field, layout }
  })
}

/**
 * * @description 创建默认布局字段（包含富文本编辑器）
 * ? @function createBaseFields 生成默认布局的完整字段配置
 * ! @return 包含富文本编辑器的字段数组
 */
export const createBaseFields = (): FormOption[] => {
  const fields = [...baseFields]

  // 只在默认布局添加富文本编辑器
  fields.push({
    type: 'editor',
    prop: 'description',
    label: '个人简介',
    placeholder: '请输入个人简介...',
    value: '',
    attrs: { height: 200 },
  })

  return fields
}

/**
 * * @description 创建卡片布局字段
 * ? @function createCardFields 生成卡片布局的字段配置
 * ! @return 适用于卡片布局的字段数组
 */
export const createCardFields = (): FormOption[] => {
  const allFields = [...baseFields, ...extendedFields]

  // 卡片布局添加额外字段
  allFields.push(
    {
      type: 'datePicker',
      prop: 'birthday',
      label: '出生日期',
      placeholder: '请选择出生日期',
    },
    {
      type: 'input',
      prop: 'wechat',
      label: '微信号',
      placeholder: '请输入微信号',
      rules: [PRESET_RULES.length('微信号', 6, 20)],
    },
    {
      type: 'slider',
      prop: 'volume',
      label: '音量设置',
      value: 50,
      attrs: { min: 0, max: 100 },
    }
  )

  return addLayout(allFields, 'card')
}

/**
 * * @description 创建扩展字段
 * ? @function createExtendedFields 获取扩展字段配置
 * ! @return 扩展字段数组
 */
export const createExtendedFields = (): FormOption[] => extendedFields

/**
 * * @description 创建内联布局字段（适配水平排列）
 * ? @function createInlineFields 生成内联布局的简化字段配置
 * ! @return 适用于内联布局的字段数组
 */
export const createInlineFields = (): FormOption[] => [
  {
    type: 'input',
    prop: 'username',
    label: '用户名',
    placeholder: '请输入用户名',
  },
  {
    type: 'select',
    prop: 'gender',
    label: '性别',
    placeholder: '请选择',
    children: [
      { value: 'male', label: '男' },
      { value: 'female', label: '女' },
    ],
  },
  {
    type: 'input',
    prop: 'email',
    label: '邮箱',
    placeholder: '请输入邮箱',
  },
  {
    type: 'input',
    prop: 'phone',
    label: '手机号',
    placeholder: '请输入手机号',
  },
  {
    type: 'inputNumber',
    prop: 'age',
    label: '年龄',
    attrs: { min: 1, max: 120 },
  },
]

/**
 * * @description 获取字段创建函数
 * ? @function getFieldCreator 根据布局类型返回对应的字段创建函数
 * ? @param layoutType 布局类型
 * ! @return 字段创建函数
 */
export const getFieldCreator = (layoutType: LayoutType) => {
  switch (layoutType) {
    case 'inline':
      return createInlineFields
    case 'card':
      return createCardFields
    case 'tabs':
    case 'steps':
    case 'dynamic':
    case 'custom':
      return () => addLayout([...baseFields, ...extendedFields], layoutType)
    case 'grid':
      return () => addLayout(baseFields, layoutType)
    default:
      return createBaseFields
  }
}

/**
 * * @description 测试数据配置
 * ? @constant testData 用于演示的预设数据
 */
export const testData = {
  base: {
    username: 'cheny_888',
    realName: 'CHENY',
    age: 28,
    gender: 'male',
    email: 'demo@cheny-test.com',
    phone: '16888888888',
    password: 'Demo123456',
    address: '西安市未央区某某街道188号',
    description: '<p>这是<strong>富文本编辑器</strong>示例</p>',
  },
  extended: {
    hobbies: ['reading', 'music'],
    newsletter: true,
    satisfaction: 4.5,
    birthday: '19xx-0x-xx',
    wechat: 'demo_cheny',
    volume: 60,
  },
}

/**
 * * @description 动态字段支持的类型
 * ? @constant dynamicFieldTypes 可在动态布局中添加的字段类型
 */
export const dynamicFieldTypes = [
  'input',
  'select',
  'switch',
  'inputNumber',
  'textarea',
  'rate',
] as const

/**
 * * @description 布局配置生成器
 * ? @function createLayoutConfig 根据布局类型和配置生成完整的布局配置
 * ? @param layout 布局类型
 * ? @param configs 布局特定配置参数
 * ! @return 完整的布局配置对象
 */
export const createLayoutConfig = (
  layout: LayoutType,
  configs: Record<string, any> = {}
): LayoutConfig => {
  const base: LayoutConfig = { type: layout }

  const configMap: Record<LayoutType, () => LayoutConfig> = {
    default: () => base,
    inline: () => ({
      ...base,
      inline: { gap: configs.inline?.gap || 16, align: 'center' },
    }),
    grid: () => ({
      ...base,
      grid: {
        cols: configs.grid?.cols || 24,
        gutter: configs.grid?.gutter || 16,
      },
    }),
    card: () => ({
      ...base,
      card: {
        groups: [
          { key: 'basic', title: '基础信息', description: '用户基本信息' },
          { key: 'contact', title: '联系方式', description: '联系和地址信息' },
          {
            key: 'preferences',
            title: '偏好设置',
            description: '个人偏好设置',
          },
        ],
      },
    }),
    tabs: () => ({
      ...base,
      tabs: {
        tabs: [
          { key: 'personal', title: '个人信息' },
          { key: 'contact', title: '联系方式' },
          { key: 'security', title: '安全设置' },
          { key: 'preferences', title: '偏好设置' },
        ],
        placement: 'top',
        defaultTab: 'personal',
      },
    }),
    steps: () => ({
      ...base,
      steps: {
        steps: [
          { key: 'step1', title: '基本信息', required: true },
          { key: 'step2', title: '联系方式', required: true },
          { key: 'step3', title: '安全设置', required: true },
          { key: 'step4', title: '确认提交' },
        ],
        vertical: false,
        validateBeforeNext: true,
      },
    }),
    dynamic: () => ({
      ...base,
      dynamic: {
        grid: { cols: 24, gutter: 16 },
        controls: { showControls: true },
        dynamic: { maxFields: configs.dynamic?.maxFields || 20 },
      },
    }),
    custom: () => ({
      ...base,
      custom: {
        groups: [
          { key: 'basic', title: '基础信息' },
          { key: 'preferences', title: '偏好设置' },
        ],
        rendering: { mode: 'enhanced', animations: true },
      },
    }),
  }

  return configMap[layout]?.() || base
}
