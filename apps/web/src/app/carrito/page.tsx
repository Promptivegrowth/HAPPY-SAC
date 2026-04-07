"use client"

import { useCart } from "@/context/cart-context"
import {
    ShoppingBag,
    ArrowLeft,
    Trash2,
    Plus,
    Minus,
    MessageCircle,
    Truck
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function CartPage() {
    const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart()

    const handleCheckout = () => {
        if (items.length === 0) return

        let message = "¡Hola HAPPY S.A.C! 👋 Deseo realizar el siguiente pedido:\n\n"
        items.forEach((item, index) => {
            message += `${index + 1}. *${item.nombre}* - Talla: ${item.talla} (x${item.cantidad}) - S/ ${(item.precio * item.cantidad).toFixed(2)}\n`
        })
        message += `\n*Total a pagar: S/ ${totalPrice.toFixed(2)}*\n\n¿Podrían indicarme los pasos para el envío?`

        window.open(`https://wa.me/51987654321?text=${encodeURIComponent(message)}`, '_blank')
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 pt-32 pb-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="bg-white p-20 rounded-[4rem] border border-slate-200 text-center space-y-8 shadow-sm">
                        <div className="w-32 h-32 bg-slate-50 rounded-[3rem] flex items-center justify-center text-slate-200 mx-auto">
                            <ShoppingBag size={64} />
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Tu carrito está vacío</h2>
                            <p className="text-slate-400 font-medium italic">¡Aún no has agregado la magia a tu pedido!</p>
                        </div>
                        <Link href="/catalogo" className="inline-flex items-center gap-2 px-10 py-5 bg-slate-900 text-white font-black rounded-3xl hover:bg-pink-600 transition-all shadow-2xl shadow-slate-900/10 active:scale-95">
                            <ArrowLeft size={20} />
                            Explorar Catálogo
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-32 pb-24">
            <div className="max-w-7xl mx-auto px-6">
                <div className="mb-12">
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">Tu <span className="text-pink-600 italic">Carrito</span></h1>
                    <p className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-xs">{totalItems} ARTÍCULOS SELECCIONADOS</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-6">
                        {items.map((item) => (
                            <div key={item.product_size_id} className="bg-white p-8 rounded-[3rem] border border-slate-200 flex flex-col sm:flex-row items-center gap-8 shadow-sm transition-all hover:shadow-xl hover:shadow-slate-200/50 group">
                                <div className="w-full sm:w-40 aspect-square bg-slate-50 rounded-[2rem] overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-slate-100 to-white" />
                                    <div className="absolute inset-0 flex items-center justify-center text-slate-200">
                                        <ShoppingBag size={40} />
                                    </div>
                                </div>

                                <div className="flex-1 space-y-4 text-center sm:text-left">
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-black text-slate-900 leading-tight">{item.nombre}</h3>
                                        <p className="text-sm font-black text-pink-500 uppercase tracking-widest">Talla {item.talla}</p>
                                    </div>
                                    <p className="text-2xl font-black text-slate-900 italic">S/ {item.precio.toFixed(2)}</p>
                                </div>

                                <div className="flex flex-col items-center sm:items-end gap-6">
                                    <div className="flex items-center bg-slate-100 rounded-2xl p-1">
                                        <button
                                            onClick={() => updateQuantity(item.product_size_id, item.cantidad - 1)}
                                            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
                                        >
                                            <Minus size={18} />
                                        </button>
                                        <span className="w-12 text-center font-black text-slate-900">{item.cantidad}</span>
                                        <button
                                            onClick={() => updateQuantity(item.product_size_id, item.cantidad + 1)}
                                            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => removeItem(item.product_size_id)}
                                        className="text-slate-300 hover:text-rose-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all hover:gap-3"
                                    >
                                        <Trash2 size={16} />
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="space-y-6">
                        <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white space-y-10 shadow-2xl shadow-slate-900/30 sticky top-32">
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-pink-500 border-b border-white/10 pb-6 text-center">Resumen del Pedido</h3>

                            <div className="space-y-6">
                                <div className="flex justify-between items-center opacity-60">
                                    <span className="text-xs font-bold uppercase tracking-widest">Artículos ({totalItems})</span>
                                    <span className="text-sm font-black">S/ {totalPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center opacity-60">
                                    <span className="text-xs font-bold uppercase tracking-widest">Envío</span>
                                    <span className="text-[10px] font-black underline underline-offset-4 decoration-pink-500">POR ACORDAR</span>
                                </div>
                                <div className="pt-8 border-t border-white/10 flex flex-col items-center gap-2">
                                    <span className="text-xs font-bold uppercase tracking-[0.3em] opacity-40">Total Estimado</span>
                                    <span className="text-6xl font-black text-pink-500 tracking-tighter italic">S/ {totalPrice.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={handleCheckout}
                                    className="w-full h-20 bg-emerald-500 text-white rounded-3xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                                >
                                    <MessageCircle size={28} />
                                    Pedir por WhatsApp
                                </button>
                                <p className="text-[9px] text-center text-white/30 font-bold uppercase tracking-widest px-4 leading-relaxed">Al hacer clic, serás redirigido a WhatsApp para finalizar tu pedido con un asesor.</p>
                            </div>
                        </div>

                        <div className="p-8 bg-white rounded-[2.5rem] border border-slate-200 space-y-4">
                            <div className="flex items-center gap-3 text-slate-900">
                                <Truck size={20} className="text-pink-500" />
                                <h4 className="text-xs font-black uppercase tracking-widest">Información de Envío</h4>
                            </div>
                            <p className="text-xs text-slate-400 font-medium leading-relaxed italic">Realizamos envíos a todo el Perú vía Olva Courier o Shalom. Los costos se coordinan por WhatsApp.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
