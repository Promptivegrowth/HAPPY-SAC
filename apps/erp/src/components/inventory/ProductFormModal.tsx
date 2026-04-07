"use client"

import { useState, useEffect } from "react"
import {
    X,
    Save,
    Globe,
    Tag,
    Info,
    DollarSign,
    Box,
    Hash,
    CheckCircle2,
    Loader2,
    Package
} from "lucide-react"
import { cn } from "@/lib/utils"
// En un proyecto real usaríamos Radix UI Dialog, aquí usaremos un portal simple o un overlay
import { createClient } from "@/lib/supabase/client"

interface ProductFormModalProps {
    isOpen: boolean
    onClose: () => void
    product?: any // Si existe, es edición
    onSave: (data: any) => void
}

export function ProductFormModal({ isOpen, onClose, product, onSave }: ProductFormModalProps) {
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [categories, setCategories] = useState<any[]>([])
    const [formData, setFormData] = useState<any>({
        nombre: "",
        codigo: "",
        categoria_id: "",
        tipo_item: "PRODUCTO",
        // Web Sync Fields
        publicar_web: false,
        nombre_web: "",
        precio_venta_base: 0,
        en_oferta: false,
        precio_oferta: 0,
        stock_inicial: 0
    })

    useEffect(() => {
        if (isOpen) {
            fetchInitialData()
            if (product) {
                setFormData({
                    ...product,
                    nombre_web: product.nombre_web || product.nombre,
                    precio_venta_base: product.precio_venta_base || 0
                })
            } else {
                setFormData({
                    nombre: "",
                    codigo: "",
                    categoria_id: "",
                    tipo_item: "PRODUCTO",
                    publicar_web: false,
                    nombre_web: "",
                    precio_venta_base: 0,
                    en_oferta: false,
                    precio_oferta: 0,
                    stock_inicial: 0
                })
            }
        }
    }, [isOpen, product])

    const fetchInitialData = async () => {
        const { data } = await (supabase.from('categories') as any).select('*').eq('tipo', 'PRODUCTO')
        if (data) setCategories(data)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const { stock_inicial, ...dataToSave } = formData
            const table = supabase.from('products') as any
            const { data, error } = product
                ? await table.update(dataToSave).eq('id', product.id).select()
                : await table.insert([{ ...dataToSave, company_id: product?.company_id || null }]).select()

            if (error) throw error
            const newProduct = data[0]

            // 1. Manejo de Tallas y Stock para productos nuevos
            if (!product) {
                if (formData.tipo_item === 'PRODUCTO') {
                    // Creamos la talla por defecto manualmente para asegurar su existencia
                    const { data: sizeData, error: sizeError } = await (supabase.from('product_sizes') as any)
                        .insert([{
                            product_id: newProduct.id,
                            talla: 'STD',
                            precio_venta: formData.precio_venta_base,
                            precio_web: formData.precio_venta_base,
                            precio_oferta: formData.precio_oferta,
                            en_oferta: formData.en_oferta,
                            activo: true,
                            publicar_web: true,
                            orden: 1,
                            stock: stock_inicial // Opcional, pero mantendremos stock_movement como fuente de verdad
                        }])
                        .select()
                        .single()

                    if (sizeError) console.error("Error creating default size:", sizeError)

                    // 2. Registro de Stock Inicial en Almacén Central
                    if (stock_inicial > 0 && sizeData) {
                        const { error: stockError } = await (supabase.from('product_stock') as any).insert({
                            product_size_id: sizeData.id,
                            warehouse_id: 'edefaec8-15fd-4327-8069-2bde7e67ce48',
                            cantidad: stock_inicial,
                            tipo_movimiento: 'ENTRADA',
                            motivo: 'Stock inicial en creación'
                        })
                        if (stockError) console.error("Error creating initial stock movement:", stockError)
                    }
                } else {
                    // Es un MATERIAL, el stock va directo a material_stock
                    if (stock_inicial > 0) {
                        const { error: stockError } = await (supabase.from('material_stock') as any).insert({
                            product_id: newProduct.id,
                            warehouse_id: 'c9890ec9-1939-40c8-8be4-dabb0210cd03', // Almacén de Insumos
                            cantidad: stock_inicial,
                            tipo_movimiento: 'ENTRADA',
                            motivo: 'Stock inicial en creación'
                        })
                        if (stockError) console.error("Error creating initial material stock:", stockError)
                    }
                }
            }

            // Para que aparezca en la lista sin refrescar, mockeamos lo que la vista esperaría
            const itemForList = {
                ...newProduct,
                stock: stock_inicial,
                talla: formData.tipo_item === 'PRODUCTO' ? 'STD' : null,
                clasificacion: categories.find(c => c.id === formData.categoria_id)?.nombre || 'General'
            }

            onSave(itemForList)
            onClose()
        } catch (error) {
            console.error("Error saving product:", error)
            alert("No se pudo guardar: " + (error as any).message)
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <form onSubmit={handleSubmit} className="flex flex-col h-[85vh]">
                    {/* Header */}
                    <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-pink-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-pink-600/20">
                                {/* @ts-ignore */}
                                <Package size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">{product ? 'Editar Item' : 'Nuevo Item'}</h2>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Información Técnica e Integración Web</p>
                            </div>
                        </div>

                        {/* Tipo de Item Toggle */}
                        <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl gap-1">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, tipo_item: 'PRODUCTO' })}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all",
                                    formData.tipo_item === 'PRODUCTO' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                Producto
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, tipo_item: 'MATERIAL' })}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all",
                                    formData.tipo_item === 'MATERIAL' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                Material
                            </button>
                        </div>

                        <button type="button" onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors text-slate-900">
                            {/* @ts-ignore */}
                            <X size={20} className="text-slate-400" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-12 scrollbar-hide">
                        {/* Básicos */}
                        <section className="space-y-6">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                                {/* @ts-ignore */}
                                <Info size={16} className="text-slate-300" />
                                Datos Generales
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Nombre del Item</label>
                                    <input
                                        required
                                        value={formData.nombre}
                                        onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all shadow-inner text-slate-900"
                                        placeholder="Ej: Spiderman Kid Premium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Código (SKU)</label>
                                    <input
                                        required
                                        value={formData.codigo}
                                        onChange={e => setFormData({ ...formData, codigo: e.target.value })}
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-mono focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all shadow-inner uppercase text-slate-900"
                                        placeholder="HS-SPID-01"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Categoría</label>
                                    <select
                                        value={formData.categoria_id}
                                        onChange={e => setFormData({ ...formData, categoria_id: e.target.value })}
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all shadow-inner text-slate-900"
                                    >
                                        <option value="">Seleccionar...</option>
                                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Precio de Venta (Base)</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">S/</div>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.precio_venta_base}
                                            onChange={e => setFormData({ ...formData, precio_venta_base: parseFloat(e.target.value) })}
                                            className="w-full pl-10 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all shadow-inner text-slate-900"
                                        />
                                    </div>
                                </div>
                                {!product && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-pink-600 tracking-wider">Stock Inicial</label>
                                        <div className="relative">
                                            {/* @ts-ignore */}
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-600"><Hash size={14} /></div>
                                            <input
                                                type="number"
                                                value={formData.stock_inicial}
                                                onChange={e => setFormData({ ...formData, stock_inicial: parseInt(e.target.value) })}
                                                className="w-full pl-10 pr-5 py-3.5 bg-pink-50 border border-pink-100 rounded-2xl text-sm font-black text-pink-600 focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all shadow-inner"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Integración Web */}
                        <section className="bg-slate-900 rounded-[2.5rem] p-4 text-white shadow-2xl shadow-slate-900/20">
                            <div className="p-6 md:p-10 space-y-8">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-pink-600 rounded-xl flex items-center justify-center">
                                            {/* @ts-ignore */}
                                            <Globe size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black tracking-tight">Sync E-commerce</h3>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Publicación y Catálogo Web</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl">
                                        <span className="text-xs font-bold text-slate-400 ml-2">¿PUBLICAR EN WEB?</span>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, publicar_web: !formData.publicar_web })}
                                            className={cn(
                                                "w-12 h-6 rounded-full transition-all relative p-1",
                                                formData.publicar_web ? "bg-pink-600" : "bg-slate-700"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-4 h-4 bg-white rounded-full transition-all shadow-lg",
                                                formData.publicar_web ? "ml-auto" : "ml-0"
                                            )} />
                                        </button>
                                    </div>
                                </div>

                                <div className={cn(
                                    "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-500",
                                    !formData.publicar_web && "opacity-30 pointer-events-none grayscale"
                                )}>
                                    <div className="space-y-2 lg:col-span-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Nombre Público (Web)</label>
                                        <input
                                            value={formData.nombre_web}
                                            onChange={e => setFormData({ ...formData, nombre_web: e.target.value })}
                                            className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-sm focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all"
                                            placeholder="Nombre marketinero para la tienda..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Precio Sincronizado</label>
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-400 tracking-tight">Vínculo al base</span>
                                            <span className="text-lg font-accent font-bold text-pink-500">S/ {formData.precio_venta_base}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Promoción</label>
                                        <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5">
                                            <input
                                                type="checkbox"
                                                checked={formData.en_oferta}
                                                onChange={e => setFormData({ ...formData, en_oferta: e.target.checked })}
                                                className="w-5 h-5 accent-pink-600 rounded-lg cursor-pointer"
                                            />
                                            <span className="text-xs font-bold">Activar Oferta</span>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "space-y-2 transition-all",
                                        !formData.en_oferta && "opacity-0 invisible h-0 overflow-hidden"
                                    )}>
                                        <label className="text-[10px] font-black uppercase text-pink-500 tracking-wider">Precio de Oferta</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-500 text-xs font-bold">S/</div>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={formData.precio_oferta}
                                                onChange={e => setFormData({ ...formData, precio_oferta: parseFloat(e.target.value) })}
                                                className="w-full pl-10 pr-5 py-3.5 bg-white/5 border border-pink-500/30 rounded-2xl text-sm font-black text-pink-500 focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all shadow-[0_0_20px_-10px_rgba(219,39,119,0.5)]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Footer */}
                    <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-6 py-3.5 text-slate-400 font-bold hover:text-slate-900 transition-colors uppercase text-[10px] tracking-widest">
                            Cancelar
                        </button>
                        <button
                            disabled={loading}
                            type="submit"
                            className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95"
                        >
                            {/* @ts-ignore */}
                            {loading && <Loader2 className="animate-spin" size={18} />}
                            {/* @ts-ignore */}
                            {!loading && <Save size={18} />}
                            {product ? 'GUARDAR ACTUALIZACIÓN' : 'CREAR ITEM'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
