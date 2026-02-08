<template>
  <div id="app">
    <!-- Header -->
    <header class="header">
      <a href="/" class="logo-link" @click.prevent="goHome">
        <img src="../assets/fynda-png-1.png" alt="Fynda" class="logo" />
      </a>
      <nav class="nav-links">
        <router-link to="/shop/women" class="nav-link">Women</router-link>
        <router-link to="/shop/men" class="nav-link">Men</router-link>
        <router-link to="/shop/home" class="nav-link">Home</router-link>
        <router-link to="/shop/beauty" class="nav-link">Beauty</router-link>
      </nav>
      <!-- Auth Section -->
      <div class="auth-section">
        <template v-if="isAuthenticated">
          <router-link to="/storyboard" class="storyboard-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            Storyboard
          </router-link>
          <div class="user-dropdown">
            <button class="user-btn" @click="showUserMenu = !showUserMenu">
              <span class="user-avatar">{{ userInitials }}</span>
              <span class="user-name">{{ currentUser?.first_name || 'Account' }}</span>
            </button>
            <div v-if="showUserMenu" class="dropdown-menu">
              <a href="#" @click.prevent="goToProfile">Profile</a>
              <a href="#" @click.prevent="handleLogout">Logout</a>
            </div>
          </div>
        </template>
        <template v-else>
          <router-link to="/login" class="login-link">Sign In</router-link>
        </template>
      </div>
    </header>
    
    <main class="main-content">
      <!-- Hero Section -->
      <section class="hero-section">
        <h1 class="hero-title">{{ categoryTitle }}</h1>
        <p class="hero-subtitle">Discover trending fashion and deals from everywhere</p>
        
        <!-- AI-Style Search Box -->
        <div class="ai-search-container">
          <!-- Pasted/Uploaded Image Preview -->
          <div v-if="pastedImage" class="paste-preview">
            <img :src="pastedImage.preview" alt="Search image" class="paste-preview-img" />
            <div class="paste-preview-info">
              <span class="paste-preview-label">Visual Search</span>
              <span class="paste-preview-detail">{{ pastedImage.name }}</span>
            </div>
            <button class="paste-preview-remove" @click="removePastedImage" title="Remove image">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
            <button class="paste-search-btn" @click="searchWithPastedImage" :disabled="loading">
              <span v-if="loading" class="spinner-sm"></span>
              <span v-else>Find Similar</span>
            </button>
          </div>

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
              @paste="handlePaste"
              :placeholder="pastedImage ? 'Add description (optional)...' : ''"
            />
            <span v-if="!searchQuery && !isSearchFocused && !pastedImage" class="ai-animated-placeholder">
              {{ animatedPrompt }}
            </span>
            
            <!-- Image Upload Button -->
            <label class="image-upload-btn" title="Search by image or paste (Ctrl+V)">
              <input type="file" accept="image/*" @change="handleImageUpload" hidden />
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="m21 15-5-5L5 21"/>
              </svg>
            </label>
            
            <!-- Search Button -->
            <button class="search-btn" @click="handleSearch">
              Search
            </button>
          </div>
          
          <!-- Quick Suggestions -->
          <div class="quick-suggestions">
            <span class="suggestion-label">Try:</span>
            <button v-for="suggestion in quickSuggestions" :key="suggestion" @click="searchSuggestion(suggestion)">
              {{ suggestion }}
            </button>
            <span class="suggestion-divider">|</span>
            <span class="suggestion-hint">📋 Paste an image (Ctrl+V)</span>
          </div>
        </div>
      </section>

      <!-- Explore Brands Section (Homepage Only) -->
      <section v-if="!hasSearched && currentCategory === 'all'" class="brands-section">
        <h2 class="section-title">Explore Brands</h2>
        <div class="brands-grid">
          <div 
            v-for="brand in featuredBrands" 
            :key="brand.name" 
            class="brand-card"
            @click="searchBrand(brand.name)"
          >
            <div class="brand-logo-container">
              <span class="brand-initial">{{ brand.initial }}</span>
            </div>
            <span class="brand-name">{{ brand.name }}</span>
            <span class="brand-category">{{ brand.category }}</span>
          </div>
        </div>
      </section>
      
      <!-- Trending Section -->
      <section v-if="!hasSearched && trendingDeals.length > 0" class="products-section">
        <h2 class="section-title">Trending Now</h2>
        <div class="masonry-grid">
          <div 
            v-for="(deal, index) in visibleTrendingDeals" 
            :key="'trending-' + deal.id" 
            class="masonry-item"
            :class="getCardSize(index)"
            @click="openDeal(deal)"
          >
            <div class="card-image">
              <img :src="deal.image_url || deal.image" :alt="deal.title" loading="lazy" />
              <span v-if="deal.discount_percent" class="discount-badge">{{ deal.discount_percent }}% off</span>
            </div>
            <div class="card-info">
              <span class="card-brand">{{ (deal.merchant_name || deal.source || 'Brand').toUpperCase() }}</span>
              <h3 class="card-title">{{ deal.title }}</h3>
              <span class="card-price">${{ formatPrice(deal.price) }}</span>
            </div>
          </div>
        </div>
        
        <!-- Load More Button -->
        <div v-if="trendingVisibleCount < trendingDeals.length" class="load-more-container">
          <button class="load-more-btn" @click="loadMoreTrending">Load More</button>
        </div>
        <div v-else-if="trendingDeals.length > 12" class="all-loaded">
          <span>Showing all {{ trendingDeals.length }} trending items</span>
        </div>
      </section>
      
      <!-- Search Results -->
      <section v-if="hasSearched" class="products-section">
        <div class="results-header">
          <div class="results-info">
            <h2 class="section-title">Results for "{{ lastSearchQuery }}"</h2>
            <span class="results-count">{{ deals.length }} items found</span>
          </div>
          
          <!-- Sort Options -->
          <div class="sort-container">
            <label>Sort by:</label>
            <select v-model="sortBy" class="sort-select">
              <option value="relevance">Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="discount">Biggest Discount</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>
        
        <!-- Quota Warning Banner -->
        <div v-if="quotaWarning" class="quota-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{{ quotaWarning }}</span>
        </div>
        
        <!-- Inline Loading State -->
        <div v-if="loading" class="inline-loading">
          <div class="loading-spinner-inline"></div>
          <p>Finding the best deals...</p>
        </div>
        
        <!-- Masonry Grid Results -->
        <div v-else-if="sortedDeals.length > 0" class="masonry-grid">
          <div 
            v-for="(deal, index) in visibleDeals" 
            :key="deal.id" 
            class="masonry-item"
            :class="getCardSize(index)"
            @click="openDeal(deal)"
          >
            <div class="card-image">
              <img :src="deal.image_url || deal.image" :alt="deal.title" loading="lazy" />
              <span v-if="deal.discount_percent" class="discount-badge">{{ deal.discount_percent }}% off</span>
            </div>
            <div class="card-info">
              <span class="card-brand">{{ (deal.merchant_name || deal.source || 'Brand').toUpperCase() }}</span>
              <h3 class="card-title">{{ deal.title }}</h3>
              <span class="card-price">${{ formatPrice(deal.price) }}</span>
            </div>
          </div>
        </div>
        
        <!-- Infinite Scroll Sentinel -->
        <div v-if="sortedDeals.length > 0 && visibleCount < sortedDeals.length" ref="scrollSentinel" class="scroll-sentinel">
          <div class="loading-more">
            <div class="loading-spinner-inline"></div>
            <span>Loading more deals...</span>
          </div>
        </div>
        
        <!-- Show count -->
        <div v-if="sortedDeals.length > 0 && visibleCount >= sortedDeals.length && sortedDeals.length > 12" class="all-loaded">
          <span>Showing all {{ sortedDeals.length }} items</span>
        </div>
        
        <!-- Empty State -->
        <div v-else-if="!loading" class="empty-state">
          <h3>No results found</h3>
          <p>Try searching for something else like "sneakers" or "dress"</p>
        </div>
      </section>
    </main>
    
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-main">
          <div class="footer-brand">
            <img src="../assets/fynda-png-1.png" alt="Fynda" class="footer-logo" />
            <p class="footer-tagline">Discover the best deals from everywhere, all in one place.</p>
          </div>
          
          <div class="footer-links">
            <div class="footer-column">
              <h4>Shop</h4>
              <a href="#" @click.prevent="setCategory('women')">Women</a>
              <a href="#" @click.prevent="setCategory('men')">Men</a>
              <a href="#" @click.prevent="setCategory('home')">Home</a>
              <a href="#" @click.prevent="setCategory('beauty')">Beauty</a>
            </div>
            
            <div class="footer-column">
              <h4>Company</h4>
              <a href="#">About Us</a>
              <a href="#">Careers</a>
              <a href="#">Press</a>
              <a href="#">Blog</a>
            </div>
            
            <div class="footer-column">
              <h4>Support</h4>
              <a href="#">Help Center</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Contact Us</a>
            </div>
            
            <div class="footer-column">
              <h4>Connect</h4>
              <a href="#">Instagram</a>
              <a href="#">Twitter</a>
              <a href="#">TikTok</a>
              <a href="#">Pinterest</a>
            </div>
          </div>
        </div>
        
        <div class="footer-bottom">
          <p>© 2026 Fynda. All rights reserved.</p>
          <div class="footer-legal">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../stores/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

