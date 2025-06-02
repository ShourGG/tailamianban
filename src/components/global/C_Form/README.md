# C_Form 通用表单组件

一个功能强大、高度可配置的Vue 3表单组件，支持多种布局模式、丰富的表单控件类型和完善的验证机制。

## ✨ 特性

- 🎨 **8种布局模式** - 默认、内联、网格、卡片、标签页、步骤、动态、自定义
- 🧩 **15+表单控件** - 输入框、选择器、开关、滑块、日期选择器、富文本编辑器等
- 📱 **响应式设计** - 支持移动端和桌面端自适应
- ✅ **完善的验证** - 内置验证规则，支持自定义验证
- 🚀 **动态表单** - 支持动态添加/删除字段
- 📦 **TypeScript支持** - 完整的类型定义
- 🎯 **事件驱动** - 丰富的事件回调机制

## 🚀 快速开始

### 基础用法

```vue
<template>
  <C_Form
    :options="formOptions"
    v-model="formData"
    @submit="handleSubmit"
  />
</template>

<script setup>
  import { ref } from 'vue'

  const formData = ref({})

  const formOptions = [
    {
      type: 'input',
      prop: 'username',
      label: '用户名',
      placeholder: '请输入用户名',
      rules: [{ required: true, message: '用户名不能为空' }],
    },
    {
      type: 'input',
      prop: 'email',
      label: '邮箱',
      placeholder: '请输入邮箱',
      rules: [
        { required: true, message: '邮箱不能为空' },
        { type: 'email', message: '邮箱格式不正确' },
      ],
    },
  ]

  const handleSubmit = payload => {
    console.log('表单数据:', payload.model)
  }
</script>
```

## 📐 布局类型

### 1. 默认布局 (default)

标准的垂直表单布局，适用于大多数场景。

```vue
<template>
  <C_Form
    :options="defaultOptions"
    layout-type="default"
    v-model="formData"
  />
</template>

<script setup>
  const defaultOptions = [
    {
      type: 'input',
      prop: 'username',
      label: '用户名',
      placeholder: '请输入用户名',
    },
    {
      type: 'textarea',
      prop: 'description',
      label: '描述',
      placeholder: '请输入描述',
      attrs: { rows: 4 },
    },
    {
      type: 'editor',
      prop: 'content',
      label: '富文本内容',
      placeholder: '请输入内容...',
    },
  ]
</script>
```

### 2. 内联布局 (inline)

水平排列的表单布局，适用于简单表单或搜索条件。

```vue
<template>
  <C_Form
    :options="inlineOptions"
    layout-type="inline"
    :layout-config="inlineConfig"
    v-model="formData"
  />
</template>

<script setup>
  const inlineOptions = [
    {
      type: 'input',
      prop: 'keyword',
      label: '关键词',
      placeholder: '请输入关键词',
    },
    {
      type: 'select',
      prop: 'category',
      label: '分类',
      placeholder: '请选择分类',
      children: [
        { value: 'tech', label: '技术' },
        { value: 'business', label: '商务' },
      ],
    },
    {
      type: 'inputNumber',
      prop: 'count',
      label: '数量',
      attrs: { min: 1, max: 100 },
    },
  ]

  const inlineConfig = {
    inline: {
      gap: 16, // 元素间距
      align: 'center', // 对齐方式
    },
  }
</script>
```

### 3. 网格布局 (grid)

基于栅格系统的响应式布局，可以灵活控制每个表单项的宽度和位置。

```vue
<template>
  <C_Form
    :options="gridOptions"
    layout-type="grid"
    :layout-config="gridConfig"
    v-model="formData"
  />
</template>

<script setup>
  const gridOptions = [
    {
      type: 'input',
      prop: 'firstName',
      label: '名',
      placeholder: '请输入名',
      layout: { span: 12 }, // 占据12列（一半宽度）
    },
    {
      type: 'input',
      prop: 'lastName',
      label: '姓',
      placeholder: '请输入姓',
      layout: { span: 12 }, // 占据12列（一半宽度）
    },
    {
      type: 'input',
      prop: 'address',
      label: '地址',
      placeholder: '请输入详细地址',
      layout: { span: 24 }, // 占据24列（全宽度）
    },
  ]

  const gridConfig = {
    grid: {
      cols: 24, // 总列数
      gutter: 16, // 栅格间距
    },
  }
</script>
```

### 4. 卡片布局 (card)

将表单项按功能分组，每个分组显示在独立的卡片中。

