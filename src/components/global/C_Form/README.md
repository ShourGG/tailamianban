# C_Form 通用表单组件

一个基于 Vue 3 + Naive UI 的高度可定制化通用表单组件，支持多种布局模式、动态渲染和丰富的表单控件类型。

## ✨ 特性

- 🎨 **多种布局模式** - 支持默认、内联、网格、卡片、标签页、步骤、动态、自定义8种布局
- 🔧 **丰富的表单控件** - 内置15+种常用表单控件，支持自定义扩展
- ⚡ **动态表单** - 支持运行时动态添加、删除、切换表单字段
- 📝 **完整的验证体系** - 基于规则的表单验证，支持字段级、分组级验证
- 🎯 **TypeScript支持** - 完整的类型定义，提供良好的开发体验
- 📱 **响应式设计** - 自适应不同屏幕尺寸
- 🔌 **插槽支持** - 支持自定义操作按钮、上传触发器等

## 📦 安装

```bash
# 确保已安装依赖
npm install vue@^3.5.0
npm install naive-ui
```

## 🚀 基本用法

### 简单表单

```vue
<template>
  <C_Form
    :options="formOptions"
    @submit="handleSubmit"
  />
</template>

<script setup>
  import { ref } from 'vue'

  const formOptions = ref([
    {
      label: '用户名',
      prop: 'username',
      type: 'input',
      placeholder: '请输入用户名',
      rules: [{ required: true, message: '用户名不能为空' }],
    },
    {
      label: '邮箱',
      prop: 'email',
      type: 'input',
      placeholder: '请输入邮箱',
      rules: [
        { required: true, message: '邮箱不能为空' },
        { type: 'email', message: '请输入正确的邮箱格式' },
      ],
    },
  ])

  const handleSubmit = ({ model }) => {
    console.log('表单数据:', model)
  }
</script>
```

### 网格布局表单

```vue
<template>
  <C_Form
    layout-type="grid"
    :layout-config="gridConfig"
    :options="formOptions"
  />
</template>

<script setup>
  const gridConfig = {
    columns: 2,
    gap: 16,
  }

  const formOptions = [
    { label: '姓名', prop: 'name', type: 'input' },
    { label: '年龄', prop: 'age', type: 'inputNumber' },
    {
      label: '性别',
      prop: 'gender',
      type: 'radio',
      children: [
        { label: '男', value: 'male' },
        { label: '女', value: 'female' },
      ],
    },
    {
      label: '爱好',
      prop: 'hobbies',
      type: 'checkbox',
      children: [
        { label: '读书', value: 'reading' },
        { label: '运动', value: 'sports' },
        { label: '音乐', value: 'music' },
      ],
    },
  ]
</script>
```

### 步骤式表单

```vue
<template>
  <C_Form
    layout-type="steps"
    :layout-config="stepsConfig"
    :options="formOptions"
    @step-change="handleStepChange"
  />
</template>

<script setup>
  const stepsConfig = {
    steps: [
      { key: 'basic', title: '基本信息' },
      { key: 'contact', title: '联系方式' },
      { key: 'additional', title: '补充信息' },
    ],
  }

  const formOptions = [
    // 第一步：基本信息
    {
      label: '姓名',
      prop: 'name',
      type: 'input',
      layout: { step: 'basic' },
    },
    {
      label: '年龄',
      prop: 'age',
      type: 'inputNumber',
      layout: { step: 'basic' },
    },
    // 第二步：联系方式
    {
      label: '手机号',
      prop: 'phone',
      type: 'input',
      layout: { step: 'contact' },
    },
    {
      label: '邮箱',
      prop: 'email',
      type: 'input',
      layout: { step: 'contact' },
    },
    // 第三步：补充信息
    {
      label: '备注',
      prop: 'remark',
      type: 'textarea',
      layout: { step: 'additional' },
    },
  ]
</script>
```

## 📋 Props

