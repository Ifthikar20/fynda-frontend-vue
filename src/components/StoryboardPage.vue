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
            :class="{ active: selectedBackground === texture.id }"
            :style="texture.style"
            @click="selectBackground(texture)"
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
            :class="'texture-' + swatch.texture"
            :style="{ backgroundColor: swatch.color }"
            :title="swatch.name"
            @click="addSwatch(swatch)"
          >
            <div class="swatch-edge"></div>
          </div>
        </div>
        
        <!-- Pantone Color Chips -->
        <h3 class="panel-title mt">Color Chips</h3>
        <div class="pantone-grid">
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
            <span class="item-remove" @mousedown.stop @click="removeItem(item.id)">×</span>
            <div class="resize-handle" @mousedown.stop="startResize($event, item)"></div>
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
              swatch.type === 'fabric' ? 'texture-' + swatch.texture : '',
              swatch.type === 'pantone' ? 'pantone-swatch' : ''
            ]"
            :style="{
              left: swatch.x + 'px',
              top: swatch.y + 'px',
              width: swatch.width + 'px',
              height: swatch.height + 'px',
              backgroundColor: swatch.color,
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
  // Fabric Swatches with realistic textures
  { id: 'f1', type: 'fabric', name: 'Linen Natural', color: '#e8e0d5', texture: 'linen' },
  { id: 'f2', type: 'fabric', name: 'Denim Blue', color: '#4a6fa5', texture: 'denim' },
  { id: 'f3', type: 'fabric', name: 'Tweed Gray', color: '#6b7280', texture: 'tweed' },
  { id: 'f4', type: 'fabric', name: 'Silk Cream', color: '#faf6f0', texture: 'silk' },
  { id: 'f5', type: 'fabric', name: 'Velvet Navy', color: '#1e3a5f', texture: 'velvet' },
  { id: 'f6', type: 'fabric', name: 'Wool Camel', color: '#c9a86c', texture: 'wool' },
  // Pantone Color Chips
  { id: 'p1', type: 'pantone', name: 'Cool Gray', color: '#8b8b8b', code: '423 C' },
  { id: 'p2', type: 'pantone', name: 'Coral', color: '#ff6f61', code: '16-1546' },
  { id: 'p3', type: 'pantone', name: 'Soft Blue', color: '#89abe3', code: '15-4020' },
  { id: 'p4', type: 'pantone', name: 'Sage', color: '#9caf88', code: '15-6317' },
  { id: 'p5', type: 'pantone', name: 'Butter', color: '#f5e1a4', code: '12-0752' },
  { id: 'p6', type: 'pantone', name: 'Blush', color: '#e8b4b8', code: '14-1714' },
])

