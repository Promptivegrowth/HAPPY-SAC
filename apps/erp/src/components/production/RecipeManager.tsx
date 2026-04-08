"use client"

import { useState, useEffect } from "react"
import {
    Plus,
    Trash2,
    Save,
    Copy,
    ChevronRight,
    Search,
    Package,
    Settings,
    DollarSign,
    Box,
    Factory,
    Info,
    CheckCircle2,
    Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface RecipeManagerProps {
    products: any[]
}

export default function RecipeManager({ products }: RecipeManagerProps) {
    const supabase = createClient()
    const [isLoading, setIsLoading] = useState(false)
    const [recipes, setRecipes] = useState<any[]>([])
    const [materials, setMaterials] = useState<any[]>([])
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingRecipe, setEditingRecipe] = useState<any>(null)
    const [searchTerm, setSearchTerm] = useState("")

    // Form State
    const [formData, setFormData] = useState({
        product_id: "",
        nombre: "",
        descripcion: "",
        costos_indirectos: 0,
        merma_default: 3.0,
        items: [] as any[],
        operations: [] as any[]
    })

    useEffect(() => {
        fetchRecipes()
        fetchMaterials()
    }, [])

    const fetchRecipes = async () => {
        const { data } = await (supabase
            .from('recipes')
            .select(`
                *,
                product:products(nombre, codigo),
                recipe_items(*, material:materials(nombre, codigo, unidad:units(abreviatura))),
                recipe_operations(*)
            `)
            .order('created_at', { ascending: false }) as any)
        setRecipes(data || [])
    }

    const fetchMaterials = async () => {
        const { data } = await (supabase
            .from('materials')
            .select('*')
            .eq('activo', true)
            .order('nombre', { ascending: true }) as any)
        setMaterials(data || [])
    }

    const handleOpenForm = (recipe: any = null) => {
        if (recipe) {
            setEditingRecipe(recipe)
            setFormData({
                product_id: recipe.product_id,
                nombre: recipe.nombre || "",
                descripcion: recipe.descripcion || "",
                costos_indirectos: recipe.costos_indirectos || 0,
                merma_default: recipe.merma_default || 3.0,
                items: recipe.recipe_items || [],
                operations: recipe.recipe_operations || []
            })
        } else {
            setEditingRecipe(null)
            setFormData({
                product_id: "",
                nombre: "",
                descripcion: "",
                costos_indirectos: 0,
                merma_default: 3.0,
                items: [],
                operations: []
            })
        }
        setIsFormOpen(true)
    }

    const handleAddItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { material_id: "", cantidad: 0, merma_porcentaje: prev.merma_default }]
        }))
    }

    const handleRemoveItem = (index: number) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }))
    }

    const handleAddOperation = () => {
        setFormData(prev => ({
            ...prev,
            operations: [...prev.operations, { tipo_operacion: "", costo_base: 0 }]
        }))
    }

    const handleRemoveOperation = (index: number) => {
        setFormData(prev => ({
            ...prev,
            operations: prev.operations.filter((_, i) => i !== index)
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // Logic for saving recipe, its items and its operations
            // This assumes the new columns exist
            const { data: recipeData, error: recipeError } = editingRecipe
                ? await (supabase.from('recipes').update({
                    product_id: formData.product_id,
                    descripcion: formData.descripcion,
                    costos_indirectos: formData.costos_indirectos,
                    merma_default: formData.merma_default,
                    estado: 'ACTIVA'
                }).eq('id', editingRecipe.id).select().single() as any)
                : await (supabase.from('recipes').insert([{
                    product_id: formData.product_id,
                    descripcion: formData.descripcion,
                    costos_indirectos: formData.costos_indirectos,
                    merma_default: formData.merma_default,
                    estado: 'ACTIVA'
                }]).select().single() as any)

            if (recipeError) throw recipeError

            // Clear old items if editing
            if (editingRecipe) {
                await (supabase.from('recipe_items').delete().eq('recipe_id', recipeData.id) as any)
                await (supabase.from('recipe_operations').delete().eq('recipe_id', recipeData.id) as any)
            }

            // Insert new items
            if (formData.items.length > 0) {
                const itemsToInsert = formData.items.map(item => ({
                    recipe_id: recipeData.id,
                    material_id: item.material_id,
                    cantidad: item.cantidad,
                    merma_porcentaje: item.merma_porcentaje
                }))
                await (supabase.from('recipe_items').insert(itemsToInsert) as any)
            }

            // Insert new operations
            if (formData.operations.length > 0) {
                const opsToInsert = formData.operations.map(op => ({
                    recipe_id: recipeData.id,
                    tipo_operacion: op.tipo_operacion,
                    costo_base: op.costo_base
                }))
                await (supabase.from('recipe_operations').insert(opsToInsert) as any)
            }

            toast.success("Receta guardada exitosamente")
            setIsFormOpen(false)
            fetchRecipes()
        } catch (error: any) {
            toast.error("Error al guardar la receta", { description: error.message })
        } finally {
            setIsLoading(false)
        }
    }

    const handleDuplicate = async (recipe: any) => {
        // Simple duplication logic
        toast.info("Duplicando receta...")
        try {
            // Fetch detailed info
            const { data: detailed } = await (supabase
                .from('recipes')
                .select('*, recipe_items(*), recipe_operations(*)')
                .eq('id', recipe.id)
                .single() as any)

            if (detailed) {
                const { data: newRecipe } = await (supabase.from('recipes').insert([{
                    ...detailed,
                    id: undefined,
                    created_at: undefined,
                    descripcion: `${detailed.descripcion} (Copia)`,
                    estado: 'BORRADOR'
                }]).select().single() as any)

                if (newRecipe) {
                    await (supabase.from('recipe_items').insert(detailed.recipe_items.map((i: any) => ({ ...i, id: undefined, recipe_id: newRecipe.id }))) as any)
                    await (supabase.from('recipe_operations').insert(detailed.recipe_operations.map((o: any) => ({ ...o, id: undefined, recipe_id: newRecipe.id }))) as any)
                    toast.success("Receta duplicada (en modo borrador)")
                    fetchRecipes()
                }
            }
        } catch (e) {
            toast.error("Error al duplicar")
        }
    }

    return (
        <div className="space-y-6">
            {!isFormOpen ? (
                <>
                    <div className="flex items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            {/* @ts-ignore */}
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar fichas técnicas..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-pink-500/10 outline-none transition-all"
                            />
                        </div>
                        <button
                            onClick={() => handleOpenForm()}
                            className="flex items-center gap-2 px-6 py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-black rounded-xl shadow-lg shadow-pink-600/20 transition-all uppercase text-xs tracking-widest"
                        >
                            {/* @ts-ignore */}
                            <Plus size={18} />
                            Nueva Receta
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recipes.filter(r =>
                            r.product?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            r.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
                        ).map((recipe) => (
                            <div key={recipe.id} className="bg-white rounded-[2rem] border border-slate-200 p-6 space-y-4 hover:shadow-xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-pink-50 rounded-bl-[4rem] -mr-8 -mt-8 group-hover:bg-pink-100 transition-colors" />

                                <div className="flex items-start justify-between relative">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-900/20">
                                            {/* @ts-ignore */}
                                            <Package size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-900 tracking-tight leading-tight">{recipe.product?.nombre}</h3>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{recipe.product?.codigo}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleDuplicate(recipe)}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                            title="Duplicar"
                                        >
                                            {/* @ts-ignore */}
                                            <Copy size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleOpenForm(recipe)}
                                            className="p-2 text-slate-400 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-all"
                                            title="Editar"
                                        >
                                            {/* @ts-ignore */}
                                            <Settings size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2 border-t border-slate-50 pt-4 relative">
                                    <p className="text-xs text-slate-500 font-medium line-clamp-2 italic">
                                        {recipe.descripcion || "Sin descripción de proceso."}
                                    </p>
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-tighter">
                                        <div className="flex items-center gap-1 text-slate-400">
                                            {/* @ts-ignore */}
                                            <Box size={12} />
                                            <span>S/ {recipe.costos_indirectos?.toFixed(2)} Indirectos</span>
                                        </div>
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-full",
                                            recipe.estado === 'ACTIVA' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                                        )}>
                                            {recipe.estado}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleOpenForm(recipe)}
                                    className="w-full py-3 bg-slate-50 group-hover:bg-slate-900 group-hover:text-white text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
                                >
                                    Ver Ficha Técnica
                                    {/* @ts-ignore */}
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                    <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-pink-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-pink-600/20">
                                {/* @ts-ignore */}
                                <Settings size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight italic">
                                    {editingRecipe ? 'Editar Receta' : 'Nueva Receta de Producción'}
                                </h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Definición de Insumos y Servicios</p>
                            </div>
                        </div>
                        <button type="button" onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400">
                            {/* @ts-ignore */}
                            <Trash2 size={24} />
                        </button>
                    </div>

                    <div className="p-8 space-y-10">
                        {/* Datos Básicos */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Producto Final</label>
                                <select
                                    required
                                    value={formData.product_id}
                                    onChange={e => setFormData({ ...formData, product_id: e.target.value })}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all"
                                >
                                    <option value="">Seleccionar producto...</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.nombre} ({p.codigo})</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Costos Indirectos (Monto Fijo)</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">S/</div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.costos_indirectos}
                                        onChange={e => setFormData({ ...formData, costos_indirectos: parseFloat(e.target.value) || 0 })}
                                        className="w-full pl-10 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Descripción del Proceso / Notas</label>
                                <textarea
                                    value={formData.descripcion}
                                    onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                                    rows={3}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-900 focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all"
                                    placeholder="Detalla pasos críticos de confección o acabados..."
                                />
                            </div>
                        </div>

                        {/* Insumos */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                                    {/* @ts-ignore */}
                                    <Box size={16} className="text-pink-600" />
                                    Materiales e Insumos (Receta)
                                </h3>
                                <button
                                    type="button"
                                    onClick={handleAddItem}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-pink-600 transition-all"
                                >
                                    {/* @ts-ignore */}
                                    <Plus size={14} />
                                    Agregar Material
                                </button>
                            </div>

                            <div className="bg-slate-50 rounded-[2rem] border border-slate-100 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-white/50 border-b border-slate-100">
                                        <tr className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                            <th className="px-6 py-4">Insumo</th>
                                            <th className="px-6 py-4 text-right">Cant. Unitaria</th>
                                            <th className="px-6 py-4 text-right">Merma (%)</th>
                                            <th className="px-6 py-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {formData.items.map((item, index) => (
                                            <tr key={index} className="group hover:bg-white/40 transition-all">
                                                <td className="px-6 py-4">
                                                    <select
                                                        value={item.material_id}
                                                        onChange={e => {
                                                            const newItems = [...formData.items]
                                                            newItems[index].material_id = e.target.value
                                                            setFormData({ ...formData, items: newItems })
                                                        }}
                                                        className="w-full bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 outline-none cursor-pointer"
                                                    >
                                                        <option value="">Seleccionar material...</option>
                                                        {materials.map(m => <option key={m.id} value={m.id}>{m.nombre} ({m.codigo})</option>)}
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <input
                                                        type="number"
                                                        step="0.001"
                                                        value={item.cantidad}
                                                        onChange={e => {
                                                            const newItems = [...formData.items]
                                                            newItems[index].cantidad = parseFloat(e.target.value) || 0
                                                            setFormData({ ...formData, items: newItems })
                                                        }}
                                                        className="w-24 bg-transparent border-b border-slate-200 text-right text-sm font-black text-pink-600 focus:border-pink-500 outline-none"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        value={item.merma_porcentaje}
                                                        onChange={e => {
                                                            const newItems = [...formData.items]
                                                            newItems[index].merma_porcentaje = parseFloat(e.target.value) || 0
                                                            setFormData({ ...formData, items: newItems })
                                                        }}
                                                        className="w-16 bg-transparent border-b border-slate-200 text-right text-sm font-bold text-slate-400 focus:border-pink-500 outline-none"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button type="button" onClick={() => handleRemoveItem(index)} className="p-2 text-slate-300 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100">
                                                        {/* @ts-ignore */}
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Operaciones / Servicios */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                                    {/* @ts-ignore */}
                                    <Factory size={16} className="text-pink-600" />
                                    Operaciones y Servicios (Tercerización)
                                </h3>
                                <button
                                    type="button"
                                    onClick={handleAddOperation}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all"
                                >
                                    {/* @ts-ignore */}
                                    <Plus size={14} />
                                    Agregar Servicio
                                </button>
                            </div>

                            <div className="bg-slate-50 rounded-[2rem] border border-slate-100 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-white/50 border-b border-slate-100">
                                        <tr className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                            <th className="px-6 py-4">Tipo de Operación</th>
                                            <th className="px-6 py-4 text-right">Costo Base Servi.</th>
                                            <th className="px-6 py-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {formData.operations.map((op, index) => (
                                            <tr key={index} className="group hover:bg-white/40 transition-all">
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="text"
                                                        value={op.tipo_operacion}
                                                        onChange={e => {
                                                            const newOps = [...formData.operations]
                                                            newOps[index].tipo_operacion = e.target.value
                                                            setFormData({ ...formData, operations: newOps })
                                                        }}
                                                        placeholder="Ej: Bordado de espalda"
                                                        className="w-full bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 outline-none"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={op.costo_base}
                                                        onChange={e => {
                                                            const newOps = [...formData.operations]
                                                            newOps[index].costo_base = parseFloat(e.target.value) || 0
                                                            setFormData({ ...formData, operations: newOps })
                                                        }}
                                                        className="w-24 bg-transparent border-b border-slate-200 text-right text-sm font-black text-blue-600 focus:border-blue-500 outline-none"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button type="button" onClick={() => handleRemoveOperation(index)} className="p-2 text-slate-300 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100">
                                                        {/* @ts-ignore */}
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-4 text-slate-400 font-bold hover:text-slate-900 transition-colors uppercase text-[10px] tracking-widest">
                            Cancelar
                        </button>
                        <button
                            disabled={isLoading}
                            type="submit"
                            className="px-10 py-4 bg-slate-900 hover:bg-pink-600 text-white rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95"
                        >
                            {/* @ts-ignore */}
                            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            {editingRecipe ? 'GUARDAR CAMBIOS' : 'CREAR RECETA FINAL'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    )
}
