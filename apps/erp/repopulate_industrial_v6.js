const fetch = require('node-fetch');

const URL = 'https://mickytkrhfwjpqdoalyx.supabase.co/rest/v1';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pY2t5dGtyaGZ3anBxZG9hbHl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTUzMjU3MywiZXhwIjoyMDkxMTA4NTczfQ.X2nCjCsx-KPaQgPXrE9A9eO4mBDl_guKtrL4RRKypAI';

const COMPANY_ID = '24b7a942-8a5a-434f-beac-d6fd222702ba';
const WH_ID = 'c9890ec9-1939-40c8-8be4-dabb0210cd03';
const CAT_MAT = 'e3fb452b-882e-4622-83e9-7f80884a913f';
const CAT_PROD = '501ef503-4b6a-47b9-be11-fc8d30a3a683';

async function sup(path, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'apikey': KEY,
            'Authorization': `Bearer ${KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        }
    };
    if (body) options.body = JSON.stringify(body);
    const res = await fetch(`${URL}${path}`, options);
    const data = await res.json();
    if (!res.ok) {
        console.error(`ERROR en ${method} ${path}:`, JSON.stringify(data, null, 2));
        throw new Error(`Fallo en ${method} ${path}: ${data.message || data.code}`);
    }
    return data;
}

async function run() {
    try {
        console.log("Iniciando Carga Industrial (V6) para HAPPY S.A.C...");

        // 1. Materiales
        console.log("-> Creando Materiales...");
        const m1 = (await sup('/products', 'POST', {
            nombre: 'Tela Spandex Roja Pro V6',
            codigo: 'MAT-SPD-V6-01',
            tipo_item: 'MATERIAL',
            precio_venta_base: 42.0,
            categoria_id: CAT_MAT,
            company_id: COMPANY_ID
        }))[0];

        const m2 = (await sup('/products', 'POST', {
            nombre: 'Tela Spandex Azul Pro V6',
            codigo: 'MAT-SPD-V6-02',
            tipo_item: 'MATERIAL',
            precio_venta_base: 42.0,
            categoria_id: CAT_MAT,
            company_id: COMPANY_ID
        }))[0];

        // 2. Kardex (One by one to be safe)
        console.log("-> Registrando Kardex...");
        try {
            await sup('/kardex_movements', 'POST', {
                company_id: COMPANY_ID,
                tipo_movimiento: 'ENTRADA',
                tipo_item: 'MATERIAL',
                material_id: m1.id,
                warehouse_id: WH_ID,
                cantidad: 500,
                costo_unitario: 42.0,
                costo_total: 21000,
                referencia_tipo: 'AJUSTE',
                fecha: new Date().toISOString()
            });
            await sup('/kardex_movements', 'POST', {
                company_id: COMPANY_ID,
                tipo_movimiento: 'ENTRADA',
                tipo_item: 'MATERIAL',
                material_id: m2.id,
                warehouse_id: WH_ID,
                cantidad: 400,
                costo_unitario: 42.0,
                costo_total: 16800,
                referencia_tipo: 'AJUSTE',
                fecha: new Date().toISOString()
            });
        } catch (e) {
            console.warn("Fallo Kardex (posible columna faltante), pero continuamos...", e.message);
        }

        // 3. Producto Terminado
        console.log("-> Creando Producto Terminado...");
        const product = (await sup('/products', 'POST', {
            nombre: 'Disfraz Spiderman Advanced 2026 (FINAL V6)',
            codigo: 'SPD-ADV-V6-26',
            tipo_item: 'PRODUCTO',
            precio_venta_base: 245.0,
            categoria_id: CAT_PROD,
            company_id: COMPANY_ID,
            tallas: ["S", "M", "L"]
        }))[0];

        // 4. Tallas
        console.log("-> Registrando Tallas...");
        await sup('/product_sizes', 'POST', [
            { product_id: product.id, talla: 'S', orden: 1, precio_venta: 245.0 },
            { product_id: product.id, talla: 'M', orden: 2, precio_venta: 245.0 },
            { product_id: product.id, talla: 'L', orden: 3, precio_venta: 255.0 }
        ]);

        // 5. Receta
        console.log("-> Creando Ficha Técnica...");
        const recipe = (await sup('/recipes', 'POST', {
            company_id: COMPANY_ID,
            product_id: product.id,
            estado: 'ACTIVA',
            descripcion: 'Manufactura industrial premium Spiderman V6.',
            costos_indirectos: 55.0,
            merma_default: 4.5
        }))[0];

        // 6. Insumos
        console.log("-> Añadiendo Insumos...");
        await sup('/recipe_items', 'POST', [
            { recipe_id: recipe.id, material_id: m1.id, cantidad: 1.95, merma_porcentaje: 4.5 },
            { recipe_id: recipe.id, material_id: m2.id, cantidad: 1.35, merma_porcentaje: 4.5 }
        ]);

        // 7. Operaciones
        console.log("-> Añadiendo Operaciones...");
        await sup('/recipe_operations', 'POST', [
            { recipe_id: recipe.id, tipo_operacion: 'CORTE LASER PRO V6', costo_base: 35.0, orden: 1 },
            { recipe_id: recipe.id, tipo_operacion: 'COSTURA TRIPLE REFORZADA', costo_base: 85.0, orden: 2 },
            { recipe_id: recipe.id, tipo_operacion: 'OJALES Y BOTONES (TERCERO)', costo_base: 30.0, orden: 3 }
        ]);

        console.log("¡EXITO TOTAL! La data industrial V6 está lista.");
    } catch (e) {
        console.error("ERROR CRITICO:", e.message);
    }
}

run();
