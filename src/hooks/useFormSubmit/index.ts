/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-01 22:46:09
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-01 22:56:27
 * @FilePath: \Robot_Admin\src\hooks\useFormSubmit\index.ts
 * @Description:  表单提交封装
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

/**
 * @description: 表单提交封装
 * @return {*} {loading, handleSubmit} loading: 加载状态 handleSubmit: 表单提交处理函数
 */
export function useFormSubmit() {
  const loading = ref(false)
  const message = useMessage()
  const notification = useNotification()
  const loadingBar = useLoadingBar()

  /**
   * 通用表单提交处理
   * @param formScope C_Form #action 作用域对象
   * @param submitFn  业务提交逻辑 (model) => Promise<any>
   * @param successMsg 成功提示
   */
  const handleSubmit = async (
    formScope: any,
    submitFn: (model: any) => Promise<any>,
    successMsg = '提交成功'
  ) => {
    const { form, model } = formScope
    try {
      await form.value?.validate()
      loading.value = true
      loadingBar.start()
      await submitFn(model)
      notification.success({
        content: successMsg,
        duration: 2500,
      })
    } catch (e: any) {
      if (e instanceof Error) {
        message.error(e.message)
      }
    } finally {
      loading.value = false
      loadingBar.finish()
    }
  }

  return { loading, handleSubmit }
}

// TAG：页面使用例子参考如下

// import { useFormSubmit } from '@/utils/useFormSubmit'
// const { loading, handleSubmit } = useFormSubmit()
// const login = (formScope: any) =>
//   handleSubmit(
//     formScope,
//     async (model) => {
//       await userStore.getLoginInfo(model)
//       await initDynamicRouter()
//     },
//     '登录成功'
//   )
