import { createClient } from "@/lib/supabase/server"
import { ProductList } from "@/components/inventory/ProductList"

export default async function InventoryPage() {
    const supabase = createClient()

    // 1. Consultamos productos con sus tallas (Fuente de la Web)
    const { data: productsData } = await (supabase
        .from('products')
        .select(`
            id,
            codigo,
            nombre,
            clasificacion:categories(nombre),
            publicar_web,
            product_sizes(id, talla, stock)
        `)
        .eq('activo', true) as any)

    // 2. Consultamos materiales de la vista de stock (Kardex)
    // Para materiales, el Kardex es la única fuente fiable
    const { data: stockVista } = await (supabase
        .from('v_stock_actual')
        .select('*')
        .eq('tipo_item', 'MATERIAL') as any)

    // 3. Procesamos los productos para que tengan el formato de la lista
    const productsFormatted = (productsData || []).flatMap((p: any) =>
        (p.product_sizes || []).map((ps: any) => ({
            id: p.id,
            item_id: ps.id,
            codigo: p.codigo + (ps.talla ? `-${ps.talla}` : ''),
            nombre: p.nombre,
            clasificacion: p.clasificacion?.nombre || 'PRODUCTO',
            stock: ps.stock || 0,
            unidad: 'UNI',
            tipo_item: 'PRODUCTO',
            publicar_web: p.publicar_web,
            talla: ps.talla
        }))
    )

    // 4. Combinamos materiales y productos
    const allItems = [
        ...(stockVista || []),
        ...productsFormatted
    ]

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Inventario <span className="text-pink-600">(v3.0)</span></h1>
                <p className="text-slate-500 mt-1">Gestión de telas, insumos y productos terminados de HAPPY S.A.C.</p>
            </div>

            <ProductList initialData={allItems} />
        </div>
    )
}
