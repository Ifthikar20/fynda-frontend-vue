<template>
  <div class="login-page">
    <!-- Left Side - Login Form -->
    <div class="login-left">
      <div class="login-content">
        <a href="/" class="login-logo">
          <img src="../assets/fynda-png-1.png" alt="Fynda" />
        </a>
        
        <h1 class="login-title">Sign in to Fynda</h1>
        <p class="login-subtitle">Find the best deals in one click.</p>
        
        <!-- Error Message -->
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="login-form">
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
              placeholder="Enter your password"
              required
              :disabled="loading"
            />
          </div>
          
          <button type="submit" class="submit-btn" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>
        
        <div class="divider">
          <span>or</span>
        </div>
        
        <!-- Social Login Buttons -->
        <div class="login-buttons">
          <button class="social-btn google-btn" @click="loginWithGoogle" :disabled="loading">
            <svg class="social-icon" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
          
          <button class="social-btn apple-btn" @click="loginWithApple" :disabled="loading">
            <svg class="social-icon" viewBox="0 0 24 24" fill="white">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            Continue with Apple
          </button>
        </div>
        
        <p class="login-footer-text">
          Don't have an account? <router-link to="/register" class="create-account-link">Create an account for free</router-link>
        </p>
      </div>
    </div>
    
    <!-- Right Side - Hero Image with Product Cards -->
    <div class="login-right">
      <div class="hero-image-container">
        <img 
          src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80" 
          alt="Fashion" 
          class="hero-image"
        />
        
        <!-- Floating Product Card -->
        <div class="floating-card main-card">
          <div class="card-header">
            <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&q=80" alt="Product" class="product-thumb" />
            <div class="card-header-info">
              <span class="product-name">Nike Air Max 90</span>
              <span class="product-price">$890 • Nike</span>
            </div>
          </div>
          
          <div class="price-comparison">
            <div class="comparison-header">
              <span class="sparkle-badge">New</span>
              <span>Lower prices found</span>
            </div>
            <div class="price-bar">
              <div class="price-indicator" style="left: 70%">
                <span class="indicator-label">$699 is high</span>
              </div>
            </div>
            <div class="price-range">
              <span>$370</span>
              <span>$640</span>
            </div>
          </div>
          
          <div class="top-results">
            <span class="results-label">Top results</span>
            
            <div class="result-item">
              <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=60&q=80" alt="" class="result-thumb" />
              <div class="result-info">
                <span class="result-name">Nike Air Max 90</span>
                <span class="result-store">StockX</span>
              </div>
              <div class="result-price">
                <span class="price">$312</span>
                <span class="discount">65% less</span>
              </div>
            </div>
            
            <div class="result-item">
              <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=60&q=80" alt="" class="result-thumb" />
              <div class="result-info">
                <span class="result-name">Air Max Sneakers</span>
                <span class="result-store">GOAT</span>
              </div>
              <div class="result-price">
                <span class="price">$350</span>
                <span class="discount">60% less</span>
              </div>
            </div>
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
const { login, state } = useAuth()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const handleLogin = async () => {
  error.value = ''
  loading.value = true
  
  const result = await login(email.value, password.value)
  
  loading.value = false
  
  if (result.success) {
    router.push('/')
  } else {
    error.value = result.error
  }
}

const loginWithGoogle = () => {
  // TODO: Implement Google OAuth
  alert('Google login coming soon!')
}

const loginWithApple = () => {
  // TODO: Implement Apple OAuth
  alert('Apple login coming soon!')
}
</script>

<style scoped>
.login-page {
  display: flex;
  min-height: 100vh;
}

/* Left Side */
.login-left {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: #fff;
}

.login-content {
  max-width: 400px;
  width: 100%;
}

.login-logo img {
  height: 50px;
  margin-bottom: 2.5rem;
}

.login-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 2.25rem;
  font-weight: 400;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.login-subtitle {
  font-size: 1rem;
  color: #666;
  margin-bottom: 2rem;
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

/* Login Form */
.login-form {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
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

/* Divider */
.divider {
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e5e7eb;
}

.divider span {
  padding: 0 1rem;
  color: #9ca3af;
  font-size: 0.85rem;
}

/* Social Buttons */
.login-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.social-icon {
  width: 20px;
  height: 20px;
}

.google-btn {
  background: #fff;
  border: 1px solid #ddd;
  color: #1a1a1a;
}

.google-btn:hover:not(:disabled) {
  background: #f8f8f8;
  border-color: #ccc;
}

.apple-btn {
  background: #000;
  border: none;
  color: #fff;
}

.apple-btn:hover:not(:disabled) {
  background: #222;
}

.login-footer-text {
  font-size: 0.9rem;
  color: #888;
  text-align: center;
}

.create-account-link {
  color: #1a1a1a;
  text-decoration: underline;
}

.create-account-link:hover {
  color: #000;
}

/* Right Side */
.login-right {
  flex: 1;
  background: linear-gradient(135deg, #f5f0eb 0%, #e8e0d8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.hero-image-container {
  position: relative;
  width: 100%;
  max-width: 600px;
  height: 80vh;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
}

/* Floating Card */
.floating-card {
  position: absolute;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.12);
  padding: 1.25rem;
  width: 280px;
}

.main-card {
  top: 10%;
  right: -20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.product-thumb {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
}

.card-header-info {
  display: flex;
  flex-direction: column;
}

.product-name {
  font-weight: 600;
  font-size: 0.95rem;
  color: #1a1a1a;
}

.product-price {
  font-size: 0.8rem;
  color: #888;
}

/* Price Comparison */
.price-comparison {
  margin-bottom: 1rem;
}

.comparison-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 0.75rem;
}

.sparkle-badge {
  background: #f0fdf4;
  color: #22c55e;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
}

.price-bar {
  height: 6px;
  background: linear-gradient(90deg, #22c55e 0%, #facc15 50%, #ef4444 100%);
  border-radius: 3px;
  position: relative;
  margin-bottom: 0.35rem;
}

.price-indicator {
  position: absolute;
  top: -20px;
}

.indicator-label {
  background: #fef2f2;
  color: #ef4444;
  font-size: 0.7rem;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
}

.price-range {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #888;
}

/* Top Results */
.top-results {
  border-top: 1px solid #f0f0f0;
  padding-top: 0.75rem;
}

.results-label {
  display: block;
  font-size: 0.75rem;
  color: #888;
  margin-bottom: 0.75rem;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f8f8f8;
}

.result-item:last-child {
  border-bottom: none;
}

.result-thumb {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  object-fit: cover;
}

.result-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.result-name {
  font-size: 0.85rem;
  font-weight: 500;
  color: #1a1a1a;
}

.result-store {
  font-size: 0.75rem;
  color: #888;
}

.result-price {
  text-align: right;
}

.result-price .price {
  display: block;
  font-weight: 600;
  font-size: 0.9rem;
  color: #1a1a1a;
}

.result-price .discount {
  font-size: 0.7rem;
  color: #22c55e;
}

/* Responsive */
@media (max-width: 900px) {
  .login-page {
    flex-direction: column;
  }
  
  .login-right {
    display: none;
  }
  
  .login-left {
    min-height: 100vh;
  }
}
</style>
