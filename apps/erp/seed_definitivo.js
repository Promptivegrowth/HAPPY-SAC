/**
 * SEED DEFINITIVO - Usa la tabla 'materials' correcta para recipe_items
 */
const fetch = require('node-fetch');
const K = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pY2t5dGtyaGZ3anBxZG9hbHl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTUzMjU3MywiZXhwIjoyMDkxMTA4NTczfQ.X2nCjCsx-KPaQgPXrE9A9eO4mBDl_guKtrL4RRKypAI';
const h = { apikey: K, 'Authorization': 'Bearer ' + K, 'Content-Type': 'application/json', 'Prefer': 'return=representation' };
const g = { apikey: K, 'Authorization': 'Bearer ' + K };
const B = 'https://mickytkrhfwjpqdoalyx.supabase.co/rest/v1';
const COMPANY = '24b7a942-8a5a-434f-beac-d6fd222702ba';
const WH_INSUMOS = 'c9890ec9-1939-40c8-8be4-dabb0210cd03';

// ID ya conocido de la tabla materials
const TELA_POLISEDA_MAT_ID = '446fec4a-080d-4fcb-8bb1-dd8ebc754bcb';

async function get(path) { return fetch(B + path, { headers: g }).then(r => r.json()); }
async function post(path, body) {
    const r = await fetch(B + path, { method: 'POST', headers: h, body: JSON.stringify(body) });
    const d = await r.json();
    if (!r.ok) { console.log('ERR ' + path + ': ' + JSON.stringify(d).substring(0, 200)); return null; }
    return d;
}

