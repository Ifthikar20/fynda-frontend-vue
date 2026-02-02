<template>
  <div class="outfit-studio-page">
    <!-- Header -->
    <header class="header">
      <button class="back-btn" @click="goBack">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back
      </button>
      <h1 class="page-title">Outfit Studio</h1>
      <div class="header-actions">
        <button class="new-btn" @click="createNewProject">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          New
        </button>
        <button class="save-btn" @click="saveProject">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
          </svg>
          Save
        </button>
      </div>
    </header>

    <main class="main-content">
      <!-- Left: Projects Sidebar -->
      <aside class="projects-sidebar">
        <div class="sidebar-header">
          <h3>My Projects</h3>
          <span class="project-count">{{ savedProjects.length }}</span>
        </div>
        
        <div class="projects-list">
          <div 
            v-for="project in savedProjects"
            :key="project.id"
            class="project-card"
            :class="{ active: currentProjectId === project.id }"
            @click="loadProject(project)"
          >
            <div class="project-preview">
              <img 
                v-if="project.items.length > 0" 
                :src="project.items[0].image_url" 
                alt="Preview"
              />
              <div v-else class="empty-preview">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <path d="M3 15l6-6 4 4 8-8"/>
                </svg>
              </div>
            </div>
            <div class="project-info">
              <span class="project-name">{{ project.name }}</span>
              <span class="project-meta">{{ project.items.length }} items · ${{ formatPrice(project.totalPrice) }}</span>
            </div>
            <button class="project-delete" @click.stop="deleteProject(project.id)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
          
          <div v-if="savedProjects.length === 0" class="no-projects">
            <p>No saved projects yet</p>
            <span>Create your first outfit</span>
          </div>
        </div>
      </aside>

      <!-- Center: Canvas -->
      <section class="canvas-section">
        <div class="canvas-header">
          <input 
            type="text" 
            v-model="projectName"
            class="project-name-input"
            placeholder="Untitled Outfit"
          />
          <span class="item-count">{{ canvasItems.length }} items</span>
        </div>
        
        <!-- Free-form Canvas -->
        <div 
          class="outfit-canvas"
          ref="canvasRef"
          @dragover.prevent
          @drop="handleDrop"
        >
          <div class="canvas-grid-bg"></div>
          
          <!-- Canvas Items -->
          <div
            v-for="item in canvasItems"
            :key="item.id"
            class="canvas-item"
            :class="{ selected: selectedItem === item.id, dragging: draggingItem === item.id }"
            :style="{
              left: item.x + 'px',
              top: item.y + 'px',
              width: item.width + 'px',
              height: item.height + 'px',
              zIndex: item.zIndex
            }"
            @mousedown="startDrag($event, item)"
          >
            <img :src="item.image_url" :alt="item.title" draggable="false" class="item-img" />
            
            <!-- Remove Button -->
            <button class="item-remove" @mousedown.stop @click="removeItem(item.id)">
              ×
            </button>
            
            <!-- Resize Handle -->
            <div 
              class="resize-handle"
              @mousedown.stop="startResize($event, item)"
            ></div>
            
            <!-- Price Tag -->
            <span class="item-price">${{ formatPrice(item.price) }}</span>
          </div>

          <!-- Empty State -->
          <div v-if="canvasItems.length === 0" class="canvas-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M12 8v8M8 12h8"/>
            </svg>
            <p>Drag products here to build your outfit</p>
            <span>Search and add items from the right panel</span>
          </div>
        </div>

        <!-- Total & Actions -->
        <div class="canvas-footer">
          <div class="total-section">
            <span class="total-label">Total</span>
            <span class="total-price">${{ formatPrice(totalPrice) }}</span>
          </div>
          <button class="shop-all-btn" :disabled="canvasItems.length === 0" @click="shopAllItems">
            Shop All Items ({{ canvasItems.length }})
          </button>
        </div>
      </section>

      <!-- Right: Product Picker -->
      <section class="product-picker">
        <h2 class="section-title">Add Products</h2>

        <!-- Search -->
        <div class="search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input 
            type="text" 
            v-model="searchQuery"
            @keyup.enter="searchProducts"
            placeholder="Search sneakers, coats, bags..."
          />
        </div>

        <!-- Quick Categories -->
        <div class="quick-cats">
          <button 
            v-for="cat in categories" 
            :key="cat.name"
            :class="{ active: activeCategory === cat.name }"
            @click="searchCategory(cat)"
          >
            {{ cat.name }}
          </button>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Searching...</p>
        </div>

        <!-- Product Grid -->
        <div v-else class="products-grid">
          <div 
            v-for="product in suggestedProducts" 
            :key="product.id"
            class="product-card"
            draggable="true"
            @dragstart="handleDragStart($event, product)"
            @click="addToCanvas(product)"
          >
            <div class="product-image">
              <img :src="product.image_url" :alt="product.title" />
              <span class="add-indicator">+ Add</span>
            </div>
            <div class="product-info">
              <span class="product-brand">{{ product.brand || product.source }}</span>
              <p class="product-title">{{ product.title }}</p>
              <span class="product-price">${{ formatPrice(product.price) }}</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../stores/authStore'
