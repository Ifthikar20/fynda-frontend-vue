<template>
  <div class="storyboard-page">
    <!-- Main NavBar -->
    <NavBar />
    
    <!-- Storyboard Toolbar -->
    <div class="storyboard-toolbar">
      <button class="back-btn" @click="goBack">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back
      </button>
      <h1 class="page-title">Fashion Board</h1>
      <div class="toolbar-actions">
        <button class="save-btn" @click="saveStoryboard">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
          </svg>
          Save
        </button>
        <button class="share-btn" @click="toggleShareDropdown">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          Share
        </button>
      </div>
    </div>

    <!-- Share Modal Popup -->
    <Teleport to="body">
      <div v-if="showShareDropdown" class="share-modal-overlay" @click.self="showShareDropdown = false">
        <div class="share-modal">
          <div class="share-modal-header">
            <h3>Share Your Fashion Board</h3>
            <button class="close-modal" @click="showShareDropdown = false">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="share-modal-body">
            <!-- Share Options Toggles -->
            <div class="share-options">
              <label class="share-toggle">
                <span class="toggle-label">Enable Product Links</span>
                <span class="toggle-desc">Viewers can click items to shop</span>
                <div class="toggle-switch" :class="{ active: shareWithLinks }" @click="shareWithLinks = !shareWithLinks; regenerateShareLink()">
                  <div class="toggle-knob"></div>
                </div>
              </label>
              <label class="share-toggle">
                <span class="toggle-label">Show Price Tags</span>
                <span class="toggle-desc">Display prices on each item</span>
                <div class="toggle-switch" :class="{ active: shareWithPrices }" @click="shareWithPrices = !shareWithPrices; regenerateShareLink()">
                  <div class="toggle-knob"></div>
                </div>
              </label>
            </div>

            <div v-if="shareLoading" class="share-loading">
              <div class="spinner-small"></div>
              <span>Generating your share link...</span>
            </div>
            <div v-else-if="currentShareUrl" class="share-link-section">
              <p class="share-label">Your shareable link:</p>
              <div class="share-link-container">
                <input 
                  type="text" 
                  :value="currentShareUrl" 
                  readonly 
                  class="share-link-input"
                  @click="$event.target.select()"
                />
                <button class="copy-link-btn" @click="copyShareLink">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  {{ linkCopied ? 'Copied!' : 'Copy Link' }}
                </button>
              </div>
              <p class="share-info">Anyone with this link can view your fashion board. Link expires in 30 days.</p>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <main class="main-content">
      <!-- Left: Creative Tools Panel -->
      <aside class="backgrounds-panel">
        <!-- Image Upload Section -->
        <h3 class="panel-title">Upload Image</h3>
        <label class="upload-zone">
          <input type="file" accept="image/*" @change="handleImageUpload" hidden />
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <span>Click to upload image</span>
        </label>
        
        <!-- Add Text Section -->
        <h3 class="panel-title mt">Add Text</h3>
        <div class="text-tools">
          <select v-model="selectedFont" class="font-select">
            <option v-for="font in classicalFonts" :key="font.value" :value="font.value">
              {{ font.name }}
            </option>
          </select>
          <div class="text-size-row">
            <input type="number" v-model="selectedFontSize" min="12" max="120" class="size-input" />
            <span>px</span>
          </div>
          <div class="text-colors">
            <div 
              v-for="tc in textColors" 
              :key="tc"
              class="text-color-btn"
              :class="{ active: selectedTextColor === tc }"
              :style="{ background: tc }"
              @click="selectedTextColor = tc"
            ></div>
          </div>
          <button class="add-text-btn" @click="addTextElement">+ Add Text</button>
        </div>
        
        <!-- Templates Section -->
        <h3 class="panel-title mt">Templates</h3>
        <div class="templates-grid">
          <div 
            v-for="template in layoutTemplates" 
            :key="template.id"
            class="template-card"
            @click="applyTemplate(template)"
          >
            <div class="template-preview" v-html="template.preview"></div>
            <span class="template-name">{{ template.name }}</span>
          </div>
        </div>
        
        <!-- Backgrounds Section -->
        <h3 class="panel-title mt">Backgrounds</h3>
        <div class="backgrounds-grid">
          <div 
            v-for="bg in backgrounds" 
            :key="bg.id"
            class="bg-card"
            :class="{ active: selectedBackground === bg.id }"
            @click="selectBackground(bg)"
          >
            <div class="bg-preview" :style="bg.style"></div>
            <span class="bg-name">{{ bg.name }}</span>
          </div>
        </div>
        
        <h3 class="panel-title mt">Textures</h3>
        <div class="textures-grid">
          <div 
            v-for="texture in textures" 
            :key="texture.id"
            class="texture-card"
            :class="{ active: selectedTexture === texture.id }"
            :style="texture.style"
            @click="selectTexture(texture)"
          >
            <span class="texture-name">{{ texture.name }}</span>
          </div>
        </div>
        
        <!-- Frames Section -->
        <h3 class="panel-title mt">Frames</h3>
        <div class="frames-grid">
          <div 
            v-for="frame in imageFrames" 
            :key="frame.id"
            class="frame-card"
            :class="{ active: selectedFrame === frame.id }"
            @click="selectFrame(frame.id)"
          >
            <div class="frame-preview" :class="'frame-' + frame.id"></div>
            <span class="frame-name">{{ frame.name }}</span>
          </div>
        </div>
        
        <!-- Fabric Swatches Section -->
        <h3 class="panel-title mt">Fabric Swatches</h3>
        <div class="swatches-grid">
          <div 
            v-for="swatch in stickers.filter(s => s.type === 'fabric')" 
            :key="swatch.id"
            class="swatch-card"
            :style="{ backgroundImage: 'url(' + swatch.image + ')', backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: swatch.color }"
            :title="swatch.name"
            @click="addSwatch(swatch)"
          >
            <span class="swatch-label">{{ swatch.name }}</span>
          </div>
        </div>
        
        <!-- Pantone Color Chips -->
        <h3 class="panel-title mt">{{ boardColors.length > 0 ? 'Board Colors' : 'Color Chips' }}</h3>
        <div class="pantone-grid">
          <!-- Dynamic colors extracted from board images -->
          <div 
            v-for="chip in boardColors" 
            :key="chip.id"
            class="pantone-card board-color"
            :title="chip.name"
            @click="addPantone(chip)"
          >
            <div class="pantone-color" :style="{ backgroundColor: chip.color }"></div>
            <div class="pantone-label">
              <span class="pantone-code">{{ chip.code }}</span>
            </div>
          </div>
          <!-- Static pantone chips -->
          <div 
            v-for="chip in stickers.filter(s => s.type === 'pantone')" 
            :key="chip.id"
            class="pantone-card"
            :title="chip.name"
            @click="addPantone(chip)"
          >
            <div class="pantone-color" :style="{ backgroundColor: chip.color }"></div>
            <div class="pantone-label">
              <span class="pantone-code">{{ chip.code }}</span>
            </div>
          </div>
        </div>
        
        <!-- Decorations Section -->
        <h3 class="panel-title mt">Decorations</h3>
        <div class="decorations-grid">
          <div 
            v-for="deco in decorations" 
            :key="deco.id"
            class="decoration-card"
            :title="deco.name"
            @click="addDecoration(deco)"
          >
            <div class="decoration-preview" v-html="deco.svg"></div>
          </div>
        </div>
      </aside>

      <!-- Center: Canvas -->
      <section class="canvas-section">
        <div 
          class="storyboard-canvas"
          :style="canvasStyle"
          ref="canvasRef"
          @dragover.prevent
          @drop="handleDrop"
        >
          <!-- Placed Items (Images/Products) -->
          <div
            v-for="item in canvasItems"
            :key="item.id"
            class="canvas-item"
            :class="[
              { selected: selectedItem === item.id },
              item.frame ? 'frame-' + item.frame : ''
            ]"
            :style="{
              left: item.x + 'px',
              top: item.y + 'px',
              width: item.width + 'px',
              height: item.height + 'px',
              zIndex: item.zIndex,
              transform: item.rotation ? `rotate(${item.rotation}deg)` : 'none'
            }"
            @mousedown="startDrag($event, item)"
          >
            <!-- Pin decoration -->
            <div v-if="item.showPin" class="item-pin"></div>
            <img :src="item.image_url" :alt="item.title" class="item-img" draggable="false" />
            
            <!-- Price Tag Overlay -->
            <span v-if="shareWithPrices && item.price" class="item-price-tag">
              ${{ formatPrice(item.price) }}
            </span>
            
            <!-- Product Link Badge -->
            <a v-if="shareWithLinks && (item.product_url || item.url)" 
               :href="item.product_url || item.url" 
               target="_blank" rel="noopener"
               class="item-link-badge"
               @mousedown.stop
               @click.stop
               title="Open product page"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
            
            <span class="item-remove" @mousedown.stop @click="removeItem(item.id)">×</span>
            <div class="resize-handle" @mousedown.stop="startResize($event, item)"></div>
            <!-- Remove Background Button (hidden after bg already removed) -->
            <button
              v-if="selectedItem === item.id && !item.removingBg && !item.bgRemoved"
              class="remove-bg-btn"
              @mousedown.stop
              @click.stop="removeBackground(item)"
              title="Remove background"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 5h14v14H5z" opacity="0.3"/>
                <path d="M12 3v18M3 12h18" stroke-dasharray="3 3"/>
              </svg>
              Remove BG
            </button>
            <!-- BG Removal Loading -->
            <div v-if="item.removingBg" class="bg-removal-loading">
              <div class="spinner-small"></div>
              <span>Removing...</span>
            </div>
          </div>
          
          <!-- Text Elements -->
          <div
            v-for="text in textElements"
            :key="text.id"
            class="canvas-text"
            :class="{ selected: selectedItem === text.id }"
            :style="{
              left: text.x + 'px',
              top: text.y + 'px',
              fontFamily: text.fontFamily,
              fontSize: text.fontSize + 'px',
              color: text.color,
              zIndex: text.zIndex,
              fontWeight: text.fontWeight || 'normal',
              fontStyle: text.fontStyle || 'normal',
              letterSpacing: text.letterSpacing || '0px'
            }"
            @mousedown="startDragText($event, text)"
            @dblclick="editText(text)"
          >
            <span v-if="!text.editing">{{ text.content }}</span>
            <input 
              v-else
              v-model="text.content"
              class="text-edit-input"
              :style="{ fontFamily: text.fontFamily, fontSize: text.fontSize + 'px' }"
              @blur="finishEditText(text)"
              @keyup.enter="finishEditText(text)"
              ref="textInputRef"
            />
            <span class="item-remove" @mousedown.stop @click="removeTextElement(text.id)">×</span>
          </div>
          
          <!-- Fabric Swatches and Color Chips on Canvas -->
          <div
            v-for="swatch in canvasStickers"
            :key="swatch.id"
            class="canvas-swatch"
            :class="[
              { selected: selectedItem === swatch.id },
              swatch.type === 'pantone' ? 'pantone-swatch' : ''
            ]"
            :style="{
              left: swatch.x + 'px',
              top: swatch.y + 'px',
              width: swatch.width + 'px',
              height: swatch.height + 'px',
              backgroundColor: swatch.color,
              backgroundImage: swatch.image ? 'url(' + swatch.image + ')' : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              zIndex: swatch.zIndex,
              transform: `rotate(${swatch.rotation || 0}deg)`
            }"
            @mousedown="startDragSticker($event, swatch)"
          >
            <div v-if="swatch.type === 'fabric'" class="swatch-edge"></div>
            <div v-if="swatch.type === 'pantone'" class="pantone-chip-label">
              <span>{{ swatch.code }}</span>
            </div>
            <span class="item-remove" @mousedown.stop @click="removeSticker(swatch.id)">×</span>
          </div>

          <!-- Decorations on Canvas -->
          <div
            v-for="deco in canvasDecorations"
            :key="deco.id"
            class="canvas-decoration"
            :class="{ selected: selectedItem === deco.id }"
            :style="{
              left: deco.x + 'px',
              top: deco.y + 'px',
              width: deco.width + 'px',
              height: deco.height + 'px',
              zIndex: deco.zIndex,
              transform: `rotate(${deco.rotation || 0}deg)`
            }"
            @mousedown="startDragDecoration($event, deco)"
          >
            <div class="decoration-svg" v-html="deco.svg"></div>
            <span class="item-remove" @mousedown.stop @click="removeDecoration(deco.id)">×</span>
            <div class="resize-handle" @mousedown.stop="startResizeDecoration($event, deco)"></div>
            <div class="rotate-handle" @mousedown.stop="startRotateDecoration($event, deco)">↻</div>
          </div>

          <!-- Empty State -->
          <div v-if="canvasItems.length === 0 && textElements.length === 0 && canvasStickers.length === 0 && canvasDecorations.length === 0" class="canvas-empty">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M12 8v8M8 12h8"/>
            </svg>
            <p>Drag products or upload images</p>
            <span>Add text, stickers, and frames</span>
          </div>
        </div>

        <!-- Aspect Ratio Options -->
        <div class="aspect-options">
          <button 
            v-for="ratio in aspectRatios" 
            :key="ratio.name"
            :class="{ active: selectedRatio === ratio.name }"
            @click="setAspectRatio(ratio)"
          >
            {{ ratio.label }}
          </button>
        </div>
      </section>

      <!-- Right: Products Panel -->
      <aside class="products-panel">
        <h3 class="panel-title">Add Products</h3>
        
        <!-- Closet / Search Tabs -->
        <div class="pp-tabs">
          <button class="pp-tab" :class="{ active: productsTab === 'closet' }" @click="productsTab = 'closet'; loadClosetItems()">Closet</button>
          <button class="pp-tab" :class="{ active: productsTab === 'search' }" @click="productsTab = 'search'">Search</button>
        </div>

        <!-- CLOSET TAB -->
        <template v-if="productsTab === 'closet'">
          <div v-if="closetItems.length === 0" class="pp-empty">
            <p>Your closet is empty</p>
            <router-link to="/closet" class="pp-link">Go to Closet</router-link>
          </div>
          <div v-else class="products-grid">
            <div 
              v-for="item in closetItems" 
              :key="'closet-' + item.id"
              class="product-card"
              draggable="true"
              @dragstart="handleDragStart($event, item)"
              @click="addToCanvas(item)"
              :title="item.title"
            >
              <img :src="item.image_url" :alt="item.title" />
              <span v-if="item.price" class="product-price">${{ formatPrice(item.price) }}</span>
            </div>
          </div>
        </template>

        <!-- SEARCH TAB -->
        <template v-if="productsTab === 'search'">
          <div class="search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input 
              type="text" 
              v-model="searchQuery"
              @keyup.enter="searchProducts"
              placeholder="Search products..."
            />
          </div>

          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
          </div>

          <div v-else class="products-grid">
            <div 
              v-for="product in products" 
              :key="product.id"
              class="product-card"
              draggable="true"
              @dragstart="handleDragStart($event, product)"
              @click="addToCanvas(product)"
            >
              <img :src="product.image_url" :alt="product.title" />
              <span class="product-price">${{ formatPrice(product.price) }}</span>
            </div>
          </div>
        </template>
      </aside>
    </main>
    
    <!-- Notification Toast -->
    <transition name="toast">
      <div v-if="notification.show" class="notification-toast">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        {{ notification.message }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../stores/authStore'
import api from '../utils/api'
import NavBar from './NavBar.vue'
import { removeBackground as removeBgLib } from '@imgly/background-removal'

const router = useRouter()
const route = useRoute()
const { isAuthenticated } = useAuth()

const canvasRef = ref(null)

// Background options - Fashion-worthy sophisticated backgrounds
const backgrounds = ref([
  // Elegant Neutrals
  { id: 'ivory', name: 'Ivory', style: { background: '#FFFFF0' } },
  { id: 'champagne', name: 'Champagne', style: { background: '#F7E7CE' } },
  { id: 'charcoal', name: 'Charcoal', style: { background: '#36454F' } },
  { id: 'slate', name: 'Slate', style: { background: '#708090' } },
  // Editorial Gradients
  { id: 'editorial-cream', name: 'Editorial', style: { background: 'linear-gradient(180deg, #fdfbf7 0%, #f5ebe0 50%, #e8dcc8 100%)' } },
  { id: 'vogue', name: 'Vogue', style: { background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)' } },
  { id: 'runway', name: 'Runway', style: { background: 'linear-gradient(180deg, #ffffff 0%, #f8f8f8 40%, #e8e8e8 100%)' } },
  { id: 'maison', name: 'Maison', style: { background: 'linear-gradient(135deg, #f5f1eb 0%, #e8e0d5 50%, #ddd5c8 100%)' } },
  // Premium Colors
  { id: 'midnight', name: 'Midnight', style: { background: '#191970' } },
  { id: 'burgundy', name: 'Burgundy', style: { background: '#722F37' } },
  { id: 'hunter', name: 'Hunter', style: { background: '#355E3B' } },
  { id: 'taupe', name: 'Taupe', style: { background: '#8B8589' } },
])

// Texture backgrounds - CSS-generated patterns
const textures = ref([
  { 
    id: 'texture-linen', 
    name: 'Linen', 
    style: { 
      background: `#f5f5f0`,
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'%3E%3Cpath fill='%23d4d4d0' fill-opacity='0.4' d='M1 3h1v1H1V3zm2-2h1v1H3V1z'%3E%3C/path%3E%3C/svg%3E")`
    } 
  },
  { 
    id: 'texture-paper', 
    name: 'Paper', 
    style: { 
      background: `#faf8f5`,
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23e5e3df' fill-opacity='0.3'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3Cpath d='M6 5V0H5v5H0v1h5v94h1V6h94V5H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
    } 
  },
  { 
    id: 'texture-canvas', 
    name: 'Canvas', 
    style: { 
      background: `#f0ebe3`,
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23c9c4b8' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M5 0h1L0 6V5zM6 5v1H5z'/%3E%3C/g%3E%3C/svg%3E")`
    } 
  },
  { 
    id: 'texture-denim', 
    name: 'Denim', 
    style: { 
      background: `#4a6fa5`,
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'%3E%3Cpath fill='%233d5a87' fill-opacity='0.5' d='M1 3h1v1H1V3zm2-2h1v1H3V1z'%3E%3C/path%3E%3C/svg%3E")`
    } 
  },
  { 
    id: 'texture-cork', 
    name: 'Cork', 
    style: { 
      background: `#d4a574`,
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23c49561' fill-opacity='0.4'%3E%3Cpath d='M0 0h10v10H0V0zm10 10h10v10H10V10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
    } 
  },
  { 
    id: 'texture-grid', 
    name: 'Grid', 
    style: { 
      background: `#ffffff`,
      backgroundImage: `linear-gradient(#e5e5e5 1px, transparent 1px), linear-gradient(90deg, #e5e5e5 1px, transparent 1px)`,
      backgroundSize: `20px 20px`
    } 
  },
  { 
    id: 'texture-dots', 
    name: 'Dots', 
    style: { 
      background: `#fafafa`,
      backgroundImage: `radial-gradient(#ccc 1px, transparent 1px)`,
      backgroundSize: `16px 16px`
    } 
  },
  { 
    id: 'texture-marble', 
    name: 'Marble', 
    style: { 
      background: `linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 25%, #f0f0f0 50%, #e5e5e5 75%, #f8f8f8 100%)`
    } 
  },
])

// Image Frames - retro and decorative
const imageFrames = ref([
  { id: 'none', name: 'None' },
  { id: 'polaroid', name: 'Polaroid' },
  { id: 'vintage', name: 'Vintage' },
  { id: 'film', name: 'Film Strip' },
  { id: 'tape', name: 'Tape' },
  { id: 'shadow', name: 'Shadow' },
])

const selectedFrame = ref('none')

// Fabric swatches and Pantone color chips for mood boards
const stickers = ref([
  // Fabric Swatches with real texture photos
  { id: 'f1', type: 'fabric', name: 'Linen Natural', color: '#e8e0d5', texture: 'linen', image: 'https://images.unsplash.com/photo-1528459105426-b9548367069b?w=200&q=80&fit=crop' },
  { id: 'f2', type: 'fabric', name: 'Denim Blue', color: '#4a6fa5', texture: 'denim', image: 'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=200&q=80&fit=crop' },
  { id: 'f3', type: 'fabric', name: 'Tweed Gray', color: '#6b7280', texture: 'tweed', image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=200&q=80&fit=crop' },
  { id: 'f4', type: 'fabric', name: 'Silk Cream', color: '#faf6f0', texture: 'silk', image: 'https://images.unsplash.com/photo-1553531384-397c80973a0b?w=200&q=80&fit=crop' },
  { id: 'f5', type: 'fabric', name: 'Velvet Navy', color: '#1e3a5f', texture: 'velvet', image: 'https://images.unsplash.com/photo-1618220048045-10a6dbdf83e0?w=200&q=80&fit=crop' },
  { id: 'f6', type: 'fabric', name: 'Wool Camel', color: '#c9a86c', texture: 'wool', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=200&q=80&fit=crop' },
  { id: 'f7', type: 'fabric', name: 'Leather Brown', color: '#8B4513', texture: 'leather', image: 'https://images.unsplash.com/photo-1531310197839-ccf54634509e?w=200&q=80&fit=crop' },
  { id: 'f8', type: 'fabric', name: 'Cotton White', color: '#f5f5f5', texture: 'cotton', image: 'https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?w=200&q=80&fit=crop' },
  // Pantone Color Chips
  { id: 'p1', type: 'pantone', name: 'Cool Gray', color: '#8b8b8b', code: '423 C' },
  { id: 'p2', type: 'pantone', name: 'Coral', color: '#ff6f61', code: '16-1546' },
  { id: 'p3', type: 'pantone', name: 'Soft Blue', color: '#89abe3', code: '15-4020' },
  { id: 'p4', type: 'pantone', name: 'Sage', color: '#9caf88', code: '15-6317' },
  { id: 'p5', type: 'pantone', name: 'Butter', color: '#f5e1a4', code: '12-0752' },
  { id: 'p6', type: 'pantone', name: 'Blush', color: '#e8b4b8', code: '14-1714' },
])

// Decorative elements - realistic detailed stickers
const decorations = ref([
  // Realistic Flowers
  { id: 'd1', type: 'decoration', name: 'Rose', category: 'flower', 
    svg: '<svg viewBox="0 0 50 70"><defs><radialGradient id="roseG" cx="50%" cy="40%"><stop offset="0%" stop-color="#f2a0a8"/><stop offset="60%" stop-color="#e85d75"/><stop offset="100%" stop-color="#c73e5a"/></radialGradient></defs><path d="M25 8 C20 2 12 4 10 12 C8 20 16 24 22 20 C18 28 10 26 8 18 C4 24 8 32 18 30 C12 36 6 32 6 24 C2 30 6 38 16 38 C10 42 4 38 4 30" fill="url(#roseG)" opacity="0.9"/><circle cx="25" cy="18" r="10" fill="url(#roseG)"/><path d="M25 28 Q24 35 23 42 Q22 50 24 60" stroke="#4a7a3f" stroke-width="2.5" fill="none"/><path d="M24 38 Q18 34 14 38 Q18 40 24 38" fill="#5a8a4f"/><path d="M25 45 Q30 40 34 43 Q30 46 25 45" fill="#5a8a4f"/></svg>' },
  { id: 'd2', type: 'decoration', name: 'Peony', category: 'flower',
    svg: '<svg viewBox="0 0 55 70"><defs><radialGradient id="peonyG" cx="50%" cy="40%"><stop offset="0%" stop-color="#fde7ef"/><stop offset="50%" stop-color="#f5b5c8"/><stop offset="100%" stop-color="#e88aa5"/></radialGradient></defs><ellipse cx="28" cy="22" rx="18" ry="16" fill="url(#peonyG)"/><ellipse cx="20" cy="18" rx="12" ry="10" fill="#f5c0d0" opacity="0.7"/><ellipse cx="35" cy="18" rx="10" ry="9" fill="#f5c0d0" opacity="0.6"/><ellipse cx="28" cy="12" rx="8" ry="7" fill="#fde7ef" opacity="0.8"/><circle cx="28" cy="20" r="5" fill="#f0a0b5"/><path d="M28 34 L28 62" stroke="#5a7a4f" stroke-width="2.5" fill="none"/><path d="M28 42 Q22 38 18 42" stroke="#5a7a4f" stroke-width="1.5" fill="none"/></svg>' },
  { id: 'd3', type: 'decoration', name: 'Eucalyptus', category: 'flower',
    svg: '<svg viewBox="0 0 40 80"><path d="M20 5 Q19 20 18 40 Q17 55 20 75" stroke="#6b8a5e" stroke-width="2" fill="none"/><ellipse cx="14" cy="12" rx="6" ry="9" fill="#8aad7a" transform="rotate(-20 14 12)" opacity="0.85"/><ellipse cx="26" cy="20" rx="6" ry="9" fill="#7da06d" transform="rotate(15 26 20)" opacity="0.85"/><ellipse cx="13" cy="30" rx="6" ry="9" fill="#8aad7a" transform="rotate(-15 13 30)" opacity="0.8"/><ellipse cx="27" cy="40" rx="6" ry="8" fill="#7da06d" transform="rotate(18 27 40)" opacity="0.8"/><ellipse cx="15" cy="50" rx="5" ry="8" fill="#8aad7a" transform="rotate(-12 15 50)" opacity="0.75"/><ellipse cx="25" cy="58" rx="5" ry="7" fill="#7da06d" transform="rotate(10 25 58)" opacity="0.75"/></svg>' },
  { id: 'd4', type: 'decoration', name: 'Cherry Blossom', category: 'flower',
    svg: '<svg viewBox="0 0 50 65"><path d="M25 30 Q22 40 20 55" stroke="#8b6b5a" stroke-width="2" fill="none"/><path d="M22 38 Q15 35 12 30" stroke="#8b6b5a" stroke-width="1.5" fill="none"/><g transform="translate(25,15)"><circle r="3" fill="#f5c6d0"/><ellipse cx="0" cy="-8" rx="4" ry="6" fill="#fad0d8"/><ellipse cx="7" cy="-3" rx="4" ry="6" fill="#f5b8c8" transform="rotate(72)"/><ellipse cx="5" cy="6" rx="4" ry="6" fill="#fad0d8" transform="rotate(144)"/><ellipse cx="-5" cy="6" rx="4" ry="6" fill="#f5b8c8" transform="rotate(216)"/><ellipse cx="-7" cy="-3" rx="4" ry="6" fill="#fad0d8" transform="rotate(288)"/></g><g transform="translate(12,28) scale(0.6)"><circle r="2" fill="#f5c6d0"/><ellipse cx="0" cy="-6" rx="3" ry="5" fill="#fad0d8"/><ellipse cx="5" cy="-2" rx="3" ry="5" fill="#f5b8c8" transform="rotate(72)"/><ellipse cx="4" cy="4" rx="3" ry="5" fill="#fad0d8" transform="rotate(144)"/><ellipse cx="-4" cy="4" rx="3" ry="5" fill="#f5b8c8" transform="rotate(216)"/><ellipse cx="-5" cy="-2" rx="3" ry="5" fill="#fad0d8" transform="rotate(288)"/></g></svg>' },
  { id: 'd5', type: 'decoration', name: 'Pampas Grass', category: 'flower',
    svg: '<svg viewBox="0 0 40 80"><path d="M20 30 Q19 45 20 75" stroke="#c9b896" stroke-width="2" fill="none"/><path d="M20 8 Q18 15 16 25 Q14 18 12 12 Q15 6 20 8" fill="#e8d8c0" opacity="0.9"/><path d="M20 8 Q22 15 24 25 Q26 18 28 12 Q25 6 20 8" fill="#ddd0b8" opacity="0.85"/><path d="M20 5 Q17 12 14 20 Q11 14 10 8 Q14 3 20 5" fill="#f0e4d0" opacity="0.8"/><path d="M20 5 Q23 12 26 20 Q29 14 30 8 Q26 3 20 5" fill="#e8dcc8" opacity="0.78"/><path d="M20 3 Q16 8 15 15" stroke="#d4c4a8" stroke-width="0.8" fill="none"/><path d="M20 3 Q24 8 25 15" stroke="#d4c4a8" stroke-width="0.8" fill="none"/></svg>' },
  { id: 'd6', type: 'decoration', name: 'Wildflower', category: 'flower',
    svg: '<svg viewBox="0 0 35 65"><path d="M18 25 Q17 35 16 55" stroke="#5a7a4f" stroke-width="1.8" fill="none"/><path d="M17 35 Q12 32 9 35" stroke="#5a7a4f" stroke-width="1" fill="none"/><g transform="translate(18,12)"><circle r="4" fill="#f4d03f"/><ellipse cx="0" cy="-7" rx="3" ry="5" fill="#fff"/><ellipse cx="6" cy="-2" rx="3" ry="5" fill="#fff" transform="rotate(72)"/><ellipse cx="4" cy="5" rx="3" ry="5" fill="#fff" transform="rotate(144)"/><ellipse cx="-4" cy="5" rx="3" ry="5" fill="#fff" transform="rotate(216)"/><ellipse cx="-6" cy="-2" rx="3" ry="5" fill="#fff" transform="rotate(288)"/></g></svg>' },
  // Fashion Elements
  { id: 'd7', type: 'decoration', name: 'Scissors', category: 'fashion',
    svg: '<svg viewBox="0 0 50 50"><defs><linearGradient id="steelG" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#d0d0d0"/><stop offset="50%" stop-color="#a0a0a0"/><stop offset="100%" stop-color="#808080"/></linearGradient></defs><ellipse cx="12" cy="38" rx="8" ry="10" fill="none" stroke="url(#steelG)" stroke-width="2.5"/><ellipse cx="38" cy="38" rx="8" ry="10" fill="none" stroke="url(#steelG)" stroke-width="2.5"/><path d="M16 30 L28 10" stroke="url(#steelG)" stroke-width="3" stroke-linecap="round"/><path d="M34 30 L22 10" stroke="url(#steelG)" stroke-width="3" stroke-linecap="round"/><circle cx="25" cy="20" r="2" fill="#888"/></svg>' },
  { id: 'd8', type: 'decoration', name: 'Thread Spool', category: 'fashion',
    svg: '<svg viewBox="0 0 40 50"><defs><linearGradient id="spoolG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e8c9a0"/><stop offset="100%" stop-color="#c4a070"/></linearGradient></defs><ellipse cx="20" cy="8" rx="14" ry="6" fill="url(#spoolG)"/><rect x="6" y="8" width="28" height="28" fill="url(#spoolG)"/><ellipse cx="20" cy="36" rx="14" ry="6" fill="#b8905a"/><rect x="8" y="12" width="24" height="20" rx="2" fill="#e06070"/><path d="M8 16 L32 16 M8 20 L32 20 M8 24 L32 24 M8 28 L32 28" stroke="#c84858" stroke-width="0.8"/><path d="M20 8 Q35 12 32 20" stroke="#e06070" stroke-width="1" fill="none"/></svg>' },
  { id: 'd9', type: 'decoration', name: 'Hanger', category: 'fashion',
    svg: '<svg viewBox="0 0 60 45"><path d="M30 5 Q30 0 30 5" stroke="#888" stroke-width="2"/><circle cx="30" cy="5" r="3" fill="none" stroke="#999" stroke-width="2"/><path d="M30 8 L5 30 Q2 32 5 34 L30 34 L55 34 Q58 32 55 30 Z" fill="none" stroke="#aaa" stroke-width="2.5" stroke-linejoin="round"/><path d="M5 34 L55 34" stroke="#999" stroke-width="2"/></svg>' },
  { id: 'd10', type: 'decoration', name: 'Bow Ribbon', category: 'fashion',
    svg: '<svg viewBox="0 0 60 40"><path d="M30 20 Q15 5 5 10 Q0 15 10 20 Q0 25 5 30 Q15 35 30 20" fill="#e8a0b0" stroke="#d08090" stroke-width="1"/><path d="M30 20 Q45 5 55 10 Q60 15 50 20 Q60 25 55 30 Q45 35 30 20" fill="#e8a0b0" stroke="#d08090" stroke-width="1"/><circle cx="30" cy="20" r="4" fill="#d08090"/><path d="M26 22 Q28 35 26 40" stroke="#d08090" stroke-width="2" fill="none"/><path d="M34 22 Q32 35 34 40" stroke="#d08090" stroke-width="2" fill="none"/></svg>' },
  // Sticky Notes (improved with shadow and lines)
  { id: 'd11', type: 'decoration', name: 'Yellow Note', category: 'note',
    svg: '<svg viewBox="0 0 65 65"><defs><filter id="noteSh"><feDropShadow dx="1" dy="2" stdDeviation="2" flood-opacity="0.15"/></filter></defs><path d="M2 2 L63 0 L63 52 L50 63 L0 63 Z" fill="#fff9c4" filter="url(#noteSh)"/><path d="M50 63 L50 50 L63 52" fill="#f0e68c"/><path d="M8 18 L50 18 M8 28 L45 28 M8 38 L48 38 M8 48 L35 48" stroke="#e0d8a0" stroke-width="0.5"/></svg>' },
  { id: 'd12', type: 'decoration', name: 'Pink Note', category: 'note',
    svg: '<svg viewBox="0 0 65 65"><defs><filter id="noteSh2"><feDropShadow dx="1" dy="2" stdDeviation="2" flood-opacity="0.15"/></filter></defs><path d="M2 2 L63 0 L63 52 L50 63 L0 63 Z" fill="#ffe0e8" filter="url(#noteSh2)"/><path d="M50 63 L50 50 L63 52" fill="#f5b8c8"/><path d="M8 18 L50 18 M8 28 L45 28 M8 38 L48 38 M8 48 L35 48" stroke="#e8b0c0" stroke-width="0.5"/></svg>' },
  // Tags (improved with string detail)
  { id: 'd13', type: 'decoration', name: 'Kraft Tag', category: 'tag',
    svg: '<svg viewBox="0 0 42 65"><defs><filter id="tagSh"><feDropShadow dx="1" dy="1" stdDeviation="1.5" flood-opacity="0.12"/></filter></defs><path d="M5 15 L21 0 L37 15 L37 57 Q37 62 32 62 L10 62 Q5 62 5 57 Z" fill="#d4c4a8" filter="url(#tagSh)"/><path d="M7 17 L21 3 L35 17" fill="#c4b498" opacity="0.5"/><circle cx="21" cy="12" r="4" fill="none" stroke="#8b7355" stroke-width="1.8"/><path d="M19 8 Q21 2 26 6" stroke="#a08060" stroke-width="1.2" fill="none"/><path d="M10 30 L32 30 M10 38 L28 38 M10 46 L30 46" stroke="#b8a888" stroke-width="0.5"/></svg>' },
  { id: 'd14', type: 'decoration', name: 'Black Tag', category: 'tag',
    svg: '<svg viewBox="0 0 42 65"><path d="M5 15 L21 0 L37 15 L37 57 Q37 62 32 62 L10 62 Q5 62 5 57 Z" fill="#2a2a2a"/><circle cx="21" cy="12" r="4" fill="none" stroke="#555" stroke-width="1.5"/><path d="M19 8 Q21 2 26 6" stroke="#666" stroke-width="1" fill="none"/><path d="M10 30 L32 30 M10 38 L28 38" stroke="#444" stroke-width="0.5"/></svg>' },
  // Pins and Clips (improved)
  { id: 'd15', type: 'decoration', name: 'Push Pin', category: 'pin',
    svg: '<svg viewBox="0 0 24 30"><defs><radialGradient id="pushPinG" cx="40%" cy="30%"><stop offset="0%" stop-color="#ff6b6b"/><stop offset="100%" stop-color="#c0392b"/></radialGradient></defs><circle cx="12" cy="10" r="8" fill="url(#pushPinG)"/><circle cx="10" cy="8" r="2" fill="rgba(255,255,255,0.35)"/><path d="M12 18 L12 28" stroke="#888" stroke-width="1.5" stroke-linecap="round"/></svg>' },
  { id: 'd16', type: 'decoration', name: 'Paper Clip', category: 'pin',
    svg: '<svg viewBox="0 0 20 45"><path d="M6 5 Q6 2 10 2 Q14 2 14 5 L14 35 Q14 40 10 40 Q6 40 6 35 L6 12 Q6 9 10 9 Q14 9 14 12 L14 30" fill="none" stroke="#c0c0c0" stroke-width="2" stroke-linecap="round"/></svg>' },
  // Tape (improved)
  { id: 'd17', type: 'decoration', name: 'Washi Tape', category: 'tape',
    svg: '<svg viewBox="0 0 90 26"><defs><pattern id="washiP" x="0" y="0" width="10" height="26" patternUnits="userSpaceOnUse"><rect width="5" height="26" fill="#f5e0c8" opacity="0.6"/><rect x="5" width="5" height="26" fill="#f0d4b0" opacity="0.6"/></pattern></defs><rect x="0" y="0" width="90" height="26" fill="url(#washiP)" rx="1"/><path d="M0 0 L3 2 L0 4 L3 6 L0 8 L3 10 L0 12 L3 14 L0 16 L3 18 L0 20 L3 22 L0 24 L0 26" stroke="none" fill="rgba(0,0,0,0.05)"/><path d="M90 0 L87 2 L90 4 L87 6 L90 8 L87 10 L90 12 L87 14 L90 16 L87 18 L90 20 L87 22 L90 24 L90 26" stroke="none" fill="rgba(0,0,0,0.05)"/></svg>' },
  { id: 'd18', type: 'decoration', name: 'Masking Tape', category: 'tape',
    svg: '<svg viewBox="0 0 90 22"><rect x="0" y="0" width="90" height="22" fill="#e8dcc8" opacity="0.82" rx="1"/><path d="M0 0 L2 1 L0 3 L2 4 L0 6 L2 7 L0 9 L2 10 L0 12 L2 13 L0 15 L2 16 L0 18 L2 19 L0 21 L0 22" fill="rgba(0,0,0,0.04)"/></svg>' },
  // Nature/Mood
  { id: 'd19', type: 'decoration', name: 'Butterfly', category: 'nature',
    svg: '<svg viewBox="0 0 50 40"><path d="M25 20 Q15 5 5 10 Q0 18 10 22 Q5 28 8 35 Q15 38 25 20" fill="#c8a8e0" opacity="0.85"/><path d="M25 20 Q35 5 45 10 Q50 18 40 22 Q45 28 42 35 Q35 38 25 20" fill="#b898d0" opacity="0.85"/><path d="M25 10 L25 35" stroke="#6a5a7a" stroke-width="1.5"/><path d="M24 10 Q20 5 18 3" stroke="#6a5a7a" stroke-width="0.8" fill="none"/><path d="M26 10 Q30 5 32 3" stroke="#6a5a7a" stroke-width="0.8" fill="none"/><circle cx="15" cy="15" r="3" fill="#a080c0" opacity="0.5"/><circle cx="35" cy="15" r="3" fill="#9070b0" opacity="0.5"/></svg>' },
  { id: 'd20', type: 'decoration', name: 'Feather', category: 'nature',
    svg: '<svg viewBox="0 0 25 70"><path d="M12 5 Q10 20 8 35 Q6 50 12 65" stroke="#8b7355" stroke-width="1" fill="none"/><path d="M12 5 Q8 10 5 18 Q3 25 6 30 Q8 25 12 20" fill="#c4a882" opacity="0.7"/><path d="M12 5 Q16 10 19 18 Q21 25 18 30 Q16 25 12 20" fill="#b89870" opacity="0.7"/><path d="M12 20 Q7 28 5 35 Q4 40 7 44 Q9 38 12 32" fill="#c4a882" opacity="0.6"/><path d="M12 20 Q17 28 19 35 Q20 40 17 44 Q15 38 12 32" fill="#b89870" opacity="0.6"/></svg>' },
])

// Canvas decorations state
const canvasDecorations = ref([])

// Canvas stickers state
const canvasStickers = ref([])

const aspectRatios = [
  { name: 'landscape', label: '16:9', width: 1400, height: 788 },
  { name: 'square', label: '1:1', width: 1000, height: 1000 },
  { name: 'portrait', label: '4:5', width: 820, height: 1025 },
  { name: 'story', label: '9:16', width: 580, height: 1031 },
]

// Classical Fonts
const classicalFonts = [
  { name: 'Playfair Display', value: "'Playfair Display', Georgia, serif" },
  { name: 'Cormorant Garamond', value: "'Cormorant Garamond', Garamond, serif" },
  { name: 'Libre Baskerville', value: "'Libre Baskerville', Baskerville, serif" },
  { name: 'Cinzel', value: "'Cinzel', 'Times New Roman', serif" },
  { name: 'EB Garamond', value: "'EB Garamond', Garamond, serif" },
  { name: 'Bodoni Moda', value: "'Bodoni Moda', Didot, serif" },
  { name: 'Lora', value: "'Lora', Georgia, serif" },
  { name: 'Crimson Text', value: "'Crimson Text', Georgia, serif" },
]

// Text colors
const textColors = ['#000000', '#ffffff', '#333333', '#666666', '#8b4513', '#2c3e50', '#7f8c8d', '#c0392b']

// Layout Templates
const layoutTemplates = [
  {
    id: 'mood-board',
    name: 'Mood Board',
    preview: '<div style="display:grid;grid-template-columns:1fr 1fr;gap:2px;height:100%;"><div style="background:#e0e0e0;"></div><div style="background:#d0d0d0;"></div><div style="background:#c0c0c0;"></div><div style="background:#b0b0b0;"></div></div>',
    items: [
      { x: 15, y: 15, width: 250, height: 180 },
      { x: 280, y: 15, width: 250, height: 85 },
      { x: 280, y: 110, width: 250, height: 85 },
      { x: 15, y: 210, width: 250, height: 180 },
    ],
    texts: [
      { x: 280, y: 220, content: 'COLLECTION', fontSize: 24 },
      { x: 280, y: 260, content: 'Spring/Summer', fontSize: 16 }
    ]
  },
  {
    id: 'lookbook',
    name: 'Lookbook',
    preview: '<div style="height:100%;display:flex;flex-direction:column;gap:2px;"><div style="flex:2;background:#e0e0e0;"></div><div style="flex:1;display:flex;gap:2px;"><div style="flex:1;background:#c0c0c0;"></div><div style="flex:1;background:#d0d0d0;"></div></div></div>',
    items: [
      { x: 60, y: 15, width: 420, height: 240 },
      { x: 60, y: 270, width: 200, height: 120 },
      { x: 280, y: 270, width: 200, height: 120 },
    ],
    texts: [
      { x: 540, y: 360, content: 'LOOK 01', fontSize: 14 }
    ]
  },
  {
    id: 'editorial',
    name: 'Editorial',
    preview: '<div style="height:100%;display:flex;gap:2px;"><div style="flex:1;background:#d0d0d0;"></div><div style="flex:1;display:flex;flex-direction:column;gap:2px;"><div style="flex:1;background:#e0e0e0;"></div><div style="flex:1;background:#c0c0c0;"></div></div></div>',
    items: [
      { x: 15, y: 30, width: 280, height: 350 },
      { x: 310, y: 30, width: 250, height: 170 },
      { x: 310, y: 210, width: 250, height: 170 },
    ],
    texts: [
      { x: 310, y: 10, content: 'TREND REPORT', fontSize: 18 }
    ]
  },
  {
    id: 'minimal',
    name: 'Minimal',
    preview: '<div style="height:100%;display:flex;align-items:center;justify-content:center;"><div style="width:60%;height:70%;background:#e0e0e0;"></div></div>',
    items: [
      { x: 160, y: 40, width: 300, height: 280 },
    ],
    texts: [
      { x: 160, y: 340, content: 'Title Here', fontSize: 22 },
      { x: 160, y: 375, content: 'Subtitle description', fontSize: 14 }
    ]
  },
]

// State
const selectedBackground = ref('ivory')
const selectedBackgroundStyle = ref({ background: '#FFFFF0' })
const selectedRatio = ref('landscape')
const canvasWidth = ref(1400)
const canvasHeight = ref(788)
const canvasItems = ref([])
const textElements = ref([])
const selectedItem = ref(null)
const searchQuery = ref('')
const products = ref([])
const loading = ref(false)

// Products panel tabs
const productsTab = ref('closet')
const closetItems = ref([])

const loadClosetItems = () => {
  try {
    closetItems.value = JSON.parse(localStorage.getItem('fyndaCloset') || '[]')
  } catch (e) {
    closetItems.value = []
  }
}
const selectedTexture = ref(null)
const selectedTextureStyle = ref({})

// Text tool state
const selectedFont = ref(classicalFonts[0].value)
const selectedFontSize = ref(32)
const selectedTextColor = ref('#000000')
const textInputRef = ref(null)

// Drag state
let dragOffset = { x: 0, y: 0 }
let isResizing = false
let resizingItem = null
let draggingItem = null
let draggingTextItem = null

// Computed — layer texture on top of background color
const canvasStyle = computed(() => {
  const base = { ...selectedBackgroundStyle.value }
  const tex = selectedTextureStyle.value
  
  // If a texture is active, overlay its backgroundImage on the current color
  if (tex.backgroundImage) {
    // Keep the chosen color as backgroundColor, layer texture on top
    const bgColor = base.background || '#FFFFF0'
    return {
      backgroundColor: bgColor,
      backgroundImage: tex.backgroundImage,
      backgroundSize: tex.backgroundSize || 'auto',
      width: canvasWidth.value + 'px',
      height: canvasHeight.value + 'px',
    }
  }
  
  return {
    ...base,
    width: canvasWidth.value + 'px',
    height: canvasHeight.value + 'px',
  }
})

// Methods
const formatPrice = (price) => {
  if (!price) return '0.00'
  return parseFloat(price).toFixed(2)
}

const goBack = () => router.back()

const selectBackground = (bg) => {
  selectedBackground.value = bg.id
  if (bg.style) {
    selectedBackgroundStyle.value = bg.style
  } else if (bg.value) {
    selectedBackgroundStyle.value = { background: bg.value }
  }
}

const selectTexture = (texture) => {
  // Toggle off if same texture clicked again
  if (selectedTexture.value === texture.id) {
    selectedTexture.value = null
    selectedTextureStyle.value = {}
    return
  }
  selectedTexture.value = texture.id
  selectedTextureStyle.value = texture.style || {}
}

const setAspectRatio = (ratio) => {
  selectedRatio.value = ratio.name
  canvasWidth.value = ratio.width
  canvasHeight.value = ratio.height
}

// Search products
const searchProducts = async () => {
  if (!searchQuery.value.trim()) return
  loading.value = true
  try {
    const response = await fetch(
      `https://real-time-amazon-data.p.rapidapi.com/search?query=${encodeURIComponent(searchQuery.value)}&page=1&country=US`,
      {
        headers: {
          'x-rapidapi-host': 'real-time-amazon-data.p.rapidapi.com',
          'x-rapidapi-key': 'ad5affb386msh86b1de74187a3cep186fbejsn29e5c0f03e34'
        }
      }
    )
    const data = await response.json()
    const items = data?.data?.products || []
    products.value = items.slice(0, 12).map((p, idx) => ({
      id: p.asin || idx,
      title: p.product_title,
      price: (p.product_price || '$0').replace(/[^0-9.]/g, ''),
      image_url: p.product_photo,
      source: 'Amazon',
      url: p.product_url
    }))
  } catch (error) {
    console.error('Product search failed:', error)
    products.value = []
  } finally {
    loading.value = false
  }
}

// Canvas operations — products appear at 200px for visibility
const addToCanvas = (product) => {
  const canvas = canvasRef.value
  if (!canvas) return
  
  const size = 200
  const x = Math.random() * (canvasWidth.value - size - 20) + 10
  const y = Math.random() * (canvasHeight.value - size - 20) + 10
  
  canvasItems.value.push({
    ...product,
    id: Date.now() + Math.random(),
    x, y,
    width: size,
    height: size,
    zIndex: canvasItems.value.length + 1
  })
  
  // Re-extract board colors when new image is added
  setTimeout(() => extractColorsFromImages(), 500)
}

const handleDragStart = (e, product) => {
  e.dataTransfer.setData('application/json', JSON.stringify(product))
}

const handleDrop = (e) => {
  try {
    const product = JSON.parse(e.dataTransfer.getData('application/json'))
    const canvas = canvasRef.value
    const rect = canvas.getBoundingClientRect()
    
    canvasItems.value.push({
      ...product,
      id: Date.now() + Math.random(),
      x: e.clientX - rect.left - 100,
      y: e.clientY - rect.top - 100,
      width: 200,
      height: 200,
      zIndex: canvasItems.value.length + 1
    })
    
    // Re-extract board colors when new image is dropped
    setTimeout(() => extractColorsFromImages(), 500)
  } catch (err) {}
}

const startDrag = (e, item) => {
  if (isResizing) return
  selectedItem.value = item.id
  draggingItem = item.id
  item.zIndex = Math.max(...canvasItems.value.map(i => i.zIndex)) + 1
  
  dragOffset = {
    x: e.clientX - item.x,
    y: e.clientY - item.y
  }
  
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

const onDrag = (e) => {
  const item = canvasItems.value.find(i => i.id === draggingItem)
  if (!item) return
  
  item.x = Math.max(0, Math.min(e.clientX - dragOffset.x, canvasWidth.value - item.width))
  item.y = Math.max(0, Math.min(e.clientY - dragOffset.y, canvasHeight.value - item.height))
}

const stopDrag = () => {
  draggingItem = null
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

const startResize = (e, item) => {
  isResizing = true
  resizingItem = item.id
  selectedItem.value = item.id
  
  document.addEventListener('mousemove', onResize)
  document.addEventListener('mouseup', stopResize)
}

const onResize = (e) => {
  const item = canvasItems.value.find(i => i.id === resizingItem)
  if (!item || !canvasRef.value) return
  
  const rect = canvasRef.value.getBoundingClientRect()
  const newWidth = Math.max(60, e.clientX - rect.left - item.x)
  const newHeight = Math.max(60, e.clientY - rect.top - item.y)
  
  item.width = Math.min(newWidth, canvasWidth.value - item.x)
  item.height = Math.min(newHeight, canvasHeight.value - item.y)
}

const stopResize = () => {
  isResizing = false
  resizingItem = null
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
}

const removeItem = (id) => {
  canvasItems.value = canvasItems.value.filter(i => i.id !== id)
  if (selectedItem.value === id) selectedItem.value = null
  // Re-extract board colors after removing an image
  setTimeout(() => extractColorsFromImages(), 300)
}

// Image Upload Handler
const handleImageUpload = (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
      // Calculate size to fit canvas while maintaining aspect ratio
      let width = img.width
      let height = img.height
      const maxSize = 300
      
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = (height / width) * maxSize
          width = maxSize
        } else {
          width = (width / height) * maxSize
          height = maxSize
        }
      }
      
      const x = Math.random() * (canvasWidth.value - width - 20) + 10
      const y = Math.random() * (canvasHeight.value - height - 20) + 10
      
      canvasItems.value.push({
        id: Date.now() + Math.random(),
        title: file.name,
        image_url: e.target.result,
        x, y,
        width,
        height,
        zIndex: canvasItems.value.length + textElements.value.length + 1
      })
      
      // Re-extract board colors when new image is uploaded
      setTimeout(() => extractColorsFromImages(), 500)
    }
    img.src = e.target.result
  }
  reader.readAsDataURL(file)
  event.target.value = '' // Reset input
}

// Text Element Methods
const addTextElement = () => {
  const x = Math.random() * (canvasWidth.value - 200) + 20
  const y = Math.random() * (canvasHeight.value - 60) + 20
  
  textElements.value.push({
    id: Date.now() + Math.random(),
    content: 'Double-click to edit',
    fontFamily: selectedFont.value,
    fontSize: selectedFontSize.value,
    color: selectedTextColor.value,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: '1px',
    x, y,
    zIndex: canvasItems.value.length + textElements.value.length + 1,
    editing: false
  })
}

const editText = (text) => {
  text.editing = true
  // Focus the input after Vue updates the DOM
  setTimeout(() => {
    const inputs = document.querySelectorAll('.text-edit-input')
    if (inputs.length > 0) {
      inputs[inputs.length - 1].focus()
    }
  }, 50)
}

const finishEditText = (text) => {
  text.editing = false
  if (!text.content.trim()) {
    text.content = 'Text'
  }
}

const startDragText = (e, text) => {
  if (text.editing) return
  selectedItem.value = text.id
  draggingTextItem = text.id
  text.zIndex = Math.max(
    ...canvasItems.value.map(i => i.zIndex),
    ...textElements.value.map(t => t.zIndex)
  ) + 1
  
  dragOffset = {
    x: e.clientX - text.x,
    y: e.clientY - text.y
  }
  
  document.addEventListener('mousemove', onDragText)
  document.addEventListener('mouseup', stopDragText)
}

const onDragText = (e) => {
  const text = textElements.value.find(t => t.id === draggingTextItem)
  if (!text) return
  
  text.x = Math.max(0, Math.min(e.clientX - dragOffset.x, canvasWidth.value - 100))
  text.y = Math.max(0, Math.min(e.clientY - dragOffset.y, canvasHeight.value - 30))
}

const stopDragText = () => {
  draggingTextItem = null
  document.removeEventListener('mousemove', onDragText)
  document.removeEventListener('mouseup', stopDragText)
}

const removeTextElement = (id) => {
  textElements.value = textElements.value.filter(t => t.id !== id)
  if (selectedItem.value === id) selectedItem.value = null
}

// Fabric Swatch Functions
const addSwatch = (swatch) => {
  const centerX = canvasWidth.value / 2 - 40
  const centerY = canvasHeight.value / 2 - 40
  
  canvasStickers.value.push({
    id: `swatch-${Date.now()}`,
    type: 'fabric',
    name: swatch.name,
    color: swatch.color,
    texture: swatch.texture,
    image: swatch.image,
    x: centerX + Math.random() * 100 - 50,
    y: centerY + Math.random() * 100 - 50,
    width: 80,
    height: 80,
    rotation: Math.random() * 12 - 6,
    zIndex: 100 + canvasStickers.value.length
  })
}

// Pantone Color Chip Functions
const addPantone = (chip) => {
  const centerX = canvasWidth.value / 2 - 30
  const centerY = canvasHeight.value / 2 - 40
  
  canvasStickers.value.push({
    id: `pantone-${Date.now()}`,
    type: 'pantone',
    name: chip.name,
    color: chip.color,
    code: chip.code,
    x: centerX + Math.random() * 100 - 50,
    y: centerY + Math.random() * 100 - 50,
    width: 60,
    height: 70,
    rotation: Math.random() * 8 - 4,
    zIndex: 100 + canvasStickers.value.length
  })
}

const removeSticker = (id) => {
  canvasStickers.value = canvasStickers.value.filter(s => s.id !== id)
  if (selectedItem.value === id) selectedItem.value = null
}

// Decoration Functions
const addDecoration = (deco) => {
  const centerX = canvasWidth.value / 2 - 30
  const centerY = canvasHeight.value / 2 - 30
  
  // Size based on category
  const sizes = {
    flower: { width: 55, height: 80 },
    fashion: { width: 60, height: 60 },
    note: { width: 80, height: 80 },
    tag: { width: 48, height: 72 },
    pin: { width: 28, height: 35 },
    tape: { width: 110, height: 32 },
    nature: { width: 60, height: 55 },
    paper: { width: 100, height: 35 },
  }
  const { width, height } = sizes[deco.category] || { width: 60, height: 60 }
  
  canvasDecorations.value.push({
    id: `deco-${Date.now()}`,
    name: deco.name,
    category: deco.category,
    svg: deco.svg,
    x: centerX + Math.random() * 120 - 60,
    y: centerY + Math.random() * 120 - 60,
    width: width,
    height: height,
    rotation: Math.random() * 20 - 10,
    zIndex: 150 + canvasDecorations.value.length
  })
}

// Background Removal
const removeBackground = async (item) => {
  if (item.removingBg) return
  item.removingBg = true
  
  try {
    const blob = await removeBgLib(item.image_url, {
      progress: (key, current, total) => {
        // Progress callback — could be used for progress bar
      }
    })
    
    // Convert blob to data URL
    const reader = new FileReader()
    reader.onload = (e) => {
      item.image_url = e.target.result
      item.removingBg = false
      item.bgRemoved = true
      showNotification('Background removed!')
    }
    reader.readAsDataURL(blob)
  } catch (err) {
    console.error('Background removal failed:', err)
    item.removingBg = false
    showNotification('Background removal failed. Try a different image.')
  }
}

// Dynamic color extraction from canvas images
const boardColors = ref([])

const extractColorsFromImages = () => {
  const items = canvasItems.value
  if (items.length === 0) {
    boardColors.value = []
    return
  }
  
  const allColors = []
  let processed = 0
  const total = Math.min(items.length, 6) // Sample max 6 images
  
  items.slice(0, 6).forEach((item) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = 50
        canvas.height = 50
        ctx.drawImage(img, 0, 0, 50, 50)
        
        // Sample colors from key positions
        const positions = [
          [12, 12], [25, 12], [37, 12],
          [12, 25], [25, 25], [37, 25],
          [12, 37], [25, 37], [37, 37]
        ]
        
        positions.forEach(([x, y]) => {
          const pixel = ctx.getImageData(x, y, 1, 1).data
          if (pixel[3] > 128) { // Skip transparent pixels
            allColors.push({ r: pixel[0], g: pixel[1], b: pixel[2] })
          }
        })
      } catch (e) {
        // CORS or other error — skip
      }
      
      processed++
      if (processed >= total) {
        // Cluster colors to find dominant ones
        boardColors.value = clusterColors(allColors)
      }
    }
    img.onerror = () => {
      processed++
      if (processed >= total) {
        boardColors.value = clusterColors(allColors)
      }
    }
    img.src = item.image_url
  })
}