```vue
<template>
  <C_Form
    :options="cardOptions"
    layout-type="card"
    :layout-config="cardConfig"
    v-model="formData"
  />
</template>

<script setup>
  const cardOptions = [
    // 基础信息组
    {
      type: 'input',
      prop: 'username',
      label: '用户名',
      placeholder: '请输入用户名',
      layout: { group: 'basic' },
    },
    {
      type: 'input',
      prop: 'realName',
      label: '真实姓名',
      placeholder: '请输入真实姓名',
      layout: { group: 'basic' },
    },
    // 联系方式组
    {
      type: 'input',
      prop: 'email',
      label: '邮箱',
      placeholder: '请输入邮箱',
      layout: { group: 'contact' },
    },
    {
      type: 'input',
      prop: 'phone',
      label: '手机号',
      placeholder: '请输入手机号',
      layout: { group: 'contact' },
    },
  ]

  const cardConfig = {
    card: {
      groups: [
        {
          key: 'basic',
          title: '基础信息',
          description: '用户基本信息',
        },
        {
          key: 'contact',
          title: '联系方式',
          description: '联系和地址信息',
        },
      ],
    },
  }
</script>
```

### 5. 标签页布局 (tabs)

将表单项分散到不同的标签页中，适用于内容较多的表单。

```vue
<template>
  <C_Form
    :options="tabsOptions"
    layout-type="tabs"
    :layout-config="tabsConfig"
    v-model="formData"
  />
</template>

<script setup>
  const tabsOptions = [
    // 个人信息标签页
    {
      type: 'input',
      prop: 'username',
      label: '用户名',
      placeholder: '请输入用户名',
      layout: { tab: 'personal' },
    },
    {
      type: 'inputNumber',
      prop: 'age',
      label: '年龄',
      layout: { tab: 'personal' },
    },
    // 联系方式标签页
    {
      type: 'input',
      prop: 'email',
      label: '邮箱',
      placeholder: '请输入邮箱',
      layout: { tab: 'contact' },
    },
    // 安全设置标签页
    {
      type: 'input',
      prop: 'password',
      label: '密码',
      placeholder: '请输入密码',
      layout: { tab: 'security' },
      attrs: { type: 'password' },
    },
  ]

  const tabsConfig = {
    tabs: {
      tabs: [
        { key: 'personal', title: '个人信息' },
        { key: 'contact', title: '联系方式' },
        { key: 'security', title: '安全设置' },
      ],
      placement: 'top',
      defaultTab: 'personal',
    },
  }
</script>
```

### 6. 步骤布局 (steps)

引导用户按步骤填写表单，适用于注册、向导等场景。

```vue
<template>
  <C_Form
    :options="stepsOptions"
    layout-type="steps"
    :layout-config="stepsConfig"
    v-model="formData"
    @step-change="handleStepChange"
    @step-validate="handleStepValidate"
  />
</template>

<script setup>
  const stepsOptions = [
    // 第一步：基本信息
    {
      type: 'input',
      prop: 'username',
      label: '用户名',
      placeholder: '请输入用户名',
      layout: { step: 'step1' },
      rules: [{ required: true, message: '用户名不能为空' }],
    },
    {
      type: 'input',
      prop: 'realName',
      label: '真实姓名',
      placeholder: '请输入真实姓名',
      layout: { step: 'step1' },
      rules: [{ required: true, message: '真实姓名不能为空' }],
    },
    // 第二步：联系方式
    {
      type: 'input',
      prop: 'email',
      label: '邮箱',
      placeholder: '请输入邮箱',
      layout: { step: 'step2' },
      rules: [
        { required: true, message: '邮箱不能为空' },
        { type: 'email', message: '邮箱格式不正确' },
      ],
    },
    // 第三步：安全设置
    {
      type: 'input',
      prop: 'password',
      label: '密码',
      placeholder: '请输入密码',
      layout: { step: 'step3' },
      attrs: { type: 'password' },
      rules: [{ required: true, message: '密码不能为空' }],
    },
  ]

  const stepsConfig = {
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
  }

  const handleStepChange = (stepIndex, stepKey) => {
    console.log('步骤变化:', stepIndex, stepKey)
  }

  const handleStepValidate = stepIndex => {
    console.log('步骤验证:', stepIndex)
  }
</script>
```

### 7. 动态布局 (dynamic)

支持动态添加、删除、显示/隐藏字段的表单布局。

