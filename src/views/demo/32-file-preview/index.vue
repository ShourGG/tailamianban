<!--
 * @Description: 文件预览组件演示页面 - 支持弹窗预览版本
 * @Author: Your Name
 * @Date: 2025-01-25
-->
<template>
  <div class="file-preview-demo">
    <div class="demo-header">
      <h1>
        <span style="font-size: 32px;">👁️</span>
        文件预览组件演示
      </h1>
      <p>基于 vue-files-preview 封装的通用文件预览组件，支持内联和弹窗预览</p>
    </div>

    <div class="demo-content">
      <!-- 内联预览模式 -->
      <NCard title="内联预览模式" class="demo-section">
        <template #header-extra>
          <NTag type="info">直接在页面预览</NTag>
        </template>

        <C_FilePreview
          preview-mode="inline"
          :height="400"
          @file-select="handleFileSelect"
          @preview-success="handlePreviewSuccess"
          @preview-error="handlePreviewError"
        />

        <template #footer>
          <div class="demo-info">
            <div class="info-item">
              <span class="label">预览模式：</span>
              <span class="value">内联预览 - 直接在页面中显示预览内容</span>
            </div>
          </div>
        </template>
      </NCard>

      <!-- 弹窗预览模式 -->
      <NCard title="弹窗预览模式" class="demo-section">
        <template #header-extra>
          <NTag type="success">点击预览 + 全屏支持</NTag>
        </template>

        <C_FilePreview
          preview-mode="modal"
          @file-select="handleModalFileSelect"
          @modal-open="handleModalOpen"
          @modal-close="handleModalClose"
          @preview-success="handlePreviewSuccess"
          @preview-error="handlePreviewError"
        />

        <template #footer>
          <div class="demo-info">
            <div class="info-item">
              <span class="label">预览模式：</span>
              <span class="value">弹窗预览 - 点击预览按钮打开弹窗查看</span>
            </div>
            <div class="info-item">
              <span class="label">全屏功能：</span>
              <span class="value">支持全屏预览，提供更大的查看区域</span>
            </div>
            <div class="info-item">
              <span class="label">快捷键：</span>
              <span class="value">ESC键退出全屏/关闭弹窗，F11或Ctrl+F切换全屏</span>
            </div>
            <div class="info-item">
              <span class="label">优势：</span>
              <span class="value">节省页面空间，支持全屏查看，更好的用户体验</span>
            </div>
          </div>
        </template>
      </NCard>

      <!-- 网络文件预览 -->
      <NCard title="网络文件预览" class="demo-section">
        <template #header-extra>
          <NTag type="warning">URL预览</NTag>
        </template>

        <div class="network-preview">
          <div class="url-input">
            <NInput
              :value="networkUrl"
              placeholder="🔗 请输入文件URL地址"
              clearable
              @update:value="updateNetworkUrl"
            />
            <NButton
              type="primary"
              :disabled="!networkUrl.trim()"
              :loading="networkLoading"
              @click="loadNetworkFile"
            >
              🌐 加载预览
            </NButton>
          </div>

          <div class="preview-mode-tabs">
            <NTabs v-model:value="networkPreviewMode" type="segment">
              <NTabPane name="inline" tab="内联预览">
                <C_FilePreview
                  :file="networkFile"
                  :show-upload="false"
                  preview-mode="inline"
                  :height="350"
                  @preview-success="handleNetworkPreviewSuccess"
                  @preview-error="handleNetworkPreviewError"
                />
              </NTabPane>
              <NTabPane name="modal" tab="弹窗预览">
                <C_FilePreview
                  :file="networkFile"
                  :show-upload="false"
                  preview-mode="modal"
                  @modal-open="handleModalOpen"
                  @modal-close="handleModalClose"
                  @preview-success="handleNetworkPreviewSuccess"
                  @preview-error="handleNetworkPreviewError"
                />
              </NTabPane>
            </NTabs>
          </div>

          <div class="demo-urls">
            <h4>示例文件：</h4>
            <div class="url-list">
              <NButton
                v-for="demo in demoFiles"
                :key="demo.url"
                size="small"
                type="tertiary"
                @click="selectDemoFile(demo)"
              >
                {{ demo.name }}
              </NButton>
            </div>
          </div>
        </div>
      </NCard>

      <!-- 配置选项 -->
      <NCard title="配置选项" class="demo-section">
        <template #header-extra>
          <NTag type="primary">可定制</NTag>
        </template>

        <div class="config-demo">
          <div class="config-panel">
            <NForm
              :model="config"
              label-placement="left"
              label-width="120"
              size="small"
            >
              <NFormItem label="预览模式">
                <NRadioGroup v-model:value="config.previewMode">
                  <NRadio value="inline">内联预览</NRadio>
                  <NRadio value="modal">弹窗预览</NRadio>
                </NRadioGroup>
              </NFormItem>

              <NFormItem label="预览高度" v-if="config.previewMode === 'inline'">
                <NInputNumber
                  v-model:value="config.height"
                  :min="200"
                  :max="800"
                  :step="50"
                  suffix="px"
                />
              </NFormItem>

              <NFormItem label="最大文件大小">
                <NInputNumber
                  v-model:value="config.maxSize"
                  :min="1"
                  :max="100"
                  suffix="MB"
                />
              </NFormItem>

              <NFormItem label="支持的格式">
                <NSelect
                  v-model:value="config.accept"
                  multiple
                  :options="acceptOptions"
                  placeholder="选择支持的文件格式"
                />
              </NFormItem>

              <NFormItem label="显示上传区域">
                <NSwitch v-model:value="config.showUpload" />
              </NFormItem>
            </NForm>
          </div>

          <div class="config-preview">
            <C_FilePreview
              ref="configPreviewRef"
              :preview-mode="config.previewMode"
              :height="config.height"
              :max-size="config.maxSize"
              :accept="configAcceptString"
              :show-upload="config.showUpload"
              :file="configFile"
              @file-select="handleConfigFileSelect"
              @modal-open="handleModalOpen"
              @modal-close="handleModalClose"
            />
          </div>
        </div>
      </NCard>

      <!-- 批量文件管理 -->
      <NCard title="批量文件管理" class="demo-section">
        <template #header-extra>
          <NTag type="info">文件列表</NTag>
        </template>

        <div class="multi-file-demo">
          <div class="file-manager">
            <div class="file-upload">
              <input
                ref="multiFileInputRef"
                type="file"
                multiple
                class="hidden"
                @change="handleMultiFileSelect"
              />
              <NButton type="dashed" block @click="triggerMultiFileInput">
                ➕ 添加文件
              </NButton>
            </div>

            <div class="file-list">
              <div
                v-for="(file, index) in uploadedFiles"
                :key="index"
                class="file-item"
                :class="{ active: currentFileIndex === index }"
                @click="selectFile(index)"
              >
                <div class="file-info">
                  <span class="file-icon" :style="{ fontSize: '16px' }">
                    {{ getFileTypeEmoji(file.name) }}
                  </span>
                  <div class="file-details">
                    <div class="file-name">{{ file.name }}</div>
                    <div class="file-size">{{ formatFileSize(file.size) }}</div>
                  </div>
                </div>
                <div class="file-actions">
                  <NButton
                    size="tiny"
                    type="primary"
                    text
                    @click.stop="previewFile(index)"
                  >
                    👁️
                  </NButton>
                  <NButton
                    size="tiny"
                    type="error"
                    text
                    @click.stop="removeFile(index)"
                  >
                    ✖️
                  </NButton>
                </div>
              </div>
            </div>
          </div>

          <div class="file-preview">
            <C_FilePreview
              v-if="uploadedFiles.length > 0 && currentFileIndex >= 0"
              :file="uploadedFiles[currentFileIndex]"
              :show-upload="false"
              :preview-mode="batchPreviewMode"
              :height="400"
              @modal-open="handleModalOpen"
              @modal-close="handleModalClose"
            />
            <div v-else class="empty-placeholder">
              <div class="empty-icon" style="font-size: 48px;">📁</div>
              <p>请选择文件进行预览</p>
            </div>

            <div class="preview-mode-switcher">
              <NRadioGroup v-model:value="batchPreviewMode" size="small">
                <NRadio value="inline">内联预览</NRadio>
                <NRadio value="modal">弹窗预览</NRadio>
              </NRadioGroup>
            </div>
          </div>
        </div>
      </NCard>

      <!-- 事件日志 -->
      <NCard title="事件日志" class="demo-section">
        <template #header-extra>
          <NButton size="small" @click="clearLogs">清空日志</NButton>
        </template>

        <div class="event-logs">
          <div
            v-for="(log, index) in eventLogs"
            :key="index"
            class="log-item"
            :class="log.type"
          >
            <span class="log-time">{{ log.time }}</span>
            <span class="log-event">{{ log.event }}</span>
            <span class="log-data">{{ log.data }}</span>
          </div>
          <div v-if="eventLogs.length === 0" class="empty-logs">
            暂无事件日志
          </div>
        </div>
      </NCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  NCard,
  NTag,
  NInput,
  NButton,
  NForm,
  NFormItem,
  NInputNumber,
  NSelect,
  NSwitch,
  NRadioGroup,
  NRadio,
  NTabs,
  NTabPane
} from 'naive-ui'

