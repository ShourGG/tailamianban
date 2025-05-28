/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-01 14:11:38
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-28 11:51:45
 * @FilePath: \Robot_Admin\src\api\sys.ts
 * @Description:
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
import request from '@/axios/request'
import DynamicRouter from '@/assets/data/dynamicRouter.json'
// import type { DynamicRoute } from '@/router/dynamicRouter'

export interface LoginResponse {
  code: '0' | '1' // 根据实际业务码调整
  token: string
  message?: string
}

// 登录接口
// 添加响应数据解构
export const loginApi = (data: { username: string; password: string }) => {
  return request<LoginResponse>({
    method: 'post',
    url: '/sys/login',
    data,
  }).then(res => res.data)
}

// 获取用户信息接口
export const getUserInfo = () => {
  return request({
    url: '/sys/profile',
  })
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
