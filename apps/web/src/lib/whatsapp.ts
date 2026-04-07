import type { CartItem } from './cart-store'

interface DatosCliente {
    nombre: string
    telefono: string
    email?: string
    tipoEntrega: 'DELIVERY' | 'RECOJO'
    direccion?: string
    distrito?: string
    referencia?: string
    notas?: string
    tipoPago: 'YAPE' | 'TRANSFERENCIA' | 'EFECTIVO_ENTREGA' | 'TARJETA'
}

interface PedidoWhatsApp {
    numeroPedido: string
    items: CartItem[]
    datosCliente: DatosCliente
    subtotal: number
    total: number
}

export function generarMensajeWhatsApp(pedido: PedidoWhatsApp): string {
    const { numeroPedido, items, datosCliente, subtotal, total } = pedido

    const listaProductos = items.map(item =>
        `  • ${item.nombre} Talla ${item.talla} × ${item.cantidad} = S/ ${(item.precio * item.cantidad).toFixed(2)}`
    ).join('\n')

    const entregaInfo = datosCliente.tipoEntrega === 'DELIVERY'
        ? `📍 *Dirección:* ${datosCliente.direccion}, ${datosCliente.distrito}
${datosCliente.referencia ? `📌 *Referencia:* ${datosCliente.referencia}` : ''}`
        : `🏪 *Retiro en tienda:* Av. José Leal 1234, Lince`

    const pagoInfo = {
        YAPE: '📱 Pago por Yape',
        TRANSFERENCIA: '🏦 Transferencia bancaria',
        EFECTIVO_ENTREGA: '💵 Efectivo contra entrega',
        TARJETA: '💳 Tarjeta de crédito/débito'
    }[datosCliente.tipoPago]

    const mensaje = `🎭 *NUEVO PEDIDO - HAPPY S.A.C.*
━━━━━━━━━━━━━━━━━━━━
📋 *N° Pedido:* ${numeroPedido}

👤 *DATOS DEL CLIENTE*
Nombre: ${datosCliente.nombre}
Teléfono: ${datosCliente.telefono}
${datosCliente.email ? `Email: ${datosCliente.email}` : ''}

🛍️ *PRODUCTOS SOLICITADOS*
${listaProductos}

━━━━━━━━━━━━━━━━━━━━
💰 *Subtotal:* S/ ${subtotal.toFixed(2)}
💰 *TOTAL:* S/ ${total.toFixed(2)}
━━━━━━━━━━━━━━━━━━━━

🚚 *TIPO DE ENTREGA*
${entregaInfo}

💳 *MÉTODO DE PAGO*
${pagoInfo}

${datosCliente.notas ? `📝 *Notas:* ${datosCliente.notas}` : ''}

_Pedido generado desde www.happysac.com.pe_`

    return encodeURIComponent(mensaje.trim())
}

export function abrirWhatsApp(
    mensaje: string,
    numero: string = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '51916854842'
): void {
    const url = `https://wa.me/${numero}?text=${mensaje}`
    window.open(url, '_blank')
}

export function generarUrlWhatsApp(pedido: PedidoWhatsApp): string {
    const mensaje = generarMensajeWhatsApp(pedido)
    const numero = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '51916854842'
    return `https://wa.me/${numero}?text=${mensaje}`
}
