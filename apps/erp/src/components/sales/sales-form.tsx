"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
    Plus,
    Trash2,
    Save,
    ArrowLeft,
    ShoppingCart,
    Users,
    Search,
    Loader2,
    CheckCircle2,
    Minus
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function SalesForm({ customers, products }: { customers: any[], products: any[] }) {
    const router = useRouter()
    const supabase = createClient()
    const [isLoading, setIsLoading] = useState(false)
    const [selectedCustomer, setSelectedCustomer] = useState<string>("")
    const [items, setItems] = useState<any[]>([])

    // UI states for adding item
    const [tempProduct, setTempProduct] = useState<string>("")
    const [tempSize, setTempSize] = useState<string>("")
    const [tempQuantity, setTempQuantity] = useState<number>(1)
    const [tempSizes, setTempSizes] = useState<any[]>([])

    useEffect(() => {
        if (tempProduct) {
            const fetchSizes = async () => {
                const { data } = await supabase
                    .from('product_sizes')
                    .select('*')
                    .eq('product_id', tempProduct)
                    .order('orden', { ascending: true })
                setTempSizes(data || [])
                setTempSize("")
            }
            fetchSizes()
        }
    }, [tempProduct, supabase])

    const addItem = () => {
        if (!tempProduct || !tempSize || tempQuantity <= 0) {
            toast.error("Selecciona producto, talla y cantidad")
            return
        }

        const product = products.find(p => p.id === tempProduct)
        const size = tempSizes.find(s => s.id === tempSize)

        const newItem = {
            product_id: tempProduct,
            product_size_id: tempSize,
            nombre: product.nombre,
            talla: size.talla,
            cantidad: tempQuantity,
            precio_unitario: size.precio_venta || product.precio_venta_base,
            subtotal: (size.precio_venta || product.precio_venta_base) * tempQuantity
        }

        setItems([...items, newItem])
        setTempProduct("")
        setTempSize("")
        setTempQuantity(1)
        toast.success("Item agregado")
    }

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index))
    }

    const total = items.reduce((acc, item) => acc + item.subtotal, 0)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedCustomer || items.length === 0) {
            toast.error("Selecciona un cliente y agrega al menos un item")
            return
        }

        setIsLoading(true)
        try {
            const { data: company } = await supabase.from('companies').select('id').single()

            // 1. Crear la venta
            const { data: sale, error: saleError } = await supabase
                .from('sales')
                .insert({
                    company_id: company?.id,
                    customer_id: selectedCustomer,
                    tipo_comprobante: 'BOLETA', // Por defecto para el MVP
                    serie: 'B001',
                    numero: Math.floor(Math.random() * 10000), // En prod esto lo maneja la DB trigger
                    moneda: 'S/',
                    total: total,
                    estado_pago: 'PAGADO',
                    sunat_estado: 'PENDIENTE'
                })
                .select()
                .single()

            if (saleError) throw saleError

            // 2. Crear los items de la venta
            const saleItems = items.map(item => ({
                sale_id: sale.id,
                product_id: item.product_id,
                product_size_id: item.product_size_id,
                cantidad: item.cantidad,
                precio_unitario: item.precio_unitario,
                subtotal: item.subtotal
            }))

            const { error: itemsError } = await supabase
                .from('sale_items')
                .insert(saleItems)

            if (itemsError) throw itemsError

            toast.success("Venta registrada con éxito")
            router.push("/sales")
            router.refresh()
        } catch (err: any) {
            toast.error("Error al registrar la venta", { description: err.message })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-900 transition-all">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Nueva <span className="text-pink-600">Venta</span></h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Cliente y Selección */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Users size={14} className="text-blue-500" />
                                Información del Cliente
                            </h3>
                            <select
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all font-bold text-slate-900"
                                value={selectedCustomer}
                                onChange={(e) => setSelectedCustomer(e.target.value)}
                                required
                            >
                                <option value="">Seleccionar Cliente...</option>
                                {customers.map(c => <option key={c.id} value={c.id}>{c.nombre_completo} ({c.nro_doc})</option>)}
                            </select>
                        </div>

                        <div className="pt-6 border-t border-slate-100 space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <ShoppingCart size={14} className="text-pink-500" />
                                Agregar Productos
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="sm:col-span-1">
                                    <select
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold"
                                        value={tempProduct}
                                        onChange={(e) => setTempProduct(e.target.value)}
                                    >
                                        <option value="">Producto...</option>
                                        {products.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <select
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold disabled:opacity-50"
                                        value={tempSize}
                                        onChange={(e) => setTempSize(e.target.value)}
                                        disabled={!tempProduct}
                                    >
                                        <option value="">Talla...</option>
                                        {tempSizes.map(s => <option key={s.id} value={s.id}>T {s.talla}</option>)}
                                    </select>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        className="w-20 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-center"
                                        value={tempQuantity}
                                        onChange={(e) => setTempQuantity(Number(e.target.value))}
                                    />
                                    <button
                                        type="button"
                                        onClick={addItem}
                                        className="flex-1 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-pink-600 transition-all"
                                    >
                                        Agregar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabla de Items */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    <th className="px-8 py-5">Producto / Talla</th>
                                    <th className="px-8 py-5 text-center">Cant.</th>
                                    <th className="px-8 py-5 text-right">Unitario</th>
                                    <th className="px-8 py-5 text-right">Subtotal</th>
                                    <th className="px-8 py-5"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {items.map((item, i) => (
                                    <tr key={i} className="group transition-colors hover:bg-slate-50/50">
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-900">{item.nombre}</span>
                                                <span className="text-[10px] text-pink-500 font-bold uppercase tracking-wider">Talla {item.talla}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className="text-sm font-black text-slate-700">{item.cantidad}</span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <span className="text-sm font-bold text-slate-400 italic">S/ {item.precio_unitario.toFixed(2)}</span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <span className="text-base font-black text-slate-900">S/ {item.subtotal.toFixed(2)}</span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button onClick={() => removeItem(i)} className="p-2 text-slate-200 hover:text-rose-500 transition-colors">
                                                <Minus size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {items.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-16 text-center text-slate-400 italic font-medium">No hay productos en la venta.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Resumen Final */}
                <div className="space-y-6">
                    <div className="bg-slate-900 p-8 rounded-[3rem] text-white space-y-8 shadow-2xl shadow-slate-900/30">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-pink-500 border-b border-white/10 pb-4">Checkout Venta</h3>

                        <div className="space-y-6">
                            <div className="flex justify-between items-center opacity-60">
                                <span className="text-xs font-medium">Subtotal</span>
                                <span className="text-sm font-bold">S/ {(total / 1.18).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center opacity-60">
                                <span className="text-xs font-medium">IGV (18%)</span>
                                <span className="text-sm font-bold">S/ {(total - (total / 1.18)).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-6 border-t border-white/10">
                                <span className="text-base font-black tracking-widest uppercase">Total Final</span>
                                <span className="text-4xl font-black text-pink-500 tracking-tighter italic">S/ {total.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4">
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading || items.length === 0 || !selectedCustomer}
                                className="w-full h-16 bg-white text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-pink-500 hover:text-white transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                                Registrar Venta
                            </button>
                            <button className="w-full py-4 text-white/40 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all">Cancelar Operación</button>
                        </div>
                    </div>

                    <div className="p-8 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center gap-3 text-slate-900">
                            <Search size={20} className="text-pink-500" />
                            <h4 className="text-sm font-black uppercase tracking-widest">Atajos SUNAT</h4>
                        </div>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed italic">Esta operación generará automáticamente una **Boleta Electrónica** sincronizada con el simulador SUNAT.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
