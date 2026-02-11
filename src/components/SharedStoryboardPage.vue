<template>
  <div class="shared-storyboard-page">
    <!-- Header -->
    <header class="shared-header">
      <router-link to="/" class="logo-link">
        <img src="../assets/fynda-png-1.png" alt="Fynda" class="logo" />
      </router-link>
      <router-link to="/login" class="cta-btn">Sign In to Create Your Own</router-link>
    </header>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading storyboard...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
      <h2>{{ error }}</h2>
      <p>This share link may have expired or doesn't exist.</p>
      <router-link to="/" class="home-btn">Go to Homepage</router-link>
    </div>

    <!-- Storyboard View -->
    <main v-else class="storyboard-view">
      <div 
        class="shared-canvas"
        :style="{
          width: storyboard.canvasWidth + 'px',
          height: storyboard.canvasHeight + 'px',
          ...storyboard.background
        }"
      >
        <!-- Canvas Items -->
        <div 
          v-for="item in storyboard.items" 
          :key="item.id"
          class="canvas-item"
          :class="item.frame ? 'frame-' + item.frame : ''"
          :style="{
            left: item.x + 'px',
            top: item.y + 'px',
            width: item.width + 'px',
            height: item.height + 'px',
            zIndex: item.zIndex,
            transform: item.rotation ? `rotate(${item.rotation}deg)` : 'none'
          }"
        >
          <div v-if="item.showPin" class="item-pin"></div>
          <img :src="item.image_url" :alt="item.title" />
        </div>

        <!-- Text Elements -->
        <div 
          v-for="text in storyboard.textElements" 
          :key="text.id"
          class="text-element"
          :style="{
            left: text.x + 'px',
            top: text.y + 'px',
            fontFamily: text.fontFamily,
            fontSize: text.fontSize + 'px',
            color: text.color,
            zIndex: text.zIndex
          }"
        >
          {{ text.content }}
        </div>
        
        <!-- Stickers -->
        <div 
          v-for="sticker in (storyboard.stickers || [])" 
          :key="sticker.id"
          class="sticker-element"
          :style="{
            left: sticker.x + 'px',
            top: sticker.y + 'px',
            fontSize: sticker.size + 'px',
            zIndex: sticker.zIndex,
            transform: `rotate(${sticker.rotation || 0}deg)`
          }"
        >
          {{ sticker.emoji }}
        </div>
      </div>

      <!-- CTA Section -->
      <div class="cta-section">
        <h2>Create Your Own Fashion Board</h2>
        <p>Design stunning mood boards with our easy-to-use Fashion Board tool.</p>
        <router-link to="/register" class="create-btn">Get Started Free</router-link>
      </div>
    </main>

    <!-- Footer -->
    <footer class="shared-footer">
      <p>Created with <strong>Fynda</strong> Fashion Board</p>
      <router-link to="/">fynda.shop</router-link>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../utils/api'

const route = useRoute()

const loading = ref(true)
const error = ref(null)
const storyboard = ref({
  canvasWidth: 960,
  canvasHeight: 540,
  background: { background: '#ffffff' },
  items: [],
  textElements: []
})
const owner = ref('')
const viewCount = ref(0)

