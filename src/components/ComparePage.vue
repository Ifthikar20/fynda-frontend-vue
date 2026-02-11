<template>
  <div class="compare-page">
    <NavBar />

    <main class="compare-content">
      <div class="compare-header">
        <h1 class="compare-title">Compare Products</h1>
        <p class="compare-subtitle">Side-by-side comparison of up to 3 products</p>
      </div>

      <!-- Empty State -->
      <div v-if="compareItems.length === 0" class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5">
          <line x1="18" y1="20" x2="18" y2="10"/>
          <line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
        <h2>No products to compare</h2>
        <p>Add products from any product page using the compare button</p>
        <router-link to="/" class="browse-btn">Browse Products</router-link>
      </div>

      <!-- Comparison Table -->
      <div v-else class="compare-table">
        <!-- Product Images Row -->
        <div class="compare-row images-row">
          <div class="row-label"></div>
          <div v-for="item in compareItems" :key="'img-' + item.id" class="compare-cell product-cell">
            <button class="remove-btn" @click="removeItem(item.id)" title="Remove">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <img :src="item.image_url" :alt="item.title" class="compare-image" />
          </div>
          <!-- Add Product Slot -->
          <div v-if="compareItems.length < 3" class="compare-cell add-slot" @click="goHome">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#bbb" stroke-width="1.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            <span>Add product</span>
          </div>
        </div>

        <!-- Product Title -->
        <div class="compare-row">
          <div class="row-label">Product</div>
          <div v-for="item in compareItems" :key="'title-' + item.id" class="compare-cell">
            <router-link :to="'/product/' + item.id" class="product-link">{{ item.title }}</router-link>
          </div>
          <div v-if="compareItems.length < 3" class="compare-cell empty-cell"></div>
        </div>

        <!-- Brand -->
        <div class="compare-row">
          <div class="row-label">Brand</div>
          <div v-for="item in compareItems" :key="'brand-' + item.id" class="compare-cell">
            {{ item.brand || '—' }}
          </div>
          <div v-if="compareItems.length < 3" class="compare-cell empty-cell"></div>
        </div>

        <!-- Price -->
        <div class="compare-row highlight">
          <div class="row-label">Price</div>
          <div v-for="item in compareItems" :key="'price-' + item.id" class="compare-cell price-cell">
            <div>
              <span class="price-value" :class="{ 'best-price': isBestPrice(item) }">
                ${{ formatPrice(item.price) }}
              </span>
              <span v-if="item.original_price && parseFloat(item.original_price) > parseFloat(item.price)" class="original-price">
                ${{ formatPrice(item.original_price) }}
              </span>
            </div>
            <span v-if="isBestPrice(item) && compareItems.length > 1" class="best-badge">Best Price</span>
            <span v-if="item.original_price && parseFloat(item.original_price) > parseFloat(item.price)" class="savings-badge">
              Save {{ Math.round(((parseFloat(item.original_price) - parseFloat(item.price)) / parseFloat(item.original_price)) * 100) }}%
            </span>
          </div>
          <div v-if="compareItems.length < 3" class="compare-cell empty-cell"></div>
        </div>

        <!-- Store -->
        <div class="compare-row">
          <div class="row-label">Store</div>
          <div v-for="item in compareItems" :key="'store-' + item.id" class="compare-cell">
            {{ item.merchant_name || item.source || '—' }}
          </div>
          <div v-if="compareItems.length < 3" class="compare-cell empty-cell"></div>
        </div>

        <!-- Style -->
        <div class="compare-row">
          <div class="row-label">Style</div>
          <div v-for="item in compareItems" :key="'style-' + item.id" class="compare-cell">
            <span class="tag">{{ extractStyle(item) }}</span>
          </div>
          <div v-if="compareItems.length < 3" class="compare-cell empty-cell"></div>
        </div>

        <!-- Available Sizes -->
        <div class="compare-row">
          <div class="row-label">Available Sizes</div>
          <div v-for="item in compareItems" :key="'sizes-' + item.id" class="compare-cell">
            <div class="size-chips">
              <span v-for="size in getSizes(item)" :key="size" class="size-chip">{{ size }}</span>
            </div>
          </div>
          <div v-if="compareItems.length < 3" class="compare-cell empty-cell"></div>
        </div>

        <!-- Available Colors -->
        <div class="compare-row">
          <div class="row-label">Colors</div>
          <div v-for="item in compareItems" :key="'colors-' + item.id" class="compare-cell">
            <div class="color-chips">
              <span v-for="color in getColors(item)" :key="color" class="color-dot" :style="{ background: color }" :title="color"></span>
            </div>
          </div>
          <div v-if="compareItems.length < 3" class="compare-cell empty-cell"></div>
        </div>

        <!-- Condition -->
        <div class="compare-row">
          <div class="row-label">Condition</div>
          <div v-for="item in compareItems" :key="'cond-' + item.id" class="compare-cell">
            {{ item.condition || 'New' }}
          </div>
          <div v-if="compareItems.length < 3" class="compare-cell empty-cell"></div>
        </div>

        <!-- Description -->
        <div class="compare-row">
          <div class="row-label">Details</div>
          <div v-for="item in compareItems" :key="'desc-' + item.id" class="compare-cell description-cell">
            <p class="desc-text">{{ getDescription(item) }}</p>
          </div>
          <div v-if="compareItems.length < 3" class="compare-cell empty-cell"></div>
        </div>

        <!-- Material -->
        <div class="compare-row">
          <div class="row-label">Material</div>
          <div v-for="item in compareItems" :key="'mat-' + item.id" class="compare-cell">
            <span class="tag">{{ getMaterial(item) }}</span>
          </div>
          <div v-if="compareItems.length < 3" class="compare-cell empty-cell"></div>
        </div>

        <!-- Fit -->
        <div class="compare-row">
          <div class="row-label">Fit</div>
          <div v-for="item in compareItems" :key="'fit-' + item.id" class="compare-cell">
            {{ getFit(item) }}
          </div>
          <div v-if="compareItems.length < 3" class="compare-cell empty-cell"></div>
        </div>

        <!-- Shop Buttons -->
        <div class="compare-row actions-row">
          <div class="row-label"></div>
          <div v-for="item in compareItems" :key="'action-' + item.id" class="compare-cell">
            <a :href="item.url" target="_blank" rel="noopener" class="shop-btn">Shop Item</a>
          </div>
          <div v-if="compareItems.length < 3" class="compare-cell empty-cell"></div>
        </div>
      </div>

      <!-- Clear All -->
      <div v-if="compareItems.length > 0" class="clear-section">
        <button class="clear-btn" @click="clearAll">Clear All</button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from './NavBar.vue'

