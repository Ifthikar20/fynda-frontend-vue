<template>
  <div class="closet-page">
    <NavBar />

    <main class="closet-content">
      <!-- Header -->
      <div class="closet-header">
        <div class="header-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L3 7v1h18V7L12 2z"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <path d="M8 16a4 4 0 0 0 8 0"/>
          </svg>
        </div>
        <div>
          <h1 class="closet-title">My Closet</h1>
          <p class="closet-subtitle">Your personal vault • {{ allItems.length }} item{{ allItems.length !== 1 ? 's' : '' }}</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs-bar">
        <div class="tabs">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="tab-btn"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
            <span v-if="tab.count > 0" class="tab-count">{{ tab.count }}</span>
          </button>
        </div>
        <div class="tabs-actions">
          <div class="search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#bbb" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input v-model="searchQuery" type="text" placeholder="Filter items..." class="search-input" />
          </div>
          <select v-model="sortBy" class="sort-select">
            <option value="recent">Recently Added</option>
            <option value="price-low">Price: Low → High</option>
            <option value="price-high">Price: High → Low</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>
      </div>

      <!-- Category Filter Chips -->
      <div class="category-chips" v-if="activeTab === 'all'">
        <button
          class="chip"
          :class="{ active: activeCategory === 'all' }"
          @click="activeCategory = 'all'"
        >
          All
        </button>
        <button
          v-for="cat in categories"
          :key="cat.key"
          class="chip"
          :class="{ active: activeCategory === cat.key }"
          @click="activeCategory = cat.key"
        >
          <span class="chip-emoji">{{ cat.emoji }}</span>
          {{ cat.label }}
          <span class="chip-count">{{ cat.count }}</span>
        </button>
      </div>

      <!-- ALL ITEMS TAB -->
      <div v-if="activeTab === 'all'" class="tab-content">
        <div v-if="filteredItems.length === 0" class="empty-section">
          <div class="empty-hanger">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ddd" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2L3 7v1h18V7L12 2z"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <path d="M8 16a4 4 0 0 0 8 0"/>
            </svg>
          </div>
          <h3>Your closet is empty</h3>
          <p>Save items from product pages, compare, or your fashion board</p>
          <router-link to="/" class="browse-btn">Start Shopping</router-link>
        </div>

        <div v-else class="items-grid">
          <div
            v-for="(item, idx) in filteredItems"
            :key="item.id"
            class="item-card"
            :style="{ animationDelay: (idx % 12) * 0.05 + 's' }"
          >
            <div class="item-image-wrap">
              <img :src="item.image_url" :alt="item.title" class="item-image" />
              <div class="item-overlay">
                <button class="overlay-btn" :class="{ active: isWishlisted(item.id) }" @click.stop="toggleWishlist(item.id)" title="Wishlist">
                  <svg width="16" height="16" viewBox="0 0 24 24" :fill="isWishlisted(item.id) ? '#dc2626' : 'none'" :stroke="isWishlisted(item.id) ? '#dc2626' : 'currentColor'" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </button>
                <button class="overlay-btn board-btn" @click.stop="moveToFashionBoard(item)" title="Move to Fashion Board">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                  </svg>
                </button>
                <button class="overlay-btn remove" @click.stop="removeFromCloset(item.id)" title="Remove">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <span v-if="item.source" class="item-source-tag">{{ getSourceLabel(item.source) }}</span>
            </div>
            <div class="item-info">
              <p class="item-title">{{ item.title }}</p>
              <span class="item-price">${{ formatPrice(item.price) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- WISHLIST TAB -->
      <div v-if="activeTab === 'wishlist'" class="tab-content">
        <div v-if="wishlistItems.length === 0" class="empty-section">
          <h3>No wishlist items</h3>
          <p>Heart items in your closet to add them to your wishlist</p>
        </div>

        <div v-else class="items-grid">
          <div
            v-for="(item, idx) in wishlistItems"
            :key="item.id"
            class="item-card"
            :style="{ animationDelay: (idx % 12) * 0.05 + 's' }"
          >
            <div class="item-image-wrap">
              <img :src="item.image_url" :alt="item.title" class="item-image" />
              <div class="item-overlay">
                <button class="overlay-btn active" @click.stop="toggleWishlist(item.id)" title="Remove from Wishlist">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#dc2626" stroke="#dc2626" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </button>
                <button class="overlay-btn board-btn" @click.stop="moveToFashionBoard(item)" title="Move to Fashion Board">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                  </svg>
                </button>
              </div>
            </div>
            <div class="item-info">
              <p class="item-title">{{ item.title }}</p>
              <span class="item-price">${{ formatPrice(item.price) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Toast notification -->
      <Teleport to="body">
        <Transition name="toast">
          <div v-if="toast" class="toast" :class="toast.type">
            {{ toast.message }}
          </div>
        </Transition>
      </Teleport>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from './NavBar.vue'

const router = useRouter()
const activeTab = ref('all')
const activeCategory = ref('all')
const searchQuery = ref('')
const sortBy = ref('recent')
const toast = ref(null)

// Data from localStorage
const allItems = ref([])
const wishlistIds = ref(new Set())

const categories = computed(() => {
  const cats = [
    { key: 'tops', label: 'Tops', emoji: '👕', match: /top|shirt|blouse|tee|tank|polo|sweater|hoodie|sweatshirt/i },
    { key: 'bottoms', label: 'Bottoms', emoji: '👖', match: /pant|jean|short|skirt|legging|trouser|jogger/i },
    { key: 'shoes', label: 'Shoes', emoji: '👟', match: /shoe|sneaker|boot|sandal|heel|loafer|slipper|trainer|flat/i },
    { key: 'bags', label: 'Bags', emoji: '👜', match: /bag|purse|tote|clutch|backpack|handbag|wallet/i },
    { key: 'outerwear', label: 'Outerwear', emoji: '🧥', match: /jacket|coat|blazer|cardigan|vest|parka|windbreaker/i },
    { key: 'accessories', label: 'Accessories', emoji: '💍', match: /ring|necklace|bracelet|earring|watch|hat|scarf|belt|sunglasses/i },
    { key: 'dresses', label: 'Dresses', emoji: '👗', match: /dress|gown|romper|jumpsuit/i },
  ]

  return cats.map(cat => ({
    ...cat,
    count: allItems.value.filter(i => cat.match.test(i.title || '')).length
  })).filter(cat => cat.count > 0)
})

const tabs = computed(() => [
  { key: 'all', label: 'All Items', count: allItems.value.length },
  { key: 'wishlist', label: 'Wishlist', count: wishlistIds.value.size },
])

// Filtering & sorting
const filteredItems = computed(() => {
  let items = [...allItems.value]

  // Category filter
  if (activeCategory.value !== 'all') {
    const cat = categories.value.find(c => c.key === activeCategory.value)
    if (cat) items = items.filter(i => cat.match.test(i.title || ''))
  }

  // Search filter
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    items = items.filter(i => (i.title || '').toLowerCase().includes(q))
  }

  // Sorting
  if (sortBy.value === 'price-low') items.sort((a, b) => parseFloat(a.price || 0) - parseFloat(b.price || 0))
  else if (sortBy.value === 'price-high') items.sort((a, b) => parseFloat(b.price || 0) - parseFloat(a.price || 0))
  else if (sortBy.value === 'name') items.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
  // 'recent' is default order (newest first)

  return items
})

const wishlistItems = computed(() => {
  return allItems.value.filter(i => wishlistIds.value.has(i.id))
})

// Actions
const isWishlisted = (id) => wishlistIds.value.has(id)

const toggleWishlist = (id) => {
  const newSet = new Set(wishlistIds.value)
  if (newSet.has(id)) newSet.delete(id)
  else newSet.add(id)
  wishlistIds.value = newSet
  localStorage.setItem('fyndaClosetWishlist', JSON.stringify([...newSet]))
}

const removeFromCloset = (id) => {
  const items = allItems.value.filter(i => i.id !== id)
  allItems.value = items
  localStorage.setItem('fyndaCloset', JSON.stringify(items))

  // Also remove from wishlist
  const newSet = new Set(wishlistIds.value)
  newSet.delete(id)
  wishlistIds.value = newSet
  localStorage.setItem('fyndaClosetWishlist', JSON.stringify([...newSet]))

  showToast('Removed from closet')
}

const moveToFashionBoard = (item) => {
  // Store the item in a temp key that StoryboardPage reads
  const boardItems = JSON.parse(localStorage.getItem('fyndaBoardIncoming') || '[]')
  // Avoid duplicates
  if (!boardItems.find(b => b.id === item.id)) {
    boardItems.push({
      id: item.id,
      title: item.title,
      price: item.price,
      image_url: item.image_url,
      product_url: item.product_url || '',
      brand: item.brand || '',
      addedAt: new Date().toISOString(),
    })
    localStorage.setItem('fyndaBoardIncoming', JSON.stringify(boardItems))
  }
  showToast('Added to Fashion Board ✨')
  setTimeout(() => router.push('/storyboard'), 800)
}

// Helpers
const formatPrice = (price) => {
  if (!price) return '0.00'
  return parseFloat(price).toFixed(2)
}

const getSourceLabel = (source) => {
  const map = { product: '🛍️', compare: '⚖️', storyboard: '🎨' }
  return map[source] || '🏷️'
}

const showToast = (message, type = 'success') => {
  toast.value = { message, type }
  setTimeout(() => { toast.value = null }, 2500)
}

// Migrate old userLibrary data → fyndaCloset (one-time)
const migrateLibrary = () => {
  const oldLibrary = JSON.parse(localStorage.getItem('userLibrary') || '[]')
  if (oldLibrary.length === 0) return

  const current = JSON.parse(localStorage.getItem('fyndaCloset') || '[]')
  const existingIds = new Set(current.map(i => i.id))
  let added = 0

  for (const item of oldLibrary) {
    if (!existingIds.has(item.id)) {
      current.push({
        id: item.id,
        title: item.title,
        price: item.price,
        image_url: item.image_url,
        product_url: item.product_url || '',
        brand: item.brand || '',
        source: 'product',
        savedAt: item.savedAt || new Date().toISOString(),
      })
      added++
    }
  }

  if (added > 0) {
    localStorage.setItem('fyndaCloset', JSON.stringify(current))
  }

  // Clear old key after migration
  localStorage.removeItem('userLibrary')
}

// Load from localStorage
onMounted(() => {
  migrateLibrary()
  allItems.value = JSON.parse(localStorage.getItem('fyndaCloset') || '[]')
  wishlistIds.value = new Set(JSON.parse(localStorage.getItem('fyndaClosetWishlist') || '[]'))
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;500&display=swap');

.closet-page {
  min-height: 100vh;
  background: #fafafa;
}

.closet-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 2rem 6rem;
  position: relative;
}

/* ======================== */
/* Header                   */
/* ======================== */
.closet-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 2rem;
}

.header-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.closet-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 2rem;
  font-weight: 400;
  color: #1a1a1a;
  margin: 0;
}

.closet-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 0.88rem;
  color: #888;
  margin: 2px 0 0;
}

/* ======================== */
/* Tabs                     */
/* ======================== */
.tabs-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.tabs {
  display: flex;
  gap: 4px;
  background: #f3f4f6;
  border-radius: 10px;
  padding: 3px;
}

.tab-btn {
  padding: 8px 20px;
  background: none;
  border: none;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  color: #888;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.tab-btn:hover { color: #555; }

.tab-btn.active {
  background: #fff;
  color: #1a1a1a;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.tab-count {
  font-size: 0.72rem;
  font-weight: 600;
  background: #e5e7eb;
  color: #666;
  padding: 1px 7px;
  border-radius: 10px;
}

.tab-btn.active .tab-count {
  background: #1a1a1a;
  color: #fff;
}

.tabs-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  transition: border-color 0.2s ease;
}

.search-box:focus-within { border-color: #aaa; }

.search-input {
  border: none;
  background: none;
  outline: none;
  font-family: 'Inter', sans-serif;
  font-size: 0.82rem;
  color: #333;
  width: 140px;
}

.search-input::placeholder { color: #ccc; }

.sort-select {
  padding: 7px 12px;
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 0.82rem;
  color: #555;
  cursor: pointer;
  outline: none;
}

/* ======================== */
/* Category Chips           */
/* ======================== */
.category-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 1.5rem;
}

.chip {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 14px;
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 20px;
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chip:hover { border-color: #bbb; color: #333; }

.chip.active {
  background: #1a1a1a;
  border-color: #1a1a1a;
  color: #fff;
}

.chip.active .chip-count {
  background: rgba(255,255,255,0.2);
  color: #fff;
}

.chip-emoji { font-size: 0.9rem; }

.chip-count {
  font-size: 0.68rem;
  font-weight: 600;
  background: #f3f4f6;
  color: #888;
  padding: 1px 6px;
  border-radius: 8px;
}

/* ======================== */
/* Empty State              */
/* ======================== */
.empty-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 4rem 2rem;
}

.empty-hanger {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.empty-section h3 {
  font-family: 'Inter', sans-serif;
  font-size: 1.1rem;
  font-weight: 500;
  color: #555;
  margin: 0 0 0.5rem;
}

.empty-section p {
  font-size: 0.85rem;
  color: #999;
  margin: 0 0 1.5rem;
}

.browse-btn {
  padding: 10px 24px;
  background: #1a1a1a;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-family: 'Inter', sans-serif;
  font-size: 0.88rem;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s ease;
}

.browse-btn:hover {
  background: #333;
  transform: translateY(-1px);
}

/* ======================== */
/* Items Grid               */
/* ======================== */
.items-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
}

.item-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 14px;
  overflow: hidden;
  animation: cardIn 0.4s ease both;
  transition: all 0.25s ease;
}

.item-card:hover {
  border-color: #ddd;
  box-shadow: 0 6px 24px rgba(0,0,0,0.06);
  transform: translateY(-2px);
}

@keyframes cardIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.item-image-wrap {
  position: relative;
  aspect-ratio: 3/4;
  overflow: hidden;
  background: #f5f5f5;
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.item-card:hover .item-image {
  transform: scale(1.04);
}

.item-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.05);
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  gap: 6px;
  padding: 10px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.item-card:hover .item-overlay {
  opacity: 1;
}

.overlay-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.95);
  color: #555;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  backdrop-filter: blur(4px);
}

