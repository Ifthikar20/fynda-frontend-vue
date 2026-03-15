<template>
  <div class="static-page">
    <NavBar />
    
    <main class="static-content">
      <div class="static-container">
        <h1 class="page-title">Contact Us</h1>
        <p class="page-subtitle">We'd love to hear from you.</p>
        
        <div class="support-card">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" stroke-width="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          <h3>Support</h3>
          <p>Need help? Reach out to our team.</p>
          <a href="mailto:support@outfi.ai">support@outfi.ai</a>
        </div>
      </div>
    </main>
    
    <Footer />
  </div>
</template>

<script setup>
import NavBar from '../NavBar.vue'
import Footer from '../Footer.vue'
</script>

<style scoped>
.static-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.static-content {
  flex: 1;
  padding: 80px 24px;
  background: #fff;
}

.static-container {
  max-width: 480px;
  margin: 0 auto;
  text-align: center;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #111;
  margin-bottom: 8px;
}

.page-subtitle {
  font-size: 1.05rem;
  color: #888;
  margin-bottom: 48px;
}

.support-card {
  background: #fafafa;
  padding: 2.5rem 2rem;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.support-card svg {
  margin-bottom: 4px;
}

.support-card h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #111;
  margin: 0;
}

.support-card p {
  font-size: 0.9rem;
  color: #888;
  margin: 0;
}

.support-card a {
  font-size: 1rem;
  color: #111;
  text-decoration: none;
  font-weight: 600;
  margin-top: 4px;
  transition: color 0.2s;
}

.support-card a:hover {
  text-decoration: underline;
}
</style>
