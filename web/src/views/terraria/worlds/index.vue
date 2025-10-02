<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { NCard, NDataTable, NButton, NSpace, NTag, NModal, NUpload, NForm, NFormItem, NSpin, NPopconfirm, NEmpty, NProgress } from 'naive-ui'
import type { DataTableColumns, UploadFileInfo } from 'naive-ui'
import { getWorldList, uploadWorld, downloadWorld, deleteWorld, backupWorld, restoreWorld, type World } from '@/api/terraria'

// State
const loading = ref(false)
const worlds = ref<World[]>([])
const showUploadModal = ref(false)
const uploadFileList = ref<UploadFileInfo[]>([])
const uploadProgress = ref(0)

// Load worlds
const loadWorlds = async () => {
  loading.value = true
  try {
    const res = await getWorldList()
    worlds.value = res || []
  } catch (error) {
    console.error('Failed to load worlds:', error)
    window.$message?.error('加载世界列表失败')
  } finally {
    loading.value = false
  }
}

// Handle upload
const handleUpload = async () => {
  if (uploadFileList.value.length === 0) {
    window.$message?.warning('请选择要上传的世界文件')
    return
  }

  const file = uploadFileList.value[0].file
  if (!file) return

  loading.value = true
  uploadProgress.value = 0
  
  try {
    await uploadWorld(file)
    window.$message?.success('世界文件上传成功')
    showUploadModal.value = false
    uploadFileList.value = []
    loadWorlds()
  } catch (error) {
    console.error('Failed to upload world:', error)
    window.$message?.error('上传世界文件失败')
  } finally {
    loading.value = false
    uploadProgress.value = 0
  }
}

// Handle download
const handleDownload = async (world: World) => {
  loading.value = true
  try {
    const blob = await downloadWorld(world.id)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = world.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    window.$message?.success('世界文件下载成功')
  } catch (error) {
    console.error('Failed to download world:', error)
    window.$message?.error('下载世界文件失败')
  } finally {
    loading.value = false
  }
}

// Handle delete
const handleDelete = async (world: World) => {
  loading.value = true
  try {
    await deleteWorld(world.id)
    window.$message?.success(`已删除世界: ${world.name}`)
    loadWorlds()
  } catch (error) {
    console.error('Failed to delete world:', error)
    window.$message?.error('删除世界失败')
  } finally {
    loading.value = false
  }
}

// Handle backup
const handleBackup = async (world: World) => {
  loading.value = true
  try {
    await backupWorld(world.id)
    window.$message?.success(`世界 ${world.name} 已备份`)
    loadWorlds()
  } catch (error) {
    console.error('Failed to backup world:', error)
    window.$message?.error('备份世界失败')
  } finally {
    loading.value = false
  }
}

// Handle restore
const handleRestore = async (world: World) => {
  loading.value = true
  try {
    await restoreWorld(world.id)
    window.$message?.success(`世界 ${world.name} 已恢复`)
    loadWorlds()
  } catch (error) {
    console.error('Failed to restore world:', error)
    window.$message?.error('恢复世界失败')
  } finally {
    loading.value = false
  }
}

// Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

// Get difficulty color
const getDifficultyColor = (difficulty: string): string => {
  const colors: Record<string, string> = {
    normal: 'success',
    expert: 'warning',
    master: 'error',
    journey: 'info'
  }
  return colors[difficulty] || 'default'
}

// Get difficulty text
const getDifficultyText = (difficulty: string): string => {
  const texts: Record<string, string> = {
    normal: '普通',
    expert: '专家',
    master: '大师',
    journey: '旅程'
  }
  return texts[difficulty] || difficulty
}

