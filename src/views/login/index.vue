<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-29 23:07:28
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-01 22:53:49
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
  import { useFormSubmit } from '@/hooks/useFormSubmit'
  import './index.scss'

  const userStore = s_userStore()
  const { loading, handleSubmit } = useFormSubmit()

  const login = (formScope: Record<string, any>) =>
    handleSubmit(
      formScope,
      async (model: { username: string; password: string }) => {
        await userStore.getLoginInfo(model)
        await initDynamicRouter()
      },
      '登录成功'
    )
</script>
