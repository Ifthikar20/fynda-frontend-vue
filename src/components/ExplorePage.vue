<template>
  <div class="explore-page">
    <NavBar />

    <main class="explore-content">

        <!-- Editor's Picks -->
        <section class="editors-section">
          <h2 class="section-heading">Editor's picks</h2>
          <div class="editors-grid">
            <div 
              v-for="pick in editorsPicks" 
              :key="pick.id" 
              class="editors-card"
              :style="{ backgroundImage: `url(${pick.image})` }"
              @click="searchSuggestion(pick.query)"
            >
              <div class="editors-overlay">
                <h3>{{ pick.title }}</h3>
                <span class="explore-link">Start exploring →</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Shop By Category -->
        <section class="category-section">
          <div class="category-grid">
            <div 
              v-for="cat in categories" 
              :key="cat.id" 
              class="category-card"
              :style="{ backgroundImage: `url(${cat.image})` }"
              @click="goCategory(cat.query)"
            >
              <div class="category-overlay">
                <h3>{{ cat.title }}</h3>
                <span class="explore-link">Start exploring →</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Promo Banner -->
        <section class="promo-section">
          <div class="promo-banner">
            <div class="promo-image">
              <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80" alt="Fashion" />
            </div>
            <div class="promo-content">
              <span class="promo-tag">FOR YOU</span>
              <h2>Discover & save on trending fashion</h2>
              <p>Browse curated collections across trending brands, exclusive deals, and styles that match your vibe.</p>
              <router-link to="/" class="promo-link">Learn more →</router-link>
            </div>
          </div>
        </section>

        <!-- Trending Now -->
        <section class="trending-section">
          <div class="trending-header">
            <div>
              <h2 class="section-heading">What's trending</h2>
              <p class="section-sub">See what shoppers are loving right now</p>
            </div>
          </div>
          <div class="trending-grid">
            <div 
              v-for="item in trendingItems" 
              :key="item.id" 
              class="trending-card"
              @click="searchSuggestion(item.query)"
            >
              <div class="trending-image">
                <img :src="item.image" :alt="item.title" />
              </div>
              <div class="trending-info">
                <span class="trending-tag">Trending</span>
                <h3>{{ item.title }}</h3>
                <span class="explore-link-sm">Shop now →</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Explore Brands -->
        <section class="brands-section">
          <div class="brands-header">
            <div>
              <h2 class="section-heading">Explore brands</h2>
              <p class="section-sub">Explore top-tier products from brands you know and discover new brands you'll love.</p>
            </div>
          </div>

          <!-- Sort pills -->
          <div class="sort-bar">
            <button
              v-for="opt in sortOptions"
              :key="opt.value"
              class="sort-pill"
              :class="{ active: sortBy === opt.value }"
              @click="sortBy = opt.value; fetchBrands()"
            >
              {{ opt.label }}
            </button>
          </div>

          <!-- Brand grid -->
          <div v-if="brandsLoading" class="brands-loading">
            <span>Loading brands…</span>
          </div>
          <div v-else class="brands-grid">
            <div 
              v-for="brand in brands" 
              :key="brand.slug" 
              class="brand-card"
              :style="brandCardStyle(brand)"
            >
              <div class="brand-overlay" @click="goBrand(brand.name)">
                <span class="brand-name">{{ brand.name }}</span>
                <span class="brand-category">{{ brand.category }}</span>
              </div>
              <button
                class="like-btn"
                :class="{ liked: brand.is_liked }"
                @click.stop="toggleLike(brand)"
                :title="brand.is_liked ? 'Unlike' : 'Like'"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                    2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09
                    C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5
                    c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <span class="like-count">{{ brand.likes_count }}</span>
              </button>
            </div>
          </div>
        </section>

    </main>

    <Footer />
  </div>
</template>

<script setup>
defineOptions({ name: 'ExplorePage' })
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from './NavBar.vue'
import Footer from './Footer.vue'

const router = useRouter()

// ── API ────────────────────────────────────────
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
const API_BASE = import.meta.env.VITE_API_BASE || '/api/v1'

