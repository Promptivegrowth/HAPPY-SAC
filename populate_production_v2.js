const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
    'https://mickytkrhfwjpqdoalyx.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pY2t5dGtyaGZ3anBxZG9hbHl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTUzMjU3MywiZXhwIjoyMDkxMTA4NTczfQ.X2nCjCsx-KPaQgPXrE9A9eO4mBDl_guKtrL4RRKypAI'
)

async function run() {
    console.log("--- Iniciando Enriquecimiento de Producción ---")

    // 1. CORREGIR SPIDERMAN (Encoding y Duplicados)
    console.log("1. Corrigiendo nombres de Spiderman...")
    const { data: spidermanProds } = await supabase.from('products').select('*').ilike('nombre', '%Spiderman%')

    for (const p of spidermanProds || []) {
        let newName = p.nombre.replace(/Cl\?sico/g, 'Clásico').replace(/Clsico/g, 'Clásico')

        // Si hay duplicados con el mismo nombre corregido, cambiamos uno a "Superior"
        if (newName === "Disfraz Spiderman Clásico" && spidermanProds.filter(x => x.nombre.includes("Cl")).length > 1) {
            // Buscamos si es el primero o el segundo
            const index = spidermanProds.indexOf(p)
            if (index > 0) newName = "Disfraz Spiderman Superior"
        }

        await supabase.from('products').update({ nombre: newName }).eq('id', p.id)
        console.log(`   Actualizado: ${p.nombre} -> ${newName}`)
    }

    // 2. CREAR MATERIALES DE SAN MARTIN
    console.log("2. Creando materiales de San Martín...")
    const materiales = [
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

    for (const mat of materiales) {
        const { data: existing } = await supabase.from('materials').select('id').eq('nombre', mat.nombre).single()
        if (!existing) {
            await supabase.from('materials').insert([{
                nombre: mat.nombre,
                codigo: mat.codigo,
                categoria: mat.tipo === 'TELA' ? 'TELAS' : 'AVIOS',
                unidad_medida: mat.tipo === 'TELA' ? 'METROS' : 'UNIDADES',
                stock_actual: 100 // Stock inicial para pruebas reales
            }])
            console.log(`   Creado material: ${mat.nombre}`)
        }
    }

    // 3. VINCULAR RECETA SAN MARTIN
    console.log("3. Configurando Receta San Martín...")
    // Buscamos el producto SAN MARTIN (asumimos que existe uno genérico o buscamos por nombre)
    const { data: smProd } = await supabase.from('products').select('*').ilike('nombre', '%SAN MARTIN%').limit(1).single()

    if (smProd) {
        // Crear la receta si no existe
        const { data: rec } = await supabase.from('recipes').upsert([{
            product_id: smProd.id,
            descripcion: "Ficha Técnica Real - San Martín",
            estado: 'ACTIVO',
            created_by: '8de6c8a2-26f5-4f36-963d-4c3d317079b7' // Admin
        }]).select().single()

        if (rec) {
            // Limpiar items anteriores para esta prueba
            await supabase.from('recipe_items').delete().eq('recipe_id', rec.id)

            // Insertar los ingredientes del Excel para la talla #4 (como ejemplo base)
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

            const itemsToInsert = []
            for (const ing of ingredientes) {
                const { data: m } = await supabase.from('materials').select('id').eq('nombre', ing.nombre).single()
                if (m) {
                    itemsToInsert.push({
                        recipe_id: rec.id,
                        material_id: m.id,
                        cantidad: ing.cant,
                        merma_porcentaje: 5
                    })
                }
            }
            await supabase.from('recipe_items').insert(itemsToInsert)
            console.log(`   Éxito: Receta de San Martín poblada con ${itemsToInsert.length} ingredientes reales.`)
        }
    } else {
        console.log("   AVISO: No se encontró el producto 'SAN MARTIN' para vincular la receta.")
    }

    console.log("--- Proceso Completado ---")
}

run().catch(console.error)
