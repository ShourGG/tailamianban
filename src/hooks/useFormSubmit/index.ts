/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-01 22:46:09
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-06 00:19:47
 * @FilePath: \Robot_Admin\src\hooks\useFormSubmit\index.ts
 * @Description:  表单提交封装
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

interface SubmitOptions<T = any> {
  successCode?: string
  successMsg?: string
  errorMsg?: string
  onSuccess?: (data: T) => void
}

// 添加默认泛型类型
export const useFormSubmit = <
  T extends { code: string; data?: any; message?: string } = { code: string },
>() => {
  const loading = ref(false)
  const message = useMessage()
  const notification = useNotification()

  // 添加配置项解构默认值
  const createSubmit = (
    apiFn: (model: any) => Promise<T>,
    options: SubmitOptions<T> = {}
  ) => {
    return async (formScope: Record<string, any>) => {
      try {
        await formScope.form.value?.validate()
        loading.value = true
        const data = await apiFn(formScope.model)

        // 解构常用字段
        const {
          successCode = '0',
          successMsg = '操作成功',
          errorMsg = '操作失败',
        } = options

        if (data.code === successCode) {
          options.onSuccess?.(data)
          notification.success({
            content: successMsg,
            duration: 3000,
          })
          return data
        }

        // 增强错误信息组合逻辑
        const errorMessage = data.message || errorMsg
        throw new Error(errorMessage)
      } catch (error) {
        // 添加错误日志
        // console.error('[FormSubmit Error]', error)
        message.error(error instanceof Error ? error.message : '请求失败')
        throw error
      } finally {
        loading.value = false
      }
    }
  }

  return { loading, createSubmit }
}
