<template>
  <div class="category-landing">
    <NavBar />

    <main class="landing-content">
      <!-- Hero -->
      <section class="landing-hero">
        <h1 class="landing-title">{{ pageTitle }}</h1>
        <p class="landing-subtitle">{{ pageSubtitle }}</p>

        <!-- Search Bar -->
        <div class="category-search">
          <div class="search-box" :class="{ focused: searchFocused }">
            <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input 
              type="text" 
              class="search-input"
              v-model="searchQuery"
              :placeholder="typingPlaceholder"
              @keyup.enter="searchProducts"
              @focus="onSearchFocus"
              @blur="onSearchBlur"
            />
            <button v-if="searchQuery" class="clear-btn" @click="clearSearch">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
            <button class="search-submit" @click="searchProducts">Search</button>
          </div>
        </div>
      </section>

      <!-- Editor's Picks -->
      <section class="editors-section">
        <h2 class="section-heading">Editor's picks</h2>
        <div class="editors-grid">
          <div 
            v-for="pick in editorsPicks" 
            :key="pick.id" 
            class="editors-card"
            :style="{ backgroundImage: `url(${pick.image})` }"
            @click="goSearch(pick.query)"
          >
            <div class="editors-overlay">
              <h3>{{ pick.title }}</h3>
              <span class="editors-link">Start exploring →</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Results or For You -->
      <section class="for-you-section">
        <h2 class="section-heading">{{ hasSearched ? `Results for "${lastQuery}"` : 'For you' }}</h2>

        <div class="product-grid">
          <div 
            v-for="(deal, idx) in displayProducts" 
            :key="deal.id || 'f-' + idx" 
            class="product-card"
            :class="{ 'shimmer-card': loading && idx >= featuredProducts.length }"
            @click="openProduct(deal)"
          >
            <div class="product-image" :class="getCardHeight(idx)">
              <img :src="deal.image_url || deal.image" :alt="deal.title" loading="lazy" />
            </div>
            <div class="product-info">
              <span class="product-source">{{ (deal.merchant_name || deal.source || 'Brand').toUpperCase() }}</span>
              <h3 class="product-title">{{ deal.title }}</h3>
              <span class="product-price">${{ formatPrice(deal.price) }}</span>
            </div>
          </div>
        </div>

        <!-- Load More -->
        <div v-if="!loading && visibleCount < allProducts.length" class="load-more-wrap">
          <button class="load-more-btn" @click="visibleCount += 12">Load more</button>
        </div>
      </section>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NavBar from './NavBar.vue'
import Footer from './Footer.vue'

const route = useRoute()
const router = useRouter()
const searchQuery = ref('')
const searchFocused = ref(false)
const hasSearched = ref(false)
const lastQuery = ref('')
const deals = ref([])
const loading = ref(true)
const visibleCount = ref(12)

// ── Typewriter animation ──
const typingPlaceholder = ref('')
let typingTimer = null
let isTypingPaused = false

const typingPhrases = {
  'for-him': ['sneakers', 'winter jackets', 'slim fit jeans', 'watches', 'hoodies', 'blazers', 'leather boots'],
  'for-her': ['summer dresses', 'handbags', 'heels', 'silk tops', 'gold jewelry', 'maxi skirts', 'cashmere sweaters'],
  'both': ['sneakers', 'oversized hoodies', 'tote bags', 'sunglasses', 'joggers', 'denim jackets']
}

