/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-07-30 17:04:19
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-08-21 10:47:58
 * @FilePath: \Robot_Admin\src\api\auth.ts
 * @Description: auth api
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
import request from '@/axios/request'
import DynamicRouter from '@/assets/data/dynamicRouter.json'
// import type { DynamicRoute } from '@/router/dynamicRouter'

export interface LoginResponse {
  code: '0' | '1' // 改回字符串类型，与 ApiResponse 保持一致
  message: string
  data: {
    userId: number
    username: string
    email: string
    nickname: string
    avatar: string
    roles: string[]
    token: string
    refreshToken: string
    expiresIn: number
    lastLoginTime: number
  }
  timestamp: number
}

// 登录接口
// 添加响应数据解构
export const loginApi = (data: { username: string; password: string }) => {
  return request<LoginResponse>({
    method: 'post',
    url: '/auth/login',
    data,
  }).then(res => res.data)
}

// 获取菜单列表
export const getAuthMenuListApi = () => {
  // return request({
  //   url: '/sys/menu/list',
  // })
  // 暂时使用本地数据
  return DynamicRouter
}

// TODO: 真实接口调用切换如下
// export const getAuthMenuListApi = () => {
//   return DynamicRouter as unknown as Promise<{
//     code: string
//     data: DynamicRoute[]
//     msg: string
//   }>
// }
