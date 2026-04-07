import { createClient } from "@/lib/supabase/server"
import {
    ShoppingCart,
    Search,
    Filter,
    Plus,
    FileText,
    CheckCircle2,
    Clock,
    CreditCard,
    ExternalLink,
    MoreVertical
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default async function SalesPage() {
    const supabase = createClient()

    const { data: sales } = await supabase
        .from('sales')
        .select(`
      *,
      customer:customers(nombre_completo, nro_doc)
    `)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Ventas y Facturación</h1>
                    <p className="text-slate-500 mt-1">Gestión de pedidos, boletas, facturas y flujo de caja.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all">
                        {/* @ts-ignore */}
                        <Filter size={18} />
                        Filtros
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-xl shadow-lg shadow-pink-600/10 transition-all">
                        {/* @ts-ignore */}
                        <Plus size={18} />
                        Nueva Venta
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3 mb-4">
                        {/* @ts-ignore */}
                        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><CreditCard size={20} /></div>
                        <span className="text-sm font-semibold text-slate-500">Total Hoy</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900">S/ 4,250.00</div>
                    <p className="text-[10px] text-emerald-600 font-bold mt-2">+15% vs ayer</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3 mb-4">
                        {/* @ts-ignore */}
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><FileText size={20} /></div>
                        <span className="text-sm font-semibold text-slate-500">Docs. Emitidos</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900">12</div>
                    <p className="text-[10px] text-slate-400 font-bold mt-2">8 Boletas / 4 Facturas</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3 mb-4">
                        {/* @ts-ignore */}
                        <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl"><Clock size={20} /></div>
                        <span className="text-sm font-semibold text-slate-500">Pendientes</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900">3</div>
                    <p className="text-[10px] text-amber-600 font-bold mt-2">Por entregar / cobrar</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3 mb-4">
                        {/* @ts-ignore */}
                        <div className="p-2.5 bg-pink-50 text-pink-600 rounded-xl"><ShoppingCart size={20} /></div>
                        <span className="text-sm font-semibold text-slate-500">Ticket Promedio</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900">S/ 354.10</div>
                    <p className="text-[10px] text-pink-600 font-bold mt-2">Mes de Abril</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                    <div className="relative max-w-sm w-full">
                        {/* @ts-ignore */}
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar por cliente o documento..."
                            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all shadow-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400 uppercase mr-2 tracking-widest">Ver:</span>
                        <button className="px-4 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 shadow-sm">Todos</button>
                        <button className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-900">Pendientes</button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-widest font-black">
                                <th className="px-6 py-5 border-b border-slate-100">Fecha / Doc</th>
                                <th className="px-6 py-5 border-b border-slate-100">Cliente</th>
                                <th className="px-6 py-5 border-b border-slate-100 text-right">Monto Total</th>
                                <th className="px-6 py-5 border-b border-slate-100">Pago</th>
                                <th className="px-6 py-5 border-b border-slate-100">Estado SUNAT</th>
                                <th className="px-6 py-5 border-b border-slate-100"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {sales?.map((sale: any) => (
                                <tr key={sale.id} className="hover:bg-slate-50/80 transition-all group">
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-[11px] text-slate-400 font-bold uppercase">{new Date(sale.fecha_emision).toLocaleDateString()}</span>
                                            <span className="text-sm font-black text-slate-900 tracking-tight">{sale.serie}-{sale.numero.toString().padStart(8, '0')}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-900">{sale.customer?.nombre_completo}</span>
                                            <span className="text-[10px] text-slate-400 font-mono italic">{sale.customer?.nro_doc}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <span className="text-base font-black text-slate-900">
                                            {sale.moneda} {sale.total.toFixed(2)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={cn(
                                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                                            sale.estado_pago === 'PAGADO' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                                        )}>
                                            {/* @ts-ignore */}
                                            {sale.estado_pago === 'PAGADO' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                            {sale.estado_pago}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={cn(
                                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                                            sale.sunat_estado === 'ACEPTADO' ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-500"
                                        )}>
                                            {sale.sunat_estado}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-2 text-slate-300 hover:text-pink-600 transition-colors" title="Ver PDF">
                                                {/* @ts-ignore */}
                                                <FileText size={18} />
                                            </button>
                                            <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                                                {/* @ts-ignore */}
                                                <MoreVertical size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {(!sales || sales.length === 0) && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 rounded-[2.5rem] bg-slate-50 flex items-center justify-center text-slate-200">
                                                {/* @ts-ignore */}
                                                <ShoppingCart size={40} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-slate-900 font-bold text-base">No hay ventas registradas</p>
                                                <p className="text-slate-400 text-xs italic font-medium">Comienza creando tu primera venta desde el botón superior.</p>
                                            </div>
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
