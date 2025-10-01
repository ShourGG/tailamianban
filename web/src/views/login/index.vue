<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-29 23:07:28
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-08-25 15:30:01
 * @FilePath: \Robot_Admin\src\views\login\index.vue
 * @Description: 登录页
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="login-container bg-[#181818]">
    <!-- 打字机组件 -->
    <Typewriter
      v-if="showTypewriter"
      text="Hey！伙计，欢迎来到泰拉瑞亚。"
      :duration="2000"
      :delay="300"
      :pause-after="1000"
      @complete="handleTypewriterComplete"
      @hidden="handleTypewriterHidden"
    />

    <!-- 3D 机器人背景 -->
    <div class="spline-background">
      <Spline
        scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
      />
    </div>

    <div class="login-wrapper">
      <!-- Robot avatar -->
      <div class="robot-avatar">
        <img src="@/assets/images/robot-avatar-1.png" alt="Robot Avatar" />
      </div>
      
      <h3 class="login-title">{{ '泰拉瑞亚管理面板' }}</h3>
      <div class="version-info" style="text-align: center; color: #666; font-size: 12px; margin-bottom: 10px;">
        版本: v{{ version }}
      </div>
      
      <!-- 临时调试：直接使用 NForm -->
      <NForm
        ref="formRef"
        class="login-form"
        :model="formModel"
        :rules="formRules"
      >
        <NFormItem label="用户名" path="username">
          <NInput
            v-model:value="formModel.username"
            placeholder="请输入用户名"
            clearable
          />
        </NFormItem>
        <NFormItem label="密码" path="password">
          <NInput
            v-model:value="formModel.password"
            type="password"
            placeholder="请输入密码"
            show-password-on="mousedown"
            clearable
          />
        </NFormItem>
        <NFormItem>
          <NButton
            class="login-btn"
            type="primary"
            :loading="loading"
            :disabled="!captchaValid"
            @click.prevent="handleDirectLogin"
          >
            {{ captchaValid ? '登录' : '请先点击下方图标完成人机验证' }}
          </NButton>
        </NFormItem>
      </NForm>

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
  import { initDynamicRouter } from '@/router/dynamicRouter'
  import { s_userStore } from '@/stores/user/index'
  import { useFormSubmit } from '@/hooks/useFormSubmit'
  import { loginApi, type LoginResponse } from '@/api/auth'
  import packageJson from '../../package.json'
  import './index.scss'
  import Spline from './components/Spline.vue'
  import C_Captcha from '@/components/global/C_Captcha/index.vue'
  import Typewriter from './components/Typewriter.vue'

  // 版本号
  const version = packageJson.version

  // 类型定义
  interface CaptchaData {
    token: string
    timestamp: number
  }

  const router = useRouter()
  const userStore = s_userStore()
  const message = useMessage()
  const { loading, createSubmit } = useFormSubmit<LoginResponse>()

  // 表单数据和验证规则
  const formRef = ref()
  const formModel = ref({
    username: 'admin',
    password: 'admin123'
  })
  
  const formRules = {
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, max: 15, message: '密码长度在 6 到 15 个字符', trigger: 'blur' }
    ]
  }

  // 打字机控制
  const showTypewriter = ref<boolean>(true)

  // 验证码相关状态
  const captchaRef = ref<InstanceType<typeof C_Captcha>>()
  const captchaValid = ref<boolean>(false)
  const captchaData = ref<CaptchaData | null>(null)

  // 欢迎信息配置
  const WELCOME_CONFIG = {
    timeSlots: [
      { hours: [6, 12], greeting: '早上好', emoji: '🌅' },
      { hours: [12, 14], greeting: '中午好', emoji: '☀️' },
      { hours: [14, 18], greeting: '下午好', emoji: '🌤️' },
      { hours: [18, 22], greeting: '晚上好', emoji: '🌆' },
      { hours: [22, 24, 0, 6], greeting: '夜深了', emoji: '🌙' },
    ],
    templates: [
      '{greeting}，{username}！欢迎回来～ {emoji}',
      '{emoji} {greeting}，{username}！开始今天的工作吧',
      '欢迎回来，{username}！{greeting} {emoji}',
      '{greeting}，{username}！准备好了吗？ {emoji}',
    ],
  }

  // 获取当前时间问候语 - 简化版
  const getCurrentGreeting = () => {
    const hour = new Date().getHours()
    const slot = WELCOME_CONFIG.timeSlots.find(({ hours }) =>
      hours.length === 2
        ? hour >= hours[0] && hour < hours[1]
        : hours.includes(hour)
    )
    return slot || WELCOME_CONFIG.timeSlots[0]
  }

  // 生成个性化欢迎信息 - 极简版，复杂度 < 5
  const generateWelcomeMessage = (data: LoginResponse) => {
    const username = data.data?.username || 'CHENY'
    const { greeting, emoji } = getCurrentGreeting()
    const template =
      WELCOME_CONFIG.templates[
        Math.floor(Math.random() * WELCOME_CONFIG.templates.length)
      ]

    return template
      .replace('{greeting}', greeting)
      .replace('{username}', username)
      .replace('{emoji}', emoji)
  }

  // 打字机完成事件
  const handleTypewriterComplete = () => {
    // 打字机动画完成后的逻辑，可以添加一些过渡效果或其他操作
  }

  // 打字机隐藏事件
  const handleTypewriterHidden = () => {
    showTypewriter.value = false
  }

  // 验证码成功处理
  const handleCaptchaSuccess = (data: CaptchaData): void => {
    captchaValid.value = true
    captchaData.value = data
    message.success('人机验证成功')
  }

  // 验证码失败处理
  const handleCaptchaFail = (): void => {
    captchaValid.value = false
    captchaData.value = null
  }

  // 验证码状态改变
  const handleCaptchaChange = (valid: boolean): void => {
    captchaValid.value = valid
    if (!valid) {
      captchaData.value = null
    }
  }

  // 重置验证码
  const resetCaptcha = (): void => {
    captchaValid.value = false
    captchaData.value = null
    captchaRef.value?.reset()
  }

  // 直接登录处理函数
  const handleDirectLogin = (): void => {
    if (!formRef.value) return
    
    // 验证码检查
    if (!captchaValid.value || !captchaData.value) {
      message.error('请先完成人机验证')
      return
    }

    formRef.value.validate((errors: any) => {
      if (errors) {
        message.error('表单校验失败,请检查输入')
        return
      }
      
      const { username, password } = formModel.value
      const formScope = {
        model: {
          username,
          password,
          captcha: {
            token: captchaData.value.token,
            timestamp: captchaData.value.timestamp,
            type: 'puzzle-captcha',
          },
        }
      }
      
      // 调用 login
      login(formScope)
    })
  }

  // 创建登录方法 - 使用官方的 meta 属性
  const login = createSubmit(loginApi, {
    successMsg: '登录成功',
    meta: generateWelcomeMessage,
    errorMsg: '账号或密码错误',

    onSuccess: async (response: LoginResponse) => {
      try {
        const {
          data: { token },
        } = response // ✅ 使用解构
        userStore.handleLoginSuccess(token)
        await initDynamicRouter()
        router.push('/home')
      } catch (error) {
        console.error('登录成功后操作失败:', error)
        resetCaptcha()
      }
    },

    globalErrorHandler: (error: Error) => {
      console.error('登录错误:', error)
      resetCaptcha()
    },
  })
</script>
