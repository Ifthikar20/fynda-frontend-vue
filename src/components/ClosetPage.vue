<template>
  <div class="closet-page">
    <NavBar />
    <main class="closet-content">
      <!-- Header -->
      <div class="closet-header">
        <div>
          <h1 class="closet-title">My Closet</h1>
          <p class="closet-subtitle">Your personal vault &bull; {{ allItems.length }} item{{ allItems.length !== 1 ? 's' : '' }}</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs-bar">
        <div class="tabs">
          <button v-for="tab in tabs" :key="tab.key" class="tab-btn" :class="{ active: activeTab === tab.key }" @click="activeTab = tab.key">
            {{ tab.label }}
            <span v-if="tab.count > 0" class="tab-count">{{ tab.count }}</span>
          </button>
        </div>
        <div class="tabs-actions" v-if="activeTab === 'all'">
          <select v-model="sortBy" class="sort-select">
            <option value="recent">Recently Added</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>
      </div>

      <!-- Category Chips (no emojis) -->
      <!-- Search Bar (All Items) -->
      <div v-if="activeTab === 'all'" class="closet-search">
        <svg class="closet-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="searchQuery" type="text" placeholder="Search your closet..." class="closet-search-input" />
        <button v-if="searchQuery" class="closet-search-clear" @click="searchQuery = ''">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <!-- Category Chips -->
      <div class="category-chips" v-if="activeTab === 'all'">
        <button class="chip" :class="{ active: activeCategory === 'all' }" @click="activeCategory = 'all'">All</button>
        <button v-for="cat in categories" :key="cat.key" class="chip" :class="{ active: activeCategory === cat.key }" @click="activeCategory = cat.key">
          {{ cat.label }}
          <span class="chip-count">{{ cat.count }}</span>
        </button>
      </div>

      <!-- ==================== ALL ITEMS TAB ==================== -->
      <div v-if="activeTab === 'all'" class="tab-content">
        <div v-if="filteredItems.length === 0" class="empty-section">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.2"><path d="M12 2L3 7v1h18V7L12 2z"/><line x1="12" y1="8" x2="12" y2="16"/><path d="M8 16a4 4 0 0 0 8 0"/></svg>
          <h3>Your closet is empty</h3>
          <p>Save items from product pages, compare, or your fashion board</p>
          <router-link to="/" class="browse-btn">Start Shopping</router-link>
        </div>
        <div v-else class="items-grid">
          <div v-for="(item, idx) in filteredItems" :key="item.id" class="item-card" :style="{ animationDelay: (idx % 12) * 0.04 + 's' }">
            <div class="item-image-wrap">
              <img :src="item.image_url" :alt="item.title" class="item-image" />
            </div>
            <div class="item-info">
              <p class="item-title">{{ item.title }}</p>
              <span class="item-price">${{ formatPrice(item.price) }}</span>
            </div>
            <div class="item-actions">
              <button class="btn-shadcn btn-outline" @click.stop="moveToFashionBoard(item)">
                Fashion Board
              </button>
              <button class="btn-shadcn btn-outline" @click.stop="openDatePicker(item)">
                Plan
              </button>
              <button class="btn-shadcn btn-ghost-danger" @click.stop="removeFromCloset(item.id)" title="Remove">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ==================== CALENDAR TAB ==================== -->
      <div v-if="activeTab === 'calendar'" class="tab-content">
        <div class="cal-header">
          <button class="cal-nav" @click="prevMonth">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <h2 class="cal-month">{{ calMonthLabel }}</h2>
          <button class="cal-nav" @click="nextMonth">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
        <div class="cal-weekdays">
          <span v-for="d in ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']" :key="d">{{ d }}</span>
        </div>
        <!-- Calendar hint -->
        <div v-if="Object.keys(calendarData).length === 0" class="cal-hint">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#bbb" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <span>Click any date to plan your outfit, or use the calendar icon on your items</span>
        </div>
        <div class="cal-grid">
          <div v-for="(cell, i) in calendarCells" :key="i" class="cal-cell" :class="{ empty: !cell.day, today: cell.isToday, 'has-items': cell.items && cell.items.length }" @click="cell.day && openDayModal(cell)">
            <span v-if="cell.day" class="cal-day-num">{{ cell.day }}</span>
            <div v-if="cell.items && cell.items.length" class="cal-thumbs">
              <img v-for="(th, ti) in cell.items.slice(0, 3)" :key="ti" :src="th.image_url" class="cal-thumb" />
              <span v-if="cell.items.length > 3" class="cal-more">+{{ cell.items.length - 3 }}</span>
            </div>
          </div>
        </div>
        <!-- Stats Bar -->
        <div class="cal-stats">
          <div class="stat-item">
            <span class="stat-label">OOTD</span>
            <span class="stat-value">{{ calOotdCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Most Worn</span>
            <span class="stat-value stat-icon">
              <img v-if="calMostWorn" :src="calMostWorn.image_url" class="stat-thumb" />
              <span v-else>—</span>
            </span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Expenses</span>
            <span class="stat-value">${{ calTotalExpenses }}</span>
          </div>
        </div>
      </div>

      <!-- ==================== SECTIONS TAB ==================== -->
      <div v-if="activeTab === 'sections'" class="tab-content">
        <div class="sections-grid">
          <!-- Default "All Clothes" -->
          <div class="section-card" @click="viewSection(null)">
            <div class="section-cover">
              <div class="section-cover-grid">
                <img v-for="(img, ii) in allItems.slice(0, 4)" :key="ii" :src="img.image_url" class="cover-thumb" />
              </div>
            </div>
            <div class="section-meta">
              <span class="section-name">All Clothes</span>
              <span class="section-count">{{ allItems.length }} items</span>
            </div>
          </div>
          <!-- User Sections -->
          <div v-for="sec in sections" :key="sec.id" class="section-card" @click="viewSection(sec)">
            <div class="section-cover">
              <div class="section-cover-grid">
                <img v-for="(img, ii) in getSectionItems(sec).slice(0, 4)" :key="ii" :src="img.image_url" class="cover-thumb" />
                <div v-for="n in Math.max(0, 4 - getSectionItems(sec).length)" :key="'ph-'+n" class="cover-placeholder"></div>
              </div>
            </div>
            <div class="section-meta">
              <span class="section-name">{{ sec.name }}</span>
              <span class="section-count">{{ sec.itemIds.length }} items</span>
            </div>
            <button class="section-menu" @click.stop="toggleSectionMenu(sec.id)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#999"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
            </button>
            <div v-if="sectionMenuId === sec.id" class="section-dropdown">
              <button class="btn-shadcn btn-outline sdrop-btn" @click.stop="renameSection(sec)">Rename</button>
              <button class="btn-shadcn btn-ghost-danger sdrop-btn" @click.stop="deleteSection(sec.id)">Delete</button>
            </div>
          </div>
          <!-- Create Section Card -->
          <div class="section-card create-card" @click="openCreateSection">
            <div class="create-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#bbb" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            </div>
            <span class="create-label">Create Section</span>
          </div>
        </div>

        <!-- Section Detail View -->
        <Teleport to="body">
          <div v-if="viewingSection !== undefined" class="modal-backdrop" @click.self="viewingSection = undefined">
            <div class="section-detail-modal">
              <div class="sdm-header">
                <h2>{{ viewingSection ? viewingSection.name : 'All Clothes' }}</h2>
                <button class="sdm-close" @click="viewingSection = undefined">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div class="sdm-items">
                <div v-for="item in sectionDetailItems" :key="item.id" class="sdm-item">
                  <img :src="item.image_url" :alt="item.title" />
                  <div class="sdm-item-info">
                    <span class="sdm-item-title">{{ item.title }}</span>
                    <span class="sdm-item-price">${{ formatPrice(item.price) }}</span>
                  </div>
                  <button v-if="viewingSection" class="btn-shadcn btn-ghost-danger" style="width:28px;height:28px;padding:0;" @click="removeFromSection(viewingSection.id, item.id)" title="Remove">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </div>
                <div v-if="sectionDetailItems.length === 0" class="sdm-empty">No items in this section</div>
              </div>
              <!-- Add items to section -->
              <div v-if="viewingSection" class="sdm-add-bar">
                <button class="btn-shadcn btn-outline" @click="showAddToSection = !showAddToSection">
                  {{ showAddToSection ? 'Done' : 'Add Items' }}
                </button>
              </div>
              <div v-if="showAddToSection && viewingSection" class="sdm-picker">
                <div v-for="item in allItems" :key="'pick-'+item.id" class="sdm-pick-item" :class="{ picked: viewingSection.itemIds.includes(item.id) }" @click="toggleSectionItem(viewingSection.id, item.id)">
                  <img :src="item.image_url" />
                  <div v-if="viewingSection.itemIds.includes(item.id)" class="pick-check">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Teleport>
      </div>

      <!-- ==================== DATE PICKER MODAL ==================== -->
      <Teleport to="body">
        <div v-if="datePickerItem" class="modal-backdrop" @click.self="datePickerItem = null">
          <div class="date-picker-modal">
            <div class="dpm-header">
              <h3>Schedule: {{ datePickerItem.title }}</h3>
              <button class="sdm-close" @click="datePickerItem = null">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <input type="date" v-model="datePickerDate" class="dpm-input" />
            <button class="dpm-save" :disabled="!datePickerDate" @click="saveToCalendar">Save to Calendar</button>
          </div>
        </div>
      </Teleport>

      <!-- ==================== CREATE SECTION MODAL ==================== -->
      <Teleport to="body">
        <div v-if="showCreateSection" class="modal-backdrop" @click.self="showCreateSection = false">
          <div class="date-picker-modal">
            <div class="dpm-header">
              <h3>Create Section</h3>
              <button class="sdm-close" @click="showCreateSection = false">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <input type="text" v-model="newSectionName" placeholder="e.g. Sports, Date Night, Winter" class="dpm-input" @keyup.enter="createSection" />
            <button class="dpm-save" :disabled="!newSectionName.trim()" @click="createSection">Create</button>
          </div>
        </div>
      </Teleport>

      <!-- ==================== DAY MODAL ==================== -->
      <Teleport to="body">
        <div v-if="dayModalDate" class="modal-backdrop" @click.self="dayModalDate = null">
          <div class="date-picker-modal day-modal">
            <div class="dpm-header">
              <h3>{{ formatDayModalDate }}</h3>
              <button class="sdm-close" @click="dayModalDate = null">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div class="day-items">
              <div v-for="item in dayModalItems" :key="item.itemId" class="day-item">
                <img :src="item.image_url" />
                <span>{{ item.title }}</span>
                <button class="day-remove" @click="removeFromCalendar(dayModalDate, item.itemId)">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div v-if="dayModalItems.length === 0" class="sdm-empty">No outfit planned</div>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- Toast -->
      <Teleport to="body">
        <Transition name="toast">
          <div v-if="toast" class="toast">{{ toast.message }}</div>
        </Transition>
      </Teleport>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from './NavBar.vue'

const router = useRouter()
const activeTab = ref('all')
const activeCategory = ref('all')
const searchQuery = ref('')
const sortBy = ref('recent')
const toast = ref(null)

// Data
const allItems = ref([])
const wishlistIds = ref(new Set())
const calendarData = ref({}) // { "2026-02-14": [{ itemId, image_url, title }] }
const sections = ref([])     // [{ id, name, itemIds: [] }]

// Calendar state
const calYear = ref(new Date().getFullYear())
const calMonth = ref(new Date().getMonth())
const datePickerItem = ref(null)
const datePickerDate = ref('')
const dayModalDate = ref(null)

// Section state
const showCreateSection = ref(false)
const newSectionName = ref('')
const viewingSection = ref(undefined) // undefined = hidden, null = all clothes, object = specific section
const showAddToSection = ref(false)
const sectionMenuId = ref(null)

// Categories (no emojis)
const categories = computed(() => {
  const cats = [
    { key: 'tops', label: 'Tops', match: /top|shirt|blouse|tee|tank|polo|sweater|hoodie|sweatshirt/i },
    { key: 'bottoms', label: 'Bottoms', match: /pant|jean|short|skirt|legging|trouser|jogger/i },
    { key: 'shoes', label: 'Shoes', match: /shoe|sneaker|boot|sandal|heel|loafer|slipper|trainer|flat/i },
    { key: 'bags', label: 'Bags', match: /bag|purse|tote|clutch|backpack|handbag|wallet/i },
    { key: 'outerwear', label: 'Outerwear', match: /jacket|coat|blazer|cardigan|vest|parka|windbreaker/i },
    { key: 'accessories', label: 'Accessories', match: /ring|necklace|bracelet|earring|watch|hat|scarf|belt|sunglasses/i },
    { key: 'dresses', label: 'Dresses', match: /dress|gown|romper|jumpsuit/i },
  ]
  return cats.map(cat => ({ ...cat, count: allItems.value.filter(i => cat.match.test(i.title || '')).length })).filter(cat => cat.count > 0)
})

const tabs = computed(() => [
  { key: 'all', label: 'All Items', count: allItems.value.length },
  { key: 'calendar', label: 'Calendar', count: 0 },
  { key: 'sections', label: 'Sections', count: sections.value.length },
])

// Filtered Items
const filteredItems = computed(() => {
  let items = [...allItems.value]
  if (activeCategory.value !== 'all') {
    const cat = categories.value.find(c => c.key === activeCategory.value)
    if (cat) items = items.filter(i => cat.match.test(i.title || ''))
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    items = items.filter(i => (i.title || '').toLowerCase().includes(q))
  }
  if (sortBy.value === 'price-low') items.sort((a, b) => parseFloat(a.price || 0) - parseFloat(b.price || 0))
  else if (sortBy.value === 'price-high') items.sort((a, b) => parseFloat(b.price || 0) - parseFloat(a.price || 0))
  else if (sortBy.value === 'name') items.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
  return items
})

// Wishlist
const isWishlisted = (id) => wishlistIds.value.has(id)
const toggleWishlist = (id) => {
  const s = new Set(wishlistIds.value)
  s.has(id) ? s.delete(id) : s.add(id)
  wishlistIds.value = s
  localStorage.setItem('fyndaClosetWishlist', JSON.stringify([...s]))
}

// Closet actions
const removeFromCloset = (id) => {
  allItems.value = allItems.value.filter(i => i.id !== id)
  localStorage.setItem('fyndaCloset', JSON.stringify(allItems.value))
  const s = new Set(wishlistIds.value); s.delete(id); wishlistIds.value = s
  localStorage.setItem('fyndaClosetWishlist', JSON.stringify([...s]))
  showToast('Removed from closet')
}

const moveToFashionBoard = (item) => {
  const boardItems = JSON.parse(localStorage.getItem('fyndaBoardIncoming') || '[]')
  if (!boardItems.find(b => b.id === item.id)) {
    boardItems.push({ id: item.id, title: item.title, price: item.price, image_url: item.image_url, product_url: item.product_url || '', brand: item.brand || '', addedAt: new Date().toISOString() })
    localStorage.setItem('fyndaBoardIncoming', JSON.stringify(boardItems))
  }
  showToast('Added to Fashion Board')
  setTimeout(() => router.push('/storyboard'), 600)
}

// Calendar logic
const calMonthLabel = computed(() => {
  const d = new Date(calYear.value, calMonth.value)
  return d.toLocaleString('default', { month: 'long', year: 'numeric' })
})

const prevMonth = () => { if (calMonth.value === 0) { calMonth.value = 11; calYear.value-- } else calMonth.value-- }
const nextMonth = () => { if (calMonth.value === 11) { calMonth.value = 0; calYear.value++ } else calMonth.value++ }

const calendarCells = computed(() => {
  const firstDay = new Date(calYear.value, calMonth.value, 1).getDay()
  const daysInMonth = new Date(calYear.value, calMonth.value + 1, 0).getDate()
  const today = new Date()
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push({ day: null })
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${calYear.value}-${String(calMonth.value + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({
      day: d,
      dateKey: key,
      isToday: today.getFullYear() === calYear.value && today.getMonth() === calMonth.value && today.getDate() === d,
      items: calendarData.value[key] || []
    })
  }
  return cells
})

const openDatePicker = (item) => { datePickerItem.value = item; datePickerDate.value = '' }
const saveToCalendar = () => {
  if (!datePickerDate.value || !datePickerItem.value) return
  const data = { ...calendarData.value }
  if (!data[datePickerDate.value]) data[datePickerDate.value] = []
  if (!data[datePickerDate.value].find(i => i.itemId === datePickerItem.value.id)) {
    data[datePickerDate.value].push({ itemId: datePickerItem.value.id, image_url: datePickerItem.value.image_url, title: datePickerItem.value.title })
  }
  calendarData.value = data
  localStorage.setItem('fyndaClosetCalendar', JSON.stringify(data))
  datePickerItem.value = null
  showToast('Scheduled outfit')
}

const openDayModal = (cell) => { dayModalDate.value = cell.dateKey }
const dayModalItems = computed(() => calendarData.value[dayModalDate.value] || [])
const formatDayModalDate = computed(() => {
  if (!dayModalDate.value) return ''
  const d = new Date(dayModalDate.value + 'T12:00:00')
  return d.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
})
const removeFromCalendar = (dateKey, itemId) => {
  const data = { ...calendarData.value }
  if (data[dateKey]) {
    data[dateKey] = data[dateKey].filter(i => i.itemId !== itemId)
    if (data[dateKey].length === 0) delete data[dateKey]
  }
  calendarData.value = data
  localStorage.setItem('fyndaClosetCalendar', JSON.stringify(data))
}

// Calendar stats
const calOotdCount = computed(() => Object.keys(calendarData.value).filter(k => calendarData.value[k].length > 0).length)
const calMostWorn = computed(() => {
  const freq = {}
  Object.values(calendarData.value).forEach(items => {
    items.forEach(i => { freq[i.itemId] = (freq[i.itemId] || 0) + 1; freq['_data_' + i.itemId] = i })
  })
  let max = 0, best = null
  Object.keys(freq).forEach(k => { if (!k.startsWith('_data_') && freq[k] > max) { max = freq[k]; best = freq['_data_' + k] } })
  return best
})
const calTotalExpenses = computed(() => {
  return allItems.value.reduce((sum, i) => sum + parseFloat(i.price || 0), 0).toFixed(0)
})

// Sections logic
const getSectionItems = (sec) => allItems.value.filter(i => sec.itemIds.includes(i.id))
const sectionDetailItems = computed(() => {
  if (viewingSection.value === null) return allItems.value
  if (viewingSection.value) return getSectionItems(viewingSection.value)
  return []
})

const openCreateSection = () => { showCreateSection.value = true; newSectionName.value = '' }
const createSection = () => {
  if (!newSectionName.value.trim()) return
  sections.value.push({ id: Date.now().toString(), name: newSectionName.value.trim(), itemIds: [], createdAt: new Date().toISOString() })
  localStorage.setItem('fyndaClosetSections', JSON.stringify(sections.value))
  showCreateSection.value = false
  showToast('Section created')
}

const viewSection = (sec) => { viewingSection.value = sec; showAddToSection.value = false }

const toggleSectionItem = (secId, itemId) => {
  const sec = sections.value.find(s => s.id === secId)
  if (!sec) return
  const idx = sec.itemIds.indexOf(itemId)
  if (idx > -1) sec.itemIds.splice(idx, 1)
  else sec.itemIds.push(itemId)
  localStorage.setItem('fyndaClosetSections', JSON.stringify(sections.value))
}

const removeFromSection = (secId, itemId) => {
  const sec = sections.value.find(s => s.id === secId)
  if (!sec) return
  sec.itemIds = sec.itemIds.filter(i => i !== itemId)
  localStorage.setItem('fyndaClosetSections', JSON.stringify(sections.value))
}

const toggleSectionMenu = (id) => { sectionMenuId.value = sectionMenuId.value === id ? null : id }
const renameSection = (sec) => {
  const name = prompt('Rename section:', sec.name)
  if (name && name.trim()) {
    sec.name = name.trim()
    localStorage.setItem('fyndaClosetSections', JSON.stringify(sections.value))
  }
  sectionMenuId.value = null
}
const deleteSection = (id) => {
  sections.value = sections.value.filter(s => s.id !== id)
  localStorage.setItem('fyndaClosetSections', JSON.stringify(sections.value))
  sectionMenuId.value = null
  showToast('Section deleted')
}

// Helpers
const formatPrice = (p) => p ? parseFloat(p).toFixed(2) : '0.00'
const showToast = (message) => { toast.value = { message }; setTimeout(() => { toast.value = null }, 2200) }

// Migration
const migrateLibrary = () => {
  const old = JSON.parse(localStorage.getItem('userLibrary') || '[]')
  if (!old.length) return
  const cur = JSON.parse(localStorage.getItem('fyndaCloset') || '[]')
  const ids = new Set(cur.map(i => i.id))
  let n = 0
  for (const item of old) {
    if (!ids.has(item.id)) { cur.push({ ...item, source: 'product', savedAt: item.savedAt || new Date().toISOString() }); n++ }
  }
  if (n > 0) localStorage.setItem('fyndaCloset', JSON.stringify(cur))
  localStorage.removeItem('userLibrary')
}

// Init
onMounted(() => {
  migrateLibrary()
  allItems.value = JSON.parse(localStorage.getItem('fyndaCloset') || '[]')
  wishlistIds.value = new Set(JSON.parse(localStorage.getItem('fyndaClosetWishlist') || '[]'))
  calendarData.value = JSON.parse(localStorage.getItem('fyndaClosetCalendar') || '{}')
  sections.value = JSON.parse(localStorage.getItem('fyndaClosetSections') || '[]')
  // Ensure Wishlist section exists
  if (!sections.value.find(s => s.name === 'Wishlist')) {
    sections.value.unshift({ id: 'wishlist', name: 'Wishlist', itemIds: [...wishlistIds.value], createdAt: new Date().toISOString() })
    localStorage.setItem('fyndaClosetSections', JSON.stringify(sections.value))
  }
})

// Sync wishlist section
watch(wishlistIds, (ids) => {
  const ws = sections.value.find(s => s.id === 'wishlist')
  if (ws) { ws.itemIds = [...ids]; localStorage.setItem('fyndaClosetSections', JSON.stringify(sections.value)) }
}, { deep: true })
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
* { font-family: 'Inter', sans-serif; }
.closet-page { min-height: 100vh; background: #fafafa; }
.closet-content { max-width: 1400px; margin: 0 auto; padding: 2rem 2rem 6rem; }

/* Header */
.closet-header { display: flex; align-items: center; gap: 14px; margin-bottom: 2rem; }
.closet-title { font-size: 1.8rem; font-weight: 700; color: #111; margin: 0; }
.closet-subtitle { font-size: 0.85rem; color: #888; margin: 2px 0 0; }

/* Tabs */
.tabs-bar { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 1.25rem; padding-bottom: 1rem; border-bottom: 1px solid #eee; }
.tabs { display: flex; gap: 4px; background: #f3f4f6; border-radius: 10px; padding: 3px; }
.tab-btn { padding: 8px 20px; background: none; border: none; border-radius: 8px; font-size: 0.85rem; font-weight: 500; color: #888; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px; }
.tab-btn:hover { color: #555; }
.tab-btn.active { background: #fff; color: #111; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
.tab-count { font-size: 0.7rem; font-weight: 600; background: #e5e7eb; color: #666; padding: 1px 7px; border-radius: 10px; }
.tab-btn.active .tab-count { background: #111; color: #fff; }
.tabs-actions { display: flex; align-items: center; gap: 10px; }
.sort-select { padding: 7px 12px; background: #fff; border: 1px solid #e5e5e5; border-radius: 8px; font-size: 0.82rem; color: #555; cursor: pointer; outline: none; }

/* Search Bar */
.closet-search { display: flex; align-items: center; gap: 10px; padding: 10px 16px; background: #fff; border: 2px solid #e5e5e5; border-radius: 28px; margin-bottom: 1.25rem; transition: border-color 0.2s, box-shadow 0.2s; }
.closet-search:focus-within { border-color: #111; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.closet-search-icon { flex-shrink: 0; color: #bbb; }
.closet-search:focus-within .closet-search-icon { color: #555; }
.closet-search-input { flex: 1; border: none; background: none; outline: none; font-size: 0.9rem; color: #333; font-family: 'Inter', sans-serif; }
.closet-search-input::placeholder { color: #ccc; }
.closet-search-clear { width: 24px; height: 24px; border-radius: 50%; border: none; background: #eee; color: #888; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.15s; }
.closet-search-clear:hover { background: #ddd; color: #555; }

/* Category Chips */
.category-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 1.5rem; }
.chip { padding: 7px 16px; background: #fff; border: 1px solid #e5e5e5; border-radius: 20px; font-size: 0.8rem; font-weight: 500; color: #666; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 5px; }
.chip:hover { border-color: #bbb; color: #333; }
.chip.active { background: #111; border-color: #111; color: #fff; }
.chip.active .chip-count { background: rgba(255,255,255,0.2); color: #fff; }
.chip-count { font-size: 0.68rem; font-weight: 600; background: #f3f4f6; color: #888; padding: 1px 6px; border-radius: 8px; }

/* Empty */
.empty-section { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 4rem 2rem; }
.empty-section h3 { font-size: 1.1rem; font-weight: 500; color: #555; margin: 1.5rem 0 0.5rem; }
.empty-section p { font-size: 0.85rem; color: #999; margin: 0 0 1.5rem; }
.browse-btn { padding: 10px 24px; background: #111; color: #fff; border: none; border-radius: 10px; font-size: 0.88rem; font-weight: 500; text-decoration: none; transition: all 0.2s; }
.browse-btn:hover { background: #333; }

/* Items Grid */
.items-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; }
.item-card { background: #fff; border: 1px solid #eee; border-radius: 14px; overflow: hidden; animation: cardIn 0.35s ease both; transition: all 0.25s; display: flex; flex-direction: column; }
.item-card:hover { border-color: #ddd; box-shadow: 0 6px 24px rgba(0,0,0,0.06); transform: translateY(-2px); }
@keyframes cardIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.item-image-wrap { position: relative; aspect-ratio: 3/4; overflow: hidden; background: #f5f5f5; }
.item-image { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
.item-card:hover .item-image { transform: scale(1.04); }

.item-info { padding: 10px 12px 4px; }
.item-title { font-size: 0.82rem; font-weight: 500; color: #333; margin: 0 0 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.4; }
.item-price { font-size: 0.88rem; font-weight: 700; color: #111; }

/* Shadcn-style Action Buttons */
.item-actions { display: flex; flex-wrap: wrap; gap: 6px; padding: 8px 10px 10px; margin-top: auto; border-top: 1px solid #f0f0f0; }
.btn-shadcn {
  display: inline-flex; align-items: center; justify-content: center;
  height: 30px; padding: 0 12px;
  border-radius: 6px; border: 1px solid transparent;
  font-family: 'Inter', sans-serif; font-size: 0.72rem; font-weight: 500;
  cursor: pointer; transition: all 0.15s ease;
  white-space: nowrap; line-height: 1;
}
.btn-default {
  background: #111; color: #fff; border-color: #111;
}
.btn-default:hover { background: #333; border-color: #333; }
.btn-outline {
  background: #fff; color: #333; border-color: #d4d4d8;
}
.btn-outline:hover { background: #f4f4f5; border-color: #a1a1aa; color: #111; }
.btn-ghost-danger {
  background: transparent; color: #a1a1aa; border-color: transparent;
}
.btn-ghost-danger:hover { background: #fef2f2; color: #dc2626; }
.sdrop-btn { width: 100%; justify-content: flex-start; }

/* ========== CALENDAR ========== */
.cal-header { display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 1.5rem; }
.cal-month { font-size: 1.15rem; font-weight: 600; color: #111; margin: 0; min-width: 180px; text-align: center; }
.cal-nav { width: 36px; height: 36px; border-radius: 50%; border: 1px solid #e5e5e5; background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #555; transition: all 0.15s; }
.cal-nav:hover { background: #f3f4f6; border-color: #bbb; }
.cal-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; margin-bottom: 4px; }
.cal-weekdays span { font-size: 0.72rem; font-weight: 600; color: #999; text-transform: uppercase; padding: 6px 0; }
.cal-hint { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: #f9fafb; border: 1px dashed #ddd; border-radius: 10px; margin-bottom: 1rem; }
.cal-hint span { font-size: 0.82rem; color: #888; }
.cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; }
.cal-cell { min-height: 90px; border: 1px solid #f0f0f0; border-radius: 10px; padding: 6px; cursor: pointer; transition: all 0.15s; background: #fff; position: relative; display: flex; flex-direction: column; }
.cal-cell.empty { background: transparent; border-color: transparent; cursor: default; }
.cal-cell:not(.empty):hover { background: #f5f7ff; border-color: #ccc; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.cal-cell.today { border-color: #111; border-width: 2px; }
.cal-cell.today .cal-day-num { background: #111; color: #fff; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; font-size: 0.78rem; }
.cal-cell.has-items { background: #fafbff; }
.cal-day-num { font-size: 0.75rem; font-weight: 600; color: #555; display: inline-block; margin-bottom: 4px; }
.cal-thumbs { display: flex; gap: 3px; flex-wrap: wrap; margin-top: auto; }
.cal-thumb { width: 32px; height: 32px; border-radius: 6px; object-fit: cover; border: 1px solid #eee; }
.cal-more { font-size: 0.62rem; font-weight: 700; color: #666; background: #f0f0f0; border-radius: 6px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; }
.cal-stats { display: flex; justify-content: center; gap: 2rem; margin-top: 2rem; padding: 1.25rem; background: #fff; border-radius: 14px; border: 1px solid #eee; }
.stat-item { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.stat-label { font-size: 0.72rem; font-weight: 600; color: #999; text-transform: uppercase; letter-spacing: 0.5px; }
.stat-value { font-size: 1.1rem; font-weight: 700; color: #111; }
.stat-thumb { width: 28px; height: 28px; border-radius: 4px; object-fit: cover; }

/* ========== SECTIONS ========== */
.sections-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1.25rem; }
.section-card { background: #fff; border: 1px solid #eee; border-radius: 14px; overflow: hidden; cursor: pointer; transition: all 0.2s; position: relative; }
.section-card:hover { border-color: #ddd; box-shadow: 0 4px 16px rgba(0,0,0,0.06); transform: translateY(-2px); }
.section-cover { aspect-ratio: 1; overflow: hidden; background: #f5f5f5; }
.section-cover-grid { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; width: 100%; height: 100%; }
.cover-thumb { width: 100%; height: 100%; object-fit: cover; }
.cover-placeholder { background: #eee; }
.section-meta { padding: 12px 14px; }
.section-name { display: block; font-size: 0.88rem; font-weight: 600; color: #111; margin-bottom: 2px; }
.section-count { font-size: 0.75rem; color: #888; }
.section-menu { position: absolute; top: 8px; right: 8px; width: 28px; height: 28px; border-radius: 50%; border: none; background: rgba(255,255,255,0.9); cursor: pointer; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; }
.section-card:hover .section-menu { opacity: 1; }
.section-dropdown { position: absolute; top: 40px; right: 8px; background: #fff; border: 1px solid #eee; border-radius: 10px; box-shadow: 0 4px 16px rgba(0,0,0,0.1); z-index: 10; overflow: hidden; }
.section-dropdown button { display: block; width: 100%; padding: 10px 20px; border: none; background: none; text-align: left; font-size: 0.82rem; color: #333; cursor: pointer; }
.section-dropdown button:hover { background: #f5f5f5; }
.section-dropdown .danger { color: #dc2626; }
.section-dropdown .danger:hover { background: #fef2f2; }

.create-card { border-style: dashed; border-color: #ddd; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 200px; }
.create-card:hover { border-color: #bbb; background: #fafafa; }
.create-icon { margin-bottom: 8px; }
.create-label { font-size: 0.85rem; font-weight: 500; color: #999; }

/* ========== MODALS ========== */
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 200; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); }
.date-picker-modal { background: #fff; border-radius: 16px; padding: 24px; width: 380px; max-width: 90vw; }
.day-modal { width: 440px; }
.dpm-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.dpm-header h3 { font-size: 1rem; font-weight: 600; color: #111; margin: 0; }
.dpm-input { width: 100%; padding: 10px 14px; border: 1px solid #e5e5e5; border-radius: 10px; font-size: 0.88rem; margin-bottom: 14px; outline: none; box-sizing: border-box; }
.dpm-input:focus { border-color: #111; }
.dpm-save { width: 100%; padding: 10px; background: #111; color: #fff; border: none; border-radius: 10px; font-size: 0.88rem; font-weight: 500; cursor: pointer; transition: background 0.2s; }
.dpm-save:hover { background: #333; }
.dpm-save:disabled { background: #ddd; cursor: not-allowed; }

.sdm-close { width: 32px; height: 32px; border-radius: 50%; border: 1px solid #eee; background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.section-detail-modal { background: #fff; border-radius: 16px; padding: 24px; width: 560px; max-width: 90vw; max-height: 80vh; overflow-y: auto; }
.sdm-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.sdm-header h2 { font-size: 1.1rem; font-weight: 600; color: #111; margin: 0; }
.sdm-items { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
.sdm-item { display: flex; align-items: center; gap: 12px; padding: 8px; border-radius: 10px; transition: background 0.15s; }
.sdm-item:hover { background: #f8f8f8; }
.sdm-item img { width: 48px; height: 48px; border-radius: 8px; object-fit: cover; }
.sdm-item-info { flex: 1; }
.sdm-item-title { display: block; font-size: 0.82rem; font-weight: 500; color: #333; }
.sdm-item-price { font-size: 0.78rem; color: #888; }
.sdm-remove { width: 28px; height: 28px; border-radius: 50%; border: 1px solid #eee; background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.sdm-remove:hover { background: #fef2f2; border-color: #fca5a5; }
.sdm-empty { text-align: center; padding: 2rem; color: #999; font-size: 0.85rem; }
.sdm-add-bar { margin-bottom: 12px; }
.sdm-add-btn { padding: 8px 20px; background: #f3f4f6; border: 1px solid #e5e5e5; border-radius: 8px; font-size: 0.82rem; font-weight: 500; color: #555; cursor: pointer; }
.sdm-add-btn:hover { background: #eee; }
.sdm-picker { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; max-height: 200px; overflow-y: auto; }
.sdm-pick-item { position: relative; aspect-ratio: 1; border-radius: 8px; overflow: hidden; cursor: pointer; border: 2px solid transparent; transition: border-color 0.15s; }
.sdm-pick-item:hover { border-color: #bbb; }
.sdm-pick-item.picked { border-color: #111; }
.sdm-pick-item img { width: 100%; height: 100%; object-fit: cover; }
.pick-check { position: absolute; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; }

/* Day modal items */
.day-items { display: flex; flex-direction: column; gap: 8px; }
.day-item { display: flex; align-items: center; gap: 10px; padding: 6px; border-radius: 8px; }
.day-item:hover { background: #f8f8f8; }
.day-item img { width: 44px; height: 44px; border-radius: 6px; object-fit: cover; }
.day-item span { flex: 1; font-size: 0.82rem; color: #333; }
.day-remove { width: 24px; height: 24px; border-radius: 50%; border: 1px solid #eee; background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; }

/* Toast */
.toast { position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%); padding: 12px 28px; background: #111; color: #fff; border-radius: 12px; font-size: 0.85rem; font-weight: 500; box-shadow: 0 8px 32px rgba(0,0,0,0.2); z-index: 300; }
.toast-enter-active { animation: toastIn 0.3s ease; }
.toast-leave-active { animation: toastOut 0.2s ease; }
@keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(20px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
@keyframes toastOut { from { opacity: 1; transform: translateX(-50%) translateY(0); } to { opacity: 0; transform: translateX(-50%) translateY(20px); } }

/* Responsive */
@media (max-width: 1024px) { .items-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 768px) {
  .closet-content { padding: 1rem 1rem 4rem; }
  .items-grid { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
  .tabs-bar { flex-direction: column; align-items: stretch; }
  .closet-title { font-size: 1.5rem; }
  .cal-cell { min-height: 60px; }
  .sections-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 480px) {
  .items-grid { grid-template-columns: repeat(2, 1fr); gap: 0.5rem; }
  .sections-grid { grid-template-columns: 1fr 1fr; gap: 0.75rem; }
  .sdm-picker { grid-template-columns: repeat(4, 1fr); }
}
</style>