// Decorative elements - flowers, tags, sticky notes, pins
const decorations = ref([
  // Dried Flowers
  { id: 'd1', type: 'decoration', name: 'Dried Flower', category: 'flower', 
    svg: '<svg viewBox="0 0 40 60"><circle cx="20" cy="12" r="8" fill="#d4a574"/><circle cx="12" cy="18" r="6" fill="#c9956c"/><circle cx="28" cy="18" r="6" fill="#c9956c"/><path d="M20 20 L20 55" stroke="#6b5b47" stroke-width="2"/><path d="M20 35 Q10 30 8 40" stroke="#6b5b47" stroke-width="1.5" fill="none"/></svg>' },
  { id: 'd2', type: 'decoration', name: 'Yellow Flower', category: 'flower',
    svg: '<svg viewBox="0 0 40 60"><circle cx="20" cy="15" r="10" fill="#f4a620"/><circle cx="20" cy="15" r="4" fill="#8b5a2b"/><path d="M20 25 L20 55" stroke="#5a7247" stroke-width="2"/></svg>' },
  { id: 'd3', type: 'decoration', name: 'Lavender', category: 'flower',
    svg: '<svg viewBox="0 0 30 60"><ellipse cx="15" cy="8" rx="4" ry="6" fill="#9b7bb8"/><ellipse cx="15" cy="16" rx="4" ry="6" fill="#9b7bb8"/><ellipse cx="15" cy="24" rx="3" ry="5" fill="#9b7bb8"/><path d="M15 28 L15 55" stroke="#6b7b5a" stroke-width="2"/></svg>' },
  // Sticky Notes
  { id: 'd4', type: 'decoration', name: 'Yellow Note', category: 'note',
    svg: '<svg viewBox="0 0 60 60"><path d="M0 0 L60 0 L60 50 L50 60 L0 60 Z" fill="#fff9c4"/><path d="M50 60 L50 50 L60 50" fill="#f0e68c"/></svg>' },
  { id: 'd5', type: 'decoration', name: 'Pink Note', category: 'note',
    svg: '<svg viewBox="0 0 60 60"><path d="M0 0 L60 0 L60 50 L50 60 L0 60 Z" fill="#ffc9c9"/><path d="M50 60 L50 50 L60 50" fill="#ffb3b3"/></svg>' },
  { id: 'd6', type: 'decoration', name: 'Blue Note', category: 'note',
    svg: '<svg viewBox="0 0 60 60"><path d="M0 0 L60 0 L60 50 L50 60 L0 60 Z" fill="#c5e1f5"/><path d="M50 60 L50 50 L60 50" fill="#a8d4f0"/></svg>' },
  // Tags
  { id: 'd7', type: 'decoration', name: 'Kraft Tag', category: 'tag',
    svg: '<svg viewBox="0 0 40 60"><path d="M5 15 L20 0 L35 15 L35 55 Q35 60 30 60 L10 60 Q5 60 5 55 Z" fill="#d4c4a8"/><circle cx="20" cy="12" r="4" fill="none" stroke="#8b7355" stroke-width="1.5"/><path d="M18 8 Q22 3 26 8" stroke="#8b7355" stroke-width="1" fill="none"/></svg>' },
  { id: 'd8', type: 'decoration', name: 'White Tag', category: 'tag',
    svg: '<svg viewBox="0 0 40 60"><path d="M5 15 L20 0 L35 15 L35 55 Q35 60 30 60 L10 60 Q5 60 5 55 Z" fill="#fafafa" stroke="#ddd" stroke-width="1"/><circle cx="20" cy="12" r="4" fill="none" stroke="#999" stroke-width="1.5"/></svg>' },
  // Pins and Clips
  { id: 'd9', type: 'decoration', name: 'Gold Pin', category: 'pin',
    svg: '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="url(#goldPin)"/><defs><radialGradient id="goldPin" cx="30%" cy="30%"><stop offset="0%" stop-color="#ffd700"/><stop offset="100%" stop-color="#b8860b"/></radialGradient></defs></svg>' },
  { id: 'd10', type: 'decoration', name: 'Silver Pin', category: 'pin',
    svg: '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="url(#silverPin)"/><defs><radialGradient id="silverPin" cx="30%" cy="30%"><stop offset="0%" stop-color="#e8e8e8"/><stop offset="100%" stop-color="#a0a0a0"/></radialGradient></defs></svg>' },
  // Tape
  { id: 'd11', type: 'decoration', name: 'Washi Tape', category: 'tape',
    svg: '<svg viewBox="0 0 80 24"><rect x="0" y="0" width="80" height="24" fill="#f5e6d3" opacity="0.85"/><path d="M0 8 L80 8 M0 16 L80 16" stroke="#e8d4bc" stroke-width="1"/></svg>' },
  { id: 'd12', type: 'decoration', name: 'Paper Tear', category: 'paper',
    svg: '<svg viewBox="0 0 80 30"><path d="M0 5 Q5 0 10 5 Q15 8 20 3 Q25 7 30 4 Q35 8 40 5 Q45 2 50 6 Q55 3 60 7 Q65 4 70 6 Q75 3 80 5 L80 25 Q75 28 70 25 Q65 22 60 26 Q55 23 50 27 Q45 24 40 26 Q35 23 30 27 Q25 24 20 26 Q15 23 10 27 Q5 24 0 26 Z" fill="#f5f0e8"/></svg>' },
])

// Canvas decorations state
const canvasDecorations = ref([])

// Canvas stickers state
const canvasStickers = ref([])

