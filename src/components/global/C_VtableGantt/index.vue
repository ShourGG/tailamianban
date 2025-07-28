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
              :name="isFullscreen ? 'i-carbon-minimize' : 'i-carbon-maximize'"
              type="unocss"
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
  // 类型定义
  export interface GanttTask {
    id: string | number
    title: string
    start: string | Date
    end?: string | Date
    progress?: number
    priority?: string
    developer?: string
    avatar?: string
    type?: 'milestone' | 'task'
    dependencies?: (string | number)[]
    children?: GanttTask[]
    [key: string]: any
  }

  export interface GanttColumn {
    field: string
    title: string
    width?: number | 'auto'
    tree?: boolean
    sort?: boolean
    editor?: 'input' | 'date-input' | 'select'
    headerStyle?: Record<string, any>
    style?: Record<string, any>
    customLayout?: (args: any) => { rootContainer: any; expectedWidth?: number }
    [key: string]: any
  }

  export interface TimelineScale {
    unit: 'day' | 'week' | 'month' | 'quarter' | 'year'
    step: number
    startOfWeek?: 'sunday' | 'monday'
    format?: (date: any) => string
    style?: Record<string, any>
    customLayout?: (args: any) => { rootContainer: any }
  }

  export interface GanttOptions {
    overscrollBehavior?: string
    headerRowHeight?: number
    rowHeight?: number
    minDate?: string
    maxDate?: string
    taskListTable?: {
      columns?: GanttColumn[]
      tableWidth?: number | 'auto'
      minTableWidth?: number
      maxTableWidth?: number
      theme?: {
        headerStyle?: Record<string, any>
        bodyStyle?: Record<string, any>
      }
    }
    frame?: {
      outerFrameStyle?: Record<string, any>
      verticalSplitLineMoveable?: boolean
      verticalSplitLine?: Record<string, any>
      horizontalSplitLine?: Record<string, any>
    }
    grid?: {
      backgroundColor?: string
      weekendBackgroundColor?: string
      verticalLine?: Record<string, any>
      horizontalLine?: Record<string, any>
    }
    taskBar?: {
      startDateField?: string
      endDateField?: string
      progressField?: string
      resizable?: boolean
      moveable?: boolean
      hoverBarStyle?: Record<string, any>
      labelText?: string
      labelTextStyle?: Record<string, any>
      barStyle?: Record<string, any>
      milestoneStyle?: Record<string, any>
      customLayout?: (args: any) => { rootContainer: any }
    }
    timelineHeader?: {
      colWidth?: number
      backgroundColor?: string
      horizontalLine?: Record<string, any>
      verticalLine?: Record<string, any>
      scales?: TimelineScale[]
    }
    markLine?: Array<{
      date: string
      style?: Record<string, any>
    }>
    rowSeriesNumber?: {
      title?: string
      dragOrder?: boolean
      headerStyle?: Record<string, any>
      style?: Record<string, any>
    }
    scrollStyle?: Record<string, any>
    [key: string]: any
  }

  export type GanttPreset =
    | 'basic'
    | 'project'
    | 'timeline'
    | 'milestone'
    | 'official'
    | 'custom'

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

  // 计算属性
  const containerHeight = computed(() => {
    if (typeof props.height === 'number') {
      return `${props.height}px`
    }
    return props.height
  })

  // 通用配置生成器 - 减少重复代码
  const createCommonConfig = () => ({
    theme: {
      headerStyle: {
        borderColor: '#e1e4e8',
        borderLineWidth: 1,
        fontSize: 14,
        fontWeight: 'bold',
        bgColor: '#EEF1F5',
      },
      bodyStyle: {
        borderColor: '#e1e4e8',
        borderLineWidth: [1, 0, 1, 0],
        fontSize: 13,
        bgColor: '#FFF',
      },
    },
    frame: {
      outerFrameStyle: {
        borderLineWidth: 1,
        borderColor: '#e1e4e8',
        cornerRadius: 6,
      },
      verticalSplitLineMoveable: true,
      verticalSplitLine: {
        lineColor: '#e1e4e8',
        lineWidth: 2,
      },
    },
    grid: {
      weekendBackgroundColor: '#f8f8f8',
      verticalLine: { lineWidth: 1, lineColor: '#e1e4e8' },
      horizontalLine: { lineWidth: 1, lineColor: '#e1e4e8' },
    },
    timelineHeader: {
      backgroundColor: '#EEF1F5',
      colWidth: 60,
      horizontalLine: { lineWidth: 1, lineColor: '#e1e4e8' },
      verticalLine: { lineWidth: 1, lineColor: '#e1e4e8' },
    },
    scrollStyle: {
      scrollRailColor: 'rgba(246,246,246,0.5)',
      visible: 'scrolling',
      width: 6,
      scrollSliderCornerRadius: 2,
      scrollSliderColor: '#1890ff',
    },
  })

  const getPresetOptions = (preset: GanttPreset): GanttOptions => {
    const common = createCommonConfig()

    const configs = {
      basic: {
        overscrollBehavior: 'none',
        headerRowHeight: 40,
        rowHeight: 40,
        taskListTable: {
          columns: [
            { field: 'title', title: '任务名称', width: 220, tree: true },
            { field: 'start', title: '开始时间', width: 120 },
            { field: 'end', title: '结束时间', width: 120 },
            { field: 'progress', title: '进度', width: 80 },
          ],
          tableWidth: 420,
          minTableWidth: 300,
          theme: common.theme,
        },
        frame: common.frame,
        grid: common.grid,
        taskBar: {
          startDateField: 'start',
          endDateField: 'end',
          progressField: 'progress',
          moveable: true,
          resizable: true,
          labelText: '{title}',
          labelTextStyle: { fontSize: 12, textAlign: 'left' },
          barStyle: {
            width: 18,
            barColor: '#1890ff',
            completedBarColor: '#52c41a',
            cornerRadius: 4,
            borderLineWidth: 1,
            borderColor: '#0050b3',
          },
          milestoneStyle: {
            borderColor: '#fa8c16',
            borderLineWidth: 1,
            fillColor: '#ffd666',
            width: 12,
          },
        },
        timelineHeader: {
          ...common.timelineHeader,
          scales: [
            {
              unit: 'week' as const,
              step: 1,
              format: (date: any) => `第${date.dateIndex}周`,
              style: { fontSize: 12, fontWeight: 'bold' },
            },
            {
              unit: 'day' as const,
              step: 1,
              format: (date: any) => `${date.dateIndex}`,
              style: { fontSize: 11 },
            },
          ],
        },
        scrollStyle: common.scrollStyle,
      },

      project: {
        overscrollBehavior: 'none',
        headerRowHeight: 40,
        rowHeight: 40,
        taskListTable: {
          columns: [
            {
              field: 'title',
              title: '任务名称',
              width: 200,
              tree: true,
              editor: 'input',
            },
            {
              field: 'start',
              title: '开始时间',
              width: 120,
              editor: 'date-input',
            },
            {
              field: 'end',
              title: '结束时间',
              width: 120,
              editor: 'date-input',
            },
            {
              field: 'priority',
              title: '优先级',
              width: 80,
              editor: 'input',
            },
            {
              field: 'progress',
              title: '进度%',
              width: 80,
              editor: 'input',
            },
          ],
          tableWidth: 480,
          minTableWidth: 350,
          maxTableWidth: 800,
          theme: common.theme,
          hierarchyExpandLevel: 2,
        },
        frame: {
          ...common.frame,
          outerFrameStyle: {
            borderLineWidth: 2,
            borderColor: '#e1e4e8',
            cornerRadius: 8,
          },
          verticalSplitLine: { lineColor: '#e1e4e8', lineWidth: 3 },
        },
        grid: common.grid,
        taskBar: {
          startDateField: 'start',
          endDateField: 'end',
          progressField: 'progress',
          moveable: true,
          resizable: true,
          hoverBarStyle: { barOverlayColor: 'rgba(24, 144, 255, 0.3)' },
          labelText: '{title} {progress}%',
          labelTextStyle: {
            fontSize: 12,
            textAlign: 'left',
            textOverflow: 'ellipsis',
          },
          barStyle: {
            width: 20,
            barColor: '#1890ff',
            completedBarColor: '#52c41a',
            cornerRadius: 6,
            borderLineWidth: 1,
            borderColor: '#0050b3',
          },
        },
        timelineHeader: {
          ...common.timelineHeader,
          scales: [
            {
              unit: 'week' as const,
              step: 1,
              startOfWeek: 'monday' as const,
              format: (date: any) => `第${date.dateIndex}周`,
              style: { fontSize: 13, fontWeight: 'bold', textAlign: 'center' },
            },
            {
              unit: 'day' as const,
              step: 1,
              format: (date: any) => `${date.dateIndex}`,
              style: { fontSize: 11, textAlign: 'center' },
            },
          ],
        },
        rowSeriesNumber: {
          title: '序号',
          dragOrder: true,
          headerStyle: { bgColor: '#EEF1F5', borderColor: '#e1e4e8' },
          style: { borderColor: '#e1e4e8' },
        },
        scrollStyle: common.scrollStyle,
      },

      timeline: {
        overscrollBehavior: 'none',
        headerRowHeight: 45,
        rowHeight: 40,
        taskListTable: {
          columns: [
            { field: 'title', title: '事件名称', width: 250, tree: true },
            { field: 'start', title: '时间', width: 150 },
          ],
          tableWidth: 400,
          minTableWidth: 300,
          theme: {
            headerStyle: { ...common.theme.headerStyle, bgColor: '#f0f2f5' },
            bodyStyle: common.theme.bodyStyle,
          },
        },
        frame: {
          outerFrameStyle: {
            borderLineWidth: 1,
            borderColor: '#d9d9d9',
            cornerRadius: 4,
          },
          verticalSplitLineMoveable: true,
        },
        grid: {
          verticalLine: { lineWidth: 1, lineColor: '#f0f0f0' },
          horizontalLine: { lineWidth: 1, lineColor: '#f0f0f0' },
        },
        taskBar: {
          startDateField: 'start',
          endDateField: 'end',
          progressField: 'progress',
          moveable: true,
          resizable: true,
          labelText: '{title}',
          labelTextStyle: { fontSize: 12, textAlign: 'left' },
          barStyle: {
            width: 22,
            barColor: '#722ed1',
            completedBarColor: '#b37feb',
            cornerRadius: 8,
          },
        },
        timelineHeader: {
          backgroundColor: '#f0f2f5',
          colWidth: 60,
          scales: [
            {
              unit: 'month' as const,
              step: 1,
              format: (date: any) => `${date.dateIndex}月`,
              style: { fontSize: 13, fontWeight: 'bold' },
            },
            {
              unit: 'day' as const,
              step: 1,
              format: (date: any) => `${date.dateIndex}`,
              style: { fontSize: 11 },
            },
          ],
        },
        scrollStyle: common.scrollStyle,
      },

      milestone: {
        overscrollBehavior: 'none',
        headerRowHeight: 40,
        rowHeight: 38,
        taskListTable: {
          columns: [
            { field: 'title', title: '里程碑', width: 200, tree: true },
            { field: 'start', title: '目标日期', width: 120 },
            { field: 'priority', title: '重要性', width: 100 },
          ],
          tableWidth: 400,
          minTableWidth: 300,
          theme: {
            headerStyle: {
              ...common.theme.headerStyle,
              borderColor: '#ffa940',
              bgColor: '#fff7e6',
            },
            bodyStyle: { ...common.theme.bodyStyle, borderColor: '#ffa940' },
          },
        },
        frame: {
          outerFrameStyle: {
            borderLineWidth: 2,
            borderColor: '#ffa940',
            cornerRadius: 6,
          },
          verticalSplitLineMoveable: true,
        },
        grid: {
          verticalLine: { lineWidth: 1, lineColor: '#ffe7ba' },
          horizontalLine: { lineWidth: 1, lineColor: '#ffe7ba' },
        },
        taskBar: {
          startDateField: 'start',
          endDateField: 'start',
          labelText: '{title}',
          labelTextStyle: { fontSize: 12, fontWeight: 'bold' },
          barStyle: { width: 0, barColor: 'transparent' },
          milestoneStyle: {
            borderColor: '#fa8c16',
            borderLineWidth: 2,
            fillColor: '#ffd666',
            width: 16,
          },
        },
        timelineHeader: {
          backgroundColor: '#fff7e6',
          colWidth: 80,
          scales: [
            {
              unit: 'month' as const,
              step: 1,
              format: (date: any) => `${date.dateIndex}月`,
              style: { fontSize: 13, fontWeight: 'bold' },
            },
            {
              unit: 'week' as const,
              step: 1,
              format: (date: any) => `第${date.dateIndex}周`,
              style: { fontSize: 11 },
            },
          ],
        },
        scrollStyle: common.scrollStyle,
      },

      official: {
        overscrollBehavior: 'none',
        headerRowHeight: 40,
        rowHeight: 40,
        taskListTable: {
          columns: [
            {
              field: 'title',
              title: 'title',
              width: 180,
              sort: true,
              tree: true,
              editor: 'input',
            },
            {
              field: 'start',
              title: 'start',
              width: 120,
              sort: true,
              editor: 'date-input',
            },
            {
              field: 'end',
              title: 'end',
              width: 120,
              sort: true,
              editor: 'date-input',
            },
            {
              field: 'priority',
              title: 'priority',
              width: 80,
              sort: true,
              editor: 'input',
            },
            {
              field: 'progress',
              title: 'progress',
              width: 80,
              sort: true,
              editor: 'input',
            },
          ],
          tableWidth: 460,
          minTableWidth: 350,
          maxTableWidth: 800,
          theme: {
            headerStyle: {
              ...common.theme.headerStyle,
              fontSize: 18,
              color: 'red',
            },
            bodyStyle: {
              ...common.theme.bodyStyle,
              fontSize: 16,
              color: '#4D4D4D',
            },
          },
          hierarchyExpandLevel: 2,
        },
        frame: {
          outerFrameStyle: {
            borderLineWidth: 2,
            borderColor: '#e1e4e8',
            cornerRadius: 8,
          },
          verticalSplitLineMoveable: true,
          verticalSplitLine: { lineColor: '#e1e4e8', lineWidth: 3 },
          horizontalSplitLine: { lineColor: '#e1e4e8', lineWidth: 3 },
        },
        grid: common.grid,
        taskBar: {
          startDateField: 'start',
          endDateField: 'end',
          progressField: 'progress',
          moveable: true,
          resizable: true,
          hoverBarStyle: { barOverlayColor: 'rgba(99, 144, 0, 0.4)' },
          labelText: '{title} {progress}%',
          labelTextStyle: {
            fontSize: 16,
            textAlign: 'left',
            textOverflow: 'ellipsis',
          },
          barStyle: {
            width: 20,
            barColor: '#ee8800',
            completedBarColor: '#91e8e0',
            cornerRadius: 8,
            borderLineWidth: 1,
            borderColor: 'black',
          },
          milestoneStyle: {
            borderColor: 'red',
            borderLineWidth: 1,
            fillColor: 'green',
            width: 15,
          },
        },
        timelineHeader: {
          ...common.timelineHeader,
          scales: [
            {
              unit: 'week' as const,
              step: 1,
              startOfWeek: 'sunday' as const,
              format: (date: any) => `Week ${date.dateIndex}`,
              style: {
                fontSize: 20,
                fontWeight: 'bold',
                color: 'white',
                strokeColor: 'black',
                textAlign: 'right',
                textBaseline: 'bottom',
                textStick: true,
              },
            },
            {
              unit: 'day' as const,
              step: 1,
              format: (date: any) => date.dateIndex.toString(),
              style: {
                fontSize: 20,
                fontWeight: 'bold',
                color: 'white',
                strokeColor: 'black',
                textAlign: 'right',
                textBaseline: 'bottom',
              },
            },
          ],
        },
        markLine: [
          {
            date: '2024-07-28',
            style: { lineWidth: 1, lineColor: 'blue', lineDash: [8, 4] },
          },
          {
            date: '2024-08-17',
            style: { lineWidth: 2, lineColor: 'red', lineDash: [8, 4] },
          },
        ],
        rowSeriesNumber: {
          title: '行号',
          dragOrder: true,
          headerStyle: { bgColor: '#EEF1F5', borderColor: '#e1e4e8' },
          style: { borderColor: '#e1e4e8' },
        },
        scrollStyle: common.scrollStyle,
      },

      custom: {},
    }

    return configs[preset] || configs.basic
  }

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
    if (!ganttContainerRef.value) {
      console.warn('Gantt container not found')
      return
    }

    try {
      const { Gantt } = await import('@visactor/vtable-gantt')

      const presetOptions = getPresetOptions(props.preset)
      const mergedOptions = deepMerge(presetOptions, props.options || {})
      const processedData = processData(props.data || [])

      const finalOptions = {
        ...mergedOptions,
        records: processedData,
      }

      if (ganttInstance.value) {
        ganttInstance.value.release()
      }

      ganttInstance.value = new Gantt(ganttContainerRef.value, finalOptions)
      bindEvents()
      emit('ganttCreated', ganttInstance.value)
    } catch (error) {
      console.error('甘特图初始化失败:', error)
    }
  }

  // 绑定事件
  const bindEvents = () => {
    if (!ganttInstance.value) return

    try {
      ganttInstance.value.on('click_cell', (args: any) => {
        const { record, event } = args || {}
        if (record) {
          emit('taskClick', record, event)
        }
      })

      ganttInstance.value.on('change_data', (args: any) => {
        const { record, changes } = args || {}
        if (record && changes) {
          emit('taskChange', record, changes)
        }
      })
    } catch (error) {
      console.warn('事件绑定失败:', error)
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

      setTimeout(() => {
        if (ganttInstance.value && ganttInstance.value.resize) {
          try {
            ganttInstance.value.resize()
          } catch (error) {
            console.warn('调整大小失败:', error)
          }
        }
      }, 100)
    } catch (error) {
      console.warn('全屏切换失败:', error)
      isFullscreen.value = !isFullscreen.value
      nextTick(() => {
        if (ganttInstance.value && ganttInstance.value.resize) {
          ganttInstance.value.resize()
        }
      })
    }
  }

  // 监听全屏状态变化
  const handleFullscreenChange = () => {
    isFullscreen.value = !!document.fullscreenElement
    nextTick(() => {
      if (ganttInstance.value && ganttInstance.value.resize) {
        try {
          ganttInstance.value.resize()
        } catch (error) {
          console.warn('全屏状态变化时调整大小失败:', error)
        }
      }
    })
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

  // 监听数据变化
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
  .c-vtable-gantt-wrapper {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border-color, #e1e4e8);
    border-radius: 8px;
    overflow: hidden;
    background: var(--body-color, #ffffff);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  .gantt-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: var(--card-color, #fafafc);
    border-bottom: 1px solid var(--border-color, #e1e4e8);
    min-height: 48px;

    .toolbar-left {
      display: flex;
      align-items: center;

      .gantt-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--text-color-1, #303133);
      }
    }

    .toolbar-right {
      display: flex;
      gap: 8px;
      align-items: center;
    }
  }

  .gantt-container {
    flex: 1;
    position: relative;
    min-height: 400px;
    padding: 8px;
  }
</style>
