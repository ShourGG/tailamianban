/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-12 22:40:54
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-12 22:41:06
 * @FilePath: \Robot_Admin\src\plugin\store.ts
 * @Description: store插件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
import { createPinia } from 'pinia'
import type { App } from 'vue'

/**
 * @description: 创建pinia实例并挂载到app上
 * @param {App} app
 * @return {*} void
 */
export function setupStore(app: App) {
  const pinia = createPinia()
  app.use(pinia)
}
