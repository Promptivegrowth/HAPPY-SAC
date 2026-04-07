import numeral from 'numeral'

export function formatPrecio(precio: number): string {
    return `S/ ${numeral(precio).format('0,0.00')}`
}

export function formatTalla(talla: string): string {
    // "4" → "Talla 4" | "STD" → "Talla Única" | "M" → "Talla M"
    if (talla === 'STD') return 'Talla Única'
    if (/^\d+$/.test(talla)) return `Talla ${talla}`
    return `Talla ${talla}`
}

export function precioDesde(tallas: any[]): number {
    if (!tallas || tallas.length === 0) return 0
    return Math.min(...tallas.map(t => (t.en_oferta ? t.precio_oferta : t.precio_web) || 0))
}
