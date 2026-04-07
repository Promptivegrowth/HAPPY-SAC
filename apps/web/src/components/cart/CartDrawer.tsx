'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/lib/cart-store'
import { formatPrecio, formatTalla } from '@/lib/format'

export function CartDrawer() {
    const { items, isOpen, closeCart, updateQuantity, removeItem, getSubtotal, getTotalItems } = useCartStore()

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeCart}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 bottom-0 w-full max-w-[450px] bg-white z-[101] flex flex-col shadow-2xl"
                    >
                        {/* Header */}
                        <div className="p-6 border-b flex items-center justify-between bg-[--surface-2]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[--brand-secondary] text-white rounded-full flex items-center justify-center shadow-lg">
                                    <ShoppingBag size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-display font-black text-[--brand-secondary]">TU CARRITO</h2>
                                    <p className="text-[10px] uppercase tracking-widest font-bold text-[--text-muted]">
                                        {getTotalItems()} Artículos seleccionados
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={closeCart}
                                className="p-2 hover:bg-slate-100 rounded-full transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Items List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                                    <div className="w-24 h-24 bg-[--surface-2] rounded-full flex items-center justify-center text-slate-300">
                                        <ShoppingBag size={48} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-display font-bold text-[--brand-secondary]">Tu carrito está vacío</h3>
                                        <p className="text-sm text-slate-500 mt-2">¿Aún no has elegido tu disfraz ideal?</p>
                                    </div>
                                    <button
                                        onClick={closeCart}
                                        className="btn-primary w-full"
                                    >
                                        EXPLORAR CATÁLOGO
                                    </button>
                                </div>
                            ) : (
                                items.map((item) => (
                                    <motion.div
                                        key={item.product_size_id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex gap-4 group"
                                    >
                                        {/* Image */}
                                        <div className="relative w-24 h-32 bg-[--surface-2] rounded-xl overflow-hidden shadow-sm shrink-0">
                                            <Image
                                                src={item.imagen_url || '/placeholder-product.jpg'}
                                                alt={item.nombre}
                                                fill
                                                className="object-cover transition-transform group-hover:scale-110"
                                            />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 flex flex-col justify-between py-1">
                                            <div>
                                                <div className="flex justify-between items-start gap-2">
                                                    <Link href={`/producto/${item.slug}`} onClick={closeCart}>
                                                        <h4 className="font-display font-bold text-[--brand-secondary] group-hover:text-[--brand-primary] transition-colors line-clamp-1">
                                                            {item.nombre}
                                                        </h4>
                                                    </Link>
                                                    <button
                                                        onClick={() => removeItem(item.product_size_id)}
                                                        className="text-slate-300 hover:text-[--error] transition-colors p-1"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                <p className="text-xs font-black uppercase tracking-widest text-[--text-muted] mt-1">
                                                    {formatTalla(item.talla)}
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between mt-4">
                                                {/* Quantity Selector */}
                                                <div className="flex items-center border rounded-lg bg-[--surface-2]">
                                                    <button
                                                        onClick={() => updateQuantity(item.product_size_id, item.cantidad - 1)}
                                                        className="p-1 px-2 hover:text-[--brand-primary] transition-colors"
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="w-8 text-center text-xs font-black">{item.cantidad}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.product_size_id, item.cantidad + 1)}
                                                        className="p-1 px-2 hover:text-[--brand-primary] transition-colors"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                                <span className="font-accent text-lg text-[--brand-secondary]">
                                                    {formatPrecio(item.precio * item.cantidad)}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {/* Footer Summary */}
                        {items.length > 0 && (
                            <div className="p-8 border-t bg-[--surface-2] space-y-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm font-bold text-slate-500">
                                        <span>Subtotal</span>
                                        <span>{formatPrecio(getSubtotal())}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-bold text-slate-500">
                                        <span>Envío</span>
                                        <span className="text-[--brand-accent-2]">A calcular</span>
                                    </div>
                                    <div className="flex justify-between text-2xl font-display font-black text-[--brand-secondary] pt-3 border-t">
                                        <span>TOTAL</span>
                                        <span>{formatPrecio(getSubtotal())}</span>
                                    </div>
                                </div>

                                <Link
                                    href="/carrito"
                                    onClick={closeCart}
                                    className="btn-primary w-full group"
                                >
                                    FINALIZAR COMPRA
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </Link>

                                <p className="text-[10px] text-center font-bold text-[--text-muted] uppercase tracking-tighter">
                                    🔒 Pago 100% seguro vÍa WhatsApp & Transferencia
                                </p>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
