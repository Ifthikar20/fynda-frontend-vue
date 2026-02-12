<template>
  <Teleport to="body">
    <!-- Cookie Banner -->
    <transition name="slide-up">
      <div v-if="showBanner" class="cookie-overlay">
        <div class="cookie-banner" :class="{ expanded: showDetails }">
          <!-- Header -->
          <div class="cookie-header">
            <div class="cookie-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                <path d="M8 12h.01M12 12h.01M16 12h.01"/>
              </svg>
            </div>
            <div class="cookie-header-text">
              <h3>We value your privacy</h3>
              <p>
                We use cookies to enhance your experience, analyze site traffic, and serve personalized content.
                <router-link to="/cookies" class="cookie-policy-link">Cookie Policy</router-link>
              </p>
            </div>
          </div>

          <!-- Detailed Preferences Panel -->
          <transition name="expand">
            <div v-if="showDetails" class="cookie-details">
              <div class="cookie-categories">
                <!-- Essential -->
                <div class="cookie-cat">
                  <div class="cat-header">
                    <div class="cat-title-row">
                      <span class="cat-name">Essential</span>
                      <span class="cat-badge required">Always Active</span>
                    </div>
                    <p class="cat-desc">
                      Authentication, security, and basic site functionality. These cannot be disabled.
                    </p>
                  </div>
                  <label class="cookie-toggle always-on">
                    <input type="checkbox" checked disabled />
                    <span class="toggle-track"><span class="toggle-thumb"></span></span>
                  </label>
                </div>

                <!-- Functional -->
                <div class="cookie-cat">
                  <div class="cat-header">
                    <div class="cat-title-row">
                      <span class="cat-name">Functional</span>
                      <span class="cat-badge">Optional</span>
                    </div>
                    <p class="cat-desc">
                      Remembers your preferences like theme, language, currency, and recent searches.
                    </p>
                  </div>
                  <label class="cookie-toggle">
                    <input type="checkbox" v-model="preferences.functional" />
                    <span class="toggle-track"><span class="toggle-thumb"></span></span>
                  </label>
                </div>

                <!-- Analytics -->
                <div class="cookie-cat">
                  <div class="cat-header">
                    <div class="cat-title-row">
                      <span class="cat-name">Analytics</span>
                      <span class="cat-badge">Optional</span>
                    </div>
                    <p class="cat-desc">
                      Anonymous usage and performance data to help us improve the platform.
                    </p>
                  </div>
                  <label class="cookie-toggle">
                    <input type="checkbox" v-model="preferences.analytics" />
                    <span class="toggle-track"><span class="toggle-thumb"></span></span>
                  </label>
                </div>

                <!-- Marketing -->
                <div class="cookie-cat">
                  <div class="cat-header">
                    <div class="cat-title-row">
                      <span class="cat-name">Marketing</span>
                      <span class="cat-badge">Optional</span>
                    </div>
                    <p class="cat-desc">
                      Personalized product recommendations and relevant advertisements.
                    </p>
                  </div>
                  <label class="cookie-toggle">
                    <input type="checkbox" v-model="preferences.marketing" />
                    <span class="toggle-track"><span class="toggle-thumb"></span></span>
                  </label>
                </div>
              </div>
            </div>
          </transition>

          <!-- Actions -->
          <div class="cookie-actions">
            <button
              v-if="!showDetails"
              class="cookie-btn secondary"
              @click="showDetails = true"
            >
              Customize
            </button>
            <button
              v-if="showDetails"
              class="cookie-btn secondary"
              @click="saveCustomPreferences"
            >
              Save My Preferences
            </button>
            <button class="cookie-btn outline" @click="handleNecessaryOnly">
              Necessary Only
            </button>
            <button class="cookie-btn primary" @click="handleAcceptAll">
              Accept All
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import {
  hasConsented,
  acceptAll,
  rejectAll,
  setConsent,
  getConsent
} from '@/services/cookieService'

const showBanner = ref(false)
const showDetails = ref(false)
const preferences = ref({
  functional: false,
  analytics: false,
  marketing: false
})

// Listen for reopen event from profile page
const handleReopenBanner = () => {
  // Load current preferences for editing
  const current = getConsent()
  if (current) {
    preferences.value.functional = current.functional || false
    preferences.value.analytics = current.analytics || false
    preferences.value.marketing = current.marketing || false
  }
  showDetails.value = true
  showBanner.value = true
}

