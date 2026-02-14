<template>
  <div class="compare-page">
    <NavBar />

    <main class="compare-content">
      <!-- Header -->
      <div class="compare-header">
        <div class="header-top">
          <div>
            <h1 class="compare-title">Compare Products</h1>
            <p class="compare-subtitle">Side-by-side comparison of up to 3 products</p>
          </div>
          <button v-if="compareItems.length > 0" class="btn-s btn-s-danger" @click="clearAll">
            Clear All
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="compareItems.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.2">
            <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
        </div>
        <h2>No products to compare</h2>
        <p>Add products from any product page using the compare button</p>
        <router-link to="/" class="browse-btn">Browse Products</router-link>
      </div>

      <!-- Product Cards Row -->
      <div v-else class="compare-cards">
        <div
          v-for="(item, idx) in compareItems"
          :key="item.id"
          class="product-card"
          :class="{ 'winner-card': overallWinner === item.id }"
          :style="{ animationDelay: idx * 0.1 + 's' }"
        >
          <!-- Winner Badge -->
          <div v-if="overallWinner === item.id && compareItems.length > 1" class="winner-crown">
            <span class="crown-label">Best Value</span>
          </div>

          <!-- Product Image -->
          <div class="card-image-wrap">
            <img :src="item.image_url" :alt="item.title" class="card-image" />
          </div>

          <!-- Card Info -->
          <div class="card-info">
            <router-link :to="'/product/' + item.id" class="card-title">{{ item.title }}</router-link>
            <span class="card-brand">{{ item.brand || extractBrand(item) }}</span>
            <div class="card-price-row">
              <span class="card-price" :class="{ 'best-price': isBestPrice(item) }">
                ${{ formatPrice(item.price) }}
              </span>
              <span v-if="item.original_price && parseFloat(item.original_price) > parseFloat(item.price)" class="card-original">
                ${{ formatPrice(item.original_price) }}
              </span>
            </div>
            <span v-if="isBestPrice(item) && compareItems.length > 1" class="best-badge">Lowest Price</span>
            <span v-if="getSavings(item) > 0" class="savings-badge">Save {{ getSavings(item) }}%</span>
          </div>

          <!-- Shop Button -->
          <a :href="item.url" target="_blank" rel="noopener" class="shop-btn">Shop This Item</a>

          <!-- Action Buttons -->
          <div class="card-actions">
            <button class="btn-s" :class="isInCloset(item.id) ? 'btn-s-filled' : 'btn-s-outline'" @click="saveToCloset(item)">
              {{ isInCloset(item.id) ? 'Saved' : 'Save to Closet' }}
            </button>
            <button class="btn-s btn-s-outline" @click="removeItem(item.id)" title="Remove">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>

        <!-- Add Product Slot -->
        <div v-if="compareItems.length < 3" class="product-card add-card" @click="goHome">
          <div class="add-card-inner">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#bbb" stroke-width="1.5">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            <span class="add-label">Add Product</span>
            <span class="add-hint">Browse and add to compare</span>
          </div>
        </div>
      </div>

      <!-- Comparison Details -->
      <div v-if="compareItems.length > 0" class="comparison-section">
        <h2 class="section-title">
          Side-by-Side Comparison
        </h2>

        <!-- Product Images Row -->
        <div class="comp-row">
          <div class="row-label-static">Product</div>
          <div class="comp-grid">
            <div v-for="item in compareItems" :key="'img-' + item.id" class="comp-cell comp-cell-img">
              <img :src="item.image_url" :alt="item.title" class="comp-product-img" />
              <span class="comp-product-name">{{ truncateTitle(item.title, 30) }}</span>
            </div>
          </div>
        </div>
        <!-- Price -->
        <div class="comp-row">
          <div class="row-label-static">Price</div>
          <div class="comp-grid">
            <div v-for="item in compareItems" :key="'price-' + item.id" class="comp-cell">
              <span class="cell-value" :class="{ 'best-price': isBestPrice(item) }">${{ formatPrice(item.price) }}</span>
              <span v-if="isBestPrice(item) && compareItems.length > 1" class="best-badge">Lowest</span>
            </div>
          </div>
        </div>

        <!-- Store -->
        <div class="comp-row">
          <div class="row-label-static">Store</div>
          <div class="comp-grid">
            <div v-for="item in compareItems" :key="'store-' + item.id" class="comp-cell">
              <span class="cell-value">{{ item.merchant_name || item.source || '---' }}</span>
            </div>
          </div>
        </div>

        <!-- Style -->
        <div class="comp-row">
          <div class="row-label-static">Style</div>
          <div class="comp-grid">
            <div v-for="item in compareItems" :key="'style-' + item.id" class="comp-cell">
              <span class="tag">{{ extractStyle(item) }}</span>
            </div>
          </div>
        </div>

        <!-- Sizes -->
        <div class="comp-row">
          <div class="row-label-static">Available Sizes</div>
          <div class="comp-grid">
            <div v-for="item in compareItems" :key="'sizes-' + item.id" class="comp-cell">
              <div class="size-chips">
                <span v-for="size in getSizes(item)" :key="size" class="size-chip">{{ size }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Colors -->
        <div class="comp-row">
          <div class="row-label-static">Colors</div>
          <div class="comp-grid">
            <div v-for="item in compareItems" :key="'colors-' + item.id" class="comp-cell">
              <div class="color-chips">
                <span v-for="color in getColors(item)" :key="color" class="color-dot" :style="{ background: color }" :title="color"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Material -->
        <div class="comp-row">
          <div class="row-label-static">Material</div>
          <div class="comp-grid">
            <div v-for="item in compareItems" :key="'mat-' + item.id" class="comp-cell">
              <span class="tag">{{ getMaterial(item) }}</span>
            </div>
          </div>
        </div>

        <!-- Fit -->
        <div class="comp-row">
          <div class="row-label-static">Fit</div>
          <div class="comp-grid">
            <div v-for="item in compareItems" :key="'fit-' + item.id" class="comp-cell">
              <span class="cell-value">{{ getFit(item) }}</span>
            </div>
          </div>
        </div>

        <!-- Condition -->
        <div class="comp-row">
          <div class="row-label-static">Condition</div>
          <div class="comp-grid">
            <div v-for="item in compareItems" :key="'cond-' + item.id" class="comp-cell">
              <span class="cell-value">{{ item.condition || 'New' }}</span>
            </div>
          </div>
        </div>

        <!-- Details -->
        <div class="comp-row">
          <div class="row-label-static">Details</div>
          <div class="comp-grid">
            <div v-for="item in compareItems" :key="'desc-' + item.id" class="comp-cell">
              <p class="desc-text">{{ getDescription(item) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Verdict -->

    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from './NavBar.vue'

const router = useRouter()
const compareItems = ref([])
const showAllRows = ref(false)

// Toggle-able rows
const visibleRows = reactive({
  price: true,
  store: true,
  style: true,
  sizes: true,
  colors: true,
  material: false,
  fit: false,
  condition: false,
  details: false,
})

watch(showAllRows, (val) => {
  visibleRows.material = val
  visibleRows.fit = val
  visibleRows.condition = val
  visibleRows.details = val
})

const toggleRow = (key) => {
  visibleRows[key] = !visibleRows[key]
}

// Data
const loadCompareItems = () => {
  const items = JSON.parse(localStorage.getItem('fyndaCompare') || '[]')
  compareItems.value = items.slice(0, 3)
}

const removeItem = (id) => {
  const items = JSON.parse(localStorage.getItem('fyndaCompare') || '[]')
  const filtered = items.filter(item => item.id !== id)
  localStorage.setItem('fyndaCompare', JSON.stringify(filtered))
  compareItems.value = filtered.slice(0, 3)
  window.dispatchEvent(new CustomEvent('compare-updated'))
}

const clearAll = () => {
  localStorage.setItem('fyndaCompare', '[]')
  compareItems.value = []
  window.dispatchEvent(new CustomEvent('compare-updated'))
}

const goHome = () => router.push('/')

// Closet integration
const closetIds = ref(new Set())

const loadClosetIds = () => {
  const closet = JSON.parse(localStorage.getItem('fyndaCloset') || '[]')
  closetIds.value = new Set(closet.map(i => i.id))
}

const isInCloset = (id) => closetIds.value.has(id)

const saveToCloset = (item) => {
  const closet = JSON.parse(localStorage.getItem('fyndaCloset') || '[]')
  if (closet.some(c => c.id === item.id)) return // already saved

  closet.push({
    id: item.id,
    title: item.title,
    price: item.price,
    image_url: item.image_url,
    product_url: item.url || '',
    brand: item.brand || '',
    source: 'compare',
    savedAt: new Date().toISOString()
  })
  localStorage.setItem('fyndaCloset', JSON.stringify(closet))
  closetIds.value = new Set([...closetIds.value, item.id])
}

// Formatting
const formatPrice = (price) => {
  if (!price) return '0.00'
  return parseFloat(price).toFixed(2)
}

const truncateTitle = (title, max) => {
  if (!title) return ''
  return title.length > max ? title.slice(0, max) + '…' : title
}

const isBestPrice = (item) => {
  if (compareItems.value.length < 2) return false
  const prices = compareItems.value.map(i => parseFloat(i.price) || Infinity)
  return parseFloat(item.price) === Math.min(...prices)
}

const getSavings = (item) => {
  if (!item.original_price || parseFloat(item.original_price) <= parseFloat(item.price)) return 0
  return Math.round(((parseFloat(item.original_price) - parseFloat(item.price)) / parseFloat(item.original_price)) * 100)
}

const getPriceBarWidth = (item) => {
  const prices = compareItems.value.map(i => parseFloat(i.price) || 0)
  const max = Math.max(...prices)
  if (max === 0) return 0
  return Math.round((parseFloat(item.price) / max) * 100)
}

// Overall winner (most "wins")
const overallWinner = computed(() => {
  if (compareItems.value.length < 2) return null
  const scores = {}
  compareItems.value.forEach(item => { scores[item.id] = 0 })

  // Best price wins a point
  const prices = compareItems.value.map(i => parseFloat(i.price) || Infinity)
  const bestPriceIdx = prices.indexOf(Math.min(...prices))
  if (bestPriceIdx >= 0) scores[compareItems.value[bestPriceIdx].id] += 2

  // Most colors
  const colorCounts = compareItems.value.map(i => getColors(i).length)
  const maxColors = Math.max(...colorCounts)
  compareItems.value.forEach((item, i) => {
    if (colorCounts[i] === maxColors) scores[item.id] += 1
  })

  // Most savings
  const savings = compareItems.value.map(i => getSavings(i))
  const maxSaving = Math.max(...savings)
  if (maxSaving > 0) {
    compareItems.value.forEach((item, i) => {
      if (savings[i] === maxSaving) scores[item.id] += 1
    })
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
  return sorted[0]?.[0] || null
})

// Verdicts
const verdicts = computed(() => {
  if (compareItems.value.length < 2) return []
  const v = []
  const prices = compareItems.value.map(i => parseFloat(i.price) || Infinity)
  const minPrice = Math.min(...prices)
  const cheapest = compareItems.value.find(i => parseFloat(i.price) === minPrice)
  if (cheapest) {
    v.push({
      type: 'winner',
      label: truncateTitle(cheapest.title, 30),
      reason: `Lowest price at $${formatPrice(cheapest.price)}`
    })
  }

  const savings = compareItems.value.map(i => getSavings(i))
  const maxSaving = Math.max(...savings)
  if (maxSaving > 0) {
    const bestDeal = compareItems.value[savings.indexOf(maxSaving)]
    v.push({
      type: 'info',
      label: truncateTitle(bestDeal.title, 30),
      reason: `Biggest discount at ${maxSaving}% off`
    })
  }

  const colorCounts = compareItems.value.map(i => getColors(i).length)
  const maxColors = Math.max(...colorCounts)
  const mostColors = compareItems.value[colorCounts.indexOf(maxColors)]
  if (mostColors && maxColors > 1) {
    v.push({
      type: 'info',
      label: truncateTitle(mostColors.title, 30),
      reason: `Most color options (${maxColors})`
    })
  }

  return v
})

// Extraction helpers
const extractBrand = (item) => {
  const title = (item.title || '').split(' ')
  return title[0] || 'Unknown'
}

const extractStyle = (item) => {
  const title = (item.title || '').toLowerCase()
  const styles = ['casual', 'formal', 'sporty', 'vintage', 'streetwear', 'bohemian', 'minimalist', 'classic', 'modern', 'elegant']
  for (const style of styles) {
    if (title.includes(style)) return style.charAt(0).toUpperCase() + style.slice(1)
  }
  if (title.match(/sneaker|trainer|running/)) return 'Sporty'
  if (title.match(/blazer|suit|dress shirt/)) return 'Formal'
  if (title.match(/hoodie|sweatshirt|jogger/)) return 'Casual'
  if (title.match(/dress|gown|blouse/)) return 'Elegant'
  return 'Everyday'
}

const getSizes = (item) => {
  const title = (item.title || '').toLowerCase()
  if (title.match(/shoe|sneaker|boot|sandal|heel|loafer|trainer/)) return ['6', '7', '8', '9', '10', '11']
  if (title.match(/ring/)) return ['5', '6', '7', '8', '9']
  return ['XS', 'S', 'M', 'L', 'XL']
}

const getColors = (item) => {
  const title = (item.title || '').toLowerCase()
  const colorMap = {
    'black': '#1a1a1a', 'white': '#f5f5f5', 'red': '#dc2626', 'blue': '#2563eb',
    'navy': '#1e3a5f', 'green': '#16a34a', 'pink': '#ec4899', 'beige': '#d4b896',
    'brown': '#8b5e3c', 'grey': '#9ca3af', 'gray': '#9ca3af', 'gold': '#d4a017',
    'silver': '#c0c0c0', 'cream': '#fffdd0', 'maroon': '#800000', 'olive': '#808000',
    'tan': '#d2b48c', 'coral': '#ff7f50', 'teal': '#008080',
    'burgundy': '#800020', 'khaki': '#c3b091', 'yellow': '#eab308', 'purple': '#9333ea',
    'orange': '#ea580c',
  }
  const found = []
  for (const [name, hex] of Object.entries(colorMap)) {
    if (title.includes(name)) found.push(hex)
  }
  if (found.length === 0) return ['#1a1a1a', '#f5f5f5', '#2563eb']
  return found
}

const getDescription = (item) => {
  if (item.description) {
    return item.description.length > 120 ? item.description.slice(0, 120) + '…' : item.description
  }
  return 'No description available'
}

const getMaterial = (item) => {
  const text = ((item.description || '') + ' ' + (item.title || '')).toLowerCase()
  const materials = [
    'cotton', 'polyester', 'silk', 'linen', 'wool', 'cashmere', 'viscose',
    'rayon', 'nylon', 'spandex', 'leather', 'suede', 'denim', 'velvet',
    'satin', 'chiffon', 'tweed', 'jersey', 'modal', 'elastane',
    'canvas', 'mesh', 'corduroy', 'fleece'
  ]
  const found = materials.filter(m => text.includes(m))
  return found.length > 0 ? found.map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(', ') : 'Not specified'
}

const getFit = (item) => {
  const text = ((item.description || '') + ' ' + (item.title || '')).toLowerCase()
  const fits = [
    'slim fit', 'regular fit', 'relaxed fit', 'oversized', 'bodycon',
    'loose fit', 'tailored', 'cropped', 'petite', 'plus size',
    'straight', 'wide leg', 'skinny', 'flared', 'a-line', 'midi', 'maxi', 'mini'
  ]
  const found = fits.filter(f => text.includes(f))
  return found.length > 0 ? found.map(f => f.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')).join(', ') : 'Standard'
}

onMounted(() => {
  loadCompareItems()
  loadClosetIds()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;500&display=swap');

/* Shadcn-style action buttons */
.card-actions {
  display: flex;
  gap: 8px;
  margin-top: 0.75rem;
}
.btn-s {
  display: inline-flex; align-items: center; justify-content: center;
  height: 32px; padding: 0 14px;
  border-radius: 6px; border: 1px solid transparent;
  font-family: 'Inter', sans-serif; font-size: 0.75rem; font-weight: 500;
  cursor: pointer; transition: all 0.15s ease;
  white-space: nowrap; line-height: 1;
}
.btn-s-filled {
  background: #111; color: #fff; border-color: #111;
}
.btn-s-filled:hover { background: #333; }
.btn-s-outline {
  background: #fff; color: #333; border-color: #d4d4d8;
}
.btn-s-outline:hover { background: #f4f4f5; border-color: #a1a1aa; }
.btn-s-danger {
  background: transparent; color: #a1a1aa; border-color: transparent;
}
.btn-s-danger:hover { background: #fef2f2; color: #dc2626; }

.compare-page {
  min-height: 100vh;
  background: #fafafa;
}

.compare-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 2rem 4rem;
}

/* Header */
.compare-header {
  margin-bottom: 2rem;
}

.header-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.compare-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 2rem;
  font-weight: 400;
  color: #1a1a1a;
  margin: 0 0 0.25rem 0;
}

.compare-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 0.88rem;
  color: #888;
  margin: 0;
}

.clear-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: none;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 0.82rem;
  color: #888;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  border-color: #dc2626;
  color: #dc2626;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 2rem;
  text-align: center;
}

.empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.empty-state h2 {
  font-family: 'Inter', sans-serif;
  font-size: 1.15rem;
  font-weight: 500;
  color: #555;
  margin: 0 0 0.5rem;
}

.empty-state p {
  font-size: 0.85rem;
  color: #999;
  margin: 0 0 1.5rem;
}

.browse-btn {
  padding: 0.75rem 2rem;
  background: #1a1a1a;
  color: #fff;
  text-decoration: none;
  border-radius: 10px;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.browse-btn:hover {
  background: #333;
  transform: translateY(-1px);
}

/* ======================== */
/* Product Cards            */
/* ======================== */
.compare-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.product-card {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 16px;
  padding: 1.5rem;
  position: relative;
  display: flex;
  flex-direction: column;
  animation: cardFadeIn 0.5s ease both;
  transition: all 0.25s ease;
}

.product-card:hover {
  border-color: #d0d0d0;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}

.winner-card {
  border-color: #86efac;
  background: linear-gradient(180deg, #f0fdf4 0%, #fff 40%);
}

.winner-card:hover {
  border-color: #4ade80;
}

@keyframes cardFadeIn {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Winner Crown */
.winner-crown {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 4px;
  background: #fff;
  border: 1px solid #86efac;
  padding: 4px 12px;
  border-radius: 20px;
  z-index: 2;
  animation: crownBounce 0.6s ease 0.3s both;
}

.crown-icon {
  font-size: 14px;
}

.crown-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  color: #16a34a;
  letter-spacing: 0.3px;
}

@keyframes crownBounce {
  0% { transform: translateX(-50%) scale(0); }
  60% { transform: translateX(-50%) scale(1.15); }
  100% { transform: translateX(-50%) scale(1); }
}



/* Card Image */
.card-image-wrap {
  width: 100%;
  aspect-ratio: 3/4;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1rem;
  background: #f5f5f5;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .card-image {
  transform: scale(1.03);
}

/* Card Info */
.card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 1rem;
}

.card-title {
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a1a1a;
  text-decoration: none;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.2s ease;
}

.card-title:hover {
  color: #3b82f6;
}

.card-brand {
  font-family: 'Inter', sans-serif;
  font-size: 0.78rem;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-price-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-top: 4px;
}

.card-price {
  font-family: 'Inter', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
}

.card-price.best-price {
  color: #16a34a;
}

.card-original {
  font-size: 0.82rem;
  color: #999;
  text-decoration: line-through;
}

.best-badge {
  display: inline-block;
  width: fit-content;
  padding: 3px 10px;
  background: #ecfdf5;
  color: #16a34a;
  font-family: 'Inter', sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: 6px;
  margin-top: 2px;
}

.savings-badge {
  display: inline-block;
  width: fit-content;
  padding: 3px 10px;
  background: #fef3c7;
  color: #b45309;
  font-family: 'Inter', sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: 6px;
}

/* Shop Button */
.shop-btn {
  display: block;
  width: 100%;
  padding: 12px 16px;
  background: #1a1a1a;
  color: #fff;
  text-decoration: none;
  text-align: center;
  border-radius: 10px;
  font-family: 'Inter', sans-serif;
  font-size: 0.88rem;
  font-weight: 500;
  transition: all 0.2s ease;
  margin-top: auto;
}

.shop-btn:hover {
  background: #333;
  transform: translateY(-1px);
}

/* Add Card */
.add-card {
  border: 2px dashed #e0e0e0;
  background: transparent;
  cursor: pointer;
  min-height: 400px;
}

.add-card:hover {
  border-color: #bbb;
  background: rgba(255, 255, 255, 0.5);
}

.add-card-inner {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.add-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  color: #999;
}

.add-hint {
  font-family: 'Inter', sans-serif;
  font-size: 0.78rem;
  color: #ccc;
}

/* ======================== */
/* Comparison Section       */
/* ======================== */
.comparison-section {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 16px;
  padding: 1.5rem 2rem;
  margin-bottom: 1.5rem;
}

.section-title {
  font-family: 'Inter', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 1.5rem 0;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

/* Comparison Row */
.comp-row {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 14px 0;
  border-bottom: 1px solid #f0f0f0;
}

.comp-row:last-of-type {
  border-bottom: none;
}

.row-label-static {
  font-family: 'Inter', sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 120px;
  padding-top: 4px;
}

.comp-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
  flex: 1;
}

.comp-cell {
  padding: 0;
}

.comp-cell-img {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.comp-product-img {
  width: 100%;
  max-width: 140px;
  aspect-ratio: 3/4;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid #eee;
}

.comp-product-name {
  font-family: 'Inter', sans-serif;
  font-size: 0.78rem;
  font-weight: 500;
  color: #555;
  text-align: center;
  line-height: 1.3;
}

.cell-value {
  font-family: 'Inter', sans-serif;
  font-size: 0.88rem;
  color: #333;
}

/* Price Bars */
.price-bars {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.price-bar-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bar-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.78rem;
  color: #666;
  min-width: 130px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bar-track {
  flex: 1;
  height: 8px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: #d1d5db;
  border-radius: 4px;
  transition: width 0.6s ease;
}

.bar-fill.bar-best {
  background: linear-gradient(90deg, #4ade80, #16a34a);
}

.bar-value {
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  color: #333;
  min-width: 70px;
  text-align: right;
}

.bar-value.best-price {
  color: #16a34a;
}

/* Tags, chips, dots */
.tag {
  display: inline-block;
  padding: 4px 12px;
  background: #f3f4f6;
  border-radius: 6px;
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  color: #555;
}

.size-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.size-chip {
  padding: 4px 10px;
  background: #f3f4f6;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  color: #555;
}

.color-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.color-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #e5e5e5;
  cursor: default;
  transition: transform 0.15s ease;
}

.color-dot:hover {
  transform: scale(1.2);
}

.desc-text {
  font-family: 'Inter', sans-serif;
  font-size: 0.82rem;
  color: #666;
  line-height: 1.5;
  margin: 0;
}

/* Toggle All */
.toggle-all-bar {
  display: flex;
  justify-content: center;
  padding-top: 12px;
}

.toggle-all-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  background: none;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 0.82rem;
  color: #888;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-all-btn:hover {
  border-color: #bbb;
  color: #555;
}

.toggle-all-btn svg {
  transition: transform 0.2s ease;
}

.toggle-all-btn svg.rotated {
  transform: rotate(180deg);
}

/* ======================== */
/* Quick Verdict            */
/* ======================== */
.verdict-panel {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 16px;
  padding: 1.5rem 2rem;
}

.verdict-title {
  font-family: 'Inter', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 1rem 0;
}

.verdict-icon {
  font-size: 1.1rem;
}

.verdict-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.verdict-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 14px;
  background: #fafafa;
  border-radius: 10px;
}

.verdict-badge {
  font-size: 0.9rem;
  flex-shrink: 0;
}

.verdict-text {
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  color: #555;
  line-height: 1.5;
}

.verdict-text strong {
  color: #1a1a1a;
}

/* ======================== */
/* Responsive               */
/* ======================== */
@media (max-width: 900px) {
  .compare-content {
    padding: 1.5rem 1rem 3rem;
  }

  .compare-cards {
    grid-template-columns: 1fr;
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
  }

  .add-card {
    min-height: 200px;
  }

  .comparison-section {
    padding: 1rem 1.25rem;
  }

  .bar-label {
    min-width: 80px;
    font-size: 0.72rem;
  }
}

@media (max-width: 600px) {
  .compare-title {
    font-size: 1.5rem;
  }

  .header-top {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
