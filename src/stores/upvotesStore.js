/**
 * Upvotes Store - Manages product upvotes/favorites
 */
import { reactive, computed, readonly } from 'vue'

// State
const state = reactive({
    upvotedIds: new Set(JSON.parse(localStorage.getItem('fynda_upvotes') || '[]')),
    loading: false
})

// Persist to localStorage
const persistUpvotes = () => {
    localStorage.setItem('fynda_upvotes', JSON.stringify([...state.upvotedIds]))
}

// Computed
const upvoteCount = computed(() => state.upvotedIds.size)

const upvotedList = computed(() => [...state.upvotedIds])

// Actions
const isUpvoted = (productId) => {
    return state.upvotedIds.has(productId)
}

const toggleUpvote = async (productId) => {
    if (state.upvotedIds.has(productId)) {
        state.upvotedIds.delete(productId)
    } else {
        state.upvotedIds.add(productId)
    }

    persistUpvotes()

    // TODO: Sync with backend
    // try {
    //     await api.post('/api/upvotes/', { product_id: productId })
    // } catch (error) {
    //     console.error('Failed to sync upvote:', error)
    // }

    return isUpvoted(productId)
}

const addUpvote = (productId) => {
    if (!state.upvotedIds.has(productId)) {
        state.upvotedIds.add(productId)
        persistUpvotes()
    }
}

const removeUpvote = (productId) => {
    if (state.upvotedIds.has(productId)) {
        state.upvotedIds.delete(productId)
        persistUpvotes()
    }
}

const clearUpvotes = () => {
    state.upvotedIds.clear()
    persistUpvotes()
}

// Bulk add (for syncing from backend)
const setUpvotes = (productIds) => {
    state.upvotedIds = new Set(productIds)
    persistUpvotes()
}

// Export store
export const useUpvotes = () => ({
    // State (readonly)
    state: readonly(state),

    // Computed
    upvoteCount,
    upvotedList,

    // Actions
    isUpvoted,
    toggleUpvote,
    addUpvote,
    removeUpvote,
    clearUpvotes,
    setUpvotes
})

export default useUpvotes
