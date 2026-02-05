import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../components/HomePage.vue'
import LoginPage from '../components/LoginPage.vue'
import RegisterPage from '../components/RegisterPage.vue'
import ProductDetailPage from '../components/ProductDetailPage.vue'
import StoryboardPage from '../components/StoryboardPage.vue'
import ProfilePage from '../components/ProfilePage.vue'
import BrandPage from '../components/BrandPage.vue'

// Blog pages
import BlogPage from '../components/BlogPage.vue'
import BlogPostPage from '../components/BlogPostPage.vue'

// Static pages
import AboutPage from '../components/pages/AboutPage.vue'
import PrivacyPage from '../components/pages/PrivacyPage.vue'
import TermsPage from '../components/pages/TermsPage.vue'
import ContactPage from '../components/pages/ContactPage.vue'
import CareersPage from '../components/pages/CareersPage.vue'
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
    // Protected routes - require auth
    {
        path: '/product/:id',
        name: 'ProductDetail',
        component: ProductDetailPage,
        meta: { requiresAuth: true }
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
    // Brand pages - require auth
    {
        path: '/brand/:brand',
        name: 'Brand',
        component: BrandPage,
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
    {
        path: '/careers',
        name: 'Careers',
        component: CareersPage
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

export default router
