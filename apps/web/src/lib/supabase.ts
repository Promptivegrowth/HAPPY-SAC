import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

export const supabase = createClient()

// Queries de catálogo
export async function getProductosPublicos() {
  return await supabase
    .from('products')
    .select(`
      id, 
      codigo, 
      nombre_web, 
      nombre, 
      slug, 
      imagenes_urls, 
      imagen_url,
      featured, 
      publicar_web,
      updated_at,
      categories(nombre, codigo),
      product_sizes(
        id, 
        talla, 
        precio_web, 
        activo, 
        publicar_web,
        en_oferta,
        precio_oferta,
        stock
      )
    `)
    .eq('publicar_web', true)
    .eq('activo', true)
}

export async function getProductoPorSlug(slug: string) {
  return await supabase
    .from('products')
    .select(`
      id, 
      codigo, 
      nombre_web, 
      nombre, 
      slug, 
      imagenes_urls, 
      imagen_url,
      descripcion_web,
      featured, 
      publicar_web,
      updated_at,
      categories(nombre, codigo),
      product_sizes(
        id, 
        talla, 
        precio_web, 
        activo, 
        publicar_web,
        en_oferta,
        precio_oferta,
        stock
      )
    `)
    .eq('slug', slug)
    .eq('publicar_web', true)
    .eq('activo', true)
    .single()
}
