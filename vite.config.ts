/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-03-30 17:45:29
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-07-31 10:02:20
 * @FilePath: \Robot_Admin\vite.config.ts
 * @Description: vite 配置文件，团队协作中莫要乱改乱动，修改前记得通知维护者。
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import { defineConfig, PluginOption } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import Unocss from 'unocss/vite'
import Icons from 'unplugin-icons/vite'
import { visualizer } from 'rollup-plugin-visualizer'

import {
  viteConsolePlugin,
  viteAutoImportPlugin,
  viteComponentsPlugin,
  resolveConfig,
  serverConfig,
  buildConfig,
} from './src/config/vite'

export default defineConfig({
  plugins: [
    viteConsolePlugin,
    Unocss(),
    vue(),
    vueJsx(),
    vueDevTools(),
    Icons({ autoInstall: true }),
    viteAutoImportPlugin,
    viteComponentsPlugin,
    // 可视化分析 vite 打包结果
    ...(process.env.ANALYZE
      ? [
          visualizer({
            filename: 'dist/report.html',
            open: true,
            gzipSize: true,
          }) as PluginOption,
        ]
      : []),
  ],
  resolve: resolveConfig,
  optimizeDeps: {
    include: ['vue', 'naive-ui'],
  },
  server: serverConfig,
  build: buildConfig,
  // 开发环境优化
  esbuild: {
    // 生产环境移除调试代码
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
})
