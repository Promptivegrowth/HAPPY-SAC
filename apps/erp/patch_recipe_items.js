/**
 * Patch: insertar recipe_items y Kardex de materiales
 * Después de confirmar los IDs reales de recetas y materiales.
 */
const fetch = require('node-fetch');
const K = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pY2t5dGtyaGZ3anBxZG9hbHl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTUzMjU3MywiZXhwIjoyMDkxMTA4NTczfQ.X2nCjCsx-KPaQgPXrE9A9eO4mBDl_guKtrL4RRKypAI';
const h = { 'apikey': K, 'Authorization': 'Bearer ' + K, 'Content-Type': 'application/json', 'Prefer': 'return=representation' };
const B = 'https://mickytkrhfwjpqdoalyx.supabase.co/rest/v1';
const COMPANY = '24b7a942-8a5a-434f-beac-d6fd222702ba';
const WH_INSUMOS = 'c9890ec9-1939-40c8-8be4-dabb0210cd03';

async function get(path) {
    const r = await fetch(B + path, { headers: { apikey: K, 'Authorization': 'Bearer ' + K } });
    return r.json();
}
async function post(path, body) {
    const r = await fetch(B + path, { method: 'POST', headers: h, body: JSON.stringify(body) });
    const d = await r.json();
    if (!r.ok) { console.error(`  ❌ POST ${path}:`, JSON.stringify(d).substring(0, 200)); return null; }
    return d;
}

async function main() {
    console.log('=== PATCH: recipe_items + Kardex materiales ===\n');

    // ── Obtener recetas creadas
    const recipes = await get('/recipes');
    console.log('Recetas en BD:', recipes.length);
    recipes.forEach(r => console.log('  -', r.id, r.descripcion));

    // ── Obtener materiales nuevos creados (Spandex)
    const allMats = await get('/products?nombre=ilike.*Spandex*&select=id,nombre,codigo');
    console.log('\nMateriales Spandex:', allMats.length);
    allMats.forEach(m => console.log('  -', m.codigo, m.nombre, m.id));

    const allForro = await get('/products?nombre=ilike.*Forro*&select=id,nombre,codigo');
    const allHilo = await get('/products?nombre=ilike.*Hilo*&select=id,nombre,codigo');
    const allVelcro = await get('/products?nombre=ilike.*Velcro*&select=id,nombre,codigo');
    const allElas = await get('/products?nombre=ilike.*l%C3%A1stico*&select=id,nombre,codigo');

    if (!allMats[0] || !allMats[1]) { console.error('No se encontraron materiales Spandex'); return; }
    const tRoja = allMats.find(m => m.nombre.includes('Roja') || m.codigo.includes('01'));
    const tAzul = allMats.find(m => m.nombre.includes('Azul') || m.codigo.includes('02'));
    const forro = allForro[0];
    const hilo = allHilo[0];
    const velcro = allVelcro[0];
    const elas = allElas[0];

    console.log('\nMateriales a usar:', { tRoja: tRoja?.codigo, tAzul: tAzul?.codigo, forro: forro?.codigo, hilo: hilo?.codigo, velcro: velcro?.codigo, elas: elas?.codigo });

    // ── 1. Kardex para materiales sin Kardex
    console.log('\n📊 Registrando Kardex para materiales nuevos...');
    const matsConKardex = [tRoja, tAzul, forro, hilo, velcro, elas].filter(Boolean);
    const kardexCosts = [42, 42, 18, 3.5, 1.8, 0.9];
    const kardexQtys = [200, 150, 80, 500, 300, 400];
    for (let i = 0; i < matsConKardex.length; i++) {
        const m = matsConKardex[i];
        const qty = kardexQtys[i];
        const cost = kardexCosts[i];
        const r = await post('/kardex_movements', {
            company_id: COMPANY, tipo_movimiento: 'ENTRADA', tipo_item: 'MATERIAL',
            material_id: m.id, warehouse_id: WH_INSUMOS,
            cantidad: qty, costo_unitario: cost, costo_total: qty * cost,
            referencia_tipo: 'AJUSTE', fecha: new Date().toISOString()
        });
        console.log(r ? `  ✅ Kardex ${m.nombre}: ${qty} unidades` : `  ❌ Falló ${m.nombre}`);
    }

    // ── 2. recipe_items uno por uno
    if (recipes.length === 0) { console.log('Sin recetas para agregar insumos.'); return; }

    for (const recipe of recipes) {
        console.log(`\n📋 Agregando insumos a: ${recipe.descripcion}`);
        const isTalla6 = recipe.descripcion.includes('T6');
        const metros = isTalla6 ? 1.80 : 1.50;
        const items = [
            { recipe_id: recipe.id, material_id: tRoja?.id, cantidad: metros, desperdicio_pct: 3 },
            { recipe_id: recipe.id, material_id: forro?.id, cantidad: metros * 0.6, desperdicio_pct: 2 },
            { recipe_id: recipe.id, material_id: hilo?.id, cantidad: 2, desperdicio_pct: 5 },
            { recipe_id: recipe.id, material_id: velcro?.id, cantidad: 0.5, desperdicio_pct: 0 },
            { recipe_id: recipe.id, material_id: elas?.id, cantidad: 1, desperdicio_pct: 0 },
        ].filter(x => x.material_id);

        for (const item of items) {
            const r = await post('/recipe_items', item);
            process.stdout.write(r ? '.' : '!');
        }
        console.log('');

        // Operaciones
        const ops = [
            { recipe_id: recipe.id, tipo_operacion: 'TRAZO Y CORTE', costo_base: 15, orden: 1 },
            { recipe_id: recipe.id, tipo_operacion: 'ENSAMBLE Y COSTURA', costo_base: isTalla6 ? 60 : 55, orden: 2 },
            { recipe_id: recipe.id, tipo_operacion: 'OJALADO (TERCERO)', costo_base: 8, orden: 3 },
            { recipe_id: recipe.id, tipo_operacion: 'ACABADO Y CONTROL CALIDAD', costo_base: 12, orden: 4 },
        ];
        for (const op of ops) {
            const r = await post('/recipe_operations', op);
            process.stdout.write(r ? '.' : '!');
        }
        console.log('');
    }

    // ── 3. Verificación final
    console.log('\n🔍 === VERIFICACIÓN FINAL ===');
    const vStock = await get('/v_stock_actual');
    const vRecipes = await get('/recipes');
    const vItems = await get('/recipe_items?select=count');
    const vOps = await get('/recipe_operations?select=count');

    console.log(`  Inventario (v_stock_actual): ${vStock.length} ítems`);
    vStock.filter(x => x.stock > 0).forEach(x => console.log(`    ✅ ${x.nombre} Talla:${x.talla || '-'} Stock:${x.stock} ${x.unidad}`));
    console.log(`  Fichas Técnicas (recipes): ${vRecipes.length}`);
    vRecipes.forEach(x => console.log(`    📋 ${x.descripcion}`));
    console.log(`  Insumos por Receta (recipe_items): ${vItems[0]?.count}`);
    console.log(`  Operaciones (recipe_operations): ${vOps[0]?.count}`);
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
