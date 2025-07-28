<template>
  <div class="gantt-demo-page">
    <div class="demo-header">
      <h1 class="demo-title">VTable Gantt 甘特图演示</h1>
      <p class="demo-description">
        基于 @visactor/vtable-gantt 封装的 Vue 3.5 甘特图组件，支持多种预设配置
      </p>
    </div>

    <div class="demo-content">
      <NTabs
        v-model:value="activeTab"
        type="line"
        animated
      >
        <!-- 基础甘特图 -->
        <NTabPane
          name="basic"
          tab="基础甘特图"
        >
          <div class="demo-section">
            <div class="section-header">
              <h2>基础甘特图 (preset="basic")</h2>
              <p>简洁的基础配置，适用于简单的任务管理和项目概览。</p>
            </div>

            <div class="demo-controls">
              <NButton
                @click="addBasicTask"
                type="primary"
                size="small"
              >
                <template #icon>
                  <C_Icon
                    name="i-carbon-add"
                    type="unocss"
                    :size="16"
                    color="currentColor"
                  />
                </template>
                添加任务
              </NButton>
              <NButton
                @click="updateBasicProgress"
                size="small"
              >
                <template #icon>
                  <C_Icon
                    name="i-carbon-chart-line"
                    type="unocss"
                    :size="16"
                    color="currentColor"
                  />
                </template>
                更新进度
              </NButton>
            </div>

            <C_VtableGantt
              ref="basicGanttRef"
              :data="basicData"
              preset="basic"
              title="基础项目管理"
              height="580px"
              @gantt-created="onGanttCreated"
              @task-click="onTaskClick"
              @error="onGanttError"
            />
          </div>
        </NTabPane>

        <!-- 项目管理甘特图 -->
        <NTabPane
          name="project"
          tab="项目管理"
        >
          <div class="demo-section">
            <div class="section-header">
              <h2>项目管理甘特图 (preset="project")</h2>
              <p
                >功能完整的项目管理配置，包含编辑器、优先级、行序号等专业功能。</p
              >
              <div class="usage-tips">
                <strong>使用说明：</strong>
                <ul>
                  <li
                    >双击表格单元格可以编辑任务信息（任务名称、开始时间、结束时间、优先级、进度）</li
                  >
                  <li>拖拽任务条可以移动任务时间，支持实时调整项目进度</li>
                  <li>拖拽任务条两端可以调整任务持续时间</li>
                  <li>支持树形结构展示，清晰展现任务层级关系，默认展开2层</li>
                  <li>点击全屏按钮进入浏览器全屏模式，按ESC键退出</li>
                </ul>
              </div>
            </div>

            <div class="demo-controls">
              <NButton
                @click="addProjectSubTask"
                type="primary"
                size="small"
              >
                <template #icon>
                  <C_Icon
                    name="i-carbon-add-alt"
                    type="unocss"
                    :size="16"
                    color="currentColor"
                  />
                </template>
                添加子任务
              </NButton>
              <NButton
                @click="updateProjectProgress"
                size="small"
              >
                <template #icon>
                  <C_Icon
                    name="i-carbon-chart-histogram"
                    type="unocss"
                    :size="16"
                    color="currentColor"
                  />
                </template>
                更新进度
              </NButton>
              <NButton
                @click="toggleProjectExpand"
                size="small"
              >
                <template #icon>
                  <C_Icon
                    name="i-carbon-tree-view"
                    type="unocss"
                    :size="16"
                    color="currentColor"
                  />
                </template>
                {{ expandStates.project ? '收起' : '展开' }}全部
              </NButton>
            </div>

            <C_VtableGantt
              ref="projectGanttRef"
              :data="projectData"
              preset="project"
              title="软件开发项目"
              :options="projectOptions"
              height="680px"
              @gantt-created="onGanttCreated"
              @task-click="onTaskClick"
              @error="onGanttError"
            />
          </div>
        </NTabPane>

        <!-- 时间线甘特图 -->
        <NTabPane
          name="timeline"
          tab="时间线"
        >
          <div class="demo-section">
            <div class="section-header">
              <h2>时间线甘特图 (preset="timeline")</h2>
              <p>适用于事件时间线、历史记录展示和重要事件跟踪。</p>
            </div>

            <C_VtableGantt
              :data="timelineData"
              preset="timeline"
              title="公司发展历程"
              height="610px"
              @gantt-created="onGanttCreated"
              @task-click="onTaskClick"
            />
          </div>
        </NTabPane>

        <!-- 里程碑甘特图 -->
        <NTabPane
          name="milestone"
          tab="里程碑"
        >
          <div class="demo-section">
            <div class="section-header">
              <h2>里程碑甘特图 (preset="milestone")</h2>
              <p>专门用于重要节点和里程碑的展示，突出关键时间点。</p>
            </div>

            <C_VtableGantt
              :data="milestoneData"
              preset="milestone"
              title="项目关键节点"
              height="560px"
              @gantt-created="onGanttCreated"
              @task-click="onTaskClick"
            />
          </div>
        </NTabPane>

        <!-- 官方示例 -->
        <NTabPane
          name="official"
          tab="官方示例"
        >
          <div class="demo-section">
            <div class="section-header">
              <h2>官方示例甘特图 (preset="official")</h2>
              <p>完全复刻官方演示的配置和数据，展示最真实的效果和完整功能。</p>
            </div>

            <C_VtableGantt
              :data="officialData"
              preset="official"
              title="Official Demo"
              height="750px"
              @gantt-created="onGanttCreated"
              @task-click="onTaskClick"
            />
          </div>
        </NTabPane>

        <!-- 自定义渲染 -->
        <NTabPane
          name="custom"
          tab="自定义渲染"
        >
          <div class="demo-section">
            <div class="section-header">
              <h2>自定义渲染甘特图</h2>
              <p
                >展示自定义渲染的强大功能，包含头像、进度、渐变色等高级视觉效果。</p
              >
            </div>

            <C_VtableGantt
              :data="customData"
              preset="custom"
              title="团队任务看板"
              :options="customOptions"
              height="710px"
              @gantt-created="onGanttCreated"
              @task-click="onTaskClick"
            />
          </div>
        </NTabPane>
      </NTabs>
    </div>

    <!-- 配置说明 -->
    <div class="config-docs">
      <NCard
        title="预设配置说明"
        size="small"
      >
        <div class="config-list">
          <div class="config-item">
            <strong>basic</strong> -
            基础配置，简洁易用，适合快速开始和轻量级项目管理
          </div>
          <div class="config-item">
            <strong>project</strong> -
            项目管理配置，功能丰富，支持编辑、排序、优先级等
            <div class="config-note"
              >• 双击单元格编辑 • 拖拽任务条移动/调整大小 • 树形结构展现层级关系
              • 默认展开2层</div
            >
          </div>
          <div class="config-item">
            <strong>timeline</strong> - 时间线配置，适合事件展示和历史记录
          </div>
          <div class="config-item">
            <strong>milestone</strong> - 里程碑配置，专门展示重要节点
          </div>
          <div class="config-item">
            <strong>official</strong> -
            官方示例配置，完全复刻官方demo，默认展开2层
          </div>
          <div class="config-item">
            <strong>custom</strong> - 自定义渲染，展示高级customLayout功能
          </div>
        </div>
      </NCard>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type {
    GanttTask,
    GanttOptions,
  } from '@/components/global/C_VtableGantt/index.vue'

  // 类型定义
  interface ExpandStates {
    basic: boolean
    project: boolean
  }

  const message = useMessage()
  const activeTab = ref('basic')

  // 甘特图实例引用
  const basicGanttRef = ref()
  const projectGanttRef = ref()

  // 统一状态管理
  const expandStates: ExpandStates = reactive({
    basic: true,
    project: true,
  })

  // 基础甘特图数据
  const basicData = ref<GanttTask[]>([
    {
      id: 1,
      title: '项目启动',
      start: '2024-01-01',
      end: '2024-01-05',
      progress: 100,
    },
    {
      id: 2,
      title: '需求分析',
      start: '2024-01-06',
      end: '2024-01-15',
      progress: 80,
    },
    {
      id: 3,
      title: '系统设计',
      start: '2024-01-16',
      end: '2024-01-25',
      progress: 60,
    },
    {
      id: 4,
      title: '开发实现',
      start: '2024-01-26',
      end: '2024-02-15',
      progress: 30,
    },
    {
      id: 5,
      title: '测试验收',
      start: '2024-02-16',
      end: '2024-02-25',
      progress: 0,
    },
  ])

  // 项目管理数据
  const projectData = ref<GanttTask[]>([
    {
      id: 1,
      title: '软件开发项目',
      developer: '张三',
      start: '2024-07-24',
      end: '2024-08-15',
      progress: 31,
      priority: 'P0',
      children: [
        {
          id: 2,
          title: '项目需求评审',
          developer: '李四',
          start: '2024-07-24',
          end: '2024-07-26',
          progress: 100,
          priority: 'P0',
        },
        {
          id: 3,
          title: '确定项目范围',
          developer: '王五',
          start: '2024-07-27',
          end: '2024-07-29',
          progress: 100,
          priority: 'P1',
        },
        {
          id: 4,
          title: '功能开发',
          developer: '赵六',
          start: '2024-08-01',
          end: '2024-08-15',
          progress: 0,
          priority: 'P1',
        },
      ],
    },
    {
      id: 5,
      title: '测试验收',
      developer: '钱七',
      start: '2024-08-10',
      end: '2024-08-20',
      progress: 60,
      priority: 'P0',
    },
  ])

  const projectOptions: GanttOptions = {
    markLine: [
      {
        date: '2024-08-01',
        style: {
          lineWidth: 2,
          lineColor: '#ff4d4f',
          lineDash: [5, 5],
        },
      },
    ],
  }

  // 时间线数据
  const timelineData = ref<GanttTask[]>([
    {
      id: 1,
      title: '公司成立',
      start: '2020-01-15',
      end: '2020-01-15',
      type: 'milestone',
    },
    {
      id: 2,
      title: '第一轮融资',
      start: '2020-06-01',
      end: '2020-08-31',
      progress: 100,
    },
    {
      id: 3,
      title: '产品上线',
      start: '2021-03-01',
      end: '2021-03-01',
      type: 'milestone',
    },
    {
      id: 4,
      title: '市场推广',
      start: '2021-04-01',
      end: '2021-12-31',
      progress: 85,
    },
    {
      id: 5,
      title: '第二轮融资',
      start: '2022-01-01',
      end: '2022-03-31',
      progress: 100,
    },
  ])

  // 里程碑数据
  const milestoneData = ref<GanttTask[]>([
    {
      id: 1,
      title: '项目启动会',
      start: '2024-01-01',
      priority: '高',
      type: 'milestone',
    },
    {
      id: 2,
      title: 'Alpha版本发布',
      start: '2024-02-15',
      priority: '高',
      type: 'milestone',
    },
    {
      id: 3,
      title: 'Beta版本发布',
      start: '2024-04-01',
      priority: '中',
      type: 'milestone',
    },
    {
      id: 4,
      title: '正式版发布',
      start: '2024-06-01',
      priority: '高',
      type: 'milestone',
    },
    {
      id: 5,
      title: '用户培训完成',
      start: '2024-07-15',
      priority: '中',
      type: 'milestone',
    },
  ])

  // 官方示例数据
  const officialData = ref<GanttTask[]>([
    {
      id: 1,
      title: 'Software Development',
      developer: 'liufangfang.jane@bytedance.com',
      start: '2024-07-24',
      end: '2024-08-15',
      progress: 31,
      priority: 'P0',
      children: [
        {
          id: 2,
          title: 'Project Feature Review',
          developer: 'liufangfang.jane@bytedance.com',
          start: '2024-07-24',
          end: '2024-07-24',
          progress: 60,
          priority: 'P0',
        },
        {
          id: 3,
          title: 'Determine project scope',
          developer: 'liufangfang.jane@bytedance.com',
          start: '2024-07-25',
          end: '2024-07-26',
          progress: 100,
          priority: 'P1',
        },
        {
          id: 4,
          title: 'Project Create',
          developer: 'liufangfang.jane@bytedance.com',
          start: '2024-07-27',
          end: '2024-07-27',
          progress: 100,
          priority: 'P1',
          type: 'milestone',
        },
        {
          id: 5,
          title: 'Develop feature 1',
          developer: 'liufangfang.jane@bytedance.com',
          start: '2024-08-01',
          end: '2024-08-15',
          progress: 0,
          priority: 'P1',
        },
      ],
    },
    {
      id: 6,
      title: 'Scope Planning',
      developer: 'liufangfang.jane@bytedance.com',
      start: '2024-07-24',
      end: '2024-08-04',
      progress: 60,
      priority: 'P0',
    },
    {
      id: 7,
      title: 'Architecture Design',
      developer: 'liufangfang.jane@bytedance.com',
      start: '2024-07-24',
      end: '2024-08-04',
      progress: 100,
      priority: 'P1',
      children: [
        {
          id: 8,
          title: 'Database Design',
          developer: 'liufangfang.jane@bytedance.com',
          start: '2024-08-01',
          end: '2024-08-01',
          progress: 90,
          priority: 'P0',
        },
        {
          id: 9,
          title: 'API Design',
          developer: 'liufangfang.jane@bytedance.com',
          start: '2024-07-30',
          end: '2024-08-04',
          progress: 31,
          priority: 'P0',
        },
        {
          id: 10,
          title: 'UI Framework',
          developer: 'liufangfang.jane@bytedance.com',
          start: '2024-07-26',
          end: '2024-07-28',
          progress: 60,
          priority: 'P0',
        },
      ],
    },
    {
      id: 11,
      title: 'Milestone Review',
      developer: 'liufangfang.jane@bytedance.com',
      start: '2024-07-29',
      type: 'milestone',
    },
    {
      id: 12,
      title: 'Testing Phase',
      developer: 'liufangfang.jane@bytedance.com',
      start: '2024-07-26',
      end: '2024-07-28',
      progress: 60,
      priority: 'P0',
      children: [
        {
          id: 13,
          title: 'Unit Testing',
          developer: 'liufangfang.jane@bytedance.com',
          start: '2024-07-29',
          end: '2024-07-31',
          progress: 100,
          priority: 'P1',
        },
        {
          id: 14,
          title: 'Integration Testing',
          developer: 'liufangfang.jane@bytedance.com',
          start: '2024-07-24',
          end: '2024-08-04',
          progress: 31,
          priority: 'P0',
        },
        {
          id: 15,
          title: 'Performance Testing',
          developer: 'liufangfang.jane@bytedance.com',
          start: '2024-07-26',
          end: '2024-07-28',
          progress: 60,
          priority: 'P0',
        },
      ],
    },
  ])

  // 自定义渲染数据
  const customData = ref<GanttTask[]>([
    {
      id: 1,
      title: 'Project Task 1',
      developer: 'bear.xiong',
      avatar:
        'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VTable/custom-render/bear.jpg',
      start: '2024-07-24',
      end: '2024-07-26',
      progress: 31,
      priority: 'P0',
    },
    {
      id: 2,
      title: 'Project Task 2',
      developer: 'wolf.lang',
      avatar:
        'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VTable/custom-render/wolf.jpg',
      start: '2024-07-25',
      end: '2024-07-28',
      progress: 60,
      priority: 'P0',
    },
    {
      id: 3,
      title: 'Project Task 3',
      developer: 'rabbit.tu',
      avatar:
        'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VTable/custom-render/rabbit.jpg',
      start: '2024-07-28',
      end: '2024-08-01',
      progress: 100,
      priority: 'P1',
    },
    {
      id: 4,
      title: 'Project Task 4',
      developer: 'cat.mao',
      avatar:
        'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VTable/custom-render/cat.jpg',
      start: '2024-07-31',
      end: '2024-08-03',
      progress: 31,
      priority: 'P0',
    },
    {
      id: 5,
      title: 'Project Task 5',
      developer: 'bird.niao',
      avatar:
        'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VTable/custom-render/bird.jpeg',
      start: '2024-08-02',
      end: '2024-08-04',
      progress: 60,
      priority: 'P0',
    },
    {
      id: 6,
      title: 'Project Task 6',
      developer: 'flower.hua',
      avatar:
        'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VTable/custom-render/flower.jpg',
      start: '2024-08-03',
      end: '2024-08-10',
      progress: 100,
      priority: 'P1',
    },
  ])

  // 自定义渲染配置
  const customOptions = computed((): GanttOptions => {
    const barColors0 = [
      '#aecde6',
      '#c6a49a',
      '#ffb582',
      '#eec1de',
      '#b3d9b3',
      '#cccccc',
      '#e59a9c',
      '#d9d1a5',
      '#c9bede',
    ]
    const barColors = [
      '#1f77b4',
      '#8c564b',
      '#ff7f0e',
      '#e377c2',
      '#2ca02c',
      '#7f7f7f',
      '#d62728',
      '#bcbd22',
      '#9467bd',
    ]

    return {
      overscrollBehavior: 'none',
      headerRowHeight: 60,
      rowHeight: 80,
      minDate: '2024-07-20',
      maxDate: '2024-08-15',
      taskListTable: {
        columns: [
          {
            field: 'title',
            title: 'TASK',
            width: 200,
            headerStyle: {
              textAlign: 'center',
              fontSize: 20,
              fontWeight: 'bold',
              color: 'black',
              bgColor: '#f0f0fb',
            },
            style: { bgColor: '#f0f0fb' },
            customLayout: (args: any) => {
              const { table, row, col, rect } = args
              const taskRecord = table.getCellOriginRecord(col, row)
              const { height, width } = rect ?? table.getCellRect(col, row)

              const VRender = (window as any).VTableGantt?.VRender
              if (!VRender) return { rootContainer: null }

              const container = new VRender.Group({
                y: 10,
                x: 20,
                height: height - 20,
                width: width - 40,
                fill: 'white',
                display: 'flex',
                flexDirection: 'column',
                cornerRadius: 30,
              })

              const developer = new VRender.Text({
                text: taskRecord.developer,
                fontSize: 16,
                fontFamily: 'sans-serif',
                fill: barColors[args.row % barColors.length],
                fontWeight: 'bold',
                maxLineWidth: width - 120,
                boundsPadding: [10, 0, 0, 0],
                alignSelf: 'center',
              })
              container.add(developer)

              const days = new VRender.Text({
                text: `${new Date(taskRecord.start).toLocaleDateString()}-${new Date(taskRecord.end).toLocaleDateString()}`,
                fontSize: 12,
                fontFamily: 'sans-serif',
                fontWeight: 'bold',
                fill: 'black',
                boundsPadding: [10, 0, 0, 0],
                alignSelf: 'center',
              })
              container.add(days)

              return {
                rootContainer: container,
                expectedWidth: 160,
              }
            },
          },
        ],
        tableWidth: 'auto',
        theme: {
          headerStyle: {
            borderColor: '#e1e4e8',
            borderLineWidth: 0,
            fontSize: 18,
            fontWeight: 'bold',
            color: 'red',
          },
          bodyStyle: {
            borderColor: '#e1e4e8',
            borderLineWidth: 0,
            fontSize: 16,
            color: '#4D4D4D',
            bgColor: '#FFF',
          },
        },
      },
      frame: {
        outerFrameStyle: {
          borderLineWidth: 0,
          borderColor: 'red',
          cornerRadius: 8,
        },
      },
      grid: {
        backgroundColor: '#f0f0fb',
        horizontalLine: {
          lineWidth: 2,
          lineColor: '#d5d9ee',
        },
      },
      taskBar: {
        startDateField: 'start',
        endDateField: 'end',
        progressField: 'progress',
        barStyle: { width: 60 },
        customLayout: (args: any) => {
          const { width, height, index, taskDays, progress, taskRecord } = args
          const VRender = (window as any).VTableGantt?.VRender
          if (!VRender) return { rootContainer: null }

          const colorLength = barColors.length
          const container = new VRender.Group({
            width,
            height,
            cornerRadius: 30,
            fill: {
              gradient: 'linear',
              x0: 0,
              y0: 0,
              x1: 1,
              y1: 0,
              stops: [
                { offset: 0, color: barColors0[index % colorLength] },
                { offset: 0.5, color: barColors[index % colorLength] },
                { offset: 1, color: barColors0[index % colorLength] },
              ],
            },
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'nowrap',
          })

          const containerLeft = new VRender.Group({
            height,
            width: 60,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-around',
          })
          container.add(containerLeft)

          const avatar = new VRender.Image({
            width: 50,
            height: 50,
            image: taskRecord.avatar,
            cornerRadius: 25,
          })
          containerLeft.add(avatar)

          const containerCenter = new VRender.Group({
            height,
            width: width - (width >= 120 ? 120 : 60),
            display: 'flex',
            flexDirection: 'column',
          })
          container.add(containerCenter)

          const developer = new VRender.Text({
            text: taskRecord.developer,
            fontSize: 16,
            fontFamily: 'sans-serif',
            fill: 'white',
            fontWeight: 'bold',
            maxLineWidth: width - (width >= 120 ? 120 : 60),
            boundsPadding: [10, 0, 0, 0],
          })
          containerCenter.add(developer)

          const days = new VRender.Text({
            text: `${taskDays || 1}天`,
            fontSize: 13,
            fontFamily: 'sans-serif',
            fill: 'white',
            boundsPadding: [10, 0, 0, 0],
          })
          containerCenter.add(days)

          if (width >= 120) {
            const containerRight = new VRender.Group({
              cornerRadius: 20,
              fill: 'white',
              height: 40,
              width: 40,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boundsPadding: [10, 0, 0, 0],
            })
            container.add(containerRight)

            const progressText = new VRender.Text({
              text: `${progress || 0}%`,
              fontSize: 12,
              fontFamily: 'sans-serif',
              fill: 'black',
              alignSelf: 'center',
              fontWeight: 'bold',
              maxLineWidth: (width - 60) / 2,
              boundsPadding: [0, 0, 0, 0],
            })
            containerRight.add(progressText)
          }

          return { rootContainer: container }
        },
        hoverBarStyle: { cornerRadius: 30 },
      },
      timelineHeader: {
        backgroundColor: '#f0f0fb',
        colWidth: 80,
        scales: [
          {
            unit: 'day' as const,
            step: 1,
            format: (date: any) => date.dateIndex.toString(),
            customLayout: (args: any) => {
              const { width, height, dateIndex } = args
              const VRender = (window as any).VTableGantt?.VRender
              if (!VRender) return { rootContainer: null }

              const container = new VRender.Group({
                width,
                height,
                fill: '#f0f0fb',
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'nowrap',
              })

              const containerLeft = new VRender.Group({
                height,
                width: 30,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-around',
              })
              container.add(containerLeft)

              const icon = new VRender.Text({
                text: '📅',
                fontSize: 16,
              })
              containerLeft.add(icon)

              const containerCenter = new VRender.Group({
                height,
                width: width - 30,
                display: 'flex',
                flexDirection: 'column',
              })
              container.add(containerCenter)

              const dayNumber = new VRender.Text({
                text: String(dateIndex).padStart(2, '0'),
                fontSize: 20,
                fontWeight: 'bold',
                fontFamily: 'sans-serif',
                fill: 'black',
                textAlign: 'right',
                maxLineWidth: width - 30,
                boundsPadding: [15, 0, 0, 0],
              })
              containerCenter.add(dayNumber)

              return { rootContainer: container }
            },
          },
        ],
      },
      markLine: [
        {
          date: '2024-07-29',
          style: { lineWidth: 1, lineColor: 'blue', lineDash: [8, 4] },
        },
        {
          date: '2024-08-17',
          style: { lineWidth: 2, lineColor: 'red', lineDash: [8, 4] },
        },
      ],
      scrollStyle: {
        scrollRailColor: 'RGBA(246,246,246,0.5)',
        visible: 'focus',
        width: 6,
        scrollSliderCornerRadius: 2,
        scrollSliderColor: '#5cb85c',
      },
    }
  })

  // 事件处理
  const onGanttCreated = (gantt: any) => {
    console.log('甘特图创建成功:', gantt)
    // 将VTableGantt暴露到window，供customLayout使用
    if (!(window as any).VTableGantt) {
      import('@visactor/vtable-gantt')
        .then(module => {
          ;(window as any).VTableGantt = module
        })
        .catch(error => {
          console.warn('Failed to load VTableGantt for custom layout:', error)
        })
    }
  }

  const onTaskClick = (task: GanttTask) => {
    message.info(`点击了任务: ${task.title}`)
  }

  const onGanttError = (error: any) => {
    console.error('甘特图错误:', error)
    message.error('甘特图加载失败，请刷新页面重试')
  }

  // 通用操作方法
  const ganttOperations = {
    // 添加任务
    addTask: (type: 'basic' | 'project', taskData?: Partial<GanttTask>) => {
      const defaultTask: GanttTask = {
        id: Date.now(),
        title: `新任务 ${Date.now()}`,
        start: '2024-02-26',
        end: '2024-03-05',
        progress: 0,
        ...taskData,
      }

      if (type === 'basic') {
        basicData.value.push(defaultTask)
        message.success(`添加了新任务: ${defaultTask.title}`)
      } else if (type === 'project') {
        const projectTask = {
          ...defaultTask,
          developer: '新成员',
          priority: 'P2',
          start: '2024-08-16',
          end: '2024-08-20',
        }

        // 添加到第一个主任务下
        if (projectData.value[0]) {
          if (!projectData.value[0].children) {
            projectData.value[0].children = []
          }
          projectData.value[0].children.push(projectTask)
          message.success(`添加了新子任务: ${projectTask.title}`)
        }
      }
    },

    // 更新进度
    updateProgress: (type: 'basic' | 'project', increment = 15) => {
      const updateTaskProgress = (tasks: GanttTask[]) => {
        tasks.forEach(task => {
          if (task.progress !== undefined && task.progress < 100) {
            task.progress = Math.min(100, task.progress + increment)
          }
          if (task.children) {
            updateTaskProgress(task.children)
          }
        })
      }

      if (type === 'basic') {
        updateTaskProgress(basicData.value)
        message.success('批量更新了基础任务进度')
      } else if (type === 'project') {
        updateTaskProgress(projectData.value)
        message.success('批量更新了项目进度')
      }
    },

    // 切换展开状态
    toggleExpand: (type: 'basic' | 'project') => {
      const ganttRef =
        type === 'basic' ? basicGanttRef.value : projectGanttRef.value
      if (!ganttRef?.ganttInstance) {
        message.warning('甘特图实例未找到')
        return
      }

      try {
        const gantt = ganttRef.ganttInstance
        const isExpanded = expandStates[type]

        if (isExpanded) {
          if (gantt.collapseAll) {
            gantt.collapseAll()
            expandStates[type] = false
            message.success(`已收起${type === 'basic' ? '基础' : '项目'}任务`)
          }
        } else {
          if (gantt.expandAll) {
            gantt.expandAll()
            expandStates[type] = true
            message.success(`已展开${type === 'basic' ? '基础' : '项目'}任务`)
          }
        }
      } catch (error) {
        console.warn(`${type}展开/收起操作失败:`, error)
        message.warning('操作失败，请稍后重试')
      }
    },
  }

  // 基础甘特图操作
  const addBasicTask = () => ganttOperations.addTask('basic')
  const updateBasicProgress = () => ganttOperations.updateProgress('basic')

  // 项目管理操作
  const addProjectSubTask = () => ganttOperations.addTask('project')
  const updateProjectProgress = () =>
    ganttOperations.updateProgress('project', 10)
  const toggleProjectExpand = () => ganttOperations.toggleExpand('project')
