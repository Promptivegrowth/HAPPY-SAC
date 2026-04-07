'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Plus, ShoppingBag, Eye } from 'lucide-react'
import { formatPrecio, precioDesde } from '@/lib/format'
import { useCartStore } from '@/lib/cart-store'
import { toast } from 'sonner'

interface ProductCardProps {
    product: any // Tipar correctamente luego
}

export function ProductCard({ product }: ProductCardProps) {
    const addItem = useCartStore(s => s.addItem)
    const basePrice = precioDesde(product.product_sizes)
    const hasPromotions = product.featured // Usar promodion logic luego

    const handleQuickAdd = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        // Si tiene tallas, elegimos la primera disponible para el "Quick Add"
        const firstSize = product.product_sizes?.find((s: any) => s.activo && s.publicar_web)

        if (firstSize) {
            addItem({
                product_id: product.id,
                product_size_id: firstSize.id,
                slug: product.slug,
                codigo: product.codigo,
                nombre: product.nombre_web || product.nombre,
                talla: firstSize.talla,
                precio: firstSize.precio_web || 0,
                imagen_url: product.imagen_url || (product.imagenes_urls ? product.imagenes_urls[0] : ''),
                stock_disponible: 10 // Mock stock
            })
            toast.success('¡Agregado al carrito!')
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group"
        >
            <Link href={`/producto/${product.slug}`}>
                <div className="relative aspect-[3/4] rounded-[--radius-lg] overflow-hidden bg-[--surface-2] mb-4">
                    <Image
                        src={product.imagen_url || '/placeholder-product.jpg'}
                        alt={product.nombre_web || product.nombre}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Promo Badge */}
                    {hasPromotions && (
                        <div className="absolute top-4 left-4 bg-[--brand-primary] text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg z-10">
                            MÁS VENDIDO
                        </div>
                    )}

                    {/* Quick Actions Overlay */}
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                            onClick={handleQuickAdd}
                            className="w-12 h-12 bg-white text-[--brand-secondary] rounded-full flex items-center justify-center hover:bg-[--brand-primary] hover:text-white transition-all shadow-xl hover:scale-110"
                            title="Agregar rápido"
                        >
                            <Plus size={24} />
                        </button>
                        <div className="w-12 h-12 bg-white text-[--brand-secondary] rounded-full flex items-center justify-center hover:bg-[--brand-secondary] hover:text-white transition-all shadow-xl hover:scale-110">
                            <Eye size={22} />
                        </div>
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between items-start gap-2">
                        <h3 className="font-display font-bold text-[--brand-secondary] text-lg leading-snug group-hover:text-[--brand-primary] transition-colors line-clamp-2">
                            {product.nombre_web || product.nombre}
                        </h3>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[--text-muted]">
                        {product.categories?.nombre || 'General'}
                    </p>
                    <div className="pt-2 flex items-baseline gap-2">
                        <span className="font-accent text-2xl text-[--brand-secondary]">
                            {formatPrecio(basePrice)}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">PVP aprox.</span>
                    </div>
                </div>
            </Link>
        </motion.div>
    )
}
