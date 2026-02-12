<template>
  <div class="profile-page">
    <NavBar />
    
    <main class="profile-content">
      <div class="profile-container">
        <!-- Sidebar Navigation -->
        <aside class="profile-sidebar">
          <div class="user-card">
            <div class="avatar">
              <img v-if="user?.avatar" :src="user.avatar" :alt="user.first_name" />
              <span v-else class="avatar-initial">{{ userInitial }}</span>
            </div>
            <h3 class="user-name">{{ fullName }}</h3>
            <p class="user-email">{{ user?.email }}</p>
          </div>
          
          <nav class="sidebar-nav">
            <button 
              v-for="tab in tabs" 
              :key="tab.id"
              :class="['nav-item', { active: activeTab === tab.id }]"
              @click="activeTab = tab.id"
            >
              <span class="nav-icon" v-html="tab.icon"></span>
              {{ tab.label }}
            </button>
          </nav>
          
          <button class="logout-btn" @click="handleLogout">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign Out
          </button>
        </aside>
        
        <!-- Main Content Area -->
        <section class="profile-main">
          <!-- Profile Tab -->
          <div v-if="activeTab === 'profile'" class="tab-content">
            <div class="section-header">
              <h2>Profile Information</h2>
              <p>Update your personal details and how others see you on Fynda</p>
            </div>
            
            <form @submit.prevent="saveProfile" class="profile-form">
              <div class="form-row">
                <div class="form-group">
                  <label>First Name</label>
                  <input 
                    v-model="profileForm.first_name" 
                    type="text" 
                    placeholder="Enter first name"
                  />
                </div>
                <div class="form-group">
                  <label>Last Name</label>
                  <input 
                    v-model="profileForm.last_name" 
                    type="text" 
                    placeholder="Enter last name"
                  />
                </div>
              </div>
              
              <div class="form-group">
                <label>Email Address</label>
                <input 
                  v-model="profileForm.email" 
                  type="email" 
                  placeholder="Enter email"
                  disabled
                />
                <span class="input-hint">Email cannot be changed</span>
              </div>
              
              <div class="form-actions">
                <button type="submit" class="btn-primary" :disabled="saving">
                  {{ saving ? 'Saving...' : 'Save Changes' }}
                </button>
                <span v-if="saveSuccess" class="success-message">✓ Profile updated</span>
              </div>
            </form>
            
            <!-- Account Activity -->
            <div class="account-activity">
              <h3 class="activity-title">Account Information</h3>
              <div class="activity-grid">
                <div class="activity-item">
                  <span class="activity-label">Member Since</span>
                  <span class="activity-value">{{ memberSince }}</span>
                </div>
                <div class="activity-item">
                  <span class="activity-label">Login Method</span>
                  <span class="activity-value">
                    <span class="login-badge">
                      <svg v-if="loginProvider === 'google'" width="14" height="14" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                      {{ loginProvider === 'google' ? 'Google' : 'Email & Password' }}
                    </span>
                  </span>
                </div>
                <div class="activity-item">
                  <span class="activity-label">Account Status</span>
                  <span class="activity-value"><span class="status-dot"></span> Active</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- My Library Tab -->
          <div v-if="activeTab === 'library'" class="tab-content">
            <div class="section-header">
              <h2>My Library</h2>
              <p>Products you've saved for later</p>
            </div>
            
            <div v-if="libraryItems.length === 0" class="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
              <h3>Your library is empty</h3>
              <p>Save products from product pages to view them here</p>
              <router-link to="/" class="btn-primary">Explore Products</router-link>
            </div>
            
            <div v-else class="library-grid">
              <div v-for="item in libraryItems" :key="item.id" class="library-card" @click="goToProduct(item.id)">
                <img :src="item.image_url" :alt="item.title" class="library-image" />
                <div class="library-info">
                  <span class="library-brand">{{ item.brand }}</span>
                  <h4>{{ item.title }}</h4>
                  <span class="library-price">${{ item.price }}</span>
                  <span class="library-date">Saved {{ formatDate(item.savedAt) }}</span>
                </div>
                <button class="remove-btn" @click.stop="removeFromLibrary(item.id)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Settings Tab -->
          <div v-if="activeTab === 'settings'" class="tab-content">
            <div class="section-header">
              <h2>Account Settings</h2>
              <p>Manage your account preferences and display options</p>
            </div>
            
            <div class="settings-section">
              <h3>Display Preferences</h3>
              
              <div class="setting-item">
                <div class="setting-info">
                  <span class="setting-label">Theme</span>
                  <span class="setting-desc">Choose your preferred color scheme</span>
                </div>
                <select v-model="settings.theme" @change="updateSetting('theme', settings.theme)">
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>
              
              <div class="setting-item">
                <div class="setting-info">
                  <span class="setting-label">Currency</span>
                  <span class="setting-desc">Default currency for prices</span>
                </div>
                <select v-model="settings.currency" @change="updateSetting('currency', settings.currency)">
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD ($)</option>
                </select>
              </div>
              
              <div class="setting-item">
                <div class="setting-info">
                  <span class="setting-label">Show Sold Items</span>
                  <span class="setting-desc">Include sold-out products in search results</span>
                </div>
                <label class="toggle">
                  <input type="checkbox" v-model="settings.show_sold_items" @change="updateSetting('show_sold_items', settings.show_sold_items)" />
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
            
            <div class="settings-section">
              <h3>Privacy</h3>
              
              <div class="setting-item">
                <div class="setting-info">
                  <span class="setting-label">Save Search History</span>
                  <span class="setting-desc">Store your searches for better recommendations</span>
                </div>
                <label class="toggle">
                  <input type="checkbox" v-model="settings.save_search_history" @change="updateSetting('save_search_history', settings.save_search_history)" />
                  <span class="toggle-slider"></span>
                </label>
              </div>
              
              <div class="setting-item">
                <div class="setting-info">
                  <span class="setting-label">Anonymous Analytics</span>
                  <span class="setting-desc">Help improve Fynda with anonymous usage data</span>
                </div>
                <label class="toggle">
                  <input type="checkbox" v-model="settings.anonymous_analytics" @change="updateSetting('anonymous_analytics', settings.anonymous_analytics)" />
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
          
          <!-- Notifications Tab -->
          <div v-if="activeTab === 'notifications'" class="tab-content">
            <div class="section-header">
              <h2>Notification Preferences</h2>
              <p>Control how and when Fynda contacts you</p>
            </div>
            
            <div class="settings-section">
              <h3>Push Notifications</h3>
              
              <div class="setting-item">
                <div class="setting-info">
                  <span class="setting-label">Enable Notifications</span>
                  <span class="setting-desc">Receive push notifications on your devices</span>
                </div>
                <label class="toggle">
                  <input type="checkbox" v-model="notifications.push_enabled" @change="updateNotification('push_enabled', notifications.push_enabled)" />
                  <span class="toggle-slider"></span>
                </label>
              </div>
              
              <div class="setting-item" :class="{ disabled: !notifications.push_enabled }">
                <div class="setting-info">
                  <span class="setting-label">New Deals</span>
                  <span class="setting-desc">Get notified about deals matching your interests</span>
                </div>
                <label class="toggle">
                  <input type="checkbox" v-model="notifications.push_deals" :disabled="!notifications.push_enabled" @change="updateNotification('push_deals', notifications.push_deals)" />
                  <span class="toggle-slider"></span>
                </label>
              </div>
              
              <div class="setting-item" :class="{ disabled: !notifications.push_enabled }">
                <div class="setting-info">
                  <span class="setting-label">Price Alerts</span>
                  <span class="setting-desc">Notify when tracked products drop in price</span>
                </div>
                <label class="toggle">
                  <input type="checkbox" v-model="notifications.push_price_alerts" :disabled="!notifications.push_enabled" @change="updateNotification('push_price_alerts', notifications.push_price_alerts)" />
                  <span class="toggle-slider"></span>
                </label>
              </div>
              
              <div class="setting-item" :class="{ disabled: !notifications.push_enabled }">
                <div class="setting-info">
                  <span class="setting-label">Weekly Digest</span>
                  <span class="setting-desc">Receive a weekly summary of top deals</span>
                </div>
                <label class="toggle">
                  <input type="checkbox" v-model="notifications.push_weekly_digest" :disabled="!notifications.push_enabled" @change="updateNotification('push_weekly_digest', notifications.push_weekly_digest)" />
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
          
          <!-- Security Tab -->
          <div v-if="activeTab === 'security'" class="tab-content">
            <div class="section-header">
              <h2>Security</h2>
              <p>Manage your password and account security</p>
            </div>
            
            <div class="settings-section">
              <h3>Change Password</h3>
              
              <form @submit.prevent="changePassword" class="password-form">
                <div class="form-group">
                  <label>Current Password</label>
                  <input 
                    v-model="passwordForm.current" 
                    type="password" 
                    placeholder="Enter current password"
                  />
                </div>
                
                <div class="form-group">
                  <label>New Password</label>
                  <input 
                    v-model="passwordForm.new_password" 
                    type="password" 
                    placeholder="Enter new password"
                  />
                </div>
                
                <div class="form-group">
                  <label>Confirm New Password</label>
                  <input 
                    v-model="passwordForm.confirm" 
                    type="password" 
                    placeholder="Confirm new password"
                  />
                </div>
                
                <div v-if="passwordError" class="error-message">{{ passwordError }}</div>
                <div v-if="passwordSuccess" class="success-message">✓ Password updated successfully</div>
                
                <button type="submit" class="btn-primary" :disabled="changingPassword">
                  {{ changingPassword ? 'Updating...' : 'Update Password' }}
                </button>
              </form>
            </div>
            
            <div class="settings-section danger-zone">
              <h3>Danger Zone</h3>
              
              <div class="danger-item">
                <div class="danger-info">
                  <span class="danger-label">Delete Account</span>
                  <span class="danger-desc">Permanently delete your account and all data</span>
                </div>
                <button class="btn-danger" @click="showDeleteModal = true">Delete Account</button>
              </div>
            </div>
          </div>
          
          <!-- Privacy & Cookies Tab -->
          <div v-if="activeTab === 'privacy'" class="tab-content">
            <div class="section-header">
              <h2>Privacy & Cookies</h2>
              <p>Manage your cookie preferences and data</p>
            </div>
            
            <div class="settings-section">
              <h3>Cookie Preferences</h3>
              <p class="consent-status" v-if="consentSummary.lastUpdated">
                Last updated: {{ formatConsentDate(consentSummary.lastUpdated) }}
              </p>
              <p class="consent-status" v-else>
                You haven't set your cookie preferences yet.
              </p>
              
              <div v-for="cat in consentSummary.categories" :key="cat.key" class="setting-item">
                <div class="setting-info">
                  <span class="setting-label">{{ cat.name }}</span>
                  <span class="setting-desc">{{ cat.desc || (cat.required ? 'Required for site function' : '') }}</span>
                </div>
                <label class="toggle" :class="{ 'always-on': cat.required }">
                  <input 
                    type="checkbox" 
                    :checked="cat.enabled" 
                    :disabled="cat.required"
                    @change="updateCookieCategory(cat.key, $event.target.checked)" 
                  />
                  <span class="toggle-slider"></span>
                </label>
              </div>
              
              <button class="btn-secondary" style="margin-top: 16px" @click="openCookieBanner">
                Open Cookie Preferences Panel
              </button>
            </div>
            
            <div class="settings-section">
              <h3>Data Management</h3>
              
              <div class="setting-item">
                <div class="setting-info">
                  <span class="setting-label">Clear Browsing Data</span>
                  <span class="setting-desc">Remove search history, analytics data, and saved preferences</span>
                </div>
                <button class="btn-danger-sm" @click="handleClearData">
                  {{ clearingData ? 'Clearing...' : 'Clear Data' }}
                </button>
              </div>
              
              <div class="setting-item">
                <div class="setting-info">
                  <span class="setting-label">Export Your Data</span>
                  <span class="setting-desc">Download a copy of your personal data</span>
                </div>
                <button class="btn-secondary-sm" @click="exportUserData">
                  Download
                </button>
              </div>
            </div>
            
            <div class="privacy-links">
              <router-link to="/cookies">Cookie Policy</router-link>
              <router-link to="/privacy">Privacy Policy</router-link>
              <router-link to="/terms">Terms of Service</router-link>
            </div>
          </div>
          
          <!-- Saved Deals Tab -->
          <div v-if="activeTab === 'saved'" class="tab-content">
            <div class="section-header">
              <h2>Saved Deals</h2>
              <p>Your favorite deals in one place</p>
            </div>
            
            <div v-if="savedDeals.length === 0" class="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
              <h3>No saved deals yet</h3>
              <p>Start exploring and save deals you love</p>
              <router-link to="/" class="btn-primary">Browse Deals</router-link>
            </div>
            
            <div v-else class="saved-grid">
              <div v-for="deal in savedDeals" :key="deal.id" class="saved-card">
                <img :src="deal.image || deal.deal_data?.image_url" :alt="deal.title || deal.deal_data?.title" class="saved-image" />
                <div class="saved-info">
                  <h4>{{ deal.title || deal.deal_data?.title }}</h4>
                  <span class="saved-price">${{ deal.price || deal.deal_data?.price }}</span>
                  <span class="saved-source">{{ deal.source || deal.deal_data?.source }}</span>
                </div>
                <button class="remove-btn" @click="removeSaved(deal.deal_id)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
    
    <Footer />
    
    <!-- Delete Account Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal">
        <h3>Delete Account?</h3>
        <p>This action cannot be undone. All your data will be permanently deleted.</p>
        <div class="modal-actions">
          <button class="btn-secondary" @click="showDeleteModal = false">Cancel</button>
          <button class="btn-danger" @click="deleteAccount">Delete Forever</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from './NavBar.vue'
