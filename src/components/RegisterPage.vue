<template>
  <div class="signup-page">
    <!-- Left Side - Sign Up Form -->
    <div class="signup-left">
      <div class="signup-content">
        <a href="/" class="signup-logo" aria-label="Go to Outfi home">
          <img src="../assets/outfi-logo.png" alt="outfi." />
        </a>
        
        <h1 class="signup-title">Create an account</h1>
        <p class="signup-subtitle">Find the best deals in one click.</p>
        
        <!-- Error Message -->
        <div v-if="error" class="error-message">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7.5" stroke="#dc2626"/><path d="M8 4v5" stroke="#dc2626" stroke-width="1.5" stroke-linecap="round"/><circle cx="8" cy="11.5" r="0.75" fill="#dc2626"/></svg>
          {{ error }}
        </div>

        <!-- Social Login Buttons -->
        <div class="social-buttons">
          <button class="social-btn google-btn" @click="loginWithGoogle" :disabled="loading" id="signup-google-btn">
            <svg class="social-icon" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
          
          <button class="social-btn apple-btn" @click="loginWithApple" :disabled="loading" id="signup-apple-btn">
            <svg class="social-icon" viewBox="0 0 24 24" fill="white">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            Continue with Apple
          </button>
        </div>
        
        <div class="divider">
          <span>or sign up with email</span>
        </div>
        
        <!-- Sign Up Form -->
        <form @submit.prevent="handleRegister" class="signup-form">
          <div class="form-row">
            <div class="form-group">
              <label for="firstName">First Name</label>
              <input 
                type="text" 
                id="firstName" 
                v-model="firstName"
                placeholder="Jane"
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
            <div class="password-wrapper">
              <input 
                :type="showPassword ? 'text' : 'password'" 
                id="password" 
                v-model="password"
                placeholder="Create a strong password"
                required
                :disabled="loading"
                @input="checkPasswordStrength"
              />
              <button type="button" class="toggle-password" @click="showPassword = !showPassword" tabindex="-1">
                <svg v-if="!showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>
            <!-- Password Strength Bar -->
            <div class="password-strength" v-if="password">
              <div class="strength-bar">
                <div class="strength-fill" :class="passwordStrengthClass" :style="{ width: passwordStrengthPercent + '%' }"></div>
              </div>
              <span class="strength-label" :class="passwordStrengthClass">{{ passwordStrengthLabel }}</span>
            </div>
          </div>
          
          <div class="form-group">
            <label for="passwordConfirm">Confirm Password</label>
            <input 
              :type="showPassword ? 'text' : 'password'" 
              id="passwordConfirm" 
              v-model="passwordConfirm"
              placeholder="Confirm your password"
              required
              :disabled="loading"
            />
            <span v-if="passwordConfirm && password !== passwordConfirm" class="mismatch-hint">Passwords don't match</span>
          </div>
          
          <button type="submit" class="submit-btn" :disabled="loading || (passwordConfirm && password !== passwordConfirm)" id="signup-submit-btn">
            <span v-if="loading" class="spinner"></span>
            {{ loading ? 'Creating account...' : 'Create Account' }}
            <svg v-if="!loading" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </form>
        
        <p class="signup-footer-text">
          Already have an account? <router-link to="/login" class="signin-link">Sign in</router-link>
        </p>
      </div>
    </div>
    
    <!-- Right Side - Lifestyle Hero Panel -->
    <div class="signup-right">
      <div class="hero-panel">
        <img 
          src="../assets/signup-hero.png" 
          alt="Fashion lifestyle" 
          class="hero-image"
        />
        
        <!-- Gradient Overlay -->
        <div class="hero-overlay"></div>
        
        <!-- Bottom Content -->
        <div class="hero-bottom">
          <h2 class="hero-headline">Style. <span>Curated.</span></h2>
          <p class="hero-copy">We find you better deals on the styles you love — automatically.</p>
        </div>
        
        <!-- Floating Deal Cards (Phia-style) -->
        
        <!-- Card 1: Bag Price Drop -->
        <div class="floating-card card-bag">
          <img src="../assets/product-leather-bag.png" alt="Leather Bag" class="deal-thumb" />
          <div class="deal-info">
            <span class="deal-name">Leather Crossbody Bag</span>
            <span class="deal-store">Vestiaire Collective</span>
          </div>
          <div class="deal-pricing">
            <span class="price-new">$129</span>
            <span class="price-discount">32% less</span>
          </div>
        </div>
        
        <!-- Card 2: Coat Sale -->
        <div class="floating-card card-coat">
          <img src="../assets/product-trench-coat.png" alt="Trench Coat" class="deal-thumb" />
          <div class="deal-info">
            <span class="deal-name">Camel Trench Coat</span>
            <span class="deal-store">The Real Real</span>
          </div>
          <div class="deal-pricing">
            <span class="price-new">$192</span>
            <span class="price-discount">40% less</span>
          </div>
        </div>
        
        <!-- Card 3: Sneakers Weekly Deal -->
        <div class="floating-card card-sneakers">
          <img src="../assets/product-white-sneakers.png" alt="Sneakers" class="deal-thumb" />
          <div class="deal-info">
            <span class="deal-name">White Leather Sneakers</span>
            <span class="deal-store">Nordstrom Rack</span>
          </div>
          <div class="deal-pricing">
            <span class="price-new">$89</span>
            <span class="price-discount">39% less</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../stores/authStore'

