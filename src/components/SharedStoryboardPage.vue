<template>
  <div class="shared-board-page">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading fashion board...</p>
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

    <!-- Fashion Board — iPhone-style card on white background -->
    <div v-else class="board-wrapper" ref="wrapperRef">
      <!-- iPhone-style card with rounded corners -->
      <div 
        class="board-card"
        :style="cardStyle"
      >
        <!-- The canvas at native pixel size, scaled into the card -->
        <div 
          class="board-canvas"
          ref="canvasRef"
          :style="scaledCanvasStyle"
        >
          <!-- Canvas Background -->
          <div class="canvas-bg" :style="canvasBgStyle"></div>

          <!-- Canvas Items -->
          <component
            v-for="item in board.items" 
            :key="item.id"
            :is="board.enableLinks && item.productUrl ? 'a' : 'div'"
            :href="board.enableLinks && item.productUrl ? getProductLink(item) : undefined"
            class="canvas-item"
            :class="[
              item.frame ? 'frame-' + item.frame : '',
              { clickable: board.enableLinks && item.productUrl }
            ]"
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
            <!-- Price Tag Overlay -->
            <span v-if="board.showPrices && item.productPrice" class="price-tag">
              ${{ formatPrice(item.productPrice) }}
            </span>
          </component>

          <!-- Text Elements -->
          <div 
            v-for="text in board.textElements" 
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
            v-for="sticker in (board.stickers || [])" 
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
      </div>

      <!-- Floating Outfi brand badge — bottom center -->
      <div class="floating-brand">
        <router-link to="/" class="brand-pill">
          <span class="brand-text">outfi.</span>
        </router-link>
      </div>

      <!-- Floating CTA — top right -->
      <router-link to="/register" class="floating-cta">Create Your Own</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import api from '../utils/api'

const route = useRoute()
const wrapperRef = ref(null)
const canvasRef = ref(null)

