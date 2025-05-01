<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-29 23:07:28
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-01 22:42:01
 * @FilePath: \Robot_Admin\src\views\login\index.vue
 * @Description: 登录页
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="login-container">
    <h3>{{ '用户登录' }} </h3>
    <C_Form
      class="login-container-form"
      :options="OPTIONS"
    >
      <template #action="formScope">
        <NButton
          class="login-container-form-btn"
          type="primary"
          :loading="loading"
          @click="login(formScope)"
        >
          登录
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
  const dialog = useDialog()
  const notification = useNotification()
  const loadingBar = useLoadingBar()

  const login = async (formScope: any) => {
    const { form, model } = formScope
    try {
      await form.value?.validate()
      loading.value = true
      loadingBar.start()
      await userStore.getLoginInfo(model)
      await initDynamicRouter()
      notification.success({ content: '登录成功', duration: 2500 })
    } catch (e: any) {
      // 只处理登录接口异常，表单校验交给表单自身
      if (e instanceof Error) {
        dialog.error({
          title: '错误',
          content: e.message,
          positiveText: '重试',
        })
      }
    } finally {
      loading.value = false
      loadingBar.finish()
    }
  }
</script>
