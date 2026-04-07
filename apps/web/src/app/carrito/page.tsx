'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Truck, Info, ChevronLeft } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/lib/cart-store'
import { formatPrecio, formatTalla } from '@/lib/format'

export default function CartPage() {
    const { items, updateQuantity, removeItem, getSubtotal, getTotalItems } = useCartStore()

    if (items.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-8">
                <div className="w-32 h-32 bg-[--surface-2] rounded-full flex items-center justify-center text-slate-200">
                    <ShoppingBag size={64} />
                </div>
                <div className="max-w-md space-y-4">
                    <h1 className="text-4xl font-display font-black text-[--brand-secondary]">TU CARRITO ESTÁ VACÍO</h1>
                    <p className="text-lg text-slate-500">
                        Parece que aún no has seleccionado ningún disfraz para tu próxima aventura. ¡Explora nuestro catálogo y encuentra el ideal!
                    </p>
                </div>
                <Link href="/catalogo" className="btn-primary px-12 py-5 text-lg">
                    VER CATÁLOGO COMPLETO
                </Link>
            </div>
        )
    }

    return (
        <div className="bg-white min-h-screen py-16">
            <div className="max-w-[--container-max] mx-auto px-6">
                <header className="mb-16">
                    <Link href="/catalogo" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-[--brand-primary] transition-colors mb-4">
                        <ChevronLeft size={16} />
                        Seguir Comprando
                    </Link>
                    <h1 className="text-5xl md:text-7xl font-display font-black text-[--brand-secondary] tracking-tighter uppercase italic">
                        RESUMEN DE <span className="text-[--brand-primary]">COMPRA</span>
                    </h1>
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-[--text-muted] mt-2">
                        {getTotalItems()} Artículos en tu bolsa
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                    {/* Items Column */}
                    <div className="lg:col-span-8 space-y-12">
                        <div className="hidden md:grid grid-cols-12 pb-4 border-b text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <div className="col-span-6">Producto</div>
                            <div className="col-span-2 text-center">Cantidad</div>
                            <div className="col-span-2 text-right">Precio</div>
                            <div className="col-span-2 text-right">Subtotal</div>
                        </div>

                        <div className="space-y-12">
                            <AnimatePresence mode="popLayout">
                                {items.map((item) => (
                                    <motion.div
                                        key={item.product_size_id}
                                        layout
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="grid grid-cols-1 md:grid-cols-12 items-center gap-6 group"
                                    >
                                        {/* Info */}
                                        <div className="col-span-1 md:col-span-6 flex items-center gap-6">
                                            <div className="relative w-24 h-32 bg-[--surface-2] rounded-2xl overflow-hidden shrink-0 shadow-sm">
                                                <Image
                                                    src={item.imagen_url || '/placeholder-product.jpg'}
                                                    alt={item.nombre}
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Link href={`/producto/${item.slug}`}>
                                                    <h3 className="text-2xl font-display font-bold text-[--brand-secondary] group-hover:text-[--brand-primary] transition-colors">
                                                        {item.nombre}
                                                    </h3>
                                                </Link>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-[--text-muted]">
                                                    REF: {item.codigo} — {formatTalla(item.talla)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Qty Selector */}
                                        <div className="col-span-2 flex justify-center">
                                            <div className="flex items-center gap-4 bg-[--surface-2] px-4 py-2 rounded-xl">
                                                <button
                                                    onClick={() => updateQuantity(item.product_size_id, item.cantidad - 1)}
                                                    className="hover:text-[--brand-primary] transition-colors"
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="font-bold text-lg min-w-[20px] text-center">{item.cantidad}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.product_size_id, item.cantidad + 1)}
                                                    className="hover:text-[--brand-primary] transition-colors"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Price */}
                                        <div className="col-span-2 text-right hidden md:block">
                                            <span className="font-accent text-xl text-slate-400">
                                                {formatPrecio(item.precio)}
                                            </span>
                                        </div>

                                        {/* Subtotal Item */}
                                        <div className="col-span-2 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4">
                                            <span className="font-accent text-2xl text-[--brand-secondary]">
                                                {formatPrecio(item.precio * item.cantidad)}
                                            </span>
                                            <button
                                                onClick={() => removeItem(item.product_size_id)}
                                                className="text-slate-300 hover:text-[--error] transition-colors p-2"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        <div className="bg-[--surface-2] p-8 rounded-[--radius-lg] flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white text-[--success] rounded-full shadow-sm">
                                    <Truck size={24} />
                                </div>
                                <div>
                                    <h4 className="font-black text-sm uppercase tracking-widest text-[--brand-secondary]">Envío Estimado</h4>
                                    <p className="text-xs text-slate-500 font-medium tracking-tight">Recíbelo en Lima entre 24 a 48 horas hábiles.</p>
                                </div>
                            </div>
                            <Link href="/catalogo" className="text-xs font-black uppercase tracking-widest text-[--brand-primary] hover:underline">
                                AÑADIR MÁS PRODUCTOS
                            </Link>
                        </div>
                    </div>

                    {/* Summary Column */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-32 p-10 bg-[--brand-secondary] text-white rounded-[--radius-xl] shadow-2xl relative overflow-hidden">
                            {/* Pattern overlay */}
                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

                            <div className="relative space-y-8">
                                <h2 className="text-3xl font-display font-black italic tracking-tighter border-b border-white/10 pb-6 uppercase">
                                    TU PEDIDO
                                </h2>

                                <div className="space-y-4">
                                    <div className="flex justify-between font-bold text-white/60 uppercase tracking-widest text-xs">
                                        <span>Subtotal Productos</span>
                                        <span>{formatPrecio(getSubtotal())}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-white/60 uppercase tracking-widest text-xs">
                                        <span>IGV (18%)</span>
                                        <span>Incluido</span>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/20">
                                    <div className="flex justify-between items-baseline mb-2">
                                        <span className="text-2xl font-display font-black uppercase italic tracking-tighter">TOTAL</span>
                                        <span className="text-5xl font-accent">
                                            {formatPrecio(getSubtotal())}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">Soles Peruanos (PEN)</p>
                                </div>

                                <Link
                                    href="/finalizar-pedido"
                                    className="btn-primary w-full bg-[--brand-primary] hover:bg-white hover:text-[--brand-primary] py-6 text-xl tracking-widest group"
                                >
                                    PROCEDER AL PAGO
                                    <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                                </Link>

                                <div className="pt-6 flex flex-col items-center gap-4 border-t border-white/10">
                                    <div className="flex items-center gap-2">
                                        {[1, 2, 3].map(i => <div key={i} className="w-8 h-5 bg-white/10 rounded border border-white/10" />)}
                                    </div>
                                    <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30">
                                        <ShieldCheck size={14} />
                                        Transacción 100% Segura
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function ShieldCheck({ size }: { size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}
