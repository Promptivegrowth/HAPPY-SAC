import { createClient } from "@/lib/supabase/server"
import OPForm from "@/components/production/op-form"

export default async function NewProductionPage() {
    const supabase = createClient()

    // Obtenemos los productos para el select
    const { data: products } = await supabase
        .from('products')
        .select('id, nombre, codigo')
        .order('nombre', { ascending: true })

    return (
        <div className="py-8">
            <OPForm products={products || []} />
        </div>
    )
}
