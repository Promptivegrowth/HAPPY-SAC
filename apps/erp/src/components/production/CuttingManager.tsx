"use client"

import { useState, useEffect } from "react"
import {
    Box,
    Scissors,
    ArrowRight,
    AlertTriangle,
    CheckCircle2,
    Scale,
    Trash2,
    Save
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function CuttingManager() {
    const supabase = createClient()
    const [pendingOrders, setPendingOrders] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState<any>(null)
    const [cuttingData, setCuttingData] = useState<any[]>([])

    useEffect(() => {
        fetchPendingOrders()
    }, [])

    const fetchPendingOrders = async () => {
        setIsLoading(true)
        try {
            const { data, error } = await supabase
                .from('production_orders')
                .select(`
                    *,
                    items:production_order_items (
                        id,
                        product:products (id, nombre, codigo)
                    ),
                    materials:production_order_materials (
                        id,
                        material_id,
                        total,
                        material:materials (id, nombre, codigo)
                    )
                `)
                .eq('estado', 'PENDIENTE')
                .order('created_at', { ascending: true })

            if (error) throw error
            setPendingOrders(data || [])
        } catch (err) {
            console.error(err)
            toast.error("Error al cargar órdenes para corte")
        } finally {
            setIsLoading(false)
        }
    }

    const handleSelectOrder = (order: any) => {
        setSelectedOrder(order)
        // Inicializar datos de corte con los materiales de la explosión
        const initialUsage = (order.materials || []).map((m: any) => ({
            material_id: m.material_id,
            nombre: m.material?.nombre,
            codigo: m.material?.codigo,
            cantidad_teorica: m.total,
            cantidad_real: m.total, // Por defecto asumimos el teórico
            merma_real: 0
        }))
        setCuttingData(initialUsage)
    }

    const handleSaveCutting = async () => {
        if (!selectedOrder) return

        try {
            const { data: company } = await supabase.from('companies').select('id').single()

            // 1. Guardar logs de corte
            const logs = cuttingData.map(d => ({
                order_id: selectedOrder.id,
                material_id: d.material_id,
                cantidad_teorica: d.cantidad_teorica,
                cantidad_real: d.cantidad_real,
                merma_real: d.merma_real,
                responsable: 'Taller de Corte',
                company_id: (company as any)?.id
            }))

            const { error: logError } = await supabase.from('cutting_logs').insert(logs)
            if (logError) throw logError

            // 2. Actualizar estado de la OP a 'PROCESO'
            const { error: opError } = await supabase
                .from('production_orders')
                .update({ estado: 'PROCESO' })
                .eq('id', selectedOrder.id)

            if (opError) throw opError

            toast.success("Corte registrado y OP movida a PROCESO")
            setSelectedOrder(null)
            fetchPendingOrders()
        } catch (err) {
            console.error(err)
            toast.error("Error al registrar el corte")
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Corte e <span className="text-blue-600">Inventario</span></h2>
                    <p className="text-slate-500 text-sm font-medium">Control de tendido, consumo real y desperdicios.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Lista de OPs por Cortar */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Órdenes por Cortar</h3>
                    <div className="space-y-3">
                        {isLoading ? (
                            <div className="py-10 text-center animate-pulse text-slate-400 font-bold uppercase tracking-widest text-[10px]">Buscando pendientes...</div>
                        ) : pendingOrders.length === 0 ? (
                            <div className="bg-slate-50 p-8 rounded-3xl border border-dashed border-slate-200 text-center">
                                <Box className="mx-auto text-slate-300 mb-2" size={24} />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No hay OPs pendientes</p>
                            </div>
                        ) : (
                            pendingOrders.map(order => (
                                <button
                                    key={order.id}
                                    onClick={() => handleSelectOrder(order)}
                                    className={cn(
                                        "w-full p-6 rounded-3xl border transition-all text-left group relative overflow-hidden",
                                        selectedOrder?.id === order.id
                                            ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-600/20"
                                            : "bg-white border-slate-100 text-slate-900 hover:border-blue-200"
                                    )}
                                >
                                    <div className="flex flex-col gap-1 relative z-10">
                                        <span className={cn(
                                            "text-[10px] font-black tracking-widest",
                                            selectedOrder?.id === order.id ? "text-blue-100" : "text-blue-600"
                                        )}>#{order.numero_doc}</span>
                                        <span className="text-sm font-black uppercase leading-tight">{order.items?.[0]?.product?.nombre}</span>
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className="text-[10px] font-bold opacity-60 italic">{order.total_prendas} pzs</span>
                                            <span className="text-[10px] font-bold opacity-60 italic">{order.materials?.length || 0} mat.</span>
                                        </div>
                                    </div>
                                    <Scissors className={cn(
                                        "absolute top-1/2 -translate-y-1/2 -right-4 size-16 opacity-10 transition-transform group-hover:-rotate-12",
                                        selectedOrder?.id === order.id ? "text-white" : "text-blue-600"
                                    )} />
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Área de Trabajo de Corte */}
                <div className="lg:col-span-2">
                    {selectedOrder ? (
                        <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-2xl shadow-slate-200/50 space-y-8 animate-in slide-in-from-right-8 duration-500">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                                        <Scissors size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Registro de Tizado y Corte</h3>
                                        <p className="text-slate-500 text-xs font-medium">Validación de consumos reales para la OP #{selectedOrder.numero_doc}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleSaveCutting}
                                    className="flex items-center gap-2 px-6 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 transition-all uppercase text-[10px] tracking-widest"
                                >
                                    <Save size={16} />
                                    Confirmar Corte
                                </button>
                            </div>

                            <div className="overflow-hidden border border-slate-100 rounded-[2rem]">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-400 text-[9px] uppercase tracking-[0.2em] font-black">
                                            <th className="px-6 py-4">Material</th>
                                            <th className="px-6 py-4 text-center">Teórico (Calculado)</th>
                                            <th className="px-6 py-4 text-center">Real (Consumido)</th>
                                            <th className="px-6 py-4 text-right">Merma / Desperdicio</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {cuttingData.map((mat, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-black text-slate-900">{mat.nombre}</span>
                                                        <span className="text-[10px] text-slate-400 font-bold tracking-widest">{mat.codigo}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-black text-slate-600 italic">
                                                        {Number(mat.cantidad_teorica).toFixed(2)} mt
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-center">
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={mat.cantidad_real}
                                                            onChange={(e) => {
                                                                const newData = [...cuttingData]
                                                                newData[idx].cantidad_real = parseFloat(e.target.value) || 0
                                                                setCuttingData(newData)
                                                            }}
                                                            className="w-24 px-3 py-2 bg-blue-50/50 border border-blue-100 rounded-xl text-xs font-black text-blue-700 text-center focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-end gap-2 items-center">
                                                        <Scale size={12} className="text-slate-300" />
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={mat.merma_real}
                                                            onChange={(e) => {
                                                                const newData = [...cuttingData]
                                                                newData[idx].merma_real = parseFloat(e.target.value) || 0
                                                                setCuttingData(newData)
                                                            }}
                                                            className="w-24 px-3 py-2 bg-rose-50/50 border border-rose-100 rounded-xl text-xs font-black text-rose-700 text-center focus:ring-4 focus:ring-rose-500/10 outline-none transition-all"
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex gap-4">
                                <AlertTriangle className="text-amber-600 shrink-0" size={20} />
                                <p className="text-[11px] font-bold text-amber-700 leading-relaxed uppercase tracking-tight">
                                    <span className="font-black">Atención:</span> Los datos ingresados aquí ajustarán las existencias reales en el inventario. Asegúrate de que las pesadas de merma y las medidas de tela sean exactas antes de confirmar.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-20 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100 text-center text-slate-300">
                            <Scissors size={64} className="mb-4 opacity-50" />
                            <h4 className="text-xl font-black uppercase tracking-tighter">Mesa de Corte Vacía</h4>
                            <p className="text-xs font-medium max-w-xs mt-2">Selecciona una Orden de Producción de la izquierda para iniciar el proceso técnico de tizado.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
