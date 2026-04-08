const fetch = require('node-fetch');
const K = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pY2t5dGtyaGZ3anBxZG9hbHl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTUzMjU3MywiZXhwIjoyMDkxMTA4NTczfQ.X2nCjCsx-KPaQgPXrE9A9eO4mBDl_guKtrL4RRKypAI';
const h = { apikey: K, 'Authorization': 'Bearer ' + K };
const B = 'https://mickytkrhfwjpqdoalyx.supabase.co/rest/v1';

async function main() {
    const [st, re, ri, ro] = await Promise.all([
        fetch(B + '/v_stock_actual', { headers: h }).then(r => r.json()),
        fetch(B + '/recipes', { headers: h }).then(r => r.json()),
        fetch(B + '/recipe_items?select=count', { headers: h }).then(r => r.json()),
        fetch(B + '/recipe_operations?select=count', { headers: h }).then(r => r.json())
    ]);

    const result = {
        inventario_total: st.length,
        inventario_con_stock: st.filter(x => x.stock > 0).map(x => ({ nombre: x.nombre, talla: x.talla, stock: x.stock, unidad: x.unidad })),
        fichas_tecnicas: re.length,
        fichas_detalle: re.map(x => x.descripcion),
        insumos_en_recetas: ri[0]?.count,
        operaciones: ro[0]?.count
    };

    require('fs').writeFileSync('estado_final.json', JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result, null, 2));
}
main();