// Simple color clustering to find dominant colors
const clusterColors = (colors) => {
  if (colors.length === 0) return []
  
  // Remove very similar colors (within distance 40)
  const unique = []
  for (const c of colors) {
    const isDuplicate = unique.some(u => 
      Math.abs(u.r - c.r) + Math.abs(u.g - c.g) + Math.abs(u.b - c.b) < 60
    )
    // Skip near-white and near-black
    const brightness = (c.r + c.g + c.b) / 3
    if (!isDuplicate && brightness > 20 && brightness < 240) {
      unique.push(c)
    }
  }
  
  // Sort by saturation (more colorful first)
  unique.sort((a, b) => {
    const satA = Math.max(a.r, a.g, a.b) - Math.min(a.r, a.g, a.b)
    const satB = Math.max(b.r, b.g, b.b) - Math.min(b.r, b.g, b.b)
    return satB - satA
  })
  
  // Take top 6 distinct colors
  return unique.slice(0, 6).map((c, i) => {
    const hex = `#${c.r.toString(16).padStart(2, '0')}${c.g.toString(16).padStart(2, '0')}${c.b.toString(16).padStart(2, '0')}`
    return {
      id: `bc-${i}`,
      type: 'pantone',
      name: `Board Color ${i + 1}`,
      color: hex,
      code: hex.toUpperCase()
    }
  })
}

