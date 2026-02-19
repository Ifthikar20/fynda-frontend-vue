<template>
  <div class="register-page">
    <!-- Left Side - Register Form -->
    <div class="register-left">
      <div class="register-content">
        <a href="/" class="register-logo">
          <img src="../assets/outfi-logo.png" alt="outfi." />
        </a>
        
        <h1 class="register-title">Create your account</h1>
        <p class="register-subtitle">Start discovering the best deals today.</p>
        
        <!-- Error Message -->
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <!-- Register Form -->
        <form @submit.prevent="handleRegister" class="register-form">
          <div class="form-row">
            <div class="form-group">
              <label for="firstName">First Name</label>
              <input 
                type="text" 
                id="firstName" 
                v-model="firstName"
                placeholder="John"
                required
                :disabled="loading"
              />
            </div>
            
            <div class="form-group">
              <label for="lastName">Last Name</label>
              <input 
                type="text" 
                id="lastName" 
                v-model="lastName"
                placeholder="Doe"
                required
                :disabled="loading"
              />
            </div>
          </div>
          
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              v-model="email"
              placeholder="you@example.com"
              required
              :disabled="loading"
            />
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              v-model="password"
              placeholder="Create a strong password"
              required
              :disabled="loading"
            />
            <span class="password-hint">At least 8 characters</span>
          </div>
          
          <div class="form-group">
            <label for="passwordConfirm">Confirm Password</label>
            <input 
              type="password" 
              id="passwordConfirm" 
              v-model="passwordConfirm"
              placeholder="Confirm your password"
              required
              :disabled="loading"
            />
          </div>
          
          <button type="submit" class="submit-btn" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            {{ loading ? 'Creating account...' : 'Create Account' }}
          </button>
        </form>
        
        <p class="register-footer-text">
          Already have an account? <router-link to="/login" class="login-link">Sign in</router-link>
        </p>
      </div>
    </div>
    
    <!-- Right Side - Hero Image -->
    <div class="register-right">
      <div class="hero-content">
        <h2 class="hero-title">Find Amazing Deals</h2>
        <p class="hero-subtitle">Join thousands of savvy shoppers saving money every day</p>
        
        <div class="features-list">
          <div class="feature-item">
            <span class="feature-icon">🔍</span>
            <span>Search millions of products</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">💰</span>
            <span>Compare prices instantly</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🔔</span>
            <span>Get notified on price drops</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">❤️</span>
            <span>Save your favorite items</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../stores/authStore'

const router = useRouter()
const { register } = useAuth()

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const error = ref('')
const loading = ref(false)

const handleRegister = async () => {
  error.value = ''
  
  // Client-side validation
  if (password.value !== passwordConfirm.value) {
    error.value = 'Passwords do not match'
    return
  }
  
  if (password.value.length < 8) {
    error.value = 'Password must be at least 8 characters'
    return
  }
  
  loading.value = true
  
  const result = await register({
    email: email.value,
    password: password.value,
    password_confirm: passwordConfirm.value,
    first_name: firstName.value,
    last_name: lastName.value
  })
  
  loading.value = false
  
  if (result.success) {
    router.push('/')
  } else {
    error.value = result.error
  }
}
</script>

<style scoped>
.register-page {
  display: flex;
  min-height: 100vh;
}

/* Left Side */
.register-left {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: #fff;
}

.register-content {
  max-width: 440px;
  width: 100%;
}

.register-logo img {
  height: 50px;
  margin-bottom: 2rem;
}

.register-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 2rem;
  font-weight: 400;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.register-subtitle {
  font-size: 1rem;
  color: #666;
  margin-bottom: 1.5rem;
}

/* Error Message */
.error-message {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

/* Register Form */
.register-form {
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-group input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #000;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
}

.form-group input:disabled {
  background: #f9fafb;
  cursor: not-allowed;
}

.password-hint {
  display: block;
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.35rem;
}

.submit-btn {
  width: 100%;
  padding: 1rem;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.submit-btn:hover:not(:disabled) {
  background: #1a1a1a;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.register-footer-text {
  font-size: 0.9rem;
  color: #888;
  text-align: center;
}

.login-link {
  color: #1a1a1a;
  text-decoration: underline;
}

.login-link:hover {
  color: #000;
}

/* Right Side */
.register-right {
  flex: 1;
  background: linear-gradient(135deg, #1a1a1a 0%, #333 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #fff;
}

.hero-content {
  max-width: 400px;
}

.hero-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 2.5rem;
  font-weight: 400;
  margin-bottom: 1rem;
}

.hero-subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 2.5rem;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1rem;
}

.feature-icon {
  font-size: 1.5rem;
}

/* Responsive */
@media (max-width: 900px) {
  .register-page {
    flex-direction: column;
  }
  
  .register-right {
    display: none;
  }
  
  .register-left {
    min-height: 100vh;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
