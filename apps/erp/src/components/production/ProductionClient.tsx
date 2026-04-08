"use client"

import { useState } from "react"
import {
    ClipboardList,
    FileText,
    Truck,
    Plus,
    Clock,
    CheckCircle2,
    Factory,
    Search,
    ChevronRight,
    ExternalLink,
    Box
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import RecipeManager from "@/components/production/RecipeManager"
import ServiceOrderModal from "@/components/production/ServiceOrderModal"

interface ProductionClientProps {
    initialOrders: any[]
    initialServices: any[]
    products: any[]
    activeTab: string
}

export default function ProductionClient({ initialOrders, initialServices, products, activeTab: defaultTab }: ProductionClientProps) {
    const [activeTab, setActiveTab] = useState(defaultTab)
    const [orders, setOrders] = useState(initialOrders)
    const [services, setServices] = useState(initialServices)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedOPForOS, setSelectedOPForOS] = useState<any>(null)

    const filteredOrders = (orders || []).filter(o =>
        o.numero_doc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.items?.[0]?.product?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase italic">Control de <span className="text-pink-600">Producción</span></h1>
                    <p className="text-slate-500 mt-1 font-medium italic">Gestión integral de disfraces, recetas y servicios tercerizados.</p>
                </div>
                {activeTab === 'orders' && (
                    <div className="flex items-center gap-3">
                        <Link href="/production/new" className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-pink-600 text-white font-black rounded-2xl shadow-xl shadow-slate-900/10 transition-all uppercase text-xs tracking-widest">
                            {/* @ts-ignore */}
                            <Plus size={18} />
                            Nueva OP
                        </Link>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-px overflow-x-auto no-scrollbar">
                {[
                    { id: 'orders', label: 'Órdenes de Prod. (OP)', icon: ClipboardList },
                    { id: 'planning', label: 'Plan de Trabajo', icon: Clock },
                    { id: 'cutting', label: 'Corte (Crítico)', icon: Box },
                    { id: 'recipes', label: 'Fichas Técnicas', icon: FileText },
                    { id: 'services', label: 'Servicios (OS)', icon: Truck },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex items-center gap-2 px-6 py-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 whitespace-nowrap",
                            activeTab === tab.id
                                ? "border-pink-600 text-pink-600 bg-pink-50/50"
                                : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                        )}
                    >
                        {/* @ts-ignore */}
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'orders' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-[4rem] -mr-8 -mt-8 group-hover:bg-blue-100 transition-colors" />
                            <div className="flex items-center justify-between mb-4 relative">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">OPs Activas</span>
                                {/* @ts-ignore */}
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Clock size={16} /></div>
                            </div>
                            <div className="text-4xl font-black text-slate-900 relative tracking-tighter">{orders?.filter(o => o.estado === 'PROCESO').length || 0}</div>
                        </div>

                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-[4rem] -mr-8 -mt-8 group-hover:bg-amber-100 transition-colors" />
                            <div className="flex items-center justify-between mb-4 relative">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">Por Iniciar</span>
                                {/* @ts-ignore */}
                                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><Factory size={16} /></div>
                            </div>
                            <div className="text-4xl font-black text-slate-900 relative tracking-tighter">{orders?.filter(o => o.estado === 'PENDIENTE').length || 0}</div>
                        </div>

                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-[4rem] -mr-8 -mt-8 group-hover:bg-emerald-100 transition-colors" />
                            <div className="flex items-center justify-between mb-4 relative">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Completadas</span>
                                {/* @ts-ignore */}
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle2 size={16} /></div>
                            </div>
                            <div className="text-4xl font-black text-slate-900 relative tracking-tighter">{orders?.filter(o => o.estado === 'COMPLETADO').length || 0}</div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
                                Monitor de Producción
                            </h2>
                            <div className="relative">
                                {/* @ts-ignore */}
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar por código u OP..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-4 focus:ring-pink-500/10 outline-none transition-all w-full sm:w-64"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50 text-slate-400 text-[9px] uppercase tracking-[0.2em] font-black">
                                        <th className="px-8 py-5">Nro OP</th>
                                        <th className="px-8 py-5">Producto / Estilo</th>
                                        <th className="px-8 py-5">Cant. Solicitada</th>
                                        <th className="px-8 py-5">Progreso</th>
                                        <th className="px-8 py-5">Fecha Entrega</th>
                                        <th className="px-8 py-5">Estado</th>
                                        <th className="px-8 py-5"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredOrders.map((order: any) => {
                                        const progress = order.total_prendas > 0
                                            ? Math.round((order.cantidad_terminada / order.total_prendas) * 100)
                                            : 0

                                        return (
                                            <tr key={order.id} className="hover:bg-slate-50/80 transition-all group">
                                                <td className="px-8 py-6 text-xs font-black text-slate-900 tracking-widest">#{order.numero_doc || order.id.slice(0, 8)}</td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-slate-950 tracking-tight">{order.items?.[0]?.product?.nombre}</span>
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{order.items?.[0]?.product?.codigo}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-sm font-black text-slate-700">{order.total_prendas}</td>
                                                <td className="px-8 py-6 min-w-[180px]">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                            <div
                                                                className={cn(
                                                                    "h-full transition-all duration-1000",
                                                                    progress === 100 ? "bg-emerald-500" : "bg-pink-600"
                                                                )}
                                                                style={{ width: `${progress}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-[10px] font-black text-slate-500 group-hover:text-pink-600 transition-colors">{progress}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-xs text-slate-500 font-bold uppercase tracking-tighter">
                                                    {order.fecha_entrega_est ? new Date(order.fecha_entrega_est).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }) : 'N/A'}
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={cn(
                                                        "inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest leading-none",
                                                        order.estado === 'PENDIENTE' && "bg-slate-100 text-slate-500",
                                                        order.estado === 'PROCESO' && "bg-blue-50 text-blue-600 border border-blue-100",
                                                        order.estado === 'COMPLETADO' && "bg-emerald-50 text-emerald-600 border border-emerald-100",
                                                        order.estado === 'CANCELADO' && "bg-rose-50 text-rose-600 border border-rose-100"
                                                    )}>
                                                        {order.estado}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                                                        <button
                                                            onClick={() => setSelectedOPForOS(order)}
                                                            className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm flex items-center gap-2"
                                                        >
                                                            {/* @ts-ignore */}
                                                            <ExternalLink size={12} />
                                                            Gen OS
                                                        </button>
                                                        <div className="p-2 text-slate-300 group-hover:text-pink-600 transition-all transform group-hover:translate-x-1">
                                                            {/* @ts-ignore */}
                                                            <ChevronRight size={18} />
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'recipes' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <RecipeManager products={products || []} />
                </div>
            )}

            {activeTab === 'planning' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white p-20 rounded-[3rem] border-4 border-dashed border-slate-100 flex flex-col items-center text-center max-w-4xl mx-auto">
                        <div className="w-20 h-20 bg-pink-50 text-pink-600 rounded-3xl flex items-center justify-center mb-6">
                            {/* @ts-ignore */}
                            <Clock size={40} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4 italic">Planificación <span className="text-pink-600">Semanal</span></h2>
                        <p className="text-slate-500 font-medium leading-relaxed mb-8">
                            Este módulo permite consolidar múltiples Órdenes de Compra (OC) en un solo Plan de Producción optimizado.
                            Agrupa por estilo, talla y color para maximizar la eficiencia de tu taller.
                        </p>
                        <div className="flex gap-4">
                            <button className="px-8 py-4 bg-slate-900 text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-pink-600 transition-all shadow-xl shadow-slate-900/10">
                                Crear Nuevo Plan
                            </button>
                            <button className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-900 font-black rounded-2xl text-xs uppercase tracking-widest hover:border-pink-600 hover:text-pink-600 transition-all">
                                Ver Consolidado
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'cutting' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white p-20 rounded-[3rem] border-4 border-dashed border-slate-100 flex flex-col items-center text-center max-w-4xl mx-auto">
                        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-6">
                            {/* @ts-ignore */}
                            <Box size={40} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4 italic">Corte e <span className="text-blue-600">Inventario</span></h2>
                        <p className="text-slate-500 font-medium leading-relaxed mb-8">
                            Control crítico de tendido y corte. Este módulo gestiona la explosión de materiales real vs teórica,
                            calculando exactamente el consumo de tela y la merma producida por cada tizado.
                        </p>
                        <div className="flex gap-4">
                            <button className="px-8 py-4 bg-slate-900 text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10">
                                Iniciar Tizado
                            </button>
                            <button className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-900 font-black rounded-2xl text-xs uppercase tracking-widest hover:border-blue-600 hover:text-blue-600 transition-all">
                                Reporte de Merma
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'services' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 bg-indigo-500 rounded-full" />
                                Historial de Servicios Tercerizados (OS)
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50 text-slate-400 text-[9px] uppercase tracking-[0.2em] font-black">
                                        <th className="px-8 py-5">ID OS</th>
                                        <th className="px-8 py-5">Taller / Proveedor</th>
                                        <th className="px-8 py-5">Servicio</th>
                                        <th className="px-8 py-5">OP Relacionada</th>
                                        <th className="px-8 py-5 text-right">Costo Pactado</th>
                                        <th className="px-8 py-5">Entrega</th>
                                        <th className="px-8 py-5">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {(services || []).map((os: any) => (
                                        <tr key={os.id} className="hover:bg-slate-50/80 transition-all group">
                                            <td className="px-8 py-6 text-xs font-black text-slate-900">OS-{os.id.substring(0, 8).toUpperCase()}</td>
                                            <td className="px-8 py-6 font-bold text-slate-900">{os.supplier?.nombre_comercial}</td>
                                            <td className="px-8 py-6">
                                                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase">{os.tipo_servicio}</span>
                                            </td>
                                            <td className="px-8 py-6 text-xs font-black text-slate-500 italic">OP #{os.op?.numero_doc}</td>
                                            <td className="px-8 py-6 text-sm font-black text-slate-900 text-right">S/ {os.total_costo?.toFixed(2)}</td>
                                            <td className="px-8 py-6 text-xs text-slate-500 font-bold uppercase tracking-tighter">
                                                {os.fecha_entrega_est ? new Date(os.fecha_entrega_est).toLocaleDateString('es-PE') : 'N/A'}
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={cn(
                                                    "inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest leading-none",
                                                    os.estado === 'PENDIENTE' && "bg-amber-50 text-amber-600 border border-amber-100",
                                                    os.estado === 'RECIBIDO' && "bg-emerald-50 text-emerald-600 border border-emerald-100",
                                                )}>
                                                    {os.estado}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!services || services.length === 0) && (
                                        <tr>
                                            <td colSpan={7} className="px-8 py-20 text-center">
                                                <div className="flex flex-col items-center gap-4 text-slate-300">
                                                    {/* @ts-ignore */}
                                                    <Truck size={48} />
                                                    <p className="text-xs font-black uppercase tracking-widest">No hay órdenes de servicio activas</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for generating OS */}
            <ServiceOrderModal
                isOpen={!!selectedOPForOS}
                onClose={() => setSelectedOPForOS(null)}
                productionOrder={selectedOPForOS}
            />
        </div>
    )
}
