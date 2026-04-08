const fetch = require('node-fetch');

const URL = 'https://mickytkrhfwjpqdoalyx.supabase.co/rest/v1';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pY2t5dGtyaGZ3anBxZG9hbHl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTUzMjU3MywiZXhwIjoyMDkxMTA4NTczfQ.X2nCjCsx-KPaQgPXrE9A9eO4mBDl_guKtrL4RRKypAI';

async function inspect() {
    console.log("Introspecting Tables...");
    try {
        // Just try to get one row and see what's in it
        const resCat = await fetch(`${URL}/categories?limit=1`, {
            headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}` }
        });
        const cats = await resCat.json();
        console.log("Category Schema (example):", Object.keys(cats[0] || {}));

        const resSizes = await fetch(`${URL}/product_sizes?limit=1`, {
            headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}` }
        });
        const sizes = await resSizes.json();
        console.log("Sizes Schema:", Object.keys(sizes[0] || {}));

        const resRec = await fetch(`${URL}/recipes?limit=1`, {
            headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}` }
        });
        const recs = await resRec.json();
        console.log("Recipe Schema:", Object.keys(recs[0] || {}));

        const resItems = await fetch(`${URL}/recipe_items?limit=1`, {
            headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}` }
        });
        console.log("Item Schema:", Object.keys((await resItems.json())[0] || {}));

    } catch (e) {
        console.error("Error:", e);
    }
}

inspect();
