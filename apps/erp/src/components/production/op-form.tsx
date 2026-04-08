"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
    Plus,
    Trash2,
    Save,
    ArrowLeft,
    Calculator,
    Loader2,
    Factory,
    Info,
    CheckCircle2,
    Box,
    Clock,
    Calendar as CalendarIcon
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function OPForm({ products }: { products: any[] }) {
    const router = useRouter()
    const supabase = createClient()
    const [isLoading, setIsLoading] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<string>("")
    const [items, setItems] = useState<any[]>([{ size_id: "", quantity: 1 }])
    const [sizes, setSizes] = useState<any[]>([])
    const [explosion, setExplosion] = useState<any[]>([])
    const [isCalculating, setIsCalculating] = useState(false)

    // Nuevos campos de tiempo
    const [startTime, setStartTime] = useState("08:00")
    const [deliveryDate, setDeliveryDate] = useState(
        new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    )

    // Fetch sizes when product changes
    useEffect(() => {
        if (selectedProduct) {
            const fetchDetails = async () => {
                const { data } = await supabase
                    .from('product_sizes')
                    .select('*')
                    .eq('product_id', selectedProduct)
                    .order('orden', { ascending: true })
                setSizes(data || [])
                setItems([{ size_id: "", quantity: 1 }])
                setExplosion([])
            }
            fetchDetails()
        }
    }, [selectedProduct])

    const handleAddItem = () => {
        setItems([...items, { size_id: "", quantity: 1 }])
    }

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index))
    }

    const calculateExplosion = async () => {
        if (!selectedProduct || items.some(i => !i.size_id || i.quantity <= 0)) {
            toast.error("Completa todos los items con talla y cantidad válida")
            return
        }

        setIsCalculating(true)
        try {
            const { data: recipe, error: recipeError } = await (supabase
                .from('recipes')
                .select('id, merma_default')
                .eq('product_id', selectedProduct)
                .eq('estado', 'ACTIVA')
                .maybeSingle() as any)

            if (recipeError) throw recipeError

            if (!recipe) {
                toast.warning("No hay ficha técnica ACTIVA para este producto")
                setExplosion([])
                return
            }

            const { data: recipeItems, error: itemsError } = await (supabase
                .from('recipe_items')
                .select('material_id, cantidad, merma_porcentaje')
                .eq('recipe_id', recipe.id) as any)

            if (itemsError) throw itemsError

            if (!recipeItems || recipeItems.length === 0) {
                toast.warning("La ficha técnica no tiene ingredientes registrados")
                setExplosion([])
                return
            }

            const materialIds = recipeItems.map((ri: any) => ri.material_id)
            const { data: materialsData, error: materialsError } = await (supabase
                .from('materials')
                .select('id, nombre, codigo')
                .in('id', materialIds) as any)

            if (materialsError) throw materialsError

            const materialsMap = (materialsData || []).reduce((acc: any, m: any) => {
                acc[m.id] = m
                return acc
            }, {})

            const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)

            const calculated = recipeItems.map((item: any) => {
                const materialInfo = materialsMap[item.material_id] || { nombre: 'Desconocido', codigo: 'S/C' }
                const baseAmount = item.cantidad * totalQuantity
                const mermaAmount = baseAmount * ((item.merma_porcentaje || recipe.merma_default || 3) / 100)

                return {
                    material_id: item.material_id,
                    nombre: materialInfo.nombre,
                    codigo: materialInfo.codigo,
                    cantidad_base: baseAmount,
                    merma: mermaAmount,
                    total: baseAmount + mermaAmount
                }
            })

            setExplosion(calculated)
            toast.success("Explosión de materiales completada")
        } catch (err) {
            console.error(err)
            toast.error("Error al calcular explosión")
        } finally {
            setIsCalculating(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedProduct || items.some(i => !i.size_id || i.quantity <= 0)) return
        if (explosion.length === 0) {
            toast.error("Calcula la explosión antes de lanzar la OP")
            return
        }

        setIsLoading(true)
        try {
            const { data: company } = await (supabase.from('companies').select('id').single() as any)

            // 1. Crear Cabecera de la Orden de Producción
            const totalPrendas = items.reduce((sum, i) => sum + i.quantity, 0)
            const { data: op, error: opError } = await ((supabase
                .from('production_orders') as any)
                .insert([{
                    company_id: company?.id,
                    total_prendas: totalPrendas,
                    fecha_emision: new Date().toISOString(),
                    fecha_entrega_est: new Date(deliveryDate).toISOString(),
                    hora_inicio: startTime,
                    estado: 'PENDIENTE',
                    numero_doc: `OP-${Date.now().toString().slice(-6)}`,
                    referencia_cliente: 'GENERADO DESDE ERP'
                }])
                .select()
                .single() as any)

            if (opError) throw opError

            // 2. Crear los ítems (Disfraz/Tallas) de la OP
            const orderItems = items
                .filter(item => item.size_id && item.quantity > 0)
                .map(item => ({
                    order_id: op.id,
                    product_id: selectedProduct,
                    product_size_id: item.size_id,
                    cantidad_pedida: item.quantity,
                    estado_item: 'PENDIENTE',
                    costo_est_unit: 0
                }))

            if (orderItems.length > 0) {
                const { error: itemsError } = await ((supabase
                    .from('production_order_items') as any)
                    .insert(orderItems) as any)
                if (itemsError) throw itemsError
            }

            // 3. Persistir la Explosión de Materiales (PARA EL MONITOR)
            const orderMaterials = explosion.map(m => ({
                order_id: op.id,
                material_id: m.material_id,
                cantidad_base: m.cantidad_base,
                merma: m.merma,
                total: m.total
            }))

            if (orderMaterials.length > 0) {
                const { error: mError } = await (supabase
                    .from('production_order_materials')
                    .insert(orderMaterials))
                if (mError) throw mError
            }

            toast.success(`OP #${op.numero_doc || op.id.slice(0, 8)} creada exitosamente`)
            router.push("/production")
        } catch (err: any) {
            console.error("Error completo OP:", err)
            toast.error("Error al crear la OP", { description: err.message })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <button onClick={() => router.back()} className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-slate-900 transition-all shadow-sm hover:shadow-md">
                        {/* @ts-ignore */}
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Nueva <span className="text-pink-600">Orden de Producción</span></h1>
                        <p className="text-slate-500 text-sm font-medium">Configuración de corrida y explosión de materiales.</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Producto Principal */}
                    <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-2xl shadow-slate-200/50 space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[5rem] -mr-10 -mt-10" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Estilo / Disfraz a Producir</label>
                                <select
                                    className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] focus:ring-8 focus:ring-pink-500/5 focus:border-pink-500 outline-none transition-all font-black text-xl text-slate-900"
                                    value={selectedProduct}
                                    onChange={(e) => setSelectedProduct(e.target.value)}
                                    required
                                >
                                    <option value="">Seleccionar producto...</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.nombre} ({p.codigo})</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center gap-2">
                                        <Clock size={10} /> Inicio Operativo
                                    </label>
                                    <input
                                        type="time"
                                        className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-900 focus:ring-4 focus:ring-pink-500/10 outline-none transition-all"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center gap-2">
                                        <CalendarIcon size={10} /> Entrega Estimada
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs text-slate-900 focus:ring-4 focus:ring-pink-500/10 outline-none transition-all"
                                        value={deliveryDate}
                                        onChange={(e) => setDeliveryDate(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Tallas y Cantidades */}
                        <div className="space-y-6 pt-4 border-t border-slate-50">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                                    {/* @ts-ignore */}
                                    <Box size={16} className="text-pink-600" />
                                    Detalle de Corrida (Tallas)
                                </h3>
                                <button
                                    type="button"
                                    onClick={handleAddItem}
                                    disabled={!selectedProduct}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-900 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-30"
                                >
                                    {/* @ts-ignore */}
                                    <Plus size={14} />
                                    Agregar Talla
                                </button>
                            </div>

                            <div className="space-y-3">
                                {items.map((item, index) => (
                                    <div key={index} className="flex gap-3 group animate-in slide-in-from-left-4 duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                                        <div className="flex-1">
                                            <select
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-pink-500/10 outline-none transition-all font-bold text-slate-900 disabled:opacity-50"
                                                value={item.size_id}
                                                onChange={(e) => {
                                                    const newItems = [...items]
                                                    newItems[index].size_id = e.target.value
                                                    setItems(newItems)
                                                }}
                                                required
                                            >
                                                <option value="">Talla...</option>
                                                {sizes.map(s => <option key={s.id} value={s.id}>Talla {s.talla}</option>)}
                                            </select>
                                        </div>
                                        <div className="w-32">
                                            <input
                                                type="number"
                                                min="1"
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-pink-500/10 outline-none transition-all font-black text-slate-900 text-center"
                                                placeholder="Cant"
                                                value={item.quantity}
                                                onChange={(e) => {
                                                    const newItems = [...items]
                                                    newItems[index].quantity = parseInt(e.target.value) || 0
                                                    setItems(newItems)
                                                }}
                                                required
                                            />
                                        </div>
                                        {items.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveItem(index)}
                                                className="p-4 text-slate-300 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                {/* @ts-ignore */}
                                                <Trash2 size={20} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex border-t border-slate-100 pt-8">
                            <button
                                type="button"
                                onClick={calculateExplosion}
                                disabled={isCalculating || !selectedProduct}
                                className="w-full h-16 bg-slate-900 hover:bg-pink-600 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] disabled:opacity-30"
                            >
                                {/* @ts-ignore */}
                                {isCalculating ? <Loader2 className="animate-spin" size={24} /> : <Calculator size={24} />}
                                REALIZAR EXPLOSIÓN DE INSUMOS
                            </button>
                        </div>
                    </div>

                    {/* Resultados de Explosión */}
                    {explosion.length > 0 && (
                        <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-xl space-y-6 animate-in zoom-in-95 duration-500">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                                {/* @ts-ignore */}
                                <CheckCircle2 size={16} className="text-emerald-500" />
                                Requerimientos Totales (con Merma)
                            </h3>
                            <div className="bg-slate-50/50 rounded-[2rem] border border-slate-100 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-white/50 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                            <th className="px-8 py-4">Insumo</th>
                                            <th className="px-8 py-4 text-right">Base</th>
                                            <th className="px-8 py-4 text-right">Merma</th>
                                            <th className="px-8 py-4 text-right">Total Pedido</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {explosion.map((m, i) => (
                                            <tr key={i} className="text-sm">
                                                <td className="px-8 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-900">{m.nombre}</span>
                                                        <span className="text-[10px] text-slate-400 font-mono italic">{m.codigo}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-4 text-right text-slate-500 font-medium">{m.cantidad_base.toFixed(2)}</td>
                                                <td className="px-8 py-4 text-right text-rose-400 font-bold">+{m.merma.toFixed(2)}</td>
                                                <td className="px-8 py-4 text-right font-black text-slate-900 bg-slate-100/30">{m.total.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Lateral Summary */}
                <div className="space-y-6">
                    <div className="bg-slate-900 p-8 rounded-[3rem] text-white space-y-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-pink-500/10 rounded-full group-hover:scale-125 transition-transform duration-1000" />

                        <div className="space-y-1 relative">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-500">Ficha de Producción</h3>
                            <p className="text-3xl font-black italic tracking-tighter">RESUMEN <span className="text-pink-500">OP</span></p>
                        </div>

                        <div className="space-y-5 relative border-t border-white/5 pt-8">
                            <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Unidades</span>
                                <span className="text-3xl font-black text-pink-500 tracking-tighter">{items.reduce((sum, i) => sum + i.quantity, 0)}</span>
                            </div>

                            <div className="space-y-3 px-2">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="opacity-50">Tallas Diferentes</span>
                                    <span className="font-bold">{items.filter(i => i.size_id).length}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="opacity-50">Fecha Entrega</span>
                                    <span className="font-bold">{new Date(deliveryDate).toLocaleDateString('es-PE')}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-pink-500">
                                    <span className="opacity-50">Hora de Inicio</span>
                                    <span className="font-black tracking-widest">{startTime}</span>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || explosion.length === 0}
                            className="w-full py-5 bg-white text-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-pink-500 hover:text-white transition-all shadow-2xl active:scale-95 disabled:opacity-20"
                        >
                            {/* @ts-ignore */}
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            Confirmar y Lanzar OP
                        </button>
                    </div>

                    <div className="bg-blue-50/50 p-8 rounded-[2.5rem] border border-blue-100 flex gap-5">
                        {/* @ts-ignore */}
                        <div className="p-3 bg-white rounded-2xl text-blue-600 h-fit shadow-lg shadow-blue-500/5"><Info size={24} /></div>
                        <div className="space-y-1">
                            <p className="text-sm font-black text-blue-900 uppercase tracking-tighter">Control de Calidad</p>
                            <p className="text-xs text-blue-700/70 leading-relaxed font-bold">Esta OP quedará en espera de confirmación de disponibilidad de materiales por almacén antes de pasar a Corte.</p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}
