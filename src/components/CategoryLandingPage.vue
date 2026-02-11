<template>
  <div class="category-landing">
    <NavBar />

    <main class="landing-content">
      <!-- Hero -->
      <section class="landing-hero">
        <h1 class="landing-title">{{ pageTitle }}</h1>
        <p class="landing-subtitle">{{ pageSubtitle }}</p>
      </section>

      <!-- For You -->
      <section class="for-you-section">
        <h2 class="section-heading">For you</h2>

        <!-- Skeleton Loader -->
        <div v-if="loading" class="product-grid">
          <div v-for="n in 8" :key="'skel-' + n" class="product-card skeleton">
            <div class="skeleton-image"></div>
            <div class="skeleton-line short"></div>
            <div class="skeleton-line medium"></div>
            <div class="skeleton-line tiny"></div>
          </div>
        </div>

        <!-- Products -->
        <div v-else class="product-grid">
          <div 
            v-for="(deal, idx) in visibleDeals" 
            :key="deal.id || idx" 
            class="product-card"
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
        <div v-if="!loading && visibleCount < deals.length" class="load-more-wrap">
          <button class="load-more-btn" @click="visibleCount += 12">Load more</button>
        </div>

        <!-- Empty State -->
        <div v-if="!loading && deals.length === 0" class="empty-state">
          <p>No products found. Check back soon!</p>
        </div>
      </section>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NavBar from './NavBar.vue'
import Footer from './Footer.vue'

const route = useRoute()
const router = useRouter()

const deals = ref([])
const loading = ref(true)
const visibleCount = ref(12)

const categoryConfig = {
  'for-her': {
    title: "Women's Fashion",
    subtitle: 'Discover trending women\'s fashion and clothing curated just for you.',
    query: 'women fashion clothing'
  },
  'for-him': {
    title: "Men's Clothing",
    subtitle: 'Discover trending men\'s fashion and clothing curated just for you.',
    query: 'men fashion clothing'
  },
  'both': {
    title: 'Unisex & Streetwear',
    subtitle: 'Trending styles for everyone — from streetwear to everyday essentials.',
    query: 'unisex streetwear fashion'
  }
}

const currentConfig = computed(() => {
  const slug = route.params.category || 'for-her'
  return categoryConfig[slug] || categoryConfig['for-her']
})

const pageTitle = computed(() => currentConfig.value.title)
const pageSubtitle = computed(() => currentConfig.value.subtitle)

const visibleDeals = computed(() => deals.value.slice(0, visibleCount.value))

const formatPrice = (price) => {
  const num = parseFloat(price)
  if (isNaN(num)) return '0.00'
  return num % 1 === 0 ? num.toFixed(0) : num.toFixed(2)
}

// Vary card heights for editorial feel
const getCardHeight = (idx) => {
  const pattern = [0, 1, 2, 0, 2, 1, 0, 2]
  const h = pattern[idx % pattern.length]
  if (h === 0) return 'height-tall'
  if (h === 1) return 'height-medium'
  return 'height-short'
}

const fetchProducts = async () => {
  loading.value = true
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
    const response = await fetch(`${apiUrl}/api/search/?q=${encodeURIComponent(currentConfig.value.query)}`)
    const data = await response.json()
    deals.value = data.deals || []
  } catch (err) {
    console.error('Failed to fetch products:', err)
    deals.value = []
  } finally {
    loading.value = false
  }
}

const openProduct = (deal) => {
  if (deal.id) {
    router.push(`/product/${deal.id}`)
  }
}

onMounted(fetchProducts)

watch(() => route.params.category, () => {
  visibleCount.value = 12
  fetchProducts()
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

/* ── Product Grid ── */
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

.product-image.height-tall {
  height: 420px;
}

.product-image.height-medium {
  height: 340px;
}

.product-image.height-short {
  height: 280px;
}

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

/* ── Skeleton ── */
.product-card.skeleton {
  cursor: default;
}

.skeleton-image {
  height: 340px;
  border-radius: 4px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-line {
  height: 10px;
  border-radius: 4px;
  margin-top: 10px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-line.short { width: 40%; }
.skeleton-line.medium { width: 75%; }
.skeleton-line.tiny { width: 25%; }

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
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

/* ── Empty State ── */
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #999;
  font-size: 0.9rem;
}

/* ── Responsive ── */
@media (max-width: 1024px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .landing-title {
    font-size: 2rem;
  }

  .product-image.height-tall { height: 320px; }
  .product-image.height-medium { height: 260px; }
  .product-image.height-short { height: 220px; }
}

@media (max-width: 480px) {
  .product-grid {
    grid-template-columns: 1fr;
  }

  .landing-title {
    font-size: 1.75rem;
  }
}
</style>