import api from '../utils/api'

const route = useRoute()
const router = useRouter()
const { isAuthenticated } = useAuth()

// Canvas ref
const canvasRef = ref(null)

// Project state
const currentProjectId = ref(null)
const projectName = ref('Untitled Outfit')
const savedProjects = ref([])

// Canvas items
const canvasItems = ref([])
const selectedItem = ref(null)
const draggingItem = ref(null)

// Drag state
let dragOffset = { x: 0, y: 0 }
let isResizing = false
let resizingItem = null

// Search state
const searchQuery = ref('')
const suggestedProducts = ref([])
const loading = ref(false)
const activeCategory = ref('')

const categories = [
  { name: 'Tops', query: 'shirt blouse top jacket blazer' },
  { name: 'Bottoms', query: 'pants jeans skirt shorts trousers' },
  { name: 'Shoes', query: 'sneakers shoes boots heels sandals' },
  { name: 'Bags', query: 'bag purse handbag tote backpack' },
  { name: 'Jewelry', query: 'jewelry necklace ring watch bracelet' },
  { name: 'Outerwear', query: 'coat jacket blazer cardigan sweater' },
]

// Computed
const totalPrice = computed(() => {
  return canvasItems.value.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0)
})

// Methods
const formatPrice = (price) => {
  if (!price) return '0.00'
  return parseFloat(price).toFixed(2)
}

const goBack = () => router.back()

// Project management
const loadSavedProjects = () => {
  savedProjects.value = JSON.parse(localStorage.getItem('fynda_outfits') || '[]')
}

const createNewProject = () => {
  currentProjectId.value = null
  projectName.value = 'Untitled Outfit'
  canvasItems.value = []
  selectedItem.value = null
}