// Router and Auth
const router = useRouter()
const { isAuthenticated, currentUser, logout } = useAuth()

// User initials computed
const userInitials = computed(() => {
  if (!currentUser.value) return '?'
  const first = currentUser.value.first_name?.[0] || ''
  const last = currentUser.value.last_name?.[0] || ''
  return (first + last).toUpperCase() || currentUser.value.email?.[0]?.toUpperCase() || '?'
})

// Search state
const searchQuery = ref('')
const lastSearchQuery = ref('')
const deals = ref([])
const trendingDeals = ref([])
const loading = ref(false)
const hasSearched = ref(false)
const isSearchFocused = ref(false)
const currentCategory = ref('all')
const pastedImage = ref(null)
const sortBy = ref('relevance')
const showUserMenu = ref(false)
const visibleCount = ref(12)
const trendingVisibleCount = ref(12)
const scrollSentinel = ref(null)
const quotaWarning = ref('')
let scrollObserver = null

// Quick suggestions
const quickSuggestions = ['Vintage jacket', 'Running shoes', 'Designer bag', 'Summer dress']

// Featured Brands
const featuredBrands = ref([
  { name: 'Nike', initial: 'N', category: 'Sportswear' },
  { name: 'Gucci', initial: 'G', category: 'Luxury Fashion' },
  { name: 'Apple', initial: 'A', category: 'Technology' },
  { name: 'Zara', initial: 'Z', category: 'Fast Fashion' },
  { name: 'Louis Vuitton', initial: 'LV', category: 'Luxury' },
  { name: 'Adidas', initial: 'A', category: 'Sportswear' },
  { name: 'H&M', initial: 'H', category: 'Fashion' },
  { name: 'Sephora', initial: 'S', category: 'Beauty' },
])

