<template>
  <div class="product-detail-page">
    <!-- NavBar -->
    <NavBar />

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading product...</p>
    </div>

    <!-- Product Detail -->
    <main v-else class="main-content">
      <!-- Top Section: Product Image + Info -->
      <section class="product-hero">
        <!-- Left: Product Info -->
        <div class="product-info-section">
          <div class="product-info-card">
            <h1 class="product-title">{{ product.title }}</h1>
            <p class="product-meta">
              <span class="product-price">${{ formatPrice(product.price) }}</span>
              <span class="product-brand" v-if="product.brand" @click="goToBrand(product.brand)">• {{ product.brand }}</span>
            </p>


            <!-- Price Comparison - Vertical Meter -->
            <div class="price-meter">
              <div class="meter-header">
                <span class="meter-title">Price Range</span>
              </div>
              <div class="meter-content">
                <div class="meter-bar-container">
                  <div class="meter-bar">
                    <div class="meter-marker" :style="{ bottom: pricePosition + '%' }"></div>
                  </div>
                  <div class="meter-labels">
                    <span class="meter-label high">${{ formatPrice(priceRange.high) }}</span>
                    <span class="meter-label mid">${{ formatPrice((priceRange.low + priceRange.high) / 2) }}</span>
                    <span class="meter-label low">${{ formatPrice(priceRange.low) }}</span>
                  </div>
                </div>
                <div class="meter-info">
                  <div class="current-price-tag" :class="priceLevel">
                    <span class="price-amount">${{ formatPrice(product.price) }}</span>
                    <span class="price-level">{{ priceLevel }}</span>
                  </div>
                  <p class="meter-description">We compared to {{ similarProducts.length || 19 }} other products</p>
                </div>
              </div>
            </div>

            <!-- Shop Button (with affiliate tracking) -->
            <a :href="affiliateUrl" target="_blank" rel="noopener sponsored" class="shop-btn">
              Shop item
            </a>
            
            <!-- Add to Fashion Board + Library Row -->
            <div class="action-row">
              <button class="outfit-btn" @click="goToFashionBoard">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="7" height="7" rx="1"/>
                  <rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/>
                  <rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
                Add to Fashion Board
              </button>
              
              <!-- Library Button - Small -->
              <button class="library-btn" :class="{ saved: isInLibrary }" @click="toggleLibrary" :title="isInLibrary ? 'Saved to Library' : 'Add to Library'">
                <svg width="18" height="18" viewBox="0 0 24 24" :fill="isInLibrary ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
                </svg>
              </button>
            </div>

            <!-- Add to Compare -->
            <button class="compare-btn" :class="{ added: isInCompare }" @click="toggleCompare">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
              {{ isInCompare ? 'Added to Compare ✓' : 'Add to Compare' }}
            </button>
          </div>
        </div>

        <!-- Right: Product Image -->
        <div class="product-image-section">
          <div class="image-container">
            <img :src="product.image_url" :alt="product.title" class="product-image" />
            
            <!-- Upvote Button with Count - Smaller -->
            <div class="upvote-container">
              <button 
                class="upvote-btn" 
                :class="{ active: isUpvoted }" 
                @click="handleUpvote" 
                title="Upvote this deal"
              >
                <img src="@/assets/upvote-logo.png" alt="Upvote" class="upvote-icon" />
                <span class="upvote-number">{{ upvoteCount }}</span>
              </button>
            </div>
            
            <!-- Store name at bottom of image -->
            <span class="store-name-overlay" @click.stop="goToBrand(product.merchant_name || product.source)">
              {{ product.merchant_name || product.source }}
            </span>
          </div>
        </div>
      </section>

      <!-- Similar Products Section -->
      <section class="similar-section">
        <h2 class="similar-title">All visually similar</h2>
        
        <!-- Filters -->
        <div class="filters-row">
          <div class="filter-buttons">
            <button class="filter-btn" :class="{ active: activeFilter === 'all' }" @click="setFilter('all')">
              All filters
            </button>
            <button class="filter-btn" :class="{ active: activeFilter === 'new' }" @click="setFilter('new')">
              New
            </button>
            <button class="filter-btn" :class="{ active: activeFilter === 'used' }" @click="setFilter('used')">
              Used
            </button>
          </div>
          
          <div class="sort-controls">
            <select v-model="sortBy" class="sort-select">
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="discount">Biggest Discount</option>
            </select>
          </div>
        </div>

        <!-- Similar Products Grid -->
        <div class="similar-grid">
          <div 
            v-for="item in filteredSimilarProducts" 
            :key="item.id" 
            class="similar-card"
            @click="goToProduct(item.id)"
          >
            <div class="similar-image-container">
              <img :src="item.image_url" :alt="item.title" class="similar-image" />
              <span 
                class="brand-overlay"
                @click.stop="goToBrand(item.brand || item.source)"
              >{{ item.brand || item.source }}</span>
              <span v-if="getDiscount(item) > 0" class="discount-badge">
                {{ getDiscount(item) }}% off
              </span>
            </div>
            <div class="similar-info">
              <p class="similar-title">{{ item.title }}</p>
              <span class="similar-price">${{ formatPrice(item.price) }}</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../stores/authStore'
