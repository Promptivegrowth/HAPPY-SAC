const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
    'https://mickytkrhfwjpqdoalyx.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pY2t5dGtyaGZ3anBxZG9hbHl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTUzMjU3MywiZXhwIjoyMDkxMTA4NTczfQ.X2nCjCsx-KPaQgPXrE9A9eO4mBDl_guKtrL4RRKypAI'
)

async function run() {
    console.log("--- INICIO DE REPARACIÓN MAESTRA ---")

    // 1. LIMPIEZA DE SPIDERMAN (Fuerza Bruta por Código)
    console.log("1. Corrigiendo Spiderman por código PROD-SPD-001...")
    const { data: spids } = await supabase.from('products').select('id, nombre').eq('codigo', 'PROD-SPD-001')

    if (spids && spids.length >= 1) {
        await supabase.from('products').update({ nombre: 'Disfraz Spiderman Clásico' }).eq('id', spids[0].id)
        console.log(`   ID ${spids[0].id} -> Clásico`)

        if (spids.length > 1) {
            await supabase.from('products').update({ nombre: 'Disfraz Spiderman Superior' }).eq('id', spids[1].id)
            console.log(`   ID ${spids[1].id} -> Superior (Duplicado resuelto)`)
        }
    }

    // 2. CREACIÓN DE PRODUCTOS SAN MARTIN (Insensible a espacios)
    console.log("2. Asegurando productos de San Martín en el catálogo...")
    const tallas = ['4', '6', '8', '10', '12', '14', '16', 'AD']
    const productMap = {}

    for (const t of tallas) {
        const cod = `PROD-SM-${t.padStart(2, '0')}`
        const nom = `Disfraz San Martín #${t}`

        // Upsert del producto
        const { data: p, error: pe } = await supabase.from('products').upsert([{
            codigo: cod,
            nombre: nom,
            categoria: 'FIESTAS PATRIAS',
            precio_base: 45,
            publicar_web: true,
            en_stock: true
        }], { onConflict: 'codigo' }).select().single()

        if (p) {
            productMap[t] = p.id
            console.log(`   Producto listo: ${nom}`)
            // Asegurar talla y stock
            await supabase.from('product_sizes').upsert([{
                product_id: p.id, size: t, stock: 50, precio: 45
            }], { onConflict: 'product_id,size' })
        }
    }

    // 3. MATERIALES E INGREDIENTES (Datos del Excel limpios)
    console.log("3. Cargando materiales reales de San Martín...")
    const ingredientesData = [
        { n: "GASA DE 3MM", q: 0.065, c: "MAT-GASA-3MM" },
        { n: "SERMAT BLANCO", q: 0.41, c: "MAT-SERMAT-BL" },
        { n: "SERMAT AZULINO", q: 0.532, c: "MAT-SERMAT-AZ" },
        { n: "SERMAT LAMINADO AZULINO", q: 0.11, c: "MAT-SERMAT-LAM-AZ" },
        { n: "GRECA TRINCHI DORADO", q: 2.88, c: "AVIO-GRECA-TRI" },
        { n: "FLECO BANDERIN DORADO", q: 0.51, c: "AVIO-FLECO-BAN" },
        { n: "BOTON ANCLA #28 DORADO", q: 6.0, c: "AVIO-BOTON-ANC" },
        { n: "LATEX LICRADO LAMINADO DORADO", q: 0.012, c: "MAT-LATEX-LAM-DOR" },
        { n: "GRECA 511 DORADO", q: 0.31, c: "AVIO-GRECA-511" }
    ]

    const materialIds = {}
    for (const ing of ingredientesData) {
        const { data: m } = await supabase.from('materials').upsert([{
            nombre: ing.n,
            codigo: ing.c,
            unidad_medida: ing.n.includes('BOTON') ? 'UNIDADES' : 'METROS',
            stock_actual: 200
        }], { onConflict: 'nombre' }).select().single()

        if (m) {
            materialIds[ing.n] = m.id
            console.log(`   Material listo: ${ing.n}`)
        }
    }

    // 4. VINCULAR RECETA A LA TALLA 4
    console.log("4. Vinculando materiales a la Ficha Técnica...")
    const sm4Id = productMap['4']
    if (sm4Id) {
        const { data: rec } = await supabase.from('recipes').upsert([{
            product_id: sm4Id,
            descripcion: "Ficha Técnica Real (Excel 30-03)",
            estado: 'ACTIVO',
            created_by: '8de6c8a2-26f5-4f36-963d-4c3d317079b7'
        }], { onConflict: 'product_id' }).select().single()

        if (rec) {
            // Limpiar items antiguos
            await supabase.from('recipe_items').delete().eq('recipe_id', rec.id)
            // Insertar nuevos
            const finalItems = ingredientesData.map(i => ({
                recipe_id: rec.id,
                material_id: materialIds[i.n],
                cantidad: i.q,
                merma_porcentaje: 5
            }))
            await supabase.from('recipe_items').insert(finalItems)
            console.log("   ÉXITO: Receta de San Martín vinculada con 9 ingredientes reales.")
        }
    }

    console.log("--- PROCESO FINALIZADO CON ÉXITO ---")
}

run().catch(err => console.error("!!! ERROR CRITICO:", err))
