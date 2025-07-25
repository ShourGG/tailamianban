<template>
  <div class="c-file-preview">
    <!-- 文件选择区域 -->
    <div v-if="showUpload" class="upload-area">
      <div
        class="upload-zone"
        :class="{ 'is-dragover': isDragover }"
        @drop="handleDrop"
        @dragover.prevent="isDragover = true"
        @dragleave.prevent="isDragover = false"
        @click="triggerFileInput"
      >
        <div class="upload-content">
          <C_Icon
            name="i-mdi:cloud-upload"
            type="unocss"
            :size="48"
            class="upload-icon"
          />
          <p class="upload-text">拖拽文件到此处或点击上传</p>
          <p class="upload-hint">支持 {{ supportedFormats.join('、') }} 等格式</p>
        </div>
      </div>
      <input
        ref="fileInputRef"
        type="file"
        class="hidden"
        :accept="acceptTypes"
        @change="handleFileSelect"
      />
    </div>

    <!-- 文件信息 -->
    <div v-if="currentFile" class="file-info">
      <div class="file-meta">
        <div class="file-icon">
          <C_Icon
            :name="getFileIcon(fileType)"
            type="unocss"
            :size="24"
          />
        </div>
        <div class="file-details">
          <div class="file-name" :title="fileName">{{ fileName }}</div>
          <div class="file-size">{{ formatFileSize(fileSize) }}</div>
        </div>
        <div class="file-actions">
          <NButton
            v-if="previewMode === 'modal'"
            size="small"
            type="primary"
            ghost
            @click="openPreviewModal"
          >
            <template #icon>
              <C_Icon name="i-mdi:eye" type="unocss" :size="16" />
            </template>
            预览
          </NButton>
          <NButton
            v-if="showUpload"
            size="small"
            type="error"
            ghost
            @click="clearFile"
          >
            <template #icon>
              <C_Icon name="i-mdi:close" type="unocss" :size="16" />
            </template>
            移除
          </NButton>
        </div>
      </div>
    </div>

    <!-- 内联预览区域 -->
    <div
      v-if="currentFile && previewMode === 'inline'"
      class="preview-container"
      :style="containerStyle"
    >
      <!-- 加载状态 -->
      <div v-if="loading && !error" class="preview-loading">
        <NSpin size="large">
          <template #description>
            <div class="loading-content">
              <p>文件加载中...</p>
              <NButton
                size="small"
                type="primary"
                ghost
                @click="forceStopLoading"
                style="margin-top: 8px;"
              >
                <template #icon>
                  <C_Icon name="i-mdi:check" type="unocss" :size="14" />
                </template>
                加载完成
              </NButton>
            </div>
          </template>
        </NSpin>
      </div>

      <!-- Excel特殊处理警告 -->
      <div v-if="isExcelFile && !error" class="excel-warning">
        <NAlert type="warning" show-icon>
          <template #icon>
            <C_Icon name="i-mdi:microsoft-excel" type="unocss" :size="16" />
          </template>
          Excel文件预览加载中，如长时间无响应请点击"强制完成"按钮
        </NAlert>
      </div>

      <!-- 预览组件 -->
      <div v-show="!loading && !error && safePreviewFile" class="preview-wrapper">
        <VueFilesPreview
          v-if="safePreviewFile"
          :key="`inline-${componentKey}`"
          :file="safePreviewFile"
          @error="handlePreviewError"
          @load="handlePreviewLoad"
        />
      </div>

      <!-- 错误状态 -->
      <div v-if="error" class="preview-error">
        <div class="error-content">
          <C_Icon
            name="i-mdi:alert-circle"
            type="unocss"
            :size="48"
            class="error-icon"
          />
          <h3>预览失败</h3>
          <p>{{ error }}</p>

          <!-- Excel文件专门的解决方案 -->
          <div v-if="isExcelFile" class="excel-solutions">
            <NAlert type="info" style="margin-bottom: 16px;">
              <template #icon>
                <C_Icon name="i-mdi:lightbulb" type="unocss" :size="16" />
              </template>
              Excel文件预览建议：
              <ul style="margin: 8px 0; padding-left: 20px;">
                <li>确保文件大小小于{{ maxSize }}MB</li>
                <li>支持 .xlsx 格式，.xls 格式可能不稳定</li>
                <li>复杂公式和宏可能影响预览</li>
                <li>可尝试转换为CSV格式</li>
              </ul>
            </NAlert>
          </div>

          <NButton type="primary" @click="retryPreview">
            <template #icon>
              <C_Icon name="i-mdi:refresh" type="unocss" :size="16" />
            </template>
            重试
          </NButton>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!currentFile && !showUpload" class="empty-state">
      <div class="empty-content">
        <C_Icon
          name="i-mdi:file-document-outline"
          type="unocss"
          :size="48"
          class="empty-icon"
        />
        <p>暂无文件预览</p>
      </div>
    </div>

    <!-- 弹窗预览 -->
    <NModal
      v-model:show="showPreviewModal"
      preset="card"
      size="huge"
      :style="{
        width: isFullscreen ? '100vw' : '90vw',
        height: isFullscreen ? '100vh' : '80vh',
        maxHeight: isFullscreen ? '100vh' : '80vh'
      }"
      :bordered="false"
      :closable="true"
      :mask-closable="!isFullscreen"
      :auto-focus="false"
      :transform-origin="'center'"
      @close="closePreviewModal"
    >
      <template #header>
        <div class="modal-header">
          <div class="modal-title">
            <C_Icon :name="getFileIcon(fileType)" type="unocss" :size="20" />
            <span>{{ fileName }}</span>
          </div>
          <div class="modal-actions">
            <NButton
              size="small"
              quaternary
              circle
              :title="isFullscreen ? '退出全屏' : '全屏预览'"
              @click="toggleFullscreen"
            >
              <template #icon>
                <C_Icon
                  :name="isFullscreen ? 'i-mdi:fullscreen-exit' : 'i-mdi:fullscreen'"
                  type="unocss"
                  :size="16"
                />
              </template>
            </NButton>
          </div>
        </div>
      </template>

      <div class="modal-preview-container" :class="{ 'fullscreen-container': isFullscreen }">
        <!-- Excel特殊处理警告 -->
        <div v-if="isExcelFile && modalLoading && !modalError" class="excel-warning">
          <NAlert type="warning" show-icon>
            <template #icon>
              <C_Icon name="i-mdi:microsoft-excel" type="unocss" :size="16" />
            </template>
            Excel文件预览加载中，如长时间无响应请点击"强制完成"按钮
          </NAlert>
        </div>

        <!-- 模态框加载状态 -->
        <div v-if="modalLoading && !modalError" class="modal-loading">
          <NSpin size="large">
            <template #description>
              <div class="loading-content">
                <p>文件加载中...</p>
                <NButton
                  size="small"
                  type="primary"
                  ghost
                  @click="forceStopModalLoading"
                  style="margin-top: 8px;"
                >
                  <template #icon>
                    <C_Icon name="i-mdi:check" type="unocss" :size="14" />
                  </template>
                  加载完成
                </NButton>
              </div>
            </template>
          </NSpin>
        </div>

        <!-- 模态框预览组件 -->
        <div v-show="!modalLoading && !modalError && safePreviewFile" class="modal-preview-wrapper">
          <VueFilesPreview
            v-if="safePreviewFile && showPreviewModal"
            :key="`modal-${componentKey}`"
            :file="safePreviewFile"
            @error="handleModalPreviewError"
            @load="handleModalPreviewLoad"
          />
        </div>

        <!-- 模态框错误状态 -->
        <div v-if="modalError" class="modal-error">
          <div class="error-content">
            <C_Icon
              name="i-mdi:alert-circle"
              type="unocss"
              :size="48"
              class="error-icon"
            />
            <h3>预览失败</h3>
            <p>{{ modalError }}</p>

            <!-- Excel文件专门的解决方案 -->
            <div v-if="isExcelFile" class="excel-solutions">
              <NAlert type="info" style="margin-bottom: 16px;">
                <template #icon>
                  <C_Icon name="i-mdi:lightbulb" type="unocss" :size="16" />
                </template>
                Excel文件预览建议：
                <ul style="margin: 8px 0; padding-left: 20px;">
                  <li>确保文件大小小于{{ maxSize }}MB</li>
                  <li>支持 .xlsx 格式，.xls 格式可能不稳定</li>
                  <li>复杂公式和宏可能影响预览</li>
                  <li>可尝试转换为CSV格式</li>
                </ul>
              </NAlert>
            </div>

            <NButton type="primary" @click="retryModalPreview">
              <template #icon>
                <C_Icon name="i-mdi:refresh" type="unocss" :size="16" />
              </template>
              重试
            </NButton>
          </div>
        </div>
      </div>
    </NModal>
  </div>