const router = useRouter()
const route = useRoute()
const { register } = useAuth()

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const error = ref('')
const loading = ref(false)
const showPassword = ref(false)
const passwordStrengthLevel = ref(0)

const passwordStrengthClass = ref('')
const passwordStrengthLabel = ref('')
const passwordStrengthPercent = ref(0)

const checkPasswordStrength = () => {
  const p = password.value
  let score = 0
  if (p.length >= 8) score++
  if (p.length >= 12) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++

  if (score <= 1) {
    passwordStrengthClass.value = 'weak'
    passwordStrengthLabel.value = 'Weak'
    passwordStrengthPercent.value = 20
  } else if (score <= 2) {
    passwordStrengthClass.value = 'fair'
    passwordStrengthLabel.value = 'Fair'
    passwordStrengthPercent.value = 40
  } else if (score <= 3) {
    passwordStrengthClass.value = 'good'
    passwordStrengthLabel.value = 'Good'
    passwordStrengthPercent.value = 65
  } else {
    passwordStrengthClass.value = 'strong'
    passwordStrengthLabel.value = 'Strong'
    passwordStrengthPercent.value = 100
  }
  passwordStrengthLevel.value = score
}

const handleRegister = async () => {
  error.value = ''
  
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

const loginWithGoogle = () => {
  sessionStorage.setItem('oauth_provider', 'google')
  
  const redirect = route.query.redirect
  if (redirect) {
    sessionStorage.setItem('oauth_redirect', redirect)
  }
  
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const redirectUri = `${window.location.origin}/auth/callback`
  const scope = 'openid email profile'
  
  if (!clientId) {
    alert('Google OAuth is not configured. Please add VITE_GOOGLE_CLIENT_ID to your environment.')
    return
  }
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scope,
    access_type: 'offline',
    prompt: 'consent',
    state: 'google'
  })
  
  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

const loginWithApple = () => {
  sessionStorage.setItem('oauth_provider', 'apple')
  
  const redirect = route.query.redirect
  if (redirect) {
    sessionStorage.setItem('oauth_redirect', redirect)
  }
  
  const clientId = import.meta.env.VITE_APPLE_CLIENT_ID
  const redirectUri = `${window.location.origin}/auth/callback`
  
  if (!clientId) {
    alert('Apple OAuth is not configured. Please add VITE_APPLE_CLIENT_ID to your environment.')
    return
  }
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code id_token',
    scope: 'name email',
    response_mode: 'fragment',
    state: 'apple'
  })
  
  window.location.href = `https://appleid.apple.com/auth/authorize?${params.toString()}`
}
</script>

