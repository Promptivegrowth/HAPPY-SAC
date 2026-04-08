'use client'
import React, { useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Star } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const SLIDES = [
    {
        image: '/images/hero_magic.png',
        title: 'EXCLUSIVIDAD',
        subtitle: 'MAGIA EN CADA HILO',
        description: 'Descubre nuestra colección de disfraces premium elaborados con los más altos estándares de calidad y detalle.',
        cta: 'VER COLECCIÓN',
        href: '/catalogo',
        color: 'from-[--brand-primary]/80'
    },
    {
        image: '/images/hero_adventure.png',
        title: 'AVENTURA',
        subtitle: 'DIVERSIÓN SIN LÍMITES',
        description: 'Prepara a tus pequeños para la aventura con diseños diseñados para resistir el juego y fomentar la imaginación.',
        cta: 'EXPLORAR TODO',
        href: '/catalogo',
        color: 'from-blue-600/80'
    },
    {
        image: '/images/hero_style.png',
        title: 'NUEVA TEMPORADA',
        subtitle: 'ESTILO CON ALEGRÍA',
        description: 'Explora las últimas tendencias en moda infantil que combinan comodidad, color y elegancia para toda ocasión.',
        cta: 'COMPRAR AHORA',
        href: '/catalogo',
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
                            <div className="absolute inset-0 overflow-hidden">
                                <motion.div
                                    initial={{ scale: 1.2 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 15, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
                                    className="relative w-full h-[120%] -top-[10%]"
                                >
                                    <Image
                                        src={slide.image}
                                        alt={slide.title}
                                        fill
                                        className="object-cover opacity-60 object-[center_20%]"
                                        priority={index === 0}
                                    />
                                </motion.div>
                            </div>

                            {/* Black Overlay for readability */}
                            <div className="absolute inset-0 bg-slate-900/40" />

                            {/* Gradient Overlay */}
                            {/* Color Gradient Overlay */}
                            <div className={`absolute inset-0 bg-gradient-to-r ${slide.color} via-transparent to-transparent opacity-80`} />

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