</template>

<script setup lang="ts">
import { VueFilesPreview } from 'vue-files-preview'
import 'vue-files-preview/lib/style.css'
import {
  NButton,
  NModal,
  NSpin,
  NAlert
} from 'naive-ui'

// ===== 类型定义 =====
interface FilePreviewProps {
  file?: File | string | Blob | null
  showUpload?: boolean
  previewMode?: 'inline' | 'modal'
  height?: string | number
  width?: string | number
  accept?: string
  maxSize?: number
}

interface FilePreviewEmits {
  'file-select': [file: File]
  'preview-success': []
  'preview-error': [error: string]
  'file-remove': []
  'modal-open': []
  'modal-close': []
}

// ===== Props & Emits =====
const props = withDefaults(defineProps<FilePreviewProps>(), {
  file: null,
  showUpload: true,
  previewMode: 'inline',
  height: '500px',
  width: '100%',
  accept: '',
  maxSize: 50,
})

const emit = defineEmits<FilePreviewEmits>()

// ===== 响应式数据 =====
const fileInputRef = ref<HTMLInputElement>()
const currentFile = ref<File | string | Blob | null>(null)
const loading = ref(false)
const error = ref('')
const isDragover = ref(false)
const componentKey = ref(0)

// 弹窗预览相关
const showPreviewModal = ref(false)
const modalLoading = ref(false)
const modalError = ref('')
const isFullscreen = ref(false)

