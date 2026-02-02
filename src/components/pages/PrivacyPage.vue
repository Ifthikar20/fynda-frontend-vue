<template>
  <div class="static-page">
    <NavBar />
    
    <main class="static-content">
      <div class="static-container narrow">
        <h1 class="page-title">Privacy Policy</h1>
        <p class="last-updated">Last updated: January 2026</p>
        
        <div class="page-content">
          <section class="content-section">
            <h2>Introduction</h2>
            <p>
              At Fynda ("we", "our", or "us"), we take your privacy seriously. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when you use 
              our website and mobile application.
            </p>
          </section>
          
          <section class="content-section">
            <h2>Information We Collect</h2>
            
            <h3>Personal Information</h3>
            <p>When you create an account, we collect:</p>
            <ul>
              <li>Email address</li>
              <li>Name (optional)</li>
              <li>Password (encrypted)</li>
            </ul>
            
            <h3>Usage Information</h3>
            <p>We automatically collect:</p>
            <ul>
              <li>Search queries and browsing history</li>
              <li>Device information and IP address</li>
              <li>Saved deals and price alerts</li>
            </ul>
          </section>
          
          <section class="content-section">
            <h2>How We Use Your Information</h2>
            <p>We use collected information to:</p>
            <ul>
              <li>Provide and improve our services</li>
              <li>Personalize your deal recommendations</li>
              <li>Send price alerts and notifications (with your consent)</li>
              <li>Analyze usage patterns to improve our platform</li>
              <li>Prevent fraud and ensure security</li>
            </ul>
          </section>
          
          <section class="content-section">
            <h2>Information Sharing</h2>
            <p>
              We do not sell your personal information. We may share data with:
            </p>
            <ul>
              <li>Service providers who help us operate Fynda</li>
              <li>Analytics partners (anonymized data only)</li>
              <li>Law enforcement when required by law</li>
            </ul>
          </section>
          
          <section class="content-section">
            <h2>Data Security</h2>
            <p>
              We implement industry-standard security measures including encryption, 
              secure servers, and regular security audits. However, no method of transmission 
              over the Internet is 100% secure.
            </p>
          </section>
          
          <section class="content-section">
            <h2>Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and data</li>
              <li>Opt out of marketing communications</li>
              <li>Export your data</li>
            </ul>
          </section>
          
          <section class="content-section">
            <h2>Cookies</h2>
            <p>
              We use cookies and similar technologies to enhance your experience. 
              You can control cookies through your browser settings. See our 
              <router-link to="/cookies">Cookie Policy</router-link> for more details.
            </p>
          </section>
          
          <section class="content-section">
            <h2>Contact Us</h2>
            <p>
              For privacy-related questions, contact us at:
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
  margin: 20px 0 12px;
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

.content-section a:hover {
  color: #666;
}

@media (max-width: 600px) {
  .page-title {
    font-size: 32px;
  }
}
</style>
