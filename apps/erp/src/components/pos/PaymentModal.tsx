"use client"

import { useState } from "react"
import { X, Smartphone, CreditCard, Banknote, Landmark, Check, Loader2, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

// Icon Wrappers for Linting
const XIcon = X as any
const SmartphoneIcon = Smartphone as any
const CreditCardIcon = CreditCard as any
const BanknoteIcon = Banknote as any
const LandmarkIcon = Landmark as any
const CheckIcon = Check as any
const Loader2Icon = Loader2 as any
const ArrowRightIcon = ArrowRight as any

interface PaymentModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (method: 'EFECTIVO' | 'YAPE' | 'PLIN' | 'TRANSFERENCIA', data: any) => void
    total: number
}

const PAYMENT_METHODS = [
    { id: 'EFECTIVO', name: 'Efectivo', icon: BanknoteIcon, color: 'bg-emerald-500', light: 'bg-emerald-50' },
    { id: 'YAPE', name: 'Yape', icon: SmartphoneIcon, color: 'bg-indigo-600', light: 'bg-indigo-50' },
    { id: 'PLIN', name: 'Plin', icon: SmartphoneIcon, color: 'bg-cyan-500', light: 'bg-cyan-50' },
    { id: 'TRANSFERENCIA', name: 'Transferencia', icon: LandmarkIcon, color: 'bg-slate-700', light: 'bg-slate-50' }
]

export function PaymentModal({ isOpen, onClose, onConfirm, total }: PaymentModalProps) {
    const [selectedMethod, setSelectedMethod] = useState<any>(null)
    const [receivedAmount, setReceivedAmount] = useState<string>(total.toString())
    const [loading, setLoading] = useState(false)

    if (!isOpen) return null

    const change = parseFloat(receivedAmount) - total

    const handleConfirm = () => {
        setLoading(true)
        // Simular un poco de feedback visual de procesamiento
        setTimeout(() => {
            onConfirm(selectedMethod.id, {
                received: parseFloat(receivedAmount),
                change: change > 0 ? change : 0
            })
            setLoading(false)
        }, 800)
    }

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
                {/* Panel Izquierdo: Selección */}
                <div className="flex-1 p-8 bg-slate-50/50">
                    <div className="mb-8">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Método de Pago</h2>
                        <p className="text-sm text-slate-400 font-medium">¿Cómo desea pagar el cliente?</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {PAYMENT_METHODS.map((method) => {
                            const MethodIcon = method.icon
                            const isSelected = selectedMethod?.id === method.id
                            return (
                                <button
                                    key={method.id}
                                    onClick={() => setSelectedMethod(method)}
                                    className={cn(
                                        "p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 text-center",
                                        isSelected
                                            ? "bg-white border-pink-500 shadow-xl shadow-pink-100 scale-[1.02]"
                                            : "bg-white/40 border-slate-100 hover:border-slate-200"
                                    )}
                                >
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg",
                                        method.color
                                    )}>
                                        <MethodIcon size={24} />
                                    </div>
                                    <span className={cn(
                                        "text-xs font-black uppercase tracking-widest",
                                        isSelected ? "text-pink-600" : "text-slate-400"
                                    )}>
                                        {method.name}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Panel Derecho: Confirmación */}
                <div className="flex-1 p-8 bg-white border-l border-slate-100">
                    <div className="h-full flex flex-col">
                        <div className="mb-auto">
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Resumen del Cobro</div>
                            <div className="flex items-baseline justify-between mb-8">
                                <span className="text-4xl font-black text-slate-900">S/ {total.toFixed(2)}</span>
                                <span className="text-xs font-bold text-slate-300">TOTAL A PAGAR</span>
                            </div>

                            {selectedMethod?.id === 'EFECTIVO' ? (
                                <div className="space-y-6 animate-in slide-in-from-top-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Monto Recibido</label>
                                        <div className="relative">
                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-400">S/</span>
                                            <input
                                                type="number"
                                                autoFocus
                                                value={receivedAmount}
                                                onChange={(e) => setReceivedAmount(e.target.value)}
                                                className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-6 py-5 text-2xl font-black focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100/50">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Vuelto</div>
                                        <div className="text-3xl font-black text-emerald-700">
                                            S/ {Math.max(0, change).toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            ) : selectedMethod ? (
                                <div className="flex flex-col items-center justify-center py-10 space-y-4 animate-in slide-in-from-top-4">
                                    <div className={cn("w-24 h-24 rounded-full flex items-center justify-center text-white", selectedMethod.color)}>
                                        {(() => {
                                            const MethodIcon = selectedMethod.icon
                                            return <MethodIcon size={40} />
                                        })()}
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-slate-900">Pago Digital vía {selectedMethod.name}</p>
                                        <p className="text-xs text-slate-400 mt-1">Valida la operación en tu dispositivo</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-40 flex items-center justify-center text-slate-300 flex-col gap-2">
                                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center border-2 border-dashed border-slate-200">
                                        <ArrowRightIcon size={20} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Seleccione método</span>
                                </div>
                            )}
                        </div>

                        <div className="pt-8">
                            <button
                                onClick={handleConfirm}
                                disabled={!selectedMethod || loading || (selectedMethod.id === 'EFECTIVO' && change < 0)}
                                className={cn(
                                    "w-full py-5 rounded-[2rem] font-black text-white transition-all shadow-xl flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]",
                                    selectedMethod ? "bg-slate-900 shadow-slate-200 hover:bg-slate-800" : "bg-slate-100 text-slate-400 pointer-events-none shadow-none"
                                )}
                            >
                                {loading ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <CheckIcon className="w-4 h-4" />}
                                {selectedMethod?.id === 'EFECTIVO' ? 'Finalizar Venta' : 'Confirmar Recepción'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
