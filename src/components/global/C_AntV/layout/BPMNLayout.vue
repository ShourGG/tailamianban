<template>
  <div class="bpmn-layout">
    <div
      class="top-toolbar"
      v-if="showToolbar"
    >
      <div class="toolbar-section">
        <div class="toolbar-group">
          <NButton
            @click="clearAll"
            size="small"
          >
            <template #icon><div class="i-mdi-delete-outline"></div></template>
            清空
          </NButton>
        </div>
        <div class="toolbar-group">
          <NButton
            @click="centerContent"
            size="small"
          >
            <template #icon
              ><div class="i-mdi-image-filter-center-focus"></div
            ></template>
            居中
          </NButton>
          <NButton
            @click="zoomToFit"
            size="small"
          >
            <template #icon><div class="i-mdi-fit-to-screen"></div></template>
            适应
          </NButton>
        </div>
        <div class="toolbar-group">
          <NDropdown
            :options="exportOptions"
            @select="handleExport"
          >
            <NButton size="small">
              <template #icon><div class="i-mdi-export"></div></template>
              导出
            </NButton>
          </NDropdown>
        </div>
      </div>
    </div>

    <div class="main-content">
      <div
        class="left-panel"
        v-if="showToolbar"
      >
        <div class="panel-title">组件</div>
        <div class="element-grid">
          <div
            v-for="(item, key) in elementTypes"
            :key="key"
            class="element-item"
            @click="addElement(key)"
            :title="item.title"
          >
            <div :class="['element-icon', item.iconClass]"></div>
            <span>{{ item.name }}</span>
          </div>
        </div>
      </div>

      <div class="graph-wrapper">
        <div
          ref="containerRef"
          class="graph-container"
        ></div>
      </div>
    </div>

    <NDrawer
      v-model:show="showEditor"
      width="300"
      title="属性设置"
    >
      <div
        v-if="editingElement"
        class="property-panel"
      >
        <div class="property-item">
          <div class="property-label">名称</div>
          <NInput
            v-model:value="editingElement.label"
            placeholder="请输入名称"
            size="small"
          />
        </div>
        <div class="property-item">
          <div class="property-label">类型</div>
          <NInput
            :value="getElementTypeName(editingElement.shape)"
            readonly
            size="small"
          />
        </div>
        <div
          class="property-item"
          v-if="editingElement.shape === 'activity'"
        >
          <div class="property-label">描述</div>
          <NInput
            v-model:value="editingElement.description"
            type="textarea"
            :rows="3"
            placeholder="请输入活动描述"
            size="small"
          />
        </div>
        <div
          class="property-item"
          v-if="editingElement.shape === 'activity'"
        >
          <div class="property-label">执行人</div>
          <NInput
            v-model:value="editingElement.assignee"
            placeholder="请输入执行人"
            size="small"
          />
        </div>
        <div class="form-actions">
          <NSpace>
            <NButton
              @click="saveElement"
              type="primary"
              size="small"
              >保存</NButton
            >
            <NButton
              @click="showEditor = false"
              size="small"
              >取消</NButton
            >
            <NButton
              @click="deleteElement"
              type="error"
              size="small"
              >删除</NButton
            >
          </NSpace>
        </div>
      </div>
    </NDrawer>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, onMounted, nextTick } from 'vue'
  import { Graph, type Node } from '@antv/x6'

  interface BPMNElement {
    id: string
    shape: string
    x: number
    y: number
    width?: number
    height?: number
    label?: string
    source?: string
    target?: string
    description?: string
    assignee?: string
    data?: any
    [key: string]: any
  }

  interface Props {
    data?: BPMNElement[] | Record<string, BPMNElement[]>
    showToolbar?: boolean
    readonly?: boolean
    width?: number | string
    height?: number | string
  }

  const props = withDefaults(defineProps<Props>(), {
    showToolbar: true,
    readonly: false,
    width: '100%',
    height: '600px',
  })

  const emit = defineEmits<{
    ready: [graph: Graph]
    'data-change': [data: BPMNElement[]]
  }>()

  const containerRef = ref<HTMLDivElement>()
  const showEditor = ref(false)
  const editingElement = ref<BPMNElement>()
  const graph = ref<Graph>()

  const exportOptions = [
    { label: '导出PNG', key: 'png' },
    { label: '导出SVG', key: 'svg' },
    { label: '导出JSON', key: 'json' },
  ]

  const elementTypes = {
    'start-event': {
      name: '开始',
      title: '开始事件',
      iconClass: 'circle start-event',
    },
    activity: { name: '任务', title: '任务活动', iconClass: 'rect activity' },
    gateway: { name: '网关', title: '排他网关', iconClass: 'diamond gateway' },
    'end-event': {
      name: '结束',
      title: '结束事件',
      iconClass: 'circle end-event',
    },
  }

  const getElementTypeName = (shape: string) =>
    ({
      event: '事件',
      activity: '活动',
      gateway: '网关',
      'bpmn-edge': '连接线',
    })[shape] || shape

  const centerContent = () => graph.value?.centerContent()
  const zoomToFit = () => graph.value?.zoomToFit({ padding: 50, maxScale: 1 })

  const normalizeData = (data: any): any[] => {
    if (!data) return []
    if (Array.isArray(data)) return data
    const result: any[] = []
    Object.values(data).forEach((arr: any) => {
      if (Array.isArray(arr)) result.push(...arr)
    })
    return result
  }

  // 简化标签获取函数
  const getLabel = (cell: any): string => {
    const label = cell.attr('text/text') || cell.attr('label/text') || ''
    return String(label)
  }

  const createPortAttrs = (positions: string[]) =>
    positions.reduce((acc, pos) => {
      const isCircle = ['event'].includes('circle')
      const refConfig =
        pos === 'top'
          ? isCircle
            ? { refCx: 0.5, refCy: 0 }
            : { refX: 0.5, refY: 0 }
          : pos === 'right'
            ? isCircle
              ? { refCx: 1, refCy: 0.5 }
              : { refX: 1, refY: 0.5 }
            : pos === 'bottom'
              ? isCircle
                ? { refCx: 0.5, refCy: 1 }
                : { refX: 0.5, refY: 1 }
              : isCircle
                ? { refCx: 0, refCy: 0.5 }
                : { refX: 0, refY: 0.5 }

      acc[`port-${pos}`] = {
        ref: 'body',
        ...refConfig,
        r: 4,
        fill: '#31d0c6',
        stroke: '#ffffff',
        strokeWidth: 2,
        magnet: true,
        style: { cursor: 'crosshair', opacity: 0, transition: 'opacity 0.2s' },
      }
      return acc
    }, {} as any)

  const registerNodes = () => {
    const portPositions = ['top', 'right', 'bottom', 'left']
    const portMarkup = portPositions.map(pos => ({
      tagName: 'circle',
      selector: `port-${pos}`,
    }))

    // 事件节点
    Graph.registerNode(
      'event',
      {
        inherit: 'circle',
        markup: [
          { tagName: 'circle', selector: 'body' },
          { tagName: 'text', selector: 'text' },
          ...portMarkup,
        ],
        attrs: {
          body: {
            strokeWidth: 2,
            stroke: '#5F95FF',
            fill: '#FFF',
            magnet: false,
            style: { cursor: 'move' },
          },
          text: {
            fontSize: 12,
            fill: '#262626',
            textAnchor: 'middle',
            textVerticalAnchor: 'middle',
            pointerEvents: 'none',
          },
          ...createPortAttrs(portPositions),
        },
      },
      true
    )

    // 活动节点
    Graph.registerNode(
      'activity',
      {
        inherit: 'rect',
        markup: [
          { tagName: 'rect', selector: 'body' },
          { tagName: 'text', selector: 'text' },
          ...portMarkup,
        ],
        attrs: {
          body: {
            rx: 6,
            ry: 6,
            stroke: '#5F95FF',
            fill: '#EFF4FF',
            strokeWidth: 1,
            magnet: false,
            style: { cursor: 'move' },
          },
          text: {
            fontSize: 12,
            fill: '#262626',
            textAnchor: 'middle',
            textVerticalAnchor: 'middle',
            pointerEvents: 'none',
          },
          ...createPortAttrs(portPositions),
        },
      },
      true
    )

    // 网关节点
    Graph.registerNode(
      'gateway',
      {
        inherit: 'polygon',
        markup: [
          { tagName: 'polygon', selector: 'body' },
          { tagName: 'text', selector: 'text' },
          ...portMarkup,
        ],
        attrs: {
          body: {
            refPoints: '0,10 10,0 20,10 10,20',
            strokeWidth: 2,
            stroke: '#5F95FF',
            fill: '#EFF4FF',
            magnet: false,
            style: { cursor: 'move' },
          },
          text: {
            fontSize: 20,
            fill: '#5F95FF',
            textAnchor: 'middle',
            textVerticalAnchor: 'middle',
            pointerEvents: 'none',
          },
          ...createPortAttrs(portPositions),
        },
      },
      true
    )

    // BPMN连线
    Graph.registerEdge(
      'bpmn-edge',
      {
        inherit: 'edge',
        attrs: {
          line: {
            stroke: '#A2B1C3',
            strokeWidth: 2,
            targetMarker: {
              name: 'block',
              width: 8,
              height: 6,
              fill: '#A2B1C3',
            },
            cursor: 'pointer',
          },
        },
      },
      true
    )
  }

  const initGraph = async () => {
    if (!containerRef.value) return
    await nextTick()

    const containerWidth = containerRef.value.clientWidth || 800
    const containerHeight = containerRef.value.clientHeight || 500

    // 使用类型断言解决类型问题
    graph.value = new Graph({
      container: containerRef.value,
      width: containerWidth,
      height: containerHeight,
      background: { color: '#ffffff' },
      grid: {
        visible: true,
        type: 'doubleMesh',
        args: [
          { color: '#eee', thickness: 1 },
          { color: '#ddd', thickness: 1, factor: 4 },
        ],
      },
      mousewheel: {
        enabled: true,
        zoomAtMousePosition: true,
        modifiers: 'ctrl',
        minScale: 0.5,
        maxScale: 3,
      },
      connecting: {
        router: 'manhattan',
        connector: { name: 'rounded', args: { radius: 8 } },
        allowBlank: false,
        allowLoop: false,
        allowNode: false,
        snap: true,
        allowEdge: false,
        createEdge: () => graph.value!.createEdge({ shape: 'bpmn-edge' }),
        validateConnection: ({
          sourceView,
          targetView,
          sourceMagnet,
          targetMagnet,
        }: any) =>
          sourceView !== targetView &&
          !!sourceMagnet &&
          !!targetMagnet &&
          sourceMagnet.getAttribute('magnet') === 'true' &&
          targetMagnet.getAttribute('magnet') === 'true',
      },
      highlighting: {
        magnetAvailable: {
          name: 'stroke',
          args: { attrs: { fill: '#31d0c6', stroke: '#31d0c6', opacity: 1 } },
        },
        magnetAdsorbed: {
          name: 'stroke',
          args: { attrs: { fill: '#5F95FF', stroke: '#5F95FF', opacity: 1 } },
        },
      },
    } as any) // 类型断言解决selecting等属性问题

    // 添加selecting等配置
    Object.assign(graph.value.options, {
      selecting: {
        enabled: true,
        rubberband: true,
        showNodeSelectionBox: true,
      },
      resizing: true,
      rotating: false,
      snapline: true,
      keyboard: true,
      clipboard: true,
    })

    if (!props.readonly) {
      // 节点双击编辑
      graph.value.on('node:dblclick', ({ node }) => editElement(node))

      // 连接线点击选中，变红
      graph.value.on('edge:click', ({ edge }) => {
        edge.attr('line/stroke', '#ff4d4f')
      })

      // 连接线双击删除
      graph.value.on('edge:dblclick', ({ edge }) => {
        edge.remove()
        emitDataChange()
      })

      // 点击空白区域时，恢复连接线颜色
      graph.value.on('blank:click', () => {
        graph.value!.getEdges().forEach(edge => {
          edge.attr('line/stroke', '#A2B1C3')
        })
      })

      // 选中其他元素时，恢复连接线颜色
      graph.value.on('node:click', () => {
        graph.value!.getEdges().forEach(edge => {
          edge.attr('line/stroke', '#A2B1C3')
        })
      })

      graph.value.on('edge:connected', emitDataChange)
      graph.value.on('node:moved', emitDataChange)

      // 连接点显示/隐藏
      const togglePorts = (node: Node, opacity: number) => {
        ;['top', 'right', 'bottom', 'left'].forEach(pos =>
          node.attr(`port-${pos}/style/opacity`, opacity)
        )
      }

      graph.value.on('node:mouseenter', ({ node }) => togglePorts(node, 1))
      graph.value.on('node:mouseleave', ({ node }) => togglePorts(node, 0))
    }

    emit('ready', graph.value)
    loadSampleData()
  }

  const loadData = (data: any[]) => {
    if (!graph.value || !data.length) return

    const cells: any[] = []
    data.forEach((item: any) => {
      const { data: nodeData, ...cellProps } = item
      const cell =
        item.shape === 'bpmn-edge'
          ? graph.value!.createEdge(cellProps)
          : graph.value!.createNode(cellProps)
      if (nodeData) cell.setData(nodeData)
      cells.push(cell)
    })

    graph.value.resetCells(cells)
    setTimeout(() => graph.value!.zoomToFit({ padding: 50, maxScale: 1 }), 200)
  }

  const loadSampleData = () => {
    const sampleData: any[] = [
      {
        id: 'start-1',
        shape: 'event',
        x: 100,
        y: 200,
        width: 50,
        height: 50,
        label: '流程开始',
        data: { type: 'start' },
      },
      {
        id: 'activity-1',
        shape: 'activity',
        x: 200,
        y: 180,
        width: 120,
        height: 60,
        label: '用户申请',
        data: { description: '用户提交申请表单', assignee: '申请人' },
      },
      {
        id: 'activity-2',
        shape: 'activity',
        x: 380,
        y: 180,
        width: 120,
        height: 60,
        label: '初审',
        data: { description: '部门进行初步审核', assignee: '部门主管' },
      },
      {
        id: 'gateway-1',
        shape: 'gateway',
        x: 550,
        y: 200,
        width: 40,
        height: 40,
        label: '+',
        data: { type: 'exclusive' },
      },
      {
        id: 'activity-3',
        shape: 'activity',
        x: 650,
        y: 120,
        width: 120,
        height: 60,
        label: '终审',
        data: { description: '高级主管最终审核', assignee: '总监' },
      },
      {
        id: 'activity-4',
        shape: 'activity',
        x: 650,
        y: 260,
        width: 120,
        height: 60,
        label: '驳回处理',
        data: { description: '处理驳回流程', assignee: '专员' },
      },
      {
        id: 'end-1',
        shape: 'event',
        x: 820,
        y: 140,
        width: 50,
        height: 50,
        label: '审批通过',
        data: { type: 'end' },
      },
      {
        id: 'end-2',
        shape: 'event',
        x: 820,
        y: 280,
        width: 50,
        height: 50,
        label: '审批驳回',
        data: { type: 'end' },
      },
      {
        id: 'edge-1',
        shape: 'bpmn-edge',
        source: 'start-1',
        target: 'activity-1',
        x: 0,
        y: 0,
      },
      {
        id: 'edge-2',
        shape: 'bpmn-edge',
        source: 'activity-1',
        target: 'activity-2',
        x: 0,
        y: 0,
      },
      {
        id: 'edge-3',
        shape: 'bpmn-edge',
        source: 'activity-2',
        target: 'gateway-1',
        x: 0,
        y: 0,
      },
      {
        id: 'edge-4',
        shape: 'bpmn-edge',
        source: 'gateway-1',
        target: 'activity-3',
        label: '通过',
        x: 0,
        y: 0,
      },
      {
        id: 'edge-5',
        shape: 'bpmn-edge',
        source: 'gateway-1',
        target: 'activity-4',
        label: '驳回',
        x: 0,
        y: 0,
      },
      {
        id: 'edge-6',
        shape: 'bpmn-edge',
        source: 'activity-3',
        target: 'end-1',
        x: 0,
        y: 0,
      },
      {
        id: 'edge-7',
        shape: 'bpmn-edge',
        source: 'activity-4',
        target: 'end-2',
        x: 0,
        y: 0,
      },
    ]
    loadData(sampleData)
  }

  const addElement = (type: string) => {
    if (!graph.value) return

    const centerX = (graph.value.options.width as number) / 2
    const centerY = (graph.value.options.height as number) / 2

    const configs = {
      'start-event': {
        shape: 'event',
        width: 50,
        height: 50,
        label: '开始事件',
        data: { type: 'start' },
      },
      'end-event': {
        shape: 'event',
        width: 50,
        height: 50,
        label: '结束事件',
        data: { type: 'end' },
      },
      activity: {
        shape: 'activity',
        width: 120,
        height: 60,
        label: '新活动',
        data: { description: '', assignee: '' },
      },
      gateway: {
        shape: 'gateway',
        width: 40,
        height: 40,
        label: '+',
        data: { type: 'exclusive' },
      },
    }

    const config = configs[type as keyof typeof configs]
    if (config) {
      const { data: nodeData, ...nodeProps } = {
        id: `${type}-${Date.now()}`,
        x: centerX + Math.random() * 100 - 50,
        y: centerY + Math.random() * 100 - 50,
        ...config,
      }
      const node = graph.value.createNode(nodeProps)
      if (nodeData) node.setData(nodeData)
      graph.value.addCell(node)
      emitDataChange()
    }
  }

  const clearAll = () => {
    if (graph.value) {
      graph.value.clearCells()
      emitDataChange()
    }
  }

  const editElement = (cell: any) => {
    const cellData = cell.getData() || {}
    editingElement.value = {
      id: cell.id,
      shape: cell.shape,
      label: getLabel(cell),
      description: cellData.description || '',
      assignee: cellData.assignee || '',
      x: 0,
      y: 0,
    } as any
    showEditor.value = true
  }

  const saveElement = () => {
    if (!graph.value || !editingElement.value) return

    const cell = graph.value.getCellById(editingElement.value.id)
    if (cell) {
      cell.setData({
        description: editingElement.value.description,
        assignee: editingElement.value.assignee,
      })
      cell.attr('text/text', editingElement.value.label || '')
      cell.attr('label/text', editingElement.value.label || '')
    }

    showEditor.value = false
    emitDataChange()
  }

  const deleteElement = () => {
    if (!graph.value || !editingElement.value) return
    graph.value.getCellById(editingElement.value.id)?.remove()
    showEditor.value = false
    emitDataChange()
  }

  const getCurrentData = (): BPMNElement[] => {
    if (!graph.value) return []

    const result: any[] = [
      ...graph.value.getNodes().map(node => ({
        id: node.id,
        shape: node.shape,
        x: node.getPosition().x,
        y: node.getPosition().y,
        width: node.getSize().width,
        height: node.getSize().height,
        label: getLabel(node),
        data: node.getData() || {},
      })),
      ...graph.value.getEdges().map(edge => ({
        id: edge.id,
        shape: 'bpmn-edge',
        source: edge.getSourceCellId() || '',
        target: edge.getTargetCellId() || '',
        label: getLabel(edge),
        x: 0,
        y: 0,
      })),
    ]

    return result as BPMNElement[]
  }

  const handleExport = (key: string) => {
    if (!graph.value) return

    const data = getCurrentData()
    const exportMap = {
      png: () =>
        (graph.value as any).toPNG?.((dataUri: string) => {
          const link = document.createElement('a')
          link.download = 'bpmn-diagram.png'
          link.href = dataUri
          link.click()
        }),
      svg: () =>
        (graph.value as any).toSVG?.((dataUri: string) => {
          const link = document.createElement('a')
          link.download = 'bpmn-diagram.svg'
          link.href = dataUri
          link.click()
        }),
      json: () => {
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: 'application/json',
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'bpmn-diagram.json'
        a.click()
        URL.revokeObjectURL(url)
      },
    }
    exportMap[key as keyof typeof exportMap]?.()
  }

  const emitDataChange = () => emit('data-change', getCurrentData() as any)

  watch(
    () => props.data,
    newData => {
      if (newData && graph.value) {
        const normalizedData = normalizeData(newData)
        if (normalizedData.length > 0) {
          loadData(normalizedData)
        }
      }
    },
    { deep: true }
  )

  onMounted(async () => {
    registerNodes()
    await initGraph()
  })

  defineExpose({
    getGraph: () => graph.value,
    getData: getCurrentData,
    loadData,
  })
