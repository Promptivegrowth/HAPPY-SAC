import { createClient } from "@/lib/supabase/server"
import {
    Settings,
    Building2,
    Globe,
    FileJson,
    MessageSquare,
    Save,
    ShieldCheck,
    RefreshCw
} from "lucide-react"
import { cn } from "@/lib/utils"

export default async function SettingsPage() {
    const supabase = createClient()

    const { data: settings } = await supabase
        .from('erp_settings')
        .select('*')
        .single()

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Configuración</h1>
                <p className="text-slate-500 mt-1">Gestión de la empresa, credenciales SUNAT e integración web.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Panel de Empresa */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            {/* @ts-ignore */}
                            <Building2 className="text-pink-600" size={22} />
                            Información de la Empresa
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Razón Social</label>
                                <input type="text" defaultValue={settings?.company_name} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-pink-500/10 outline-none transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-slate-400 tracking-widest">RUC</label>
                                <input type="text" defaultValue={settings?.ruc} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-pink-500/10 outline-none transition-all" />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Dirección Fiscal</label>
                                <input type="text" defaultValue={settings?.direccion} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-pink-500/10 outline-none transition-all" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            {/* @ts-ignore */}
                            <FileJson className="text-blue-600" size={22} />
                            Credenciales SUNAT (Facturación Electrónica)
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Usuario SOL</label>
                                <input type="text" defaultValue={settings?.sunat_username} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-pink-500/10 outline-none transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Clave SOL</label>
                                <input type="password" placeholder="********" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-pink-500/10 outline-none transition-all" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Integraciones y Lateral */}
                <div className="space-y-6">
                    <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-slate-900/20">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                            {/* @ts-ignore */}
                            <Globe className="text-pink-500" size={22} />
                            Sincronización Web
                        </h2>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <p className="text-sm font-bold">Catálogo en Vivo</p>
                                    <p className="text-[10px] text-slate-400">Actualizar web automáticamente</p>
                                </div>
                                <div className="w-12 h-6 bg-pink-600 rounded-full relative p-1 cursor-pointer">
                                    <div className="w-4 h-4 bg-white rounded-full ml-auto" />
                                </div>
                            </div>
                            <button className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2">
                                {/* @ts-ignore */}
                                <RefreshCw size={14} />
                                Sincronizar Ahora
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                            {/* @ts-ignore */}
                            <MessageSquare className="text-emerald-600" size={18} />
                            WhatsApp Notificaciones
                        </h3>
                        <input
                            type="text"
                            placeholder="+51 900 000 000"
                            defaultValue={settings?.whatsapp_number}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                        />
                    </div>

                    <button className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-[2rem] font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2 group">
                        {/* @ts-ignore */}
                        <Save size={18} className="group-hover:scale-110 transition-transform" />
                        Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
    )
}