| 属性名                  | 类型             | 默认值      | 说明                 |
| ----------------------- | ---------------- | ----------- | -------------------- |
| `options`               | `FormOption[]`   | `[]`        | 表单配置项数组       |
| `layoutType`            | `LayoutType`     | `'default'` | 布局类型             |
| `layoutConfig`          | `LayoutConfig`   | `{}`        | 布局配置             |
| `modelValue`            | `FormModel`      | `{}`        | 表单数据（v-model）  |
| `validateOnValueChange` | `boolean`        | `false`     | 值改变时是否触发验证 |
| `labelPlacement`        | `string`         | `'left'`    | 标签位置             |
| `labelWidth`            | `string\|number` | `'auto'`    | 标签宽度             |
| `showRequireMark`       | `boolean`        | `true`      | 是否显示必填标记     |
| `size`                  | `string`         | `'medium'`  | 组件尺寸             |
| `disabled`              | `boolean`        | `false`     | 是否禁用             |
| `readonly`              | `boolean`        | `false`     | 是否只读             |

### FormOption 配置

```typescript
interface FormOption {
  label: string // 字段标签
  prop: string // 字段属性名
  type: ComponentType // 组件类型
  value?: any // 默认值
  placeholder?: string // 占位符
  rules?: FormRule[] // 验证规则
  attrs?: Record<string, any> // 组件属性
  children?: OptionItem[] // 子选项（select、radio、checkbox）
  show?: boolean // 是否显示
  layout?: {
    // 布局配置
    step?: string // 步骤标识
    tab?: string // 标签页标识
    group?: string // 分组标识
    dynamic?: boolean // 是否为动态字段
  }
}
```

### 支持的组件类型

| 类型          | 说明         | 示例           |
| ------------- | ------------ | -------------- |
| `input`       | 文本输入框   | 用户名、密码等 |
| `textarea`    | 多行文本     | 备注、描述等   |
| `inputNumber` | 数字输入     | 年龄、价格等   |
| `select`      | 下拉选择     | 城市、分类等   |
| `radio`       | 单选框组     | 性别、状态等   |
| `checkbox`    | 复选框组     | 爱好、权限等   |
| `switch`      | 开关         | 启用/禁用      |
| `slider`      | 滑块         | 进度、评分等   |
| `rate`        | 评分         | 满意度评分     |
| `datePicker`  | 日期选择     | 生日、创建时间 |
| `daterange`   | 日期范围     | 开始-结束时间  |
| `timePicker`  | 时间选择     | 具体时间点     |
| `cascader`    | 级联选择     | 省市区选择     |
| `colorPicker` | 颜色选择     | 主题颜色       |
| `upload`      | 文件上传     | 头像、附件等   |
| `editor`      | 富文本编辑器 | 文章内容       |

## 🎨 布局类型

### 1. default - 默认布局

垂直排列的标准表单布局。

### 2. inline - 内联布局

水平排列的紧凑布局。

### 3. grid - 网格布局

```javascript
const gridConfig = {
  columns: 2, // 列数
  gap: 16, // 间距
  responsive: true, // 响应式
}
```

### 4. card - 卡片布局

```javascript
const cardConfig = {
  title: '用户信息',
  bordered: true,
  hoverable: false,
}
```

### 5. tabs - 标签页布局

```javascript
const tabsConfig = {
  tabs: [
    { key: 'basic', title: '基本信息' },
    { key: 'advance', title: '高级设置' },
  ],
  type: 'line',
  animated: true,
}
```

### 6. steps - 步骤布局

```javascript
const stepsConfig = {
  steps: [
    { key: 'step1', title: '第一步', description: '填写基本信息' },
    { key: 'step2', title: '第二步', description: '完善详细信息' },
  ],
  direction: 'horizontal',
  allowPrevious: true,
}
```

### 7. dynamic - 动态布局

支持运行时添加、删除字段的布局。

### 8. custom - 自定义布局

完全自定义的布局方式。

## 📡 Events

