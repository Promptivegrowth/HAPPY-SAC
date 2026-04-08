"use client"

import { useState, useEffect } from "react"
import {
    Truck,
    Package,
    X,
    ClipboardList,
    User,
    Calendar,
    DollarSign,
    Info
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface OSDetailModalProps {
    isOpen: boolean
    onClose: () => void
    os: any
}

export default function OSDetailModal({ isOpen, onClose, os }: OSDetailModalProps) {
    const supabase = createClient()
    const [materials, setMaterials] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (isOpen && os?.id) {
            fetchMaterials()
        }
    }, [isOpen, os])

    const fetchMaterials = async () => {
        setIsLoading(true)
        try {
            const { data, error } = await (supabase
                .from('service_order_materials')
                .select(`
                    *,
                    insumo:materials(nombre, codigo, unidad:units_of_measure!left(simbolo)),
                    producto:products(nombre, codigo)
                `)
                .eq('os_id', os.id) as any)

            if (error) throw error
            setMaterials(data || [])
        } catch (error) {
            console.error("Error fetching OS materials:", error)
        } finally {
            setIsLoading(false)
        }
    }

    if (!isOpen || !os) return null

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />

            <div className="relative w-full max-w-3xl bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
                {/* Header */}
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                            {/* @ts-ignore */}
                            <ClipboardList size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Detalle de <span className="text-indigo-600">Orden de Servicio</span></h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">OS-{os.numero_os} • {os.tipo_servicio}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-slate-200 rounded-2xl text-slate-400 transition-colors">
                        {/* @ts-ignore */}
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    {/* Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="space-y-1">
                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1">
                                {/* @ts-ignore */}
                                <User size={10} /> Taller
                            </span>
                            <p className="text-xs font-black text-slate-900">{os.supplier?.nombre_comercial || os.supplier?.razon_social}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1">
                                {/* @ts-ignore */}
                                <Calendar size={10} /> Entrega
                            </span>
                            <p className="text-xs font-black text-slate-900">{new Date(os.fecha_entrega).toLocaleDateString('es-PE')}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1">
                                {/* @ts-ignore */}
                                <DollarSign size={10} /> Costo Pactado
                            </span>
                            <p className="text-xs font-black text-emerald-600">S/ {(parseFloat(os.total_costo) || 0).toFixed(2)}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1">
                                {/* @ts-ignore */}
                                <Info size={10} /> Estado
                            </span>
                            <span className={cn(
                                "inline-flex px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest",
                                os.estado === 'PENDIENTE' && "bg-amber-50 text-amber-600 border border-amber-100",
                                os.estado === 'RECIBIDO' && "bg-emerald-50 text-emerald-600 border border-emerald-100",
                                os.estado === 'CANCELADO' && "bg-rose-50 text-rose-600 border border-rose-100"
                            )}>
                                {os.estado}
                            </span>
                        </div>
                    </div>

                    {/* Materials Table */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-950 flex items-center gap-2">
                            {/* @ts-ignore */}
                            <Package size={18} className="text-indigo-600" />
                            Materiales y Avíos Entregados
                        </h3>

                        <div className="bg-slate-50 rounded-[2.5rem] border border-slate-100 overflow-hidden">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-white border-b border-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                        <th className="px-8 py-4">Insumo / Accesorio</th>
                                        <th className="px-8 py-4 text-right">Cantidad Entregada</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={2} className="px-8 py-10 text-center text-slate-400 italic text-xs">Cargando materiales...</td>
                                        </tr>
                                    ) : materials.length > 0 ? (
                                        materials.map((m: any) => {
                                            const itemInfo = m.insumo || m.producto;
                                            return (
                                                <tr key={m.id} className="hover:bg-white/80 transition-all">
                                                    <td className="px-8 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-black text-slate-900">{itemInfo?.nombre}</span>
                                                            <span className="text-[10px] text-slate-400 font-bold uppercase">{itemInfo?.codigo}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-4 text-right">
                                                        <span className="text-xs font-black text-indigo-600">{m.cantidad_entregada} {m.insumo?.unidad?.simbolo || 'UND'}</span>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={2} className="px-8 py-20 text-center">
                                                <p className="text-xs text-slate-400 font-bold italic">No hay registros de materiales para esta orden.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {os.instrucciones_adicionales && (
                        <div className="bg-amber-50/50 p-6 rounded-3xl border border-amber-100/50">
                            <span className="text-[9px] font-black uppercase text-amber-600 tracking-widest block mb-2">Instrucciones Especiales</span>
                            <p className="text-xs text-amber-800 font-medium leading-relaxed italic">"{os.instrucciones_adicionales}"</p>
                        </div>
                    )}
                </div>

                <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-end">
                    <button onClick={onClose} className="px-8 py-3 bg-slate-900 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-900/10">
                        Cerrar Detalle
                    </button>
                </div>
            </div>
        </div>
    )
}
