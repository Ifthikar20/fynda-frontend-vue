<template>
  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-main">
        <div class="footer-brand">
          <router-link to="/" class="footer-logo">
            <svg class="logo-icon" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
            <span class="logo-text">Fynda</span>
          </router-link>
          <p class="footer-tagline">AI-powered deal discovery across all major marketplaces and social media.</p>
        </div>
        
        <div class="footer-links">
          <div class="link-group">
            <h4 class="link-title">Shop</h4>
            <router-link to="/shop/women" class="link">Women</router-link>
            <router-link to="/shop/men" class="link">Men</router-link>
            <router-link to="/shop/home" class="link">Home</router-link>
            <router-link to="/shop/beauty" class="link">Beauty</router-link>
          </div>
          
          <div class="link-group">
            <h4 class="link-title">Company</h4>
            <router-link to="/about" class="link">About Us</router-link>
            <a href="https://blog.fynda.com" class="link" target="_blank">Blog</a>
          </div>
          
          <div class="link-group">
            <h4 class="link-title">Support</h4>
            <router-link to="/help" class="link">Help Center</router-link>
            <router-link to="/contact" class="link">Contact Us</router-link>
            <router-link to="/privacy" class="link">Privacy Policy</router-link>
            <router-link to="/terms" class="link">Terms of Service</router-link>
          </div>
          
          <div class="link-group">
            <h4 class="link-title">Connect</h4>
            <a href="https://instagram.com/fynda" class="link" target="_blank" rel="noopener">Instagram</a>
            <a href="https://twitter.com/fynda" class="link" target="_blank" rel="noopener">Twitter</a>
            <a href="https://tiktok.com/@fynda" class="link" target="_blank" rel="noopener">TikTok</a>
            <a href="https://pinterest.com/fynda" class="link" target="_blank" rel="noopener">Pinterest</a>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p class="copyright">© {{ currentYear }} Fynda. All rights reserved.</p>
        <div class="footer-legal">
          <router-link to="/privacy" class="legal-link">Privacy</router-link>
          <router-link to="/terms" class="legal-link">Terms</router-link>
          <router-link to="/cookies" class="legal-link">Cookies</router-link>
        </div>
        <div class="social-links">
          <a href="https://instagram.com/fynda" class="social-link" target="_blank" rel="noopener">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <circle cx="12" cy="12" r="4"/>
              <line x1="18" y1="6" x2="18" y2="6" stroke-linecap="round"/>
            </svg>
          </a>
          <a href="https://twitter.com/fynda" class="social-link" target="_blank" rel="noopener">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
            </svg>
          </a>
          <a href="https://tiktok.com/@fynda" class="social-link" target="_blank" rel="noopener">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
            </svg>
          </a>
          <a href="https://pinterest.com/fynda" class="social-link" target="_blank" rel="noopener">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
.footer {
  background: #fafafa;
  border-top: 1px solid #eee;
  margin-top: 48px;
  width: 100vw;
  margin-left: calc(-50vw + 50%);
}

.footer-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 48px 20px;
}

.footer-main {
  display: flex;
  justify-content: space-between;
  gap: 48px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e8e8e8;
}

.footer-brand {
  max-width: 300px;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 18px;
  margin-bottom: 8px;
  text-decoration: none;
}

.logo-icon {
  font-size: 24px;
}

.logo-text {
  color: #111;
}

.footer-tagline {
  font-size: 12px;
  color: #777;
  line-height: 1.5;
}

.footer-links {
  display: flex;
  gap: 48px;
}

.link-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.link-title {
  font-size: 11px;
  font-weight: 600;
  color: #333;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}

.link {
  font-size: 12px;
  color: #777;
  text-decoration: none;
  transition: color 0.2s ease;
}

.link:hover {
  color: #111;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
}

.copyright {
  font-size: 11px;
  color: #999;
}

.footer-legal {
  display: flex;
  gap: 24px;
}

.legal-link {
  font-size: 11px;
  color: #888;
  text-decoration: none;
  transition: color 0.2s ease;
}

.legal-link:hover {
  color: #111;
}

.social-links {
  display: flex;
  gap: 16px;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f0f0f0;
  color: #666;
  text-decoration: none;
  transition: all 0.2s ease;
}

.social-link:hover {
  background: #111;
  color: #fff;
}

@media (max-width: 1000px) {
  .footer-main {
    flex-direction: column;
    gap: 40px;
  }
  
  .footer-links {
    flex-wrap: wrap;
    gap: 40px;
  }
  
  .link-group {
    min-width: 140px;
  }
}

@media (max-width: 600px) {
  .footer-inner {
    padding: 24px 24px 16px;
  }
  
  .footer-bottom {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .footer-legal {
    gap: 16px;
  }
  
  .social-links {
    gap: 12px;
  }
}
</style>