| 事件名               | 参数                      | 说明             |
| -------------------- | ------------------------- | ---------------- |
| `submit`             | `{ model, form }`         | 表单提交事件     |
| `update:modelValue`  | `FormModel`               | 数据更新事件     |
| `validate-success`   | `FormModel`               | 验证成功事件     |
| `validate-error`     | `errors`                  | 验证失败事件     |
| `tab-change`         | `tabKey`                  | 标签页切换事件   |
| `step-change`        | `stepIndex, stepKey`      | 步骤切换事件     |
| `step-before-change` | `currentStep, targetStep` | 步骤切换前事件   |
| `step-validate`      | `stepIndex`               | 步骤验证事件     |
| `field-add`          | `fieldConfig`             | 动态字段添加事件 |
| `field-remove`       | `fieldId`                 | 动态字段删除事件 |
| `field-toggle`       | `fieldId, visible`        | 字段显示切换事件 |
| `editor-mounted`     | `{ editor, prop, html }`  | 编辑器挂载事件   |

## 🔧 方法

通过 ref 可以调用以下方法：

```vue
<template>
  <C_Form
    ref="formRef"
    :options="options"
  />
</template>

<script setup>
  import { ref } from 'vue'

  const formRef = ref()

  // 验证整个表单
  const handleValidate = async () => {
    try {
      await formRef.value.validate()
      console.log('验证通过')
    } catch (error) {
      console.log('验证失败', error)
    }
  }

  // 验证指定字段
  const validateField = async () => {
    await formRef.value.validateField('username')
  }

  // 重置表单
  const resetForm = () => {
    formRef.value.resetFields()
  }

  // 设置字段值
  const setFieldValue = () => {
    formRef.value.setFieldValue('username', 'admin')
  }

  // 获取表单数据
  const getFormData = () => {
    const data = formRef.value.getModel()
    console.log(data)
  }
</script>
```

### 可用方法列表

| 方法名                                   | 参数                    | 返回值             | 说明           |
| ---------------------------------------- | ----------------------- | ------------------ | -------------- |
| `validate()`                             | -                       | `Promise<void>`    | 验证整个表单   |
| `validateField(field)`                   | `string\|string[]`      | `Promise<void>`    | 验证指定字段   |
| `validateStep(stepIndex)`                | `number`                | `Promise<boolean>` | 验证指定步骤   |
| `validateTab(tabKey)`                    | `string`                | `Promise<boolean>` | 验证指定标签页 |
| `clearValidation(field?)`                | `string\|string[]?`     | `void`             | 清除验证状态   |
| `resetFields()`                          | -                       | `void`             | 重置表单       |
| `setFields(fields)`                      | `FormModel`             | `void`             | 设置表单数据   |
| `getModel()`                             | -                       | `FormModel`        | 获取表单数据   |
| `setFieldValue(field, value, validate?)` | `string, any, boolean?` | `Promise<void>`    | 设置字段值     |
| `getFieldValue(field)`                   | `string`                | `any`              | 获取字段值     |

## 🎯 高级用法

### 1. 自定义验证规则

```javascript
const customRule = {
  validator: (rule, value) => {
    if (!value) {
      return new Error('字段不能为空')
    }
    if (value.length < 6) {
      return new Error('长度不能少于6位')
    }
    return true
  },
  trigger: ['blur', 'input'],
}

const formOptions = [
  {
    label: '密码',
    prop: 'password',
    type: 'input',
    rules: [customRule],
  },
]
```

### 2. 动态控制字段显示

```javascript
const formOptions = ref([
  {
    label: '用户类型',
    prop: 'userType',
    type: 'select',
    children: [
      { label: '个人用户', value: 'personal' },
      { label: '企业用户', value: 'company' },
    ],
  },
  {
    label: '公司名称',
    prop: 'companyName',
    type: 'input',
    show: computed(() => formData.userType === 'company'),
  },
])
```

### 3. 文件上传配置

```javascript
const uploadOption = {
  label: '头像',
  prop: 'avatar',
  type: 'upload',
  attrs: {
    action: '/api/upload',
    headers: {
      authorization: 'Bearer token',
    },
    data: {
      type: 'avatar',
    },
    accept: 'image/*',
    listType: 'image-card',
    max: 1,
  },
}
```

### 4. 富文本编辑器

