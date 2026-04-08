/**
 * SEED PRODUCTION FINAL
 * Inyecta data industrial real usando los IDs y columnas correctas
 * confirmadas por inspección directa de la BD.
 */

const fetch = require('node-fetch');

const BASE = 'https://mickytkrhfwjpqdoalyx.supabase.co/rest/v1';
const SVC = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pY2t5dGtyaGZ3anBxZG9hbHl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTUzMjU3MywiZXhwIjoyMDkxMTA4NTczfQ.X2nCjCsx-KPaQgPXrE9A9eO4mBDl_guKtrL4RRKypAI';
const COMPANY = '24b7a942-8a5a-434f-beac-d6fd222702ba';

// IDs reales confirmados de la vista v_stock_actual
const WH_INSUMOS = 'c9890ec9-1939-40c8-8be4-dabb0210cd03'; // Almacén de Insumos
const WH_CENTRAL = 'edefaec8-15fd-4327-8069-2bde7e67ce48'; // Almacén Central
const WH_GENERAL = '6d25bb50-f9b6-4386-b071-44634a2d9c04'; // Almacen General (usaremos el de insumos)

// Materiales existentes confirmados
const TELA_ROJA_ID = '446fec4a-080d-4fcb-8bb1-dd8ebc754bcb'; // Tela Poliseda Roja

// Producto existente confirmado
const SPD_PROD_ID = 'dba09ddd-8a37-45b5-a5db-a436c7da2f95'; // Disfraz Spiderman Clásico
const SPD_SIZE_4_ID = '8cfc4b4e-d091-4356-9acd-4c7e7f8a8290'; // Spiderman Talla 4
const SPD_SIZE_6_ID = '35cb173a-67b7-4db5-a118-91284516b280'; // Spiderman Talla 6

// Categorías confirmadas
const CAT_MAT = 'e3fb452b-882e-4622-83e9-7f80884a913f';
const CAT_PROD = '501ef503-4b6a-47b9-be11-fc8d30a3a683';

const h = {
    'apikey': SVC,
    'Authorization': `Bearer ${SVC}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
};

async function q(path, method = 'GET', body = null) {
    const opts = { method, headers: h };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${BASE}${path}`, opts);
    const data = await res.json();
    if (!res.ok) { console.error(`❌ ${method} ${path}:`, data); return null; }
    return Array.isArray(data) ? data : [data];
}

