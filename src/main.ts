/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-03-30 17:45:29
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-10 23:33:00
 * @FilePath: \Robot_Admin\src\main.ts
 * @Description: 根入口文件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
import './assets/css/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createDiscreteApi } from 'naive-ui'

import App from './App.vue'
import router from './router'

import '@/router/permission'

import 'virtual:uno.css'

const app = createApp(App)

export const { notification } = createDiscreteApi(['notification'], {
  notificationProviderProps: {
    max: 1,
    placement: 'top-right',
    keepAliveOnHover: true,
  },
})

app.use(createPinia()).use(router).mount('#app')