// Excel特殊处理
const excelLoadTimeout = ref<NodeJS.Timeout | null>(null)
const EXCEL_LOAD_TIMEOUT = 10000 // 10秒超时

// ===== 常量定义 =====
const supportedFormats = ['PDF', 'Word', 'Excel', 'TXT', 'JPG', 'PNG', 'MP4', 'MP3']

// ===== 工具函数 =====
const getFileIcon = (type: string): string => {
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
    mp3: 'i-mdi:file-music-box text-cyan-500',
  }
  return iconMap[type] || 'i-mdi:file-outline text-gray-400'
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

const validateFile = (file: File): string | null => {
  if (file.size > props.maxSize * 1024 * 1024) {
    return `文件大小不能超过 ${props.maxSize}MB`
  }

  if (file.size === 0) {
    return '文件为空，请选择有效文件'
  }

  if (props.accept) {
    const allowedTypes = props.accept.split(',').map(type => type.trim())
    const fileExt = `.${file.name.split('.').pop()?.toLowerCase()}`
    if (!allowedTypes.includes(fileExt)) {
      return `不支持的文件类型：${fileExt}`
    }
  }

  return null
}

const isValidFile = (file: any): boolean => {
  if (!file) return false

  if (typeof file === 'string') {
    try {
      const url = new URL(file.trim())
      return ['http:', 'https:'].includes(url.protocol)
    } catch {
      return false
    }
  }

  if (file instanceof File) {
    return file.name && file.size >= 0
  }

  if (file instanceof Blob) {
    return file.size > 0
  }

  return false
}

// ===== 状态管理函数 =====
const resetState = () => {
  loading.value = false
  error.value = ''
  modalLoading.value = false
  modalError.value = ''
  componentKey.value++

  // 清除Excel超时定时器
  if (excelLoadTimeout.value) {
    clearTimeout(excelLoadTimeout.value)
    excelLoadTimeout.value = null
  }
}

