const fetch = require('node-fetch');

const URL = 'https://mickytkrhfwjpqdoalyx.supabase.co/rest/v1';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pY2t5dGtyaGZ3anBxZG9hbHl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTUzMjU3MywiZXhwIjoyMDkxMTA4NTczfQ.X2nCjCsx-KPaQgPXrE9A9eO4mBDl_guKtrL4RRKypAI';
const COMPANY_ID = '4a000745-adb4-406a-939e-d306b3bc4f00';

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
        console.error(`ERROR on ${method} ${path}:`, JSON.stringify(data, null, 2));
        throw new Error(`Failed ${method} ${path}`);
    }
    return data;
}

async function run() {
    try {
        console.log("Starting Robust Population with Company ID...");

        // 1. Get or Create Categories
        console.log("Categories...");
        const existingCats = await sup('/categories?select=id,nombre');
        const findCat = (name) => existingCats.find(c => c.nombre.includes(name))?.id;

        let catProd = findCat('PRODUCTOS TERMINADOS') || (await sup('/categories', 'POST', { nombre: 'PRODUCTOS TERMINADOS', company_id: COMPANY_ID }))[0].id;
        let catMat = findCat('MATERIALES: TELAS') || (await sup('/categories', 'POST', { nombre: 'MATERIALES: TELAS', company_id: COMPANY_ID }))[0].id;

        // 2. Create Materials
        console.log("Materials...");
        const materials = await sup('/products', 'POST', [
            { nombre: 'Licra Spiderman Roja', codigo: 'MAT-SPD-001', tipo_item: 'MATERIAL', precio: 25.0, existencia: 1000, categoria_id: catMat, company_id: COMPANY_ID },
            { nombre: 'Licra Spiderman Azul', codigo: 'MAT-SPD-002', tipo_item: 'MATERIAL', precio: 25.0, existencia: 800, categoria_id: catMat, company_id: COMPANY_ID },
            { nombre: 'Hilo Gutterman Rojo', codigo: 'MAT-SPD-003', tipo_item: 'MATERIAL', precio: 15.0, existencia: 200, categoria_id: catMat, company_id: COMPANY_ID }
        ]);

        // 3. Create Product
        console.log("Product...");
        const product = (await sup('/products', 'POST', {
            nombre: 'Disfraz Spiderman Superior 2026',
            codigo: 'PROD-SPD-001',
            tipo_item: 'PRODUCTO',
            precio: 165.0,
            existencia: 0,
            categoria_id: catProd,
            company_id: COMPANY_ID,
            tallas: ["T4", "T6", "T8", "T10"]
        }))[0];

        // 4. Create Sizes
        console.log("Sizes...");
        const sizes = await sup('/product_sizes', 'POST', [
            { product_id: product.id, talla: 'T4', orden: 1, precio_venta: 165.0 },
            { product_id: product.id, talla: 'T6', orden: 2, precio_venta: 165.0 },
            { product_id: product.id, talla: 'T8', orden: 3, precio_venta: 165.0 },
            { product_id: product.id, talla: 'T10', orden: 4, precio_venta: 180.0 }
        ]);

        // 5. Create Recipe (for T4)
        console.log("Recipe...");
        const recipe = (await sup('/recipes', 'POST', {
            product_id: product.id,
            product_size_id: sizes.find(s => s.talla === 'T4').id,
            estado: 'ACTIVA',
            descripcion: 'Ficha Técnica Premium Spiderman',
            costos_indirectos: 15.0,
            merma_default: 3.0
        }))[0];

        // 6. Recipe Items
        console.log("Recipe Items...");
        await sup('/recipe_items', 'POST', [
            { recipe_id: recipe.id, material_id: materials[0].id, cantidad: 1.25, merma_porcentaje: 3.0 },
            { recipe_id: recipe.id, material_id: materials[1].id, cantidad: 0.85, merma_porcentaje: 3.0 },
            { recipe_id: recipe.id, material_id: materials[2].id, cantidad: 0.05, merma_porcentaje: 5.0 }
        ]);

        // 7. Operations
        console.log("Operations...");
        await sup('/recipe_operations', 'POST', [
            { recipe_id: recipe.id, tipo_operacion: 'CORTE LASER', costo_base: 12.0, orden: 1 },
            { recipe_id: recipe.id, tipo_operacion: 'CONFECCION PREMIUM', costo_base: 45.0, orden: 2 },
            { recipe_id: recipe.id, tipo_operacion: 'ACABADO MANUAL', costo_base: 8.0, orden: 3 }
        ]);

        console.log("DONE! Data populated successfully with COMPANY_ID.");
    } catch (e) {
        console.error("CRITICAL ERROR:", e.message);
    }
}

run();
