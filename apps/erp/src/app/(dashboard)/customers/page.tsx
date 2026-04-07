import { createClient } from "@/lib/supabase/server"
import {
    Users,
    Search,
    Plus,
    UserPlus,
    MoreVertical,
    Mail,
    Phone,
    MapPin
} from "lucide-react"
import { cn } from "@/lib/utils"

export default async function CustomersPage() {
    const supabase = createClient()

    const { data: customers } = await supabase
        .from('customers')
        .select('*')
        .order('nombre_completo', { ascending: true })

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Clientes</h1>
                    <p className="text-slate-500 mt-1">Directorio de clientes mayoristas y minoristas.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-xl shadow-lg shadow-pink-600/10 transition-all">
                        {/* @ts-ignore */}
                        <Plus size={18} />
                        Nuevo Cliente
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
                            placeholder="Buscar por nombre o DNI/RUC..."
                            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-widest font-black">
                                <th className="px-6 py-5 border-b border-slate-100">Nombre / Documento</th>
                                <th className="px-6 py-5 border-b border-slate-100">Contacto</th>
                                <th className="px-6 py-5 border-b border-slate-100">Dirección</th>
                                <th className="px-6 py-5 border-b border-slate-100">Fecha Registro</th>
                                <th className="px-6 py-5 border-b border-slate-100"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {customers?.map((customer: any) => (
                                <tr key={customer.id} className="hover:bg-slate-50/80 transition-all group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-600 font-bold text-sm">
                                                {customer.nombre_completo.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900">{customer.nombre_completo}</span>
                                                <span className="text-[10px] text-slate-400 font-mono italic">{customer.nro_doc}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-1">
                                            {/* Usamos placeholders ya que la tabla customers actual es básica */}
                                            <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                                {/* @ts-ignore */}
                                                <Mail size={12} className="text-slate-400" />
                                                <span>sin-correo@happy.com</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                                {/* @ts-ignore */}
                                                <Phone size={12} className="text-slate-400" />
                                                <span>900 000 000</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                            {/* @ts-ignore */}
                                            <MapPin size={12} className="text-slate-400" />
                                            <span className="truncate max-w-[200px]">Lima, Perú</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-[11px] text-slate-400 font-bold">
                                        {new Date(customer.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                                            {/* @ts-ignore */}
                                            <MoreVertical size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {(!customers || customers.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 rounded-[2.5rem] bg-slate-50 flex items-center justify-center text-slate-200">
                                                {/* @ts-ignore */}
                                                <Users size={40} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-slate-900 font-bold text-base">No hay clientes registrados</p>
                                                <p className="text-slate-400 text-xs italic font-medium">Comienza registrando a tu primer cliente.</p>
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
