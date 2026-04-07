'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'

const CATEGORIES = [
    {
        id: 1,
        name: 'Fiestas Patrias',
        count: '15 Modelos',
        image: 'https://images.unsplash.com/photo-1590494165264-1ebe3602eb80?q=80&w=800&auto=format&fit=crop',
        href: '/catalogo?categoria=fiestas-patrias',
        span: 'col-span-1 md:col-span-2'
    },
    {
        id: 2,
        name: 'Halloween',
        count: '24 Modelos',
        image: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=800&auto=format&fit=crop',
        href: '/catalogo?categoria=halloween',
        span: 'col-span-1'
    },
    {
        id: 3,
        name: 'Navidad',
        count: '12 Modelos',
        image: 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?q=80&w=800&auto=format&fit=crop',
        href: '/catalogo?categoria=navidad',
        span: 'col-span-1'
    },
    {
        id: 4,
        name: 'Niños & Bebés',
        count: '30 Modelos',
        image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?q=80&w=800&auto=format&fit=crop',
        href: '/catalogo?categoria=ninos',
        span: 'col-span-1 md:col-span-2'
    }
]

export function CategoriesGrid() {
    return (
        <section className="py-24 bg-white">
            <div className="max-w-[--container-max] mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div className="max-w-xl">
                        <h2 className="text-5xl md:text-6xl font-display font-black leading-none mb-6">
                            DESCUBRE TU <span className="text-[--brand-primary]">PRÓXIMO</span> PERSONAJE
                        </h2>
                        <p className="text-lg text-[--text-secondary] font-medium">
                            Explora nuestras colecciones curadas con los materiales más finos y diseños que capturan la imaginación.
                        </p>
                    </div>
                    <Link href="/catalogo" className="group flex items-center gap-3 text-sm font-black uppercase tracking-widest text-[--brand-secondary] hover:text-[--brand-primary] transition-colors pb-2 border-b-2 border-slate-100">
                        VER TODO EL CATÁLOGO
                        <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {CATEGORIES.map((cat, i) => (
                        <motion.div
                            key={cat.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            viewport={{ once: true }}
                            className={`group relative h-[400px] rounded-[--radius-lg] overflow-hidden ${cat.span}`}
                        >
                            <Image
                                src={cat.image}
                                alt={cat.name}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:via-black/40 transition-all" />

                            {/* Content */}
                            <div className="absolute inset-0 p-8 flex flex-col justify-end">
                                <span className="text-[--brand-accent] font-black tracking-widest text-xs uppercase mb-2">
                                    {cat.count}
                                </span>
                                <h3 className="text-3xl font-display font-black text-white mb-6">
                                    {cat.name}
                                </h3>
                                <Link href={cat.href} className="w-12 h-12 bg-white text-[--brand-secondary] rounded-full flex items-center justify-center -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 shadow-xl">
                                    <ArrowUpRight size={24} />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
