<template>
  <div class="brand-page">
    <!-- NavBar -->
    <NavBar />

    <!-- Hero Banner with curved edges -->
    <section class="brand-hero">
      <div class="hero-banner">
        <div class="hero-overlay"></div>
        <!-- Save button in corner -->
        <button class="save-corner-btn" @click="handleSave" :class="{ saved: isSaved }">
          {{ isSaved ? 'Saved' : 'Save' }}
        </button>
        <div class="hero-content">
          <h1 class="brand-name">{{ displayBrandName }}</h1>
          <a :href="brandWebsite" target="_blank" class="hero-btn visit-btn" v-if="brandWebsite">
            Visit ↗
          </a>
        </div>
      </div>
    </section>

    <!-- Filter Row -->
    <section class="filters-section">
      <div class="filter-buttons">
        <button class="filter-btn" :class="{ active: activeFilter === 'sale' }" @click="setFilter('sale')">
          ◇ Sale
        </button>
        <button class="filter-btn" :class="{ active: activeFilter === 'new' }" @click="setFilter('new')">
          ✦ New
        </button>
        <button class="filter-btn" :class="{ active: activeFilter === 'used' }" @click="setFilter('used')">
          ◎ Used
        </button>
      </div>
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input type="text" :placeholder="'Search ' + displayBrandName" v-model="searchQuery" />
      </div>
    </section>

    <!-- Top Trending Section -->
    <section class="trending-section" v-if="!loading && trendingProducts.length > 0">
      <h2 class="section-title">🔥 Top Trending in {{ displayBrandName }}</h2>
      <div class="trending-scroll">
        <div 
          v-for="product in trendingProducts" 
          :key="'trending-' + product.id" 
          class="trending-card"
          @click="goToProduct(product.id)"
        >
          <div class="trending-image-container">
            <img :src="product.image_url" :alt="product.title" class="trending-image" />
            <span class="upvote-count-badge">{{ product.upvotes }}</span>
          </div>
          <div class="trending-info">
            <p class="trending-title">{{ product.title }}</p>
            <span class="trending-price">${{ formatPrice(product.price) }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Products Section -->
    <section class="products-section">
      <h2 class="section-title">From {{ displayBrandName }}</h2>
      
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading products...</p>
      </div>

      <div v-else class="products-grid">
        <div 
          v-for="product in filteredProducts" 
          :key="product.id" 
          class="product-card"
          @click="goToProduct(product.id)"
        >
          <div class="product-image-container">
            <img :src="product.image_url" :alt="product.title" class="product-image" />
          </div>
          <div class="product-info">
            <p class="product-title">{{ product.title }}</p>
            <span class="product-price">${{ formatPrice(product.price) }}</span>
          </div>
        </div>
      </div>
    </section>
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
const products = ref([])
const isSaved = ref(false)
const activeFilter = ref('')
const searchQuery = ref('')

// Computed
const brandSlug = computed(() => route.params.brand || '')
const displayBrandName = computed(() => {
  return brandSlug.value
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
})

const brandWebsite = computed(() => {
  // Could be enhanced with brand database lookup
  return null
})

const filteredProducts = computed(() => {
  let items = [...products.value]
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    items = items.filter(p => p.title.toLowerCase().includes(query))
  }
  
  return items
})

// Top trending products (sorted by upvotes, take top 5)
const trendingProducts = computed(() => {
  return [...products.value]
    .map(p => ({ ...p, upvotes: p.upvotes || Math.floor(Math.random() * 500) + 50 }))
    .sort((a, b) => b.upvotes - a.upvotes)
    .slice(0, 5)
})

// Methods
const formatPrice = (price) => {
  if (!price) return '0.00'
  return parseFloat(price).toFixed(2)
}

const setFilter = (filter) => {
  activeFilter.value = activeFilter.value === filter ? '' : filter
}

const toggleSave = () => {
  isSaved.value = !isSaved.value
}

const handleSave = () => {
  if (!isAuthenticated.value) {
    router.push('/login')
    return
  }
  isSaved.value = !isSaved.value
  // TODO: Save to API
}