</script>

<style scoped>
  .bpmn-layout {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background: #f8f9fa;
    border-radius: 6px;
    overflow: hidden;
  }

  .top-toolbar {
    background: #ffffff;
    border-bottom: 1px solid #e8e8e8;
    padding: 10px 16px;
    flex-shrink: 0;
  }

  .toolbar-section {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .toolbar-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .main-content {
    display: flex;
    flex: 1;
    height: 0;
  }

  .left-panel {
    width: 180px;
    background: #ffffff;
    border-right: 1px solid #e8e8e8;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
  }

  .panel-title {
    padding: 16px;
    font-weight: 600;
    font-size: 14px;
    color: #333;
    border-bottom: 1px solid #f0f0f0;
  }

  .element-grid {
    padding: 16px 12px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .element-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px 8px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    color: #555;
    transition: all 0.2s;
    border: 1px solid transparent;
  }

  .element-item:hover {
    background: #e6f7ff;
    border-color: #91d5ff;
    color: #1890ff;
  }

  .element-icon {
    flex-shrink: 0;
    border: 2px solid #ddd;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .element-icon.circle {
    width: 24px;
    height: 24px;
    border-radius: 50%;
  }

  .element-icon.rect {
    width: 32px;
    height: 20px;
    border-radius: 4px;
  }

  .element-icon.diamond {
    width: 24px;
    height: 24px;
    transform: rotate(45deg);
    border-radius: 3px;
  }

  .element-icon.start-event {
    border-color: #52c41a;
    background: #f6ffed;
  }

  .element-icon.end-event {
    border-color: #ff4d4f;
    background: #fff2f0;
  }

  .element-icon.activity {
    border-color: #1890ff;
    background: #e6f7ff;
  }

  .element-icon.gateway {
    border-color: #722ed1;
    background: #f9f0ff;
  }

  .graph-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .graph-container {
    flex: 1;
    width: 100%;
    background: #ffffff;
    border: 1px solid #e8e8e8;
    margin: 16px;
    border-radius: 6px;
    overflow: hidden;
  }

  .property-panel {
    padding: 20px;
  }

  .property-item {
    margin-bottom: 20px;
  }

  .property-label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 500;
    color: #262626;
  }

  .form-actions {
    margin-top: 32px;
    padding-top: 20px;
    border-top: 1px solid #f0f0f0;
  }

  .graph-container :deep(.x6-graph),
  .graph-container :deep(.x6-graph-svg) {
    width: 100% !important;
    height: 100% !important;
    display: block;
  }
</style>
