"use client"

import { useState, useEffect } from "react"
import {
    Save,
    Plus,
    Trash2,
    Truck,
    Package,
    Settings,
    Loader2,
    X,
    Info,
    Search,
    Scissors
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface OSModalProps {
    isOpen: boolean
    onClose: () => void
    productionOrder: any
}

export default function ServiceOrderModal({ isOpen, onClose, productionOrder }: OSModalProps) {
    const supabase = createClient()
    const [isLoading, setIsLoading] = useState(false)
    const [suppliers, setSuppliers] = useState<any[]>([])
    const [materials, setMaterials] = useState<any[]>([])

    // Form State
    const [formData, setFormData] = useState({
        supplier_id: "",
        tipo_servicio: "",
        costo_total: 0,
        fecha_entrega: "",
        instrucciones: "",
        avios: [] as any[]
    })

    useEffect(() => {
        if (isOpen) {
            fetchSuppliers()
            // Assume we can fetch materials for the OP's explosion
            // For now, allow selecting from all materials as avios
            fetchMaterials()
        }
    }, [isOpen])

    const fetchSuppliers = async () => {
        const { data } = await supabase.from('suppliers').select('*').order('nombre_comercial')
        setSuppliers(data || [])
    }

    const fetchMaterials = async () => {
        const { data } = await supabase.from('products').select('*').eq('tipo_item', 'MATERIAL')
        setMaterials(data || [])
    }

    const handleAddAvio = () => {
        setFormData(prev => ({
            ...prev,
            avios: [...prev.avios, { material_id: "", cantidad: 0 }]
        }))
    }

    const handleRemoveAvio = (index: number) => {
        setFormData(prev => ({
            ...prev,
            avios: prev.avios.filter((_, i) => i !== index)
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // 1. Create OS
            const { data: os, error: osError } = await supabase
                .from('service_orders')
                .insert([{
                    op_id: productionOrder.id,
                    supplier_id: formData.supplier_id,
                    tipo_servicio: formData.tipo_servicio,
                    total_costo: formData.costo_total,
                    fecha_entrega: formData.fecha_entrega,
                    instrucciones_adicionales: formData.instrucciones,
                    estado: 'PENDIENTE'
                }])
                .select()
                .single()

            if (osError) throw osError

            // 2. Insert AVIOS
            if (formData.avios.length > 0) {
                const aviosToInsert = formData.avios.map(a => ({
                    os_id: os.id,
                    material_id: a.material_id,
                    cantidad_entregada: a.cantidad
                }))
                await supabase.from('service_order_materials').insert(aviosToInsert)
            }

            toast.success("Orden de Servicio generada exitosamente")
            onClose()
        } catch (error: any) {
            toast.error("Error al generar OS", { description: error.message })
        } finally {
            setIsLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />

            <div className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                            {/* @ts-ignore */}
                            <Truck size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Generar <span className="text-indigo-600">Orden de Servicio</span></h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Tercerización para OP #{productionOrder?.numero_op}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-slate-200 rounded-2xl text-slate-400 transition-colors">
                        {/* @ts-ignore */}
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 h-[70vh] overflow-y-auto no-scrollbar space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Supplier and Service */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Taller / Proveedor</label>
                                <select
                                    required
                                    value={formData.supplier_id}
                                    onChange={e => setFormData({ ...formData, supplier_id: e.target.value })}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                                >
                                    <option value="">Seleccionar taller...</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.nombre_comercial}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Tipo de Servicio</label>
                                <select
                                    required
                                    value={formData.tipo_servicio}
                                    onChange={e => setFormData({ ...formData, tipo_servicio: e.target.value })}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                                >
                                    <option value="">Seleccionar servicio...</option>
                                    <option value="CONFECCION">Confección Completa</option>
                                    <option value="BORDADO">Servicio de Bordado</option>
                                    <option value="ESTAMPADO">Servicio de Estampado</option>
                                    <option value="OJAL_BOTON">Ojal y Botón</option>
                                    <option value="LAMINADO">Laminado / Acabado Especial</option>
                                </select>
                            </div>
                        </div>

                        {/* Cost and Date */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Costo Acordado (Total)</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">S/</div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={formData.costo_total}
                                        onChange={e => setFormData({ ...formData, costo_total: parseFloat(e.target.value) || 0 })}
                                        className="w-full pl-10 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Fecha de Entrega Pactada</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.fecha_entrega}
                                    onChange={e => setFormData({ ...formData, fecha_entrega: e.target.value })}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Instrucciones Especiales</label>
                            <textarea
                                value={formData.instrucciones}
                                onChange={e => setFormData({ ...formData, instrucciones: e.target.value })}
                                rows={2}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-900 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                                placeholder="Indica detalles técnicos o requisitos de calidad..."
                            />
                        </div>
                    </div>

                    {/* AVIOS Section */}
                    <div className="space-y-6 pt-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-950 flex items-center gap-2">
                                {/* @ts-ignore */}
                                <Package size={18} className="text-indigo-600" />
                                AVIOS y Accesorios Entregados
                            </h3>
                            <button
                                type="button"
                                onClick={handleAddAvio}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg"
                            >
                                {/* @ts-ignore */}
                                <Plus size={14} />
                                Agregar Avío
                            </button>
                        </div>

                        <div className="bg-indigo-50/30 rounded-[2.5rem] border border-indigo-100 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-white/70 border-b border-indigo-50">
                                    <tr className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                        <th className="px-8 py-4">Insumo / Accesorio</th>
                                        <th className="px-8 py-4 text-right">Cantidad Entregada</th>
                                        <th className="px-8 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-indigo-50">
                                    {formData.avios.map((avio, index) => (
                                        <tr key={index} className="group hover:bg-white/50 transition-all">
                                            <td className="px-8 py-4">
                                                <select
                                                    value={avio.material_id}
                                                    onChange={e => {
                                                        const newAvios = [...formData.avios]
                                                        newAvios[index].material_id = e.target.value
                                                        setFormData({ ...formData, avios: newAvios })
                                                    }}
                                                    className="w-full bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 outline-none cursor-pointer"
                                                >
                                                    <option value="">Seleccionar material...</option>
                                                    {materials.map(m => <option key={m.id} value={m.id}>{m.nombre} ({m.codigo})</option>)}
                                                </select>
                                            </td>
                                            <td className="px-8 py-4 text-right">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={avio.cantidad}
                                                    onChange={e => {
                                                        const newAvios = [...formData.avios]
                                                        newAvios[index].cantidad = parseFloat(e.target.value) || 0
                                                        setFormData({ ...formData, avios: newAvios })
                                                    }}
                                                    className="w-24 bg-transparent border-b border-indigo-200 text-right text-sm font-black text-indigo-700 focus:border-indigo-500 outline-none"
                                                />
                                            </td>
                                            <td className="px-8 py-4 text-right">
                                                <button type="button" onClick={() => handleRemoveAvio(index)} className="p-2 text-slate-300 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100">
                                                    {/* @ts-ignore */}
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {formData.avios.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-8 py-10 text-center">
                                                <p className="text-xs text-indigo-400 font-bold italic">No se han registrado avíos para esta OS.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </form>

                <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="px-6 py-4 text-slate-400 font-black hover:text-slate-900 transition-colors uppercase text-[10px] tracking-widest">
                        Cancelar
                    </button>
                    <button
                        disabled={isLoading || !formData.supplier_id}
                        onClick={handleSubmit}
                        className="px-12 py-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95 disabled:opacity-20"
                    >
                        {/* @ts-ignore */}
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        GENERAR ORDEN DE SERVICIO FINAL
                    </button>
                </div>
            </div>
        </div>
    )
}
