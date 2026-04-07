'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Plus, ShoppingBag, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatPrecio, precioDesde } from '@/lib/format'
import { useCartStore } from '@/lib/cart-store'
import { toast } from 'sonner'

interface ProductCardProps {
    product: any // Tipar correctamente luego
}

export function ProductCard({ product }: ProductCardProps) {
    const addItem = useCartStore(s => s.addItem)
    const basePrice = precioDesde(product.product_sizes)
    const hasOffer = product.product_sizes?.some((s: any) => s.en_oferta)
    const originalPrice = product.product_sizes?.[0]?.precio_web || 0
    const totalStock = product.product_sizes?.reduce((acc: number, s: any) => acc + (s.stock || 0), 0) || 0

    const handleQuickAdd = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        const firstSize = product.product_sizes?.find((s: any) => s.activo && s.publicar_web && (s.stock || 0) > 0)

        if (firstSize) {
            addItem({
                product_id: product.id,
                product_size_id: firstSize.id,
                slug: product.slug,
                codigo: product.codigo,
                nombre: product.nombre_web || product.nombre,
                talla: firstSize.talla,
                precio: firstSize.en_oferta ? firstSize.precio_oferta : (firstSize.precio_web || 0),
                imagen_url: product.imagen_url || (product.imagenes_urls ? product.imagenes_urls[0] : ''),
                stock_disponible: firstSize.stock || 0
            })
            toast.success('¡Agregado al carrito!')
        } else {
            toast.error('Sin stock disponible')
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
                    {hasOffer && (
                        <div className="absolute top-4 left-4 bg-[--error] text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg z-10">
                            OFERTA
                        </div>
                    )}
                    {product.featured && !hasOffer && (
                        <div className="absolute top-4 left-4 bg-[--brand-primary] text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg z-10">
                            DESTACADO
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
                    <div className="pt-2 flex items-center justify-between gap-2">
                        <div className="flex items-baseline gap-2">
                            {hasOffer && (
                                <span className="text-sm font-bold text-slate-400 line-through">
                                    {formatPrecio(originalPrice)}
                                </span>
                            )}
                            <span className={cn(
                                "font-accent text-lg font-bold",
                                hasOffer ? "text-[--brand-primary]" : "text-[--brand-secondary]"
                            )}>
                                {formatPrecio(basePrice)}
                            </span>
                        </div>

                        {/* Stock Badge */}
                        <div className={cn(
                            "px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest shadow-sm",
                            totalStock > 0
                                ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                                : "bg-red-50 border-red-200 text-red-600 shadow-sm"
                        )}>
                            {totalStock > 0 ? `${totalStock} en stock` : 'Agotado'}
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    )
}
