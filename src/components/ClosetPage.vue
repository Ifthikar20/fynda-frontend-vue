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
          <p class="closet-subtitle">Your personal wardrobe • {{ allItems.length }} item{{ allItems.length !== 1 ? 's' : '' }}</p>
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
          <p>Start shopping and save items to build your wardrobe</p>
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
                <button class="overlay-btn" @click.stop="addToOutfit(item)" title="Add to Outfit">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
                  </svg>
                </button>
                <button class="overlay-btn remove" @click.stop="removeFromCloset(item.id)" title="Remove">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <span v-if="item.category" class="item-cat-tag">{{ getCategoryEmoji(item.category) }}</span>
            </div>
            <div class="item-info">
              <p class="item-title">{{ item.title }}</p>
              <span class="item-price">${{ formatPrice(item.price) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- OUTFITS TAB -->
      <div v-if="activeTab === 'outfits'" class="tab-content">
        <div v-if="outfits.length === 0" class="empty-section">
          <h3>No outfits yet</h3>
          <p>Create your first outfit by combining items from your closet</p>
          <button class="browse-btn" @click="openOutfitBuilder">Create First Outfit</button>
        </div>

        <div v-else class="outfits-grid">
          <div v-for="outfit in outfits" :key="outfit.id" class="outfit-card">
            <button class="outfit-remove" @click="removeOutfit(outfit.id)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <div class="outfit-preview">
              <div v-for="slot in ['top', 'bottom', 'shoes', 'accessory']" :key="slot" class="outfit-slot-preview">
                <img v-if="outfit.items[slot]" :src="outfit.items[slot].image_url" :alt="slot" />
                <span v-else class="slot-empty">{{ getSlotEmoji(slot) }}</span>
              </div>
            </div>
            <div class="outfit-info">
              <p class="outfit-name">{{ outfit.name }}</p>
              <p class="outfit-date">{{ formatDate(outfit.created) }}</p>
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
              </div>
            </div>
            <div class="item-info">
              <p class="item-title">{{ item.title }}</p>
              <span class="item-price">${{ formatPrice(item.price) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- FAB: Create Outfit -->
      <button class="fab" @click="openOutfitBuilder" title="Create Outfit">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>

      <!-- Outfit Builder Modal -->
      <Teleport to="body">
        <div v-if="showBuilder" class="modal-backdrop" @click.self="showBuilder = false">
          <div class="builder-modal">
            <div class="builder-header">
              <h2>Create Outfit</h2>
              <button class="builder-close" @click="showBuilder = false">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <input v-model="newOutfitName" type="text" placeholder="Outfit name (e.g. Date Night)" class="builder-name-input" />

            <div class="builder-slots">
              <div
                v-for="slot in outfitSlots"
                :key="slot.key"
                class="builder-slot"
                :class="{ filled: builderItems[slot.key] }"
                @click="selectSlot(slot.key)"
              >
                <div v-if="builderItems[slot.key]" class="slot-filled">
                  <img :src="builderItems[slot.key].image_url" :alt="slot.label" class="slot-image" />
                  <button class="slot-remove" @click.stop="builderItems[slot.key] = null">×</button>
                </div>
                <div v-else class="slot-placeholder">
                  <span class="slot-emoji">{{ slot.emoji }}</span>
                  <span class="slot-label">{{ slot.label }}</span>
                </div>
              </div>
            </div>

            <!-- Item picker within builder -->
            <div v-if="activeSlot" class="builder-picker">
              <p class="picker-label">Select a {{ activeSlot }} from your closet:</p>
              <div class="picker-grid">
                <div
                  v-for="item in allItems"
                  :key="item.id"
                  class="picker-item"
                  @click="assignToSlot(item)"
                >
                  <img :src="item.image_url" :alt="item.title" />
                </div>
              </div>
            </div>

            <button class="builder-save" :disabled="!canSaveOutfit" @click="saveOutfit">
              Save Outfit
            </button>
          </div>
        </div>
      </Teleport>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import NavBar from './NavBar.vue'

const activeTab = ref('all')
const activeCategory = ref('all')
const searchQuery = ref('')
const sortBy = ref('recent')
const showBuilder = ref(false)
const activeSlot = ref(null)
const newOutfitName = ref('')

// Data from localStorage
const allItems = ref([])
const wishlistIds = ref(new Set())
const outfits = ref([])

const builderItems = reactive({
  top: null,
  bottom: null,
  shoes: null,
  accessory: null,
})

const outfitSlots = [
  { key: 'top', label: 'Top', emoji: '👕' },
  { key: 'bottom', label: 'Bottom', emoji: '👖' },
  { key: 'shoes', label: 'Shoes', emoji: '👟' },
  { key: 'accessory', label: 'Accessory', emoji: '💍' },
]

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
  { key: 'outfits', label: 'Outfits', count: outfits.value.length },
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
  // 'recent' is default order

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
}

const addToOutfit = (item) => {
  showBuilder.value = true
  // Auto-assign to first empty slot
  for (const slot of outfitSlots) {
    if (!builderItems[slot.key]) {
      builderItems[slot.key] = item
      break
    }
  }
}

// Outfit builder
const openOutfitBuilder = () => {
  showBuilder.value = true
  activeSlot.value = null
  newOutfitName.value = ''
  builderItems.top = null
  builderItems.bottom = null
  builderItems.shoes = null
  builderItems.accessory = null
}

const selectSlot = (key) => {
  activeSlot.value = activeSlot.value === key ? null : key
}

const assignToSlot = (item) => {
  if (activeSlot.value) {
    builderItems[activeSlot.value] = item
    activeSlot.value = null
  }
}

const canSaveOutfit = computed(() => {
  return newOutfitName.value.trim() && Object.values(builderItems).some(v => v !== null)
})

const saveOutfit = () => {
  if (!canSaveOutfit.value) return
  const outfit = {
    id: Date.now().toString(),
    name: newOutfitName.value.trim(),
    created: new Date().toISOString(),
    items: { ...builderItems },
  }
  outfits.value.push(outfit)
  localStorage.setItem('fyndaClosetOutfits', JSON.stringify(outfits.value))
  showBuilder.value = false
}

const removeOutfit = (id) => {
  outfits.value = outfits.value.filter(o => o.id !== id)
  localStorage.setItem('fyndaClosetOutfits', JSON.stringify(outfits.value))
}

// Helpers
const formatPrice = (price) => {
  if (!price) return '0.00'
  return parseFloat(price).toFixed(2)
}

const formatDate = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const getCategoryEmoji = (cat) => {
  const map = { tops: '👕', bottoms: '👖', shoes: '👟', bags: '👜', outerwear: '🧥', accessories: '💍', dresses: '👗' }
  return map[cat] || '🏷️'
}

const getSlotEmoji = (slot) => {
  const map = { top: '👕', bottom: '👖', shoes: '👟', accessory: '💍' }
  return map[slot] || '+'
}

// Load from localStorage
onMounted(() => {
  allItems.value = JSON.parse(localStorage.getItem('fyndaCloset') || '[]')
  wishlistIds.value = new Set(JSON.parse(localStorage.getItem('fyndaClosetWishlist') || '[]'))
  outfits.value = JSON.parse(localStorage.getItem('fyndaClosetOutfits') || '[]')
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

.tab-btn:hover {
  color: #555;
}

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

.search-box:focus-within {
  border-color: #aaa;
}

.search-input {
  border: none;
  background: none;
  outline: none;
  font-family: 'Inter', sans-serif;
  font-size: 0.82rem;
  color: #333;
  width: 140px;
}

.search-input::placeholder {
  color: #ccc;
}

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

.chip:hover {
  border-color: #bbb;
  color: #333;
}

.chip.active {
  background: #1a1a1a;
  border-color: #1a1a1a;
  color: #fff;
}

.chip.active .chip-count {
  background: rgba(255,255,255,0.2);
  color: #fff;
}

.chip-emoji {
  font-size: 0.9rem;
}

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

.overlay-btn.remove:hover {
  background: #fee2e2;
  color: #dc2626;
}

.item-cat-tag {
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
/* Outfits Grid             */
/* ======================== */
.outfits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}

.outfit-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 14px;
  padding: 1.25rem;
  position: relative;
  transition: all 0.25s ease;
}

.outfit-card:hover {
  border-color: #ddd;
  box-shadow: 0 6px 24px rgba(0,0,0,0.06);
}

.outfit-remove {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid #eee;
  background: #fff;
  color: #bbb;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.outfit-remove:hover {
  background: #fee2e2;
  border-color: #fca5a5;
  color: #dc2626;
}

.outfit-preview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.outfit-slot-preview {
  aspect-ratio: 3/4;
  border-radius: 8px;
  background: #f5f5f5;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.outfit-slot-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.slot-empty {
  font-size: 1.2rem;
  opacity: 0.4;
}

.outfit-info {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.outfit-name {
  font-family: 'Inter', sans-serif;
  font-size: 0.88rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.outfit-date {
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  color: #999;
  margin: 0;
}

/* ======================== */
/* FAB                      */
/* ======================== */
.fab {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 56px;
  height: 56px;
  border-radius: 16px;
  border: none;
  background: #1a1a1a;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  transition: all 0.2s ease;
  z-index: 50;
}

.fab:hover {
  background: #333;
  transform: translateY(-2px);
  box-shadow: 0 6px 28px rgba(0,0,0,0.25);
}

/* ======================== */
/* Outfit Builder Modal     */
/* ======================== */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(4px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.builder-modal {
  background: #fff;
  border-radius: 20px;
  padding: 2rem;
  width: 100%;
  max-width: 600px;
  max-height: 85vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.builder-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.builder-header h2 {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.4rem;
  font-weight: 400;
  color: #1a1a1a;
  margin: 0;
}

.builder-close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid #eee;
  background: #fff;
  color: #888;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.builder-close:hover {
  background: #f5f5f5;
  color: #333;
}

.builder-name-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #e5e5e5;
  border-radius: 10px;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  color: #333;
  outline: none;
  margin-bottom: 1.25rem;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.builder-name-input:focus {
  border-color: #aaa;
}

.builder-slots {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 1.25rem;
}

.builder-slot {
  aspect-ratio: 3/4;
  border: 2px dashed #e0e0e0;
  border-radius: 12px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.2s ease;
}

.builder-slot:hover {
  border-color: #bbb;
}

.builder-slot.filled {
  border-style: solid;
  border-color: #e0e0e0;
}

.slot-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.slot-emoji {
  font-size: 1.3rem;
}

.slot-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.72rem;
  color: #bbb;
}

.slot-filled {
  position: relative;
  width: 100%;
  height: 100%;
}

.slot-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.slot-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background: rgba(0,0,0,0.5);
  color: #fff;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.builder-picker {
  margin-bottom: 1.25rem;
}

.picker-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.82rem;
  color: #888;
  margin: 0 0 8px;
}

.picker-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.picker-item {
  aspect-ratio: 3/4;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.15s ease;
}

.picker-item:hover {
  border-color: #1a1a1a;
}

.picker-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.builder-save {
  width: 100%;
  padding: 12px;
  background: #1a1a1a;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.builder-save:hover {
  background: #333;
}

.builder-save:disabled {
  background: #e5e5e5;
  color: #999;
  cursor: not-allowed;
}

/* ======================== */
/* Responsive               */
/* ======================== */
@media (max-width: 1024px) {
  .items-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .closet-content {
    padding: 1.5rem 1rem 5rem;
  }

  .items-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .tabs-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .tabs-actions {
    width: 100%;
  }

  .search-input {
    width: 100px;
  }

  .builder-slots {
    grid-template-columns: repeat(2, 1fr);
  }

  .picker-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 480px) {
  .closet-title {
    font-size: 1.5rem;
  }

  .category-chips {
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 4px;
  }

  .chip {
    white-space: nowrap;
  }
}
</style>
