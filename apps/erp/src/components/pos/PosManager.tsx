'use client'
import { useState, useMemo, useEffect } from 'react'
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
    Image as ImageIcon,
    PlusCircle,
    CheckCircle2,
    AlertTriangle,
    Navigation,
    Lock
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { CashShiftUI } from "./CashShiftUI"
import { ClientFormModal } from "./ClientFormModal"
import { PaymentModal } from "./PaymentModal"
import { processSale } from "@/app/(dashboard)/pos/actions"

interface PosManagerProps {
    initialProducts: any[]
}

export function PosManager({ initialProducts }: PosManagerProps) {
    // UI State
    const [cart, setCart] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    // Domain State
    const [currentShift, setCurrentShift] = useState<any>(null)
    const [selectedClient, setSelectedClient] = useState<any>({
        id: null,
        nombre_completo: 'Cliente Genérico',
        nro_doc: '00000000'
    })

    // Modal State
    const [isClientModalOpen, setIsClientModalOpen] = useState(false)
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
    const [processing, setProcessing] = useState(false)

    // Client Search State
    const [clientSearch, setClientSearch] = useState('')
    const [foundClients, setFoundClients] = useState<any[]>([])
    const [showClientResults, setShowClientResults] = useState(false)

    const filteredProducts = useMemo(() => {
        if (!searchQuery) return initialProducts
        return initialProducts.filter(p =>
            p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.codigo.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [initialProducts, searchQuery])

    const addToCart = (product: any, size: any) => {
        // Validar stock antes de añadir
        if (size.stock <= 0) {
            alert("Producto sin stock")
            return
        }

        setCart(prev => {
            const existing = prev.find(item => item.product_id === product.id && item.size_id === size.id)
            if (existing) {
                // Validar que no exceda el stock disponible
                if (existing.quantity >= size.stock) {
                    alert("No hay más stock disponible de esta talla")
                    return prev
                }
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
                quantity: 1,
                max_stock: size.stock
            }]
        })
    }

    const updateQuantity = (itemId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === itemId) {
                const newQty = Math.max(1, item.quantity + delta)
                if (newQty > item.max_stock) {
                    alert("Stock insuficiente")
                    return item
                }
                return { ...item, quantity: newQty }
            }
            return item
        }))
    }

    const removeItem = (itemId: string) => {
        setCart(prev => prev.filter(item => item.id !== itemId))
    }

    const handleClientSearch = async (val: string) => {
        setClientSearch(val)
        if (val.length < 3) {
            setFoundClients([])
            setShowClientResults(false)
            return
        }

        const supabase = createClient()
        const { data } = await supabase
            .from('customers')
            .select('*')
            .or(`nombre_completo.ilike.%${val}%,nro_doc.ilike.%${val}%`)
            .limit(5)

        setFoundClients(data || [])
        setShowClientResults(true)
    }

    const handleConfirmPayment = async (method: any, paymentData: any) => {
        if (!currentShift) return
        setProcessing(true)

        const res = await processSale({
            customerId: selectedClient.id,
            shiftId: currentShift.id,
            items: cart.map(item => ({
                productId: item.product_id,
                sizeId: item.size_id,
                quantity: item.quantity,
                price: item.precio,
                subtotal: item.precio * item.quantity
            })),
            paymentMethod: method,
            total,
            igv
        })

        if (res.success) {
            setCart([])
            setIsPaymentModalOpen(false)
            // Opcional: Mostrar ticket o éxito
            alert("Venta procesada con éxito")
        } else {
            alert("Error al procesar venta: " + res.error)
        }
        setProcessing(false)
    }

    const subtotal = cart.reduce((acc, item) => acc + (item.precio * item.quantity), 0)
    const igv = subtotal * 0.18
    const total = subtotal + igv

    // Bloqueo de POS si no hay caja abierta
    const isShiftClosed = !currentShift

    return (
        <div className="relative flex h-[calc(100vh-8rem)] gap-6 overflow-hidden p-6 bg-slate-50/30">
            {/* Shift Guard Overlay */}
            {isShiftClosed && (
                <div className="absolute inset-0 z-[60] bg-white/40 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-500 rounded-[3rem]">
                    <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 flex flex-col items-center text-center max-w-md">
                        <div className="w-20 h-20 bg-slate-900 text-white rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl animate-bounce">
                            <LockIcon size={32} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-2">Punto de Venta Bloqueado</h2>
                        <p className="text-slate-400 font-medium mb-8">Debes iniciar un turno de caja para poder procesar ventas y gestionar el inventario.</p>
                        <div className="w-full h-1 bg-slate-100 rounded-full mb-8 relative overflow-hidden">
                            <div className="absolute inset-0 bg-pink-500 animate-[shimmer_2s_infinite] w-1/2" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-500">Usa el botón inferior para abrir caja</p>
                    </div>
                </div>
            )}

            {/* Panel Izquierdo: Catálogo de Productos */}
            <div className="flex-1 flex flex-col min-w-0 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                    <div className="relative flex-1">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar productos (Código, Nombre...)"
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all shadow-inner placeholder:text-slate-300"
                        />
                    </div>
                    <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={cn("p-2 rounded-lg transition-all", viewMode === 'grid' ? "bg-white text-pink-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}
                        >
                            <LayoutGridIcon size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={cn("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-white text-pink-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}
                        >
                            <ListIcon size={18} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide bg-slate-50/30">
                    {filteredProducts.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4">
                            <StoreIcon size={48} className="opacity-10" />
                            <p className="font-black text-[10px] uppercase tracking-widest opacity-40">No se encontraron productos</p>
                        </div>
                    ) : (
                        <div className={cn(
                            "grid gap-6",
                            viewMode === 'grid' ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
                        )}>
                            {filteredProducts.map((product) => (
                                <div key={product.id} className={cn(
                                    "group flex bg-white border border-slate-100 rounded-[2.5rem] transition-all hover:shadow-2xl hover:shadow-pink-500/10 hover:border-pink-200 overflow-hidden relative",
                                    viewMode === 'grid' ? "flex-col p-4 pb-6" : "p-4 gap-6"
                                )}>
                                    {/* Stock Badge Overlay */}
                                    <div className="absolute top-4 right-4 z-10">
                                        <div className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full shadow-sm border border-slate-100 flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[10px] font-black text-slate-900 tracking-wider">ENTREGA INMEDIATA</span>
                                        </div>
                                    </div>

                                    <div className={cn(
                                        "bg-slate-50 rounded-[2rem] overflow-hidden flex items-center justify-center text-slate-200 font-black transition-all relative group-hover:bg-slate-100",
                                        viewMode === 'grid' ? "aspect-[3/4] mb-5 text-4xl" : "w-32 h-32 text-xl"
                                    )}>
                                        {product.imagen_url ? (
                                            <img
                                                src={product.imagen_url}
                                                alt={product.nombre}
                                                className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700"
                                            />
                                        ) : (
                                            product.nombre.substring(0, 2).toUpperCase()
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col">
                                        <div className="space-y-1 mb-5">
                                            <h3 className="text-sm font-black text-slate-900 group-hover:text-pink-600 transition-colors truncate tracking-tight">
                                                {product.nombre}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-slate-400 font-mono italic opacity-60 tracking-widest">{product.codigo}</span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mt-auto">
                                            {product.product_sizes?.map((size: any) => (
                                                <button
                                                    key={size.id}
                                                    onClick={() => addToCart(product, size)}
                                                    disabled={size.stock <= 0}
                                                    className={cn(
                                                        "px-3 py-2 border rounded-2xl text-[10px] font-black transition-all flex flex-col items-center gap-0.5 relative group/btn overflow-hidden",
                                                        size.stock > 0
                                                            ? "bg-slate-50 border-slate-100 text-slate-600 hover:bg-pink-600 hover:text-white hover:border-pink-600 shadow-sm"
                                                            : "bg-slate-100 border-transparent text-slate-300 pointer-events-none"
                                                    )}
                                                >
                                                    <span className="relative z-10">{size.talla}</span>
                                                    <span className="opacity-60 text-[8px] relative z-10">S/ {size.precio_venta || 0}</span>
                                                    {size.stock > 0 && (
                                                        <span className="absolute bottom-1 right-1 text-[7px] opacity-40 group-hover/btn:opacity-100 font-mono">
                                                            {size.stock}
                                                        </span>
                                                    )}
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
            <div className="w-[400px] flex flex-col gap-6">
                {/* Info Cliente Profesional */}
                <div className="bg-slate-900 rounded-[2.5rem] p-6 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 blur-[60px] rounded-full pointer-events-none" />
                    <div className="flex items-center justify-between mb-6 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-white/10 rounded-xl border border-white/10">
                                <UserIcon size={18} className="text-pink-500" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Expediente Cliente</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsClientModalOpen(true)}
                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-pink-500 hover:rotate-90 transition-all flex items-center justify-center border border-white/10"
                            >
                                <PlusIcon size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="relative z-10 bg-white/5 rounded-[1.5rem] p-4 border border-white/5 mb-4 group-hover:bg-white/10 transition-colors">
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Buscar por DNI, RUC o Nombre..."
                                value={clientSearch}
                                onChange={(e) => handleClientSearch(e.target.value)}
                                onFocus={() => setShowClientResults(true)}
                                className="w-full bg-transparent border-none pl-10 pr-4 py-2 text-xs font-bold focus:ring-0 outline-none text-white placeholder:text-slate-600"
                            />
                            {/* Resultados búsqueda clientes */}
                            {showClientResults && foundClients.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
                                    {foundClients.map(c => (
                                        <button
                                            key={c.id}
                                            onClick={() => {
                                                setSelectedClient(c)
                                                setShowClientResults(false)
                                                setClientSearch('')
                                            }}
                                            className="w-full px-4 py-3 hover:bg-pink-500 text-left transition-colors border-b border-white/5 last:border-none flex items-center justify-between group/c"
                                        >
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold truncate">{c.nombre_completo}</p>
                                                <p className="text-[9px] text-slate-500 group-hover/c:text-white/70">{c.tipo_doc}: {c.nro_doc}</p>
                                            </div>
                                            <CheckCircle2Icon size={14} className="opacity-0 group-hover/c:opacity-100 text-white" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-500 flex items-center justify-center text-white font-black text-xl shadow-lg border border-white/20">
                            {selectedClient.nombre_completo.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-base font-black truncate tracking-tight">{selectedClient.nombre_completo}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="px-1.5 py-0.5 bg-white/10 rounded text-[9px] font-black text-pink-400">TIPO: {selectedClient.tipo_doc || 'VAR'}</span>
                                <span className="text-[10px] text-slate-500 font-mono tracking-tighter">DOC: {selectedClient.nro_doc}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lista de Venta (Carrito) */}
                <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden relative group/cart">
                    <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-8 bg-pink-500 rounded-full" />
                            <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                                Lista de Compra
                            </h2>
                        </div>
                        <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-lg shadow-slate-200">
                            {cart.length} ITEMS
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-200 gap-6 opacity-30 mt-[-2rem]">
                                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center border-2 border-dashed border-slate-200">
                                    <ShoppingCartIcon size={40} />
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Carrito Desierto</p>
                                    <p className="text-[9px] font-medium text-slate-300 mt-1">Selecciona productos para empezar</p>
                                </div>
                            </div>
                        ) : (
                            cart.map((item) => (
                                <div key={item.id} className="flex gap-4 p-4 bg-white rounded-[2rem] border border-slate-100 hover:border-pink-200 transition-all group/item shadow-sm hover:shadow-xl hover:shadow-pink-500/5 relative overflow-hidden">
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl overflow-hidden flex items-center justify-center text-xs font-black text-slate-300 shadow-inner group-hover/item:rotate-3 transition-transform">
                                        {item.imagen_url ? (
                                            <img src={item.imagen_url} className="w-full h-full object-cover" />
                                        ) : (
                                            item.nombre.substring(0, 2).toUpperCase()
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <div className="min-w-0">
                                                <p className="text-xs font-black text-slate-900 truncate leading-tight uppercase">{item.nombre}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[9px] font-black text-pink-600 bg-pink-50 px-1.5 py-0.5 rounded">T:{item.talla}</span>
                                                    <span className="text-[9px] text-slate-300 font-mono tracking-tighter">{item.codigo}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="w-8 h-8 rounded-full bg-slate-50 text-slate-300 hover:bg-rose-50 hover:text-rose-600 transition-all flex items-center justify-center group-hover/item:scale-110"
                                            >
                                                <Trash2Icon size={14} />
                                            </button>
                                        </div>
                                        <div className="flex justify-between items-center mt-3">
                                            <div className="flex items-center gap-4 bg-slate-50 rounded-full p-1 border border-slate-100 px-3">
                                                <button
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                    className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white hover:text-pink-600 transition-all text-slate-400"
                                                >
                                                    <MinusIcon size={12} />
                                                </button>
                                                <span className="text-xs font-black min-w-[20px] text-center text-slate-600">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                    className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white hover:text-pink-600 transition-all text-slate-400"
                                                >
                                                    <PlusIcon size={12} />
                                                </button>
                                            </div>
                                            <span className="text-sm font-black text-slate-900 tracking-tighter">S/ {(item.precio * item.quantity).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-8 bg-slate-50/50 border-t border-slate-100 space-y-6">
                        <div className="space-y-3">
                            <div className="flex justify-between text-[11px] font-black text-slate-400">
                                <span className="uppercase tracking-[0.2em]">Subtotal Bruto</span>
                                <span className="text-slate-900 leading-none">S/ {subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-[11px] font-black text-slate-400">
                                <span className="uppercase tracking-[0.2em]">IGV Calculado (18%)</span>
                                <span className="text-slate-900 leading-none">S/ {igv.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-end pt-5 border-t border-slate-200 mt-2">
                                <div className="space-y-1">
                                    <span className="text-[9px] font-bold text-pink-500 uppercase tracking-[0.3em] block">Importe Total</span>
                                    <span className="text-4xl font-black text-slate-900 tracking-tighter leading-none">S/ {total.toFixed(2)}</span>
                                </div>
                                <div className="px-3 py-1.5 bg-slate-900 rounded-xl flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                    <span className="text-[8px] font-black text-white uppercase tracking-widest">Sincronizado</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsPaymentModalOpen(true)}
                            disabled={cart.length === 0 || isShiftClosed}
                            className={cn(
                                "relative w-full py-6 rounded-[2rem] font-black text-sm transition-all flex items-center justify-center gap-4 overflow-hidden group/pay active:scale-95 shadow-2xl",
                                cart.length > 0 && !isShiftClosed
                                    ? "bg-slate-900 hover:bg-indigo-950 text-white shadow-slate-200"
                                    : "bg-slate-100 text-slate-300 cursor-not-allowed shadow-none"
                            )}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-indigo-600 opacity-0 group-hover/pay:opacity-100 transition-opacity" />
                            <CreditCardIcon size={22} className="relative z-10 group-hover/pay:rotate-12 transition-transform" />
                            <span className="relative z-10 tracking-[0.2em]">PROCESAR PAGO</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Floating Modals & Controllers */}
            <CashShiftUI onShiftChange={setCurrentShift} />

            <ClientFormModal
                isOpen={isClientModalOpen}
                onClose={() => setIsClientModalOpen(false)}
                onSave={setSelectedClient}
            />

            <PaymentModal
                isOpen={isPaymentModalOpen}
                total={total}
                onClose={() => setIsPaymentModalOpen(false)}
                onConfirm={handleConfirmPayment}
            />

            {/* Processing Overlay */}
            {processing && (
                <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-md flex flex-col items-center justify-center text-white gap-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full border-4 border-white/10 border-t-pink-500 animate-spin" />
                        <ShoppingCartIcon className="absolute inset-0 m-auto w-8 h-8 text-white animate-pulse" />
                    </div>
                    <div className="text-center">
                        <p className="text-xl font-black uppercase tracking-widest">Emitiendo Comprobante</p>
                        <p className="text-sm text-white/50 font-medium mt-1">Sincronizando con base de datos e inventario...</p>
                    </div>
                </div>
            )}
        </div>
    )
}

// Icon Wrapper locally if needed
const LockIcon = Lock as any
const ShoppingCartIcon = ShoppingCart as any
const SearchIcon = Search as any
const LayoutGridIcon = LayoutGrid as any
const ListIcon = List as any
const StoreIcon = Store as any
const UserIcon = User as any
const Trash2Icon = Trash2 as any
const PlusIcon = Plus as any
const MinusIcon = Minus as any
const CreditCardIcon = CreditCard as any
const CheckCircle2Icon = CheckCircle2 as any
