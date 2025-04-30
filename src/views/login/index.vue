<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-30 11:06:35
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-04-30 14:58:41
 * @FilePath: \Robot_Admin\src\views\login\index.vue
 * @Description: 
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎. 
-->
<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-29 23:07:28
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-04-30 14:55:34
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

  interface LoginModel {
    username: string
    password: string
  }

  interface FormScope {
    form: {
      validate: () => Promise<void>
    }
    model: LoginModel
  }

  const login = async (formScope: FormScope) => {
    try {
      await formScope.form.validate()
      loading.value = true
      loadingBar.start()

      await userStore.getLoginInfo(formScope.model)
      await initDynamicRouter()
      notification.success({ content: '登录成功', duration: 2500 })
    } catch (e) {
      const msg = (e as Error).message
      if (msg.includes('Validation')) {
        message.error('表单校验失败，请检查输入')
      } else {
        dialog.error({ title: '错误', content: msg, positiveText: '重试' })
      }
    } finally {
      loading.value = false
      loadingBar.finish()
    }
  }
</script>