```vue
<template>
  <C_Form
    ref="formRef"
    :options="dynamicOptions"
    layout-type="dynamic"
    :layout-config="dynamicConfig"
    v-model="formData"
    @field-add="handleFieldAdd"
    @field-remove="handleFieldRemove"
  />

  <div class="dynamic-controls">
    <button @click="addDynamicField">添加字段</button>
    <button @click="removeDynamicField">移除字段</button>
  </div>
</template>

<script setup>
  import { ref } from 'vue'

  const formRef = ref()
  const dynamicFields = ref([])
  let fieldCounter = 0

  const dynamicOptions = ref([
    {
      type: 'input',
      prop: 'name',
      label: '姓名',
      placeholder: '请输入姓名',
    },
  ])

  const dynamicConfig = {
    dynamic: {
      grid: { cols: 24, gutter: 16 },
      controls: { showControls: true },
      dynamic: { maxFields: 20 },
    },
  }

  const addDynamicField = () => {
    fieldCounter++
    const newField = {
      type: 'input',
      prop: `dynamic_field_${fieldCounter}`,
      label: `动态字段 ${fieldCounter}`,
      placeholder: `请输入动态字段 ${fieldCounter}`,
      layout: { span: 12, dynamic: true },
    }

    dynamicOptions.value.push(newField)
    dynamicFields.value.push(newField)
  }

  const removeDynamicField = () => {
    if (dynamicFields.value.length > 0) {
      const removedField = dynamicFields.value.pop()
      const index = dynamicOptions.value.findIndex(
        item => item.prop === removedField.prop
      )
      if (index > -1) {
        dynamicOptions.value.splice(index, 1)
      }
    }
  }

  const handleFieldAdd = fieldConfig => {
    console.log('字段添加:', fieldConfig)
  }

  const handleFieldRemove = fieldId => {
    console.log('字段移除:', fieldId)
  }
</script>
```

### 8. 自定义渲染 (custom)

支持自定义渲染效果和高级控件的表单布局。

```vue
<template>
  <C_Form
    :options="customOptions"
    layout-type="custom"
    :layout-config="customConfig"
    v-model="formData"
  />
</template>

<script setup>
  const customOptions = [
    {
      type: 'input',
      prop: 'title',
      label: '标题',
      placeholder: '请输入标题',
      layout: { group: 'basic' },
    },
    {
      type: 'colorPicker',
      prop: 'color',
      label: '主题色',
      layout: { group: 'advanced' },
    },
    {
      type: 'upload',
      prop: 'files',
      label: '附件上传',
      layout: { group: 'advanced' },
      attrs: {
        multiple: true,
        accept: '.jpg,.png,.pdf',
      },
    },
  ]

  const customConfig = {
    custom: {
      groups: [
        { key: 'basic', title: '基础设置' },
        { key: 'advanced', title: '高级设置' },
      ],
      rendering: {
        mode: 'enhanced',
        animations: true,
      },
    },
  }
</script>
```

## 🧩 表单控件类型

### 基础输入控件

```javascript
// 文本输入框
{
  type: 'input',
  prop: 'username',
  label: '用户名',
  placeholder: '请输入用户名',
  attrs: {
    maxlength: 20,
    showCount: true,
    clearable: true
  }
}

// 密码输入框
{
  type: 'input',
  prop: 'password',
  label: '密码',
  placeholder: '请输入密码',
  attrs: {
    type: 'password',
    showPasswordOn: 'mousedown'
  }
}

// 多行文本框
{
  type: 'textarea',
  prop: 'description',
  label: '描述',
  placeholder: '请输入描述',
  attrs: {
    rows: 4,
    maxlength: 500,
    showCount: true
  }
}

// 数字输入框
{
  type: 'inputNumber',
  prop: 'price',
  label: '价格',
  attrs: {
    min: 0,
    max: 9999,
    precision: 2,
    step: 0.1
  }
}
```

### 选择控件

```javascript
// 下拉选择器
{
  type: 'select',
  prop: 'category',
  label: '分类',
  placeholder: '请选择分类',
  children: [
    { value: 'tech', label: '技术', disabled: false },
    { value: 'business', label: '商务' },
    { value: 'design', label: '设计' }
  ],
  attrs: {
    multiple: false,
    filterable: true,
    clearable: true
  }
}

// 单选框组
{
  type: 'radio',
  prop: 'gender',
  label: '性别',
  children: [
    { value: 'male', label: '男' },
    { value: 'female', label: '女' }
  ]
}

// 复选框组
{
  type: 'checkbox',
  prop: 'hobbies',
  label: '兴趣爱好',
  children: [
    { value: 'reading', label: '阅读' },
    { value: 'music', label: '音乐' },
    { value: 'sports', label: '运动' }
  ],
  value: [] // 默认值为空数组
}

// 级联选择器
{
  type: 'cascader',
  prop: 'region',
  label: '地区',
  placeholder: '请选择地区',
  attrs: {
    options: [
      {
        value: 'beijing',
        label: '北京',
        children: [
          { value: 'chaoyang', label: '朝阳区' },
          { value: 'haidian', label: '海淀区' }
        ]
      }
    ]
  }
}
```

