export const generateBoleta = (data: any) => {
    console.log('Simulando generación de Boleta:', data)
    return { success: true, message: 'Boleta generada (SIMULADO)', doc_number: 'B001-000001' }
}

export const generateFactura = (data: any) => {
    console.log('Simulando generación de Factura:', data)
    return { success: true, message: 'Factura generada (SIMULADO)', doc_number: 'F001-000001' }
}

export const generateXML = (invoice: any) => {
    return `<?xml version="1.0" encoding="UTF-8"?><Invoice>SIMULATED_UBL_2.1_XML</Invoice>`
}

export const validateRUC = (ruc: string) => {
    return ruc.length === 11 && (ruc.startsWith('10') || ruc.startsWith('20'))
}

export const validateDNI = (dni: string) => {
    return dni.length === 8
}
