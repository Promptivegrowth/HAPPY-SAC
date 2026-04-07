import { MetadataRoute } from 'next'
import { getProductosPublicos } from '@/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://www.happysac.com.pe'

    // Static routes
    const routes = ['', '/catalogo', '/carrito'].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }))

    // Dynamic products
    const { data: products } = await getProductosPublicos()
    const productEntries = (products || []).map((p) => ({
        url: `${baseUrl}/producto/${p.slug}`,
        lastModified: new Date(p.updated_at || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }))

    return [...routes, ...productEntries]
}
