/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-03-30 17:45:29
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-04-18 14:51:46
 * @FilePath: \bun_vite_uno_naive\vite.config.ts
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

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    Unocss(),
    vue(),
    vueJsx(),
    vueDevTools(),
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        'pinia',
        {
          '@vueuse/core': ['useMouse', 'useLocalStorage'],
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
              from: '@/components/global/' + componentName + '.vue',
            }
          }
          if (componentName.startsWith('c_')) {
            return {
              name: componentName.slice(2),
              from: '@/components/local/' + componentName + '.vue',
            }
          }
          return null
        },
      ],
      // 新增 globs 配置进行文件过滤
      globs: [
        'src/components/global/C_[A-Z]*.vue',
        'src/components/local/c_[a-z]*.vue',
      ],
      directives: true, // 自动导入指令，默认目录为 src/directives
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 1988,
    open: true,
    hmr: { overlay: true },
    proxy: {
      '^/api': {
        target: 'http://121.89.210.252:3000/mock/2228/', //代理接口
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, ''),
      },
    },
  },
})
