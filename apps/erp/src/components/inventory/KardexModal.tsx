"use client"

import { useState, useEffect } from "react"
import {
    History,
    ArrowUpCircle,
    ArrowDownCircle,
    X,
    Calendar,
    Hash,
    MoreHorizontal,
    Search
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface KardexModalProps {
    isOpen: boolean
    onClose: () => void
    item: any // Material o producto seleccionado
}

export default function KardexModal({ isOpen, onClose, item }: KardexModalProps) {
    const supabase = createClient()
    const [movements, setMovements] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (isOpen && item?.id) {
            fetchMovements()
        }
    }, [isOpen, item])

    const fetchMovements = async () => {
        setIsLoading(true)
        try {
            const { data, error } = await (supabase
                .from('kardex_movements')
                .select('*')
                .eq(item.tipo_item === 'MATERIAL' ? 'material_id' : 'product_size_id', item.item_id || item.id)
                .order('fecha', { ascending: false }) as any)

            if (error) throw error
            setMovements(data || [])
        } catch (error) {
            console.error("Error fetching kardex:", error)
        } finally {
            setIsLoading(false)
        }
    }

    if (!isOpen || !item) return null

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />

            <div className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-pink-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-pink-600/20">
                            <History size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Historial de <span className="text-pink-600">Kardex</span></h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.nombre} • {item.codigo}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="bg-slate-50 rounded-[2.5rem] border border-slate-100 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white border-b border-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                    <th className="px-8 py-5">Fecha / Hora</th>
                                    <th className="px-8 py-5">Movimiento</th>
                                    <th className="px-8 py-5">Referencia</th>
                                    <th className="px-8 py-5 text-right">Cant.</th>
                                    <th className="px-8 py-5 text-right">Saldo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 italic">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold">Cargando movimientos sincronizados...</td>
                                    </tr>
                                ) : movements.length > 0 ? (
                                    movements.map((m: any) => (
                                        <tr key={m.id} className="hover:bg-white/80 transition-all bg-white/40">
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-black text-slate-900">
                                                        {new Date(m.fecha).toLocaleDateString('es-PE')}
                                                    </span>
                                                    <span className="text-[9px] text-slate-400 font-bold tracking-tighter uppercase">
                                                        {new Date(m.fecha).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2">
                                                    {m.tipo_movimiento === 'ENTRADA' ? (
                                                        <ArrowUpCircle size={14} className="text-emerald-500" />
                                                    ) : (
                                                        <ArrowDownCircle size={14} className="text-rose-500" />
                                                    )}
                                                    <span className={cn(
                                                        "text-[10px] font-black uppercase tracking-widest",
                                                        m.tipo_movimiento === 'ENTRADA' ? "text-emerald-600" : "text-rose-600"
                                                    )}>
                                                        {m.tipo_movimiento}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">
                                                        {m.referencia_tipo === 'SERVICE_ORDER' ? 'ORDEN SERVICIO' :
                                                            m.referencia_tipo === 'PRODUCTION_ORDER' ? 'ORDEN PROD.' : 'AJUSTE'}
                                                    </span>
                                                    <span className="text-[9px] text-indigo-600 font-bold">#{m.referencia_numero || 'S/N'}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <span className={cn(
                                                    "text-sm font-black tracking-tight",
                                                    m.tipo_movimiento === 'ENTRADA' ? "text-emerald-600" : "text-rose-600"
                                                )}>
                                                    {m.tipo_movimiento === 'ENTRADA' ? '+' : '-'}{m.cantidad}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-sm font-black text-slate-900 tracking-tighter italic">{m.saldo_nuevo}</span>
                                                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">Anterior: {m.saldo_anterior}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-32 text-center">
                                            <div className="max-w-xs mx-auto space-y-3">
                                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                                                    <Search size={32} />
                                                </div>
                                                <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Sin movimientos registrados</p>
                                                <p className="text-[10px] text-slate-300 font-medium italic">No se encontraron entradas ni salidas para este item en el periodo actual.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
                    <button onClick={onClose} className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-pink-600 transition-all shadow-xl shadow-slate-900/10">
                        Cerrar Historial
                    </button>
                </div>
            </div>
        </div>
    )
}