// 响应式数据
const networkUrl = ref('')
const networkFile = ref<string | null>(null)
const networkLoading = ref(false)
const networkPreviewMode = ref<'inline' | 'modal'>('inline')
const configFile = ref<File | null>(null)
const uploadedFiles = ref<File[]>([])
const currentFileIndex = ref(-1)
const batchPreviewMode = ref<'inline' | 'modal'>('inline')
const configPreviewRef = ref()
const multiFileInputRef = ref<HTMLInputElement>()

// 配置选项
const config = ref({
  previewMode: 'inline' as 'inline' | 'modal',
  height: 400,
  maxSize: 50,
  accept: ['.pdf', '.docx', '.xlsx'],
  showUpload: true
})

const acceptOptions = [
  { label: 'PDF (.pdf)', value: '.pdf' },
  { label: 'Word (.docx, .doc)', value: '.docx,.doc' },
  { label: 'Excel (.xlsx, .xls)', value: '.xlsx,.xls' },
  { label: '图片 (.jpg, .png, .gif)', value: '.jpg,.jpeg,.png,.gif' },
  { label: '视频 (.mp4)', value: '.mp4' },
  { label: '音频 (.mp3)', value: '.mp3' },
  { label: '文本 (.txt)', value: '.txt' },
  { label: 'Markdown (.md)', value: '.md' }
]