import Footer from './Footer.vue'
import { useAuth } from '../stores/authStore'
import api from '../utils/api'
import { getConsentSummary, setConsent, reopenBanner, clearAllData } from '../services/cookieService'

const router = useRouter()
const { state, currentUser, logout, updateProfile } = useAuth()

// Tabs configuration
const tabs = [
  { id: 'profile', label: 'Profile', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' },
  { id: 'library', label: 'My Library', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>' },
  { id: 'settings', label: 'Settings', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>' },
  { id: 'notifications', label: 'Notifications', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>' },
  { id: 'privacy', label: 'Privacy & Cookies', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' },
  { id: 'security', label: 'Security', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>' },
  { id: 'saved', label: 'Saved Deals', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>' },
]

const activeTab = ref('profile')
const user = computed(() => currentUser.value)
const saving = ref(false)
const saveSuccess = ref(false)
const showDeleteModal = ref(false)

// User computed properties
const userInitial = computed(() => {
  if (user.value?.first_name) return user.value.first_name[0].toUpperCase()
  if (user.value?.email) return user.value.email[0].toUpperCase()
  return '?'
})

const fullName = computed(() => {
  const first = user.value?.first_name || ''
  const last = user.value?.last_name || ''
  return `${first} ${last}`.trim() || 'User'
})

// Profile form
const profileForm = reactive({
  first_name: '',
  last_name: '',
  email: ''
})

// Settings
const settings = reactive({
  theme: 'light',
  currency: 'USD',
  show_sold_items: false,
  save_search_history: true,
  anonymous_analytics: true
})

// Notifications
const notifications = reactive({
  push_enabled: true,
  push_deals: true,
  push_price_alerts: true,
  push_weekly_digest: false
})

// Password form
const passwordForm = reactive({
  current: '',
  new_password: '',
  confirm: ''
})
const changingPassword = ref(false)
const passwordError = ref('')
const passwordSuccess = ref(false)

// Cookie consent
const consentSummary = ref(getConsentSummary())
const clearingData = ref(false)

// Account info
const memberSince = computed(() => {
  if (user.value?.date_joined) {
    return new Date(user.value.date_joined).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }
  return 'January 2026'
})

const loginProvider = computed(() => {
  // Check if user has a social account linked
  if (user.value?.social_provider) return user.value.social_provider
  if (user.value?.is_social) return 'google'
  return 'email'
})

// Saved deals
const savedDeals = ref([])

// Library items (from localStorage)
const libraryItems = ref([])

const loadLibraryItems = () => {
  try {
    libraryItems.value = JSON.parse(localStorage.getItem('userLibrary') || '[]')
  } catch (e) {
    libraryItems.value = []
  }
}

const removeFromLibrary = (productId) => {
  libraryItems.value = libraryItems.value.filter(item => item.id !== productId)
  localStorage.setItem('userLibrary', JSON.stringify(libraryItems.value))
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString()
}

const goToProduct = (productId) => {
  router.push(`/product/${productId}`)
}

// Initialize data
onMounted(async () => {
  if (!state.tokens) {
    router.push('/login')
    return
  }
  
  // Initialize profile form
  if (user.value) {
    profileForm.first_name = user.value.first_name || ''
    profileForm.last_name = user.value.last_name || ''
    profileForm.email = user.value.email || ''
  }
  
  // Fetch preferences
  await fetchPreferences()
  
  // Fetch saved deals
  await fetchSavedDeals()
  
  // Load library items from localStorage
  loadLibraryItems()
})

const fetchPreferences = async () => {
  try {
    const response = await api.get('/api/mobile/preferences/')
    if (response.data) {
      Object.assign(settings, {
        theme: response.data.theme || 'light',
        currency: response.data.currency || 'USD',
        show_sold_items: response.data.show_sold_items || false,
        save_search_history: response.data.save_search_history ?? true,
        anonymous_analytics: response.data.anonymous_analytics ?? true
      })
      Object.assign(notifications, {
        push_enabled: response.data.push_enabled ?? true,
        push_deals: response.data.push_deals ?? true,
        push_price_alerts: response.data.push_price_alerts ?? true,
        push_weekly_digest: response.data.push_weekly_digest ?? false
      })
    }
  } catch (err) {
    console.log('Could not fetch preferences:', err)
  }
}

const fetchSavedDeals = async () => {
  try {
    const response = await api.get('/api/mobile/favorites/')
    savedDeals.value = response.data.favorites || []
  } catch (err) {
    console.log('Could not fetch saved deals:', err)
  }
}

const saveProfile = async () => {
  saving.value = true
  saveSuccess.value = false
  
  const result = await updateProfile({
    first_name: profileForm.first_name,
    last_name: profileForm.last_name
  })
  
  saving.value = false
  
  if (result.success) {
    saveSuccess.value = true
    setTimeout(() => saveSuccess.value = false, 3000)
  }
}

const updateSetting = async (key, value) => {
  try {
    await api.patch('/api/mobile/preferences/', { [key]: value })
  } catch (err) {
    console.error('Failed to update setting:', err)
  }
}

const updateNotification = async (key, value) => {
  try {
    await api.patch('/api/mobile/preferences/', { [key]: value })
  } catch (err) {
    console.error('Failed to update notification:', err)
  }
}

const changePassword = async () => {
  passwordError.value = ''
  passwordSuccess.value = false
  
  if (passwordForm.new_password !== passwordForm.confirm) {
    passwordError.value = 'Passwords do not match'
    return
  }
  
  if (passwordForm.new_password.length < 8) {
    passwordError.value = 'Password must be at least 8 characters'
    return
  }
  
  changingPassword.value = true
  
  try {
    await api.post('/api/auth/change-password/', {
      current_password: passwordForm.current,
      new_password: passwordForm.new_password
    })
    
    passwordSuccess.value = true
    passwordForm.current = ''
    passwordForm.new_password = ''
    passwordForm.confirm = ''
  } catch (err) {
    passwordError.value = err.response?.data?.error || 'Failed to change password'
  } finally {
    changingPassword.value = false
  }
}

const removeSaved = async (dealId) => {
  try {
    await api.delete(`/api/mobile/favorites/${dealId}/`)
    savedDeals.value = savedDeals.value.filter(d => d.deal_id !== dealId)
  } catch (err) {
    console.error('Failed to remove saved deal:', err)
  }
}

const handleLogout = async () => {
  await logout()
  router.push('/')
}

// Cookie/Privacy functions
const updateCookieCategory = (key, enabled) => {
  const current = consentSummary.value
  const prefs = {}
  current.categories.forEach(cat => {
    if (!cat.required) {
      prefs[cat.key] = cat.key === key ? enabled : cat.enabled
    }
  })
  setConsent(prefs)
  consentSummary.value = getConsentSummary()
}

const openCookieBanner = () => {
  reopenBanner()
}

const handleClearData = () => {
  clearingData.value = true
  clearAllData()
  setTimeout(() => {
    clearingData.value = false
    alert('Browsing data cleared successfully.')
  }, 500)
}

const exportUserData = async () => {
  try {
    const data = {
      profile: {
        name: fullName.value,
        email: user.value?.email,
        member_since: user.value?.date_joined
      },
      saved_deals: savedDeals.value,
      library: libraryItems.value,
      consent: consentSummary.value,
      exported_at: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'fynda_my_data.json'
    a.click()
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Export failed:', err)
    alert('Could not export data.')
  }
}

const formatConsentDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const deleteAccount = async () => {
  try {
    await api.delete('/api/auth/profile/')
    await logout()
    router.push('/')
  } catch (err) {
    console.error('Failed to delete account:', err)
  }
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fafafa;
}

.profile-content {
  flex: 1;
  padding: 40px 24px;
}

.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 32px;
}

/* Sidebar */
.profile-sidebar {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  height: fit-content;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.user-card {
  text-align: center;
  padding-bottom: 24px;
  border-bottom: 1px solid #eee;
  margin-bottom: 24px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  overflow: hidden;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initial {
  color: #fff;
  font-size: 28px;
  font-weight: 600;
}

.user-name {
  font-size: 18px;
  font-weight: 600;
  color: #111;
  margin-bottom: 4px;
}

.user-email {
  font-size: 14px;
  color: #666;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  background: transparent;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #555;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.nav-item:hover {
  background: #f5f5f5;
  color: #111;
}

.nav-item.active {
  background: #111;
  color: #fff;
}

.nav-icon {
  display: flex;
  align-items: center;
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  margin-top: 24px;
  border: 1px solid #e0e0e0;
  background: transparent;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  border-color: #dc3545;
  color: #dc3545;
}

/* Main Content */
.profile-main {
  background: #fff;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.section-header {
  margin-bottom: 32px;
}

.section-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #111;
  margin-bottom: 8px;
}

.section-header p {
  font-size: 14px;
  color: #666;
}

/* Forms */
.profile-form, .password-form {
  max-width: 500px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.form-group input, .form-group select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.form-group input:focus, .form-group select:focus {
  outline: none;
  border-color: #111;
}

.form-group input:disabled {
  background: #f5f5f5;
  color: #888;
}

.input-hint {
  display: block;
  font-size: 12px;
  color: #888;
  margin-top: 6px;
}

.form-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Buttons */
.btn-primary {
  padding: 12px 24px;
  border: none;
  background: #111;
  color: #fff;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: #333;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 12px 24px;
  border: 1px solid #ddd;
  background: transparent;
  color: #333;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  border-color: #111;
}

.btn-danger {
  padding: 10px 20px;
  border: 1px solid #dc3545;
  background: transparent;
  color: #dc3545;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-danger:hover {
  background: #dc3545;
  color: #fff;
}

/* Settings */
.settings-section {
  margin-bottom: 40px;
}

.settings-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #111;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.setting-item.disabled {
  opacity: 0.5;
}

.setting-info {
  flex: 1;
}

.setting-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #111;
  margin-bottom: 4px;
}

.setting-desc {
  display: block;
  font-size: 13px;
  color: #666;
}

.setting-item select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  min-width: 120px;
}

/* Toggle Switch */
.toggle {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 28px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.3s;
  border-radius: 28px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.toggle input:checked + .toggle-slider {
  background-color: #111;
}

.toggle input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

/* Danger Zone */
.danger-zone {
  background: #fff5f5;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #ffebeb;
}

.danger-zone h3 {
  color: #dc3545;
  border-bottom-color: #ffebeb;
}

.danger-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.danger-label {
  font-size: 14px;
  font-weight: 500;
  color: #dc3545;
}

.danger-desc {
  font-size: 13px;
  color: #666;
}

/* Messages */
.success-message {
  font-size: 14px;
  color: #28a745;
  font-weight: 500;
}

.error-message {
  font-size: 14px;
  color: #dc3545;
  margin-bottom: 16px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-state svg {
  margin-bottom: 20px;
  opacity: 0.3;
}

.empty-state h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 8px;
}

.empty-state p {
  margin-bottom: 20px;
}

/* Saved Grid */
.saved-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.saved-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

.saved-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.saved-info {
  padding: 12px;
}

.saved-info h4 {
  font-size: 14px;
  font-weight: 500;
  color: #111;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.saved-price {
  font-size: 16px;
  font-weight: 600;
  color: #111;
  display: block;
  margin-bottom: 4px;
}

.saved-source {
  font-size: 12px;
  color: #888;
}

/* Library Grid */
.library-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.library-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
}

.library-card:hover {
  border-color: #1a1a1a;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.library-image {
  width: 100%;
  height: 160px;
  object-fit: cover;
}

.library-info {
  padding: 14px;
}

.library-brand {
  display: block;
  font-size: 11px;
  text-transform: uppercase;
  color: #888;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.library-info h4 {
  font-size: 14px;
  font-weight: 500;
  color: #111;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.library-price {
  font-size: 16px;
  font-weight: 600;
  color: #111;
  display: block;
  margin-bottom: 4px;
}

.library-date {
  font-size: 11px;
  color: #aaa;
}

.remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255,255,255,0.9);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.saved-card:hover .remove-btn {
  opacity: 1;
}

.remove-btn:hover {
  background: #ff4757;
  color: #fff;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #fff;
  border-radius: 16px;
  padding: 32px;
  max-width: 400px;
  width: 90%;
}

.modal h3 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
}

.modal p {
  color: #666;
  margin-bottom: 24px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

/* Responsive */
@media (max-width: 900px) {
  .profile-container {
    grid-template-columns: 1fr;
  }
  
  .profile-sidebar {
    order: -1;
  }
  
  .sidebar-nav {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .nav-item {
    padding: 10px 14px;
    font-size: 13px;
  }
}

@media (max-width: 600px) {
  .profile-content {
    padding: 20px 16px;
  }
  
  .profile-main {
    padding: 20px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .danger-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}

/* Account Activity */
.account-activity {
  margin-top: 40px;
  padding-top: 32px;
  border-top: 1px solid #eee;
}

.activity-title {
  font-size: 16px;
  font-weight: 600;
  color: #111;
  margin-bottom: 20px;
}

.activity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.activity-item {
  background: #fafafa;
  padding: 16px;
  border-radius: 12px;
}

.activity-label {
  display: block;
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.activity-value {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #111;
}

.login-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  display: inline-block;
}

/* Privacy & Cookies */
.consent-status {
  font-size: 13px;
  color: #888;
  margin-bottom: 20px;
}

.toggle.always-on {
  opacity: 0.5;
  pointer-events: none;
}

.privacy-links {
  display: flex;
  gap: 24px;
  padding-top: 24px;
  border-top: 1px solid #eee;
  margin-top: 16px;
}

.privacy-links a {
  font-size: 13px;
  color: #666;
  text-decoration: none;
  transition: color 0.2s;
}

.privacy-links a:hover {
  color: #111;
  text-decoration: underline;
}

/* Small Action Buttons */
.btn-danger-sm {
  padding: 8px 16px;
  border: 1px solid #dc3545;
  background: transparent;
  color: #dc3545;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-danger-sm:hover {
  background: #dc3545;
  color: #fff;
}

.btn-secondary-sm {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: transparent;
  color: #333;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-secondary-sm:hover {
  border-color: #111;
  color: #111;
}
</style>
