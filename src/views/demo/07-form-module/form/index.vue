<template>
  <div class="form-demo-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <NH1>表单组件基本场景示例</NH1>
      <p>基于 C_Form 组件的表单配置了基本示例，后面持续追加更加定制化场景</p>
    </div>

    <!-- 表单卡片 -->
    <NCard
      title="表单配置示例"
      :bordered="false"
    >
      <div class="form-container p-4">
        <C_Form
          ref="formRef"
          :options="OPTIONS"
          label-width="120px"
          @on-preview="handlePreview"
          @on-remove="handleRemove"
          @before-remove="handleBeforeRemove"
          @on-exceed="handleExceed"
          @on-success="handleSuccess"
          @update:modelValue="handleModelChange"
        >
          <!-- 自定义上传按钮 -->
          <template #uploadClick>
            <NButton
              type="primary"
              dashed
            >
              <template #icon>
                <NIcon>
                  <span class="i-carbon-cloud-upload"></span>
                </NIcon>
              </template>
              点击上传
            </NButton>
          </template>

          <!-- 自定义上传提示 -->
          <template #uploadTip>
            <div style="color: #ccc; font-size: 12px">
              仅支持 jpg/png 格式文件，大小不超过 500KB
            </div>
          </template>

          <!-- 自定义操作区域 -->
          <template #action="scope">
            <NSpace>
              <NButton
                type="primary"
                size="small"
                @click="submitForm(scope)"
                :loading="submitLoading"
              >
                提交表单
              </NButton>
              <NButton
                size="small"
                type="error"
                @click="resetForm"
              >
                重置表单
              </NButton>
              <NButton
                type="success"
                size="small"
                @click="previewFormData"
              >
                预览数据
              </NButton>
            </NSpace>
          </template>
        </C_Form>
      </div>
    </NCard>

    <!-- 数据预览弹窗 -->
    <Teleport to="body">
      <NModal
        v-model:show="showPreview"
        preset="card"
        title="表单数据预览"
        size="huge"
        :bordered="false"
        :segmented="true"
        :z-index="99999"
        :mask-closable="true"
        :close-on-esc="true"
        class="w50%"
      >
        <pre class="data-preview">{{ JSON.stringify(formData, null, 2) }}</pre>
      </NModal>
    </Teleport>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue'
  import { useMessage, useDialog } from 'naive-ui'
  import { OPTIONS } from './data'

  const message = useMessage()
  const dialog = useDialog()

  // 响应式数据
  const formRef = ref<any>()
  const submitLoading = ref<boolean>(false)
  const showPreview = ref<boolean>(false)
  const formData = ref<Record<string, any>>({})

  // 处理表单数据变化
  const handleModelChange = (model: Record<string, any>) => {
    formData.value = model
    console.info('表单数据变化:', model)
  }

  // 文件上传相关事件处理
  const handleExceed = (val: any) => {
    console.info('文件数量超限:', val)
    message.warning(
      `最多只能上传 ${val.limit} 个文件，您本次选择了 ${val.files.length} 个文件，总计 ${
        val.files.length + val.fileList.length
      } 个文件，已超出限制`
    )
  }

  const handleBeforeRemove = (val: any): Promise<boolean> => {
    return new Promise(resolve => {
      dialog.warning({
        title: '确认删除',
        content: `确定要删除文件 "${val.name}" 吗？此操作不可撤销。`,
        positiveText: '确认删除',
        negativeText: '取消',
        onPositiveClick: () => {
          message.success('文件删除成功')
          resolve(true)
        },
        onNegativeClick: () => {
          resolve(false)
        },
      })
    })
  }

  const handlePreview = (val: any) => {
    console.info('预览文件:', val)
    message.info(`预览文件: ${val.name}`)
  }

  const handleRemove = (val: any) => {
    console.info('删除文件:', val)
    message.success(`文件 "${val.name}" 已删除`)
  }

  const handleSuccess = (val: any) => {
    console.info('上传成功:', val)
    message.success(`文件 "${val.name}" 上传成功`)
  }

  // 表单操作方法
  const submitForm = async (formScope: any) => {
    try {
      submitLoading.value = true

      // 表单验证
      await formScope.form.validate()

      // 获取表单数据
      const formModel = formScope.model
      console.info('提交的表单数据:', formModel)

      // 模拟提交请求
      await new Promise(resolve => setTimeout(resolve, 1000))

      message.success('表单提交成功！')
    } catch (error) {
      console.error('表单验证失败:', error)
      message.error('表单填写有误，请检查后重新提交')
    } finally {
      submitLoading.value = false
    }
  }

  const resetForm = () => {
    formRef.value?.resetFields()
    message.info('表单已重置')
  }

  const previewFormData = () => {
    const model = formRef.value?.getModel()
    if (model) {
      formData.value = model
      showPreview.value = true
    }
  }

  // 组件挂载后的初始化
  onMounted(() => {
    console.info('表单组件已挂载')
    console.info('表单配置项:', OPTIONS)
  })
</script>

<style scoped>
  .form-demo-page {
    max-width: 1000px;
    margin: 0 auto;
    padding: 24px;
  }

  .page-header {
    text-align: center;
    margin-bottom: 24px;
  }

  .page-header h1 {
    margin: 0 0 8px 0;
  }

  .page-header p {
    margin: 0;
    opacity: 0.7;
  }

  .form-container {
    background: var(--card-color, #fff);
    border-radius: 8px;
  }

  .data-preview {
    background: #f5f5f5;
    padding: 16px;
    border-radius: 4px;
    overflow: auto;
    max-height: 400px;
    margin: 0;
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 13px;
    line-height: 1.5;
  }
</style>