</script>

<style lang="scss" scoped>
  .gantt-demo-page {
    padding: 24px;
    max-width: 1600px;
    margin: 0 auto;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    min-height: 100vh;
  }

  .demo-header {
    margin-bottom: 32px;
    text-align: center;
    padding: 32px 0;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 12px;
    backdrop-filter: blur(10px);

    .demo-title {
      font-size: 36px;
      font-weight: 700;
      margin-bottom: 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .demo-description {
      font-size: 18px;
      color: var(--text-color-2, #606266);
      margin: 0;
      font-weight: 400;
    }
  }

  .demo-content {
    margin-bottom: 32px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 12px;
    padding: 24px;
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }

  .demo-section {
    .section-header {
      margin-bottom: 24px;

      h2 {
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 12px;
        color: var(--text-color-1, #303133);
      }

      p {
        color: var(--text-color-2, #606266);
        margin: 0 0 16px 0;
        font-size: 16px;
        line-height: 1.6;
      }

      .usage-tips {
        background: linear-gradient(135deg, #e3f2fd 0%, #f0f9ff 100%);
        border: 1px solid var(--info-color, #409eff);
        border-radius: 8px;
        padding: 16px;
        margin-top: 16px;

        strong {
          color: var(--info-color, #409eff);
          display: block;
          margin-bottom: 12px;
          font-size: 16px;
        }

        ul {
          margin: 0;
          padding-left: 24px;

          li {
            color: var(--text-color-2, #606266);
            margin-bottom: 8px;
            line-height: 1.6;
            font-size: 14px;

            &:last-child {
              margin-bottom: 0;
            }
          }
        }
      }
    }

    .demo-controls {
      margin-bottom: 20px;
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
    }
  }

  .config-docs {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 12px;
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    overflow: hidden;

    .config-list {
      .config-item {
        padding: 12px 0;
        border-bottom: 1px solid var(--border-color, #e1e4e8);

        &:last-child {
          border-bottom: none;
        }

        strong {
          color: var(--primary-color, #1890ff);
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          background: var(--primary-color-light, #e6f7ff);
          padding: 4px 8px;
          border-radius: 4px;
          margin-right: 12px;
          font-size: 13px;
        }

        .config-note {
          color: var(--text-color-3, #909399);
          font-size: 13px;
          margin-top: 6px;
          margin-left: 12px;
          font-style: italic;
          line-height: 1.5;
        }
      }
    }
  }

  @media (max-width: 768px) {
    .gantt-demo-page {
      padding: 16px;
    }

    .demo-header {
      padding: 24px 16px;

      .demo-title {
        font-size: 28px;
      }

      .demo-description {
        font-size: 16px;
      }
    }

    .demo-content {
      padding: 16px;
    }
  }
</style>
