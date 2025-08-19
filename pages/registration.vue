<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useRouter } from 'vue-router'

const router = useRouter()

const {
  isAuthenticated,
  checkSession,
  registerForm,
  register
} = useAuth()

// Check session on page load
onMounted(async () => {
  await checkSession()
  
  // If already authenticated, redirect to home
  if (isAuthenticated.value) {
    router.push('/')
  }
})

const handleRegistration = async () => {
  // Reset messages
  registerForm.error = ''
  
  // Validation
  if (!registerForm.email || !registerForm.password || !registerForm.username) {
    registerForm.error = 'Please fill in all fields'
    return
  }
  
  if (registerForm.password.length < 6) {
    registerForm.error = 'Password must be at least 6 characters long'
    return
  }
  
  if (registerForm.username.length < 3) {
    registerForm.error = 'Username must be at least 3 characters long'
    return
  }
  
  try {
    registerForm.isRegistering = true
    
    const success = await register()
    
    if (success) {
      // Show success message
      alert('Registration successful! Please check your email to confirm your account.')
      router.push('/login')
    }
  } catch (error) {
    console.error('Registration error:', error)
    registerForm.error = 'Registration failed. Please try again.'
  } finally {
    registerForm.isRegistering = false
  }
}
</script>

<template>
  <div class="registration-page">
    <div class="registration-container">
      <div class="registration-card">
        <div class="registration-header">
          <div class="guild-badge">
            <div class="guild-logo">
              <img src="/img/cctLogo.png" alt="CCT Logo" class="guild-logo-img">
            </div>
            <div class="guild-name">Chaos Control Team</div>
          </div>
          <h1 class="registration-title">
            <span class="gradient-text">Create account</span>
          </h1>
        </div>
        
        <form @submit.prevent="handleRegistration" class="registration-form">
          <div class="form-group">
            <label for="username">Username:</label>
            <input 
              id="username"
              v-model="registerForm.username" 
              type="text" 
              placeholder="Enter username (min 3 characters)"
              :disabled="registerForm.isRegistering"
              class="form-input"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="email">Email:</label>
            <input 
              id="email"
              v-model="registerForm.email" 
              type="email" 
              placeholder="Enter email address"
              :disabled="registerForm.isRegistering"
              class="form-input"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="password">Password:</label>
            <input 
              id="password"
              v-model="registerForm.password" 
              type="password" 
              placeholder="Enter password (min 6 characters)"
              :disabled="registerForm.isRegistering"
              class="form-input"
              required
            >
          </div>
          
          <button 
            type="submit" 
            :disabled="registerForm.isRegistering || !registerForm.username || !registerForm.password || !registerForm.email"
            class="registration-button"
          >
            {{ registerForm.isRegistering ? '📝 Creating Account...' : '📝 Create Account' }}
          </button>
        </form>
        
        <div v-if="registerForm.error" class="error-message">
          ❌ {{ registerForm.error }}
        </div>
        
        <div class="registration-footer">
          <p class="login-link">
            Already have an account? 
            <NuxtLink to="/login" class="login-link-text">Login here</NuxtLink>
          </p>
          <NuxtLink to="/" class="back-link">← Back to Home</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.registration-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding: 2rem;
  position: relative;
  overflow: hidden;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.registration-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.03)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.03)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.02)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.02)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.02)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  pointer-events: none;
}

.registration-container {
  width: 100%;
  max-width: 500px;
}

.registration-card {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 3rem;
  border: 2px solid rgba(255, 107, 0, 0.3);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), 0 0 40px rgba(255, 107, 0, 0.1);
  position: relative;
  z-index: 1;
}

.registration-header {
  text-align: center;
  margin-bottom: 2rem;
}

.guild-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  background: rgba(255, 255, 255, 0.1);
  padding: 15px 25px;
  border-radius: 25px;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 30px;
}

.guild-logo {
  display: flex;
  align-items: center;
  justify-content: center;
}

.guild-logo-img {
  width: 60px;
  height: 60px;
  object-fit: contain;
  border-radius: 50%;
  background: linear-gradient(45deg, #ff6b00, #ffd700);
  padding: 5px;
  box-shadow: 0 4px 15px rgba(255, 107, 0, 0.3);
}

.guild-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffd700;
}

.registration-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  color: white;
  line-height: 1.2;
}

.gradient-text {
  background: linear-gradient(45deg, #ff6b00, #ffd700, #00ccff, #ff6b00);
  background-size: 300% 300%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradient 3s ease infinite;
}

@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.registration-subtitle {
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
}

.registration-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: white;
  font-weight: 500;
  font-size: 0.9rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.form-input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.15);
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.registration-button {
  background: linear-gradient(45deg, #ff6b00, #ffd700);
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 107, 0, 0.3);
  margin-top: 1rem;
}

.registration-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.registration-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  border: 1px solid rgba(244, 67, 54, 0.3);
  text-align: center;
}

.success-message {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  border: 1px solid rgba(76, 175, 80, 0.3);
  text-align: center;
}

.registration-footer {
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 1.5rem;
}

.login-link {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.login-link-text {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.login-link-text:hover {
  color: #764ba2;
}

.back-link {
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.back-link:hover {
  color: white;
}

@media (max-width: 480px) {
  .registration-card {
    padding: 2rem;
  }
  
  .registration-title {
    font-size: 1.5rem;
  }
}
</style>
