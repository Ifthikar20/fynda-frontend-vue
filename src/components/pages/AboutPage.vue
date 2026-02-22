<template>
  <div class="static-page">
    <NavBar />
    
    <main class="static-content">
      <div class="static-container">
        <h1 class="page-title">About Us</h1>
        
        <div class="page-content">
          <section class="content-section">
            <h2>Our Mission</h2>
            <p>
              Outfi is revolutionizing the way people discover deals online. Our AI-powered platform 
              aggregates the best prices from major marketplaces and social media platforms, making 
              it effortless to find exactly what you're looking for at the best price.
            </p>
          </section>
          
          <section class="content-section">
            <h2>The Problem We Solve</h2>
            <p>
              Shopping online means checking dozens of sites, missing flash sales, and never knowing 
              if you're getting the best deal. Outfi changes that by bringing all deals to one place 
              with real-time price tracking and AI-powered recommendations.
            </p>
          </section>
          
          <section class="content-section">
            <h2>How It Works</h2>
            <div class="feature-grid">
              <div class="feature-card">
                <div class="feature-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </div>
                <h3>Smart Search</h3>
                <p>Natural language search powered by AI understands exactly what you're looking for</p>
              </div>
              <div class="feature-card">
                <div class="feature-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </div>
                <h3>Multi-Marketplace</h3>
                <p>We search Amazon, eBay, Best Buy, TikTok Shop, and more simultaneously</p>
              </div>
              <div class="feature-card">
                <div class="feature-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                  </svg>
                </div>
                <h3>Visual Search</h3>
                <p>Upload a screenshot and find matching products across all platforms</p>
              </div>
              <div class="feature-card">
                <div class="feature-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                </div>
                <h3>Price Alerts</h3>
                <p>Set your target price and get notified when products drop</p>
              </div>
            </div>
          </section>
          
          <section class="content-section">
            <h2>Our Team</h2>
            <p>
              We're a team of engineers, designers, and deal hunters passionate about making online 
              shopping smarter. Based in the US, we're building the future of e-commerce discovery.
            </p>
          </section>
          
          <section class="content-section cta-section">
            <h2>Ready to Find Your Next Great Deal?</h2>
            <router-link to="/" class="btn-primary">Start Searching</router-link>
          </section>
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
  padding: 60px 24px;
  background: #fff;
}

.static-container {
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  font-size: 42px;
  font-weight: 700;
  color: #111;
  margin-bottom: 48px;
  text-align: center;
}

.content-section {
  margin-bottom: 48px;
}

.content-section h2 {
  font-size: 24px;
  font-weight: 600;
  color: #111;
  margin-bottom: 16px;
}

.content-section p {
  font-size: 16px;
  line-height: 1.8;
  color: #555;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-top: 24px;
}

.feature-card {
  background: #fafafa;
  border-radius: 16px;
  padding: 28px;
  text-align: center;
}

.feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  margin: 0 auto 16px;
  border-radius: 50%;
  background: #f0f0f0;
  color: #333;
}

.feature-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: #111;
  margin-bottom: 8px;
}

.feature-card p {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.cta-section {
  text-align: center;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  padding: 48px;
  border-radius: 20px;
  margin-top: 60px;
}

.cta-section h2 {
  margin-bottom: 24px;
}

.btn-primary {
  display: inline-block;
  padding: 14px 32px;
  background: #111;
  color: #fff;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: #333;
  transform: translateY(-2px);
}

@media (max-width: 600px) {
  .page-title {
    font-size: 32px;
  }
  
  .feature-grid {
    grid-template-columns: 1fr;
  }
  
  .cta-section {
    padding: 32px 20px;
  }
}
</style>
