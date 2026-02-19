<template>
  <div class="feed-page">
    <!-- Header -->
    <div class="feed-header">
      <h1 class="feed-title">Explore</h1>
      <p class="feed-subtitle">Discover fashion inspiration from the community</p>
      <button v-if="isLoggedIn" class="create-btn" @click="showCreateModal = true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Post
      </button>
    </div>

    <!-- Tag filters -->
    <div class="tag-bar">
      <button
        v-for="tag in trendingTags"
        :key="tag"
        :class="['tag-chip', { active: activeTag === tag }]"
        @click="filterByTag(tag)"
      >{{ tag }}</button>
    </div>

    <!-- Masonry grid -->
    <div class="masonry" ref="masonryRef">
      <div v-for="post in posts" :key="post.id" class="masonry-item" @click="openPost(post)">
        <div class="card">
          <img :src="post.image_url" :alt="post.caption" class="card-img" loading="lazy" />
          <div class="card-body">
            <p class="card-caption" v-if="post.caption">{{ post.caption }}</p>
            <div class="card-footer">
              <span class="card-author">{{ post.author.name }}</span>
              <div class="card-actions">
                <button class="action-btn" @click.stop="toggleLike(post)">
                  <svg width="16" height="16" viewBox="0 0 24 24" :fill="post.is_liked ? '#e74c3c' : 'none'" :stroke="post.is_liked ? '#e74c3c' : 'currentColor'" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  <span>{{ post.likes_count }}</span>
                </button>
                <button class="action-btn" @click.stop="openPost(post)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  <span>{{ post.comments_count }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading state -->
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
      <button v-if="isLoggedIn" class="create-btn" @click="showCreateModal = true">Create Post</button>
    </div>

    <!-- Scroll sentinel -->
    <div ref="sentinel" class="sentinel"></div>

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
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <p>Click or drag to upload an image</p>
          </div>
          <input ref="fileInput" type="file" accept="image/*" @change="handleFileSelect" hidden />
        </div>

        <textarea
          v-model="newPost.caption"
          placeholder="Write a caption…"
          class="caption-input"
          maxlength="2000"
          rows="3"
        ></textarea>

        <input
          v-model="newPost.tagsInput"
          placeholder="Tags (comma separated): streetwear, casual, summer"
          class="tags-input"
        />

        <button
          class="submit-btn"
          :disabled="!selectedFile || uploading"
          @click="submitPost"
        >
          <span v-if="uploading" class="spinner-sm"></span>
          {{ uploading ? 'Posting...' : 'Share' }}
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
            <div class="detail-header">
              <span class="detail-author">{{ selectedPost.author.name }}</span>
              <span class="detail-time">{{ timeAgo(selectedPost.created_at) }}</span>
            </div>
            <p class="detail-caption" v-if="selectedPost.caption">{{ selectedPost.caption }}</p>
            <div class="detail-tags" v-if="selectedPost.tags && selectedPost.tags.length">
              <span v-for="tag in selectedPost.tags" :key="tag" class="detail-tag">#{{ tag }}</span>
            </div>
            <div class="detail-actions">
              <button class="action-btn" @click="toggleLike(selectedPost)">
                <svg width="20" height="20" viewBox="0 0 24 24" :fill="selectedPost.is_liked ? '#e74c3c' : 'none'" :stroke="selectedPost.is_liked ? '#e74c3c' : 'currentColor'" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <span>{{ selectedPost.likes_count }}</span>
              </button>
            </div>

            <!-- Comments -->
            <div class="comments-section">
              <div v-for="comment in comments" :key="comment.id" class="comment">
                <strong>{{ comment.author.name }}</strong>
                <span>{{ comment.text }}</span>
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
      activeTag: null,
      trendingTags: ['streetwear', 'casual', 'formal', 'summer', 'vintage', 'minimal', 'y2k'],

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

      // Scroll observer
      observer: null,
    }
  },

  computed: {
    isLoggedIn() {
      return tokenStorage.hasSession()
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
    // ── Fetching ──────────────────────────────────────────────────
    async fetchPosts(append = false) {
      if (this.loading) return
      this.loading = true
      try {
        let url = `${API_BASE}/api/v1/feed/`
        const params = []
        if (this.activeTag) params.push(`tag=${this.activeTag}`)
        if (append && this.nextCursor) params.push(`cursor=${this.nextCursor}`)
        if (params.length) url += '?' + params.join('&')

        const res = await fetch(url, { headers: this.authHeaders })
        const data = await res.json()

        const newPosts = data.results || []
        if (append) {
          this.posts.push(...newPosts)
        } else {
          this.posts = newPosts
        }

        // Extract cursor from next URL
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
      } finally {
        this.loading = false
      }
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

    filterByTag(tag) {
      this.activeTag = this.activeTag === tag ? null : tag
      this.nextCursor = null
      this.fetchPosts()
    },

    // ── Create post ──────────────────────────────────────────────
    triggerFileInput() {
      this.$refs.fileInput.click()
    },

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
      const tags = this.newPost.tagsInput
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(Boolean)
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

    // ── Post detail ──────────────────────────────────────────────
    async openPost(post) {
      this.selectedPost = post
      this.comments = []
      this.newComment = ''
      try {
        const res = await fetch(`${API_BASE}/api/v1/feed/${post.id}/comments/`, {
          headers: this.authHeaders,
        })
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

    // ── Helpers ───────────────────────────────────────────────────
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
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.feed-page {
  font-family: 'Inter', sans-serif;
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px 20px 60px;
  min-height: 100vh;
  background: #fafafa;
}

/* ── Header ─────────────────────────────────────────────────── */
.feed-header {
  text-align: center;
  margin-bottom: 24px;
  position: relative;
}
.feed-title {
  font-size: 2rem;
  font-weight: 700;
  color: #111;
  margin: 0;
}
.feed-subtitle {
  color: #666;
  font-size: 0.95rem;
  margin: 6px 0 16px;
}
.create-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #111;
  color: #fff;
  border: none;
  padding: 10px 22px;
  border-radius: 24px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.create-btn:hover {
  background: #333;
  transform: translateY(-1px);
}

/* ── Tag bar ────────────────────────────────────────────────── */
.tag-bar {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 28px;
}
.tag-chip {
  padding: 6px 16px;
  border-radius: 20px;
  border: 1.5px solid #ddd;
  background: #fff;
  font-size: 0.82rem;
  font-weight: 500;
  color: #555;
  cursor: pointer;
  transition: all 0.15s;
}
.tag-chip:hover {
  border-color: #111;
  color: #111;
}
.tag-chip.active {
  background: #111;
  color: #fff;
  border-color: #111;
}

/* ── Masonry grid ───────────────────────────────────────────── */
.masonry {
  columns: 4;
  column-gap: 16px;
}
@media (max-width: 1100px) { .masonry { columns: 3; } }
@media (max-width: 768px)  { .masonry { columns: 2; } }
@media (max-width: 480px)  { .masonry { columns: 1; } }

.masonry-item {
  break-inside: avoid;
  margin-bottom: 16px;
  cursor: pointer;
}

.card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  transition: transform 0.2s, box-shadow 0.2s;
}
.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}
.card-img {
  width: 100%;
  display: block;
}
.card-body {
  padding: 12px 14px 14px;
}
.card-caption {
  font-size: 0.85rem;
  color: #333;
  margin: 0 0 10px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-author {
  font-size: 0.78rem;
  font-weight: 600;
  color: #111;
}
.card-actions {
  display: flex;
  gap: 10px;
}
.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  font-size: 0.78rem;
  padding: 0;
  transition: color 0.15s;
}
.action-btn:hover { color: #111; }

/* ── Loading / Empty ────────────────────────────────────────── */
.feed-loading {
  display: flex;
  justify-content: center;
  padding: 40px;
}
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #eee;
  border-top-color: #111;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
.spinner-sm {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #999;
}
.empty-state h3 {
  margin: 16px 0 6px;
  color: #555;
  font-weight: 600;
}
.empty-state p { margin-bottom: 20px; }
.sentinel { height: 1px; }

/* ── Create Modal ───────────────────────────────────────────── */
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
.modal-content {
  background: #fff;
  border-radius: 20px;
  padding: 28px;
  width: 90%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.modal-header h2 {
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0;
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
  transition: background 0.15s;
}
.close-btn:hover { background: #f0f0f0; }

.upload-area {
  border: 2px dashed #ddd;
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s;
  margin-bottom: 16px;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.upload-area:hover { border-color: #999; }
.upload-placeholder { color: #999; }
.upload-placeholder p { margin-top: 12px; font-size: 0.9rem; }
.preview-img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 12px;
  object-fit: contain;
}

.caption-input, .tags-input {
  width: 100%;
  border: 1.5px solid #e5e5e5;
  border-radius: 12px;
  padding: 12px 14px;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  resize: none;
  margin-bottom: 12px;
  transition: border-color 0.15s;
  box-sizing: border-box;
}
.caption-input:focus, .tags-input:focus {
  outline: none;
  border-color: #111;
}

.submit-btn {
  width: 100%;
  background: #111;
  color: #fff;
  border: none;
  padding: 12px;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.2s;
}
.submit-btn:hover:not(:disabled) { background: #333; }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Detail Modal ───────────────────────────────────────────── */
.detail-modal {
  background: #fff;
  border-radius: 20px;
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
  max-height: 80vh;
}
.detail-image {
  flex: 1;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
}
.detail-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.detail-sidebar {
  width: 340px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #eee;
  overflow-y: auto;
}
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.detail-author { font-weight: 700; font-size: 0.95rem; }
.detail-time { font-size: 0.78rem; color: #999; }
.detail-caption {
  font-size: 0.9rem;
  line-height: 1.5;
  color: #333;
  margin-bottom: 12px;
}
.detail-tags { margin-bottom: 16px; display: flex; flex-wrap: wrap; gap: 6px; }
.detail-tag {
  font-size: 0.78rem;
  color: #666;
  background: #f5f5f5;
  padding: 3px 10px;
  border-radius: 12px;
}
.detail-actions { margin-bottom: 16px; }

/* Comments */
.comments-section {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 12px;
}
.comment {
  padding: 8px 0;
  font-size: 0.85rem;
  line-height: 1.4;
  border-bottom: 1px solid #f5f5f5;
}
.comment strong {
  margin-right: 6px;
  font-weight: 600;
}
.no-comments {
  text-align: center;
  color: #bbb;
  font-size: 0.85rem;
  padding: 24px 0;
}
.comment-input-row {
  display: flex;
  gap: 8px;
}
.comment-input {
  flex: 1;
  border: 1.5px solid #e5e5e5;
  border-radius: 20px;
  padding: 8px 14px;
  font-size: 0.85rem;
  font-family: 'Inter', sans-serif;
}
.comment-input:focus { outline: none; border-color: #111; }
.send-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #111;
  padding: 4px;
}
.send-btn:disabled { color: #ccc; cursor: not-allowed; }

/* ── Responsive detail ──────────────────────────────────────── */
@media (max-width: 768px) {
  .detail-layout { flex-direction: column; height: auto; max-height: 90vh; }
  .detail-image { max-height: 50vh; }
  .detail-sidebar { width: 100%; border-left: none; border-top: 1px solid #eee; }
}
</style>
