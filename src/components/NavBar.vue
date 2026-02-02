<template>
  <nav class="navbar">
    <div class="nav-container">
      <router-link to="/" class="nav-logo">
        <img src="../assets/fynda-png-1.png" alt="Fynda" class="logo-img" />
      </router-link>
      
      <div class="nav-links">
        <router-link to="/shop/women" class="nav-link">Women</router-link>
        <router-link to="/shop/men" class="nav-link">Men</router-link>
        <router-link to="/shop/home" class="nav-link">Home</router-link>
        <router-link to="/shop/beauty" class="nav-link">Beauty</router-link>
      </div>
      
      <div class="nav-actions">
        <template v-if="isAuthenticated">
          <router-link to="/storyboard" class="nav-link-icon" title="Fashion Board">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
          </router-link>
          <router-link to="/profile" class="nav-link-icon" title="Profile">
            <div class="user-avatar">
              <span>{{ userInitial }}</span>
            </div>
          </router-link>
        </template>
        <template v-else>
          <router-link to="/login" class="nav-btn">Sign In</router-link>
        </template>
      </div>
      
      <!-- Mobile Menu Button -->
      <button class="mobile-menu-btn" @click="mobileMenuOpen = !mobileMenuOpen">
        <svg v-if="!mobileMenuOpen" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
        <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
    
    <!-- Mobile Menu -->
    <div :class="['mobile-menu', { open: mobileMenuOpen }]">
      <router-link to="/shop/women" class="mobile-link" @click="mobileMenuOpen = false">Women</router-link>
      <router-link to="/shop/men" class="mobile-link" @click="mobileMenuOpen = false">Men</router-link>
      <router-link to="/shop/home" class="mobile-link" @click="mobileMenuOpen = false">Home</router-link>
      <router-link to="/shop/beauty" class="mobile-link" @click="mobileMenuOpen = false">Beauty</router-link>
      <div class="mobile-divider"></div>
      <template v-if="isAuthenticated">
        <router-link to="/profile" class="mobile-link" @click="mobileMenuOpen = false">Profile</router-link>
        <router-link to="/storyboard" class="mobile-link" @click="mobileMenuOpen = false">Fashion Board</router-link>
        <button class="mobile-link logout" @click="handleLogout">Sign Out</button>
      </template>
      <template v-else>
        <router-link to="/login" class="mobile-link primary" @click="mobileMenuOpen = false">Sign In</router-link>
      </template>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../stores/authStore'

const router = useRouter()
const { isAuthenticated, currentUser, logout } = useAuth()

const mobileMenuOpen = ref(false)

const userInitial = computed(() => {
  const user = currentUser.value
  if (user?.first_name) return user.first_name[0].toUpperCase()
  if (user?.email) return user.email[0].toUpperCase()
  return '?'
})

const handleLogout = async () => {
  mobileMenuOpen.value = false
  await logout()
  router.push('/')
}
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #f0f0f0;
  z-index: 100;
  padding: 14px 0;
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-logo {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.logo-img {
  height: 36px;
  width: auto;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 32px;
}

.nav-link {
  font-size: 14px;
  font-weight: 500;
  color: #555;
  text-decoration: none;
  transition: color 0.2s ease;
}

.nav-link:hover {
  color: #111;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-link-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: #555;
  text-decoration: none;
  transition: all 0.2s ease;
}

.nav-link-icon:hover {
  background: #f5f5f5;
  color: #111;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
}

.nav-btn-outline {
  padding: 10px 20px;
  border: 1px solid #ddd;
  background: transparent;
  color: #333;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.nav-btn-outline:hover {
  border-color: #111;
  color: #111;
}

.nav-btn {
  padding: 10px 20px;
  border: none;
  background: #111;
  color: #fff;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.nav-btn:hover {
  background: #333;
  transform: translateY(-1px);
}

.mobile-menu-btn {
  display: none;
  padding: 8px;
  border: none;
  background: none;
  cursor: pointer;
  color: #333;
}

.mobile-menu {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border-bottom: 1px solid #eee;
  padding: 16px 24px;
  flex-direction: column;
  gap: 4px;
}

.mobile-menu.open {
  display: flex;
}

.mobile-link {
  display: block;
  padding: 12px 0;
  font-size: 15px;
  font-weight: 500;
  color: #333;
  text-decoration: none;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  width: 100%;
}

.mobile-link:hover {
  color: #111;
}

.mobile-link.primary {
  color: #fff;
  background: #111;
  padding: 12px 16px;
  border-radius: 10px;
  text-align: center;
  margin-top: 8px;
}

.mobile-link.logout {
  color: #dc3545;
}

.mobile-divider {
  height: 1px;
  background: #eee;
  margin: 8px 0;
}

@media (max-width: 800px) {
  .nav-links {
    display: none;
  }
  
  .nav-actions {
    display: none;
  }
  
  .mobile-menu-btn {
    display: block;
  }
}

@media (max-width: 480px) {
  .nav-btn-outline {
    display: none;
  }
}
</style>
