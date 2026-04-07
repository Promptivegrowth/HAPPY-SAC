import type { Metadata } from 'next'
import { Playfair_Display, Plus_Jakarta_Sans, Bebas_Neue } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CartDrawer } from '@/components/cart/CartDrawer'

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-display' })
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-body' })
const bebas = Bebas_Neue({ weight: '400', subsets: ['latin'], variable: '--font-accent' })

export const metadata: Metadata = {
  title: {
    template: '%s | HAPPY S.A.C. — Disfraces Premium Lima',
    default: 'HAPPY S.A.C. — Los mejores disfraces en Lima, Perú'
  },
  description: 'Tienda de disfraces premium en Lima, Perú. Fiestas Patrias, Halloween, Navidad. Más de 50 modelos. Envío en 24-48 horas. Compra por WhatsApp.',
  keywords: ['disfraces Lima', 'disfraces fiestas patrias', 'disfraces Halloween Peru', 'disfraces navidad', 'Happy SAC'],
  openGraph: {
    type: 'website',
    locale: 'es_PE',
    url: 'https://www.happysac.com.pe',
    siteName: 'HAPPY S.A.C.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }]
  },
  robots: { index: true, follow: true }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${playfair.variable} ${jakarta.variable} ${bebas.variable}`}>
      <body className="antialiased selection:bg-[--brand-primary]/10 selection:text-[--brand-primary]">
        <Header />
        <main className="pt-[140px] min-h-screen">
          {children}
        </main>
        <Footer />
        <CartDrawer />
        <Toaster position="bottom-right" />
      </body>
    </html>
  )
}
