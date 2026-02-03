/**
 * Analytics Service
 * 
 * Integrates with Mixpanel, PostHog, and custom analytics.
 * All tracking respects cookie consent preferences.
 */

import { isAllowed } from './cookieService'

// Storage keys
const STORAGE_KEYS = {
    deviceId: 'fynda_device_id',
    distinctId: 'fynda_distinct_id',
    lastHeartbeat: 'fynda_last_heartbeat',
    utmParams: 'fynda_utm_params',
    sessionId: 'fynda_session_id',
}

// Generate a random ID
const generateId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
    })
}

// =============================================================================
// DEVICE & USER IDENTIFICATION
// =============================================================================

/**
 * Get or create a persistent device ID
 * This identifies the browser/device across sessions
 */
export const getDeviceId = () => {
    let deviceId = localStorage.getItem(STORAGE_KEYS.deviceId)
    if (!deviceId) {
        deviceId = generateId()
        localStorage.setItem(STORAGE_KEYS.deviceId, deviceId)
    }
    return deviceId
}

/**
 * Get or create a distinct ID (user identifier)
 * This can be updated when user logs in
 */
export const getDistinctId = () => {
    let distinctId = localStorage.getItem(STORAGE_KEYS.distinctId)
    if (!distinctId) {
        distinctId = generateId()
        localStorage.setItem(STORAGE_KEYS.distinctId, distinctId)
    }
    return distinctId
}

/**
 * Set the distinct ID (call when user logs in)
 */
export const setDistinctId = (userId) => {
    localStorage.setItem(STORAGE_KEYS.distinctId, userId)
}

/**
 * Reset the distinct ID (call when user logs out)
 */
export const resetDistinctId = () => {
    localStorage.setItem(STORAGE_KEYS.distinctId, generateId())
}

// =============================================================================
// SESSION TRACKING
// =============================================================================

/**
 * Get or create a session ID
 * Sessions expire after 30 minutes of inactivity
 */
export const getSessionId = () => {
    const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes

    const stored = sessionStorage.getItem(STORAGE_KEYS.sessionId)
    const lastHeartbeat = localStorage.getItem(STORAGE_KEYS.lastHeartbeat)

    const now = Date.now()
    const isExpired = lastHeartbeat && (now - parseInt(lastHeartbeat)) > SESSION_TIMEOUT

    if (!stored || isExpired) {
        const sessionId = generateId()
        sessionStorage.setItem(STORAGE_KEYS.sessionId, sessionId)
        return sessionId
    }

    return stored
}

/**
 * Update the last heartbeat timestamp
 * Call this on user activity to keep session alive
 */
export const updateHeartbeat = () => {
    const today = new Date().toISOString().split('T')[0]
    localStorage.setItem(STORAGE_KEYS.lastHeartbeat, Date.now().toString())

    // Also store the date for daily tracking
    const lastDate = localStorage.getItem('fynda_last_date')
    if (lastDate !== today) {
        localStorage.setItem('fynda_last_date', today)
        // Could trigger "new day" event here
    }
}

// =============================================================================
// UTM PARAMETER TRACKING (Marketing Attribution)
// =============================================================================

/**
 * Parse and store UTM parameters from URL
 * Call this on page load
 */
export const captureUtmParams = () => {
    if (!isAllowed('marketing')) {
        return null
    }

    const params = new URLSearchParams(window.location.search)

    const utmParams = {
        utm_id: params.get('utm_id'),
        utm_source: params.get('utm_source'),
        utm_medium: params.get('utm_medium'),
        utm_campaign: params.get('utm_campaign'),
        utm_term: params.get('utm_term'),
        utm_content: params.get('utm_content'),
        // Additional attribution
        gclid: params.get('gclid'),      // Google Ads
        fbclid: params.get('fbclid'),    // Facebook
        ref: params.get('ref'),          // General referral
    }

    // Only store if we have at least one param
    const hasParams = Object.values(utmParams).some(v => v !== null)

    if (hasParams) {
        localStorage.setItem(STORAGE_KEYS.utmParams, JSON.stringify({
            ...utmParams,
            captured_at: new Date().toISOString(),
            landing_page: window.location.pathname,
        }))
    }

    return utmParams
}

/**
 * Get stored UTM parameters
 */
export const getUtmParams = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.utmParams)
        return stored ? JSON.parse(stored) : null
    } catch {
        return null
    }
}

/**
 * Clear UTM parameters (e.g., after conversion)
 */
export const clearUtmParams = () => {
    localStorage.removeItem(STORAGE_KEYS.utmParams)
}

// =============================================================================
// MIXPANEL INTEGRATION
// =============================================================================

let mixpanelInitialized = false

/**
 * Initialize Mixpanel (if token provided and consent given)
 */
export const initMixpanel = (token) => {
    if (!isAllowed('analytics') || !token || mixpanelInitialized) {
        return false
    }

    // Load Mixpanel SDK dynamically
    if (typeof window !== 'undefined' && !window.mixpanel) {
        const script = document.createElement('script')
        script.src = 'https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js'
        script.async = true
        script.onload = () => {
            if (window.mixpanel) {
                window.mixpanel.init(token, {
                    debug: import.meta.env.DEV,
                    track_pageview: true,
                    persistence: 'localStorage',
                })

                // Set super properties
                window.mixpanel.register({
                    'device_id': getDeviceId(),
                    'platform': 'web',
                })

                // Identify user
                window.mixpanel.identify(getDistinctId())

                mixpanelInitialized = true
            }
        }
        document.head.appendChild(script)
    }

    return true
}

/**
 * Track event with Mixpanel
 */