const removeDecoration = (id) => {
  canvasDecorations.value = canvasDecorations.value.filter(d => d.id !== id)
  if (selectedItem.value === id) selectedItem.value = null
}

let draggedDecoration = null
const startDragDecoration = (e, deco) => {
  e.preventDefault()
  draggedDecoration = deco
  selectedItem.value = deco.id
  const startX = e.clientX
  const startY = e.clientY
  const origX = deco.x
  const origY = deco.y
  
  const onMove = (ev) => {
    deco.x = origX + (ev.clientX - startX)
    deco.y = origY + (ev.clientY - startY)
  }
  
  const onUp = () => {
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
    draggedDecoration = null
  }
  
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}

// Resize decoration
const startResizeDecoration = (e, deco) => {
  e.preventDefault()
  const startX = e.clientX
  const startY = e.clientY
  const origWidth = deco.width
  const origHeight = deco.height
  const aspectRatio = origWidth / origHeight
  
  const onMove = (ev) => {
    const deltaX = ev.clientX - startX
    const deltaY = ev.clientY - startY
    const delta = Math.max(deltaX, deltaY)
    deco.width = Math.max(20, origWidth + delta)
    deco.height = Math.max(20, origHeight + delta / aspectRatio)
  }
  
  const onUp = () => {
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
  }
  
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}

