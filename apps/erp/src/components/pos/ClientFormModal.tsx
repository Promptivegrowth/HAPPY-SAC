"use client"

import { useState } from "react"
import { X, User, CreditCard, MapPin, Phone, Mail, Save, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

// Icon Wrappers for Linting
const XIcon = X as any
const UserIcon = User as any
const CreditCardIcon = CreditCard as any
const MapPinIcon = MapPin as any
const PhoneIcon = Phone as any
const MailIcon = Mail as any
const SaveIcon = Save as any
const Loader2Icon = Loader2 as any

interface ClientFormModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (client: any) => void
}

export function ClientFormModal({ isOpen, onClose, onSave }: ClientFormModalProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        tipo_doc: "DNI",
        nro_doc: "",
        nombre_completo: "",
        email: "",
        telefono: "",
        distrito: "",
        direccion_fiscal: ""
    })

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const supabase = createClient()
        const { data, error } = await (supabase.from('customers') as any)
            .insert({
                ...formData,
                activo: true
            })
            .select()
            .single()

        setLoading(false)
        if (error) {
            alert("Error al registrar cliente: " + error.message)
        } else {
            onSave(data)
            onClose()
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white relative z-10">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Nuevo Cliente</h2>
                        <p className="text-sm text-slate-400 font-medium mt-1">Completa los datos para la facturación</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                        <XIcon className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        {/* Tipo y Nro Documento */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tipo de Documento</label>
                            <select
                                value={formData.tipo_doc}
                                onChange={(e) => setFormData({ ...formData, tipo_doc: e.target.value })}
                                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-pink-500/10 transition-all outline-none"
                            >
                                <option value="DNI">DNI (Persona)</option>
                                <option value="RUC">RUC (Empresa)</option>
                                <option value="CEX">Carné Extranjería</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nro Documento</label>
                            <div className="relative">
                                <CreditCardIcon className="absolute left-4 top-4 w-5 h-5 text-slate-300" />
                                <input
                                    type="text"
                                    required
                                    placeholder="8 dígitos / 11 dígitos"
                                    value={formData.nro_doc}
                                    onChange={(e) => setFormData({ ...formData, nro_doc: e.target.value })}
                                    className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-5 py-4 text-sm font-bold focus:ring-4 focus:ring-pink-500/10 transition-all outline-none placeholder:text-slate-300"
                                />
                            </div>
                        </div>

                        {/* Nombre Completo */}
                        <div className="col-span-2 space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nombre o Razón Social</label>
                            <div className="relative">
                                <UserIcon className="absolute left-4 top-4 w-5 h-5 text-slate-300" />
                                <input
                                    type="text"
                                    required
                                    placeholder="Nombre completo"
                                    value={formData.nombre_completo}
                                    onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                                    className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-5 py-4 text-sm font-bold focus:ring-4 focus:ring-pink-500/10 transition-all outline-none placeholder:text-slate-300"
                                />
                            </div>
                        </div>

                        {/* Contacto */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Teléfono</label>
                            <div className="relative">
                                <PhoneIcon className="absolute left-4 top-4 w-5 h-5 text-slate-300" />
                                <input
                                    type="tel"
                                    placeholder="912 345 678"
                                    value={formData.telefono}
                                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                    className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-5 py-4 text-sm font-bold focus:ring-4 focus:ring-pink-500/10 transition-all outline-none placeholder:text-slate-300"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Correo Electrónico</label>
                            <div className="relative">
                                <MailIcon className="absolute left-4 top-4 w-5 h-5 text-slate-300" />
                                <input
                                    type="email"
                                    placeholder="hola@ejemplo.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-5 py-4 text-sm font-bold focus:ring-4 focus:ring-pink-500/10 transition-all outline-none placeholder:text-slate-300"
                                />
                            </div>
                        </div>

                        {/* Ubicación */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Distrito / Ciudad</label>
                            <div className="relative">
                                <MapPinIcon className="absolute left-4 top-4 w-5 h-5 text-slate-300" />
                                <input
                                    type="text"
                                    placeholder="Ej. Miraflores, Lima"
                                    value={formData.distrito}
                                    onChange={(e) => setFormData({ ...formData, distrito: e.target.value })}
                                    className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-5 py-4 text-sm font-bold focus:ring-4 focus:ring-pink-500/10 transition-all outline-none placeholder:text-slate-300"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Dirección Fiscal / Envío</label>
                            <input
                                type="text"
                                placeholder="..."
                                value={formData.direccion_fiscal}
                                onChange={(e) => setFormData({ ...formData, direccion_fiscal: e.target.value })}
                                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-pink-500/10 transition-all outline-none placeholder:text-slate-300"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black rounded-2xl transition-all uppercase tracking-widest text-[10px]"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] px-8 py-4 bg-pink-600 hover:bg-pink-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-pink-200 flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]"
                        >
                            {loading ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <SaveIcon className="w-4 h-4" />}
                            Registrar Cliente
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
