<template>
  <div class="brands-home">
    <NavBar />

    <main class="brands-content">
      <!-- Search Bar -->
      <section class="search-section">
        <div class="search-container">
          <div class="search-box" :class="{ focused: isSearchFocused }">
            <div class="search-icon-wrap">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <input 
              type="text" 
              class="search-input"
              v-model="searchQuery"
              @keyup.enter="handleSearch"
              @focus="isSearchFocused = true"
              @blur="isSearchFocused = false"
              placeholder="Search for products, brands, styles..."
            />
            <button v-if="searchQuery" class="clear-btn" @click="clearSearch">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
            <button class="search-btn" @click="handleSearch">Search</button>
          </div>
        </div>
      </section>

      <!-- Search Results -->
      <section v-if="hasSearched" class="results-section">
        <div class="results-header">
          <h2 class="results-title">Results for "{{ lastSearchQuery }}"</h2>
          <span class="results-count">{{ searchResults.length }} items found</span>
        </div>

        <div v-if="searchLoading" class="inline-loading">
          <div class="spinner"></div>
          <p>Finding the best deals...</p>
        </div>

        <div v-else-if="searchResults.length > 0" class="results-grid">
          <div 
            v-for="deal in searchResults" 
            :key="deal.id" 
            class="result-card"
            @click="openDeal(deal)"
          >
            <div class="result-image">
              <img :src="deal.image_url || deal.image" :alt="deal.title" loading="lazy" />
              <span v-if="deal.discount_percent" class="discount-badge">{{ deal.discount_percent }}% off</span>
            </div>
            <div class="result-info">
              <span class="result-brand">{{ (deal.merchant_name || deal.source || 'Brand').toUpperCase() }}</span>
              <h3 class="result-title">{{ deal.title }}</h3>
              <span class="result-price">${{ formatPrice(deal.price) }}</span>
            </div>
          </div>
        </div>

        <div v-else-if="!searchLoading" class="empty-state">
          <h3>No results found</h3>
          <p>Try a different search term</p>
        </div>

        <button class="back-btn" @click="clearSearch">← Back to Home</button>
      </section>

      <!-- Masonry Grid (hidden when showing search results) -->
      <template v-if="!hasSearched">
        <div class="masonry">
          <div 
            v-for="item in visibleItems" 
            :key="item.id" 
            class="pin"
            @click="openItem(item)"
          >
            <div class="pin-img-wrap">
              <img :src="item.image" :alt="item.title" class="pin-img" loading="lazy" />
              <div class="pin-overlay">
                <button class="save-btn" @click.stop="toggleSave(item)">
                  {{ item.saved ? 'Saved' : 'Save' }}
                </button>
              </div>
            </div>
            <div class="pin-info">
              <div class="pin-text">
                <p class="pin-title">{{ item.title }}</p>
                <span class="pin-source">{{ item.brand }}</span>
              </div>
              <button class="pin-menu" @click.stop>⋯</button>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
        </div>

        <!-- Load More Sentinel -->
        <div ref="sentinel" class="sentinel"></div>
      </template>
    </main>
  </div>
</template>

<script setup>
defineOptions({ name: 'BrandsHomePage' })
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from './NavBar.vue'

const router = useRouter()
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

// Search state
const searchQuery = ref('')
const lastSearchQuery = ref('')
const searchResults = ref([])
const searchLoading = ref(false)
const hasSearched = ref(false)
const isSearchFocused = ref(false)

// Masonry state
const loading = ref(false)
const sentinel = ref(null)
const visibleCount = ref(40)
let observer = null

// Search functions
const handleSearch = async () => {
  const q = searchQuery.value.trim()
  if (!q) return

  searchLoading.value = true
  hasSearched.value = true
  lastSearchQuery.value = q
  searchResults.value = []

  try {
    const response = await fetch(`${API_URL}/api/search/?q=${encodeURIComponent(q)}`)
    const data = await response.json()
    searchResults.value = data.results || data.deals || []
  } catch (e) {
    console.error('Search failed:', e)
  } finally {
    searchLoading.value = false
  }
}

