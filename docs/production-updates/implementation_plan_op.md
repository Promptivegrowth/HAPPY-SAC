# Plan de Pulido: Flujo de Órdenes de Producción (OP)

Este plan aborda los problemas de duplicados en el selector de productos, la falta de campos de tiempo y la visibilidad de la explosión de materiales en el monitor de producción.

## Cambios Propuestos

### Base de Datos
- **[MODIFY] production_orders**: Añadir columna `hora_inicio` (TIPO: TIME) para registrar el inicio de la corrida.

### Backend (Server Component)
- **[MODIFY] [page.tsx](file:///c:/Users/LUIGI/Desktop/demo%20HAPPY%20SAC/happy-sac/apps/erp/src/app/(dashboard)/production/new/page.tsx)**:
  - Filtrar la consulta de productos por `tipo_item = 'PRODUCTO'`.

### Frontend (Formulario de Creación)
- **[MODIFY] [op-form.tsx]**:
  - Añadir estados para `horaInicio` y `fechaTermino`.
  - Implementar inputs en la interfaz para editar estos campos.
  - **Crítico**: Modificar `handleSubmit` para insertar los materiales de la explosión en la tabla `production_order_materials`.

### Frontend (Monitor)
- **[MODIFY] [ProductionClient.tsx]**:
  - Mostrar la hora de inicio en las tarjetas o tabla de OP.
  - Implementar un modal de detalle para visualizar los materiales de la explosión de cada orden.
