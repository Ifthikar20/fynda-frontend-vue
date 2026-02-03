/**
 * Token Storage Utility
 * Provides obfuscated storage for authentication tokens
 * This adds a layer of obscurity to make casual inspection harder
 */

// Obfuscated storage keys (non-descriptive)
const STORAGE_KEYS = {
    session: '_fss',    // Fynda Session State (was: fynda_tokens)
    profile: '_fup',    // Fynda User Profile (was: fynda_user)
}

// Simple obfuscation using Base64 (not encryption, but obscures plain text)
const obfuscate = (value) => {
    if (!value) return null
    try {
        const json = JSON.stringify(value)
        return btoa(encodeURIComponent(json))
    } catch {
        return null
    }
}

const deobfuscate = (value) => {
    if (!value) return null
    try {
        const json = decodeURIComponent(atob(value))
        return JSON.parse(json)
    } catch {
        return null
    }
}

/**
 * Store tokens with obfuscation
 * Transforms: { access: "...", refresh: "..." }
 * Into: { s: "<base64>", r: "<base64>", v: 1 }
 */
export const storeTokens = (tokens) => {
    if (!tokens) {
        localStorage.removeItem(STORAGE_KEYS.session)
        return
    }

    const obfuscated = {
        s: obfuscate(tokens.access),   // 's' for session token
        r: obfuscate(tokens.refresh),  // 'r' for refresh token
        v: 1,                          // version for future migrations
    }

    localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(obfuscated))
}

/**
 * Retrieve tokens with deobfuscation
 * Returns: { access: "...", refresh: "..." } or null
 */
export const getTokens = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.session)
        if (!stored) return null

        const obfuscated = JSON.parse(stored)

        // Handle legacy format (plain tokens)
        if (obfuscated.access || obfuscated.refresh) {
            // Migrate to new format
            const tokens = {
                access: obfuscated.access,
                refresh: obfuscated.refresh
            }
            storeTokens(tokens)
            return tokens
        }

        // New obfuscated format
        return {
            access: deobfuscate(obfuscated.s),
            refresh: deobfuscate(obfuscated.r)
        }
    } catch {
        return null
    }
}

/**
 * Remove tokens from storage
 */
export const clearTokens = () => {
    localStorage.removeItem(STORAGE_KEYS.session)
    // Also clear legacy key if exists
    localStorage.removeItem('fynda_tokens')
}

/**
 * Store user profile with obfuscation
 */
export const storeUser = (user) => {
    if (!user) {
        localStorage.removeItem(STORAGE_KEYS.profile)
        return
    }

    const obfuscated = {
        d: obfuscate(user),  // 'd' for data
        v: 1
    }

    localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(obfuscated))
}

/**
 * Retrieve user profile with deobfuscation
 */
export const getUser = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.profile)
        if (!stored) return null

        const obfuscated = JSON.parse(stored)

        // Handle legacy format (plain user data)
        if (obfuscated.id || obfuscated.email) {
            // Migrate to new format
            storeUser(obfuscated)
            return obfuscated
        }

        // New obfuscated format
        return deobfuscate(obfuscated.d)
    } catch {
        return null
    }
}

/**
 * Remove user from storage
 */
export const clearUser = () => {
    localStorage.removeItem(STORAGE_KEYS.profile)
    // Also clear legacy key if exists
    localStorage.removeItem('fynda_user')
}

/**
 * Clear all auth data
 */
export const clearAll = () => {
    clearTokens()
    clearUser()
}

/**
 * Check if session exists
 */
export const hasSession = () => {
    const tokens = getTokens()
    return !!(tokens?.access)
}

/**
 * Migrate from legacy storage (one-time migration)
 */
export const migrateFromLegacy = () => {
    try {
        // Migrate tokens
        const legacyTokens = localStorage.getItem('fynda_tokens')
        if (legacyTokens) {
            const tokens = JSON.parse(legacyTokens)
            if (tokens.access || tokens.refresh) {
                storeTokens(tokens)
                localStorage.removeItem('fynda_tokens')
            }
        }

        // Migrate user
        const legacyUser = localStorage.getItem('fynda_user')
        if (legacyUser) {
            const user = JSON.parse(legacyUser)
            if (user.id || user.email) {
                storeUser(user)
                localStorage.removeItem('fynda_user')
            }
        }
    } catch (e) {
        console.warn('Legacy migration failed:', e)
    }
}

export default {
    storeTokens,
    getTokens,
    clearTokens,
    storeUser,
    getUser,
    clearUser,
    clearAll,
    hasSession,
    migrateFromLegacy,
    STORAGE_KEYS
}
