<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-29 23:07:28
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-04-30 01:07:32
 * @FilePath: \Robot_Admin\src\views\login\index.vue
 * @Description: 登录页
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="login-container">
    <h3>{{ '登录标题' }} </h3>
    <C_Form
      class="login-container-form"
      :options="OPTIONS"
    >
      <template #action="scope">
        <NButton
          class="login-container-form-btn"
          type="primary"
          :loading="loading"
          @click="login(scope)"
        >
          {{ '登录按钮' }}
        </NButton>
      </template>
    </C_Form>
  </div>
</template>

<script setup lang="ts">
  import { initDynamicRouter } from '@/router/dynamicRouter'
  import { s_userStore } from '@/stores/user/index'
  import { OPTIONS } from './data.ts'
  import './index.scss'

  const loading = ref(false)
  const userStore = s_userStore()

  const message = useMessage()
  const dialog = useDialog()
  const notification = useNotification()
  const loadingBar = useLoadingBar()

  const login = (formScope: any) => {
    const { form, model } = formScope
    form.validate(async (valid: boolean) => {
      if (valid) {
        loading.value = true
        loadingBar.start()

        try {
          await userStore.getLoginInfo(model)
          await initDynamicRouter()
          notification.success({
            content: '登录成功',
            duration: 2500,
          })
        } catch (e) {
          dialog.error({
            title: '错误',
            content: (e as Error).message,
            positiveText: '重试',
          })
        } finally {
          loading.value = false
          loadingBar.finish()
        }
      } else {
        message.error('表单填写有误，请查看错误提示')
      }
    })
  }
</script>
