import type { BuildOptions } from 'vite'

const buildConfig: BuildOptions = {
  // 关闭构建报告压缩大小计算，提升构建速度（默认 true）
  reportCompressedSize: false,

  rollupOptions: {
    output: {
      manualChunks: {
        // 将 3.28MB 的 chart-vendor 拆分为独立包
        echarts: ['echarts'], // ~200KB，你已按需引入
        'antv-x6': ['@antv/x6'], // ~1MB，只在图编辑页面加载
        'vtable-gantt': ['@visactor/vtable-gantt'], // ~800KB，只在甘特图页面加载
        'vue-flow': ['@vue-flow/core'], // ~500KB，只在流程图页面加载

        // Vue 生态分包
        'vue-vendor': [
          'vue',
          'vue-router',
          'pinia',
          'pinia-plugin-persistedstate',
        ],

        // UI 组件库分包
        'ui-vendor': ['naive-ui'],

        // 其他大型库分包
        'editor-vendor': ['@kangc/v-md-editor', 'wangeditor', 'highlight.js'],
        'spline-vendor': ['@splinetool/runtime'],
        'office-vendor': [
          'xlsx',
          '@tato30/vue-pdf',
          'mammoth',
          'file-saver',
          'jszip',
          'jszip-utils',
        ],
        'calendar-vendor': [
          '@fullcalendar/core',
          '@fullcalendar/daygrid',
          '@fullcalendar/interaction',
          '@fullcalendar/list',
          '@fullcalendar/vue3',
        ],
        'interaction-vendor': [
          'vue-draggable-plus',
          'vue-command-palette',
          'vue3-puzzle-vcode',
          'motion-v',
          'driver.js',
        ],
        'utils-vendor': [
          '@vueuse/core',
          'axios',
          'html2canvas',
          'print-js',
          'nprogress',
          '@vercel/analytics',
        ],
      },
    },
  },
} as const

export default buildConfig
