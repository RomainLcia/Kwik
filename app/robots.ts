import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/quotes', '/clients', '/invoices', '/settings', '/onboarding', '/subscribe'],
    },
    sitemap: 'https://www.kwik-devis.fr/sitemap.xml',
  }
}
