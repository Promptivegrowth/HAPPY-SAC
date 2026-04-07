import {
    TrendingUp,
    Package,
    ShoppingCart,
    Users,
    Factory,
    CheckCircle2,
    Clock,
    AlertCircle
} from "lucide-react"

const stats = [
    { name: "Ventas del Mes", value: "S/ 12,450", change: "+12.5%", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
    { name: "Pedidos Pendientes", value: "24", change: "+4", icon: ShoppingCart, color: "text-amber-600", bg: "bg-amber-50" },
    { name: "Producción Activa", value: "8 OPs", change: "En curso", icon: Factory, color: "text-blue-600", bg: "bg-blue-50" },
    { name: "Stock Bajo", value: "5 Alertas", change: "-2", icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50" },
]

export default function DashboardPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Panel de Control</h1>
                <p className="text-slate-500 mt-1">Bienvenido al sistema de gestión de HAPPY S.A.C.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <div key={stat.name} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                        <dt>
                            <div className={stat.bg + " absolute rounded-xl p-2.5 " + stat.color}>
                                {/* @ts-ignore */}
                                <stat.icon className="h-6 w-6" aria-hidden="true" />
                            </div>
                            <p className="ml-16 truncate text-sm font-medium text-slate-500">{stat.name}</p>
                        </dt>
                        <dd className="ml-16 flex items-baseline pb-0">
                            <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
                            <p className={stat.color + " ml-2 flex items-baseline text-sm font-semibold"}>
                                {stat.change}
                            </p>
                        </dd>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        {/* @ts-ignore */}
                        <Clock className="h-5 w-5 text-slate-400" />
                        Órdenes de Producción Recientes
                    </h2>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors rounded-lg px-2 -mx-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                        {/* @ts-ignore */}
                                        <Factory className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">OP-2024-00{i}</p>
                                        <p className="text-xs text-slate-500">Disfraz Spiderman x 50 und</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                                        En Proceso
                                    </span>
                                    <p className="text-[10px] text-slate-400 mt-1">Entrega: 15 Abr</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        {/* @ts-ignore */}
                        <CheckCircle2 className="h-5 w-5 text-slate-400" />
                        Ventas Recientes
                    </h2>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors rounded-lg px-2 -mx-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-500 font-bold text-xs">
                                        JP
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">Juan Pérez</p>
                                        <p className="text-xs text-slate-500">Pedido #WEB-12{i}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-slate-900">S/ 120.00</p>
                                    <p className="text-[10px] text-emerald-600 mt-1 font-medium">Pagado</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
