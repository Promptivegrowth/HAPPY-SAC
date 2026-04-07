const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const dotenv = require('dotenv')

const envFile = fs.readFileSync('apps/erp/.env.local')
const envConfig = dotenv.parse(envFile)

const supabase = createClient(
    envConfig.NEXT_PUBLIC_SUPABASE_URL,
    envConfig.SUPABASE_SERVICE_ROLE_KEY
)

async function test() {
    const { data, error } = await supabase.from('categories').select('*')
    if (error) {
        console.error("Error:", error.message)
    } else {
        console.log("Categories found:", data.length)
        data.forEach(c => console.log(`- ${c.nombre} (${c.id})`))
    }
}

test()