const configAcceptString = computed(() => config.value.accept.join(','))

// 示例文件
const demoFiles = [
  {
    name: '📄 PDF示例',
    url: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
    icon: 'i-mdi:file-pdf-box text-red-500'
  },
  {
    name: '🖼️ 图片示例',
    url: 'https://picsum.photos/800/600',
    icon: 'i-mdi:file-image-box text-orange-500'
  }
]

// 事件日志
interface EventLog {
  time: string
  event: string
  data: string
  type: 'info' | 'success' | 'error'
}

const eventLogs = ref<EventLog[]>([])

// 方法
const addLog = (event: string, data: string = '', type: 'info' | 'success' | 'error' = 'info') => {
  const time = new Date().toLocaleTimeString()
  eventLogs.value.unshift({ time, event, data, type })
  if (eventLogs.value.length > 50) {
    eventLogs.value = eventLogs.value.slice(0, 50)
  }
}

const getFileTypeEmoji = (fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  const emojiMap: Record<string, string> = {
    pdf: '📄',
    docx: '📝',
    doc: '📝',
    xlsx: '📊',
    xls: '📊',
    txt: '📄',
    md: '📝',
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    gif: '🖼️',
    mp4: '🎬',
    mp3: '🎵'
  }
  return emojiMap[ext] || '📎'
}

