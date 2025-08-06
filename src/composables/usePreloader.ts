// ============================================================================
// 文件预加载
// ============================================================================

// 🎯 类型定义
interface PreloadRoute {
  path: string
  component: () => Promise<any>
  reason: string
  priority: number
}

interface PreloadStats {
  total: number
  completed: number
  failed: number
  startTime: number
  endTime: number
}

interface PreloadDebugTools {
  stats: () => any
  preload: (path: string) => Promise<void>
  check: (path: string) => boolean
  restart: () => Promise<void>
  routes: Array<{ path: string; reason: string }>
  help: () => void
}

// 扩展 Window 接口
declare global {
  interface Window {
    preloadDebug: PreloadDebugTools
  }
}

// 🎯 预加载白名单配置 - 直接写在这里，简单直接
const PRELOAD_ROUTES: PreloadRoute[] = [
  {
    path: '/calendar',
    component: () => import('@/views/demo/13-calendar/index.vue'),
    reason: '日历组件包含 @fullcalendar 全家桶，体积较大',
    priority: 1,
  },
  {
    path: '/antv-x6-editor',
    component: () => import('@/views//demo/29-antv-x6-editor/index.vue'),
    reason: '图表页面包含 echarts、@antv/x6 等重型可视化库',
    priority: 1,
  },
  {
    path: '/text-editor',
    component: () => import('@/views/demo/16-text-editor/index.vue'),
    reason: '编辑器包含 wangeditor 富文本编辑器',
    priority: 2,
  },
  {
    path: '/v-table-gantt',
    component: () => import('@/views//demo/33-v-table-gantt/index.vue'),
    reason: '数据分析包含 @visactor/vtable-gantt 甘特图',
    priority: 2,
  },
  {
    path: '/dragable',
    component: () => import('@/views/demo/20-dragable/index.vue'),
    reason: '拖拽组件',
    priority: 2,
  },
  // 🔧 需要添加新的重型页面？直接在这里加一行
  // {
  //   path: '/reports',
  //   component: () => import('@/views/Reports.vue'),
  //   reason: '报表页面包含大量图表',
  //   priority: 3
  // },
]

/**
 * 预加载功能的组合式API
 */
export function usePreloader() {
  const preloadedRoutes = ref(new Set<string>())
  const isPreloading = ref(false)
  const stats = ref<PreloadStats>({
    total: 0,
    completed: 0,
    failed: 0,
    startTime: 0,
    endTime: 0,
  })

  /**
   * 开始预加载所有重型页面
   * 按优先级串行执行，避免并发请求导致浏览器卡顿
   */
  const startPreload = async (): Promise<void> => {
    if (isPreloading.value) {
      console.log('🔄 [预加载] 已在进行中，跳过重复执行')
      return
    }

    isPreloading.value = true
    stats.value = {
      total: PRELOAD_ROUTES.length,
      completed: 0,
      failed: 0,
      startTime: Date.now(),
      endTime: 0,
    }

    console.log(`🚀 [预加载] 开始预加载 ${PRELOAD_ROUTES.length} 个重型页面`)
    console.log(
      '📋 [预加载] 白名单:',
      PRELOAD_ROUTES.map(r => `${r.path} (${r.reason})`)
    )

    // 按优先级排序：1 > 2 > 3
    const sortedRoutes = [...PRELOAD_ROUTES].sort(
      (a, b) => a.priority - b.priority
    )
    console.log(
      '⚡ [预加载] 执行顺序:',
      sortedRoutes.map(r => `${r.path} (优先级${r.priority})`)
    )

    // 使用 reduce 创建串行执行的 Promise 链
    await sortedRoutes.reduce(async (previousPromise, route) => {
      await previousPromise
      await preloadSingleRoute(route)
      // 每个路由间隔100ms，避免阻塞
      await sleep(100)
    }, Promise.resolve())

    stats.value.endTime = Date.now()
    const totalTime = stats.value.endTime - stats.value.startTime

    isPreloading.value = false

    console.log(`🎉 [预加载] 全部完成!`)
    console.log(
      `📊 [预加载] 统计: 成功 ${stats.value.completed}/${stats.value.total}, 失败 ${stats.value.failed}, 耗时 ${totalTime}ms`
    )

    // 开发环境显示预加载的路由列表
    if (import.meta.env.DEV) {
      console.log(
        '✅ [预加载] 已预加载的路由:',
        Array.from(preloadedRoutes.value)
      )
    }
  }

  /**
   * 预加载单个路由组件
   */
  const preloadSingleRoute = async (route: PreloadRoute): Promise<void> => {
    if (preloadedRoutes.value.has(route.path)) {
      console.log(`⏭️ [预加载] ${route.path} 已预加载，跳过`)
      return
    }

    console.log(`🔄 [预加载] 正在加载 ${route.path}...`)
    const startTime = Date.now()

    try {
      // 执行动态导入
      await route.component()

      const loadTime = Date.now() - startTime
      preloadedRoutes.value.add(route.path)
      stats.value.completed++

      console.log(
        `✅ [预加载] ${route.path} 成功 (${loadTime}ms) - ${route.reason}`
      )
    } catch (error) {
      const loadTime = Date.now() - startTime
      stats.value.failed++

      console.error(`❌ [预加载] ${route.path} 失败 (${loadTime}ms):`, error)
    }
  }

  /**
   * 检查路由是否已预加载
   */
  const isPreloaded = (path: string): boolean => {
    const preloaded = preloadedRoutes.value.has(path)

    if (import.meta.env.DEV) {
      if (preloaded) {
        console.log(`⚡ [检查] ${path} 已预加载，可瞬间切换`)
      } else {
        console.log(`⏳ [检查] ${path} 未预加载，首次访问需要加载时间`)
      }
    }

    return preloaded
  }

  /**
   * 手动预加载指定路由
   */
  const preloadRoute = async (path: string): Promise<void> => {
    const route = PRELOAD_ROUTES.find(r => r.path === path)
    if (!route) {
      console.warn(`⚠️ [手动预加载] ${path} 不在白名单中`)
      return
    }

    console.log(`🎯 [手动预加载] 开始加载 ${path}`)
    await preloadSingleRoute(route)
  }

  /**
   * 获取预加载统计信息
   */
  const getStats = () => {
    const currentStats = {
      ...stats.value,
      preloadedPaths: Array.from(preloadedRoutes.value),
      isPreloading: isPreloading.value,
      totalRoutes: PRELOAD_ROUTES.length,
    }

    console.log('📊 [统计] 当前预加载状态:', currentStats)
    return currentStats
  }

  /**
   * 工具函数：延迟执行
   */
  const sleep = (ms: number): Promise<void> =>
    new Promise(resolve => setTimeout(resolve, ms))

  // 🛠️ 开发环境暴露调试工具到全局
  if (import.meta.env.DEV) {
    window.preloadDebug = {
      stats: getStats,
      preload: preloadRoute,
      check: isPreloaded,
      restart: startPreload,
      routes: PRELOAD_ROUTES.map(r => ({ path: r.path, reason: r.reason })),
      help: () => {
        console.log(`
🛠️ 预加载调试工具:

preloadDebug.stats()            - 查看预加载统计
preloadDebug.preload('/path')   - 手动预加载指定路由
preloadDebug.check('/path')     - 检查路由是否已预加载
preloadDebug.restart()          - 重新开始预加载
preloadDebug.routes             - 查看白名单配置
preloadDebug.help()             - 显示帮助信息

快捷键: Ctrl+Shift+P 查看统计
        `)
      },
    }

    // 添加快捷键 Ctrl+Shift+P 查看统计
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault()
        console.log('🔍 [快捷键] 查看预加载统计:')
        getStats()
      }
    })

    console.log('🛠️ 预加载调试工具已加载! 使用 preloadDebug.help() 查看帮助')
  }

  return {
    startPreload,
    isPreloaded,
    preloadRoute,
    getStats,
    isPreloading,
    stats,
    preloadedRoutes: preloadedRoutes.value,
  }
}

