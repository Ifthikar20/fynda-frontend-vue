<template>
  <div class="static-page">
    <NavBar />
    
    <main class="static-content">
      <div class="static-container narrow">
        <h1 class="page-title">Cookie Policy</h1>
        <p class="last-updated">Last updated: January 2026</p>
        
        <div class="page-content">
          <section class="content-section">
            <h2>What Are Cookies?</h2>
            <p>
              Cookies are small text files stored on your device when you visit a website. 
              They help us provide you with a better experience by remembering your preferences 
              and understanding how you use our platform.
            </p>
          </section>
          
          <section class="content-section">
            <h2>Types of Cookies We Use</h2>
            
            <div class="cookie-type">
              <h3>Essential Cookies</h3>
              <p>
                Required for the website to function. These cookies enable core functionality 
                like security, account authentication, and remembering your shopping cart.
              </p>
              <span class="cookie-badge required">Required</span>
            </div>
            
            <div class="cookie-type">
              <h3>Performance Cookies</h3>
              <p>
                Help us understand how visitors interact with our website by collecting 
                anonymous information. This helps us improve our services.
              </p>
              <span class="cookie-badge">Optional</span>
            </div>
            
            <div class="cookie-type">
              <h3>Functional Cookies</h3>
              <p>
                Remember your preferences like language, region, and display settings 
                to provide a personalized experience.
              </p>
              <span class="cookie-badge">Optional</span>
            </div>
            
            <div class="cookie-type">
              <h3>Marketing Cookies</h3>
              <p>
                Used to track visitors across websites to display relevant advertisements. 
                We work with partners like Google Analytics.
              </p>
              <span class="cookie-badge">Optional</span>
            </div>
          </section>
          
          <section class="content-section">
            <h2>Third-Party Cookies</h2>
            <p>
              We use services from third parties that may set their own cookies:
            </p>
            <ul>
              <li><strong>Google Analytics</strong> - Website analytics and usage patterns</li>
              <li><strong>Stripe</strong> - Secure payment processing</li>
              <li><strong>Intercom</strong> - Customer support chat</li>
            </ul>
          </section>
          
          <section class="content-section">
            <h2>Managing Cookies</h2>
            <p>
              You can control cookies through your browser settings. Here's how:
            </p>
            <ul>
              <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies</li>
              <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies</li>
              <li><strong>Safari:</strong> Preferences → Privacy → Cookies and Website Data</li>
              <li><strong>Edge:</strong> Settings → Privacy, Search, and Services → Cookies</li>
            </ul>
            <p>
              Note: Disabling essential cookies may affect your ability to use Fynda.
            </p>
          </section>
          
          <section class="content-section">
            <h2>Updates to This Policy</h2>
            <p>
              We may update this policy periodically. Changes will be posted on this page 
              with an updated revision date.
            </p>
          </section>
          
          <section class="content-section">
            <h2>Contact Us</h2>
            <p>
              Questions about cookies? Contact us at:
              <br />
              <a href="mailto:privacy@fynda.com">privacy@fynda.com</a>
            </p>
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

.static-container.narrow {
  max-width: 700px;
}

.page-title {
  font-size: 42px;
  font-weight: 700;
  color: #111;
  margin-bottom: 8px;
}

.last-updated {
  font-size: 14px;
  color: #888;
  margin-bottom: 48px;
}

.content-section {
  margin-bottom: 36px;
}

.content-section h2 {
  font-size: 22px;
  font-weight: 600;
  color: #111;
  margin-bottom: 16px;
}

.content-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.content-section p {
  font-size: 15px;
  line-height: 1.8;
  color: #555;
  margin-bottom: 12px;
}

.content-section ul {
  margin: 12px 0 12px 24px;
  color: #555;
}

.content-section li {
  margin-bottom: 8px;
  line-height: 1.6;
}

.content-section a {
  color: #111;
  text-decoration: underline;
}

.cookie-type {
  background: #fafafa;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 16px;
}

.cookie-type h3 {
  margin-bottom: 8px;
}

.cookie-type p {
  margin-bottom: 12px;
}

.cookie-badge {
  display: inline-block;
  padding: 4px 10px;
  background: #eee;
  color: #666;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.cookie-badge.required {
  background: #111;
  color: #fff;
}

@media (max-width: 600px) {
  .page-title {
    font-size: 32px;
  }
}
</style>