// Rotate decoration
const startRotateDecoration = (e, deco) => {
  e.preventDefault()
  const rect = e.target.parentElement.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX)
  const origRotation = deco.rotation || 0
  
  const onMove = (ev) => {
    const angle = Math.atan2(ev.clientY - centerY, ev.clientX - centerX)
    const rotation = ((angle - startAngle) * 180 / Math.PI) + origRotation
    deco.rotation = rotation
  }
  
  const onUp = () => {
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
  }
  
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}

let draggedSticker = null
const startDragSticker = (e, swatch) => {
  if (swatch.id && (swatch.id.startsWith('swatch-') || swatch.id.startsWith('pantone-'))) {
    // Dragging existing swatch/chip on canvas
    e.preventDefault()
    draggedSticker = swatch
    selectedItem.value = swatch.id
    const startX = e.clientX
    const startY = e.clientY
    const origX = swatch.x
    const origY = swatch.y
    
    const onMove = (ev) => {
      swatch.x = origX + (ev.clientX - startX)
      swatch.y = origY + (ev.clientY - startY)
    }
    
    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      draggedSticker = null
    }
    
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  } else {
    // Dragging from palette - set drag data
    e.dataTransfer?.setData('swatch', JSON.stringify(swatch))
  }
}

// Frame Functions
const selectFrame = (frameId) => {
  selectedFrame.value = frameId
  // Apply to selected item if any
  if (selectedItem.value) {
    const item = canvasItems.value.find(i => i.id === selectedItem.value)
    if (item) {
      item.frame = frameId
      item.showPin = frameId === 'polaroid' || frameId === 'tape'
    }
  }
}