### 日期时间控件

```javascript
// 日期选择器
{
  type: 'datePicker',
  prop: 'birthday',
  label: '出生日期',
  placeholder: '请选择出生日期',
  attrs: {
    type: 'date',
    format: 'yyyy-MM-dd'
  }
}

// 日期范围选择器
{
  type: 'daterange',
  prop: 'dateRange',
  label: '日期范围',
  placeholder: ['开始日期', '结束日期'],
  attrs: {
    type: 'daterange',
    format: 'yyyy-MM-dd'
  }
}

// 时间选择器
{
  type: 'timePicker',
  prop: 'meetingTime',
  label: '会议时间',
  placeholder: '请选择时间',
  attrs: {
    format: 'HH:mm:ss'
  }
}
```

### 交互控件

```javascript
// 开关
{
  type: 'switch',
  prop: 'isEnabled',
  label: '启用状态',
  value: false,
  attrs: {
    checkedValue: true,
    uncheckedValue: false
  }
}

// 滑块
{
  type: 'slider',
  prop: 'volume',
  label: '音量',
  value: 50,
  attrs: {
    min: 0,
    max: 100,
    step: 1,
    marks: {
      0: '静音',
      50: '适中',
      100: '最大'
    }
  }
}

// 评分
{
  type: 'rate',
  prop: 'rating',
  label: '评分',
  value: 0,
  attrs: {
    allowHalf: true,
    showText: true,
    count: 5
  }
}

// 颜色选择器
{
  type: 'colorPicker',
  prop: 'themeColor',
  label: '主题色',
  value: '#1890ff',
  attrs: {
    showAlpha: true,
    modes: ['hex', 'rgb', 'hsl']
  }
}
```

### 高级控件

```javascript
// 文件上传
{
  type: 'upload',
  prop: 'attachments',
  label: '附件上传',
  value: [],
  attrs: {
    action: '/api/upload',
    multiple: true,
    accept: '.jpg,.png,.pdf,.doc,.docx',
    listType: 'text',
    headers: {
      'Authorization': 'Bearer token'
    }
  }
}

// 富文本编辑器
{
  type: 'editor',
  prop: 'content',
  label: '文章内容',
  placeholder: '请输入文章内容...',
  value: '',
  attrs: {
    height: 300,
    toolbar: ['bold', 'italic', 'underline', 'link']
  }
}
```

## ⚙️ 配置参数

### 基础配置

| 参数                  | 类型                           | 默认值    | 说明                 |
| --------------------- | ------------------------------ | --------- | -------------------- |
| options               | FormOption[]                   | []        | 表单字段配置数组     |
| layoutType            | LayoutType                     | 'default' | 布局类型             |
| layoutConfig          | LayoutConfig                   | {}        | 布局配置             |
| modelValue            | FormModel                      | {}        | 表单数据（v-model）  |
| validateOnValueChange | boolean                        | false     | 值改变时是否触发验证 |
| labelPlacement        | 'left' \| 'top'                | 'left'    | 标签位置             |
| labelWidth            | string \| number               | 'auto'    | 标签宽度             |
| showRequireMark       | boolean                        | true      | 是否显示必填标记     |
| size                  | 'small' \| 'medium' \| 'large' | 'medium'  | 组件尺寸             |
| disabled              | boolean                        | false     | 是否禁用             |
| readonly              | boolean                        | false     | 是否只读             |

### FormOption 配置

```typescript
interface FormOption {
  type: ComponentType // 控件类型
  prop: string // 字段属性名
  label: string // 显示标签
  placeholder?: string // 占位符
  value?: any // 默认值
  rules?: FormRule[] // 验证规则
  required?: boolean // 是否必填
  children?: OptionItem[] // 子选项（select、radio、checkbox）
  attrs?: Record<string, any> // 组件属性
  layout?: ItemLayoutConfig // 布局配置
  show?: boolean // 是否显示
}
```

### LayoutConfig 配置

