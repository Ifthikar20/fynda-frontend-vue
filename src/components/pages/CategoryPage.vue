<template>
  <div class="category-page">
    <NavBar />
    
    <main class="category-content">
      <div class="category-container">
        <!-- Hero Section with Logo -->
        <div class="hero-section">
          <router-link to="/" class="hero-logo">
            <img src="../../assets/fynda-png-1.png" alt="Fynda" class="logo-img" />
          </router-link>
          <h1 class="page-title">{{ categoryData.title }}</h1>
          <p class="page-subtitle">{{ categoryData.description }}</p>
        </div>
        
        <!-- Subcategories -->
        <div class="subcategories">
          <button
            v-for="sub in categoryData.subcategories"
            :key="sub"
            :class="['subcategory-btn', { active: activeSubcategory === sub }]"
            @click="selectSubcategory(sub)"
          >
            {{ sub }}
          </button>
        </div>
        
        <!-- Trending Section -->
        <section v-if="categoryData.trending && categoryData.trending.length > 0" class="trending-section">
          <h2>Trending in {{ categoryData.title }}</h2>
          <div class="trending-grid">
            <div v-for="trend in categoryData.trending" :key="trend.name" class="trending-card" @click="searchTrending(trend.query)">
              <div class="trending-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                  <polyline points="17 6 23 6 23 12"/>
                </svg>
              </div>
              <h3>{{ trend.name }}</h3>
            </div>
          </div>
        </section>
        
        <!-- Top Upvoted Section -->
        <section class="upvoted-section">
          <div class="section-header">
            <h2>Top Upvoted</h2>
            <div class="time-filter">
              <button 
                v-for="period in timePeriods" 
                :key="period.value"
                :class="['time-btn', { active: selectedPeriod === period.value }]"
                @click="selectedPeriod = period.value"
              >
                {{ period.label }}
              </button>
            </div>
          </div>
          <div class="upvoted-grid">
            <div v-for="(item, idx) in topUpvoted" :key="idx" class="upvoted-card" @click="goToDeal(item)">
              <span class="rank">#{{ idx + 1 }}</span>
              <img :src="item.image" :alt="item.title" class="upvoted-img" />
              <div class="upvoted-info">
                <span class="upvoted-source">{{ item.source }}</span>
                <h3>{{ item.title }}</h3>
                <div class="upvoted-meta">
                  <span class="upvoted-price">${{ item.price }}</span>
                  <span class="upvoted-votes">
                    <img src="@/assets/upvote-logo.png" alt="Upvote" class="upvote-icon" />
                    {{ item.upvotes }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <!-- Best Discounts Section -->
        <section class="discounts-section">
          <div class="section-header">
            <h2>Best Discounts</h2>
            <span class="section-badge">Up to 80% off</span>
          </div>
          <div class="discounts-grid">
            <div v-for="deal in bestDiscounts" :key="deal.id" class="discount-card" @click="goToDeal(deal)">
              <div class="discount-image">
                <img :src="deal.image_url" :alt="deal.title" />
                <span class="mega-discount">-{{ deal.discount || 50 }}%</span>
              </div>
              <div class="discount-info">
                <h3>{{ deal.title }}</h3>
                <div class="discount-pricing">
                  <span class="new-price">${{ deal.price }}</span>
                  <span class="old-price">${{ deal.original_price || (deal.price * 2).toFixed(0) }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <!-- All Deals Section -->
        <section class="deals-section">
          <div class="section-header">
            <h2>{{ activeSubcategory }} Deals</h2>
            
            <!-- Modern Custom Dropdown -->
            <div class="custom-dropdown" ref="dropdownRef">
              <button class="dropdown-trigger" @click="dropdownOpen = !dropdownOpen">
                <span>{{ sortOptions.find(o => o.value === sortBy)?.label }}</span>
                <svg :class="['dropdown-arrow', { open: dropdownOpen }]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
              <div v-if="dropdownOpen" class="dropdown-menu">
                <button 
                  v-for="option in sortOptions" 
                  :key="option.value"
                  :class="['dropdown-item', { active: sortBy === option.value }]"
                  @click="selectSort(option.value)"
                >
                  <span class="option-label">{{ option.label }}</span>
                  <svg v-if="sortBy === option.value" class="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <div v-if="loading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>Finding the best deals...</p>
          </div>
          
          <div v-else-if="deals.length === 0" class="empty-state">
            <p>No deals found. Try a different category or check back later!</p>
          </div>
          
          <div v-else class="deals-grid">
            <div v-for="deal in deals" :key="deal.id" class="deal-card" @click="goToDeal(deal)">
              <div class="deal-image">
                <img :src="deal.image_url" :alt="deal.title" />
                <span v-if="deal.discount" class="discount-badge">-{{ deal.discount }}%</span>
                <!-- Small Upvote Button -->
                <button 
                  class="deal-upvote-btn" 
                  :class="{ active: upvotedDeals[deal.id] }"
                  @click.stop="toggleDealUpvote(deal)"
                  title="Upvote"
                >
                  <img src="@/assets/upvote-logo.png" alt="Upvote" class="deal-upvote-icon" />
                  <span class="deal-upvote-count">{{ dealUpvoteCounts[deal.id] || 0 }}</span>
                </button>
              </div>
              <div class="deal-info">
                <span class="deal-source">{{ deal.source }}</span>
                <h3 class="deal-title">{{ deal.title }}</h3>
                <div class="deal-pricing">
                  <span class="deal-price">${{ deal.price }}</span>
                  <span v-if="deal.original_price" class="deal-original">${{ deal.original_price }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <button v-if="deals.length > 0" class="load-more-btn" @click="loadMore">
            Load More Deals
          </button>
        </section>
        
        <!-- Best Brands Section (moved to bottom) -->
        <section v-if="categoryData.brands && categoryData.brands.length > 0" class="brands-section">
          <h2>Best Brands</h2>
          <div class="brands-grid">
            <div v-for="brand in categoryData.brands" :key="brand.name" class="brand-card" @click="searchBrand(brand.name)">
              <div class="brand-logo">{{ brand.logo }}</div>
              <span class="brand-name">{{ brand.name }}</span>
            </div>
          </div>
        </section>
      </div>
    </main>
    
    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NavBar from '../NavBar.vue'
import Footer from '../Footer.vue'
import api from '../../utils/api'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const deals = ref([])
const sortBy = ref('popular')
const dropdownOpen = ref(false)
const dropdownRef = ref(null)
const activeSubcategory = ref('All')
const selectedPeriod = ref('today')

// Upvote state
const upvotedDeals = ref({})
const dealUpvoteCounts = ref({})

// Random images for upvoted items
const upvotedImages = [
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200',
  'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=200',
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200',
  'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=200',
]

// Default fallback category data
const defaultCategoryData = {
  title: 'Fashion',
  description: 'Discover the best deals.',
  subcategories: ['All'],
  brands: [],
  trending: [],
  search_query: 'fashion',
}

const sortOptions = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'discount', label: 'Biggest Discount' },
  { value: 'upvotes', label: 'Most Upvoted' },
]

const timePeriods = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'all', label: 'All Time' },
]

