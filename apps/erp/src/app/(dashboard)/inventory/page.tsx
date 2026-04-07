import { createClient } from "@/lib/supabase/server"
import { Search, Filter, Plus, Package, Factory, Shapes } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface InventoryPageProps {
    searchParams: {
        tab?: string
    }
}

export default async function InventoryPage({ searchParams }: InventoryPageProps) {
    const activeTab = searchParams.tab || "materials"
    const supabase = createClient()

    // Consultamos la vista de stock actual
    const { data: stock } = await supabase
        .from('v_stock_actual')
        .select('*')
        .order('nombre', { ascending: true })

    // Filtramos según el tab activo
    const filteredData = stock?.filter(item => {
        if (activeTab === "materials") return item.tipo_item === "MATERIAL"
        if (activeTab === "products") return item.tipo_item === "PRODUCTO"
        return true
    })

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Inventario</h1>
                    <p className="text-slate-500 mt-1">Gestión de telas, insumos y productos terminados de HAPPY S.A.C.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all">
                        <Filter size={18} />
                        Filtros
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-lg shadow-slate-900/10 transition-all">
                        <Plus size={18} />
                        Nuevo Item
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl w-fit">
                <Link
                    href="/inventory?tab=materials"
                    className={cn(
                        "px-6 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2",
                        activeTab === "materials" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                    )}
                >
                    <Shapes size={16} />
                    Materiales e Insumos
                </Link>
                <Link
                    href="/inventory?tab=products"
                    className={cn(
                        "px-6 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2",
                        activeTab === "products" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                    )}
                >
                    <Package size={16} />
                    Productos Terminados
                </Link>
                <Link
                    href="/inventory?tab=kardex"
                    className={cn(
                        "px-6 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2",
                        activeTab === "kardex" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                    )}
                >
                    <Factory size={16} />
                    Kardex Total
                </Link>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar por código o nombre..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider font-black">
                                <th className="px-6 py-5 border-b border-slate-100">Código</th>
                                <th className="px-6 py-5 border-b border-slate-100">Nombre</th>
                                <th className="px-6 py-5 border-b border-slate-100">Clasificación</th>
                                {activeTab === "products" && <th className="px-6 py-5 border-b border-slate-100">Talla</th>}
                                <th className="px-6 py-5 border-b border-slate-100">Almacén</th>
                                <th className="px-6 py-5 border-b border-slate-100 text-right">Stock</th>
                                <th className="px-6 py-5 border-b border-slate-100">Unidad</th>
                                <th className="px-6 py-5 border-b border-slate-100">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredData?.map((item: any) => (
                                <tr key={`${item.codigo}-${item.almacen}-${item.talla || ''}`} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4 text-[13px] font-mono text-slate-400 font-medium">{item.codigo}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-900 leading-none">{item.nombre}</span>
                                            {activeTab === "products" && <span className="text-[11px] text-slate-400 mt-1 uppercase font-medium">Temporada 2024</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold uppercase transition-colors group-hover:bg-blue-50 group-hover:text-blue-600">
                                            {item.clasificacion}
                                        </span>
                                    </td>
                                    {activeTab === "products" && (
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-pink-50 text-pink-600 text-xs font-black border border-pink-100">
                                                {item.talla}
                                            </span>
                                        </td>
                                    )}
                                    <td className="px-6 py-4 text-xs text-slate-500 font-medium italic">{item.almacen}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={cn(
                                            "text-base font-black tracking-tight",
                                            item.stock <= 5 ? "text-rose-600" : "text-slate-900"
                                        )}>
                                            {item.stock}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-400 font-bold">{item.unidad}</td>
                                    <td className="px-6 py-4">
                                        {item.stock > 10 ? (
                                            <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold text-[11px]">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                Suficiente
                                            </span>
                                        ) : item.stock > 0 ? (
                                            <span className="inline-flex items-center gap-1.5 text-amber-600 font-bold text-[11px]">
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                Reordenar
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 text-rose-600 font-bold text-[11px]">
                                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                                Agotado
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {(!filteredData || filteredData.length === 0) && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300">
                                                <Package size={32} />
                                            </div>
                                            <p className="text-slate-400 text-sm italic font-medium">
                                                No se encontraron resultados para la categoría seleccionada.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs text-slate-400 font-semibold tracking-wide">TOTAL: {filteredData?.length || 0} REGISTROS</p>
                    <div className="flex gap-2">
                        <button disabled className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-400 opacity-50 cursor-not-allowed transition-all">Anterior</button>
                        <button disabled className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-400 opacity-50 cursor-not-allowed transition-all">Siguiente</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
