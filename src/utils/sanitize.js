/**
 * XSS Protection Utilities
 * 
 * Sanitization functions to prevent cross-site scripting attacks.
 */

/**
 * Escape HTML entities to prevent XSS
 * @param {string} str - Raw string to escape
 * @returns {string} - Escaped string safe for HTML
 */
export const escapeHtml = (str) => {
    if (!str || typeof str !== 'string') return ''

    const htmlEntities = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
    }

    return str.replace(/[&<>"'`=/]/g, char => htmlEntities[char])
}

/**
 * Strip HTML tags from string
 * @param {string} str - String potentially containing HTML
 * @returns {string} - Plain text
 */
export const stripHtml = (str) => {
    if (!str || typeof str !== 'string') return ''
    return str.replace(/<[^>]*>/g, '')
}

/**
 * Validate and sanitize URL
 * @param {string} url - URL to validate
 * @returns {string|null} - Safe URL or null if invalid
 */
export const sanitizeUrl = (url) => {
    if (!url || typeof url !== 'string') return null

    // Only allow http, https, and relative URLs
    const trimmed = url.trim()

    // Check for javascript: and data: protocols
    const dangerous = /^(javascript|data|vbscript):/i
    if (dangerous.test(trimmed)) {
        return null
    }

    // Allow relative URLs
    if (trimmed.startsWith('/') || trimmed.startsWith('./') || trimmed.startsWith('../')) {
        return trimmed
    }

    // Allow http/https
    if (/^https?:\/\//i.test(trimmed)) {
        try {
            new URL(trimmed)
            return trimmed
        } catch {
            return null
        }
    }

    return null
}

/**
 * Sanitize user input for safe display
 * @param {string} input - User input
 * @param {object} options - Options
 * @returns {string} - Sanitized input
 */
export const sanitizeInput = (input, options = {}) => {
    if (!input || typeof input !== 'string') return ''

    let result = input

    // Trim whitespace
    result = result.trim()

    // Limit length
    const maxLength = options.maxLength || 10000
    if (result.length > maxLength) {
        result = result.substring(0, maxLength)
    }

    // Strip HTML unless explicitly allowed
    if (!options.allowHtml) {
        result = stripHtml(result)
    }

    // Escape remaining content
    if (options.escape !== false) {
        result = escapeHtml(result)
    }

    return result
}

/**
 * Sanitize object properties (for API responses)
 * @param {object} obj - Object to sanitize
 * @param {string[]} fields - Fields to sanitize
 * @returns {object} - Sanitized object
 */
export const sanitizeObject = (obj, fields = []) => {
    if (!obj || typeof obj !== 'object') return obj

    const result = { ...obj }

    for (const field of fields) {
        if (typeof result[field] === 'string') {
            result[field] = escapeHtml(result[field])
        }
    }

    return result
}

export default {
    escapeHtml,
    stripHtml,
    sanitizeUrl,
    sanitizeInput,
    sanitizeObject
}
