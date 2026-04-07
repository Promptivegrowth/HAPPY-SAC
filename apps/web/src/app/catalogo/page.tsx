import { createClient } from "@/lib/supabase/server"
import { Search, Filter, ShoppingCart, Heart, Grid, List } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface CatalogPageProps {
    searchParams: {
        category?: string
    }
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
    const supabase = createClient()
    const activeCategory = searchParams.category

    // Obtenemos categorías para el filtro
    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .eq('tipo', 'PRODUCTO')

    // Obtenemos productos
    let query = supabase
        .from('products')
        .select(`
      *,
      category:categories(nombre)
    `)
        .eq('publicar_web', true)

    if (activeCategory) {
        query = query.eq('categoria_id', activeCategory)
    }

    const { data: products } = await query

    return (
        <div className="min-h-screen bg-slate-50 pt-32 pb-24">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                    <div className="space-y-2">
                        <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">Nuestro <span className="text-pink-600 italic">Catálogo</span></h1>
                        <p className="text-slate-500 font-medium">Explora nuestra colección completa de disfraces premium.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar disfraz..."
                                className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all w-64 shadow-sm"
                            />
                        </div>
                        <button className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-400 hover:text-slate-900 transition-all">
                            <Grid size={20} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    {/* Sidebar Filters */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Filter size={16} />
                                Categorías
                            </h3>
                            <div className="space-y-2">
                                <Link
                                    href="/catalogo"
                                    className={cn(
                                        "block px-4 py-2.5 rounded-xl text-sm font-bold transition-all",
                                        !activeCategory ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10" : "text-slate-500 hover:bg-white hover:text-slate-900"
                                    )}
                                >
                                    Todos los productos
                                </Link>
                                {categories?.map((cat) => (
                                    <Link
                                        key={cat.id}
                                        href={`/catalogo?category=${cat.id}`}
                                        className={cn(
                                            "block px-4 py-2.5 rounded-xl text-sm font-bold transition-all",
                                            activeCategory === cat.id ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10" : "text-slate-500 hover:bg-white hover:text-slate-900"
                                        )}
                                    >
                                        {cat.nombre}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 bg-pink-600 rounded-[2.5rem] text-white space-y-4 shadow-xl shadow-pink-600/20 overflow-hidden relative group">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700" />
                            <h4 className="text-xl font-black leading-tight relative">¿Buscas algo personalizado?</h4>
                            <p className="text-pink-100 text-xs leading-relaxed opacity-80 relative">Hacemos disfraces a medida para eventos corporativos y colegios.</p>
                            <button className="w-full py-3 bg-white text-pink-600 font-bold rounded-xl text-sm hover:bg-pink-50 transition-colors relative">Contáctanos</button>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="lg:col-span-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {products?.map((product: any) => (
                                <div key={product.id} className="group flex flex-col">
                                    <div className="relative aspect-[4/5] overflow-hidden bg-white rounded-[2.5rem] shadow-sm transition-all group-hover:shadow-2xl group-hover:shadow-pink-500/5 group-hover:-translate-y-1">
                                        <div className="absolute inset-0 bg-slate-50 group-hover:scale-110 transition-transform duration-700" />

                                        <div className="absolute top-6 left-6 flex flex-col gap-2">
                                            <span className="px-3 py-1 bg-white/80 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-wider text-slate-900 border border-white/20">
                                                {product.category?.nombre}
                                            </span>
                                        </div>

                                        <button className="absolute top-6 right-6 p-3 rounded-full bg-white/80 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all hover:bg-pink-500 hover:text-white shadow-sm">
                                            <Heart size={18} />
                                        </button>

                                        <div className="absolute inset-x-0 bottom-0 p-8 translate-y-4 group-hover:translate-y-0 transition-all">
                                            <Link href={`/producto/${product.id}`} className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all hover:bg-pink-600 shadow-xl">
                                                <ShoppingCart size={18} />
                                                Ver Detalles
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-between items-start px-2">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{product.nombre_web || product.nombre}</h3>
                                            <p className="text-xs text-slate-400 mt-1 font-medium">{product.codigo}</p>
                                        </div>
                                        <p className="text-lg font-black text-pink-600 italic">S/ {product.precio_venta_base.toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {(!products || products.length === 0) && (
                            <div className="py-32 text-center space-y-4">
                                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-200 mx-auto shadow-sm">
                                    <Search size={40} />
                                </div>
                                <p className="text-slate-400 font-medium italic">No se encontraron productos en esta categoría.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
