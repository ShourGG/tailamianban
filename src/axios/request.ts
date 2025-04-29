/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-29 11:43:48
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-04-29 16:02:28
 * @FilePath: \Robot_Admin\src\axios\request.ts
 * @Description: axios 二次封装
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import axios from 'axios'
import { s_appStore } from '@/stores/app'
import { s_userStore } from '@/stores/user'
import { d_isCheckTimeout } from '@/utils/d_auth'
import { createDiscreteApi } from 'naive-ui'

const { VITE_BASE_URL } = import.meta.env
const { message } = createDiscreteApi(['message'])

const service = axios.create({
  baseURL: VITE_BASE_URL || '',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'Accept-Language': s_appStore().language, // 初始化时注入一次
  },
})

service.interceptors.request.use(
  config => {
    const { token, logout } = s_userStore()
    const { language } = s_appStore()
    config.headers = axios.AxiosHeaders.from(config.headers)
    if (token) {
      if (d_isCheckTimeout()) {
        logout()
        return Promise.reject(new Error('token 已过期，请重新登录'))
      }
      config.headers.Authorization = `Bearer ${token}`
    }
    // 动态注入最新语言
    config.headers['Accept-Language'] = language
    return config
  },
  error => {
    if (axios.isCancel(error)) {
      message.info(`请求已取消: ${error.message}`, { duration: 3000 })
    }
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  response => {
    // 兼容没有 code 字段的情况
    if (
      typeof response.data === 'object' &&
      'code' in response.data &&
      response.data.code !== 0
    ) {
      return Promise.reject(response.data)
    }
    return response.data
  },
  error => {
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      message.error('请求超时，请检查网络连接')
    }
    const errorMessage = error.response?.data?.message || error.message
    message.error(errorMessage, { duration: 3000 })

    const UNAUTHORIZED_CODES = [401, 403]
    if (UNAUTHORIZED_CODES.includes(error.response?.status)) {
      s_userStore().logout()
    }
    return Promise.reject(error)
  }
)

export default service