// ── Search state ───────────────────────────────
const searchQuery = ref('')
const lastSearchQuery = ref('')
const searchResults = ref([])
const searchLoading = ref(false)
const hasSearched = ref(false)
const isSearchFocused = ref(false)

const quickSuggestions = [
  'Quiet luxury outfit',
  'Gold jewelry under $50',
  'Summer linen dress',
  'Designer bag in Maroon'
]

async function handleSearch() {
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

function searchSuggestion(suggestion) {
  searchQuery.value = suggestion
  handleSearch()
}

function clearSearch() {
  hasSearched.value = false
  searchQuery.value = ''
  lastSearchQuery.value = ''
  searchResults.value = []
}

function openDeal(deal) {
  if (deal.deal_url || deal.url) {
    window.open(deal.deal_url || deal.url, '_blank')
  }
}

function formatPrice(price) {
  if (!price) return '0.00'
  return parseFloat(price).toFixed(2)
}

// ── Brands state ───────────────────────────────
const brands = ref([])
const brandsLoading = ref(true)
const sortBy = ref('trending')

const sortOptions = [
  { label: '🔥 Trending', value: 'trending' },
  { label: '❤️ Most Liked', value: 'most_liked' },
  { label: '✨ Newest', value: 'newest' },
]

const brandCovers = {
  'fashion-nova': 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&q=80',
  'princess-polly': 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=400&q=80',
  'oh-polly': 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=80',
  'meshki': 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80',
  'gymshark': 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400&q=80',
  'true-classic': 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&q=80',
  'steve-madden': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80',
  'allbirds': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
  'mejuri': 'https://images.unsplash.com/photo-1515562141589-67f0d0e6e9e1?w=400&q=80',
  'colourpop': 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&q=80',
  'kylie-cosmetics': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80',
  'rebecca-minkoff': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80',
  'ana-luisa': 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80',
  'mvmt': 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=400&q=80',
  'taylor-stitch': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
  'bylt-basics': 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=400&q=80',
  'cuts-clothing': 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&q=80',
  'chubbies': 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80',
  'beginning-boutique': 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&q=80',
}

async function fetchBrands() {
  brandsLoading.value = true
  try {
    const res = await fetch(`${API_BASE}/brands/?sort=${sortBy.value}`)
    const data = await res.json()
    brands.value = data.brands || []
  } catch (e) {
    console.error('Failed to load brands:', e)
  } finally {
    brandsLoading.value = false
  }
}

async function toggleLike(brand) {
  const method = brand.is_liked ? 'DELETE' : 'POST'
  try {
    const res = await fetch(`${API_BASE}/brands/${brand.slug}/like/`, {
      method,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
    if (res.ok) {
      const data = await res.json()
      brand.is_liked = data.liked
      brand.likes_count = data.likes_count
    } else if (res.status === 401 || res.status === 403) {
      router.push('/login')
    }
  } catch (e) {
    console.error('Like failed:', e)
  }
}

function brandCardStyle(brand) {
  const img = brand.cover_image_url || brandCovers[brand.slug] || ''
  if (img) return { backgroundImage: `url(${img})` }
  const hue = Math.abs(brand.name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360)
  return { background: `hsl(${hue}, 25%, 18%)` }
}

onMounted(fetchBrands)

// ── Static content ─────────────────────────────
const editorsPicks = [
  {
    id: 1,
    title: 'Wild About Animal Print',
    query: 'animal print fashion',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80'
  },
  {
    id: 2,
    title: 'Holiday in the Sun',
    query: 'summer vacation outfit',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80'
  },
  {
    id: 3,
    title: 'Transformative Teal',
    query: 'teal green fashion',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80'
  }
]

const categories = [
  {
    id: 1,
    title: 'For her',
    query: 'for-her',
    image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=600&q=80'
  },
  {
    id: 2,
    title: 'For him',
    query: 'for-him',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80'
  },
  {
    id: 3,
    title: 'Both',
    query: 'both',
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&q=80'
  }
]

const trendingItems = [
  {
    id: 1,
    title: 'Quiet Luxury',
    query: 'quiet luxury minimal',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80'
  },
  {
    id: 2,
    title: 'Linen Everything',
    query: 'linen clothing',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80'
  },
  {
    id: 3,
    title: 'Statement Bags',
    query: 'designer handbag',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80'
  },
  {
    id: 4,
    title: 'Chunky Sneakers',
    query: 'chunky sneakers',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80'
  },
  {
    id: 5,
    title: 'Gold Jewelry',
    query: 'gold jewelry',
    image: 'https://images.unsplash.com/photo-1515562141589-67f0d0e6e9e1?w=400&q=80'
  },
  {
    id: 6,
    title: 'Oversized Blazers',
    query: 'oversized blazer',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80'
  }
]

const goCategory = (slug) => {
  router.push(`/explore/${slug}`)
}

const goBrand = (brand) => {
  router.push(`/brand/${encodeURIComponent(brand)}`)
}
</script>

<style scoped>
.explore-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.explore-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
  width: 100%;
}

/* ── Large Search Bar ── */
.search-section {
  margin-bottom: 2.5rem;
  padding-top: 1rem;
}

.search-container {
  max-width: 640px;
  margin: 0 auto;
}

.search-box {
  display: flex;
  align-items: center;
  background: #fff;
  border: 2px solid #e0e0e0;
  border-radius: 32px;
  padding: 0.6rem 0.6rem 0.6rem 1.5rem;
  min-height: 62px;
  transition: all 0.2s ease;
}

.search-box:focus-within {
  border-color: #000;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

.search-icon-wrap {
  color: #888;
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.search-input {
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

.search-input::placeholder {
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
  white-space: nowrap;
}

.search-btn:hover {
  background: #333;
}

/* Quick suggestions */
.quick-suggestions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.suggestion-label {
  font-size: 0.78rem;
  color: #999;
  font-weight: 500;
}

.suggestion-pills {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.suggestion-pills button {
  padding: 6px 14px;
  border: 1px solid #ddd;
  border-radius: 100px;
  background: #fff;
  color: #555;
  font-size: 0.78rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.suggestion-pills button:hover {
  border-color: #000;
  color: #000;
}

/* ── Search Results ── */
.results-section {
  margin-bottom: 2rem;
}

.results-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 1.25rem;
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

.back-to-explore {
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

.back-to-explore:hover {
  border-color: #000;
  color: #000;
}

/* Loading */
.inline-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #999;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #eee;
  border-top-color: #1a1a1a;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.inline-loading p {
  margin-top: 1rem;
  font-size: 0.9rem;
}

/* Empty state */
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

/* ── Section Headings ── */
.section-heading {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.75rem;
  font-weight: 400;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
}

.section-sub {
  font-size: 0.85rem;
  color: #888;
  margin-bottom: 0;
}

/* ── Editor's Picks ── */
.editors-section {
  margin-bottom: 3rem;
}

.editors-section .section-heading {
  text-align: center;
  margin-bottom: 1.5rem;
}

.editors-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.editors-card {
  position: relative;
  height: 340px;
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
  font-size: 1.5rem;
  font-weight: 400;
  color: #fff;
  margin: 0 0 0.35rem;
  line-height: 1.2;
}

.explore-link {
  font-size: 0.78rem;
  font-weight: 600;
  color: #fff;
  text-decoration: underline;
  text-underline-offset: 3px;
}

/* ── Category Cards ── */
.category-section {
  margin-bottom: 3rem;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.category-card {
  position: relative;
  height: 260px;
  border-radius: 12px;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  cursor: pointer;
  filter: grayscale(100%);
  transition: all 0.3s ease;
}

.category-card:hover {
  filter: grayscale(0%);
  transform: scale(1.02);
}

.category-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.55) 100%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 1.25rem;
}

.category-overlay h3 {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.25rem;
  font-weight: 400;
  color: #fff;
  margin: 0 0 0.25rem;
}

/* ── Promo Banner ── */
.promo-section {
  margin-bottom: 3rem;
}

.promo-banner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #f5f0ea;
  border-radius: 16px;
  overflow: hidden;
  min-height: 300px;
}

.promo-image {
  overflow: hidden;
}

.promo-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.promo-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 3rem;
}

.promo-tag {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 2px;
  color: #999;
  text-transform: uppercase;
  margin-bottom: 0.75rem;
}

.promo-content h2 {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.65rem;
  font-weight: 400;
  color: #1a1a1a;
  line-height: 1.25;
  margin: 0 0 0.75rem;
}

.promo-content p {
  font-size: 0.85rem;
  color: #666;
  line-height: 1.6;
  margin: 0 0 1.25rem;
}

.promo-link {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1a1a1a;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.promo-link:hover {
  color: #555;
}

/* ── Trending ── */
.trending-section {
  margin-bottom: 3.5rem;
}

.trending-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 1.25rem;
}

.trending-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.trending-card {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #eee;
  cursor: pointer;
  transition: all 0.25s ease;
}

.trending-card:hover {
  border-color: #ddd;
  box-shadow: 0 8px 24px rgba(0,0,0,0.07);
  transform: translateY(-3px);
}

.trending-image {
  aspect-ratio: 4/3;
  overflow: hidden;
}

.trending-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.trending-card:hover .trending-image img {
  transform: scale(1.05);
}

.trending-info {
  padding: 1rem 1.25rem;
}

.trending-tag {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  color: #16a34a;
  text-transform: uppercase;
}

.trending-info h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0.35rem 0;
}

.explore-link-sm {
  font-size: 0.78rem;
  color: #888;
  transition: color 0.2s ease;
}

.trending-card:hover .explore-link-sm {
  color: #1a1a1a;
}

/* ── Brands ── */
.brands-section {
  margin-bottom: 3rem;
}

.brands-header {
  margin-bottom: 1rem;
}

.sort-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.sort-pill {
  padding: 6px 16px;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid #ddd;
  border-radius: 100px;
  background: #fff;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sort-pill:hover {
  border-color: #bbb;
  color: #333;
}

.sort-pill.active {
  background: #1a1a1a;
  color: #fff;
  border-color: #1a1a1a;
}

.brands-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #aaa;
  font-size: 0.9rem;
}

.brands-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.brand-card {
  position: relative;
  height: 200px;
  border-radius: 10px;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.brand-card:hover {
  transform: scale(1.03);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}

.brand-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease;
}

.brand-card:hover .brand-overlay {
  background: rgba(0, 0, 0, 0.5);
}

.brand-name {
  font-family: 'Inter', sans-serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.brand-category {
  font-size: 0.7rem;
  color: rgba(255,255,255,0.75);
  margin-top: 4px;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.like-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  background: rgba(0,0,0,0.45);
  border: none;
  border-radius: 100px;
  color: rgba(255,255,255,0.85);
  cursor: pointer;
  font-size: 0.72rem;
  font-weight: 600;
  backdrop-filter: blur(4px);
  transition: all 0.2s ease;
  z-index: 2;
}

.like-btn:hover {
  background: rgba(0,0,0,0.65);
  color: #fff;
}

.like-btn.liked {
  color: #ef4444;
}

.like-btn.liked:hover {
  color: #dc2626;
}

.like-count {
  font-variant-numeric: tabular-nums;
}

/* ── Responsive ── */
@media (max-width: 900px) {
  .editors-grid,
  .category-grid,
  .trending-grid,
  .brands-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .results-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .promo-banner {
    grid-template-columns: 1fr;
  }

  .promo-image {
    height: 220px;
  }

  .promo-content {
    padding: 2rem;
  }
}

@media (max-width: 600px) {
  .editors-grid,
  .category-grid {
    grid-template-columns: 1fr;
  }

  .editors-card {
    height: 260px;
  }

  .category-card {
    height: 200px;
  }

  .trending-grid {
    grid-template-columns: 1fr;
  }

  .results-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .brands-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .brand-card {
    height: 160px;
  }

  .section-heading {
    font-size: 1.4rem;
  }
}
</style>
