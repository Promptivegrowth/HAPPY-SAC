const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
    'https://mickytkrhfwjpqdoalyx.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pY2t5dGtyaGZ3anBxZG9hbHl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTUzMjU3MywiZXhwIjoyMDkxMTA4NTczfQ.X2nCjCsx-KPaQgPXrE9A9eO4mBDl_guKtrL4RRKypAI'
)

async function run() {
    console.log("--- PASO 1: ARREGLAR SPIDERMAN ---")
    const { data: sp, error: spErr } = await supabase.from('products').select('id, nombre').eq('codigo', 'PROD-SPD-001')
    if (spErr) console.error("Error buscando spiderman:", spErr.message)
    console.log(`Encontrados ${sp ? sp.length : 0} productos spiderman con codigo PROD-SPD-001`)

    if (sp && sp.length > 0) {
        // El primero lo ponemos correctamente como CLASICO
        await supabase.from('products').update({ nombre: 'Disfraz Spiderman Clásico' }).eq('id', sp[0].id)
        console.log(`ID ${sp[0].id} -> Clásico`)

        if (sp.length > 1) {
            // El segundo como SUPERIOR
            await supabase.from('products').update({ nombre: 'Disfraz Spiderman Superior' }).eq('id', sp[1].id)
            console.log(`ID ${sp[1].id} -> Superior`)
        }
    }

    console.log("--- PASO 2: CREAR PRODUCTOS SAN MARTIN ---")
    const tallas = ['4', '6', '8', '10', '12', '14', '16', 'AD']
    for (const t of tallas) {
        const nombre = `Disfraz San Martín #${t}`
        const cod = `PROD-SM-${t.padStart(2, '0')}`
        const { data: ex } = await supabase.from('products').select('id').eq('codigo', cod).single()

        let pId;
        if (!ex) {
            const { data: n, error: ne } = await supabase.from('products').insert([{
                nombre, codigo: cod, categoria: 'FIESTAS PATRIAS', precio_base: 45, publicar_web: true
            }]).select().single()
            if (ne) console.error(`Error creando ${nombre}:`, ne.message)
            else { pId = n.id; console.log(`Creado ${nombre}`) }
        } else {
            pId = ex.id
            console.log(`Ya existe ${nombre}`)
        }

        if (pId) {
            await supabase.from('product_sizes').upsert([{ product_id: pId, size: t, stock: 50, precio: 45 }], { onConflict: 'product_id,size' })
        }
    }

    console.log("--- PASO 3: MATERIALES Y RECETA ---")
    const mats = [
        ["GASA DE 3MM", "MAT-GASA-3MM"], ["SERMAT BLANCO", "MAT-SERMAT-BL"], ["SERMAT AZULINO", "MAT-SERMAT-AZ"],
        ["SERMAT LAMINADO AZULINO", "MAT-SERMAT-LAM-AZ"], ["GRECA TRINCHI DORADO", "AVIO-GRECA-TRI"],
        ["FLECO BANDERIN DORADO", "AVIO-FLECO-BAN"], ["BOTON ANCLA #28 DORADO", "AVIO-BOTON-ANC"],
        ["LATEX LICRADO LAMINADO DORADO", "MAT-LATEX-LAM-DOR"], ["GRECA 511 DORADO", "AVIO-GRECA-511"]
    ]
    const matIds = {}
    for (const [n, c] of mats) {
        const { data: m } = await supabase.from('materials').select('id').eq('nombre', n).single()
        if (!m) {
            const { data: nm } = await supabase.from('materials').insert([{ nombre: n, codigo: c, stock_actual: 100 }]).select().single()
            matIds[n] = nm.id
            console.log(`Creado Material: ${n}`)
        } else { matIds[n] = m.id; console.log(`Material existe: ${n}`) }
    }

    const { data: p4 } = await supabase.from('products').select('id').eq('codigo', 'PROD-SM-04').single()
    if (p4) {
        const { data: r } = await supabase.from('recipes').upsert([{ product_id: p4.id, descripcion: "Receta Real San Martin", estado: 'ACTIVO', created_by: '8de6c8a2-26f5-4f36-963d-4c3d317079b7' }]).select().single()
        if (r) {
            await supabase.from('recipe_items').delete().eq('recipe_id', r.id)
            const ings = [
                ["GASA DE 3MM", 0.065], ["SERMAT BLANCO", 0.41], ["SERMAT AZULINO", 0.532],
                ["SERMAT LAMINADO AZULINO", 0.11], ["GRECA TRINCHI DORADO", 2.88], ["FLECO BANDERIN DORADO", 0.51],
                ["BOTON ANCLA #28 DORADO", 6], ["LATEX LICRADO LAMINADO DORADO", 0.012], ["GRECA 511 DORADO", 0.31]
            ]
            await supabase.from('recipe_items').insert(ings.map(([n, q]) => ({ recipe_id: r.id, material_id: matIds[n], cantidad: q })))
            console.log("ÉXITO: Receta vinculada.")
        }
    }
}
run().catch(e => console.error("ERROR CRITICO:", e))
