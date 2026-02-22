<template>
  <div class="static-page">
    <NavBar />
    
    <main class="static-content">
      <div class="static-container narrow">
        <h1 class="page-title">Terms of Service</h1>
        <p class="last-updated">Last updated: January 2026</p>
        
        <div class="page-content">
          <section class="content-section">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using Outfi ("Service"), you agree to be bound by these Terms of Service. 
              If you disagree with any part of these terms, you may not access the Service.
            </p>
          </section>
          
          <section class="content-section">
            <h2>2. Description of Service</h2>
            <p>
              Outfi is a deal aggregation platform that helps users find products across multiple 
              online marketplaces. We do not sell products directly; we redirect users to third-party 
              retailers where purchases are made.
            </p>
          </section>
          
          <section class="content-section">
            <h2>3. User Accounts</h2>
            <p>
              To access certain features, you must create an account. You are responsible for:
            </p>
            <ul>
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
            </ul>
          </section>
          
          <section class="content-section">
            <h2>4. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Scrape, crawl, or use automated means to access the Service</li>
              <li>Transmit viruses or malicious code</li>
              <li>Impersonate any person or entity</li>
            </ul>
          </section>
          
          <section class="content-section">
            <h2>5. Third-Party Links</h2>
            <p>
              Our Service contains links to third-party websites and retailers. We are not responsible 
              for the content, privacy policies, or practices of any third-party sites. Purchases made 
              through these links are subject to the terms of those retailers.
            </p>
          </section>
          
          <section class="content-section">
            <h2>6. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are owned by Outfi 
              and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
          </section>
          
          <section class="content-section">
            <h2>7. Disclaimer</h2>
            <p>
              The Service is provided "as is" without warranties of any kind. We do not guarantee 
              the accuracy of pricing information, product availability, or deal validity. Prices 
              and availability are subject to change.
            </p>
          </section>
          
          <section class="content-section">
            <h2>8. Limitation of Liability</h2>
            <p>
              Outfi shall not be liable for any indirect, incidental, special, consequential, or 
              punitive damages arising from your use of the Service.
            </p>
          </section>
          
          <section class="content-section">
            <h2>9. Termination</h2>
            <p>
              We may terminate or suspend your account at any time without prior notice for conduct 
              that we believe violates these Terms or is harmful to other users, us, or third parties.
            </p>
          </section>
          
          <section class="content-section">
            <h2>10. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of 
              significant changes via email or through the Service.
            </p>
          </section>
          
          <section class="content-section">
            <h2>11. Contact</h2>
            <p>
              Questions about these Terms? Contact us at:
              <br />
              <a href="mailto:legal@outfi.ai">legal@outfi.ai</a>
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
  margin-bottom: 32px;
}

.content-section h2 {
  font-size: 18px;
  font-weight: 600;
  color: #111;
  margin-bottom: 12px;
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

@media (max-width: 600px) {
  .page-title {
    font-size: 32px;
  }
}
</style>
