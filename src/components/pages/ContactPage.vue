<template>
  <div class="static-page">
    <NavBar />
    
    <main class="static-content">
      <div class="static-container">
        <h1 class="page-title">Contact Us</h1>
        <p class="page-subtitle">We'd love to hear from you. Get in touch with our team.</p>
        
        <div class="contact-grid">
          <div class="contact-form-section">
            <form @submit.prevent="submitForm" class="contact-form">
              <div class="form-group">
                <label>Your Name</label>
                <input v-model="form.name" type="text" placeholder="John Doe" required />
              </div>
              
              <div class="form-group">
                <label>Email Address</label>
                <input v-model="form.email" type="email" placeholder="john@example.com" required />
              </div>
              
              <div class="form-group">
                <label>Subject</label>
                <select v-model="form.subject" required>
                  <option value="">Select a topic</option>
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="feedback">Feedback</option>
                  <option value="partnership">Partnership</option>
                  <option value="press">Press Inquiry</option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Message</label>
                <textarea v-model="form.message" placeholder="How can we help you?" rows="5" required></textarea>
              </div>
              
              <button type="submit" class="btn-primary" :disabled="submitting">
                {{ submitting ? 'Sending...' : 'Send Message' }}
              </button>
              
              <div v-if="submitted" class="success-message">
                ✓ Message sent! We'll get back to you soon.
              </div>
            </form>
          </div>
          
          <div class="contact-info-section">
            <div class="info-card">
              <div class="info-icon">📧</div>
              <h3>Email</h3>
              <p>General inquiries</p>
              <a href="mailto:hello@fynda.com">hello@fynda.com</a>
            </div>
            
            <div class="info-card">
              <div class="info-icon">🛟</div>
              <h3>Support</h3>
              <p>Need help?</p>
              <a href="mailto:support@fynda.com">support@fynda.com</a>
            </div>
            
            <div class="info-card">
              <div class="info-icon">📰</div>
              <h3>Press</h3>
              <p>Media inquiries</p>
              <a href="mailto:press@fynda.com">press@fynda.com</a>
            </div>
            
            <div class="social-section">
              <h3>Follow Us</h3>
              <div class="social-links">
                <a href="https://instagram.com/fynda" target="_blank" class="social-link">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="currentColor" stroke-width="2" fill="none"/>
                    <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2" fill="none"/>
                    <line x1="18" y1="6" x2="18" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  Instagram
                </a>
                <a href="https://twitter.com/fynda" target="_blank" class="social-link">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
                  </svg>
                  Twitter
                </a>
                <a href="https://tiktok.com/@fynda" target="_blank" class="social-link">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                  TikTok
                </a>
                <a href="https://pinterest.com/fynda" target="_blank" class="social-link">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
                  </svg>
                  Pinterest
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    
    <Footer />
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import NavBar from '../NavBar.vue'
import Footer from '../Footer.vue'

const form = reactive({
  name: '',
  email: '',
  subject: '',
  message: ''
})

const submitting = ref(false)
const submitted = ref(false)

const submitForm = async () => {
  submitting.value = true
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  submitting.value = false
  submitted.value = true
  
  // Reset form
  form.name = ''
  form.email = ''
  form.subject = ''
  form.message = ''
  
  setTimeout(() => submitted.value = false, 5000)
}
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
  max-width: 1000px;
  margin: 0 auto;
}

.page-title {
  font-size: 42px;
  font-weight: 700;
  color: #111;
  margin-bottom: 12px;
  text-align: center;
}

.page-subtitle {
  font-size: 18px;
  color: #666;
  text-align: center;
  margin-bottom: 48px;
}

.contact-grid {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 48px;
}

.contact-form {
  background: #fafafa;
  padding: 32px;
  border-radius: 16px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 15px;
  font-family: inherit;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #111;
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
}

.btn-primary {
  width: 100%;
  padding: 14px 24px;
  border: none;
  background: #111;
  color: #fff;
  border-radius: 10px;
  font-size: 15px;
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

.success-message {
  margin-top: 16px;
  padding: 12px;
  background: #d4edda;
  color: #155724;
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
}

.contact-info-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-card {
  background: #fafafa;
  padding: 24px;
  border-radius: 12px;
}

.info-icon {
  font-size: 28px;
  margin-bottom: 12px;
}

.info-card h3 {
  font-size: 16px;
  font-weight: 600;
  color: #111;
  margin-bottom: 4px;
}

.info-card p {
  font-size: 13px;
  color: #888;
  margin-bottom: 8px;
}

.info-card a {
  font-size: 14px;
  color: #111;
  text-decoration: none;
  font-weight: 500;
}

.info-card a:hover {
  text-decoration: underline;
}

.social-section {
  margin-top: 16px;
}

.social-section h3 {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.social-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.social-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #fafafa;
  border-radius: 10px;
  font-size: 14px;
  color: #333;
  text-decoration: none;
  transition: all 0.2s ease;
}

.social-link:hover {
  background: #f0f0f0;
}

@media (max-width: 800px) {
  .contact-grid {
    grid-template-columns: 1fr;
  }
  
  .page-title {
    font-size: 32px;
  }
}
</style>
