<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-29 23:07:28
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-07-30 14:21:28
 * @FilePath: \Robot_Admin\src\views\login\index.vue
 * @Description: 登录页
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="login-container bg-[#181818]">
    <!-- 打字机组件 -->
    <Typewriter
      v-if="showTypewriter"
      text="Hey！伙计，欢迎来到我的世界。"
      :duration="2000"
      :delay="300"
      :pause-after="1000"
      @complete="handleTypewriterComplete"
      @hidden="handleTypewriterHidden"
    />

    <!-- 原有的登录界面 -->
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
          <!-- 登录按钮 -->
          <NButton
            class="login-btn"
            type="primary"
            :loading="loading"
            :disabled="!captchaValid"
            @click.prevent="handleLogin(formScope)"
          >
            {{ captchaValid ? '登录' : '请先点击下方图标完成人机验证' }}
          </NButton>
        </template>
      </C_Form>

      <!-- 验证码组件 -->
      <C_Captcha
        ref="captchaRef"
        class="login-captcha"
        trigger-text=""
        theme="dark"
        @success="handleCaptchaSuccess"
        @fail="handleCaptchaFail"
        @change="handleCaptchaChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router'
  import { initDynamicRouter } from '@/router/dynamicRouter'
  import { s_userStore } from '@/stores/user/index'
  import { OPTIONS } from './data'
  import { useFormSubmit } from '@/hooks/useFormSubmit'
  import { loginApi, type LoginResponse } from '@/api/sys'
  import './index.scss'
  import Spline from './components/Spline.vue'
  import C_Captcha from '@/components/global/C_Captcha/index.vue'
  import Typewriter from './components/Typewriter.vue'

  const router = useRouter()
  const userStore = s_userStore()
  const message = useMessage()
  const { loading, createSubmit } = useFormSubmit<LoginResponse>()

  // 打字机控制
  const showTypewriter = ref(true)

  // 验证码相关状态
  const captchaRef = ref()
  const captchaValid = ref(false)
  const captchaData = ref<{ token: string; timestamp: number } | null>(null)

  // 打字机完成事件
  const handleTypewriterComplete = () => {
    console.log('打字机效果完成')
  }

  // 打字机隐藏事件
  const handleTypewriterHidden = () => {
    showTypewriter.value = false
    console.log('打字机组件已隐藏，登录界面显示')
  }

  // 验证码成功处理
  const handleCaptchaSuccess = (data: { token: string; timestamp: number }) => {
    captchaValid.value = true
    captchaData.value = data
    message.success('人机验证成功')
  }

  // 验证码失败处理
  const handleCaptchaFail = () => {
    captchaValid.value = false
    captchaData.value = null
  }

  // 验证码状态改变
  const handleCaptchaChange = (valid: boolean) => {
    captchaValid.value = valid
    if (!valid) {
      captchaData.value = null
    }
  }

  // 重置验证码
  const resetCaptcha = () => {
    captchaValid.value = false
    captchaData.value = null
    captchaRef.value?.reset()
  }

  // 处理登录点击
  const handleLogin = (formScope: any) => {
    // 验证码检查
    if (!captchaValid.value || !captchaData.value) {
      message.error('请先完成人机验证')
      return
    }

    // 将验证码数据添加到 formScope.model
    formScope.model = {
      ...formScope.model,
      captcha: {
        token: captchaData.value.token,
        timestamp: captchaData.value.timestamp,
        type: 'puzzle-captcha',
      },
    }

    // 调用 login
    login(formScope)
  }

  // 创建登录方法
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
        // 登录失败时重置验证码
        resetCaptcha()
      }
    },

    // 使用全局错误处理器来重置验证码
    globalErrorHandler: error => {
      console.error('登录错误:', error)
      resetCaptcha()
    },
  })
</script>
