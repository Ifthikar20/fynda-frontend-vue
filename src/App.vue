<template>
  <router-view v-slot="{ Component, route }">
    <keep-alive :include="cachedPages">
      <component :is="Component" :key="route.path" />
    </keep-alive>
  </router-view>
  <CookieConsent />
</template>

<script setup>
import { onMounted, ref } from 'vue'
import CookieConsent from './components/common/CookieConsent.vue'
import { initAnalytics } from './services/analyticsService'

// Pages whose state should be preserved when navigating back
const cachedPages = ref([
  'HomePage',
  'ExplorePage',
  'FeedPage',
  'CategoryLandingPage',
  'BrandsHomePage'
])

// Initialize analytics when app mounts
onMounted(() => {
  initAnalytics({
    mixpanelToken: import.meta.env.VITE_MIXPANEL_TOKEN,
  })
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@400;500&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: #fff;
  color: #1a1a1a;
  line-height: 1.5;
}

a {
  text-decoration: none;
  color: inherit;
}
</style>