// Animated search prompts
const searchPrompts = [
  'Find me a vintage leather jacket under $200...',
  'Show Nike Air Jordan 1 best deals...',
  'Summer dress for beach vacation...',
  'Designer handbag with best discount...',
  'Wireless headphones with noise canceling...',
]
const currentPromptIndex = ref(0)
const animatedPrompt = ref(searchPrompts[0])
let promptInterval = null

// Category titles
const categoryTitles = {
  all: 'All Products',
  women: 'Women\'s Fashion',
  men: 'Men\'s Fashion',
  home: 'Home & Living',
  beauty: 'Beauty & Care',
}

const categoryTitle = computed(() => categoryTitles[currentCategory.value])

// Get card size - creates varied masonry pattern
const getCardSize = (index) => {
  // Pattern: tall, normal, normal, wide, normal, tall, normal, normal, wide, tall...
  const pattern = ['tall', 'normal', 'normal', 'wide', 'normal', 'tall', 'normal', 'normal', 'wide', 'tall', 'normal', 'normal']
  return pattern[index % pattern.length]
}

// Sorted deals
const sortedDeals = computed(() => {
  const sorted = [...deals.value]
  switch (sortBy.value) {
    case 'price-low':
      return sorted.sort((a, b) => (a.price || 0) - (b.price || 0))
    case 'price-high':
      return sorted.sort((a, b) => (b.price || 0) - (a.price || 0))
    case 'discount':
      return sorted.sort((a, b) => (b.discount_percent || 0) - (a.discount_percent || 0))
    case 'newest':
      return sorted.reverse()
    default:
      return sorted
  }
})

