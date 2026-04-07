import { createClient } from "@/lib/supabase/server"
import {
    ArrowLeft,
    Star,
    ShieldCheck,
    Truck,
    RotateCcw,
    ShoppingCart
} from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { cn } from "@/lib/utils"
import AddToCartSection from "@/components/cart/add-to-cart-section"

interface ProductPageProps {
    params: {
        id: string
    }
}

export default async function ProductPage({ params }: ProductPageProps) {
    const supabase = createClient()

    // Obtenemos el producto y sus tallas
    const { data: product } = await supabase
        .from('products')
        .select(`
      *,
      category:categories(nombre),
      sizes:product_sizes(*)
    `)
        .eq('id', params.id)
        .single()

    if (!product) notFound()

    const { data: relatedProducts } = await supabase
        .from('products')
        .select('*')
        .eq('categoria_id', product.categoria_id)
        .neq('id', product.id)
        .limit(4)

    return (
        <div className="min-h-screen bg-white pt-24 pb-24">
            <div className="max-w-7xl mx-auto px-6">
                <Link href="/catalogo" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-sm transition-all mb-8 group">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Volver al catálogo
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Main Gallery Placeholder */}
                    <div className="space-y-6">
                        <div className="aspect-[4/5] bg-slate-50 rounded-[3rem] overflow-hidden relative group shadow-2xl shadow-slate-200/50">
                            <div className="absolute inset-0 bg-gradient-to-tr from-slate-100 to-white" />
                            <div className="absolute inset-0 flex items-center justify-center text-slate-200">
                                <ShoppingCart size={120} strokeWidth={0.5} />
                            </div>
                            <div className="absolute top-8 left-8 flex flex-col gap-3">
                                <span className="px-4 py-1.5 bg-white/80 backdrop-blur-md rounded-full text-[11px] font-black uppercase tracking-widest text-pink-600 border border-pink-100 shadow-sm">
                                    {product.category?.nombre}
                                </span>
                            </div>
                        </div>

                        {/* Thumbnail placeholders */}
                        <div className="grid grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className={cn(
                                    "aspect-square rounded-2xl bg-slate-50 border-2 transition-all cursor-pointer",
                                    i === 1 ? "border-pink-500 shadow-lg shadow-pink-500/10" : "border-transparent hover:border-slate-200"
                                )} />
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-10">
                        <div className="space-y-4">
                            <div className="flex items-center gap-1 text-yellow-400">
                                {[1, 2, 3, 4, 5].map(star => <Star key={star} size={16} fill="currentColor" />)}
                                <span className="text-slate-400 text-xs font-bold ml-2">4.9 (42 reseñas)</span>
                            </div>
                            <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-[1.1]">{product.nombre_web || product.nombre}</h1>
                            <div className="flex items-baseline gap-4">
                                <p className="text-4xl font-black text-pink-600 italic">S/ {product.precio_venta_base.toFixed(2)}</p>
                                <p className="text-xl text-slate-300 line-through decoration-slate-200 font-bold decoration-2">S/ {(product.precio_venta_base * 1.2).toFixed(2)}</p>
                            </div>
                        </div>

                        {/* Interactive Section */}
                        <AddToCartSection product={product} sizes={product.sizes || []} />

                        {/* Policies */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 border-t border-slate-100">
                            <div className="flex flex-col items-center text-center gap-2">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600"><ShieldCheck size={20} /></div>
                                <p className="text-[10px] font-black uppercase text-slate-900 tracking-wider">Pago Seguro</p>
                            </div>
                            <div className="flex flex-col items-center text-center gap-2">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600"><Truck size={20} /></div>
                                <p className="text-[10px] font-black uppercase text-slate-900 tracking-wider">Envío rápido</p>
                            </div>
                            <div className="flex flex-col items-center text-center gap-2">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600"><RotateCcw size={20} /></div>
                                <p className="text-[10px] font-black uppercase text-slate-900 tracking-wider">Devoluciones</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts && relatedProducts.length > 0 && (
                    <div className="mt-40 space-y-12">
                        <div className="flex items-end justify-between">
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Te podría <span className="text-pink-600">gustar</span></h2>
                            <Link href="/catalogo" className="text-sm font-bold text-slate-400 hover:text-slate-900 transition-all">Ver más</Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {relatedProducts.map((p: any) => (
                                <Link key={p.id} href={`/producto/${p.id}`} className="group space-y-4">
                                    <div className="aspect-[4/5] bg-slate-50 rounded-[2rem] overflow-hidden group-hover:shadow-2xl group-hover:shadow-pink-500/5 transition-all">
                                        <div className="w-full h-full bg-slate-100 group-hover:scale-110 transition-transform duration-700" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900">{p.nombre}</h3>
                                        <p className="text-lg font-black text-pink-600 italic mt-1">S/ {p.precio_venta_base.toFixed(2)}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
