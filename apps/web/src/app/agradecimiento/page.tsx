'use client'
import { motion } from 'framer-motion'
import { CheckCircle2, MessageCircle, ArrowRight, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

export default function SuccessPage() {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6">
            <div className="max-w-xl w-full text-center space-y-12">
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', damping: 15 }}
                    className="w-32 h-32 bg-[--brand-primary]/10 text-[--brand-primary] rounded-full flex items-center justify-center mx-auto"
                >
                    <CheckCircle2 size={64} />
                </motion.div>

                <div className="space-y-4">
                    <h1 className="text-5xl md:text-7xl font-display font-black text-[--brand-secondary] tracking-tighter uppercase italic">
                        ¡GRACIAS POR <span className="text-[--brand-primary]">TU COMPRA!</span>
                    </h1>
                    <p className="text-xl text-slate-500 font-medium">
                        Tu pedido ha sido generado con éxito. Hemos abierto una ventana de WhatsApp para que coordines el pago y la entrega con nuestro equipo.
                    </p>
                </div>

                <div className="p-8 bg-[--surface-2] rounded-3xl border-2 border-dashed border-slate-200 space-y-4">
                    <h3 className="font-black text-xs uppercase tracking-widest text-[--brand-secondary]">Siguientes Pasos</h3>
                    <ul className="text-sm text-slate-600 space-y-3 text-left">
                        <li className="flex gap-3">
                            <span className="w-5 h-5 bg-[--brand-secondary] text-white rounded-full flex items-center justify-center text-[10px] shrink-0">1</span>
                            <span>Confirma el mensaje enviado en WhatsApp.</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="w-5 h-5 bg-[--brand-secondary] text-white rounded-full flex items-center justify-center text-[10px] shrink-0">2</span>
                            <span>Nuestro asesor te enviará los datos de pago (Yape/Transferencia).</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="w-5 h-5 bg-[--brand-secondary] text-white rounded-full flex items-center justify-center text-[10px] shrink-0">3</span>
                            <span>Una vez confirmado el pago, coordinaremos el envío inmediato.</span>
                        </li>
                    </ul>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                    <Link href="/catalogo" className="btn-primary flex-1 py-5 text-lg">
                        SEGUIR COMPRANDO
                    </Link>
                    <Link href="/" className="flex-1 py-5 border-2 border-slate-100 font-black text-xs uppercase tracking-widest text-[--brand-secondary] rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-50">
                        VOLVER AL INICIO
                        <ArrowRight size={16} />
                    </Link>
                </div>

                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                    ¿No se abrió WhatsApp? <a href="#" className="text-[--brand-primary] underline">Haz clic aquí para reintentar</a>
                </p>
            </div>
        </div>
    )
}