// Visible deals (lazy loaded)
const visibleDeals = computed(() => {
  return sortedDeals.value.slice(0, visibleCount.value)
})

// Visible trending deals (load-more)
const visibleTrendingDeals = computed(() => {
  return trendingDeals.value.slice(0, trendingVisibleCount.value)
})

// Load more trending deals
const loadMoreTrending = () => {
  trendingVisibleCount.value = Math.min(trendingVisibleCount.value + 12, trendingDeals.value.length)
}

// Infinite scroll - load more when sentinel is visible
const setupScrollObserver = () => {
  if (scrollObserver) scrollObserver.disconnect()
  
  scrollObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && visibleCount.value < sortedDeals.value.length) {
      visibleCount.value = Math.min(visibleCount.value + 12, sortedDeals.value.length)
    }
  }, { rootMargin: '200px' })
  
  nextTick(() => {
    if (scrollSentinel.value) {
      scrollObserver.observe(scrollSentinel.value)
    }
  })
}

// Watch deals changes to setup observer
watch(() => deals.value.length, () => {
  nextTick(() => setupScrollObserver())
})

// Watch visibleCount to re-observe sentinel
watch(visibleCount, () => {
  nextTick(() => {
    if (scrollSentinel.value && scrollObserver) {
      scrollObserver.observe(scrollSentinel.value)
    }
  })
})

// Format price
const formatPrice = (price) => {
  if (!price) return '0.00'
  return parseFloat(price).toFixed(2)
}

// Handle blur with delay
const handleBlur = () => {
  setTimeout(() => {
    isSearchFocused.value = false
  }, 200)
}

// Go home
const goHome = () => {
  currentCategory.value = 'all'
  hasSearched.value = false
  searchQuery.value = ''
  deals.value = []
}

// Go to profile
const goToProfile = () => {
  showUserMenu.value = false
  // TODO: Navigate to profile page when implemented
  alert('Profile page coming soon!')
}

// Handle logout
const handleLogout = async () => {
  showUserMenu.value = false
  await logout()
  router.push('/')
}

// Search suggestion
const searchSuggestion = (suggestion) => {
  searchQuery.value = suggestion
  handleSearch()
}

// Search brand
const searchBrand = (brandName) => {
  searchQuery.value = brandName
  handleSearch()
}

// Toggle favorite
const toggleFavorite = (deal) => {
  console.log('Favorited:', deal.title)
}

// ============================================================
// Image Paste & Upload — Visual Search
// ============================================================

// Handle Ctrl+V paste
const handlePaste = async (event) => {
  const items = event.clipboardData?.items
  if (!items) return
  
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      event.preventDefault()
      const file = item.getAsFile()
      if (file) {
        await previewImage(file)
      }
      return
    }
  }
}

// Create preview for a pasted/uploaded image (doesn't search yet)
const previewImage = async (file) => {
  // Validate
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    alert('Please use a JPEG, PNG, or WebP image')
    return
  }
  if (file.size > 10 * 1024 * 1024) {
    alert('Image must be under 10MB')
    return
  }
  
  // Create preview URL
  const preview = URL.createObjectURL(file)
  pastedImage.value = {
    file,
    preview,
    name: file.name || 'Pasted image'
  }
}

