const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const dotenv = require('dotenv')

const envFile = fs.readFileSync('apps/erp/.env.local')
const envConfig = dotenv.parse(envFile)

const supabase = createClient(
    envConfig.NEXT_PUBLIC_SUPABASE_URL,
    envConfig.SUPABASE_SERVICE_ROLE_KEY
)

const sql = `
-- Extensión de Recetas (Fichas Técnicas)
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS descripcion TEXT;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS costos_indirectos NUMERIC DEFAULT 0;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS color_referencia TEXT;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS merma_default NUMERIC DEFAULT 3.0;

-- Items de Receta (con merma)
ALTER TABLE recipe_items ADD COLUMN IF NOT EXISTS merma_porcentaje NUMERIC DEFAULT 3.0;

-- Operaciones de Receta (Servicios)
CREATE TABLE IF NOT EXISTS recipe_operations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    tipo_operacion TEXT NOT NULL,
    costo_base NUMERIC NOT NULL,
    tiempo_estimado_min INTEGER,
    orden INTEGER DEFAULT 0
);

-- Órdenes de Servicio (Tercerización)
CREATE TABLE IF NOT EXISTS service_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_os SERIAL,
    op_id UUID REFERENCES production_orders(id),
    supplier_id UUID REFERENCES suppliers(id),
    tipo_servicio TEXT NOT NULL,
    total_costo NUMERIC,
    estado TEXT DEFAULT 'PENDIENTE',
    fecha_entrega DATE,
    instrucciones_adicionales TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Materiales entregados en OS (AVIOS)
CREATE TABLE IF NOT EXISTS service_order_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    os_id UUID REFERENCES service_orders(id) ON DELETE CASCADE,
    material_id UUID REFERENCES materials(id),
    cantidad_entregada NUMERIC NOT NULL
);
`;

async function apply() {
    // Supabase JS doesn't have a direct 'sql' execution method unless we use an RPC
    // But we can try to use the REST API to check if the tables exist or use a trick
    // Since we don't have a generic SQL RPC, we might be stuck if MCP doesn't work.

    console.log("Applying SQL via RPC 'exec_sql' if it exists...");
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
        console.error("Error applying migration via RPC:", error.message);
        console.log("If 'exec_sql' doesn't exist, I'll try to use the MCP server again with better debugging or ask the user.");
    } else {
        console.log("Migration applied successfully!");
    }
}

apply()
