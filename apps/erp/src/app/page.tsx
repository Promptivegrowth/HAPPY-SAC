import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Si está logueado, redirige al dashboard (layout de grupo)
  // Como el dashboard está en (dashboard), simplemente renderizamos su contenido si estuviéramos en la raíz
  // pero para mayor orden, redirigimos explícitamente si es necesario o dejamos que el router maneje
  // En Next.js App Router, / mapea a (dashboard)/page.tsx si no hay otro page.tsx en la raíz.
}