async function run() {
    console.log('═══════════════════════════════════════════');
    console.log(' HAPPY SAC - SEED PRODUCCIÓN FINAL');
    console.log('═══════════════════════════════════════════\n');

    // ─── 1. NUEVOS MATERIALES ───────────────────────────────────
    console.log('📦 [1/5] Creando materiales con stock...');

    const mats = await q('/products', 'POST', [
        { company_id: COMPANY, nombre: 'Tela Spandex Roja 4-way', codigo: 'MAT-SPN-ROJA-01', tipo_item: 'MATERIAL', precio_venta_base: 42.00, categoria_id: CAT_MAT },
        { company_id: COMPANY, nombre: 'Tela Spandex Azul 4-way', codigo: 'MAT-SPN-AZUL-02', tipo_item: 'MATERIAL', precio_venta_base: 42.00, categoria_id: CAT_MAT },
        { company_id: COMPANY, nombre: 'Forro Satin Blanco', codigo: 'MAT-FRR-BLC-03', tipo_item: 'MATERIAL', precio_venta_base: 18.00, categoria_id: CAT_MAT },
        { company_id: COMPANY, nombre: 'Hilo Negro 120yd', codigo: 'MAT-HLL-NGR-04', tipo_item: 'MATERIAL', precio_venta_base: 3.50, categoria_id: CAT_MAT },
        { company_id: COMPANY, nombre: 'Velcro 1" Negro', codigo: 'MAT-VLC-01', tipo_item: 'MATERIAL', precio_venta_base: 1.80, categoria_id: CAT_MAT },
        { company_id: COMPANY, nombre: 'Elástico 1cm', codigo: 'MAT-ELS-01', tipo_item: 'MATERIAL', precio_venta_base: 0.90, categoria_id: CAT_MAT },
    ]);

    if (!mats) { console.error('No se pudieron crear materiales.'); return; }
    const [tSpd1, tSpd2, fSatin, hilo, velcro, elastico] = mats;
    console.log(`   ✅ ${mats.length} materiales creados.`);

    // ─── 2. KARDEX PARA NUEVOS MATERIALES ──────────────────────
    console.log('\n📊 [2/5] Registrando stock en Kardex...');

    const kardexData = [
        // Materiales nuevos
        { company_id: COMPANY, tipo_movimiento: 'ENTRADA', tipo_item: 'MATERIAL', material_id: tSpd1.id, warehouse_id: WH_INSUMOS, cantidad: 200, costo_unitario: 42, costo_total: 8400, referencia_tipo: 'AJUSTE', fecha: new Date().toISOString() },
        { company_id: COMPANY, tipo_movimiento: 'ENTRADA', tipo_item: 'MATERIAL', material_id: tSpd2.id, warehouse_id: WH_INSUMOS, cantidad: 150, costo_unitario: 42, costo_total: 6300, referencia_tipo: 'AJUSTE', fecha: new Date().toISOString() },
        { company_id: COMPANY, tipo_movimiento: 'ENTRADA', tipo_item: 'MATERIAL', material_id: fSatin.id, warehouse_id: WH_INSUMOS, cantidad: 80, costo_unitario: 18, costo_total: 1440, referencia_tipo: 'AJUSTE', fecha: new Date().toISOString() },
        { company_id: COMPANY, tipo_movimiento: 'ENTRADA', tipo_item: 'MATERIAL', material_id: hilo.id, warehouse_id: WH_INSUMOS, cantidad: 500, costo_unitario: 3.5, costo_total: 1750, referencia_tipo: 'AJUSTE', fecha: new Date().toISOString() },
        { company_id: COMPANY, tipo_movimiento: 'ENTRADA', tipo_item: 'MATERIAL', material_id: velcro.id, warehouse_id: WH_INSUMOS, cantidad: 300, costo_unitario: 1.8, costo_total: 540, referencia_tipo: 'AJUSTE', fecha: new Date().toISOString() },
        { company_id: COMPANY, tipo_movimiento: 'ENTRADA', tipo_item: 'MATERIAL', material_id: elastico.id, warehouse_id: WH_INSUMOS, cantidad: 400, costo_unitario: 0.9, costo_total: 360, referencia_tipo: 'AJUSTE', fecha: new Date().toISOString() },
        // Stock adicional para Tela Poliseda Roja existente
        { company_id: COMPANY, tipo_movimiento: 'ENTRADA', tipo_item: 'MATERIAL', material_id: TELA_ROJA_ID, warehouse_id: WH_INSUMOS, cantidad: 200, costo_unitario: 25, costo_total: 5000, referencia_tipo: 'AJUSTE', fecha: new Date().toISOString() },
    ];

    for (const kRow of kardexData) {
        const res = await q('/kardex_movements', 'POST', kRow);
        if (res) process.stdout.write('.');
        else process.stdout.write('x');
    }
    console.log('\n   ✅ Kardex registrado.');

    // ─── 3. PRODUCTO TERMINADO NUEVO ───────────────────────────
    console.log('\n🎭 [3/5] Creando nuevos productos terminados...');

    const hulkProd = await q('/products', 'POST', {
        company_id: COMPANY,
        nombre: 'Disfraz Hulk Ultra Deluxe 2026',
        codigo: 'PROD-HLK-DLX-2026',
        tipo_item: 'PRODUCTO',
        precio_venta_base: 180.00,
        categoria_id: CAT_PROD,
        tallas: ["T4", "T6", "T8", "T10"]
    });
    if (!hulkProd) { console.error('No se pudo crear producto Hulk.'); }
    const hulk = hulkProd ? hulkProd[0] : null;
    console.log(`   ✅ Producto Hulk creado: ${hulk?.id}`);

    let hulkSizes = [];
    if (hulk) {
        const szRes = await q('/product_sizes', 'POST', [
            { product_id: hulk.id, talla: 'T4', orden: 1, precio_venta: 180.00 },
            { product_id: hulk.id, talla: 'T6', orden: 2, precio_venta: 180.00 },
            { product_id: hulk.id, talla: 'T8', orden: 3, precio_venta: 195.00 },
            { product_id: hulk.id, talla: 'T10', orden: 4, precio_venta: 205.00 },
        ]);
        if (szRes) {
            hulkSizes = szRes;
            // Kardex producto terminado
            for (const sz of szRes) {
                await q('/kardex_movements', 'POST', {
                    company_id: COMPANY, tipo_movimiento: 'ENTRADA', tipo_item: 'PRODUCTO',
                    product_id: hulk.id, product_size_id: sz.id,
                    warehouse_id: WH_CENTRAL, cantidad: 15, costo_unitario: 140, costo_total: 2100,
                    referencia_tipo: 'AJUSTE', fecha: new Date().toISOString()
                });
                process.stdout.write('.');
            }
        }
        console.log('\n   ✅ Tallas y Kardex de Hulk registrados.');
    }

    // ─── 4. FICHAS TÉCNICAS (RECETAS) ─────────────────────────
    console.log('\n📋 [4/5] Creando Fichas Técnicas...');

    // Receta para Spiderman Clásico T4 (ya existe product_size_id confirmado)
    const user = await q('/profiles?limit=1');
    const userId = user?.[0]?.id;
    console.log(`   Usuario para created_by: ${userId}`);

    const sizePairs = [
        { size_id: SPD_SIZE_4_ID, talla: 'T4', mat_metros: 1.50 },
        { size_id: SPD_SIZE_6_ID, talla: 'T6', mat_metros: 1.80 },
    ];
    for (const { size_id, talla, mat_metros } of sizePairs) {
        const receta = await q('/recipes', 'POST', {
            company_id: COMPANY,
            product_id: SPD_PROD_ID,
            product_size_id: size_id,
            estado: 'ACTIVA',
            descripcion: `Ficha Técnica — Disfraz Spiderman Clásico Talla ${talla}`,
            costos_indirectos: 35.00,
            merma_default: 3.0,
            ...(userId ? { created_by: userId } : {})
        });

        if (receta && receta[0]) {
            const rid = receta[0].id;
            console.log(`   ✅ Receta ${talla} creada: ${rid}`);

            // Insumos
            await q('/recipe_items', 'POST', [
                { recipe_id: rid, material_id: tSpd1.id, cantidad: mat_metros, desperdicio_pct: 3 },
                { recipe_id: rid, material_id: fSatin.id, cantidad: mat_metros * 0.6, desperdicio_pct: 2 },
                { recipe_id: rid, material_id: hilo.id, cantidad: 2, desperdicio_pct: 5 },
                { recipe_id: rid, material_id: velcro.id, cantidad: 0.5, desperdicio_pct: 0 },
                { recipe_id: rid, material_id: elastico.id, cantidad: 1, desperdicio_pct: 0 },
            ]);

            // Operaciones
            await q('/recipe_operations', 'POST', [
                { recipe_id: rid, tipo_operacion: 'TRAZO Y CORTE', costo_base: 15.00, orden: 1 },
                { recipe_id: rid, tipo_operacion: 'ENSAMBLE Y COSTURA', costo_base: 55.00, orden: 2 },
                { recipe_id: rid, tipo_operacion: 'OJALADO (TERCERO)', costo_base: 8.00, orden: 3 },
                { recipe_id: rid, tipo_operacion: 'ACABADO Y CONTROL CALIDAD', costo_base: 12.00, orden: 4 },
            ]);
            console.log(`      → Insumos y Operaciones registradas.`);
        } else {
            console.log(`   ⚠️  Receta ${talla} falló.`);
        }
    }

    // Receta para Hulk T4
    if (hulk && hulkSizes[0]) {
        const recetaHulk = await q('/recipes', 'POST', {
            company_id: COMPANY,
            product_id: hulk.id,
            product_size_id: hulkSizes[0].id,
            estado: 'ACTIVA',
            descripcion: 'Ficha Técnica — Hulk Ultra Deluxe T4',
            costos_indirectos: 40.00,
            merma_default: 4.0,
            ...(userId ? { created_by: userId } : {})
        });
        if (recetaHulk?.[0]) {
            const rid = recetaHulk[0].id;
            console.log(`   ✅ Receta Hulk T4 creada: ${rid}`);
            await q('/recipe_items', 'POST', [
                { recipe_id: rid, material_id: tSpd2.id, cantidad: 2.2, desperdicio_pct: 4 },
                { recipe_id: rid, material_id: fSatin.id, cantidad: 1.5, desperdicio_pct: 3 },
                { recipe_id: rid, material_id: hilo.id, cantidad: 3, desperdicio_pct: 5 },
                { recipe_id: rid, material_id: elastico.id, cantidad: 1.5, desperdicio_pct: 0 },
            ]);
            await q('/recipe_operations', 'POST', [
                { recipe_id: rid, tipo_operacion: 'TRAZO Y CORTE', costo_base: 20.00, orden: 1 },
                { recipe_id: rid, tipo_operacion: 'COSTURA INDUSTRIAL', costo_base: 65.00, orden: 2 },
                { recipe_id: rid, tipo_operacion: 'ACABADO (TERCERO)', costo_base: 10.00, orden: 3 },
            ]);
        }
    }

    // ─── 5. VERIFICACIÓN FINAL ──────────────────────────────────
    console.log('\n🔍 [5/5] Verificación final...');
    const vStock = await q('/v_stock_actual');
    const vRecipes = await q('/recipes');
    console.log(`   📦 Ítems en inventario (v_stock_actual): ${vStock?.length ?? 0}`);
    console.log(`   📋 Fichas Técnicas en BD: ${vRecipes?.length ?? 0}`);
    if (vRecipes?.length > 0) {
        vRecipes.forEach(r => console.log(`      - ${r.descripcion} [${r.estado}]`));
    }

    console.log('\n═══════════════════════════════════════════');
    console.log(' ¡SEED COMPLETADO!');
    console.log('═══════════════════════════════════════════');
}

run().catch(e => {
    console.error('Error crítico:', e.message);
    process.exit(1);
});
