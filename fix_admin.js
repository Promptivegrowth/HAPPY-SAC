const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://mickytkrhfwjpqdoalyx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pY2t5dGtyaGZ3anBxZG9hbHl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTUzMjU3MywiZXhwIjoyMDkxMTA4NTczfQ.X2nCjCsx-KPaQgPXrE9A9eO4mBDl_guKtrL4RRKypAI'
)

async function fix() {
  const email = 'admin@happysac.com.pe'
  console.log('--- Iniciando Reparación Profunda ---')

  // 1. Buscar el usuario actual
  const { data: users, error: listError } = await supabase.auth.admin.listUsers()
  if (listError) throw listError
  
  const target = users.users.find(u => u.email === email)
  
  if (target) {
    console.log('Usuario encontrado (ID: ' + target.id + '). Eliminando para limpiar rastro corrupto...')
    const { error: delError } = await supabase.auth.admin.deleteUser(target.id)
    if (delError) console.error('Error al borrar:', delError.message)
  }

  // 2. Crear el usuario DE CERO (esto crea automáticamente las identidades)
  console.log('Creando usuario admin de forma limpia...')
  const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
    email: email,
    password: 'admin123',
    email_confirm: true,
    user_metadata: { full_name: 'Admin HAPPY SAC', role: 'admin' }
  })

  if (createError) {
    console.error('CRÍTICO: Error al crear:', createError.message)
  } else {
    console.log('ÉXITO! Usuario creado correctamente (ID: ' + newUser.user.id + ')')
    console.log('El sistema de identidades de Supabase ha sido sincronizado automáticamente.')
  }
}

fix().catch(err => console.error('FALLO EN LA MICROPERACIÓN:', err))
