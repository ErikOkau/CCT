<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useRouter } from 'vue-router'

const router = useRouter()

const {
  user,
  isAuthenticated,
  isLoading,
  loginForm,
  checkSession,
  login,
  isAdmin
} = useAuth()

// Check session on page load
onMounted(async () => {
  await checkSession()
  
  // If already authenticated, redirect to home
  if (isAuthenticated.value) {
    router.push('/')
  }
})

const handleLogin = async () => {
  const success = await login()
  if (success) {
    router.push('/')
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="guild-badge">
            <div class="guild-logo">
              <img src="/img/cctLogo.png" alt="CCT Logo" class="guild-logo-img">
            </div>
            <div class="guild-name">Chaos Control Team</div>
          </div>
          <h1 class="login-title">
            <span class="gradient-text">Admin</span> Login
          </h1>
          <p class="login-subtitle">Access the Guild Battle Analyzer</p>
        </div>
        
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="username">Username:</label>
            <input 
              id="username"
              v-model="loginForm.username" 
              type="text" 
              placeholder="Enter username"
              :disabled="loginForm.isLoggingIn"
              class="form-input"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="password">Password:</label>
            <input 
              id="password"
              v-model="loginForm.password" 
              type="password" 
              placeholder="Enter password"
              :disabled="loginForm.isLoggingIn"
              class="form-input"
              required
            >
          </div>
          
          <button 
            type="submit" 
            :disabled="loginForm.isLoggingIn || !loginForm.username || !loginForm.password"
            class="login-button"
          >
            {{ loginForm.isLoggingIn ? '🔐 Logging in...' : '🔐 Login' }}
          </button>
        </form>
        
        <div v-if="loginForm.error" class="error-message">
          ❌ {{ loginForm.error }}
        </div>
        
        <div class="login-footer">
          <p class="register-link">
            Don't have an account? 
            <NuxtLink to="/registration" class="register-link-text">Register here</NuxtLink>
          </p>
          <NuxtLink to="/" class="back-link">← Back to Home</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
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

.login-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.03)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.03)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.02)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.02)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.02)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  pointer-events: none;
}

.login-container {
  width: 100%;
  max-width: 450px;
}

.login-card {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 3rem;
  border: 2px solid rgba(255, 107, 0, 0.3);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), 0 0 40px rgba(255, 107, 0, 0.1);
  position: relative;
  z-index: 1;
}

.login-header {
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

.login-title {
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

.login-subtitle {
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
}

.login-form {
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

.login-button {
  background: linear-gradient(45deg, #ff6b00, #ffd700);
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
  box-shadow: 0 4px 15px rgba(255, 107, 0, 0.3);
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 0, 0.4);
  background: linear-gradient(45deg, #ffd700, #ff6b00);
}

.login-button:disabled {
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

.login-footer {
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 1.5rem;
}

.register-link {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.register-link-text {
  color: #4caf50;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.register-link-text:hover {
  color: #45a049;
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
  .login-card {
    padding: 2rem;
  }
  
  .login-title {
    font-size: 1.5rem;
  }
}
</style>
