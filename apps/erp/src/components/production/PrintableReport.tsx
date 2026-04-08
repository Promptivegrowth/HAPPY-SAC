"use client"

import React from "react"
import { Printer, X, Download } from "lucide-react"

interface PrintableReportProps {
    plan: any
    consolidatedMaterials: any[]
    onClose: () => void
}

export default function PrintableReport({ plan, consolidatedMaterials, onClose }: PrintableReportProps) {
    const handlePrint = () => {
        window.print()
    }

    return (
        <div className="fixed inset-0 z-[200] bg-slate-900/90 backdrop-blur-md flex flex-col items-center overflow-y-auto pt-10 pb-20 print:p-0 print:bg-white print:static print:overflow-visible">
            {/* Toolbar - Oculto en impresión */}
            <div className="w-full max-w-[210mm] mb-6 flex items-center justify-between px-6 py-4 bg-white/10 rounded-3xl backdrop-blur-md border border-white/20 print:hidden">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-white/10 rounded-2xl transition-colors text-white"
                    >
                        <X size={24} />
                    </button>
                    <span className="text-white font-black uppercase tracking-tighter italic">Previsualización de Reporte</span>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-pink-900/20 uppercase text-xs tracking-widest"
                    >
                        <Printer size={18} />
                        Imprimir / Guardar PDF
                    </button>
                </div>
            </div>

            {/* A4 Sheet Container */}
            <div
                id="printable-area"
                className="w-[210mm] min-h-[297mm] bg-white shadow-2xl p-[20mm]  print:shadow-none print:w-full print:p-0"
            >
                {/* Branding & Header */}
                <div className="flex justify-between items-start border-b-4 border-slate-900 pb-8 mb-10">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
                            HAPPY <span className="text-pink-600">S.A.C.</span>
                        </h1>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">Industrial Textil & Confección Premium</p>
                        <div className="mt-6 space-y-1">
                            <p className="text-xs font-bold text-slate-600">RUC: 20600000000</p>
                            <p className="text-xs font-medium text-slate-500 italic">Jr. Las Fábricas 123, Lima - Perú</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="bg-slate-900 text-white px-6 py-3 rounded-xl inline-block mb-4">
                            <h2 className="text-lg font-black uppercase tracking-tighter">CONSOLIDADO DE PRODUCCIÓN</h2>
                        </div>
                        <p className="text-xs font-bold text-slate-700 uppercase">Emisión: {new Date().toLocaleDateString('es-PE')}</p>
                        <p className="text-xs font-bold text-slate-500 uppercase">Ref: {plan.nombre || 'PLAN-PLANIFICACION'}</p>
                    </div>
                </div>

                {/* Plan Info Summary */}
                <div className="grid grid-cols-2 gap-10 mb-12">
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-600 border-b border-pink-100 pb-2">Información del Periodo</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="block text-[9px] uppercase font-black text-slate-400">Fecha Inicio</span>
                                <span className="text-sm font-bold text-slate-800">{plan.fecha_inicio}</span>
                            </div>
                            <div>
                                <span className="block text-[9px] uppercase font-black text-slate-400">Fecha Fin (Estimada)</span>
                                <span className="text-sm font-bold text-slate-800">{plan.fecha_fin}</span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 pb-2">Resumen de Carga</h3>
                        <div className="flex items-center justify-between">
                            <div className="text-center px-4">
                                <span className="block text-[8px] uppercase font-black text-slate-400">Total OPs</span>
                                <span className="text-xl font-black text-slate-900">{plan.production_orders?.length || 0}</span>
                            </div>
                            <div className="w-[1px] h-8 bg-slate-100" />
                            <div className="text-center px-4">
                                <span className="block text-[8px] uppercase font-black text-slate-400">Prendas Proyectadas</span>
                                <span className="text-xl font-black text-slate-900">{plan.production_orders?.reduce((s: any, op: any) => s + op.total_prendas, 0)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Materials Consolidated Table */}
                <div className="mb-16">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-pink-600 rounded-full" />
                        Explosión Consolidada de Materiales
                    </h3>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-y border-slate-200">
                                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-500 w-24">Código</th>
                                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-500">Descripción del Material / Insumo</th>
                                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-500 text-right w-32">Cantidad Total</th>
                                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-500 text-center w-24">U.M.</th>
                            </tr>
                        </thead>
                        <tbody>
                            {consolidatedMaterials.map((mat, idx) => (
                                <tr key={idx} className="border-b border-slate-100 group">
                                    <td className="px-4 py-4 text-[10px] font-black text-slate-400 tracking-widest">{mat.codigo}</td>
                                    <td className="px-4 py-4 text-xs font-bold text-slate-800 uppercase">{mat.nombre}</td>
                                    <td className="px-4 py-4 text-sm font-black text-slate-900 text-right tracking-tight">{Number(mat.total).toFixed(4)}</td>
                                    <td className="px-4 py-4 text-[10px] font-black text-slate-400 text-center uppercase tracking-widest">Metros</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Orders List Footer */}
                <div className="mt-auto pt-10 border-t border-slate-100 page-break-inside-avoid">
                    <h4 className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">Órdenes de Producción Incluidas en este consolidado:</h4>
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                        {plan.production_orders?.map((op: any) => (
                            <div key={op.id} className="text-[10px] font-black text-slate-600 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                                OP-#{op.numero_doc}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Signatures Area */}
                <div className="grid grid-cols-2 gap-20 mt-20 pt-10 page-break-inside-avoid">
                    <div className="text-center space-y-2">
                        <div className="border-t border-slate-300 w-full pt-2" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Jefe de Producción</p>
                        <p className="text-[9px] font-medium text-slate-500 italic">Autorización de Requerimiento</p>
                    </div>
                    <div className="text-center space-y-2">
                        <div className="border-t border-slate-300 w-full pt-2" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Responsable de Almacén</p>
                        <p className="text-[9px] font-medium text-slate-500 italic">Validación de Stock / Entrega</p>
                    </div>
                </div>

                {/* Document Footer */}
                <div className="mt-20 pt-8 border-t border-slate-50 flex justify-between items-center opacity-50">
                    <span className="text-[8px] font-bold text-slate-400">HAPPY S.A.C. ERP - Módulo de Producción</span>
                    <span className="text-[8px] font-bold text-slate-400">Pág. 1 de 1</span>
                </div>
            </div>

            {/* Print Styles Injection */}
            <style jsx global>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                        background: white !important;
                    }
                    nav, sidebar, .print-hidden, [role="navigation"] {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    )
}
