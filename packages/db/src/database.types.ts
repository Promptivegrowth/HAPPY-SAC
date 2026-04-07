export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            companies: {
                Row: {
                    id: string
                    nombre: string
                    ruc: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    nombre: string
                    ruc: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    nombre?: string
                    ruc?: string
                    created_at?: string
                }
            }
            materials: {
                Row: {
                    id: string
                    nombre: string
                    codigo: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    nombre: string
                    codigo: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    nombre?: string
                    codigo?: string
                    created_at?: string
                }
            }
            products: {
                Row: {
                    id: string
                    nombre: string
                    codigo: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    nombre: string
                    codigo: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    nombre?: string
                    codigo?: string
                    created_at?: string
                }
            }
            product_sizes: {
                Row: {
                    id: string
                    product_id: string
                    talla: string
                    orden: number
                    precio_venta: number | null
                }
                Insert: {
                    id?: string
                    product_id: string
                    talla: string
                    orden: number
                    precio_venta?: number | null
                }
                Update: {
                    id?: string
                    product_id?: string
                    talla?: string
                    orden?: number
                    precio_venta?: number | null
                }
            }
            recipes: {
                Row: {
                    id: string
                    product_id: string
                    product_size_id: string
                    estado: string
                }
                Insert: {
                    id?: string
                    product_id: string
                    product_size_id: string
                    estado: string
                }
                Update: {
                    id?: string
                    product_id?: string
                    product_size_id?: string
                    estado?: string
                }
            }
            recipe_items: {
                Row: {
                    id: string
                    recipe_id: string
                    material_id: string
                    cantidad: number
                }
                Insert: {
                    id?: string
                    recipe_id: string
                    material_id: string
                    cantidad: number
                }
                Update: {
                    id?: string
                    recipe_id?: string
                    material_id?: string
                    cantidad?: number
                }
            }
            production_orders: {
                Row: {
                    id: string
                    numero_op: string
                    product_id: string
                    product_size_id: string
                    cantidad_solicitada: number
                    estado: string
                    fecha_entrega: string
                    company_id: string
                }
                Insert: {
                    id?: string
                    numero_op?: string
                    product_id: string
                    product_size_id: string
                    cantidad_solicitada: number
                    estado?: string
                    fecha_entrega: string
                    company_id: string
                }
                Update: {
                    id?: string
                    numero_op?: string
                    product_id?: string
                    product_size_id?: string
                    cantidad_solicitada?: number
                    estado?: string
                    fecha_entrega?: string
                    company_id?: string
                }
            }
            customers: {
                Row: {
                    id: string
                    nombre_completo: string
                    nro_doc: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    nombre_completo: string
                    nro_doc: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    nombre_completo?: string
                    nro_doc?: string
                    created_at?: string
                }
            }
            sales: {
                Row: {
                    id: string
                    company_id: string
                    customer_id: string
                    total: number
                    estado_pago: string
                    sunat_estado: string
                    fecha_registro: string
                    fecha_emision: string
                    serie: string
                    numero: number
                    moneda: string
                }
                Insert: {
                    id?: string
                    company_id: string
                    customer_id: string
                    total: number
                    estado_pago?: string
                    sunat_estado?: string
                    fecha_registro?: string
                    numero: number
                }
                Update: {
                    id?: string
                    company_id?: string
                    customer_id?: string
                    total?: number
                    estado_pago?: string
                    sunat_estado?: string
                    fecha_registro?: string
                    numero?: number
                }
            }
            sale_items: {
                Row: {
                    id: string
                    sale_id: string
                    product_id: string
                    product_size_id: string
                    cantidad: number
                    precio_unitario: number
                    subtotal: number
                }
                Insert: {
                    id?: string
                    sale_id: string
                    product_id: string
                    product_size_id: string
                    cantidad: number
                    precio_unitario: number
                    subtotal: number
                }
                Update: {
                    id?: string
                    sale_id?: string
                    product_id?: string
                    product_size_id?: string
                    cantidad?: number
                    precio_unitario?: number
                    subtotal?: number
                }
            }
            units_of_measure: {
                Row: {
                    id: string
                    nombre: string
                    simbolo: string
                }
                Insert: {
                    id?: string
                    nombre: string
                    simbolo: string
                }
                Update: {
                    id?: string
                    nombre?: string
                    simbolo?: string
                }
            }
            suppliers: {
                Row: {
                    id: string
                    nombre_comercial: string
                    razon_social: string | null
                    ruc: string
                    contacto_nombre: string | null
                    contacto_telefono: string | null
                    email: string | null
                    direccion: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    nombre_comercial: string
                    razon_social?: string | null
                    ruc: string
                    contacto_nombre?: string | null
                    contacto_telefono?: string | null
                    email?: string | null
                    direccion?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    nombre_comercial?: string
                    razon_social?: string | null
                    ruc?: string
                    contacto_nombre?: string | null
                    contacto_telefono?: string | null
                    email?: string | null
                    direccion?: string | null
                    created_at?: string
                }
            }
            pos_sessions: {
                Row: {
                    id: string
                    user_id: string
                    fecha_apertura: string
                    fecha_cierre: string | null
                    monto_inicial: number
                    monto_final: number | null
                    estado: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    fecha_apertura?: string
                    fecha_cierre?: string | null
                    monto_inicial: number
                    monto_final?: number | null
                    estado?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    fecha_apertura?: string
                    fecha_cierre?: string | null
                    monto_inicial?: number
                    monto_final?: number | null
                    estado?: string
                }
            }
            erp_settings: {
                Row: {
                    id: string
                    company_name: string
                    ruc: string | null
                    direccion: string | null
                    telefono: string | null
                    logo_url: string | null
                    sunat_username: string | null
                    sunat_password: string | null
                    sunat_endpoint: string | null
                    whatsapp_number: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    company_name: string
                    ruc?: string | null
                    direccion?: string | null
                    telefono?: string | null
                    logo_url?: string | null
                    sunat_username?: string | null
                    sunat_password?: string | null
                    sunat_endpoint?: string | null
                    whatsapp_number?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    company_name?: string
                    ruc?: string | null
                    direccion?: string | null
                    telefono?: string | null
                    logo_url?: string | null
                    sunat_username?: string | null
                    sunat_password?: string | null
                    sunat_endpoint?: string | null
                    whatsapp_number?: string | null
                    created_at?: string
                }
            }
        }
        Views: {
            v_stock_actual: {
                Row: {
                    material_id: string
                    nombre: string
                    codigo: string
                    tipo_item: string
                    stock_total: number
                    stock_reservado: number
                    stock_disponible: number
                }
            }
        }
        Functions: {}
        Enums: {}
    }
}
