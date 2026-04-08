const fetch = require('node-fetch');

const URL = 'https://mickytkrhfwjpqdoalyx.supabase.co/rest/v1';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pY2t5dGtyaGZ3anBxZG9hbHl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTUzMjU3MywiZXhwIjoyMDkxMTA4NTczfQ.X2nCjCsx-KPaQgPXrE9A9eO4mBDl_guKtrL4RRKypAI';

async function check() {
    console.log("Checking Live Database...");

    try {
        const resProd = await fetch(`${URL}/products?select=id,nombre,tipo_item`, {
            headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}` }
        });
        const prods = await resProd.json();
        console.log("Products count:", prods.length);
        console.log("Unique tipo_item:", [...new Set(prods.map(p => p.tipo_item))]);

        const resRec = await fetch(`${URL}/recipes?select=count`, {
            headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Prefer': 'count=exact' }
        });
        console.log("Recipes count header:", resRec.headers.get('content-range'));

        const resCat = await fetch(`${URL}/categories?select=*`, {
            headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}` }
        });
        const cats = await resCat.json();
        console.log("Categories:", cats.map(c => c.nombre));

    } catch (e) {
        console.error("Error checking DB:", e);
    }
}

check();