async function main() {
    console.log('=== SEED DEFINITIVO: materials + recipe_items ===\n');

    // Obtener unidad_id disponible de la tabla materials
    const existingMat = await get('/materials?limit=1');
    const unid = existingMat[0]?.unidad_id;
    const catMat = existingMat[0]?.categoria_id;
    console.log('unidad_id tomado del material existente:', unid);
    console.log('categoria_id:', catMat);

    // ── 1. Crear materiales en la tabla 'materials'
    console.log('\n📦 Creando materiales en tabla materials...');
    const newMats = [
        { company_id: COMPANY, codigo: 'MAT-SPND-ROJA', nombre: 'Tela Spandex Roja 4-Way', clasificacion: 'TELA', precio_compra_prom: 42.0, unidad_id: unid, categoria_id: catMat, activo: true },
        { company_id: COMPANY, codigo: 'MAT-SPND-AZUL', nombre: 'Tela Spandex Azul 4-Way', clasificacion: 'TELA', precio_compra_prom: 42.0, unidad_id: unid, categoria_id: catMat, activo: true },
        { company_id: COMPANY, codigo: 'MAT-FORRO-BLC', nombre: 'Forro Satín Blanco', clasificacion: 'FORRO', precio_compra_prom: 18.0, unidad_id: unid, categoria_id: catMat, activo: true },
        { company_id: COMPANY, codigo: 'MAT-HILO-NGR', nombre: 'Hilo Negro 120 Yardas', clasificacion: 'AVIOS', precio_compra_prom: 3.5, unidad_id: unid, categoria_id: catMat, activo: true },
        { company_id: COMPANY, codigo: 'MAT-VELCRO-1', nombre: 'Velcro 1" Negro', clasificacion: 'AVIOS', precio_compra_prom: 1.8, unidad_id: unid, categoria_id: catMat, activo: true },
        { company_id: COMPANY, codigo: 'MAT-ELAS-1CM', nombre: 'Elástico 1cm', clasificacion: 'AVIOS', precio_compra_prom: 0.9, unidad_id: unid, categoria_id: catMat, activo: true },
        { company_id: COMPANY, codigo: 'MAT-ENTRETELA', nombre: 'Entretela Termofusible', clasificacion: 'FORRO', precio_compra_prom: 5.5, unidad_id: unid, categoria_id: catMat, activo: true },
        { company_id: COMPANY, codigo: 'MAT-BOTON-12', nombre: 'Botón Plástico 12mm', clasificacion: 'AVIOS', precio_compra_prom: 0.3, unidad_id: unid, categoria_id: catMat, activo: true },
    ];

    const allNewMats = [];
    for (const mat of newMats) {
        const r = await post('/materials', mat);
        if (r) { allNewMats.push(r[0]); console.log(`  ✅ ${mat.nombre}`); }
        else console.log(`  ❌ ${mat.nombre}`);
    }

    // ── 2. Kardex para nuevos materiales
    console.log('\n📊 Registrando stock en Kardex...');
    const kardexQtys = [200, 150, 80, 500, 300, 400, 120, 1000];
    const kardexCost = [42, 42, 18, 3.5, 1.8, 0.9, 5.5, 0.3];
    for (let i = 0; i < allNewMats.length; i++) {
        const m = allNewMats[i];
        const qty = kardexQtys[i];
        const cost = kardexCost[i];
        const r = await post('/kardex_movements', {
            company_id: COMPANY, tipo_movimiento: 'ENTRADA', tipo_item: 'MATERIAL',
            material_id: m.id, warehouse_id: WH_INSUMOS,
            cantidad: qty, costo_unitario: cost, costo_total: qty * cost,
            referencia_tipo: 'AJUSTE', fecha: new Date().toISOString()
        });
        if (r) process.stdout.write('.');
        else process.stdout.write('X');
    }
    console.log('');

    // ── 3. Insertar recipe_items usando material_id de la tabla materials
    console.log('\n📋 Insertando insumos en Fichas Técnicas...');
    const recipes = await get('/recipes');
    console.log(`  ${recipes.length} recetas encontradas`);

    const tela = allNewMats.find(m => m.codigo === 'MAT-SPND-ROJA') || { id: TELA_POLISEDA_MAT_ID, nombre: 'Tela Poliseda Roja' };
    const forro = allNewMats.find(m => m.codigo === 'MAT-FORRO-BLC');
    const hilo = allNewMats.find(m => m.codigo === 'MAT-HILO-NGR');
    const velcro = allNewMats.find(m => m.codigo === 'MAT-VELCRO-1');
    const elas = allNewMats.find(m => m.codigo === 'MAT-ELAS-1CM');
    const boton = allNewMats.find(m => m.codigo === 'MAT-BOTON-12');

    for (const recipe of recipes) {
        const isTalla6 = recipe.descripcion?.includes('T6');
        const metros = isTalla6 ? 1.80 : 1.50;
        console.log(`\n  Receta: ${recipe.descripcion}`);

        const items = [
            { recipe_id: recipe.id, material_id: tela.id, clasificacion: 'TELA', cantidad: metros, desperdicio_pct: 3, orden: 1, costo_estimado: metros * 42 },
            ...(forro ? [{ recipe_id: recipe.id, material_id: forro.id, clasificacion: 'FORRO', cantidad: metros * 0.6, desperdicio_pct: 2, orden: 2, costo_estimado: metros * 0.6 * 18 }] : []),
            ...(hilo ? [{ recipe_id: recipe.id, material_id: hilo.id, clasificacion: 'AVIOS', cantidad: 2, desperdicio_pct: 5, orden: 3, costo_estimado: 7 }] : []),
            ...(velcro ? [{ recipe_id: recipe.id, material_id: velcro.id, clasificacion: 'AVIOS', cantidad: 0.5, desperdicio_pct: 0, orden: 4, costo_estimado: 0.9 }] : []),
            ...(elas ? [{ recipe_id: recipe.id, material_id: elas.id, clasificacion: 'AVIOS', cantidad: 1, desperdicio_pct: 0, orden: 5, costo_estimado: 0.9 }] : []),
            ...(boton ? [{ recipe_id: recipe.id, material_id: boton.id, clasificacion: 'AVIOS', cantidad: 4, desperdicio_pct: 0, orden: 6, costo_estimado: 1.2 }] : []),
        ];

        for (const item of items) {
            const r = await post('/recipe_items', item);
            process.stdout.write(r ? '✓' : 'X');
        }
        console.log(`  → ${items.length} insumos`);
    }

    // ── 4. Verificación final
    console.log('\n\n=== ESTADO FINAL ===');
    const [st, re, ri, ro, matsAll] = await Promise.all([
        get('/v_stock_actual'),
        get('/recipes'),
        get('/recipe_items?select=count'),
        get('/recipe_operations?select=count'),
        get('/materials?select=count')
    ]);
    console.log(`Inventario: ${st.length} ítems (${st.filter(x => x.stock > 0).length} con stock)`);
    st.filter(x => x.stock > 0).forEach(x => console.log(`  ✅ ${x.nombre} T:${x.talla || '-'} = ${x.stock} ${x.unidad} | ${x.almacen}`));
    console.log(`Fichas Técnicas: ${re.length}`);
    re.forEach(x => console.log(`  📋 ${x.descripcion}`));
    console.log(`Insumos/Receta: ${ri[0]?.count}`);
    console.log(`Operaciones: ${ro[0]?.count}`);
    console.log(`Total materiales en tabla materials: ${matsAll[0]?.count}`);
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
