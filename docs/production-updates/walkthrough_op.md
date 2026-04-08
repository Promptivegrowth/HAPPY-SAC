# Walkthrough: Optimización de Órdenes de Producción (OP)

Se ha completado la estabilización y pulido del flujo de producción. El sistema ahora permite un control total sobre los tiempos y materiales de cada corrida.

## Cambios Implementados

### 1. Saneamiento de Datos (Selector)
Se ha filtrado el selector de productos en la ruta de creación de OP.
- **Antes**: Se mostraban materiales, servicios y productos duplicados.
- **Ahora**: Solo se visualizan ítems marcados como `PRODUCTO` en la base de datos.

### 2. Control de Tiempos
- **Hora de Inicio**: Registro de hora exacta de lanzamiento.
- **Fecha de Entrega**: Campo totalmente editable.

### 3. Persistencia de Explosión de Materiales
- **Nueva Tabla**: `production_order_materials` guarda la foto de insumos.
- **Auditoría**: Los materiales se guardan automáticamente al lanzar la orden.

### 4. Monitor de Producción Avanzado
- **Visualización de Tiempo**: Hora de inicio visible en la tabla.
- **Detalle Profundo**: Modal interactivo para ver materiales de cada orden.
