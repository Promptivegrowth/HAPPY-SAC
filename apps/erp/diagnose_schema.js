const { createClient } = require('@supabase/supabase-js')
const supabase = createClient(
    'https://mickytkrhfwjpqdoalyx.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pY2t5dGtyaGZ3anBxZG9hbHl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTUzMjU3MywiZXhwIjoyMDkxMTA4NTczfQ.X2nCjCsx-KPaQgPXrE9A9eO4mBDl_guKtrL4RRKypAI'
)

async function diagnose() {
    // Get materials schema
    const { data: mat, error: matErr } = await supabase.from('materials').select('*').limit(1)
    console.log('=== MATERIALS SCHEMA ===')
    if (mat && mat[0]) console.log(JSON.stringify(Object.keys(mat[0])))
    if (matErr) console.log('ERROR:', matErr.message)

    // Get v_stock_actual sample to understand source
    const { data: v, error: ve } = await supabase.from('v_stock_actual').select('*').eq('tipo_item', 'MATERIAL').limit(3)
    console.log('\n=== V_STOCK_ACTUAL SAMPLE ===')
    if (v) console.log(JSON.stringify(v[0]))
    if (ve) console.log('ERROR:', ve.message)

    // Check existing materials count
    const { count } = await supabase.from('materials').select('*', { count: 'exact', head: true })
    console.log('\n=== TOTAL MATERIALS IN DB ===')
    console.log('Count:', count)

    // Check v_stock_actual count for MATERIAL
    const { count: vc } = await supabase.from('v_stock_actual').select('*', { count: 'exact', head: true }).eq('tipo_item', 'MATERIAL')
    console.log('v_stock MATERIAL count:', vc)

    // Check what tables exist that might be the kardex
    const tables = ['kardex', 'kardex_materiales', 'kardex_items', 'stock_movements', 'material_movements']
    for (const t of tables) {
        const { error } = await supabase.from(t).select('*').limit(1)
        if (!error) console.log(`TABLE EXISTS: ${t}`)
        else console.log(`NOT FOUND: ${t} - ${error.message}`)
    }
}

diagnose().catch(console.error)