```typescript
interface LayoutConfig {
  type: LayoutType
  // 网格布局配置
  grid?: {
    cols: number // 栅格列数
    gutter: number // 栅格间距
  }
  // 内联布局配置
  inline?: {
    gap: number // 元素间距
    align: 'left' | 'center' | 'right' // 对齐方式
  }
  // 卡片布局配置
  card?: {
    groups: Array<{
      key: string
      title: string
      description?: string
    }>
  }
  // 标签页布局配置
  tabs?: {
    tabs: Array<{
      key: string
      title: string
    }>
    placement: 'top' | 'bottom' | 'left' | 'right'
    defaultTab: string
  }
  // 步骤布局配置
  steps?: {
    steps: Array<{
      key: string
      title: string
      required?: boolean
    }>
    vertical: boolean
    validateBeforeNext: boolean
  }
  // 动态布局配置
  dynamic?: {
    grid: { cols: number; gutter: number }
    controls: { showControls: boolean }
    dynamic: { maxFields: number }
  }
  // 自定义布局配置
  custom?: {
    groups: Array<{
      key: string
      title: string
    }>
    rendering: {
      mode: 'basic' | 'enhanced'
      animations: boolean
    }
  }
}
```

## 🎯 事件处理

### 基础事件

```vue
<template>
  <C_Form
    :options="formOptions"
    v-model="formData"
    @submit="handleSubmit"
    @update:modelValue="handleModelUpdate"
    @validate-success="handleValidateSuccess"
    @validate-error="handleValidateError"
  />
</template>

<script setup>
  const handleSubmit = payload => {
    console.log('表单提交:', payload.model)
    console.log('表单实例:', payload.form)
  }

  const handleModelUpdate = model => {
    console.log('表单数据更新:', model)
  }

  const handleValidateSuccess = model => {
    console.log('验证成功:', model)
  }

  const handleValidateError = errors => {
    console.log('验证失败:', errors)
  }
</script>
```

### 布局相关事件

```vue
<template>
  <C_Form
    :options="formOptions"
    layout-type="tabs"
    v-model="formData"
    @tab-change="handleTabChange"
    @step-change="handleStepChange"
    @step-before-change="handleStepBeforeChange"
    @step-validate="handleStepValidate"
  />
</template>

<script setup>
  const handleTabChange = tabKey => {
    console.log('标签页切换:', tabKey)
  }

  const handleStepChange = (stepIndex, stepKey) => {
    console.log('步骤切换:', stepIndex, stepKey)
  }

  const handleStepBeforeChange = (currentStep, targetStep) => {
    console.log('步骤切换前:', currentStep, '->', targetStep)
    // 返回 Promise，可以阻止步骤切换
    return new Promise(resolve => {
      // 执行验证逻辑
      resolve(true) // true: 允许切换, false: 阻止切换
    })
  }

  const handleStepValidate = stepIndex => {
    console.log('步骤验证:', stepIndex)
  }
</script>
```

### 动态字段事件

```vue
<template>
  <C_Form
    :options="formOptions"
    layout-type="dynamic"
    v-model="formData"
    @field-add="handleFieldAdd"
    @field-remove="handleFieldRemove"
    @field-toggle="handleFieldToggle"
    @fields-clear="handleFieldsClear"
  />
</template>

<script setup>
  const handleFieldAdd = fieldConfig => {
    console.log('字段添加:', fieldConfig)
  }

  const handleFieldRemove = fieldId => {
    console.log('字段移除:', fieldId)
  }

  const handleFieldToggle = (fieldId, visible) => {
    console.log('字段显隐切换:', fieldId, visible)
  }

  const handleFieldsClear = () => {
    console.log('字段清空')
  }
</script>
```

### 文件上传事件

```vue
<template>
  <C_Form
    :options="formOptions"
    v-model="formData"
    @on-preview="handlePreview"
    @on-remove="handleRemove"
    @before-remove="handleBeforeRemove"
    @on-exceed="handleExceed"
    @on-success="handleUploadSuccess"
  />
</template>

<script setup>
  const handlePreview = file => {
    console.log('文件预览:', file)
  }

  const handleRemove = file => {
    console.log('文件移除:', file)
  }

  const handleBeforeRemove = file => {
    console.log('文件移除前:', file)
    return confirm(`确定移除文件 ${file.name}？`)
  }

  const handleExceed = (files, fileList) => {
    console.log('文件超出限制:', files, fileList)
  }

  const handleUploadSuccess = (response, file, fileList) => {
    console.log('上传成功:', response, file, fileList)
  }
</script>
```

## 🔧 高级用法

### 自定义验证规则

