"use client"

import { useState } from "react"
import {
    Search,
    Filter,
    Plus,
    MoreVertical,
    Edit,
    Trash2,
    Globe,
    Tag,
    Shapes,
    Package,
    ArrowUpDown,
    History
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ProductFormModal } from "./ProductFormModal"
import KardexModal from "./KardexModal"
import { createClient } from "@/lib/supabase/client"

interface ProductListProps {
    initialData: any[]
}

export function ProductList({ initialData }: ProductListProps) {
    const [search, setSearch] = useState("")
    const [activeTab, setActiveTab] = useState<"materials" | "products">("materials")
    const [items, setItems] = useState(initialData)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState<any>(null)
    const [selectedItemForKardex, setSelectedItemForKardex] = useState<any>(null)
    const [isKardexOpen, setIsKardexOpen] = useState(false)

    const handleSave = (savedProduct: any) => {
        if (editingProduct) {
            setItems(items.map(item => item.id === savedProduct.id ? savedProduct : item))
        } else {
            setItems([savedProduct, ...items])
        }
    }

    const handleEdit = (product: any) => {
        setEditingProduct(product)
        setIsModalOpen(true)
    }

    const handleNew = () => {
        setEditingProduct(null)
        setIsModalOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("¿Deseas descontinuar este producto? Esto lo ocultará de los catálogos pero mantendrá su historial.")) return

        const supabase = createClient()
        // Borrado lógico (Soft Delete)
        const { error } = await supabase
            .from('products')
            .update({ activo: false })
            .eq('id', id)

        if (error) {
            console.error("Error disabling product:", error)
            alert("Error al eliminar el producto")
        } else {
            setItems(items.filter(item => item.id !== id))
        }
    }

    // Filtramos localmente para respuesta inmediata
    const filteredData = items.filter(item => {
        const matchesSearch = item.nombre.toLowerCase().includes(search.toLowerCase()) ||
            item.codigo.toLowerCase().includes(search.toLowerCase())
        const matchesTab = activeTab === "materials" ? item.tipo_item === "MATERIAL" : item.tipo_item === "PRODUCTO"
        const isActivo = item.activo !== false
        return matchesSearch && matchesTab && isActivo
    })

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl w-fit">
                    <button
                        onClick={() => setActiveTab("materials")}
                        className={cn(
                            "px-6 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2",
                            activeTab === "materials" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                        )}
                    >
                        {/* @ts-ignore */}
                        <Shapes size={16} />
                        Materiales
                    </button>
                    <button
                        onClick={() => setActiveTab("products")}
                        className={cn(
                            "px-6 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2",
                            activeTab === "products" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                        )}
                    >
                        {/* @ts-ignore */}
                        <Package size={16} />
                        Productos
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        {/* @ts-ignore */}
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all shadow-sm w-64"
                        />
                    </div>
                    <button
                        onClick={handleNew}
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all shadow-lg shadow-slate-900/10"
                    >
                        {/* @ts-ignore */}
                        <Plus size={18} />
                        Nuevo
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-widest font-black">
                                <th className="px-6 py-5 border-b border-slate-100">Item / Código</th>
                                <th className="px-6 py-5 border-b border-slate-100">Categoría</th>
                                {activeTab === "products" && <th className="px-6 py-5 border-b border-slate-100 text-center">Web</th>}
                                <th className="px-6 py-5 border-b border-slate-100 text-right">Stock</th>
                                <th className="px-6 py-5 border-b border-slate-100 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredData.map((item) => (
                                <tr key={`${item.codigo}-${item.talla || ''}`} className="hover:bg-slate-50/80 transition-all group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 font-black text-xs group-hover:bg-pink-50 group-hover:text-pink-200 transition-colors">
                                                {item.nombre.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-slate-900">{item.nombre}</span>
                                                    {item.talla && (
                                                        <span className="px-1.5 py-0.5 bg-pink-50 text-pink-600 rounded text-[9px] font-black border border-pink-100">
                                                            T:{item.talla}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-slate-400 font-mono italic">{item.codigo}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider">
                                            {/* @ts-ignore */}
                                            <Tag size={10} />
                                            {item.clasificacion}
                                        </span>
                                    </td>
                                    {activeTab === "products" && (
                                        <td className="px-6 py-5 text-center">
                                            {item.publicar_web ? (
                                                <div className="flex justify-center">
                                                    {/* @ts-ignore */}
                                                    <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100" title="Visible en Web">
                                                        {/* @ts-ignore */}
                                                        <Globe size={16} />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex justify-center opacity-20 filter grayscale">
                                                    <div className="w-9 h-9 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center border border-slate-200">
                                                        {/* @ts-ignore */}
                                                        <Globe size={16} />
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                    )}
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className={cn(
                                                "text-lg font-black tracking-tight",
                                                item.stock <= 5 ? "text-rose-600" : "text-slate-900"
                                            )}>
                                                {item.stock}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase">{item.unidad}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all text-neutral-x-400">
                                            <button
                                                onClick={() => {
                                                    setSelectedItemForKardex(item)
                                                    setIsKardexOpen(true)
                                                }}
                                                className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                title="Ver Kardex (Historial)"
                                            >
                                                <History size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="p-2.5 text-slate-400 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-all"
                                            >
                                                {/* @ts-ignore */}
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                            >
                                                {/* @ts-ignore */}
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ProductFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={editingProduct}
                onSave={handleSave}
            />

            <KardexModal
                isOpen={isKardexOpen}
                onClose={() => setIsKardexOpen(false)}
                item={selectedItemForKardex}
            />
        </div>
    )
}