const startTypingAnimation = () => {
  const slug = route.params.category || 'for-her'
  const phrases = typingPhrases[slug] || typingPhrases['for-her']
  let phraseIdx = 0
  let charIdx = 0
  let isDeleting = false
  const typeSpeed = 80
  const deleteSpeed = 40
  const pauseAfterType = 1800
  const pauseAfterDelete = 400

  const tick = () => {
    if (isTypingPaused) {
      typingTimer = setTimeout(tick, 200)
      return
    }

    const currentPhrase = phrases[phraseIdx]

    if (!isDeleting) {
      // Typing
      charIdx++
      typingPlaceholder.value = currentPhrase.substring(0, charIdx)

      if (charIdx === currentPhrase.length) {
        // Finished typing — pause then delete
        isDeleting = true
        typingTimer = setTimeout(tick, pauseAfterType)
        return
      }
      typingTimer = setTimeout(tick, typeSpeed)
    } else {
      // Deleting
      charIdx--
      typingPlaceholder.value = currentPhrase.substring(0, charIdx)

      if (charIdx === 0) {
        // Finished deleting — move to next phrase
        isDeleting = false
        phraseIdx = (phraseIdx + 1) % phrases.length
        typingTimer = setTimeout(tick, pauseAfterDelete)
        return
      }
      typingTimer = setTimeout(tick, deleteSpeed)
    }
  }

  tick()
}

const stopTypingAnimation = () => {
  if (typingTimer) {
    clearTimeout(typingTimer)
    typingTimer = null
  }
}

const onSearchFocus = () => {
  searchFocused.value = true
  isTypingPaused = true
  typingPlaceholder.value = 'Search...'
}

const onSearchBlur = () => {
  searchFocused.value = false
  if (!searchQuery.value.trim()) {
    isTypingPaused = false
  }
}

