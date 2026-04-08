const { createClient } = require('@supabase/supabase-js')
const supabase = createClient(
    'https://mickytkrhfwjpqdoalyx.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pY2t5dGtyaGZ3anBxZG9hbHl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTUzMjU3MywiZXhwIjoyMDkxMTA4NTczfQ.X2nCjCsx-KPaQgPXrE9A9eO4mBDl_guKtrL4RRKypAI'
)

const materialesReal = [
    { nombre: "GASA DE 3MM", codigo: "MAT-GASA-3MM", cant: 0.065 },
    { nombre: "SERMAT BLANCO", codigo: "MAT-SERMAT-BL", cant: 0.41 },
    { nombre: "SERMAT AZULINO", codigo: "MAT-SERMAT-AZ", cant: 0.532 },
    { nombre: "SERMAT LAMINADO AZULINO", codigo: "MAT-SERMAT-LAM-AZ", cant: 0.11 },
    { nombre: "GRECA TRINCHI DORADO", codigo: "AVIO-GRECA-TRI", cant: 2.88 },
    { nombre: "FLECO BANDERIN DORADO", codigo: "AVIO-FLECO-BAN", cant: 0.51 },
    { nombre: "BOTON ANCLA #28 DORADO", codigo: "AVIO-BOTON-ANC", cant: 6.0 },
    { nombre: "LATEX LICRADO LAMINADO DORADO", codigo: "MAT-LATEX-LAM-DOR", cant: 0.012 },
    { nombre: "GRECA 511 DORADO", codigo: "AVIO-GRECA-511", cant: 0.31 }
]

async function run() {
    // === A. MATERIALES (solo nombre + codigo, es el esquema real) ===
    console.log("=== A. Insertando materiales ===")
    const materialIds = {}
    for (const m of materialesReal) {
        const { data, error } = await supabase
            .from('materials')
            .upsert([{ nombre: m.nombre, codigo: m.codigo }], { onConflict: 'nombre' })
            .select()
            .single()
        if (error) console.error('ERR', m.nombre, error.message)
        else { materialIds[m.nombre] = data.id; console.log('OK', m.nombre, data.id) }
    }

    // === B. BuscarTabla de Kardex real ===
    console.log("\n=== B. Buscando tabla Kardex ===")
    for (const t of ['kardex', 'kardex_entries', 'material_kardex', 'stock_entries', 'inventory_entries', 'wh_movements', 'warehouse_movements']) {
        const { error } = await supabase.from(t).select('*').limit(1)
        console.log(t, '->', error ? 'NO_EXISTE: ' + error.message.slice(0, 40) : 'EXISTE')
    }

    // === C. Revisar columnas reales de materials en DB ===
    console.log("\n=== C. Material row real ===")
    const { data: mr } = await supabase.from('materials').select('*').limit(1)
    if (mr && mr[0]) console.log(JSON.stringify(mr[0]))

    // === D. Ver muestra de v_stock_actual ===
    console.log("\n=== D. v_stock_actual sample ===")
    const { data: vs, error: ve } = await supabase.from('v_stock_actual').select('*').limit(3)
    if (vs) vs.forEach(r => console.log(JSON.stringify(r)))
    if (ve) console.log('ERR:', ve.message)
}

run().catch(console.error)
