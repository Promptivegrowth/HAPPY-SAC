import { createClient } from "@/lib/supabase/server"
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
    Calculator
} from "lucide-react"
import { cn } from "@/lib/utils"

export default async function PosPage() {
    const supabase = createClient()

    // Obtener productos con sus tallas y precios
    const { data: products } = await supabase
        .from('products')
        .select(`
            id,
            nombre,
            codigo,
            product_sizes (
                id,
                talla,
                precio_venta
            )
        `)
        .order('nombre', { ascending: true })

    return (
        <div className="flex h-[calc(100vh-8rem)] gap-6 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Panel Izquierdo: Catálogo de Productos */}
            <div className="flex-1 flex flex-col min-w-0 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4">
                    <div className="relative flex-1">
                        {/* @ts-ignore */}
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar productos (Código, Nombre...)"
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all shadow-inner"
                        />
                    </div>
                    <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl">
                        <button className="p-2 bg-white text-pink-600 rounded-lg shadow-sm">
                            {/* @ts-ignore */}
                            <LayoutGrid size={18} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-slate-600">
                            {/* @ts-ignore */}
                            <List size={18} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                        {products?.map((product: any) => (
                            <div key={product.id} className="group flex flex-col bg-white border border-slate-100 rounded-3xl p-4 transition-all hover:shadow-xl hover:shadow-pink-500/5 hover:border-pink-100 cursor-pointer">
                                <div className="aspect-square bg-slate-50 rounded-2xl mb-4 flex items-center justify-center text-slate-300 font-black text-2xl group-hover:bg-pink-50 group-hover:text-pink-200 transition-colors">
                                    {product.nombre.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="space-y-1 mb-4 flex-1">
                                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-pink-600 transition-colors truncate">{product.nombre}</h3>
                                    <p className="text-[10px] text-slate-400 font-mono italic">{product.codigo}</p>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {product.product_sizes?.map((size: any) => (
                                        <button
                                            key={size.id}
                                            className="flex-1 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 hover:bg-pink-600 hover:text-white hover:border-pink-600 transition-all"
                                        >
                                            {size.talla} (S/ {size.precio_venta || 0})
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Panel Derecho: Carrito y Pago */}
            <div className="w-96 flex flex-col gap-4">
                {/* Info Cliente */}
                <div className="bg-slate-900 rounded-3xl p-5 text-white shadow-xl shadow-slate-900/20">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            {/* @ts-ignore */}
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
                            {/* @ts-ignore */}
                            <ShoppingCart size={16} className="text-pink-600" />
                            Pedido Actual
                        </h2>
                        <span className="bg-pink-100 text-pink-600 px-2.5 py-1 rounded-full text-[10px] font-black">3 ITEMS</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                        {/* Mock de Items en Carrito */}
                        {[1, 2].map((i) => (
                            <div key={i} className="flex gap-3 p-3 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-pink-100 transition-all">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-xs font-bold text-slate-300">
                                    SP
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-slate-900 truncate">Spiderman Kid</p>
                                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Talla: 8</p>
                                        </div>
                                        <button className="text-slate-300 hover:text-red-500 transition-colors">
                                            {/* @ts-ignore */}
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-0.5">
                                            <button className="p-1 hover:text-pink-600 transition-colors">
                                                {/* @ts-ignore */}
                                                <Minus size={12} />
                                            </button>
                                            <span className="text-xs font-black min-w-[20px] text-center">1</span>
                                            <button className="p-1 hover:text-pink-600 transition-colors">
                                                {/* @ts-ignore */}
                                                <Plus size={12} />
                                            </button>
                                        </div>
                                        <span className="text-sm font-black text-slate-900">S/ 45.00</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-6 bg-slate-50/50 border-t border-slate-100 space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-medium text-slate-500">
                                <span>Subtotal</span>
                                <span>S/ 90.00</span>
                            </div>
                            <div className="flex justify-between text-xs font-medium text-slate-500">
                                <span>IGV (18%)</span>
                                <span>S/ 16.20</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                                <span className="text-sm font-black text-slate-900 uppercase">Total</span>
                                <span className="text-2xl font-black text-pink-600 tracking-tight">S/ 106.20</span>
                            </div>
                        </div>

                        <button className="w-full py-4 bg-pink-600 hover:bg-pink-700 text-white rounded-2xl font-black text-sm shadow-xl shadow-pink-600/20 transition-all flex items-center justify-center gap-3 active:scale-95">
                            {/* @ts-ignore */}
                            <CreditCard size={20} />
                            PROCESAR PAGO
                        </button>
                    </div>
                </div>

                {/* Estado de Caja */}
                <div className="bg-emerald-600 rounded-3xl p-4 text-white flex items-center justify-between shadow-lg shadow-emerald-600/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl">
                            {/* @ts-ignore */}
                            <Store size={18} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Caja Abierta</p>
                            <p className="text-xs font-bold">Admin: Luisa M.</p>
                        </div>
                    </div>
                    <button className="text-[10px] font-black px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all">
                        CERRAR CAJA
                    </button>
                </div>
            </div>
        </div>
    )
}
