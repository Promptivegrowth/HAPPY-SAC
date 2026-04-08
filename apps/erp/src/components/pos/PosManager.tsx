'use client'
import { useState, useMemo } from 'react'
import {
    ShoppingCart,
    Search,
    Plus,
    Minus,
    Trash2,
    CreditCard,
    User,
    Store,
    LayoutGrid,
    List,
    Image as ImageIcon
} from "lucide-react"
import { cn } from "@/lib/utils"

interface PosManagerProps {
    initialProducts: any[]
}

export function PosManager({ initialProducts }: PosManagerProps) {
    const [cart, setCart] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    const filteredProducts = useMemo(() => {
        if (!searchQuery) return initialProducts
        return initialProducts.filter(p =>
            p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.codigo.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [initialProducts, searchQuery])

    const addToCart = (product: any, size: any) => {
        setCart(prev => {
            const existing = prev.find(item => item.product_id === product.id && item.size_id === size.id)
            if (existing) {
                return prev.map(item =>
                    (item.product_id === product.id && item.size_id === size.id)
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            }
            return [...prev, {
                id: Math.random().toString(36).substr(2, 9),
                product_id: product.id,
                size_id: size.id,
                nombre: product.nombre,
                codigo: product.codigo,
                talla: size.talla,
                precio: size.precio_venta || 0,
                imagen_url: product.imagen_url,
                quantity: 1
            }]
        })
    }

    const updateQuantity = (itemId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === itemId) {
                const newQty = Math.max(1, item.quantity + delta)
                return { ...item, quantity: newQty }
            }
            return item
        }))
    }

    const removeItem = (itemId: string) => {
        setCart(prev => prev.filter(item => item.id !== itemId))
    }

    const subtotal = cart.reduce((acc, item) => acc + (item.precio * item.quantity), 0)
    const igv = subtotal * 0.18
    const total = subtotal + igv

    return (
        <div className="flex h-[calc(100vh-8rem)] gap-6 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Panel Izquierdo: Catálogo de Productos */}
            <div className="flex-1 flex flex-col min-w-0 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar productos (Código, Nombre...)"
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all shadow-inner"
                        />
                    </div>
                    <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={cn("p-2 rounded-lg transition-all", viewMode === 'grid' ? "bg-white text-pink-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={cn("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-white text-pink-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}
                        >
                            <List size={18} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                    {filteredProducts.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                            <Store size={48} className="opacity-20" />
                            <p className="font-bold text-sm uppercase tracking-widest">No se encontraron productos</p>
                        </div>
                    ) : (
                        <div className={cn(
                            "grid gap-4",
                            viewMode === 'grid' ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
                        )}>
                            {filteredProducts.map((product) => (
                                <div key={product.id} className={cn(
                                    "group flex bg-white border border-slate-100 rounded-3xl transition-all hover:shadow-xl hover:shadow-pink-500/5 hover:border-pink-100",
                                    viewMode === 'grid' ? "flex-col p-4" : "p-3 gap-4"
                                )}>
                                    <div className={cn(
                                        "bg-slate-50 rounded-2xl overflow-hidden flex items-center justify-center text-slate-300 font-black transition-colors relative",
                                        viewMode === 'grid' ? "aspect-[3/4] mb-4 text-2xl" : "w-16 h-16 text-sm"
                                    )}>
                                        {product.imagen_url ? (
                                            <img
                                                src={product.imagen_url}
                                                alt={product.nombre}
                                                className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                                            />
                                        ) : (
                                            product.nombre.substring(0, 2).toUpperCase()
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                                        <div className="space-y-1 mb-4">
                                            <h3 className="text-sm font-bold text-slate-900 group-hover:text-pink-600 transition-colors truncate">
                                                {product.nombre}
                                            </h3>
                                            <p className="text-[10px] text-slate-400 font-mono italic">{product.codigo}</p>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {product.product_sizes?.map((size: any) => (
                                                <button
                                                    key={size.id}
                                                    onClick={() => addToCart(product, size)}
                                                    className="flex-1 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 hover:bg-pink-600 hover:text-white hover:border-pink-600 transition-all flex flex-col items-center gap-0.5 min-w-[60px]"
                                                >
                                                    <span>{size.talla}</span>
                                                    <span className="opacity-60 text-[8px]">S/ {size.precio_venta || 0}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Panel Derecho: Carrito y Pago */}
            <div className="w-96 flex flex-col gap-4">
                {/* Info Cliente */}
                <div className="bg-slate-900 rounded-3xl p-5 text-white shadow-xl shadow-slate-900/20">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <User size={16} className="text-pink-500" />
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Cliente</span>
                        </div>
                        <button className="text-[10px] font-black text-pink-500 hover:underline">CAMBIAR</button>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-pink-500 font-bold border border-white/10">
                            CG
                        </div>
                        <div>
                            <p className="text-sm font-black">Cliente Genérico</p>
                            <p className="text-[10px] text-slate-400">DNI: 00000000</p>
                        </div>
                    </div>
                </div>

                {/* Lista de Venta (Carrito) */}
                <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                    <div className="p-5 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                            <ShoppingCart size={16} className="text-pink-600" />
                            Pedido Actual
                        </h2>
                        <span className="bg-pink-100 text-pink-600 px-2.5 py-1 rounded-full text-[10px] font-black">
                            {cart.length} ITEMS
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4 opacity-50">
                                <ShoppingCart size={40} />
                                <p className="text-[10px] font-black uppercase tracking-widest">El carrito está vacío</p>
                            </div>
                        ) : (
                            cart.map((item) => (
                                <div key={item.id} className="flex gap-3 p-3 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-pink-100 transition-all group">
                                    <div className="w-12 h-12 bg-white rounded-xl overflow-hidden flex items-center justify-center text-xs font-bold text-slate-300 shadow-sm">
                                        {item.imagen_url ? (
                                            <img src={item.imagen_url} className="w-full h-full object-cover" />
                                        ) : (
                                            item.nombre.substring(0, 2).toUpperCase()
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <div className="min-w-0 text-[10px]">
                                                <p className="font-bold text-slate-900 truncate uppercase">{item.nombre}</p>
                                                <p className="text-slate-400 font-black tracking-widest uppercase">Talla: {item.talla}</p>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="text-slate-300 hover:text-red-500 transition-colors p-1"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm">
                                                <button
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                    className="p-1 hover:text-pink-600 transition-colors"
                                                >
                                                    <Minus size={12} />
                                                </button>
                                                <span className="text-xs font-black min-w-[20px] text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                    className="p-1 hover:text-pink-600 transition-colors"
                                                >
                                                    <Plus size={12} />
                                                </button>
                                            </div>
                                            <span className="text-sm font-black text-slate-900">S/ {(item.precio * item.quantity).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-6 bg-slate-50/50 border-t border-slate-100 space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-[11px] font-bold text-slate-500">
                                <span className="uppercase tracking-wider">Subtotal</span>
                                <span>S/ {subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-[11px] font-bold text-slate-500">
                                <span className="uppercase tracking-wider">IGV (18%)</span>
                                <span>S/ {igv.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                                <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Total a Pagar</span>
                                <span className="text-2xl font-black text-pink-600 tracking-tight">S/ {total.toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            disabled={cart.length === 0}
                            className={cn(
                                "w-full py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3 active:scale-95",
                                cart.length > 0
                                    ? "bg-pink-600 hover:bg-pink-700 text-white shadow-xl shadow-pink-600/20"
                                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                            )}
                        >
                            <CreditCard size={20} />
                            PROCESAR PAGO
                        </button>
                    </div>
                </div>

                {/* Estado de Caja */}
                <div className="bg-emerald-600 rounded-3xl p-4 text-white flex items-center justify-between shadow-lg shadow-emerald-600/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl">
                            <Store size={18} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Caja Abierta</p>
                            <p className="text-xs font-bold">Admin: Luisa M.</p>
                        </div>
                    </div>
                    <button className="text-[10px] font-black px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all uppercase">
                        CERRAR
                    </button>
                </div>
            </div>
        </div>
    )
}
