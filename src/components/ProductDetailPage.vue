<template>
  <div class="product-detail-page">
    <!-- Header -->
    <header class="header">
      <router-link to="/" class="logo-link">
        <img src="../assets/fynda-png-1.png" alt="Fynda" class="logo" />
      </router-link>
      <nav class="nav-links">
        <router-link to="/?q=women">Women</router-link>
        <router-link to="/?q=men">Men</router-link>
        <router-link to="/?q=home">Home</router-link>
        <router-link to="/?q=beauty">Beauty</router-link>
      </nav>
      <router-link to="/login" class="login-link" v-if="!isAuthenticated">Sign In</router-link>
    </header>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading product...</p>
    </div>

    <!-- Product Detail -->
    <main v-else class="main-content">
      <!-- Top Section: Product Image + Info -->
      <section class="product-hero">
        <!-- Left: Product Image -->
        <div class="product-image-section">
          <div class="image-container">
            <img :src="product.image_url" :alt="product.title" class="product-image" />
            
            <!-- Upvote Button with Count -->
            <div class="upvote-container">
              <button 
                class="upvote-btn" 
                :class="{ active: isUpvoted, 'show-count': upvoteCount > 0 || isUpvoted }" 
                @click="handleUpvote" 
                title="Upvote this deal"
              >
                <!-- Show icon when not upvoted and no count -->
                <img v-if="!isUpvoted && upvoteCount === 0" :src="upvoteLogo" alt="Upvote" class="upvote-icon" />
                <!-- Show count when upvoted or has upvotes -->
                <span v-else class="upvote-number">
                  {{ upvoteCount }}
                </span>
              </button>
              <span class="upvote-label" :class="{ active: isUpvoted }">
                <template v-if="upvoteCount === 0 && !isUpvoted">Be the first!</template>
                <template v-else-if="upvoteCount === 1">upvote</template>
                <template v-else>upvotes</template>
              </span>
            </div>
          </div>
        </div>

        <!-- Right: Product Info -->
        <div class="product-info-section">
          <div class="product-info-card">
            <span class="store-name" @click="goToBrand(product.merchant_name || product.source)">{{ product.merchant_name || product.source }}</span>
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
                  <p class="meter-description">Compared to {{ similarProducts.length || 'similar' }} items</p>
                </div>
              </div>
            </div>

            <!-- Shop Button -->
            <a :href="product.url" target="_blank" class="shop-btn">
              Shop item
            </a>
            
            <!-- Create Outfit Button -->
            <button class="outfit-btn" @click="goToOutfitLab">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 3v18M5 12h14"/>
              </svg>
              Add to Outfit Studio
            </button>
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
              <button 
                class="card-upvote-btn"
                :class="{ active: upvotedProducts[item.id] }"
                @click.stop="toggleProductUpvote(item.id)"
                title="Upvote"
              >
                <img :src="upvoteLogo" alt="Upvote" class="card-upvote-icon" />
              </button>
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
import upvoteLogo from '../assets/upvote-logo.png'

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

const goToOutfitLab = () => {
  router.push({
    path: '/outfit-lab',
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

const fetchProduct = async (id) => {
  loading.value = true
  try {
    // Mock data for now - replace with actual API call
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
  grid-template-columns: 1fr 400px;
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
  width: 50px;
  height: 50px;
  background: #fff;
  border: none;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 10px;
}

.upvote-number {
  font-size: 1.25rem;
  font-weight: 700;
  color: inherit;
}

.upvote-label {
  font-size: 0.7rem;
  font-weight: 500;
  color: #888;
  text-align: center;
  white-space: nowrap;
}

.upvote-label.active {
  color: #1a1a1a;
  font-weight: 600;
}

.upvote-btn.show-count {
  font-size: 1.1rem;
  font-weight: 700;
}

.upvote-btn:hover {
  background: #f5f5f5;
  transform: scale(1.08);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.upvote-btn.active {
  background: #1a1a1a;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  animation: upvote-pop 0.4s ease;
}

@keyframes upvote-pop {
  0% { transform: scale(1); }
  30% { transform: scale(1.25); }
  50% { transform: scale(0.95); }
  70% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.upvote-icon {
  width: 28px;
  height: 28px;
  object-fit: contain;
  transition: all 0.2s ease;
}

.upvote-btn:hover .upvote-icon {
  transform: translateY(-3px);
}

.upvote-btn.active .upvote-icon {
  filter: brightness(0) invert(1);
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
  background: linear-gradient(to top, #22c55e 0%, #facc15 50%, #ef4444 100%);
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

.meter-label.high { color: #ef4444; }
.meter-label.low { color: #22c55e; }

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
  background: #f0fdf4;
}

.current-price-tag.mid {
  background: #fefce8;
}

.current-price-tag.high {
  background: #fef2f2;
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

.current-price-tag.low .price-level { color: #22c55e; }
.current-price-tag.mid .price-level { color: #ca8a04; }
.current-price-tag.high .price-level { color: #ef4444; }

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
  background: #ef4444;
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
