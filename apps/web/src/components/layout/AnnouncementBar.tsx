'use client'
import { motion } from 'framer-motion'
import { Truck, Zap, Phone } from 'lucide-react'

export function AnnouncementBar() {
    const announcements = [
        { icon: <Truck size={14} />, text: "Envíos a todo Lima Metropolitana" },
        { icon: <Zap size={14} />, text: "Entrega en 24-48 horas" },
        { icon: <Phone size={14} />, text: "Compra por WhatsApp 24/7" }
    ]

    return (
        <div className="bg-[--brand-secondary] text-white py-2 px-4 overflow-hidden">
            <div className="max-w-[--container-max] mx-auto flex justify-center items-center gap-8 md:gap-12 text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                {announcements.map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-2"
                    >
                        <span className="text-[--brand-accent]">{item.icon}</span>
                        {item.text}
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