const cycleItemFrame = (item) => {
  const frameIds = imageFrames.value.map(f => f.id)
  const currentIndex = frameIds.indexOf(item.frame || 'none')
  const nextIndex = (currentIndex + 1) % frameIds.length
  item.frame = frameIds[nextIndex]
  item.showPin = item.frame === 'polaroid' || item.frame === 'tape'
}

// Template Application
const applyTemplate = (template) => {
  // Clear current items
  canvasItems.value = []
  textElements.value = []
  
  // Add placeholder items based on template
  template.items.forEach((item, index) => {
    canvasItems.value.push({
      id: Date.now() + index,
      title: `Image ${index + 1}`,
      image_url: `https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80`,
      x: item.x,
      y: item.y,
      width: item.width,
      height: item.height,
      zIndex: index + 1
    })
  })
  
  // Add template texts
  if (template.texts) {
    template.texts.forEach((text, index) => {
      textElements.value.push({
        id: Date.now() + 1000 + index,
        content: text.content,
        fontFamily: selectedFont.value,
        fontSize: text.fontSize,
        color: selectedTextColor.value,
        fontWeight: 'normal',
        fontStyle: 'normal',
        letterSpacing: '1px',
        x: text.x,
        y: text.y,
        zIndex: template.items.length + index + 1,
        editing: false
      })
    })
  }
}

