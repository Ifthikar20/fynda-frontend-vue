import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../components/HomePage.vue'
import LoginPage from '../components/LoginPage.vue'
import RegisterPage from '../components/RegisterPage.vue'
import ProductDetailPage from '../components/ProductDetailPage.vue'
import OutfitLabPage from '../components/OutfitLabPage.vue'
import ProfilePage from '../components/ProfilePage.vue'
import BrandPage from '../components/BrandPage.vue'

// Static pages
import AboutPage from '../components/pages/AboutPage.vue'
import PrivacyPage from '../components/pages/PrivacyPage.vue'
import TermsPage from '../components/pages/TermsPage.vue'
import ContactPage from '../components/pages/ContactPage.vue'
import CareersPage from '../components/pages/CareersPage.vue'
import HelpCenterPage from '../components/pages/HelpCenterPage.vue'
import CookiesPage from '../components/pages/CookiesPage.vue'
import CategoryPage from '../components/pages/CategoryPage.vue'

// Check if user is authenticated
const isAuthenticated = () => {
    const tokens = localStorage.getItem('fynda_tokens')
    return !!tokens
}

const routes = [
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
    {
        path: '/product/:id',
        name: 'ProductDetail',
        component: ProductDetailPage
    },
    {
        path: '/outfit-lab',
        name: 'OutfitStudio',
        component: OutfitLabPage
    },
    {
        path: '/profile',
        name: 'Profile',
        component: ProfilePage,
        meta: { requiresAuth: true }
    },
    // Brand pages
    {
        path: '/brand/:brand',
        name: 'Brand',
        component: BrandPage
    },
    // Shop category pages
    {
        path: '/shop/:category',
        name: 'ShopCategory',
        component: CategoryPage
    },
    // Company pages
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
    // Support pages
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
