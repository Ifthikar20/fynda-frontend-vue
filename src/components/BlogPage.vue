<template>
  <div class="blog-page">
    <!-- Header -->
    <header class="blog-header">
      <div class="header-content">
        <router-link to="/" class="logo">
          <img src="@/assets/fynda-png-1.png" alt="Fynda" class="logo-img" />
        </router-link>
        <nav class="nav-links">
          <router-link to="/">Shop</router-link>
          <router-link to="/blog" class="active">Blog</router-link>
        </nav>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="blog-hero">
      <h1>Fynda Fashion Blog</h1>
      <p>Style tips, trend guides, and the best fashion deals</p>
    </section>

    <!-- Categories -->
    <div class="category-filter" v-if="categories.length">
      <button 
        :class="{ active: !selectedCategory }" 
        @click="filterByCategory(null)"
      >
        All
      </button>
      <button 
        v-for="cat in categories" 
        :key="cat.id"
        :class="{ active: selectedCategory === cat.slug }"
        @click="filterByCategory(cat.slug)"
      >
        {{ cat.name }}
      </button>
    </div>

    <!-- Posts Grid -->
    <div class="posts-container" v-if="!loading">
      <article 
        v-for="post in posts" 
        :key="post.id" 
        class="post-card"
        @click="goToPost(post.slug)"
      >
        <div class="post-image" v-if="post.featured_image_url">
          <img :src="post.featured_image_url" :alt="post.title" loading="lazy" />
        </div>
        <div class="post-image placeholder" v-else>
          <span>{{ post.title.charAt(0) }}</span>
        </div>
        <div class="post-content">
          <span class="post-category" v-if="post.category">{{ post.category.name }}</span>
          <h2 class="post-title">{{ post.title }}</h2>
          <p class="post-excerpt">{{ post.excerpt }}</p>
          <div class="post-meta">
            <span class="author">{{ post.author_name }}</span>
            <span class="dot">•</span>
            <span class="date">{{ formatDate(post.published_at) }}</span>
            <span class="dot">•</span>
            <span class="reading-time">{{ post.reading_time }} min read</span>
          </div>
        </div>
      </article>
    </div>

    <!-- Loading State -->
    <div class="loading" v-if="loading">
      <div class="spinner"></div>
      <p>Loading posts...</p>
    </div>

    <!-- Empty State -->
    <div class="empty-state" v-if="!loading && posts.length === 0">
      <p>No posts found.</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import blogService from '@/services/blogService';

export default {
  name: 'BlogPage',
  setup() {
    const router = useRouter();
    const posts = ref([]);
    const categories = ref([]);
    const loading = ref(true);
    const selectedCategory = ref(null);

    // Set page title
    onMounted(() => {
      document.title = 'Fynda Fashion Blog - Style Tips & Deals';
    });

    const loadPosts = async (category = null) => {
      loading.value = true;
      try {
        const params = category ? { category } : {};
        posts.value = await blogService.getPosts(params);
      } catch (error) {
        console.error('Failed to load posts:', error);
      } finally {
        loading.value = false;
      }
    };

    const loadCategories = async () => {
      try {
        categories.value = await blogService.getCategories();
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };

    const filterByCategory = (categorySlug) => {
      selectedCategory.value = categorySlug;
      loadPosts(categorySlug);
    };

    const goToPost = (slug) => {
      router.push(`/blog/${slug}`);
    };

    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    };

    onMounted(() => {
      loadPosts();
      loadCategories();
    });

    return {
      posts,
      categories,
      loading,
      selectedCategory,
      filterByCategory,
      goToPost,
      formatDate
    };
  }
};
</script>

<style scoped>
.blog-page {
  min-height: 100vh;
  background: #fafafa;
}

/* Header */
.blog-header {
  background: white;
  border-bottom: 1px solid #eee;
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-img {
  height: 32px;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-links a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-links a:hover,
.nav-links a.active {
  color: #000;
}

/* Hero */
.blog-hero {
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #1a1a1a 0%, #333 100%);
  color: white;
}

.blog-hero h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.blog-hero p {
  font-size: 1.1rem;
  opacity: 0.8;
}

/* Categories */
.category-filter {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  padding: 1.5rem 2rem;
  flex-wrap: wrap;
}

.category-filter button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.category-filter button:hover,
.category-filter button.active {
  background: #000;
  color: white;
  border-color: #000;
}

/* Posts Grid */
.posts-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.post-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.post-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

.post-image {
  height: 200px;
  overflow: hidden;
}

.post-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-image.placeholder {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.post-image.placeholder span {
  font-size: 4rem;
  color: white;
  font-weight: 700;
}

.post-content {
  padding: 1.5rem;
}

.post-category {
  display: inline-block;
  background: #f0f0f0;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.75rem;
}

.post-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  line-height: 1.4;
  color: #1a1a1a;
}

.post-excerpt {
  color: #666;
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #888;
}

.dot {
  opacity: 0.5;
}

/* Loading */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #eee;
  border-top-color: #000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 4rem;
  color: #666;
}

/* Responsive */
@media (max-width: 768px) {
  .blog-hero h1 {
    font-size: 1.75rem;
  }
  
  .posts-container {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
}
</style>