onMounted(async () => {
  const token = route.params.token
  
  if (!token) {
    error.value = 'Invalid share link'
    loading.value = false
    return
  }
  
  try {
    // Fetch storyboard from backend API
    const response = await api.get(`/api/storyboard/share/${token}/`)
    const data = response.data
    
    // Load the storyboard data
    storyboard.value = {
      canvasWidth: data.storyboard_data.canvasWidth || 960,
      canvasHeight: data.storyboard_data.canvasHeight || 540,
      background: data.storyboard_data.background || { background: '#ffffff' },
      items: data.storyboard_data.items || [],
      textElements: data.storyboard_data.textElements || []
    }
    
    owner.value = data.owner || 'Anonymous'
    viewCount.value = data.view_count || 0
    
  } catch (err) {
    if (err.response?.status === 404) {
      error.value = 'Share link not found'
    } else if (err.response?.status === 410) {
      error.value = 'This share link has expired'
    } else {
      error.value = 'Failed to load storyboard'
    }
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.shared-storyboard-page {
  min-height: 100vh;
  background: #f8f8f8;
  display: flex;
  flex-direction: column;
}

/* Header */
.shared-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
  background: #fff;
  border-bottom: 1px solid #e5e5e5;
}

.logo {
  height: 36px;
  width: auto;
}

.shared-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f0f0f0;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  color: #666;
}

.cta-btn {
  padding: 0.5rem 1rem;
  background: #1a1a1a;
  color: #fff;
  border-radius: 8px;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 500;
  transition: background 0.2s ease;
}

.cta-btn:hover {
  background: #333;
}

/* Loading */
.loading-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f0f0f0;
  border-top-color: #1a1a1a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error */
.error-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  text-align: center;
  padding: 2rem;
}

.error-container svg {
  color: #dc3545;
}

.error-container h2 {
  font-size: 1.5rem;
  color: #1a1a1a;
  margin: 0;
}

.error-container p {
  color: #666;
  margin: 0;
}

.home-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #1a1a1a;
  color: #fff;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
}

/* Storyboard View */
.storyboard-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  gap: 1.5rem;
}

.shared-canvas {
  position: relative;
  border-radius: 16px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  transform: scale(1.1);
  transform-origin: center center;
}

.canvas-item {
  position: absolute;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.canvas-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.text-element {
  position: absolute;
  white-space: nowrap;
  user-select: none;
}

.sticker-element {
  position: absolute;
  user-select: none;
}

/* Pin Decoration */
.item-pin {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 16px;
  background: radial-gradient(circle at 30% 30%, #ff4444, #cc0000);
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  z-index: 10;
}

/* Polaroid Frame */
.canvas-item.frame-polaroid {
  background: #fff;
  padding: 8px 8px 30px 8px;
  border-radius: 2px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  overflow: visible;
}

/* Vintage Frame */
.canvas-item.frame-vintage {
  border: 6px solid #8B4513;
  box-shadow: inset 0 0 3px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2);
  border-radius: 2px;
}

/* Film Strip Frame */
.canvas-item.frame-film {
  background: #1a1a1a;
  padding: 15px 6px;
  border-radius: 2px;
}

/* Tape Frame */
.canvas-item.frame-tape {
  background: #fff;
  padding: 4px;
  overflow: visible;
}

.canvas-item.frame-tape::before {
  content: '';
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%) rotate(-2deg);
  width: 60px;
  height: 20px;
  background: rgba(255, 220, 150, 0.7);
  border-radius: 2px;
  z-index: 10;
}

/* Shadow Frame */
.canvas-item.frame-shadow {
  box-shadow: 8px 8px 0 rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.08);
}

/* CTA Section */
.cta-section {
  text-align: center;
  padding: 1rem 1.5rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  max-width: 360px;
}

.cta-section h2 {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1rem;
  font-weight: 500;
  color: #1a1a1a;
  margin: 0 0 0.25rem;
}

.cta-section p {
  color: #888;
  margin: 0 0 0.75rem;
  font-size: 0.8rem;
}

.create-btn {
  display: inline-block;
  padding: 0.5rem 1.25rem;
  background: #1a1a1a;
  color: #fff;
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 500;
  transition: background 0.2s ease;
}

.create-btn:hover {
  background: #333;
}

/* Footer */
.shared-footer {
  padding: 1.5rem;
  text-align: center;
  border-top: 1px solid #e5e5e5;
  background: #fff;
}

.shared-footer p {
  margin: 0 0 0.25rem;
  color: #888;
  font-size: 0.85rem;
}

.shared-footer a {
  color: #1a1a1a;
  font-weight: 500;
  text-decoration: none;
}

@media (max-width: 768px) {
  .shared-header {
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  
  .shared-badge {
    order: 3;
    width: 100%;
    justify-content: center;
  }
  
  .shared-canvas {
    max-width: 100%;
    height: auto !important;
  }
}
</style>