// ============================================================================
// 使用示例
// ============================================================================

/**
 * 在 App.vue 中使用:
 *
 * <script setup>
 * import { onMounted } from 'vue'
 * import { usePreloader } from '@/composables/usePreloader'
 *
 * const { startPreload, isPreloading, stats } = usePreloader()
 *
 * onMounted(() => {
 *   // 页面加载完成2秒后开始预加载
 *   setTimeout(() => {
 *     startPreload()
 *   }, 2000)
 * })
 * </script>
 *
 * <template>
 *   <div id="app">
 *     <router-view />
 *
 *     <!-- 可选：显示预加载状态 -->
 *     <div v-if="isPreloading && import.meta.env.DEV" class="preload-status">
 *       🔄 正在优化页面... {{ stats.completed }}/{{ stats.total }}
 *     </div>
 *   </div>
 * </template>
 *
 * <style>
 * .preload-status {
 *   position: fixed;
 *   bottom: 20px;
 *   right: 20px;
 *   background: rgba(0, 0, 0, 0.8);
 *   color: white;
 *   padding: 8px 16px;
 *   border-radius: 6px;
 *   font-size: 12px;
 *   z-index: 9999;
 * }
 * </style>
 */

/**
 * 🔍 测试命令 (浏览器控制台):
 *
 * preloadDebug.stats()            // 查看统计
 * preloadDebug.check('/calendar')  // 检查日历是否预加载
 * preloadDebug.preload('/editor')  // 手动预加载编辑器
 * preloadDebug.restart()          // 重新开始预加载
 * preloadDebug.help()             // 查看帮助
 *
 * 快捷键: Ctrl+Shift+P            // 快速查看统计
 */

/**
 * 📊 控制台输出示例:
 *
 * 🚀 [预加载] 开始预加载 4 个重型页面
 * 📋 [预加载] 白名单: ["/calendar (日历组件包含 @fullcalendar 全家桶)", ...]
 * ⚡ [预加载] 执行顺序: ["/calendar (优先级1)", "/charts (优先级1)", ...]
 * 🔄 [预加载] 正在加载 /calendar...
 * ✅ [预加载] /calendar 成功 (234ms) - 日历组件包含 @fullcalendar 全家桶
 * 🔄 [预加载] 正在加载 /charts...
 * ✅ [预加载] /charts 成功 (456ms) - 图表页面包含 echarts、@antv/x6 等
 * 🎉 [预加载] 全部完成!
 * 📊 [预加载] 统计: 成功 4/4, 失败 0, 耗时 1234ms
 * ✅ [预加载] 已预加载的路由: ["/calendar", "/charts", "/editor", "/data-analysis"]
 *
 * // 用户点击菜单时
 * ⚡ [检查] /calendar 已预加载，可瞬间切换
 */
