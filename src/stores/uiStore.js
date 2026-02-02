/**
 * UI Store - Manages modals, toasts, and UI state
 */
import { reactive, readonly } from 'vue'

// State
const state = reactive({
    // Sidebar
    sidebarOpen: false,

    // Modal
    activeModal: null,
    modalData: null,

    // Toasts
    toasts: [],

    // Loading overlays
    globalLoading: false,
    loadingMessage: '',

    // Theme
    theme: localStorage.getItem('fynda_theme') || 'light'
})

let toastId = 0

// Actions
const openSidebar = () => {
    state.sidebarOpen = true
}

const closeSidebar = () => {
    state.sidebarOpen = false
}

const toggleSidebar = () => {
    state.sidebarOpen = !state.sidebarOpen
}

const openModal = (name, data = null) => {
    state.activeModal = name
    state.modalData = data
}

const closeModal = () => {
    state.activeModal = null
    state.modalData = null
}

const showToast = (message, type = 'info', duration = 3000) => {
    const id = ++toastId

    state.toasts.push({
        id,
        message,
        type, // 'info', 'success', 'warning', 'error'
        duration
    })

    // Auto-remove after duration
    if (duration > 0) {
        setTimeout(() => {
            removeToast(id)
        }, duration)
    }

    return id
}

const removeToast = (id) => {
    const index = state.toasts.findIndex(t => t.id === id)
    if (index > -1) {
        state.toasts.splice(index, 1)
    }
}

const clearToasts = () => {
    state.toasts = []
}

const setGlobalLoading = (loading, message = '') => {
    state.globalLoading = loading
    state.loadingMessage = message
}

const setTheme = (theme) => {
    state.theme = theme
    localStorage.setItem('fynda_theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
}

const toggleTheme = () => {
    setTheme(state.theme === 'light' ? 'dark' : 'light')
}

// Export store
export const useUI = () => ({
    // State (readonly)
    state: readonly(state),

    // Sidebar actions
    openSidebar,
    closeSidebar,
    toggleSidebar,

    // Modal actions
    openModal,
    closeModal,

    // Toast actions
    showToast,
    removeToast,
    clearToasts,

    // Loading actions
    setGlobalLoading,

    // Theme actions
    setTheme,
    toggleTheme
})

export default useUI
