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
    ChevronRight,
    Info
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function OPForm({ products }: { products: any[] }) {
    const router = useRouter()
    // @ts-ignore
    const supabase = createClient() as any
    const [isLoading, setIsLoading] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<string>("")
    const [selectedSize, setSelectedSize] = useState<string>("")
    const [quantity, setQuantity] = useState<number>(0)
    const [sizes, setSizes] = useState<any[]>([])
    const [materials, setMaterials] = useState<any[]>([])
    const [isCalculating, setIsCalculating] = useState(false)

    // Fetch sizes when product changes
    useEffect(() => {
        if (selectedProduct) {
            const fetchSizes = async () => {
                const { data } = await supabase
                    .from('product_sizes')
                    .select('*')
                    .eq('product_id', selectedProduct)
                    .order('orden', { ascending: true })
                setSizes(data || [])
                setSelectedSize("")
                setMaterials([])
            }
            fetchSizes()
        }
    }, [selectedProduct, supabase])

    const calculateMaterials = async () => {
        if (!selectedProduct || !selectedSize || quantity <= 0) {
            toast.error("Selecciona producto, talla y cantidad mayor a 0")
            return
        }

        setIsCalculating(true)
        try {
            // Buscamos la receta activa para este producto/talla
            const { data: recipe } = await supabase
                .from('recipes')
                .select(`
          id,
          items:recipe_items(
            material_id,
            cantidad,
            material:materials(nombre, unidad:units_of_measure(simbolo))
          )
        `)
                .eq('product_id', selectedProduct)
                .eq('product_size_id', selectedSize)
                .eq('estado', 'ACTIVA')
                .single()

            if (!recipe) {
                toast.warning("No se encontró una receta activa para este producto/talla")
                setMaterials([])
                return
            }

            // @ts-ignore
            const calculated = recipe.items.map((item: any) => ({
                material_id: item.material_id,
                nombre: item.material.nombre,
                unidad: item.material.unidad.simbolo,
                cantidad_unitaria: item.cantidad,
                cantidad_total: item.cantidad * quantity
            }))

            setMaterials(calculated)
            toast.success("Requerimientos calculados")
        } catch (err) {
            console.error(err)
            toast.error("Error al calcular materiales")
        } finally {
            setIsCalculating(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedProduct || !selectedSize || quantity <= 0) return

        setIsLoading(true)
        try {
            // 1. Obtener ID de compañía (usando la primera por ahora)
            const { data: company } = await supabase.from('companies').select('id').single()

            // 2. Crear la orden de producción
            // @ts-ignore
            const { data: op, error } = await supabase
                .from('production_orders')
                .insert({
                    company_id: company?.id,
                    product_id: selectedProduct,
                    product_size_id: selectedSize,
                    cantidad_solicitada: quantity,
                    fecha_entrega: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // +7 días
                    estado: 'PENDIENTE'
                } as any)
                .select()
                .single()

            if (error) throw error

            toast.success(`OP #${op.numero_op} creada exitosamente`)
            router.push("/production")
            router.refresh()
        } catch (err: any) {
            toast.error("Error al crear la OP", { description: err.message })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-900 transition-all shadow-sm">
                        {/* @ts-ignore */}
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Nueva <span className="text-pink-600">Orden</span></h1>
                        <p className="text-slate-500 text-sm font-medium">Completa los datos para iniciar el flujo de producción.</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 space-y-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Producto a Producir</label>
                                <select
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all font-bold text-slate-900"
                                    value={selectedProduct}
                                    onChange={(e) => setSelectedProduct(e.target.value)}
                                    required
                                >
                                    <option value="">Seleccionar...</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.nombre} ({p.codigo})</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Talla</label>
                                <select
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all font-bold text-slate-900 disabled:opacity-50"
                                    value={selectedSize}
                                    onChange={(e) => setSelectedSize(e.target.value)}
                                    required
                                    disabled={!selectedProduct}
                                >
                                    <option value="">Seleccionar...</option>
                                    {sizes.map(s => <option key={s.id} value={s.id}>Talla {s.talla}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Cantidad a Producir</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all font-black text-slate-900"
                                    placeholder="0"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Number(e.target.value))}
                                    required
                                />
                            </div>
                            <div className="flex items-end">
                                <button
                                    type="button"
                                    onClick={calculateMaterials}
                                    disabled={isCalculating || !selectedSize || quantity <= 0}
                                    className="w-full h-[52px] bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {/* @ts-ignore */}
                                    {isCalculating ? <Loader2 className="animate-spin" size={20} /> : <Calculator size={20} />}
                                    Calcular Insumos
                                </button>
                            </div>
                        </div>

                        {materials.length > 0 && (
                            <div className="space-y-4 pt-6 border-t border-slate-100 animate-in fade-in duration-500">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                                    {/* @ts-ignore */}
                                    <Shapes size={14} className="text-pink-500" />
                                    Insumos Requeridos
                                </h3>
                                <div className="bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-white text-[9px] uppercase font-black tracking-widest text-slate-400">
                                                <th className="px-5 py-3">Material</th>
                                                <th className="px-5 py-3 text-right">Cant. Unitaria</th>
                                                <th className="px-5 py-3 text-right">Total Pedido</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {materials.map((m, i) => (
                                                <tr key={i} className="text-sm">
                                                    <td className="px-5 py-3 font-bold text-slate-700">{m.nombre}</td>
                                                    <td className="px-5 py-3 text-right text-slate-500 font-medium">{m.cantidad_unitaria} {m.unidad}</td>
                                                    <td className="px-5 py-3 text-right font-black text-pink-600">{m.cantidad_total.toFixed(2)} {m.unidad}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white space-y-6 shadow-2xl shadow-slate-900/20 relative overflow-hidden group">
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-pink-500/10 rounded-full group-hover:scale-110 transition-transform duration-1000" />
                        <div className="space-y-2 relative">
                            <h3 className="text-xs font-black uppercase tracking-widest text-pink-500">Resumen de OP</h3>
                            <p className="text-2xl font-black">Plan de Ejecución</p>
                        </div>

                        <div className="space-y-4 relative border-t border-white/10 pt-6">
                            <div className="flex justify-between items-center opacity-70">
                                <span className="text-xs font-medium">Ciclo de Prod.</span>
                                <span className="text-xs font-bold">7-10 días</span>
                            </div>
                            <div className="flex justify-between items-center opacity-70">
                                <span className="text-xs font-medium">Entrega Est.</span>
                                <span className="text-xs font-bold">{new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-medium opacity-70">Total Unidades</span>
                                <span className="text-2xl font-black text-pink-500 tracking-tighter">{quantity || 0}</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !selectedSize || quantity <= 0}
                            className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-pink-500 hover:text-white transition-all shadow-xl disabled:opacity-50"
                        >
                            {/* @ts-ignore */}
                            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            Confirmar y Crear OP
                        </button>
                    </div>

                    <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100 flex gap-4">
                        {/* @ts-ignore */}
                        <div className="p-2 bg-white rounded-lg text-blue-600 h-fit shadow-sm"><Info size={18} /></div>
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-blue-900">Ayuda del Sistema</p>
                            <p className="text-xs text-blue-700/70 leading-relaxed font-medium">Al crear la OP, el sistema reservará automáticamente los materiales indicados en la receta.</p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}

function Shapes({ size, className }: { size: number, className?: string }) {
    {/* @ts-ignore */ }
    return <Factory size={size} className={className} />
}
