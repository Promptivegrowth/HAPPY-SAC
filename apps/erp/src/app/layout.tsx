import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "HAPPY SAC ERP | Sistema de Gestión Textil",
  description: "Plataforma integral para gestión de producción, inventario y ventas de HAPPY S.A.C.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} antialiased selection:bg-pink-100 selection:text-pink-900`}>
        {children}
        {/* @ts-ignore */}
        <Toaster position="top-right" expand={false} richColors />
      </body>
    </html>
  )
}
