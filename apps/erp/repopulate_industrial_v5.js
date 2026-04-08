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
        throw new Error(`Fallo en ${method} ${path}`);
    }
    return data;
}

async function run() {
    try {
        console.log("Iniciando Carga Industrial (V5) para HAPPY S.A.C...");

        // 1. Materiales (Usamos códigos únicos V5)
        console.log("-> Creando Materiales...");
        const m1 = (await sup('/products', 'POST', {
            nombre: 'Tela Spandex Roja Pro V5',
            codigo: 'MAT-SPD-PRO-V5-01',
            tipo_item: 'MATERIAL',
            precio_venta_base: 40.0,
            categoria_id: CAT_MAT,
            company_id: COMPANY_ID
        }))[0];

        const m2 = (await sup('/products', 'POST', {
            nombre: 'Tela Spandex Azul Pro V5',
            codigo: 'MAT-SPD-PRO-V5-02',
            tipo_item: 'MATERIAL',
            precio_venta_base: 40.0,
            categoria_id: CAT_MAT,
            company_id: COMPANY_ID
        }))[0];

        // 2. Kardex (Ignorado por ahora si falla)
        console.log("-> Intentando Registrar Kardex (Silencioso)...");
        try {
            await sup('/kardex_movements', 'POST', [
                { company_id: COMPANY_ID, tipo_movimiento: 'ENTRADA', tipo_item: 'MATERIAL', material_id: m1.id, warehouse_id: WH_ID, cantidad: 100, costo_unitario: 40.0, costo_total: 4000, referencia_tipo: 'AJUSTE' }
            ]);
        } catch (e) {
            console.warn("Fallo Kardex, pero continuamos...");
        }

        // 3. Producto Terminado
        console.log("-> Creando Producto Terminado...");
        const product = (await sup('/products', 'POST', {
            nombre: 'Disfraz Spiderman Advanced 2026 (FINAL V5)',
            codigo: 'SPD-ADV-V5-26',
            tipo_item: 'PRODUCTO',
            precio_venta_base: 230.0,
            categoria_id: CAT_PROD,
            company_id: COMPANY_ID,
            tallas: ["S", "M", "L"]
        }))[0];

        // 4. Tallas
        console.log("-> Registrando Tallas...");
        await sup('/product_sizes', 'POST', [
            { product_id: product.id, talla: 'S', orden: 1, precio_venta: 230.0 },
            { product_id: product.id, talla: 'M', orden: 2, precio_venta: 230.0 },
            { product_id: product.id, talla: 'L', orden: 3, precio_venta: 240.0 }
        ]);

        // 5. Receta
        console.log("-> Creando Ficha Técnica...");
        const recipe = (await sup('/recipes', 'POST', {
            company_id: COMPANY_ID,
            product_id: product.id,
            estado: 'ACTIVA',
            descripcion: 'Manufactura industrial premium Spiderman Advanced V5.',
            costos_indirectos: 50.0,
            merma_default: 4.0
        }))[0];

        // 6. Insumos
        console.log("-> Añadiendo Insumos...");
        await sup('/recipe_items', 'POST', [
            { recipe_id: recipe.id, material_id: m1.id, cantidad: 1.90 },
            { recipe_id: recipe.id, material_id: m2.id, cantidad: 1.30 }
        ]);

        // 7. Operaciones
        console.log("-> Añadiendo Operaciones...");
        await sup('/recipe_operations', 'POST', [
            { recipe_id: recipe.id, tipo_operacion: 'CORTE LASER PRO', costo_base: 30.0, orden: 1 },
            { recipe_id: recipe.id, tipo_operacion: 'COSTURA REFORZADA 2.0', costo_base: 80.0, orden: 2 },
            { recipe_id: recipe.id, tipo_operacion: 'ACABADOS (OJAL/BOTON)', costo_base: 25.0, orden: 3 }
        ]);

        console.log("¡TERMINADO! La data industrial está lista en el ERP.");
    } catch (e) {
        console.error("ERROR CRITICO:", e.message);
    }
}

run();
