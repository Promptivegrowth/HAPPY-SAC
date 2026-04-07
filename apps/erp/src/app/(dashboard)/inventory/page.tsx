import { createClient } from "@/lib/supabase/server"
import { ProductList } from "@/components/inventory/ProductList"

export default async function InventoryPage() {
    const supabase = createClient()

    // Consultamos la vista de stock actual
    const { data: stock } = await supabase
        .from('v_stock_actual')
        .select('*')
        .order('nombre', { ascending: true })

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Inventario</h1>
                <p className="text-slate-500 mt-1">Gestión de telas, insumos y productos terminados de HAPPY S.A.C.</p>
            </div>

            <ProductList initialData={stock || []} />
        </div>
    )
}