const loading = ref(true)
const error = ref(null)
const board = ref({
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

// Scale factor: fit the original canvas into the card
const scale = ref(1)
const cardWidth = ref(0)
const cardHeight = ref(0)

const computeScale = () => {
  if (!wrapperRef.value) return
  const vw = wrapperRef.value.clientWidth
  const vh = wrapperRef.value.clientHeight
  const cw = board.value.canvasWidth
  const ch = board.value.canvasHeight

  // Leave padding around the card (40px on each side)
  const padding = 48
  const availW = vw - padding * 2
  const availH = vh - padding * 2

  // Scale to fit the canvas into available space while preserving aspect ratio
  const s = Math.min(availW / cw, availH / ch, 1.2) // cap at 1.2x to avoid oversized
  scale.value = s

  // The card takes the exact scaled dimensions of the canvas
  cardWidth.value = cw * s
  cardHeight.value = ch * s
}

// Card outer style — this is the iPhone-like rounded container
const cardStyle = computed(() => ({
  width: cardWidth.value + 'px',
  height: cardHeight.value + 'px',
}))

// The inner canvas is rendered at original pixel size, then CSS-scaled to fit the card
const scaledCanvasStyle = computed(() => ({
  width: board.value.canvasWidth + 'px',
  height: board.value.canvasHeight + 'px',
  transform: `scale(${scale.value})`,
  transformOrigin: 'top left',
}))

const canvasBgStyle = computed(() => {
  const bg = board.value.background || {}
  return {
    ...bg,
    position: 'absolute',
    inset: 0,
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

// Resize observer for dynamic scaling
let resizeObserver = null

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

    board.value = {
      canvasWidth: cw,
      canvasHeight: ch,
      background: data.storyboard_data.background || { background: '#ffffff' },
      items: data.storyboard_data.items || [],
      textElements: data.storyboard_data.textElements || [],
      stickers: data.storyboard_data.stickers || [],
      enableLinks: data.storyboard_data.enableLinks || false,
      showPrices: data.storyboard_data.showPrices || false
    }
    
    // Store product data in sessionStorage for items with links
    if (board.value.enableLinks) {
      board.value.items.forEach(item => {
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
    
    // Dynamic OG meta tags for Pinterest / social sharing
    const ogTags = {
      'og:title': `${data.title || 'Fashion Board'} — outfi.`,
      'og:description': `Fashion board by ${data.owner || 'a creator'} on outfi.ai — discover and share outfit inspiration.`,
      'og:url': `https://outfi.ai/share/${route.params.token}`,
      'og:site_name': 'Outfi',
      'og:type': 'article',
      'og:image': (data.storyboard_data.items?.[0]?.image_url) || 'https://outfi.ai/assets/outfi-og-banner.png',
      'og:image:width': String(cw),
      'og:image:height': String(ch),
      'twitter:card': 'summary_large_image',
      'twitter:title': `${data.title || 'Fashion Board'} — outfi.`,
      'twitter:image': (data.storyboard_data.items?.[0]?.image_url) || 'https://outfi.ai/assets/outfi-og-banner.png',
    }
    
    Object.entries(ogTags).forEach(([property, content]) => {
      const isOg = property.startsWith('og:')
      const attr = isOg ? 'property' : 'name'
      let tag = document.querySelector(`meta[${attr}="${property}"]`)
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute(attr, property)
        document.head.appendChild(tag)
      }
      tag.setAttribute('content', content)
    })

    // Setup scale tracking after DOM updates
    await nextTick()
    computeScale()
    if (wrapperRef.value) {
      resizeObserver = new ResizeObserver(() => computeScale())
      resizeObserver.observe(wrapperRef.value)
    }
    
  } catch (err) {
    if (err.response?.status === 404) {
      error.value = 'Share link not found'
    } else if (err.response?.status === 410) {
      error.value = 'This share link has expired'
    } else {
      error.value = 'Failed to load fashion board'
    }
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect()
})
</script>

<style scoped>
/* ============================================
   SHARED FASHION BOARD — White bg, iPhone card
   ============================================ */

/* Page fills entire viewport — clean white */
.shared-board-page {
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  background: #ffffff;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* ---- Loading ---- */
.loading-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: #999;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 2.5px solid #eee;
  border-top-color: #333;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ---- Error ---- */
.error-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  text-align: center;
  padding: 2rem;
  color: #666;
}

.error-container svg { color: #ff6b6b; opacity: 0.8; }
.error-container h2 { font-size: 1.3rem; color: #1a1a1a; margin: 0; font-weight: 600; }
.error-container p { color: #999; margin: 0; font-size: 0.9rem; }

.home-btn {
  margin-top: 0.75rem;
  padding: 0.65rem 1.5rem;
  background: #1a1a1a;
  color: #fff;
  border: none;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.home-btn:hover {
  background: #333;
}

/* ============================================
   BOARD WRAPPER — centers the card on white bg
   ============================================ */
.board-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #ffffff;
}

/* ============================================
   BOARD CARD — iPhone-style rounded container
   
   Very curved corners like an iPhone screen.
   Holds the scaled canvas inside. The card
   itself is sized to exactly match the canvas
   aspect ratio at the computed scale.
   ============================================ */
.board-card {
  position: relative;
  border-radius: 40px;
  overflow: hidden;
  background: #ffffff;
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.06),
    0 4px 20px rgba(0, 0, 0, 0.08),
    0 12px 48px rgba(0, 0, 0, 0.06);
}

/* ============================================
   BOARD CANVAS — rendered at original pixel
   size, then CSS transform-scaled to fit card.
   ============================================ */
.board-canvas {
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden;
  border-radius: inherit;
  will-change: transform;
}

/* Canvas background fills the canvas */
.canvas-bg {
  position: absolute;
  inset: 0;
  border-radius: inherit;
}

/* ---- Canvas Items (absolute pixel positioning) ---- */
.canvas-item {
  position: absolute;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: none;
  border: none;
  display: block;
  text-decoration: none;
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
  display: block;
}

/* Price Tag */
.price-tag {
  position: absolute;
  bottom: 6px;
  left: 6px;
  background: rgba(0, 0, 0, 0.78);
  color: #fff;
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 11px;
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

/* ============================================
   FLOATING UI — overlaid on top of canvas
   ============================================ */

/* Brand pill at bottom center */
.floating-brand {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
}

.brand-pill {
  display: inline-flex;
  align-items: center;
  padding: 6px 18px;
  background: rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 20px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.brand-pill:hover {
  background: rgba(0, 0, 0, 0.1);
  border-color: rgba(0, 0, 0, 0.15);
}

.brand-text {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.45);
  letter-spacing: 0.06em;
}

/* CTA button at top right */
.floating-cta {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 100;
  padding: 8px 18px;
  background: #1a1a1a;
  color: #fff;
  border: none;
  border-radius: 12px;
  text-decoration: none;
  font-size: 0.78rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
}

.floating-cta:hover {
  background: #333;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 480px) {
  .floating-cta {
    top: 10px;
    right: 10px;
    padding: 6px 12px;
    font-size: 0.7rem;
  }

  .floating-brand {
    bottom: 10px;
  }

  .brand-pill {
    padding: 4px 12px;
  }

  .brand-text {
    font-size: 0.75rem;
  }

  .board-card {
    border-radius: 28px;
  }
}
</style>