const saveStoryboard = () => {
  if (!isAuthenticated.value) {
    router.push('/login')
    return
  }
  
  // Generate storyboard data
  const storyboardData = {
    id: crypto.randomUUID(),
    name: 'Fashion Board ' + new Date().toLocaleDateString(),
    background: selectedBackgroundStyle.value,
    aspectRatio: selectedRatio.value,
    canvasWidth: canvasWidth.value,
    canvasHeight: canvasHeight.value,
    items: canvasItems.value,
    textElements: textElements.value,
    stickers: canvasStickers.value,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  // Get existing saved storyboards
  const savedBoards = JSON.parse(localStorage.getItem('fynda_storyboards') || '[]')
  
  // Add new storyboard
  savedBoards.unshift(storyboardData)
  
  // Keep only last 20 storyboards
  if (savedBoards.length > 20) {
    savedBoards.pop()
  }
  
  // Save to localStorage
  localStorage.setItem('fynda_storyboards', JSON.stringify(savedBoards))
  
  // Show success message
  showNotification('Storyboard saved successfully!')
}

// Toggle share dropdown and generate link
const toggleShareDropdown = async () => {
  if (!isAuthenticated.value) {
    router.push('/login')
    return
  }
  
  // Toggle dropdown
  showShareDropdown.value = !showShareDropdown.value
  
  // If opening and no URL yet, generate one
  if (showShareDropdown.value && !currentShareUrl.value) {
    await generateShareLink()
  }
}

const generateShareLink = async () => {
  shareLoading.value = true
  linkCopied.value = false
  
  try {
    // Prepare storyboard data with share options
    const storyboardData = {
      background: selectedBackgroundStyle.value,
      aspectRatio: selectedRatio.value,
      canvasWidth: canvasWidth.value,
      canvasHeight: canvasHeight.value,
      items: canvasItems.value.map(item => ({
        ...item,
        productUrl: item.url || null,
        productPrice: item.price || null
      })),
      textElements: textElements.value,
      stickers: canvasStickers.value,
      enableLinks: shareWithLinks.value,
      showPrices: shareWithPrices.value
    }
    
    // Call backend API to create share link
    const response = await api.post('/api/storyboard/share/', {
      title: 'Fashion Storyboard',
      storyboard_data: storyboardData,
      expires_in_days: 30
    })
    
    // Use frontend origin for the share URL, not the backend URL
    const token = response.data.token
    currentShareUrl.value = `${window.location.origin}/share/${token}`
  } catch (error) {
    console.error('Failed to share storyboard:', error)
    showNotification('Failed to create share link. Please try again.')
    showShareDropdown.value = false
  } finally {
    shareLoading.value = false
  }
}

const regenerateShareLink = async () => {
  // When toggle options change, regenerate the link
  if (currentShareUrl.value) {
    currentShareUrl.value = ''
    await generateShareLink()
  }
}

const copyShareLink = async () => {
  try {
    await navigator.clipboard.writeText(currentShareUrl.value)
    linkCopied.value = true
    setTimeout(() => {
      linkCopied.value = false
    }, 2000)
  } catch (err) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea')
    textarea.value = currentShareUrl.value
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    linkCopied.value = true
    setTimeout(() => {
      linkCopied.value = false
    }, 2000)
  }
}

// Notification system
const notification = ref({ show: false, message: '' })

// Share dropdown state
const showShareDropdown = ref(false)
const shareLoading = ref(false)
const currentShareUrl = ref('')
const linkCopied = ref(false)
const shareWithLinks = ref(true)
const shareWithPrices = ref(true)

const showNotification = (message) => {
  notification.value = { show: true, message }
  setTimeout(() => {
    notification.value = { show: false, message: '' }
  }, 3000)
}

// Load shared storyboard on mount if share token present
const loadSharedStoryboard = () => {
  const shareToken = route.query.share
  if (!shareToken) return
  
  const sharedBoards = JSON.parse(localStorage.getItem('fynda_shared_storyboards') || '{}')
  const shareData = sharedBoards[shareToken]
  
  if (!shareData) {
    showNotification('Share link not found or has expired.')
    return
  }
  
  // Check if expired
  if (new Date(shareData.expiresAt) < new Date()) {
    showNotification('This share link has expired.')
    delete sharedBoards[shareToken]
    localStorage.setItem('fynda_shared_storyboards', JSON.stringify(sharedBoards))
    return
  }
  
  // Load the shared storyboard
  const { storyboard } = shareData
  selectedBackgroundStyle.value = storyboard.background
  selectedRatio.value = storyboard.aspectRatio
  canvasWidth.value = storyboard.canvasWidth
  canvasHeight.value = storyboard.canvasHeight
  canvasItems.value = storyboard.items || []
  textElements.value = storyboard.textElements || []
  
  showNotification('Shared storyboard loaded!')
  
  // Clear the share parameter from URL
  router.replace({ path: '/storyboard' })
}

