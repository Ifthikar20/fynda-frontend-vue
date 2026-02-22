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
              @blur="isSearchFocused = false"
              placeholder="Search for products, brands, styles..."
            />
            <button class="search-btn" @click="handleSearch">Search</button>
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
  </div>
</template>

<script setup>
defineOptions({ name: 'BrandsHomePage' })
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from './NavBar.vue'

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

// Curated brand items for the masonry grid
const allItems = ref([
  { id: 1, title: 'Silk Slip Dress — Champagne', brand: 'Reformation', image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=80', saved: false, url: null },
  { id: 2, title: 'Vintage Leather Jacket', brand: 'AllSaints', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80', saved: false, url: null },
  { id: 3, title: 'Chunky Platform Sneakers', brand: 'Nike', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80', saved: false, url: null },
  { id: 4, title: 'Gold Hoop Earrings', brand: 'Mejuri', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80', saved: false, url: null },
  { id: 5, title: 'Oversized Blazer — Charcoal', brand: 'Zara', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80', saved: false, url: null },
  { id: 6, title: 'Summer Streetwear Look', brand: 'Fashion Nova', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80', saved: false, url: null },
  { id: 7, title: 'Leather Crossbody Bag — Tan', brand: 'Madewell', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80', saved: false, url: null },
  { id: 8, title: 'Elegant Evening Gown', brand: 'Revolve', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80', saved: false, url: null },
  { id: 9, title: 'Retro Sunglasses', brand: 'Ray-Ban', image: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=400&q=80', saved: false, url: null },
  { id: 10, title: 'Minimalist Watch — Rose Gold', brand: 'MVMT', image: 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=400&q=80', saved: false, url: null },
  { id: 11, title: 'Festival Boho Outfit', brand: 'Free People', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&q=80', saved: false, url: null },
  { id: 12, title: 'Wide-Leg Linen Pants', brand: 'COS', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80', saved: false, url: null },
  { id: 13, title: 'Running Shoes — Black', brand: 'Adidas', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80', saved: false, url: null },
  { id: 14, title: 'Denim Jacket — Classic Blue', brand: 'Levi\'s', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&q=80', saved: false, url: null },
  { id: 15, title: 'Casual Knit Sweater', brand: 'Everlane', image: 'https://images.unsplash.com/photo-1434389677669-e08b4cda3a20?w=400&q=80', saved: false, url: null },
  { id: 16, title: 'Y2K Crop Top', brand: 'Princess Polly', image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&q=80', saved: false, url: null },
  { id: 17, title: 'Power Suit — Navy', brand: 'Theory', image: 'https://images.unsplash.com/photo-1544957992-20514f595d6f?w=400&q=80', saved: false, url: null },
  { id: 18, title: 'Canvas Tote Bag', brand: 'Madewell', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80', saved: false, url: null },
  { id: 19, title: 'Athleisure Set — Sage', brand: 'Gymshark', image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&q=80', saved: false, url: null },
  { id: 20, title: 'Beach Vacation Style', brand: 'Aritzia', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80', saved: false, url: null },
  { id: 21, title: 'Smart Cashmere Coat', brand: 'COS', image: 'https://images.unsplash.com/photo-1544923246-77307dd270df?w=400&q=80', saved: false, url: null },
  { id: 22, title: 'Floral Maxi Dress', brand: 'Anthropologie', image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=400&q=80', saved: false, url: null },
  { id: 23, title: 'Vintage Thrift Find', brand: 'ThriftUp', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&q=80', saved: false, url: null },
  { id: 24, title: 'Layered Fall Outfit', brand: 'Uniqlo', image: 'https://images.unsplash.com/photo-1475180098004-ca77a66827be?w=400&q=80', saved: false, url: null },
  { id: 25, title: 'Statement Necklace — Gold', brand: 'Ana Luisa', image: 'https://images.unsplash.com/photo-1515562141589-67f0d0e6e9e1?w=400&q=80', saved: false, url: null },
  { id: 26, title: 'Slim Fit Oxford Shirt', brand: 'H&M', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&q=80', saved: false, url: null },
  { id: 27, title: "Men's Casual Friday", brand: 'Bonobos', image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400&q=80', saved: false, url: null },
  { id: 28, title: 'Shopping Day OOTD', brand: 'Urban Outfitters', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80', saved: false, url: null },
  { id: 29, title: 'Cozy Knit Season', brand: 'Aritzia', image: 'https://images.unsplash.com/photo-1495385794356-15371f348c31?w=400&q=80', saved: false, url: null },
  { id: 30, title: 'Pastel Dream Outfit', brand: 'Revolve', image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400&q=80', saved: false, url: null },
  { id: 31, title: 'Sneaker Culture', brand: 'Nike', image: 'https://images.unsplash.com/photo-1581044777550-4cfa60707998?w=400&q=80', saved: false, url: null },
  { id: 32, title: 'Accessories That Pop', brand: 'BaubleBar', image: 'https://images.unsplash.com/photo-1518577915332-c2a19f149a75?w=400&q=80', saved: false, url: null },
  { id: 33, title: 'Olive Chinos — Relaxed Fit', brand: 'Zara', image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&q=80', saved: false, url: null },
  { id: 34, title: 'Graphic Hoodie — Oversized', brand: 'Adidas', image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400&q=80', saved: false, url: null },
  { id: 35, title: 'Runway Ready Look', brand: 'Vogue Edit', image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&q=80', saved: false, url: null },
  { id: 36, title: 'Cargo Joggers — Black', brand: 'Nike', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80', saved: false, url: null },
])

// Filtered on-screen items based on search query (live as you type)
const filteredLocalItems = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
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
  const q = searchQuery.value.trim().toLowerCase()
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

// Watch searchQuery for live filtering + debounced API call
watch(searchQuery, (val) => {
  const q = val.trim()
  if (!q) {
    // Cleared — reset everything
    hasSearched.value = false
    lastSearchQuery.value = ''
    apiResults.value = []
    searchLoading.value = false
    if (debounceTimer) clearTimeout(debounceTimer)
    return
  }
  
  hasSearched.value = true
  lastSearchQuery.value = q
  
  // Debounce API call (500ms after user stops typing)
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(async () => {
    searchLoading.value = true
    try {
      const response = await fetch(`${API_URL}/api/search/?q=${encodeURIComponent(q)}`)
      const data = await response.json()
      // Only update if query hasn't changed while we were fetching
      if (searchQuery.value.trim() === q) {
        apiResults.value = data.results || data.deals || []
      }
    } catch (e) {
      console.error('Search failed:', e)
    } finally {
      if (searchQuery.value.trim() === q) {
        searchLoading.value = false
      }
    }
  }, 500)
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
  if (item.url) {
    window.open(item.url, '_blank')
  } else {
    router.push(`/?q=${encodeURIComponent(item.title)}`)
  }
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
}

.search-btn:hover {
  background: #333;
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
