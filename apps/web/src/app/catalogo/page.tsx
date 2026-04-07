'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, ChevronDown, LayoutGrid, List } from 'lucide-react'
import { FilterSidebar } from '@/components/catalogo/FilterSidebar'
import { ProductGrid } from '@/components/catalogo/ProductGrid'
import { getProductosPublicos } from '@/lib/supabase'

export default function CatalogPage() {
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
    const [sortBy, setSortBy] = useState('newest')

    useEffect(() => {
        async function load() {
            setLoading(true)
            const { data } = await getProductosPublicos()
            setProducts(data || [])
            setLoading(false)
        }
        load()
    }, [])

    return (
        <div className="bg-white min-h-screen">
            {/* Hero Header */}
            <section className="bg-[--surface-2] py-20 border-b">
                <div className="max-w-[--container-max] mx-auto px-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-[1px] bg-[--brand-secondary]/20" />
                        <span className="text-[--text-muted] font-black tracking-[0.3em] text-[10px] uppercase">
                            NUESTRA COLECCIÓN
                        </span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-display font-black text-[--brand-secondary] tracking-tighter">
                        CATÁLOGO <span className="text-[--brand-primary]">2024</span>
                    </h1>
                </div>
            </section>

            {/* Toolbar */}
            <section className="sticky top-[86px] z-30 bg-white/80 backdrop-blur-md border-b">
                <div className="max-w-[--container-max] mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileFilterOpen(true)}
                            className="lg:hidden flex items-center gap-2 font-black text-xs uppercase tracking-widest text-[--brand-secondary]"
                        >
                            <SlidersHorizontal size={18} />
                            Filtros
                        </button>
                        <p className="hidden md:block text-xs font-bold text-slate-400">
                            Mostrando {products.length} productos
                        </p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4 text-slate-300">
                            <button className="text-[--brand-primary]"><LayoutGrid size={20} /></button>
                            <button className="hover:text-[--brand-secondary] transition-colors"><List size={20} /></button>
                        </div>
                        <div className="relative group">
                            <button className="flex items-center gap-2 font-black text-xs uppercase tracking-widest text-[--brand-secondary]">
                                Ordenar por
                                <ChevronDown size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <div className="max-w-[--container-max] mx-auto px-6 py-12">
                <div className="flex gap-12">
                    {/* Sidebar Desktop */}
                    <div className="hidden lg:block w-72 shrink-0">
                        <FilterSidebar />
                    </div>

                    {/* Grid */}
                    <div className="flex-1">
                        <ProductGrid products={products} loading={loading} />
                    </div>
                </div>
            </div>

            {/* Mobile Filter Drawer */}
            <AnimatePresence>
                {isMobileFilterOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileFilterOpen(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-white z-[51] p-8 lg:hidden overflow-y-auto"
                        >
                            <FilterSidebar onClose={() => setIsMobileFilterOpen(false)} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
