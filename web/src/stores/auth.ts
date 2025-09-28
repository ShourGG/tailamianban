import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/utils/api'

export interface User {
  id: string
  username: string
  role: string
  email?: string
}

export interface LoginResponse {
  token: string
  expires_in: number
  user: User
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string>('')
  const user = ref<User | null>(null)
  const loading = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  // Actions
  const login = async (username: string, password: string): Promise<void> => {
    loading.value = true
    try {
      const response = await api.post<LoginResponse>('/auth/login', {
        username,
        password
      })

      token.value = response.data.token
      user.value = response.data.user

      // Set token in API headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`

      // Store in localStorage for persistence
      localStorage.setItem('auth_token', token.value)
      localStorage.setItem('auth_user', JSON.stringify(user.value))
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed')
    } finally {
      loading.value = false
    }
  }

  const logout = async (): Promise<void> => {
    try {
      // Call logout API
      await api.post('/auth/logout')
    } catch (error) {
      // Ignore logout API errors
      console.warn('Logout API call failed:', error)
    } finally {
      // Clear local state regardless of API call result
      token.value = ''
      user.value = null
      
      // Remove from localStorage
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      
      // Remove from API headers
      delete api.defaults.headers.common['Authorization']
    }
  }

  const getCurrentUser = async (): Promise<void> => {
    try {
      const response = await api.get<User>('/auth/me')
      user.value = response.data
    } catch (error) {
      // If getting current user fails, clear auth state
      await logout()
      throw error
    }
  }

  const initializeAuth = (): void => {
    // Restore from localStorage
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('auth_user')

    if (storedToken && storedUser) {
      try {
        token.value = storedToken
        user.value = JSON.parse(storedUser)
        
        // Set token in API headers
        api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
        
        // Verify token is still valid
        getCurrentUser().catch(() => {
          // Token is invalid, clear auth state
          logout()
        })
      } catch (error) {
        // Invalid stored data, clear it
        logout()
      }
    }
  }

  const updateUser = (updatedUser: Partial<User>): void => {
    if (user.value) {
      user.value = { ...user.value, ...updatedUser }
      localStorage.setItem('auth_user', JSON.stringify(user.value))
    }
  }

  return {
    // State
    token: readonly(token),
    user: readonly(user),
    loading: readonly(loading),
    
    // Getters
    isAuthenticated,
    isAdmin,
    
    // Actions
    login,
    logout,
    getCurrentUser,
    initializeAuth,
    updateUser
  }
}, {
  persist: {
    key: 'terraria-panel-auth',
    storage: localStorage,
    paths: ['token', 'user']
  }
})