const getFileIconName = (fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  const iconMap: Record<string, string> = {
    pdf: 'i-mdi:file-pdf-box text-red-500',
    docx: 'i-mdi:file-word-box text-blue-500',
    doc: 'i-mdi:file-word-box text-blue-500',
    xlsx: 'i-mdi:file-excel-box text-green-500',
    xls: 'i-mdi:file-excel-box text-green-500',
    txt: 'i-mdi:file-document-outline text-gray-500',
    md: 'i-mdi:language-markdown text-purple-500',
    jpg: 'i-mdi:file-image-box text-orange-500',
    jpeg: 'i-mdi:file-image-box text-orange-500',
    png: 'i-mdi:file-image-box text-orange-500',
    gif: 'i-mdi:file-image-box text-orange-500',
    mp4: 'i-mdi:file-video-box text-pink-500',
    mp3: 'i-mdi:file-music-box text-cyan-500'
  }
  return iconMap[ext] || 'i-mdi:file-outline text-gray-400'
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

const updateNetworkUrl = (value: string) => {
  networkUrl.value = value
}

const selectDemoFile = (demo: typeof demoFiles[0]) => {
  networkUrl.value = demo.url
}

const loadNetworkFile = async () => {
  if (!networkUrl.value.trim()) return

  networkLoading.value = true
  try {
    // 验证URL格式
    new URL(networkUrl.value.trim())

    networkFile.value = networkUrl.value.trim()
    addLog('加载网络文件', networkUrl.value, 'info')
  } catch (error) {
    addLog('网络文件URL无效', networkUrl.value, 'error')
  } finally {
    networkLoading.value = false
  }
}

const handleFileSelect = (file: File) => {
  addLog('内联预览文件选择', `${file.name} (${formatFileSize(file.size)})`, 'info')
}

const handleModalFileSelect = (file: File) => {
  addLog('弹窗预览文件选择', `${file.name} (${formatFileSize(file.size)})`, 'info')
}

const handlePreviewSuccess = () => {
  addLog('预览成功', '', 'success')
}

const handlePreviewError = (error: string) => {
  addLog('预览失败', error, 'error')
}

const handleNetworkPreviewSuccess = () => {
  addLog('网络文件预览成功', '', 'success')
  networkLoading.value = false
}

const handleNetworkPreviewError = (error: string) => {
  addLog('网络文件预览失败', error, 'error')
  networkLoading.value = false
}

const handleModalOpen = () => {
  addLog('预览弹窗打开', '', 'info')
}

const handleModalClose = () => {
  addLog('预览弹窗关闭', '', 'info')
}

const handleConfigFileSelect = (file: File) => {
  configFile.value = file
  addLog('配置演示文件选择', `${file.name}`, 'info')
}

const triggerMultiFileInput = () => {
  multiFileInputRef.value?.click()
}

const handleMultiFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])
  uploadedFiles.value.push(...files)
  addLog('批量文件添加', `添加了 ${files.length} 个文件`, 'info')

  // 选中第一个新添加的文件
  if (currentFileIndex.value < 0 && files.length > 0) {
    currentFileIndex.value = uploadedFiles.value.length - files.length
  }

  // 重置input
  target.value = ''
}

const selectFile = (index: number) => {
  currentFileIndex.value = index
  addLog('切换预览文件', uploadedFiles.value[index].name, 'info')
}

const previewFile = (index: number) => {
  currentFileIndex.value = index
  if (batchPreviewMode.value === 'modal') {
    addLog('点击弹窗预览', uploadedFiles.value[index].name, 'info')
  }
}

const removeFile = (index: number) => {
  const file = uploadedFiles.value[index]
  uploadedFiles.value.splice(index, 1)
  addLog('文件移除', file.name, 'info')

  // 调整当前选中索引
  if (currentFileIndex.value >= uploadedFiles.value.length) {
    currentFileIndex.value = Math.max(-1, uploadedFiles.value.length - 1)
  } else if (currentFileIndex.value === index) {
    currentFileIndex.value = uploadedFiles.value.length > 0 ? 0 : -1
  } else if (currentFileIndex.value > index) {
    currentFileIndex.value--
  }
}

const clearLogs = () => {
  eventLogs.value = []
}

// 初始化日志
onMounted(() => {
  addLog('组件初始化', '文件预览组件演示页面已加载', 'success')
})
</script>