// Init
onMounted(() => {
  loadClosetItems()
  searchQuery.value = 'fashion'
  searchProducts()
  
  // Check if loading from a share link
  if (route.query.share) {
    loadSharedStoryboard()
    return
  }
  
  // Check if product was passed from ProductDetailPage
  if (route.query.product) {
    try {
      const productData = JSON.parse(route.query.product)
      if (productData && productData.image_url) {
        // Add the product to canvas
        const x = (canvasWidth.value - 200) / 2
        const y = (canvasHeight.value - 200) / 2
        
        canvasItems.value.push({
          id: Date.now() + Math.random(),
          title: productData.title || 'Product',
          image_url: productData.image_url,
          price: productData.price,
          url: productData.url || productData.product_url || '',
          product_url: productData.url || productData.product_url || '',
          x, y,
          width: 200,
          height: 200,
          zIndex: 1
        })
        
        // Clear the query parameter from URL
        router.replace({ path: '/storyboard' })
      }
    } catch (e) {
      console.error('Failed to parse product data:', e)
    }
  }

  // Check for items sent from Closet → Fashion Board
  try {
    const incoming = JSON.parse(localStorage.getItem('fyndaBoardIncoming') || '[]')
    if (incoming.length > 0) {
      incoming.forEach((item, i) => {
        const x = 50 + (i * 30)
        const y = 50 + (i * 30)
        canvasItems.value.push({
          id: Date.now() + Math.random() + i,
          title: item.title || 'Closet Item',
          image_url: item.image_url,
          price: item.price,
          product_url: item.product_url || '',
          x, y,
          width: 200,
          height: 200,
          zIndex: canvasItems.value.length + textElements.value.length + 1
        })
      })
      // Clear the incoming queue
      localStorage.removeItem('fyndaBoardIncoming')
    }
  } catch (e) {
    console.error('Failed to load incoming board items:', e)
  }
})

onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Cormorant+Garamond:wght@400;500;600&family=Libre+Baskerville:wght@400;700&family=Cinzel:wght@400;500;600&family=EB+Garamond:wght@400;500;600&family=Bodoni+Moda:wght@400;500;600&family=Lora:wght@400;500;600&family=Crimson+Text:wght@400;600&display=swap');

.storyboard-page {
  min-height: 100vh;
  background: #f8f8f8;
}

/* Storyboard Toolbar */
.storyboard-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1.5rem;
  background: #fff;
  border-bottom: 1px solid #e5e5e5;
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
  color: #1a1a1a;
  font-weight: 500;
}

.back-btn:hover { border-color: #000; color: #000; }

.page-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.2rem;
  font-weight: 500;
  color: #1a1a1a;
}

.toolbar-actions {
  display: flex;
  gap: 0.75rem;
}

.save-btn, .share-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

.save-btn {
  background: #000;
  color: #fff;
  border: none;
}

.share-btn {
  background: #fff;
  color: #1a1a1a;
  border: 1px solid #e5e5e5;
}

.save-btn:hover { background: #222; }
.share-btn:hover { border-color: #000; }

/* Share Modal Popup */
.share-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.share-modal {
  background: #fff;
  border-radius: 16px;
  width: 90%;
  max-width: 480px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.share-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.share-modal-header h3 {
  margin: 0;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.25rem;
  font-weight: 500;
  color: #1a1a1a;
}

.close-modal {
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  color: #999;
  transition: color 0.2s ease;
}

.close-modal:hover {
  color: #1a1a1a;
}

.share-modal-body {
  padding: 1.5rem;
}

.share-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid #f0f0f0;
}

.share-toggle {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  cursor: pointer;
}

.toggle-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1a1a1a;
  flex: 1;
}

.toggle-desc {
  width: 100%;
  font-size: 0.7rem;
  color: #999;
  margin-top: -0.1rem;
  order: 3;
}

.toggle-switch {
  width: 40px;
  height: 22px;
  background: #d4d4d4;
  border-radius: 11px;
  position: relative;
  transition: background 0.25s ease;
  cursor: pointer;
}

.toggle-switch.active {
  background: #1a1a1a;
}

.toggle-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.25s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.toggle-switch.active .toggle-knob {
  transform: translateX(18px);
}

.share-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem 0;
  color: #666;
  font-size: 0.9rem;
}

.spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid #e5e5e5;
  border-top-color: #1a1a1a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.share-link-section {
  text-align: center;
}

.share-label {
  margin: 0 0 0.75rem;
  font-size: 0.9rem;
  color: #666;
}

.share-link-container {
  display: flex;
  gap: 0.5rem;
}

.share-link-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #e5e5e5;
  border-radius: 10px;
  font-size: 0.85rem;
  color: #1a1a1a;
  background: #f8f8f8;
  cursor: text;
}

.share-link-input:focus {
  outline: none;
  border-color: #1a1a1a;
  background: #fff;
}

.copy-link-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: #1a1a1a;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s ease, transform 0.1s ease;
}

.copy-link-btn:hover {
  background: #333;
}

.copy-link-btn:active {
  transform: scale(0.98);
}

.share-info {
  margin: 1rem 0 0;
  font-size: 0.8rem;
  color: #888;
  text-align: center;
}

/* Main Layout */
.main-content {
  display: grid;
  grid-template-columns: 230px 1fr 280px;
  gap: 0.75rem;
  padding: 0.75rem;
  height: calc(100vh - 60px);
  overflow: hidden;
}

/* Panels */
.backgrounds-panel, .products-panel {
  background: #fff;
  border-radius: 12px;
  padding: 0.75rem;
  overflow-y: auto;
  max-height: calc(100vh - 80px);
}

.panel-title {
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #1a1a1a;
}

.panel-title.mt {
  margin-top: 1.5rem;
}

/* Backgrounds Grid */
.backgrounds-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.bg-card {
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.bg-card.active {
  border-color: #000;
}

.bg-card:hover {
  transform: scale(1.02);
}

.bg-preview {
  height: 50px;
  width: 100%;
}

.bg-name {
  display: block;
  text-align: center;
  font-size: 0.7rem;
  padding: 0.25rem;
  background: #f5f5f5;
}

/* Colors Grid */
.colors-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

.color-card {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1);
}

.color-card.active {
  border-color: #000;
  transform: scale(1.1);
}

/* Textures Grid */
.textures-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.texture-card {
  position: relative;
  height: 50px;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
  overflow: hidden;
}

.texture-card.active {
  border-color: #000;
}

.texture-card:hover {
  transform: scale(1.02);
}

.texture-name {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 0.65rem;
  font-weight: 500;
  padding: 0.2rem;
  background: rgba(255,255,255,0.85);
  color: #333;
}

/* Frames Grid */
.frames-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.4rem;
}

.frame-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.4rem;
  border-radius: 6px;
  cursor: pointer;
  border: 2px solid transparent;
  background: #f8f8f8;
  transition: all 0.2s;
}

.frame-card:hover {
  background: #f0f0f0;
}

.frame-card.active {
  border-color: #1a1a1a;
}

.frame-preview {
  width: 32px;
  height: 32px;
  background: #fff;
  border-radius: 4px;
}

.frame-preview.frame-none {
  border: 1px dashed #ccc;
}

.frame-preview.frame-polaroid {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  border-radius: 2px;
  padding: 2px 2px 8px 2px;
}

.frame-preview.frame-vintage {
  border: 3px solid #8B4513;
  background: linear-gradient(135deg, #d4a574 0%, #c49561 100%);
}

.frame-preview.frame-film {
  background: #1a1a1a;
  position: relative;
}

.frame-preview.frame-film::before,
.frame-preview.frame-film::after {
  content: '';
  position: absolute;
  left: 4px;
  right: 4px;
  height: 3px;
  background: repeating-linear-gradient(90deg, #fff 0px, #fff 2px, transparent 2px, transparent 4px);
}

.frame-preview.frame-film::before { top: 2px; }
.frame-preview.frame-film::after { bottom: 2px; }

.frame-preview.frame-tape {
  background: #fff;
  position: relative;
}

.frame-preview.frame-tape::before {
  content: '';
  position: absolute;
  top: -3px;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 8px;
  background: rgba(255, 220, 150, 0.8);
  border-radius: 1px;
}

.frame-preview.frame-shadow {
  background: #fff;
  box-shadow: 4px 4px 0 rgba(0,0,0,0.15);
}

.frame-name {
  font-size: 0.6rem;
  color: #666;
}

/* Fabric Swatches Grid */
.swatches-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.4rem;
}

.swatch-card {
  position: relative;
  height: 55px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.15);
  overflow: hidden;
  display: flex;
  align-items: flex-end;
}

.swatch-card:hover {
  transform: scale(1.08);
  box-shadow: 0 3px 10px rgba(0,0,0,0.25);
}

.swatch-label {
  display: block;
  width: 100%;
  padding: 2px 4px;
  font-size: 8px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(transparent, rgba(0,0,0,0.6));
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

/* Pantone Color Chips Grid */
.pantone-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.4rem;
}

.pantone-card {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
  overflow: hidden;
}

.pantone-card:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0,0,0,0.18);
}

.pantone-color {
  height: 28px;
}

.pantone-label {
  padding: 2px 4px;
  text-align: center;
}

.pantone-code {
  font-size: 0.5rem;
  font-family: 'Courier New', monospace;
  color: #333;
  text-transform: uppercase;
}

/* Decorations Grid */
.decorations-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.35rem;
}

.decoration-card {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 45px;
  background: #fafafa;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #eee;
}

.decoration-card:hover {
  background: #f5f5f5;
  transform: scale(1.08);
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.decoration-preview {
  width: 30px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.decoration-preview svg {
  width: 100%;
  height: 100%;
}

/* Canvas Section */
.canvas-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  max-height: calc(100vh - 80px);
  overflow: auto;
  padding: 0.5rem;
}

.storyboard-canvas {
  position: relative;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.canvas-item {
  position: absolute;
  background: transparent;
  border-radius: 0;
  overflow: hidden;
  cursor: move;
  box-shadow: none;
  border: none;
}

.canvas-item.selected {
  outline: 2px dashed rgba(0,0,0,0.3);
  outline-offset: 2px;
}

.item-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.6);
  color: #fff;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 300;
  line-height: 1;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s;
}

.item-remove:hover {
  background: rgba(0,0,0,0.8);
}

.canvas-item:hover .item-remove,
.canvas-text:hover .item-remove,
.canvas-sticker:hover .item-remove {
  opacity: 1;
}

/* Price Tag on Canvas Items */
.item-price-tag {
  position: absolute;
  bottom: 6px;
  left: 6px;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  padding: 3px 8px;
  border-radius: 10px;
  font-family: 'Inter', sans-serif;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  backdrop-filter: blur(4px);
  pointer-events: none;
  z-index: 5;
}

/* Product Link Badge on Canvas Items */
.item-link-badge {
  position: absolute;
  bottom: 6px;
  right: 6px;
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  text-decoration: none;
  box-shadow: 0 1px 4px rgba(0,0,0,0.15);
  transition: all 0.15s ease;
  z-index: 5;
  opacity: 0;
}

.canvas-item:hover .item-link-badge {
  opacity: 1;
}

.item-link-badge:hover {
  background: #111;
  color: #fff;
  transform: scale(1.1);
}

.resize-handle {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 16px;
  height: 16px;
  background: transparent;
  color: rgba(0,0,0,0.4);
  cursor: se-resize;
  opacity: 0;
  transition: opacity 0.2s;
  font-size: 12px;
  line-height: 16px;
  text-align: center;
}