const categoryData = ref({...defaultCategoryData})

// Load featured content from backend
const loadFeaturedContent = async () => {
  try {
    const category = route.params.category || 'women'
    const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
    const response = await fetch(`${apiUrl}/api/featured/?category=${category}`)
    const data = await response.json()
    
    if (data.category) {
      categoryData.value = {
        ...defaultCategoryData,
        ...data.category,
      }
    }
  } catch (error) {
    console.error('Failed to load featured content:', error)
  }
}

// Top upvoted — built from actual deal results
const topUpvoted = computed(() => {
  // Use the first 5 deals from search results as "top" items
  return deals.value.slice(0, 5).map((deal, idx) => ({
    id: deal.id || idx,
    title: deal.title,
    source: deal.source || deal.merchant_name || 'Store',
    price: deal.price || 0,
    upvotes: dealUpvoteCounts.value[deal.id] || 0,
    image: deal.image_url || upvotedImages[idx % upvotedImages.length],
  }))
})

// Computed for best discounts
const bestDiscounts = computed(() => {
  return deals.value.slice(0, 4).map(deal => ({
    ...deal,
    discount: Math.floor(Math.random() * 50) + 30
  }))
})

const selectSort = (value) => {
  sortBy.value = value
  dropdownOpen.value = false
}

// Close dropdown on outside click
const handleClickOutside = (e) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    dropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  loadUpvoteState()
  fetchDeals()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const fetchDeals = async () => {
  loading.value = true
  
  try {
    const searchQuery = activeSubcategory.value === 'All' 
      ? categoryData.value.search_query 
      : `${categoryData.value.search_query} ${activeSubcategory.value}`
    
    const response = await api.get('/api/deals/search/', {
      params: { q: searchQuery, limit: 12 }
    })
    
    deals.value = response.data.results || response.data || []
  } catch (err) {
    console.error('Failed to fetch deals:', err)
    deals.value = []
  } finally {
    loading.value = false
  }
}

const selectSubcategory = (sub) => {
  activeSubcategory.value = sub
  fetchDeals()
}

const searchBrand = (brand) => {
  router.push(`/?q=${encodeURIComponent(brand)}`)
}

