"use client"

import { useState, useEffect } from "react"
import {
    Calendar,
    Plus,
    CheckCircle2,
    Search,
    Printer,
    ClipboardList,
    ChevronRight
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import PrintableReport from "./PrintableReport"

export default function PlanningManager() {
    const supabase = createClient()
    const [plans, setPlans] = useState<any[]>([])
    const [pendingOrders, setPendingOrders] = useState<any[]>([])
    const [selectedPlan, setSelectedPlan] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [showAssignModal, setShowAssignModal] = useState(false)
    const [showReport, setShowReport] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const [plansRes, ordersRes] = await Promise.all([
                supabase
                    .from('production_plans')
                    .select(`
                        *,
                        production_orders (
                            id,
                            numero_doc,
                            total_prendas,
                            estado,
                            materials:production_order_materials (
                                id,
                                material_id,
                                total,
                                material:materials (nombre, codigo)
                            )
                        )
                    `)
                    .order('created_at', { ascending: false }) as any,
                supabase
                    .from('production_orders')
                    .select('id, numero_doc, total_prendas, estado')
                    .is('plan_id', null)
                    .eq('estado', 'PENDIENTE') as any
            ])

            if (plansRes.error) throw plansRes.error
            if (ordersRes.error) throw ordersRes.error

            setPlans(plansRes.data || [])
            setPendingOrders(ordersRes.data || [])
        } catch (err) {
            console.error(err)
            toast.error("Error al cargar datos")
        } finally {
            setIsLoading(false)
        }
    }

    const handleAssignOrders = async (planId: string, orderIds: string[]) => {
        try {
            const { error } = await supabase
                .from('production_orders')
                .update({ plan_id: planId } as any)
                .in('id', orderIds)

            if (error) throw error
            toast.success("Órdenes asignadas al plan")
            fetchData()
            setShowAssignModal(false)
        } catch (err) {
            console.error(err)
            toast.error("Error al asignar órdenes")
        }
    }

    const calculateConsolidatedMaterials = (plan: any) => {
        const materials: Record<string, any> = {}
        plan.production_orders?.forEach((op: any) => {
            op.materials?.forEach((m: any) => {
                const key = m.material_id
                if (!materials[key]) {
                    materials[key] = {
                        nombre: m.material?.nombre,
                        codigo: m.material?.codigo,
                        total: 0
                    }
                }
                materials[key].total += Number(m.total)
            })
        })
        return Object.values(materials)
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Cabecera Principal */}
            {!selectedPlan ? (
                <>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Planificación <span className="text-pink-600">Semanal</span></h2>
                            <p className="text-slate-500 text-sm font-medium">Consolidación de órdenes y requerimientos de materia prima.</p>
                        </div>
                        <button
                            onClick={async () => {
                                const nombre = prompt("Nombre del Plan Operativo:")
                                if (!nombre) return
                                const { data: company } = await supabase.from('companies').select('id').single()
                                const { error } = await supabase.from('production_plans').insert([{
                                    nombre,
                                    fecha_inicio: new Date().toISOString().split('T')[0],
                                    fecha_fin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                                    company_id: (company as any)?.id
                                }] as any)
                                if (error) toast.error("Error al crear")
                                else fetchData()
                            }}
                            className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-pink-600 text-white font-black rounded-2xl shadow-xl transition-all uppercase text-[10px] tracking-widest"
                        >
                            <Plus size={16} />
                            Crear Nuevo Plan
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {plans.map(plan => (
                            <button
                                key={plan.id}
                                onClick={() => setSelectedPlan(plan)}
                                className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 hover:border-pink-200 transition-all group text-left relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-[4rem] group-hover:bg-pink-50 transition-colors -mr-8 -mt-8" />
                                <div className="relative space-y-4">
                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest">{plan.estado}</span>
                                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight group-hover:text-pink-600 transition-colors">{plan.nombre}</h3>
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                        <div className="flex items-center gap-2">
                                            <ClipboardList size={14} className="text-slate-400" />
                                            <span className="text-[10px] font-black text-slate-500 uppercase">{plan.production_orders?.length || 0} Órdenes</span>
                                        </div>
                                        <div className="px-3 py-1.5 bg-slate-50 rounded-lg text-[10px] font-black text-slate-900 uppercase">
                                            {plan.production_orders?.reduce((s: any, op: any) => s + op.total_prendas, 0)} PRENDAS
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </>
            ) : (
                /* Detalle del Plan */
                <div className="space-y-8 animate-in slide-in-from-left-8 duration-500">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSelectedPlan(null)} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors">
                            <ChevronRight size={20} className="rotate-180" />
                        </button>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">{selectedPlan.nombre}</h2>
                            <p className="text-slate-500 text-sm font-medium">Consolidado operativo y explosión por lote.</p>
                        </div>
                        <button
                            onClick={() => setShowReport(true)}
                            className="ml-auto flex items-center gap-2 px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-black rounded-2xl shadow-xl transition-all uppercase text-[10px] tracking-widest"
                        >
                            <Printer size={16} />
                            Generar Reporte
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Órdenes en el Plan */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Órdenes Asignadas</h3>
                                <button
                                    onClick={() => setShowAssignModal(true)}
                                    className="p-2 bg-pink-50 text-pink-600 rounded-xl hover:bg-pink-100 transition-colors"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                            <div className="space-y-3">
                                {selectedPlan.production_orders?.map((op: any) => (
                                    <div key={op.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between shadow-sm">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-pink-600 tracking-widest">#{op.numero_doc}</span>
                                            <span className="text-xs font-black text-slate-900 uppercase tracking-tight">Orden Individual</span>
                                        </div>
                                        <div className="text-[10px] font-black text-slate-500 px-2 py-1 bg-slate-50 rounded-md">
                                            {op.total_prendas} PZS
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Consolidado de Materiales */}
                        <div className="lg:col-span-2 space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Consolidado Total de Insumos</h3>
                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    {calculateConsolidatedMaterials(selectedPlan).map((mat: any, idx: number) => (
                                        <div key={idx} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-2">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{mat.codigo}</span>
                                            <h4 className="text-xs font-black text-slate-900 uppercase leading-tight h-8 line-clamp-2">{mat.nombre}</h4>
                                            <div className="pt-2 border-t border-slate-200">
                                                <span className="text-lg font-black text-pink-600 tracking-tighter">{Number(mat.total).toFixed(4)} <span className="text-[10px] uppercase ml-1">metros</span></span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para asignar órdenes */}
            {showAssignModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-6">Asignar <span className="text-pink-600">Producción</span></h3>
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                            {pendingOrders.map(op => (
                                <button
                                    key={op.id}
                                    onClick={() => handleAssignOrders(selectedPlan.id, [op.id])}
                                    className="w-full p-4 bg-slate-50 hover:bg-pink-50 border border-slate-100 rounded-2xl flex items-center justify-between group transition-all"
                                >
                                    <div className="text-left">
                                        <span className="text-[10px] font-black text-slate-400 tracking-widest group-hover:text-pink-400">#{op.numero_doc}</span>
                                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{op.total_prendas} Prendas Pendientes</p>
                                    </div>
                                    <Plus size={20} className="text-slate-300 group-hover:text-pink-500 transition-colors" />
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setShowAssignModal(false)} className="mt-8 w-full py-4 text-xs font-black uppercase text-slate-400 hover:text-slate-900 transition-colors">Cerrar</button>
                    </div>
                </div>
            )}

            {/* Reporte Imprimible Overlay */}
            {showReport && (
                <PrintableReport
                    plan={selectedPlan}
                    consolidatedMaterials={calculateConsolidatedMaterials(selectedPlan)}
                    onClose={() => setShowReport(false)}
                />
            )}
        </div>
    )
}
