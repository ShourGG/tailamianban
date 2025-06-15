# C_Table 超级表格组件

一个功能强大、易用的 Vue 3 表格组件，支持多种编辑模式，让你的数据管理变得简单高效。

## 🚀 特性

- **多种编辑模式** - 行编辑、单元格编辑、模态框编辑，想怎么编辑就怎么编辑
- **开箱即用** - 简单配置即可使用，复杂场景也能轻松应对
- **类型安全** - 完整的 TypeScript 支持
- **表单验证** - 集成 v_verify 验证系统
- **自定义渲染** - 灵活的单元格和操作按钮自定义

## 📦 基础用法

最简单的用法，5分钟上手：

```vue
<template>
  <C_Table
    v-model:data="tableData"
    :columns="columns"
  />
</template>

<script setup>
  const tableData = ref([
    { id: 1, name: '张三', age: 25, email: 'zhangsan@example.com' },
    { id: 2, name: '李四', age: 30, email: 'lisi@example.com' },
  ])

  const columns = [
    { key: 'name', title: '姓名', editable: true },
    { key: 'age', title: '年龄', editable: true, editType: 'number' },
    { key: 'email', title: '邮箱', editable: true },
  ]
</script>
```

## 🎯 编辑模式

### 1. 模态框编辑（推荐）

最优雅的编辑方式，表单验证、防抖、加载状态全自动：

```vue
<C_Table
  v-model:data="tableData"
  :columns="columns"
  edit-mode="modal"
  modal-title="编辑员工信息"
  :modal-width="700"
  @save="handleSave"
/>
```

**适用场景**：复杂表单、需要验证的场景

### 2. 行编辑模式

点击编辑按钮，整行变成编辑状态：

```vue
<C_Table v-model:data="tableData" :columns="columns" edit-mode="row" />
```

**适用场景**：需要同时编辑多个字段

### 3. 单元格编辑模式

悬停显示编辑图标，点击编辑单个字段：

```vue
<C_Table v-model:data="tableData" :columns="columns" edit-mode="cell" />
```

**适用场景**：快速修改单个字段

### 4. 混合模式

同时支持行编辑和单元格编辑：

```vue
<C_Table v-model:data="tableData" :columns="columns" edit-mode="both" />
```

**适用场景**：需要最大灵活性

### 5. 只读模式

完全禁用编辑功能：

```vue
<C_Table v-model:data="tableData" :columns="columns" edit-mode="none" />
```

## 📋 列配置详解

### 基础列配置

```javascript
const columns = [
  {
    key: 'name', // 字段名
    title: '姓名', // 列标题
    width: 120, // 列宽度
    editable: true, // 是否可编辑
    required: true, // 是否必填
  },
]
```

### 不同输入类型

```javascript
const columns = [
  // 文本输入
  {
    key: 'name',
    title: '姓名',
    editable: true,
    editProps: {
      placeholder: '请输入姓名',
      rules: [PRESET_RULES.length('姓名', 2, 20)],
    },
  },

  // 数字输入
  {
    key: 'age',
    title: '年龄',
    editable: true,
    editType: 'number',
    editProps: {
      min: 18,
      max: 65,
      step: 1,
    },
  },

  // 下拉选择
  {
    key: 'department',
    title: '部门',
    editable: true,
    editType: 'select',
    editProps: {
      options: [
        { label: '技术部', value: 'tech' },
        { label: '人事部', value: 'hr' },
      ],
    },
  },

  // 日期选择
  {
    key: 'joinDate',
    title: '入职日期',
    editable: true,
    editType: 'date',
    editProps: {
      format: 'yyyy-MM-dd',
      valueFormat: 'timestamp',
    },
  },

  // 多行文本
  {
    key: 'description',
    title: '描述',
    editable: true,
    editProps: {
      type: 'textarea',
      rows: 3,
      placeholder: '请输入描述',
    },
  },
]
```

### 自定义渲染

