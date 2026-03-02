<template>
  <div class="shared-storyboard-page">
    <!-- Minimal Header -->
    <header class="shared-header">
      <router-link to="/" class="logo-link">
        <img src="../assets/outfi-logo.png" alt="outfi." class="logo" />
      </router-link>
      <router-link to="/register" class="cta-btn">Create Your Own</router-link>
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
      <!-- iPhone-style Card Frame -->
      <div class="device-frame" :style="deviceFrameStyle">
        <!-- Dynamic Island / Notch hint -->
        <div class="dynamic-island"></div>
        
        <!-- Canvas Content -->
        <div 
          class="shared-canvas"
          :style="canvasInnerStyle"
        >
          <!-- Canvas Items -->
          <component
            v-for="item in storyboard.items" 
            :key="item.id"
            :is="storyboard.enableLinks && item.productUrl ? 'a' : 'div'"
            :href="storyboard.enableLinks && item.productUrl ? getProductLink(item) : undefined"
            class="canvas-item"
            :class="[
              item.frame ? 'frame-' + item.frame : '',
              { clickable: storyboard.enableLinks && item.productUrl }
            ]"
            :style="{
              left: item.x + '%',
              top: item.y + '%',
              width: item.width + '%',
              height: item.height + '%',
              zIndex: item.zIndex,
              transform: item.rotation ? `rotate(${item.rotation}deg)` : 'none'
            }"
          >
            <div v-if="item.showPin" class="item-pin"></div>
            <img :src="item.image_url" :alt="item.title" />
            <!-- Price Tag Overlay -->
            <span v-if="storyboard.showPrices && item.productPrice" class="price-tag">
              ${{ formatPrice(item.productPrice) }}
            </span>
          </component>

          <!-- Text Elements -->
          <div 
            v-for="text in storyboard.textElements" 
            :key="text.id"
            class="text-element"
            :style="{
              left: text.x + '%',
              top: text.y + '%',
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
              left: sticker.x + '%',
              top: sticker.y + '%',
              fontSize: sticker.size + 'px',
              zIndex: sticker.zIndex,
              transform: `rotate(${sticker.rotation || 0}deg)`
            }"
          >
            {{ sticker.emoji }}
          </div>
        </div>
      </div>

      <!-- Branding Footer -->
      <div class="brand-watermark">
        <span class="watermark-logo">outfi.</span>
        <router-link to="/register" class="watermark-cta">Explore more on outfi.ai →</router-link>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../utils/api'

const route = useRoute()

const loading = ref(true)
const error = ref(null)
const storyboard = ref({
  canvasWidth: 600,
  canvasHeight: 900,
  background: { background: '#ffffff' },
  items: [],
  textElements: [],
  stickers: [],
  enableLinks: false,
  showPrices: false
})
const owner = ref('')
const viewCount = ref(0)

// Compute scaling so the card fits within the viewport
const deviceFrameStyle = computed(() => {
  const w = storyboard.value.canvasWidth
  const h = storyboard.value.canvasHeight
  const aspectRatio = w / h

  return {
    aspectRatio: `${w} / ${h}`,
    maxWidth: aspectRatio >= 1 ? '90vw' : '420px',
    width: '100%',
  }
})

const canvasInnerStyle = computed(() => {
  const bg = storyboard.value.background || {}
  return {
    ...bg,
    width: '100%',
    height: '100%',
    position: 'relative',
  }
})

const formatPrice = (price) => {
  if (!price) return '0.00'
  return parseFloat(price).toFixed(2)
}

const getProductLink = (item) => {
  const productId = item.id || encodeURIComponent((item.title || '').substring(0, 30))
  return `/product/${productId}`
}