import api from '../utils/api'
import NavBar from './NavBar.vue'

const route = useRoute()
const router = useRouter()
const { isAuthenticated } = useAuth()

// State
const loading = ref(true)
const product = ref({})
const similarProducts = ref([])
const isUpvoted = ref(false)
const upvoteCount = ref(0)
const showPriceDetails = ref(true)
const activeFilter = ref('all')
const sortBy = ref('featured')
const upvotedProducts = ref({})
const isInLibrary = ref(false)
const isInCompare = ref(false)

// Computed
const priceRange = computed(() => {
  if (similarProducts.value.length === 0) {
    return { low: product.value.price * 0.5, high: product.value.price * 1.2 }
  }
  const prices = similarProducts.value.map(p => parseFloat(p.price) || 0)
  return {
    low: Math.min(...prices),
    high: Math.max(...prices)
  }
})

const pricePosition = computed(() => {
  const price = parseFloat(product.value.price) || 0
  const { low, high } = priceRange.value
  if (high === low) return 50
  return ((price - low) / (high - low)) * 100
})

const priceLevel = computed(() => {
  const pos = pricePosition.value
  if (pos < 33) return 'low'
  if (pos < 66) return 'typical'
  return 'high'
})

// Awin Affiliate Link Configuration
const AWIN_PUBLISHER_ID = '2754350'
const AWIN_ADVERTISERS = {
  'asos': '',
  'nordstrom': '',
  'farfetch': '',
  'net-a-porter': '',
  'revolve': '',
  // Add advertiser IDs after Awin approval
}

const affiliateUrl = computed(() => {
  const originalUrl = product.value.url
  if (!originalUrl) return '#'
  
  const source = (product.value.source || product.value.merchant_name || '').toLowerCase()
  const advertiserId = AWIN_ADVERTISERS[source]
  
  // If we have an advertiser ID, generate Awin tracking link
  if (advertiserId) {
    const encodedUrl = encodeURIComponent(originalUrl)
    return `https://www.awin1.com/cread.php?awinmid=${advertiserId}&awinaffid=${AWIN_PUBLISHER_ID}&ued=${encodedUrl}`
  }
  
  // Fall back to original URL
  return originalUrl
})

const filteredSimilarProducts = computed(() => {
  let items = [...similarProducts.value]
  
  // Apply filter
  if (activeFilter.value === 'new') {
    items = items.filter(p => p.condition === 'new' || !p.condition)
  } else if (activeFilter.value === 'used') {
    items = items.filter(p => p.condition === 'used')
  }
  
  // Apply sort
  if (sortBy.value === 'price-low') {
    items.sort((a, b) => (a.price || 0) - (b.price || 0))
  } else if (sortBy.value === 'price-high') {
    items.sort((a, b) => (b.price || 0) - (a.price || 0))
  } else if (sortBy.value === 'discount') {
    items.sort((a, b) => getDiscount(b) - getDiscount(a))
  }
  
  return items
})