const searchTrending = (query) => {
  if (query) {
    router.push(`/?q=${encodeURIComponent(query)}`)
  }
}

const goToDeal = (deal) => {
  if (deal.id !== undefined) {
    router.push(`/product/${deal.id || deal.deal_id}`)
  }
}

// Toggle upvote for a deal
const toggleDealUpvote = (deal) => {
  const dealId = deal.id
  const isCurrentlyUpvoted = upvotedDeals.value[dealId]
  
  if (isCurrentlyUpvoted) {
    delete upvotedDeals.value[dealId]
    dealUpvoteCounts.value[dealId] = Math.max(0, (dealUpvoteCounts.value[dealId] || 1) - 1)
  } else {
    upvotedDeals.value[dealId] = true
    dealUpvoteCounts.value[dealId] = (dealUpvoteCounts.value[dealId] || 0) + 1
  }
  
  // Persist to localStorage
  localStorage.setItem('upvotedDeals', JSON.stringify(upvotedDeals.value))
  localStorage.setItem('dealUpvotes', JSON.stringify(dealUpvoteCounts.value))
}

// Load upvote state from localStorage
const loadUpvoteState = () => {
  try {
    upvotedDeals.value = JSON.parse(localStorage.getItem('upvotedDeals') || '{}')
    dealUpvoteCounts.value = JSON.parse(localStorage.getItem('dealUpvotes') || '{}')
  } catch (e) {
    upvotedDeals.value = {}
    dealUpvoteCounts.value = {}
  }
}

const loadMore = () => {
  // TODO: Implement pagination
}