.overlay-btn:hover {
  background: #fff;
  transform: scale(1.1);
}

.overlay-btn.active {
  background: #fff0f0;
}

.overlay-btn.board-btn:hover {
  background: #f0f4ff;
  color: #3b82f6;
}

.overlay-btn.remove:hover {
  background: #fee2e2;
  color: #dc2626;
}

.item-source-tag {
  position: absolute;
  bottom: 8px;
  left: 8px;
  font-size: 1rem;
  background: rgba(255,255,255,0.9);
  border-radius: 6px;
  padding: 2px 6px;
  backdrop-filter: blur(4px);
}

.item-info {
  padding: 12px 14px;
}

.item-title {
  font-family: 'Inter', sans-serif;
  font-size: 0.82rem;
  font-weight: 500;
  color: #333;
  margin: 0 0 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.item-price {
  font-family: 'Inter', sans-serif;
  font-size: 0.88rem;
  font-weight: 700;
  color: #1a1a1a;
}

/* ======================== */
/* Toast                    */
/* ======================== */
.toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 28px;
  background: #1a1a1a;
  color: #fff;
  border-radius: 12px;
  font-family: 'Inter', sans-serif;
  font-size: 0.88rem;
  font-weight: 500;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
  z-index: 300;
}

.toast.success { background: #1a1a1a; }

.toast-enter-active { animation: toastIn 0.3s ease; }
.toast-leave-active { animation: toastOut 0.2s ease; }

@keyframes toastIn {
  from { opacity: 0; transform: translateX(-50%) translateY(20px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}
@keyframes toastOut {
  from { opacity: 1; transform: translateX(-50%) translateY(0); }
  to { opacity: 0; transform: translateX(-50%) translateY(20px); }
}

/* ======================== */
/* Responsive               */
/* ======================== */
@media (max-width: 1024px) {
  .items-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 768px) {
  .closet-content { padding: 1rem 1rem 4rem; }
  .items-grid { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
  .tabs-bar { flex-direction: column; align-items: stretch; }
  .tabs-actions { justify-content: space-between; }
  .closet-title { font-size: 1.5rem; }
}

@media (max-width: 480px) {
  .items-grid { grid-template-columns: repeat(2, 1fr); gap: 0.5rem; }
  .item-info { padding: 8px 10px; }
  .item-title { font-size: 0.75rem; }
}
</style>
