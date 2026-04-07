"use client"

import { useState } from "react"
import { useCart, CartItem } from "@/context/cart-context"
import { ShoppingCart, MessageCircle, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface AddToCartSectionProps {
    product: any
    sizes: any[]
}

export default function AddToCartSection({ product, sizes }: AddToCartSectionProps) {
    const { addItem } = useCart()
    const [selectedSize, setSelectedSize] = useState<any>(sizes[0] || null)
    const [quantity, setQuantity] = useState(1)

    const handleAddToCart = () => {
        if (!selectedSize) return

        const item: CartItem = {
            id: `${product.id}-${selectedSize.id}`,
            product_id: product.id,
            product_size_id: selectedSize.id,
            nombre: product.nombre_web || product.nombre,
            talla: selectedSize.talla,
            precio: selectedSize.precio_venta || product.precio_venta_base,
            cantidad: quantity
        }

        addItem(item)
    }

    const handleWhatsApp = () => {
        if (!selectedSize) return
        const text = `Hola! Me interesa el disfraz ${product.nombre} en talla ${selectedSize.talla}.`
        window.open(`https://wa.me/51987654321?text=${encodeURIComponent(text)}`, '_blank')
    }

    return (
        <div className="space-y-10">
            <div className="space-y-6">
                <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Seleccionar Talla</h3>
                    <div className="flex flex-wrap gap-3">
                        {sizes.sort((a, b) => a.orden - b.orden).map((size) => (
                            <button
                                key={size.id}
                                onClick={() => setSelectedSize(size)}
                                className={cn(
                                    "w-14 h-14 rounded-2xl border-2 flex items-center justify-center font-black text-sm transition-all relative overflow-hidden",
                                    selectedSize?.id === size.id
                                        ? "border-slate-900 bg-slate-900 text-white shadow-xl shadow-slate-900/10"
                                        : "border-slate-100 bg-white text-slate-400 hover:border-slate-200 hover:text-slate-900"
                                )}
                            >
                                {size.talla}
                                {selectedSize?.id === size.id && <Check size={12} className="absolute top-1 right-1" />}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                    onClick={handleAddToCart}
                    className="flex-1 h-16 bg-slate-900 text-white rounded-[1.25rem] font-black text-lg flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95 group"
                >
                    <ShoppingCart size={22} className="group-hover:rotate-12 transition-transform" />
                    Agregar al Carrito
                </button>
                <button
                    onClick={handleWhatsApp}
                    className="px-6 h-16 bg-emerald-500 text-white rounded-[1.25rem] font-bold flex items-center justify-center hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                >
                    <MessageCircle size={24} />
                </button>
            </div>
        </div>
    )
}
