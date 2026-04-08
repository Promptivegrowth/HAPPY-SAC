"use client"

import { useState, useEffect } from "react"
import { Plus, X, Search, ShoppingCart, User, CreditCard, Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { getActiveProducts, getCustomersList, createManualSale } from "../../app/(dashboard)/sales/actions"

// Icon Wrappers for Linting
const PlusIcon = Plus as any
const XIcon = X as any
const SearchIcon = Search as any
const ShoppingCartIcon = ShoppingCart as any
const UserIcon = User as any
const CreditCardIcon = CreditCard as any
const CheckIcon = Check as any
const Loader2Icon = Loader2 as any

export function ManualSaleManager() {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState(1)

    // Data State
    const [products, setProducts] = useState<any[]>([])
    const [customers, setCustomers] = useState<any[]>([])
    const [searchProduct, setSearchProduct] = useState("")
    const [searchCustomer, setSearchCustomer] = useState("")

    // Form State
    const [saleType, setSaleType] = useState<'FISICA' | 'ECOMMERCE' | 'MAYORISTA'>('FISICA')
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
    const [cart, setCart] = useState<any[]>([])
    const [paymentMethod, setPaymentMethod] = useState("EFECTIVO")

    // Load Data
    useEffect(() => {
        if (isOpen) {
            const loadData = async () => {
                setLoading(true)
                try {
                    const [p, c] = await Promise.all([getActiveProducts(), getCustomersList()])
                    setProducts(p as any[])
                    setCustomers(c as any[])
                } catch (err) {
                    console.error(err)
                } finally {
                    setLoading(false)
                }
            }
            loadData()
        }
    }, [isOpen])

    const addToCart = (product: any) => {
        const existing = cart.find(i => i.id === product.id)
        if (existing) {
            setCart(cart.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i))
        } else {
            setCart([...cart, { ...product, quantity: 1 }])
        }
    }

    const removeFromCart = (id: string) => {
        setCart(cart.filter(i => i.id !== id))
    }

    const total = cart.reduce((acc, item) => acc + (item.precio * item.quantity), 0)
    const igv = total * 0.18

    const handleFinish = async () => {
        setLoading(true)
        try {
            await createManualSale({
                customerId: selectedCustomer?.id,
                total: total,
                igv: igv,
                paymentMethod: paymentMethod,
                canal_venta: saleType,
                items: cart.map(i => ({
                    id: i.id,
                    quantity: i.quantity,
                    price: i.precio
                }))
            })
            setIsOpen(false)
            setStep(1)
            setCart([])
            setSelectedCustomer(null)
            window.location.reload() // Recargar para ver la nueva venta
        } catch (err) {
            alert("Error al registrar: " + (err as any).message)
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-xl shadow-lg shadow-pink-600/10 transition-all font-sans"
            >
                <PlusIcon size={18} />
                Nueva Venta (ERP)
            </button>
        )
    }

    const filteredProducts = products.filter(p => p.nombre.toLowerCase().includes(searchProduct.toLowerCase()))
    const filteredCustomers = customers.filter(c =>
        c.nombre_completo.toLowerCase().includes(searchCustomer.toLowerCase()) ||
        c.nro_doc?.includes(searchCustomer)
    )

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => (loading ? null : setIsOpen(false))} />

            <div className="relative bg-white w-full max-w-5xl h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 font-sans">
                {/* Header */}
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Registro de Venta Manual</h2>
                        <p className="text-sm text-slate-400 font-medium tracking-tight">Gestión administrativa de pedidos externos</p>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all shadow-sm"
                    >
                        <XIcon size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex">
                    {/* Stepper Sidebar */}
                    <div className="w-72 bg-slate-50/30 p-8 border-r border-slate-100">
                        <div className="space-y-6">
                            {[
                                { n: 1, title: 'Modalidad', desc: 'Canal de origen' },
                                { n: 2, title: 'Cliente', desc: 'Identificación' },
                                { n: 3, title: 'Carrito', desc: 'Productos y stock' },
                                { n: 4, title: 'Resumen', desc: 'Confirmación final' }
                            ].map((s) => (
                                <div key={s.n} className={cn(
                                    "flex gap-4 transition-all group",
                                    step >= s.n ? "opacity-100" : "opacity-30"
                                )}>
                                    <div className={cn(
                                        "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all",
                                        step === s.n ? "bg-pink-600 text-white shadow-xl shadow-pink-200" :
                                            step > s.n ? "bg-emerald-500 text-white" : "bg-white border text-slate-400"
                                    )}>
                                        {step > s.n ? <CheckIcon size={14} /> : s.n}
                                    </div>
                                    <div>
                                        <p className={cn("text-xs font-black uppercase tracking-widest", step === s.n ? "text-slate-900" : "text-slate-400")}>{s.title}</p>
                                        <p className="text-[10px] text-slate-400 font-medium">{s.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Totales Preview en Sidebar */}
                        {cart.length > 0 && (
                            <div className="mt-auto pt-8 border-t border-slate-100">
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Monto Previsto</p>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold text-slate-600">
                                        <span>Subtotal</span>
                                        <span>S/ {(total - igv).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-black text-slate-900">
                                        <span>TOTAL</span>
                                        <span>S/ {total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Stage Renderer */}
                    <div className="flex-1 p-10 overflow-y-auto bg-white">
                        {loading && step === 1 && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-300">
                                <Loader2Icon className="animate-spin mb-4" size={40} />
                                <p className="font-bold">Cargando ecosistema comercial...</p>
                            </div>
                        )}

                        {step === 1 && !loading && (
                            <div className="animate-in slide-in-from-right-4 duration-300 space-y-8">
                                <h3 className="text-xl font-bold text-slate-900">¿Cómo se realizó el pedido?</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[
                                        { id: 'FISICA', name: 'Presencial', icon: ShoppingCartIcon, desc: 'En mostrador / Mayorista interno' },
                                        { id: 'ECOMMERCE', name: 'Web / App', icon: SearchIcon, desc: 'Confirmación de pasarela' },
                                        { id: 'MAYORISTA', name: 'Volumen', icon: UserIcon, desc: 'Contratos industriales' }
                                    ].map((m: any) => (
                                        <button
                                            key={m.id}
                                            onClick={() => setSaleType(m.id)}
                                            className={cn(
                                                "p-8 rounded-[2.5rem] border-2 transition-all flex flex-col items-start gap-4 text-left",
                                                saleType === m.id ? "border-pink-500 bg-pink-50/10 shadow-xl shadow-pink-50 scale-[1.03]" : "border-slate-100 hover:border-slate-200 bg-slate-50/50"
                                            )}
                                        >
                                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", saleType === m.id ? "bg-pink-600 text-white shadow-lg" : "bg-white text-slate-400")}>
                                                <m.icon size={24} />
                                            </div>
                                            <div>
                                                <p className={cn("text-xs font-black uppercase tracking-widest", saleType === m.id ? "text-pink-600" : "text-slate-400")}>{m.name}</p>
                                                <p className="text-[11px] text-slate-400 font-medium mt-1 leading-relaxed">{m.desc}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="animate-in slide-in-from-right-4 duration-300 space-y-8">
                                <h3 className="text-xl font-bold text-slate-900">Asignar Cliente</h3>
                                <div className="relative group">
                                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-pink-500" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Buscar por nombre o DNI/RUC..."
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-pink-200 focus:bg-white transition-all text-sm font-medium"
                                        value={searchCustomer}
                                        onChange={(e) => setSearchCustomer(e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                                    {filteredCustomers.map((c) => (
                                        <button
                                            key={c.id}
                                            onClick={() => setSelectedCustomer(c)}
                                            className={cn(
                                                "p-5 rounded-3xl border-2 text-left flex items-center gap-4 transition-all",
                                                selectedCustomer?.id === c.id ? "border-pink-500 bg-pink-50 shadow-md" : "border-slate-100 hover:border-slate-200"
                                            )}
                                        >
                                            <div className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400"><UserIcon size={20} /></div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900">{c.nombre_completo}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{c.tipo_documento}: {c.nro_doc}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="animate-in slide-in-from-right-4 duration-300 flex gap-8 h-full overflow-hidden">
                                <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                                    <h3 className="text-xl font-bold text-slate-900">Catálogo de Productos</h3>
                                    <div className="relative">
                                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Filtrar catálogo..."
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none"
                                            value={searchProduct}
                                            onChange={(e) => setSearchProduct(e.target.value)}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {filteredProducts.map((p) => (
                                            <div key={p.id} className="p-4 bg-white border border-slate-100 rounded-3xl hover:shadow-lg transition-all flex items-center justify-between group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-100">
                                                        {p.imagen_url ? (
                                                            <img src={p.imagen_url} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <ShoppingCartIcon size={24} className="text-slate-200" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900">{p.nombre}</p>
                                                        <p className="text-lg font-black text-pink-600">S/ {p.precio.toFixed(2)}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 italic">En stock: {p.stock}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => addToCart(p)}
                                                    className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <PlusIcon size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="w-80 border-l border-slate-100 pl-8 overflow-y-auto">
                                    <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                                        Carrito
                                        <span className="text-xs font-black bg-slate-100 px-2 py-0.5 rounded-lg text-slate-400">{cart.length}</span>
                                    </h3>
                                    <div className="space-y-4">
                                        {cart.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-2xl group">
                                                <div className="text-xs font-black text-slate-700 max-w-[140px] truncate">{item.nombre}</div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-black italic text-slate-400">x{item.quantity}</span>
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-rose-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <XIcon size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {cart.length === 0 && (
                                            <div className="py-20 text-center text-slate-200 flex flex-col items-center">
                                                <ShoppingCartIcon size={40} className="mb-4 stroke-[1.5]" />
                                                <p className="text-[10px] font-black uppercase tracking-widest">Carrito Vacío</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="animate-in zoom-in-95 duration-300 h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto font-sans">
                                <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[3rem] flex items-center justify-center mb-8 shadow-2xl shadow-emerald-100">
                                    <CheckIcon size={48} className="stroke-[3]" />
                                </div>
                                <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight uppercase tracking-widest">Confirmar Venta</h3>
                                <div className="w-full bg-slate-50/50 rounded-[2.5rem] p-8 border-2 border-slate-100 space-y-6">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-bold text-slate-400 uppercase tracking-widest">Cliente</span>
                                        <span className="font-black text-slate-900">{selectedCustomer?.nombre_completo || 'General'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-bold text-slate-400 uppercase tracking-widest">Canal</span>
                                        <span className="font-black text-pink-600">{saleType}</span>
                                    </div>
                                    <div className="pt-6 border-t border-slate-200 flex justify-between items-end">
                                        <div className="text-left">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Monto Total</p>
                                            <p className="text-4xl font-black text-slate-900">S/ {total.toFixed(2)}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="text-[10px] font-bold text-slate-400 italic text-right">Monto incluye IGV</span>
                                            <select
                                                value={paymentMethod}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                className="bg-white border-2 border-slate-200 rounded-xl px-4 py-2 text-xs font-black shadow-sm outline-none focus:border-pink-500 transition-all cursor-pointer"
                                            >
                                                <option value="EFECTIVO">Efectivo</option>
                                                <option value="YAPE">Yape</option>
                                                <option value="PLIN">Plin</option>
                                                <option value="TRANSFERENCIA">Transferencia</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="p-10 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
                    <button
                        disabled={step === 1 || loading}
                        onClick={() => setStep(s => s - 1)}
                        className="px-8 py-3 rounded-2xl font-bold text-slate-400 hover:text-slate-900 transition-all uppercase tracking-widest text-xs flex items-center gap-2 disabled:opacity-0"
                    >
                        Regresar
                    </button>
                    <button
                        disabled={loading || (step === 2 && !selectedCustomer) || (step === 3 && cart.length === 0)}
                        onClick={step < 4 ? () => setStep(s => s + 1) : handleFinish}
                        className="px-12 py-5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-3xl transition-all shadow-2xl shadow-slate-200 uppercase tracking-widest text-xs flex items-center gap-3 disabled:bg-slate-200 disabled:shadow-none"
                    >
                        {loading ? (
                            <><Loader2Icon className="animate-spin" size={18} /> Procesando...</>
                        ) : step === 4 ? (
                            <><CreditCardIcon size={18} /> Confirmar y Emitir</>
                        ) : (
                            <>Siguiente Paso <CheckIcon size={18} /></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