<style scoped>
/* =============================================
   SIGN UP PAGE — PREMIUM DESIGN
   ============================================= */

.signup-page {
  display: flex;
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* ---------- LEFT PANEL ---------- */
.signup-left {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: #fff;
  animation: fadeInLeft 0.6s ease-out;
}

@keyframes fadeInLeft {
  from { opacity: 0; transform: translateX(-20px); }
  to   { opacity: 1; transform: translateX(0); }
}

.signup-content {
  max-width: 440px;
  width: 100%;
}

.signup-logo img {
  height: 46px;
  margin-bottom: 2.25rem;
  transition: transform 0.3s ease;
}

.signup-logo:hover img {
  transform: scale(1.04);
}

.signup-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 2.15rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.35rem;
  letter-spacing: -0.02em;
}

.signup-subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin-bottom: 1.75rem;
  line-height: 1.5;
}

/* Error Message */
.error-message {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  font-size: 0.88rem;
  margin-bottom: 1.25rem;
  animation: shakeX 0.4s ease;
}

@keyframes shakeX {
  0%, 100% { transform: translateX(0); }
  20%      { transform: translateX(-6px); }
  40%      { transform: translateX(6px); }
  60%      { transform: translateX(-4px); }
  80%      { transform: translateX(4px); }
}

/* ---------- SOCIAL BUTTONS ---------- */
.social-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.9rem 1.25rem;
  border-radius: 10px;
  font-family: 'Inter', sans-serif;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.social-btn::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at var(--x, 50%) var(--y, 50%), rgba(255,255,255,0.15), transparent 60%);
  opacity: 0;
  transition: opacity 0.3s;
}

.social-btn:hover::after {
  opacity: 1;
}

.social-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.google-btn {
  background: #fff;
  border: 1.5px solid #e5e7eb;
  color: #1a1a1a;
}

.google-btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #d1d5db;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}

.apple-btn {
  background: #000;
  border: 1.5px solid #000;
  color: #fff;
}

.apple-btn:hover:not(:disabled) {
  background: #1a1a1a;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transform: translateY(-1px);
}

.social-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

/* ---------- DIVIDER ---------- */
.divider {
  display: flex;
  align-items: center;
  margin: 0 0 1.5rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e5e7eb;
}

