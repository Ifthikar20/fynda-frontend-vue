/**
 * Auth Store - Manages authentication state
 * Uses obfuscated localStorage for security and reactive state for UI
 */
import { reactive, computed, readonly } from 'vue'
import api from '../utils/api'
import tokenStorage from '../utils/tokenStorage'
import { identifyUser, resetUser, track } from '../services/analyticsService'

// Migrate legacy storage on module load
tokenStorage.migrateFromLegacy()

// Initial state from obfuscated storage
const getStoredAuth = () => {
    try {
        const tokens = tokenStorage.getTokens()
        const user = tokenStorage.getUser()
        return { tokens, user }
    } catch {
        return { tokens: null, user: null }
    }
}

const stored = getStoredAuth()

// Reactive state
const state = reactive({
    user: stored.user,
    tokens: stored.tokens,
    loading: false,
    error: null
})

// Computed properties
const isAuthenticated = computed(() => !!state.tokens?.access && !!state.user)
const currentUser = computed(() => state.user)

// Persist to obfuscated storage
const persistAuth = () => {
    tokenStorage.storeTokens(state.tokens)
    tokenStorage.storeUser(state.user)
}

// Actions
const login = async (email, password) => {
    state.loading = true
    state.error = null

    try {
        const response = await api.post('/api/auth/login/', { email, password })

        state.user = response.data.user
        state.tokens = response.data.tokens
        persistAuth()

        // Identify user in analytics
        identifyUser(response.data.user.id, {
            email: response.data.user.email,
            first_name: response.data.user.first_name,
            last_name: response.data.user.last_name,
        })
        track('user_login', { method: 'email' })

        return { success: true }
    } catch (error) {
        state.error = error.response?.data?.error || 'Login failed'
        return { success: false, error: state.error }
    } finally {
        state.loading = false
    }
}

const register = async (userData) => {
    state.loading = true
    state.error = null

    try {
        const response = await api.post('/api/auth/register/', userData)

        state.user = response.data.user
        state.tokens = response.data.tokens
        persistAuth()

        // Identify user in analytics
        identifyUser(response.data.user.id, {
            email: response.data.user.email,
            first_name: response.data.user.first_name,
            last_name: response.data.user.last_name,
        })
        track('user_signup', { method: 'email' })

        return { success: true }
    } catch (error) {
        const errors = error.response?.data
        state.error = typeof errors === 'object' ? Object.values(errors).flat()[0] : 'Registration failed'
        return { success: false, error: state.error, errors }
    } finally {
        state.loading = false
    }
}

const logout = async () => {
    try {
        if (state.tokens?.refresh) {
            await api.post('/api/auth/logout/', { refresh: state.tokens.refresh })
        }
    } catch {
        // Ignore logout errors
    } finally {
        track('user_logout')
        resetUser()

        state.user = null
        state.tokens = null
        state.error = null
        persistAuth()
    }
}

const refreshToken = async () => {
    if (!state.tokens?.refresh) {
        return false
    }

    try {
        const response = await api.post('/api/auth/token/refresh/', {
            refresh: state.tokens.refresh
        })

        state.tokens = {
            ...state.tokens,
            access: response.data.access
        }
        persistAuth()

        return true
    } catch {
        // Refresh failed, logout
        await logout()
        return false
    }
}

const fetchProfile = async () => {
    try {
        const response = await api.get('/api/auth/profile/')
        state.user = response.data
        persistAuth()
        return state.user
    } catch {
        return null
    }
}

const updateProfile = async (data) => {
    try {
        const response = await api.patch('/api/auth/profile/', data)
        state.user = response.data
        persistAuth()
        return { success: true, user: state.user }
    } catch (error) {
        return { success: false, error: error.response?.data }
    }
}

const clearError = () => {
    state.error = null
}

// Export store
export const useAuth = () => ({
    // State (readonly to prevent direct mutation)
    state: readonly(state),

    // Computed
    isAuthenticated,
    currentUser,

    // Actions
    login,
    register,
    logout,
    refreshToken,
    fetchProfile,
    updateProfile,
    clearError
})

// Export getters for use in api interceptor
export const getAccessToken = () => state.tokens?.access
export const getRefreshToken = () => state.tokens?.refresh
export const setTokens = (tokens) => {
    state.tokens = tokens
    persistAuth()
}
