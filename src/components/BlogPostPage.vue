<template>
  <div class="blog-post-page">
    <!-- Header -->
    <header class="blog-header">
      <div class="header-content">
        <router-link to="/" class="logo">
          <img src="@/assets/outfi-logo.png" alt="outfi." class="logo-img" />
        </router-link>
        <nav class="nav-links">
          <router-link to="/">Shop</router-link>
          <router-link to="/blog">Blog</router-link>
        </nav>
      </div>
    </header>

    <!-- Loading -->
    <div class="loading" v-if="loading">
      <div class="spinner"></div>
    </div>

    <!-- Error State -->
    <div class="error-state" v-if="error">
      <h2>Post not found</h2>
      <p>The post you're looking for doesn't exist.</p>
      <router-link to="/blog" class="back-link">← Back to Blog</router-link>
    </div>

    <!-- Post Content -->
    <article class="post" v-if="post && !loading">
      <!-- Hero Image -->
      <div class="post-hero" v-if="post.featured_image_url">
        <img :src="post.featured_image_url" :alt="post.title" />
      </div>

      <!-- Post Header -->
      <div class="post-header">
        <router-link to="/blog" class="back-link">← Back to Blog</router-link>
        
        <span class="post-category" v-if="post.category">{{ post.category.name }}</span>
        
        <h1 class="post-title">{{ post.title }}</h1>
        
        <div class="post-meta">
          <span class="author">By {{ post.author_name }}</span>
          <span class="dot">•</span>
          <span class="date">{{ formatDate(post.published_at) }}</span>
          <span class="dot">•</span>
          <span class="reading-time">{{ post.reading_time }} min read</span>
        </div>
      </div>

      <!-- Post Body -->
      <div class="post-body" v-html="renderedContent"></div>

      <!-- Tags -->
      <div class="post-tags" v-if="post.tags && post.tags.length">
        <span class="tag" v-for="tag in post.tags" :key="tag.id">
          #{{ tag.name }}
        </span>
      </div>

      <!-- Share & CTA -->
      <div class="post-footer">
        <div class="share-section">
          <span>Share:</span>
          <button @click="shareTwitter" class="share-btn">Twitter</button>
          <button @click="shareFacebook" class="share-btn">Facebook</button>
          <button @click="copyLink" class="share-btn">Copy Link</button>
        </div>
        
        <div class="cta-section">
          <h3>Find the Best Fashion Deals</h3>
          <p>Search thousands of products across top retailers.</p>
          <router-link to="/" class="cta-btn">Start Shopping</router-link>
        </div>
      </div>
    </article>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import blogService from '@/services/blogService';
import { marked } from 'marked';

export default {
  name: 'BlogPostPage',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const post = ref(null);
    const loading = ref(true);
    const error = ref(false);

    // Render markdown content
    const renderedContent = computed(() => {
      if (!post.value?.content) return '';
      // Check if content looks like markdown
      if (post.value.content.includes('#') || post.value.content.includes('**') || post.value.content.includes('- ')) {
        return marked(post.value.content);
      }
      // Otherwise return as HTML (for WYSIWYG content)
      return post.value.content;
    });

    // Dynamic page title
    watch(post, (newPost) => {
      if (newPost) {
        document.title = newPost.seo_title || `${newPost.title} | Fynda Blog`;
      }
    });

    const loadPost = async (slug) => {
      loading.value = true;
      error.value = false;
      try {
        post.value = await blogService.getPost(slug);
      } catch (err) {
        console.error('Failed to load post:', err);
        error.value = true;
      } finally {
        loading.value = false;
      }
    };

    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
    };

    const shareTwitter = () => {
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.value.title)}&url=${encodeURIComponent(window.location.href)}`;
      window.open(url, '_blank');
    };

    const shareFacebook = () => {
      const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
      window.open(url, '_blank');
    };

    const copyLink = async () => {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied!');
    };

    // Watch for route changes
    watch(() => route.params.slug, (newSlug) => {
      if (newSlug) loadPost(newSlug);
    });

    onMounted(() => {
      if (route.params.slug) {
        loadPost(route.params.slug);
      }
    });

    return {
      post,
      loading,
      error,
      renderedContent,
      formatDate,
      shareTwitter,
      shareFacebook,
      copyLink
    };
  }
};
</script>

<style scoped>
.blog-post-page {
  min-height: 100vh;
  background: #fff;
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
}

/* Loading */
.loading {
  display: flex;
  justify-content: center;
  padding: 8rem;
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

/* Error */
.error-state {
  text-align: center;
  padding: 4rem 2rem;
}

.error-state h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.error-state p {
  color: #666;
  margin-bottom: 1.5rem;
}

/* Post Hero */
.post-hero {
  width: 100%;
  max-height: 500px;
  overflow: hidden;
}

.post-hero img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Post Header */
.post-header {
  max-width: 720px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.back-link {
  display: inline-block;
  color: #666;
  text-decoration: none;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.back-link:hover {
  color: #000;
}

.post-category {
  display: inline-block;
  background: #f0f0f0;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 1rem;
}

.post-title {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1rem;
  color: #1a1a1a;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #888;
  font-size: 0.9rem;
}

.dot {
  opacity: 0.5;
}

/* Post Body */
.post-body {
  max-width: 720px;
  margin: 0 auto;
  padding: 0 1.5rem 2rem;
  font-size: 1.1rem;
  line-height: 1.8;
  color: #333;
}

.post-body :deep(h2) {
  font-size: 1.75rem;
  margin: 2rem 0 1rem;
  font-weight: 600;
}

.post-body :deep(h3) {
  font-size: 1.25rem;
  margin: 1.5rem 0 0.75rem;
  font-weight: 600;
}

.post-body :deep(p) {
  margin-bottom: 1.25rem;
}

.post-body :deep(ul),
.post-body :deep(ol) {
  margin-bottom: 1.25rem;
  padding-left: 1.5rem;
}

.post-body :deep(li) {
  margin-bottom: 0.5rem;
}

.post-body :deep(img) {
  max-width: 100%;
  border-radius: 8px;
  margin: 1.5rem 0;
}

.post-body :deep(blockquote) {
  border-left: 4px solid #000;
  padding-left: 1.5rem;
  margin: 1.5rem 0;
  font-style: italic;
  color: #555;
}

/* Tags */
.post-tags {
  max-width: 720px;
  margin: 0 auto;
  padding: 0 1.5rem 2rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  background: #f0f0f0;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  color: #555;
}

/* Footer */
.post-footer {
  max-width: 720px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  border-top: 1px solid #eee;
}

.share-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.share-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.share-btn:hover {
  background: #f5f5f5;
}

.cta-section {
  background: linear-gradient(135deg, #1a1a1a 0%, #333 100%);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
}

.cta-section h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.cta-section p {
  opacity: 0.8;
  margin-bottom: 1.5rem;
}

.cta-btn {
  display: inline-block;
  background: white;
  color: #1a1a1a;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: transform 0.2s;
}

.cta-btn:hover {
  transform: scale(1.05);
}

/* Responsive */
@media (max-width: 768px) {
  .post-title {
    font-size: 1.75rem;
  }
  
  .post-body {
    font-size: 1rem;
  }
}
</style>
