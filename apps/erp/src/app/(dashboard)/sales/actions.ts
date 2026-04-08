"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getActiveProducts() {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('activo', true)
        .gt('stock', 0)
        .order('nombre', { ascending: true })

    if (error) throw error
    return data
}

export async function getCustomersList() {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('customers')
        .select('id, nombre_completo, nro_doc, tipo_documento')
        .order('nombre_completo', { ascending: true })

    if (error) throw error
    return data
}

export async function createManualSale(saleData: any) {
    const supabase = createClient()
    const nextNumber = Math.floor(Date.now() / 1000) % 1000000

    // 1. Crear venta
    const { data: sale, error: saleError } = await (supabase.from('sales') as any)
        .insert({
            company_id: '24b7a942-8a5a-434f-beac-d6fd222702ba',
            customer_id: saleData.customerId,
            total: saleData.total,
            igv: saleData.igv,
            metodo_pago: saleData.paymentMethod,
            status: 'COMPLETED',
            estado_pago: 'PAGADO',
            sunat_estado: 'PENDIENTE',
            fecha_emision: new Date().toISOString().split('T')[0],
            serie: 'ERP1',
            numero: nextNumber,
            moneda: 'PEN',
            canal_venta: saleData.canal_venta // FISICA, ECOMMERCE, MAYORISTA
        })
        .select()
        .single()

    if (saleError) throw saleError

    // 2. Crear items
    const saleItems = saleData.items.map((item: any) => ({
        sale_id: sale.id,
        product_id: item.id,
        cantidad: item.quantity,
        precio_unitario: item.price,
        subtotal: item.quantity * item.price
    }))

    const { error: itemsError } = await (supabase.from('sale_items') as any).insert(saleItems)

    if (itemsError) throw itemsError

    revalidatePath('/sales')
    return { success: true, saleId: sale.id }
}
