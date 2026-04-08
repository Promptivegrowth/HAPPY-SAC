# Plan de Implementación: Descuento Automático y Precisión Decimal

Este plan asegura que las Órdenes de Producción (OP) descuenten materiales del inventario automáticamente y habilita el uso de decimales en todos los registros de stock.

## Cambios Propuestos

### Base de Datos (Infraestructura)
- **[MODIFY] product_stock**: Migración de `INTEGER` a `NUMERIC`.
- **[MODIFY] update_stock_on_kardex (Función)**: Eliminación de cast a entero para preservar decimales.

### Automatización de OP
- **[NEW] fn_discount_stock_on_op_material**: Lógica de entrada a Kardex automatizada.
- **[NEW] tr_discount_stock_on_op_material**: Disparador reactivo en la tabla de materiales de OP.

## Plan de Verificación
- Prueba SQL: Consumo de 12.55 metros sobre stock de 275.00.
- Resultado: Stock real actualizado a 262.45.
