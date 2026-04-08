import { createClient } from "@/lib/supabase/server"
import { PosManager } from "@/components/pos/PosManager"

export default async function PosPage() {
    const supabase = createClient()

    // Obtener productos con sus tallas y precios
    const { data: products } = await supabase
        .from('products')
        .select(`
            id,
            nombre,
            codigo,
            imagen_url,
            product_sizes (
                id,
                talla,
                precio_venta,
                stock
            )
        `)
        .eq('activo', true)
        .eq('tipo_item', 'PRODUCTO')
        .order('nombre', { ascending: true })

    return (
        <div className="p-0">
            <PosManager initialProducts={products || []} />
        </div>
    )
}
