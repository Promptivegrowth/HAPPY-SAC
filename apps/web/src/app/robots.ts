import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/mi-cuenta', '/carrito', '/finalizar-pedido'],
        },
        sitemap: 'https://www.happysac.com.pe/sitemap.xml',
    }
}
