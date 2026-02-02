<template>
  <Teleport to="body">
    <transition name="slide-up">
      <div v-if="showBanner" class="cookie-banner">
        <div class="cookie-content">
          <div class="cookie-text">
            <h3>🍪 Cookie Preferences</h3>
            <p>
              We use cookies to enhance your experience. Essential cookies are required for basic functionality.
              <router-link to="/cookies" class="cookie-link">Learn more</router-link>
            </p>
          </div>
          
          <!-- Customize Panel -->
          <div v-if="showCustomize" class="cookie-customize">
            <div class="cookie-category">
              <div class="category-info">
                <span class="category-name">Essential</span>
                <span class="category-desc">Required for site function</span>
              </div>
              <label class="toggle disabled">
                <input type="checkbox" checked disabled />
                <span class="toggle-slider"></span>
              </label>
            </div>
            
            <div class="cookie-category">
              <div class="category-info">
                <span class="category-name">Functional</span>
                <span class="category-desc">Preferences & personalization</span>
              </div>
              <label class="toggle">
                <input type="checkbox" v-model="preferences.functional" />
                <span class="toggle-slider"></span>
              </label>
            </div>
            
            <div class="cookie-category">
              <div class="category-info">
                <span class="category-name">Analytics</span>
                <span class="category-desc">Usage & performance data</span>
              </div>
              <label class="toggle">
                <input type="checkbox" v-model="preferences.analytics" />
                <span class="toggle-slider"></span>
              </label>
            </div>
            
            <div class="cookie-category">
              <div class="category-info">
                <span class="category-name">Marketing</span>
                <span class="category-desc">Personalized recommendations</span>
              </div>
              <label class="toggle">
                <input type="checkbox" v-model="preferences.marketing" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
          
          <div class="cookie-actions">
            <button v-if="!showCustomize" class="btn-secondary" @click="showCustomize = true">
              Customize
            </button>
            <button v-if="showCustomize" class="btn-secondary" @click="savePreferences">
              Save Preferences
            </button>
            <button class="btn-secondary" @click="handleRejectAll">
              Reject All
            </button>
            <button class="btn-primary" @click="handleAcceptAll">
              Accept All
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { hasConsented, acceptAll, rejectAll, setConsent } from '@/services/cookieService'

const showBanner = ref(false)
const showCustomize = ref(false)
const preferences = ref({
  functional: false,
  analytics: false,
  marketing: false
})

onMounted(() => {
  // Show banner if user hasn't consented yet
  if (!hasConsented()) {
    // Small delay for better UX
    setTimeout(() => {
      showBanner.value = true
    }, 1000)
  }
})

const handleAcceptAll = () => {
  acceptAll()
  showBanner.value = false
}

const handleRejectAll = () => {
  rejectAll()
  showBanner.value = false
}

const savePreferences = () => {
  setConsent(preferences.value)
  showBanner.value = false
}
</script>

<style scoped>
.cookie-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #1a1a1a;
  color: #fff;
  padding: 20px 24px;
  z-index: 10000;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.2);
}

.cookie-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 20px;
}

.cookie-text {
  flex: 1;
  min-width: 280px;
}

.cookie-text h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
}

.cookie-text p {
  font-size: 13px;
  color: #aaa;
  line-height: 1.5;
  margin: 0;
}

.cookie-link {
  color: #fff;
  text-decoration: underline;
  margin-left: 4px;
}

.cookie-customize {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  padding: 16px 0;
  border-top: 1px solid #333;
  border-bottom: 1px solid #333;
  margin: 8px 0;
}

.cookie-category {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #2a2a2a;
  border-radius: 8px;
}

.category-info {
  display: flex;
  flex-direction: column;
}

.category-name {
  font-size: 13px;
  font-weight: 500;
}

.category-desc {
  font-size: 11px;
  color: #888;
}

/* Toggle switch */
.toggle {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 22px;
  cursor: pointer;
}

.toggle.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  inset: 0;
  background: #444;
  border-radius: 22px;
  transition: 0.2s;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background: #fff;
  border-radius: 50%;
  transition: 0.2s;
}

.toggle input:checked + .toggle-slider {
  background: #10b981;
}

.toggle input:checked + .toggle-slider::before {
  transform: translateX(18px);
}

/* Buttons */
.cookie-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: #fff;
  color: #1a1a1a;
}

.btn-primary:hover {
  background: #f0f0f0;
}

.btn-secondary {
  background: transparent;
  color: #fff;
  border: 1px solid #444;
}

.btn-secondary:hover {
  background: #333;
  border-color: #555;
}

/* Animation */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

@media (max-width: 600px) {
  .cookie-banner {
    padding: 16px;
  }
  
  .cookie-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .cookie-actions {
    justify-content: stretch;
  }
  
  .cookie-actions button {
    flex: 1;
    min-width: 0;
  }
}
</style>
