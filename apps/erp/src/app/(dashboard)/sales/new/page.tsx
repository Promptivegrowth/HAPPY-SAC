import { createClient } from "@/lib/supabase/server"
import SalesForm from "@/components/sales/sales-form"

export default async function NewSalesPage() {
    const supabase = createClient()

    // Obtenemos clientes
    const { data: customers } = await supabase
        .from('customers')
        .select('id, nombre_completo, nro_doc')
        .order('nombre_completo', { ascending: true })

    // Obtenemos productos
    const { data: products } = await supabase
        .from('products')
        .select('id, nombre, codigo, precio_venta_base')
        .order('nombre', { ascending: true })

    return (
        <div className="py-8">
            <SalesForm
                customers={customers || []}
                products={products || []}
            />
        </div>
    )
}