// ===== 计算属性 =====
const acceptTypes = computed(() => {
  if (props.accept) return props.accept
  return '.pdf,.docx,.doc,.xlsx,.xls,.txt,.md,.jpg,.jpeg,.png,.gif,.mp4,.mp3'
})

const containerStyle = computed(() => {
  const style: Record<string, any> = {
    width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  }

  // Excel文件使用更大的固定高度，确保表格完整显示
  if (isExcelFile.value) {
    const excelHeight = typeof props.height === 'number'
      ? Math.max(props.height, 600) // Excel最小600px
      : '600px'
    style.height = typeof excelHeight === 'number' ? `${excelHeight}px` : excelHeight
  } else {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  }

  return style
})

const fileName = computed(() => {
  if (!currentFile.value) return ''
  if (typeof currentFile.value === 'string') {
    try {
      const url = new URL(currentFile.value)
      return url.pathname.split('/').pop() || '网络文件'
    } catch {
      return '网络文件'
    }
  }
  if (currentFile.value instanceof File) {
    return currentFile.value.name
  }
  return '未知文件'
})

const fileSize = computed(() => {
  if (currentFile.value instanceof File) {
    return currentFile.value.size
  }
  return 0
})

const fileType = computed(() => {
  if (!currentFile.value) return ''
  let name = ''

  if (typeof currentFile.value === 'string') {
    try {
      const url = new URL(currentFile.value)
      name = url.pathname
    } catch {
      name = currentFile.value
    }
  } else if (currentFile.value instanceof File) {
    name = currentFile.value.name
  }

  return name.split('.').pop()?.toLowerCase() || ''
})

const safePreviewFile = computed(() => {
  return isValidFile(currentFile.value) ? currentFile.value : null
})

// 检查是否为Excel文件
const isExcelFile = computed(() => {
  return ['xlsx', 'xls'].includes(fileType.value)
})

// ===== Excel特殊处理函数 =====
const setupExcelTimeout = (isModal = false) => {
  if (!isExcelFile.value) return

  // 清除之前的定时器
  if (excelLoadTimeout.value) {
    clearTimeout(excelLoadTimeout.value)
  }

  // 设置Excel文件超时处理
  excelLoadTimeout.value = setTimeout(() => {
    console.warn('[Excel预览] 加载超时，可能是文件过大或格式复杂')

    if (isModal) {
      if (modalLoading.value) {
        modalLoading.value = false
        emit('preview-success')
      }
    } else {
      if (loading.value) {
        loading.value = false
        emit('preview-success')
      }
    }
  }, EXCEL_LOAD_TIMEOUT)
}

// ===== 核心业务逻辑 =====
const startPreview = async () => {
  if (!safePreviewFile.value) {
    error.value = '无效的文件'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await nextTick()

    // Excel文件特殊处理
    if (isExcelFile.value) {
      console.log('[Excel预览] 开始加载Excel文件:', fileName.value)
      setupExcelTimeout(false)

      // Excel文件给更多时间加载
      setTimeout(() => {
        if (loading.value) {
          loading.value = false
          emit('preview-success')
        }
      }, 3000) // Excel文件延长到3秒
    } else {
      // 其他文件正常处理
      setTimeout(() => {
        if (loading.value) {
          loading.value = false
          emit('preview-success')
        }
      }, 1500)
    }

  } catch (err: any) {
    console.error('Preview start error:', err)
    handlePreviewError(err.message || '文件预览启动失败')
  }
}

const startModalPreview = async () => {
  if (!safePreviewFile.value) {
    modalError.value = '无效的文件'
    return
  }

  modalLoading.value = true
  modalError.value = ''

  try {
    await nextTick()

    // Excel文件特殊处理
    if (isExcelFile.value) {
      console.log('[Excel预览] 开始加载Excel文件(模态框):', fileName.value)
      setupExcelTimeout(true)

      setTimeout(() => {
        if (modalLoading.value) {
          modalLoading.value = false
          emit('preview-success')
        }
      }, 3000)
    } else {
      setTimeout(() => {
        if (modalLoading.value) {
          modalLoading.value = false
          emit('preview-success')
        }
      }, 1500)
    }

  } catch (err: any) {
    console.error('Modal preview start error:', err)
    handleModalPreviewError(err.message || '文件预览启动失败')
  }
}

