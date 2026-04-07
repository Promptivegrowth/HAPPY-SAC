'use client'
import { motion } from 'framer-motion'
import { X, SlidersHorizontal, ChevronDown } from 'lucide-react'
import * as Accordion from '@radix-ui/react-accordion'
import * as Checkbox from '@radix-ui/react-checkbox'
import * as Slider from '@radix-ui/react-slider'

const CATEGORIES = [
    { id: 'fiestas-patrias', name: 'Fiestas Patrias' },
    { id: 'halloween', name: 'Halloween' },
    { id: 'navidad', name: 'Navidad' },
    { id: 'ninos', name: 'Niños' },
    { id: 'adultos', name: 'Adultos' }
]

export function FilterSidebar({ isOpen, onClose }: { isOpen?: boolean, onClose?: () => void }) {
    return (
        <aside className="space-y-8">
            <div className="flex items-center justify-between lg:hidden mb-8">
                <h3 className="text-xl font-display font-black text-[--brand-secondary]">FILTRAR</h3>
                <button onClick={onClose}><X size={24} /></button>
            </div>

            <Accordion.Root type="multiple" defaultValue={['categories', 'price']}>
                {/* Categorías */}
                <Accordion.Item value="categories" className="border-b border-slate-100 py-6">
                    <Accordion.Header>
                        <Accordion.Trigger className="flex w-full items-center justify-between text-sm font-black uppercase tracking-widest text-[--brand-secondary] group">
                            Categorías
                            <ChevronDown size={16} className="group-data-[state=open]:rotate-180 transition-transform" />
                        </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Content className="pt-6 space-y-4">
                        {CATEGORIES.map(cat => (
                            <div key={cat.id} className="flex items-center gap-3">
                                <Checkbox.Root id={cat.id} className="w-5 h-5 rounded border-2 border-slate-200 data-[state=checked]:bg-[--brand-primary] data-[state=checked]:border-[--brand-primary] transition-all">
                                    <Checkbox.Indicator className="text-white flex items-center justify-center">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M20 6L9 17L4 12" /></svg>
                                    </Checkbox.Indicator>
                                </Checkbox.Root>
                                <label htmlFor={cat.id} className="text-sm font-medium text-[--text-secondary] cursor-pointer hover:text-[--brand-primary]">
                                    {cat.name}
                                </label>
                            </div>
                        ))}
                    </Accordion.Content>
                </Accordion.Item>

                {/* Precio */}
                <Accordion.Item value="price" className="border-b border-slate-100 py-6">
                    <Accordion.Header>
                        <Accordion.Trigger className="flex w-full items-center justify-between text-sm font-black uppercase tracking-widest text-[--brand-secondary] group">
                            Rango de Precio
                            <ChevronDown size={16} className="group-data-[state=open]:rotate-180 transition-transform" />
                        </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Content className="pt-8 px-2">
                        <Slider.Root className="relative flex items-center select-none touch-none w-full h-5" defaultValue={[0, 500]} max={1000} step={10}>
                            <Slider.Track className="bg-slate-100 relative grow rounded-full h-[3px]">
                                <Slider.Range className="absolute bg-[--brand-primary] rounded-full h-full" />
                            </Slider.Track>
                            <Slider.Thumb className="block w-5 h-5 bg-white border-2 border-[--brand-primary] shadow-lg rounded-full hover:scale-110 transition-transform focus:outline-none" />
                            <Slider.Thumb className="block w-5 h-5 bg-white border-2 border-[--brand-primary] shadow-lg rounded-full hover:scale-110 transition-transform focus:outline-none" />
                        </Slider.Root>
                        <div className="flex justify-between mt-4 text-[10px] font-black text-slate-400">
                            <span>S/ 0</span>
                            <span>S/ 1000+</span>
                        </div>
                    </Accordion.Content>
                </Accordion.Item>

                {/* Disponibilidad */}
                <Accordion.Item value="stock" className="py-6">
                    <Accordion.Header>
                        <Accordion.Trigger className="flex w-full items-center justify-between text-sm font-black uppercase tracking-widest text-[--brand-secondary] group">
                            Disponibilidad
                            <ChevronDown size={16} className="group-data-[state=open]:rotate-180 transition-transform" />
                        </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Content className="pt-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <Checkbox.Root id="in-stock" className="w-5 h-5 rounded border-2 border-slate-200 data-[state=checked]:bg-[--brand-primary] data-[state=checked]:border-[--brand-primary]">
                                <Checkbox.Indicator className="text-white flex items-center justify-center">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M20 6L9 17L4 12" /></svg>
                                </Checkbox.Indicator>
                            </Checkbox.Root>
                            <label htmlFor="in-stock" className="text-sm font-medium text-[--text-secondary]">
                                En Stock (Entrega inmediata)
                            </label>
                        </div>
                    </Accordion.Content>
                </Accordion.Item>
            </Accordion.Root>

            <button className="btn-primary w-full py-3 text-xs tracking-widest">
                APLICAR FILTROS
            </button>
        </aside>
    )
}
