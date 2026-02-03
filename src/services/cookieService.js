/**
 * Cookie Consent Service
 * GDPR/CCPA compliant cookie management with functional cookie support
 */

const COOKIE_CONSENT_KEY = 'fynda_cookie_consent'
const FUNCTIONAL_PREFIX = 'fynda_func_'

// Supported functional cookies
const FUNCTIONAL_COOKIES = {
    theme: 'theme',                    // User's theme preference (dark/light)
    language: 'language',              // Preferred language
    currency: 'currency',              // Preferred currency display
    recent_searches: 'recent_searches', // Recent search queries
    sidebar_collapsed: 'sidebar',       // UI preferences
    view_mode: 'view_mode',            // Grid/list view preference
}

// Default consent state
const defaultConsent = {
    essential: true,      // Always true, required for site function
    functional: false,    // Preferences, theme, language
    analytics: false,     // Usage tracking
    marketing: false,     // Ad personalization
    timestamp: null,
    version: '1.0'
}

/**
 * Get current consent preferences
 */
export const getConsent = () => {
    try {
        const stored = localStorage.getItem(COOKIE_CONSENT_KEY)
        if (stored) {
            return JSON.parse(stored)
        }
    } catch (e) {
        console.warn('Error reading cookie consent:', e)
    }
    return null
}

/**
 * Set consent preferences
 */
export const setConsent = (preferences) => {
    const consent = {
        essential: true, // Always true
        functional: preferences.functional ?? false,
        analytics: preferences.analytics ?? false,
        marketing: preferences.marketing ?? false,
        timestamp: new Date().toISOString(),
        version: '1.0'
    }

    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent))

    // Apply consent decisions
    applyConsent(consent)

    return consent
}

/**
 * Accept all cookies
 */
export const acceptAll = () => {
    return setConsent({
        functional: true,
        analytics: true,
        marketing: true
    })
}

/**
 * Reject all non-essential cookies
 */
export const rejectAll = () => {
    // Clear all functional cookies when rejected
    clearFunctionalCookies()

    return setConsent({
        functional: false,
        analytics: false,
        marketing: false
    })
}

/**
 * Check if user has made consent choice
 */
export const hasConsented = () => {
    return getConsent() !== null
}

/**
 * Check if specific category is allowed
 */
export const isAllowed = (category) => {
    const consent = getConsent()
    if (!consent) return category === 'essential'
    return consent[category] === true
}

// =============================================================================
// FUNCTIONAL COOKIES - User Preferences (require functional consent)
// =============================================================================

/**
 * Set a functional cookie (requires functional consent)
 * @param {string} key - Cookie key from FUNCTIONAL_COOKIES
 * @param {any} value - Value to store (will be JSON stringified)
 * @returns {boolean} - Whether the cookie was set
 */
export const setFunctionalCookie = (key, value) => {
    if (!isAllowed('functional')) {
        console.debug(`Functional cookies not allowed. Cannot set ${key}`)
        return false
    }

    try {
        const storageKey = FUNCTIONAL_PREFIX + key
        localStorage.setItem(storageKey, JSON.stringify(value))
        return true
    } catch (e) {
        console.warn(`Error setting functional cookie ${key}:`, e)
        return false
    }
}

/**
 * Get a functional cookie value
 * @param {string} key - Cookie key from FUNCTIONAL_COOKIES
 * @param {any} defaultValue - Default value if not found
 * @returns {any} - Stored value or default
 */
export const getFunctionalCookie = (key, defaultValue = null) => {
    try {
        const storageKey = FUNCTIONAL_PREFIX + key
        const stored = localStorage.getItem(storageKey)
        if (stored !== null) {
            return JSON.parse(stored)
        }
    } catch (e) {
        console.warn(`Error reading functional cookie ${key}:`, e)
    }
    return defaultValue
}

/**
 * Remove a functional cookie
 */
export const removeFunctionalCookie = (key) => {
    localStorage.removeItem(FUNCTIONAL_PREFIX + key)
}

/**
 * Clear all functional cookies
 */
export const clearFunctionalCookies = () => {
    Object.values(FUNCTIONAL_COOKIES).forEach(key => {
        localStorage.removeItem(FUNCTIONAL_PREFIX + key)
    })
}

// =============================================================================
// THEME PREFERENCE HELPERS
// =============================================================================

/**
 * Get user's theme preference
 * @returns {'dark' | 'light' | null}
 */