```javascript
const columns = [
  {
    key: 'status',
    title: '状态',
    render: row => {
      const statusMap = { active: '在职', inactive: '离职' }
      return statusMap[row.status] || row.status
    },
  },

  {
    key: 'avatar',
    title: '头像',
    render: row =>
      h('img', {
        src: row.avatar,
        style: { width: '40px', height: '40px', borderRadius: '50%' },
      }),
  },
]
```

## 🔧 操作按钮配置

### 基础操作

```javascript
const rowActions = [
  {
    label: '查看',
    icon: 'i-mdi:eye',
    type: 'info',
    onClick: (row, index) => {
      // 查看详情，组件会自动处理
    },
  },

  {
    label: '复制',
    icon: 'i-mdi:content-copy',
    type: 'default',
    onClick: (row, index) => {
      const newRow = { ...row, id: Date.now(), name: `${row.name}_副本` }
      tableData.value.splice(index + 1, 0, newRow)
    },
  },

  {
    label: '删除',
    icon: 'i-mdi:delete',
    type: 'error',
    onClick: (row, index) => {
      if (confirm(`确定删除 ${row.name} 吗？`)) {
        tableData.value.splice(index, 1)
      }
    },
  },
]
```

### 条件显示操作

```javascript
const rowActions = [
  {
    label: '启用',
    icon: 'i-mdi:check-circle',
    type: 'success',
    show: row => row.status === 'inactive', // 只在禁用时显示
    onClick: row => {
      row.status = 'active'
    },
  },
]
```

## 🎨 完整示例

```vue
<template>
  <C_Table
    ref="tableRef"
    v-model:data="tableData"
    :columns="tableColumns"
    :loading="loading"
    :row-actions="tableRowActions"
    edit-mode="modal"
    modal-title="编辑员工信息"
    :modal-width="700"
    @save="handleSave"
    @cancel="handleCancel"
  />
</template>

<script setup>
  import { PRESET_RULES } from '@/utils/v_verify'

  const message = useMessage()
  const loading = ref(false)
  const tableRef = ref()

  // 数据
  const tableData = ref([
    {
      id: 1,
      name: '张三',
      age: 28,
      email: 'zhangsan@example.com',
      department: 'tech',
      status: 'active',
    },
  ])

  // 列配置
  const tableColumns = [
    {
      key: 'name',
      title: '姓名',
      editable: true,
      required: true,
      editProps: {
        rules: [PRESET_RULES.length('姓名', 2, 20)],
      },
    },
    {
      key: 'age',
      title: '年龄',
      editable: true,
      editType: 'number',
      editProps: { min: 18, max: 65 },
    },
    {
      key: 'email',
      title: '邮箱',
      editable: true,
      required: true,
    },
  ]

  // 操作按钮
  const tableRowActions = [
    {
      label: '查看',
      icon: 'i-mdi:eye',
      type: 'info',
      onClick: () => {}, // 组件内部处理
    },
    {
      label: '删除',
      icon: 'i-mdi:delete',
      type: 'error',
      onClick: (row, index) => {
        tableData.value.splice(index, 1)
        message.success('删除成功')
      },
    },
  ]

  // 保存处理
  const handleSave = async (rowData, rowIndex, columnKey) => {
    loading.value = true
    try {
      // 模拟 API 调用
      await new Promise(resolve => setTimeout(resolve, 500))
      message.success('保存成功')
    } catch (error) {
      message.error('保存失败')
      throw error
    } finally {
      loading.value = false
    }
  }

  // 取消处理
  const handleCancel = () => {
    message.info('已取消编辑')
  }

  // 添加新行
  const addNewRow = () => {
    const newRow = {
      id: Date.now(),
      name: '',
      age: 25,
      email: '',
      department: 'tech',
      status: 'active',
    }
    tableData.value.unshift(newRow)

    // 自动开始编辑
    setTimeout(() => {
      tableRef.value?.startEdit(newRow.id)
    }, 100)
  }
</script>
```

## 📝 Props 配置