export const mixpanelTrack = (eventName, properties = {}) => {
    if (!isAllowed('analytics') || !window.mixpanel) {
        return false
    }

    window.mixpanel.track(eventName, {
        ...properties,
        timestamp: new Date().toISOString(),
    })

    return true
}

// =============================================================================
// POSTHOG INTEGRATION
// =============================================================================

let posthogInitialized = false

/**
 * Initialize PostHog (if API key provided and consent given)
 */
export const initPostHog = (apiKey, apiHost = 'https://app.posthog.com') => {
    if (!isAllowed('analytics') || !apiKey || posthogInitialized) {
        return false
    }

    // Load PostHog SDK dynamically
    if (typeof window !== 'undefined' && !window.posthog) {
        const script = document.createElement('script')
        script.innerHTML = `
            !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
            posthog.init('${apiKey}', { api_host: '${apiHost}' });
        `
        document.head.appendChild(script)

        // Wait for PostHog to initialize
        setTimeout(() => {
            if (window.posthog) {
                window.posthog.identify(getDistinctId(), {
                    device_id: getDeviceId(),
                })
                posthogInitialized = true
            }
        }, 1000)
    }

    return true
}

/**
 * Track event with PostHog
 */
export const posthogCapture = (eventName, properties = {}) => {
    if (!isAllowed('analytics') || !window.posthog) {
        return false
    }

    window.posthog.capture(eventName, {
        ...properties,
        timestamp: new Date().toISOString(),
    })

    return true
}

// =============================================================================
// UNIFIED TRACKING API
// =============================================================================

/**
 * Track an event across all enabled analytics platforms
 */
export const track = (eventName, properties = {}) => {
    if (!isAllowed('analytics')) {
        return false
    }

    const enrichedProperties = {
        ...properties,
        device_id: getDeviceId(),
        session_id: getSessionId(),
        distinct_id: getDistinctId(),
        page_path: window.location.pathname,
        page_url: window.location.href,
        referrer: document.referrer,
        timestamp: new Date().toISOString(),
    }

    // Add UTM params if available
    const utm = getUtmParams()
    if (utm) {
        enrichedProperties.utm = utm
    }

    // Track with Mixpanel
    if (window.mixpanel) {
        window.mixpanel.track(eventName, enrichedProperties)
    }

    // Track with PostHog
    if (window.posthog) {
        window.posthog.capture(eventName, enrichedProperties)
    }

    // Store locally (fallback/backup)
    storeLocalEvent(eventName, enrichedProperties)

    // Update heartbeat
    updateHeartbeat()

    return true
}

/**
 * Track page view
 */
export const trackPageView = (pageName) => {
    return track('$pageview', {
        page_name: pageName,
        page_title: document.title,
    })
}

/**
 * Identify user (call on login)
 */
export const identifyUser = (userId, traits = {}) => {
    setDistinctId(userId)

    if (window.mixpanel) {
        window.mixpanel.identify(userId)
        window.mixpanel.people.set(traits)
    }

    if (window.posthog) {
        window.posthog.identify(userId, traits)
    }
}

/**
 * Reset user (call on logout)
 */
export const resetUser = () => {
    resetDistinctId()

    if (window.mixpanel) {
        window.mixpanel.reset()
    }

    if (window.posthog) {
        window.posthog.reset()
    }
}

// =============================================================================
// LOCAL EVENT STORAGE (Fallback)
// =============================================================================

const storeLocalEvent = (eventName, properties) => {
    try {
        const events = JSON.parse(localStorage.getItem('fynda_events') || '[]')
        events.push({
            event: eventName,
            properties,
            timestamp: new Date().toISOString(),
        })

        // Keep only last 500 events
        if (events.length > 500) {
            events.splice(0, events.length - 500)
        }

        localStorage.setItem('fynda_events', JSON.stringify(events))
    } catch (e) {
        console.warn('Failed to store local event:', e)
    }
}

/**
 * Get locally stored events (for batch sending to backend)
 */
export const getLocalEvents = () => {
    try {
        return JSON.parse(localStorage.getItem('fynda_events') || '[]')
    } catch {
        return []
    }
}

/**
 * Clear locally stored events (after successful batch send)
 */
export const clearLocalEvents = () => {
    localStorage.removeItem('fynda_events')
}

// =============================================================================
// INITIALIZATION
// =============================================================================

/**
 * Initialize analytics on app startup
 * Call this in your main App.vue or main.js
 */
export const initAnalytics = (config = {}) => {
    // Capture UTM params on first load
    if (isAllowed('marketing')) {
        captureUtmParams()
    }

    // Initialize session
    getSessionId()
    updateHeartbeat()

    // Initialize third-party analytics if consent given
    if (isAllowed('analytics')) {
        if (config.mixpanelToken) {
            initMixpanel(config.mixpanelToken)
        }

        if (config.posthogKey) {
            initPostHog(config.posthogKey, config.posthogHost)
        }
    }

    // Set up heartbeat interval (every 30 seconds)
    setInterval(() => {
        if (document.visibilityState === 'visible') {
            updateHeartbeat()
        }
    }, 30000)
}

export default {
    // Identification
    getDeviceId,
    getDistinctId,
    setDistinctId,
    resetDistinctId,

    // Session
    getSessionId,
    updateHeartbeat,

    // UTM
    captureUtmParams,
    getUtmParams,
    clearUtmParams,

    // Mixpanel
    initMixpanel,
    mixpanelTrack,

    // PostHog
    initPostHog,
    posthogCapture,

    // Unified API
    track,
    trackPageView,
    identifyUser,
    resetUser,

    // Local storage
    getLocalEvents,
    clearLocalEvents,

    // Init
    initAnalytics,
}