const goToProduct = (id) => {
  router.push(`/product/${id}`)
}

const fetchBrandProducts = async () => {
  loading.value = true
  try {
    const response = await api.get(`/api/search/?q=${encodeURIComponent(displayBrandName.value)}&limit=20`)
    products.value = response.data.deals || []
  } catch (error) {
    console.error('Failed to fetch brand products:', error)
    products.value = []
  } finally {
    loading.value = false
  }
}

// Watch for route changes
watch(() => route.params.brand, (newBrand) => {
  if (newBrand) fetchBrandProducts()
}, { immediate: true })

onMounted(() => {
  if (route.params.brand) {
    fetchBrandProducts()
  }
})
</script>

<style scoped>
.brand-page {
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

/* Hero Banner */
.brand-hero {
  padding: 0;
  margin-bottom: 1.5rem;
}

.hero-banner {
  position: relative;
  height: 260px;
  background: linear-gradient(135deg, #1a1a1a 0%, #333 100%);
  border-radius: 24px;
  margin: 0 1rem;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 2rem;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
}

/* Corner Save Button */
.save-corner-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  z-index: 20;
  transition: all 0.25s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.save-corner-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.save-corner-btn.saved {
  background: #1a1a1a;
  color: #fff;
  animation: save-pop 0.4s ease;
}

@keyframes save-pop {
  0% { transform: scale(1); }
  30% { transform: scale(1.25); }
  50% { transform: scale(0.95); }
  100% { transform: scale(1); }
}

.hero-content {
  position: relative;
  z-index: 10;
  text-align: center;
  color: #fff;
  margin-bottom: 0;
}

.brand-name {
  font-family: 'Inter', sans-serif;
  font-size: 2.5rem;
  font-weight: 300;
  letter-spacing: 8px;
  text-transform: uppercase;
  margin-bottom: 1.25rem;
}

.hero-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.hero-btn {
  padding: 0.6rem 1.25rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.visit-btn {
  background: #fff;
  color: #1a1a1a;
  border: none;
}

.visit-btn:hover {
  background: #f5f5f5;
}

.save-btn {
  background: transparent;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.save-btn:hover {
  border-color: #fff;
}

/* Filters Section */
.filters-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1.5rem 1rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-buttons {
  display: flex;
  gap: 0.5rem;
}

.filter-btn {
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
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f5f5f5;
  border-radius: 8px;
  min-width: 200px;
}

.search-box input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 0.85rem;
  width: 100%;
}

.search-icon {
  font-size: 0.8rem;
  opacity: 0.6;
}

/* Products Section */
.products-section {
  padding: 0 1.5rem 2rem;
}

.section-title {
  font-family: 'Inter', sans-serif;
  font-size: 1.1rem;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 1.25rem;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
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

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
}

.product-card {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.product-card:hover {
  transform: translateY(-4px);
}

.product-image-container {
  aspect-ratio: 3/4;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 0.75rem;
  background: #f5f5f5;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.product-info {
  padding: 0 0.25rem;
}

.product-title {
  font-size: 0.85rem;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-price {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a1a1a;
}

/* Trending Section */
.trending-section {
  padding: 0 1.5rem 1.5rem;
}

.trending-scroll {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  -webkit-overflow-scrolling: touch;
}

.trending-scroll::-webkit-scrollbar {
  height: 4px;
}

.trending-scroll::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 2px;
}

.trending-card {
  flex: 0 0 160px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.trending-card:hover {
  transform: translateY(-4px);
}

.trending-image-container {
  position: relative;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 0.5rem;
  background: #f5f5f5;
}

.trending-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upvote-count-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.85);
  color: #fff;
  padding: 0 0.5rem;
  border-radius: 18px;
  font-size: 0.85rem;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.trending-info {
  padding: 0 0.25rem;
}

.trending-title {
  font-size: 0.8rem;
  color: #1a1a1a;
  margin-bottom: 0.15rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.trending-price {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1a1a1a;
}
</style>
