<template>
  <div class="feed-page">

    <!-- Sticky header -->
    <header class="feed-topbar">
      <router-link to="/" class="topbar-logo">
        <img src="../assets/outfi-logo.png" alt="outfi." class="topbar-logo-img" />
      </router-link>

      <nav class="topbar-nav">
        <router-link to="/explore" class="topbar-link active">Explore</router-link>
        <router-link to="/deals" class="topbar-link">Find Deals</router-link>
      </nav>

      <div class="topbar-actions">
        <template v-if="isLoggedIn">
          <router-link to="/profile" class="topbar-avatar" :title="'My Profile'">
            <span>{{ userInitial }}</span>
          </router-link>
        </template>
        <template v-else>
          <router-link to="/login" class="topbar-signin">Sign In</router-link>
        </template>
      </div>
    </header>

    <!-- Centered search bar (same style as HomePage) -->
    <div class="feed-search-wrap">
      <div class="ai-search-box">
        <div class="ai-search-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
        <input
          type="text"
          class="ai-search-input"
          v-model="searchQuery"
          placeholder="Search for fashion inspiration"
          @keyup.enter="searchPosts"
        />
        <button class="search-btn" @click="searchPosts">Search</button>
      </div>
    </div>

    <!-- Masonry grid -->
    <div class="masonry">
      <div v-for="post in filteredPosts" :key="post.id" class="pin" @click="openPost(post)">
        <div class="pin-img-wrap">
          <img :src="post.image_url" :alt="post.caption" class="pin-img" loading="lazy" />
          <!-- Overlay on hover -->
          <div class="pin-overlay">
            <button v-if="isLoggedIn" class="save-btn" @click.stop="toggleLike(post)">
              {{ post.is_liked ? 'Saved' : 'Save' }}
            </button>
          </div>
        </div>
        <div class="pin-info">
          <div class="pin-text">
            <p class="pin-title" v-if="post.caption">{{ post.caption }}</p>
            <router-link
              v-if="post.author && post.author.id"
              :to="'/user/' + post.author.id"
              class="pin-source pin-source-link"
              @click.stop
            >{{ post.author.name }}</router-link>
            <span v-else class="pin-source pin-source-link" @click.stop="goToProfile(post.author)">{{ post.author.name }}</span>
          </div>
          <button class="pin-menu" @click.stop>⋯</button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="feed-loading">
      <div class="spinner"></div>
    </div>

    <!-- Empty state -->
    <div v-if="!loading && posts.length === 0" class="empty-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
      </svg>
      <h3>No posts yet</h3>
      <p>Be the first to share your outfit!</p>
      <button v-if="isLoggedIn" class="create-btn-empty" @click="showCreateModal = true">Create Post</button>
    </div>

    <!-- Infinite scroll sentinel -->
    <div ref="sentinel" class="sentinel"></div>

    <!-- Floating create button -->
    <button v-if="isLoggedIn" class="fab" @click="showCreateModal = true" title="Create Post">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
    </button>

    <!-- Create Post Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Create Post</h2>
          <button class="close-btn" @click="showCreateModal = false">✕</button>
        </div>

        <div class="upload-area" @click="triggerFileInput" @dragover.prevent @drop.prevent="handleDrop">
          <img v-if="previewUrl" :src="previewUrl" class="preview-img" />
          <div v-else class="upload-placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#bbb" stroke-width="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <p>Click or drag to upload</p>
          </div>
          <input ref="fileInput" type="file" accept="image/*" @change="handleFileSelect" hidden />
        </div>

        <textarea
          v-model="newPost.caption"
          placeholder="Add a title"
          class="caption-input"
          maxlength="2000"
          rows="2"
        ></textarea>

        <input
          v-model="newPost.tagsInput"
          placeholder="Tags: streetwear, casual, summer"
          class="tags-input"
        />

        <button
          class="submit-btn"
          :disabled="!selectedFile || uploading"
          @click="submitPost"
        >
          {{ uploading ? 'Publishing...' : 'Publish' }}
        </button>
      </div>
    </div>

    <!-- Post Detail Modal -->
    <div v-if="selectedPost" class="modal-overlay" @click.self="selectedPost = null">
      <div class="detail-modal">
        <button class="close-btn detail-close" @click="selectedPost = null">✕</button>
        <div class="detail-layout">
          <div class="detail-image">
            <img :src="selectedPost.image_url" :alt="selectedPost.caption" />
          </div>
          <div class="detail-sidebar">
            <div class="detail-actions-row">
              <button class="action-btn-pill" :class="{ liked: selectedPost.is_liked }" @click="toggleLike(selectedPost)">
                <svg width="16" height="16" viewBox="0 0 24 24" :fill="selectedPost.is_liked ? '#e74c3c' : 'none'" :stroke="selectedPost.is_liked ? '#e74c3c' : 'currentColor'" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                {{ selectedPost.likes_count }}
              </button>
            </div>
            <div class="detail-header">
              <div class="detail-author-row">
                <div class="author-avatar">{{ selectedPost.author.name.charAt(0) }}</div>
                <span class="detail-author">{{ selectedPost.author.name }}</span>
              </div>
              <span class="detail-time">{{ timeAgo(selectedPost.created_at) }}</span>
            </div>
            <h3 class="detail-caption" v-if="selectedPost.caption">{{ selectedPost.caption }}</h3>
            <div class="detail-tags" v-if="selectedPost.tags && selectedPost.tags.length">
              <span v-for="tag in selectedPost.tags" :key="tag" class="detail-tag">#{{ tag }}</span>
            </div>

            <!-- Comments -->
            <div class="comments-section">
              <h4 class="comments-title">Comments <span class="comments-count">{{ selectedPost.comments_count }}</span></h4>
              <div v-for="comment in comments" :key="comment.id" class="comment">
                <div class="comment-avatar">{{ comment.author.name.charAt(0) }}</div>
                <div class="comment-body">
                  <strong>{{ comment.author.name }}</strong>
                  <span>{{ comment.text }}</span>
                </div>
              </div>
              <div v-if="comments.length === 0" class="no-comments">No comments yet</div>
            </div>

            <div v-if="isLoggedIn" class="comment-input-row">
              <input
                v-model="newComment"
                placeholder="Add a comment…"
                class="comment-input"
                @keyup.enter="submitComment"
              />
              <button class="send-btn" @click="submitComment" :disabled="!newComment.trim()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import tokenStorage from '../utils/tokenStorage'