const router = useRouter()
const compareItems = ref([])

const loadCompareItems = () => {
  const items = JSON.parse(localStorage.getItem('fyndaCompare') || '[]')
  // Limit to 3
  compareItems.value = items.slice(0, 3)
}

const removeItem = (id) => {
  const items = JSON.parse(localStorage.getItem('fyndaCompare') || '[]')
  const filtered = items.filter(item => item.id !== id)
  localStorage.setItem('fyndaCompare', JSON.stringify(filtered))
  compareItems.value = filtered.slice(0, 3)
}

const clearAll = () => {
  localStorage.setItem('fyndaCompare', '[]')
  compareItems.value = []
}

const goHome = () => {
  router.push('/')
}

const formatPrice = (price) => {
  if (!price) return '0.00'
  return parseFloat(price).toFixed(2)
}

const isBestPrice = (item) => {
  if (compareItems.value.length < 2) return false
  const prices = compareItems.value.map(i => parseFloat(i.price) || Infinity)
  const minPrice = Math.min(...prices)
  return parseFloat(item.price) === minPrice
}

// Extract style from title keywords
const extractStyle = (item) => {
  const title = (item.title || '').toLowerCase()
  const styles = ['casual', 'formal', 'sporty', 'vintage', 'streetwear', 'bohemian', 'minimalist', 'classic', 'modern', 'elegant']
  for (const style of styles) {
    if (title.includes(style)) return style.charAt(0).toUpperCase() + style.slice(1)
  }
  // Infer from product type
  if (title.match(/sneaker|trainer|running/)) return 'Sporty'
  if (title.match(/blazer|suit|dress shirt/)) return 'Formal'
  if (title.match(/hoodie|sweatshirt|jogger/)) return 'Casual'
  if (title.match(/dress|gown|blouse/)) return 'Elegant'
  return 'Everyday'
}