onMounted(async () => {
  const token = route.params.token
  
  if (!token) {
    error.value = 'Invalid share link'
    loading.value = false
    return
  }
  
  try {
    const response = await api.get(`/api/storyboard/share/${token}/`)
    const data = response.data
    
    const cw = data.storyboard_data.canvasWidth || 600
    const ch = data.storyboard_data.canvasHeight || 900

    storyboard.value = {
      canvasWidth: cw,
      canvasHeight: ch,
      background: data.storyboard_data.background || { background: '#ffffff' },
      items: (data.storyboard_data.items || []).map(item => ({
        ...item,
        // Convert absolute pixel positions to percentages for responsive scaling
        x: (item.x / cw) * 100,
        y: (item.y / ch) * 100,
        width: (item.width / cw) * 100,
        height: (item.height / ch) * 100,
      })),
      textElements: (data.storyboard_data.textElements || []).map(text => ({
        ...text,
        x: (text.x / cw) * 100,
        y: (text.y / ch) * 100,
        fontSize: text.fontSize,
      })),
      stickers: (data.storyboard_data.stickers || []).map(sticker => ({
        ...sticker,
        x: (sticker.x / cw) * 100,
        y: (sticker.y / ch) * 100,
      })),
      enableLinks: data.storyboard_data.enableLinks || false,
      showPrices: data.storyboard_data.showPrices || false
    }
    
    // Store product data in sessionStorage for items with links
    if (storyboard.value.enableLinks) {
      const origItems = data.storyboard_data.items || []
      origItems.forEach(item => {
        if (item.productUrl) {
          const productId = item.id || encodeURIComponent((item.title || '').substring(0, 30))
          sessionStorage.setItem(`fyndaProduct_${productId}`, JSON.stringify({
            id: item.id,
            title: item.title,
            price: item.productPrice || item.price,
            image_url: item.image_url,
            url: item.productUrl || item.url,
            source: 'Fashion Board'
          }))
        }
      })
    }
    
    owner.value = data.owner || 'Anonymous'
    viewCount.value = data.view_count || 0

    // Set page title
    document.title = `${data.title || 'Fashion Board'} — outfi.`
    
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
/* ============================================
   SHARED STORYBOARD PAGE - iPhone Card Style
   ============================================ */
.shared-storyboard-page {
  min-height: 100vh;
  background: linear-gradient(160deg, #0a0a0f 0%, #141420 40%, #1a1a2e 100%);
  display: flex;
  flex-direction: column;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* ---- Header ---- */
.shared-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
  background: transparent;
}

.logo {
  height: 32px;
  width: auto;
  filter: brightness(0) invert(1);
  opacity: 0.85;
}

.cta-btn {
  padding: 0.5rem 1.1rem;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
}

.cta-btn:hover {
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

/* ---- Loading ---- */
.loading-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: rgba(255, 255, 255, 0.6);
}

.spinner {
  width: 36px;
  height: 36px;
  border: 2.5px solid rgba(255, 255, 255, 0.1);
  border-top-color: rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ---- Error ---- */
.error-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  text-align: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.7);
}

.error-container svg {
  color: #ff6b6b;
  opacity: 0.8;
}

.error-container h2 {
  font-size: 1.3rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  font-weight: 600;
}

.error-container p {
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
  font-size: 0.9rem;
}

.home-btn {
  margin-top: 0.75rem;
  padding: 0.65rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.home-btn:hover {
  background: rgba(255, 255, 255, 0.18);
}

/* ---- Main Storyboard View ---- */
.storyboard-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem 1rem 1.5rem;
  gap: 1.25rem;
}

/* ---- iPhone-Style Device Frame ---- */
.device-frame {
  position: relative;
  border-radius: 44px;
  overflow: hidden;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.08),
    0 4px 16px rgba(0, 0, 0, 0.4),
    0 20px 60px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  max-height: 85vh;
  animation: cardFloat 0.6s ease-out;
}

@keyframes cardFloat {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Dynamic Island */
.dynamic-island {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 90px;
  height: 26px;
  background: #000000;
  border-radius: 20px;
  z-index: 50;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

/* ---- Canvas ---- */
.shared-canvas {
  overflow: hidden;
}

/* Scale items from absolute px to percentage-based layout */
.canvas-item {
  position: absolute;
  border-radius: 0;
  overflow: hidden;
  box-shadow: none;
  border: none;
  display: block;
  text-decoration: none;
  /* Use percentage-based positioning */
  left: 0;
  top: 0;
}

.canvas-item.clickable {
  cursor: pointer;
  transition: transform 0.15s ease;
}

.canvas-item.clickable:hover {
  transform: scale(1.03);
  z-index: 999 !important;
}

.canvas-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Override position/size to use percentages */
.canvas-item[style] {
  /* Styles applied inline via :style binding */
}

/* Price Tag Overlay */
.price-tag {
  position: absolute;
  bottom: 6px;
  left: 6px;
  background: rgba(0, 0, 0, 0.78);
  color: #fff;
  padding: 2px 7px;
  border-radius: 10px;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  backdrop-filter: blur(4px);
  pointer-events: none;
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

/* ---- Pin Decoration ---- */
.item-pin {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 14px;
  height: 14px;
  background: radial-gradient(circle at 30% 30%, #ff4444, #cc0000);
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  z-index: 10;
}

/* ---- Frames ---- */
.canvas-item.frame-polaroid {
  background: #fff;
  padding: 6px 6px 24px 6px;
  border-radius: 2px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.12);
  overflow: visible;
}

.canvas-item.frame-vintage {
  border: 5px solid #8B4513;
  box-shadow: inset 0 0 3px rgba(0,0,0,0.3), 0 3px 10px rgba(0,0,0,0.2);
  border-radius: 2px;
}

.canvas-item.frame-film {
  background: #1a1a1a;
  padding: 12px 5px;
  border-radius: 2px;
}

.canvas-item.frame-tape {
  background: #fff;
  padding: 3px;
  overflow: visible;
}

.canvas-item.frame-tape::before {
  content: '';
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%) rotate(-2deg);
  width: 50px;
  height: 16px;
  background: rgba(255, 220, 150, 0.7);
  border-radius: 2px;
  z-index: 10;
}

.canvas-item.frame-shadow {
  box-shadow: 6px 6px 0 rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.08);
}

/* ---- Branding Watermark ---- */
.brand-watermark {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 1rem 0;
}

.watermark-logo {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.25);
  letter-spacing: 0.08em;
}

.watermark-cta {
  font-family: 'Inter', -apple-system, sans-serif;
  font-size: 0.65rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.3);
  text-decoration: none;
  letter-spacing: 0.04em;
  transition: color 0.25s ease;
}

.watermark-cta:hover {
  color: rgba(255, 255, 255, 0.6);
}

/* ---- Responsive ---- */
@media (max-width: 768px) {
  .shared-header {
    padding: 0.5rem 1rem;
  }

  .logo {
    height: 26px;
  }

  .cta-btn {
    font-size: 0.72rem;
    padding: 0.4rem 0.8rem;
  }

  .storyboard-view {
    padding: 0.75rem 0.75rem 1rem;
  }

  .device-frame {
    border-radius: 32px;
    max-height: 80vh;
  }

  .dynamic-island {
    width: 72px;
    height: 22px;
    top: 8px;
  }
}

@media (max-width: 420px) {
  .device-frame {
    border-radius: 28px;
    max-width: 100% !important;
  }

  .dynamic-island {
    width: 64px;
    height: 20px;
    top: 6px;
  }

  .storyboard-view {
    padding: 0.5rem 0.4rem 0.75rem;
  }
}
</style>
