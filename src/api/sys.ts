/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-01 14:11:38
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-06 00:22:03
 * @FilePath: \Robot_Admin\src\api\sys.ts
 * @Description:
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
import request from '@/axios/request'
import DynamicRouter from '@/assets/dynamicRouter.json'

export interface LoginResponse {
  code: '0' | '1' // 根据实际业务码调整
  token: string
  message?: string
}

// 登录接口
// 添加响应数据解构
export const login = (data: { username: string; password: string }) => {
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
