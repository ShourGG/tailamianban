<template>
  <div class="c-vtable-gantt-wrapper">
    <div
      v-if="showToolbar"
      class="gantt-toolbar"
    >
      <div class="toolbar-left">
        <span class="gantt-title">{{ title || '甘特图' }}</span>
      </div>
      <div class="toolbar-right">
        <NButton
          v-if="showFullscreenButton"
          size="small"
          @click="toggleFullscreen"
        >
          <template #icon>
            <C_Icon
              :name="isFullscreen ? 'carbon:minimize' : 'carbon:maximize'"
              :size="16"
              color="currentColor"
            />
          </template>
          {{ isFullscreen ? '退出全屏' : '全屏' }}
        </NButton>
      </div>
    </div>
    <div
      ref="ganttContainerRef"
      class="gantt-container"
      :style="{ height: containerHeight }"
    />
  </div>
</template>

<script setup lang="ts">
  // 导入数据配置
  import {
    presetConfigs,
    type GanttTask,
    type GanttOptions,
    type GanttPreset,
  } from './data'

  interface Props {
    data?: GanttTask[]
    options?: GanttOptions
    preset?: GanttPreset
    height?: string | number
    title?: string
    showToolbar?: boolean
    showFullscreenButton?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    data: () => [],
    options: () => ({}),
    preset: 'basic',
    height: '600px',
    title: '',
    showToolbar: true,
    showFullscreenButton: true,
  })

  const emit = defineEmits<{
    ganttCreated: [gantt: any]
    taskClick: [task: GanttTask, event: Event]
    taskChange: [task: GanttTask, changes: any]
  }>()

  // 响应式数据
  const ganttContainerRef = ref<HTMLDivElement>()
  const ganttInstance = ref<any>()
  const isFullscreen = ref(false)

  const containerHeight = computed(() =>
    typeof props.height === 'number' ? `${props.height}px` : props.height
  )

  // 深度合并配置
  const deepMerge = (target: any, source: any): any => {
    const result = { ...target }
    for (const key in source) {
      if (
        source[key] &&
        typeof source[key] === 'object' &&
        !Array.isArray(source[key])
      ) {
        result[key] = deepMerge(target[key] || {}, source[key])
      } else {
        result[key] = source[key]
      }
    }
    return result
  }

  // 处理数据格式
  const processData = (data: GanttTask[]): GanttTask[] => {
    return data.map(item => ({
      ...item,
      title: item.title || `任务${item.id}`,
      children: item.children ? processData(item.children) : undefined,
    }))
  }

  // 初始化甘特图
  const initGantt = async () => {
    if (!ganttContainerRef.value) return

    try {
      const { Gantt } = await import('@visactor/vtable-gantt')

      const presetConfig = presetConfigs[props.preset] || presetConfigs.basic
      const finalConfig = deepMerge(presetConfig, props.options)
      const processedData = processData(props.data || [])

      if (ganttInstance.value) {
        ganttInstance.value.release()
      }

      ganttInstance.value = new Gantt(ganttContainerRef.value, {
        ...finalConfig,
        records: processedData,
      })

      // 绑定事件
      ganttInstance.value.on('click_cell', (args: any) => {
        const { record, event } = args || {}
        if (record) emit('taskClick', record, event)
      })

      ganttInstance.value.on('change_data', (args: any) => {
        const { record, changes } = args || {}
        if (record && changes) emit('taskChange', record, changes)
      })

      emit('ganttCreated', ganttInstance.value)
    } catch (error) {
      console.error('甘特图初始化失败:', error)
    }
  }

  // 全屏切换
  const toggleFullscreen = async () => {
    if (!ganttContainerRef.value) return

    try {
      if (!document.fullscreenElement) {
        await ganttContainerRef.value.requestFullscreen()
        isFullscreen.value = true
      } else {
        await document.exitFullscreen()
        isFullscreen.value = false
      }

      setTimeout(() => ganttInstance.value?.resize?.(), 100)
    } catch (error) {
      console.warn('全屏切换失败:', error)
      isFullscreen.value = !isFullscreen.value
      nextTick(() => ganttInstance.value?.resize?.())
    }
  }

  // 监听全屏状态变化
  const handleFullscreenChange = () => {
    isFullscreen.value = !!document.fullscreenElement
    nextTick(() => ganttInstance.value?.resize?.())
  }

  // 更新数据
  const updateData = (newData: GanttTask[]) => {
    if (ganttInstance.value && newData) {
      try {
        const processedData = processData(newData)
        ganttInstance.value.setRecords(processedData)
      } catch (error) {
        console.warn('更新数据失败:', error)
      }
    }
  }

  // 更新配置
  const updateOptions = (newOptions: GanttOptions) => {
    if (ganttInstance.value && newOptions) {
      try {
        ganttInstance.value.updateOption(newOptions)
      } catch (error) {
        console.warn('更新配置失败:', error)
      }
    }
  }

  // 销毁甘特图
  const destroyGantt = () => {
    if (ganttInstance.value) {
      try {
        ganttInstance.value.release()
      } catch (error) {
        console.warn('销毁甘特图失败:', error)
      } finally {
        ganttInstance.value = undefined
      }
    }
  }

  // 监听变化
  watch(
    () => props.data,
    newData => {
      if (newData && ganttInstance.value) {
        updateData(newData)
      }
    },
    { deep: true }
  )

  watch(
    () => [props.options, props.preset],
    () => {
      nextTick(() => {
        initGantt()
      })
    },
    { deep: true }
  )

  // 生命周期
  onMounted(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    nextTick(() => {
      setTimeout(() => {
        initGantt()
      }, 100)
    })
  })

  onUnmounted(() => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
    destroyGantt()
  })

  // 暴露方法
  defineExpose({
    ganttInstance,
    updateData,
    updateOptions,
    toggleFullscreen,
  })
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
