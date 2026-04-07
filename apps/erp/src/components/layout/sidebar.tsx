"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    Package,
    Factory,
    ShoppingCart,
    Users,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Truck,
    FileText
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

const sidebarItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Inventario", href: "/inventory", icon: Package },
    { name: "Producción", href: "/production", icon: Factory },
    { name: "Ventas", href: "/sales", icon: ShoppingCart },
    { name: "Clientes", href: "/customers", icon: Users },
    { name: "Proveedores", href: "/suppliers", icon: Truck },
    { name: "Facturación", href: "/invoices", icon: FileText },
    { name: "Configuración", href: "/settings", icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()
    const [isCollapsed, setIsCollapsed] = useState(false)

    return (
        <div
            className={cn(
                "relative flex flex-col h-screen bg-slate-900 text-slate-100 transition-all duration-300 border-r border-slate-800",
                isCollapsed ? "w-20" : "w-64"
            )}
        >
            <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
                {!isCollapsed && <span className="text-xl font-bold tracking-tight text-white">HAPPY <span className="text-pink-500">SAC</span></span>}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                >
                    {/* @ts-ignore */}
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                                isActive
                                    ? "bg-pink-600 text-white shadow-lg shadow-pink-900/20"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                            )}
                        >
                            {/* @ts-ignore */}
                            <item.icon
                                size={22}
                                className={cn(
                                    "shrink-0",
                                    isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                                )}
                            />
                            {!isCollapsed && (
                                <span className="text-sm font-medium whitespace-nowrap">{item.name}</span>
                            )}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-slate-800 space-y-4">
                {!isCollapsed && (
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-9 h-9 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-500 font-bold border border-pink-500/30">
                            A
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-semibold text-white truncate">Admin User</span>
                            <span className="text-xs text-slate-500 truncate">admin@happysac.com.pe</span>
                        </div>
                    </div>
                )}
                <button className={cn(
                    "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200",
                    isCollapsed && "justify-center"
                )}>
                    {/* @ts-ignore */}
                    <LogOut size={20} />
                    {!isCollapsed && <span className="text-sm font-medium">Cerrar Sesión</span>}
                </button>
            </div>
        </div>
    )
}
