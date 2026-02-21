/**
 * Blog Service - API calls for blog functionality
 */

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.outfi.ai';

export const blogService = {
    /**
     * Get all published blog posts
     * @param {Object} params - Query parameters (category, search)
     */
    async getPosts(params = {}) {
        const query = new URLSearchParams(params).toString();
        const url = `${API_BASE}/api/blog/posts/${query ? '?' + query : ''}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch posts');
        return response.json();
    },

    /**
     * Get a single blog post by slug
     * @param {string} slug - Post slug
     */
    async getPost(slug) {
        const response = await fetch(`${API_BASE}/api/blog/posts/${slug}/`);
        if (!response.ok) {
            if (response.status === 404) throw new Error('Post not found');
            throw new Error('Failed to fetch post');
        }
        return response.json();
    },

    /**
     * Get featured posts for homepage
     */
    async getFeaturedPosts() {
        const response = await fetch(`${API_BASE}/api/blog/posts/featured/`);
        if (!response.ok) throw new Error('Failed to fetch featured posts');
        return response.json();
    },

    /**
     * Get all categories
     */
    async getCategories() {
        const response = await fetch(`${API_BASE}/api/blog/categories/`);
        if (!response.ok) throw new Error('Failed to fetch categories');
        return response.json();
    }
};

export default blogService;