// Remove pasted image
const removePastedImage = () => {
  if (pastedImage.value?.preview) {
    URL.revokeObjectURL(pastedImage.value.preview)
  }
  pastedImage.value = null
}

// Search with the pasted/uploaded image
const searchWithPastedImage = async () => {
  if (!pastedImage.value) return
  await processImageFile(pastedImage.value.file)
}

// Handle file input upload
const handleImageUpload = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  event.target.value = ''
  await previewImage(file)
  // Auto-search immediately on file picker upload
  if (pastedImage.value) {
    await processImageFile(pastedImage.value.file)
  }
}

// Core: send image to backend for visual search
const processImageFile = async (file) => {
  loading.value = true
  hasSearched.value = true
  lastSearchQuery.value = 'Visual Search'
  
  try {
    const formData = new FormData()
    formData.append('image', file)
    
    const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
    const response = await fetch(`${apiUrl}/api/upload/`, {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Failed to analyze image')
    }
    
    const data = await response.json()
    console.log('Visual search result:', data)
    
    if (data.search_queries?.length > 0) {
      lastSearchQuery.value = data.search_queries[0]
      searchQuery.value = data.search_queries[0]
    }
    
    deals.value = data.deals || []
    
    if (deals.value.length === 0) {
      alert('No products found. Try a different image.')
    }
    
    // Keep the image preview visible after search (don't clear it)
  } catch (error) {
    console.error('Visual search failed:', error)
    deals.value = []
    alert(error.message || 'Visual search failed. Please try again.')
  } finally {
    loading.value = false
  }
}

// Set category and search
const setCategory = (category) => {
  currentCategory.value = category
  hasSearched.value = false
  deals.value = []
  
  const categoryQueries = {
    women: 'dress',
    men: 'jacket',
    home: 'furniture',
    beauty: 'skincare',
  }
  
  if (categoryQueries[category]) {
    searchQuery.value = categoryQueries[category]
    handleSearch()
  } else {
    loadTrending()
  }
}

// Handle search
const handleSearch = async () => {
  if (!searchQuery.value.trim()) return
  
  loading.value = true
  hasSearched.value = true
  lastSearchQuery.value = searchQuery.value
  sortBy.value = 'relevance'
  visibleCount.value = 12  // Reset lazy load on new search
  quotaWarning.value = ''  // Clear previous warning
  
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
    const response = await fetch(`${apiUrl}/api/search/?q=${encodeURIComponent(searchQuery.value)}`)
    const data = await response.json()
    
    deals.value = data.deals || []
    
    // Check for quota warning from backend
    if (data.quota_warning) {
      quotaWarning.value = data.quota_warning
    }
  } catch (error) {
    console.error('Search failed:', error)
    deals.value = []
  } finally {
    loading.value = false
  }
}

// Load trending deals
const loadTrending = async () => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
    const response = await fetch(`${apiUrl}/api/search/?q=trending`)
    const data = await response.json()
    trendingDeals.value = data.deals || []
  } catch (error) {
    console.error('Failed to load trending:', error)
  }
}

// Open deal - navigate to product detail page
const openDeal = (deal) => {
  router.push(`/product/${deal.id}`)
}

// Animate search prompts
const animatePrompts = () => {
  promptInterval = setInterval(() => {
    currentPromptIndex.value = (currentPromptIndex.value + 1) % searchPrompts.length
    animatedPrompt.value = searchPrompts[currentPromptIndex.value]
  }, 4000)
}

onMounted(() => {
  animatePrompts()
  loadTrending()
})

onUnmounted(() => {
  if (promptInterval) {
    clearInterval(promptInterval)
  }
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@400;500&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: #fff;
  color: #1a1a1a;
  line-height: 1.5;
}

a {
  text-decoration: none;
  color: inherit;
}

/* App Layout */
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  width: 100%;
  padding: 0 6px;
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
  height: 60px;
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
  padding: 0.4rem 0;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
}

