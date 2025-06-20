<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-20 16:20:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-20 17:14:49
 * @FilePath: \Robot_Admin\src\views\demo\15-markdown-editor\index.vue
 * @Description: Markdown 编辑器演示页面
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="markdown-demo-page">
    <NCard
      title="📝 Markdown 编辑器演示"
      class="demo-header"
    >
      <p>基于 Vue 的 Markdown 编辑器，支持实时预览、语法高亮、图片上传等功能</p>
    </NCard>

    <NTabs
      v-model:value="activeTab"
      type="segment"
      animated
    >
      <!-- 基础用法 -->
      <NTabPane
        name="basic"
        tab="🔧 基础用法"
      >
        <NCard
          title="基础编辑器"
          class="demo-card"
        >
          <template #header-extra>
            <NSpace>
              <NButton
                @click="insertTemplate"
                type="primary"
                size="small"
              >
                插入模板
              </NButton>
              <NButton
                @click="clearContent"
                type="warning"
                size="small"
              >
                清空内容
              </NButton>
            </NSpace>
          </template>

          <C_Markdown
            ref="basicEditorRef"
            v-model="basicContent"
            height="500px"
            placeholder="请输入你的 Markdown 内容..."
            :auto-save="true"
            :auto-save-interval="10000"
            @change="handleBasicChange"
            @save="handleBasicSave"
            @upload-image="handleUploadImage"
            @auto-save="handleAutoSave"
            @word-count-change="handleWordCountChange"
          />

          <div class="editor-info">
            <NSpace>
              <NTag
                :bordered="false"
                type="info"
              >
                字数: {{ wordCount }}
              </NTag>
              <NTag
                :bordered="false"
                type="success"
                v-if="lastSaveTime"
              >
                最后保存: {{ lastSaveTime }}
              </NTag>
              <NTag
                :bordered="false"
                type="warning"
                v-if="lastAutoSaveTime"
              >
                自动保存: {{ lastAutoSaveTime }}
              </NTag>
            </NSpace>
          </div>
        </NCard>
      </NTabPane>

      <!-- 表单集成 -->
      <NTabPane
        name="form"
        tab="📋 表单集成"
      >
        <NCard
          title="文章编辑表单"
          class="demo-card"
        >
          <NForm
            ref="formRef"
            :model="articleForm"
            :rules="formRules"
            label-placement="top"
          >
            <NFormItem
              label="文章标题"
              path="title"
            >
              <NInput
                v-model:value="articleForm.title"
                placeholder="请输入文章标题"
                :maxlength="100"
                show-count
              />
            </NFormItem>

            <NFormItem
              label="文章摘要"
              path="summary"
            >
              <NInput
                v-model:value="articleForm.summary"
                type="textarea"
                placeholder="请输入文章摘要"
                :rows="3"
                :maxlength="200"
                show-count
              />
            </NFormItem>

            <NFormItem
              label="文章分类"
              path="category"
            >
              <NSelect
                v-model:value="articleForm.category"
                placeholder="请选择文章分类"
                :options="categoryOptions"
              />
            </NFormItem>

            <NFormItem
              label="文章标签"
              path="tags"
            >
              <NDynamicTags v-model:value="articleForm.tags" />
            </NFormItem>

            <NFormItem
              label="文章内容"
              path="content"
            >
              <C_Markdown
                v-model="articleForm.content"
                height="400px"
                placeholder="请输入文章内容..."
                :max-length="20000"
                @change="handleFormContentChange"
                @max-length-exceeded="handleMaxLengthExceeded"
                @word-count-change="handleFormWordCountChange"
              />
              <div class="form-word-count">
                <NSpace justify="space-between">
                  <NTag
                    :bordered="false"
                    type="info"
                    size="small"
                  >
                    字数统计: {{ formWordCount }} / 20000
                  </NTag>
                  <NTag
                    :bordered="false"
                    :type="
                      formWordCount > 18000
                        ? 'warning'
                        : formWordCount > 19000
                          ? 'error'
                          : 'success'
                    "
                    size="small"
                  >
                    {{
                      formWordCount <= 19000
                        ? '字数正常'
                        : formWordCount <= 19500
                          ? '接近上限'
                          : '即将超出'
                    }}
                  </NTag>
                </NSpace>
              </div>
            </NFormItem>

            <NFormItem>
              <NSpace>
                <NButton
                  type="primary"
                  @click="submitForm"
                  :loading="submitting"
                >
                  发布文章
                </NButton>
                <NButton
                  @click="saveAsDraft"
                  :loading="savingDraft"
                >
                  保存草稿
                </NButton>
                <NButton @click="previewArticle"> 预览文章 </NButton>
                <NButton @click="resetForm"> 重置表单 </NButton>
              </NSpace>
            </NFormItem>
          </NForm>
        </NCard>
      </NTabPane>

      <!-- 不同模式 -->
      <NTabPane
        name="modes"
        tab="🎨 不同模式"
      >
        <NSpace
          vertical
          :size="24"
        >
          <!-- 编辑模式 -->
          <NCard
            title="编辑模式 (edit)"
            class="demo-card"
          >
            <C_Markdown
              v-model="modeContent.edit"
              mode="edit"
              height="300px"
              placeholder="编辑模式 - 可以编辑和预览"
            />
          </NCard>

          <!-- 可编辑模式 -->
          <NCard
            title="可编辑模式 (editable)"
            class="demo-card"
          >
            <C_Markdown
              v-model="modeContent.editable"
              mode="editable"
              height="300px"
              placeholder="可编辑模式 - 实时渲染"
            />
          </NCard>

          <!-- 预览模式 -->
          <NCard
            title="预览模式 (preview)"
            class="demo-card"
          >
            <C_Markdown
              v-model="modeContent.preview"
              mode="preview"
              height="300px"
              placeholder="预览模式 - 只读"
            />
          </NCard>
        </NSpace>
      </NTabPane>

      <!-- 配置选项 -->
      <NTabPane
        name="config"
        tab="⚙️ 配置选项"
      >
        <NSpace
          vertical
          :size="24"
        >
          <NCard
            title="配置面板"
            class="demo-card"
          >
            <NSpace vertical>
              <NSpace>
                <NCheckbox v-model:checked="config.disabled">
                  禁用编辑器
                </NCheckbox>
                <NCheckbox v-model:checked="config.autofocus">
                  自动聚焦
                </NCheckbox>
                <NCheckbox v-model:checked="config.defaultFullscreen">
                  默认全屏
                </NCheckbox>
                <NCheckbox v-model:checked="config.autoSave">
                  启用自动保存
                </NCheckbox>
              </NSpace>

              <NSpace>
                <span>编辑器高度:</span>
                <NSlider
                  v-model:value="config.height"
                  :min="200"
                  :max="800"
                  :step="50"
                  style="width: 200px"
                />
                <span>{{ config.height }}px</span>
              </NSpace>

              <NSpace>
                <span>TOC 导航位置:</span>
                <NRadioGroup v-model:value="config.tocNavPosition">
                  <NRadio value="left">左侧</NRadio>
                  <NRadio value="right">右侧</NRadio>
                </NRadioGroup>
              </NSpace>
            </NSpace>
          </NCard>

          <NCard
            title="配置演示"
            class="demo-card"
          >
            <C_Markdown
              v-model="configContent"
              :height="`${config.height}px`"
              :disabled="config.disabled"
              :autofocus="config.autofocus"
              :default-fullscreen="config.defaultFullscreen"
              :auto-save="config.autoSave"
              :toc-nav-position="config.tocNavPosition"
              placeholder="根据左侧配置动态调整的编辑器"
              @fullscreen-change="handleFullscreenChange"
            />
          </NCard>
        </NSpace>
      </NTabPane>

      <!-- 数据回显 -->
      <NTabPane
        name="echo"
        tab="🔄 数据回显"
      >
        <NSpace
          vertical
          :size="24"
        >
          <NCard
            title="模拟数据源"
            class="demo-card"
          >
            <NSpace>
              <NButton
                @click="loadArticleData(1)"
                type="primary"
              >
                加载文章 1
              </NButton>
              <NButton
                @click="loadArticleData(2)"
                type="primary"
              >
                加载文章 2
              </NButton>
              <NButton
                @click="loadArticleData(3)"
                type="primary"
              >
                加载文章 3
              </NButton>
              <NButton
                @click="clearEchoContent"
                type="warning"
              >
                清空内容
              </NButton>
            </NSpace>
          </NCard>

          <NCard
            title="数据回显编辑器"
            class="demo-card"
          >
            <template #header-extra>
              <NSpace v-if="currentArticle">
                <NTag type="info">{{ currentArticle.title }}</NTag>
                <NTag type="success">{{ currentArticle.author }}</NTag>
              </NSpace>
            </template>

            <C_Markdown
              v-model="echoContent"
              height="400px"
              placeholder="点击上方按钮加载不同的文章内容"
              @change="handleEchoChange"
              @word-count-change="handleEchoWordCountChange"
            />

            <div
              class="echo-info"
              v-if="currentArticle"
            >
              <NSpace>
                <span>
                  <strong>创建时间:</strong>
                  {{ currentArticle.createTime }}
                </span>
                <span>
                  <strong>更新时间:</strong>
                  {{ currentArticle.updateTime }}
                </span>
                <span><strong>字数:</strong> {{ echoWordCount }}</span>
              </NSpace>
            </div>
          </NCard>
        </NSpace>
      </NTabPane>
    </NTabs>

    <!-- 预览弹窗 -->
    <NModal
      v-model:show="showPreviewModal"
      preset="card"
      style="width: 90%; max-width: 1200px"
    >
      <template #header>
        <span>📖 文章预览</span>
      </template>

      <div class="article-preview">
        <h1>{{ articleForm.title || '未命名文章' }}</h1>
        <div class="article-meta">
          <NSpace>
            <NTag
              v-if="articleForm.category"
              type="primary"
            >
              {{
                categoryOptions.find(opt => opt.value === articleForm.category)
                  ?.label
              }}
            </NTag>
            <NTag
              v-for="tag in articleForm.tags"
              :key="tag"
              type="info"
            >
              {{ tag }}
            </NTag>
            <span class="create-time">{{ new Date().toLocaleString() }}</span>
          </NSpace>
        </div>
        <div
          class="article-summary"
          v-if="articleForm.summary"
        >
          <p><strong>摘要:</strong> {{ articleForm.summary }}</p>
        </div>
        <div class="article-content">
          <VmdPreview :text="articleForm.content || '暂无内容'" />
        </div>
      </div>
    </NModal>
  </div>
