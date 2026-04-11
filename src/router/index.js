import { createRouter, createWebHistory } from 'vue-router'
import { captureUtm } from '../services/utmService'
import HomePage from '../components/HomePage.vue'
import LoginPage from '../components/LoginPage.vue'
import RegisterPage from '../components/RegisterPage.vue'
import ProductDetailPage from '../components/ProductDetailPage.vue'
import StoryboardPage from '../components/StoryboardPage.vue'
import ProfilePage from '../components/ProfilePage.vue'
import BrandPage from '../components/BrandPage.vue'
import ComparePage from '../components/ComparePage.vue'
import ClosetPage from '../components/ClosetPage.vue'
import ExplorePage from '../components/ExplorePage.vue'
import BrandsHomePage from '../components/BrandsHomePage.vue'
import FeedPage from '../components/FeedPage.vue'
import UserProfilePage from '../components/UserProfilePage.vue'
import CategoryLandingPage from '../components/CategoryLandingPage.vue'

// Blog pages
import BlogPage from '../components/BlogPage.vue'
import BlogPostPage from '../components/BlogPostPage.vue'

// Internal analytics — statically imported (not a lazy chunk).
// Rationale: as a lazy chunk, its filename changes on every build. If a
// client holds a stale index.html that references an old AnalyticsPage-*.js
// hash, the dynamic import 404s and the route mounts to a blank page.
// Bundling it into the main chunk means "if the app loaded at all, this
// page can load" — no chunk-load race between HTML and JS after deploys.
import AnalyticsPage from '../components/AnalyticsPage.vue'

// Static pages
import AboutPage from '../components/pages/AboutPage.vue'
import PrivacyPage from '../components/pages/PrivacyPage.vue'
import TermsPage from '../components/pages/TermsPage.vue'
import ContactPage from '../components/pages/ContactPage.vue'
import HelpCenterPage from '../components/pages/HelpCenterPage.vue'
import CookiesPage from '../components/pages/CookiesPage.vue'
import CategoryPage from '../components/pages/CategoryPage.vue'
import tokenStorage from '../utils/tokenStorage'

// Check if user is authenticated (using obfuscated storage)
const isAuthenticated = () => {
    return tokenStorage.hasSession()
}


