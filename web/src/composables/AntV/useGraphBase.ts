import { Graph } from '@antv/x6'
import type { Ref } from 'vue'

/**
 * 默认的图表配置选项
 */
const DEFAULT_OPTIONS = {
  background: { color: '#f5f5f5' },
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
    maxScale: 2,
  },
  selecting: {
    enabled: true,
    rubberband: true,
    movable: true,
    showNodeSelectionBox: true,
  },
  resizing: true,
  rotating: true,
  snapline: true,
  keyboard: true,
  clipboard: true,
}

/**
 * 获取容器的尺寸
 */
function getContainerSize(container: HTMLElement | undefined) {
  if (!container) return { width: 0, height: 0 }
  return {
    width: container.clientWidth || container.offsetWidth || 800,
    height: container.clientHeight || container.offsetHeight || 600,
  }
}

/**
 * 创建和管理 AntV X6 图表实例的组合式 API
 */
export function useGraphBase(containerRef: Ref<HTMLElement | undefined>) {
  // 直接使用 any 类型，在使用时再进行类型断言
  const graph: Ref<any> = ref(null)
  const loading = ref(false)

  /**
   * 初始化图表实例
   */
  const initGraph = async (options: any = {}) => {
    await nextTick()
    loading.value = true

    try {
      if (!containerRef.value) {
        console.error('[useGraphBase] 容器引用不存在')
        return
      }

      // 销毁旧实例
      if (graph.value) {
        graph.value.dispose()
        graph.value = null
      }

      const { width, height } = getContainerSize(containerRef.value)

      // 容器尺寸为0，延迟重试
      if (width === 0 || height === 0) {
        console.warn('[useGraphBase] 容器尺寸为0，等待重试...')
        setTimeout(() => initGraph(options), 100)
        return
      }

      const finalOptions = {
        container: containerRef.value,
        width,
        height,
        ...DEFAULT_OPTIONS,
        ...options,
      }

      console.log('[useGraphBase] 图表配置:', finalOptions)

      graph.value = new Graph(finalOptions)

      console.log('[useGraphBase] 图表初始化完成')
    } catch (error) {
      console.error('[useGraphBase] 初始化图表失败:', error)
    } finally {
      loading.value = false
    }
  }

  /**
   * 销毁当前图表实例
   */
  function destroyGraph() {
    if (graph.value) {
      graph.value.dispose()
      graph.value = null
    }
  }

  /**
   * 将图表内容居中显示
   */
  function centerContent() {
    graph.value?.centerContent()
  }

  /**
   * 自适应缩放图表以适应容器
   */
  function zoomToFit() {
    graph.value?.zoomToFit({ padding: 20, maxScale: 1 })
  }

  /**
   * 按指定因子缩放图表
   */
  function zoom(factor: number) {
    graph.value?.zoom(factor)
  }

  /**
   * 调整图表尺寸以适应容器变化
   */
  function resizeGraph() {
    if (graph.value && containerRef.value) {
      const { width, height } = getContainerSize(containerRef.value)
      graph.value.resize(width, height)
    }
  }

  // 组件卸载时自动销毁图表
  onUnmounted(destroyGraph)

  return {
    graph,
    loading,
    initGraph,
    destroyGraph,
    centerContent,
    zoomToFit,
    zoom,
    resizeGraph,
  }
}