.nav-links a:hover,
.nav-links a.active {
  color: #000;
  border-color: #000;
}

/* Auth Section */
.auth-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.storyboard-link {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  font-weight: 500;
  color: #666;
  text-decoration: none;
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.storyboard-link:hover {
  color: #000;
  background: #f5f5f5;
}

.login-link {
  font-size: 0.85rem;
  font-weight: 500;
  color: #1a1a1a;
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  transition: all 0.2s ease;
  text-decoration: none;
}

.login-link:hover {
  background: #000;
  color: #fff;
  border-color: #000;
}

.user-dropdown {
  position: relative;
}

.user-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  background: #f5f5f5;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.user-btn:hover {
  background: #eee;
}

.user-avatar {
  width: 28px;
  height: 28px;
  background: #000;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

.user-name {
  font-size: 0.85rem;
  font-weight: 500;
  color: #1a1a1a;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 150px;
  z-index: 200;
}

.dropdown-menu a {
  display: block;
  padding: 0.75rem 1rem;
  color: #1a1a1a;
  font-size: 0.9rem;
  text-decoration: none;
  transition: background 0.2s ease;
}

.dropdown-menu a:hover {
  background: #f5f5f5;
}

.dropdown-menu a:first-child {
  border-radius: 8px 8px 0 0;
}

.dropdown-menu a:last-child {
  border-radius: 0 0 8px 8px;
}

/* Hero Section */
.hero-section {
  text-align: center;
  padding: 1.5rem 0 1rem;
}

.hero-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(1.75rem, 3.5vw, 2.5rem);
  font-weight: 400;
  color: #1a1a1a;
  margin-bottom: 0.2rem;
}

.hero-subtitle {
  font-size: 0.85rem;
  color: #888;
  margin-bottom: 1.25rem;
}

/* AI Search Box */
.ai-search-container {
  max-width: 550px;
  margin: 0 auto;
}

.ai-search-box {
  display: flex;
  align-items: center;
  background: #fff;
  border: 2px solid #e0e0e0;
  border-radius: 28px;
  padding: 0.5rem 0.5rem 0.5rem 1.25rem;
  min-height: 56px;
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
  font-size: 1rem;
  color: #1a1a1a;
  outline: none;
  min-width: 0;
  height: 40px;
}

.ai-animated-placeholder {
  position: absolute;
  left: 2.5rem;
  color: #999;
  font-size: 0.9rem;
  pointer-events: none;
  white-space: nowrap;
  animation: fadeInOut 4s ease-in-out infinite;
}

@keyframes fadeInOut {
  0%, 100% { opacity: 0; }
  15%, 85% { opacity: 1; }
}

.image-upload-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  color: #666;
  transition: all 0.2s ease;
  margin-right: 0.5rem;
}

.image-upload-btn:hover {
  background: #f0f0f0;
  color: #000;
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

/* Paste Preview */
.paste-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8f8f8;
  border: 1px solid #e5e5e5;
  border-radius: 16px;
  padding: 10px 14px;
  margin-bottom: 10px;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

.paste-preview-img {
  width: 44px;
  height: 44px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
}

.paste-preview-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.paste-preview-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #1a1a1a;
}

.paste-preview-detail {
  font-size: 0.7rem;
  color: #888;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.paste-preview-remove {
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #999;
  transition: all 0.2s;
}

.paste-preview-remove:hover {
  background: #fef2f2;
  color: #ef4444;
}

.paste-search-btn {
  padding: 8px 18px;
  background: #1a1a1a;
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.paste-search-btn:hover:not(:disabled) {
  background: #333;
}

.paste-search-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner-sm {
  width: 14px;
  height: 14px;
  border: 2px solid transparent;
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}

/* Quick Suggestions */
.quick-suggestions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  margin-top: 0.65rem;
  flex-wrap: wrap;
}

.suggestion-label {
  font-size: 0.75rem;
  color: #888;
}

.suggestion-divider {
  font-size: 0.7rem;
  color: #ddd;
  margin: 0 2px;
}

