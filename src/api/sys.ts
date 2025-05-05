/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-01 14:11:38
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-05 00:43:14
 * @FilePath: \Robot_Admin\src\api\sys.ts
 * @Description:
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
import request from '@/axios/request'
import DynamicRouter from '@/assets/dynamicRouter.json'

// 登录接口
export const login = (data: unknown) => {
  return request({
    url: '/sys/login',
    method: 'POST',
    data,
  })
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