watch(() => route.params.category, () => {
  activeSubcategory.value = 'All'
  loadFeaturedContent()
  fetchDeals()
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  loadUpvoteState()
  loadFeaturedContent()
  fetchDeals()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.category-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.category-content {
  flex: 1;
}

.category-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Hero Section */
.hero-section {
  text-align: center;
  padding: 48px 0 32px;
}

.hero-logo {
  display: inline-block;
  margin-bottom: 20px;
}

.logo-img {
  height: 48px;
  width: auto;
}

.page-title {
  font-size: 42px;
  font-weight: 700;
  color: #111;
  margin-bottom: 12px;
}

.page-subtitle {
  font-size: 18px;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
}

/* Subcategories */
.subcategories {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 40px;
}

.subcategory-btn {
  padding: 10px 20px;
  border: 1px solid #e0e0e0;
  background: #fff;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 500;
  color: #555;
  cursor: pointer;
  transition: all 0.2s ease;
}

.subcategory-btn:hover {
  border-color: #111;
  color: #111;
}

.subcategory-btn.active {
  background: #111;
  border-color: #111;
  color: #fff;
}

/* Trending Section */
.trending-section {
  margin-bottom: 48px;
}

.trending-section h2 {
  font-size: 22px;
  font-weight: 600;
  color: #111;
  margin-bottom: 20px;
}

.trending-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.trending-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: #f8f8f8;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.trending-card:hover {
  background: #f0f0f0;
  transform: translateY(-2px);
}

.trending-icon {
  color: #22c55e;
  flex-shrink: 0;
}

.trending-card h3 {
  font-size: 15px;
  font-weight: 500;
  color: #111;
  margin: 0;
}

/* Upvoted Section - No gray background */
.upvoted-section {
  margin-bottom: 48px;
}

.upvoted-section .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.upvoted-section h2 {
  font-size: 22px;
  font-weight: 600;
  color: #111;
}

.time-filter {
  display: flex;
  gap: 8px;
  background: #f5f5f5;
  padding: 4px;
  border-radius: 12px;
}

.time-btn {
  padding: 8px 16px;
  border: none;
  background: transparent;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
}

.time-btn:hover {
  color: #111;
}

.time-btn.active {
  background: #fff;
  color: #111;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.upvoted-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.upvoted-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upvoted-card:hover {
  border-color: #ddd;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
}

.rank {
  font-size: 18px;
  font-weight: 700;
  color: #111;
  min-width: 40px;
}

.upvoted-img {
  width: 64px;
  height: 64px;
  border-radius: 10px;
  object-fit: cover;
}

.upvoted-info {
  flex: 1;
}

.upvoted-source {
  font-size: 11px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.upvoted-info h3 {
  font-size: 15px;
  font-weight: 500;
  color: #111;
  margin: 4px 0;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.upvoted-meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.upvoted-price {
  font-size: 16px;
  font-weight: 600;
  color: #111;
}

.upvoted-votes {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #22c55e;
  font-weight: 500;
}

.upvoted-votes .upvote-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

/* Discounts Section */
.discounts-section {
  margin-bottom: 48px;
}

.discounts-section .section-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.discounts-section h2 {
  font-size: 22px;
  font-weight: 600;
  color: #111;
}

.section-badge {
  padding: 6px 12px;
  background: linear-gradient(135deg, #ff6b6b, #ee5a5a);
  color: #fff;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.discounts-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.discount-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #eee;
  cursor: pointer;
  transition: all 0.2s ease;
}

.discount-card:hover {
  border-color: #ddd;
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
}

.discount-image {
  position: relative;
  aspect-ratio: 1;
}

.discount-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mega-discount {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 8px 14px;
  background: #666;
  color: #fff;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 700;
}

.discount-info {
  padding: 16px;
}

.discount-info h3 {
  font-size: 14px;
  font-weight: 500;
  color: #111;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.discount-pricing {
  display: flex;
  align-items: center;
  gap: 8px;
}

.new-price {
  font-size: 18px;
  font-weight: 600;
  color: #22c55e;
}

.old-price {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
}

/* Deals Section */
.deals-section {
  padding-bottom: 60px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #111;
}

/* Modern Custom Dropdown */
.custom-dropdown {
  position: relative;
}

.dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dropdown-trigger:hover {
  border-color: #111;
}

.dropdown-arrow {
  transition: transform 0.2s ease;
}

.dropdown-arrow.open {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 200px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.15);
  border: 1px solid #eee;
  padding: 8px;
  z-index: 100;
  animation: dropdownFade 0.2s ease;
}

@keyframes dropdownFade {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 14px;
  border: none;
  background: transparent;
  border-radius: 10px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
}

.dropdown-item:hover {
  background: #f5f5f5;
}

.dropdown-item.active {
  background: #f0f0f0;
  font-weight: 500;
}

.check-icon {
  color: #22c55e;
}

/* Loading & Empty */
.loading-state, .empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #888;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #eee;
  border-top-color: #111;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.deals-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.deal-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #eee;
  cursor: pointer;
  transition: all 0.2s ease;
}

.deal-card:hover {
  border-color: #ddd;
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
}

.deal-image {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}

.deal-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.discount-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 10px;
  background: #666;
  color: #fff;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

/* Small Upvote Button for deal cards */
.deal-upvote-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 32px;
  height: 36px;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  padding: 4px;
  opacity: 0;
}

.deal-card:hover .deal-upvote-btn {
  opacity: 1;
}

.deal-upvote-btn:hover {
  background: #fff;
  transform: scale(1.05);
}

.deal-upvote-btn.active {
  background: #1a1a1a;
  opacity: 1;
}

.deal-upvote-icon {
  width: 14px;
  height: 14px;
  object-fit: contain;
}

.deal-upvote-btn.active .deal-upvote-icon {
  filter: brightness(0) invert(1);
}

.deal-upvote-count {
  font-size: 8px;
  font-weight: 600;
  color: #666;
  line-height: 1;
}

.deal-upvote-btn.active .deal-upvote-count {
  color: #fff;
}

.deal-info {
  padding: 16px;
}

.deal-source {
  font-size: 11px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.deal-title {
  font-size: 14px;
  font-weight: 500;
  color: #111;
  margin: 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.deal-pricing {
  display: flex;
  align-items: center;
  gap: 8px;
}

.deal-price {
  font-size: 18px;
  font-weight: 600;
  color: #111;
}

.deal-original {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
}

.load-more-btn {
  display: block;
  width: 200px;
  margin: 40px auto 0;
  padding: 14px 24px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.load-more-btn:hover {
  border-color: #111;
  background: #111;
  color: #fff;
}

/* Brands Section */
.brands-section {
  margin-bottom: 60px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.brands-section h2 {
  font-size: 22px;
  font-weight: 600;
  color: #111;
  margin-bottom: 20px;
}

.brands-grid {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 12px;
}

.brand-card {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 28px;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #eee;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
}

.brand-card:hover {
  border-color: #111;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.brand-logo {
  width: 48px;
  height: 48px;
  background: #f5f5f5;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin-bottom: 10px;
}

.brand-name {
  font-size: 14px;
  font-weight: 600;
  color: #111;
  margin-bottom: 4px;
}

.brand-deals {
  font-size: 12px;
  color: #888;
}

/* Responsive */
@media (max-width: 1000px) {
  .trending-grid, .deals-grid, .discounts-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 700px) {
  .trending-grid, .deals-grid, .discounts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .page-title {
    font-size: 32px;
  }
  
  .section-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .upvoted-section .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .time-filter {
    width: 100%;
    overflow-x: auto;
  }
}

@media (max-width: 500px) {
  .deals-grid, .discounts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
