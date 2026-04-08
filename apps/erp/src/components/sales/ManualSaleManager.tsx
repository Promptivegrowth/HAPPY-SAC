"use client"

import { useState } from "react"
import { Plus, X, Search, ShoppingCart, User, CreditCard, Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

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

    // Form State
    const [saleType, setSaleType] = useState<'FISICA' | 'ECOMMERCE' | 'MAYORISTA'>('FISICA')

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

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsOpen(false)} />

            <div className="relative bg-white w-full max-w-4xl h-[85vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
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
                    {/* Sidebar: Pasos */}
                    <div className="w-64 bg-slate-50/30 p-8 border-r border-slate-100 hidden md:block">
                        <div className="space-y-6">
                            {[
                                { n: 1, title: 'Tipo de Venta', desc: 'Canal y origen' },
                                { n: 2, title: 'Cliente', desc: 'Datos de facturación' },
                                { n: 3, title: 'Productos', desc: 'Ítems y cantidades' },
                                { n: 4, title: 'Pago', desc: 'Confirmación' }
                            ].map((s) => (
                                <div key={s.n} className={cn(
                                    "flex gap-4 group transition-all",
                                    step >= s.n ? "opacity-100" : "opacity-30"
                                )}>
                                    <div className={cn(
                                        "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all",
                                        step === s.n ? "bg-pink-600 text-white shadow-lg shadow-pink-200 scale-110" :
                                            step > s.n ? "bg-emerald-500 text-white" : "bg-white border-2 border-slate-100 text-slate-400"
                                    )}>
                                        {step > s.n ? <CheckIcon size={14} /> : s.n}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={cn("text-xs font-black uppercase tracking-widest", step === s.n ? "text-slate-900" : "text-slate-400")}>{s.title}</span>
                                        <span className="text-[10px] text-slate-400 font-medium">{s.desc}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 p-8 overflow-y-auto bg-white">
                        {step === 1 && (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-6">Seleccione Modalidad</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {[
                                            { id: 'FISICA', name: 'Tienda Física', icon: ShoppingCartIcon, desc: 'Venta directa en mostrador' },
                                            { id: 'ECOMMERCE', name: 'E-commerce', icon: SearchIcon, desc: 'Pedido web por confirmar' },
                                            { id: 'MAYORISTA', name: 'Mayorista', icon: UserIcon, desc: 'Venta industrial por volumen' }
                                        ].map((t: any) => (
                                            <button
                                                key={t.id}
                                                onClick={() => setSaleType(t.id)}
                                                className={cn(
                                                    "p-6 rounded-[2rem] border-2 transition-all text-left flex flex-col gap-4",
                                                    saleType === t.id ? "border-pink-500 bg-pink-50/30 shadow-xl shadow-pink-50 scale-[1.02]" : "border-slate-100 hover:border-slate-200"
                                                )}
                                            >
                                                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-all", saleType === t.id ? "bg-pink-600 text-white shadow-lg" : "bg-slate-50 text-slate-400")}>
                                                    <t.icon size={24} />
                                                </div>
                                                <div>
                                                    <p className={cn("text-sm font-black uppercase tracking-widest", saleType === t.id ? "text-pink-600" : "text-slate-400")}>{t.name}</p>
                                                    <p className="text-[11px] text-slate-400 font-medium mt-1 leading-relaxed">{t.desc}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {step > 1 && (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                                <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200">
                                    <Loader2Icon size={40} className="animate-spin" />
                                </div>
                                <div>
                                    <p className="text-slate-900 font-bold">Funcionalidad en Desarrollo</p>
                                    <p className="text-slate-400 text-sm italic">Integrando con el catálogo maestro...</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <button
                        disabled={step === 1}
                        onClick={() => setStep(s => s - 1)}
                        className="px-8 py-3 rounded-2xl font-bold text-slate-400 hover:text-slate-600 disabled:opacity-0 transition-all uppercase tracking-widest text-[10px]"
                    >
                        Anterior
                    </button>
                    <button
                        onClick={() => step < 4 ? setStep(s => s + 1) : setIsOpen(false)}
                        className="px-10 py-4 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-[1.5rem] transition-all shadow-xl shadow-slate-200 uppercase tracking-widest text-[10px] flex items-center gap-2"
                    >
                        {step === 4 ? 'Finalizar Registro' : 'Siguiente Paso'}
                        <CheckIcon size={14} />
                    </button>
                </div>
            </div>
        </div>
    )
}
