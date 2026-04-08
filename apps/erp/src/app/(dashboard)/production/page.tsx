import { createClient } from "@/lib/supabase/server"
import ProductionClient from "@/components/production/ProductionClient"

export default async function ProductionPage({
    searchParams
}: {
    searchParams: { tab?: string }
}) {
    const activeTab = searchParams.tab || "orders"
    const supabase = createClient()

    // Fetch OPs
    const { data: orders } = await (supabase
        .from('production_orders')
        .select(`
            *,
            items:production_order_items(
                product:products(nombre, codigo)
            )
        `)
        .order('created_at', { ascending: false }) as any)

    // Fetch Products (for recipes)
    const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('tipo_item', 'PRODUCTO')
        .order('nombre')

    // Fetch OS (Service Orders)
    const { data: services } = await (supabase
        .from('service_orders')
        .select(`
            *,
            supplier:suppliers(nombre_comercial),
            op:production_orders(numero_doc)
        `)
        .order('created_at', { ascending: false }) as any)

    return (
        <ProductionClient
            initialOrders={orders || []}
            initialServices={services || []}
            products={products || []}
            activeTab={activeTab}
        />
    )
}
