<template>
  <div class="profile-page">
    <!-- Header bar -->
    <div class="profile-topbar">
      <router-link to="/" class="topbar-logo">
        <img src="../assets/outfi-logo.png" alt="outfi." class="topbar-logo-img" />
      </router-link>
      <router-link to="/explore" class="back-link">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        Explore
      </router-link>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="profile-loading">
      <div class="spinner"></div>
    </div>

    <template v-if="!loading && profile">
      <!-- Profile hero -->
      <div class="profile-hero">
        <div class="avatar-lg">{{ profile.name.charAt(0) }}</div>
        <h1 class="profile-name">{{ profile.name }}</h1>
        <p class="profile-handle">@{{ profile.name.toLowerCase().replace(/\s+/g, '') }}</p>

        <div class="profile-stats">
          <div class="stat">
            <strong>{{ stats.posts }}</strong>
            <span>posts</span>
          </div>
          <div class="stat">
            <strong>{{ stats.total_likes }}</strong>
            <span>likes</span>
          </div>
        </div>

        <div class="profile-actions" v-if="isLoggedIn && !isOwnProfile">
          <button class="follow-btn">Follow</button>
          <button class="message-btn">Message</button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button :class="['tab', { active: activeTab === 'created' }]" @click="activeTab = 'created'">Created</button>
        <button :class="['tab', { active: activeTab === 'saved' }]" @click="activeTab = 'saved'">Saved</button>
      </div>

      <!-- Posts grid -->
      <div class="masonry">
        <div v-for="post in posts" :key="post.id" class="pin" @click="openPost(post)">
          <div class="pin-img-wrap">
            <img :src="post.image_url" :alt="post.caption" class="pin-img" loading="lazy" />
            <div class="pin-overlay">
              <button v-if="isLoggedIn" class="save-btn" @click.stop="toggleLike(post)">
                {{ post.is_liked ? 'Saved' : 'Save' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="posts.length === 0" class="empty-posts">
        <p>No posts yet</p>
      </div>
    </template>

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
              <div class="detail-author-row">
                <div class="author-avatar">{{ selectedPost.author.name.charAt(0) }}</div>
                <span class="detail-author">{{ selectedPost.author.name }}</span>
              </div>
            </div>
            <h3 class="detail-caption" v-if="selectedPost.caption">{{ selectedPost.caption }}</h3>
            <div class="detail-tags" v-if="selectedPost.tags && selectedPost.tags.length">
              <span v-for="tag in selectedPost.tags" :key="tag" class="detail-tag">#{{ tag }}</span>
            </div>
            <div class="detail-stats">
              <span>{{ selectedPost.likes_count }} likes</span>
              <span>{{ selectedPost.comments_count }} comments</span>
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
  name: 'UserProfilePage',
  data() {
    return {
      profile: null,
      stats: { posts: 0, total_likes: 0 },
      posts: [],
      loading: true,
      activeTab: 'created',
      selectedPost: null,
    }
  },
  computed: {
    isLoggedIn() { return tokenStorage.hasSession() },
    isOwnProfile() {
      // We'd compare user IDs if we had the current user's ID stored
      return false
    },
    authHeaders() {
      const tokens = tokenStorage.getSession()
      if (tokens && tokens.access) return { Authorization: `Bearer ${tokens.access}` }
      return {}
    },
  },
  mounted() {
    this.fetchProfile()
  },
  watch: {
    '$route.params.userId'() { this.fetchProfile() }
  },
  methods: {
    async fetchProfile() {
      this.loading = true
      const userId = this.$route.params.userId
      try {
        const res = await fetch(`${API_BASE}/api/v1/feed/user/${userId}/`, { headers: this.authHeaders })
        if (res.ok) {
          const data = await res.json()
          this.profile = data.user
          this.stats = data.stats
          this.posts = data.posts
        }
      } catch (err) {
        console.error('Failed to load profile:', err)
        // Dummy fallback
        this.profile = { name: 'Fashion Creator', id: userId }
        this.stats = { posts: 12, total_likes: 456 }
        this.posts = this.getDummyUserPosts()
      } finally {
        this.loading = false
      }
    },

    getDummyUserPosts() {
      return [
        { id: 'u1', image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80', caption: 'Summer vibes', author: { name: this.profile?.name || 'User' }, tags: ['summer'], likes_count: 89, comments_count: 5, is_liked: false },
        { id: 'u2', image_url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&q=80', caption: 'Runway look', author: { name: this.profile?.name || 'User' }, tags: ['formal'], likes_count: 134, comments_count: 12, is_liked: false },
        { id: 'u3', image_url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=80', caption: 'Golden hour', author: { name: this.profile?.name || 'User' }, tags: ['casual'], likes_count: 201, comments_count: 18, is_liked: false },
        { id: 'u4', image_url: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400&q=80', caption: 'Oversized fit', author: { name: this.profile?.name || 'User' }, tags: ['minimal'], likes_count: 76, comments_count: 3, is_liked: false },
        { id: 'u5', image_url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&q=80', caption: 'Y2K energy', author: { name: this.profile?.name || 'User' }, tags: ['y2k'], likes_count: 155, comments_count: 9, is_liked: false },
        { id: 'u6', image_url: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=400&q=80', caption: 'Denim days', author: { name: this.profile?.name || 'User' }, tags: ['denim'], likes_count: 98, comments_count: 7, is_liked: false },
      ]
    },

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
      } catch (err) { console.error('Like failed:', err) }
    },

    openPost(post) { this.selectedPost = post },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.profile-page {
  font-family: 'Inter', -apple-system, sans-serif;
  min-height: 100vh;
  background: #fff;
}

/* ── Top bar ────────────────────────────────────────────────── */
.profile-topbar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 24px;
  border-bottom: 1px solid #efefef;
}
.topbar-logo-img { height: 28px; }
.back-link {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #111;
  text-decoration: none;
  font-size: 0.88rem;
  font-weight: 500;
}
.back-link:hover { color: #e60023; }

/* ── Hero ───────────────────────────────────────────────────── */
.profile-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 20px 24px;
}
.avatar-lg {
  width: 108px;
  height: 108px;
  border-radius: 50%;
  background: #111;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.4rem;
  font-weight: 700;
  margin-bottom: 16px;
}
.profile-name {
  font-size: 1.8rem;
  font-weight: 700;
  color: #111;
  margin: 0;
}
.profile-handle {
  font-size: 0.9rem;
  color: #767676;
  margin: 4px 0 16px;
}
.profile-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
}
.stat {
  text-align: center;
}
.stat strong {
  display: block;
  font-size: 1rem;
  font-weight: 700;
  color: #111;
}
.stat span {
  font-size: 0.8rem;
  color: #767676;
}
.profile-actions {
  display: flex;
  gap: 8px;
}
.follow-btn {
  background: #e60023;
  color: #fff;
  border: none;
  padding: 10px 24px;
  border-radius: 24px;
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
}
.follow-btn:hover { background: #ad081b; }
.message-btn {
  background: #efefef;
  color: #111;
  border: none;
  padding: 10px 24px;
  border-radius: 24px;
  font-weight: 600;
  font-size: 0.88rem;
  cursor: pointer;
}
.message-btn:hover { background: #ddd; }

/* ── Tabs ───────────────────────────────────────────────────── */
.tabs {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 16px 0;
  border-bottom: 1px solid #efefef;
  margin-bottom: 16px;
}
.tab {
  background: none;
  border: none;
  padding: 8px 16px;
  font-size: 0.92rem;
  font-weight: 600;
  color: #767676;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.15s;
}
.tab:hover { color: #111; }
.tab.active {
  color: #111;
  border-bottom-color: #111;
}

/* ── Masonry ────────────────────────────────────────────────── */
.masonry {
  columns: 6;
  column-gap: 12px;
  max-width: 1800px;
  margin: 0 auto;
  padding: 0 12px;
}
@media (max-width: 1600px) { .masonry { columns: 5; } }
@media (max-width: 1200px) { .masonry { columns: 4; } }
@media (max-width: 900px)  { .masonry { columns: 3; } }
@media (max-width: 600px)  { .masonry { columns: 2; column-gap: 8px; padding: 0 4px; } }

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
  background: #e60023;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 24px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
}
.save-btn:hover { background: #ad081b; }

.empty-posts {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 0.95rem;
}

/* ── Loading ────────────────────────────────────────────────── */
.profile-loading {
  display: flex;
  justify-content: center;
  padding: 100px;
}
.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid #eee;
  border-top-color: #e60023;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Detail Modal ───────────────────────────────────────────── */
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
.detail-layout { display: flex; height: 80vh; }
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
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}
.detail-author-row { display: flex; align-items: center; gap: 10px; }
.author-avatar {
  width: 32px;
  height: 32px;
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
.detail-caption { font-size: 1.1rem; font-weight: 600; line-height: 1.4; margin: 0 0 12px; color: #111; }
.detail-tags { margin-bottom: 16px; display: flex; flex-wrap: wrap; gap: 6px; }
.detail-tag { font-size: 0.78rem; color: #0969da; background: #f0f7ff; padding: 3px 10px; border-radius: 12px; }
.detail-stats { display: flex; gap: 16px; font-size: 0.82rem; color: #767676; }

@media (max-width: 768px) {
  .detail-layout { flex-direction: column; height: auto; max-height: 90vh; }
  .detail-image { max-height: 50vh; border-radius: 24px 24px 0 0; }
  .detail-sidebar { width: 100%; }
  .profile-hero { padding: 32px 16px 20px; }
  .avatar-lg { width: 80px; height: 80px; font-size: 1.8rem; }
  .profile-name { font-size: 1.4rem; }
}
</style>