const API_BASE = import.meta.env.VITE_API_URL || ''

export default {
  name: 'FeedPage',
  data() {
    return {
      posts: [],
      loading: false,
      nextCursor: null,
      hasMore: true,
      searchQuery: '',

      // Create post
      showCreateModal: false,
      selectedFile: null,
      previewUrl: null,
      uploading: false,
      newPost: { caption: '', tagsInput: '' },

      // Detail modal
      selectedPost: null,
      comments: [],
      newComment: '',

      observer: null,
    }
  },

  computed: {
    isLoggedIn() {
      return tokenStorage.hasSession()
    },
    userInitial() {
      const tokens = tokenStorage.getSession()
      // Fallback initial
      return 'U'
    },
    filteredPosts() {
      if (!this.searchQuery.trim()) return this.posts
      const q = this.searchQuery.toLowerCase()
      return this.posts.filter(p =>
        (p.caption && p.caption.toLowerCase().includes(q)) ||
        (p.author && p.author.name.toLowerCase().includes(q)) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
      )
    },
    authHeaders() {
      const tokens = tokenStorage.getSession()
      if (tokens && tokens.access) {
        return { Authorization: `Bearer ${tokens.access}` }
      }
      return {}
    },
  },

  mounted() {
    this.fetchPosts()
    this.setupInfiniteScroll()
  },

  beforeUnmount() {
    if (this.observer) this.observer.disconnect()
  },

  methods: {
    async fetchPosts(append = false) {
      if (this.loading) return
      this.loading = true
      try {
        let url = `${API_BASE}/api/v1/feed/`
        if (append && this.nextCursor) url += `?cursor=${this.nextCursor}`

        const res = await fetch(url, { headers: this.authHeaders })
        const data = await res.json()

        const newPosts = data.results || []
        if (append) {
          this.posts.push(...newPosts)
        } else {
          // Show dummy data if API returns empty
          this.posts = newPosts.length > 0 ? newPosts : this.getDummyPosts()
        }

        if (data.next) {
          const u = new URL(data.next)
          this.nextCursor = u.searchParams.get('cursor')
          this.hasMore = true
        } else {
          this.nextCursor = null
          this.hasMore = false
        }
      } catch (err) {
        console.error('Failed to fetch feed:', err)
        // Fallback to dummy data on error
        if (!append) this.posts = this.getDummyPosts()
      } finally {
        this.loading = false
      }
    },

    getDummyPosts() {
      return [
        { id: 'd1', image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80', caption: "Summer streetwear vibes", author: { name: 'StyleByMia' }, tags: ['streetwear', 'summer'], likes_count: 234, comments_count: 12, is_liked: false, created_at: new Date().toISOString() },
        { id: 'd2', image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80', caption: "Elegant evening look", author: { name: 'FashionHouse' }, tags: ['formal', 'evening'], likes_count: 189, comments_count: 8, is_liked: false, created_at: new Date().toISOString() },
        { id: 'd3', image_url: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400&q=80', caption: "Oversized blazer outfit", author: { name: 'UrbanChic' }, tags: ['minimal', 'blazer'], likes_count: 312, comments_count: 21, is_liked: false, created_at: new Date().toISOString() },
        { id: 'd4', image_url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=80', caption: "Golden hour dress", author: { name: 'DressUp' }, tags: ['casual', 'summer'], likes_count: 456, comments_count: 34, is_liked: false, created_at: new Date().toISOString() },
        { id: 'd5', image_url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&q=80', caption: "Y2K inspired fit", author: { name: 'RetroQueen' }, tags: ['y2k', 'vintage'], likes_count: 278, comments_count: 15, is_liked: false, created_at: new Date().toISOString() },
        { id: 'd6', image_url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&q=80', caption: "Runway ready", author: { name: 'VogueDaily' }, tags: ['formal', 'runway'], likes_count: 521, comments_count: 45, is_liked: false, created_at: new Date().toISOString() },
        { id: 'd7', image_url: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=400&q=80', caption: "Casual denim look", author: { name: 'DenimLover' }, tags: ['casual', 'denim'], likes_count: 167, comments_count: 9, is_liked: false, created_at: new Date().toISOString() },
        { id: 'd8', image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80', caption: "Monochrome moments", author: { name: 'MinimalStyle' }, tags: ['minimal', 'monochrome'], likes_count: 198, comments_count: 11, is_liked: false, created_at: new Date().toISOString() },
        { id: 'd9', image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&q=80', caption: "Vintage thrift find", author: { name: 'ThriftQueen' }, tags: ['vintage', 'thrift'], likes_count: 345, comments_count: 28, is_liked: false, created_at: new Date().toISOString() },
        { id: 'd10', image_url: 'https://images.unsplash.com/photo-1495385794356-15371f348c31?w=400&q=80', caption: "Cozy knit season", author: { name: 'KnitWear' }, tags: ['winter', 'cozy'], likes_count: 223, comments_count: 14, is_liked: false, created_at: new Date().toISOString() },
        { id: 'd11', image_url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&q=80', caption: "Festival outfit inspo", author: { name: 'BohoVibes' }, tags: ['festival', 'boho'], likes_count: 412, comments_count: 32, is_liked: false, created_at: new Date().toISOString() },
        { id: 'd12', image_url: 'https://images.unsplash.com/photo-1475180098004-ca77a66827be?w=400&q=80', caption: "Layered for fall", author: { name: 'AutumnStyle' }, tags: ['fall', 'layers'], likes_count: 156, comments_count: 7, is_liked: false, created_at: new Date().toISOString() },
        { id: 'd13', image_url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80', caption: "Shopping day OOTD", author: { name: 'ShopTillDrop' }, tags: ['casual', 'ootd'], likes_count: 289, comments_count: 19, is_liked: false, created_at: new Date().toISOString() },
        { id: 'd14', image_url: 'https://images.unsplash.com/photo-1581044777550-4cfa60707998?w=400&q=80', caption: "Sneaker culture", author: { name: 'SneakerHead' }, tags: ['streetwear', 'sneakers'], likes_count: 534, comments_count: 41, is_liked: false, created_at: new Date().toISOString() },
        { id: 'd15', image_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80', caption: "Pastel dream outfit", author: { name: 'PastelPrincess' }, tags: ['pastel', 'feminine'], likes_count: 367, comments_count: 24, is_liked: false, created_at: new Date().toISOString() },
        { id: 'd16', image_url: 'https://images.unsplash.com/photo-1434389677669-e08b4cda3a20?w=400&q=80', caption: "Beach vacation style", author: { name: 'BeachBabe' }, tags: ['summer', 'vacation'], likes_count: 445, comments_count: 36, is_liked: false, created_at: new Date().toISOString() },
        { id: 'd17', image_url: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400&q=80', caption: "Men's casual Friday", author: { name: 'MensFashion' }, tags: ['casual', 'menswear'], likes_count: 198, comments_count: 13, is_liked: false, created_at: new Date().toISOString() },
        { id: 'd18', image_url: 'https://images.unsplash.com/photo-1544957992-20514f595d6f?w=400&q=80', caption: "Power suit energy", author: { name: 'BossLady' }, tags: ['formal', 'suit'], likes_count: 276, comments_count: 18, is_liked: false, created_at: new Date().toISOString() },
        { id: 'd19', image_url: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&q=80', caption: "Athleisure goals", author: { name: 'FitFashion' }, tags: ['athleisure', 'sporty'], likes_count: 312, comments_count: 22, is_liked: false, created_at: new Date().toISOString() },
        { id: 'd20', image_url: 'https://images.unsplash.com/photo-1518577915332-c2a19f149a75?w=400&q=80', caption: "Accessories make the outfit", author: { name: 'Accessorize' }, tags: ['accessories', 'style'], likes_count: 189, comments_count: 10, is_liked: false, created_at: new Date().toISOString() },
      ]
    },

    setupInfiniteScroll() {
      this.observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && this.hasMore && !this.loading) {
            this.fetchPosts(true)
          }
        },
        { rootMargin: '200px' }
      )
      this.$nextTick(() => {
        if (this.$refs.sentinel) this.observer.observe(this.$refs.sentinel)
      })
    },

    // ── Create ───────────────────────────────────────────────────
    triggerFileInput() { this.$refs.fileInput.click() },
    handleFileSelect(e) {
      const file = e.target.files[0]
      if (file) this.setFile(file)
    },
    handleDrop(e) {
      const file = e.dataTransfer.files[0]
      if (file && file.type.startsWith('image/')) this.setFile(file)
    },
    setFile(file) {
      this.selectedFile = file
      this.previewUrl = URL.createObjectURL(file)
    },

    async submitPost() {
      if (!this.selectedFile || this.uploading) return
      this.uploading = true
      const formData = new FormData()
      formData.append('image', this.selectedFile)
      formData.append('caption', this.newPost.caption)
      const tags = this.newPost.tagsInput.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
      formData.append('tags', JSON.stringify(tags))

      try {
        const res = await fetch(`${API_BASE}/api/v1/feed/`, {
          method: 'POST',
          headers: this.authHeaders,
          body: formData,
        })
        if (res.ok) {
          this.showCreateModal = false
          this.selectedFile = null
          this.previewUrl = null
          this.newPost = { caption: '', tagsInput: '' }
          this.nextCursor = null
          this.fetchPosts()
        }
      } catch (err) {
        console.error('Failed to create post:', err)
      } finally {
        this.uploading = false
      }
    },

    // ── Like ─────────────────────────────────────────────────────
    async toggleLike(post) {
      if (!this.isLoggedIn) return this.$router.push('/login')
      try {
        const res = await fetch(`${API_BASE}/api/v1/feed/${post.id}/like/`, {
          method: 'POST',
          headers: { ...this.authHeaders, 'Content-Type': 'application/json' },
        })
        const data = await res.json()
        post.is_liked = data.liked
        post.likes_count = data.likes_count
      } catch (err) {
        console.error('Like failed:', err)
      }
    },

    // ── Detail ───────────────────────────────────────────────────
    async openPost(post) {
      this.selectedPost = post
      this.comments = []
      this.newComment = ''
      try {
        const res = await fetch(`${API_BASE}/api/v1/feed/${post.id}/comments/`, { headers: this.authHeaders })
        const data = await res.json()
        this.comments = data.results || data || []
      } catch (err) {
        console.error('Failed to load comments:', err)
      }
    },

    async submitComment() {
      if (!this.newComment.trim()) return
      try {
        const res = await fetch(`${API_BASE}/api/v1/feed/${this.selectedPost.id}/comments/`, {
          method: 'POST',
          headers: { ...this.authHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: this.newComment }),
        })
        if (res.ok) {
          const comment = await res.json()
          this.comments.unshift(comment)
          this.selectedPost.comments_count++
          this.newComment = ''
        }
      } catch (err) {
        console.error('Comment failed:', err)
      }
    },

    timeAgo(dateStr) {
      const diff = Date.now() - new Date(dateStr).getTime()
      const mins = Math.floor(diff / 60000)
      if (mins < 1) return 'just now'
      if (mins < 60) return `${mins}m ago`
      const hrs = Math.floor(mins / 60)
      if (hrs < 24) return `${hrs}h ago`
      const days = Math.floor(hrs / 24)
      return `${days}d ago`
    },

    searchPosts() {
      // Client-side filtering is already handled by filteredPosts computed
      // This is a placeholder for future server-side search
    },

    goToProfile(author) {
      // If author has an ID, go to user profile
      if (author && author.id) {
        this.$router.push(`/user/${author.id}`)
      } else if (author && author.name) {
        // No ID means it's dummy data / brand — go to brand page
        this.$router.push(`/brand/${encodeURIComponent(author.name)}`)
      }
    },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.feed-page {
  font-family: 'Inter', -apple-system, sans-serif;
  max-width: 100%;
  padding: 80px 8px 60px;
  min-height: 100vh;
  background: #fff;
}

/* ── Sticky Header ──────────────────────────────────────────── */
.feed-topbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 900;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: #fff;
  border-bottom: 1px solid #efefef;
  height: 56px;
  box-sizing: border-box;
}
.topbar-logo { display: flex; align-items: center; flex-shrink: 0; }
.topbar-logo-img { height: 28px; }

.topbar-nav {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
  margin-left: auto;
}
.topbar-link {
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 0.88rem;
  font-weight: 600;
  color: #111;
  text-decoration: none;
  transition: background 0.15s;
}
.topbar-link:hover { background: #f0f0f0; }
.topbar-link.active { background: #111; color: #fff; }

.topbar-actions { display: flex; align-items: center; flex-shrink: 0; margin-left: 8px; }
.topbar-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #111;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.82rem;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.15s;
}
.topbar-avatar:hover { transform: scale(1.1); }
.topbar-signin {
  background: #111;
  color: #fff;
  padding: 8px 18px;
  border-radius: 24px;
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.15s;
}
.topbar-signin:hover { background: #333; }

/* ── Centered search (matches HomePage) ─────────────────────── */
.feed-search-wrap {
  max-width: 640px;
  margin: 0 auto 24px;
  padding: 0 16px;
}
.ai-search-box {
  display: flex;
  align-items: center;
  background: #fff;
  border: 2px solid #e0e0e0;
  border-radius: 32px;
  padding: 0.5rem 0.5rem 0.5rem 1.2rem;
  min-height: 54px;
  transition: all 0.2s ease;
  position: relative;
}
.ai-search-box:focus-within {
  border-color: #000;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}
.ai-search-icon {
  color: #888;
  margin-right: 0.6rem;
  flex-shrink: 0;
}
.ai-search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  color: #1a1a1a;
  outline: none;
  min-width: 0;
  height: 40px;
}
.ai-search-input::placeholder { color: #999; }
.search-btn {
  padding: 0.6rem 1.3rem;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 20px;
  font-family: 'Inter', sans-serif;
  font-size: 0.88rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
}
.search-btn:hover { background: #333; }

/* ── Pinterest Masonry ──────────────────────────────────────── */
.masonry {
  columns: 6;
  column-gap: 12px;
  max-width: 1800px;
  margin: 0 auto;
}
@media (max-width: 1600px) { .masonry { columns: 5; } }
@media (max-width: 1200px) { .masonry { columns: 4; } }
@media (max-width: 900px)  { .masonry { columns: 3; } }
@media (max-width: 600px)  { .masonry { columns: 2; column-gap: 8px; } }

/* ── Pin Card ───────────────────────────────────────────────── */
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
.pin:hover .pin-overlay { opacity: 1; }

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
.save-btn:hover { background: #333; }

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
.pin-source-link {
  text-decoration: none;
  color: #767676;
  transition: color 0.15s;
}
.pin-source-link:hover { color: #111; }
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
.pin-menu:hover { background: #f0f0f0; }

/* ── Loading / Empty ────────────────────────────────────────── */
.feed-loading { display: flex; justify-content: center; padding: 40px; }
.spinner {
  width: 28px; height: 28px;
  border: 3px solid #eee;
  border-top-color: #111;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.empty-state {
  text-align: center;
  padding: 100px 20px;
  color: #999;
}
.empty-state h3 { margin: 16px 0 8px; color: #333; font-weight: 600; font-size: 1.1rem; }
.empty-state p { margin-bottom: 20px; font-size: 0.9rem; }
.create-btn-empty {
  background: #111;
  color: #fff;
  border: none;
  padding: 12px 28px;
  border-radius: 24px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
}
.sentinel { height: 1px; }

/* ── FAB ────────────────────────────────────────────────────── */
.fab {
  position: fixed;
  bottom: 28px;
  right: 28px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #111;
  color: #fff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0,0,0,0.25);
  transition: transform 0.2s, background 0.2s;
  z-index: 100;
}
.fab:hover { transform: scale(1.08); background: #333; }

/* ── Modals (shared) ────────────────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}
.close-btn {
  background: none;
  border: none;
  font-size: 1.3rem;
  cursor: pointer;
  color: #666;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.close-btn:hover { background: #f0f0f0; }

/* ── Create Modal ───────────────────────────────────────────── */
.modal-content {
  background: #fff;
  border-radius: 20px;
  padding: 28px;
  width: 90%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.modal-header h2 { font-size: 1.2rem; font-weight: 700; margin: 0; }

.upload-area {
  border: 2px dashed #ddd;
  border-radius: 16px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s;
  margin-bottom: 14px;
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.upload-area:hover { border-color: #999; }
.upload-placeholder { color: #bbb; }
.upload-placeholder p { margin-top: 10px; font-size: 0.85rem; }
.preview-img { max-width: 100%; max-height: 280px; border-radius: 12px; object-fit: contain; }

.caption-input, .tags-input {
  width: 100%;
  border: 1.5px solid #efefef;
  border-radius: 12px;
  padding: 11px 14px;
  font-family: 'Inter', sans-serif;
  font-size: 0.88rem;
  resize: none;
  margin-bottom: 10px;
  box-sizing: border-box;
}
.caption-input:focus, .tags-input:focus { outline: none; border-color: #111; }

.submit-btn {
  width: 100%;
  background: #000;
  color: #fff;
  border: none;
  padding: 12px;
  border-radius: 24px;
  font-size: 0.92rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}
.submit-btn:hover:not(:disabled) { background: #333; }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Detail Modal ───────────────────────────────────────────── */
.detail-modal {
  background: #fff;
  border-radius: 24px;
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  overflow: hidden;
  position: relative;
}
.detail-close {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  background: rgba(255,255,255,0.9);
}
.detail-layout {
  display: flex;
  height: 80vh;
}
.detail-image {
  flex: 1;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  border-radius: 24px 0 0 24px;
}
.detail-image img { max-width: 100%; max-height: 100%; object-fit: contain; }
.detail-sidebar {
  width: 340px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.detail-actions-row { margin-bottom: 16px; }
.action-btn-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f5f5f5;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.action-btn-pill:hover { background: #eee; }
.action-btn-pill.liked { background: #f0f0f0; color: #111; }

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}
.detail-author-row { display: flex; align-items: center; gap: 10px; }
.author-avatar {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: #111;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
}
.detail-author { font-weight: 600; font-size: 0.9rem; }
.detail-time { font-size: 0.75rem; color: #999; }
.detail-caption { font-size: 1.1rem; font-weight: 600; line-height: 1.4; margin: 0 0 12px; color: #111; }
.detail-tags { margin-bottom: 16px; display: flex; flex-wrap: wrap; gap: 6px; }
.detail-tag {
  font-size: 0.78rem;
  color: #0969da;
  background: #f0f7ff;
  padding: 3px 10px;
  border-radius: 12px;
  cursor: pointer;
}

/* Comments */
.comments-section { flex: 1; overflow-y: auto; margin-bottom: 12px; }
.comments-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: #111;
  margin: 0 0 12px;
}
.comments-count { color: #999; font-weight: 400; }
.comment {
  display: flex;
  gap: 10px;
  padding: 8px 0;
  font-size: 0.85rem;
  border-bottom: 1px solid #f5f5f5;
}
.comment-avatar {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: #eee;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  font-weight: 700;
  flex-shrink: 0;
}
.comment-body { line-height: 1.4; }
.comment-body strong { margin-right: 6px; }
.no-comments { text-align: center; color: #ccc; font-size: 0.82rem; padding: 20px 0; }

.comment-input-row { display: flex; gap: 8px; }
.comment-input {
  flex: 1;
  border: 1.5px solid #efefef;
  border-radius: 24px;
  padding: 9px 16px;
  font-size: 0.85rem;
  font-family: 'Inter', sans-serif;
}
.comment-input:focus { outline: none; border-color: #111; }
.send-btn { background: none; border: none; cursor: pointer; color: #111; padding: 4px; }
.send-btn:disabled { color: #ccc; cursor: not-allowed; }

/* ── Responsive ─────────────────────────────────────────────── */
@media (max-width: 768px) {
  .detail-layout { flex-direction: column; height: auto; max-height: 90vh; }
  .detail-image { max-height: 50vh; border-radius: 24px 24px 0 0; }
  .detail-sidebar { width: 100%; }
  .feed-page { padding: 8px 4px 60px; }
}
</style>