</template>

<script setup lang="ts">
  import VmdPreview from '@kangc/v-md-editor/lib/preview'

  /**
   * 类型定义
   */
  interface ArticleData {
    id: number
    title: string
    author: string
    createTime: string
    updateTime: string
    content: string
  }

  interface CategoryOption {
    label: string
    value: string
  }

  interface FormRules {
    [key: string]: {
      required: boolean
      message: string
      trigger: string
    }
  }

  type InsertImageFunction = (config: {
    url: string
    desc?: string
    width?: string | number
    height?: string | number
  }) => void

  // 消息提示
  const message = useMessage()
  const dialog = useDialog()

  // 当前激活的标签页
  const activeTab = ref('basic')

  // 基础用法相关
  const basicContent = ref(`# 欢迎使用 Markdown 编辑器

## 🚀 功能特性

- ✅ **实时预览**: 支持编辑与预览同步滚动
- ✅ **语法高亮**: 代码块语法高亮显示
- ✅ **图片上传**: 支持拖拽和粘贴上传图片
- ✅ **自动保存**: 可配置自动保存功能
- ✅ **字数统计**: 实时显示字数统计
- ✅ **全屏编辑**: 支持全屏编辑模式

## 📝 语法示例

### 代码块
\`\`\`javascript
function hello() {
  console.log('Hello, Markdown!');
}
\`\`\`

### 表格
| 功能 | 描述 | 状态 |
|-----|------|------|
| 编辑 | Markdown 编辑 | ✅ |
| 预览 | 实时预览 | ✅ |
| 保存 | 自动保存 | ✅ |

### 列表
1. 有序列表项 1
2. 有序列表项 2
   - 无序子列表
   - 另一个子列表

> **提示**: 这是一个引用块，可以用来突出重要信息。

**粗体文本** 和 *斜体文本*

[链接示例](https://github.com)
`)

  const basicEditorRef = ref()
  const wordCount = ref(0)
  const lastSaveTime = ref('')
  const lastAutoSaveTime = ref('')

  // 表单相关
  const formRef = ref()
  const submitting = ref(false)
  const savingDraft = ref(false)
  const formWordCount = ref(0)

  const articleForm = reactive({
    title: '',
    summary: '',
    category: '',
    tags: [] as string[],
    content: '',
  })

  const formRules: FormRules = {
    title: { required: true, message: '请输入文章标题', trigger: 'blur' },
    summary: { required: true, message: '请输入文章摘要', trigger: 'blur' },
    category: { required: true, message: '请选择文章分类', trigger: 'change' },
    content: { required: true, message: '请输入文章内容', trigger: 'blur' },
  }

  const categoryOptions: CategoryOption[] = [
    { label: '技术分享', value: 'tech' },
    { label: '生活随笔', value: 'life' },
    { label: '项目总结', value: 'project' },
    { label: '学习笔记', value: 'notes' },
  ]

  // 不同模式演示
  const modeContent = reactive({
    edit: '# 编辑模式\n\n这是编辑模式，支持编辑和预览切换。',
    editable: '# 可编辑模式\n\n这是可编辑模式，实时渲染 Markdown。',
    preview: '# 预览模式\n\n这是预览模式，**只能查看**，不能编辑。',
  })

  // 配置选项
  const config = reactive({
    disabled: false,
    autofocus: false,
    defaultFullscreen: false,
    autoSave: false,
    height: 400,
    tocNavPosition: 'right' as 'left' | 'right',
  })

  const configContent = ref(
    '# 配置演示\n\n请在左侧调整配置选项，观察编辑器的变化。\n\n## TOC 导航\n\n### 小标题 1\n\n### 小标题 2\n\n### 小标题 3'
  )

  // 数据回显
  const echoContent = ref('')
  const echoWordCount = ref(0)
  const currentArticle = ref<ArticleData | null>(null)

  // 模拟文章数据
  const mockArticles: ArticleData[] = [
    {
      id: 1,
      title: 'Vue 3 组件设计最佳实践',
      author: 'ChenYu',
      createTime: '2025-06-15 10:30:00',
      updateTime: '2025-06-20 14:20:00',
      content: `# Vue 3 组件设计最佳实践

## 前言

在 Vue 3 开发中，良好的组件设计是项目成功的关键。本文将分享一些实用的组件设计原则和最佳实践。

## 1. 组件职责单一

每个组件应该只负责一个明确的功能，避免组件过于复杂。

\`\`\`vue
<template>
  <div class="user-card">
    <img :src="user.avatar" :alt="user.name" />
    <h3>{{ user.name }}</h3>
    <p>{{ user.title }}</p>
  </div>
</template>
\`\`\`

## 2. Props 设计原则

- 明确的类型定义
- 合理的默认值
- 清晰的命名

## 3. 事件处理

使用 \`defineEmits\` 明确定义组件事件。

## 总结

良好的组件设计能够提高代码的可维护性和复用性。`,
    },
    {
      id: 2,
      title: 'TypeScript 在前端项目中的应用',
      author: 'ChenYu',
      createTime: '2025-06-10 09:15:00',
      updateTime: '2025-06-18 16:45:00',
      content: `# TypeScript 在前端项目中的应用

## 为什么选择 TypeScript?

TypeScript 为 JavaScript 添加了类型系统，能够在开发阶段发现潜在的错误。

## 基础类型

\`\`\`typescript
interface User {
  id: number;
  name: string;
  email?: string;
}

const user: User = {
  id: 1,
  name: 'John Doe'
};
\`\`\`

## 泛型的使用

泛型是 TypeScript 的强大特性之一。

\`\`\`typescript
function identity<T>(arg: T): T {
  return arg;
}
\`\`\`

## 在 Vue 项目中的应用

结合 Vue 3 的 Composition API，TypeScript 能够提供更好的开发体验。`,
    },
    {
      id: 3,
      title: 'Markdown 编辑器的实现思路',
      author: 'ChenYu',
      createTime: '2025-06-08 15:20:00',
      updateTime: '2025-06-19 11:30:00',
      content: `# Markdown 编辑器的实现思路

## 核心功能

一个完整的 Markdown 编辑器需要具备以下功能：

1. **语法解析**: 将 Markdown 语法转换为 HTML
2. **实时预览**: 编辑时实时显示渲染效果
3. **语法高亮**: 在编辑区域高亮显示语法
4. **工具栏**: 提供常用的格式化按钮

## 技术选型

- **解析器**: markdown-it
- **高亮**: highlight.js
- **编辑器**: CodeMirror 或自定义

## 实现细节

### 1. 基础结构

\`\`\`vue
<template>
  <div class="markdown-editor">
    <div class="editor-panel">
      <textarea v-model="content" />
    </div>
    <div class="preview-panel">
      <div v-html="htmlContent" />
    </div>
  </div>
</template>
\`\`\`

### 2. 实时渲染

使用 \`watch\` 监听内容变化，实时更新预览。

## 总结

构建一个功能完整的 Markdown 编辑器需要考虑用户体验、性能优化等多个方面。`,
    },
  ]

  // 预览弹窗
  const showPreviewModal = ref(false)

  // 计算属性
  // const formWordCountDisplay = computed(() => {
  //   return `${formWordCount.value} / 20000`
  // })

  /**
   * 生命周期
   */
  onMounted(() => {
    // 组件会自动触发字数统计事件，这里不需要手动设置
    console.log('Markdown 编辑器演示页面已加载')
  })

  /**
   * 事件处理函数
   */
  const handleBasicChange = (text: string, html: string) => {
    console.log('内容变化:', { text: text.length, html: html.length })
  }

  const handleBasicSave = (text: string, _html: string) => {
    console.log('🚀 ~ handleBasicSave ~ _html:', _html)
    console.log('🚀 ~ handleBasicSave ~ text:', text)
    lastSaveTime.value = new Date().toLocaleString()
    message.success('内容已保存!')
  }

  const handleUploadImage = (
    _event: Event,
    insertImage: InsertImageFunction,
    files: FileList
  ) => {
    // 模拟图片上传
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = e => {
        // 这里应该是上传到服务器，返回图片URL
        // 现在模拟一个本地 base64 URL
        insertImage({
          url: e.target?.result as string,
          desc: file.name,
          width: 'auto',
          height: 'auto',
        })
      }
      reader.readAsDataURL(file)
    })
    message.success(`上传 ${files.length} 张图片`)
  }

  const handleAutoSave = (_text: string) => {
    console.log('🚀 ~ handleAutoSave ~ _text:', _text)
    lastAutoSaveTime.value = new Date().toLocaleString()
    message.info('自动保存成功')
  }

  const handleWordCountChange = (count: number) => {
    wordCount.value = count
  }

  const handleFormWordCountChange = (count: number) => {
    formWordCount.value = count
  }

  const handleEchoWordCountChange = (count: number) => {
    echoWordCount.value = count
  }

  const insertTemplate = () => {
    const template = `
## 新增内容

### 代码示例
\`\`\`javascript
console.log('Hello World!');
\`\`\`

### 任务列表
- [x] 已完成的任务
- [ ] 待完成的任务
`
    basicContent.value += template
  }

  const clearContent = () => {
    dialog.warning({
      title: '确认清空',
      content: '确定要清空所有内容吗？此操作不可恢复。',
      positiveText: '确认',
      negativeText: '取消',
      onPositiveClick: () => {
        basicContent.value = ''
        message.success('内容已清空')
      },
    })
  }

  // 表单处理
  const handleFormContentChange = (_text: string, _html: string) => {
    console.log('🚀 ~ handleFormContentChange ~ _html:', _html)
    console.log('🚀 ~ handleFormContentChange ~ _text:', _text)
    // 可以在这里做一些表单内容变化的处理
  }

  const handleMaxLengthExceeded = (
    currentLength: number,
    maxLength: number
  ) => {
    message.error(
      `内容长度超出限制！当前 ${currentLength} 字符，最大 ${maxLength} 字符`
    )
  }

  const submitForm = async () => {
    try {
      await formRef.value?.validate()
      submitting.value = true

      // 模拟提交
      setTimeout(() => {
        submitting.value = false
        message.success('文章发布成功！')
        // 可以在这里跳转到文章列表或详情页
      }, 2000)
    } catch {
      message.error('请完善表单信息')
    }
  }

  const saveAsDraft = async () => {
    savingDraft.value = true

    // 模拟保存草稿
    setTimeout(() => {
      savingDraft.value = false
      message.success('草稿保存成功！')
    }, 1000)
  }

  const previewArticle = () => {
    if (!articleForm.content.trim()) {
      message.warning('请先输入文章内容')
      return
    }
    showPreviewModal.value = true
  }

  const resetForm = () => {
    dialog.warning({
      title: '确认重置',
      content: '确定要重置表单吗？所有填写的内容将丢失。',
      positiveText: '确认',
      negativeText: '取消',
      onPositiveClick: () => {
        Object.assign(articleForm, {
          title: '',
          summary: '',
          category: '',
          tags: [],
          content: '',
        })
        formWordCount.value = 0
        message.success('表单已重置')
      },
    })
  }

  // 配置相关
  const handleFullscreenChange = (isFullscreen: boolean) => {
    message.info(`${isFullscreen ? '进入' : '退出'}全屏模式`)
  }

  // 数据回显
  const loadArticleData = (articleId: number) => {
    const article = mockArticles.find(a => a.id === articleId)
    if (article) {
      currentArticle.value = article
      echoContent.value = article.content
      echoWordCount.value = article.content.length
      message.success(`已加载文章: ${article.title}`)
    }
  }

  const clearEchoContent = () => {
    currentArticle.value = null
    echoContent.value = ''
    echoWordCount.value = 0
    message.success('内容已清空')
  }

  const handleEchoChange = (_text: string, _html: string) => {
    console.log('🚀 ~ handleEchoChange ~ _html:', _html)
    console.log('🚀 ~ handleEchoChange ~ _text:', _text)
    if (currentArticle.value) {
      currentArticle.value.updateTime = new Date().toLocaleString()
    }
  }
</script>

<style lang="scss" scoped>
  .markdown-demo-page {
    padding: 24px;

    .demo-header {
      margin-bottom: 24px;
    }

    .demo-card {
      margin-bottom: 24px;
    }

    .editor-info {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid var(--border-color);
    }

    .echo-info {
      margin-top: 12px;
      padding: 12px;
      background: var(--code-color);
      border-radius: 6px;
      font-size: 14px;
    }

    .form-word-count {
      margin-top: 8px;
      padding: 8px;
      background: var(--input-color-disabled, #fafafa);
      border-radius: 4px;
      border: 1px solid var(--border-color);
    }
  }

  .article-preview {
    .article-meta {
      margin: 16px 0;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border-color);

      .create-time {
        color: var(--text-color-3);
        font-size: 14px;
      }
    }

    .article-summary {
      margin: 16px 0;
      padding: 12px;
      background: var(--code-color);
      border-radius: 6px;
      border-left: 4px solid var(--primary-color);
    }

    .article-content {
      margin-top: 24px;
    }
  }

  :deep(.n-tabs-nav) {
    margin-bottom: 24px;
  }
</style>