.resize-handle::after {
  content: '⤡';
}

.canvas-item:hover .resize-handle,
.canvas-item.selected .resize-handle {
  opacity: 1;
}

/* Remove Background Button */
.remove-bg-btn {
  position: absolute;
  bottom: 6px;
  left: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s, background 0.2s;
  white-space: nowrap;
  backdrop-filter: blur(4px);
  z-index: 10;
}

.canvas-item.selected .remove-bg-btn {
  opacity: 1;
}

.remove-bg-btn:hover {
  background: rgba(0, 0, 0, 0.9);
}

/* BG Removal Loading Overlay */
.bg-removal-loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(4px);
  border-radius: inherit;
  z-index: 20;
}

.bg-removal-loading span {
  font-size: 11px;
  font-weight: 500;
  color: #333;
}

/* Frame Toggle Button */
.frame-toggle {
  position: absolute;
  bottom: 4px;
  left: 4px;
  width: 22px;
  height: 22px;
  background: rgba(255,255,255,0.9);
  color: #333;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.canvas-item:hover .frame-toggle {
  opacity: 1;
}

.frame-toggle:hover {
  background: #fff;
  border-color: #1a1a1a;
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
  box-shadow: 0 2px 4px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.4);
  z-index: 10;
}

.item-pin::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 4px;
  height: 4px;
  background: rgba(255,255,255,0.6);
  border-radius: 50%;
}

/* Polaroid Frame */
.canvas-item.frame-polaroid {
  background: #fff;
  padding: 8px 8px 30px 8px;
  border-radius: 2px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08);
  overflow: visible;
}

.canvas-item.frame-polaroid .item-img {
  border-radius: 0;
}

.canvas-item.frame-polaroid::after {
  content: '';
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 70%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0,0,0,0.1), transparent);
}

/* Vintage Frame */
.canvas-item.frame-vintage {
  border: 6px solid #8B4513;
  box-shadow: 
    inset 0 0 3px rgba(0,0,0,0.3),
    0 4px 12px rgba(0,0,0,0.2);
  border-radius: 2px;
  overflow: visible;
}

.canvas-item.frame-vintage::before {
  content: '';
  position: absolute;
  inset: -6px;
  border: 2px solid #d4a574;
  pointer-events: none;
}

/* Film Strip Frame */
.canvas-item.frame-film {
  background: #1a1a1a;
  padding: 15px 6px;
  border-radius: 2px;
  overflow: visible;
}

.canvas-item.frame-film::before,
.canvas-item.frame-film::after {
  content: '';
  position: absolute;
  left: 6px;
  right: 6px;
  height: 10px;
  background: repeating-linear-gradient(
    90deg, 
    #fff 0px, #fff 6px, 
    #1a1a1a 6px, #1a1a1a 10px
  );
}

.canvas-item.frame-film::before { top: 3px; }
.canvas-item.frame-film::after { bottom: 3px; }

/* Tape Frame */
.canvas-item.frame-tape {
  background: #fff;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
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

/* Canvas Swatch - Fabric & Pantone on canvas */
.canvas-swatch {
  position: absolute;
  cursor: move;
  user-select: none;
  box-shadow: 2px 2px 8px rgba(0,0,0,0.15);
}

.canvas-swatch.texture-linen {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'%3E%3Cpath fill='%23000' fill-opacity='0.08' d='M1 3h1v1H1V3zm2-2h1v1H3V1z'%3E%3C/path%3E%3C/svg%3E");
}

.canvas-swatch.texture-denim {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'%3E%3Cpath fill='%23fff' fill-opacity='0.12' d='M1 3h1v1H1V3zm2-2h1v1H3V1z'%3E%3C/path%3E%3C/svg%3E");
}

.canvas-swatch.texture-tweed {
  background-image: url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='0.15' fill-rule='evenodd'%3E%3Cpath d='M5 0h1L0 6V5zM6 5v1H5z'/%3E%3C/g%3E%3C/svg%3E");
}

.canvas-swatch.texture-silk {
  background-image: linear-gradient(135deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent);
  background-size: 6px 6px;
}

.canvas-swatch.texture-velvet {
  background-image: linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(0,0,0,0.15) 100%);
}

.canvas-swatch.texture-wool {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8'%3E%3Cg fill='%23000' fill-opacity='0.08'%3E%3Cpath d='M0 0h4v4H0V0zm4 4h4v4H4V4z'/%3E%3C/g%3E%3C/svg%3E");
}

/* Pantone Swatch on Canvas */
.canvas-swatch.pantone-swatch {
  border-radius: 2px;
  display: flex;
  flex-direction: column;
}

.canvas-swatch .swatch-edge {
  position: absolute;
  right: -3px;
  top: 0;
  bottom: 0;
  width: 8px;
  background: inherit;
  clip-path: polygon(
    0% 0%, 100% 5%, 0% 10%, 100% 15%, 0% 20%, 100% 25%, 
    0% 30%, 100% 35%, 0% 40%, 100% 45%, 0% 50%, 100% 55%,
    0% 60%, 100% 65%, 0% 70%, 100% 75%, 0% 80%, 100% 85%,
    0% 90%, 100% 95%, 0% 100%
  );
}

.pantone-chip-label {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 4px 2px;
  text-align: center;
}

.pantone-chip-label span {
  font-size: 8px;
  font-family: 'Courier New', monospace;
  color: #333;
  font-weight: 500;
}

.canvas-swatch:hover {
  box-shadow: 3px 3px 12px rgba(0,0,0,0.22);
}

.canvas-swatch.selected {
  outline: 2px solid #000;
  outline-offset: 2px;
}

.canvas-swatch .item-remove {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.6);
  color: #fff;
  border-radius: 50%;
  font-size: 11px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s;
}

.canvas-swatch:hover .item-remove {
  opacity: 1;
}

/* Canvas Decorations - Flowers, Notes, Tags, Pins */
.canvas-decoration {
  position: absolute;
  cursor: move;
  user-select: none;
}

.decoration-svg {
  width: 100%;
  height: 100%;
}

.decoration-svg svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(1px 2px 3px rgba(0,0,0,0.15));
}

.canvas-decoration:hover {
  filter: drop-shadow(2px 3px 5px rgba(0,0,0,0.2));
}

.canvas-decoration.selected {
  filter: drop-shadow(0 0 4px rgba(0,0,0,0.4));
}

.canvas-decoration .item-remove {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.6);
  color: #fff;
  border-radius: 50%;
  font-size: 11px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s;
}

.canvas-decoration:hover .item-remove {
  opacity: 1;
}

.canvas-decoration .resize-handle {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 14px;
  height: 14px;
  background: #000;
  cursor: se-resize;
  opacity: 0;
  transition: opacity 0.15s;
}

.canvas-decoration .rotate-handle {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 18px;
  height: 18px;
  background: #fff;
  border: 1px solid #333;
  border-radius: 50%;
  font-size: 10px;
  line-height: 16px;
  text-align: center;
  cursor: grab;
  opacity: 0;
  transition: opacity 0.15s;
  user-select: none;
}

.canvas-decoration:hover .resize-handle,
.canvas-decoration:hover .rotate-handle,
.canvas-decoration.selected .resize-handle,
.canvas-decoration.selected .rotate-handle {
  opacity: 1;
}

.canvas-empty {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(0,0,0,0.3);
}

.canvas-empty svg { margin-bottom: 1rem; }
.canvas-empty p { font-size: 1rem; margin-bottom: 0.25rem; }
.canvas-empty span { font-size: 0.85rem; opacity: 0.7; }

/* Aspect Ratio Options */
.aspect-options {
  display: flex;
  gap: 0.5rem;
}

.aspect-options button {
  padding: 0.4rem 0.8rem;
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.aspect-options button.active {
  background: #000;
  color: #fff;
  border-color: #000;
}

/* Products Panel */
.search-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.search-box input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.85rem;
  outline: none;
}

.products-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.product-card {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
}

.product-card:hover {
  transform: scale(1.02);
}

.product-card img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
}

.product-price {
  position: absolute;
  bottom: 4px;
  left: 4px;
  background: rgba(0,0,0,0.8);
  color: #fff;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: 2rem;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #e5e5e5;
  border-top-color: #000;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Upload Zone */
.upload-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1.25rem;
  border: 2px dashed #d0d0d0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  background: #fafafa;
}

.upload-zone:hover {
  border-color: #000;
  background: #f0f0f0;
}

.upload-zone svg {
  color: #888;
}

.upload-zone span {
  font-size: 0.75rem;
  color: #666;
}

/* Text Tools */
.text-tools {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.font-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.8rem;
  background: #fff;
  cursor: pointer;
}

.text-size-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.size-input {
  width: 60px;
  padding: 0.4rem;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.8rem;
  text-align: center;
}

.text-size-row span {
  font-size: 0.75rem;
  color: #666;
}

.text-colors {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.text-color-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid transparent;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1);
  transition: all 0.2s;
}

.text-color-btn.active {
  border-color: #000;
  transform: scale(1.15);
}

.add-text-btn {
  padding: 0.6rem;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.add-text-btn:hover {
  background: #333;
}

/* Templates Grid */
.templates-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.template-card {
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid transparent;
  transition: all 0.2s;
  background: #f5f5f5;
}

.template-card:hover {
  border-color: #000;
  transform: scale(1.02);
}

.template-preview {
  height: 50px;
  padding: 4px;
}

.template-name {
  display: block;
  text-align: center;
  font-size: 0.65rem;
  font-weight: 500;
  padding: 0.25rem;
  background: #fff;
  color: #333;
}

/* Canvas Text Elements */
.canvas-text {
  position: absolute;
  cursor: move;
  user-select: none;
  padding: 4px 8px;
  border: 2px solid transparent;
  border-radius: 4px;
  transition: border-color 0.2s;
  white-space: nowrap;
}

.canvas-text.selected {
  border-color: #000;
  background: rgba(255,255,255,0.5);
}

.canvas-text:hover .item-remove {
  opacity: 1;
}

.text-edit-input {
  border: none;
  background: transparent;
  outline: none;
  min-width: 100px;
  color: inherit;
}

/* Products Panel Width Adjustment */
.products-panel {
  max-height: calc(100vh - 80px);
  overflow-y: auto;
}

/* Products Panel Tabs */
.pp-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 0.75rem;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 3px;
}

.pp-tab {
  flex: 1;
  padding: 6px 0;
  border: none;
  background: transparent;
  border-radius: 6px;
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  color: #888;
  cursor: pointer;
  transition: all 0.15s ease;
}

.pp-tab.active {
  background: #fff;
  color: #1a1a1a;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.pp-empty {
  text-align: center;
  padding: 2rem 0.5rem;
  color: #999;
  font-size: 0.8rem;
}

.pp-empty p {
  margin: 0 0 0.5rem;
}

.pp-link {
  font-size: 0.75rem;
  color: #1a1a1a;
  font-weight: 500;
  text-decoration: underline;
}

/* Scrollbar Styling */
.backgrounds-panel::-webkit-scrollbar,
.products-panel::-webkit-scrollbar {
  width: 4px;
}

.backgrounds-panel::-webkit-scrollbar-thumb,
.products-panel::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}

.backgrounds-panel::-webkit-scrollbar-thumb:hover,
.products-panel::-webkit-scrollbar-thumb:hover {
  background: #999;
}

/* Notification Toast */
.notification-toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: #1a1a1a;
  color: #fff;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.notification-toast svg {
  color: #4ade80;
}

/* Toast transition */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}
</style>
