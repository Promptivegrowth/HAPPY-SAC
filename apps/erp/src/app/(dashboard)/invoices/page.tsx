import { createClient } from "@/lib/supabase/server"
import {
    FileText,
    Search,
    Plus,
    MoreVertical,
    CheckCircle2,
    Clock,
    AlertCircle,
    Download,
    ExternalLink
} from "lucide-react"
import { cn } from "@/lib/utils"

export default async function InvoicesPage() {
    const supabase = createClient()

    const { data: invoices } = await supabase
        .from('sales')
        .select(`
            *,
            customer:customers(nombre_completo, nro_doc)
        `)
        .order('fecha_emision', { ascending: false })

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Facturación Electrónica</h1>
                    <p className="text-slate-500 mt-1">Control de comprobantes (Boletas/Facturas) y estados SUNAT.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-xl shadow-lg shadow-pink-600/10 transition-all">
                        {/* @ts-ignore */}
                        <Plus size={18} />
                        Nueva Factura
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                    <div className="relative max-w-sm w-full">
                        {/* @ts-ignore */}
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar por serie o número..."
                            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-widest font-black">
                                <th className="px-6 py-5 border-b border-slate-100">Documento</th>
                                <th className="px-6 py-5 border-b border-slate-100">Cliente</th>
                                <th className="px-6 py-5 border-b border-slate-100 text-right">Monto Total</th>
                                <th className="px-6 py-5 border-b border-slate-100 text-center">Estado SUNAT</th>
                                <th className="px-6 py-5 border-b border-slate-100"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {invoices?.map((invoice: any) => (
                                <tr key={invoice.id} className="hover:bg-slate-50/80 transition-all group">
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase">{new Date(invoice.fecha_emision).toLocaleDateString()}</span>
                                            <span className="text-sm font-black text-slate-900 tracking-tight">{invoice.serie}-{invoice.numero.toString().padStart(8, '0')}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-900">{invoice.customer?.nombre_completo}</span>
                                            <span className="text-[10px] text-slate-400 font-mono italic">{invoice.customer?.nro_doc}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <span className="text-base font-black text-slate-900">
                                            {invoice.moneda} {invoice.total.toFixed(2)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className={cn(
                                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                                            invoice.sunat_estado === 'ACEPTADO' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                                        )}>
                                            {/* @ts-ignore */}
                                            {invoice.sunat_estado === 'ACEPTADO' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                            {invoice.sunat_estado}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-2 text-slate-300 hover:text-pink-600 transition-colors" title="Descargar XML/PDF">
                                                {/* @ts-ignore */}
                                                <Download size={18} />
                                            </button>
                                            <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                                                {/* @ts-ignore */}
                                                <MoreVertical size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {(!invoices || invoices.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 rounded-[2.5rem] bg-slate-50 flex items-center justify-center text-slate-200">
                                                {/* @ts-ignore */}
                                                <FileText size={40} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-slate-900 font-bold text-base">No hay facturas emitidas</p>
                                                <p className="text-slate-400 text-xs italic font-medium">Las ventas generadas aparecerán aquí para su facturación.</p>
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
