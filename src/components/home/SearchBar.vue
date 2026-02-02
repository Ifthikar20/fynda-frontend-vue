<template>
  <div class="search-bar-container">
    <div class="ai-search-bar" :class="{ focused: isSearchFocused }">
      <div class="search-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
      </div>
      <input 
        type="text" 
        class="ai-search-input"
        v-model="searchQuery"
        @keyup.enter="handleSearch"
        @focus="isSearchFocused = true"
        @blur="handleBlur"
        :placeholder="placeholder"
      />
      <span v-if="!searchQuery && !isSearchFocused && animatedText" class="ai-animated-placeholder">
        {{ animatedText }}
      </span>
      
      <!-- Image Upload Button -->
      <label class="image-upload-btn" title="Search by image">
        <input type="file" accept="image/*" @change="handleImageUpload" hidden />
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <path d="m21 15-5-5L5 21"/>
        </svg>
      </label>
      
      <!-- Search Button -->
      <button class="search-btn" @click="handleSearch" :disabled="loading">
        <span v-if="loading" class="spinner"></span>
        <span v-else>Search</span>
      </button>
    </div>
    
    <!-- Quick Suggestions -->
    <div v-if="suggestions.length" class="quick-suggestions">
      <span class="suggestion-label">Try:</span>
      <button 
        v-for="suggestion in suggestions" 
        :key="suggestion" 
        @click="$emit('suggest', suggestion)"
      >
        {{ suggestion }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Search for best deals...' },
  animatedText: { type: String, default: null },
  suggestions: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'search', 'image-search', 'suggest'])

const isSearchFocused = ref(false)
const searchQuery = ref(props.modelValue)

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    emit('update:modelValue', searchQuery.value)
    emit('search', searchQuery.value)
  }
}

const handleBlur = () => {
  setTimeout(() => {
    isSearchFocused.value = false
  }, 100)
}

const handleImageUpload = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  
  // Validate
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    alert('Please upload a JPEG, PNG, or WebP image')
    return
  }
  
  if (file.size > 5 * 1024 * 1024) {
    alert('Image must be under 5MB')
    return
  }
  
  // Convert to base64
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
  
  emit('image-search', base64)
  event.target.value = ''
}
</script>

<style scoped>
.search-bar-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.ai-search-bar {
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 50px;
  padding: 12px 20px;
  gap: 12px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.ai-search-bar.focused {
  border-color: #1a1a1a;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.search-icon {
  color: #888;
  display: flex;
  flex-shrink: 0;
}

.ai-search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 1rem;
  background: transparent;
  color: #1a1a1a;
}

.ai-search-input::placeholder {
  color: #aaa;
}

.ai-animated-placeholder {
  position: absolute;
  left: 56px;
  color: #888;
  pointer-events: none;
  font-size: 1rem;
}

.image-upload-btn {
  cursor: pointer;
  color: #888;
  display: flex;
  padding: 6px;
  border-radius: 8px;
  transition: all 0.2s;
}

.image-upload-btn:hover {
  color: #1a1a1a;
  background: #f5f5f5;
}

.search-btn {
  background: #1a1a1a;
  color: #fff;
  border: none;
  border-radius: 24px;
  padding: 10px 24px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.search-btn:hover:not(:disabled) {
  background: #333;
}

.search-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.quick-suggestions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.suggestion-label {
  font-size: 0.85rem;
  color: #888;
}

.quick-suggestions button {
  background: #f5f5f5;
  border: none;
  border-radius: 16px;
  padding: 6px 14px;
  font-size: 0.85rem;
  color: #555;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-suggestions button:hover {
  background: #eee;
  color: #1a1a1a;
}
</style>
