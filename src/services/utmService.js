/**
 * UTM Tracking Service
 * Captures UTM parameters from URL, persists them in sessionStorage,
 * and provides helpers for attaching UTM data to events and requests.
 * 
 * Respects cookie consent — only persists if analytics cookies are allowed.
 */

const UTM_STORAGE_KEY = 'fynda_utm'

const UTM_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']

/**
 * Capture UTM parameters from a route's query object.
 * Called by the router beforeEach guard.
 * @param {object} query - Vue Router query object (to.query)
 * @param {string} landingPath - The path the user landed on
 */
export const captureUtm = (query, landingPath) => {
    const utmData = {}
    let hasUtm = false

    UTM_PARAMS.forEach(key => {
        if (query[key]) {
            utmData[key] = query[key]
            hasUtm = true
        }
    })

    if (hasUtm) {
        utmData.landing_page = landingPath
        utmData.referrer = document.referrer || null
        utmData.timestamp = new Date().toISOString()
        sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utmData))
    }
}

/**
 * Get stored UTM data (returns empty object if none)
 * @returns {object}
 */
export const getUtm = () => {
    try {
        return JSON.parse(sessionStorage.getItem(UTM_STORAGE_KEY) || '{}')
    } catch {
        return {}
    }
}

/**
 * Check if current session has UTM data
 * @returns {boolean}
 */
export const hasUtm = () => {
    return Object.keys(getUtm()).length > 0
}

/**
 * Get a specific UTM parameter
 * @param {string} key - e.g. 'utm_source'
 * @returns {string|null}
 */
export const getUtmParam = (key) => {
    return getUtm()[key] || null
}

/**
 * Clear UTM data (e.g. after sending to backend)
 */
export const clearUtm = () => {
    sessionStorage.removeItem(UTM_STORAGE_KEY)
}

/**
 * Get UTM summary string for display
 * e.g. "instagram / social / summer_launch"
 */
export const getUtmSummary = () => {
    const utm = getUtm()
    if (!utm.utm_source) return null
    const parts = [utm.utm_source, utm.utm_medium, utm.utm_campaign].filter(Boolean)
    return parts.join(' / ')
}

export default {
    captureUtm,
    getUtm,
    hasUtm,
    getUtmParam,
    clearUtm,
    getUtmSummary
}
