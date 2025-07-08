<template>
  <div class="uml-layout">
    <div
      class="toolbar"
      v-if="showToolbar"
    >
      <NSpace>
        <NButton
          @click="addClass"
          type="primary"
          size="small"
        >
          <template #icon><div class="i-mdi-plus-box"></div></template>
          添加类
        </NButton>
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
        <NDropdown
          :options="exportOptions"
          @select="handleExport"
        >
          <NButton size="small">
            <template #icon><div class="i-mdi-export"></div></template>
            导出
          </NButton>
        </NDropdown>
      </NSpace>
    </div>

    <div
      ref="containerRef"
      class="graph-container"
      :style="{ width: props.width, height: props.height }"
    ></div>

    <NDrawer
      v-model:show="showEditor"
      width="450"
      title="编辑类"
    >
      <div
        v-if="editingClass"
        class="class-editor"
      >
        <NForm label-placement="top">
          <NFormItem label="类名">
            <NInput
              v-model:value="editingClass.name"
              placeholder="请输入类名"
            />
          </NFormItem>

          <NDivider style="margin: 20px 0">属性</NDivider>
          <div class="section">
            <div
              v-for="(attr, index) in editingClass.attributes"
              :key="index"
              class="item"
            >
              <NCard
                size="small"
                style="margin-bottom: 12px"
              >
                <template #header>
                  <div
                    style="
                      display: flex;
                      justify-content: between;
                      align-items: center;
                    "
                  >
                    <span style="font-size: 13px"
                      >#{{ index + 1 }} {{ attr.name || '新属性' }}</span
                    >
                    <NButton
                      @click="editingClass.attributes.splice(index, 1)"
                      size="tiny"
                      type="error"
                      quaternary
                      style="margin-left: auto"
                      >删除</NButton
                    >
                  </div>
                </template>
                <NSpace
                  vertical
                  size="small"
                >
                  <NSpace>
                    <NFormItem
                      label="属性名"
                      style="margin: 0; flex: 1"
                    >
                      <NInput
                        v-model:value="attr.name"
                        placeholder="属性名"
                        size="small"
                      />
                    </NFormItem>
                    <NFormItem
                      label="类型"
                      style="margin: 0; flex: 1"
                    >
                      <NInput
                        v-model:value="attr.type"
                        placeholder="类型"
                        size="small"
                      />
                    </NFormItem>
                  </NSpace>
                  <NFormItem
                    label="可见性"
                    style="margin: 0"
                  >
                    <NRadioGroup
                      v-model:value="attr.visibility"
                      size="small"
                    >
                      <NRadio value="public">+ public</NRadio>
                      <NRadio value="private">- private</NRadio>
                      <NRadio value="protected"># protected</NRadio>
                    </NRadioGroup>
                  </NFormItem>
                </NSpace>
              </NCard>
            </div>
            <NButton
              @click="
                editingClass.attributes.push({
                  name: 'newAttribute',
                  type: 'string',
                  visibility: 'private',
                })
              "
              dashed
              block
              type="primary"
              ghost
              size="small"
            >
              <template #icon><div class="i-mdi-plus"></div></template>
              添加属性
            </NButton>
          </div>

          <NDivider style="margin: 20px 0">方法</NDivider>
          <div class="section">
            <div
              v-for="(method, index) in editingClass.methods"
              :key="index"
              class="item"
            >
              <NCard
                size="small"
                style="margin-bottom: 12px"
              >
                <template #header>
                  <div
                    style="
                      display: flex;
                      justify-content: between;
                      align-items: center;
                    "
                  >
                    <span style="font-size: 13px"
                      >#{{ index + 1 }} {{ method.name || '新方法' }}</span
                    >
                    <NButton
                      @click="editingClass.methods.splice(index, 1)"
                      size="tiny"
                      type="error"
                      quaternary
                      style="margin-left: auto"
                      >删除</NButton
                    >
                  </div>
                </template>
                <NSpace
                  vertical
                  size="small"
                >
                  <NSpace>
                    <NFormItem
                      label="方法名"
                      style="margin: 0; flex: 1"
                    >
                      <NInput
                        v-model:value="method.name"
                        placeholder="方法名"
                        size="small"
                      />
                    </NFormItem>
                    <NFormItem
                      label="返回类型"
                      style="margin: 0; flex: 1"
                    >
                      <NInput
                        v-model:value="method.returnType"
                        placeholder="返回类型"
                        size="small"
                      />
                    </NFormItem>
                  </NSpace>
                  <NFormItem
                    label="可见性"
                    style="margin: 0"
                  >
                    <NRadioGroup
                      v-model:value="method.visibility"
                      size="small"
                    >
                      <NRadio value="public">+ public</NRadio>
                      <NRadio value="private">- private</NRadio>
                      <NRadio value="protected"># protected</NRadio>
                    </NRadioGroup>
                  </NFormItem>
                </NSpace>
              </NCard>
            </div>
            <NButton
              @click="
                editingClass.methods.push({
                  name: 'newMethod',
                  returnType: 'void',
                  visibility: 'public',
                })
              "
              dashed
              block
              type="primary"
              ghost
              size="small"
            >
              <template #icon><div class="i-mdi-plus"></div></template>
              添加方法
            </NButton>
          </div>

          <NDivider style="margin: 20px 0"></NDivider>
          <NSpace justify="space-between">
            <NButton
              @click="deleteClass"
              type="error"
              ghost
            >
              <template #icon><div class="i-mdi-delete"></div></template>
              删除类
            </NButton>
            <NSpace>
              <NButton @click="showEditor = false">取消</NButton>
              <NButton
                @click="saveClass"
                type="primary"
                >保存</NButton
              >
            </NSpace>
          </NSpace>
        </NForm>
      </div>
    </NDrawer>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, onMounted } from 'vue'
  import { Graph, ObjectExt, type Node, type Cell } from '@antv/x6'
  import { exportJSON, exportPNG, exportSVG } from '../utils/exportUtils'
  import type { UMLClass, UMLDiagramData } from '@/types/antv'

  interface Props {
    data?: UMLDiagramData
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
    ready: [graph: any]
    'data-change': [data: UMLDiagramData]
  }>()

  const containerRef = ref<HTMLDivElement>()
  const graph = ref<Graph>()
  const showEditor = ref(false)
  const editingClass = ref<UMLClass>()

  const exportOptions = [
    { label: '导出PNG', key: 'png' },
    { label: '导出SVG', key: 'svg' },
    { label: '导出JSON', key: 'json' },
  ]

  const getVisibilitySymbol = (visibility: string) =>
    ({ public: '+', private: '-', protected: '#' })[visibility] || '+'

  const centerContent = () => graph.value?.centerContent()
  const zoomToFit = () => graph.value?.zoomToFit({ padding: 10, maxScale: 1 })

  const initGraph = (options: any = {}) => {
    if (!containerRef.value) return
    graph.value = new Graph({
      container: containerRef.value,
      width: containerRef.value.clientWidth,
      height: containerRef.value.clientHeight,
      grid: true,
      panning: true,
      mousewheel: {
        enabled: true,
        zoomAtMousePosition: true,
        modifiers: 'ctrl',
        minScale: 0.5,
        maxScale: 3,
      },
      ...options,
    })
  }

  const registerNodes = () => {
    // 注册UML类节点
    Graph.registerNode(
      'class',
      {
        inherit: 'rect',
        markup: [
          { tagName: 'rect', selector: 'body' },
          { tagName: 'rect', selector: 'name-rect' },
          { tagName: 'rect', selector: 'attrs-rect' },
          { tagName: 'rect', selector: 'methods-rect' },
          { tagName: 'text', selector: 'name-text' },
          { tagName: 'text', selector: 'attrs-text' },
          { tagName: 'text', selector: 'methods-text' },
          { tagName: 'circle', selector: 'port-top' },
          { tagName: 'circle', selector: 'port-right' },
          { tagName: 'circle', selector: 'port-bottom' },
          { tagName: 'circle', selector: 'port-left' },
        ],
        attrs: {
          rect: { width: 160 },
          body: {
            stroke: '#5f95ff',
            strokeWidth: 1,
            fill: '#fff',
            magnet: false,
            style: { cursor: 'move' },
          },
          'name-rect': {
            fill: '#5f95ff',
            stroke: '#fff',
            strokeWidth: 0.5,
            magnet: false,
            style: { cursor: 'move' },
          },
          'attrs-rect': {
            fill: '#eff4ff',
            stroke: '#fff',
            strokeWidth: 0.5,
            magnet: false,
            style: { cursor: 'move' },
          },
          'methods-rect': {
            fill: '#eff4ff',
            stroke: '#fff',
            strokeWidth: 0.5,
            magnet: false,
            style: { cursor: 'move' },
          },
          'name-text': {
            ref: 'name-rect',
            refY: 0.5,
            refX: 0.5,
            textAnchor: 'middle',
            fontWeight: 'bold',
            fill: '#fff',
            fontSize: 12,
            pointerEvents: 'none',
          },
          'attrs-text': {
            ref: 'attrs-rect',
            refY: 0.5,
            refX: 5,
            textAnchor: 'left',
            fill: 'black',
            fontSize: 10,
            pointerEvents: 'none',
          },
          'methods-text': {
            ref: 'methods-rect',
            refY: 0.5,
            refX: 5,
            textAnchor: 'left',
            fill: 'black',
            fontSize: 10,
            pointerEvents: 'none',
          },
          ...['top', 'right', 'bottom', 'left'].reduce((acc, pos) => {
            const refConfig =
              pos === 'top'
                ? { refX: 0.5, refY: 0 }
                : pos === 'right'
                  ? { refX: 1, refY: 0.5 }
                  : pos === 'bottom'
                    ? { refX: 0.5, refY: 1 }
                    : { refX: 0, refY: 0.5 }
            acc[`port-${pos}`] = {
              ref: 'body',
              ...refConfig,
              r: 4,
              fill: '#31d0c6',
              stroke: '#ffffff',
              strokeWidth: 2,
              magnet: true,
              style: {
                cursor: 'crosshair',
                opacity: 0,
                transition: 'opacity 0.2s',
              },
            }
            return acc
          }, {} as any),
        },
        /**
         * @description: 节点事件
         */
        propHooks(meta: any) {
          const { name, attributes, methods, ...others } = meta
          if (!(name && attributes && methods)) return meta

          let offsetY = 0
          ;[
            { type: 'name', text: name },
            { type: 'attrs', text: attributes },
            { type: 'methods', text: methods },
          ].forEach(rect => {
            const height = Array.isArray(rect.text)
              ? rect.text.length * 12 + 16
              : 32
            ObjectExt.setByPath(
              others,
              `attrs/${rect.type}-text/text`,
              Array.isArray(rect.text) ? rect.text.join('\n') : rect.text
            )
            ObjectExt.setByPath(
              others,
              `attrs/${rect.type}-rect/height`,
              height
            )
            ObjectExt.setByPath(
              others,
              `attrs/${rect.type}-rect/transform`,
              `translate(0,${offsetY})`
            )
            offsetY += height
          })
          others.size = { width: 160, height: offsetY }
          return others
        },
      },
      true
    )

    // 注册连线类型
    const edgeTypes = {
      extends: {
        strokeDasharray: 0,
        targetMarker: {
          name: 'block',
          width: 10,
          height: 8,
          fill: 'white',
          stroke: '#722ed1',
          strokeWidth: 2,
        },
      },
      implement: {
        strokeDasharray: '8,4',
        targetMarker: {
          name: 'block',
          width: 10,
          height: 8,
          fill: 'white',
          stroke: '#722ed1',
          strokeWidth: 2,
        },
      },
      composition: {
        strokeDasharray: 0,
        sourceMarker: {
          name: 'diamond',
          width: 12,
          height: 8,
          fill: '#722ed1',
          stroke: '#722ed1',
        },
      },
      aggregation: {
        strokeDasharray: 0,
        sourceMarker: {
          name: 'diamond',
          width: 12,
          height: 8,
          fill: 'white',
          stroke: '#722ed1',
          strokeWidth: 2,
        },
      },
      association: {
        strokeDasharray: 0,
        targetMarker: { name: 'classic', size: 8, fill: '#722ed1' },
      },
    }

    Object.entries(edgeTypes).forEach(([type, config]) => {
      Graph.registerEdge(
        type,
        {
          inherit: 'edge',
          attrs: { line: { strokeWidth: 2, stroke: '#722ed1', ...config } },
        },
        true
      )
    })
  }

  const loadData = (data: any[]) => {
    if (!graph.value || !data.length) return
    const edgeShapes = [
      'extends',
      'composition',
      'implement',
      'aggregation',
      'association',
    ]
    const cells: Cell[] = []

    data.forEach(item => {
      if (edgeShapes.includes(item.shape)) {
        cells.push(graph.value!.createEdge(item))
      } else {
        const { data: nodeData, ...displayProps } = item
        const node = graph.value!.createNode(displayProps)
        if (nodeData) node.setData(nodeData)
        cells.push(node)
      }
    })

    graph.value.resetCells(cells)
    setTimeout(() => graph.value!.zoomToFit({ padding: 10, maxScale: 1 }), 200)
  }

  const initializeGraph = () => {
    if (!graph.value) return

    // 绑定事件
    graph.value.on('node:dblclick', ({ node }: { node: Node }) => {
      if (!props.readonly && node.getData()) editClass(node.getData())
    })

    // 连接点显示/隐藏
    const togglePorts = (node: Node, opacity: number) => {
      ;['top', 'right', 'bottom', 'left'].forEach(pos =>
        node.attr(`port-${pos}/style/opacity`, opacity)
      )
    }

    graph.value.on('node:mouseenter', ({ node }) => togglePorts(node, 1))
    graph.value.on('node:mouseleave', ({ node }) => togglePorts(node, 0))
    graph.value.on('edge:connected', () => emitDataChange())

    emit('ready', graph.value)

    // 加载示例数据
    const sampleClasses = [
      {
        id: 'animal',
        name: '<<Abstract>>\n动物',
        x: 342,
        y: 98,
        attributes: [{ name: '名字', type: 'string', visibility: 'public' }],
        methods: [
          { name: '新陈代谢', returnType: 'void', visibility: 'public' },
          { name: '繁殖', returnType: 'void', visibility: 'public' },
        ],
      },
      {
        id: 'bird',
        name: '鸟',
        x: 575,
        y: 280,
        attributes: [
          { name: '羽毛', type: 'string', visibility: 'public' },
          { name: '下蛋', type: 'boolean', visibility: 'public' },
        ],
        methods: [],
      },
      {
        id: 'mammal',
        name: '哺乳动物',
        x: 844,
        y: 319,
        attributes: [{ name: '翅膀', type: 'boolean', visibility: 'public' }],
        methods: [],
      },
      {
        id: 'dog',
        name: '狗',
        x: 656,
        y: 456,
        attributes: [{ name: '下蛋', type: 'boolean', visibility: 'public' }],
        methods: [],
      },
      {
        id: 'enterprise',
        name: '企鹅',
        x: 984,
        y: 456,
        attributes: [{ name: '下蛋', type: 'boolean', visibility: 'public' }],
        methods: [],
      },
      {
        id: 'sparrow',
        name: '麻雀',
        x: 531,
        y: 608,
        attributes: [{ name: '学飞', type: 'boolean', visibility: 'public' }],
        methods: [],
      },
      {
        id: 'interface-flying',
        name: '<<interface>>\n飞翔',
        x: 762,
        y: 608,
        attributes: [{ name: '下蛋', type: 'boolean', visibility: 'public' }],
        methods: [],
      },
      { id: 'qemu', name: '气球', x: 981, y: 608, attributes: [], methods: [] },
    ]

    const defaultCells = [
      ...sampleClasses.map(cls => ({
        id: cls.id,
        shape: 'class',
        x: cls.x,
        y: cls.y,
        name: cls.name,
        attributes: cls.attributes.map(
          attr =>
            `${getVisibilitySymbol(attr.visibility)} ${attr.name}: ${attr.type}`
        ),
        methods: cls.methods.map(
          method =>
            `${getVisibilitySymbol(method.visibility)} ${method.name}(): ${method.returnType}`
        ),
        data: {
          id: cls.id,
          name: cls.name,
          attributes: cls.attributes,
          methods: cls.methods,
          position: { x: cls.x, y: cls.y },
        },
      })),
      { id: 'edge-1', shape: 'extends', source: 'bird', target: 'animal' },
      { id: 'edge-2', shape: 'extends', source: 'mammal', target: 'animal' },
      { id: 'edge-3', shape: 'extends', source: 'dog', target: 'mammal' },
      {
        id: 'edge-4',
        shape: 'extends',
        source: 'enterprise',
        target: 'mammal',
      },
      { id: 'edge-5', shape: 'extends', source: 'sparrow', target: 'bird' },
      {
        id: 'edge-6',
        shape: 'implement',
        source: 'sparrow',
        target: 'interface-flying',
      },
      {
        id: 'edge-7',
        shape: 'implement',
        source: 'enterprise',
        target: 'interface-flying',
      },
      {
        id: 'edge-8',
        shape: 'association',
        source: 'bird',
        target: 'mammal',
        label: '1:2',
      },
    ]

    loadData(defaultCells)
  }

  const addClass = () => {
    const newClass: UMLClass = {
      id: `class_${Date.now()}`,
      name: '新类',
      attributes: [
        { name: 'attribute', type: 'string', visibility: 'private' },
      ],
      methods: [{ name: 'method', returnType: 'void', visibility: 'public' }],
      position: { x: 100, y: 100 },
    }

    if (!graph.value) return

    const nodeData = {
      id: newClass.id,
      shape: 'class',
      x: newClass.position.x,
      y: newClass.position.y,
      name: newClass.name,
      attributes: newClass.attributes.map(
        attr =>
          `${getVisibilitySymbol(attr.visibility)} ${attr.name}: ${attr.type}`
      ),
      methods: newClass.methods.map(
        method =>
          `${getVisibilitySymbol(method.visibility)} ${method.name}(): ${method.returnType}`
      ),
      data: newClass,
    }

    graph.value.addCell(graph.value.createNode(nodeData))
    emitDataChange()
  }

  const editClass = (umlClass: UMLClass) => {
    editingClass.value = {
      ...umlClass,
      attributes: [...(umlClass.attributes || [])],
      methods: [...(umlClass.methods || [])],
    }
    showEditor.value = true
  }

  const saveClass = () => {
    if (!graph.value || !editingClass.value) return

    const node = graph.value.getCellById(editingClass.value.id) as Node
    if (node) {
      node.setData(editingClass.value)
      node.prop({
        name: editingClass.value.name,
        attributes: editingClass.value.attributes.map(
          attr =>
            `${getVisibilitySymbol(attr.visibility)} ${attr.name}: ${attr.type}`
        ),
        methods: editingClass.value.methods.map(
          method =>
            `${getVisibilitySymbol(method.visibility)} ${method.name}(): ${method.returnType}`
        ),
      })
    }
    showEditor.value = false
    emitDataChange()
  }

  const deleteClass = () => {
    if (!graph.value || !editingClass.value) return
    graph.value.getCellById(editingClass.value.id)?.remove()
    showEditor.value = false
    emitDataChange()
  }

  const getCurrentData = (): UMLDiagramData => ({
    classes:
      graph.value?.getNodes().map((node: Node) => ({
        ...node.getData(),
        position: node.getPosition(),
      })) || [],
    relations: [],
  })

  const handleExport = (key: string) => {
    if (!graph.value) return
    const data = getCurrentData()
    const exportMap = {
      png: () => exportPNG(graph.value!),
      svg: () => exportSVG(graph.value!),
      json: () => exportJSON(data),
    }
    exportMap[key as keyof typeof exportMap]?.()
  }

  const emitDataChange = () => emit('data-change', getCurrentData())

  watch(
    graph,
    newGraph => {
      if (newGraph) {
        registerNodes()
        initializeGraph()
      }
    },
    { immediate: true }
  )

  watch(
    () => props.data,
    newData => {
      if (graph.value && newData) {
        // 处理外部数据变化
      }
    },
    { deep: true }
  )

  onMounted(() => {
    initGraph({
      interacting: true,
      connecting: {
        router: 'manhattan',
        connector: { name: 'rounded', args: { radius: 8 } },
        allowBlank: false,
        allowLoop: false,
        allowNode: false,
        snap: true,
        allowEdge: false,
        createEdge: () =>
          graph.value!.createEdge({
            shape: 'extends',
            attrs: {
              line: {
                stroke: '#722ed1',
                strokeWidth: 2,
                targetMarker: {
                  name: 'block',
                  width: 8,
                  height: 6,
                  fill: '#722ed1',
                },
              },
            },
          }),
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
    })
  })

  defineExpose({
    getGraph: () => graph.value,
    getData: getCurrentData,
    addClass,
    centerContent,
    zoomToFit,
  })
</script>

<style scoped>
  .uml-layout {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-height: 400px;
  }

  .toolbar {
    padding: 12px;
    background: #fafafa;
    border-bottom: 1px solid #d9d9d9;
    flex-shrink: 0;
  }

  .graph-container {
    flex: 1;
    position: relative;
    min-height: 300px;
    width: 100%;
    border: 1px solid #e8e8e8;
    background: #ffffff;
    overflow: hidden;
  }

  .graph-container :deep(.x6-graph),
  .graph-container :deep(.x6-graph-svg) {
    width: 100% !important;
    height: 100% !important;
    display: block;
  }

  .class-editor {
    padding: 20px;
    height: calc(100vh - 60px);
    overflow-y: auto;
  }

  .section {
    max-height: 300px;
    overflow-y: auto;
    padding-right: 4px;
  }

  .item {
    margin-bottom: 8px;
  }

  .section .n-card {
    border: 1px solid #e8e8e8;
  }

  .section .n-card-header {
    padding: 8px 12px;
    background: #fafafa;
    border-bottom: 1px solid #e8e8e8;
  }

  .section .n-card__content {
    padding: 12px;
  }

  .section .n-form-item {
    margin-bottom: 0;
  }

  .section .n-form-item-label {
    font-size: 12px;
    margin-bottom: 4px;
    color: #666;
  }

  .section::-webkit-scrollbar {
    width: 6px;
  }

  .section::-webkit-scrollbar-thumb {
    background: #d4d4d4;
    border-radius: 3px;
  }
</style>
