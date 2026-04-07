'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { MessageCircle, ShieldCheck, Truck, Store, CreditCard, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/lib/cart-store'
import { formatPrecio } from '@/lib/format'
import { generarUrlWhatsApp } from '@/lib/whatsapp'
import { toast } from 'sonner'

const checkoutSchema = z.object({
    nombre: z.string().min(3, 'Nombre requerido'),
    telefono: z.string().min(9, 'Teléfono válido requerido'),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    tipoEntrega: z.enum(['DELIVERY', 'RECOJO']),
    direccion: z.string().optional(),
    distrito: z.string().optional(),
    referencia: z.string().optional(),
    tipoPago: z.enum(['YAPE', 'TRANSFERENCIA', 'EFECTIVO_ENTREGA', 'TARJETA']),
    notas: z.string().optional(),
})

type CheckoutData = z.infer<typeof checkoutSchema>

export default function CheckoutPage() {
    const { items, getSubtotal, clearCart } = useCartStore()
    const [loading, setLoading] = useState(false)

    const { register, handleSubmit, watch, formState: { errors } } = useForm<CheckoutData>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
            tipoEntrega: 'DELIVERY',
            tipoPago: 'YAPE'
        }
    })

    const tipoEntrega = watch('tipoEntrega')

    const onSubmit = async (data: CheckoutData) => {
        setLoading(true)
        try {
            const numeroPedido = `HS-${Math.floor(Math.random() * 90000) + 10000}`

            const url = generarUrlWhatsApp({
                numeroPedido,
                items,
                datosCliente: data as any,
                subtotal: getSubtotal(),
                total: getSubtotal() // Aumentar envío luego si es delivery
            })

            toast.success('¡Pedido generado! Redirigiendo a WhatsApp...')

            setTimeout(() => {
                window.open(url, '_blank')
                clearCart()
                window.location.href = '/agradecimiento'
            }, 1500)

        } catch (error) {
            toast.error('Ocurrió un error al procesar tu pedido.')
        } finally {
            setLoading(false)
        }
    }

    if (items.length === 0) return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <p className="text-xl font-bold mb-4">No hay productos para procesar.</p>
            <Link href="/catalogo" className="btn-primary">IR AL CATÁLOGO</Link>
        </div>
    )

    return (
        <div className="bg-[--surface-2] min-h-screen py-16">
            <div className="max-w-7xl mx-auto px-6">
                <header className="mb-12">
                    <Link href="/carrito" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-[--brand-primary] transition-colors mb-4">
                        <ChevronLeft size={16} />
                        Regresar al carrito
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-display font-black text-[--brand-secondary] tracking-tighter uppercase italic">
                        FINALIZAR <span className="text-[--brand-primary]">PEDIDO</span>
                    </h1>
                </header>

                <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Form Column */}
                    <div className="lg:col-span-7 space-y-8">
                        {/* Sección: Datos Personales */}
                        <div className="p-8 bg-white rounded-3xl shadow-sm border space-y-6">
                            <h2 className="text-xl font-display font-black text-[--brand-secondary] flex items-center gap-3">
                                <div className="w-8 h-8 bg-[--brand-primary] text-white rounded-full flex items-center justify-center text-xs">1</div>
                                DATOS PERSONALES
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nombre Completo</label>
                                    <input {...register('nombre')} className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 focus:border-[--brand-primary] outline-none font-bold" placeholder="Ej: Juan Perez" />
                                    {errors.nombre && <p className="text-[10px] text-[--error] font-bold">{errors.nombre.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Teléfono / WhatsApp</label>
                                    <input {...register('telefono')} className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 focus:border-[--brand-primary] outline-none font-bold" placeholder="987 654 321" />
                                    {errors.telefono && <p className="text-[10px] text-[--error] font-bold">{errors.telefono.message}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Sección: Entrega */}
                        <div className="p-8 bg-white rounded-3xl shadow-sm border space-y-6">
                            <h2 className="text-xl font-display font-black text-[--brand-secondary] flex items-center gap-3">
                                <div className="w-8 h-8 bg-[--brand-primary] text-white rounded-full flex items-center justify-center text-xs">2</div>
                                TIPO DE ENTREGA
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <label className={cn(
                                    "flex flex-col items-center justify-center p-6 border-2 rounded-2xl cursor-pointer transition-all gap-3",
                                    tipoEntrega === 'DELIVERY' ? "border-[--brand-primary] bg-[--brand-primary]/5" : "border-slate-100 hover:bg-slate-50"
                                )}>
                                    <input type="radio" value="DELIVERY" {...register('tipoEntrega')} className="hidden" />
                                    <Truck size={32} className={tipoEntrega === 'DELIVERY' ? "text-[--brand-primary]" : "text-slate-300"} />
                                    <span className="font-bold text-sm">Delivery Lima</span>
                                </label>
                                <label className={cn(
                                    "flex flex-col items-center justify-center p-6 border-2 rounded-2xl cursor-pointer transition-all gap-3",
                                    tipoEntrega === 'RECOJO' ? "border-[--brand-primary] bg-[--brand-primary]/5" : "border-slate-100 hover:bg-slate-50"
                                )}>
                                    <input type="radio" value="RECOJO" {...register('tipoEntrega')} className="hidden" />
                                    <Store size={32} className={tipoEntrega === 'RECOJO' ? "text-[--brand-primary]" : "text-slate-300"} />
                                    <span className="font-bold text-sm">Recojo en Lince</span>
                                </label>
                            </div>

                            {tipoEntrega === 'DELIVERY' && (
                                <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
                                    <div className="col-span-full space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dirección</label>
                                        <input {...register('direccion')} className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 focus:border-[--brand-primary] outline-none font-bold" placeholder="Av. Los Pinos 123..." />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Distrito</label>
                                        <input {...register('distrito')} className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 focus:border-[--brand-primary] outline-none font-bold" placeholder="Lince, Miraflores..." />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Referencia</label>
                                        <input {...register('referencia')} className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 focus:border-[--brand-primary] outline-none font-bold" placeholder="Ej: Cerca al parque..." />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sección: Pago */}
                        <div className="p-8 bg-white rounded-3xl shadow-sm border space-y-6">
                            <h2 className="text-xl font-display font-black text-[--brand-secondary] flex items-center gap-3">
                                <div className="w-8 h-8 bg-[--brand-primary] text-white rounded-full flex items-center justify-center text-xs">3</div>
                                MÉTODO DE PAGO
                            </h2>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {['YAPE', 'TRANSFERENCIA', 'TARJETA', 'EFECTIVO_ENTREGA'].map(m => (
                                    <label key={m} className="flex flex-col items-center justify-center p-4 border-2 border-slate-100 rounded-xl cursor-pointer hover:border-[--brand-primary]/30 transition-all font-bold text-[10px] text-center gap-2">
                                        <input type="radio" value={m} {...register('tipoPago')} className="hidden" />
                                        <CreditCard size={20} className="text-slate-300" />
                                        {m.replace('_', ' ')}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Summary Column */}
                    <div className="lg:col-span-5">
                        <div className="p-8 bg-white rounded-3xl shadow-xl border sticky top-32 space-y-8">
                            <h3 className="text-xl font-display font-black text-[--brand-secondary] uppercase border-b pb-4">Detalle del Pedido</h3>

                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                                {items.map(item => (
                                    <div key={item.product_size_id} className="flex items-center gap-4">
                                        <div className="w-12 h-16 bg-slate-50 rounded-lg overflow-hidden shrink-0 relative">
                                            <Image src={item.imagen_url} alt={item.nombre} fill className="object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-[--brand-secondary] leading-tight line-clamp-1">{item.nombre}</p>
                                            <p className="text-[10px] font-black text-slate-400">Talla {item.talla} × {item.cantidad}</p>
                                        </div>
                                        <span className="font-accent text-sm">{formatPrecio(item.precio * item.cantidad)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-6 border-t space-y-3">
                                <div className="flex justify-between text-slate-400 font-bold text-xs uppercase">
                                    <span>Subtotal</span>
                                    <span>{formatPrecio(getSubtotal())}</span>
                                </div>
                                <div className="flex justify-between text-slate-400 font-bold text-xs uppercase">
                                    <span>Envío</span>
                                    <span className="text-[--success]">Gratis*</span>
                                </div>
                                <div className="flex justify-between text-3xl font-display font-black text-[--brand-secondary] pt-3">
                                    <span>TOTAL</span>
                                    <span>{formatPrecio(getSubtotal())}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full h-16 text-lg uppercase tracking-widest gap-3 shadow-xl shadow-[--brand-primary]/20"
                            >
                                {loading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <MessageCircle size={24} />}
                                GENERAR PEDIDO WHATSAPP
                            </button>

                            <div className="flex flex-col items-center gap-3">
                                <p className="text-[10px] text-slate-400 font-medium text-center leading-relaxed">
                                    Al hacer clic, recibirás un resumen detallado en tu WhatsApp para coordinar el pago y envío.
                                </p>
                                <div className="flex items-center gap-3 grayscale opacity-30">
                                    <ShieldCheck size={20} />
                                    <span className="text-[10px] font-black tracking-widest uppercase">Garantía HAPPY S.A.C.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ')
}
