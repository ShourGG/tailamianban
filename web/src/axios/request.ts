/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-29 11:43:48
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-09-05 16:21:49
 * @FilePath: \Robot_Admin\src\axios\request.ts
 * @Description: axios 二次封装
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import axios, { type AxiosRequestConfig } from 'axios'
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

// ================= 优化后的快捷请求方式 =================

/**
 * GET 请求
 * @param url 请求地址
 * @param config 请求配置（可选），包含 params、headers 等
 */
export const getData = async <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  const res = await service.get(url, config)
  return res.data
}

/**
 * POST 请求
 * @param url 请求地址
 * @param data 请求体数据（可选）
 * @param config 请求配置（可选）
 */
export const postData = async <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  const res = await service.post(url, data, config)
  return res.data
}

/**
 * PUT 请求
 * @param url 请求地址
 * @param data 请求体数据（可选）
 * @param config 请求配置（可选）
 */
export const putData = async <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  const res = await service.put(url, data, config)
  return res.data
}

/**
 * DELETE 请求
 * @param url 请求地址
 * @param config 请求配置（可选）
 */
export const deleteData = async <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  const res = await service.delete(url, config)
  return res.data
}

// ================= 使用示例 =================

// 1. 简单 GET 请求
// getData('/users')

// 2. 带参数的 GET 请求（推荐方式 - axios 会自动处理参数）
// getData('/users', { params: { page: 1, pageSize: 10 } })

// 3. 带请求头的 GET 请求
// getData('/users', {
//   params: { page: 1 },
//   headers: { 'X-Custom-Header': 'value' }
// })

// 4. POST 请求
// postData('/users', { name: '张三' })

// 5. POST 请求带额外配置
// postData('/users', { name: '张三' }, {
//   headers: { 'X-Custom-Header': 'value' }
// })