const saveProject = () => {
  // Require login to save outfits
  if (!isAuthenticated.value) {
    router.push('/login')
    return
  }
  
  const project = {
    id: currentProjectId.value || Date.now(),
    name: projectName.value || 'Untitled Outfit',
    items: canvasItems.value,
    totalPrice: totalPrice.value,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  const projects = [...savedProjects.value]
  const existingIndex = projects.findIndex(p => p.id === project.id)
  
  if (existingIndex >= 0) {
    projects[existingIndex] = project
  } else {
    projects.unshift(project)
  }
  
  localStorage.setItem('fynda_outfits', JSON.stringify(projects))
  savedProjects.value = projects
  currentProjectId.value = project.id
  
  // Show feedback
  const btn = document.querySelector('.save-btn')
  if (btn) {
    btn.textContent = 'Saved!'
    setTimeout(() => {
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg> Save`
    }, 1500)
  }
}

const loadProject = (project) => {
  currentProjectId.value = project.id
  projectName.value = project.name
  canvasItems.value = project.items.map(item => ({
    ...item,
    id: item.id || Date.now() + Math.random()
  }))
  selectedItem.value = null
}

const deleteProject = (id) => {
  if (!confirm('Delete this outfit?')) return
  savedProjects.value = savedProjects.value.filter(p => p.id !== id)
  localStorage.setItem('fynda_outfits', JSON.stringify(savedProjects.value))
  
  if (currentProjectId.value === id) {
    createNewProject()
  }
}

// Search
const searchProducts = async () => {
  if (!searchQuery.value.trim()) return
  loading.value = true
  activeCategory.value = ''
  try {
    const response = await api.get(`/api/search/?q=${encodeURIComponent(searchQuery.value)}&limit=12`)
    suggestedProducts.value = response.data.deals || []
  } catch (error) {
    suggestedProducts.value = getMockProducts()
  } finally {
    loading.value = false
  }
}

const searchCategory = (cat) => {
  activeCategory.value = cat.name
  searchQuery.value = cat.query
  searchProducts()
}

const getMockProducts = () => [
  { id: 1, title: 'Classic White Shirt', brand: 'Zara', price: 45.99, image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&q=80' },
  { id: 2, title: 'Blue Denim Jeans', brand: 'Levis', price: 89.00, image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&q=80' },
  { id: 3, title: 'White Sneakers', brand: 'Nike', price: 120.00, image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80' },
  { id: 4, title: 'Leather Tote Bag', brand: 'Coach', price: 295.00, image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300&q=80' },
]

// Canvas operations
const addToCanvas = (product) => {
  const canvas = canvasRef.value
  if (!canvas) return
  
  const rect = canvas.getBoundingClientRect()
  const size = 150
  const x = Math.random() * (rect.width - size - 40) + 20
  const y = Math.random() * (rect.height - size - 40) + 20
  
  canvasItems.value.push({
    ...product,
    id: Date.now() + Math.random(),
    x,
    y,
    width: size,
    height: size,
    zIndex: canvasItems.value.length + 1,
    upvoted: false
  })
}

const handleDragStart = (e, product) => {
  e.dataTransfer.setData('application/json', JSON.stringify(product))
  e.dataTransfer.effectAllowed = 'copy'
}

const handleDrop = (e) => {
  try {
    const product = JSON.parse(e.dataTransfer.getData('application/json'))
    const canvas = canvasRef.value
    const rect = canvas.getBoundingClientRect()
    
    canvasItems.value.push({
      ...product,
      id: Date.now() + Math.random(),
      x: e.clientX - rect.left - 75,
      y: e.clientY - rect.top - 75,
      width: 150,
      height: 150,
      zIndex: canvasItems.value.length + 1,
      upvoted: false
    })
  } catch (err) {}
}

// Drag on canvas
const startDrag = (e, item) => {
  if (isResizing) return
  selectedItem.value = item.id
  draggingItem.value = item.id
  item.zIndex = Math.max(...canvasItems.value.map(i => i.zIndex)) + 1
  
  dragOffset = {
    x: e.clientX - item.x,
    y: e.clientY - item.y
  }
  
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

const onDrag = (e) => {
  const item = canvasItems.value.find(i => i.id === draggingItem.value)
  if (!item) return
  
  const canvas = canvasRef.value
  const rect = canvas.getBoundingClientRect()
  
  item.x = Math.max(0, Math.min(e.clientX - dragOffset.x, rect.width - item.width))
  item.y = Math.max(0, Math.min(e.clientY - dragOffset.y, rect.height - item.height))
}

const stopDrag = () => {
  draggingItem.value = null
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

// Resize
const startResize = (e, item) => {
  isResizing = true
  resizingItem = item.id
  selectedItem.value = item.id
  
  document.addEventListener('mousemove', onResize)
  document.addEventListener('mouseup', stopResize)
}

const onResize = (e) => {
  const item = canvasItems.value.find(i => i.id === resizingItem)
  if (!item) return
  
  const canvas = canvasRef.value
  const rect = canvas.getBoundingClientRect()
  
  const newWidth = Math.max(80, e.clientX - rect.left - item.x)
  const newHeight = Math.max(80, e.clientY - rect.top - item.y)
  
  item.width = Math.min(newWidth, rect.width - item.x)
  item.height = Math.min(newHeight, rect.height - item.y)
}

const stopResize = () => {
  isResizing = false
  resizingItem = null
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
}

// Actions
const toggleItemUpvote = (id) => {
  const item = canvasItems.value.find(i => i.id === id)
  if (item) item.upvoted = !item.upvoted
}

const removeItem = (id) => {
  canvasItems.value = canvasItems.value.filter(i => i.id !== id)
  if (selectedItem.value === id) selectedItem.value = null
}

const shopAllItems = () => {
  canvasItems.value.forEach(item => {
    if (item.url) window.open(item.url, '_blank')
  })
}

// Init
onMounted(() => {
  loadSavedProjects()
  
  const initialProduct = route.query.product ? JSON.parse(route.query.product) : null
  if (initialProduct) addToCanvas(initialProduct)
  
  searchQuery.value = 'fashion'
  searchProducts()
})

onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
})
</script>

<style scoped>
.outfit-studio-page {
  min-height: 100vh;
  background: #f5f5f5;
}

/* Header */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1.5rem;
  background: #fff;
  border-bottom: 1px solid #e5e5e5;
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
}

.back-btn:hover { border-color: #000; }

.page-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.4rem;
  font-weight: 400;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.new-btn, .save-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

.new-btn {
  background: #fff;
  border: 1px solid #e5e5e5;
  color: #1a1a1a;
}

.new-btn:hover { border-color: #000; }

.save-btn {
  background: #000;
  color: #fff;
  border: none;
}

.save-btn:hover { background: #222; }

/* Main Layout */
.main-content {
  display: grid;
  grid-template-columns: 200px 1fr 300px;
  gap: 1rem;
  margin: 0 auto;
  padding: 1rem;
  height: calc(100vh - 65px);
}

/* Projects Sidebar */
.projects-sidebar {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f0f0f0;
}

.sidebar-header h3 {
  font-size: 0.9rem;
  font-weight: 600;
}

.project-count {
  font-size: 0.75rem;
  background: #f0f0f0;
  padding: 0.2rem 0.6rem;
  border-radius: 10px;
  color: #666;
}

.projects-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem;
}

.project-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.project-card:hover {
  background: #f5f5f5;
}

.project-card.active {
  background: #f0f0f0;
}

.project-preview {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  background: #f0f0f0;
  flex-shrink: 0;
}

.project-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.empty-preview {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ccc;
}

.project-info {
  flex: 1;
  min-width: 0;
}

.project-name {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.project-meta {
  font-size: 0.7rem;
  color: #888;
}

.project-delete {
  position: absolute;
  right: 0.5rem;
  padding: 0.35rem;
  background: transparent;
  border: none;
  color: #ccc;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
}

.project-card:hover .project-delete { opacity: 1; }
.project-delete:hover { color: #ef4444; }

.no-projects {
  text-align: center;
  padding: 2rem 1rem;
  color: #888;
}

.no-projects p {
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
}

.no-projects span {
  font-size: 0.75rem;
  color: #aaa;
}

/* Canvas Section */
.canvas-section {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
}

.canvas-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.875rem 1.25rem;
  border-bottom: 1px solid #f0f0f0;
}

.project-name-input {
  font-size: 1rem;
  font-weight: 500;
  border: none;
  background: transparent;
  outline: none;
  padding: 0.25rem 0;
  width: 200px;
}

.project-name-input:focus {
  border-bottom: 1px solid #000;
}

.item-count {
  font-size: 0.8rem;
  color: #888;
}

.section-title {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

/* Canvas */
.outfit-canvas {
  flex: 1;
  position: relative;
  background: #fafafa;
  overflow: hidden;
  min-height: 350px;
}

.canvas-grid-bg {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px);
  background-size: 24px 24px;
  pointer-events: none;
}

.canvas-empty {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #aaa;
}

.canvas-empty svg { margin-bottom: 1rem; color: #ddd; }
.canvas-empty p { font-size: 0.95rem; margin-bottom: 0.25rem; }
.canvas-empty span { font-size: 0.8rem; color: #bbb; }

/* Canvas Item */
.canvas-item {
  position: absolute;
  background: #fff;
  border: 2px solid transparent;
  border-radius: 10px;
  overflow: hidden;
  cursor: move;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: box-shadow 0.2s, border-color 0.2s;
}

.canvas-item:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.12); }
.canvas-item.selected { border-color: #000; }
.canvas-item.dragging { opacity: 0.85; }

/* Image with hover zoom */
.item-img { 
  width: 100%; 
  height: 100%; 
  object-fit: cover;
  transition: transform 0.3s ease;
}

.canvas-item:hover .item-img {
  transform: scale(1.05);
}

.item-remove {
  position: absolute;
  top: 4px;
  right: 6px;
  width: auto;
  height: auto;
  padding: 0;
  background: transparent;
  color: #666;
  border: none;
  font-size: 1.5rem;
  font-weight: 300;
  line-height: 1;
  cursor: pointer;
  transition: all 0.15s;
  text-shadow: 0 1px 3px rgba(255,255,255,0.8);
}

.item-remove:hover { 
  color: #ef4444;
  transform: scale(1.1);
}

.resize-handle {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 18px;
  height: 18px;
  cursor: se-resize;
  background: linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.15) 50%);
  border-radius: 0 0 8px 0;
}

.item-price {
  position: absolute;
  bottom: 6px;
  left: 6px;
  background: rgba(0,0,0,0.65);
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
}

/* Canvas Footer */
.canvas-footer {
  padding: 0.875rem 1.25rem;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-section { display: flex; flex-direction: column; }
.total-label { font-size: 0.8rem; color: #888; }
.total-price { font-size: 1.35rem; font-weight: 600; }

.shop-all-btn {
  padding: 0.75rem 1.75rem;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

.shop-all-btn:disabled { background: #ccc; cursor: not-allowed; }

/* Product Picker */
.product-picker {
  background: #fff;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.9rem;
  background: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 0.75rem;
}

.search-box svg { color: #888; flex-shrink: 0; }
.search-box input {
  flex: 1;
  background: transparent;
  border: none;
  font-size: 0.875rem;
  outline: none;
}

/* Quick Categories */
.quick-cats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
}

.quick-cats button {
  padding: 0.35rem 0.7rem;
  background: #f5f5f5;
  border: 1px solid transparent;
  border-radius: 16px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-cats button:hover { border-color: #000; }
.quick-cats button.active { background: #000; color: #fff; }

/* Loading */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  color: #888;
}

.spinner {
  width: 28px;
  height: 28px;
  border: 2px solid #f0f0f0;
  border-top-color: #000;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 0.5rem;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* Products Grid */
.products-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.6rem;
}

.product-card {
  cursor: grab;
  transition: transform 0.2s;
}

.product-card:hover { transform: translateY(-2px); }
.product-card:active { cursor: grabbing; }

.product-image {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 0.4rem;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}

.add-indicator {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.45);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 500;
  opacity: 0;
  transition: opacity 0.2s;
}

.product-card:hover .add-indicator { opacity: 1; }

.product-info { padding: 0 0.15rem; }
.product-brand {
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  color: #888;
}

.product-title {
  font-size: 0.7rem;
  color: #1a1a1a;
  margin: 0.1rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-price { font-size: 0.75rem; font-weight: 600; }

/* Responsive */
@media (max-width: 1100px) {
  .main-content {
    grid-template-columns: 200px 1fr 300px;
  }
}

@media (max-width: 900px) {
  .main-content {
    grid-template-columns: 1fr;
    height: auto;
  }
  .projects-sidebar { display: none; }
  .outfit-canvas { min-height: 300px; }
}
</style>
