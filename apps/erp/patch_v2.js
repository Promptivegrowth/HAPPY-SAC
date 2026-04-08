/**
 * PATCH FINAL: Inserta recipe_items con el campo clasificacion correcto
 */
const fetch = require('node-fetch');
const K = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pY2t5dGtyaGZ3anBxZG9hbHl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTUzMjU3MywiZXhwIjoyMDkxMTA4NTczfQ.X2nCjCsx-KPaQgPXrE9A9eO4mBDl_guKtrL4RRKypAI';
const h = { apikey: K, 'Authorization': 'Bearer ' + K, 'Content-Type': 'application/json', 'Prefer': 'return=representation' };
const g = { apikey: K, 'Authorization': 'Bearer ' + K };
const B = 'https://mickytkrhfwjpqdoalyx.supabase.co/rest/v1';
const COMPANY = '24b7a942-8a5a-434f-beac-d6fd222702ba';
const WH_INSUMOS = 'c9890ec9-1939-40c8-8be4-dabb0210cd03';

async function get(path) { return fetch(B + path, { headers: g }).then(r => r.json()); }
async function post(path, body) {
    const r = await fetch(B + path, { method: 'POST', headers: h, body: JSON.stringify(body) });
    const d = await r.json();
    if (!r.ok) { console.log('  ERR ' + path + ': ' + JSON.stringify(d).substring(0, 150)); return null; }
    return d;
}

async function main() {
    console.log('=== PATCH recipe_items (con clasificacion) ===\n');

    // Obtener recetas
    const recipes = await get('/recipes');
    console.log('Recetas:', recipes.map(r => r.id.substring(0, 8) + ' ' + r.descripcion));

    // Obtener materiales que sí existen
    const mats = await get('/products?tipo_item=eq.MATERIAL&select=id,nombre,codigo');
    console.log('\nMateriales disponibles:');
    mats.forEach(m => console.log(' -', m.codigo, m.nombre));

    // Mapear por código
    const byCode = {};
    mats.forEach(m => { byCode[m.codigo] = m.id; });

    // IDs de los materiales que creamos
    const tRoja = mats.find(m => m.codigo === 'MAT-SPN-ROJA-01');
    const tAzul = mats.find(m => m.codigo === 'MAT-SPN-AZUL-02');
    const forro = mats.find(m => m.codigo === 'MAT-FRR-BLC-03');
    const hilo = mats.find(m => m.codigo === 'MAT-HLL-NGR-04');
    const velcro = mats.find(m => m.codigo === 'MAT-VLC-01');
    const elas = mats.find(m => m.codigo === 'MAT-ELS-01');

    // También la Tela Poliseda original
    const tPoliseda = mats.find(m => m.codigo === 'MAT-TELA-001');

    console.log('\nMateriales encontrados:', { tRoja: tRoja?.codigo, tAzul: tAzul?.codigo, forro: forro?.codigo, hilo: hilo?.codigo, velcro: velcro?.codigo, elas: elas?.codigo });

    // ── Agregar Kardex para materiales nuevos sin stock
    console.log('\n📊 Registrando Kardex para nuevos materiales...');
    const kardexPairs = [
        [tRoja, 'Tela Spandex Roja', 42, 200],
        [tAzul, 'Tela Spandex Azul', 42, 150],
        [forro, 'Forro Satin', 18, 80],
        [hilo, 'Hilo Negro', 3.5, 500],
        [velcro, 'Velcro', 1.8, 300],
        [elas, 'Elastico', 0.9, 400],
    ].filter(([mat]) => mat);

    for (const [mat, nombre, costo, qty] of kardexPairs) {
        const r = await post('/kardex_movements', {
            company_id: COMPANY, tipo_movimiento: 'ENTRADA', tipo_item: 'MATERIAL',
            material_id: mat.id, warehouse_id: WH_INSUMOS,
            cantidad: qty, costo_unitario: costo, costo_total: qty * costo,
            referencia_tipo: 'AJUSTE', fecha: new Date().toISOString()
        });
        console.log(r ? `  ✅ ${nombre}: ${qty} uds` : `  ❌ ${nombre} falló`);
    }

    // ── Insertar recipe_items con clasificacion
    console.log('\n📋 Insertando insumos en Fichas Técnicas...');
    const matPrincipal = tRoja || mats[0]; // Usar primera tela disponible

    for (const recipe of recipes) {
        const isTalla6 = recipe.descripcion.includes('T6');
        const metros = isTalla6 ? 1.80 : 1.50;
        console.log(`\n  Receta: ${recipe.descripcion}`);

        const items = [
            ...(matPrincipal ? [{ recipe_id: recipe.id, material_id: matPrincipal.id, clasificacion: 'TELA', cantidad: metros, desperdicio_pct: 3, orden: 1 }] : []),
            ...(forro ? [{ recipe_id: recipe.id, material_id: forro.id, clasificacion: 'FORRO', cantidad: metros * 0.6, desperdicio_pct: 2, orden: 2 }] : []),
            ...(hilo ? [{ recipe_id: recipe.id, material_id: hilo.id, clasificacion: 'AVIOS', cantidad: 2, desperdicio_pct: 5, orden: 3 }] : []),
            ...(velcro ? [{ recipe_id: recipe.id, material_id: velcro.id, clasificacion: 'AVIOS', cantidad: 0.5, desperdicio_pct: 0, orden: 4 }] : []),
            ...(elas ? [{ recipe_id: recipe.id, material_id: elas.id, clasificacion: 'AVIOS', cantidad: 1, desperdicio_pct: 0, orden: 5 }] : []),
        ];

        for (const item of items) {
            const r = await post('/recipe_items', item);
            process.stdout.write(r ? '.' : 'X');
        }
        console.log(`  → ${items.length} insumos procesados`);
    }

    // ── Verificación final
    console.log('\n=== VERIFICACIÓN FINAL ===');
    const [st, re, ri, ro] = await Promise.all([
        get('/v_stock_actual'),
        get('/recipes'),
        get('/recipe_items?select=count'),
        get('/recipe_operations?select=count')
    ]);
    console.log('Inventario:', st.length, 'items');
    console.log('Con stock >0:');
    st.filter(x => x.stock > 0).forEach(x => console.log('  +', x.nombre, 'T:' + x.talla, '=', x.stock, x.unidad));
    console.log('Fichas Tecnicas:', re.length);
    re.forEach(x => console.log('  *', x.descripcion));
    console.log('Insumos:', ri[0]?.count);
    console.log('Operaciones:', ro[0]?.count);
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