// Generate plausible sizes from product type
const getSizes = (item) => {
  const title = (item.title || '').toLowerCase()
  if (title.match(/shoe|sneaker|boot|sandal|heel|loafer|trainer/)) {
    return ['6', '7', '8', '9', '10', '11']
  }
  if (title.match(/ring/)) {
    return ['5', '6', '7', '8', '9']
  }
  return ['XS', 'S', 'M', 'L', 'XL']
}

// Extract colors from title or generate common ones
const getColors = (item) => {
  const title = (item.title || '').toLowerCase()
  const colorMap = {
    'black': '#1a1a1a', 'white': '#f5f5f5', 'red': '#dc2626', 'blue': '#2563eb',
    'navy': '#1e3a5f', 'green': '#16a34a', 'pink': '#ec4899', 'beige': '#d4b896',
    'brown': '#8b5e3c', 'grey': '#9ca3af', 'gray': '#9ca3af', 'gold': '#d4a017',
    'silver': '#c0c0c0', 'cream': '#fffdd0', 'maroon': '#800000', 'olive': '#808000',
    'tan': '#d2b48c', 'coral': '#ff7f50', 'teal': '#008080', 'ivory': '#fffff0',
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

// Extract description, truncated
const getDescription = (item) => {
  if (item.description) {
    return item.description.length > 120 ? item.description.slice(0, 120) + '…' : item.description
  }
  return 'No description available'
}

// Extract material from description or title
const getMaterial = (item) => {
  const text = ((item.description || '') + ' ' + (item.title || '')).toLowerCase()
  const materials = [
    'cotton', 'polyester', 'silk', 'linen', 'wool', 'cashmere', 'viscose',
    'rayon', 'nylon', 'spandex', 'leather', 'suede', 'denim', 'velvet',
    'satin', 'chiffon', 'tweed', 'jersey', 'modal', 'elastane', 'lycra',
    'canvas', 'mesh', 'latex', 'corduroy', 'fleece', 'organza'
  ]
  const found = materials.filter(m => text.includes(m))
  if (found.length > 0) {
    return found.map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(', ')
  }
  return 'Not specified'
}

// Extract fit info from description or title
const getFit = (item) => {
  const text = ((item.description || '') + ' ' + (item.title || '')).toLowerCase()
  const fits = [
    'slim fit', 'regular fit', 'relaxed fit', 'oversized', 'bodycon',
    'loose fit', 'tailored', 'cropped', 'petite', 'plus size',
    'straight', 'wide leg', 'skinny', 'flared', 'a-line', 'midi', 'maxi', 'mini'
  ]
  const found = fits.filter(f => text.includes(f))
  if (found.length > 0) {
    return found.map(f => f.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')).join(', ')
  }
  return 'Standard'
}

onMounted(() => {
  loadCompareItems()
})
</script>

<style scoped>
.compare-page {
  min-height: 100vh;
  background: #fafafa;
}

.compare-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.compare-header {
  margin-bottom: 2rem;
}

.compare-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.75rem;
  font-weight: 400;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
}

.compare-subtitle {
  font-size: 0.85rem;
  color: #888;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-state h2 {
  font-family: 'Inter', sans-serif;
  font-size: 1.15rem;
  font-weight: 500;
  color: #555;
  margin: 1rem 0 0.5rem;
}

.empty-state p {
  font-size: 0.85rem;
  color: #999;
  margin-bottom: 1.5rem;
}

.browse-btn {
  padding: 0.75rem 1.5rem;
  background: #1a1a1a;
  color: #fff;
  text-decoration: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background 0.2s ease;
}

.browse-btn:hover {
  background: #333;
}

/* Compare Table */
.compare-table {
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 16px;
  overflow: hidden;
}

.compare-row {
  display: grid;
  grid-template-columns: 140px repeat(auto-fill, minmax(200px, 1fr));
  border-bottom: 1px solid #f0f0f0;
}

.compare-row:last-child {
  border-bottom: none;
}

.compare-row.highlight {
  background: #fafafa;
}

.row-label {
  padding: 1rem 1.25rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  border-right: 1px solid #f0f0f0;
}

.compare-cell {
  padding: 1rem 1.25rem;
  font-size: 0.88rem;
  color: #333;
  display: flex;
  align-items: center;
  border-right: 1px solid #f0f0f0;
}

.compare-cell:last-child {
  border-right: none;
}

.empty-cell {
  background: #fafafa;
}

/* Images Row */
.images-row .compare-cell {
  padding: 1.5rem 1rem;
  justify-content: center;
  position: relative;
}

.product-cell {
  flex-direction: column;
  gap: 0.5rem;
}

.compare-image {
  width: 200px;
  height: 260px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid #eee;
}

.remove-btn {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid #ddd;
  background: #fff;
  color: #999;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.remove-btn:hover {
  background: #fee2e2;
  border-color: #fca5a5;
  color: #dc2626;
}

/* Add Slot */
.add-slot {
  flex-direction: column;
  gap: 0.5rem;
  justify-content: center;
  cursor: pointer;
  background: #fafafa;
  transition: background 0.2s ease;
  min-height: 220px;
}

.add-slot:hover {
  background: #f0f0f0;
}

.add-slot span {
  font-size: 0.8rem;
  color: #bbb;
}

/* Product Link */
.product-link {
  color: #1a1a1a;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.85rem;
  line-height: 1.4;
  transition: color 0.2s ease;
}

.product-link:hover {
  color: #3b82f6;
}

/* Price */
.price-value {
  font-weight: 700;
  font-size: 1rem;
  color: #1a1a1a;
}

.price-value.best-price {
  color: #16a34a;
}

.best-badge {
  display: inline-block;
  margin-left: 0.5rem;
  padding: 2px 8px;
  background: #ecfdf5;
  color: #16a34a;
  font-size: 0.68rem;
  font-weight: 600;
  border-radius: 4px;
}

.price-cell {
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.original-price {
  font-size: 0.78rem;
  color: #999;
  text-decoration: line-through;
  margin-left: 0.5rem;
}

.savings-badge {
  display: inline-block;
  padding: 2px 8px;
  background: #fef3c7;
  color: #b45309;
  font-size: 0.68rem;
  font-weight: 600;
  border-radius: 4px;
}

.description-cell {
  align-items: flex-start;
}

.desc-text {
  font-size: 0.8rem;
  color: #666;
  line-height: 1.5;
  margin: 0;
}

/* Tags */
.tag {
  padding: 4px 10px;
  background: #f3f4f6;
  border-radius: 6px;
  font-size: 0.8rem;
  color: #555;
}

/* Size Chips */
.size-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.size-chip {
  padding: 3px 8px;
  background: #f3f4f6;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  font-size: 0.72rem;
  font-weight: 500;
  color: #555;
}

/* Color Dots */
.color-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.color-dot {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid #e5e5e5;
  cursor: default;
  transition: transform 0.15s ease;
}

.color-dot:hover {
  transform: scale(1.15);
}

/* Shop Button */
.actions-row .compare-cell {
  padding: 1.25rem;
}

.shop-btn {
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  background: #1a1a1a;
  color: #fff;
  text-decoration: none;
  text-align: center;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  transition: background 0.2s ease;
}

.shop-btn:hover {
  background: #333;
}

/* Clear Section */
.clear-section {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
}

.clear-btn {
  padding: 0.6rem 1.5rem;
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

/* Responsive */
@media (max-width: 768px) {
  .compare-row {
    grid-template-columns: 100px repeat(auto-fill, minmax(150px, 1fr));
  }

  .row-label {
    font-size: 0.7rem;
    padding: 0.75rem;
  }

  .compare-cell {
    padding: 0.75rem;
    font-size: 0.8rem;
  }

  .compare-image {
    width: 100px;
    height: 130px;
  }
}
</style>
