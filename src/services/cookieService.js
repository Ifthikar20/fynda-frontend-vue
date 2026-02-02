/**
 * Cookie Consent Service
 * GDPR/CCPA compliant cookie management
 */

const COOKIE_CONSENT_KEY = 'fynda_cookie_consent'

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
}

/**
 * Enable analytics tracking
 */
const enableAnalytics = () => {
    // Track page views and user behavior
    if (typeof window !== 'undefined') {
        window.fyndaAnalyticsEnabled = true
    }
}

/**
 * Disable analytics tracking
 */
const disableAnalytics = () => {
    if (typeof window !== 'undefined') {
        window.fyndaAnalyticsEnabled = false
    }
}

/**
 * Enable marketing cookies
 */
const enableMarketing = () => {
    if (typeof window !== 'undefined') {
        window.fyndaMarketingEnabled = true
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
    getConsent,
    setConsent,
    acceptAll,
    rejectAll,
    hasConsented,
    isAllowed,
    trackEvent,
    trackPageView
}
