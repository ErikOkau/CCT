import { ref, reactive } from 'vue'

export interface User {
  id: string
  username: string
  role: 'USER' | 'ADMIN'
}

export const useAuth = () => {
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)
  const isLoading = ref(false)

  const loginForm = reactive({
    username: '',
    password: '',
    error: '',
    isLoggingIn: false
  })

  /**
   * Check current session
   */
  const checkSession = async () => {
    try {
      isLoading.value = true
      const response = await fetch('/api/auth/session')
      const data = await response.json()

      if (data.authenticated && data.user) {
        user.value = data.user
        isAuthenticated.value = true
      } else {
        user.value = null
        isAuthenticated.value = false
      }
    } catch (error) {
      console.error('Session check error:', error)
      user.value = null
      isAuthenticated.value = false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Login user
   */
  const login = async () => {
    if (!loginForm.username || !loginForm.password) {
      loginForm.error = 'Please enter both username and password'
      return
    }

    try {
      loginForm.isLoggingIn = true
      loginForm.error = ''

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: loginForm.username,
          password: loginForm.password
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        user.value = data.user
        isAuthenticated.value = true
        loginForm.username = ''
        loginForm.password = ''
        return true
      } else {
        loginForm.error = data.statusMessage || 'Login failed'
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      loginForm.error = 'Login failed. Please try again.'
      return false
    } finally {
      loginForm.isLoggingIn = false
    }
  }

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST'
      })
      
      user.value = null
      isAuthenticated.value = false
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  /**
   * Check if user is admin
   */
  const isAdmin = () => {
    return user.value?.role === 'ADMIN'
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    loginForm,
    checkSession,
    login,
    logout,
    isAdmin
  }
}
