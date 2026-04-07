'use client'
import React, { useState, useCallback } from 'react'
import Image from 'next/image'
import useEmblaCarousel from 'embla-carousel-react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ProductGallery({ images }: { images: string[] }) {
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [emblaMainRef, emblaMainApi] = useEmblaCarousel({ loop: true })
    const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
        containScroll: 'keepSnaps',
        dragFree: true,
    })

    const onThumbClick = useCallback(
        (index: number) => {
            if (!emblaMainApi || !emblaThumbsApi) return
            emblaMainApi.scrollTo(index)
        },
        [emblaMainApi, emblaThumbsApi]
    )

    const onSelect = useCallback(() => {
        if (!emblaMainApi || !emblaThumbsApi) return
        setSelectedIndex(emblaMainApi.selectedScrollSnap())
        emblaThumbsApi.scrollTo(emblaMainApi.selectedScrollSnap())
    }, [emblaMainApi, emblaThumbsApi, setSelectedIndex])

    React.useEffect(() => {
        if (!emblaMainApi) return
        onSelect()
        emblaMainApi.on('select', onSelect)
        emblaMainApi.on('reInit', onSelect)
    }, [emblaMainApi, onSelect])

    const mainImages = images.length > 0 ? images : ['/placeholder-product.jpg']

    return (
        <div className="flex flex-col gap-4">
            {/* Main Slider */}
            <div className="relative aspect-[3/4] bg-[--surface-2] rounded-[--radius-lg] overflow-hidden group">
                <div className="overflow-hidden h-full" ref={emblaMainRef}>
                    <div className="flex h-full">
                        {mainImages.map((src, i) => (
                            <div key={i} className="relative flex-[0_0_100%] h-full">
                                <Image
                                    src={src}
                                    alt={`Product view ${i + 1}`}
                                    fill
                                    className="object-cover"
                                    priority={i === 0}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Navigation Buttons */}
                <button
                    onClick={() => emblaMainApi?.scrollPrev()}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <ChevronLeft size={20} />
                </button>
                <button
                    onClick={() => emblaMainApi?.scrollNext()}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Thumbnails */}
            <div className="overflow-hidden" ref={emblaThumbsRef}>
                <div className="flex gap-4">
                    {mainImages.map((src, i) => (
                        <button
                            key={i}
                            onClick={() => onThumbClick(i)}
                            className={cn(
                                "relative flex-[0_0_80px] aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all",
                                i === selectedIndex ? "border-[--brand-primary]" : "border-transparent opacity-50"
                            )}
                        >
                            <Image src={src} alt={`Thumbnail ${i + 1}`} fill className="object-cover" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