```javascript
import { PRESET_RULES, RULE_COMBOS } from '@/utils/v_verify'

// 使用预设规则
const formOptions = [
  {
    type: 'input',
    prop: 'username',
    label: '用户名',
    rules: RULE_COMBOS.username('用户名'),
  },
  {
    type: 'input',
    prop: 'email',
    label: '邮箱',
    rules: RULE_COMBOS.email('邮箱'),
  },
  {
    type: 'input',
    prop: 'phone',
    label: '手机号',
    rules: RULE_COMBOS.mobile('手机号'),
  },
]

// 自定义验证规则
const customRules = [
  {
    required: true,
    message: '请输入确认密码',
  },
  {
    validator: (rule, value) => {
      return new Promise((resolve, reject) => {
        if (value !== formData.value.password) {
          reject(new Error('两次输入的密码不一致'))
        } else {
          resolve()
        }
      })
    },
    trigger: 'blur',
  },
]
```

### 条件显示字段

```javascript
const formOptions = computed(() => [
  {
    type: 'radio',
    prop: 'userType',
    label: '用户类型',
    children: [
      { value: 'personal', label: '个人用户' },
      { value: 'company', label: '企业用户' },
    ],
  },
  {
    type: 'input',
    prop: 'personalId',
    label: '身份证号',
    placeholder: '请输入身份证号',
    show: formData.value.userType === 'personal',
  },
  {
    type: 'input',
    prop: 'companyName',
    label: '公司名称',
    placeholder: '请输入公司名称',
    show: formData.value.userType === 'company',
  },
  {
    type: 'input',
    prop: 'taxNumber',
    label: '税号',
    placeholder: '请输入税号',
    show: formData.value.userType === 'company',
  },
])
```

### 表单数据操作

```vue
<template>
  <C_Form
    ref="formRef"
    :options="formOptions"
    v-model="formData"
  />

  <div class="form-controls">
    <button @click="validateForm">验证表单</button>
    <button @click="resetForm">重置表单</button>
    <button @click="setFieldValue">设置字段值</button>
    <button @click="getFieldValue">获取字段值</button>
    <button @click="fillTestData">填充测试数据</button>
  </div>
</template>

<script setup>
  import { ref } from 'vue'

  const formRef = ref()
  const formData = ref({})

  // 验证表单
  const validateForm = async () => {
    try {
      await formRef.value.validate()
      console.log('验证通过')
    } catch (errors) {
      console.log('验证失败:', errors)
    }
  }

  // 验证指定字段
  const validateField = async field => {
    try {
      await formRef.value.validateField(field)
      console.log('字段验证通过')
    } catch (error) {
      console.log('字段验证失败:', error)
    }
  }

  // 重置表单
  const resetForm = () => {
    formRef.value.resetFields()
  }

  // 设置字段值
  const setFieldValue = async () => {
    await formRef.value.setFieldValue('username', 'newValue', true) // 第三个参数表示是否验证
  }

  // 获取字段值
  const getFieldValue = () => {
    const value = formRef.value.getFieldValue('username')
    console.log('字段值:', value)
  }

  // 批量设置字段值
  const setFieldsValue = async () => {
    await formRef.value.setFieldsValue(
      {
        username: 'admin',
        email: 'admin@example.com',
      },
      true
    ) // 第二个参数表示是否验证
  }

  // 获取完整表单数据
  const getFormModel = () => {
    const model = formRef.value.getModel()
    console.log('表单数据:', model)
  }

  // 清除验证状态
  const clearValidation = () => {
    formRef.value.clearValidation() // 清除所有验证
    // formRef.value.clearValidation('username') // 清除指定字段验证
    // formRef.value.clearValidation(['username', 'email']) // 清除多个字段验证
  }

  // 填充测试数据
  const fillTestData = () => {
    const testData = {
      username: 'testuser',
      email: 'test@example.com',
      phone: '13800138000',
      age: 25,
    }
    formRef.value.setFields(testData)
  }
</script>
```

### 自定义插槽

