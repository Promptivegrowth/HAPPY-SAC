'use client'
import { ProductCard } from '@/components/ui/ProductCard'
import { motion, AnimatePresence } from 'framer-motion'
import { PackageSearch } from 'lucide-react'

interface ProductGridProps {
    products: any[]
    loading: boolean
}

export function ProductGrid({ products, loading }: ProductGridProps) {
    if (loading && products.length === 0) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="aspect-[3/4] bg-slate-100 animate-pulse rounded-[--radius-lg]" />
                ))}
            </div>
        )
    }

    if (products.length === 0) {
        return (
            <div className="py-24 text-center space-y-6">
                <div className="w-20 h-20 bg-[--surface-2] rounded-full flex items-center justify-center mx-auto text-slate-300">
                    <PackageSearch size={40} />
                </div>
                <div>
                    <h3 className="text-2xl font-display font-black text-[--brand-secondary]">No hay resultados</h3>
                    <p className="text-slate-500 mt-2">Prueba ajustando los filtros o buscando otro término.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            <AnimatePresence mode="popLayout">
                {products.map((product, i) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </AnimatePresence>

            {loading && products.length > 0 && (
                <div className="col-span-full py-12 flex justify-center">
                    <div className="w-8 h-8 border-4 border-[--brand-primary] border-t-transparent rounded-full animate-spin" />
                </div>
            )}
        </div>
    )
}
