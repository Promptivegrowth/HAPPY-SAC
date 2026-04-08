'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Truck, ShieldCheck, Award, ShoppingBag, Plus, Minus, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProductGallery } from '@/components/producto/ProductGallery'
import { SizeSelector } from '@/components/producto/SizeSelector'
import { getProductoPorSlug } from '@/lib/supabase'
import { formatPrecio } from '@/lib/format'
import { useCartStore } from '@/lib/cart-store'
import { toast } from 'sonner'

export default function ProductDetailPage() {
    const { slug } = useParams()
    const [product, setProduct] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [selectedSize, setSelectedSize] = useState<any>(null)
    const [qty, setQty] = useState(1)

    const addItem = useCartStore(s => s.addItem)

    useEffect(() => {
        async function load() {
            const { data } = await getProductoPorSlug(slug as string)
            if (data) {
                setProduct(data)
                // Seleccionar primera talla por defecto si existe y está disponible
                const defaultSize = data.product_sizes?.find((s: any) => s.publicar_web && s.activo)
                if (defaultSize) setSelectedSize(defaultSize)
            }
            setLoading(false)
        }
        load()
    }, [slug])

    const handleAddToCart = () => {
        if (!selectedSize) {
            toast.error('Por favor selecciona una talla')
            return
        }

        addItem({
            product_id: product.id,
            product_size_id: selectedSize.id,
            slug: product.slug,
            codigo: product.codigo,
            nombre: product.nombre_web || product.nombre,
            talla: selectedSize.talla,
            precio: selectedSize.en_oferta ? selectedSize.precio_oferta : (selectedSize.precio_web || 0),
            imagen_url: product.imagen_url || (product.imagenes_urls ? product.imagenes_urls[0] : ''),
            stock_disponible: selectedSize.stock || 0
        })

        toast.success('¡Agregado al carrito!')
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
    if (!product) return <div className="min-h-screen flex items-center justify-center">Producto no encontrado</div>

    const currentPrice = selectedSize ? selectedSize.precio_web : 0

    return (
        <div className="bg-white min-h-screen pb-24">
            <div className="max-w-[--container-max] mx-auto px-6">
                {/* Breadcrumbs e info superior */}
                <div className="py-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                    <span className="hover:text-[--brand-secondary] cursor-pointer">Inicio</span>
                    <span>/</span>
                    <span className="hover:text-[--brand-secondary] cursor-pointer">{product.categories?.nombre}</span>
                    <span>/</span>
                    <span className="text-[--brand-secondary]">{product.nombre_web || product.nombre}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Gallery Column */}
                    <div className="lg:col-span-7">
                        <ProductGallery images={[
                            ...(product.imagen_url ? [product.imagen_url] : []),
                            ...(product.imagenes_urls || [])
                        ]} />
                    </div>

                    {/* Info Column */}
                    <div className="lg:col-span-5 space-y-12">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="bg-[--brand-primary]/5 text-[--brand-primary] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                                    DISPONIBLE AHORA
                                </span>
                                <span className="text-[10px] font-bold text-slate-400">REF: {product.codigo}</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-display font-black text-[--brand-secondary] leading-none mb-4">
                                {product.nombre_web || product.nombre}
                            </h1>
                            <p className="text-lg text-[--text-secondary] font-medium leading-relaxed">
                                {product.descripcion_web || 'Descripción no disponible.'}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-baseline gap-4">
                                {selectedSize?.en_oferta && (
                                    <span className="text-2xl font-bold text-slate-400 line-through">
                                        {formatPrecio(selectedSize.precio_web)}
                                    </span>
                                )}
                                <span className={cn(
                                    "text-5xl font-accent",
                                    selectedSize?.en_oferta ? "text-[--brand-primary]" : "text-[--brand-secondary]"
                                )}>
                                    {formatPrecio(selectedSize?.en_oferta ? selectedSize.precio_oferta : currentPrice)}
                                </span>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    Inc. IGV (Factura disponible)
                                </span>
                            </div>
                        </div>

                        {/* Size Selector */}
                        <SizeSelector
                            productId={product.id}
                            sizes={product.product_sizes || []}
                            onSelect={setSelectedSize}
                        />

                        {/* Actions */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center border-2 border-slate-100 rounded-2xl h-16 bg-[--surface-2]">
                                    <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-16 h-full flex items-center justify-center hover:text-[--brand-primary] transition-colors"><Minus size={20} /></button>
                                    <span className="w-12 text-center text-xl font-bold">{qty}</span>
                                    <button onClick={() => setQty(qty + 1)} className="w-16 h-full flex items-center justify-center hover:text-[--brand-primary] transition-colors"><Plus size={20} /></button>
                                </div>
                                <button
                                    onClick={handleAddToCart}
                                    className="btn-primary flex-1 h-16 text-lg uppercase tracking-widest"
                                >
                                    <ShoppingBag size={24} />
                                    AGREGAR AL CARRITO
                                </button>
                            </div>

                            <a
                                href={`https://wa.me/51916854842?text=Hola,%20quisiera%20consultar%20por%20el%20producto:%20${product.nombre_web || product.nombre}%20(Ref:%20${product.codigo})`}
                                target="_blank"
                                className="flex items-center justify-center gap-3 w-full py-4 border-2 border-[--brand-accent-2] text-[--brand-accent-2] rounded-2xl font-black uppercase tracking-widest hover:bg-[--brand-accent-2] hover:text-white transition-all shadow-lg shadow-[--brand-accent-2]/10"
                            >
                                <MessageCircle size={22} />
                                CONSULTAR POR WHATSAPP
                            </a>
                        </div>

                        {/* Trust Badges Minimal */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t">
                            {[
                                { icon: <Truck size={20} />, title: 'ENVÍO RÁPIDO' },
                                { icon: <ShieldCheck size={20} />, title: 'GARANTÍA TOTAL' },
                                { icon: <Award size={20} />, title: 'CALIDAD PREMIUM' },
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col items-center text-center gap-2">
                                    <div className="text-[--brand-primary]">{item.icon}</div>
                                    <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-500">{item.title}</h4>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
