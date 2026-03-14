<template>
  <div class="brands-home">
    <NavBar />

    <main class="brands-content">
      <!-- Search Bar (same as main page) -->
      <section class="search-hero">
        <div class="ai-search-container">
          <div class="ai-search-box">
            <div class="ai-search-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <input 
              type="text" 
              class="ai-search-input"
              v-model="searchQuery"
              @keyup.enter="handleSearch"
              @focus="isSearchFocused = true"
              @blur="handleBlur"
              placeholder="Search for products, brands, styles..."
            />

            <!-- Search Button -->
            <button class="search-btn" @click="handleSearch">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              Search
            </button>

            <!-- Brand & Phrase Suggestions Dropdown -->
            <div v-if="searchSuggestions.length > 0 && isSearchFocused && searchQuery.length > 0" class="brand-suggestions-dropdown">
              <button
                v-for="suggestion in searchSuggestions"
                :key="suggestion"
                class="brand-suggestion-item"
                @mousedown.prevent="selectSuggestion(suggestion)"
              >
                <svg class="suggestion-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                <span class="suggestion-text" v-html="highlightMatch(suggestion, searchQuery)"></span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Results info when searching -->
      <div v-if="hasSearched" class="results-info">
        <span class="results-label">Results for "{{ lastSearchQuery }}"</span>
        <span class="results-count">{{ displayItems.length }} items</span>
      </div>

      <!-- Loading indicator for API search -->
      <div v-if="searchLoading" class="inline-loading">
        <div class="spinner"></div>
        <p>Finding more deals...</p>
      </div>

      <!-- Unified Masonry Grid (filtered items + API results) -->
      <div class="masonry">
        <div 
          v-for="item in displayItems" 
          :key="item.id" 
          class="pin"
          @click="openItem(item)"
        >
          <div class="pin-img-wrap">
            <img :src="item.image || item.image_url" :alt="item.title" class="pin-img" loading="lazy" />
            <div class="pin-overlay">
              <button class="save-btn" @click.stop="toggleSave(item)">
                {{ item.saved ? 'Saved' : 'Save' }}
              </button>
            </div>
          </div>
          <div class="pin-info">
            <div class="pin-text">
              <p class="pin-title">{{ item.title }}</p>
              <span class="pin-source">{{ item.brand || item.merchant_name || item.source || '' }}</span>
              <span v-if="item.price" class="pin-price">${{ formatPrice(item.price) }}</span>
            </div>
            <button class="pin-menu" @click.stop>⋯</button>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="hasSearched && !searchLoading && displayItems.length === 0" class="empty-state">
        <h3>No results found</h3>
        <p>Try a different search term</p>
      </div>

      <!-- Load More Sentinel -->
      <div ref="sentinel" class="sentinel"></div>
    </main>

    <Footer />
  </div>
</template>

<script setup>
defineOptions({ name: 'BrandsHomePage' })
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSEO } from '../composables/useSEO'
import NavBar from './NavBar.vue'
import Footer from './Footer.vue'

useSEO({
  title: 'Home — Discover Brands & Products',
  description: 'Browse curated fashion brands, discover trending products, and search for styles you love. Find inspiration from top fashion brands in one place.',
  keywords: 'fashion brands, discover products, curated fashion, brand discovery, trending brands, outfit inspiration',
})

const router = useRouter()
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

// Search state
const searchQuery = ref('')
const lastSearchQuery = ref('')
const apiResults = ref([])
const searchLoading = ref(false)
const hasSearched = ref(false)
const isSearchFocused = ref(false)
let debounceTimer = null

// Masonry state
const loading = ref(false)
const sentinel = ref(null)
const visibleCount = ref(40)
let observer = null

// Real products from API (replaces hardcoded mock data)
const allItems = ref([])

// Non-fashion keywords to exclude
const NON_FASHION_KEYWORDS = [
  'laptop', 'phone', 'tablet', 'headphone', 'speaker', 'camera', 'tv',
  'monitor', 'keyboard', 'mouse', 'charger', 'cable', 'printer', 'router',
  'gaming', 'console', 'controller', 'kitchen', 'pan', 'pot', 'blender',
  'toaster', 'microwave', 'oven', 'fridge', 'drill', 'hammer', 'screwdriver',
  'car', 'tire', 'motor oil', 'dog food', 'cat food', 'pet bed', 'lego', 'puzzle',
]

