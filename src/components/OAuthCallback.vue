<template>
  <div class="callback-page">
    <div class="callback-container">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <h2>Completing sign in...</h2>
        <p>Please wait while we verify your account.</p>
      </div>
      
      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <h2>Sign in failed</h2>
        <p>{{ error }}</p>
        <router-link to="/login" class="back-btn">Back to Login</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '../utils/api'
import tokenStorage from '../utils/tokenStorage'
import { identifyUser, track } from '../services/analyticsService'

const router = useRouter()
const route = useRoute()

const loading = ref(true)
const error = ref('')

onMounted(async () => {
  const code = route.query.code
  const state = route.query.state
  const errorParam = route.query.error
  
  // Check for OAuth error
  if (errorParam) {
    error.value = route.query.error_description || 'Authentication was cancelled'
    loading.value = false
    track('oauth_error', { error: errorParam })
    return
  }
  
  if (!code) {
    error.value = 'No authorization code received'
    loading.value = false
    track('oauth_error', { error: 'no_code' })
    return
  }
  
  // Detect provider from state or referrer
  let provider = state || sessionStorage.getItem('oauth_provider') || 'google'
  
  // Clean up
  sessionStorage.removeItem('oauth_provider')
  
  try {
    const response = await api.post('/api/auth/oauth/', {
      provider,
      code,
      redirect_uri: `${window.location.origin}/auth/callback`
    })
    
    // Store tokens and user using obfuscated storage
    tokenStorage.storeTokens(response.data.tokens)
    tokenStorage.storeUser(response.data.user)
    
    // Track OAuth login in analytics
    identifyUser(response.data.user.id, {
      email: response.data.user.email,
      first_name: response.data.user.first_name,
      last_name: response.data.user.last_name,
      oauth_provider: provider,
    })
    track('user_login', { 
      method: 'oauth', 
      provider,
      is_new_user: response.data.created || false
    })
    
    // Redirect to home or intended destination
    const redirectTo = sessionStorage.getItem('oauth_redirect') || '/'
    sessionStorage.removeItem('oauth_redirect')
    
    router.push(redirectTo)
    
  } catch (err) {
    console.error('OAuth callback error:', err)
    
    if (err.response?.data?.error) {
      error.value = err.response.data.error
    } else {
      error.value = 'Failed to complete sign in. Please try again.'
    }
    track('oauth_error', { provider, error: error.value })
    loading.value = false
  }
})
</script>

<style scoped>
.callback-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
}

.callback-container {
  text-align: center;
  padding: 3rem;
  max-width: 400px;
}

.loading-state h2 {
  font-size: 1.5rem;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.loading-state p {
  color: #666;
  font-size: 0.95rem;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 3px solid #e0e0e0;
  border-top-color: #1a1a1a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1.5rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state {
  background: #fff;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-state h2 {
  font-size: 1.25rem;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.error-state p {
  color: #666;
  margin-bottom: 1.5rem;
}

.back-btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: #1a1a1a;
  color: #fff;
  border-radius: 8px;
  font-weight: 500;
  transition: background 0.2s;
}

.back-btn:hover {
  background: #333;
}
</style>
