'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ShoppingCart, User, Heart, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/lib/cart-store'
import { AnnouncementBar } from './AnnouncementBar'
import { SearchOverlay } from './SearchOverlay'

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const totalItems = useCartStore(s => s.getTotalItems())
    const openCart = useCartStore(s => s.openCart)

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <header className="fixed top-0 left-0 right-0 z-50">
            <AnnouncementBar />

            <nav className={cn(
                "transition-all duration-300 px-6 py-4",
                isScrolled
                    ? "bg-white/80 backdrop-blur-md shadow-sm py-3"
                    : "bg-transparent"
            )}>
                <div className="max-w-[--container-max] mx-auto flex items-center justify-between gap-8">
                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="lg:hidden p-2 text-[--brand-secondary]"
                    >
                        <Menu size={24} />
                    </button>

                    {/* Logo */}
                    <Link href="/" className="flex-shrink-0">
                        <h1 className="text-2xl md:text-3xl font-display font-black tracking-tighter text-[--brand-secondary]">
                            HAPPY <span className="text-[--brand-primary]">S.A.C.</span>
                        </h1>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-[--brand-secondary]">
                        <Link href="/catalogo" className="hover:text-[--brand-primary] transition-colors">Catálogo</Link>
                        <Link href="/catalogo?categoria=fiestas-patrias" className="hover:text-[--brand-primary] transition-colors">Fiestas Patrias</Link>
                        <Link href="/catalogo?categoria=halloween" className="hover:text-[--brand-primary] transition-colors">Halloween</Link>
                        <Link href="/nosotros" className="hover:text-[--brand-primary] transition-colors">Nosotros</Link>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 md:gap-4">
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="p-2 text-[--brand-secondary] hover:bg-[--brand-primary]/5 rounded-full transition-all"
                        >
                            <Search size={22} />
                        </button>
                        <Link href="/mi-cuenta" className="hidden md:block p-2 text-[--brand-secondary] hover:bg-[--brand-primary]/5 rounded-full transition-all">
                            <User size={22} />
                        </Link>
                        <button
                            onClick={openCart}
                            className="relative p-2 text-[--brand-secondary] hover:bg-[--brand-primary]/5 rounded-full transition-all"
                        >
                            <ShoppingCart size={22} />
                            {totalItems > 0 && (
                                <motion.span
                                    key={totalItems}
                                    initial={{ scale: 1.5 }}
                                    animate={{ scale: 1 }}
                                    className="absolute top-0 right-0 w-5 h-5 bg-[--brand-primary] text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg"
                                >
                                    {totalItems}
                                </motion.span>
                            )}
                        </button>
                    </div>
                </div>
            </nav>

            <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

            {/* Mobile Menu Drawer */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 bottom-0 w-[300px] bg-white z-50 p-8 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-12">
                                <span className="text-xl font-display font-black text-[--brand-secondary]">MENÚ</span>
                                <button onClick={() => setIsMobileMenuOpen(false)}>
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="flex flex-col gap-6 text-lg font-bold uppercase tracking-widest">
                                <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>Inicio</Link>
                                <Link href="/catalogo" onClick={() => setIsMobileMenuOpen(false)}>Catálogo</Link>
                                <Link href="/catalogo?categoria=fiestas-patrias" onClick={() => setIsMobileMenuOpen(false)}>Fiestas Patrias</Link>
                                <Link href="/catalogo?categoria=halloween" onClick={() => setIsMobileMenuOpen(false)}>Halloween</Link>
                                <hr className="border-slate-100" />
                                <Link href="/nosotros" onClick={() => setIsMobileMenuOpen(false)}>Nosotros</Link>
                                <Link href="/contacto" onClick={() => setIsMobileMenuOpen(false)}>Contacto</Link>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </header>
    )
}
