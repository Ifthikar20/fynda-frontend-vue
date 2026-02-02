<template>
  <nav class="category-nav">
    <button 
      v-for="category in categories" 
      :key="category.value"
      :class="['category-btn', { active: modelValue === category.value }]"
      @click="$emit('update:modelValue', category.value)"
    >
      {{ category.label }}
    </button>
  </nav>
</template>

<script setup>
defineProps({
  modelValue: { type: String, default: 'all' },
  categories: { 
    type: Array, 
    default: () => [
      { value: 'all', label: 'All' },
      { value: 'women', label: 'Women' },
      { value: 'men', label: 'Men' },
      { value: 'home', label: 'Home' },
      { value: 'beauty', label: 'Beauty' }
    ]
  }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.category-nav {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  padding: 1rem 0;
}

.category-btn {
  background: transparent;
  border: 1px solid #e0e0e0;
  border-radius: 24px;
  padding: 8px 20px;
  font-size: 0.9rem;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-btn:hover {
  border-color: #ccc;
  color: #333;
}

.category-btn.active {
  background: #1a1a1a;
  border-color: #1a1a1a;
  color: #fff;
}
</style>
