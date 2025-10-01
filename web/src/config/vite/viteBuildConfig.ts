import type { BuildOptions } from 'vite'

const buildConfig: BuildOptions = {
  // 基础构建优化
  minify: 'esbuild', // 比 terser 更快
  target: 'es2020', // 兼容现代浏览器，Vite 5 支持
  chunkSizeWarningLimit: 800, // 适度调高，减少无意义警告

  rollupOptions: {
    output: {
      // 简化且有效的分包策略 - 减少网络请求数量
      manualChunks: {
        // Vue 生态系统 - 最频繁使用
        'vue-vendor': [
          'vue',
          'vue-router',
          'pinia',
          'pinia-plugin-persistedstate',
        ],

        // UI 框架 - 体积大且相对稳定
        'ui-vendor': ['naive-ui'],

        // 可视化图表库 - 体积大，按需加载
        'charts-vendor': [
          'echarts',
          '@antv/x6',
          '@vue-flow/core',
          '@visactor/vtable-gantt',
        ],

        // 内容编辑器 - 低频使用，独立分包
        'editor-vendor': ['@kangc/v-md-editor', 'wangeditor', 'highlight.js'],

        // 文档处理 - 功能相关，合并打包
        'office-vendor': [
          'xlsx',
          '@tato30/vue-pdf',
          'mammoth',
          'file-saver',
          'jszip',
          'jszip-utils',
        ],

        // 日历相关 - 功能内聚
        'calendar-vendor': [
          '@fullcalendar/core',
          '@fullcalendar/daygrid',
          '@fullcalendar/interaction',
          '@fullcalendar/list',
          '@fullcalendar/vue3',
        ],

        // 3D 渲染 - 独立且体积大
        'spline-vendor': ['@splinetool/runtime'],
      },

      // 优化文件组织结构
      chunkFileNames: 'js/[name]-[hash].js',
      entryFileNames: 'js/[name]-[hash].js',
      assetFileNames: assetInfo => {
        const name = assetInfo.name || ''

        // 按文件类型分目录
        if (/\.(png|jpe?g|gif|svg|webp|avif)$/i.test(name)) {
          return 'images/[name]-[hash].[ext]'
        }
        if (/\.(woff2?|eot|ttf|otf)$/i.test(name)) {
          return 'fonts/[name]-[hash].[ext]'
        }
        if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)$/i.test(name)) {
          return 'media/[name]-[hash].[ext]'
        }

        return 'assets/[name]-[hash].[ext]'
      },
    },
  },

  // 现代构建优化
  cssCodeSplit: true, // 启用 CSS 代码分割
  sourcemap: false, // 生产环境关闭 sourcemap
  reportCompressedSize: false, // 关闭压缩大小报告，加快构建
} as const

export default buildConfig
