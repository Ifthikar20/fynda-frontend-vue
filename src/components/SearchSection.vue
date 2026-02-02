<template>
  <section class="prompt-section">
    <div class="prompt-module">
      <!-- Image Preview -->
      <div v-if="selectedImage" class="image-preview">
        <img :src="selectedImage.preview" alt="Upload preview" class="preview-img" />
        <div class="preview-info">
          <span class="preview-name">{{ selectedImage.name }}</span>
          <span class="preview-size">{{ formatFileSize(selectedImage.size) }}</span>
        </div>
        <button class="remove-btn" @click="removeImage">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div class="prompt-input-area">
        <textarea
          v-model="query"
          class="prompt-input"
          :placeholder="selectedImage ? 'Add description (optional)...' : 'Search for the best deals...'"
          rows="3"
          @keydown.enter.prevent="handleSearch"
          :disabled="loading"
        ></textarea>
      </div>
      
      <!-- Hidden file input -->
      <input
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        class="hidden-input"
        @change="handleFileSelect"
      />
      
      <div class="prompt-toolbar">
        <div class="toolbar-left">
          <button class="toolbar-btn" @click="triggerFileUpload">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <span class="btn-text">Upload Image</span>
          </button>
          <button class="toolbar-btn" @click="triggerFileUpload">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span class="btn-text">Visual Search</span>
          </button>
        </div>
        
        <div class="toolbar-right">
          <span v-if="error" class="error-text">{{ error }}</span>
          <button 
            class="submit-btn" 
            @click="handleSearch"
            :disabled="loading || (!query.trim() && !selectedImage)"
          >
            <span v-if="loading" class="spinner"></span>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 19V5M5 12l7-7 7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['search', 'image-search'])
const props = defineProps({
  loading: Boolean
})

const query = ref('')
const selectedImage = ref(null)
const error = ref('')
const fileInput = ref(null)

// Constants
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const triggerFileUpload = () => {
  fileInput.value?.click()
}

const handleFileSelect = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  
  error.value = ''
  
  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    error.value = 'Please upload JPEG, PNG, or WebP'
    return
  }
  
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    error.value = 'Image must be under 5MB'
    return
  }
  
  // Create preview and store file data
  const preview = await createPreview(file)
  const base64 = await fileToBase64(file)
  
  selectedImage.value = {
    file,
    preview,
    base64,
    name: file.name,
    size: file.size
  }
  
  // Clear file input for re-uploads
  event.target.value = ''
}

const createPreview = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.readAsDataURL(file)
  })
}

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      // Remove data URL prefix to get pure base64
      const base64 = reader.result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const removeImage = () => {
  selectedImage.value = null
  error.value = ''
}

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const handleSearch = () => {
  if (selectedImage.value) {
    // Emit image search with optional text query
    emit('image-search', {
      image: selectedImage.value.base64,
      query: query.value.trim()
    })
  } else if (query.value.trim()) {
    // Text-only search
    emit('search', query.value.trim())
  }
}
</script>

<style scoped>
.prompt-section {
  padding: 56px 16px 48px;
  display: flex;
  justify-content: center;
}

.prompt-module {
  width: 100%;
  max-width: 900px;
  background: #f8f8f8;
  border: 1px solid #e5e5e5;
  border-radius: 24px;
  padding: 24px 28px 20px;
  box-shadow: 
    0 4px 24px rgba(0, 0, 0, 0.03),
    0 1px 3px rgba(0, 0, 0, 0.02);
}

/* Image Preview */
.image-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: 10px 12px;
  margin-bottom: 16px;
}

.preview-img {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 8px;
}

.preview-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.preview-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: #1a1a1a;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-size {
  font-size: 0.75rem;
  color: #888;
}

.remove-btn {
  width: 32px;
  height: 32px;
  background: #f5f5f5;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: #fef2f2;
  color: #ef4444;
}

/* Hidden Input */
.hidden-input {
  display: none;
}

.prompt-input-area {
  margin-bottom: 16px;
}

.prompt-input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 18px;
  line-height: 1.6;
  color: #111;
  resize: none;
  font-family: inherit;
  background: transparent;
}

.prompt-input::placeholder {
  color: #999;
}

.prompt-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid #e8e8e8;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: transparent;
  border: none;
  border-radius: 12px;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toolbar-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #1a1a1a;
}

.error-text {
  font-size: 0.8rem;
  color: #ef4444;
  margin-right: 8px;
}

.submit-btn {
  width: 44px;
  height: 44px;
  background: #1a1a1a;
  border: none;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  background: #333;
  transform: scale(1.05);
}

.submit-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid transparent;
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 600px) {
  .btn-text {
    display: none;
  }
  
  .toolbar-btn {
    padding: 10px;
  }
  
  .prompt-module {
    padding: 20px;
  }
  
  .preview-name {
    max-width: 120px;
  }
}
</style>
