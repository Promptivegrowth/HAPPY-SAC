'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Star, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { ProductCard } from '@/components/ui/ProductCard'
import { getProductosPublicos } from '@/lib/supabase'

export function FeaturedProducts() {
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            const { data } = await getProductosPublicos()
            if (data) {
                // Filtrar solo destacados o los primeros 4
                setProducts(data.filter(p => p.featured).slice(0, 4))
            }
            setLoading(false)
        }
        load()
    }, [])

    if (loading) return (
        <div className="py-24 max-w-[--container-max] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-[3/4] bg-slate-100 animate-pulse rounded-[--radius-lg]" />
            ))}
        </div>
    )

    if (products.length === 0) return null

    return (
        <section className="py-24 bg-[--surface-2]">
            <div className="max-w-[--container-max] mx-auto px-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-[2px] bg-[--brand-primary]" />
                    <span className="text-[--brand-primary] font-black tracking-[0.3em] text-xs uppercase">
                        SELECCIÓN PREMIUM
                    </span>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div className="max-w-xl">
                        <h2 className="text-5xl md:text-6xl font-display font-black leading-none uppercase italic">
                            LOS MÁS <span className="text-[--brand-secondary]">PEDIDOS</span>
                        </h2>
                    </div>
                    <Link href="/catalogo" className="btn-primary py-3 px-6 text-xs">
                        VER TODO
                        <ArrowRight size={18} />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.map((product, i) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    )
}
