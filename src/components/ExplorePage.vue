<template>
  <div class="explore-page">
    <NavBar />

    <main class="explore-content">

      <!-- Editor's Picks -->
      <section class="editors-section">
        <h2 class="section-heading">Editor's picks</h2>
        <div class="editors-grid">
          <div 
            v-for="pick in editorsPicks" 
            :key="pick.id" 
            class="editors-card"
            :style="{ backgroundImage: `url(${pick.image})` }"
            @click="goSearch(pick.query)"
          >
            <div class="editors-overlay">
              <h3>{{ pick.title }}</h3>
              <span class="explore-link">Start exploring →</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Shop By Category -->
      <section class="category-section">
        <div class="category-grid">
          <div 
            v-for="cat in categories" 
            :key="cat.id" 
            class="category-card"
            :style="{ backgroundImage: `url(${cat.image})` }"
            @click="goSearch(cat.query)"
          >
            <div class="category-overlay">
              <h3>{{ cat.title }}</h3>
              <span class="explore-link">Start exploring →</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Promo Banner -->
      <section class="promo-section">
        <div class="promo-banner">
          <div class="promo-image">
            <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80" alt="Fashion" />
          </div>
          <div class="promo-content">
            <span class="promo-tag">FOR YOU</span>
            <h2>Discover & save on trending fashion</h2>
            <p>Browse curated collections across trending brands, exclusive deals, and styles that match your vibe.</p>
            <router-link to="/" class="promo-link">Learn more →</router-link>
          </div>
        </div>
      </section>

      <!-- Trending Now -->
      <section class="trending-section">
        <div class="trending-header">
          <div>
            <h2 class="section-heading">What's trending</h2>
            <p class="section-sub">See what shoppers are loving right now</p>
          </div>
        </div>
        <div class="trending-grid">
          <div 
            v-for="item in trendingItems" 
            :key="item.id" 
            class="trending-card"
            @click="goSearch(item.query)"
          >
            <div class="trending-image">
              <img :src="item.image" :alt="item.title" />
            </div>
            <div class="trending-info">
              <span class="trending-tag">Trending</span>
              <h3>{{ item.title }}</h3>
              <span class="explore-link-sm">Shop now →</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Explore Brands -->
      <section class="brands-section">
        <div class="brands-header">
          <div>
            <h2 class="section-heading">Explore brands</h2>
            <p class="section-sub">Explore top-tier products from brands you know and discover new brands you'll love.</p>
          </div>
        </div>
        <div class="brands-label">
          <span class="label-tag">TRENDING BRANDS</span>
        </div>
        <div class="brands-grid">
          <div 
            v-for="brand in brands" 
            :key="brand.name" 
            class="brand-card"
            :style="{ backgroundImage: `url(${brand.image})` }"
            @click="goBrand(brand.name)"
          >
            <div class="brand-overlay">
              <span class="brand-name">{{ brand.name }}</span>
            </div>
          </div>
        </div>
      </section>

    </main>

    <Footer />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import NavBar from './NavBar.vue'
import Footer from './Footer.vue'

const router = useRouter()

const editorsPicks = [
  {
    id: 1,
    title: 'Wild About Animal Print',
    query: 'animal print fashion',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80'
  },
  {
    id: 2,
    title: 'Holiday in the Sun',
    query: 'summer vacation outfit',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80'
  },
  {
    id: 3,
    title: 'Transformative Teal',
    query: 'teal green fashion',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80'
  }
]

const categories = [
  {
    id: 1,
    title: 'For her',
    query: 'women fashion',
    image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=600&q=80'
  },
  {
    id: 2,
    title: 'For him',
    query: 'men fashion',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80'
  },
  {
    id: 3,
    title: 'Both',
    query: 'unisex streetwear',
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&q=80'
  }
]

const trendingItems = [
  {
    id: 1,
    title: 'Quiet Luxury',
    query: 'quiet luxury minimal',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80'
  },
  {
    id: 2,
    title: 'Linen Everything',
    query: 'linen clothing',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80'
  },
  {
    id: 3,
    title: 'Statement Bags',
    query: 'designer handbag',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80'
  },
  {
    id: 4,
    title: 'Chunky Sneakers',
    query: 'chunky sneakers',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80'
  },
  {
    id: 5,
    title: 'Gold Jewelry',
    query: 'gold jewelry',
    image: 'https://images.unsplash.com/photo-1515562141589-67f0d0e6e9e1?w=400&q=80'
  },
  {
    id: 6,
    title: 'Oversized Blazers',
    query: 'oversized blazer',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80'
  }
]

