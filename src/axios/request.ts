/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-29 11:43:48
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-08-25 15:08:35
 * @FilePath: \Robot_Admin\src\axios\request.ts
 * @Description: axios 二次封装
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import axios from 'axios'
import { s_userStore } from '@/stores/user'
import { d_isCheckTimeout } from '@/utils/d_auth'
import { createDiscreteApi } from 'naive-ui/es'

const { VITE_API_BASE } = import.meta.env
const { message } = createDiscreteApi(['message'])

const service = axios.create({
  baseURL: VITE_API_BASE || '',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    const { token, logout } = s_userStore()
    if (token) {
      if (d_isCheckTimeout()) {
        logout()
        return Promise.reject(new Error('token 已过期, 请重新登录'))
      }
      config.headers.Authorization = `Bearer ${token}` // 注意空格
    }
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    // 只返回业务数据，业务层直接拿 data
    if (response.status === 200) return response
    message.error('调用接口失败')
    return Promise.reject(new Error(response.statusText || '接口请求失败'))
  },
  error => {
    const { logout } = s_userStore()
    if (error?.response?.status === 401) {
      logout()
      message.error('登录已过期，请重新登录')
    } else {
      message.error(error.message || '响应拦截请求失败')
    }
    return Promise.reject(error)
  }
)

export default service

// 增加快捷请求方式

export const postData = async <T = any>(
  url: string,
  data?: any
): Promise<T> => {
  const res = await service.post(url, data)
  return res.data
}

export const getData = async <T = any>(url: string): Promise<T> => {
  const res = await service.get(url)
  return res.data
}

export const putData = async <T = any>(url: string, data?: any): Promise<T> => {
  const res = await service.put(url, data)
  return res.data
}

export const deleteData = async <T = any>(url: string): Promise<T> => {
  const res = await service.delete(url)
  return res.data
}

// 极特殊的场景在api接口文件中使用示例如下：（一般情况使用快捷请求方式即可）

// export const loginApi = (data: { username: string; password: string }) =>
//   service.post('/auth/login', data).then(res => res.data)
