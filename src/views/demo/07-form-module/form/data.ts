import { PRESET_RULES, type FieldRule } from '@/utils/v_verify'

const { required, length } = PRESET_RULES

// 简化的表单字段类型定义
export interface FormField {
  type:
    | 'input'
    | 'textarea'
    | 'inputNumber'
    | 'select'
    | 'checkbox'
    | 'radio'
    | 'switch'
    | 'slider'
    | 'rate'
    | 'datePicker'
    | 'daterange'
    | 'timePicker'
    | 'cascader'
    | 'colorPicker'
    | 'upload'
    | 'editor'
  value?: any
  prop: string
  label?: string
  placeholder?: string
  rules?: FieldRule[]
  attrs?: Record<string, unknown>
  uploadAttrs?: Record<string, unknown>
  uploadTip?: string
  // 选项数据 - 用于 select、checkbox、radio
  children?: Array<{
    value: string | number | boolean
    label: string
    attrs?: Record<string, unknown>
  }>
  show?: boolean
}

// 清晰简洁的表单配置
export const OPTIONS: FormField[] = [
  // 基础输入
  {
    type: 'input',
    prop: 'username',
    label: '用户名',
    placeholder: '请输入用户名',
    rules: [required('用户名')],
    attrs: { clearable: true },
  },

  {
    type: 'input',
    prop: 'password',
    label: '密码',
    placeholder: '请输入密码',
    rules: [required('密码'), length('密码', 6, 15)],
    attrs: {
      type: 'password',
      showPasswordOn: 'mousedown',
      clearable: true,
    },
  },

  // 选择类组件
  {
    type: 'select',
    prop: 'role',
    label: '职位',
    placeholder: '请选择职位',
    rules: [required('职位')],
    children: [
      { value: '1', label: '经理' },
      { value: '2', label: '主管' },
      { value: '3', label: '员工' },
    ],
  },

  {
    type: 'checkbox',
    prop: 'hobby',
    label: '爱好',
    value: [],
    rules: [required('爱好')],
    children: [
      { value: '1', label: '篮球' },
      { value: '2', label: '足球' },
      { value: '3', label: '羽毛球' },
    ],
  },

  {
    type: 'radio',
    prop: 'gender',
    label: '性别',
    rules: [required('性别')],
    children: [
      { value: '1', label: '男' },
      { value: '2', label: '女' },
      { value: '3', label: '保密' },
    ],
  },

  // 评分和交互组件
  {
    type: 'rate',
    prop: 'satisfaction',
    label: '满意度',
    value: 0,
    attrs: {
      allowHalf: true,
      count: 5,
      size: 'large',
    },
  },

  {
    type: 'switch',
    prop: 'isActive',
    label: '是否激活',
    value: false,
    attrs: {
      checkedText: '是',
      uncheckedText: '否',
    },
  },

  {
    type: 'slider',
    prop: 'progress',
    label: '进度',
    value: 50,
    attrs: {
      min: 0,
      max: 100,
      step: 10,
      marks: {
        0: '0%',
        50: '50%',
        100: '100%',
      },
    },
  },

  // 数字和文本
  {
    type: 'inputNumber',
    prop: 'age',
    label: '年龄',
    placeholder: '请输入年龄',
    value: 0,
    rules: [required('年龄')],
    attrs: {
      min: 0,
      max: 120,
      step: 1,
    },
  },

  {
    type: 'textarea',
    prop: 'remark',
    label: '备注',
    placeholder: '请输入备注信息',
    attrs: {
      rows: 4,
      maxlength: 200,
      showCount: true,
    },
  },

  // 日期时间
  {
    type: 'datePicker',
    prop: 'birthday',
    label: '生日',
    placeholder: '请选择生日',
    attrs: {
      type: 'date',
      format: 'yyyy-MM-dd',
    },
  },

  {
    type: 'timePicker',
    prop: 'workTime',
    label: '工作时间',
    placeholder: '请选择工作时间',
    attrs: {
      format: 'HH:mm:ss',
    },
  },

  // 高级组件
  {
    type: 'cascader',
    prop: 'address',
    label: '地址',
    placeholder: '请选择地址',
    attrs: {
      options: [
        {
          label: '北京市',
          value: 'beijing',
          children: [
            { label: '朝阳区', value: 'chaoan' },
            { label: '海淀区', value: 'haitian' },
          ],
        },
        {
          label: '上海市',
          value: 'shanghai',
          children: [
            { label: '浦东新区', value: 'pong' },
            { label: '黄浦区', value: 'hangup' },
          ],
        },
      ],
    },
  },

  {
    type: 'colorPicker',
    prop: 'themeColor',
    label: '主题色',
    value: '#2080F0',
    attrs: {
      showAlpha: true,
      modes: ['hex', 'rgb', 'hsl'],
    },
  },

  // 上传和编辑器
  {
    type: 'upload',
    prop: 'files',
    label: '文件上传',
    value: [],
    rules: [required('请上传文件')],
    uploadAttrs: {
      action: 'https://jsonplaceholder.typicode.com/posts/',
      multiple: true,
      limit: 2,
      accept: '.jpg,.jpeg,.png',
      listType: 'image-card',
    },
  },

  {
    type: 'editor',
    prop: 'description',
    label: '详细描述',
    placeholder: '请输入详细描述信息...',
    rules: [required('描述'), length('描述', 10, 500)],
  },
]
