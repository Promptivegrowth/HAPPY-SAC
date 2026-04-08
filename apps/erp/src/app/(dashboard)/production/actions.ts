"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function cancelProductionOrder(orderId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('production_orders')
        .update({ estado: 'CANCELADO' })
        .eq('id', orderId)

    if (error) {
        console.error("Error cancelProductionOrder:", error)
        return { success: false, error: error.message }
    }

    revalidatePath("/production")
    return { success: true }
}

export async function cancelServiceOrder(serviceId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('service_orders')
        .update({ estado: 'CANCELADO' })
        .eq('id', serviceId)

    if (error) {
        console.error("Error cancelServiceOrder:", error)
        return { success: false, error: error.message }
    }

    revalidatePath("/production")
    return { success: true }
}
