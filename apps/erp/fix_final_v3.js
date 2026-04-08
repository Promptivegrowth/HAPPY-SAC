const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
    'https://mickytkrhfwjpqdoalyx.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pY2t5dGtyaGZ3anBxZG9hbHl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTUzMjU3MywiZXhwIjoyMDkxMTA4NTczfQ.X2nCjCsx-KPaQgPXrE9A9eO4mBDl_guKtrL4RRKypAI'
)

async function run() {
    console.log("--- Iniciando Corrección Maestro-Detalle ---")

    // 1. ARREGLAR SPIDERMAN POR ID (Evitando problemas de texto)
    const spidermanIDs = [
        { id: 'dba09ddd-8a37-4395-943a-23da6e4715a4', newName: 'Disfraz Spiderman Clásico' },
        { id: '73bbf29f-62c1-4395-943a-23da6e4715a4', newName: 'Disfraz Spiderman Superior' }
    ]

    console.log("1. Corrigiendo nombres de Spiderman...")
    for (const item of spidermanIDs) {
        const { error } = await supabase.from('products').update({ nombre: item.newName }).eq('id', item.id)
        if (error) console.error(`   Error actualizando ${item.id}:`, error.message)
        else console.log(`   Actualizado ID ${item.id} -> ${item.newName}`)
    }

    // 2. CREAR PRODUCTOS DE SAN MARTIN (Si no existen)
    const tallas = ['4', '6', '8', '10', '12', '14', '16', 'AD']
    console.log("2. Creando productos de San Martín en catálogo...")

    for (const talla of tallas) {
        const nombreBase = `Disfraz San Martín #${talla}`
        const codigoBase = `PROD-SM-${talla.padStart(2, '0')}`

        // Verificar si ya existe
        const { data: existing } = await supabase.from('products').select('id').eq('codigo', codigoBase).single()

        let productID;
        if (!existing) {
            const { data: newP, error: pErr } = await supabase.from('products').insert([{
                nombre: nombreBase,
                codigo: codigoBase,
                descripcion: `Disfraz patrio de San Martín talla ${talla}`,
                precio_base: 45.00,
                categoria: 'FIESTAS PATRIAS',
                publicar_web: true,
                en_stock: true
            }]).select().single()

            if (pErr) {
                console.error(`   Error creando ${nombreBase}:`, pErr.message)
                continue
            }
            productID = newP.id
            console.log(`   Creado producto: ${nombreBase}`)
        } else {
            productID = existing.id
            console.log(`   Ya existe producto: ${nombreBase}`)
        }

        // Crear la talla en product_sizes
        await supabase.from('product_sizes').upsert([{
            product_id: productID,
            size: talla,
            stock: 50,
            precio: 45.00
        }], { onConflict: 'product_id,size' })
    }

    // 3. POBLAR MATERIALES Y RECETA
    console.log("3. Configurando Receta San Martín (9 ingredientes)...")
    const materialesArr = [
        { nombre: "GASA DE 3MM", codigo: "MAT-GASA-3MM", tipo: "TELA" },
        { nombre: "SERMAT BLANCO", codigo: "MAT-SERMAT-BL", tipo: "TELA" },
        { nombre: "SERMAT AZULINO", codigo: "MAT-SERMAT-AZ", tipo: "TELA" },
        { nombre: "SERMAT LAMINADO AZULINO", codigo: "MAT-SERMAT-LAM-AZ", tipo: "TELA" },
        { nombre: "GRECA TRINCHI DORADO", codigo: "AVIO-GRECA-TRI", tipo: "AVIO" },
        { nombre: "FLECO BANDERIN DORADO", codigo: "AVIO-FLECO-BAN", tipo: "AVIO" },
        { nombre: "BOTON ANCLA #28 DORADO", codigo: "AVIO-BOTON-ANC", tipo: "AVIO" },
        { nombre: "LATEX LICRADO LAMINADO DORADO", codigo: "MAT-LATEX-LAM-DOR", tipo: "TELA" },
        { nombre: "GRECA 511 DORADO", codigo: "AVIO-GRECA-511", tipo: "AVIO" }
    ]

    const materialIDs = {}
    for (const m of materialesArr) {
        const { data: existingMat } = await supabase.from('materials').select('id').eq('nombre', m.nombre).single()
        if (!existingMat) {
            const { data: newMat } = await supabase.from('materials').insert([{
                nombre: m.nombre,
                codigo: m.codigo,
                categoria: m.tipo === 'TELA' ? 'TELAS' : 'AVIOS',
                unidad_medida: m.tipo === 'TELA' ? 'METROS' : 'UNIDADES',
                stock_actual: 500
            }]).select().single()
            materialIDs[m.nombre] = newMat.id
        } else {
            materialIDs[m.nombre] = existingMat.id
        }
    }

    // Vincular receta a SAN MARTIN #4 como base real
    const { data: sm4 } = await supabase.from('products').select('id').eq('codigo', 'PROD-SM-04').single()
    if (sm4) {
        const { data: rec } = await supabase.from('recipes').upsert([{
            product_id: sm4.id,
            descripcion: "Ficha Técnica Maestra - San Martín",
            estado: 'ACTIVO',
            created_by: '8de6c8a2-26f5-4f36-963d-4c3d317079b7'
        }]).select().single()

        if (rec) {
            await supabase.from('recipe_items').delete().eq('recipe_id', rec.id)
            const ingredientes = [
                { nombre: "GASA DE 3MM", cant: 0.065 },
                { nombre: "SERMAT BLANCO", cant: 0.41 },
                { nombre: "SERMAT AZULINO", cant: 0.532 },
                { nombre: "SERMAT LAMINADO AZULINO", cant: 0.11 },
                { nombre: "GRECA TRINCHI DORADO", cant: 2.88 },
                { nombre: "FLECO BANDERIN DORADO", cant: 0.51 },
                { nombre: "BOTON ANCLA #28 DORADO", cant: 6 },
                { nombre: "LATEX LICRADO LAMINADO DORADO", cant: 0.012 },
                { nombre: "GRECA 511 DORADO", cant: 0.31 }
            ]

            const entries = ingredientes.map(i => ({
                recipe_id: rec.id,
                material_id: materialIDs[i.nombre],
                cantidad: i.cant,
                merma_porcentaje: 5
            })).filter(x => x.material_id)

            await supabase.from('recipe_items').insert(entries)
            console.log("   ÉXITO TOTAL: San Martín vinculado con 9 ingredientes.")
        }
    }

    console.log("--- Proceso Completado ---")
}

run().catch(console.error)
