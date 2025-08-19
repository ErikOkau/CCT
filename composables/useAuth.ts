import { ref, reactive } from 'vue'
import { supabase } from '~/utils/supabase'

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
    email: '',
    password: '',
    error: '',
    isLoggingIn: false
  })

  const registerForm = reactive({
    email: '',
    password: '',
    username: '',
    error: '',
    isRegistering: false
  })

  /**
   * Check current session
   */
  const checkSession = async () => {
    try {
      isLoading.value = true
      
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (session && session.user) {
        // Get user profile from profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profile) {
          user.value = {
            id: session.user.id,
            username: profile.username || session.user.email || '',
            role: profile.role === 'admin' ? 'ADMIN' : 'USER'
          }
          isAuthenticated.value = true
        }
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
   * Login user with email/password
   */
  const login = async () => {
    if (!loginForm.email || !loginForm.password) {
      loginForm.error = 'Please enter both email and password'
      return
    }

    try {
      loginForm.isLoggingIn = true
      loginForm.error = ''
      
      console.log('🔐 Attempting login with:', loginForm.email)

      // Add timeout to prevent hanging
      const loginPromise = supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password
      })

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Login timeout')), 10000) // 10 second timeout
      })

      const { data, error } = await Promise.race([loginPromise, timeoutPromise]) as any

      console.log('🔐 Supabase response:', { data, error })

      if (error) {
        console.error('🔐 Login error:', error)
        loginForm.error = error.message
        return false
      }

      if (data.user) {
        console.log('🔐 User authenticated:', data.user.id)
        
        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()

        console.log('🔐 Profile response:', { profile, profileError })

        if (profileError) {
          console.error('🔐 Profile error:', profileError)
          // Create profile if it doesn't exist
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                username: data.user.email?.split('@')[0] || 'user',
                role: 'member'
              }
            ])
            .select()
            .single()

          if (createError) {
            console.error('🔐 Profile creation error:', createError)
            loginForm.error = 'Failed to create user profile'
            return false
          }

          user.value = {
            id: data.user.id,
            username: newProfile.username || data.user.email || '',
            role: newProfile.role === 'admin' ? 'ADMIN' : 'USER'
          }
        } else {
          user.value = {
            id: data.user.id,
            username: profile.username || data.user.email || '',
            role: profile.role === 'admin' ? 'ADMIN' : 'USER'
          }
        }
        
        isAuthenticated.value = true
        loginForm.email = ''
        loginForm.password = ''
        console.log('🔐 Login successful:', user.value)
        return true
      }
      
      console.log('🔐 No user data returned')
      return false
    } catch (error) {
      console.error('🔐 Login error:', error)
      loginForm.error = 'Login failed. Please try again.'
      return false
    } finally {
      loginForm.isLoggingIn = false
    }
  }

  /**
   * Register new user
   */
  const register = async () => {
    if (!registerForm.email || !registerForm.password || !registerForm.username) {
      registerForm.error = 'Please fill in all fields'
      return
    }

    try {
      registerForm.isRegistering = true
      registerForm.error = ''

      const { data, error } = await supabase.auth.signUp({
        email: registerForm.email,
        password: registerForm.password,
        options: {
          data: {
            username: registerForm.username
          }
        }
      })

      if (error) {
        registerForm.error = error.message
        return false
      }

      if (data.user) {
        // Profile will be created automatically by the trigger
        registerForm.email = ''
        registerForm.password = ''
        registerForm.username = ''
        return true
      }
      
      return false
    } catch (error) {
      console.error('Registration error:', error)
      registerForm.error = 'Registration failed. Please try again.'
      return false
    } finally {
      registerForm.isRegistering = false
    }
  }

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (!error) {
        user.value = null
        isAuthenticated.value = false
      }
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

  // Initialize auth state
  checkSession()

  // Test Supabase connection
  const testConnection = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1)
      console.log('🔗 Supabase connection test:', { data, error })
    } catch (err) {
      console.error('🔗 Supabase connection failed:', err)
    }
  }
  
  testConnection()

  // Listen for auth changes
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session) {
      await checkSession()
    } else if (event === 'SIGNED_OUT') {
      user.value = null
      isAuthenticated.value = false
    }
  })

  return {
    user,
    isAuthenticated,
    isLoading,
    loginForm,
    registerForm,
    checkSession,
    login,
    register,
    logout,
    isAdmin
  }
}
