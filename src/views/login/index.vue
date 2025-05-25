<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-29 23:07:28
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-25 13:15:34
 * @FilePath: \Robot_Admin\src\views\login\index.vue
 * @Description: 登录页
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="login-container bg-[#181818]">
    <div class="spline-background">
      <Spline
        scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
      />
    </div>
    <div class="login-wrapper">
      <h3 class="login-title">{{ 'Robot Admin 管理系统' }}</h3>
      <C_Form
        class="login-form"
        :options="OPTIONS"
      >
        <template #action="formScope">
          <NButton
            class="login-btn"
            type="primary"
            :loading="loading"
            @click.prevent="login(formScope)"
          >
            登录
          </NButton>
        </template>
      </C_Form>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router'
  import { initDynamicRouter } from '@/router/dynamicRouter'
  import { s_userStore } from '@/stores/user/index'
  import { OPTIONS } from './data.ts'
  import { useFormSubmit } from '@/hooks/useFormSubmit'
  import { loginApi, type LoginResponse } from '@/api/sys'
  import './index.scss'
  import Spline from './components/Spline.vue'

  const router = useRouter()
  const userStore = s_userStore()
  const { loading, createSubmit } = useFormSubmit<LoginResponse>()

  const login = createSubmit(loginApi, {
    successMsg: '登录成功',
    errorMsg: '账号或密码错误',
    onSuccess: async ({ token }) => {
      try {
        userStore.handleLoginSuccess(token)
        await initDynamicRouter()
        router.push('/home')
      } catch (error) {
        console.error('登录成功后操作失败:', error)
      }
    },
  })
</script>