// ===== 事件处理函数 =====
const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    processFile(file)
  }
  target.value = ''
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragover.value = false

  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    processFile(files[0])
  }
}

const processFile = (file: File) => {
  const validationError = validateFile(file)
  if (validationError) {
    error.value = validationError
    return
  }

  // Excel文件特殊提示
  if (['xlsx', 'xls'].includes(file.name.split('.').pop()?.toLowerCase() || '')) {
    console.log('[Excel预览] 检测到Excel文件，正在准备预览...')
  }

  currentFile.value = file
  emit('file-select', file)
  resetState()

  if (props.previewMode === 'inline') {
    nextTick(() => {
      startPreview()
    })
  }
}

const handlePreviewError = (err: any) => {
  loading.value = false

  // 清除Excel超时定时器
  if (excelLoadTimeout.value) {
    clearTimeout(excelLoadTimeout.value)
    excelLoadTimeout.value = null
  }

  const errorMessage = typeof err === 'string'
    ? err
    : err?.message || '文件预览失败，请检查文件格式是否正确'

  // Excel文件特殊错误提示
  if (isExcelFile.value) {
    console.error('[Excel预览] 预览失败:', errorMessage)
  }

  error.value = errorMessage
  emit('preview-error', error.value)
}

const handleModalPreviewError = (err: any) => {
  modalLoading.value = false

  if (excelLoadTimeout.value) {
    clearTimeout(excelLoadTimeout.value)
    excelLoadTimeout.value = null
  }

  const errorMessage = typeof err === 'string'
    ? err
    : err?.message || '文件预览失败，请检查文件格式是否正确'

  if (isExcelFile.value) {
    console.error('[Excel预览] 模态框预览失败:', errorMessage)
  }

  modalError.value = errorMessage
  emit('preview-error', errorMessage)
}

// 处理预览加载成功
const handlePreviewLoad = () => {
  if (excelLoadTimeout.value) {
    clearTimeout(excelLoadTimeout.value)
    excelLoadTimeout.value = null
  }

  if (isExcelFile.value) {
    console.log('[Excel预览] 加载成功')
  }
}

const handleModalPreviewLoad = () => {
  if (excelLoadTimeout.value) {
    clearTimeout(excelLoadTimeout.value)
    excelLoadTimeout.value = null
  }

  if (isExcelFile.value) {
    console.log('[Excel预览] 模态框加载成功')
  }
}

const forceStopLoading = () => {
  if (loading.value) {
    loading.value = false

    if (excelLoadTimeout.value) {
      clearTimeout(excelLoadTimeout.value)
      excelLoadTimeout.value = null
    }

    if (isExcelFile.value) {
      console.log('[Excel预览] 用户强制完成加载')
    }

    emit('preview-success')
  }
}

const forceStopModalLoading = () => {
  if (modalLoading.value) {
    modalLoading.value = false

    if (excelLoadTimeout.value) {
      clearTimeout(excelLoadTimeout.value)
      excelLoadTimeout.value = null
    }

    if (isExcelFile.value) {
      console.log('[Excel预览] 用户强制完成模态框加载')
    }

    emit('preview-success')
  }
}

const retryPreview = () => {
  if (safePreviewFile.value) {
    resetState()
    startPreview()
  }
}

const retryModalPreview = () => {
  if (safePreviewFile.value) {
    modalError.value = ''
    startModalPreview()
  }
}

const openPreviewModal = () => {
  showPreviewModal.value = true
  isFullscreen.value = false
  emit('modal-open')
  nextTick(() => {
    startModalPreview()
  })
}

const closePreviewModal = () => {
  showPreviewModal.value = false
  modalLoading.value = false
  modalError.value = ''
  isFullscreen.value = false

  if (excelLoadTimeout.value) {
    clearTimeout(excelLoadTimeout.value)
    excelLoadTimeout.value = null
  }

  emit('modal-close')
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  setTimeout(() => {
    componentKey.value++
  }, 100)
}

const clearFile = () => {
  currentFile.value = null
  resetState()
  closePreviewModal()
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
  emit('file-remove')
}

