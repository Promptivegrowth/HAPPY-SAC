import { HeroSlider } from '@/components/sections/HeroSlider'
import { CategoriesGrid } from '@/components/sections/CategoriesGrid'
import { FeaturedProducts } from '@/components/sections/FeaturedProducts'
import { Truck, ShieldCheck, Clock, Award } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSlider />

      {/* Trust Badges */}
      <section className="bg-[--brand-secondary] text-white py-12">
        <div className="max-w-[--container-max] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { icon: <Truck />, title: 'ENVÍO RÁPIDO', desc: 'Todo Lima en 24-48h' },
            { icon: <ShieldCheck />, title: 'PAGO SEGURO', desc: 'Redirección a WhatsApp' },
            { icon: <Clock />, title: 'ATENCIÓN 24/7', desc: 'Soporte personalizado' },
            { icon: <Award />, title: 'CALIDAD PREMIUM', desc: 'Telas peruanas 100%' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 group">
              <div className="p-3 bg-white/10 rounded-xl group-hover:bg-[--brand-primary] transition-all">
                {item.icon}
              </div>
              <div>
                <h4 className="font-bold tracking-widest text-[10px] uppercase opacity-60">{item.title}</h4>
                <p className="font-display font-bold text-sm tracking-tight">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <CategoriesGrid />

      <FeaturedProducts />

      {/* Spectacular CTA Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[--brand-secondary]" />
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

        <div className="relative max-w-[--container-max] mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-8xl font-accent text-white mb-8 tracking-tighter">
            ¿TIENES UN EVENTO <span className="text-[--brand-accent]">ESPECIAL</span>?
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto mb-12 font-medium">
            Personalizamos disfraces para colegios, empresas y eventos masivos. ¡Hablemos hoy mismo!
          </p>
          <a
            href="https://wa.me/51916854842"
            target="_blank"
            className="inline-flex items-center gap-4 bg-[--brand-primary] text-white px-12 py-6 rounded-[--radius-xl] font-black text-xl hover:scale-105 transition-all shadow-2xl"
          >
            ASESORÍA POR WHATSAPP
            <Truck size={24} />
          </a>
        </div>
      </section>
    </div>
  )
}
