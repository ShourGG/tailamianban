/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-03-30 17:45:29
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-17 17:10:15
 * @FilePath: \Robot_Admin\vite.config.ts
 * @Description: vite 配置文件，团队协作中莫要乱改乱动，修改前记得通知维护者。
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import Unocss from 'unocss/vite'
import Icons from 'unplugin-icons/vite'

import {
  viteConsolePlugin,
  viteAutoImportPlugin,
  viteComponentsPlugin,
  resolveConfig,
  serverConfig,
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
  ],
  resolve: resolveConfig,
  optimizeDeps: {
    include: ['vue', 'naive-ui'],
  },
  server: serverConfig,
})