| 属性          | 类型      | 默认值       | 说明                                                   |
| ------------- | --------- | ------------ | ------------------------------------------------------ |
| `data`        | `Array`   | `[]`         | 表格数据                                               |
| `columns`     | `Array`   | `[]`         | 列配置                                                 |
| `loading`     | `Boolean` | `false`      | 加载状态                                               |
| `edit-mode`   | `String`  | `'both'`     | 编辑模式：`'row'` `'cell'` `'both'` `'modal'` `'none'` |
| `editable`    | `Boolean` | `true`       | 是否可编辑                                             |
| `row-actions` | `Array`   | `[]`         | 行操作配置                                             |
| `modal-title` | `String`  | `'编辑数据'` | 模态框标题                                             |
| `modal-width` | `Number`  | `600`        | 模态框宽度                                             |

## 🔗 事件

| 事件名        | 参数                              | 说明           |
| ------------- | --------------------------------- | -------------- |
| `save`        | `(rowData, rowIndex, columnKey?)` | 保存时触发     |
| `cancel`      | `(rowData, rowIndex)`             | 取消时触发     |
| `update:data` | `(newData)`                       | 数据更新时触发 |

## 🛠 方法

| 方法名       | 参数                   | 说明             |
| ------------ | ---------------------- | ---------------- |
| `startEdit`  | `(rowKey, columnKey?)` | 开始编辑         |
| `saveEdit`   | -                      | 保存当前编辑     |
| `cancelEdit` | -                      | 取消当前编辑     |
| `isEditing`  | `(rowKey, columnKey?)` | 检查是否正在编辑 |

## 💡 实用技巧

### 1. 快速上手

从最简单的配置开始，逐步添加功能：

```javascript
// 第一步：基础表格
const columns = [
  { key: 'name', title: '姓名' },
  { key: 'age', title: '年龄' },
]

// 第二步：添加编辑
const columns = [
  { key: 'name', title: '姓名', editable: true },
  { key: 'age', title: '年龄', editable: true, editType: 'number' },
]

// 第三步：添加验证
const columns = [
  {
    key: 'name',
    title: '姓名',
    editable: true,
    editProps: { rules: [PRESET_RULES.required('姓名')] },
  },
]
```

### 2. 性能优化

对于大量数据，使用 `computed` 来优化列配置：

```javascript
const tableColumns = computed(() => {
  return baseColumns.map(col => ({
    ...col,
    render: col.render || (row => row[col.key]),
  }))
})
```

### 3. 数据同步

使用 `v-model:data` 实现双向绑定：

```vue
<C_Table v-model:data="tableData" />
```

这样数据会自动同步，无需手动处理 `update:data` 事件。

### 4. 错误处理

在 `save` 事件中抛出错误来阻止保存：

```javascript
const handleSave = async (rowData, rowIndex) => {
  try {
    await validateData(rowData)
    await saveToAPI(rowData)
  } catch (error) {
    message.error(error.message)
    throw error // 阻止保存
  }
}
```

## 🤔 常见问题

**Q: 如何自定义编辑组件？**

A: 使用 `editRender` 属性：

```javascript
{
  key: 'custom',
  title: '自定义',
  editRender: (value, record, index) => {
    return h(MyCustomComponent, {
      value,
      'onUpdate:value': (val) => { /* 更新逻辑 */ }
    })
  }
}
```

**Q: 如何控制哪些行可以编辑？**

A: 在列配置中使用函数：

```javascript
{
  key: 'name',
  title: '姓名',
  editable: (row) => row.status !== 'locked'
}
```

**Q: 如何自定义保存逻辑？**

A: 监听 `save` 事件并处理异步逻辑：

```javascript
const handleSave = async (rowData, rowIndex, columnKey) => {
  // 你的保存逻辑
  await api.updateRecord(rowData)
  message.success('保存成功')
}
```

---

这个组件让表格编辑变得简单而强大。从基础用法开始，根据需要逐步添加功能。有问题随时查看这个文档！ 🎉
