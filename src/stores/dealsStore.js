/**
 * Deals Store - Manages deals, filters, and search state
 */
import { reactive, computed, readonly } from 'vue'
import api from '../utils/api'

// State
const state = reactive({
    deals: [],
    trendingDeals: [],
    loading: false,
    error: null,

    // Search state
    searchQuery: '',
    hasSearched: false,
    lastSearchQuery: '',

    // Filters
    filters: {
        category: 'all',
        minPrice: null,
        maxPrice: null,
        source: null
    },

    // Sort
    sortBy: 'relevance',

    // Pagination
    page: 1,
    totalPages: 1,
    totalResults: 0
})

// Computed
const sortedDeals = computed(() => {
    const deals = [...state.deals]

    switch (state.sortBy) {
        case 'price-low':
            return deals.sort((a, b) => a.price - b.price)
        case 'price-high':
            return deals.sort((a, b) => b.price - a.price)
        case 'discount':
            return deals.sort((a, b) => (b.discount_percent || 0) - (a.discount_percent || 0))
        case 'newest':
            return deals.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        default:
            return deals
    }
})

const filteredDeals = computed(() => {
    let deals = sortedDeals.value

    // Apply category filter
    if (state.filters.category !== 'all') {
        deals = deals.filter(d => d.category === state.filters.category)
    }

    // Apply price filters
    if (state.filters.minPrice !== null) {
        deals = deals.filter(d => d.price >= state.filters.minPrice)
    }
    if (state.filters.maxPrice !== null) {
        deals = deals.filter(d => d.price <= state.filters.maxPrice)
    }

    // Apply source filter
    if (state.filters.source) {
        deals = deals.filter(d => d.source === state.filters.source)
    }

    return deals
})

// Actions
const searchDeals = async (query) => {
    if (!query?.trim()) return

    state.loading = true
    state.error = null
    state.searchQuery = query
    state.hasSearched = true
    state.lastSearchQuery = query

    try {
        const response = await api.get(`/api/search/?q=${encodeURIComponent(query)}`)
        state.deals = response.data.deals || []
        state.totalResults = state.deals.length
    } catch (error) {
        state.error = error.message || 'Search failed'
        state.deals = []
    } finally {
        state.loading = false
    }
}

const visualSearch = async (imageBase64) => {
    state.loading = true
    state.error = null
    state.hasSearched = true
    state.lastSearchQuery = 'Visual Search'

    try {
        const mlUrl = import.meta.env.VITE_ML_API_URL || 'http://127.0.0.1:8001'
        const response = await fetch(`${mlUrl}/api/visual-search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_base64: imageBase64, top_k: 20 })
        })

        const data = await response.json()

        if (data.success && data.results?.length > 0) {
            // Map results to deals format
            state.deals = data.results.map(r => ({
                id: r.product_id,
                title: r.metadata?.title || 'Similar Product',
                price: r.metadata?.price || 0,
                image_url: r.metadata?.image_url || '',
                source: r.metadata?.source || 'Found',
                similarity_score: r.similarity_score
            }))
        } else {
            state.deals = []
            state.error = 'No similar products found'
        }
    } catch (error) {
        state.error = error.message || 'Visual search failed'
        state.deals = []
    } finally {
        state.loading = false
    }
}

const loadTrending = async () => {
    try {
        const response = await api.get('/api/search/?q=trending')
        state.trendingDeals = response.data.deals || []
    } catch (error) {
        console.error('Failed to load trending:', error)
    }
}

const setFilter = (key, value) => {
    state.filters[key] = value
}

const setSortBy = (sort) => {
    state.sortBy = sort
}

const clearSearch = () => {
    state.deals = []
    state.searchQuery = ''
    state.hasSearched = false
    state.lastSearchQuery = ''
}

const clearError = () => {
    state.error = null
}

// Export store
export const useDeals = () => ({
    // State (readonly)
    state: readonly(state),

    // Computed
    sortedDeals,
    filteredDeals,

    // Actions
    searchDeals,
    visualSearch,
    loadTrending,
    setFilter,
    setSortBy,
    clearSearch,
    clearError
})

export default useDeals
