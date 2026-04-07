import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

export type { Database }
export * from './database.types'

export type Rol = 'SUPERADMIN' | 'ADMIN' | 'PRODUCCION_JEFE' | 'PRODUCCION_OP' | 'VENTAS' | 'ALMACEN' | 'COMPRAS' | 'CONTABILIDAD' | 'GERENCIA' | 'SOLO_LECTURA'
export type EstadoOP = 'PENDIENTE' | 'EN_PROCESO' | 'ACABADOS' | 'CERRADA' | 'ANULADA'
export type EstadoReceta = 'BORRADOR' | 'ACTIVA' | 'INACTIVA' | 'ARCHIVADA'
export type TipoMovimiento = 'ENTRADA' | 'SALIDA' | 'TRANSFERENCIA_SALIDA' | 'TRANSFERENCIA_ENTRADA' | 'AJUSTE_POS' | 'AJUSTE_NEG' | 'DEVOLUCION_ENTRADA' | 'DEVOLUCION_SALIDA' | 'MERMA' | 'PRODUCCION_SALIDA' | 'PRODUCCION_ENTRADA' | 'RESERVA' | 'LIBERACION_RESERVA'

export function createClient(url: string, key: string) {
  return createSupabaseClient<Database>(url, key)
}
