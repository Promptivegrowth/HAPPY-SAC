import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/navbar"
import { Toaster } from "sonner"
import { CartProvider } from "@/context/cart-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "HAPPY SAC | Los Mejores Disfraces del Perú",
  description: "Encuentra los disfraces más increíbles para niños y adultos. Calidad premium y diseños exclusivos de HAPPY S.A.C.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} antialiased selection:bg-pink-100 selection:text-pink-900`}>
        <CartProvider>
          <Navbar />
          {children}
          <Toaster position="bottom-center" richColors />
        </CartProvider>
      </body>
    </html>
  )
}
