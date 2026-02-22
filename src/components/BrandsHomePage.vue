<template>
  <div class="brands-home">
    <NavBar />

    <main class="brands-content">
      <!-- Masonry Grid -->
      <div class="masonry">
        <div 
          v-for="item in visibleItems" 
          :key="item.id" 
          class="pin"
          @click="openItem(item)"
        >
          <div class="pin-img-wrap">
            <img :src="item.image" :alt="item.title" class="pin-img" loading="lazy" />
            <div class="pin-overlay">
              <button class="save-btn" @click.stop="toggleSave(item)">
                {{ item.saved ? 'Saved' : 'Save' }}
              </button>
            </div>
          </div>
          <div class="pin-info">
            <div class="pin-text">
              <p class="pin-title">{{ item.title }}</p>
              <span class="pin-source">{{ item.brand }}</span>
            </div>
            <button class="pin-menu" @click.stop>⋯</button>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
      </div>

      <!-- Load More Sentinel -->
      <div ref="sentinel" class="sentinel"></div>
    </main>
  </div>
</template>

<script setup>
defineOptions({ name: 'BrandsHomePage' })
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from './NavBar.vue'

const router = useRouter()
const loading = ref(false)
const sentinel = ref(null)
const visibleCount = ref(40)
let observer = null

// Curated brand items for the masonry grid
const allItems = ref([
  { id: 1, title: 'Silk Slip Dress — Champagne', brand: 'Reformation', image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=80', saved: false, url: null },
  { id: 2, title: 'Vintage Leather Jacket', brand: 'AllSaints', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80', saved: false, url: null },
  { id: 3, title: 'Chunky Platform Sneakers', brand: 'Nike', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80', saved: false, url: null },
  { id: 4, title: 'Gold Hoop Earrings', brand: 'Mejuri', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80', saved: false, url: null },
  { id: 5, title: 'Oversized Blazer — Charcoal', brand: 'Zara', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80', saved: false, url: null },
  { id: 6, title: 'Summer Streetwear Look', brand: 'Fashion Nova', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80', saved: false, url: null },
  { id: 7, title: 'Leather Crossbody Bag — Tan', brand: 'Madewell', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80', saved: false, url: null },
  { id: 8, title: 'Elegant Evening Gown', brand: 'Revolve', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80', saved: false, url: null },
  { id: 9, title: 'Retro Sunglasses', brand: 'Ray-Ban', image: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=400&q=80', saved: false, url: null },
  { id: 10, title: 'Minimalist Watch — Rose Gold', brand: 'MVMT', image: 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=400&q=80', saved: false, url: null },
  { id: 11, title: 'Festival Boho Outfit', brand: 'Free People', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&q=80', saved: false, url: null },
  { id: 12, title: 'Wide-Leg Linen Pants', brand: 'COS', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80', saved: false, url: null },
  { id: 13, title: 'Running Shoes — Black', brand: 'Adidas', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80', saved: false, url: null },
  { id: 14, title: 'Denim Jacket — Classic Blue', brand: 'Levi\'s', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&q=80', saved: false, url: null },
  { id: 15, title: 'Casual Knit Sweater', brand: 'Everlane', image: 'https://images.unsplash.com/photo-1434389677669-e08b4cda3a20?w=400&q=80', saved: false, url: null },
  { id: 16, title: 'Y2K Crop Top', brand: 'Princess Polly', image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&q=80', saved: false, url: null },
  { id: 17, title: 'Power Suit — Navy', brand: 'Theory', image: 'https://images.unsplash.com/photo-1544957992-20514f595d6f?w=400&q=80', saved: false, url: null },
  { id: 18, title: 'Canvas Tote Bag', brand: 'Madewell', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80', saved: false, url: null },
  { id: 19, title: 'Athleisure Set — Sage', brand: 'Gymshark', image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&q=80', saved: false, url: null },
  { id: 20, title: 'Beach Vacation Style', brand: 'Aritzia', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80', saved: false, url: null },
  { id: 21, title: 'Smart Cashmere Coat', brand: 'COS', image: 'https://images.unsplash.com/photo-1544923246-77307dd270df?w=400&q=80', saved: false, url: null },
  { id: 22, title: 'Floral Maxi Dress', brand: 'Anthropologie', image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=400&q=80', saved: false, url: null },
  { id: 23, title: 'Vintage Thrift Find', brand: 'ThriftUp', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&q=80', saved: false, url: null },
  { id: 24, title: 'Layered Fall Outfit', brand: 'Uniqlo', image: 'https://images.unsplash.com/photo-1475180098004-ca77a66827be?w=400&q=80', saved: false, url: null },
  { id: 25, title: 'Statement Necklace — Gold', brand: 'Ana Luisa', image: 'https://images.unsplash.com/photo-1515562141589-67f0d0e6e9e1?w=400&q=80', saved: false, url: null },
  { id: 26, title: 'Slim Fit Oxford Shirt', brand: 'H&M', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&q=80', saved: false, url: null },
  { id: 27, title: "Men's Casual Friday", brand: 'Bonobos', image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400&q=80', saved: false, url: null },
  { id: 28, title: 'Shopping Day OOTD', brand: 'Urban Outfitters', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80', saved: false, url: null },
  { id: 29, title: 'Cozy Knit Season', brand: 'Aritzia', image: 'https://images.unsplash.com/photo-1495385794356-15371f348c31?w=400&q=80', saved: false, url: null },
  { id: 30, title: 'Pastel Dream Outfit', brand: 'Revolve', image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400&q=80', saved: false, url: null },
  { id: 31, title: 'Sneaker Culture', brand: 'Nike', image: 'https://images.unsplash.com/photo-1581044777550-4cfa60707998?w=400&q=80', saved: false, url: null },
  { id: 32, title: 'Accessories That Pop', brand: 'BaubleBar', image: 'https://images.unsplash.com/photo-1518577915332-c2a19f149a75?w=400&q=80', saved: false, url: null },
  { id: 33, title: 'Olive Chinos — Relaxed Fit', brand: 'Zara', image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&q=80', saved: false, url: null },
  { id: 34, title: 'Graphic Hoodie — Oversized', brand: 'Adidas', image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400&q=80', saved: false, url: null },
  { id: 35, title: 'Runway Ready Look', brand: 'Vogue Edit', image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&q=80', saved: false, url: null },
  { id: 36, title: 'Cargo Joggers — Black', brand: 'Nike', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80', saved: false, url: null },
])

const visibleItems = computed(() => allItems.value.slice(0, visibleCount.value))

const openItem = (item) => {
  if (item.url) {
    window.open(item.url, '_blank')
  } else {
    // Search for similar items on the homepage
    router.push(`/?q=${encodeURIComponent(item.title)}`)
  }
}

const toggleSave = (item) => {
  item.saved = !item.saved
}

const setupInfiniteScroll = () => {
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && visibleCount.value < allItems.value.length) {
        visibleCount.value = Math.min(visibleCount.value + 12, allItems.value.length)
      }
    },
    { rootMargin: '200px' }
  )
  if (sentinel.value) observer.observe(sentinel.value)
}

onMounted(() => {
  setupInfiniteScroll()
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})
</script>

<style scoped>
.brands-home {
  min-height: 100vh;
  background: #fff;
}

.brands-content {
  max-width: 100%;
  padding: 16px 8px 60px;
}

/* Pinterest Masonry */
.masonry {
  columns: 6;
  column-gap: 12px;
  max-width: 1800px;
  margin: 0 auto;
}

/* Pin Card */
.pin {
  break-inside: avoid;
  margin-bottom: 12px;
  cursor: pointer;
}

.pin-img-wrap {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
}

.pin-img {
  width: 100%;
  display: block;
  border-radius: 16px;
}

/* Hover overlay */
.pin-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.4);
  opacity: 0;
  transition: opacity 0.2s;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 12px;
  border-radius: 16px;
}

.pin:hover .pin-overlay {
  opacity: 1;
}

.save-btn {
  background: #111;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 24px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}

.save-btn:hover {
  background: #333;
}

/* Pin info row */
.pin-info {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 8px 4px 4px;
  gap: 4px;
}

.pin-text {
  flex: 1;
  min-width: 0;
}

.pin-title {
  font-size: 0.82rem;
  font-weight: 600;
  color: #111;
  margin: 0 0 2px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.3;
}

.pin-source {
  font-size: 0.75rem;
  color: #767676;
}

.pin-menu {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #767676;
  cursor: pointer;
  padding: 0 2px;
  line-height: 1;
  flex-shrink: 0;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.pin-menu:hover {
  background: #f0f0f0;
}

/* Loading */
.loading-state {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid #eee;
  border-top-color: #111;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.sentinel {
  height: 1px;
}

/* Responsive columns */
@media (max-width: 1600px) { .masonry { columns: 5; } }
@media (max-width: 1200px) { .masonry { columns: 4; } }
@media (max-width: 900px)  { .masonry { columns: 3; } }
@media (max-width: 600px)  { .masonry { columns: 2; column-gap: 8px; } }
</style>
