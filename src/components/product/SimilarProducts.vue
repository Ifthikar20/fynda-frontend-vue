<template>
  <section class="similar-products">
    <div class="section-header">
      <h3 class="section-title">{{ title }}</h3>
      <div class="filter-controls" v-if="showFilters">
        <button 
          v-for="filter in filters" 
          :key="filter.value"
          :class="['filter-btn', { active: activeFilter === filter.value }]"
          @click="activeFilter = filter.value"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>
    
    <div class="products-grid">
      <div 
        v-for="product in filteredProducts" 
        :key="product.id" 
        class="product-card"
        @click="$emit('select', product)"
      >
        <div class="product-image-container">
          <img :src="product.image_url" :alt="product.title" class="product-image" />
          <button 
            class="upvote-btn"
            :class="{ active: isUpvoted(product.id) }"
            @click.stop="$emit('upvote', product.id)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 19V5M5 12l7-7 7 7"/>
            </svg>
          </button>
        </div>
        <div class="product-info">
          <h4 class="product-title">{{ product.title }}</h4>
          <div class="product-price">{{ formatPrice(product.price) }}</div>
          <div v-if="product.source" class="product-source">{{ product.source }}</div>
        </div>
      </div>
    </div>
    
    <div v-if="!filteredProducts.length" class="empty-state">
      No similar products found
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  title: { type: String, default: 'Similar Products' },
  products: { type: Array, default: () => [] },
  showFilters: { type: Boolean, default: true },
  upvotedIds: { type: Set, default: () => new Set() }
})

defineEmits(['select', 'upvote'])

const activeFilter = ref('all')

const filters = [
  { value: 'all', label: 'All' },
  { value: 'style', label: 'Style' },
  { value: 'price', label: 'Price' },
  { value: 'brand', label: 'Brand' }
]

const filteredProducts = computed(() => {
  if (activeFilter.value === 'all') return props.products
  // Filtering logic based on filter type
  return props.products
})

const isUpvoted = (productId) => {
  return props.upvotedIds.has(productId)
}

const formatPrice = (price) => {
  if (!price) return ''
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD' 
  }).format(price)
}
</script>

<style scoped>
.similar-products {
  padding: 1.5rem 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.filter-controls {
  display: flex;
  gap: 0.5rem;
}

.filter-btn {
  background: #f5f5f5;
  border: none;
  border-radius: 16px;
  padding: 6px 14px;
  font-size: 0.8rem;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  background: #eee;
}

.filter-btn.active {
  background: #1a1a1a;
  color: #fff;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.product-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
}

.product-card:hover {
  border-color: #ddd;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.product-image-container {
  position: relative;
  aspect-ratio: 3/4;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.upvote-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #888;
  transition: all 0.2s;
  opacity: 0;
}

.product-card:hover .upvote-btn {
  opacity: 1;
}

.upvote-btn:hover {
  background: #fff;
  color: #1a1a1a;
}

.upvote-btn.active {
  background: #1a1a1a;
  color: #fff;
  opacity: 1;
}

.product-info {
  padding: 0.75rem;
}

.product-title {
  font-size: 0.85rem;
  font-weight: 500;
  color: #1a1a1a;
  margin: 0 0 0.25rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-price {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a1a1a;
}

.product-source {
  font-size: 0.75rem;
  color: #888;
  margin-top: 0.25rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #888;
  font-size: 0.9rem;
}
</style>