export const getThemePreference = () => {
    return getFunctionalCookie(FUNCTIONAL_COOKIES.theme, null)
}

/**
 * Set user's theme preference
 * @param {'dark' | 'light'} theme
 */
export const setThemePreference = (theme) => {
    return setFunctionalCookie(FUNCTIONAL_COOKIES.theme, theme)
}

// =============================================================================
// RECENT SEARCHES HELPERS
// =============================================================================

/**
 * Get recent searches
 * @param {number} limit - Maximum number of searches to return
 * @returns {string[]}
 */
export const getRecentSearches = (limit = 10) => {
    const searches = getFunctionalCookie(FUNCTIONAL_COOKIES.recent_searches, [])
    return searches.slice(0, limit)
}

/**
 * Add a search to recent searches
 * @param {string} query - Search query to add
 */
export const addRecentSearch = (query) => {
    if (!query?.trim()) return false

    const searches = getRecentSearches(50)
    const normalized = query.trim().toLowerCase()

    // Remove duplicate if exists
    const filtered = searches.filter(s => s.toLowerCase() !== normalized)

    // Add to front
    filtered.unshift(query.trim())

    // Keep only last 50
    return setFunctionalCookie(FUNCTIONAL_COOKIES.recent_searches, filtered.slice(0, 50))
}

/**
 * Clear recent searches
 */
export const clearRecentSearches = () => {
    return setFunctionalCookie(FUNCTIONAL_COOKIES.recent_searches, [])
}

// =============================================================================
// ANALYTICS & MARKETING
// =============================================================================

/**
 * Apply consent decisions (enable/disable tracking)
 */
const applyConsent = (consent) => {
    // Analytics tracking
    if (consent.analytics) {
        enableAnalytics()
    } else {
        disableAnalytics()
    }

    // Marketing/advertising
    if (consent.marketing) {
        enableMarketing()
    } else {
        disableMarketing()
    }

    // Functional - no action needed, just check isAllowed when storing
}

/**
 * Enable analytics tracking
 */
const enableAnalytics = () => {
    if (typeof window !== 'undefined') {
        window.fyndaAnalyticsEnabled = true
        // Future: Initialize Google Analytics, Mixpanel, etc.
    }
}

/**
 * Disable analytics tracking
 */
const disableAnalytics = () => {
    if (typeof window !== 'undefined') {
        window.fyndaAnalyticsEnabled = false
        // Clear analytics data
        localStorage.removeItem('fynda_analytics')
    }
}

/**
 * Enable marketing cookies
 */
const enableMarketing = () => {
    if (typeof window !== 'undefined') {
        window.fyndaMarketingEnabled = true
        // Future: Enable affiliate tracking, ad retargeting, etc.
    }
}

/**
 * Disable marketing cookies
 */
const disableMarketing = () => {
    if (typeof window !== 'undefined') {
        window.fyndaMarketingEnabled = false
    }
}

/**
 * Track user behavior (only if analytics allowed)
 */
export const trackEvent = (eventName, eventData = {}) => {
    if (!isAllowed('analytics')) return

    const event = {
        name: eventName,
        data: eventData,
        timestamp: new Date().toISOString(),
        page: window.location.pathname
    }

    // Store events locally (could be sent to backend)
    try {
        const events = JSON.parse(localStorage.getItem('fynda_analytics') || '[]')
        events.push(event)
        // Keep only last 100 events
        if (events.length > 100) events.shift()
        localStorage.setItem('fynda_analytics', JSON.stringify(events))
    } catch (e) {
        console.warn('Analytics tracking error:', e)
    }
}

/**
 * Track page view
 */
export const trackPageView = (pageName) => {
    trackEvent('page_view', { page: pageName })
}

// Initialize on load
if (typeof window !== 'undefined') {
    const consent = getConsent()
    if (consent) {
        applyConsent(consent)
    }
}

export default {
    // Consent management
    getConsent,
    setConsent,
    acceptAll,
    rejectAll,
    hasConsented,
    isAllowed,

    // Functional cookies
    setFunctionalCookie,
    getFunctionalCookie,
    removeFunctionalCookie,
    clearFunctionalCookies,
    FUNCTIONAL_COOKIES,

    // Theme helpers
    getThemePreference,
    setThemePreference,

    // Search helpers
    getRecentSearches,
    addRecentSearch,
    clearRecentSearches,

    // Analytics
    trackEvent,
    trackPageView
}

