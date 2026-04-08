"use client"

import { useState, useEffect } from "react"
import { Lock, Unlock, Calculator, CreditCard, ChevronRight, Loader2, AlertCircle } from "lucide-react"
import { openCashShift, closeCashShift, getActiveShift } from "@/app/(dashboard)/pos/actions"
import { cn } from "@/lib/utils"

// Icon Wrappers for Linting
const LockIcon = Lock as any
const UnlockIcon = Unlock as any
const CalculatorIcon = Calculator as any
const ChevronRightIcon = ChevronRight as any
const Loader2Icon = Loader2 as any
const AlertCircleIcon = AlertCircle as any

interface CashShiftUIProps {
    onShiftChange: (shift: any) => void
}

export function CashShiftUI({ onShiftChange }: CashShiftUIProps) {
    const [shift, setShift] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [showOpenModal, setShowOpenModal] = useState(false)
    const [showCloseModal, setShowCloseModal] = useState(false)

    // Form states
    const [initialAmount, setInitialAmount] = useState("0")
    const [actualAmount, setActualAmount] = useState("")
    const [notes, setNotes] = useState("")
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        const checkShift = async () => {
            const activeShift = await getActiveShift()
            setShift(activeShift)
            onShiftChange(activeShift)
            setLoading(false)
        }
        checkShift()
    }, [])

    const handleOpen = async () => {
        setSubmitting(true)
        const res = await openCashShift(parseFloat(initialAmount))
        if (res.success) {
            setShift(res.shift)
            onShiftChange(res.shift)
            setShowOpenModal(false)
        } else {
            alert("Error al abrir caja: " + res.error)
        }
        setSubmitting(false)
    }

    const handleClose = async () => {
        setSubmitting(true)
        const res = await closeCashShift(shift.id, parseFloat(actualAmount), notes)
        if (res.success) {
            setShift(null)
            onShiftChange(null)
            setShowCloseModal(false)
        } else {
            alert("Error al cerrar caja: " + res.error)
        }
        setSubmitting(false)
    }

    if (loading) return null

    return (
        <>
            {/* Status Button (Bottom Right) */}
            <div className="fixed bottom-8 right-8 z-50">
                <button
                    onClick={() => shift ? setShowCloseModal(true) : setShowOpenModal(true)}
                    className={cn(
                        "group flex items-center gap-3 px-6 py-4 rounded-[1.5rem] transition-all shadow-2xl overflow-hidden relative",
                        shift
                            ? "bg-emerald-500 text-white hover:bg-emerald-600"
                            : "bg-slate-900 text-white hover:bg-slate-800"
                    )}
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center relative z-10",
                        shift ? "bg-white/20" : "bg-pink-500"
                    )}>
                        {shift ? <UnlockIcon size={20} /> : <LockIcon size={20} />}
                    </div>
                    <div className="flex flex-col items-start relative z-10 pr-2">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-70">
                            {shift ? "Caja de Ventas" : "Sistema Bloqueado"}
                        </span>
                        <span className="text-sm font-bold truncate max-w-[150px]">
                            {shift ? `Abierta (S/ ${shift.initial_amount})` : "Iniciar Turno"}
                        </span>
                    </div>
                    <div className="ml-2 pl-4 border-l border-white/20 block">
                        <span className="bg-white/20 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                            {shift ? "Cerrar" : "Abrir"}
                        </span>
                    </div>
                </button>
            </div>

            {/* Modal Apertura */}
            {showOpenModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
                    <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in-95 duration-200">
                        <div className="text-center space-y-4 mb-8">
                            <div className="w-16 h-16 bg-slate-900 text-white rounded-[1.2rem] flex items-center justify-center mx-auto shadow-xl">
                                <CalculatorIcon className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 mt-2">Apertura de Caja</h3>
                                <p className="text-sm text-slate-400 font-medium">Define el monto inicial para tu turno</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Efectivo Inicial (Base de Caja)</label>
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-400">S/</span>
                                    <input
                                        type="number"
                                        value={initialAmount}
                                        onChange={(e) => setInitialAmount(e.target.value)}
                                        className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-6 py-5 text-2xl font-black focus:ring-4 focus:ring-slate-500/10 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleOpen}
                                disabled={submitting}
                                className="w-full py-5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]"
                            >
                                {submitting ? <Loader2Icon className="w-4 h-4 animate-spin" /> : "Empezar a Vender"}
                                <ChevronRightIcon className="w-4 h-4" />
                            </button>

                            <button onClick={() => setShowOpenModal(false)} className="w-full py-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:text-slate-600 transition-colors">
                                Volver después
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Cierre */}
            {showCloseModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
                    <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in-95 duration-200">
                        <div className="text-center space-y-4 mb-8">
                            <div className="w-16 h-16 bg-rose-600 text-white rounded-[1.2rem] flex items-center justify-center mx-auto shadow-xl">
                                <LockIcon className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 mt-2">Cierre de Caja</h3>
                                <p className="text-sm text-slate-400 font-medium">Registra el arqueo final de tu turno</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-rose-50 p-4 rounded-xl flex gap-3">
                                <AlertCircleIcon className="w-5 h-5 text-rose-500 shrink-0" />
                                <div className="text-xs text-rose-700 font-medium leading-relaxed">
                                    Asegúrate de contar bien el efectivo antes de cerrar. Este paso no se puede revertir.
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Efectivo Real en Caja</label>
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-400">S/</span>
                                    <input
                                        type="number"
                                        value={actualAmount}
                                        onChange={(e) => setActualAmount(e.target.value)}
                                        className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-6 py-5 text-2xl font-black focus:ring-4 focus:ring-rose-500/10 transition-all outline-none border-2 border-transparent focus:border-rose-500/20"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Notas de Cuadre</label>
                                <textarea
                                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-rose-500/10 transition-all outline-none min-h-[100px]"
                                    placeholder="Detalles sobre billetes falsos, diferencias, etc."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>

                            <button
                                onClick={handleClose}
                                disabled={submitting || !actualAmount}
                                className="w-full py-5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-rose-200 flex items-center justify-center gap-2 uppercase tracking-widest text-[10px] disabled:opacity-50"
                            >
                                {submitting ? <Loader2Icon className="w-4 h-4 animate-spin" /> : "Confirmar Cierre y Bloquear"}
                            </button>

                            <button onClick={() => setShowCloseModal(false)} className="w-full py-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:text-slate-600 transition-colors">
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
