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
    if (!res.ok) return { ok: false, error: data };
    return { ok: true, data };
}

async function run() {
    try {
        console.log("Iniciando Carga Industrial (V7 - FINAL) para HAPPY S.A.C...");

        // 1. Materiales
        console.log("-> Creando Materiales...");
        const m1 = await sup('/products', 'POST', {
            nombre: 'Tela Spandex Roja Pro V7',
            codigo: 'MAT-SPD-V7-01',
            tipo_item: 'MATERIAL',
            precio_venta_base: 45.0,
            categoria_id: CAT_MAT,
            company_id: COMPANY_ID
        });
        const m2 = await sup('/products', 'POST', {
            nombre: 'Tela Spandex Azul Pro V7',
            codigo: 'MAT-SPD-V7-02',
            tipo_item: 'MATERIAL',
            precio_venta_base: 45.0,
            categoria_id: CAT_MAT,
            company_id: COMPANY_ID
        });

        if (!m1.ok || !m2.ok) throw new Error("Fallo en materiales: " + JSON.stringify(m1.error || m2.error));
        const mat1 = m1.data[0];
        const mat2 = m2.data[0];

        // 2. Kardex
        console.log("-> Registrando Kardex...");
        await sup('/kardex_movements', 'POST', { company_id: COMPANY_ID, tipo_movimiento: 'ENTRADA', tipo_item: 'MATERIAL', material_id: mat1.id, warehouse_id: WH_ID, cantidad: 100, costo_unitario: 45, referencia_tipo: 'AJUSTE' });
        await sup('/kardex_movements', 'POST', { company_id: COMPANY_ID, tipo_movimiento: 'ENTRADA', tipo_item: 'MATERIAL', material_id: mat2.id, warehouse_id: WH_ID, cantidad: 100, costo_unitario: 45, referencia_tipo: 'AJUSTE' });

        // 3. Producto
        console.log("-> Creando Producto Terminado...");
        const p = await sup('/products', 'POST', {
            nombre: 'Disfraz Spiderman Advanced 2026 (FINAL V7)',
            codigo: 'SPD-ADV-V7-26',
            tipo_item: 'PRODUCTO',
            precio_venta_base: 250.0,
            categoria_id: CAT_PROD,
            company_id: COMPANY_ID,
            tallas: ["S", "M"]
        });
        if (!p.ok) throw new Error("Fallo en producto: " + JSON.stringify(p.error));
        const prod = p.data[0];

        // 4. Recipe
        console.log("-> Creando Ficha Técnica...");
        const r = await sup('/recipes', 'POST', {
            company_id: COMPANY_ID,
            product_id: prod.id,
            estado: 'ACTIVA',
            descripcion: 'Ficha Técnica Industrial V7'
        });
        if (!r.ok) throw new Error("Fallo en receta: " + JSON.stringify(r.error));
        const recipe = r.data[0];

        // 5. Recipe Items (Intentar ambos nombres de merma)
        console.log("-> Añadiendo Insumos...");
        const item1 = await sup('/recipe_items', 'POST', { recipe_id: recipe.id, material_id: mat1.id, cantidad: 2.0, merma_porcentaje: 5.0 });
        if (!item1.ok) {
            console.warn("Retrying item with desperdicio_pct...");
            await sup('/recipe_items', 'POST', { recipe_id: recipe.id, material_id: mat1.id, cantidad: 2.0, desperdicio_pct: 5.0 });
        }
        const item2 = await sup('/recipe_items', 'POST', { recipe_id: recipe.id, material_id: mat2.id, cantidad: 1.5, merma_porcentaje: 5.0 });
        if (!item2.ok) {
            await sup('/recipe_items', 'POST', { recipe_id: recipe.id, material_id: mat2.id, cantidad: 1.5, desperdicio_pct: 5.0 });
        }

        // 6. Operations
        console.log("-> Añadiendo Operaciones...");
        await sup('/recipe_operations', 'POST', { recipe_id: recipe.id, tipo_operacion: 'CORTE V7', costo_base: 40.0, orden: 1 });
        await sup('/recipe_operations', 'POST', { recipe_id: recipe.id, tipo_operacion: 'CONFECCION V7', costo_base: 90.0, orden: 2 });

        console.log("¡EXITO! Población V7 finalizada.");
    } catch (e) {
        console.error("ERROR:", e.message);
    }
}

run();
