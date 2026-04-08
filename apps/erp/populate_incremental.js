const fetch = require('node-fetch');

const URL = 'https://mickytkrhfwjpqdoalyx.supabase.co/rest/v1';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pY2t5dGtyaGZ3anBxZG9hbHl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTUzMjU3MywiZXhwIjoyMDkxMTA4NTczfQ.X2nCjCsx-KPaQgPXrE9A9eO4mBDl_guKtrL4RRKypAI';
const COMPANY_ID = '24b7a942-8a5a-434f-beac-d6fd222702ba';

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
    return { ok: res.ok, status: res.status, data };
}

async function run() {
    try {
        console.log("Starting INCREMENTAL Data Population V6...");

        // 1. Create a Basic Product
        console.log("Creating basic product V6...");
        const p1 = await sup('/products', 'POST', {
            nombre: 'Disfraz Spiderman V6',
            codigo: 'SPD-V6',
            company_id: COMPANY_ID
        });

        if (!p1.ok) {
            console.error("FAIL on basic POST:", p1.data);
            return;
        }
        const pid = p1.data[0].id;
        console.log("Product ID:", pid);

        // 2. Try to update existencia
        console.log("Updating existencia...");
        const u1 = await sup(`/products?id=eq.${pid}`, 'PATCH', { existencia: 100 });
        console.log("Update existencia status:", u1.status);
        if (!u1.ok) console.log("Update existencia FAIL:", u1.data);

        // 3. Try to update tipo_item
        console.log("Updating tipo_item...");
        const u2 = await sup(`/products?id=eq.${pid}`, 'PATCH', { tipo_item: 'PRODUCTO' });
        console.log("Update tipo_item status:", u2.status);
        if (!u2.ok) console.log("Update tipo_item FAIL:", u2.data);

        // 4. Try to update tallas
        console.log("Updating tallas...");
        const u3 = await sup(`/products?id=eq.${pid}`, 'PATCH', { tallas: ["T4", "T6"] });
        console.log("Update tallas status:", u3.status);
        if (!u3.ok) console.log("Update tallas FAIL:", u3.data);

        console.log("DONE! Check the results above.");
    } catch (e) {
        console.error("CRITICAL ERROR:", e);
    }
}

run();
