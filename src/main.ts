/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-03-30 17:45:29
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-27 22:35:11
 * @FilePath: \Robot_Admin\src\main.ts
 * @Description: 根入口文件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import './assets/css/main.css'
import '@/styles/index.scss'
import 'virtual:uno.css'
import '@/router/permission'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'
import {
  setupLoading,
  setupStore,
  setupNaiveUI,
  setupDynamicComponents,
  PassiveScrollPlugin,
  setupHighlight,
} from '@/plugins'

/**
 * * @description: 添加这个函数来初始化 Pinia store
 * ? @param {Pinia} pinia
 * ! @return {*}


/**
 * @description: 应用启动入口
 * @return {*}
 */
async function bootstrap() {
  // 第一阶段：非Vue相关的初始化
  setupLoading()

  // 第二阶段：创建Vue实例，初始化Pinia
  const app = createApp(App)
  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate)

  // 使用去除滚动警告的插件
  app.use(PassiveScrollPlugin)

  // 使用路由
  app.use(router)

  // 第三阶段：Vue相关插件
  setupStore(app)
  setupNaiveUI(app)
  setupDynamicComponents(app)
  setupHighlight(app)

  // 第四阶段：异步插件
  await router.isReady()

  // 最终挂载
  app.mount('#app')
}

// 启动应用
bootstrap().catch(error => console.error('应用启动失败:', error))
