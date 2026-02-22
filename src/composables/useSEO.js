/**
 * useSEO Composable
 * 
 * Dynamically sets page title, meta description, Open Graph, 
 * Twitter Cards, and canonical URL for each route.
 * Critical for SEO since Vue SPA doesn't change <head> by default.
 */

export function useSEO({
    title = '',
    description = '',
    ogTitle = '',
    ogDescription = '',
    ogImage = '',
    ogType = 'website',
    canonical = '',
    keywords = '',
} = {}) {
    const siteName = 'Outfi'
    const baseUrl = 'https://outfi.ai'
    const defaultImage = `${baseUrl}/assets/outfi-logo-CAvIhvL2.png`

    const fullTitle = title ? `${title} | ${siteName}` : `${siteName} - Discover the Best Fashion Deals`
    const metaDescription = description || 'Outfi helps you discover trending fashion and the best deals from everywhere.'
    const ogTitleFinal = ogTitle || fullTitle
    const ogDescFinal = ogDescription || metaDescription
    const ogImageFinal = ogImage || defaultImage
    const canonicalUrl = canonical || `${baseUrl}${window.location.pathname}`

    // Set document title
    document.title = fullTitle

    // Helper to set or create a meta tag
    const setMeta = (attr, attrValue, content) => {
        let el = document.querySelector(`meta[${attr}="${attrValue}"]`)
        if (!el) {
            el = document.createElement('meta')
            el.setAttribute(attr, attrValue)
            document.head.appendChild(el)
        }
        el.setAttribute('content', content)
    }

    // Standard meta
    setMeta('name', 'description', metaDescription)
    if (keywords) {
        setMeta('name', 'keywords', keywords)
    }

    // Open Graph
    setMeta('property', 'og:title', ogTitleFinal)
    setMeta('property', 'og:description', ogDescFinal)
    setMeta('property', 'og:image', ogImageFinal)
    setMeta('property', 'og:type', ogType)
    setMeta('property', 'og:url', canonicalUrl)
    setMeta('property', 'og:site_name', siteName)

    // Twitter Card
    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', ogTitleFinal)
    setMeta('name', 'twitter:description', ogDescFinal)
    setMeta('name', 'twitter:image', ogImageFinal)

    // Canonical URL
    let canonicalEl = document.querySelector('link[rel="canonical"]')
    if (!canonicalEl) {
        canonicalEl = document.createElement('link')
        canonicalEl.setAttribute('rel', 'canonical')
        document.head.appendChild(canonicalEl)
    }
    canonicalEl.setAttribute('href', canonicalUrl)
}