// ===== 键盘事件处理 =====
const handleKeydown = (event: KeyboardEvent) => {
  if (!showPreviewModal.value) return

  switch (event.key) {
    case 'Escape':
      if (isFullscreen.value) {
        isFullscreen.value = false
      } else {
        closePreviewModal()
      }
      break
    case 'F11':
      event.preventDefault()
      toggleFullscreen()
      break
    case 'f':
    case 'F':
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        toggleFullscreen()
      }
      break
  }
}

// ===== 生命周期钩子 =====
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  // 清理定时器
  if (excelLoadTimeout.value) {
    clearTimeout(excelLoadTimeout.value)
  }
})

// ===== 监听器 =====
watch(
  () => props.file,
  (newFile) => {
    if (newFile !== currentFile.value) {
      currentFile.value = newFile
      if (newFile) {
        resetState()
        if (props.previewMode === 'inline') {
          nextTick(() => {
            startPreview()
          })
        }
      } else {
        clearFile()
      }
    }
  },
  { immediate: true }
)

// ===== 暴露接口 =====
defineExpose({
  clearFile,
  retryPreview,
  forceStopLoading,
  openPreviewModal,
  closePreviewModal,
  toggleFullscreen,
})
</script>

<style lang="scss" scoped>
.c-file-preview {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .upload-area {
    .upload-zone {
      border: 2px dashed var(--border-color);
      border-radius: 8px;
      padding: 40px 20px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background-color: var(--body-color);

      &:hover,
      &.is-dragover {
        border-color: var(--primary-color);
        background-color: var(--primary-color-hover);
      }

      .upload-content {
        .upload-icon {
          color: var(--text-color-3);
          margin-bottom: 16px;
        }

        .upload-text {
          font-size: 16px;
          color: var(--text-color-1);
          margin: 0 0 8px 0;
        }

        .upload-hint {
          font-size: 14px;
          color: var(--text-color-3);
          margin: 0;
        }
      }
    }
  }

  .file-info {
    .file-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background-color: var(--body-color);
      border: 1px solid var(--border-color);
      border-radius: 6px;

      .file-icon {
        flex-shrink: 0;
      }

      .file-details {
        flex: 1;
        min-width: 0;

        .file-name {
          font-weight: 500;
          color: var(--text-color-1);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .file-size {
          font-size: 12px;
          color: var(--text-color-3);
          margin-top: 2px;
        }
      }

      .file-actions {
        display: flex;
        gap: 8px;
        flex-shrink: 0;
      }
    }
  }

  .preview-container {
    position: relative;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    overflow: hidden;
    background-color: var(--body-color);

    .excel-warning {
      padding: 12px;
      border-bottom: 1px solid var(--border-color);
    }

    .preview-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      min-height: 200px;

      .loading-content {
        text-align: center;

        p {
          margin: 0 0 8px 0;
          color: var(--text-color-2);
        }
      }
    }

    .preview-wrapper {
      width: 100%;
      height: 100%; /* 占满容器 */
      position: relative;
      overflow: auto; /* 允许滚动 */

      /* 强制设置Excel预览组件的样式 */
      :deep(.vue-files-preview) {
        width: 100% !important;
        height: 100% !important;
        min-height: 100% !important;
        position: relative !important;
      }

      /* Excel内容区域样式 */
      :deep(.vue-files-preview > *) {
        width: 100% !important;
        height: 100% !important;
        min-height: 100% !important;
      }

      /* iframe特殊处理 */
      :deep(.vue-files-preview iframe) {
        width: 100% !important;
        height: 100% !important;
        min-height: 100% !important;
        border: none !important;
      }

      /* canvas特殊处理 */
      :deep(.vue-files-preview canvas) {
        width: 100% !important;
        height: auto !important;
        min-height: 100% !important;
      }

      /* 预览内容容器 */
      :deep(.vue-files-preview .preview-content),
      :deep(.vue-files-preview .spreadsheet-preview),
      :deep(.vue-files-preview .excel-preview) {
        width: 100% !important;
        height: 100% !important;
        min-height: 100% !important;
        overflow: auto !important;
      }
    }

    .preview-error {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      min-height: 200px;

      .error-content {
        text-align: center;
        max-width: 500px;
        padding: 20px;

        .error-icon {
          color: var(--error-color);
          margin-bottom: 16px;
        }

        h3 {
          margin: 0 0 8px 0;
          color: var(--text-color-1);
        }

        p {
          margin: 0 0 16px 0;
          color: var(--text-color-3);
        }

        .excel-solutions {
          margin-bottom: 16px;
          text-align: left;
        }
      }
    }
  }

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 300px;
    border: 1px dashed var(--border-color);
    border-radius: 6px;

    .empty-content {
      text-align: center;

      .empty-icon {
        color: var(--text-color-3);
        margin-bottom: 16px;
      }

      p {
        margin: 0;
        color: var(--text-color-3);
      }
    }
  }

  .hidden {
    display: none;
  }
}

