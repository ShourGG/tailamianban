/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-01 22:46:09
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-06 15:43:56
 * @FilePath: \Robot_Admin\src\hooks\useFormSubmit\index.ts
 * @Description:  表单提交封装
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import { notification } from '@/plugins/naive-ui-plugin'

interface ApiResponse<T = any> {
  code: string
  message?: string
  data?: T
  // 你可以在这里添加更多的属性
}
export interface SubmitOptions<T extends ApiResponse = ApiResponse> {
  successCode?: string
  successMsg?: string
  errorMsg?: string
  onSuccess?: (data: T) => Promise<void> | void
  globalErrorHandler?: (error: any) => void // 新增的全局错误处理函数
  debounce?: number | false // 新增防抖配置（单位：毫秒）
}

// 定义默认的全局错误处理函数
const defaultGlobalErrorHandler = (error: any) => {
  console.error('默认全局错误处理:', error)
  // 在这里添加默认的错误处理逻辑，例如显示通知
  // notification.error({ content: '默认错误: ' + error.message, duration: 5000 })
}

export const useFormSubmit = <T extends ApiResponse = ApiResponse>() => {
  const loading = ref(false)
  // const notification = useNotification()

  /**
   * 处理表单未准备好的情况
   */
  const handleFormNotReady = () => {
    notification.error({
      content: '表单实例未准备好',
      duration: 3000,
    })
  }

  /**
   * 验证表单
   */
  const validateForm = async (formScope: any) => await formScope.form.validate()

  /**
   * 处理响应数据
   */
  const handleResponse = (data: T, options: SubmitOptions<T>) => {
    if (data.code === (options.successCode || '0')) {
      options.onSuccess?.(data)
      notification.success({
        content: options.successMsg || '提交成功',
        duration: 3000,
      })
      return true
    }
    return false
  }

  /**
   * 处理错误
   */
  const handleError = (error: any, options: SubmitOptions<T>) => {
    console.error('[表单提交] 错误:', error)
    if (options.globalErrorHandler) {
      options.globalErrorHandler(error)
    } else {
      defaultGlobalErrorHandler(error)
    }
    notification.error({
      content: error instanceof Error ? error.message : '提交失败',
      duration: 3000,
    })
  }

  const createSubmit = (
    apiFn: (model: any) => Promise<T>,
    options: SubmitOptions<T> = {}
  ) => {
    // 智能防抖处理
    const finalApiFn =
      options.debounce !== false
        ? useDebounceFn(apiFn, options.debounce || 500)
        : apiFn

    return async (formScope: any) => {
      if (!formScope.form) {
        handleFormNotReady()
        return
      }

      try {
        console.info('[表单验证] 开始验证...')
        // 直接验证
        await validateForm(formScope)
        loading.value = true
        const data = await finalApiFn(formScope.model) // 修改防抖包装调用方式

        // 处理成功逻辑
        if (handleResponse(data, options)) {
          return data
        }

        throw new Error(data.message || options.errorMsg || '操作失败')
      } catch (error) {
        handleError(error, options)
        throw error
      } finally {
        loading.value = false
      }
    }
  }

  return { loading, createSubmit }
}

// TAG: 使用示例
// const login = createSubmit(loginApi, {
//   successMsg: '登录成功',
//   errorMsg: '账号或密码错误',
//   onSuccess: async ({ token }) => {
//     userStore.handleLoginSuccess(token)
//     await initDynamicRouter()
//     router.push('/home')
//   },
//? 如果需要额外的全局错误处理逻辑，可以在这里提供, 增加下面的代码调用
// globalErrorHandler: (error) => {
//   console.error('全局错误处理:', error)
//   // 在这里添加额外的错误处理逻辑
// }
// })

//? 防抖自定义示例
// const createUser = createSubmit(userApi, {
//   debounce: 1000 // 1秒防抖  ||   debounce: false // 紧急情况立即提交
// })
