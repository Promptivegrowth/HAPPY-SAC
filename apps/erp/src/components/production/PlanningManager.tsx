"use client"

import { useState, useEffect } from "react"
import {
    Calendar,
    Plus,
    ChevronRight,
    ClipboardList,
    Clock,
    CheckCircle2,
    Search
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function PlanningManager() {
    const supabase = createClient()
    const [plans, setPlans] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        fetchPlans()
    }, [])

    const fetchPlans = async () => {
        setIsLoading(true)
        try {
            const { data, error } = await supabase
                .from('production_plans')
                .select(`
                    *,
                    production_orders (
                        id,
                        numero_doc,
                        total_prendas,
                        estado
                    )
                `)
                .order('created_at', { ascending: false })

            if (error) throw error
            setPlans(data || [])
        } catch (err) {
            console.error(err)
            toast.error("Error al cargar planes de trabajo")
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreatePlan = async () => {
        const nombre = prompt("Nombre del Plan (ej: Semana 15 - Abril):")
        if (!nombre) return

        try {
            const { data: company } = await supabase.from('companies').select('id').single()

            const startStr = new Date().toISOString().split('T')[0]
            const endStr = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

            const { data, error } = await supabase
                .from('production_plans')
                .insert([{
                    nombre,
                    fecha_inicio: startStr,
                    fecha_fin: endStr,
                    estado: 'ACTIVO',
                    company_id: (company as any)?.id
                }])
                .select()
                .single()

            if (error) throw error

            toast.success("Nuevo Plan de Trabajo creado")
            fetchPlans()
        } catch (err) {
            console.error(err)
            toast.error("Error al crear plan")
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Planificación <span className="text-pink-600">Semanal</span></h2>
                    <p className="text-slate-500 text-sm font-medium">Lotes de producción y consolidación de materiales.</p>
                </div>
                <button
                    onClick={handleCreatePlan}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-pink-600 text-white font-black rounded-2xl shadow-xl transition-all uppercase text-[10px] tracking-widest"
                >
                    <Plus size={16} />
                    Crear Nuevo Plan
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full py-20 text-center animate-pulse text-slate-400 font-bold uppercase tracking-widest text-xs">Cargando planes operativos...</div>
                ) : plans.length === 0 ? (
                    <div className="col-span-full bg-white p-20 rounded-[3rem] border-4 border-dashed border-slate-100 flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-pink-50 text-pink-600 rounded-3xl flex items-center justify-center mb-6">
                            <Calendar size={40} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 uppercase">Sin planes activos</h3>
                        <p className="text-slate-500 max-w-sm mt-2 font-medium">Comienza creando un plan semanal para consolidar tus órdenes de producción.</p>
                    </div>
                ) : (
                    plans.map(plan => (
                        <div key={plan.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 hover:border-pink-200 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-[4rem] -mr-8 -mt-8 group-hover:bg-pink-50 transition-colors" />

                            <div className="relative space-y-4">
                                <div className="flex items-start justify-between">
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                        plan.estado === 'ACTIVO' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                                    )}>
                                        {plan.estado}
                                    </span>
                                    <div className="p-2 bg-white border border-slate-100 rounded-xl text-slate-400 group-hover:text-pink-600 transition-colors shadow-sm">
                                        <ChevronRight size={16} />
                                    </div>
                                </div>

                                <h3 className="text-lg font-black text-slate-900 leading-tight uppercase tracking-tight group-hover:text-pink-600 transition-colors">{plan.nombre}</h3>

                                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400">
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={12} />
                                        <span>Del {new Date(plan.fecha_inicio).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <ClipboardList size={12} />
                                        <span>{plan.production_orders?.length || 0} OPs</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-400">
                                                OP
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-[10px] font-black text-slate-900 bg-slate-50 px-3 py-1.5 rounded-lg">
                                        {plan.production_orders?.reduce((sum: number, op: any) => sum + (op.total_prendas || 0), 0)} PRENDAS
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
