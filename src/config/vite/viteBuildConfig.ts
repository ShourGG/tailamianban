// src/config/vite/viteBuildConfig.ts
import type { BuildOptions } from 'vite'

const buildConfig: BuildOptions = {
  // 生产环境移除console
  minify: 'terser' as const,
  terserOptions: {
    compress: {
      drop_console: true,
      drop_debugger: true,
    },
  },

  rollupOptions: {
    output: {
      // 根据你实际使用的库进行分包
      manualChunks: {
        // Vue 核心生态
        'vue-vendor': [
          'vue',
          'vue-router',
          'pinia',
          'pinia-plugin-persistedstate',
        ],

        // UI组件库 (你用的是naive-ui)
        'ui-vendor': ['naive-ui', '@iconify/vue'],

        // 图表相关库群 (你有很多图表库)
        'chart-vendor': [
          'echarts',
          '@antv/x6',
          '@visactor/vtable-gantt',
          '@vue-flow/core',
        ],

        // 编辑器相关
        'editor-vendor': ['@kangc/v-md-editor', 'wangeditor', 'highlight.js'],

        // 3D渲染库
        'spline-vendor': ['@splinetool/runtime'],

        // 文档处理相关
        'office-vendor': [
          'xlsx',
          '@tato30/vue-pdf',
          'mammoth',
          'file-saver',
          'jszip',
          'jszip-utils',
        ],

        // 日历相关
        'calendar-vendor': [
          '@fullcalendar/core',
          '@fullcalendar/daygrid',
          '@fullcalendar/interaction',
          '@fullcalendar/list',
          '@fullcalendar/vue3',
        ],

        // 交互增强库
        'interaction-vendor': [
          'vue-draggable-plus',
          'vue-command-palette',
          'vue3-puzzle-vcode',
          'motion-v',
          'driver.js',
        ],

        // 工具库
        'utils-vendor': [
          '@vueuse/core',
          'axios',
          'html2canvas',
          'print-js',
          'nprogress',
          '@vercel/analytics',
        ],
      },

      // 优化文件命名
      chunkFileNames: 'assets/js/[name]-[hash].js',
      entryFileNames: 'assets/js/[name]-[hash].js',
      assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
    },
  },

  // 严格控制包大小
  chunkSizeWarningLimit: 200,
  reportCompressedSize: false,
} as const

export default buildConfig
