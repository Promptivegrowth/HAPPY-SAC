import { createClient } from "@/lib/supabase/server"
import {
    Truck,
    Search,
    Plus,
    MoreVertical,
    Mail,
    Phone,
    MapPin,
    Package
} from "lucide-react"
import { cn } from "@/lib/utils"

export default async function SuppliersPage() {
    const supabase = createClient()

    const { data: suppliers } = await supabase
        .from('suppliers')
        .select('*')
        .order('nombre_comercial', { ascending: true })

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Proveedores</h1>
                    <p className="text-slate-500 mt-1">Gestión de abastecimiento y cadena de suministros.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all">
                        {/* @ts-ignore */}
                        <Package size={18} />
                        Insumos
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-xl shadow-lg shadow-pink-600/10 transition-all">
                        {/* @ts-ignore */}
                        <Plus size={18} />
                        Nuevo Proveedor
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                    <div className="relative max-w-sm w-full">
                        {/* @ts-ignore */}
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o RUC..."
                            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-widest font-black">
                                <th className="px-6 py-5 border-b border-slate-100">Nombre Comercial / RUC</th>
                                <th className="px-6 py-5 border-b border-slate-100">Contacto</th>
                                <th className="px-6 py-5 border-b border-slate-100">Ubicación</th>
                                <th className="px-6 py-5 border-b border-slate-100">Estado</th>
                                <th className="px-6 py-5 border-b border-slate-100"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {suppliers?.map((supplier: any) => (
                                <tr key={supplier.id} className="hover:bg-slate-50/80 transition-all group">
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-900">{supplier.nombre_comercial}</span>
                                            <span className="text-[10px] text-slate-400 font-mono italic">{supplier.ruc}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                                {/* @ts-ignore */}
                                                <Mail size={12} className="text-slate-400" />
                                                <span className="truncate max-w-[150px]">{supplier.email || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                                {/* @ts-ignore */}
                                                <Phone size={12} className="text-slate-400" />
                                                <span>{supplier.contacto_telefono || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                            {/* @ts-ignore */}
                                            <MapPin size={12} className="text-slate-400" />
                                            <span className="truncate max-w-[150px]">{supplier.direccion || 'No especificada'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-600 uppercase tracking-widest">
                                            Activo
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                                            {/* @ts-ignore */}
                                            <MoreVertical size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {(!suppliers || suppliers.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 rounded-[2.5rem] bg-slate-50 flex items-center justify-center text-slate-200">
                                                {/* @ts-ignore */}
                                                <Truck size={40} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-slate-900 font-bold text-base">No hay proveedores registrados</p>
                                                <p className="text-slate-400 text-xs italic font-medium">Gestiona tu cadena de suministros registrando proveedores.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