.divider span {
  padding: 0 0.85rem;
  color: #9ca3af;
  font-size: 0.8rem;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* ---------- SIGN UP FORM ---------- */
.signup-form {
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.form-group {
  margin-bottom: 0.9rem;
}

.form-group label {
  display: block;
  font-size: 0.82rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.4rem;
}

.form-group input {
  width: 100%;
  padding: 0.78rem 0.9rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.95rem;
  font-family: 'Inter', sans-serif;
  transition: all 0.2s ease;
  background: #fff;
  color: #1a1a1a;
}

.form-group input::placeholder {
  color: #c0c5ce;
}

.form-group input:focus {
  outline: none;
  border-color: #C9A96E;
  box-shadow: 0 0 0 3px rgba(201, 169, 110, 0.12);
}

.form-group input:disabled {
  background: #f9fafb;
  cursor: not-allowed;
}

/* Password Wrapper */
.password-wrapper {
  position: relative;
}

.password-wrapper input {
  padding-right: 2.75rem;
}

.toggle-password {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.toggle-password:hover {
  opacity: 0.8;
}

/* Password Strength */
.password-strength {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: 0.45rem;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.4s ease, background 0.4s ease;
}

.strength-fill.weak   { background: #ef4444; }
.strength-fill.fair    { background: #f59e0b; }
.strength-fill.good    { background: #22c55e; }
.strength-fill.strong  { background: #16a34a; }

.strength-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.strength-label.weak   { color: #ef4444; }
.strength-label.fair    { color: #f59e0b; }
.strength-label.good    { color: #22c55e; }
.strength-label.strong  { color: #16a34a; }

/* Password Mismatch */
.mismatch-hint {
  display: block;
  font-size: 0.75rem;
  color: #ef4444;
  margin-top: 0.35rem;
}

/* Submit Button */
.submit-btn {
  width: 100%;
  padding: 0.9rem 1rem;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  transform: translateY(-1px);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Footer */
.signup-footer-text {
  font-size: 0.88rem;
  color: #6b7280;
  text-align: center;
}

.signin-link {
  color: #C9A96E;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s;
}

.signin-link:hover {
  color: #b8944e;
  text-decoration: underline;
}

/* ---------- RIGHT PANEL ---------- */
.signup-right {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.hero-panel {
  position: relative;
  width: 100%;
  height: 100%;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Gradient overlay on bottom */
.hero-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 55%;
  background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.25) 50%, transparent 100%);
  pointer-events: none;
}

/* Bottom Text */
.hero-bottom {
  position: absolute;
  bottom: 2.5rem;
  left: 2.5rem;
  right: 2.5rem;
  color: #fff;
  z-index: 2;
  animation: fadeUp 0.8s 0.4s ease-out both;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}

.hero-headline {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 2.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
}

.hero-headline span {
  color: #C9A96E;
}

.hero-copy {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  max-width: 340px;
}

/* ---------- FLOATING DEAL CARDS (Phia-style) ---------- */
.floating-card {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.85rem;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  z-index: 3;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.06);
  min-width: 240px;
}

/* Product thumbnail */
.deal-thumb {
  width: 52px;
  height: 52px;
  border-radius: 10px;
  object-fit: cover;
  background: #f5f5f5;
  flex-shrink: 0;
}

/* Product info */
.deal-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.deal-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.deal-store {
  font-size: 0.72rem;
  color: #888;
  line-height: 1.3;
}

/* Price + Discount */
.deal-pricing {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
  flex-shrink: 0;
}

.price-new {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.2;
}

.price-discount {
  font-size: 0.7rem;
  font-weight: 500;
  color: #22c55e;
  line-height: 1.3;
}

/* Card Positions + Staggered entrance */
.card-bag {
  top: 8%;
  right: 5%;
  animation: floatIn 0.7s 0.5s ease-out both, floatLoop 5s 1.3s ease-in-out infinite;
}

.card-coat {
  top: 40%;
  left: 4%;
  animation: floatIn 0.7s 0.9s ease-out both, floatLoop 6s 1.7s ease-in-out infinite;
}

.card-sneakers {
  bottom: 20%;
  right: 4%;
  animation: floatIn 0.7s 1.3s ease-out both, floatLoop 5.5s 2.1s ease-in-out infinite;
}

@keyframes floatIn {
  from { opacity: 0; transform: translateY(20px) scale(0.94); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes floatLoop {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
}

/* ---------- RESPONSIVE ---------- */
@media (max-width: 1024px) {
  .hero-headline {
    font-size: 2rem;
  }
  .floating-card {
    padding: 0.5rem 0.7rem;
    min-width: 200px;
    gap: 0.5rem;
  }
  .deal-thumb {
    width: 44px;
    height: 44px;
  }
  .deal-name {
    font-size: 0.78rem;
  }
  .price-new {
    font-size: 0.85rem;
  }
}

@media (max-width: 900px) {
  .signup-page {
    flex-direction: column;
  }
  
  .signup-right {
    display: none;
  }
  
  .signup-left {
    min-height: 100vh;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .signup-left {
    padding: 1.5rem;
  }
  
  .signup-title {
    font-size: 1.75rem;
  }
  
  .social-btn {
    padding: 0.8rem 1rem;
    font-size: 0.9rem;
  }
}
</style>