const CLOTHING_KEYWORDS = [
  'dress', 'shirt', 'blouse', 'top', 'tee', 't-shirt', 'tank',
  'jacket', 'coat', 'blazer', 'hoodie', 'sweater', 'cardigan', 'pullover', 'sweatshirt',
  'jeans', 'pants', 'trousers', 'shorts', 'skirt', 'leggings', 'joggers', 'chinos',
  'sneakers', 'shoes', 'boots', 'heels', 'sandals', 'loafers', 'flats', 'pumps',
  'handbag', 'purse', 'tote', 'clutch', 'backpack', 'crossbody', 'satchel',
  'scarf', 'hat', 'beanie', 'cap', 'belt', 'tie', 'gloves',
  'suit', 'romper', 'jumpsuit', 'bodysuit', 'overalls',
  'bikini', 'swimsuit', 'swimwear', 'lingerie',
  'vest', 'parka', 'windbreaker', 'poncho',
  'polo', 'henley', 'flannel', 'denim', 'corset',
  'sunglasses', 'watch', 'bracelet', 'necklace', 'earrings', 'ring',
  'socks', 'stockings', 'tights',
]

const isClothing = (title) => {
  const lower = (title || '').toLowerCase()
  return CLOTHING_KEYWORDS.some(kw => lower.includes(kw))
}

const isFashionItem = (title) => {
  const lower = (title || '').toLowerCase()
  return !NON_FASHION_KEYWORDS.some(kw => lower.includes(kw))
}

const extractBrand = (title) => {
  if (!title) return 'Brand'
  const words = title.trim().split(/\s+/)
  if (words.length === 0) return 'Brand'
  const descriptors = [
    'mens', "men's", 'womens', "women's", 'unisex', 'kids', 'casual', 'classic',
    'vintage', 'slim', 'regular', 'relaxed', 'oversized', 'fitted', 'loose',
    'long', 'short', 'mid', 'high', 'low', 'mini', 'maxi', 'plus',
    'cotton', 'silk', 'linen', 'wool', 'polyester', 'denim', 'leather', 'fleece',
    '2024', '2025', '2026', 'new', 'pack', 'set', 'piece',
  ]
  let brandWords = []
  for (const word of words) {
    const lower = word.toLowerCase().replace(/[^a-z]/g, '')
    if (descriptors.includes(lower)) break
    brandWords.push(word)
    if (brandWords.length >= 3) break
  }
  return brandWords.join(' ').replace(/[,\-]$/, '') || words[0]
}

// Load real products from API
const loadProducts = async () => {
  loading.value = true
  try {
    const response = await fetch(`${API_URL}/api/explore/?category=all-products&limit=40`)
    const data = await response.json()
    const products = data?.deals || []
    
    allItems.value = products
      .filter(p => p.image_url || p.image || p.thumbnail)
      .filter(p => isClothing(p.title))
      .filter(p => isFashionItem(p.title))
      .map((p, idx) => ({
        id: p.id || idx,
        title: p.title,
        brand: p.merchant_name || extractBrand(p.title),
        image: p.image_url || p.image || p.thumbnail,
        image_url: p.image_url || p.image || p.thumbnail,
        price: typeof p.price === 'string' ? p.price.replace(/[^0-9.]/g, '') : p.price,
        saved: false,
        url: p.url,
        source: p.source || 'Amazon',
        merchant_name: p.merchant_name || extractBrand(p.title),
      }))
      .sort(() => 0.5 - Math.random()) // Shuffle for variety
  } catch (error) {
    console.error('Failed to load products:', error)
  } finally {
    loading.value = false
  }
}

// Suggestion list: brands + common fashion phrases
const suggestionPool = [
  // Popular brands
  'Nike', 'Adidas', 'Zara', 'H&M', 'Gucci', 'Prada', 'Louis Vuitton', 'Chanel',
  'Versace', 'Balenciaga', 'Burberry', 'Dior', 'Fendi', 'Givenchy', 'Hermès',
  'Uniqlo', 'Gap', 'Levi\'s', 'Calvin Klein', 'Ralph Lauren', 'Tommy Hilfiger',
  'ASOS', 'Shein', 'Forever 21', 'Mango', 'Nordstrom', 'Lululemon',
  'Under Armour', 'Puma', 'Reebok', 'New Balance', 'Converse', 'Vans',
  'Coach', 'Michael Kors', 'Kate Spade', 'Tory Burch',
  'Reformation', 'Everlane', 'AllSaints', 'COS', 'Massimo Dutti',
  'Patagonia', 'The North Face', 'Columbia',
  'Skims', 'Good American', 'Abercrombie & Fitch',
  // Common fashion search phrases
  'summer dresses', 'winter coats', 'casual sneakers', 'formal blazer',
  'wedding guest outfit', 'office wear', 'date night outfit',
  'streetwear hoodie', 'vintage leather jacket', 'white sneakers under $100',
  'best jeans for women', 'men\'s casual shirts', 'workout leggings',
  'silk blouse', 'oversized blazer', 'chunky boots', 'crossbody bag',
  'gold earrings', 'minimalist watch', 'summer sandals',
  'affordable designer bags', 'sustainable fashion brands',
  'plus size dresses', 'petite clothing', 'athleisure outfits',
  'festival outfit ideas', 'back to school outfits',
  'matching sets', 'co-ord sets', 'linen pants', 'cargo pants',
  'trending shoes 2026', 'spring fashion trends', 'fall outfit ideas',
]

