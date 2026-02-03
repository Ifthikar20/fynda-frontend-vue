/**
 * API Client - Axios instance with JWT + CSRF protection
 */
import axios from 'axios'
import { getAccessToken, getRefreshToken, setTokens } from '../stores/authStore'
import tokenStorage from './tokenStorage'

// Create axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true // Required for CSRF cookies
})

// Track if we're currently refreshing
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(token)
        }
    })
    failedQueue = []
}

/**
 * Get CSRF token from cookie
 */
const getCsrfToken = () => {
    const name = 'csrftoken'
    const cookies = document.cookie.split(';')
    for (let cookie of cookies) {
        const [key, value] = cookie.trim().split('=')
        if (key === name) {
            return value
        }
    }
    return null
}

/**
 * Fetch CSRF token from backend
 */
export const fetchCsrfToken = async () => {
    try {
        await axios.get(`${api.defaults.baseURL}/api/csrf/`, {
            withCredentials: true
        })
        return getCsrfToken()
    } catch (error) {
        console.warn('Failed to fetch CSRF token:', error)
        return null
    }
}

// Request interceptor - Add auth token + CSRF
api.interceptors.request.use(
    (config) => {
        // Add JWT token
        const token = getAccessToken()
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        // Add CSRF token for mutating requests
        const method = config.method?.toLowerCase()
        if (['post', 'put', 'patch', 'delete'].includes(method)) {
            const csrfToken = getCsrfToken()
            if (csrfToken) {
                config.headers['X-CSRFToken'] = csrfToken
            }
        }

        return config
    },
    (error) => Promise.reject(error)
)

// Response interceptor - Handle 401 and refresh token
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        // Handle CSRF token errors (403)
        if (error.response?.status === 403 &&
            error.response?.data?.detail?.includes('CSRF')) {
            // Refresh CSRF token and retry
            await fetchCsrfToken()
            return api(originalRequest)
        }

        // If 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {

            // Don't retry login/register/refresh endpoints
            if (originalRequest.url?.includes('/auth/login') ||
                originalRequest.url?.includes('/auth/register') ||
                originalRequest.url?.includes('/auth/token/refresh')) {
                return Promise.reject(error)
            }

            if (isRefreshing) {
                // Wait for the refresh to complete
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`
                    return api(originalRequest)
                }).catch(err => Promise.reject(err))
            }

            originalRequest._retry = true
            isRefreshing = true

            const refreshToken = getRefreshToken()

            if (!refreshToken) {
                isRefreshing = false
                // Redirect to login - clear obfuscated auth data
                tokenStorage.clearAll()
                window.location.href = '/login'
                return Promise.reject(error)
            }

            try {
                const response = await axios.post(
                    `${api.defaults.baseURL}/api/auth/token/refresh/`,
                    { refresh: refreshToken }
                )

                const newTokens = {
                    access: response.data.access,
                    refresh: response.data.refresh || refreshToken
                }

                setTokens(newTokens)

                processQueue(null, newTokens.access)

                originalRequest.headers.Authorization = `Bearer ${newTokens.access}`
                return api(originalRequest)

            } catch (refreshError) {
                processQueue(refreshError, null)

                // Clear obfuscated auth and redirect to login
                tokenStorage.clearAll()
                window.location.href = '/login'

                return Promise.reject(refreshError)
            } finally {
                isRefreshing = false
            }
        }

        return Promise.reject(error)
    }
)

export default api
