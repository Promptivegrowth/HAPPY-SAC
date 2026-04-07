import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { ArrowRight, ShoppingCart, Star, Heart } from "lucide-react"

export default async function HomePage() {
  const supabase = await createClient()

  // Obtenemos los productos destacados (featured)
  const { data: featuredProducts } = await supabase
    .from('products')
    .select('*')
    .eq('publicar_web', true)
    .eq('featured', true)
    .limit(3)

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-600 via-slate-900 to-slate-900" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-widest animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Star size={14} className="text-yellow-400 fill-yellow-400" />
            Nueva Colección 2024
          </div>

          <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 uppercase">
            DISFRACES QUE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-pink-600 italic">CREAN MAGIA</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-slate-300 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300">
            Fabricantes de alegría. Exportamos los mejores disfraces peruanos a todo el mundo con calidad premium y acabados perfectos.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-16 duration-700 delay-500">
            <Link href="/catalogo" className="w-full sm:w-auto px-8 py-4 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-pink-500/20">
              Ver Catálogo
              <ArrowRight size={20} />
            </Link>
            <Link href="/nosotros" className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-all border border-white/20 backdrop-blur-md flex items-center justify-center">
              Nuestra Historia
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Los Favoritos</h2>
            <p className="text-slate-500 mt-2">Nuestros diseños más vendidos esta temporada.</p>
          </div>
          <Link href="/catalogo" className="text-pink-600 font-bold hover:gap-3 transition-all flex items-center gap-2">
            Ver todo el catálogo <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProducts?.map((product: any) => (
            <div key={product.id} className="group relative">
              <div className="relative aspect-[4/5] overflow-hidden bg-slate-100 rounded-[2.5rem] transition-all group-hover:shadow-2xl group-hover:shadow-pink-500/5">
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-200 to-slate-100 group-hover:scale-110 transition-transform duration-700" />

                <button className="absolute top-6 right-6 p-3 rounded-full bg-white/80 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all hover:bg-pink-500 hover:text-white">
                  <Heart size={20} />
                </button>

                <div className="absolute inset-x-0 bottom-0 p-8 translate-y-4 group-hover:translate-y-0 transition-all">
                  <button className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all hover:bg-pink-600">
                    <ShoppingCart size={20} />
                    Agregar al Carrito
                  </button>
                </div>
              </div>

              <div className="mt-6 flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{product.nombre_web || product.nombre}</h3>
                  <p className="text-sm text-slate-500 mt-1">{product.codigo}</p>
                </div>
                <p className="text-xl font-black text-pink-600 italic">S/ {product.precio_venta_base.toFixed(2)}</p>
              </div>
            </div>
          ))}
          {(!featuredProducts || featuredProducts.length === 0) && (
            <div className="col-span-full py-20 text-center text-slate-400 italic">
              Cargando productos destacados...
            </div>
          )}
        </div>
      </section>

      {/* Benefits - kept for aesthetics */}
      <section className="bg-slate-50 py-24 rounded-[4rem]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-pink-500">
              <Star size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Envíos a todo el Perú</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Llegamos a todas las provincias con los Courier más confiables del mercado.</p>
          </div>
          <div className="space-y-4">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-pink-500">
              <Star size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Calidad de Exportación</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Nuestras prendas pasan por un riguroso control de calidad antes de salir a la venta.</p>
          </div>
          <div className="space-y-4">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-pink-500">
              <Star size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Soporte por WhatsApp</h3>
            <p className="text-slate-500 text-sm leading-relaxed">¿Tienes dudas con tu talla? Escríbenos y te asesoramos en tiempo real.</p>
          </div>
        </div>
      </section>
    </main>
  )
}
