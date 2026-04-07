import { createClient } from "@/lib/supabase/server"
import {
    Factory,
    Search,
    Filter,
    Plus,
    Clock,
    CheckCircle2,
    AlertTriangle,
    ChevronRight
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default async function ProductionPage() {
    const supabase = createClient()

    const { data: orders } = await supabase
        .from('production_orders')
        .select(`
      *,
      product:products(nombre, codigo)
    `)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Producción</h1>
                    <p className="text-slate-500 mt-1">Órdenes de producción y seguimiento de talleres.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-lg shadow-slate-900/10 transition-all">
                        <Plus size={18} />
                        Nueva OP
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-500">OPs Activas</span>
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Clock size={16} /></div>
                    </div>
                    <div className="text-2xl font-black text-slate-900">{orders?.filter(o => o.estado === 'PROCESO').length || 0}</div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-500">Por Iniciar</span>
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Factory size={16} /></div>
                    </div>
                    <div className="text-2xl font-black text-slate-900">{orders?.filter(o => o.estado === 'PENDIENTE').length || 0}</div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-500">Terminadas (Mes)</span>
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle2 size={16} /></div>
                    </div>
                    <div className="text-2xl font-black text-slate-900">{orders?.filter(o => o.estado === 'COMPLETADO').length || 0}</div>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Órdenes de Producción</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar OP..."
                            className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-500 text-[10px] uppercase tracking-widest font-black">
                                <th className="px-6 py-5 border-b border-slate-100">Nro OP</th>
                                <th className="px-6 py-5 border-b border-slate-100">Producto</th>
                                <th className="px-6 py-5 border-b border-slate-100">Cant. Solicitada</th>
                                <th className="px-6 py-5 border-b border-slate-100">Progreso</th>
                                <th className="px-6 py-5 border-b border-slate-100">Fecha Entrega</th>
                                <th className="px-6 py-5 border-b border-slate-100">Estado</th>
                                <th className="px-6 py-5 border-b border-slate-100"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {orders?.map((order: any) => {
                                const progress = order.cantidad_solicitada > 0
                                    ? Math.round((order.cantidad_terminada / order.cantidad_solicitada) * 100)
                                    : 0

                                return (
                                    <tr key={order.id} className="hover:bg-slate-50/80 transition-all group">
                                        <td className="px-6 py-5 text-sm font-bold text-slate-900 tracking-tight">#{order.numero_op}</td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900 whitespace-nowrap">{order.product?.nombre}</span>
                                                <span className="text-[10px] text-slate-400 font-mono">{order.product?.codigo}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-sm font-black text-slate-700">{order.cantidad_solicitada}</td>
                                        <td className="px-6 py-5 min-w-[150px]">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn(
                                                            "h-full transition-all duration-1000",
                                                            progress === 100 ? "bg-emerald-500" : "bg-pink-500"
                                                        )}
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-black text-slate-500">{progress}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-xs text-slate-500 font-medium">
                                            {new Date(order.fecha_entrega).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={cn(
                                                "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                                                order.estado === 'PENDIENTE' && "bg-slate-100 text-slate-500",
                                                order.estado === 'PROCESO' && "bg-blue-50 text-blue-600",
                                                order.estado === 'COMPLETADO' && "bg-emerald-50 text-emerald-600",
                                                order.estado === 'CANCELADO' && "bg-rose-50 text-rose-600"
                                            )}>
                                                {order.estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                                                <ChevronRight size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                            {(!orders || orders.length === 0) && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-300">
                                                <Factory size={32} />
                                            </div>
                                            <p className="text-slate-400 text-sm font-medium italic">No hay órdenes de producción registradas.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
