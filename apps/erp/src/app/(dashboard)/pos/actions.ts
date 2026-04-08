"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

/**
 * Registra una nueva venta en el sistema, descuenta stock y asocia al turno de caja
 */
export async function processSale(saleData: {
    customerId: string | null;
    shiftId: string;
    items: {
        productId: string;
        sizeId: string;
        quantity: number;
        price: number;
        subtotal: number;
    }[];
    paymentMethod: 'EFECTIVO' | 'YAPE' | 'PLIN' | 'TRANSFERENCIA';
    total: number;
    igv: number;
}) {
    const supabase = createClient()

    // 1. Crear el registro de venta (cabecera)
    const { data: sale, error: saleError } = await (supabase.from('sales') as any)
        .insert({
            customer_id: saleData.customerId,
            cash_shift_id: saleData.shiftId,
            total: saleData.total,
            igv: saleData.igv,
            metodo_pago: saleData.paymentMethod,
            status: 'COMPLETED'
        })
        .select()
        .single()

    if (saleError) {
        console.error("Error creating sale:", saleError)
        return { success: false, error: saleError.message }
    }

    // 2. Crear los detalles de la venta (items)
    // El trigger en la base de datos se encargará de descontar el stock automáticamente
    const saleItems = saleData.items.map(item => ({
        sale_id: sale.id,
        product_id: item.productId,
        product_size_id: item.sizeId,
        cantidad: item.quantity,
        precio_unitario: item.price,
        subtotal: item.subtotal
    }))

    const { error: itemsError } = await (supabase.from('sale_items') as any)
        .insert(saleItems)

    if (itemsError) {
        console.error("Error creating sale items:", itemsError)
        return { success: false, error: itemsError.message }
    }

    revalidatePath('/pos')
    return { success: true, saleId: sale.id }
}

/**
 * Gestión de turnos de caja
 */
export async function openCashShift(initialAmount: number) {
    const supabase = createClient()

    // Obtener el usuario actual
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await (supabase.from('cash_shifts') as any)
        .insert({
            user_id: user?.id,
            initial_amount: initialAmount,
            status: 'OPEN'
        })
        .select()
        .single()

    if (error) return { success: false, error: error.message }

    revalidatePath('/pos')
    return { success: true, shift: data }
}

export async function closeCashShift(shiftId: string, actualAmount: number, notes?: string) {
    const supabase = createClient()

    const { data, error } = await (supabase.from('cash_shifts') as any)
        .update({
            actual_amount: actualAmount,
            status: 'CLOSED',
            closed_at: new Date().toISOString(),
            notes
        })
        .eq('id', shiftId)
        .select()
        .single()

    if (error) return { success: false, error: error.message }

    revalidatePath('/pos')
    return { success: true, shift: data }
}

export async function getActiveShift() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await (supabase.from('cash_shifts') as any)
        .select('*')
        .eq('status', 'OPEN')
        // .eq('user_id', user?.id) // Opcional: restringir por usuario
        .maybeSingle()

    if (error) return null
    return data
}