```vue
<template>
  <C_Form
    :options="formOptions"
    v-model="formData"
  >
    <!-- 自定义操作按钮 -->
    <template #action="{ validate, reset, model }">
      <div class="custom-actions">
        <n-button
          type="primary"
          @click="handleCustomSubmit(validate, model)"
        >
          自定义提交
        </n-button>
        <n-button @click="handleCustomReset(reset)"> 自定义重置 </n-button>
        <n-button
          type="info"
          @click="handlePreview(model)"
        >
          预览数据
        </n-button>
      </div>
    </template>

    <!-- 上传组件自定义插槽 -->
    <template #uploadClick>
      <n-button type="dashed">
        <template #icon>
          <UploadIcon />
        </template>
        选择文件上传
      </n-button>
    </template>

    <template #uploadTip>
      <div class="upload-tip">
        支持 jpg、png、pdf 格式，单个文件大小不超过 10MB
      </div>
    </template>
  </C_Form>
</template>

<script setup>
  const handleCustomSubmit = async (validate, model) => {
    try {
      await validate()
      console.log('自定义提交处理:', model)
      // 执行自定义提交逻辑
    } catch (error) {
      console.log('验证失败:', error)
    }
  }

  const handleCustomReset = reset => {
    if (confirm('确定要重置表单吗？')) {
      reset()
    }
  }

  const handlePreview = model => {
    console.log('预览数据:', model)
    // 显示预览弹窗
  }
</script>
```

## 🎨 样式自定义

### CSS 变量

```css
:root {
  --c-form-label-color: #333;
  --c-form-background: #fff;
  --c-form-border-color: #d9d9d9;
  --c-form-border-radius: 6px;
  --c-form-spacing: 16px;
}

.c-form {
  --label-color: var(--c-form-label-color);
  --background: var(--c-form-background);
  --border-color: var(--c-form-border-color);
  --border-radius: var(--c-form-border-radius);
  --spacing: var(--c-form-spacing);
}
```

### 响应式样式

```css
.c-form {
  /* 桌面端 */
  .n-form-item {
    margin-bottom: 24px;
  }

  /* 平板端 */
  @media (max-width: 768px) {
    .n-form-item {
      margin-bottom: 20px;
    }

    .grid-layout {
      grid-template-columns: 1fr !important;
    }
  }

  /* 移动端 */
  @media (max-width: 480px) {
    .n-form-item {
      margin-bottom: 16px;
    }

    .inline-layout {
      flex-direction: column;
      align-items: stretch;
    }
  }
}
```

## 📱 最佳实践

### 1. 表单设计原则

```javascript
// ✅ 推荐：清晰的字段标签和提示
const goodFormOptions = [
  {
    type: 'input',
    prop: 'email',
    label: '邮箱地址',
    placeholder: '请输入常用邮箱地址，用于接收通知',
    rules: [
      { required: true, message: '邮箱地址不能为空' },
      { type: 'email', message: '请输入正确的邮箱格式' },
    ],
  },
]

// ❌ 不推荐：模糊的标签和提示
const badFormOptions = [
  {
    type: 'input',
    prop: 'email',
    label: '邮箱',
    placeholder: '邮箱',
    rules: [{ required: true, message: '必填' }],
  },
]
```

### 2. 布局选择建议

```javascript
// 简单表单 -> 内联布局
const simpleSearch = {
  layoutType: 'inline',
  options: [
    { type: 'input', prop: 'keyword', label: '关键词' },
    { type: 'select', prop: 'category', label: '分类' },
  ],
}

// 标准表单 -> 默认或网格布局
const standardForm = {
  layoutType: 'grid',
  options: [
    { type: 'input', prop: 'name', label: '姓名', layout: { span: 12 } },
    { type: 'input', prop: 'phone', label: '手机', layout: { span: 12 } },
  ],
}

// 复杂表单 -> 标签页或步骤布局
const complexForm = {
  layoutType: 'tabs',
  options: [
    { type: 'input', prop: 'name', label: '姓名', layout: { tab: 'basic' } },
    {
      type: 'input',
      prop: 'address',
      label: '地址',
      layout: { tab: 'contact' },
    },
  ],
}
```

### 3. 性能优化

```vue
<script setup>
  import { computed, markRaw } from 'vue'

  // 使用 computed 优化大型表单选项
  const formOptions = computed(() => {
    return markRaw(generateFormOptions()) // 使用 markRaw 避免深度响应式
  })

  // 大型选项数据使用 shallowRef
  const categoryOptions = shallowRef([
    // 大量选项数据
  ])

  // 避免在模板中直接计算
  const visibleFields = computed(() => {
    return formOptions.value.filter(field => field.show !== false)
  })
</script>
```

### 4. 错误处理

```javascript
// 全局错误处理
const handleValidateError = errors => {
  // 提取第一个错误信息显示
  if (Array.isArray(errors) && errors.length > 0) {
    const firstError = errors[0]
    message.error(firstError.message || '表单验证失败')
  }

  // 记录详细错误信息
  console.error('Form validation errors:', errors)
}

// 异步验证错误处理
const asyncValidator = (rule, value) => {
  return new Promise((resolve, reject) => {
    // 模拟异步验证
    setTimeout(() => {
      if (value === 'admin') {
        reject(new Error('用户名已存在'))
      } else {
        resolve()
      }
    }, 1000)
  })
}
```