// 弹窗预览样式
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  .modal-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
    color: var(--text-color-1);
    flex: 1;
    min-width: 0;

    span {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .modal-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }
}

.modal-preview-container {
  flex: 1;
  position: relative;
  background-color: white;
  height: 100%; /* 确保占满父容器 */
  overflow: hidden; /* 防止内容溢出 */

  &.fullscreen-container {
    height: 100% !important;
  }

  .excel-warning {
    padding: 12px;
    border-bottom: 1px solid var(--border-color);
  }

  .modal-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    .loading-content {
      text-align: center;

      p {
        margin: 0 0 8px 0;
        color: var(--text-color-2);
      }
    }
  }

  .modal-preview-wrapper {
    width: 100%;
    height: 100%; /* 确保占满容器 */
    position: relative;
    overflow: auto; /* 允许滚动 */

    /* 强制设置Excel预览组件的高度 */
    :deep(.vue-files-preview) {
      width: 100% !important;
      height: 100% !important;
      min-height: 100% !important;
      position: relative !important;
    }

    /* 确保Excel内容区域完整显示 */
    :deep(.vue-files-preview > *) {
      width: 100% !important;
      height: 100% !important;
      min-height: 100% !important;
    }

    /* 针对iframe的特殊处理 */
    :deep(.vue-files-preview iframe) {
      width: 100% !important;
      height: 100% !important;
      min-height: 100% !important;
      border: none !important;
    }

    /* 针对canvas的特殊处理 */
    :deep(.vue-files-preview canvas) {
      width: 100% !important;
      height: auto !important;
      min-height: 100% !important;
    }

    /* 针对预览内容的处理 */
    :deep(.vue-files-preview .preview-content),
    :deep(.vue-files-preview .spreadsheet-preview),
    :deep(.vue-files-preview .excel-preview) {
      width: 100% !important;
      height: 100% !important;
      min-height: 100% !important;
      overflow: auto !important;
    }
  }

  .modal-error {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    .error-content {
      text-align: center;
      max-width: 500px;
      padding: 20px;

      .error-icon {
        color: var(--error-color);
        margin-bottom: 16px;
      }

      h3 {
        margin: 0 0 8px 0;
        color: var(--text-color-1);
      }

      p {
        margin: 0 0 16px 0;
        color: var(--text-color-3);
      }

      .excel-solutions {
        margin-bottom: 16px;
        text-align: left;
      }
    }
  }
}

// 全屏模式样式覆盖
:deep(.n-modal) {
  &[style*="100vw"] {
    .n-card {
      border-radius: 0 !important;
      max-height: 100vh !important;
      height: 100vh !important;
      overflow: hidden !important;

      .n-card__content {
        padding: 0 !important;
        height: calc(100vh - 60px) !important; /* 减去header高度 */
        overflow: hidden !important;
      }

      .n-card__header {
        padding: 12px 16px !important;
        height: 60px !important;
        flex-shrink: 0 !important;
      }
    }
  }

  /* 确保非全屏模式的正确高度 */
  .n-card {
    height: 100% !important;
    display: flex !important;
    flex-direction: column !important;

    .n-card__content {
      flex: 1 !important;
      overflow: hidden !important;
      height: 100% !important;
    }
  }
}
</style>
