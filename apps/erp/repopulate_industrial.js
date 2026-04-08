const fetch = require('node-fetch');

const URL = 'https://mickytkrhfwjpqdoalyx.supabase.co/rest/v1';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pY2t5dGtyaGZ3anBxZG9hbHl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTUzMjU3MywiZXhwIjoyMDkxMTA4NTczfQ.X2nCjCsx-KPaQgPXrE9A9eO4mBDl_guKtrL4RRKypAI';

const COMPANY_ID = '24b7a942-8a5a-434f-beac-d6fd222702ba';
const WH_ID = 'c9890ec9-1939-40c8-8be4-dabb0210cd03'; // Almacen de Insumos
const CAT_MAT = 'e3fb452b-882e-4622-83e9-7f80884a913f'; // TELAS
const CAT_PROD = '501ef503-4b6a-47b9-be11-fc8d30a3a683'; // PRODUCTOS

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
        console.error(`ERROR on ${method} ${path}:`, data);
        throw new Error(`Failed ${method} ${path}`);
    }
    return data;
}

async function run() {
    try {
        console.log("Iniciando Población Industrial HAPPY S.A.C...");

        // 1. Crear Materiales
        console.log("Creando Materiales Pro...");
        const mRed = (await sup('/products', 'POST', {
            nombre: 'Tela Terciopelo Spiderman Roja',
            codigo: 'MAT-SPD-RED-001',
            tipo_item: 'MATERIAL',
            precio: 45.0,
            categoria_id: CAT_MAT,
            company_id: COMPANY_ID
        }))[0];

        const mBlue = (await sup('/products', 'POST', {
            nombre: 'Tela Terciopelo Spiderman Azul',
            codigo: 'MAT-SPD-BLU-001',
            tipo_item: 'MATERIAL',
            precio: 45.0,
            categoria_id: CAT_MAT,
            company_id: COMPANY_ID
        }))[0];

        // 2. Crear Entradas de Kardex para Materiales
        console.log("Registrando Stock en Kardex para Materiales...");
        await sup('/kardex_movements', 'POST', [
            {
                company_id: COMPANY_ID,
                tipo_movimiento: 'ENTRADA',
                tipo_item: 'MATERIAL',
                material_id: mRed.id,
                warehouse_id: WH_ID,
                cantidad: 250,
                costo_unitario: 45.0,
                costo_total: 11250,
                referencia_tipo: 'AJUSTE',
                fecha: new Date().toISOString()
            },
            {
                company_id: COMPANY_ID,
                tipo_movimiento: 'ENTRADA',
                tipo_item: 'MATERIAL',
                material_id: mBlue.id,
                warehouse_id: WH_ID,
                cantidad: 180,
                costo_unitario: 45.0,
                costo_total: 8100,
                referencia_tipo: 'AJUSTE',
                fecha: new Date().toISOString()
            }
        ]);

        // 3. Crear Producto Terminado
        console.log("Creando Producto Spiderman Pro...");
        const product = (await sup('/products', 'POST', {
            nombre: 'Disfraz Spiderman Deluxe 2026',
            codigo: 'PROD-SPD-DLX-26',
            tipo_item: 'PRODUCTO',
            precio: 210.0,
            precio_venta_base: 210.0,
            categoria_id: CAT_PROD,
            company_id: COMPANY_ID,
            tallas: ["TALLA 4", "TALLA 6", "TALLA 8", "TALLA 10"]
        }))[0];

        // 4. Crear Tallas
        console.log("Registrando Tallas...");
        const sizes = await sup('/product_sizes', 'POST', [
            { product_id: product.id, talla: 'TALLA 4', orden: 1, precio_venta: 210.0 },
            { product_id: product.id, talla: 'TALLA 6', orden: 2, precio_venta: 210.0 },
            { product_id: product.id, talla: 'TALLA 8', orden: 3, precio_venta: 220.0 },
            { product_id: product.id, talla: 'TALLA 10', orden: 4, precio_venta: 230.0 }
        ]);

        // 5. Crear Receta (Ficha Técnica)
        console.log("Creando Ficha Técnica...");
        const recipe = (await sup('/recipes', 'POST', {
            product_id: product.id,
            estado: 'ACTIVA',
            descripcion: 'Proceso de fabricación para Traje Spiderman Deluxe con acabados premium en terciopelo.',
            costos_indirectos: 35.0,
            merma_default: 3.5
        }))[0];

        // 6. Componentes de la Receta
        console.log("Añadiendo Componentes a la Receta...");
        await sup('/recipe_items', 'POST', [
            { recipe_id: recipe.id, material_id: mRed.id, cantidad: 1.85 },
            { recipe_id: recipe.id, material_id: mBlue.id, cantidad: 1.20 }
        ]);

        // 7. Operaciones de Producción
        console.log("Añadiendo Operaciones (Servicios Terceros)...");
        await sup('/recipe_operations', 'POST', [
            { recipe_id: recipe.id, tipo_operacion: 'CORTE LASER', costo_base: 20.0 },
            { recipe_id: recipe.id, tipo_operacion: 'COSTURA REFORZADA', costo_base: 65.0 },
            { recipe_id: recipe.id, tipo_operacion: 'OJAL Y BOTON (TERCERO)', costo_base: 12.0 },
            { recipe_id: recipe.id, tipo_operacion: 'LAMINADO DE ACABADO', costo_base: 15.0 }
        ]);

        console.log("¡EXITO TOTAL! Data industrial poblada correctamente.");
    } catch (e) {
        console.error("ERROR FATAL:", e.message || e);
    }
}

run();