## 📚 API 参考

### 组件方法

| 方法名          | 参数                                                | 返回值             | 说明           |
| --------------- | --------------------------------------------------- | ------------------ | -------------- |
| validate        | -                                                   | Promise\<void\>    | 验证整个表单   |
| validateField   | field: string \| string[]                           | Promise\<void\>    | 验证指定字段   |
| validateStep    | stepIndex: number                                   | Promise\<boolean\> | 验证指定步骤   |
| validateTab     | tabKey: string                                      | Promise\<boolean\> | 验证指定标签页 |
| clearValidation | field?: string \| string[]                          | void               | 清除验证状态   |
| resetFields     | -                                                   | void               | 重置表单       |
| setFields       | fields: FormModel                                   | void               | 设置表单数据   |
| getModel        | -                                                   | FormModel          | 获取表单数据   |
| setFieldValue   | field: string, value: any, shouldValidate?: boolean | Promise\<void\>    | 设置字段值     |
| getFieldValue   | field: string                                       | any                | 获取字段值     |
| setFieldsValue  | fields: FormModel, shouldValidate?: boolean         | Promise\<void\>    | 批量设置字段值 |

### 组件属性

| 属性名        | 类型            | 默认值 | 说明           |
| ------------- | --------------- | ------ | -------------- |
| formRef       | Ref\<FormInst\> | -      | 表单实例引用   |
| formModel     | FormModel       | -      | 表单数据模型   |
| layoutType    | LayoutType      | -      | 当前布局类型   |
| isStepsLayout | boolean         | -      | 是否为步骤布局 |

## 🐛 常见问题

### Q: 如何实现字段的条件显示？

A: 使用计算属性动态生成表单选项：

```javascript
const formOptions = computed(() => {
  const baseOptions = [
    {
      type: 'select',
      prop: 'type',
      label: '类型',
      children: [
        { value: 'personal', label: '个人' },
        { value: 'company', label: '企业' },
      ],
    },
  ]

  if (formData.value.type === 'company') {
    baseOptions.push({
      type: 'input',
      prop: 'companyName',
      label: '公司名称',
      placeholder: '请输入公司名称',
    })
  }

  return baseOptions
})
```

### Q: 如何自定义验证规则？

A: 使用 validator 函数：

```javascript
const customRule = {
  validator: (rule, value) => {
    return new Promise((resolve, reject) => {
      if (!value || value.length < 6) {
        reject(new Error('密码长度至少6位'))
      } else {
        resolve()
      }
    })
  },
  trigger: 'blur',
}
```

### Q: 如何处理文件上传？

A: 配置上传组件属性：

```javascript
{
  type: 'upload',
  prop: 'files',
  label: '文件上传',
  attrs: {
    action: '/api/upload',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    data: {
      folder: 'documents'
    },
    beforeUpload: (file) => {
      const isValidType = ['image/jpeg', 'image/png'].includes(file.type)
      if (!isValidType) {
        message.error('只支持 JPG/PNG 格式')
        return false
      }
      return true
    }
  }
}
```

### Q: 如何实现表单的国际化？

A: 使用 i18n 配置：

```javascript
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const formOptions = [
  {
    type: 'input',
    prop: 'username',
    label: t('form.username'),
    placeholder: t('form.usernamePlaceholder'),
    rules: [{ required: true, message: t('form.usernameRequired') }],
  },
]
```

## 📄 更新日志

### v2.0.0

- 🎉 新增动态布局支持
- 🎨 重构布局配置系统
- 🐛 修复网格布局响应式问题
- ⚡ 优化渲染性能

### v1.5.0

- 🆕 新增自定义渲染布局
- 🔧 优化验证机制
- 📱 改进移动端适配

### v1.0.0

- 🎉 首次发布
- 🎨 支持8种布局类型
- 🧩 支持15+表单控件
- ✅ 完善的验证系统

## 📞 技术支持

如有问题或建议，请通过以下方式联系：

- 📧 Email: ycyplus@gmail.com
- 🐛 Issue: [GitHub Issues](https://github.com/your-repo/issues)
- 📖 文档: [在线文档](https://your-docs-site.com)

## 📜 许可证

Copyright (c) 2025 by CHENY, All Rights Reserved 😎

---

_最后更新时间: 2025-06-01_
