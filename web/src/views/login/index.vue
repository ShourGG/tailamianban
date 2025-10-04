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

    <!-- 3D 机器人背景 - 临时禁用以修复加载问题 -->
    <!-- <div class="spline-background">
      <Spline
        scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
      />
    </div> -->

    <div class="login-wrapper">
      <!-- Robot avatar -->
      <div class="robot-avatar">
        <img src="@/assets/images/robot-avatar-1.png" alt="Robot Avatar" />
      </div>
      
      <h3 class="login-title">{{ pageMode === 'register' ? '首次注册' : '泰拉瑞亚管理面板' }}</h3>
      <div class="version-info" style="text-align: center; color: #666; font-size: 12px; margin-bottom: 10px;">
        版本: v{{ version }}
      </div>
      
      <!-- 加载状态提示 -->
      <div v-if="checkingInit" style="text-align: center; padding: 20px;">
        <NSpin size="small" />
        <p style="margin-top: 10px; color: #999;">正在检查系统状态...</p>
      </div>
      
      <!-- 注册/登录表单 -->
      <NForm
        v-else
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
        <!-- 注册模式下显示邮箱输入 -->
        <NFormItem v-if="pageMode === 'register'" label="邮箱（可选）" path="email">
          <NInput
            v-model:value="formModel.email"
            placeholder="请输入邮箱"
            clearable
          />
        </NFormItem>
        <NFormItem>
          <NButton
            class="login-btn"
            type="primary"
            :loading="loading"
            :disabled="!captchaValid"
            @click.prevent="pageMode === 'register' ? handleRegister() : handleDirectLogin()"
          >
            {{ captchaValid ? (pageMode === 'register' ? '注册' : '登录') : '请先点击下方图标完成人机验证' }}
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
  import { loginApi, registerApi, checkInitApi, type LoginResponse } from '@/api/auth'
  import { VERSION } from '@/config/version'
  import './index.scss'
  // import Spline from './components/Spline.vue' // 临时禁用以修复加载问题
  import C_Captcha from '@/components/global/C_Captcha/index.vue'
  import Typewriter from './components/Typewriter.vue'

  // 版本号
  const version = VERSION

  // 页面模式：register（注册）或 login（登录）
  const pageMode = ref<'register' | 'login'>('login')
  const checkingInit = ref<boolean>(true)

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
  const formRef = ref<any>(null)
  const formModel = ref({
    username: '',
    password: '',
    email: ''
  })
  
  // 表单是否已准备好
  const formReady = ref(false)
  
  // 组件挂载后检查初始化状态
  onMounted(async () => {
    nextTick(() => {
      formReady.value = true
    })
    
    // 检查系统是否已初始化
    try {
      checkingInit.value = true
      const response = await checkInitApi()
      
      // 调试日志：查看完整响应
      console.log('[CheckInit] 完整响应:', response)
      console.log('[CheckInit] response.data:', response.data)
      console.log('[CheckInit] initialized值:', response.data?.initialized)
      console.log('[CheckInit] initialized类型:', typeof response.data?.initialized)
      
      // getData 返回的是 res.data，即后端的完整响应: { code, data: { initialized, message }, message }
      // 所以 response.data 是 { initialized, message }
      if (response.data) {
        const isInitialized = response.data.initialized
        pageMode.value = isInitialized ? 'login' : 'register'
        console.log('[CheckInit] 最终模式:', pageMode.value, '(initialized:', isInitialized, ')')
      } else {
        console.warn('[CheckInit] response.data 为空，默认使用登录模式')
        pageMode.value = 'login'
      }
    } catch (error) {
      console.error('[CheckInit] 检查初始化状态失败:', error)
      message.error('检查系统状态失败')
      pageMode.value = 'login'
    } finally {
      checkingInit.value = false
    }
  })
  
  const formRules = computed(() => {
    const baseRules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 30, message: '密码长度在 6 到 30 个字符', trigger: 'blur' }
      ]
    }
    
    if (pageMode.value === 'register') {
      return {
        ...baseRules,
        email: [
          { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
        ]
      }
    }
    
    return baseRules
  })

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
    // 验证码检查
    if (!captchaValid.value || !captchaData.value) {
      message.error('请先完成人机验证')
      return
    }

    // 检查表单引用是否存在
    if (!formRef.value) {
      message.error('表单初始化失败，请刷新页面重试')
      console.error('Form ref is null')
      return
    }

    // 准备登录数据 - 必须包含 form 属性！
    const { username, password } = formModel.value
    const formScope = {
      form: formRef.value,  // 这是关键！useFormSubmit 需要这个属性
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
        
        // 初始化动态路由
        await initDynamicRouter()
        
        // 等待路由完全注册后再跳转
        await router.isReady()
        
        // 使用 replace 而不是 push,避免登录页留在历史记录中
        await router.replace('/terraria/dashboard')
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

  // 注册处理函数
  const handleRegister = (): void => {
    if (!captchaValid.value || !captchaData.value) {
      message.error('请先完成人机验证')
      return
    }

    if (!formRef.value) {
      message.error('表单初始化失败，请刷新页面重试')
      return
    }

    const { username, password, email } = formModel.value
    const formScope = {
      form: formRef.value,
      model: {
        username,
        password,
        email: email || undefined,
        captcha: {
          token: captchaData.value.token,
          timestamp: captchaData.value.timestamp,
          type: 'puzzle-captcha',
        },
      }
    }
    
    register(formScope)
  }

  // 创建注册方法
  const register = createSubmit(registerApi, {
    successMsg: '注册成功',
    errorMsg: '注册失败',

    onSuccess: async (response: LoginResponse) => {
      try {
        const { data: { token } } = response
        userStore.handleLoginSuccess(token)
        
        // 初始化动态路由
        await initDynamicRouter()
        
        // 等待路由完全注册
        await router.isReady()
        
        pageMode.value = 'login'
        message.success('注册成功！正在跳转...')
        
        // 使用 replace 而不是 push,避免登录页留在历史记录中
        setTimeout(async () => {
          await router.replace('/terraria/dashboard')
        }, 1000)
      } catch (error) {
        console.error('注册成功后操作失败:', error)
        resetCaptcha()
      }
    },

    globalErrorHandler: (error: Error) => {
      console.error('注册错误:', error)
      resetCaptcha()
    },
  })
</script>