.suggestion-hint {
  font-size: 0.72rem;
  color: #aaa;
}

.quick-suggestions button {
  padding: 0.3rem 0.65rem;
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  font-family: 'Inter', sans-serif;
  font-size: 0.7rem;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-suggestions button:hover {
  border-color: #000;
  color: #000;
}

/* Sections */
.section-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.35rem;
  font-weight: 400;
  margin-bottom: 0.85rem;
}

/* Explore Brands */
.brands-section {
  padding: 1.25rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.brands-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0.85rem;
}

@media (max-width: 900px) { .brands-grid { grid-template-columns: repeat(4, 1fr); } }
@media (max-width: 450px) { .brands-grid { grid-template-columns: repeat(4, 1fr); gap: 0.4rem; } }

.brand-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.brand-card:hover { transform: translateY(-2px); }

.brand-logo-container {
  width: 55px;
  height: 55px;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.35rem;
  transition: all 0.2s ease;
}

.brand-card:hover .brand-logo-container { background: #000; }

.brand-initial {
  font-family: 'Playfair Display', serif;
  font-size: 1rem;
  font-weight: 500;
  color: #333;
  transition: color 0.2s ease;
}

.brand-card:hover .brand-initial { color: #fff; }

.brand-name {
  font-size: 0.7rem;
  font-weight: 600;
  color: #333;
}

.brand-category {
  font-size: 0.55rem;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

/* Products Section */
.products-section {
  padding: 1.25rem 0;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.85rem;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.results-info { display: flex; flex-direction: column; gap: 0.1rem; }
.results-count { color: #888; font-size: 0.75rem; }

/* Sort */
.sort-container {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.sort-container label {
  font-size: 0.75rem;
  color: #666;
}

.sort-select {
  padding: 0.4rem 1.5rem 0.4rem 0.55rem;
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right 0.4rem center;
  appearance: none;
  cursor: pointer;
}

.sort-select:focus {
  outline: none;
  border-color: #000;
}

/* Inline Loading */
.inline-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2.5rem 1rem;
  gap: 0.65rem;
}

.loading-spinner-inline {
  width: 32px;
  height: 32px;
  border: 3px solid #eee;
  border-top-color: #000;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.inline-loading p {
  color: #888;
  font-size: 0.85rem;
}

/* MASONRY GRID - CSS Columns for true Pixabay-style layout */
.masonry-grid {
  column-count: 4;
  column-gap: 8px;
}

@media (max-width: 1100px) { .masonry-grid { column-count: 3; } }
@media (max-width: 700px) { .masonry-grid { column-count: 2; column-gap: 6px; } }

/* Masonry Item */
.masonry-item {
  break-inside: avoid;
  margin-bottom: 8px;
  cursor: pointer;
  transition: transform 0.2s ease;
  border-radius: 12px;
  overflow: hidden;
}

.masonry-item:hover {
  transform: scale(1.01);
}

/* Card Image - varied heights based on natural image aspect */
.card-image {
  position: relative;
  width: 100%;
  overflow: hidden;
  background: #f0f0f0;
  border-radius: 12px;
}

/* Different aspect ratios for variety */
.masonry-item.tall .card-image {
  aspect-ratio: 3/4;
}

.masonry-item.normal .card-image {
  aspect-ratio: 4/3;
}

.masonry-item.wide .card-image {
  aspect-ratio: 16/10;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.masonry-item:hover .card-image img {
  transform: scale(1.03);
}

/* Discount Badge */
.discount-badge {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(0,0,0,0.8);
  color: white;
  padding: 5px 9px;
  font-size: 0.7rem;
  font-weight: 500;
  border-radius: 5px;
  display: flex;
  align-items: center;
  gap: 3px;
}

.discount-badge::before {
  content: '';
  width: 12px;
  height: 12px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2'%3E%3Cpath d='M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z'/%3E%3Cline x1='7' y1='7' x2='7.01' y2='7'/%3E%3C/svg%3E") no-repeat center;
}

/* Favorite Button */
.favorite-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(255,255,255,0.9);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.2s ease;
}

.masonry-item:hover .favorite-btn {
  opacity: 1;
}

.favorite-btn:hover {
  background: #000;
  color: #fff;
}

/* Card Info - Below Image */
.card-info {
  padding: 10px 4px 6px;
}

.card-brand {
  display: block;
  font-size: 0.65rem;
  font-weight: 400;
  color: #888;
  letter-spacing: 0.02em;
  margin-bottom: 2px;
}

.card-title {
  font-size: 0.8rem;
  font-weight: 400;
  color: #1a1a1a;
  line-height: 1.25;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 4px;
}

.card-price {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1a1a1a;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 2.5rem 1rem;
}

.empty-state h3 {
  font-family: 'Playfair Display', serif;
  font-size: 1.15rem;
  margin-bottom: 0.35rem;
}

.empty-state p { color: #888; font-size: 0.85rem; }

/* Infinite Scroll */
.scroll-sentinel {
  display: flex;
  justify-content: center;
  padding: 2rem 0;
}

.loading-more {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #888;
  font-size: 0.9rem;
}

.all-loaded {
  text-align: center;
  padding: 1.5rem 0;
  color: #aaa;
  font-size: 0.85rem;
}

/* Quota Warning Banner */
.quota-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0.6rem 1rem;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 8px;
  color: #92400e;
  font-size: 0.78rem;
  margin-bottom: 1rem;
}

.quota-banner svg {
  flex-shrink: 0;
  color: #d97706;
}

/* Load More */
.load-more-container {
  display: flex;
  justify-content: center;
  padding: 1.5rem 0 0.5rem;
}

.load-more-btn {
  padding: 0.6rem 2rem;
  background: #fff;
  color: #1a1a1a;
  border: 1.5px solid #ddd;
  border-radius: 24px;
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.load-more-btn:hover {
  background: #1a1a1a;
  color: #fff;
  border-color: #1a1a1a;
}

/* Footer */
.footer {
  background: #fafafa;
  border-top: 1px solid #e5e5e5;
  margin-top: 1.5rem;
  padding: 1.5rem 1.5rem 1rem;
  width: 100vw;
  margin-left: calc(-50vw + 50%);
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-main {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: 1rem;
}

.footer-brand {
  max-width: 280px;
}

.footer-logo {
  height: 28px;
  margin-bottom: 0.5rem;
}

.footer-tagline {
  font-size: 0.78rem;
  color: #666;
  line-height: 1.4;
}

.footer-links {
  display: flex;
  gap: 2.5rem;
}

.footer-column {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.footer-column h4 {
  font-size: 0.75rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
}

.footer-column a {
  font-size: 0.75rem;
  color: #666;
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-column a:hover {
  color: #1a1a1a;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e5e5;
}

.footer-bottom p {
  font-size: 0.72rem;
  color: #888;
}

.footer-legal {
  display: flex;
  gap: 1.5rem;
}

.footer-legal a {
  font-size: 0.72rem;
  color: #888;
  text-decoration: none;
}

.footer-legal a:hover {
  color: #1a1a1a;
}

/* Login Link in Header */
.login-link {
  font-size: 0.85rem;
  font-weight: 500;
  color: #1a1a1a;
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.login-link:hover {
  background: #000;
  color: #fff;
  border-color: #000;
}

/* Responsive Footer */
@media (max-width: 900px) {
  .footer-main {
    flex-direction: column;
  }
  
  .footer-links {
    flex-wrap: wrap;
    gap: 2rem;
  }
  
  .footer-column {
    min-width: 120px;
  }
}

/* Responsive Header */
@media (max-width: 550px) {
  .header {
    flex-direction: column;
    gap: 0.6rem;
    padding: 0.6rem 0.85rem;
  }
  
  .logo { height: 36px; }
  .nav-links { gap: 1rem; }
  .results-header { flex-direction: column; align-items: flex-start; }
  
  .footer-bottom {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style>
