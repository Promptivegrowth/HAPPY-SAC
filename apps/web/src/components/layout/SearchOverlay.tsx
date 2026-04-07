'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Loader2, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { formatPrecio } from '@/lib/format'

export function SearchOverlay({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100)
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'auto'
            setQuery('')
            setResults([])
        }
    }, [isOpen])

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length < 2) {
                setResults([])
                return
            }
            setLoading(true)
            const { data } = await supabase
                .from('products')
                .select('id, nombre, nombre_web, slug, imagen_url, product_sizes(precio_web)')
                .or(`nombre.ilike.%${query}%,nombre_web.ilike.%${query}%,codigo.ilike.%${query}%`)
                .eq('publicar_web', true)
                .limit(5)

            setResults(data || [])
            setLoading(false)
        }, 300)

        return () => clearTimeout(timer)
    }, [query])

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex flex-col">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-white/95 backdrop-blur-xl"
                    />

                    {/* SearchBar */}
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="relative bg-white border-b px-6 py-8 shadow-sm"
                    >
                        <div className="max-w-4xl mx-auto flex items-center gap-6">
                            <Search className="text-[--brand-secondary] shrink-0" size={32} />
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="¿Qué personaje estás buscando?"
                                className="flex-1 bg-transparent text-3xl md:text-5xl font-display font-black text-[--brand-secondary] placeholder:text-slate-200 focus:outline-none"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <button
                                onClick={onClose}
                                className="p-3 bg-[--surface-2] rounded-full hover:bg-[--brand-primary] hover:text-white transition-all shadow-md"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </motion.div>

                    {/* Results Area */}
                    <div className="relative flex-1 overflow-y-auto px-6 py-12">
                        <div className="max-w-4xl mx-auto">
                            {loading && (
                                <div className="flex items-center gap-3 text-[--brand-secondary] font-bold">
                                    <Loader2 className="animate-spin" size={20} />
                                    <span>Buscando coincidencias...</span>
                                </div>
                            )}

                            {query.length >= 2 && !loading && results.length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-xl font-bold text-slate-400">No encontramos resultados para "{query}"</p>
                                    <Link href="/catalogo" onClick={onClose} className="text-[--brand-primary] font-black uppercase tracking-widest text-xs mt-4 inline-block hover:underline">
                                        Ver todos los disfraces
                                    </Link>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-6">
                                {results.map((product) => (
                                    <motion.div
                                        key={product.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                    >
                                        <Link
                                            href={`/producto/${product.slug}`}
                                            onClick={onClose}
                                            className="group flex items-center gap-6 p-4 rounded-3xl hover:bg-[--brand-primary]/5 transition-all border border-transparent hover:border-[--brand-primary]/10"
                                        >
                                            <div className="relative w-20 h-24 bg-slate-100 rounded-2xl overflow-hidden shrink-0">
                                                <Image
                                                    src={product.imagen_url || '/placeholder.jpg'}
                                                    alt={product.nombre}
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-xl font-display font-black text-[--brand-secondary] group-hover:text-[--brand-primary] transition-colors leading-tight">
                                                    {product.nombre_web || product.nombre}
                                                </h3>
                                                <p className="text-2xl font-accent text-[--brand-secondary] mt-1">
                                                    {formatPrecio(product.product_sizes?.[0]?.precio_web || 0)}
                                                </p>
                                            </div>
                                            <ArrowRight className="text-slate-200 group-hover:text-[--brand-primary] transition-colors" size={24} />
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>

                            {query.length === 0 && (
                                <div className="space-y-8">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Búsquedas Sugeridas</h4>
                                    <div className="flex flex-wrap gap-3">
                                        {['Capa', 'Escudo', 'Princesa', 'Superhéroe', 'Festivo'].map(s => (
                                            <button
                                                key={s}
                                                onClick={() => setQuery(s)}
                                                className="px-6 py-3 bg-[--surface-2] hover:bg-[--brand-secondary] hover:text-white rounded-full font-bold transition-all text-sm shadow-sm"
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    )
}
