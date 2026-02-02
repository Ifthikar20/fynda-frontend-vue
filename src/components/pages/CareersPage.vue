<template>
  <div class="static-page">
    <NavBar />
    
    <main class="static-content">
      <div class="static-container">
        <div class="hero-section">
          <h1 class="page-title">Join the Fynda Team</h1>
          <p class="page-subtitle">
            Help us build the future of deal discovery. We're looking for passionate 
            people who want to make online shopping smarter for everyone.
          </p>
        </div>
        
        <section class="perks-section">
          <h2>Why Fynda?</h2>
          <div class="perks-grid">
            <div class="perk-card">
              <div class="perk-icon">🌍</div>
              <h3>Remote First</h3>
              <p>Work from anywhere in the world. We believe in flexibility and trust.</p>
            </div>
            <div class="perk-card">
              <div class="perk-icon">💰</div>
              <h3>Competitive Pay</h3>
              <p>Top-tier compensation with equity options for all team members.</p>
            </div>
            <div class="perk-card">
              <div class="perk-icon">🏥</div>
              <h3>Full Benefits</h3>
              <p>Comprehensive health, dental, and vision coverage for you and family.</p>
            </div>
            <div class="perk-card">
              <div class="perk-icon">📚</div>
              <h3>Learning Budget</h3>
              <p>$2,000/year for courses, conferences, and professional development.</p>
            </div>
            <div class="perk-card">
              <div class="perk-icon">🏖️</div>
              <h3>Unlimited PTO</h3>
              <p>Take the time you need. We encourage at least 4 weeks off per year.</p>
            </div>
            <div class="perk-card">
              <div class="perk-icon">🖥️</div>
              <h3>Equipment Stipend</h3>
              <p>$3,000 to set up your ideal home office workspace.</p>
            </div>
          </div>
        </section>
        
        <section class="jobs-section">
          <h2>Open Positions</h2>
          
          <div class="jobs-list">
            <div class="job-card">
              <div class="job-header">
                <h3>Senior Full Stack Engineer</h3>
                <span class="job-badge">Engineering</span>
              </div>
              <p class="job-location">Remote • Full-time</p>
              <p class="job-description">
                Build and scale our deal aggregation platform using Python, Django, Vue.js, and 
                modern ML technologies.
              </p>
              <a href="mailto:careers@fynda.com?subject=Senior Full Stack Engineer" class="job-apply">Apply Now →</a>
            </div>
            
            <div class="job-card">
              <div class="job-header">
                <h3>ML Engineer</h3>
                <span class="job-badge">Engineering</span>
              </div>
              <p class="job-location">Remote • Full-time</p>
              <p class="job-description">
                Develop and improve our visual search, NLP query parsing, and recommendation 
                systems using PyTorch and modern ML frameworks.
              </p>
              <a href="mailto:careers@fynda.com?subject=ML Engineer" class="job-apply">Apply Now →</a>
            </div>
            
            <div class="job-card">
              <div class="job-header">
                <h3>Mobile Developer (Flutter)</h3>
                <span class="job-badge">Engineering</span>
              </div>
              <p class="job-location">Remote • Full-time</p>
              <p class="job-description">
                Build our cross-platform mobile app from the ground up. Create beautiful, 
                performant experiences for iOS and Android.
              </p>
              <a href="mailto:careers@fynda.com?subject=Mobile Developer" class="job-apply">Apply Now →</a>
            </div>
            
            <div class="job-card">
              <div class="job-header">
                <h3>Product Designer</h3>
                <span class="job-badge">Design</span>
              </div>
              <p class="job-location">Remote • Full-time</p>
              <p class="job-description">
                Shape the user experience across web and mobile. Create intuitive designs 
                that help millions find great deals.
              </p>
              <a href="mailto:careers@fynda.com?subject=Product Designer" class="job-apply">Apply Now →</a>
            </div>
            
            <div class="job-card">
              <div class="job-header">
                <h3>Growth Marketing Manager</h3>
                <span class="job-badge">Marketing</span>
              </div>
              <p class="job-location">Remote • Full-time</p>
              <p class="job-description">
                Drive user acquisition and engagement through creative campaigns across 
                social media, SEO, and partnerships.
              </p>
              <a href="mailto:careers@fynda.com?subject=Growth Marketing Manager" class="job-apply">Apply Now →</a>
            </div>
          </div>
        </section>
        
        <section class="cta-section">
          <h2>Don't see your role?</h2>
          <p>We're always looking for talented people. Send us your resume and let us know how you can contribute.</p>
          <a href="mailto:careers@fynda.com" class="btn-primary">Send General Application</a>
        </section>
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
  max-width: 900px;
  margin: 0 auto;
}

.hero-section {
  text-align: center;
  margin-bottom: 64px;
}

.page-title {
  font-size: 46px;
  font-weight: 700;
  color: #111;
  margin-bottom: 16px;
}

.page-subtitle {
  font-size: 18px;
  color: #555;
  line-height: 1.7;
  max-width: 600px;
  margin: 0 auto;
}

.perks-section, .jobs-section {
  margin-bottom: 64px;
}

.perks-section h2, .jobs-section h2 {
  font-size: 28px;
  font-weight: 600;
  color: #111;
  margin-bottom: 32px;
  text-align: center;
}

.perks-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.perk-card {
  background: #fafafa;
  padding: 28px;
  border-radius: 16px;
  text-align: center;
}

.perk-icon {
  font-size: 36px;
  margin-bottom: 16px;
}

.perk-card h3 {
  font-size: 17px;
  font-weight: 600;
  color: #111;
  margin-bottom: 8px;
}

.perk-card p {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.jobs-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.job-card {
  background: #fafafa;
  padding: 28px;
  border-radius: 16px;
  transition: all 0.2s ease;
}

.job-card:hover {
  background: #f0f0f0;
}

.job-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.job-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #111;
}

.job-badge {
  padding: 4px 10px;
  background: #111;
  color: #fff;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
}

.job-location {
  font-size: 13px;
  color: #888;
  margin-bottom: 12px;
}

.job-description {
  font-size: 14px;
  color: #555;
  line-height: 1.6;
  margin-bottom: 16px;
}

.job-apply {
  font-size: 14px;
  font-weight: 600;
  color: #111;
  text-decoration: none;
}

.job-apply:hover {
  text-decoration: underline;
}

.cta-section {
  text-align: center;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  padding: 48px;
  border-radius: 20px;
}

.cta-section h2 {
  font-size: 24px;
  font-weight: 600;
  color: #111;
  margin-bottom: 12px;
}

.cta-section p {
  font-size: 15px;
  color: #555;
  margin-bottom: 24px;
}

.btn-primary {
  display: inline-block;
  padding: 14px 32px;
  background: #111;
  color: #fff;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: #333;
}

@media (max-width: 800px) {
  .perks-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .page-title {
    font-size: 36px;
  }
}

@media (max-width: 500px) {
  .perks-grid {
    grid-template-columns: 1fr;
  }
  
  .job-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
