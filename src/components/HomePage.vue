<template>
  <div id="app">
    <NavBar />
    
    <main class="main-content">
      <!-- Hero Section -->
      <section class="hero-section" :class="{ 'hero-chat-mode': aiMode }">
        <!-- Mode Toggle -->
        <div class="mode-toggle">
          <span :class="{ active: !aiMode }" @click="aiMode = false">Classic</span>
          <button class="toggle-track" :class="{ on: aiMode }" @click="aiMode = !aiMode">
            <span class="toggle-thumb"></span>
          </button>
          <span :class="{ active: aiMode }" @click="aiMode = true">AI Chat</span>
        </div>

        <!-- Classic hero title (hidden in chat mode after first message) -->
        <div v-if="!aiMode || chatMessages.length === 0" class="hero-rotating">
          <transition name="hero-fade" mode="out-in">
            <h1 class="hero-title" :class="{ 'hero-title-small': aiMode }" :key="heroPhrase">
              {{ aiMode ? 'Ask Fynda anything' : heroPhrase }}
            </h1>
          </transition>
        </div>

        <!-- Chat Messages Area (AI mode only) -->
        <div v-if="aiMode && chatMessages.length > 0" class="chat-messages" ref="chatMessagesEl">
          <div
            v-for="(msg, i) in chatMessages"
            :key="i"
            class="chat-bubble"
            :class="msg.role"
          >
            <p>{{ msg.text }}</p>
            <!-- Inline product cards after assistant messages -->
            <div v-if="msg.products && msg.products.length > 0" class="chat-products">
              <div
                v-for="product in msg.products.slice(0, 6)"
                :key="product.id"
                class="chat-product-card"
                @click="openDeal(product)"
              >
                <img :src="product.image_url" :alt="product.title" loading="lazy" />
                <div class="chat-product-info">
                  <span class="chat-product-title">{{ product.title }}</span>
                  <span class="chat-product-price">${{ formatPrice(product.price) }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-if="chatLoading" class="chat-bubble assistant">
            <div class="chat-typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>
        
        <!-- AI-Style Search Box -->
        <div class="ai-search-container">
          <!-- Pasted/Uploaded Image Preview -->
          <div v-if="pastedImage" class="paste-preview">
            <img :src="pastedImage.preview" alt="Search image" class="paste-preview-img" />
            <div class="paste-preview-info">
              <span class="paste-preview-label">Visual Search</span>
              <span v-if="loading" class="paste-preview-detail">Analyzing...</span>
              <span v-else class="paste-preview-detail">{{ searchQuery || pastedImage.name }}</span>
            </div>
            <button class="paste-preview-remove" @click="removePastedImage" title="Remove image">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
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
              :placeholder="aiMode ? 'Ask me anything about fashion...' : (pastedImage ? 'Add description (optional)...' : '')"
            />
            <span v-if="!searchQuery && !isSearchFocused && !pastedImage && !aiMode" class="ai-animated-placeholder">
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
              {{ aiMode ? 'Send' : 'Search' }}
            </button>
          </div>
          
          <!-- Quick Suggestions (hidden in AI mode once chat starts) -->
          <div v-if="!aiMode || chatMessages.length === 0" class="quick-suggestions">
            <span class="suggestion-label">Try:</span>
            <transition-group name="suggestion-fade" tag="div" class="suggestion-pills">
              <button
                v-for="suggestion in visibleSuggestions"
                :key="suggestion"
                @click="searchSuggestion(suggestion)"
              >
                {{ suggestion }}
              </button>
            </transition-group>
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
            class="masonry-item card-enter"
            :class="getCardSize(index)"
            :style="{ '--i': index }"
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
            <span class="results-count">
              {{ filteredDeals.length }}
              <template v-if="filteredDeals.length !== deals.length"> of {{ deals.length }}</template>
              items found
            </span>
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
        
        <!-- Filter Chips -->
        <div v-if="!loading && (showGenderFilter || showSizeFilter)" class="filter-bar">
          <div v-if="showGenderFilter" class="filter-group">
            <span class="filter-label">Gender</span>
            <div class="filter-chips">
              <button
                v-for="g in genderOptions"
                :key="g.value"
                class="filter-chip"
                :class="{ active: activeGender === g.value }"
                @click="setGenderFilter(g.value)"
              >
                {{ g.label }}
              </button>
            </div>
          </div>
          <div v-if="showSizeFilter" class="filter-group">
            <span class="filter-label">Size</span>
            <div class="filter-chips">
              <button
                v-for="s in sizeOptions"
                :key="s"
                class="filter-chip"
                :class="{ active: activeSize === s }"
                @click="setSizeFilter(s)"
              >
                {{ s }}
              </button>
            </div>
          </div>
        </div>
        
        <!-- Did You Mean? Suggestion -->
        <div v-if="suggestedQuery && !loading" class="did-you-mean">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <span>Did you mean: </span>
          <button class="suggestion-link" @click="searchSuggestion(suggestedQuery)">"{{ suggestedQuery }}"</button>
          <span>?</span>
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
        <div v-if="hasSearched && !loading && sortedDeals.length === 0" class="empty-state">
          <h3>No results found</h3>
          <p>Try a different filter or search for something else</p>
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
              <router-link to="/about">About Us</router-link>
              <a href="https://blog.fynda.com" target="_blank" rel="noopener">Blog</a>
            </div>
            
            <div class="footer-column">
              <h4>Support</h4>
              <router-link to="/help">Help Center</router-link>
              <router-link to="/privacy">Privacy Policy</router-link>
              <router-link to="/terms">Terms of Service</router-link>
              <router-link to="/contact">Contact Us</router-link>
            </div>
            
            <div class="footer-column">
              <h4>Connect</h4>
              <a href="https://instagram.com/fynda" target="_blank" rel="noopener">Instagram</a>
              <a href="https://twitter.com/fynda" target="_blank" rel="noopener">Twitter</a>
              <a href="https://tiktok.com/@fynda" target="_blank" rel="noopener">TikTok</a>
              <a href="https://pinterest.com/fynda" target="_blank" rel="noopener">Pinterest</a>
            </div>
          </div>
        </div>
        
        <div class="footer-bottom">
          <p>© 2026 Fynda. All rights reserved.</p>
          <div class="footer-legal">
            <router-link to="/privacy">Privacy</router-link>
            <router-link to="/terms">Terms</router-link>
            <router-link to="/cookies">Cookies</router-link>
          </div>
        </div>
      </div>
    </footer>

    <!-- Login Gate Modal (after 3 searches) -->
    <Transition name="gate-fade">
      <div v-if="showLoginGate" class="login-gate-overlay" @click.self="showLoginGate = false">
        <div class="login-gate-modal">
          <button class="gate-close" @click="showLoginGate = false">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          <div class="gate-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" stroke-width="1.5">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>

          <h2 class="gate-title">Sign in to keep searching</h2>
          <p class="gate-subtitle">Create a free account to unlock unlimited searches, save favorites, and get personalized deals.</p>

          <div class="gate-buttons">
            <button class="gate-social-btn gate-google" @click="gateLoginWithGoogle">
              <svg class="gate-social-icon" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <button class="gate-social-btn gate-apple" @click="gateLoginWithApple">
              <svg class="gate-social-icon" viewBox="0 0 24 24" fill="white">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Continue with Apple
            </button>
          </div>

          <div class="gate-footer">
            <span>Don't have an account?</span>
            <router-link to="/register" class="gate-register-link">Create one for free</router-link>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../stores/authStore'
import NavBar from './NavBar.vue'

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
const suggestedQuery = ref(null)
let scrollObserver = null

// AI Chat state
const aiMode = ref(localStorage.getItem('fynda_ai_mode') === 'true')
const chatMessages = ref([])
const chatLoading = ref(false)
const chatMessagesEl = ref(null)
// Search gate state (3 free searches for non-auth users)
const showLoginGate = ref(false)
const FREE_SEARCH_LIMIT = 3
const SEARCH_COUNT_KEY = 'fynda_search_count'

const getSearchCount = () => {
  return parseInt(localStorage.getItem(SEARCH_COUNT_KEY) || '0', 10)
}
const incrementSearchCount = () => {
  const count = getSearchCount() + 1
  localStorage.setItem(SEARCH_COUNT_KEY, count.toString())
  return count
}

// Gender & size filter state
const activeGender = ref('all')
const activeSize = ref('All')
const detectedGender = ref(null)

const genderOptions = [
  { label: 'All', value: 'all' },
  { label: 'Women', value: 'women' },
  { label: 'Men', value: 'men' },
  { label: 'Kids', value: 'kids' },
]
const sizeOptions = ['All', 'XS', 'S', 'M', 'L', 'XL', 'XXL']

// Quick suggestions — multiple sets that rotate
const suggestionSets = [
  ['Pineapple design dress', 'White sneakers with golden stripes under $100', 'Designer bag in Maroon', "Men's winter jacket with hood"],
  ['Y2K aesthetic outfit', 'Floral maxi dress for beach wedding', 'Vintage leather crossbody bag', 'Running shoes with arch support'],
  ['Silk blouse under $50', 'Black boots that go with everything', 'Statement earrings gold', 'Cozy oversized sweater for fall'],
  ['Date night outfit elegant', 'Minimalist watch rose gold', 'High waisted jeans petite', 'Summer sandals comfortable walking'],
]
const currentSuggestionSet = ref(0)
const visibleSuggestions = computed(() => suggestionSets[currentSuggestionSet.value])
let suggestionRotateInterval = null

// Featured Brands (loaded from API)
const featuredBrands = ref([])

// Animated search prompts (loaded from API)
const searchPrompts = ref([
  'Find me a vintage leather jacket under $200...',
])
const currentPromptIndex = ref(0)
const animatedPrompt = ref('')
let promptInterval = null

// Category titles
const categoryTitles = {
  all: 'All Brands, All Clothes',
  women: 'Women\'s Fashion',
  men: 'Men\'s Fashion',
  home: 'Home & Living',
  beauty: 'Beauty & Care',
}

const categoryTitle = computed(() => categoryTitles[currentCategory.value])

// Rotating hero phrases
const heroPhrases = [
  'All Brands, All Clothes',
  'Find What You Like',
  'Ask for the Best Deal',
  'All Jeans, All Denim',
  'Search Across Hundreds of Brands',
]
const heroIdx = ref(0)
const heroPhrase = computed(() => currentCategory.value === 'all' ? heroPhrases[heroIdx.value] : categoryTitle.value)
let heroTimer = null
const startHeroRotation = () => {
  heroTimer = setInterval(() => { heroIdx.value = (heroIdx.value + 1) % heroPhrases.length }, 3000)
}
const stopHeroRotation = () => { if (heroTimer) { clearInterval(heroTimer); heroTimer = null } }

// Get card size - creates varied masonry pattern
const getCardSize = (index) => {
  // Pattern: tall, normal, normal, wide, normal, tall, normal, normal, wide, tall...
  const pattern = ['tall', 'normal', 'normal', 'wide', 'normal', 'tall', 'normal', 'normal', 'wide', 'tall', 'normal', 'normal']
  return pattern[index % pattern.length]
}

// Categories that DON'T need gender/size filters
const NO_GENDER_CATEGORIES = /\b(bags?|handbags?|purse|wallet|backpack|tote|clutch|luggage|suitcase|jewelry|jewellery|necklace|bracelet|earrings?|ring|watch|watches|sunglasses|perfume|cologne|fragrance|skincare|makeup|cosmetics)\b/i

// Gender keywords already in the query — if present, backend already handles filtering
const QUERY_HAS_GENDER = /\b(men|mens|men's|women|womens|women's|ladies|boys?|girls?|kids?|unisex|male|female)\b/i

// Show gender filter: only for clothing categories, only when gender isn't already in query
const showGenderFilter = computed(() => {
  const q = lastSearchQuery.value.toLowerCase()
  if (!hasSearched.value || !deals.value.length) return false
  if (QUERY_HAS_GENDER.test(q)) return false  // query already specifies gender
  if (NO_GENDER_CATEGORIES.test(q)) return false  // bags, jewelry, etc.
  return true
})

// Show size filter: only for clothing that typically has sizes
const showSizeFilter = computed(() => {
  const q = lastSearchQuery.value.toLowerCase()
  if (!hasSearched.value || !deals.value.length) return false
  if (NO_GENDER_CATEGORIES.test(q)) return false  // bags, jewelry, etc. don't have S/M/L
  return true
})

// Gender word patterns for client-side filtering
const WOMEN_WORDS = /\b(womens|women's|ladies|girls?|female)\b/i
const MEN_WORDS = /\b(mens|men's|boys?|male|gentleman)\b/i
// Special pattern for "men" that avoids matching inside "women"
const MEN_STANDALONE = /(?<!wo)\bmen\b/i

const filteredDeals = computed(() => {
  let result = [...deals.value]
  
  // Gender filter
  if (activeGender.value !== 'all') {
    const gender = activeGender.value
    result = result.filter(deal => {
      const title = (deal.title || '').toLowerCase()
      if (gender === 'men') {
        return !WOMEN_WORDS.test(title)
      } else if (gender === 'women') {
        return !MEN_WORDS.test(title) && !MEN_STANDALONE.test(title)
      } else if (gender === 'kids') {
        return !WOMEN_WORDS.test(title) && !MEN_WORDS.test(title) && !MEN_STANDALONE.test(title)
      }
      return true
    })
  }
  
  // Size filter
  if (activeSize.value.toLowerCase() !== 'all') {
    const size = activeSize.value.toLowerCase()
    result = result.filter(deal => {
      const title = (deal.title || '').toLowerCase()
      return title.includes(size) || title.includes(`size ${size}`)
    })
  }
  
  return result
})

// Sorted deals (applies to filtered deals)
const sortedDeals = computed(() => {
  const sorted = [...filteredDeals.value]
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

// Filter chip handlers
const setGenderFilter = (gender) => {
  activeGender.value = gender
  visibleCount.value = 12
}

const setSizeFilter = (size) => {
  activeSize.value = size
  visibleCount.value = 12
}

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

// Persist AI mode toggle
watch(aiMode, (val) => {
  localStorage.setItem('fynda_ai_mode', val ? 'true' : 'false')
  if (!val) {
    chatMessages.value = []
    chatLoading.value = false
  }
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

// Handle Ctrl+V paste — shows preview, user clicks Search to find products
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

// Handle file input upload — shows preview, user clicks Search
const handleImageUpload = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  event.target.value = ''
  await previewImage(file)
}

// Core: send image to backend ML for analysis, then search Amazon directly
const processImageFile = async (file) => {
  loading.value = true
  hasSearched.value = true
  lastSearchQuery.value = 'Visual Search'
  sortBy.value = 'relevance'
  visibleCount.value = 12
  
  try {
    // Step 1: Send image to our ML model for product identification
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
    console.log('ML model result:', data)
    
    // Extract the best search query from ML model
    const mlQuery = data.search_queries?.[0] || data.extracted?.caption || ''
    if (!mlQuery) {
      throw new Error('Could not identify product. Try a clearer image.')
    }
    
    lastSearchQuery.value = 'Visual Search'
    // Don't put ML query in search box — keep it clean
    
    // Step 2: Search Amazon directly using the ML-extracted query (same as handleSearch)
    console.log('Searching Amazon for:', mlQuery)
    const amazonResponse = await fetch(
      `https://real-time-amazon-data.p.rapidapi.com/search?query=${encodeURIComponent(mlQuery)}&page=1&country=US`,
      {
        headers: {
          'x-rapidapi-host': 'real-time-amazon-data.p.rapidapi.com',
          'x-rapidapi-key': 'ad5affb386msh86b1de74187a3cep186fbejsn29e5c0f03e34'
        }
      }
    )
    const amazonData = await amazonResponse.json()
    const products = amazonData?.data?.products || []
    
    deals.value = products.map((p, idx) => ({
      id: p.asin || idx,
      title: p.product_title,
      price: (p.product_price || '$0').replace(/[^0-9.]/g, ''),
      original_price: p.product_original_price ? p.product_original_price.replace(/[^0-9.]/g, '') : null,
      image_url: p.product_photo,
      source: 'Amazon',
      merchant_name: 'Amazon',
      url: p.product_url,
      rating: p.product_star_rating,
      reviews: p.product_num_ratings,
      is_prime: p.is_prime,
      badge: p.product_badge || (p.is_best_seller ? 'Best Seller' : (p.is_amazon_choice ? 'Amazon Choice' : null)),
      discount_percent: p.product_original_price && p.product_price
        ? Math.round(((parseFloat(p.product_original_price.replace(/[^0-9.]/g, '')) - parseFloat(p.product_price.replace(/[^0-9.]/g, ''))) / parseFloat(p.product_original_price.replace(/[^0-9.]/g, ''))) * 100)
        : null
    }))
    
    activeGender.value = 'all'
    detectedGender.value = null
    
    if (deals.value.length === 0) {
      alert('No products found. Try a different image.')
    }
    
    // Keep the image preview visible after search
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

// Handle search — works for both text and image
const handleSearch = async () => {
  // If an image is attached, do visual search
  if (pastedImage.value) {
    await processImageFile(pastedImage.value.file)
    return
  }
  
  if (!searchQuery.value.trim()) return

  // Check search limit for non-authenticated users
  if (!isAuthenticated.value) {
    const count = getSearchCount()
    if (count >= FREE_SEARCH_LIMIT) {
      showLoginGate.value = true
      return
    }
    incrementSearchCount()
  }

  // AI Chat mode — call backend chat endpoint
  if (aiMode.value) {
    const userMessage = searchQuery.value.trim()
    chatMessages.value.push({ role: 'user', text: userMessage })
    searchQuery.value = ''
    chatLoading.value = true
    
    // Scroll chat to bottom
    nextTick(() => {
      if (chatMessagesEl.value) {
        chatMessagesEl.value.scrollTop = chatMessagesEl.value.scrollHeight
      }
    })
    
    try {
      // Step 1: Get AI response + extracted search query from backend
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
      const history = chatMessages.value
        .filter(m => !m.products)
        .map(m => ({ role: m.role, text: m.text }))
      
      const chatResponse = await fetch(`${apiUrl}/api/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history }),
      })
      const chatData = await chatResponse.json()
      const aiText = chatData.response || 'Let me find that for you.'
      const extractedQuery = chatData.search_query || userMessage
      const maxPrice = chatData.max_price || null
      
      // Step 2: Search Amazon directly with the extracted query (same as Classic mode)
      const amazonResponse = await fetch(
        `https://real-time-amazon-data.p.rapidapi.com/search?query=${encodeURIComponent(extractedQuery)}&page=1&country=US`,
        {
          headers: {
            'x-rapidapi-host': 'real-time-amazon-data.p.rapidapi.com',
            'x-rapidapi-key': 'ad5affb386msh86b1de74187a3cep186fbejsn29e5c0f03e34'
          }
        }
      )
      const amazonData = await amazonResponse.json()
      const products = (amazonData?.data?.products || []).map((p, idx) => ({
        id: p.asin || idx,
        title: p.product_title,
        price: (p.product_price || '$0').replace(/[^0-9.]/g, ''),
        original_price: p.product_original_price ? p.product_original_price.replace(/[^0-9.]/g, '') : null,
        image_url: p.product_photo,
        source: 'Amazon',
        merchant_name: 'Amazon',
        url: p.product_url,
        rating: p.product_star_rating,
        reviews: p.product_num_ratings,
        is_prime: p.is_prime,
        badge: p.product_badge || (p.is_best_seller ? 'Best Seller' : (p.is_amazon_choice ? 'Amazon Choice' : null)),
        discount_percent: p.product_original_price && p.product_price
          ? Math.round(((parseFloat(p.product_original_price.replace(/[^0-9.]/g, '')) - parseFloat(p.product_price.replace(/[^0-9.]/g, ''))) / parseFloat(p.product_original_price.replace(/[^0-9.]/g, ''))) * 100)
          : null
      }))
      
      // Apply price filter if GPT extracted a max_price
      const filteredProducts = maxPrice
        ? products.filter(p => {
            const price = parseFloat(p.price)
            return !isNaN(price) && price <= maxPrice
          })
        : products
      
      // Add AI response + products to chat
      chatMessages.value.push({
        role: 'assistant',
        text: aiText,
        products: filteredProducts.slice(0, 6),  // Show top 6 in chat cards
      })
      
      // Populate the main results grid below
      if (filteredProducts.length > 0) {
        deals.value = filteredProducts
        hasSearched.value = true
        lastSearchQuery.value = extractedQuery
        activeGender.value = 'all'
        activeSize.value = 'All'
        sortBy.value = 'relevance'
        visibleCount.value = 12
      }
    } catch (error) {
      console.error('Chat failed:', error)
      chatMessages.value.push({
        role: 'assistant',
        text: 'Sorry, something went wrong. Please try again.',
        products: [],
      })
    } finally {
      chatLoading.value = false
      nextTick(() => {
        if (chatMessagesEl.value) {
          chatMessagesEl.value.scrollTop = chatMessagesEl.value.scrollHeight
        }
      })
    }
    return
  }

  // Classic mode — direct Amazon search
  loading.value = true
  hasSearched.value = true
  lastSearchQuery.value = searchQuery.value
  sortBy.value = 'relevance'
  visibleCount.value = 12
  quotaWarning.value = ''
  suggestedQuery.value = null
  activeSize.value = 'All'
  
  try {
    const response = await fetch(
      `https://real-time-amazon-data.p.rapidapi.com/search?query=${encodeURIComponent(searchQuery.value)}&page=1&country=US`,
      {
        headers: {
          'x-rapidapi-host': 'real-time-amazon-data.p.rapidapi.com',
          'x-rapidapi-key': 'ad5affb386msh86b1de74187a3cep186fbejsn29e5c0f03e34'
        }
      }
    )
    const data = await response.json()
    const products = data?.data?.products || []
    
    deals.value = products.map((p, idx) => ({
      id: p.asin || idx,
      title: p.product_title,
      price: (p.product_price || '$0').replace(/[^0-9.]/g, ''),
      original_price: p.product_original_price ? p.product_original_price.replace(/[^0-9.]/g, '') : null,
      image_url: p.product_photo,
      source: 'Amazon',
      merchant_name: 'Amazon',
      url: p.product_url,
      rating: p.product_star_rating,
      reviews: p.product_num_ratings,
      is_prime: p.is_prime,
      badge: p.product_badge || (p.is_best_seller ? 'Best Seller' : (p.is_amazon_choice ? 'Amazon Choice' : null)),
      discount_percent: p.product_original_price && p.product_price
        ? Math.round(((parseFloat(p.product_original_price.replace(/[^0-9.]/g, '')) - parseFloat(p.product_price.replace(/[^0-9.]/g, ''))) / parseFloat(p.product_original_price.replace(/[^0-9.]/g, ''))) * 100)
        : null
    }))
    
    // Reset gender filter since Amazon doesn't return this
    activeGender.value = 'all'
    detectedGender.value = null
  } catch (error) {
    console.error('Search failed:', error)
    deals.value = []
  } finally {
    loading.value = false
  }
}

// Fashion keywords filter — exclude non-fashion products
const NON_FASHION_KEYWORDS = [
  // Electronics
  'laptop', 'phone', 'tablet', 'headphone', 'speaker', 'camera', 'tv', 'television',
  'monitor', 'keyboard', 'mouse', 'charger', 'cable', 'adapter', 'battery', 'usb',
  'bluetooth', 'wireless', 'printer', 'router', 'modem', 'hard drive', 'ssd',
  'gaming', 'console', 'controller', 'gpu', 'cpu', 'ram', 'motherboard',
  // Kitchen & Food
  'kitchen', 'utensil', 'pan', 'pot', 'spatula', 'knife set', 'blender', 'mixer',
  'toaster', 'microwave', 'oven', 'fridge', 'coffee maker', 'food', 'snack',
  'protein powder', 'vitamin', 'supplement', 'cooking', 'baking', 'recipe',
  'cutting board', 'bowl set', 'plate set', 'fork', 'spoon',
  // Tools & Hardware
  'drill', 'hammer', 'screwdriver', 'wrench', 'saw', 'toolbox', 'pliers',
  'power tool', 'garden hose', 'lawn mower', 'leaf blower',
  // Auto
  'car', 'tire', 'motor oil', 'dashboard', 'windshield', 'automotive',
  // Office & Stationery
  'printer ink', 'toner', 'stapler', 'paper shredder', 'filing cabinet',
  // Pet
  'dog food', 'cat food', 'pet bed', 'aquarium', 'fish tank', 'bird cage',
  // Toys (non-fashion)
  'action figure', 'lego', 'puzzle', 'board game', 'nerf',
]

const isFashionOrBeauty = (deal) => {
  const title = (deal.title || '').toLowerCase()
  const category = (deal.category || '').toLowerCase()
  const combined = title + ' ' + category
  
  // Reject if title contains non-fashion keywords
  for (const kw of NON_FASHION_KEYWORDS) {
    if (combined.includes(kw)) return false
  }
  
  // Must have an image
  if (!deal.image && !deal.image_url) return false
  
  return true
}

// Extract brand name from Amazon product title (first word/phrase before the product type)
const extractBrand = (title) => {
  if (!title) return 'Brand'
  // Amazon titles typically start with the brand name
  // e.g. "SPOSULEI Mens Skiing Jackets..." → "SPOSULEI"
  // e.g. "Calvin Klein Women's Dress..." → "Calvin Klein"
  const words = title.trim().split(/\s+/)
  if (words.length === 0) return 'Brand'
  
  // Common product descriptor words that mark the end of the brand name
  const descriptors = [
    'mens', "men's", 'womens', "women's", 'unisex', 'kids', "kid's", 'boys', "boy's", 'girls', "girl's",
    'casual', 'classic', 'vintage', 'slim', 'regular', 'relaxed', 'oversized', 'fitted', 'loose',
    'long', 'short', 'mid', 'high', 'low', 'mini', 'maxi', 'plus',
    'cotton', 'silk', 'linen', 'wool', 'polyester', 'denim', 'leather', 'fleece', 'knit',
    'v-neck', 'crew', 'round', 'button', 'zip', 'pullover', 'hooded',
    'summer', 'winter', 'spring', 'fall', 'lightweight', 'warm', 'waterproof',
    '2024', '2025', '2026', 'new', 'pack', 'set', 'piece',
  ]
  
  let brandWords = []
  for (const word of words) {
    const lower = word.toLowerCase().replace(/[^a-z]/g, '')
    if (descriptors.includes(lower)) break
    brandWords.push(word)
    // Most brands are 1-3 words
    if (brandWords.length >= 3) break
  }
  
  return brandWords.join(' ').replace(/[,\-]$/, '') || words[0]
}

// Clothing keywords — items MUST contain one of these to appear on landing page
const CLOTHING_KEYWORDS = [
  'dress', 'shirt', 'blouse', 'top', 'tee', 't-shirt', 'tank',
  'jacket', 'coat', 'blazer', 'hoodie', 'sweater', 'cardigan', 'pullover', 'sweatshirt',
  'jeans', 'pants', 'trousers', 'shorts', 'skirt', 'leggings', 'joggers', 'chinos',
  'sneakers', 'shoes', 'boots', 'heels', 'sandals', 'loafers', 'flats', 'pumps',
  'handbag', 'purse', 'tote', 'clutch', 'backpack', 'crossbody', 'satchel',
  'scarf', 'hat', 'beanie', 'cap', 'belt', 'tie', 'bow tie', 'gloves',
  'suit', 'tuxedo', 'romper', 'jumpsuit', 'bodysuit', 'overalls',
  'bikini', 'swimsuit', 'swimwear', 'lingerie', 'bra', 'underwear', 'boxers',
  'vest', 'parka', 'windbreaker', 'poncho', 'cape',
  'polo', 'henley', 'flannel', 'denim', 'corset',
  'sunglasses', 'watch', 'bracelet', 'necklace', 'earrings', 'ring',
  'socks', 'stockings', 'tights',
]

const isClothing = (title) => {
  const lower = (title || '').toLowerCase()
  return CLOTHING_KEYWORDS.some(kw => lower.includes(kw))
}

// Load trending deals — clothing only (via Amazon RapidAPI)
const loadTrending = async () => {
  try {
    const fashionQueries = [
      'women dress summer', 'mens jacket', 'sneakers fashion',
      'designer handbag women', 'denim jeans', 'womens blouse',
      'mens blazer slim', 'heels shoes women', 'hoodie streetwear',
      'womens skirt', 'mens polo shirt', 'crossbody bag'
    ]
    
    // Pick 3 random queries for variety
    const shuffled = fashionQueries.sort(() => 0.5 - Math.random())
    const selected = shuffled.slice(0, 3)
    
    const responses = await Promise.allSettled(
      selected.map(q =>
        fetch(
          `https://real-time-amazon-data.p.rapidapi.com/search?query=${encodeURIComponent(q)}&page=1&country=US`,
          {
            headers: {
              'x-rapidapi-host': 'real-time-amazon-data.p.rapidapi.com',
              'x-rapidapi-key': 'ad5affb386msh86b1de74187a3cep186fbejsn29e5c0f03e34'
            }
          }
        ).then(r => r.json())
      )
    )
    
    // Combine, map, and deduplicate
    const allDeals = []
    const seenIds = new Set()
    
    for (const res of responses) {
      if (res.status === 'fulfilled') {
        const products = res.value?.data?.products || []
        for (const p of products) {
          const id = p.asin || p.product_title
          const title = p.product_title || ''
          if (
            !seenIds.has(id) && 
            p.product_photo && 
            isClothing(title) &&
            isFashionOrBeauty({ title, image_url: p.product_photo })
          ) {
            seenIds.add(id)
            const brand = extractBrand(title)
            allDeals.push({
              id: id,
              title: title,
              price: (p.product_price || '$0').replace(/[^0-9.]/g, ''),
              original_price: p.product_original_price ? p.product_original_price.replace(/[^0-9.]/g, '') : null,
              image_url: p.product_photo,
              source: 'Amazon',
              merchant_name: brand,
              url: p.product_url,
              rating: p.product_star_rating,
              reviews: p.product_num_ratings,
              is_prime: p.is_prime,
              badge: p.product_badge || (p.is_best_seller ? 'Best Seller' : (p.is_amazon_choice ? 'Amazon Choice' : null)),
              discount_percent: p.product_original_price && p.product_price
                ? Math.round(((parseFloat(p.product_original_price.replace(/[^0-9.]/g, '')) - parseFloat(p.product_price.replace(/[^0-9.]/g, ''))) / parseFloat(p.product_original_price.replace(/[^0-9.]/g, ''))) * 100)
                : null
            })
          }
        }
      }
    }
    
    // Shuffle for variety
    trendingDeals.value = allDeals.sort(() => 0.5 - Math.random())
  } catch (error) {
    console.error('Failed to load trending:', error)
  }
}

// Open deal - navigate to product detail page
const openDeal = (deal) => {
  // Store product data for the detail page to pick up
  localStorage.setItem('fyndaViewProduct', JSON.stringify(deal))
  const productId = deal.id || encodeURIComponent((deal.title || '').substring(0, 30))
  router.push(`/product/${productId}`)
}

// Animate search prompts
const animatePrompts = () => {
  if (searchPrompts.value.length === 0) return
  animatedPrompt.value = searchPrompts.value[0]
  promptInterval = setInterval(() => {
    currentPromptIndex.value = (currentPromptIndex.value + 1) % searchPrompts.value.length
    animatedPrompt.value = searchPrompts.value[currentPromptIndex.value]
  }, 4000)
}

// Load featured content from backend
const loadFeaturedContent = async () => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
    const response = await fetch(`${apiUrl}/api/featured/`)
    const data = await response.json()
    
    if (data.featured_brands) {
      featuredBrands.value = data.featured_brands
    }
    if (data.search_prompts) {
      searchPrompts.value = data.search_prompts
    }
    if (data.quick_suggestions) {
      quickSuggestions.value = data.quick_suggestions
    }
    
    // Start prompt animation after data loads
    animatePrompts()
  } catch (error) {
    console.error('Failed to load featured content:', error)
    // Fallback: still animate with defaults
    animatePrompts()
  }
}

// Login gate OAuth handlers
const gateLoginWithGoogle = () => {
  sessionStorage.setItem('oauth_provider', 'google')
  sessionStorage.setItem('oauth_redirect', '/')
  
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const redirectUri = `${window.location.origin}/auth/callback`
  
  if (!clientId) {
    router.push('/login')
    return
  }
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
    state: 'google'
  })
  
  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

const gateLoginWithApple = () => {
  sessionStorage.setItem('oauth_provider', 'apple')
  sessionStorage.setItem('oauth_redirect', '/')
  
  const clientId = import.meta.env.VITE_APPLE_CLIENT_ID
  const redirectUri = `${window.location.origin}/auth/callback`
  
  if (!clientId) {
    router.push('/login')
    return
  }
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code id_token',
    scope: 'name email',
    response_mode: 'fragment',
    state: 'apple'
  })
  
  window.location.href = `https://appleid.apple.com/auth/authorize?${params.toString()}`
}

onMounted(() => {
  loadFeaturedContent()
  loadTrending()
  startHeroRotation()
  
  // Rotate quick suggestions every 5 seconds
  suggestionRotateInterval = setInterval(() => {
    currentSuggestionSet.value = (currentSuggestionSet.value + 1) % suggestionSets.length
  }, 5000)
})

onUnmounted(() => {
  if (promptInterval) {
    clearInterval(promptInterval)
  }
  if (suggestionRotateInterval) {
    clearInterval(suggestionRotateInterval)
  }
  stopHeroRotation()
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

/* Hero Section */
.hero-section {
  text-align: center;
  padding: 3rem 0 2rem;
}

.hero-rotating {
  min-height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 400;
  color: #1a1a1a;
  margin-bottom: 0.4rem;
}

/* Hero fade transition */
.hero-fade-enter-active { animation: heroIn 0.5s ease; }
.hero-fade-leave-active { animation: heroOut 0.3s ease; }
@keyframes heroIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
@keyframes heroOut { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-12px); } }

.hero-subtitle {
  font-size: 1rem;
  color: #888;
  margin-bottom: 1.75rem;
}

/* AI Search Box */
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

.ai-animated-placeholder {
  position: absolute;
  left: 4rem;
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

.suggestion-pills {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
  justify-content: center;
}

.suggestion-label {
  font-size: 0.75rem;
  color: #888;
}

/* Fade animation for rotating suggestions */
.suggestion-fade-enter-active {
  transition: all 0.4s ease;
}
.suggestion-fade-leave-active {
  transition: all 0.3s ease;
  position: absolute;
}
.suggestion-fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.suggestion-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
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

.brand-card.brand-enter {
  animation: brandFadeIn 0.35s ease both;
  animation-delay: calc(var(--i, 0) * 60ms);
}

@keyframes brandFadeIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

/* Filter Chips */
.filter-bar {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
  padding: 0.65rem 0;
  border-bottom: 1px solid #f0f0f0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.filter-bar::-webkit-scrollbar {
  display: none;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.filter-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.filter-chips {
  display: flex;
  gap: 0.35rem;
}

.filter-chip {
  padding: 0.35rem 0.85rem;
  font-family: 'Inter', sans-serif;
  font-size: 0.72rem;
  font-weight: 500;
  color: #555;
  background: #f5f5f5;
  border: 1px solid #e8e8e8;
  border-radius: 100px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.filter-chip:hover {
  background: #eee;
  border-color: #ccc;
  color: #222;
}

.filter-chip.active {
  background: #1a1a1a;
  color: #fff;
  border-color: #1a1a1a;
}

.filter-chip.active:hover {
  background: #333;
  border-color: #333;
}

/* Did You Mean? Suggestion */
.did-you-mean {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.65rem 0.85rem;
  margin-bottom: 0.75rem;
  background: #fafafa;
  border: 1px solid #eee;
  border-radius: 8px;
  font-size: 0.82rem;
  color: #666;
}

.did-you-mean svg {
  color: #999;
  flex-shrink: 0;
}

.suggestion-link {
  background: none;
  border: none;
  font-family: 'Inter', sans-serif;
  font-size: 0.82rem;
  font-weight: 600;
  color: #1a1a1a;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
  padding: 0;
  transition: color 0.2s ease;
}

.suggestion-link:hover {
  color: #555;
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

.masonry-item.card-enter {
  animation: cardFadeIn 0.25s ease both;
  animation-delay: calc(var(--i, 0) * 40ms);
}

@keyframes cardFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
  .filter-bar { flex-direction: column; gap: 0.75rem; }
  .filter-chip { padding: 0.3rem 0.7rem; font-size: 0.68rem; }
  
  .footer-bottom {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .login-gate-modal {
    width: 92vw;
    padding: 2rem 1.5rem;
  }
}

/* Login Gate Modal */
.login-gate-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.login-gate-modal {
  background: #fff;
  border-radius: 20px;
  padding: 2.5rem;
  width: 100%;
  max-width: 400px;
  text-align: center;
  position: relative;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.15);
  animation: gate-slide-up 0.35s ease;
}

@keyframes gate-slide-up {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.gate-fade-enter-active {
  transition: opacity 0.3s ease;
}
.gate-fade-leave-active {
  transition: opacity 0.2s ease;
}
.gate-fade-enter-from,
.gate-fade-leave-to {
  opacity: 0;
}

.gate-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.15s ease;
}
.gate-close:hover {
  background: #f5f5f5;
  color: #333;
}

.gate-icon {
  margin-bottom: 1rem;
}

.gate-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.5rem;
  font-weight: 400;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.gate-subtitle {
  font-size: 0.85rem;
  color: #777;
  line-height: 1.5;
  margin-bottom: 1.75rem;
}

.gate-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.gate-social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  width: 100%;
  padding: 0.85rem 1.25rem;
  border-radius: 10px;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.gate-social-icon {
  width: 18px;
  height: 18px;
}

.gate-google {
  background: #fff;
  border: 1px solid #ddd;
  color: #1a1a1a;
}
.gate-google:hover {
  background: #f8f8f8;
  border-color: #ccc;
}

.gate-apple {
  background: #000;
  border: none;
  color: #fff;
}
.gate-apple:hover {
  background: #222;
}

.gate-footer {
  font-size: 0.82rem;
  color: #888;
}
.gate-register-link {
  color: #1a1a1a;
  text-decoration: underline;
  margin-left: 0.25rem;
}
.gate-register-link:hover {
  color: #000;
}

/* ========================================== */
/* Mode Toggle                                */
/* ========================================== */
.mode-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 1rem;
}

.mode-toggle span {
  font-size: 0.75rem;
  font-weight: 500;
  color: #aaa;
  cursor: pointer;
  transition: color 0.2s;
  user-select: none;
}

.mode-toggle span.active {
  color: #1a1a1a;
}

.toggle-track {
  position: relative;
  width: 40px;
  height: 22px;
  background: #ddd;
  border-radius: 11px;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
  padding: 0;
}

.toggle-track.on {
  background: #1a1a1a;
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.2s;
}

.toggle-track.on .toggle-thumb {
  transform: translateX(18px);
}

/* ========================================== */
/* Chat Mode                                  */
/* ========================================== */
.hero-chat-mode {
  padding-top: 1.5rem;
}

.hero-title-small {
  font-size: clamp(1.4rem, 2.5vw, 1.8rem) !important;
  color: #666;
}

.chat-messages {
  max-width: 640px;
  margin: 0 auto 1rem;
  max-height: 50vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0 4px;
  scroll-behavior: smooth;
}

.chat-bubble {
  max-width: 85%;
  padding: 10px 14px;
  border-radius: 16px;
  animation: bubbleIn 0.25s ease;
}

@keyframes bubbleIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.chat-bubble.user {
  align-self: flex-end;
  background: #1a1a1a;
  color: #fff;
  border-bottom-right-radius: 4px;
}

.chat-bubble.assistant {
  align-self: flex-start;
  background: #f3f3f3;
  color: #333;
  border-bottom-left-radius: 4px;
}

.chat-bubble p {
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
}

.chat-bubble.user p {
  font-size: 0.9rem;
}

/* Typing indicator */
.chat-typing {
  display: flex;
  gap: 4px;
  padding: 4px 0;
}

.chat-typing span {
  width: 6px;
  height: 6px;
  background: #999;
  border-radius: 50%;
  animation: typingDot 1.2s infinite;
}

.chat-typing span:nth-child(2) { animation-delay: 0.2s; }
.chat-typing span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typingDot {
  0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
  30% { opacity: 1; transform: scale(1); }
}

/* Inline product cards in chat */
.chat-products {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 10px 0 4px;
  -webkit-overflow-scrolling: touch;
}

.chat-products::-webkit-scrollbar {
  height: 4px;
}

.chat-products::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 2px;
}

.chat-product-card {
  flex: 0 0 130px;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e8e8e8;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}

.chat-product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.chat-product-card img {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.chat-product-info {
  padding: 6px 8px;
}

.chat-product-title {
  display: block;
  font-size: 0.7rem;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

.chat-product-price {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-top: 2px;
}
</style>