const routes = [
    // Public routes - no auth required
    {
        path: '/',
        name: 'Home',
        component: HomePage
    },
    {
        path: '/login',
        name: 'Login',
        component: LoginPage,
        meta: { guest: true }
    },
    {
        path: '/explore',
        name: 'Explore',
        component: ExplorePage,
    },
    {
        path: '/home',
        name: 'BrandsHome',
        component: BrandsHomePage,
    },
    {
        path: '/deals',
        redirect: '/explore'
    },
    {
        path: '/shop/home',
        redirect: '/home'
    },
    {
        path: '/explore/:category',
        name: 'CategoryLanding',
        component: CategoryLandingPage,
    },
    {
        path: '/user/:userId',
        name: 'UserProfile',
        component: UserProfilePage,
    },
    {
        path: '/register',
        name: 'Register',
        component: RegisterPage,
        meta: { guest: true }
    },
    // OAuth callback route
    {
        path: '/auth/callback',
        name: 'OAuthCallback',
        component: () => import('../components/OAuthCallback.vue'),
        meta: { public: true }
    },
    // Public shared storyboard route
    {
        path: '/share/:token',
        name: 'SharedStoryboard',
        component: () => import('../components/SharedStoryboardPage.vue'),
        meta: { public: true }
    },
    // Product detail - public (backend API is AllowAny)
    {
        path: '/product/:id',
        name: 'ProductDetail',
        component: ProductDetailPage,
    },
    // Phia-style product tracking — data encoded in query params
    {
        path: '/products',
        name: 'ProductTracking',
        component: ProductDetailPage,
        meta: { tracking: true }
    },
    {
        // Redirect legacy outfit routes to storyboard
        path: '/outfit-lab',
        redirect: '/storyboard'
    },
    {
        path: '/outfit-studio',
        redirect: '/storyboard'
    },
    {
        path: '/storyboard',
        name: 'Storyboard',
        component: StoryboardPage,
        meta: { requiresAuth: true }
    },
    {
        path: '/profile',
        name: 'Profile',
        component: ProfilePage,
        meta: { requiresAuth: true }
    },
    // Brand pages - public
    {
        path: '/brand/:brand',
        name: 'Brand',
        component: BrandPage,
    },
    {
        path: '/compare',
        name: 'Compare',
        component: ComparePage,
        meta: { requiresAuth: true }
    },
    {
        path: '/closet',
        name: 'Closet',
        component: ClosetPage,
        meta: { requiresAuth: true }
    },
    // Shop category pages - require auth
    {
        path: '/shop/:category',
        name: 'ShopCategory',
        component: CategoryPage,
        meta: { requiresAuth: true }
    },
    // Company pages - public
    {
        path: '/about',
        name: 'About',
        component: AboutPage
    },
    // Support pages - public
    {
        path: '/help',
        name: 'HelpCenter',
        component: HelpCenterPage
    },
    {
        path: '/contact',
        name: 'Contact',
        component: ContactPage
    },
    {
        path: '/privacy',
        name: 'Privacy',
        component: PrivacyPage
    },
    {
        path: '/terms',
        name: 'Terms',
        component: TermsPage
    },
    {
        path: '/cookies',
        name: 'Cookies',
        component: CookiesPage
    },
    // Blog pages - public
    {
        path: '/blog',
        name: 'Blog',
        component: BlogPage
    },
    {
        path: '/blog/:slug',
        name: 'BlogPost',
        component: BlogPostPage
    },
    // Internal staff-only analytics dashboard (obfuscated route).
    // Staff enforcement lives in the backend (IsAdminUser on verify-pin and
    // analytics/data endpoints). The client guard only checks that the user
    // is logged in — the PIN + backend permission is the real gate. This
    // avoids silent redirects when the stored user object is missing/stale
    // is_staff.
    {
        path: '/internal/d/f7a2c',
        name: 'Analytics',
        component: AnalyticsPage,
        meta: { requiresAuth: true }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else {
            return { top: 0 }
        }
    }
})

// Navigation guards
router.beforeEach((to, from, next) => {
    // Capture UTM parameters (runs silently, no redirects)
    captureUtm(to.query, to.path)

    const requiresAuth = to.meta.requiresAuth
    const guestOnly = to.meta.guest
    const loggedIn = isAuthenticated()

    // If route requires auth and user not logged in
    if (requiresAuth && !loggedIn) {
        return next({ name: 'Login', query: { redirect: to.fullPath } })
    }

    // If route is for guests only (login/register) and user is logged in
    if (guestOnly && loggedIn) {
        return next({ name: 'Home' })
    }

    next()
})

// Safety net for stale lazy chunks after a deploy.
// Vue Router surfaces a dynamic import failure (e.g. because the old
// index.html referenced an asset hash that no longer exists on origin) as
// an onError event with a "Failed to fetch dynamically imported module"
// message. In that case the SPA would otherwise mount to a blank page.
// We hard-reload once to pick up fresh index.html + fresh chunk hashes,
// and use sessionStorage to avoid a reload loop if the failure is
// something else (e.g. a real runtime error in the chunk itself).
router.onError((err, to) => {
    const msg = String(err?.message || err || '')
    const isChunkLoadError =
        msg.includes('Failed to fetch dynamically imported module') ||
        msg.includes('Importing a module script failed') ||
        msg.includes('error loading dynamically imported module')

    if (!isChunkLoadError) return

    const reloadKey = 'spa_chunk_reload_at'
    const last = Number(sessionStorage.getItem(reloadKey) || 0)
    const now = Date.now()
    // Only auto-reload if we haven't already tried in the last 10s.
    if (now - last < 10_000) {
        console.error('[Router] Chunk load error after reload — giving up:', err)
        return
    }
    sessionStorage.setItem(reloadKey, String(now))
    console.warn('[Router] Stale chunk detected, forcing reload for', to?.fullPath)
    window.location.replace(to?.fullPath || window.location.pathname)
})

export default router