const clearSearch = () => {
  hasSearched.value = false
  searchQuery.value = ''
  lastSearchQuery.value = ''
  searchResults.value = []
}

const openDeal = (deal) => {
  if (deal.deal_url || deal.url) {
    window.open(deal.deal_url || deal.url, '_blank')
  }
}

const formatPrice = (price) => {
  if (!price) return '0.00'
  return parseFloat(price).toFixed(2)
}

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

const visibleItems = computed(() => allItems.value.slice(0, visibleCount.value))

const openItem = (item) => {
  if (item.url) {
    window.open(item.url, '_blank')
  } else {
    // Search for similar items on the homepage
    router.push(`/?q=${encodeURIComponent(item.title)}`)
  }
}

const toggleSave = (item) => {
  item.saved = !item.saved
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

/* Search Bar */
.search-section {
  max-width: 640px;
  margin: 0 auto 24px;
  padding: 0 8px;
}

.search-container {
  width: 100%;
}

.search-box {
  display: flex;
  align-items: center;
  background: #fff;
  border: 2px solid #e0e0e0;
  border-radius: 32px;
  padding: 0.5rem 0.5rem 0.5rem 1.2rem;
  min-height: 54px;
  transition: all 0.2s ease;
}

.search-box.focused {
  border-color: #000;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

.search-icon-wrap {
  color: #888;
  margin-right: 0.6rem;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  color: #1a1a1a;
  outline: none;
  min-width: 0;
  height: 40px;
}

.search-input::placeholder {
  color: #999;
}

.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: #e8e8e8;
  border-radius: 50%;
  color: #666;
  cursor: pointer;
  margin-right: 0.4rem;
  flex-shrink: 0;
  transition: background 0.2s;
}

.clear-btn:hover {
  background: #d4d4d4;
}

.search-btn {
  padding: 0.6rem 1.3rem;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 20px;
  font-family: 'Inter', sans-serif;
  font-size: 0.88rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
}

.search-btn:hover {
  background: #333;
}

/* Search Results */
.results-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

.results-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 1.25rem;
}

.results-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.5rem;
  font-weight: 400;
  color: #1a1a1a;
}

.results-count {
  font-size: 0.82rem;
  color: #999;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.result-card {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #eee;
  cursor: pointer;
  transition: all 0.25s ease;
}

.result-card:hover {
  border-color: #ddd;
  box-shadow: 0 8px 24px rgba(0,0,0,0.07);
  transform: translateY(-3px);
}

.result-image {
  position: relative;
  aspect-ratio: 3/4;
  overflow: hidden;
  background: #f8f8f8;
}

.result-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.result-card:hover .result-image img {
  transform: scale(1.05);
}

.discount-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 3px 8px;
  background: #ef4444;
  color: #fff;
  font-size: 0.68rem;
  font-weight: 700;
  border-radius: 6px;
}

.result-info {
  padding: 0.85rem 1rem;
}

.result-brand {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  color: #999;
}

.result-title {
  font-size: 0.85rem;
  font-weight: 500;
  color: #1a1a1a;
  margin: 0.25rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.result-price {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1a1a1a;
}

.inline-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #999;
}

.inline-loading p {
  margin-top: 1rem;
  font-size: 0.9rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #999;
}

.empty-state h3 {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.3rem;
  font-weight: 400;
  color: #666;
  margin-bottom: 0.5rem;
}

.empty-state p {
  font-size: 0.85rem;
}

.back-btn {
  display: block;
  margin: 2rem auto 0;
  padding: 10px 24px;
  background: transparent;
  border: 1px solid #ddd;
  border-radius: 100px;
  font-size: 0.82rem;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  border-color: #000;
  color: #000;
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
@media (max-width: 1200px) {
  .masonry { columns: 4; }
  .results-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 900px) {
  .masonry { columns: 3; }
  .results-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 600px) {
  .masonry { columns: 2; column-gap: 8px; }
  .results-grid { grid-template-columns: 1fr; }
}
</style>