const brands = [
  { name: 'Zara', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&q=80' },
  { name: 'Nike', image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400&q=80' },
  { name: 'Madewell', image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=400&q=80' },
  { name: 'H&M', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&q=80' },
  { name: 'Adidas', image: 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=400&q=80' },
  { name: 'Reformation', image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=80' },
  { name: 'Levi\'s', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80' },
  { name: 'COS', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80' },
  { name: 'Gucci', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80' }
]

const goSearch = (query) => {
  router.push(`/?q=${encodeURIComponent(query)}`)
}

const goBrand = (brand) => {
  router.push(`/brand/${encodeURIComponent(brand)}`)
}
</script>

<style scoped>
.explore-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.explore-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
  width: 100%;
}

/* ── Section Headings ── */
.section-heading {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.75rem;
  font-weight: 400;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
}

.section-sub {
  font-size: 0.85rem;
  color: #888;
  margin-bottom: 0;
}

/* ── Editor's Picks ── */
.editors-section {
  margin-bottom: 3rem;
}

.editors-section .section-heading {
  text-align: center;
  margin-bottom: 1.5rem;
}

.editors-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.editors-card {
  position: relative;
  height: 340px;
  border-radius: 12px;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.editors-card:hover {
  transform: scale(1.02);
}

.editors-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.65) 100%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 1.5rem;
}

.editors-overlay h3 {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.5rem;
  font-weight: 400;
  color: #fff;
  margin: 0 0 0.35rem;
  line-height: 1.2;
}

.explore-link {
  font-size: 0.78rem;
  font-weight: 600;
  color: #fff;
  text-decoration: underline;
  text-underline-offset: 3px;
}

/* ── Category Cards ── */
.category-section {
  margin-bottom: 3rem;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.category-card {
  position: relative;
  height: 260px;
  border-radius: 12px;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  cursor: pointer;
  filter: grayscale(100%);
  transition: all 0.3s ease;
}

.category-card:hover {
  filter: grayscale(0%);
  transform: scale(1.02);
}

.category-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.55) 100%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 1.25rem;
}

.category-overlay h3 {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.25rem;
  font-weight: 400;
  color: #fff;
  margin: 0 0 0.25rem;
}

/* ── Promo Banner ── */
.promo-section {
  margin-bottom: 3rem;
}

.promo-banner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #f5f0ea;
  border-radius: 16px;
  overflow: hidden;
  min-height: 300px;
}

.promo-image {
  overflow: hidden;
}

.promo-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.promo-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 3rem;
}

.promo-tag {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 2px;
  color: #999;
  text-transform: uppercase;
  margin-bottom: 0.75rem;
}

.promo-content h2 {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.65rem;
  font-weight: 400;
  color: #1a1a1a;
  line-height: 1.25;
  margin: 0 0 0.75rem;
}

.promo-content p {
  font-size: 0.85rem;
  color: #666;
  line-height: 1.6;
  margin: 0 0 1.25rem;
}

.promo-link {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1a1a1a;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.promo-link:hover {
  color: #555;
}

/* ── Trending ── */
.trending-section {
  margin-bottom: 3.5rem;
}

.trending-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 1.25rem;
}

.trending-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.trending-card {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #eee;
  cursor: pointer;
  transition: all 0.25s ease;
}

.trending-card:hover {
  border-color: #ddd;
  box-shadow: 0 8px 24px rgba(0,0,0,0.07);
  transform: translateY(-3px);
}

.trending-image {
  aspect-ratio: 4/3;
  overflow: hidden;
}

.trending-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.trending-card:hover .trending-image img {
  transform: scale(1.05);
}

.trending-info {
  padding: 1rem 1.25rem;
}

.trending-tag {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  color: #16a34a;
  text-transform: uppercase;
}

.trending-info h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0.35rem 0;
}

.explore-link-sm {
  font-size: 0.78rem;
  color: #888;
  transition: color 0.2s ease;
}

.trending-card:hover .explore-link-sm {
  color: #1a1a1a;
}

/* ── Brands ── */
.brands-section {
  margin-bottom: 3rem;
}

.brands-header {
  margin-bottom: 1rem;
}

.brands-label {
  margin-bottom: 1rem;
}

.label-tag {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 2px;
  color: #bbb;
  text-transform: uppercase;
}

.brands-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.brand-card {
  position: relative;
  height: 200px;
  border-radius: 10px;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.brand-card:hover {
  transform: scale(1.03);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}

.brand-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease;
}

.brand-card:hover .brand-overlay {
  background: rgba(0, 0, 0, 0.5);
}

.brand-name {
  font-family: 'Inter', sans-serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: 2px;
  text-transform: uppercase;
}

/* ── Responsive ── */
@media (max-width: 900px) {
  .editors-grid,
  .category-grid,
  .trending-grid,
  .brands-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .promo-banner {
    grid-template-columns: 1fr;
  }

  .promo-image {
    height: 220px;
  }

  .promo-content {
    padding: 2rem;
  }
}

@media (max-width: 600px) {
  .editors-grid,
  .category-grid {
    grid-template-columns: 1fr;
  }

  .editors-card {
    height: 260px;
  }

  .category-card {
    height: 200px;
  }

  .trending-grid {
    grid-template-columns: 1fr;
  }

  .brands-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .brand-card {
    height: 160px;
  }

  .section-heading {
    font-size: 1.4rem;
  }
}
</style>