const aspectRatios = [
  { name: 'landscape', label: '16:9', width: 1100, height: 620 },
  { name: 'square', label: '1:1', width: 780, height: 780 },
  { name: 'portrait', label: '4:5', width: 640, height: 800 },
  { name: 'story', label: '9:16', width: 460, height: 820 },
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
const canvasWidth = ref(1100)
const canvasHeight = ref(620)
const canvasItems = ref([])
const textElements = ref([])
const selectedItem = ref(null)
const searchQuery = ref('')
const products = ref([])
const loading = ref(false)

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

// Computed
const canvasStyle = computed(() => ({
  ...selectedBackgroundStyle.value,
  width: canvasWidth.value + 'px',
  height: canvasHeight.value + 'px',
}))

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
    const response = await api.get(`/api/search/?q=${encodeURIComponent(searchQuery.value)}&limit=12`)
    products.value = response.data.deals || []
  } catch (error) {
    products.value = getMockProducts()
  } finally {
    loading.value = false
  }
}

const getMockProducts = () => [
  { id: 1, title: 'Classic Shirt', price: 45.99, image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200&q=80' },
  { id: 2, title: 'Denim Jeans', price: 89.00, image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=200&q=80' },
  { id: 3, title: 'White Sneakers', price: 120.00, image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80' },
  { id: 4, title: 'Leather Bag', price: 295.00, image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=200&q=80' },
]

// Canvas operations
const addToCanvas = (product) => {
  const canvas = canvasRef.value
  if (!canvas) return
  
  const size = 120
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
      x: e.clientX - rect.left - 60,
      y: e.clientY - rect.top - 60,
      width: 120,
      height: 120,
      zIndex: canvasItems.value.length + 1
    })
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
  let width = 50, height = 60
  if (deco.category === 'flower') {
    width = 35
    height = 55
  } else if (deco.category === 'note') {
    width = 70
    height = 70
  } else if (deco.category === 'tag') {
    width = 40
    height = 60
  } else if (deco.category === 'pin') {
    width = 20
    height = 20
  } else if (deco.category === 'tape') {
    width = 90
    height = 28
  } else if (deco.category === 'paper') {
    width = 100
    height = 35
  }
  
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
  grid-template-columns: 220px 1fr 180px;
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
  height: 45px;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.swatch-card:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}

/* Pinking shears edge effect */
.swatch-edge {
  position: absolute;
  right: -2px;
  top: 0;
  bottom: 0;
  width: 6px;
  background: inherit;
  clip-path: polygon(
    0% 0%, 100% 5%, 0% 10%, 100% 15%, 0% 20%, 100% 25%, 
    0% 30%, 100% 35%, 0% 40%, 100% 45%, 0% 50%, 100% 55%,
    0% 60%, 100% 65%, 0% 70%, 100% 75%, 0% 80%, 100% 85%,
    0% 90%, 100% 95%, 0% 100%
  );
}

/* Fabric Textures */
.texture-linen {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'%3E%3Cpath fill='%23000' fill-opacity='0.08' d='M1 3h1v1H1V3zm2-2h1v1H3V1z'%3E%3C/path%3E%3C/svg%3E");
}

.texture-denim {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'%3E%3Cpath fill='%23fff' fill-opacity='0.12' d='M1 3h1v1H1V3zm2-2h1v1H3V1z'%3E%3C/path%3E%3C/svg%3E");
}

.texture-tweed {
  background-image: url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='0.15' fill-rule='evenodd'%3E%3Cpath d='M5 0h1L0 6V5zM6 5v1H5z'/%3E%3C/g%3E%3C/svg%3E");
}

.texture-silk {
  background-image: linear-gradient(135deg, rgba(255,255,255,0.2) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.2) 75%, transparent 75%, transparent);
  background-size: 4px 4px;
}

.texture-velvet {
  background-image: linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(0,0,0,0.1) 100%);
}

.texture-wool {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8'%3E%3Cg fill='%23000' fill-opacity='0.08'%3E%3Cpath d='M0 0h4v4H0V0zm4 4h4v4H4V4z'/%3E%3C/g%3E%3C/svg%3E");
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
  grid-template-columns: repeat(4, 1fr);
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
  justify-content: center;
  gap: 0.5rem;
  max-height: calc(100vh - 80px);
  overflow: hidden;
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