// Methods
const formatPrice = (price) => {
  if (!price) return '0.00'
  return parseFloat(price).toFixed(2)
}

const getDiscount = (item) => {
  if (!product.value.price || !item.price) return 0
  const originalPrice = parseFloat(product.value.price)
  const itemPrice = parseFloat(item.price)
  if (itemPrice >= originalPrice) return 0
  return Math.round(((originalPrice - itemPrice) / originalPrice) * 100)
}

const setFilter = (filter) => {
  activeFilter.value = filter
}

const toggleUpvote = async () => {
  isUpvoted.value = !isUpvoted.value
  if (isUpvoted.value) {
    upvoteCount.value++
  } else {
    upvoteCount.value = Math.max(0, upvoteCount.value - 1)
  }
  // TODO: Send upvote to API
}

// Handle upvote with login requirement
const handleUpvote = () => {
  if (!isAuthenticated.value) {
    router.push('/login')
    return
  }
  toggleUpvote()
}

const toggleProductUpvote = (productId) => {
  upvotedProducts.value[productId] = !upvotedProducts.value[productId]
  // TODO: Send upvote to API
}

const goToProduct = (id) => {
  router.push(`/product/${id}`)
}

const goToFashionBoard = () => {
  router.push({
    path: '/storyboard',
    query: { product: JSON.stringify(product.value) }
  })
}

const goToBrand = (brandName) => {
  if (brandName) {
    router.push({
      path: '/brand/' + encodeURIComponent(brandName.toLowerCase().replace(/\s+/g, '-'))
    })
  }
}

// Library functions
const toggleLibrary = () => {
  if (!isAuthenticated.value) {
    router.push('/login')
    return
  }
  
  isInLibrary.value = !isInLibrary.value
  
  // Get current library from localStorage
  const library = JSON.parse(localStorage.getItem('userLibrary') || '[]')
  
  if (isInLibrary.value) {
    // Add to library
    const productData = {
      id: product.value.id,
      title: product.value.title,
      price: product.value.price,
      image_url: product.value.image_url,
      brand: product.value.brand || product.value.merchant_name,
      url: product.value.url,
      savedAt: new Date().toISOString()
    }
    library.push(productData)
  } else {
    // Remove from library
    const index = library.findIndex(item => item.id === product.value.id)
    if (index > -1) {
      library.splice(index, 1)
    }
  }
  
  localStorage.setItem('userLibrary', JSON.stringify(library))
}

const checkLibraryStatus = () => {
  const library = JSON.parse(localStorage.getItem('userLibrary') || '[]')
  isInLibrary.value = library.some(item => item.id === product.value.id)
}

// Compare functions
const toggleCompare = () => {
  const compareList = JSON.parse(localStorage.getItem('fyndaCompare') || '[]')
  const productId = product.value.id
  const index = compareList.findIndex(item => item.id === productId)

  if (index > -1) {
    // Remove from compare
    compareList.splice(index, 1)
    isInCompare.value = false
  } else {
    // Add to compare (max 3)
    if (compareList.length >= 3) {
      compareList.shift() // Remove oldest
    }
    compareList.push({
      id: product.value.id,
      title: product.value.title,
      price: product.value.price,
      original_price: product.value.original_price || null,
      image_url: product.value.image_url,
      brand: product.value.brand || product.value.merchant_name,
      merchant_name: product.value.merchant_name || product.value.source,
      source: product.value.source,
      url: product.value.url,
      description: product.value.description || '',
      condition: product.value.condition || 'New',
    })
    isInCompare.value = true
  }

  localStorage.setItem('fyndaCompare', JSON.stringify(compareList))
  // Notify NavBar to update badge + glow
  window.dispatchEvent(new CustomEvent('compare-updated'))
}

const checkCompareStatus = () => {
  const compareList = JSON.parse(localStorage.getItem('fyndaCompare') || '[]')
  isInCompare.value = compareList.some(item => item.id === product.value.id)
}

