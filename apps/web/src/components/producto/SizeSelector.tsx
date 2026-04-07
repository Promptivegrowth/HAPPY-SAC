'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatPrecio } from '@/lib/format'
import { supabase } from '@/lib/supabase'

interface Size {
    id: string
    talla: string
    precio_web: number
    stock?: number
}

interface SizeSelectorProps {
    sizes: Size[]
    productId: string
    onSelect: (size: Size) => void
}

export function SizeSelector({ sizes, productId, onSelect }: SizeSelectorProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [realtimeStock, setRealtimeStock] = useState<Record<string, number>>({})

    useEffect(() => {
        // Initial stock fetch
        const fetchStock = async () => {
            const { data } = await supabase
                .from('product_sizes')
                .select('id, stock')
                .eq('product_id', productId)

            if (data) {
                const stockMap = data.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.stock }), {})
                setRealtimeStock(stockMap)
            }
        }

        fetchStock()

        // Realtime subscription
        const channel = supabase
            .channel(`stock_changes_${productId}`)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'product_sizes', filter: `product_id=eq.${productId}` },
                (payload) => {
                    setRealtimeStock(prev => ({ ...prev, [payload.new.id]: payload.new.stock }))
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [productId])

    const handleSelect = (size: Size) => {
        setSelectedId(size.id)
        onSelect({ ...size, stock: realtimeStock[size.id] || 0 })
    }

    const anyOutOfStock = sizes.some(s => (realtimeStock[s.id] ?? 0) <= 0)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-widest text-[--brand-secondary]">
                    Seleccionar Talla
                </label>
                <button className="text-[10px] font-bold text-[--brand-primary] hover:underline flex items-center gap-1">
                    <Info size={12} />
                    Guía de tallas
                </button>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {sizes.map((size) => {
                    const stock = realtimeStock[size.id] ?? 0
                    const isSelected = selectedId === size.id
                    const isOutOfStock = stock <= 0

                    return (
                        <button
                            key={size.id}
                            disabled={isOutOfStock}
                            onClick={() => handleSelect(size)}
                            className={cn(
                                "relative group flex flex-col items-center justify-center p-4 rounded-[--radius-md] border-2 transition-all",
                                isSelected
                                    ? "border-[--brand-primary] bg-[--brand-primary]/5"
                                    : "border-slate-100 hover:border-[--brand-primary]/30 bg-white",
                                isOutOfStock && "opacity-40 grayscale cursor-not-allowed"
                            )}
                        >
                            <span className={cn(
                                "text-lg font-accent",
                                isSelected ? "text-[--brand-primary]" : "text-[--brand-secondary]"
                            )}>
                                {size.talla}
                            </span>
                            <span className="text-[10px] font-black tracking-tighter text-slate-400">
                                {formatPrecio(size.precio_web)}
                            </span>

                            {isSelected && (
                                <motion.div
                                    layoutId="check-size"
                                    className="absolute -top-2 -right-2 bg-[--brand-primary] text-white p-1 rounded-full shadow-lg"
                                >
                                    <Check size={12} strokeWidth={4} />
                                </motion.div>
                            )}

                            {stock < 5 && stock > 0 && (
                                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-bold bg-orange-100 text-orange-600 px-2 rounded-full whitespace-nowrap">
                                    Últimas {stock} uds
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>

            {anyOutOfStock && (
                <p className="text-xs text-center font-bold text-[--error] animate-pulse">
                    ⚠️ Algunas tallas no están disponibles por el momento
                </p>
            )}
        </div>
    )
}
