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
        console.log("Iniciando Carga Industrial (V8) - Multi-Talla para HAPPY S.A.C...");

        // 1. Materiales
        console.log("-> Creando Materiales...");
        const m1 = await sup('/products', 'POST', { nombre: 'Gasa Spiderman Roja V8', codigo: 'MAT-SPD-V8-01', tipo_item: 'MATERIAL', precio_venta_base: 45.0, categoria_id: CAT_MAT, company_id: COMPANY_ID });
        const m2 = await sup('/products', 'POST', { nombre: 'Gasa Spiderman Azul V8', codigo: 'MAT-SPD-V8-02', tipo_item: 'MATERIAL', precio_venta_base: 45.0, categoria_id: CAT_MAT, company_id: COMPANY_ID });
        const mat1 = m1.data[0];
        const mat2 = m2.data[0];

        // 2. Producto y Tallas
        console.log("-> Creando Producto y Tallas...");
        const p = await sup('/products', 'POST', {
            nombre: 'Traje Spiderman Deluxe 2026 (V8)',
            codigo: 'PROD-SPD-V8-2026',
            tipo_item: 'PRODUCTO',
            precio_venta_base: 260.0,
            categoria_id: CAT_PROD,
            company_id: COMPANY_ID,
            tallas: ["T4", "T6"]
        });
        const prod = p.data[0];

        const sz1 = await sup('/product_sizes', 'POST', { product_id: prod.id, talla: 'T4', orden: 1, precio_venta: 260.0 });
        const sz2 = await sup('/product_sizes', 'POST', { product_id: prod.id, talla: 'T6', orden: 2, precio_venta: 260.0 });
        const size1 = sz1.data[0];
        const size2 = sz2.data[0];

        // 3. Crear Receta para T4
        console.log("-> Creando Ficha Técnica Talla 4...");
        const r1 = await sup('/recipes', 'POST', {
            company_id: COMPANY_ID,
            product_id: prod.id,
            product_size_id: size1.id,
            estado: 'ACTIVA',
            descripcion: 'Ficha Técnica Spiderman T4'
        });
        const recipe1 = r1.data[0];

        await sup('/recipe_items', 'POST', [
            { recipe_id: recipe1.id, material_id: mat1.id, cantidad: 1.50, desperdicio_pct: 5 },
            { recipe_id: recipe1.id, material_id: mat2.id, cantidad: 1.00, desperdicio_pct: 5 }
        ]);

        await sup('/recipe_operations', 'POST', [
            { recipe_id: recipe1.id, tipo_operacion: 'CORTE LASER', costo_base: 25, orden: 1 },
            { recipe_id: recipe1.id, tipo_operacion: 'CONFECCION', costo_base: 80, orden: 2 }
        ]);

        // 4. Crear Receta para T6
        console.log("-> Creando Ficha Técnica Talla 6...");
        const r2 = await sup('/recipes', 'POST', {
            company_id: COMPANY_ID,
            product_id: prod.id,
            product_size_id: size2.id,
            estado: 'ACTIVA',
            descripcion: 'Ficha Técnica Spiderman T6'
        });
        const recipe2 = r2.data[0];

        await sup('/recipe_items', 'POST', [
            { recipe_id: recipe2.id, material_id: mat1.id, cantidad: 1.80, desperdicio_pct: 5 },
            { recipe_id: recipe2.id, material_id: mat2.id, cantidad: 1.20, desperdicio_pct: 5 }
        ]);

        await sup('/recipe_operations', 'POST', [
            { recipe_id: recipe2.id, tipo_operacion: 'CORTE LASER', costo_base: 30, orden: 1 },
            { recipe_id: recipe2.id, tipo_operacion: 'CONFECCION', costo_base: 95, orden: 2 }
        ]);

        console.log("¡EXITO! Población multi-talla completada.");
    } catch (e) {
        console.error("ERROR:", e.message);
    }
}

run();