// Filtered suggestions (prefix-prioritized, max 8)
const searchSuggestions = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q || q.length < 1) return []
  return suggestionPool
    .filter(s => s.toLowerCase().includes(q))
    .sort((a, b) => {
      const aStarts = a.toLowerCase().startsWith(q) ? 0 : 1
      const bStarts = b.toLowerCase().startsWith(q) ? 0 : 1
      return aStarts - bStarts || a.localeCompare(b)
    })
    .slice(0, 8)
})

const selectSuggestion = (suggestion) => {
  searchQuery.value = suggestion
  handleSearch()
}

const highlightMatch = (text, query) => {
  if (!query) return text
  const q = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${q})`, 'gi')
  return text.replace(regex, '<strong>$1</strong>')
}

const handleBlur = () => {
  setTimeout(() => { isSearchFocused.value = false }, 150)
}

// Filtered on-screen items based on search query (only after explicit search)
const filteredLocalItems = computed(() => {
  const q = lastSearchQuery.value.trim().toLowerCase()
  if (!q) {
    return allItems.value.slice(0, visibleCount.value)
  }
  return allItems.value.filter(item => {
    const title = (item.title || '').toLowerCase()
    const brand = (item.brand || '').toLowerCase()
    return title.includes(q) || brand.includes(q)
  })
})

// Combine: filtered local items first, then API results (deduped)
const displayItems = computed(() => {
  const q = lastSearchQuery.value.trim().toLowerCase()
  if (!q) {
    return allItems.value.slice(0, visibleCount.value)
  }
  // Merge local matches + API results, deduped by title
  const seenTitles = new Set()
  const merged = []
  
  // Local matches first
  for (const item of filteredLocalItems.value) {
    const key = item.title.toLowerCase()
    if (!seenTitles.has(key)) {
      seenTitles.add(key)
      merged.push(item)
    }
  }
  
  // Then API results
  for (const deal of apiResults.value) {
    const key = (deal.title || '').toLowerCase()
    if (!seenTitles.has(key)) {
      seenTitles.add(key)
      merged.push({
        id: 'api-' + deal.id,
        title: deal.title,
        brand: deal.merchant_name || deal.source || 'Brand',
        image: deal.image_url || deal.image,
        image_url: deal.image_url || deal.image,
        price: deal.price,
        saved: false,
        url: deal.deal_url || deal.url,
        discount_percent: deal.discount_percent,
      })
    }
  }
  
  return merged
})

// Reset state when search is cleared
watch(searchQuery, (val) => {
  if (!val.trim()) {
    hasSearched.value = false
    lastSearchQuery.value = ''
    apiResults.value = []
    searchLoading.value = false
  }
})

// Manual search (Enter key or button click) — fires immediately
const handleSearch = async () => {
  const q = searchQuery.value.trim()
  if (!q) return
  
  if (debounceTimer) clearTimeout(debounceTimer)
  hasSearched.value = true
  lastSearchQuery.value = q
  searchLoading.value = true

  try {
    const response = await fetch(`${API_URL}/api/search/?q=${encodeURIComponent(q)}`)
    const data = await response.json()
    apiResults.value = data.results || data.deals || []
  } catch (e) {
    console.error('Search failed:', e)
  } finally {
    searchLoading.value = false
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  hasSearched.value = false
  lastSearchQuery.value = ''
  apiResults.value = []
}

const openItem = (item) => {
  // Store product data for the detail page
  localStorage.setItem('fyndaViewProduct', JSON.stringify(item))
  const productId = item.id || encodeURIComponent((item.title || '').substring(0, 30))
  router.push(`/product/${productId}`)
}

const openDeal = (deal) => {
  if (deal.deal_url || deal.url) {
    window.open(deal.deal_url || deal.url, '_blank')
  }
}

const toggleSave = (item) => {
  item.saved = !item.saved
}

const formatPrice = (price) => {
  if (!price) return '0.00'
  return parseFloat(price).toFixed(2)
}

const setupInfiniteScroll = () => {
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && visibleCount.value < allItems.value.length) {
        visibleCount.value = Math.min(visibleCount.value + 12, allItems.value.length)
      }
    },
    { rootMargin: '200px' }
  )
  if (sentinel.value) observer.observe(sentinel.value)
}

onMounted(() => {
  loadProducts()
  setupInfiniteScroll()
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})
</script>

<style scoped>
.brands-home {
  min-height: 100vh;
  background: #fff;
}

.brands-content {
  max-width: 100%;
  padding: 16px 8px 60px;
}

/* Search Bar — matches main page exactly */
.search-hero {
  max-width: 640px;
  margin: 0 auto 20px;
  padding: 0 8px;
}

.ai-search-container {
  max-width: 640px;
  margin: 0 auto;
}

.ai-search-box {
  display: flex;
  align-items: center;
  background: #fff;
  border: 2px solid #e0e0e0;
  border-radius: 32px;
  padding: 0.6rem 0.6rem 0.6rem 1.5rem;
  min-height: 62px;
  transition: all 0.2s ease;
  position: relative;
}

.ai-search-box:focus-within {
  border-color: #000;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

.ai-search-icon {
  color: #888;
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.ai-search-icon svg {
  width: 22px;
  height: 22px;
}

.ai-search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-family: 'Inter', sans-serif;
  font-size: 1.05rem;
  color: #1a1a1a;
  outline: none;
  min-width: 0;
  height: 44px;
}

.ai-search-input::placeholder {
  color: #999;
}

.search-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0.75rem 1.5rem;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 20px;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.search-btn:hover {
  background: #333;
}

/* ========== Brand/Phrase Suggestions Dropdown ========== */
.brand-suggestions-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  z-index: 100;
  overflow: hidden;
  padding: 6px 0;
}

.brand-suggestion-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 20px;
  border: none;
  background: none;
  font-family: 'Inter', sans-serif;
  font-size: 0.92rem;
  color: #333;
  cursor: pointer;
  text-align: left;
  transition: background 0.12s ease;
}

.brand-suggestion-item:hover {
  background: #f5f5f5;
}

.suggestion-search-icon {
  flex-shrink: 0;
  opacity: 0.5;
}

.suggestion-text {
  flex: 1;
}

.suggestion-text strong {
  font-weight: 700;
  color: #111;
}

/* Results info bar */
.results-info {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 1800px;
  margin: 0 auto 12px;
  padding: 0 8px;
}

.results-label {
  font-size: 0.88rem;
  font-weight: 600;
  color: #1a1a1a;
}

.results-count {
  font-size: 0.78rem;
  color: #999;
}

/* Loading */
.inline-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #999;
}

.inline-loading p {
  margin-top: 0.75rem;
  font-size: 0.85rem;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #999;
}

.empty-state h3 {
  font-size: 1.1rem;
  font-weight: 500;
  color: #666;
  margin-bottom: 0.5rem;
}

.empty-state p {
  font-size: 0.85rem;
}

/* Pinterest Masonry */
.masonry {
  columns: 6;
  column-gap: 12px;
  max-width: 1800px;
  margin: 0 auto;
}

/* Pin Card */
.pin {
  break-inside: avoid;
  margin-bottom: 12px;
  cursor: pointer;
}

.pin-img-wrap {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
}

.pin-img {
  width: 100%;
  display: block;
  border-radius: 16px;
}

/* Hover overlay */
.pin-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.4);
  opacity: 0;
  transition: opacity 0.2s;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 12px;
  border-radius: 16px;
}

.pin:hover .pin-overlay {
  opacity: 1;
}

.save-btn {
  background: #111;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 24px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}

.save-btn:hover {
  background: #333;
}

/* Pin info row */
.pin-info {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 8px 4px 4px;
  gap: 4px;
}

.pin-text {
  flex: 1;
  min-width: 0;
}

.pin-title {
  font-size: 0.82rem;
  font-weight: 600;
  color: #111;
  margin: 0 0 2px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.3;
}

.pin-source {
  font-size: 0.75rem;
  color: #767676;
  display: block;
}

.pin-price {
  font-size: 0.78rem;
  font-weight: 700;
  color: #1a1a1a;
  display: block;
  margin-top: 2px;
}

.pin-menu {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #767676;
  cursor: pointer;
  padding: 0 2px;
  line-height: 1;
  flex-shrink: 0;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.pin-menu:hover {
  background: #f0f0f0;
}

/* Loading */
.loading-state {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid #eee;
  border-top-color: #111;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.sentinel {
  height: 1px;
}

/* Responsive columns */
@media (max-width: 1600px) { .masonry { columns: 5; } }
@media (max-width: 1200px) { .masonry { columns: 4; } }
@media (max-width: 900px)  { .masonry { columns: 3; } }
@media (max-width: 600px)  { .masonry { columns: 2; column-gap: 8px; } }
</style>
