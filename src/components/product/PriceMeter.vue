<template>
  <div class="price-meter">
    <div class="meter-header">
      <span class="meter-title">Price Comparison</span>
      <button class="toggle-btn" @click="isExpanded = !isExpanded">
        {{ isExpanded ? 'Hide' : 'Show' }}
      </button>
    </div>
    
    <Transition name="slide">
      <div v-if="isExpanded" class="meter-body">
        <div class="meter-track">
          <div class="meter-gradient"></div>
          <div 
            class="meter-marker" 
            :style="{ bottom: markerPosition + '%' }"
          >
            <span class="marker-label">{{ formatPrice(currentPrice) }}</span>
          </div>
        </div>
        
        <div class="meter-labels">
          <div class="label low">
            <span class="label-text">Low</span>
            <span class="label-value">{{ formatPrice(lowPrice) }}</span>
          </div>
          <div class="label avg">
            <span class="label-text">Avg</span>
            <span class="label-value">{{ formatPrice(avgPrice) }}</span>
          </div>
          <div class="label high">
            <span class="label-text">High</span>
            <span class="label-value">{{ formatPrice(highPrice) }}</span>
          </div>
        </div>
        
        <div class="verdict" :class="verdictClass">
          {{ verdict }}
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  currentPrice: { type: Number, required: true },
  lowPrice: { type: Number, required: true },
  avgPrice: { type: Number, required: true },
  highPrice: { type: Number, required: true }
})

const isExpanded = ref(true)

const markerPosition = computed(() => {
  const range = props.highPrice - props.lowPrice
  if (range <= 0) return 50
  const position = ((props.currentPrice - props.lowPrice) / range) * 100
  return Math.min(100, Math.max(0, position))
})

const verdictClass = computed(() => {
  if (props.currentPrice <= props.lowPrice * 1.1) return 'great'
  if (props.currentPrice <= props.avgPrice) return 'good'
  if (props.currentPrice <= props.highPrice * 0.9) return 'fair'
  return 'high'
})

const verdict = computed(() => {
  switch (verdictClass.value) {
    case 'great': return 'Great Price!'
    case 'good': return 'Good Deal'
    case 'fair': return 'Fair Price'
    default: return 'Above Average'
  }
})

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD' 
  }).format(price)
}
</script>

<style scoped>
.price-meter {
  background: #f9f9f9;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.meter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.meter-title {
  font-weight: 600;
  font-size: 0.9rem;
  color: #1a1a1a;
}

.toggle-btn {
  background: none;
  border: none;
  color: #666;
  font-size: 0.8rem;
  cursor: pointer;
}

.toggle-btn:hover {
  color: #1a1a1a;
}

.meter-body {
  display: flex;
  gap: 1rem;
  align-items: stretch;
}

.meter-track {
  width: 24px;
  height: 120px;
  background: #eee;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}

.meter-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, #10b981, #f59e0b, #ef4444);
  border-radius: 12px;
}

.meter-marker {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 3px;
  background: #1a1a1a;
  border-radius: 2px;
}

.marker-label {
  position: absolute;
  left: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%);
  white-space: nowrap;
  font-size: 0.75rem;
  font-weight: 600;
  color: #1a1a1a;
}

.meter-labels {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1;
}

.label {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
}

.label-text { color: #888; }
.label-value { font-weight: 500; color: #1a1a1a; }

.verdict {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-align: center;
  align-self: center;
}

.verdict.great { background: #d1fae5; color: #059669; }
.verdict.good { background: #dbeafe; color: #2563eb; }
.verdict.fair { background: #fef3c7; color: #d97706; }
.verdict.high { background: #fee2e2; color: #dc2626; }

/* Transition */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>
