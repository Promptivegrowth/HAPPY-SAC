const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const dotenv = require('dotenv')

const envFile = fs.readFileSync('apps/erp/.env.local')
const envConfig = dotenv.parse(envFile)

const supabase = createClient(
    envConfig.NEXT_PUBLIC_SUPABASE_URL,
    envConfig.SUPABASE_SERVICE_ROLE_KEY
)

const categories = [
    { nombre: 'DISFRACES ADULTOS', codigo: 'ADU', activo: true },
    { nombre: 'ACCESORIOS', codigo: 'ACC', activo: true },
    { nombre: 'MATERIALES: TELAS', codigo: 'MAT-TEL', activo: true },
    { nombre: 'MATERIALES: HILOS Y CIERRES', codigo: 'MAT-HIL', activo: true },
    { nombre: 'MATERIALES: GOMA EVA / ESPUMAS', codigo: 'MAT-GOM', activo: true },
    { nombre: 'MATERIALES: OTROS', codigo: 'MAT-OTH', activo: true }
]

async function run() {
    console.log("Integrando nuevas categorías...")
    for (const cat of categories) {
        // Verificar si ya existe
        const { data: existing } = await supabase
            .from('categories')
            .select('id')
            .eq('nombre', cat.nombre)
            .maybeSingle()

        if (existing) {
            console.log(`⏩ Categoría ya existe: ${cat.nombre}`)
            continue
        }

        const { error } = await supabase
            .from('categories')
            .insert([cat])

        if (error) {
            console.error(`❌ Error insertando ${cat.nombre}:`, error.message)
        } else {
            console.log(`✅ Categoría creada: ${cat.nombre}`)
        }
    }
}

run()
