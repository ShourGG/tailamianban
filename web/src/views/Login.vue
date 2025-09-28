<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="logo">
          <i-carbon-game-console class="logo-icon" />
          <h1>泰拉瑞亚面板</h1>
        </div>
        <p class="subtitle">Terraria Server Management Panel</p>
      </div>

      <n-form
        ref="formRef"
        :model="loginForm"
        :rules="rules"
        size="large"
        @submit.prevent="handleLogin"
      >
        <n-form-item path="username">
          <n-input
            v-model:value="loginForm.username"
            placeholder="用户名 / Username"
            :input-props="{ autocomplete: 'username' }"
          >
            <template #prefix>
              <i-carbon-user />
            </template>
          </n-input>
        </n-form-item>

        <n-form-item path="password">
          <n-input
            v-model:value="loginForm.password"
            type="password"
            placeholder="密码 / Password"
            :input-props="{ autocomplete: 'current-password' }"
            @keyup.enter="handleLogin"
          >
            <template #prefix>
              <i-carbon-password />
            </template>
          </n-input>
        </n-form-item>

        <n-form-item>
          <n-button
            type="primary"
            size="large"
            block
            :loading="loading"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登录 / Login' }}
          </n-button>
        </n-form-item>
      </n-form>

      <div class="login-footer">
        <n-alert type="info" :show-icon="false">
          <template #header>
            <i-carbon-information /> 默认账号 / Default Account
          </template>
          用户名: <strong>admin</strong> | 密码: <strong>admin123</strong>
          <br>
          <small>首次登录后请及时修改密码 / Please change password after first login</small>
        </n-alert>
      </div>
    </div>

    <div class="login-bg">
      <div class="bg-pattern"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const message = useMessage()
const authStore = useAuthStore()

const formRef = ref()
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true

    await authStore.login(loginForm.username, loginForm.password)
    
    message.success('登录成功!')
    router.push('/dashboard')
  } catch (error: any) {
    console.error('Login error:', error)
    message.error(error.message || '登录失败，请检查用户名和密码')
  } finally {
    loading.value = false
  }
}

// Auto-fill default credentials for demo
onMounted(() => {
  loginForm.username = 'admin'
  loginForm.password = 'admin123'
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 10;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.logo-icon {
  font-size: 2rem;
  color: #667eea;
}

.logo h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
}

.subtitle {
  margin: 0;
  color: #718096;
  font-size: 0.875rem;
}

.login-footer {
  margin-top: 1.5rem;
}

.login-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.bg-pattern {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  animation: float 20s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  33% {
    transform: translate(30px, -30px) rotate(120deg);
  }
  66% {
    transform: translate(-20px, 20px) rotate(240deg);
  }
}

@media (max-width: 480px) {
  .login-card {
    margin: 1rem;
    padding: 1.5rem;
  }
}
</style>