<style lang="scss" scoped>
.file-preview-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;

  .demo-header {
    text-align: center;
    margin-bottom: 32px;

    h1 {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      font-size: 32px;
      color: var(--text-color-1);
      margin: 0 0 8px 0;
    }

    p {
      font-size: 16px;
      color: var(--text-color-3);
      margin: 0;
    }
  }

  .demo-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .demo-section {
    .demo-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
      font-size: 14px;

      .info-item {
        display: flex;
        gap: 8px;

        .label {
          color: var(--text-color-3);
          min-width: 80px;
        }

        .value {
          color: var(--text-color-1);
        }
      }
    }
  }

  .network-preview {
    .url-input {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
      align-items: flex-start;
    }

    .preview-mode-tabs {
      margin-bottom: 16px;
    }

    .demo-urls {
      margin-bottom: 16px;

      h4 {
        margin: 0 0 8px 0;
        font-size: 14px;
        color: var(--text-color-2);
      }

      .url-list {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
    }
  }

  .config-demo {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 24px;

    .config-panel {
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 16px;
      height: fit-content;
    }

    .config-preview {
      min-height: 400px;
    }
  }

  .multi-file-demo {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 24px;

    .file-manager {
      border: 1px solid var(--border-color);
      border-radius: 6px;
      overflow: hidden;
      height: fit-content;

      .file-upload {
        padding: 16px;
        border-bottom: 1px solid var(--border-color);
      }

      .file-list {
        max-height: 300px;
        overflow-y: auto;

        .file-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
          cursor: pointer;
          transition: background-color 0.2s;

          &:hover {
            background-color: var(--hover-color);
          }

          &.active {
            background-color: var(--primary-color-hover);
            border-left: 3px solid var(--primary-color);
          }

          &:last-child {
            border-bottom: none;
          }

          .file-info {
            display: flex;
            align-items: center;
            gap: 8px;
            flex: 1;
            min-width: 0;

            .file-icon {
              flex-shrink: 0;
              line-height: 1;
            }

            .file-details {
              .file-name {
                font-weight: 500;
                color: var(--text-color-1);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 150px;
              }

              .file-size {
                font-size: 12px;
                color: var(--text-color-3);
              }
            }
          }

          .file-actions {
            display: flex;
            gap: 4px;
          }
        }
      }
    }

    .file-preview {
      position: relative;

      .empty-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 400px;
        color: var(--text-color-3);
        border: 1px dashed var(--border-color);
        border-radius: 6px;

        .empty-icon {
          line-height: 1;
          margin-bottom: 12px;
        }

        p {
          margin: 12px 0 0 0;
        }
      }

      .preview-mode-switcher {
        margin-top: 12px;
        text-align: center;
      }
    }
  }

  .event-logs {
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid var(--border-color);
    border-radius: 6px;

    .log-item {
      display: grid;
      grid-template-columns: 80px 120px 1fr;
      gap: 12px;
      padding: 8px 12px;
      border-bottom: 1px solid var(--border-color);
      font-size: 13px;
      font-family: 'Monaco', 'Consolas', monospace;

      &:last-child {
        border-bottom: none;
      }

      .log-time {
        color: var(--text-color-3);
      }

      .log-event {
        font-weight: 500;
      }

      .log-data {
        color: var(--text-color-2);
        word-break: break-all;
      }

      &.success {
        background-color: var(--success-color-hover);

        .log-event {
          color: var(--success-color);
        }
      }

      &.error {
        background-color: var(--error-color-hover);

        .log-event {
          color: var(--error-color);
        }
      }

      &.info {
        .log-event {
          color: var(--info-color);
        }
      }
    }

    .empty-logs {
      padding: 24px;
      text-align: center;
      color: var(--text-color-3);
    }
  }

  .hidden {
    display: none;
  }
}

@media (max-width: 768px) {
  .file-preview-demo {
    padding: 16px;

    .config-demo,
    .multi-file-demo {
      grid-template-columns: 1fr;

      .config-panel,
      .file-manager {
        order: 2;
      }
    }
  }
}
</style>