onMounted(() => {
  if (!hasConsented()) {
    setTimeout(() => {
      showBanner.value = true
    }, 800)
  }

  window.addEventListener('fynda:reopen-cookie-banner', handleReopenBanner)
})

onUnmounted(() => {
  window.removeEventListener('fynda:reopen-cookie-banner', handleReopenBanner)
})

const handleAcceptAll = () => {
  acceptAll()
  showBanner.value = false
  showDetails.value = false
}

const handleNecessaryOnly = () => {
  rejectAll()
  showBanner.value = false
  showDetails.value = false
}

const saveCustomPreferences = () => {
  setConsent(preferences.value)
  showBanner.value = false
  showDetails.value = false
}
</script>

<style scoped>
.cookie-overlay {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10000;
  padding: 16px;
  pointer-events: none;
}

.cookie-banner {
  max-width: 560px;
  margin: 0 auto 0 0;
  background: rgba(18, 18, 20, 0.97);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 24px;
  color: #fff;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.05) inset;
  pointer-events: all;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.cookie-banner.expanded {
  max-width: 580px;
}

/* Header */
.cookie-header {
  display: flex;
  gap: 14px;
  margin-bottom: 20px;
}

.cookie-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cookie-icon svg {
  opacity: 0.7;
}

.cookie-header-text h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
  letter-spacing: -0.01em;
}

.cookie-header-text p {
  font-size: 13px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.55);
  margin: 0;
}

.cookie-policy-link {
  color: rgba(255, 255, 255, 0.75);
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: color 0.2s;
}

.cookie-policy-link:hover {
  color: #fff;
}

/* Details Panel */
.cookie-details {
  margin-bottom: 20px;
  overflow: hidden;
}

.cookie-categories {
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 14px;
  overflow: hidden;
}

.cookie-cat {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  gap: 16px;
  background: rgba(255, 255, 255, 0.02);
  transition: background 0.2s;
}

.cookie-cat:hover {
  background: rgba(255, 255, 255, 0.05);
}

.cat-header {
  flex: 1;
  min-width: 0;
}

.cat-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.cat-name {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.cat-badge {
  font-size: 10px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.45);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.cat-badge.required {
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.7);
}

.cat-desc {
  font-size: 12px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
}

/* Toggle Switch */
.cookie-toggle {
  position: relative;
  flex-shrink: 0;
  cursor: pointer;
}

.cookie-toggle.always-on {
  opacity: 0.5;
  cursor: not-allowed;
}

.cookie-toggle input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-track {
  display: block;
  width: 44px;
  height: 24px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 24px;
  transition: background 0.25s ease;
  position: relative;
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.cookie-toggle input:checked + .toggle-track {
  background: #fff;
}

.cookie-toggle input:checked + .toggle-track .toggle-thumb {
  transform: translateX(20px);
  background: #111;
}

/* Actions */
.cookie-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.cookie-btn {
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  letter-spacing: -0.01em;
}

.cookie-btn.primary {
  background: #fff;
  color: #111;
  flex: 1;
}

.cookie-btn.primary:hover {
  background: #f0f0f0;
  transform: translateY(-1px);
}

.cookie-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.cookie-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.2);
}

.cookie-btn.outline {
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.cookie-btn.outline:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.2);
  color: #fff;
}

/* Animations */
.slide-up-enter-active {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
}

.slide-up-leave-active {
  transition: transform 0.3s ease, opacity 0.2s ease;
}

.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 400px;
  opacity: 1;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

/* Responsive */
@media (max-width: 600px) {
  .cookie-overlay {
    padding: 12px;
  }

  .cookie-banner {
    padding: 20px;
    border-radius: 16px;
    max-width: 100%;
  }

  .cookie-header {
    flex-direction: column;
    gap: 12px;
  }

  .cookie-icon {
    width: 36px;
    height: 36px;
  }

  .cookie-actions {
    flex-direction: column;
  }

  .cookie-btn {
    width: 100%;
    text-align: center;
    padding: 12px 18px;
  }

  .cookie-cat {
    padding: 14px;
  }
}
</style>
