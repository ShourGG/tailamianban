/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-27 22:11:48
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-04-27 23:35:52
 * @FilePath: \Robot_Admin\src\router\publicRouter.ts
 * @Description: 静态路由表
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
import type { RouteRecordRaw } from 'vue-router'

/**
 * TODO: 公开路由表
 */
export const publicRoutes: RouteRecordRaw[] = [
  // {
  //   path: '/C_Container',
  //   name: 'C_Container',
  //   component: () => import('@/components/global/C_Container/index.vue'),
  //   meta: { hidden: true },
  // },
  {
    path: '/login',
    component: () => import('_views/login/index.vue'),
    meta: { hidden: true },
  },
  {
    path: '/401',
    name: '401',
    component: () => import('_views/error-page/401.vue'),
    meta: { hidden: true },
  },

  // 用来解决初次加载没有路由console提示Vue Router warn]: No match found for location with path的问题
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('_views/error-page/404.vue'),
    meta: { hidden: true },
  },

  // 临时空白的路径，解决开发环境本地警告
  {
    path: '/:catchAll(.*)',
    component: () => import('_views/error-page/blank.vue'),
  },
]

const routes = [...publicRoutes]

export default routes
