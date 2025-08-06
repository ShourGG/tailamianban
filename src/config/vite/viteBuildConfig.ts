import type { BuildOptions } from 'vite'

const buildConfig: BuildOptions = {
  rollupOptions: {
    output: {
      manualChunks: {
        // 拆分真正需要的大型库
        'vue-core': [
          'vue',
          'vue-router',
          'pinia',
          'pinia-plugin-persistedstate',
        ],
        'ui-lib': ['naive-ui'],

        // 重型图表库
        charts: [
          'echarts',
          '@antv/x6',
          '@vue-flow/core',
          '@visactor/vtable-gantt',
        ],

        // 编辑器 - 低频大型库
        editors: ['@kangc/v-md-editor', 'wangeditor', 'highlight.js'],

        // 办公套件
        office: [
          'xlsx',
          '@tato30/vue-pdf',
          'mammoth',
          'file-saver',
          'jszip',
          'jszip-utils',
        ],

        // 日历组件
        calendar: [
          '@fullcalendar/core',
          '@fullcalendar/daygrid',
          '@fullcalendar/interaction',
          '@fullcalendar/list',
          '@fullcalendar/vue3',
        ],

        // 3D 渲染 - 特殊大型库
        spline: ['@splinetool/runtime'],
      },
    },
  },
} as const

export default buildConfig
