<template>
  <div class="static-page">
    <NavBar />
    
    <main class="static-content">
      <div class="static-container">
        <h1 class="page-title">Help Center</h1>
        <p class="page-subtitle">Find answers to common questions or get in touch with our support team.</p>
        
        <!-- Search -->
        <div class="search-box">
          <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input v-model="searchQuery" type="text" placeholder="Search for help..." />
        </div>
        
        <!-- FAQ Categories -->
        <div class="faq-categories">
          <button
            v-for="cat in categories"
            :key="cat.id"
            :class="['category-btn', { active: activeCategory === cat.id }]"
            @click="activeCategory = cat.id"
          >
            <span class="cat-icon">{{ cat.icon }}</span>
            {{ cat.name }}
          </button>
        </div>
        
        <!-- FAQ Items -->
        <div class="faq-list">
          <div
            v-for="faq in filteredFaqs"
            :key="faq.id"
            :class="['faq-item', { open: openFaq === faq.id }]"
          >
            <button class="faq-question" @click="toggleFaq(faq.id)">
              {{ faq.question }}
              <svg class="faq-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>
            <div class="faq-answer">
              <p>{{ faq.answer }}</p>
            </div>
          </div>
        </div>
        
        <!-- Contact Support -->
        <div class="support-section">
          <h2>Still need help?</h2>
          <p>Our support team is here to assist you.</p>
          <div class="support-options">
            <a href="mailto:support@fynda.com" class="support-card">
              <div class="support-icon">📧</div>
              <h3>Email Support</h3>
              <p>Get a response within 24 hours</p>
            </a>
            <router-link to="/contact" class="support-card">
              <div class="support-icon">💬</div>
              <h3>Contact Form</h3>
              <p>Send us a detailed message</p>
            </router-link>
          </div>
        </div>
      </div>
    </main>
    
    <Footer />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import NavBar from '../NavBar.vue'
import Footer from '../Footer.vue'

const searchQuery = ref('')
const activeCategory = ref('all')
const openFaq = ref(null)

const categories = [
  { id: 'all', name: 'All', icon: '📋' },
  { id: 'account', name: 'Account', icon: '👤' },
  { id: 'search', name: 'Search & Deals', icon: '🔍' },
  { id: 'alerts', name: 'Price Alerts', icon: '🔔' },
  { id: 'privacy', name: 'Privacy & Security', icon: '🔒' },
]

const faqs = [
  {
    id: 1,
    category: 'account',
    question: 'How do I create an account?',
    answer: 'Click the "Get Started" button in the top right corner and fill out the registration form with your email and password. You can also sign up using your Google account for faster access.'
  },
  {
    id: 2,
    category: 'account',
    question: 'How do I reset my password?',
    answer: 'Click "Sign In", then select "Forgot Password". Enter your email address and we\'ll send you a link to reset your password. Check your spam folder if you don\'t see it.'
  },
  {
    id: 3,
    category: 'account',
    question: 'Can I delete my account?',
    answer: 'Yes, go to Profile > Security and scroll to the Danger Zone section. Click "Delete Account" and confirm. This action is permanent and will delete all your data.'
  },
  {
    id: 4,
    category: 'search',
    question: 'How does the search work?',
    answer: 'Our AI-powered search understands natural language. You can search for things like "Sony camera under $500" or "running shoes size 10 red". We search multiple marketplaces simultaneously to find the best deals.'
  },
  {
    id: 5,
    category: 'search',
    question: 'What marketplaces do you search?',
    answer: 'We search Amazon, eBay, Best Buy, Walmart, Target, TikTok Shop, and many more. We\'re constantly adding new sources to give you the most comprehensive results.'
  },
  {
    id: 6,
    category: 'search',
    question: 'How do I use visual search?',
    answer: 'Click the camera icon in the search bar and upload a screenshot or photo of a product. Our AI will analyze the image and find similar products across all marketplaces.'
  },
  {
    id: 7,
    category: 'alerts',
    question: 'How do price alerts work?',
    answer: 'When you find a product you like, set a target price. We\'ll monitor the price across all marketplaces and notify you instantly when it drops to or below your target.'
  },
  {
    id: 8,
    category: 'alerts',
    question: 'How many price alerts can I set?',
    answer: 'Free accounts can set up to 5 price alerts. Premium users can set unlimited alerts with more frequent price checks.'
  },
  {
    id: 9,
    category: 'privacy',
    question: 'Do you sell my data?',
    answer: 'No, we never sell your personal data. We only use your information to improve your experience and send you the notifications you\'ve opted into.'
  },
  {
    id: 10,
    category: 'privacy',
    question: 'How is my data protected?',
    answer: 'We use industry-standard encryption for all data in transit and at rest. Your passwords are hashed and never stored in plain text. We conduct regular security audits.'
  },
]

const filteredFaqs = computed(() => {
  let results = faqs
  
  if (activeCategory.value !== 'all') {
    results = results.filter(f => f.category === activeCategory.value)
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    results = results.filter(f => 
      f.question.toLowerCase().includes(query) ||
      f.answer.toLowerCase().includes(query)
    )
  }
  
  return results
})

const toggleFaq = (id) => {
  openFaq.value = openFaq.value === id ? null : id
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
  max-width: 800px;
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
  margin-bottom: 40px;
}

.search-box {
  position: relative;
  margin-bottom: 32px;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.search-box input {
  width: 100%;
  padding: 16px 16px 16px 48px;
  border: 1px solid #ddd;
  border-radius: 12px;
  font-size: 16px;
  transition: border-color 0.2s ease;
}

.search-box input:focus {
  outline: none;
  border-color: #111;
}

.faq-categories {
  display: flex;
  gap: 10px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.category-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  color: #555;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-btn:hover {
  border-color: #111;
  color: #111;
}

.category-btn.active {
  background: #111;
  border-color: #111;
  color: #fff;
}

.cat-icon {
  font-size: 16px;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 64px;
}

.faq-item {
  border: 1px solid #eee;
  border-radius: 12px;
  overflow: hidden;
}

.faq-question {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border: none;
  background: #fafafa;
  font-size: 15px;
  font-weight: 500;
  color: #111;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease;
}

.faq-question:hover {
  background: #f0f0f0;
}

.faq-arrow {
  transition: transform 0.2s ease;
}

.faq-item.open .faq-arrow {
  transform: rotate(180deg);
}

.faq-answer {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease, padding 0.3s ease;
}

.faq-item.open .faq-answer {
  max-height: 200px;
  padding: 20px 24px;
}

.faq-answer p {
  font-size: 14px;
  line-height: 1.7;
  color: #555;
}

.support-section {
  text-align: center;
  background: #fafafa;
  padding: 48px;
  border-radius: 20px;
}

.support-section h2 {
  font-size: 24px;
  font-weight: 600;
  color: #111;
  margin-bottom: 8px;
}

.support-section > p {
  font-size: 15px;
  color: #666;
  margin-bottom: 28px;
}

.support-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  max-width: 500px;
  margin: 0 auto;
}

.support-card {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  text-decoration: none;
  text-align: center;
  transition: all 0.2s ease;
  border: 1px solid #eee;
}

.support-card:hover {
  border-color: #111;
  transform: translateY(-2px);
}

.support-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.support-card h3 {
  font-size: 16px;
  font-weight: 600;
  color: #111;
  margin-bottom: 4px;
}

.support-card p {
  font-size: 13px;
  color: #888;
}

@media (max-width: 600px) {
  .page-title {
    font-size: 32px;
  }
  
  .support-options {
    grid-template-columns: 1fr;
  }
  
  .faq-categories {
    justify-content: center;
  }
}
</style>
