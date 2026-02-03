<template>
  <article class="deal-card" @click="$emit('click')">
    <div class="card-image">
      <img :src="deal.image_url" :alt="deal.title" loading="lazy" />
      <div class="card-overlay">
        <button 
          class="action-btn upvote-btn" 
          :class="{ 'upvoted': isUpvoted }"
          @click.stop="handleUpvote"
          title="Upvote this deal"
        >
          <img src="@/assets/upvote-logo.png" alt="Upvote" class="upvote-icon" />
          <span class="upvote-count">{{ upvoteCount }}</span>
        </button>
        <button class="action-btn" @click.stop="handleFavorite">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        <button class="action-btn" @click.stop="handleShare">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
          </svg>
        </button>
      </div>
      <span class="source-badge">{{ deal.merchant_name || deal.source }}</span>
      <span v-if="deal.discount_percent >= 15" class="discount-badge">
        -{{ deal.discount_percent }}%
      </span>
    </div>
    
    <div class="card-content">
      <h3 class="card-title">{{ deal.title }}</h3>
      
      <div class="card-pricing">
        <span class="current-price">${{ deal.price.toFixed(2) }}</span>
        <span v-if="deal.original_price > deal.price" class="original-price">
          ${{ deal.original_price.toFixed(2) }}
        </span>
      </div>
      
      <div class="card-meta">
        <span class="card-rating" v-if="deal.rating">
          {{ deal.rating }}
        </span>
        <span class="card-reviews" v-if="deal.reviews_count">
          ({{ formatReviews(deal.reviews_count) }})
        </span>
      </div>
      
      <div class="card-shipping" v-if="deal.shipping">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        </svg>
        {{ deal.shipping }}
      </div>
      
      <div class="card-tags" v-if="deal.features?.length">
        <span 
          v-for="tag in deal.features.slice(0, 4)" 
          :key="tag" 
          class="tag"
        >
          {{ tag }}
        </span>
      </div>
    </div>
  </article>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { eventBus, Events } from '../events/eventBus'

const props = defineProps({
  deal: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click', 'upvote'])

// Upvote state
const isUpvoted = ref(false)
const upvoteCount = ref(0)

// Load upvote state from localStorage
onMounted(() => {
  const dealId = props.deal.id
  const upvotedDeals = JSON.parse(localStorage.getItem('upvotedDeals') || '{}')
  const dealUpvotes = JSON.parse(localStorage.getItem('dealUpvotes') || '{}')
  
  isUpvoted.value = !!upvotedDeals[dealId]
  upvoteCount.value = dealUpvotes[dealId] || props.deal.upvotes || 0
})

const formatReviews = (count) => {
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k'
  }
  return count
}

const formatUpvotes = (count) => {
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k'
  }
  return count
}

const handleUpvote = () => {
  const dealId = props.deal.id
  const merchantName = props.deal.merchant_name || props.deal.source || 'unknown'
  
  // Toggle upvote state
  isUpvoted.value = !isUpvoted.value
  
  // Update count
  if (isUpvoted.value) {
    upvoteCount.value++
  } else {
    upvoteCount.value = Math.max(0, upvoteCount.value - 1)
  }
  
  // Persist to localStorage
  const upvotedDeals = JSON.parse(localStorage.getItem('upvotedDeals') || '{}')
  const dealUpvotes = JSON.parse(localStorage.getItem('dealUpvotes') || '{}')
  const brandUpvotes = JSON.parse(localStorage.getItem('brandUpvotes') || '{}')
  
  if (isUpvoted.value) {
    upvotedDeals[dealId] = true
    dealUpvotes[dealId] = upvoteCount.value
    
    // Track brand-level upvotes
    brandUpvotes[merchantName] = (brandUpvotes[merchantName] || 0) + 1
  } else {
    delete upvotedDeals[dealId]
    dealUpvotes[dealId] = upvoteCount.value
    
    // Decrease brand upvotes
    brandUpvotes[merchantName] = Math.max(0, (brandUpvotes[merchantName] || 1) - 1)
  }
  
  localStorage.setItem('upvotedDeals', JSON.stringify(upvotedDeals))
  localStorage.setItem('dealUpvotes', JSON.stringify(dealUpvotes))
  localStorage.setItem('brandUpvotes', JSON.stringify(brandUpvotes))
  
  // Emit event for global ranking updates
  eventBus.emit(Events.DEAL_UPVOTE || 'deal:upvote', {
    deal: props.deal,
    upvoted: isUpvoted.value,
    upvoteCount: upvoteCount.value,
    merchantName,
  })
  
  emit('upvote', {
    dealId,
    upvoted: isUpvoted.value,
    count: upvoteCount.value,
  })
}

const handleFavorite = () => {
  eventBus.emit(Events.DEAL_FAVORITE, props.deal)
}

const handleShare = () => {
  eventBus.emit(Events.DEAL_SHARE, props.deal)
  navigator.clipboard?.writeText(props.deal.url)
}
</script>

<style scoped>
.deal-card {
  background: #fff;
  border-radius: 24px;
  overflow: hidden;
  margin-bottom: 20px;
  break-inside: avoid;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
}

.deal-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.1);
}

.card-image {
  position: relative;
  overflow: hidden;
  background: #f9f9f9;
}

.card-image img {
  width: 100%;
  height: auto;
  min-height: 200px;
  object-fit: cover;
  display: block;
  transition: transform 0.4s ease;
}

.deal-card:hover .card-image img {
  transform: scale(1.06);
}

.card-overlay {
  position: absolute;
  top: 14px;
  right: 14px;
  display: flex;
  gap: 10px;
  opacity: 0;
  transition: opacity 0.25s ease;
}

.deal-card:hover .card-overlay {
  opacity: 1;
}

.action-btn {
  width: 42px;
  height: 42px;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.action-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

/* Upvote Button Styles */
.upvote-btn {
  position: relative;
  flex-direction: column;
  width: 36px;
  height: 40px;
  padding: 4px;
  background: rgba(255, 255, 255, 0.98);
  gap: 2px;
}

.upvote-btn:hover {
  background: #fff;
}

.upvote-btn.upvoted {
  background: #1a1a1a;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.upvote-btn.upvoted .upvote-icon {
  filter: brightness(0) invert(1);
}

.upvote-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
  transition: all 0.2s ease;
}

.upvote-btn:hover .upvote-icon {
  transform: translateY(-2px);
}

.upvote-btn.upvoted:hover .upvote-icon {
  transform: translateY(-2px);
}

.upvote-count {
  font-size: 9px;
  font-weight: 600;
  color: #666;
  margin-top: 1px;
  line-height: 1;
}

.upvote-btn.upvoted .upvote-count {
  color: #fff;
}

.source-badge {
  position: absolute;
  bottom: 14px;
  left: 14px;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
}

.discount-badge {
  position: absolute;
  top: 14px;
  left: 14px;
  background: #666;
  color: #fff;
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
}

.card-content {
  padding: 20px;
}

.card-title {
  font-size: 17px;
  font-weight: 600;
  color: #111;
  line-height: 1.45;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-pricing {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.current-price {
  font-size: 24px;
  font-weight: 700;
  color: #111;
}

.original-price {
  font-size: 16px;
  color: #999;
  text-decoration: line-through;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.card-rating {
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-shipping {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #22a861;
  margin-bottom: 14px;
}

.shipping-icon {
  font-size: 14px;
}

.card-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  padding: 6px 12px;
  background: #f5f5f5;
  border-radius: 8px;
  font-size: 12px;
  color: #555;
  text-transform: capitalize;
}
</style>