```javascript
const editorOption = {
  label: '文章内容',
  prop: 'content',
  type: 'editor',
  attrs: {
    height: 400,
    toolbar: [
      'bold',
      'italic',
      'underline',
      'strikethrough',
      'heading',
      'blockquote',
      'code-block',
      'ordered-list',
      'bullet-list',
      'link',
      'image',
      'table',
    ],
  },
}
```

### 5. 响应式网格布局

```javascript
const responsiveGridConfig = {
  columns: {
    xs: 1, // 超小屏幕
    sm: 2, // 小屏幕
    md: 3, // 中等屏幕
    lg: 4, // 大屏幕
    xl: 5, // 超大屏幕
  },
  gap: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
  },
}
```

## 🎨 自定义插槽

### 操作按钮插槽

```vue
<template>
  <C_Form :options="options">
    <template #action="{ validate, reset, model }">
      <n-space>
        <n-button
          type="primary"
          @click="handleCustomSubmit(validate, model)"
        >
          自定义提交
        </n-button>
        <n-button @click="reset">重置</n-button>
        <n-button
          type="info"
          @click="handlePreview(model)"
        >
          预览
        </n-button>
      </n-space>
    </template>
  </C_Form>
</template>
```

### 上传组件插槽

```vue
<template>
  <C_Form :options="options">
    <template #uploadClick>
      <n-button>
        <template #icon>
          <Icon name="upload" />
        </template>
        选择文件
      </n-button>
    </template>

    <template #uploadTip>
      <div class="upload-tip"> 支持 jpg、png 格式，大小不超过 2MB </div>
    </template>
  </C_Form>
</template>
```

## 🔍 最佳实践

### 1. 表单配置管理

建议将复杂的表单配置单独管理：

```javascript
// formConfigs/userForm.js
export const userFormOptions = [
  {
    label: '用户名',
    prop: 'username',
    type: 'input',
    rules: [{ required: true, message: '请输入用户名' }],
  },
  // ... 更多配置
]

export const userFormLayouts = {
  grid: {
    columns: 2,
    gap: 16,
  },
  steps: {
    steps: [
      { key: 'basic', title: '基本信息' },
      { key: 'detail', title: '详细信息' },
    ],
  },
}
```

### 2. 类型安全

使用 TypeScript 确保类型安全：

```typescript
import type { FormOption, LayoutConfig } from '@/types/modules/form'

const formOptions: FormOption[] = [
  // 配置项会有完整的类型提示
]

const layoutConfig: LayoutConfig = {
  // 布局配置也会有类型检查
}
```

### 3. 性能优化

对于大型表单，考虑使用 `shallowRef` 和 `markRaw`：

```javascript
import { shallowRef, markRaw } from 'vue'

const formOptions = shallowRef(
  markRaw([
    // 大量表单配置
  ])
)
```

## 🐛 常见问题

### Q: 如何实现字段联动？

A: 使用 computed 属性和 watch 监听：

```javascript
const formData = reactive({})

const formOptions = computed(() => [
  {
    label: '省份',
    prop: 'province',
    type: 'select',
    children: provinces,
  },
  {
    label: '城市',
    prop: 'city',
    type: 'select',
    children: getCitiesByProvince(formData.province),
    show: !!formData.province,
  },
])
```

### Q: 如何自定义表单控件？

A: 通过 attrs 传递自定义组件：

```javascript
{
  label: '自定义控件',
  prop: 'custom',
  type: 'input', // 基础类型
  attrs: {
    // 会传递给 NInput 组件的所有属性
    renderPrefix: () => h(NIcon, { component: UserIcon })
  }
}
```

### Q: 如何处理异步验证？

A: 在验证规则中使用 Promise：

```javascript
{
  validator: async (rule, value) => {
    if (!value) return true

    const response = await checkUsername(value)
    if (!response.available) {
      throw new Error('用户名已存在')
    }
    return true
  },
  trigger: 'blur'
}
```

## 📄 许可证

Copyright (c) 2025 by CHENY, All Rights Reserved 😎

---

如有问题或建议，欢迎提交 Issue 或 Pull Request！
