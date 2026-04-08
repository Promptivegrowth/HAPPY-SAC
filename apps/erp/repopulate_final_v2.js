const fetch = require('node-fetch');

const URL = 'https://mickytkrhfwjpqdoalyx.supabase.co/rest/v1';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pY2t5dGtyaGZ3anBxZG9hbHl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTUzMjU3MywiZXhwIjoyMDkxMTA4NTczfQ.X2nCjCsx-KPaQgPXrE9A9eO4mBDl_guKtrL4RRKypAI';

const COMPANY_ID = '24b7a942-8a5a-434f-beac-d6fd222702ba';
const CAT_MAT = 'e3fb452b-882e-4622-83e9-7f80884a913f'; // MATERIALES: TELAS
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
        console.log("Starting FINAL Data Population...");

        // 1. Create Materials
        console.log("Materials...");
        const materials = await sup('/products', 'POST', [
            { nombre: 'Gasa Spiderman Roja', codigo: 'MAT-SPD-V2-01', tipo_item: 'MATERIAL', precio: 32.0, existencia: 500, categoria_id: CAT_MAT, company_id: COMPANY_ID },
            { nombre: 'Gasa Spiderman Azul', codigo: 'MAT-SPD-V2-02', tipo_item: 'MATERIAL', precio: 32.0, existencia: 400, categoria_id: CAT_MAT, company_id: COMPANY_ID }
        ]);

        // 2. Create Product
        console.log("Product...");
        const product = (await sup('/products', 'POST', {
            nombre: 'Disfraz Spiderman Superior 2026',
            codigo: 'PROD-SPD-V3',
            tipo_item: 'PRODUCTO',
            precio: 185.0,
            existencia: 10,
            categoria_id: CAT_PROD,
            company_id: COMPANY_ID,
            tallas: ["T4", "T6", "T8"]
        }))[0];

        // 3. Create Sizes
        console.log("Sizes...");
        await sup('/product_sizes', 'POST', [
            { product_id: product.id, talla: 'T4', orden: 1, precio_venta: 185.0 },
            { product_id: product.id, talla: 'T6', orden: 2, precio_venta: 185.0 },
            { product_id: product.id, talla: 'T8', orden: 3, precio_venta: 195.0 }
        ]);

        // 4. Create one Master Recipe
        console.log("Recipe...");
        const recipe = (await sup('/recipes', 'POST', {
            product_id: product.id,
            estado: 'ACTIVA',
            descripcion: 'Ficha Técnica Principal Spiderman 2026',
            costos_indirectos: 25.0,
            merma_default: 3.0
        }))[0];

        // 5. Add Items (Materials)
        console.log("Recipe Items...");
        await sup('/recipe_items', 'POST', [
            { recipe_id: recipe.id, material_id: materials[0].id, cantidad: 1.5, merma_porcentaje: 3.0 },
            { recipe_id: recipe.id, material_id: materials[1].id, cantidad: 1.0, merma_porcentaje: 3.0 }
        ]);

        // 6. Add Operations
        console.log("Recipe Operations...");
        await sup('/recipe_operations', 'POST', [
            { recipe_id: recipe.id, tipo_operacion: 'CORTE LASER', costo_base: 15.0 },
            { recipe_id: recipe.id, tipo_operacion: 'CONFECCION TRIPLE COSTURA', costo_base: 55.0 }
        ]);

        console.log("DONE! Everything populated correctly for HAPPY S.A.C.");
    } catch (e) {
        console.error("FATAL ERROR:", e.message);
    }
}

run();
