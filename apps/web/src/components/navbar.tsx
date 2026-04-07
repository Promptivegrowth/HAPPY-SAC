"use client"

import Link from "next/link"
import { ShoppingBag, Search, Menu } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20)
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <nav className={cn(
            "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4",
            isScrolled ? "bg-white/80 backdrop-blur-md shadow-sm py-3" : "bg-transparent"
        )}>
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link href="/" className="text-2xl font-black tracking-tighter text-slate-900">
                    HAPPY <span className="text-pink-500 underline decoration-pink-200 underline-offset-4">SAC</span>
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    <Link href="/catalogo" className="text-sm font-semibold text-slate-600 hover:text-pink-500 transition-colors">Catálogo</Link>
                    <Link href="/nosotros" className="text-sm font-semibold text-slate-600 hover:text-pink-500 transition-colors">Nosotros</Link>
                    <Link href="/contacto" className="text-sm font-semibold text-slate-600 hover:text-pink-500 transition-colors">Contacto</Link>
                </div>

                <div className="flex items-center gap-4">
                    <button className="p-2 text-slate-600 hover:text-pink-500 transition-colors">
                        <Search size={22} />
                    </button>
                    <Link href="/carrito" className="p-2 text-slate-600 hover:text-pink-500 transition-colors relative">
                        <ShoppingBag size={22} />
                        <span className="absolute top-1 right-1 w-4 h-4 bg-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                            0
                        </span>
                    </Link>
                    <button className="md:hidden p-2 text-slate-600 hover:text-pink-500 transition-colors">
                        <Menu size={22} />
                    </button>
                </div>
            </div>
        </nav>
    )
}
