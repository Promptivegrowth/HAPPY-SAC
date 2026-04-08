const PAT = 'sbp_992693aec78571453c55098d4cdc1c993044bd16';
const PROJECT_REF = 'mickytkrhfwjpqdoalyx';

async function executeSql(sql) {
    const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${PAT}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: sql })
    });
    const body = await response.text();
    if (!response.ok) throw new Error(`Failed: ${body}`);
    return JSON.parse(body);
}

async function run() {
    try {
        console.log("Starting Population (Safe Mode)...");
        // No deletes to avoid trigger issues

        console.log("Creating Categories...");
        await executeSql(`
            INSERT INTO categories (nombre) VALUES 
            ('Disfraces Premium'),
            ('Telas e Insumos'),
            ('Servicios de Terceros')
            ON CONFLICT (nombre) DO NOTHING;
        `);
        const cats = await executeSql("SELECT id, nombre FROM categories;");
        const catDisfraces = cats.find(c => c.nombre === 'Disfraces Premium').id;
        const catInsumos = cats.find(c => c.nombre === 'Telas e Insumos').id;

        console.log("Creating Materials...");
        await executeSql(`
            INSERT INTO products (nombre, codigo, tipo_item, precio, existencia, categoria_id)
            VALUES 
            ('Licra Americana Roja', 'MAT-001', 'MATERIAL', 22.0, 500, '${catInsumos}'),
            ('Licra Americana Azul', 'MAT-002', 'MATERIAL', 22.0, 300, '${catInsumos}'),
            ('Hilo Poliester 40/2', 'MAT-003', 'MATERIAL', 12.0, 100, '${catInsumos}'),
            ('Cierre Nylon 50cm', 'MAT-004', 'MATERIAL', 1.5, 400, '${catInsumos}'),
            ('Gasa Quirurgica Blanca', 'MAT-005', 'MATERIAL', 5.0, 200, '${catInsumos}');
        `);

        console.log("Creating Products...");
        await executeSql(`
            INSERT INTO products (nombre, codigo, tipo_item, precio, existencia, categoria_id, tallas)
            VALUES 
            ('Disfraz Spiderman Superior', 'DIS-001', 'PRODUCTO', 160.0, 0, '${catDisfraces}', '["T4", "T6", "T8", "T10"]'),
            ('Disfraz Batman Brave', 'DIS-002', 'PRODUCTO', 180.0, 0, '${catDisfraces}', '["T6", "T8", "T10"]');
        `);

        const products = await executeSql("SELECT id, codigo FROM products WHERE tipo_item = 'PRODUCTO'");
        const materials = await executeSql("SELECT id, codigo FROM products WHERE tipo_item = 'MATERIAL'");
        const spiderman = products.find(p => p.codigo === 'DIS-001');

        console.log("Adding Sizes...");
        await executeSql(`
            INSERT INTO product_sizes (product_id, talla, orden, precio_venta)
            VALUES 
            ('${spiderman.id}', 'T4', 1, 160.0),
            ('${spiderman.id}', 'T6', 2, 160.0),
            ('${spiderman.id}', 'T8', 3, 160.0),
            ('${spiderman.id}', 'T10', 4, 175.0);
        `);

        const sizeT4 = (await executeSql(`SELECT id FROM product_sizes WHERE product_id = '${spiderman.id}' AND talla = 'T4' LIMIT 1;`))[0];

        console.log("Creating Professional Recipe...");
        const recipeId = (await executeSql(`
            INSERT INTO recipes (product_id, product_size_id, estado, descripcion, costos_indirectos, merma_default)
            VALUES ('${spiderman.id}', '${sizeT4.id}', 'ACTIVA', 'Ficha Técnica Exportación: Spiderman Superior (Malla 2026)', 10.0, 3.0)
            RETURNING id;
        `))[0].id;

        console.log("Linking Recipe Items...");
        const telRed = materials.find(m => m.codigo === 'MAT-001').id;
        const telBlue = materials.find(m => m.codigo === 'MAT-002').id;
        const hilo = materials.find(m => m.codigo === 'MAT-003').id;
        await executeSql(`
            INSERT INTO recipe_items (recipe_id, material_id, cantidad, merma_porcentaje)
            VALUES 
            ('${recipeId}', '${telRed}', 1.2, 3.0),
            ('${recipeId}', '${telBlue}', 0.8, 3.0),
            ('${recipeId}', '${hilo}', 0.05, 5.0);
        `);

        console.log("Linking Operations (Sastrería, Ojal, Botón)...");
        await executeSql(`
            INSERT INTO recipe_operations (recipe_id, tipo_operacion, costo_base, orden)
            VALUES 
            ('${recipeId}', 'CORTE INDUSTRIAL', 10.0, 1),
            ('${recipeId}', 'CONFECCION SASTRERIA', 40.0, 2),
            ('${recipeId}', 'OJAL Y BOTON AUTOMATICO', 5.0, 3),
            ('${recipeId}', 'ACABADOS Y EMBOLSADO', 3.0, 4);
        `);

        console.log("SUCCESS: Data populated with professional textile structure.");
    } catch (e) {
        console.error("FAILED:", e.message);
    }
}

run();
