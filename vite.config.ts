/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-03-30 17:45:29
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-05 01:26:30
 * @FilePath: \Robot_Admin\vite.config.ts
 * @Description: vite 配置文件，团队协作中莫要乱改乱动，修改前记得通知维护者。
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import Unocss from 'unocss/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import viteConsolePlugin from 'vite-console-plugin'
import { readFileSync } from 'node:fs'
const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // customConsolePlugin(),
    viteConsolePlugin({
      systemName: packageJson.name,
      version: `v${packageJson.version} (开发版)`,
      team: '信息化部-业务2室西安领域',
      owner: 'CHENY | 编号: 409322',
    }),
    Unocss(),
    vue(),
    vueJsx(),
    vueDevTools(),
    Icons({ autoInstall: true }),
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        'pinia',
        {
          '@vueuse/core': ['useLocalStorage', 'useClipboard'],
        },
        {
          'naive-ui': [
            'useDialog',
            'useMessage',
            'useNotification',
            'useLoadingBar',
          ],
        },
      ],
      dts: 'types/auto-imports.d.ts', // 生成类型声明文件
      dirs: ['src/stores', 'src/composables', 'src/hooks'], // 自动导入自定义组合式函数
      vueTemplate: true, // 支持模板自动导入
    }),
    Components({
      dts: 'types/components.d.ts', // 生成类型声明文件
      dirs: ['src/components/global', 'src/components/local'], // 自动导入组件
      extensions: ['vue'], // 扩展名
      version: 3, // 明确指定 Vue 3.x 版本
      resolvers: [
        NaiveUiResolver(),
        componentName => {
          if (componentName.startsWith('C_')) {
            return {
              name: componentName.slice(2),
              // 使用别名@绝对路径
              from: `./src/components/global/${componentName}/index.vue`,
            }
          }
          if (componentName.startsWith('c_')) {
            return {
              name: componentName.slice(2),
              from: `./src/components/local/${componentName}/index.vue`,
            }
          }
          return null
        },
        IconsResolver({
          prefix: 'icon',
        }),
      ],
      // 新增 globs 配置进行文件过滤
      globs: [
        'src/components/global/C_*/index.vue', // 匹配目录结构
        'src/components/local/c_*/index.vue',
      ],
      directives: true, // 自动导入指令，默认目录为 src/directives
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      _views: fileURLToPath(new URL('./src/views', import.meta.url)),
    },
  },
  server: {
    port: 1988,
    hmr: { overlay: true },
    proxy: {
      '^/api': {
        target: 'https://apifoxmock.com/m1/4902805-4559325-default', //代理接口
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, ''),
      },
    },
  },
})
