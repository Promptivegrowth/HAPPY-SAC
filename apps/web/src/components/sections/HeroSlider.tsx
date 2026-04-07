'use client'
import React, { useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { motion } from 'framer-motion'
import { ArrowRight, Star } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const SLIDES = [
    {
        image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=2000&auto=format&fit=crop', // Reemplazar luego con reales
        title: 'NUEVA COLECCIÓN',
        subtitle: 'FESTIVAL PERÚ',
        description: 'Celebra nuestras raíces con los disfraces más auténticos y premium del mercado.',
        cta: 'VER COLECCIÓN',
        href: '/catalogo?categoria=fiestas-patrias',
        color: 'from-[--brand-primary]/80'
    },
    {
        image: 'https://images.unsplash.com/photo-1547032175-7fc8c7bd15b3?q=80&w=2000&auto=format&fit=crop',
        title: 'PRÓXIMAMENTE',
        subtitle: 'HALLOWEEN 2024',
        description: 'Sé el alma de la fiesta con diseños exclusivos que no encontrarás en ningún otro lugar.',
        cta: 'PRE-ORDENAR YA',
        href: '/catalogo?categoria=halloween',
        color: 'from-orange-600/80'
    },
    {
        image: 'https://images.unsplash.com/photo-1512909006721-3d6018887183?q=80&w=2000&auto=format&fit=crop',
        title: 'RECUERDOS MÁGICOS',
        subtitle: 'LÍNEA INFANTIL',
        description: 'Transforma sus sueños en realidad con telas hipoalergénicas y acabados de lujo.',
        cta: 'COMPRAR AHORA',
        href: '/catalogo?categoria=ninos',
        color: 'from-[--brand-secondary]/80'
    }
]

export function HeroSlider() {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 6000 })])

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi])
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi])

    return (
        <section className="relative h-[85vh] min-h-[600px] overflow-hidden bg-slate-900">
            <div className="overflow-hidden h-full" ref={emblaRef}>
                <div className="flex h-full">
                    {SLIDES.map((slide, index) => (
                        <div key={index} className="relative flex-[0_0_100%] h-full">
                            {/* Background Image */}
                            <Image
                                src={slide.image}
                                alt={slide.title}
                                fill
                                className="object-cover opacity-60"
                                priority={index === 0}
                            />

                            {/* Gradient Overlay */}
                            <div className={`absolute inset-0 bg-gradient-to-r ${slide.color} to-transparent`} />

                            {/* Content */}
                            <div className="relative h-full max-w-[--container-max] mx-auto px-6 flex flex-col justify-center">
                                <motion.div
                                    initial={{ opacity: 0, x: -50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8 }}
                                    className="max-w-2xl space-y-6"
                                >
                                    <div className="flex items-center gap-2 text-[--brand-accent] font-black tracking-[0.3em] text-xs md:text-sm uppercase">
                                        <Star size={16} fill="currentColor" />
                                        <span>{slide.title}</span>
                                    </div>

                                    <h2 className="text-6xl md:text-8xl font-accent text-white leading-[0.9] tracking-tighter">
                                        {slide.subtitle}
                                    </h2>

                                    <p className="text-lg md:text-xl text-white/90 font-medium leading-relaxed max-w-lg">
                                        {slide.description}
                                    </p>

                                    <div className="pt-8 flex flex-wrap gap-4">
                                        <Link href={slide.href} className="btn-primary">
                                            {slide.cta}
                                            <ArrowRight size={20} />
                                        </Link>
                                        <button className="px-8 py-4 border-2 border-white/30 text-white rounded-[--radius-lg] font-bold hover:bg-white hover:text-[--brand-secondary] transition-all">
                                            CONOCER MÁS
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Particles/Indicators could go here */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3">
                {SLIDES.map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-white/30" />
                ))}
            </div>
        </section>
    )
}