const categoryConfig = {
  'for-her': {
    title: "Women's Fashion",
    subtitle: 'Discover trending women\'s fashion and clothing curated just for you.',
    query: 'women fashion clothing',
    editorsPicks: [
      { id: 1, title: 'Effortless Elegance', query: 'elegant women dress', image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=600&q=80' },
      { id: 2, title: 'Summer Essentials', query: 'women summer outfit', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80' },
      { id: 3, title: 'Power Blazers', query: 'women blazer', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80' }
    ],
    featured: [
      { id: 'f1', title: 'Silk Midi Dress — Blush Pink', price: '89', source: 'Reformation', image_url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=80' },
      { id: 'f2', title: 'Cashmere Crew Neck Sweater', price: '145', source: 'COS', image_url: 'https://images.unsplash.com/photo-1434389677669-e08b4cda3a46?w=400&q=80' },
      { id: 'f3', title: 'High-Waist Wide Leg Trousers', price: '68', source: 'Zara', image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80' },
      { id: 'f4', title: 'Leather Crossbody Bag — Tan', price: '120', source: 'Madewell', image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80' },
    ]
  },
  'for-him': {
    title: "Men's Clothing",
    subtitle: 'Discover trending men\'s fashion and clothing curated just for you.',
    query: 'men fashion clothing',
    editorsPicks: [
      { id: 1, title: 'Smart Casual', query: 'men smart casual', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80' },
      { id: 2, title: 'Streetwear Edit', query: 'men streetwear', image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600&q=80' },
      { id: 3, title: 'Winter Layers', query: 'men winter jacket', image: 'https://images.unsplash.com/photo-1544923246-77307dd270df?w=600&q=80' }
    ],
    featured: [
      { id: 'f1', title: 'Slim Fit Oxford Shirt — White', price: '45', source: 'H&M', image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&q=80' },
      { id: 'f2', title: 'Relaxed Fit Chinos — Olive', price: '58', source: 'Zara', image_url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&q=80' },
      { id: 'f3', title: 'Chunky Leather Sneakers', price: '110', source: 'Nike', image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80' },
      { id: 'f4', title: 'Wool Overcoat — Charcoal', price: '195', source: 'COS', image_url: 'https://images.unsplash.com/photo-1544923246-77307dd270df?w=400&q=80' },
    ]
  },
  'both': {
    title: 'Unisex & Streetwear',
    subtitle: 'Trending styles for everyone — from streetwear to everyday essentials.',
    query: 'unisex streetwear fashion',
    editorsPicks: [
      { id: 1, title: 'Gender-Fluid Style', query: 'unisex fashion', image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&q=80' },
      { id: 2, title: 'Sneaker Culture', query: 'sneakers', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80' },
      { id: 3, title: 'Oversized Everything', query: 'oversized clothing', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80' }
    ],
    featured: [
      { id: 'f1', title: 'Oversized Graphic Hoodie', price: '65', source: 'Adidas', image_url: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400&q=80' },
      { id: 'f2', title: 'Cargo Joggers — Black', price: '52', source: 'Nike', image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80' },
      { id: 'f3', title: 'Canvas Tote Bag — Natural', price: '28', source: 'Madewell', image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80' },
      { id: 'f4', title: 'Retro Running Shoes', price: '95', source: 'New Balance', image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80' },
    ]
  }
}

const currentConfig = computed(() => {
  const slug = route.params.category || 'for-her'
  return categoryConfig[slug] || categoryConfig['for-her']
})

const pageTitle = computed(() => currentConfig.value.title)
const pageSubtitle = computed(() => currentConfig.value.subtitle)
const editorsPicks = computed(() => currentConfig.value.editorsPicks)
const featuredProducts = computed(() => currentConfig.value.featured)

// Category prefix for scoping searches
const categoryPrefix = computed(() => {
  const slug = route.params.category || 'for-her'
  if (slug === 'for-him') return 'men'
  if (slug === 'for-her') return 'women'
  return ''
})

// Combine: featured first, then API products (deduped)
const allProducts = computed(() => {
  if (deals.value.length === 0) return featuredProducts.value
  return deals.value
})

const displayProducts = computed(() => allProducts.value.slice(0, visibleCount.value))

const formatPrice = (price) => {
  const num = parseFloat(price)
  if (isNaN(num)) return '0.00'
  return num % 1 === 0 ? num.toFixed(0) : num.toFixed(2)
}

const getCardHeight = (idx) => {
  const pattern = [0, 1, 2, 0, 2, 1, 0, 2]
  const h = pattern[idx % pattern.length]
  if (h === 0) return 'height-tall'
  if (h === 1) return 'height-medium'
  return 'height-short'
}

const fetchProducts = async (query) => {
  loading.value = true
  try {
    const searchTerm = query || currentConfig.value.query
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
      badge: p.product_badge || (p.is_best_seller ? 'Best Seller' : (p.is_amazon_choice ? 'Amazon Choice' : null))
    }))
  } catch (err) {
    console.error('Failed to fetch products:', err)
  } finally {
    loading.value = false
  }
}

const searchProducts = () => {
  if (!searchQuery.value.trim()) return
  const scopedQuery = categoryPrefix.value
    ? `${categoryPrefix.value} ${searchQuery.value}`
    : searchQuery.value
  hasSearched.value = true
  lastQuery.value = searchQuery.value
  visibleCount.value = 12
  fetchProducts(scopedQuery)
}

const clearSearch = () => {
  searchQuery.value = ''
  hasSearched.value = false
  lastQuery.value = ''
  visibleCount.value = 12
  fetchProducts()
}

const openProduct = (deal) => {
  // Store product data for the detail page to pick up
  localStorage.setItem('fyndaViewProduct', JSON.stringify(deal))
  const productId = deal.id || encodeURIComponent(deal.title.substring(0, 30))
  router.push(`/product/${productId}`)
}

const goSearch = (query) => {
  router.push(`/?q=${encodeURIComponent(query)}`)
}

onMounted(() => {
  fetchProducts()
  startTypingAnimation()
})

onUnmounted(() => {
  stopTypingAnimation()
})

watch(() => route.params.category, () => {
  visibleCount.value = 12
  searchQuery.value = ''
  hasSearched.value = false
  deals.value = []
  fetchProducts()
  // Restart typing animation for new category
  stopTypingAnimation()
  isTypingPaused = false
  startTypingAnimation()
})
</script>

<style scoped>
.category-landing {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.landing-content {
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 1.5rem 4rem;
  width: 100%;
}

/* ── Hero ── */
.landing-hero {
  padding: 3.5rem 0 2rem;
}

/* ── Search Bar ── */
.category-search {
  margin-top: 1.5rem;
  max-width: 580px;
}

.search-box {
  display: flex;
  align-items: center;
  background: #fff;
  border: 2px solid #e0e0e0;
  border-radius: 32px;
  padding: 0.4rem 0.5rem 0.4rem 1.25rem;
  transition: all 0.2s ease;
}

.search-box.focused {
  border-color: #1a1a1a;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
}

.search-icon {
  color: #999;
  flex-shrink: 0;
  margin-right: 0.75rem;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  color: #1a1a1a;
  outline: none;
  min-width: 0;
  height: 38px;
}

.search-input::placeholder {
  color: #bbb;
}

.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  min-width: 22px;
  padding: 0;
  border: none;
  background: #e8e8e8;
  border-radius: 50%;
  color: #666;
  cursor: pointer;
  margin-right: 0.35rem;
  flex-shrink: 0;
  transition: background 0.2s ease;
}

.clear-btn svg {
  width: 12px;
  height: 12px;
}

.clear-btn:hover {
  background: #d4d4d4;
}

.search-submit {
  padding: 0.5rem 1.25rem;
  background: #1a1a1a;
  color: #fff;
  border: none;
  border-radius: 24px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
  white-space: nowrap;
}

.search-submit:hover {
  background: #333;
}

.landing-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 2.75rem;
  font-weight: 400;
  color: #1a1a1a;
  margin: 0 0 0.5rem;
  line-height: 1.15;
}

.landing-subtitle {
  font-size: 0.9rem;
  color: #888;
  max-width: 500px;
  line-height: 1.5;
  margin: 0;
}

/* ── Section Heading ── */
.section-heading {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.5rem;
  font-weight: 400;
  color: #1a1a1a;
  margin-bottom: 1.25rem;
}

/* ── Editor's Picks ── */
.editors-section {
  margin-bottom: 2.5rem;
}

.editors-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.editors-card {
  position: relative;
  height: 300px;
  border-radius: 12px;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.editors-card:hover {
  transform: scale(1.02);
}

.editors-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.65) 100%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 1.5rem;
}

.editors-overlay h3 {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.35rem;
  font-weight: 400;
  color: #fff;
  margin: 0 0 0.3rem;
  line-height: 1.2;
}

.editors-link {
  font-size: 0.75rem;
  font-weight: 600;
  color: #fff;
  text-decoration: underline;
  text-underline-offset: 3px;
}

/* ── Product Grid ── */
.for-you-section {
  margin-bottom: 2rem;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.product-card {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.product-card:hover {
  transform: translateY(-3px);
}

.product-image {
  overflow: hidden;
  border-radius: 4px;
  background: #f5f5f5;
}

.product-image.height-tall { height: 420px; }
.product-image.height-medium { height: 340px; }
.product-image.height-short { height: 280px; }

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.04);
}

.product-info {
  padding: 0.75rem 0.15rem;
}

.product-source {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 1px;
  color: #999;
}

.product-title {
  font-size: 0.82rem;
  font-weight: 500;
  color: #1a1a1a;
  margin: 0.3rem 0 0.25rem;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-price {
  font-size: 0.82rem;
  font-weight: 600;
  color: #1a1a1a;
}

/* ── Load More ── */
.load-more-wrap {
  text-align: center;
  margin-top: 2.5rem;
}

.load-more-btn {
  padding: 0.75rem 2.5rem;
  background: #1a1a1a;
  color: #fff;
  border: none;
  border-radius: 30px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
}

.load-more-btn:hover {
  background: #333;
}

/* ── Responsive ── */
@media (max-width: 1024px) {
  .product-grid { grid-template-columns: repeat(3, 1fr); }
  .editors-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 768px) {
  .product-grid { grid-template-columns: repeat(2, 1fr); }
  .editors-grid { grid-template-columns: repeat(2, 1fr); }
  .landing-title { font-size: 2rem; }
  .product-image.height-tall { height: 320px; }
  .product-image.height-medium { height: 260px; }
  .product-image.height-short { height: 220px; }
}

@media (max-width: 480px) {
  .product-grid { grid-template-columns: 1fr; }
  .editors-grid { grid-template-columns: 1fr; }
  .editors-card { height: 240px; }
  .landing-title { font-size: 1.75rem; }
}
</style>
