<template>
  <section class="brands-section">
    <h2 class="section-title">{{ title }}</h2>
    <div class="brands-grid">
      <div 
        v-for="brand in brands" 
        :key="brand.name" 
        class="brand-card"
        @click="$emit('select', brand.name)"
      >
        <div class="brand-logo-container">
          <span class="brand-initial">{{ brand.initial || brand.name[0] }}</span>
        </div>
        <span class="brand-name">{{ brand.name }}</span>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: { type: String, default: 'Explore Brands' },
  brands: { type: Array, default: () => [] }
})

defineEmits(['select'])
</script>

<style scoped>
.brands-section {
  padding: 2rem 0;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 1.25rem;
}

.brands-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1rem;
}

.brand-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.brand-card:hover {
  border-color: #ddd;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}

.brand-logo-container {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #f5f5f5 0%, #eee 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-initial {
  font-size: 1.25rem;
  font-weight: 600;
  color: #555;
}

.brand-name {
  font-size: 0.85rem;
  color: #555;
  text-align: center;
}
</style>