// Table columns
const columns: DataTableColumns<World> = [
  {
    title: '世界名称',
    key: 'name',
    width: 200
  },
  {
    title: '文件名',
    key: 'fileName',
    width: 200
  },
  {
    title: '难度',
    key: 'difficulty',
    width: 100,
    render: (row) => {
      return h(
        NTag,
        { type: getDifficultyColor(row.difficulty) as any, size: 'small' },
        { default: () => getDifficultyText(row.difficulty) }
      )
    }
  },
  {
    title: '文件大小',
    key: 'size',
    width: 120,
    render: (row) => formatFileSize(row.size)
  },
  {
    title: '创建时间',
    key: 'createdAt',
    width: 180
  },
  {
    title: '最后修改',
    key: 'updatedAt',
    width: 180
  },
  {
    title: '操作',
    key: 'actions',
    width: 280,
    render: (row) => {
      return h(
        NSpace,
        { size: 'small' },
        {
          default: () => [
            h(
              NButton,
              {
                size: 'small',
                type: 'info',
                onClick: () => handleDownload(row)
              },
              { default: () => '下载' }
            ),
            h(
              NButton,
              {
                size: 'small',
                type: 'primary',
                onClick: () => handleBackup(row)
              },
              { default: () => '备份' }
            ),
            h(
              NButton,
              {
                size: 'small',
                type: 'warning',
                onClick: () => handleRestore(row)
              },
              { default: () => '恢复' }
            ),
            h(
              NPopconfirm,
              {
                onPositiveClick: () => handleDelete(row),
                positiveText: '确认',
                negativeText: '取消'
              },
              {
                trigger: () => h(
                  NButton,
                  {
                    size: 'small',
                    type: 'error'
                  },
                  { default: () => '删除' }
                ),
                default: () => '确定要删除这个世界吗？此操作不可恢复！'
              }
            )
          ]
        }
      )
    }
  }
]

// Upload before handler
const beforeUpload = (data: { file: UploadFileInfo }) => {
  const file = data.file.file
  if (!file) return false
  
  const validExtensions = ['.wld', '.bak']
  const fileName = file.name.toLowerCase()
  const isValid = validExtensions.some(ext => fileName.endsWith(ext))
  
  if (!isValid) {
    window.$message?.error('只支持 .wld 和 .bak 格式的世界文件')
    return false
  }
  
  if (file.size > 100 * 1024 * 1024) {
    window.$message?.error('文件大小不能超过 100MB')
    return false
  }
  
  return true
}

// Lifecycle
onMounted(() => {
  loadWorlds()
})
</script>

<template>
  <div class="terraria-worlds">
    <NCard title="世界管理" :bordered="false">
      <template #header-extra>
        <NSpace>
          <NButton type="primary" @click="showUploadModal = true">
            上传世界
          </NButton>
          <NButton @click="loadWorlds">刷新</NButton>
        </NSpace>
      </template>
      
      <NSpin :show="loading">
        <NDataTable
          v-if="worlds.length > 0"
          :columns="columns"
          :data="worlds"
          :pagination="{ pageSize: 10 }"
          :bordered="false"
          size="small"
        />
        <NEmpty v-else description="暂无世界文件" />
      </NSpin>
    </NCard>

    <!-- Upload Modal -->
    <NModal
      v-model:show="showUploadModal"
      preset="card"
      title="上传世界文件"
      style="width: 600px"
      :bordered="false"
    >
      <NForm label-placement="left" label-width="100">
        <NFormItem label="选择文件">
          <NUpload
            v-model:file-list="uploadFileList"
            :max="1"
            :before-upload="beforeUpload"
            accept=".wld,.bak"
          >
            <NButton>选择世界文件</NButton>
          </NUpload>
        </NFormItem>
        <NFormItem v-if="uploadProgress > 0" label="上传进度">
          <NProgress
            type="line"
            :percentage="uploadProgress"
            :indicator-placement="'inside'"
          />
        </NFormItem>
      </NForm>
      
      <div style="margin-top: 16px; padding: 12px; background-color: rgba(0, 0, 0, 0.02); border-radius: 4px;">
        <div style="font-size: 13px; color: #666;">
          <div style="margin-bottom: 8px; font-weight: 600;">上传说明：</div>
          <div>• 支持 .wld 和 .bak 格式的泰拉瑞亚世界文件</div>
          <div>• 文件大小限制：100MB</div>
          <div>• 上传后需要在服务器配置中选择该世界</div>
        </div>
      </div>

      <template #footer>
        <NSpace justify="end">
          <NButton @click="showUploadModal = false">取消</NButton>
          <NButton
            type="primary"
            :loading="loading"
            :disabled="uploadFileList.length === 0"
            @click="handleUpload"
          >
            开始上传
          </NButton>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>

<style scoped lang="scss">
.terraria-worlds {
  padding: 16px;
}
</style>