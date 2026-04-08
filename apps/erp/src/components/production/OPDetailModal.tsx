"use client"

import { useState, useEffect } from "react"
import {
    Package,
    X,
    ClipboardList,
    Clock,
    Calendar,
    Box,
    Info,
    Factory
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface OPDetailModalProps {
    isOpen: boolean
    onClose: () => void
    op: any
}

export default function OPDetailModal({ isOpen, onClose, op }: OPDetailModalProps) {
    const supabase = createClient()
    const [materials, setMaterials] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (isOpen && op?.id) {
            fetchMaterials()
        }
    }, [isOpen, op])

    const fetchMaterials = async () => {
        setIsLoading(true)
        try {
            const { data, error } = await supabase
                .from('production_order_materials')
                .select(`
                    *,
                    material:materials(nombre, codigo)
                `)
                .eq('order_id', op.id)

            if (error) throw error
            setMaterials(data || [])
        } catch (error) {
            console.error("Error fetching OP materials:", error)
        } finally {
            setIsLoading(false)
        }
    }

    if (!isOpen || !op) return null

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />

            <div className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
                {/* Header */}
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-pink-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-pink-600/20">
                            {/* @ts-ignore */}
                            <Factory size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Detalle <span className="text-pink-600">Producción</span></h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">OP-{op.numero_doc || op.id.slice(0, 8)} • {op.items?.[0]?.product?.nombre || 'Producto'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-slate-200 rounded-2xl text-slate-400 transition-colors">
                        {/* @ts-ignore */}
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
                    {/* Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="space-y-1">
                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1">
                                {/* @ts-ignore */}
                                <Clock size={10} /> Inicio Operativo
                            </span>
                            <p className="text-xs font-black text-slate-900">{op.hora_inicio || '08:00'} HRS</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1">
                                {/* @ts-ignore */}
                                <Calendar size={10} /> Entrega Est.
                            </span>
                            <p className="text-xs font-black text-slate-900">{new Date(op.fecha_entrega_est).toLocaleDateString('es-PE')}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1">
                                {/* @ts-ignore */}
                                <Box size={10} /> Total Prendas
                            </span>
                            <p className="text-xs font-black text-pink-600">{op.total_prendas} UND</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1">
                                {/* @ts-ignore */}
                                <Info size={10} /> Estado
                            </span>
                            <span className={cn(
                                "inline-flex px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest",
                                op.estado === 'PENDIENTE' && "bg-slate-50 text-slate-500 border border-slate-100",
                                op.estado === 'PROCESO' && "bg-blue-50 text-blue-600 border border-blue-100",
                                op.estado === 'COMPLETADO' && "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            )}>
                                {op.estado}
                            </span>
                        </div>
                    </div>

                    {/* Materials Table */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-950 flex items-center gap-2">
                            {/* @ts-ignore */}
                            <Package size={18} className="text-pink-600" />
                            Explosión de Materiales y Avíos
                        </h3>

                        <div className="bg-slate-50 rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-white border-b border-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                        <th className="px-8 py-4">Insumo / Descripción</th>
                                        <th className="px-8 py-4 text-right">Cant. Base</th>
                                        <th className="px-8 py-4 text-right">Merma</th>
                                        <th className="px-8 py-4 text-right">Total Requerido</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-10 text-center text-slate-400 italic text-xs font-medium">Cargando explosión...</td>
                                        </tr>
                                    ) : materials.length > 0 ? (
                                        materials.map((m: any) => (
                                            <tr key={m.id} className="hover:bg-white/80 transition-all">
                                                <td className="px-8 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-black text-slate-900">{m.material?.nombre}</span>
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase">{m.material?.codigo}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-4 text-right">
                                                    <span className="text-xs font-bold text-slate-500">{m.cantidad_base.toFixed(2)}</span>
                                                </td>
                                                <td className="px-8 py-4 text-right">
                                                    <span className="text-[10px] font-black text-rose-400">+{m.merma.toFixed(2)}</span>
                                                </td>
                                                <td className="px-8 py-4 text-right bg-slate-100/30">
                                                    <span className="text-xs font-black text-pink-600">{m.total.toFixed(2)} UND</span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-20 text-center">
                                                <p className="text-xs text-slate-400 font-bold italic">No se registró explosión de materiales para esta orden.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {op.observaciones && (
                        <div className="bg-slate-900 p-6 rounded-3xl text-white/90">
                            <span className="text-[9px] font-black uppercase text-pink-500 tracking-widest block mb-2">Observaciones de Planta</span>
                            <p className="text-xs font-medium leading-relaxed italic">"{op.observaciones}"</p>
                        </div>
                    )}
                </div>

                <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-end">
                    <button onClick={onClose} className="px-8 py-3 bg-slate-900 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-pink-600 transition-all shadow-xl shadow-slate-900/10">
                        Cerrar Monitor
                    </button>
                </div>
            </div>
        </div>
    )
}
