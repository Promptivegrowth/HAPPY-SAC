const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
    'https://mickytkrhfwjpqdoalyx.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pY2t5dGtyaGZ3anBxZG9hbHl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTUzMjU3MywiZXhwIjoyMDkxMTA4NTczfQ.X2nCjCsx-KPaQgPXrE9A9eO4mBDl_guKtrL4RRKypAI'
)

async function run() {
    console.log("--- CREANDO PRODUCTOS SAN MARTIN ---")
    const tallas = ['4', '6', '8', '10', '12', '14', '16', 'AD']
    const productIds = {}

    for (const t of tallas) {
        const nombre = `Disfraz San Martín #${t}`
        const cod = `PROD-SM-${t.padStart(2, '0')}`

        try {
            const { data: ex } = await supabase.from('products').select('id').eq('codigo', cod).limit(1)

            let pId;
            if (!ex || ex.length === 0) {
                const { data: n, error: ne } = await supabase.from('products').insert([{
                    nombre, codigo: cod, categoria: 'FIESTAS PATRIAS', precio_base: 45, publicar_web: true, en_stock: true
                }]).select().single()

                if (ne) {
                    console.error(`Error creando ${nombre}:`, ne.message)
                    continue
                }
                pId = n.id
                console.log(`Creado ${nombre} (ID: ${pId})`)
            } else {
                pId = ex[0].id
                console.log(`Ya existe ${nombre} (ID: ${pId})`)
            }

            productIds[t] = pId
            // Asegurar talla
            await supabase.from('product_sizes').upsert([{ product_id: pId, size: t, stock: 50, precio: 45 }], { onConflict: 'product_id,size' })
        } catch (err) {
            console.error(`Fallo en talla ${t}:`, err.message)
        }
    }

    console.log("--- MATERIALES ---")
    const materials = [
        ["GASA DE 3MM", "MAT-GASA-3MM"], ["SERMAT BLANCO", "MAT-SERMAT-BL"], ["SERMAT AZULINO", "MAT-SERMAT-AZ"],
        ["SERMAT LAMINADO AZULINO", "MAT-SERMAT-LAM-AZ"], ["GRECA TRINCHI DORADO", "AVIO-GRECA-TRI"],
        ["FLECO BANDERIN DORADO", "AVIO-FLECO-BAN"], ["BOTON ANCLA #28 DORADO", "AVIO-BOTON-ANC"],
        ["LATEX LICRADO LAMINADO DORADO", "MAT-LATEX-LAM-DOR"], ["GRECA 511 DORADO", "AVIO-GRECA-511"]
    ]
    const matIds = {}
    for (const [n, c] of materials) {
        const { data: m } = await supabase.from('materials').select('id').eq('nombre', n).limit(1)
        if (!m || m.length === 0) {
            const { data: nm, error: nme } = await supabase.from('materials').insert([{ nombre: n, codigo: c, stock_actual: 100, unidad_medida: 'METROS' }]).select().single()
            if (nme) { console.error(`Error material ${n}:`, nme.message); continue; }
            matIds[n] = nm.id
            console.log(`Creado Material: ${n}`)
        } else {
            matIds[n] = m[0].id
            console.log(`Material existe: ${n}`)
        }
    }

    console.log("--- RECETAS ---")
    // Vincular receta a SAN MARTIN #4
    const p4Id = productIds['4']
    if (p4Id) {
        const { data: r, error: re } = await supabase.from('recipes').upsert([{ product_id: p4Id, descripcion: "Receta Real San Martin", estado: 'ACTIVO', created_by: '8de6c8a2-26f5-4f36-963d-4c3d317079b7' }]).select().single()
        if (re) { console.error("Error receta:", re.message); return; }

        await supabase.from('recipe_items').delete().eq('recipe_id', r.id)
        const ings = [
            ["GASA DE 3MM", 0.065], ["SERMAT BLANCO", 0.41], ["SERMAT AZULINO", 0.532],
            ["SERMAT LAMINADO AZULINO", 0.11], ["GRECA TRINCHI DORADO", 2.88], ["FLECO BANDERIN DORADO", 0.51],
            ["BOTON ANCLA #28 DORADO", 6], ["LATEX LICRADO LAMINADO DORADO", 0.012], ["GRECA 511 DORADO", 0.31]
        ]

        const items = ings.map(([n, q]) => ({ recipe_id: r.id, material_id: matIds[n], cantidad: q })).filter(x => x.material_id)
        if (items.length > 0) {
            const { error: ie } = await supabase.from('recipe_items').insert(items)
            if (ie) console.error("Error items receta:", ie.message)
            else console.log(`ÉXITO: Vinculados ${items.length} materiales a San Martin.`)
        }
    }
}
run().catch(console.error)
