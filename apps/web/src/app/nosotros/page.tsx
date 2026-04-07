'use client'
import { motion } from 'framer-motion'
import { Award, Heart, ShieldCheck, Users } from 'lucide-react'
import Image from 'next/image'

export default function NosotrosPage() {
    return (
        <div className="bg-white min-h-screen">
            {/* Hero Section */}
            <section className="relative py-32 overflow-hidden bg-[--brand-secondary]">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                <div className="relative max-w-[--container-max] mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-center gap-3 mb-6"
                    >
                        <div className="w-12 h-[1px] bg-white/30" />
                        <span className="text-white/60 font-black tracking-[0.3em] text-[10px] uppercase">NUESTRA HISTORIA</span>
                        <div className="w-12 h-[1px] bg-white/30" />
                    </motion.div>
                    <h1 className="text-6xl md:text-9xl font-display font-black text-white tracking-tighter italic">
                        MÁS QUE <span className="text-[--brand-primary]">DISFRACES</span>
                    </h1>
                    <p className="text-xl text-white/50 max-w-2xl mx-auto mt-8 font-medium italic leading-relaxed">
                        En HAPPY S.A.C., creemos que la imaginación no tiene límites. Llevamos más de una década transformando momentos ordinarios en recuerdos extraordinarios.
                    </p>
                </div>
            </section>

            {/* Philosophy Section */}
            <section className="py-32">
                <div className="max-w-[--container-max] mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="relative aspect-[4/5] bg-slate-100 rounded-[--radius-xl] overflow-hidden shadow-2xl">
                            <Image
                                src="https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80"
                                alt="Taller HAPPY S.A.C."
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[--brand-secondary] to-transparent opacity-60" />
                            <div className="absolute bottom-10 left-10 text-white">
                                <p className="text-5xl font-accent">PASIÓN PERUANA</p>
                                <p className="text-xs font-black uppercase tracking-widest mt-2 opacity-60">Hecho con manos creativas</p>
                            </div>
                        </div>

                        <div className="space-y-12">
                            <div>
                                <h2 className="text-5xl font-display font-black text-[--brand-secondary] mb-6">NUESTRO <span className="text-[--brand-primary]">COMPROMISO</span></h2>
                                <p className="text-lg text-slate-500 leading-relaxed font-medium">
                                    Nacimos con el sueño de ofrecer disfraces de calidad superior, utilizando las mejores telas peruanas y diseños que capturan la esencia de cada personaje. Cada costura y cada detalle es revisado minuciosamente para garantizar que nuestros clientes se sientan únicos.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {[
                                    { icon: <Award />, title: "Calidad Premium", desc: "Materiales seleccionados que garantizan durabilidad y confort." },
                                    { icon: <Heart />, title: "Diseño Único", desc: "Cada pieza es una obra de arte creada pensando en la diversión." },
                                    { icon: <ShieldCheck />, title: "Confianza", desc: "Años en el mercado respaldan nuestra reputación y servicio." },
                                    { icon: <Users />, title: "Comunidad", desc: "Estamos presentes en los mejores momentos de las familias peruanas." },
                                ].map((item, i) => (
                                    <div key={i} className="space-y-3">
                                        <div className="text-[--brand-primary]">{item.icon}</div>
                                        <h4 className="font-display font-bold text-[--brand-secondary]">{item.title}</h4>
                                        <p className="text-sm text-slate-500 font-medium leading-snug">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 bg-[--surface-2] border-y">
                <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
                    <h3 className="text-4xl font-display font-black text-[--brand-secondary]">¿LISTO PARA TU PRÓXIMA TRANSFORMACIÓN?</h3>
                    <motion.div whileHover={{ scale: 1.05 }}>
                        <a href="/catalogo" className="btn-primary inline-flex">EXPLORAR CATÁLOGO</a>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}