const fetchProduct = async (id) => {
  loading.value = true
  try {
    // Check if product data was passed from an explore/category page
    const storedProduct = localStorage.getItem('fyndaViewProduct')
    if (storedProduct) {
      const parsed = JSON.parse(storedProduct)
      localStorage.removeItem('fyndaViewProduct')

      product.value = {
        id: parsed.id || id,
        title: parsed.title,
        price: parsed.price,
        brand: parsed.merchant_name || parsed.source || 'Brand',
        merchant_name: parsed.merchant_name || parsed.source || 'Amazon',
        source: parsed.source || 'Amazon',
        image_url: parsed.image_url || parsed.image,
        url: parsed.url || '#',
        rating: parsed.rating,
        reviews: parsed.reviews,
        badge: parsed.badge,
        original_price: parsed.original_price
      }

      // Fetch similar products from Amazon for the price comparison section
      try {
        const searchTerm = parsed.title ? parsed.title.split(' ').slice(0, 4).join(' ') : 'fashion'
        const response = await fetch(
          `https://real-time-amazon-data.p.rapidapi.com/search?query=${encodeURIComponent(searchTerm)}&page=1&country=US`,
          {
            headers: {
              'x-rapidapi-host': 'real-time-amazon-data.p.rapidapi.com',
              'x-rapidapi-key': '8b4defb9f1msh2f2a139618fa11ep1a3ca8jsn88f8d4935e04'
            }
          }
        )
        const data = await response.json()
        const products = data?.data?.products || []
        similarProducts.value = products
          .filter(p => p.asin !== parsed.id)
          .slice(0, 8)
          .map((p, idx) => ({
            id: p.asin || idx,
            title: p.product_title,
            price: (p.product_price || '$0').replace(/[^0-9.]/g, ''),
            image_url: p.product_photo,
            source: 'Amazon',
            brand: 'Amazon',
            url: p.product_url
          }))
      } catch (similarErr) {
        console.error('Failed to fetch similar products:', similarErr)
      }

      loading.value = false
      return
    }

    // Fallback: try backend API
    const response = await api.get(`/api/search/?q=jacket&limit=10`)
    const deals = response.data.deals || []
    
    // Find the product or use first one
    const foundProduct = deals.find(d => d.id == id) || deals[0]
    if (foundProduct) {
      product.value = foundProduct
      // Use remaining deals as similar products
      similarProducts.value = deals.filter(d => d.id !== foundProduct.id)
    }
  } catch (error) {
    console.error('Failed to fetch product:', error)
    // Use mock data
    product.value = {
      id: id,
      title: 'Z Supply - Do It All Blazer',
      price: 105.00,
      brand: 'Z Supply',
      merchant_name: 'Snagged & Bagged',
      image_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80',
      url: '#'
    }
    similarProducts.value = [
      { id: 1, title: 'Z Supply - Do It All Blazer', brand: 'Z SUPPLY', price: 105.00, image_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80' },
      { id: 2, title: 'No Boundaries Juniors Button Front Blazer B...', brand: 'NO BOUNDARIES', price: 21.53, image_url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80' },
      { id: 3, title: 'No Boundaries Juniors Button Front Blazer B...', brand: 'NO BOUNDARIES', price: 17.22, image_url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80' },
      { id: 4, title: 'New Z Supply Do It All Relaxed Blazer In Black', brand: 'Z SUPPLY', price: 85.00, image_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80' },
    ]
  } finally {
    loading.value = false
  }
}

// Watch for route changes
watch(() => route.params.id, (newId) => {
  if (newId) fetchProduct(newId)
}, { immediate: true })

onMounted(() => {
  if (route.params.id) {
    fetchProduct(route.params.id)
  }
  checkLibraryStatus()
  checkCompareStatus()
})
</script>

<style scoped>
.product-detail-page {
  min-height: 100vh;
  background: #fff;
}

/* Header */
.header {
  width: 100%;
  padding: 0.75rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo {
  height: 50px;
  width: auto;
}

.nav-links {
  display: flex;
  gap: 1.75rem;
}

.nav-links a {
  font-size: 0.8rem;
  font-weight: 500;
  color: #666;
  text-decoration: none;
}

.login-link {
  font-size: 0.85rem;
  font-weight: 500;
  color: #1a1a1a;
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  text-decoration: none;
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  color: #888;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f0f0f0;
  border-top-color: #000;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Main Content */
.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

/* Product Hero */
.product-hero {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
}

/* Left: Image */
.product-image-section {
  display: flex;
  justify-content: center;
}

.image-container {
  position: relative;
  max-width: 500px;
}

.product-image {
  width: 100%;
  height: auto;
  border-radius: 12px;
  object-fit: cover;
  transition: transform 0.3s ease;
  position: relative;
  z-index: 1;
}

.image-container {
  overflow: hidden;
  border-radius: 12px;
}

.image-container:hover .product-image {
  transform: scale(1.08);
}

.upvote-container {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
}

.upvote-btn {
  width: 42px;
  height: 48px;
  background: #fff;
  border: none;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 6px;
}

.upvote-number {
  font-size: 0.7rem;
  font-weight: 600;
  color: #666;
}

.upvote-btn.active .upvote-number {
  color: #fff;
}

.upvote-btn:hover {
  background: #f5f5f5;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.upvote-btn.active {
  background: #1a1a1a;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.upvote-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
  transition: all 0.2s ease;
}

.upvote-btn:hover .upvote-icon {
  transform: translateY(-2px);
}

.upvote-btn.active .upvote-icon {
  filter: brightness(0) invert(1);
}

/* Store name overlay at bottom of image */
.store-name-overlay {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;
  pointer-events: auto;
}

.store-name-overlay:hover {
  background: rgba(0, 0, 0, 0.9);
}

/* Right: Info */
.product-info-section {
  position: sticky;
  top: 100px;
}

.product-info-card {
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: 1.5rem;
}

.store-name {
  font-size: 0.85rem;
  color: #888;
  display: block;
  margin-bottom: 0.25rem;
  cursor: pointer;
  transition: color 0.2s ease;
}

.store-name:hover {
  color: #1a1a1a;
  text-decoration: underline;
}

.product-title {
  font-family: 'Inter', sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.product-meta {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1.25rem;
}

.product-price {
  font-weight: 600;
  color: #1a1a1a;
}

.product-brand {
  color: #888;
  cursor: pointer;
  transition: color 0.2s ease;
}

.product-brand:hover {
  color: #1a1a1a;
  text-decoration: underline;
}

/* Vertical Price Meter */
.price-meter {
  background: #f9f9f9;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.25rem;
}

.meter-header {
  margin-bottom: 1rem;
}

.meter-title {
  font-weight: 600;
  font-size: 0.9rem;
  color: #1a1a1a;
}

.meter-content {
  display: flex;
  gap: 1.5rem;
}

.meter-bar-container {
  display: flex;
  gap: 0.5rem;
}

.meter-bar {
  width: 8px;
  height: 100px;
  background: linear-gradient(to top, #10b981 0%, #6366f1 50%, #8b5cf6 100%);
  border-radius: 4px;
  position: relative;
}

.meter-marker {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 16px;
  background: #fff;
  border: 3px solid #1a1a1a;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.meter-labels {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100px;
  font-size: 0.75rem;
  color: #666;
}

.meter-label.high { color: #8b5cf6; }
.meter-label.low { color: #10b981; }

.meter-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.current-price-tag {
  display: inline-flex;
  flex-direction: column;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.current-price-tag.low {
  background: #ecfdf5;
}

.current-price-tag.typical {
  background: #f5f3ff;
}

.current-price-tag.high {
  background: #faf5ff;
}

.price-amount {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
}

.price-level {
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.current-price-tag.low .price-level { color: #10b981; }
.current-price-tag.typical .price-level { color: #6366f1; }
.current-price-tag.high .price-level { color: #8b5cf6; }

.meter-description {
  font-size: 0.8rem;
  color: #888;
}

/* Shop Button */
.shop-btn {
  display: block;
  width: 100%;
  padding: 1rem;
  background: #1a1a1a;
  color: #fff;
  text-align: center;
  text-decoration: none;
  font-weight: 500;
  border-radius: 8px;
  transition: background 0.2s ease;
}

.shop-btn:hover {
  background: #000;
}

/* Outfit Button */
.outfit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.875rem;
  background: #fff;
  color: #1a1a1a;
  border: 1px solid #1a1a1a;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.75rem;
}

.outfit-btn:hover {
  background: #f5f5f5;
}

/* Action Row */
.action-row {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.action-row .outfit-btn {
  flex: 1;
  margin-top: 0;
}

/* Library Button - Small Icon */
.library-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  min-width: 48px;
  height: 48px;
  padding: 0;
  background: #1a1a1a;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.library-btn:hover {
  background: #333;
  transform: scale(1.05);
}

.library-btn.saved {
  background: #10b981;
}

.library-btn.saved:hover {
  background: #059669;
}

/* Compare Button - Full Width */
.compare-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  background: #fff;
  color: #1a1a1a;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 0.88rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.5rem;
}

.compare-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: #eff6ff;
}

.compare-btn.added {
  background: #eff6ff;
  border-color: #3b82f6;
  color: #3b82f6;
}

.compare-btn.added:hover {
  background: #dbeafe;
}

/* Similar Section */
.similar-section {
  border-top: 1px solid #f0f0f0;
  padding-top: 2rem;
}

.similar-title {
  font-family: 'Inter', sans-serif;
  font-size: 1.1rem;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 1rem;
}

/* Filters */
.filters-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.filter-buttons {
  display: flex;
  gap: 0.5rem;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 1rem;
  background: #fff;
  border: 1px solid #1a1a1a;
  border-radius: 20px;
  font-size: 0.85rem;
  color: #1a1a1a;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  background: #f5f5f5;
}

.filter-btn.active {
  background: #1a1a1a;
  color: #fff;
  border-color: #1a1a1a;
}

.filter-icon {
  font-size: 0.9rem;
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-select {
  padding: 0.5rem 1rem;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  font-size: 0.85rem;
  background: #fff;
  cursor: pointer;
}

.view-toggle {
  padding: 0.5rem;
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
}

/* Similar Grid */
.similar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
}

.similar-card {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.similar-card:hover {
  transform: translateY(-4px);
}

.similar-image-container {
  position: relative;
  aspect-ratio: 3/4;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.similar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.similar-card:hover .similar-image {
  transform: scale(1.05);
}

.card-upvote-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 32px;
  height: 32px;
  background: #fff;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s ease;
  padding: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-upvote-btn:hover {
  background: #f5f5f5;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-upvote-btn.active {
  background: #1a1a1a;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
}

.card-upvote-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
  transition: all 0.2s ease;
}

.card-upvote-btn:hover .card-upvote-icon {
  transform: translateY(-2px);
}

.card-upvote-btn.active .card-upvote-icon {
  filter: brightness(0) invert(1);
}

.brand-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: #fff;
  padding: 1.5rem 0.5rem 0.5rem;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: background 0.2s ease;
  z-index: 5;
}

.brand-overlay:hover {
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.85));
}

.discount-badge {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  bottom: auto;
  right: auto;
  width: auto;
  height: auto;
  display: inline-block;
  background: #666;
  color: #fff;
  padding: 0.15rem 0.4rem;
  border-radius: 3px;
  font-size: 0.65rem;
  font-weight: 600;
  z-index: 10;
  line-height: 1;
  white-space: nowrap;
}

.similar-info {
  padding: 0 0.25rem;
}

.similar-brand {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #888;
  display: block;
  margin-bottom: 0.25rem;
}

.similar-title {
  font-size: 0.85rem;
  color: #1a1a1a;
  margin-bottom: 0.35rem;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.similar-price {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a1a1a;
}

/* Responsive */
@media (max-width: 900px) {
  .product-hero {
    grid-template-columns: 1fr;
  }
  
  .product-info-section {
    position: static;
  }
  
  .nav-links {
    display: none;
  }
}
</style>
